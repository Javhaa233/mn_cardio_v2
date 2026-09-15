const fs = require('fs');

/**
 * Does this file's CONTENT match the extension it claims?
 *
 * WHY. Upload validates the extension with path.extname and nothing else
 * (helper/ImageHelper.getType), so a file is whatever its name says it is. That
 * was survivable while every attachment was delivered as a download - the
 * browser was never going to execute it. Media changes that: the player routes
 * serve bytes with Content-Disposition: inline, which is the whole point of
 * them, and inline is where a mislabelled file stops being an inert blob.
 *
 * SCOPE IS DELIBERATELY NARROW. This checks the audio and video containers and
 * nothing else, and it only ever answers about a file whose claimed extension
 * is one of those. Images, PDFs, DICOM and Office documents are untouched -
 * widening it would put a new rejection in front of eight existing clinical
 * attachment flows, which is exactly the mistake FileAccessHelper's header
 * warns against. This is a gate on the new path, not a retrofit of the old one.
 *
 * NO DEPENDENCY. `file-type` would do this, but its current major is ESM-only
 * and this codebase is CommonJS throughout. Six container signatures are not
 * worth a build change.
 */

const HEADER_BYTES = 32;

/** Extensions this module is willing to judge. Anything else: not our business. */
const SNIFFABLE = ['mp3', 'm4a', 'aac', 'ogg', 'wav', 'weba', 'mp4', 'm4v', 'mov', 'webm'];

function ReadHeader(Path) {
  let fd;
  try {
    fd = fs.openSync(Path, 'r');
    const Buf = Buffer.alloc(HEADER_BYTES);
    const Read = fs.readSync(fd, Buf, 0, HEADER_BYTES, 0);
    return Buf.slice(0, Read);
  } catch (ex) {
    return null;
  } finally {
    if (fd !== undefined) {
      try {
        fs.closeSync(fd);
      } catch (ex) {
        /* already gone */
      }
    }
  }
}

/**
 * The container a header describes, or null.
 *
 * Returns a FAMILY, not an extension: 'isobmff' covers mp4, m4v, m4a and mov,
 * which genuinely are the same container and cannot be told apart by their
 * first bytes - only by the brand in the ftyp box, which encoders disagree
 * about. Distinguishing them here would reject valid files for no safety gain.
 */
function Family(Buf) {
  if (!Buf || Buf.length < 12) return null;

  // ISO base media: 4-byte size, then 'ftyp' at offset 4. mp4 / m4v / m4a / mov.
  if (Buf.slice(4, 8).toString('latin1') === 'ftyp') return 'isobmff';

  // Matroska / WebM EBML header.
  if (Buf[0] === 0x1a && Buf[1] === 0x45 && Buf[2] === 0xdf && Buf[3] === 0xa3) return 'matroska';

  // Ogg.
  if (Buf.slice(0, 4).toString('latin1') === 'OggS') return 'ogg';

  // RIFF....WAVE
  if (
    Buf.slice(0, 4).toString('latin1') === 'RIFF' &&
    Buf.slice(8, 12).toString('latin1') === 'WAVE'
  ) {
    return 'wav';
  }

  // MP3: an ID3 tag, or a bare MPEG audio frame sync (0xFF Ex/Fx).
  if (Buf.slice(0, 3).toString('latin1') === 'ID3') return 'mpeg-audio';
  if (Buf[0] === 0xff && (Buf[1] & 0xe0) === 0xe0) return 'mpeg-audio';

  // ADTS AAC is also 0xFF-sync and is caught by the line above; a raw .aac
  // stream and an .mp3 frame are the same family for our purposes.

  return null;
}

/** Which families an extension may legitimately be. */
const ALLOWED_FAMILIES = {
  mp4: ['isobmff'],
  m4v: ['isobmff'],
  m4a: ['isobmff'],
  mov: ['isobmff'],
  // A browser MediaRecorder writes WebM; some write a fragmented MP4 and still
  // call it .webm. Both are real files a real client produced.
  webm: ['matroska', 'isobmff'],
  // audio/webm - the same container, named so the classifier knows there is no
  // picture in it. Ogg is admitted because a browser that cannot write WebM
  // audio falls back to audio/ogg, and the recorder labels both by intent.
  weba: ['matroska', 'ogg'],
  ogg: ['ogg'],
  wav: ['wav'],
  mp3: ['mpeg-audio'],
  // .aac from a phone is usually ADTS, but iOS hands back an ISOBMFF file with
  // an .aac name often enough that refusing it would be refusing real uploads.
  aac: ['mpeg-audio', 'isobmff'],
};

/**
 * Check a file on disk against its claimed extension.
 *
 * Returns { Checked, Ok, Reason }:
 *   Checked false - not an extension this module judges. Caller proceeds.
 *   Ok false      - the bytes contradict the name. Caller must reject.
 *
 * An unreadable file is NOT a rejection: the caller is about to fail on it
 * anyway for a better reason, and turning an I/O error into "wrong file type"
 * would send whoever hit it looking in the wrong place.
 */
function Check(Path, Ext) {
  const E = String(Ext || '').toLowerCase();
  if (SNIFFABLE.indexOf(E) === -1) return { Checked: false, Ok: true, Reason: '' };

  const Buf = ReadHeader(Path);
  if (!Buf || Buf.length < 12) return { Checked: false, Ok: true, Reason: '' };

  const Found = Family(Buf);
  if (!Found) {
    return {
      Checked: true,
      Ok: false,
      Reason: 'Файлын агуулга "' + E + '" төрөлтэй тохирохгүй байна',
    };
  }

  const Allowed = ALLOWED_FAMILIES[E] || [];
  if (Allowed.indexOf(Found) === -1) {
    return {
      Checked: true,
      Ok: false,
      Reason: 'Файлын агуулга "' + E + '" төрөлтэй тохирохгүй байна',
    };
  }

  return { Checked: true, Ok: true, Reason: '' };
}

module.exports = { Check, Family, SNIFFABLE };
