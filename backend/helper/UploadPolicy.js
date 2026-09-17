/**
 * WHAT MAY BE UPLOADED, AND HOW BIG.
 *
 * Lifted out of controllers/system/BaseController.js unchanged on 2026-09-14,
 * for the same reason MayAttachTo and MayDownload moved to
 * helper/FileAccessHelper.js: /api/patient/questions now stores attachments too,
 * and a second copy of an extension allowlist is how the two drift until one of
 * them is wrong. There is one list, and everything that writes a File row asks
 * it.
 *
 * The comments below are the originals. They are the reasoning, not decoration -
 * read them before widening anything.
 */

// 10 MB. It was 1000 MB, which on a public wall is a denial-of-service against
// ALLFILE_DIR: any authenticated user could park gigabytes per request.
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

// Chat attachments get a higher ceiling: a chest X-ray or a .dcm study does not
// fit in 10 MB, and chat is where doctors actually pass those to each other.
const MAX_UPLOAD_BYTES_CHAT = 50 * 1024 * 1024;

/*
 * A patient asking a question from a phone (tender §2.3: "зураг, дуу, баримт").
 *
 * 20 MB rather than the 10 MB default, because the thing a patient actually
 * attaches is a photo straight from a modern camera or a voice note, and a
 * 12 MB HEIC rejected with "too large" is a support call. Well under the chat
 * ceiling, because this is a public-facing surface rather than a doctor moving
 * a study, and the per-request count is capped separately at MAX_FILES_PER_POST.
 */
const MAX_UPLOAD_BYTES_QUESTION = 20 * 1024 * 1024;

// formidable's maxFileSize is fixed when the form is constructed, which happens
// BEFORE LinkedObjectInfo is parsed - so it has to admit the largest cap any
// object allows, and the per-object limit is then enforced in the file loop.
// Nothing gets a bigger allowance than its own cap; the ceiling only decides how
// far a request is read before it can be judged.
const MAX_UPLOAD_CEILING = MAX_UPLOAD_BYTES_CHAT;

/** At most this many files on one question. Tender §2.3 asks for five. */
const MAX_FILES_PER_POST = 5;

const UploadCapFor = (LinkedObjectName) => {
  if (LinkedObjectName === 'ChatMessages') return MAX_UPLOAD_BYTES_CHAT;
  if (LinkedObjectName === 'VisitComments') return MAX_UPLOAD_BYTES_QUESTION;
  return MAX_UPLOAD_BYTES;
};

// Extensions that will be stored. Everything else is rejected outright. There
// was no check at all before, so a .exe renamed .jpg was stored and served
// straight back to the next viewer.
//
// The audio formats exist for mobile tender §8, which requires chat carrying
// "text, images, audio and documents". NOTE: this list is shared by every model
// that uploads, so widening it widens uploads app-wide - it belongs in front of
// the mandated information-security audit (CLAUDE.md §9) rather than being
// treated as one feature's detail.
const ALLOWED_UPLOAD_EXT = [
  'jpg',
  'jpeg',
  'png',
  'gif',
  'webp',
  'bmp',
  'heic',
  'pdf',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'txt',
  'csv',
  'dcm',
  // audio - mobile tender §8
  'mp3',
  'm4a',
  'aac',
  'ogg',
  'wav',
  'webm',
];

/**
 * Video, allowed for the rehabilitation catalogue and for chat, and NOWHERE
 * else - kept off ALLOWED_UPLOAD_EXT because that list is shared by every model
 * that uploads, and a clinical form which has never accepted video should not
 * start doing so as a side effect of a chat feature.
 */
const ALLOWED_UPLOAD_EXT_VIDEO = ['mp4', 'm4v', 'mov', 'webm'];

const VIDEO_FOR = ['RehabExercise', 'RehabMovement', 'ChatMessages'];

/*
 * Chat-only, and it is AUDIO: 'weba' is audio/webm.
 *
 * It is what a browser voice note is whenever the browser cannot record
 * audio/mp4 - Firefox always, Chrome before 130. The container is byte-identical
 * to a video .webm, so the extension is the only thing that can say there is no
 * picture in it, and helper/MediaStream.js classifies on exactly that: '.webm'
 * is video, '.weba' is audio. Without this entry the recorder's own output is
 * rejected on upload, and a voice note that did get through would render as a
 * black video frame.
 *
 * Off the global list for the same reason video is: that list is shared by
 * every model that uploads.
 */
const CHAT_EXTRA_EXT = ['weba'];

/*
 * Where a BROWSER-RECORDED voice note may land.
 *
 * It is the recorder's own output format, so every surface that offers the
 * microphone has to admit it or the feature is dead on Firefox and on Chrome
 * before 130 - the user records, and the upload is refused for an extension
 * they never chose. Advice replies record exactly the way chat does
 * (customComponents/Chat/AudioRecorder.jsx is reused unmodified), so they
 * belong here too.
 *
 * Still off the global list: 'weba' only ever arrives from a recorder, and a
 * clinical form that has never seen one should not start accepting it as a
 * side effect.
 */
const WEBA_FOR = ['ChatMessages', 'Advice', 'AdviceComment'];

const AllowedExtFor = (LinkedObjectName) => {
  let List = ALLOWED_UPLOAD_EXT;
  if (VIDEO_FOR.indexOf(LinkedObjectName) !== -1) List = List.concat(ALLOWED_UPLOAD_EXT_VIDEO);
  if (WEBA_FOR.indexOf(LinkedObjectName) !== -1) List = List.concat(CHAT_EXTRA_EXT);
  return List;
};

module.exports = {
  MAX_UPLOAD_BYTES,
  MAX_UPLOAD_BYTES_CHAT,
  MAX_UPLOAD_BYTES_QUESTION,
  MAX_UPLOAD_CEILING,
  MAX_FILES_PER_POST,
  UploadCapFor,
  ALLOWED_UPLOAD_EXT,
  ALLOWED_UPLOAD_EXT_VIDEO,
  VIDEO_FOR,
  WEBA_FOR,
  AllowedExtFor,
};
