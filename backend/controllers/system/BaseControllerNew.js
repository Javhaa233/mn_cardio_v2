const express = require('express');
const formidable = require('formidable');
const fs = require('fs');
const { promises: fsPromises } = require('fs');
const path = require('path');
const router = express.Router();

const { Models, sequelize, Op } = require('../../config/DB');

const BaseControllerHelper = require('../../helper/BaseControllerHelper');
const ModelHelper = require('../../helper/ModelHelper');
const BaseHelper = require('../../helper/BaseHelper');
const ImageHelper = require('../../helper/ImageHelper');

//list
router.route('/:ObjectName').get(getList).post(create).put(update).delete(destroy);

router.route('/:ObjectName/getListInfo').get(getListInfo);

//detail
router.route('/:ObjectName/getDetail').get(getDetail);
router.route('/:ObjectName/getData').get(getData);
router.route('/:ObjectName/getDetailInfo').get(getDetailInfo);

async function getList(req, res) {
  try {
    var result = { Success: true, Message: '', Data: [], Option: {} };
    const ObjectName = req.params.ObjectName;
    const LogedUser = req.LogedUser;
    if (ObjectName && LogedUser) {
      var Option = BaseControllerHelper.GetCrudRequestData(req);
      var ListData = await BaseControllerHelper.BaseGetList({
        ObjectName,
        LogedUser,
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

async function getListInfo(req, res) {
  try {
    var result = { Success: true, Message: '', Data: [], Option: {} };
    const ObjectName = req.params.ObjectName;
    const LogedUser = req.LogedUser;
    if (ObjectName && LogedUser) {
      var Option = BaseControllerHelper.GetCrudRequestData(req);
      var ListData = await BaseControllerHelper.BaseGetList({
        ObjectName,
        LogedUser,
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

async function getDetail(req, res) {
  try {
    var result = { Success: true, Message: '', Data: [], Option: {} };
    const ObjectName = req.params.ObjectName;
    const LogedUser = req.LogedUser;
    if (ObjectName && LogedUser) {
      var Option = BaseControllerHelper.GetCrudRequestData(req);
      var DetailData = await BaseControllerHelper.BaseDetail({
        ObjectName,
        LogedUser,
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

//router.post("/", getList);
// router.post("/getListInfo", getListInfo);
//router.post("/getDetail", getDetail);
// router.post("/getDetailInfo", getDetailInfo);

// router.post("/create", create);
// router.post("/update", update);
// router.post("/destroy", destroy);

router.post('/uploadFile', uploadFile);
router.post('/downloadFile', downloadFile);

async function getDetailInfo(req, res) {
  try {
    var result = { Success: true, Message: '', Data: [], Option: {} };
    const ObjectName = req.body.ObjectName;
    const LogedUser = req.LogedUser;
    if (ObjectName && LogedUser) {
      var Option = BaseControllerHelper.GetCrudRequestData(req);
      var DetailData = await BaseControllerHelper.BaseDetailInfo({
        ObjectName,
        LogedUser,
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

async function uploadFile(req, res) {
  try {
    var result = { Success: true, Message: 'Successfully saved', Data: [] };
    const form = new formidable.IncomingForm({
      maxFileSize: 3000 * 1024 * 1024,
      multiples: true,
    });
    const LogedUser = req.LogedUser;
    const ObjectName = 'File';

    if (ObjectName && LogedUser) {
      form.parse(req, async function (err, Fields, Files) {
        var LinkedObjectInfo = JSON.parse(Fields['LinkedObjectInfo']);
        var LinkedObjectId = LinkedObjectInfo.LinkedObjectId;
        var LinkedObjectName = LinkedObjectInfo.LinkedObjectName;
        var FieldName = LinkedObjectInfo.FieldName;

        if (LinkedObjectId && LinkedObjectName) {
          const ListOldFiles = await Models.File.findAll({
            attributes: ['id', 'id_data', 'LinkedObjectName', 'LinkedObjectId', 'FieldName'],
            where: {
              LinkedObjectName: LinkedObjectName,
              LinkedObjectId: LinkedObjectId,
              FieldName: FieldName,
              rec_status: '9',
            },
          });

          var NotDelete = [];
          var FileCount = 0;
          for (var Field in Fields) {
            if (Field !== 'LinkedObjectInfo' && Field.indexOf('Info') > -1) {
              FileCount++;
              var FileInfo = JSON.parse(Fields[Field]);
              //not change file
              if (FileInfo.id_data) {
                if (ListOldFiles.filter((s) => s.id_data === FileInfo.id_data).length === 1) {
                  NotDelete.push(FileInfo.id_data);
                }
              } else {
                //new file
                const key = Field.replace('Info', '');
                let NewFile = Files[key];
                if (Array.isArray(NewFile)) {
                  NewFile = NewFile[0];
                }

                if (NewFile) {
                  const OldPath = NewFile.filepath || NewFile.path;
                  const FileNameOriginal = NewFile.originalFilename || NewFile.name;
                  const FileType = ImageHelper.getType(FileNameOriginal);
                  const FileName = BaseHelper.getDateNumbers() + '_' + LogedUser.Id + '_' + FileCount;
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
      });
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

async function getData(req, res) {
  var result = { Success: true, Message: '', Data: null };
  try {
    var ModelConfig = await BaseControllerHelper.GetConfigData(req.params.ObjectName);

    if (ModelConfig) {
      var data = {
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

async function create(req, res) {
  try {
    var result = { Success: true, Message: 'Successfully saved', Data: {} };
    const ObjectName = req.params.ObjectName;
    const Data = JSON.parse(req.body.Data);
    const LogedUser = req.LogedUser;
    if (ObjectName && Data && LogedUser) {
      var Result = await BaseControllerHelper.BaseCreate({
        ObjectName,
        Data,
        LogedUser,
        SaveLog: true,
      });
      result.Data = { DataId: Result };
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

async function update(req, res) {
  try {
    var result = { Success: true, Message: 'Successfully saved', Data: [] };
    const ObjectName = req.params.ObjectName;
    const Data = JSON.parse(req.body.Data);
    const LogedUser = req.LogedUser;
    if (ObjectName && Data && LogedUser) {
      var Result = await BaseControllerHelper.BaseUpdate({
        ObjectName,
        Data,
        LogedUser,
        SaveLog: true,
      });
      result.Data = { DataId: Result };
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

async function destroy(req, res) {
  try {
    var result = { Success: true, Message: 'Successfully deleted', Data: [] };
    const ObjectName = req.params.ObjectName;
    var Option = req.body.DeleteOption;
    const LogedUser = req.LogedUser;
    if (ObjectName && Option && LogedUser) {
      var Result = await BaseControllerHelper.BaseDelete({
        ObjectName,
        Option,
        LogedUser,
      });
      // Same contract as controllers/system/BaseController.js destroy():
      // null = refused, false = threw, 0 = matched nothing.
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

async function downloadFile(req, res) {
  try {
    const FileInfo = req.body.FileInfo;
    const LogedUser = req.LogedUser;
    if (FileInfo && LogedUser) {
      const downloadFile = await BaseControllerHelper.BaseDownloadFile(FileInfo);
      if (downloadFile) {
        res.set('Content-Type', downloadFile.ContentType);
        return res.download(downloadFile.Path);
      } else {
        return res.status(404).send(
          JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('File not found'))
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

module.exports = router;
