/**
 * Storing uploaded files from the /api/* surfaces.
 *
 * WHY THIS EXISTS RATHER THAN A SECOND UPLOAD HANDLER.
 *
 * /BaseObject/uploadFile implements replace-the-whole-field semantics: it reads
 * a LinkedObjectInfo envelope, matches the incoming files against the ones
 * already on the record, and soft-deletes anything not named in the request.
 * That is right for a clinical form where the user edits an attachment list,
 * and wrong for a question, which is written once and never edited - there is
 * nothing to replace, and the machinery that does the replacing is exactly the
 * machinery that once made an empty payload delete every file on an object.
 *
 * So this is the append-only half: validate, move, write File rows, return what
 * was stored and what was refused. It shares the allowlist and the size caps
 * with /BaseObject through helper/UploadPolicy.js, and the same MediaSniff
 * content check, so a file this refuses is refused there too.
 *
 * The multipart parse and the store are separate functions on purpose. A
 * handler must be able to read the TEXT fields, create the record they belong
 * to, and only then attach files to the id it just got - a File row cannot be
 * written before its LinkedObjectId exists.
 */

const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');
const formidable = require('formidable');

const BaseControllerHelper = require('./BaseControllerHelper');
const BaseHelper = require('./BaseHelper');
const ImageHelper = require('./ImageHelper');
const MediaSniff = require('./MediaSniff');
const { Models } = require('../config/DB');
const {
  MAX_UPLOAD_CEILING,
  MAX_FILES_PER_POST,
  UploadCapFor,
  AllowedExtFor,
} = require('./UploadPolicy');

/**
 * Read a multipart/form-data request into { fields, files }.
 *
 * `files` is always an array per key, because formidable hands back a bare
 * object for one file and an array for several - branching on that at every
 * call site is how one-file and many-file requests end up behaving differently.
 *
 * maxFileSize is the CEILING, not the per-object cap, for the reason given in
 * UploadPolicy: formidable fixes it when the form is constructed, before
 * anything in the body has been read. The stricter per-object limit is applied
 * in Store, once the object is known.
 */
function Parse(req) {
  const form = new formidable.IncomingForm({
    maxFileSize: MAX_UPLOAD_CEILING,
    multiples: true,
    keepExtensions: true,
    uploadDir: path.join(__dirname, '../tmpFile'),
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);

      // formidable v2 hands single values back as scalars and v3 as
      // one-element arrays. Normalise both directions so a handler reads
      // fields.comment and gets a string either way.
      const flatFields = {};
      Object.keys(fields || {}).forEach((k) => {
        const v = fields[k];
        flatFields[k] = Array.isArray(v) ? v[0] : v;
      });

      const flatFiles = [];
      Object.keys(files || {}).forEach((k) => {
        const v = files[k];
        (Array.isArray(v) ? v : [v]).forEach((f) => {
          if (f) flatFiles.push(f);
        });
      });

      resolve({ fields: flatFields, files: flatFiles });
    });
  });
}

/** Delete a temp file that is not going to be stored. It may already be gone. */
async function Discard(p) {
  try {
    if (p) await fsPromises.unlink(p);
  } catch (e) {
    /* formidable may have cleaned it up already */
  }
}

/**
 * Validate and store already-parsed files against one object.
 *
 * Returns { saved: [...], rejected: [{ Name, Reason, Message }] }. Rejection is
 * PER FILE and never throws: four good photos and one .exe stores four and names
 * the fifth, because failing the whole question would lose the text the patient
 * typed as well.
 *
 * Every refusal carries a Mongolian message, since it is shown to a patient.
 */
async function Store({ Files, LinkedObjectName, LinkedObjectId, FieldName, LogedUser, MaxFiles }) {
  const saved = [];
  const rejected = [];

  const list = Files || [];
  const cap = MaxFiles || MAX_FILES_PER_POST;

  // Over the count limit: refuse the surplus rather than the request. The
  // earliest files are the ones kept, so behaviour does not depend on the
  // order the client happened to serialise them in.
  const accepted = list.slice(0, cap);
  for (const extra of list.slice(cap)) {
    rejected.push({
      Name: extra.originalFilename || extra.name,
      Reason: 'count',
      Message: 'Нэг удаад ' + cap + ' файл хавсаргана',
    });
    await Discard(extra.filepath || extra.path);
  }

  const allowed = AllowedExtFor(LinkedObjectName);
  const sizeCap = UploadCapFor(LinkedObjectName);

  let n = 0;
  for (const f of accepted) {
    const OldPath = f.filepath || f.path;
    const Original = f.originalFilename || f.name || 'file';
    const Ext = String(ImageHelper.getType(Original) || '').toLowerCase();

    if (allowed.indexOf(Ext) === -1) {
      rejected.push({
        Name: Original,
        Reason: 'ext',
        Message: 'Зөвшөөрөгдөөгүй өргөтгөлтэй файл: ' + (Ext || '?'),
      });
      await Discard(OldPath);
      continue;
    }

    if (f.size > sizeCap) {
      rejected.push({
        Name: Original,
        Reason: 'size',
        Message:
          'Файлын хэмжээ хэтэрсэн: ' +
          Math.round(f.size / 1048576) +
          ' МБ, зөвшөөрөх дээд хэмжээ ' +
          Math.round(sizeCap / 1048576) +
          ' МБ',
      });
      await Discard(OldPath);
      continue;
    }

    // Do the BYTES agree with the name? Audio and video only - MediaSniff
    // judges nothing else. It matters here because a voice note is served
    // Content-Disposition: inline, and inline is where a mislabelled file
    // stops being inert.
    const Sniff = MediaSniff.Check(OldPath, Ext);
    if (!Sniff.Ok) {
      rejected.push({ Name: Original, Reason: 'content', Message: Sniff.Reason });
      await Discard(OldPath);
      continue;
    }

    n++;
    // getDateNumbers() has one-second resolution, so two concurrent requests
    // from one user in the same second would otherwise generate the same name
    // and silently overwrite each other. Same construction as BaseController.
    const FileName =
      BaseHelper.getDateNumbers() +
      '_' +
      LogedUser.Id +
      '_' +
      n +
      '_' +
      Math.random().toString(36).slice(2, 6);
    const FilePath = path.join(process.env.ALLFILE_DIR, FileName);

    try {
      // Copy then unlink rather than rename: tmpFile and ALLFILE_DIR are not
      // guaranteed to be on the same device, and rename fails across devices.
      await fsPromises.copyFile(OldPath, FilePath);
      await fsPromises.unlink(OldPath);
    } catch (ex) {
      console.error('[AttachmentIntake] move failed:', ex.message);
      rejected.push({
        Name: Original,
        Reason: 'io',
        Message: 'Файл хадгалахад алдаа гарлаа',
      });
      await Discard(OldPath);
      continue;
    }

    // BaseCreate, not Models.File.create: File is a legacy-generation table
    // whose id, id_group, user_mod, date_modif and rec_status are NOT NULL with
    // no defaults, and ModelHelper is what stamps them.
    const Id = await BaseControllerHelper.BaseCreate({
      ObjectName: 'File',
      Data: {
        LinkedObjectName,
        LinkedObjectId,
        FieldName: FieldName || null,
        ext: Ext,
        size: f.size,
        generated_name: FileName,
        original_name: Original.replace(new RegExp('\\.' + Ext + '$', 'i'), ''),
      },
      LogedUser,
      SaveLog: true,
    });

    /*
     * BaseCreate RETURNS NULL RATHER THAN THROWING when it refuses a write -
     * PatientScope.ApplyPatientOwnership does exactly that for an object with
     * no SCOPE_BY_OBJECT entry. Reporting the file as saved anyway is how an
     * attachment ends up existing in ALLFILE_DIR and in no table, which is
     * worse than not accepting it: nothing references the bytes, so nothing
     * will ever serve them or clean them up.
     *
     * So the id is checked, the orphan is removed, and the caller is told.
     */
    if (!Id) {
      console.error(
        '[AttachmentIntake] BaseCreate wrote no File row for ' +
          LinkedObjectName +
          '/' +
          LinkedObjectId +
          ' - check PatientScope.SCOPE_BY_OBJECT'
      );
      await Discard(FilePath);
      rejected.push({
        Name: Original,
        Reason: 'store',
        Message: 'Файл хадгалагдсангүй',
      });
      continue;
    }

    saved.push({ id: Id, name: Original, ext: Ext, size: f.size });
  }

  return { saved, rejected };
}

/**
 * The files hanging off a set of records, as { LinkedObjectId -> [file] }.
 *
 * One query for the whole page rather than one per row - a thread of thirty
 * questions would otherwise issue thirty selects to render one screen.
 *
 * `url` points at /api/Media/stream/:generatedName, which already exists and is
 * the right answer for a photo or a voice note: it is header-authenticated,
 * calls the same MayDownload as everything else, and supports HTTP byte ranges,
 * so an audio player can seek. /BaseObject/downloadFile would hand back
 * Content-Disposition: attachment, which a player cannot use.
 *
 * Handing the client `generated_name` inside that URL is the established design
 * for media here, not a leak: the route authorizes the STORED row on every
 * request, so knowing a name buys nothing. See the header of MediaController.
 *
 * A browser <img> or <audio> cannot send an Authorization header - that case is
 * served by MediaTicketController, which mints a short-lived credential scoped
 * to one file and one user. The mobile client sends the header and needs none.
 */
async function ListFor({ LinkedObjectName, Ids }) {
  const ids = (Ids || []).filter((i) => i !== null && i !== undefined);
  if (!ids.length) return new Map();

  const rows = await Models.File.findAll({
    where: {
      LinkedObjectName,
      LinkedObjectId: ids,
      // 9 is live. rec_status is an int here despite BaseController comparing
      // it as a string in places; both values are accepted because the column
      // has carried both over the years.
      rec_status: ['9', 9, '1', 1],
    },
    attributes: ['id_data', 'LinkedObjectId', 'original_name', 'ext', 'size', 'generated_name'],
    order: [['id_data', 'ASC']],
    raw: true,
  });

  const byId = new Map();
  rows.forEach((r) => {
    const list = byId.get(r.LinkedObjectId) || [];
    list.push({
      id: r.id_data,
      // original_name is stored WITHOUT its extension (BaseController strips it
      // on the way in), so it is put back here rather than leaving the client
      // to guess how to display a file called "photo".
      name: r.ext ? r.original_name + '.' + r.ext : r.original_name,
      ext: r.ext,
      size: r.size,
      url: '/api/Media/stream/' + r.generated_name,
    });
    byId.set(r.LinkedObjectId, list);
  });

  return byId;
}

module.exports = { Parse, Store, ListFor, Discard };
