const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

const { Models } = require('../config/DB');
const MediaMeta = require('./MediaMeta');
const MediaStream = require('./MediaStream');

/**
 * Normalise uploaded chat media so it plays on every client.
 *
 * THE PROBLEM THIS SOLVES. A voice note recorded in Chrome or on Android is
 * WebM/Opus. iOS plays neither the container nor the codec, in Safari or in
 * Flutter's player. So without this, a doctor recording a reply on a desktop
 * sends something roughly half the patients cannot hear - and it fails silently,
 * as an attachment that simply does nothing when tapped. Recording formats are
 * not negotiable per-client either: the sender cannot know what the receiver
 * runs.
 *
 * So every clip is rewritten once, server-side, to the pair that plays
 * everywhere: M4A/AAC for audio, MP4/H.264+AAC for video.
 *
 * IT RUNS AFTER DELIVERY, AND THAT IS DELIBERATE. CommitMessage has already
 * returned and the bubble is already on screen before this starts. The original
 * bytes are served meanwhile, so the only clip anyone waits on is one they
 * would otherwise not have at all. A transcode failure - including ffmpeg not
 * being installed - leaves the original in place and the message intact. A
 * message must never fail to send because a conversion failed.
 *
 * CONCURRENCY IS ONE, BY DESIGN. ecosystem.config.js runs the API as a single
 * fork (exec_mode 'fork', instances 1), so an in-process serial queue is the
 * whole story and there is no second worker to coordinate with. If the app is
 * ever moved to cluster mode this needs to become a real queue - the same note
 * WebSockets/ChatSocket.js carries about its rooms.
 */

const FFMPEG = process.env.FFMPEG_PATH || 'ffmpeg';
const FFPROBE = process.env.FFPROBE_PATH || 'ffprobe';

// A 3-minute 720p clip is seconds of work; a pathological file is not allowed
// to occupy the single worker indefinitely.
const TIMEOUT_MS = 10 * 60 * 1000;
const MAX_OUTPUT_BUFFER = 4 * 1024 * 1024;

let ToolsAvailable = null; // null = not yet checked

function Run(Bin, Args, TimeoutMs) {
  return new Promise((resolve) => {
    execFile(
      Bin,
      Args,
      { timeout: TimeoutMs || TIMEOUT_MS, maxBuffer: MAX_OUTPUT_BUFFER, windowsHide: true },
      (err, stdout, stderr) => {
        resolve({
          Ok: !err,
          Stdout: String(stdout || ''),
          Stderr: String(stderr || ''),
          Error: err,
        });
      }
    );
  });
}

/**
 * Is ffmpeg installed? Checked once per process.
 *
 * Absence is a normal, supported state - the Ubuntu box may not have it yet
 * (`apt install ffmpeg`), and the feature is built to degrade rather than break.
 */
async function Available() {
  if (ToolsAvailable !== null) return ToolsAvailable;

  const A = await Run(FFMPEG, ['-version'], 15000);
  const B = await Run(FFPROBE, ['-version'], 15000);
  ToolsAvailable = A.Ok && B.Ok;

  if (!ToolsAvailable) {
    console.error(
      '[MediaTranscode] ffmpeg/ffprobe not found. Chat media will be stored and served as ' +
        'uploaded, which means a WebM voice note will not play on iOS. Install ffmpeg, or set ' +
        'FFMPEG_PATH / FFPROBE_PATH.'
    );
  }
  return ToolsAvailable;
}

/** Duration and stream layout, or null. */
async function Probe(FilePath) {
  const R = await Run(FFPROBE, [
    '-v',
    'error',
    '-show_entries',
    'format=duration,format_name',
    '-show_entries',
    'stream=codec_type,codec_name',
    '-of',
    'json',
    FilePath,
  ]);
  if (!R.Ok) return null;

  try {
    const J = JSON.parse(R.Stdout);
    const Streams = J.streams || [];
    const Video = Streams.filter((s) => s.codec_type === 'video');
    const Audio = Streams.filter((s) => s.codec_type === 'audio');
    const Seconds = parseFloat((J.format || {}).duration);

    return {
      DurationMs: !Seconds || Number.isNaN(Seconds) ? null : Math.round(Seconds * 1000),
      FormatName: String((J.format || {}).format_name || ''),
      // An album-art JPEG inside an mp3 arrives as a video stream. Treating that
      // as "this is a video" would send a voice note through the H.264 encoder
      // and render it in a <video> element, so cover art is filtered out.
      HasVideo: Video.some((v) => ['mjpeg', 'png', 'bmp', 'gif'].indexOf(v.codec_name) === -1),
      VideoCodec: Video.length ? Video[0].codec_name : null,
      AudioCodec: Audio.length ? Audio[0].codec_name : null,
    };
  } catch (ex) {
    return null;
  }
}

/**
 * What this file should become.
 *
 * 'copy' means the streams are already right and only the container needs
 * rewriting - which is still worth doing, because it is what puts the moov
 * atom at the front (-movflags +faststart). Without that a player has to fetch
 * the end of the file before it can start, and progressive playback over a
 * mobile connection does not work.
 */
function Plan(Info, CurrentExt) {
  if (!Info) return null;

  if (Info.HasVideo) {
    const StreamsOk = Info.VideoCodec === 'h264' && Info.AudioCodec === 'aac';
    return {
      Kind: 'video',
      Ext: 'mp4',
      Mode: StreamsOk ? 'remux' : 'encode',
    };
  }

  const StreamsOk = Info.AudioCodec === 'aac';
  const ContainerOk = ['m4a', 'mp4', 'aac'].indexOf(String(CurrentExt).toLowerCase()) !== -1;
  return {
    Kind: 'audio',
    Ext: 'm4a',
    Mode: StreamsOk && ContainerOk ? 'remux' : 'encode',
  };
}

function ArgsFor(Plan_, InPath, OutPath) {
  const Base = ['-y', '-hide_banner', '-loglevel', 'error', '-i', InPath];

  if (Plan_.Mode === 'remux') {
    return Base.concat(['-c', 'copy', '-movflags', '+faststart', OutPath]);
  }

  if (Plan_.Kind === 'audio') {
    return Base.concat([
      '-vn',
      '-c:a',
      'aac',
      '-b:a',
      '64k',
      '-ac',
      '1',
      '-movflags',
      '+faststart',
      OutPath,
    ]);
  }

  return Base.concat([
    '-c:v',
    'libx264',
    '-preset',
    'veryfast',
    '-crf',
    '26',
    // Cap the long edge at 720p without upscaling a smaller clip, and keep both
    // dimensions even - H.264 requires it and an odd height is a hard failure.
    '-vf',
    "scale='min(1280,iw)':'min(720,ih)':force_original_aspect_ratio=decrease,scale=trunc(iw/2)*2:trunc(ih/2)*2",
    '-c:a',
    'aac',
    '-b:a',
    '96k',
    '-movflags',
    '+faststart',
    OutPath,
  ]);
}

/**
 * Normalise one File row in place.
 *
 * The generated_name does NOT change - names on disk carry no extension, so a
 * container swap is invisible to every link and ticket already issued. Only
 * File.ext, File.size and the media columns move.
 */
async function NormalizeFile(FileId) {
  const Id = parseInt(FileId, 10);
  if (!Id || Number.isNaN(Id)) return;

  let Row;
  try {
    Row = await Models.File.findByPk(Id, { raw: true });
  } catch (ex) {
    console.error('[MediaTranscode] cannot read file row ' + Id + ': ' + ex.message);
    return;
  }
  if (!Row || !Row.generated_name) return;
  if (String(Row.rec_status) === '2') return;

  const Kind = MediaStream.Kind(Row.ext);
  if (Kind !== 'audio' && Kind !== 'video') return;

  if (!(await Available())) {
    await MediaMeta.Write(Id, { MediaState: 'failed' });
    return;
  }

  const Dir = process.env.ALLFILE_DIR;
  const InPath = path.join(Dir, Row.generated_name);
  if (!fs.existsSync(InPath) || fs.statSync(InPath).isDirectory()) {
    // Legacy directory-style storage, or bytes that never arrived. Neither is
    // this function's problem to solve.
    await MediaMeta.Write(Id, { MediaState: 'failed' });
    return;
  }

  const Info = await Probe(InPath);
  if (!Info) {
    await MediaMeta.Write(Id, { MediaState: 'failed' });
    return;
  }

  const P = Plan(Info, Row.ext);
  const TmpPath = InPath + '_tmp.' + P.Ext;
  const BackupPath = InPath + '_orig';

  const R = await Run(FFMPEG, ArgsFor(P, InPath, TmpPath));

  if (!R.Ok || !fs.existsSync(TmpPath) || fs.statSync(TmpPath).size === 0) {
    console.error(
      '[MediaTranscode] file ' +
        Id +
        ' (' +
        P.Mode +
        ' -> ' +
        P.Ext +
        ') failed: ' +
        (R.Stderr || (R.Error && R.Error.message) || 'no output')
    );
    try {
      if (fs.existsSync(TmpPath)) fs.unlinkSync(TmpPath);
    } catch (ex) {
      /* nothing to clean */
    }
    // Duration is still worth keeping even when the conversion failed - the
    // original plays for most clients and the player can size its scrub bar.
    await MediaMeta.Write(Id, { DurationMs: Info.DurationMs, MediaState: 'failed' });
    return;
  }

  const NewSize = fs.statSync(TmpPath).size;

  // Re-encoding already-compressed audio can come out bigger. Keeping the
  // larger file would spend storage to gain nothing, so only take the result
  // when the streams actually needed changing.
  if (P.Mode === 'remux' && NewSize > fs.statSync(InPath).size * 1.2) {
    try {
      fs.unlinkSync(TmpPath);
    } catch (ex) {
      /* nothing to clean */
    }
    await MediaMeta.Write(Id, { DurationMs: Info.DurationMs, MediaState: 'done' });
    return;
  }

  // Swap with a recovery point: the original survives under _orig until the new
  // bytes are in place. rename-over-existing is not portable to Windows, which
  // is why the original moves aside first rather than being overwritten.
  try {
    fs.renameSync(InPath, BackupPath);
    fs.renameSync(TmpPath, InPath);
  } catch (ex) {
    console.error('[MediaTranscode] swap failed for file ' + Id + ': ' + ex.message);
    try {
      if (fs.existsSync(BackupPath) && !fs.existsSync(InPath)) fs.renameSync(BackupPath, InPath);
      if (fs.existsSync(TmpPath)) fs.unlinkSync(TmpPath);
    } catch (ex2) {
      console.error('[MediaTranscode] could not restore original for file ' + Id);
    }
    await MediaMeta.Write(Id, { DurationMs: Info.DurationMs, MediaState: 'failed' });
    return;
  }

  const Out = await Probe(InPath);
  const Duration = (Out && Out.DurationMs) || Info.DurationMs;

  try {
    await Models.File.update({ ext: P.Ext, size: NewSize }, { where: { id_data: Id } });
    await MediaMeta.Write(Id, { DurationMs: Duration, MediaState: 'done' });
  } catch (ex) {
    // The bytes on disk are now the NEW ones while the row still says the old
    // extension - which decides Content-Type. Put the original back rather than
    // leave those disagreeing.
    console.error('[MediaTranscode] row update failed for file ' + Id + ': ' + ex.message);
    try {
      fs.unlinkSync(InPath);
      fs.renameSync(BackupPath, InPath);
    } catch (ex2) {
      console.error('[MediaTranscode] could not restore original for file ' + Id);
    }
    return;
  }

  try {
    fs.unlinkSync(BackupPath);
  } catch (ex) {
    /* leaving it costs disk, not correctness */
  }
}

// ---------------------------------------------------------------------------
// The queue
// ---------------------------------------------------------------------------

const Pending = [];
let Running = false;

async function Drain() {
  if (Running) return;
  Running = true;

  while (Pending.length > 0) {
    const Id = Pending.shift();
    try {
      await NormalizeFile(Id);
    } catch (ex) {
      console.error('[MediaTranscode] unhandled error on file ' + Id + ': ' + ex.message);
    }
  }

  Running = false;
}

/**
 * Queue files for normalisation. Returns immediately; never throws.
 *
 * Callers are on the delivery path, so this must not be awaited for anything
 * that matters - Enqueue marks the rows 'pending' and lets the message go.
 */
function Enqueue(FileIds) {
  const Ids = (Array.isArray(FileIds) ? FileIds : [FileIds])
    .map((n) => parseInt(n, 10))
    .filter((n) => !!n && !Number.isNaN(n));
  if (Ids.length === 0) return;

  Ids.forEach((Id) => {
    Pending.push(Id);
    MediaMeta.Write(Id, { MediaState: 'pending' }).catch(() => {});
  });

  setImmediate(() => {
    Drain().catch((ex) => console.error('[MediaTranscode] drain failed: ' + ex.message));
  });
}

/**
 * Pick up work a restart interrupted.
 *
 * A row left 'pending' by a crash or a deploy would otherwise stay that way
 * forever, showing a permanent "processing" hint on a clip that is in fact
 * finished as far as anyone is ever going to do anything about it.
 */
async function ResumePending() {
  try {
    if (!(await MediaMeta.Available())) return;

    const sequelize = require('../config/DbConnection');
    const [Rows] = await sequelize.query(
      "SELECT TOP 200 id_data FROM [File] WHERE media_state = 'pending' AND rec_status <> '2' " +
        'ORDER BY id_data DESC'
    );
    if (!Rows || Rows.length === 0) return;

    console.error('[MediaTranscode] resuming ' + Rows.length + ' interrupted transcode(s)');
    Enqueue(Rows.map((r) => r.id_data));
  } catch (ex) {
    console.error('[MediaTranscode] resume failed: ' + ex.message);
  }
}

module.exports = { Enqueue, NormalizeFile, ResumePending, Available, Probe, Plan };
