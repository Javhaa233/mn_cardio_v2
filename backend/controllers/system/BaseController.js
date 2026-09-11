const express = require('express');
const formidable = require('formidable');
const fs = require('fs');
const { promises: fsPromises } = require('fs');
const path = require('path');
const router = express.Router();

const { Models } = require('../../config/DB');

// helper
const BaseControllerHelper = require('../../helper/BaseControllerHelper');
const BaseHelper = require('../../helper/BaseHelper');
const ImageHelper = require('../../helper/ImageHelper');
// Chat attachments ride this generic upload endpoint rather than getting a
// table of their own; MayAttachTo needs both to authorize them.
const ChatIdentity = require('../../helper/ChatIdentity');
const ChatHelper = require('../../helper/ChatHelper');
const PatientScope = require('../../helper/PatientScope');
const AdviceScopeHelper = require('../../helper/AdviceScopeHelper');

// routes
router.post('/getData', getData);
router.post('/', getList);
router.post('/getListInfo', getListInfo);
router.post('/getDetail', getDetail);
router.post('/getDetailInfo', getDetailInfo);
router.post('/create', create);
router.post('/update', update);
router.post('/destroy', destroy);
router.post('/uploadFile', uploadFile);
router.post('/downloadFile', downloadFile);
router.post('/deleteFile', deleteFile);
router.post('/ExportExcel', ExportExcel);
router.post('/ExportText', ExportText);



//#region GetDetail
async function getDetail(req, res) {
  try {
    var result = { Success: true, Message: '', Data: {}, Option: {} };
    const ObjectName = req.body.ObjectName;
    const LogedUser = req.LogedUser;
    const AppId = req.body.AppId;

    if (ObjectName && LogedUser) {
      var Option = BaseControllerHelper.GetCrudRequestData(req);
      var DetailData = await BaseControllerHelper.BaseDetail({
        ObjectName,
        LogedUser,
        AppId,
        Option,
      });
      result.Data = DetailData.Data;
    }

    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

async function getDetailInfo(req, res) {
  try {
    var result = { Success: true, Message: '', Data: {}, Option: {} };
    const ObjectName = req.body.ObjectName;
    const AppId = req.body.AppId;
    const LogedUser = req.LogedUser;

    if (ObjectName && LogedUser) {
      var Option = BaseControllerHelper.GetCrudRequestData(req);
      var DetailData = await BaseControllerHelper.BaseDetailInfo({
        ObjectName,
        LogedUser,
        AppId,
        Option,
      });
      result.Data = DetailData.Data;
    }

    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

//#endregion

//#region GetList

async function getList(req, res) {
  try {
    const result = { Success: true, Message: '', Data: [], Option: {} };
    const ObjectName = req.body.ObjectName;
    const AppId = req.body.AppId;
    const LogedUser = req.LogedUser;

    if (ObjectName && LogedUser) {
      const Option = BaseControllerHelper.GetCrudRequestData(req);
      const ListData = await BaseControllerHelper.BaseGetList({
        ObjectName,
        LogedUser,
        AppId,
        Option,
      });

      result.Data = ListData.Data;
      result.Option = ListData.Option;
      return res.send(JSON.stringify(result));
    } else {
      return res.send(
        JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Information is missing'))
      );
    }
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

async function getListInfo(req, res) {
  try {
    var result = { Success: true, Message: '', Data: [], Option: {} };
    const ObjectName = req.body.ObjectName;
    const AppId = req.body.AppId;
    const LogedUser = req.LogedUser;

    if (ObjectName && LogedUser) {
      var Option = BaseControllerHelper.GetCrudRequestData(req);
      var ListData = await BaseControllerHelper.BaseGetListInfo({
        ObjectName,
        LogedUser,
        AppId,
        Option,
      });

      result.Data = ListData.Data;
      result.Option = ListData.Option;
    }
    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}
//#endregion

//#region CreateUpdateDelete

async function create(req, res) {
  try {
    var result = { Success: true, Message: '', Data: {} };
    const ObjectName = req.body.ObjectName;
    const Data = JSON.parse(req.body.Data);
    const LogedUser = req.LogedUser;

    if (ObjectName && Data && LogedUser) {
      const Result = await BaseControllerHelper.BaseCreate({
        ObjectName,
        Data,
        LogedUser,
        SaveLog: true,
      });
      if (Result) {
        result.Success = true;
        result.Message = 'Successfully saved';
        result.Data = { DataId: Result };
      } else {
        result.Success = false;
        result.Message = 'Not create';
      }
    } else {
      result.Success = false;
      result.Message = 'Information is missing';
    }

    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.error(ex);
    const message = ex.Message || ex.message || null;
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult(message)));
  }
}

async function update(req, res) {
  try {
    var result = { Success: true, Message: 'Successfully saved', Data: {} };
    const ObjectName = req.body.ObjectName;
    const Data = JSON.parse(req.body.Data);
    const LogedUser = req.LogedUser;

    if (ObjectName && Data && LogedUser) {
      const Result = await BaseControllerHelper.BaseUpdate({
        ObjectName,
        Data,
        LogedUser,
        SaveLog: true,
      });

      if (Result) {
        result.Data = { DataId: Result };
      } else {
        result.Success = false;
        result.Message = 'Not update';
      }
      return res.send(JSON.stringify(result));
    } else {
      return res.send(
        JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Information is missing'))
      );
    }
  } catch (ex) {
    console.error(ex);
    const message = ex.Message || ex.message || null;
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult(message)));
  }
}

async function destroy(req, res) {
  try {
    var result = { Success: true, Message: 'Successfully deleted', Data: [] };
    const ObjectName = req.body.ObjectName;
    var Option = req.body.DeleteOption;
    const LogedUser = req.LogedUser;
    if (ObjectName && Option && LogedUser) {
      var Result = await BaseControllerHelper.BaseDelete({
        ObjectName,
        Option,
        LogedUser,
        SaveLog: true,
      });
      // BaseDelete returns null when the caller was refused, false when it
      // threw, and the number of rows it actually removed otherwise. Reporting
      // "Successfully deleted" regardless told callers a row was gone when the
      // filter had matched nothing - and hid refusals as successes.
      if (Result === null) {
        return res.send(
          JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Энэ бичлэгийг устгах эрхгүй байна'))
        );
      }
      if (Result === false) {
        return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
      }
      if (Result === 0) {
        return res.send(
          JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Устгах бичлэг олдсонгүй'))
        );
      }
      result.Data = { Deleted: Result };
      return res.send(JSON.stringify(result));
    } else {
      return res.send(
        JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Information is missing'))
      );
    }
  } catch (ex) {
    console.error(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

//#endregion

//#region File

// 10 MB. It was 1000 MB, which on a public wall is a denial-of-service against
// ALLFILE_DIR: any authenticated user could park gigabytes per request.
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

// Chat attachments get a higher ceiling: a chest X-ray or a .dcm study does not
// fit in 10 MB, and chat is where doctors actually pass those to each other.
//
// Storage-capacity implications are a ZSUT question - see the note in
// scripts/add_chat_v2_columns.sql's companion plan.
const MAX_UPLOAD_BYTES_CHAT = 50 * 1024 * 1024;

// formidable's maxFileSize is fixed when the form is constructed, which happens
// BEFORE LinkedObjectInfo is parsed - so it has to admit the largest cap any
// object allows, and the per-object limit is then enforced in the file loop
// below. Nothing gets a bigger allowance than its own cap; the ceiling only
// decides how far a request is read before it can be judged.
const MAX_UPLOAD_CEILING = MAX_UPLOAD_BYTES_CHAT;

const UploadCapFor = (LinkedObjectName) =>
  LinkedObjectName === 'ChatMessages' ? MAX_UPLOAD_BYTES_CHAT : MAX_UPLOAD_BYTES;

// Extensions this endpoint will store. Everything else is rejected outright.
// There was no check at all before, so a .exe renamed .jpg was stored and
// served straight back to the next viewer.
//
// The audio formats exist for mobile tender §8, which requires chat carrying
// "text, images, audio and documents". NOTE: this list is shared by all eight
// models that use /BaseObject/uploadFile, so widening it widens uploads
// app-wide - it belongs in front of the mandated information-security audit
// (CLAUDE.md §9) rather than being treated as a chat detail.
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
 * May this user attach to / replace the files of this object?
 *
 * The endpoint is generic and shared by 8 models, so this deliberately gates
 * only what it can check with certainty and leaves everything else at the
 * previous behaviour. Widening it is a separate, per-model decision - silently
 * denying an existing clinical file flow would be worse than the hole it closes.
 */
async function MayAttachTo({ LinkedObjectName, LinkedObjectId, LogedUser }) {
  // ABOVE the admin short-circuit on purpose: an administrator is not a chat
  // participant, and must not be able to plant a file on someone else's
  // conversation. This is also the specific closure of the `return true`
  // fallthrough at the bottom of this function for chat - without it,
  // LinkedObjectName 'ChatMessages' would have been permitted with no check at
  // all.
  if (LinkedObjectName === 'ChatMessages') {
    const Message = await Models.ChatMessages.findByPk(LinkedObjectId, {
      attributes: ['Id', 'ChatRoomId', 'UserId', 'UserType', 'Status'],
      raw: true,
    });
    if (!Message) return false;

    const Me = ChatIdentity.Me(LogedUser);
    if (!Me) return false;

    // Author only.
    if (!ChatIdentity.Same(Me, { UserType: Message.UserType, UserId: Message.UserId })) {
      return false;
    }
    // Files may only be bolted onto a message that is still pending delivery -
    // never onto one recipients have already seen.
    if (Message.Status !== 'P') return false;

    // ...and you must still be in the room.
    return !!(await ChatHelper.IsMember(Me, Message.ChatRoomId));
  }

  if (String(LogedUser.RoleId) === '1') return true;

  if (LinkedObjectName === 'Advice') {
    const Advice = await Models.Advice.findOne({
      where: { id_data: LinkedObjectId },
      attributes: ['id_data', 'id'],
      raw: true,
    });
    // Unknown id: refuse rather than let it create orphan File rows.
    if (!Advice) return false;
    return String(Advice.id) === String(LogedUser.Id);
  }

  if (LinkedObjectName === 'AdviceComment') {
    const Comment = await Models.AdviceComment.findOne({
      where: { id_data: LinkedObjectId },
      attributes: ['id_data', 'id'],
      raw: true,
    });
    if (!Comment) return false;
    return String(Comment.id) === String(LogedUser.Id);
  }

  return true;
}

/**
 * Whether LogedUser may read the file the client is asking for.
 *
 * downloadFile used to pass the client-supplied FileInfo straight to
 * BaseDownloadFile, which only resolves a path on disk. Nothing tied the
 * handle back to a record, so any authenticated session could name any
 * generated_name and fetch it - proven by a patient token downloading a file
 * attached to a doctor's record.
 *
 * So: resolve the handle to its File row first, then authorize the record it
 * hangs off. Returns the stored row (never the client's copy) or null.
 */
async function MayDownload({ FileInfo, LogedUser }) {
  if (!FileInfo || !FileInfo.generated_name) return null;

  const Stored = await Models.File.findOne({
    where: { generated_name: FileInfo.generated_name },
    attributes: [
      'id_data',
      'LinkedObjectName',
      'LinkedObjectId',
      'FieldName',
      'ext',
      'generated_name',
      'original_name',
      'rec_status',
    ],
    raw: true,
  });

  // No row, or soft-deleted: the handle is not a live attachment.
  if (!Stored || String(Stored.rec_status) === '2') return null;

  const LinkedObjectName = Stored.LinkedObjectName;
  const LinkedObjectId = Stored.LinkedObjectId;
  if (!LinkedObjectName || !LinkedObjectId) return null;

  /*
   * Асуумж attachments follow the rule for READING the ticket, not the rule
   * for attaching to it. MayAttachTo is author-or-admin, which is right for a
   * write and wrong for a read: the feed is a consult board where doctors open
   * each other's tickets to look at the films on them, so the attach rule would
   * have 403'd every colleague. AdviceScopeHelper owns that rule, patients
   * included, so it returns here rather than falling through to the generic
   * patient check below.
   */
  if (LinkedObjectName === 'Advice' || LinkedObjectName === 'AdviceComment') {
    const MayRead = await AdviceScopeHelper.MayReadAdviceAttachment({
      LinkedObjectName,
      LinkedObjectId,
      LogedUser,
    });
    return MayRead ? Stored : null;
  }

  // Same rule that governs attaching a file to this record.
  const Allowed = await MayAttachTo({ LinkedObjectName, LinkedObjectId, LogedUser });
  if (!Allowed) return null;

  // MayAttachTo ends in `return true` for object types it does not name, which
  // is the right default for staff but not for patients - it is what let a
  // patient token through to a doctor's attachment. Patients get the explicit
  // scope check as well.
  if (PatientScope.IsPatient(LogedUser)) {
    const scope = PatientScope.SCOPE_BY_OBJECT[LinkedObjectName];
    if (!scope) return null;

    const Owner = LogedUser[scope.From];
    if (Owner === undefined || Owner === null || Owner === '') return null;

    const ModelConfig = await BaseControllerHelper.GetConfigData(LinkedObjectName);
    if (!ModelConfig || !ModelConfig.Model) return null;

    const Row = await ModelConfig.Model.findOne({
      where: { [ModelConfig.PK]: LinkedObjectId },
      attributes: [ModelConfig.PK, scope.Field],
      raw: true,
    });
    if (!Row || String(Row[scope.Field]) !== String(Owner)) return null;
  }

  return Stored;
}

async function uploadFile(req, res) {
  try {
    var result = { Success: true, Message: 'Successfully saved', Data: [] };
    const form = new formidable.IncomingForm({
      // The ceiling, not the per-object cap - see MAX_UPLOAD_CEILING above.
      maxFileSize: MAX_UPLOAD_CEILING,
      maxFieldsSize: MAX_UPLOAD_BYTES,
      multiples: true,
      keepExtensions: true,
      uploadDir: path.join(__dirname, '../../tmpFile'),
    });

    const LogedUser = req.LogedUser;
    const ObjectName = 'File';
    var PromiseData = null;

    if (ObjectName && LogedUser) {
      PromiseData = await new Promise(function (resolve, reject) {
        form.parse(req, async function (err, fields, files) {
          if (err) reject(err);
          // Files the loop below throws away. Without this the handler answered
          // "Successfully saved" for a file it had just discarded, so the user
          // believed an attachment existed that was never stored.
          const Rejected = [];
          const LinkedObjectInfo = JSON.parse(fields['LinkedObjectInfo']);
          const LinkedObjectId = LinkedObjectInfo.LinkedObjectId;
          const LinkedObjectName = LinkedObjectInfo.LinkedObjectName;
          const FieldName = LinkedObjectInfo.FieldName;

          if (LinkedObjectId && LinkedObjectName) {
            const Allowed = await MayAttachTo({
              LinkedObjectName,
              LinkedObjectId,
              LogedUser,
            });
            if (!Allowed) {
              console.log(
                '[BaseController/uploadFile] DENIED',
                LogedUser.Id,
                LinkedObjectName,
                LinkedObjectId
              );
              return resolve({ Denied: true });
            }

            const ListOldFiles = await Models.File.findAll({
              attributes: ['id', 'id_data', 'LinkedObjectName', 'LinkedObjectId', 'FieldName'],
              where: {
                LinkedObjectName: LinkedObjectName,
                LinkedObjectId: LinkedObjectId,
                FieldName: FieldName,
                rec_status: '9',
              },
              raw: true,
            });

            var NotDelete = [];
            var FileCount = 0;
            for (var Field in fields) {
              if (Field !== 'LinkedObjectInfo' && Field.indexOf('Info') > -1) {
                FileCount++;
                var FileInfo = JSON.parse(fields[Field]);
                //not change file
                if (FileInfo.id_data) {
                  if (ListOldFiles.filter((s) => s.id_data === FileInfo.id_data).length === 1) {
                    NotDelete.push(FileInfo.id_data);
                  }
                } else {
                  //new file
                  const key = Field.replace('Info', '');
                  let NewFile = files[key];
                  if (Array.isArray(NewFile)) {
                    NewFile = NewFile[0];
                  }

                  if (NewFile) {
                    const OldPath = NewFile.filepath || NewFile.path;
                    const FileNameOriginal = NewFile.originalFilename || NewFile.name;
                    const FileType = ImageHelper.getType(FileNameOriginal);

                    if (ALLOWED_UPLOAD_EXT.indexOf(String(FileType).toLowerCase()) === -1) {
                      console.log('[BaseController/uploadFile] REJECTED ext:', FileType);
                      Rejected.push({
                        Name: FileNameOriginal,
                        Reason: 'ext',
                        Message: 'Зөвшөөрөгдөөгүй өргөтгөлтэй файл: ' + FileType,
                      });
                      try {
                        await fsPromises.unlink(OldPath);
                      } catch (e) {
                        /* temp file may already be gone */
                      }
                      continue;
                    }

                    // Per-object size cap. formidable admitted anything up to
                    // MAX_UPLOAD_CEILING because the object was not known yet;
                    // this is where the stricter default is applied to
                    // everything that is not chat.
                    const SizeCap = UploadCapFor(LinkedObjectName);
                    if (NewFile.size > SizeCap) {
                      console.log(
                        '[BaseController/uploadFile] REJECTED size:',
                        NewFile.size,
                        '>',
                        SizeCap,
                        LinkedObjectName
                      );
                      Rejected.push({
                        Name: FileNameOriginal,
                        Reason: 'size',
                        Message:
                          'Файлын хэмжээ хэтэрсэн: ' +
                          Math.round(NewFile.size / 1048576) +
                          ' МБ, зөвшөөрөх дээд хэмжээ ' +
                          Math.round(SizeCap / 1048576) +
                          ' МБ',
                      });
                      try {
                        await fsPromises.unlink(OldPath);
                      } catch (e) {
                        /* temp file may already be gone */
                      }
                      continue;
                    }

                    // getDateNumbers() has one-second resolution, so two
                    // concurrent requests from the same user in the same second
                    // used to generate the same name and silently overwrite each
                    // other. The random suffix costs nothing and removes that.
                    const FileName =
                      BaseHelper.getDateNumbers() +
                      '_' +
                      LogedUser.Id +
                      '_' +
                      FileCount +
                      '_' +
                      Math.random().toString(36).slice(2, 6);
                    const FilePath = path.join(process.env.ALLFILE_DIR, FileName);

                    // Move file with proper error handling (copy then delete to handle cross-device moves)
                    try {
                      await fsPromises.copyFile(OldPath, FilePath);
                      await fsPromises.unlink(OldPath);
                    } catch (error) {
                      console.error('File move error:', error);
                      throw new Error(`Failed to save file: ${error.message}`);
                    }

                    // Create database record after file is successfully moved
                    await BaseControllerHelper.BaseCreate({
                      ObjectName: 'File',
                      Data: {
                        LinkedObjectName: LinkedObjectName,
                        LinkedObjectId: LinkedObjectId,
                        FieldName: FieldName,
                        ext: FileType,
                        size: NewFile.size,
                        generated_name: FileName,
                        original_name: FileInfo.Name.replace('.' + FileType, ''),
                      },
                      LogedUser,
                      SaveLog: true,
                    });
                  }
                }
              }
            }

            // This loop implements replace-the-whole-field: anything not named
            // in the request is soft-deleted. That means a request carrying no
            // file-info fields at all used to wipe every file on the object.
            // Combined with the missing ownership check above, that was a
            // one-request "delete all photos on any ticket" primitive.
            //
            // A payload with zero file-info fields is now treated as "no
            // change" rather than "remove everything". Genuinely clearing a
            // field is what /BaseObject/deleteFile is for, and a caller that
            // really means it can still say so explicitly.
            const AllowRemoveAll = LinkedObjectInfo.AllowRemoveAll === true;
            if (FileCount === 0 && !AllowRemoveAll) {
              return resolve({ Skipped: 'empty payload' });
            }

            // Stop before the replace-the-whole-field delete below if anything
            // was rejected. A rejected file never made it into NotDelete, so
            // running that loop would soft-delete the attachments already on
            // the record - the caller would be told the save failed AND lose
            // the files it already had.
            if (Rejected.length > 0) {
              return resolve({ Rejected });
            }

            //delete file
            for (var i = 0; i < ListOldFiles.length; i++) {
              if (NotDelete.filter((s) => s + '' === ListOldFiles[i].id_data + '').length === 0) {
                await BaseControllerHelper.BaseUpdate({
                  ObjectName: 'File',
                  Data: {
                    id_data: ListOldFiles[i].id_data,
                    rec_status: '2',
                  },
                  LogedUser,
                  SaveLog: true,
                });
              }
            }
          }

          resolve({ Rejected });
        });
      });

      if (PromiseData && PromiseData.Denied) {
        return res.send(
          JSON.stringify(
            BaseControllerHelper.GetDefaultErrorResult('Энэ бичлэгт файл хавсаргах эрхгүй байна')
          )
        );
      }

      // A discarded file is not a save. Say so, and name which ones went.
      const Rejected = (PromiseData && PromiseData.Rejected) || [];
      if (Rejected.length > 0) {
        const Failure = BaseControllerHelper.GetDefaultErrorResult(
          Rejected.map((r) => r.Name + ': ' + r.Message).join('; ')
        );
        Failure.Data = { Rejected };
        return res.send(JSON.stringify(Failure));
      }

      result.Data = { PromiseData };
      return res.send(JSON.stringify(result));
    } else {
      return res.send(
        JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Information is missing'))
      );
    }
  } catch (ex) {
    console.error(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

async function downloadFile(req, res) {
  try {
    const FileInfo = req.body.FileInfo;
    const LogedUser = req.LogedUser;
    if (FileInfo && LogedUser) {
      // Authorize against the STORED row, and hand BaseDownloadFile that row
      // rather than the client's - the client does not get to pick the path.
      const Stored = await MayDownload({ FileInfo, LogedUser });
      if (!Stored) {
        console.log(
          '[BaseController/downloadFile] DENIED',
          LogedUser.Id,
          FileInfo.generated_name
        );
        return res.status(403).send(
          JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Энэ файлд хандах эрхгүй байна'))
        );
      }
      const downloadFile = await BaseControllerHelper.BaseDownloadFile(Stored);
      if (downloadFile) {
        res.set('Content-Type', downloadFile.ContentType);
        return res.download(downloadFile.Path);
      } else {
        // The row exists but the bytes do not - the usual cause is a database
        // restored onto a host that never received ALLFILE_DIR. Say it in
        // Mongolian: this text is what the doctor reads in the alert.
        return res.status(404).send(
          JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Файл серверт олдсонгүй'))
        );
      }
    } else {
      return res.status(400).send(
        JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Information is missing'))
      );
    }
  } catch (ex) {
    console.error('downloadFile error:', ex);
    return res.status(500).send(
      JSON.stringify(BaseControllerHelper.GetDefaultErrorResult(ex.message || 'Download failed'))
    );
  }
}

async function deleteFile(req, res) {
  try {
    var result = { Success: true, Message: 'Successfully deleted', Data: {} };
    const FileId = req.body.FileId;
    const LogedUser = req.LogedUser;

    if (FileId && LogedUser) {
      await BaseControllerHelper.BaseUpdate({
        ObjectName: 'File',
        Data: {
          id_data: FileId,
          rec_status: '2',
        },
        LogedUser,
        SaveLog: true,
      });
      return res.send(JSON.stringify(result));
    } else {
      return res.status(400).send(
        JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Information is missing'))
      );
    }
  } catch (ex) {
    console.error('deleteFile error:', ex);
    return res.status(500).send(
      JSON.stringify(BaseControllerHelper.GetDefaultErrorResult(ex.message || 'Delete failed'))
    );
  }
}
//#endregion

async function getData(req, res) {
  var result = { Success: true, Message: '', Data: null };
  try {
    const ModelConfig = await BaseControllerHelper.GetConfigData(req.body.ObjectName);
    if (ModelConfig) {
      const data = {
        Fields: ModelConfig.Fields,
        NewObject: ModelConfig.NewObject,
        TitleObject: ModelConfig.TitleObject,
        PK: ModelConfig.PK,
        AttachFiles: ModelConfig.AttachFiles,
      };

      result.Data = data;
      return res.send(JSON.stringify(result));
    } else {
      return res.send(
        JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Object Name NULL'))
      );
    }
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

// #region Export Excel
async function ExportExcel(req, res) {
  try {
    const ObjectName = req.body.ObjectName;
    const LogedUser = req.LogedUser;

    if (ObjectName && LogedUser) {
      // SearchOption
      var { SearchText, WhereType, FindType, SearchField, OrderByType, OrderByField } = req.body;

      var Option = {
        SearchText,
        limit: 0,
        offset: 0,
        SearchField,
        FindType,
        WhereType,
      };
      if (OrderByField && OrderByType) Option.OrderBy = { OrderByField, OrderByType };

      const { filePath, Message } = await BaseControllerHelper.ExportExcel({
        ObjectName,
        LogedUser,
        Option,
      });

      if (filePath && filePath !== null) {
        res.set(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        // Each export now writes its own file, so remove it once it has been
        // sent rather than letting outputExcel/ grow without limit.
        return res.download(filePath, (err) => {
          err && console.log('ExportExcel download error:', err.message);
          fs.unlink(path.resolve(filePath), () => {});
        });
      } else {
        return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult(Message)));
      }
    } else {
      return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
    }
  } catch (ex) {
    console.error(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

/**
 * The same export as tab-separated text. The upgrade tender asks for the list
 * in .xlsx AND .txt (§103), and both go through the one BuildExport, so the two
 * files always describe the same rows with the same source marking.
 */
async function ExportText(req, res) {
  try {
    const ObjectName = req.body.ObjectName;
    const LogedUser = req.LogedUser;

    if (!ObjectName || !LogedUser) {
      return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
    }

    const { SearchText, WhereType, FindType, SearchField, OrderByType, OrderByField } = req.body;

    const Option = {
      SearchText,
      limit: 0,
      offset: 0,
      SearchField,
      FindType,
      WhereType,
    };
    if (OrderByField && OrderByType) Option.OrderBy = { OrderByField, OrderByType };

    const { filePath } = await BaseControllerHelper.ExportText({
      ObjectName,
      LogedUser,
      Option,
    });

    if (!filePath) {
      return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
    }

    res.set('Content-Type', 'text/plain; charset=utf-8');
    return res.download(filePath, (err) => {
      err && console.log('ExportText download error:', err.message);
      fs.unlink(path.resolve(filePath), () => {});
    });
  } catch (ex) {
    console.error(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

// #endregion

module.exports = router;
