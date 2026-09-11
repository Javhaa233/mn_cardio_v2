const express = require('express');
const { format, addDays } = require('date-fns');
const router = express.Router();

const { Models, sequelize, Op } = require('../../config/DB');

const BaseControllerHelper = require('../../helper/BaseControllerHelper');
const ModelHelper = require('../../helper/ModelHelper');
const NotificationHelper = require('../../helper/NotificationHelper');
const ObjectHelper = require('../../helper/ObjectHelper');
const { BuildAdviceScope, GetLogedOrganization } = require('../../helper/AdviceScopeHelper');

// routes
router.post('/GetList', GetList);
router.post('/GetListCity', GetListCity);
router.post('/GetListSoum', GetListSoum);
router.post('/GetComments', GetComments);
router.post('/CustomSave', CustomSave);
router.post('/CheckByPatient', CheckByPatient);
router.post('/SaveAdviceCommentRate', SaveAdviceCommentRate);
router.post('/GetAdviceCommentPoint', GetAdviceCommentPoint);
router.post('/CreateComment', CreateComment);
router.post('/GetFeed', GetFeed);
router.post('/GetTicket', GetTicket);
router.post('/GetStats', GetStats);
router.post('/CustomSaveAndPublish', CustomSaveAndPublish);

async function GetAdviceCommentPoint(req, res) {
  try {
    var result = { Success: true, Message: '', Data: [] };
    const LogedUser = req.LogedUser;
    if (LogedUser) {
      var [Data, data] = await sequelize.query(
        'EXEC spAdviceCommentPoints @UserId=' + LogedUser.Id + ';'
      );
      result.Data = Data;
      console.log('GetAdviceCommentPoint SUCCESS response:', JSON.stringify(result));
      return res.send(JSON.stringify(result));
    } else {
      const errorResult = BaseControllerHelper.GetDefaultErrorResult('Information is missing');
      console.log('GetAdviceCommentPoint ERROR response (no user):', JSON.stringify(errorResult));
      return res.send(JSON.stringify(errorResult));
    }
  } catch (ex) {
    console.log('GetAdviceCommentPoint EXCEPTION:', ex);
    const errorResult = BaseControllerHelper.GetDefaultErrorResult();
    console.log('GetAdviceCommentPoint ERROR response (exception):', JSON.stringify(errorResult));
    return res.send(JSON.stringify(errorResult));
  }
}

async function SaveAdviceCommentRate(req, res) {
  try {
    var result = { Success: true, Message: 'Successfully saved', Data: [] };
    const Data = JSON.parse(req.body.Data);
    const LogedUser = req.LogedUser;
    if (LogedUser && Data && Data.AdviceCommentId) {
      //create
      var AdviceCommentId = Data.AdviceCommentId;
      var AdviceCommentRate = await Models.AdviceCommentRate.findOne({
        where: { AdviceCommentId },
      });
      AdviceCommentRate = JSON.parse(JSON.stringify(AdviceCommentRate));
      if (AdviceCommentRate) {
        //update
        AdviceCommentRate.Point = Data.Point;
        AdviceCommentRate.save();
      } else {
        //create
        await Models.AdviceCommentRate.create({
          ...Data,
          UserId: LogedUser.Id,
          CreateDate: ObjectHelper.getDateYMDHMS(),
        });
      }
      console.log(
        '[AdviceController/SaveAdviceCommentRate] SUCCESS Response:',
        JSON.stringify(result)
      );
      return res.send(JSON.stringify(result));
    } else {
      const errorResult = BaseControllerHelper.GetDefaultErrorResult('Information is missing');
      console.log(
        '[AdviceController/SaveAdviceCommentRate] ERROR Response:',
        JSON.stringify(errorResult)
      );
      return res.send(
        JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Information is missing'))
      );
    }
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

async function CheckByPatient(req, res) {
  try {
    var result = { Success: true, Message: '', Data: [], Option: {} };
    const PatientId = req.body.PatientId;
    const LogedUser = req.LogedUser;
    if (PatientId && LogedUser) {
      const { Check, Text } = await SetExamAdvice(PatientId);
      result.Data = { CheckData: Check, Text };
      console.log('[AdviceController/CheckByPatient] SUCCESS Response:', JSON.stringify(result));
      return res.send(JSON.stringify(result));
    } else {
      const errorResult = BaseControllerHelper.GetDefaultErrorResult('Information is missing');
      console.log('[AdviceController/CheckByPatient] ERROR Response:', JSON.stringify(errorResult));
      return res.send(JSON.stringify(errorResult));
    }
  } catch (ex) {
    console.log(ex);
    const errorResult = BaseControllerHelper.GetDefaultErrorResult();
    console.log(
      '[AdviceController/CheckByPatient] EXCEPTION Response:',
      JSON.stringify(errorResult)
    );
    return res.send(JSON.stringify(errorResult));
  }
}

async function SetExamAdvice(PatientId) {
  var Check = true;
  var Text = '';
  if (PatientId) {
    const Count = await Models.DoctorsTeamPatient.count({
      where: {
        patient_id: PatientId,
        rec_status: { [Op.ne]: '2' },
      },
    });

    if (Count > 0) {
      Check = true;
    } else {
      Check = false;
      Text = 'Иргэн эмчийн багт харьяалагдаагүй байна';
    }
  }
  return { Check, Text };
}

async function CustomSave(req, res) {
  try {
    var result = { Success: true, Message: 'Successfully saved', Data: [] };
    const Data = JSON.parse(req.body.Data);
    const LogedUser = req.LogedUser;

    if (LogedUser && Data) {
      //create
      if (!Data.id_data) {
        if (Data.adv_id_patient) {
          if (!Data.ticket_type && Data.ticket_type !== '-1') {
            const errorResult = BaseControllerHelper.GetDefaultErrorResult('Хэлбэрээ сонгоно уу');
            console.log(
              '[AdviceController/CustomSave] ERROR Response:',
              JSON.stringify(errorResult)
            );
            return res.send(errorResult);
          }

          const CheckPatient = await SetExamAdvice(Data.adv_id_patient);
          if (CheckPatient.Check === true) {
            if (!Data.adv_ticket_closed) {
              Data.adv_ticket_closed = '3';
            }
            const Doctor = await Models.DoctorsProfile.findOne({
              where: { id: LogedUser.Id },
              raw: true,
            });
            if (Doctor) {
              const Organization = await Models.Organization.findOne({
                where: { Id: Doctor.OrganizationId },
                raw: true,
              });
              if (Organization) {
                const OrgLevel = Organization ? Organization.level : null;
                const { addr_prov_city, addr_soum_dist, addr_bag_khoroo } = Organization;
                if (OrgLevel) {
                  // BaseCreate returns the new PK. It used to be discarded, so a
                  // caller had no way to attach files to the row it had just
                  // created (File.LinkedObjectId is that id) or to render the
                  // new record without a full refetch. CreateComment already
                  // returns { DataId }; this matches it. Update branch below is
                  // unchanged and still answers with Data: [].
                  const DataId = await BaseControllerHelper.BaseCreate({
                    ObjectName: 'Advice',
                    Data: {
                      ...Data,
                      level: OrgLevel,
                      addr_prov_city,
                      addr_soum_dist,
                      addr_bag_khoroo,
                    },
                    LogedUser,
                    SaveLog: true,
                  });
                  result.Data = { DataId };
                } else {
                  const errorResult = BaseControllerHelper.GetDefaultErrorResult(
                    'Эмчийн харьяалагдах байгууллагын түвшин тодорхойгүй байна'
                  );
                  console.log(
                    '[AdviceController/CustomSave] ERROR Response:',
                    JSON.stringify(errorResult)
                  );
                  return res.send(errorResult);
                }
              } else {
                return res.send(
                  BaseControllerHelper.GetDefaultErrorResult('Эмч байгууллагад харьяалалгүй байна')
                );
              }
            } else {
              const errorResult = BaseControllerHelper.GetDefaultErrorResult(
                'Эмчийн мэдээлэл олдсонгүй'
              );
              console.log(
                '[AdviceController/CustomSave] ERROR Response:',
                JSON.stringify(errorResult)
              );
              return res.send(errorResult);
            }
            // if (Organization) {
            //   const OrgLevel = Organization ? Organization.level : null;
            //   if (OrgLevel) {
            //     await BaseControllerHelper.BaseCreate({
            //       ObjectName: "Advice",
            //       Data: {
            //         ...Data,
            //         level: OrgLevel,
            //         addr_prov_city,
            //         addr_soum_dist,
            //         addr_bag_khoroo,
            //       },
            //      LogedUser,
            //       SaveLog: true,
            //     });
            //   } else {
            //     return res.send(
            //       BaseControllerHelper.GetDefaultErrorResult(
            //         "Эмчийн харьяалагдах байгууллагын түвшин тодорхойгүй байна"
            //       )
            //     );
            //   }
            // } else {
            //   return res.send(
            //     BaseControllerHelper.GetDefaultErrorResult(
            //       "Эмч байгууллагад харьяалалгүй байна"
            //     )
            //   );
            // }
          } else {
            const errorResult = BaseControllerHelper.GetDefaultErrorResult(
              "Иргэн дээр идэвхитэй 'Асуумж' бүртгэгдсэн байна"
            );
            console.log(
              '[AdviceController/CustomSave] ERROR Response:',
              JSON.stringify(errorResult)
            );
            return res.send(errorResult);
          }
        } else {
          return res.send(BaseControllerHelper.GetDefaultErrorResult('Иргэний мэдээлэл олдсонгүй'));
        }
      } else if (Data.id_data) {
        //Update
        await BaseControllerHelper.BaseUpdate({
          ObjectName: 'Advice',
          Data,
          LogedUser,
          SaveLog: true,
        });

        //save notification
        if (Data.adv_ticket_closed === 'n') {
          const Doctor = await Models.DoctorsProfile.findOne({
            where: { id: LogedUser.Id },
            attributes: ['UserId', 'id_data'],
            raw: true,
          });

          const [Doctors, data] = await sequelize.query(
            `EXEC spGetAdviceNotificationUsers @UserId=${Doctor.UserId}`
          );

          for (var s = 0; s < Doctors.length; s++) {
            const NotificationData = {
              Notes: 'Publish new ticket',
              LinkObjectName: 'Advice',
              LinkObjectId: Data.id_data,
              NotesMn: 'Шинэ асуумж нийтэллээ',
              CreateUserId: Doctor.UserId,
              CreateDoctorId: Doctor.id_data,
              Action: 'Publish',
              ToDoctorId: Doctors[s].DoctorId,
              ToUserId: Doctors[s].UserId,
              Url: '/admin/AdviceComment?AdviceId=' + Data.id_data,
              ExpiredDate: format(
                addDays(new Date(ObjectHelper.getDateYMDHMS()), 30),
                'yyyy-MM-dd HH:mm:ss'
              ),
            };
            // insert notifications
            await NotificationHelper.SaveNotification({
              Data: NotificationData,
              LogedUser,
              SendNotification: true,
            });
          }
        }
      }

      console.log('[AdviceController/CustomSave] SUCCESS Response:', JSON.stringify(result));
      return res.send(JSON.stringify(result));
    } else {
      const errorResult = BaseControllerHelper.GetDefaultErrorResult('Information is missing');
      console.log('[AdviceController/CustomSave] ERROR Response:', JSON.stringify(errorResult));
      return res.send(JSON.stringify(errorResult));
    }
  } catch (ex) {
    console.log(ex);
    const errorResult = BaseControllerHelper.GetDefaultErrorResult();
    console.log('[AdviceController/CustomSave] EXCEPTION Response:', JSON.stringify(errorResult));
    return res.send(JSON.stringify(errorResult));
  }
}

async function CreateComment(req, res) {
  try {
    var result = { Success: true, Message: 'Successfully saved', Data: [] };
    const Data = JSON.parse(req.body.Data);
    const LogedUser = req.LogedUser;

    const Advice = await Models.Advice.findByPk(Data.adv_com_id_adv);
    if (LogedUser && Data && Data.adv_com_id_adv && Advice) {
      const Result = await BaseControllerHelper.BaseCreate({
        ObjectName: 'AdviceComment',
        Data,
        LogedUser,
        SaveLog: true,
      });
      result.Data = { DataId: Result };

      //save notification
      if (Advice.adv_ticket_closed === 'n') {
        var Doctor = await Models.DoctorsProfile.findOne({
          where: { id: LogedUser.Id },
          raw: true,
        });

        if (!Doctor) {
          return res.send(
            JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Эмчийн мэдээлэл олдсонгүй'))
          );
        }

        var [Doctors, data] = await sequelize.query(
          `EXEC spGetAdviceCommentNotificationUsers @AdviceId=${Advice.id_data}, @UserId=${LogedUser.Id}`
        );

        for (var s = 0; s < Doctors.length; s++) {
          var NotificationData = {
            Notes: 'Create advice comment',
            LinkObjectName: 'AdviceComment',
            LinkObjectId: Result,
            NotesMn: 'Асуумжинд хариулт бичлээ',
            CreateUserId: Doctor.id,
            CreateDoctorId: Doctor.id_data,
            Action: 'CreateComment',
            ToDoctorId: Doctors[s].DoctorId,
            ToUserId: Doctors[s].UserId,
            Url: '/admin/AdviceComment?AdviceId=' + Advice.id_data,
          };
          await NotificationHelper.SaveNotification({
            Data: NotificationData,
            LogedUser,
            SendNotification: true,
          });
        }
      }

      console.log('[AdviceController/CreateComment] SUCCESS Response:', JSON.stringify(result));
      return res.send(JSON.stringify(result));
    } else {
      const errorResult = BaseControllerHelper.GetDefaultErrorResult('Information is missing');
      console.log('[AdviceController/CreateComment] ERROR Response:', JSON.stringify(errorResult));
      return res.send(JSON.stringify(errorResult));
    }
  } catch (ex) {
    console.log(ex);
    const errorResult = BaseControllerHelper.GetDefaultErrorResult();
    console.log(
      '[AdviceController/CreateComment] EXCEPTION Response:',
      JSON.stringify(errorResult)
    );
    return res.send(JSON.stringify(errorResult));
  }
}

async function GetList(req, res) {
  try {
    var result = { Success: true, Message: '', Data: [], Option: {} };
    const ObjectName = req.body.ObjectName;
    const LogedUser = req.LogedUser;
    const DoctorsProfileConfigData = await BaseControllerHelper.GetConfigData('DoctorsProfile');
    if (ObjectName && LogedUser) {
      var Option = BaseControllerHelper.GetCrudRequestData(req);

      if (Option.SearchField) {
        Option.SearchField.push({
          Field: 'AppId',
          Value: LogedUser.AppId,
          Op: 'Equals',
        });
      }
      const ListData = await BaseControllerHelper.BaseGetList({
        ObjectName,
        LogedUser,
        Option,
      });

      for (var i = 0; i < ListData.Data.length; i++) {
        if (ListData.Data[i].DoctorsProfile) {
          ListData.Data[i].DoctorsProfile = await BaseControllerHelper.BaseSetFiles({
            ConfigData: DoctorsProfileConfigData,
            Data: ListData.Data[i].DoctorsProfile,
            Thumbnail: true,
            Percentage: 40,
          });
        }
      }

      result.Data = ListData.Data;
      result.Option = ListData.Option;
      console.log('[AdviceController/GetList] SUCCESS Response:', JSON.stringify(result));
      return res.send(JSON.stringify(result));
    } else {
      const errorResult = BaseControllerHelper.GetDefaultErrorResult('Information is missing');
      console.log('[AdviceController/GetList] ERROR Response:', JSON.stringify(errorResult));
      return res.send(JSON.stringify(errorResult));
    }
  } catch (ex) {
    console.log(ex);
    const errorResult = BaseControllerHelper.GetDefaultErrorResult();
    console.log('[AdviceController/GetList] EXCEPTION Response:', JSON.stringify(errorResult));
    return res.send(JSON.stringify(errorResult));
  }
}

async function GetListCity(req, res) {
  try {
    var result = { Success: true, Message: '', Data: [], Option: { Total: 0 } };

    const ObjectName = req.body.ObjectName;
    const LogedUser = req.LogedUser;
    const RoleId = LogedUser ? LogedUser.RoleId : null;

    var ModHelper = new ModelHelper(Models.Advice);
    var DoctorsProfileConfigData = await BaseControllerHelper.GetConfigData('DoctorsProfile');

    if (ObjectName && LogedUser) {
      var Option = BaseControllerHelper.GetCrudRequestData(req);
      if (Option.SearchField) {
        Option.SearchField.push({
          Field: 'AppId',
          Value: LogedUser.AppId,
          Op: 'Equals',
        });
      }
      var { FindOption } = await ModHelper.GetFindOption(Option);
      const Doctor = await Models.DoctorsProfile.findOne({
        where: { id: LogedUser.Id },
        raw: true,
      });
      if (Doctor) {
        let Organization = null;
        let Organizations = await Models.Organization.findAllNew({
          where: { Id: Doctor.OrganizationId },
        });
        Organizations = JSON.parse(JSON.stringify(Organizations));
        if (Organizations.length === 1) {
          Organization = Organizations[0];
          const IsCity =
            Organization && Organization.DictProvinceCity
              ? Organization.DictProvinceCity.is_city === 'y'
                ? true
                : false
              : false;

          if (RoleId + '' !== '1') {
            if (Organization.level === '1') {
              FindOption.where = { ...FindOption.where, id_data: '-1' };
            }

            if (Organization.level === '2' || Organization.level === '3') {
              FindOption.where = {
                ...FindOption.where,
                level: { [Op.in]: ['2', '3'] },
              };
            }
          } else {
            FindOption.where = {
              ...FindOption.where,
              level: { [Op.in]: ['2', '3'] },
            };
          }

          var ListData = await ModHelper.FindAllExec(Option, FindOption);
          ListData = JSON.parse(JSON.stringify(ListData));
          if (ListData && ListData.Data && ListData.Data.length > 0) {
            for (var i = 0; i < ListData.Data.length; i++) {
              if (ListData.Data[i].DoctorsProfile) {
                ListData.Data[i].DoctorsProfile = await BaseControllerHelper.BaseSetFiles({
                  ConfigData: DoctorsProfileConfigData,
                  Data: ListData.Data[i].DoctorsProfile,
                  Thumbnail: true,
                  Percentage: 40,
                });
              }
            }
          }
          result.Data = ListData ? ListData.Data : [];
          result.Option = { Total: ListData ? ListData.Total : 0 };
          console.log('[AdviceController/GetListCity] SUCCESS Response:', JSON.stringify(result));
          return res.send(JSON.stringify(result));
        } else {
          const errorResult = BaseControllerHelper.GetDefaultErrorResult(
            'Organization information not found'
          );
          console.log(
            '[AdviceController/GetListCity] ERROR Response:',
            JSON.stringify(errorResult)
          );
          return res.send(JSON.stringify(errorResult));
        }
      } else {
        const errorResult = BaseControllerHelper.GetDefaultErrorResult(
          'No doctor information found for the logged in user'
        );
        console.log('[AdviceController/GetListCity] ERROR Response:', JSON.stringify(errorResult));
        return res.send(JSON.stringify(errorResult));
      }
    } else {
      const errorResult = BaseControllerHelper.GetDefaultErrorResult('Information is missing');
      console.log('[AdviceController/GetListCity] ERROR Response:', JSON.stringify(errorResult));
      return res.send(JSON.stringify(errorResult));
    }
  } catch (ex) {
    console.log(ex);
    const errorResult = BaseControllerHelper.GetDefaultErrorResult();
    console.log('[AdviceController/GetListCity] EXCEPTION Response:', JSON.stringify(errorResult));
    return res.send(JSON.stringify(errorResult));
  }
}

async function GetListSoum(req, res) {
  try {
    var result = { Success: true, Message: '', Data: [], Option: { Total: 0 } };

    const ObjectName = req.body.ObjectName;
    const LogedUser = req.LogedUser;
    const RoleId = LogedUser ? LogedUser.RoleId : null;

    var ModHelper = new ModelHelper(Models.Advice);
    var DoctorsProfileConfigData = await BaseControllerHelper.GetConfigData('DoctorsProfile');

    if (ObjectName && LogedUser) {
      var Option = BaseControllerHelper.GetCrudRequestData(req);
      if (Option.SearchField) {
        Option.SearchField.push({
          Field: 'AppId',
          Value: LogedUser.AppId,
          Op: 'Equals',
        });
      }
      var { FindOption } = await ModHelper.GetFindOption(Option);
      const Doctor = await Models.DoctorsProfile.findOne({
        where: { id: LogedUser.Id },
        raw: true,
      });
      if (Doctor) {
        let Organization = null;
        let Organizations = await Models.Organization.findAllNew({
          where: { Id: Doctor.OrganizationId },
        });
        Organizations = JSON.parse(JSON.stringify(Organizations));
        if (Organizations.length === 1) {
          Organization = Organizations[0];
          const IsCity =
            Organization && Organization.DictProvinceCity
              ? Organization.DictProvinceCity.is_city === 'y'
                ? true
                : false
              : false;
          if (RoleId + '' !== '1') {
            if (Organization.level === '2') {
              //aimag
              if (IsCity === false) {
                FindOption.where = {
                  ...FindOption.where,
                  addr_prov_city: Organization.addr_prov_city,
                  level: '1',
                };
              } else {
                //dvvreg
                FindOption.where = {
                  ...FindOption.where,
                  addr_soum_dist: Organization.addr_soum_dist,
                  level: '1',
                };
              }
            }

            //sum
            if (Organization.level === '1') {
              if (IsCity === false) {
                FindOption.where = {
                  ...FindOption.where,
                  addr_prov_city: Organization.addr_prov_city,
                  level: '1',
                };
              } else {
                //horoo
                FindOption.where = {
                  ...FindOption.where,
                  addr_soum_dist: Organization.addr_soum_dist,
                  level: '1',
                };
              }
            }
            // 3-r tuwshnii emnelgiin humuus harah bolomjgui
            if (Organization.level === '3') {
              FindOption.where = { ...FindOption.where, id_data: '-1' };
            }
          } else {
            //horoo
            FindOption.where = { ...FindOption.where, level: '1' };
          }
          // Get ListData
          let ListData = await ModHelper.FindAllExec(Option, FindOption);
          ListData = JSON.parse(JSON.stringify(ListData));
          if (ListData && ListData.Data && ListData.Data.length > 0) {
            for (let i = 0; i < ListData.Data.length; i++) {
              if (ListData.Data[i].DoctorsProfile) {
                ListData.Data[i].DoctorsProfile = await BaseControllerHelper.BaseSetFiles({
                  ConfigData: DoctorsProfileConfigData,
                  Data: ListData.Data[i].DoctorsProfile,
                  Thumbnail: true,
                  Percentage: 40,
                });
              }
            }
          }

          result.Data = ListData ? ListData.Data : [];
          result.Option = { Total: ListData ? ListData.Total : 0 };
          console.log('[AdviceController/GetListSoum] SUCCESS Response:', JSON.stringify(result));
          return res.send(JSON.stringify(result));
        } else {
          const errorResult = BaseControllerHelper.GetDefaultErrorResult(
            'Байгууллагын мэдээлэл олдсонгүй'
          );
          console.log(
            '[AdviceController/GetListSoum] ERROR Response:',
            JSON.stringify(errorResult)
          );
          return res.send(JSON.stringify(errorResult));
        }
      } else {
        const errorResult = BaseControllerHelper.GetDefaultErrorResult(
          'Нэвтэрсэн хэрэглэгчтэй холбогдсон эмчийн мэдээлэл олдсонгүй'
        );
        console.log('[AdviceController/GetListSoum] ERROR Response:', JSON.stringify(errorResult));
        return res.send(JSON.stringify(errorResult));
      }
    } else {
      const errorResult = BaseControllerHelper.GetDefaultErrorResult('Information is missing');
      console.log('[AdviceController/GetListSoum] ERROR Response:', JSON.stringify(errorResult));
      return res.send(JSON.stringify(errorResult));
    }
  } catch (ex) {
    console.log(ex);
    const errorResult = BaseControllerHelper.GetDefaultErrorResult();
    console.log('[AdviceController/GetListSoum] EXCEPTION Response:', JSON.stringify(errorResult));
    return res.send(JSON.stringify(errorResult));
  }
}

async function GetComments(req, res) {
  try {
    var result = { Success: true, Message: '', Data: [], Option: {} };

    const { AdviceId } = req.body;
    const AdviceCommentConfigData = await BaseControllerHelper.GetConfigData('AdviceComment');
    const DoctorsProfileConfigData = await BaseControllerHelper.GetConfigData('DoctorsProfile');

    const Advice = await Models.Advice.findByPk(AdviceId);
    const ModHelper = new ModelHelper(Models.AdviceComment);
    if (Advice) {
      let AdviceComments = await Models.AdviceComment.findAllNew({
        where: { adv_com_id_adv: AdviceId, rec_status: { [Op.ne]: '2' } },
      });
      AdviceComments = JSON.parse(JSON.stringify(AdviceComments));
      for (let i = 0; i < AdviceComments.length; i++) {
        let comment = AdviceComments[i];
        await ModHelper.GetInfoData(comment, AdviceCommentConfigData);
        comment = await BaseControllerHelper.BaseSetFiles({
          ConfigData: AdviceCommentConfigData,
          Data: comment,
        });

        if (AdviceComments[i].DoctorsProfile) {
          AdviceComments[i].DoctorsProfile = await BaseControllerHelper.BaseSetFiles({
            ConfigData: DoctorsProfileConfigData,
            Data: AdviceComments[i].DoctorsProfile,
            Thumbnail: true,
            Percentage: 25,
          });
        }
      }

      result.Data = AdviceComments;
    }

    console.log('[AdviceController/GetComments] SUCCESS Response:', JSON.stringify(result));
    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.log(ex);
    const errorResult = BaseControllerHelper.GetDefaultErrorResult();
    console.log('[AdviceController/GetComments] EXCEPTION Response:', JSON.stringify(errorResult));
    return res.send(JSON.stringify(errorResult));
  }
}

//#region Feed

// Feed page weight is dominated by base64 image payload, not by SQL. At 20
// cards these two constants are the whole budget: full-size images would be
// ~164MB per page, 30% thumbnails capped at 4 is ~5.4MB, and this is ~2MB.
// "Photos shown fully" is a layout requirement - uncropped, full card width -
// not a resolution one. The lightbox fetches the original on demand.
const FEED_PHOTO_PERCENTAGE = 20;
const FEED_PHOTO_LIMIT = 3;
const FEED_AVATAR_PERCENTAGE = 25;
const FEED_MAX_PAGE_SIZE = 50;

// How much of a thread the card shows without being opened. Two is enough to
// tell whether a ticket was actually answered and by whom; past that the card
// stops being scannable and the reader should be in the thread itself.
const FEED_COMMENT_LIMIT = 2;
// Reply photos are the expensive part of this payload - they are base64 inline,
// like every other image in the feed - so they are capped hard and thumbnailed
// smaller than the post's own photos, which render at roughly twice the width.
// Worst case per card is 3 replies x 2 photos on top of the post's 3.
const FEED_COMMENT_PHOTO_LIMIT = 2;
const FEED_COMMENT_PHOTO_PERCENTAGE = 15;

// The DETAIL page's budget. A card is a summary, so three photos and a "+N"
// badge is honest there - the reader clicks through for the rest. On the page
// opened to look at those photos it is not: PostMedia computes "+N" from
// FileTotal but Lightbox can only page through the array it was handed, so a
// feed-sized slice would render a badge promising images that cannot be
// reached. The limit therefore has to exceed any realistic attachment count,
// and the thumbnails are larger because they render at roughly twice the width.
const DETAIL_PHOTO_LIMIT = 12;
const DETAIL_PHOTO_PERCENTAGE = 30;

/*
 * BuildAdviceScope and GetLogedOrganization moved to
 * helper/AdviceScopeHelper.js so /BaseObject/downloadFile can authorize an
 * attachment with the very rule that decides who may see the ticket.
 */

/** Which tickets a tab shows. Drafts are the author's own business. */
function BuildTabWhere(Filter, LogedUser) {
  switch (Filter) {
    case 'open':
      return { adv_ticket_closed: 'n' };
    case 'closed':
      return { adv_ticket_closed: 'y' };
    case 'mine':
      return { id: LogedUser.Id, adv_ticket_closed: { [Op.in]: ['n', 'y'] } };
    case 'drafts':
      return { id: LogedUser.Id, adv_ticket_closed: '3' };
    case 'all':
    default:
      // Published and closed only. Drafts ('3') never appear on the shared
      // wall - they are visible to their author under the drafts tab, and the
      // composer says so before saving one.
      return { adv_ticket_closed: { [Op.in]: ['n', 'y'] } };
  }
}

/**
 * The first few replies on each ticket of a page, with their authors.
 *
 * One bounded query for the whole page: ROW_NUMBER beats a correlated subquery
 * per row, and the IN list is at most one page of ids. It runs BEFORE the file
 * query in AttachFeedMedia so the reply ids can join that same query - which is
 * what makes showing reply photos on the card cost zero extra round trips.
 *
 * Ordered oldest-first, not newest-first like a social feed. On a clinical
 * ticket the first reply is the answer; the later ones are follow-up. Showing
 * the newest three would hide exactly the message the reader came for.
 *
 * Failure is not fatal: the feed degrades to counts-only, which is what it
 * showed before this existed.
 */
async function GetFeedPreviewComments(AdviceIds, Take) {
  const Empty = { ByAdvice: new Map(), CommentIds: [], Authors: new Map() };
  // Take <= 0 means the caller renders the real thread and has no use for a
  // preview - the detail page, which loads every reply through GetComments.
  if (!AdviceIds.length || Take <= 0) return Empty;

  try {
    const [CommentRows] = await sequelize.query(
      'SELECT t.id_data, t.adv_com_id_adv, t.adv_com_comment, t.date_creation, t.id FROM (' +
        '  SELECT c.id_data, c.adv_com_id_adv, c.adv_com_comment, c.date_creation, c.id,' +
        '         ROW_NUMBER() OVER (PARTITION BY c.adv_com_id_adv ORDER BY c.id_data ASC) AS rn' +
        '  FROM AdviceComment c' +
        '  WHERE c.adv_com_id_adv IN (:ids) AND c.rec_status <> :deleted' +
        ') t WHERE t.rn <= :take ORDER BY t.adv_com_id_adv ASC, t.id_data ASC',
      { replacements: { ids: AdviceIds, deleted: '2', take: Take } }
    );

    const ByAdvice = new Map();
    const CommentIds = [];
    const UserIds = new Set();

    for (const C of CommentRows) {
      const Key = String(C.adv_com_id_adv);
      if (!ByAdvice.has(Key)) ByAdvice.set(Key, []);
      ByAdvice.get(Key).push({
        Id: C.id_data,
        Text: C.adv_com_comment,
        Date: C.date_creation,
        UserId: C.id,
      });
      CommentIds.push(C.id_data);
      if (C.id) UserIds.add(C.id);
    }

    // Names and avatar ids for whoever wrote them. DoctorsProfile.UserId maps
    // to the DB column 'id', which is the same column AdviceComment.id holds -
    // that shared spelling is the join, and it is the reason this cannot be a
    // plain include off the raw query above.
    let Authors = new Map();
    if (UserIds.size) {
      const Profiles = await Models.DoctorsProfile.findAll({
        where: { UserId: { [Op.in]: Array.from(UserIds) } },
        attributes: ['id_data', 'UserId', 'firstname', 'lastname'],
        raw: true,
      });
      Authors = new Map(
        Profiles.map((P) => [
          String(P.UserId),
          {
            ProfileId: P.id_data,
            // Same abbreviation the DoctorsProfile.FullName virtual builds.
            Name: (P.lastname ? P.lastname.substring(0, 1) + '.' : '') + (P.firstname || ''),
          },
        ])
      );
    }

    return { ByAdvice, CommentIds, Authors };
  } catch (ex) {
    console.log('[AdviceController/GetFeedPreviewComments] failed:', ex.message);
    return Empty;
  }
}

/**
 * Attach avatars, photos and engagement counts for a whole page at once.
 *
 * The endpoints this replaces ran one File query per row for avatars alone. At
 * 20 rows with photos that is ~40 round trips plus up to 80 uncached sharp
 * resizes. This is 4 queries flat, whatever the page size, and it goes through
 * the disk-cached thumbnailer.
 */
/*
 * The photo cap must not swallow the documents.
 *
 * The cap used to be applied to the combined attachment list, so a ticket with
 * four attachments - three films and a PDF of the lab results - dropped the PDF
 * from the card entirely, with nothing to click and no "+N" to hint at it. The
 * limit exists to keep base64 thumbnails off the wire; a document carries no
 * thumbnail at all, so capping it saves nothing.
 *
 * The extension list mirrors frontend mediaUtils.js IMAGE_EXTENSIONS - the two
 * ends must agree on what a photo is or the grid and the chip row disagree.
 */
const IMAGE_ROW_EXT = [
  'jpg',
  'jpeg',
  'png',
  'gif',
  'bmp',
  'webp',
  'svg',
  'ico',
  'tiff',
  'tif',
];
const IsImageRow = (F) => IMAGE_ROW_EXT.includes(String((F && F.ext) || '').toLowerCase());
const CapPhotos = (Files, PhotoLimit) =>
  Files.filter(IsImageRow)
    .slice(0, PhotoLimit)
    .concat(Files.filter((F) => !IsImageRow(F)));

async function AttachFeedMedia(Rows, Options) {
  // Defaulted so every existing caller - GetFeed - is byte-for-byte unchanged.
  const {
    PhotoLimit = FEED_PHOTO_LIMIT,
    PhotoPercentage = FEED_PHOTO_PERCENTAGE,
    CommentLimit = FEED_COMMENT_LIMIT,
  } = Options || {};

  if (!Rows.length) return Rows;

  const AdviceIds = Rows.map((r) => r.id_data);
  const DoctorIds = Rows.filter((r) => r.DoctorsProfile).map((r) => r.DoctorsProfile.id_data);

  // Deliberately first: the reply ids and reply-author profile ids it returns
  // are folded into the one file query below rather than fetched after it.
  const Preview = await GetFeedPreviewComments(AdviceIds, CommentLimit);
  const PreviewAuthorIds = Array.from(Preview.Authors.values()).map((a) => a.ProfileId);

  const AllFiles = await Models.File.findAll({
    where: {
      LinkedObjectName: { [Op.in]: ['Advice', 'DoctorsProfile', 'AdviceComment'] },
      LinkedObjectId: {
        [Op.in]: AdviceIds.concat(DoctorIds).concat(PreviewAuthorIds).concat(Preview.CommentIds),
      },
      FieldName: 'Files',
      rec_status: { [Op.in]: ['9', '1'] },
    },
    attributes: [
      'id_data',
      'id',
      'ext',
      'hash',
      'original_name',
      'generated_name',
      'size',
      'LinkedObjectName',
      'LinkedObjectId',
      'FieldName',
    ],
    raw: true,
  });

  // LinkedObjectId is a shared numeric space across object names - advice 88
  // and doctor 88 are different things - so always key on both.
  const ByKey = new Map();
  for (const F of AllFiles) {
    const Key = F.LinkedObjectName + ':' + F.LinkedObjectId;
    if (!ByKey.has(Key)) ByKey.set(Key, []);
    ByKey.get(Key).push(F);
  }

  const CommentCounts = await Models.AdviceComment.findAll({
    attributes: ['adv_com_id_adv', [sequelize.fn('COUNT', sequelize.col('id_data')), 'Cnt']],
    where: { adv_com_id_adv: { [Op.in]: AdviceIds }, rec_status: { [Op.ne]: '2' } },
    group: ['adv_com_id_adv'],
    raw: true,
  });
  const CommentBy = new Map(CommentCounts.map((c) => [String(c.adv_com_id_adv), Number(c.Cnt)]));

  let ViewBy = new Map();
  try {
    const Views = await Models.vwAdviceViews.findAll({
      where: { AdviceId: { [Op.in]: AdviceIds } },
      raw: true,
    });
    ViewBy = new Map(Views.map((v) => [String(v.AdviceId), Number(v.ViewQty) || 0]));
  } catch (ex) {
    // A view that cannot be filtered is not worth failing the page over.
    console.log('[AdviceController/AttachFeedMedia] vwAdviceViews failed:', ex.message);
  }

  // One doctor answers many tickets on a page, so the same avatar would
  // otherwise be re-read off the thumbnail cache once per appearance. Memoised
  // per page, not globally: this must not outlive the request.
  const AvatarCache = new Map();
  const AvatarFor = async (ProfileId) => {
    if (!ProfileId) return null;
    const Key = String(ProfileId);
    if (AvatarCache.has(Key)) return AvatarCache.get(Key);
    const Files = ByKey.get('DoctorsProfile:' + ProfileId) || [];
    const Built = Files.length
      ? await BaseControllerHelper.GetFileSrcThumbnailCached(
          Files.slice(0, 1),
          FEED_AVATAR_PERCENTAGE
        )
      : [];
    const Src = Built[0] && Built[0].FileSrc ? Built[0].FileSrc : null;
    AvatarCache.set(Key, Src);
    return Src;
  };

  for (const Row of Rows) {
    if (Row.DoctorsProfile) {
      const Avatars = ByKey.get('DoctorsProfile:' + Row.DoctorsProfile.id_data) || [];
      Row.DoctorsProfile.Files = Avatars.length
        ? await BaseControllerHelper.GetFileSrcThumbnailCached(
            Avatars.slice(0, 1),
            FEED_AVATAR_PERCENTAGE
          )
        : [];
    }

    const Attachments = ByKey.get('Advice:' + Row.id_data) || [];
    const Capped = CapPhotos(Attachments, PhotoLimit);
    // The "+N" badge counts photos, because paging is what it offers.
    Row.FileTotal = Attachments.filter(IsImageRow).length;
    Row.Files = Capped.length
      ? await BaseControllerHelper.GetFileSrcThumbnailCached(Capped, PhotoPercentage)
      : [];

    Row.CommentQty = CommentBy.get(String(Row.id_data)) || 0;
    Row.ViewQty = ViewBy.get(String(Row.id_data)) || 0;

    // The replies the card shows inline, each with its own attachments, so a
    // photo posted in an ANSWER is visible without opening the ticket. That is
    // the common shape here: the question is text, the answer is an image.
    const PreviewRows = Preview.ByAdvice.get(String(Row.id_data)) || [];
    Row.Comments = [];
    for (const C of PreviewRows) {
      const Author = Preview.Authors.get(String(C.UserId)) || null;
      const CommentFiles = ByKey.get('AdviceComment:' + C.Id) || [];
      Row.Comments.push({
        Id: C.Id,
        Text: C.Text,
        Date: C.Date,
        AuthorName: Author ? Author.Name : '',
        AvatarSrc: Author ? await AvatarFor(Author.ProfileId) : null,
        FileTotal: CommentFiles.filter(IsImageRow).length,
        Files: CommentFiles.length
          ? await BaseControllerHelper.GetFileSrcThumbnailCached(
              CapPhotos(CommentFiles, FEED_COMMENT_PHOTO_LIMIT),
              FEED_COMMENT_PHOTO_PERCENTAGE
            )
          : [],
      });
    }
  }

  return Rows;
}

async function GetFeed(req, res) {
  try {
    var result = { Success: true, Message: '', Data: [], Option: {} };
    const LogedUser = req.LogedUser;
    if (!LogedUser) {
      return res.send(
        JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Information is missing'))
      );
    }

    const PageNumber = Number(req.body.PageNumber) || 0;
    // Unclamped this is a base64 amplification DoS against the app's home page.
    const PageSize = Math.min(Number(req.body.PageSize) || 20, FEED_MAX_PAGE_SIZE);
    const Filter = req.body.Filter || 'all';
    const Search = req.body.Search ? String(req.body.Search).trim() : '';

    const { Organization } = await GetLogedOrganization(LogedUser);
    const Scope = BuildAdviceScope({ LogedUser, Organization });
    const TabWhere = BuildTabWhere(Filter, LogedUser);

    const Extra = [];
    // Body only, and its own parameter. The generic SearchText ORs a LIKE
    // across every SearchField including four INTEGER columns, which on MSSQL
    // forces an implicit conversion per row and guarantees a full scan.
    if (Search.length >= 2) Extra.push({ Body: { [Op.like]: '%' + Search + '%' } });
    if (req.body.TicketType) Extra.push({ ticket_type: req.body.TicketType });
    if (req.body.ProvCity) Extra.push({ addr_prov_city: req.body.ProvCity });
    if (req.body.SoumDist) Extra.push({ addr_soum_dist: req.body.SoumDist });

    // Nest with Op.and rather than spreading: the level-2 scope owns a
    // top-level Op.or key, and a second one in the same object literal would
    // silently overwrite it - which would widen the security scope, not narrow
    // it, so this is not a style preference.
    const Where = { [Op.and]: [Scope, TabWhere].concat(Extra) };

    const [Rows, Total] = await Promise.all([
      Models.Advice.findAllFeed({
        where: Where,
        // NOT date_creation: ModelHelper writes it date-only, so it ties across
        // an entire day, and MSSQL OFFSET/FETCH over a tied sort silently
        // duplicates and drops rows between pages. id_data is stable and
        // chronologically equivalent.
        order: [['id_data', 'DESC']],
        limit: PageSize,
        offset: PageNumber * PageSize,
      }),
      Models.Advice.count({ where: Where }),
    ]);

    let Data = JSON.parse(JSON.stringify(Rows));
    Data = await AttachFeedMedia(Data);
    Data.forEach((d) => {
      d.IsMine = String(d.id) === String(LogedUser.Id);
    });

    result.Data = Data;
    result.Option = {
      Total,
      PageNumber,
      PageSize,
      HasMore: (PageNumber + 1) * PageSize < Total,
    };
    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

/**
 * One ticket, enriched exactly the way a feed card is.
 *
 * The detail page used to fetch this through the generic GetList - a PAGED
 * SEARCH with an equality filter on the primary key - and GetList attaches
 * files only to DoctorsProfile. So a ticket posted with an X-ray showed the
 * X-ray on the feed card and nothing at all on the page you open to read it.
 *
 * Rather than teaching GetList about files (it is shared by five other screens
 * and would grow a base64 payload for all of them), this runs the SAME pair the
 * feed runs - findAllFeed for the includes, then AttachFeedMedia - so the card
 * and the detail page can never disagree about the same ticket, and no new
 * media code exists to drift.
 *
 * Access is deliberately what GetList already allowed: the AppId and the id.
 * BuildAdviceScope is NOT applied to a fetch by id here or anywhere else, which
 * is a real visibility gap - but tightening it would remove access somebody may
 * rely on today, so it belongs in the security review, not in a UI change.
 */
async function GetTicket(req, res) {
  try {
    var result = { Success: true, Message: '', Data: null, Option: {} };
    const LogedUser = req.LogedUser;
    const AdviceId = Number(req.body.AdviceId);

    if (!LogedUser || !AdviceId) {
      return res.send(
        JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Information is missing'))
      );
    }

    const Rows = await Models.Advice.findAllFeed({
      where: { id_data: AdviceId, AppId: LogedUser.AppId, rec_status: { [Op.ne]: '2' } },
      limit: 1,
    });

    const Data = JSON.parse(JSON.stringify(Rows));
    if (!Data.length) {
      // Not an error envelope: "no such ticket" is an answer, and the page
      // renders its own not-found state from an empty Data.
      return res.send(JSON.stringify(result));
    }

    const [Ticket] = await AttachFeedMedia(Data, {
      PhotoLimit: DETAIL_PHOTO_LIMIT,
      PhotoPercentage: DETAIL_PHOTO_PERCENTAGE,
      // The page loads the whole thread through GetComments, so a preview here
      // would be payload nobody renders.
      CommentLimit: 0,
    });
    Ticket.IsMine = String(Ticket.id) === String(LogedUser.Id);

    result.Data = Ticket;
    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

/**
 * Aggregates for the analytics rail.
 *
 * Scoped with the same BuildAdviceScope as the feed, so "Нийт асуумж" here
 * and Option.Total there are the same number rather than two plausible ones.
 *
 * All bucketing goes through a hardcoded map of sequelize.literal - the
 * granularity string is never interpolated into SQL.
 */
const StatsCache = new Map();
const STATS_TTL_MS = 60 * 1000;

async function GetStats(req, res) {
  try {
    var result = { Success: true, Message: '', Data: {}, Option: {} };
    const LogedUser = req.LogedUser;
    if (!LogedUser) {
      return res.send(
        JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Information is missing'))
      );
    }

    const DateRe = /^\d{4}-\d{2}-\d{2}$/;
    const EndDate = DateRe.test(req.body.EndDate)
      ? req.body.EndDate
      : format(new Date(), 'yyyy-MM-dd');
    const StartDate = DateRe.test(req.body.StartDate)
      ? req.body.StartDate
      : format(addDays(new Date(), -90), 'yyyy-MM-dd');
    const Granularity = ['day', 'week', 'month'].includes(req.body.Granularity)
      ? req.body.Granularity
      : 'day';

    const CacheKey = [LogedUser.Id, StartDate, EndDate, Granularity].join('|');
    const Hit = StatsCache.get(CacheKey);
    if (Hit && Date.now() - Hit.At < STATS_TTL_MS) {
      return res.send(JSON.stringify(Hit.Payload));
    }

    const { Organization } = await GetLogedOrganization(LogedUser);
    const Scope = BuildAdviceScope({ LogedUser, Organization });

    const Buckets = {
      day: sequelize.literal('CONVERT(varchar(10), [Advice].[date_creation], 23)'),
      // Anchored to Monday via DATEDIFF from day 0 (1900-01-01, a Monday) so
      // the answer does not depend on the session's SET DATEFIRST.
      week: sequelize.literal(
        'CONVERT(varchar(10), DATEADD(week, DATEDIFF(week, 0, [Advice].[date_creation]), 0), 23)'
      ),
      month: sequelize.literal('CONVERT(varchar(7), [Advice].[date_creation], 126)'),
    };
    const Bucket = Buckets[Granularity];

    const GroupCount = async (Field) =>
      await Models.Advice.findAll({
        attributes: [Field, [sequelize.fn('COUNT', sequelize.col('id_data')), 'Cnt']],
        where: Scope,
        group: [Field],
        raw: true,
      });

    const [SeriesRows, ByStatusRows, ByTypeRows, ByGeoRows, Options] = await Promise.all([
      Models.Advice.findAll({
        attributes: [
          [Bucket, 'Bucket'],
          [sequelize.fn('COUNT', sequelize.col('Advice.id_data')), 'Cnt'],
        ],
        where: {
          [Op.and]: [
            Scope,
            { date_creation: { [Op.between]: [StartDate, EndDate + ' 23:59:59'] } },
          ],
        },
        group: [Bucket],
        order: [[Bucket, 'ASC']],
        raw: true,
      }),
      GroupCount('adv_ticket_closed'),
      GroupCount('ticket_type'),
      GroupCount('addr_prov_city'),
      Models.OptionTypes.findAll({
        where: { dico: { [Op.in]: ['ticket_status', 'ticket_type'] } },
        raw: true,
      }),
    ]);

    const LabelFor = (dico, value) => {
      const Row = Options.find((o) => o.dico === dico && String(o.value) === String(value));
      return Row ? Row.label : String(value);
    };

    // Zero-fill: a trend line that skips empty buckets misreports the trend.
    const Counted = new Map(SeriesRows.map((r) => [String(r.Bucket), Number(r.Cnt)]));
    const labels = [];
    const values = [];
    const Step = Granularity === 'month' ? 30 : Granularity === 'week' ? 7 : 1;
    for (let d = new Date(StartDate); d <= new Date(EndDate); d = addDays(d, Step)) {
      const Key = Granularity === 'month' ? format(d, 'yyyy-MM') : format(d, 'yyyy-MM-dd');
      if (labels[labels.length - 1] === Key) continue;
      labels.push(Key);
      values.push(Counted.get(Key) || 0);
    }

    const StatusCount = (v) => {
      const Row = ByStatusRows.find((r) => String(r.adv_ticket_closed) === v);
      return Row ? Number(Row.Cnt) : 0;
    };
    const Total = ByStatusRows.reduce((a, r) => a + Number(r.Cnt), 0);
    const Comments = ByGeoRows.length
      ? await Models.AdviceComment.count({ where: { rec_status: { [Op.ne]: '2' } } })
      : 0;

    const Payload = {
      Success: true,
      Message: '',
      Data: {
        Kpi: {
          Total,
          Open: StatusCount('n'),
          Closed: StatusCount('y'),
          Draft: StatusCount('3'),
          Comments,
        },
        // Only the three real status codes get their own row. A handful of
        // legacy rows hold junk in this column - the literal string "Invalid
        // date" and one stray datetime - and surfacing those verbatim would
        // put obvious corruption on the doctor's home screen. They are counted
        // under "Бусад" rather than hidden, so the total still reconciles and
        // the data problem stays visible to whoever cleans it up.
        ByStatus: (() => {
          const Known = ['n', 'y', '3'];
          const Rows = ByStatusRows.filter((r) => Known.includes(r.adv_ticket_closed)).map((r) => ({
            Key: r.adv_ticket_closed,
            Label: LabelFor('ticket_status', r.adv_ticket_closed),
            Count: Number(r.Cnt),
          }));
          const OtherCount = ByStatusRows.filter(
            (r) => !Known.includes(r.adv_ticket_closed)
          ).reduce((a, r) => a + Number(r.Cnt), 0);
          if (OtherCount > 0) {
            Rows.push({ Key: 'other', Label: 'Бусад', Count: OtherCount });
          }
          return Rows;
        })(),
        // Tickets predating the ticket_type field have a null here. Grouping
        // them under one honest label beats a chart row captioned "null".
        ByType: ByTypeRows.map((r) => ({
          Key: r.ticket_type === null ? 'unset' : r.ticket_type,
          Label:
            r.ticket_type === null || r.ticket_type === ''
              ? 'Хэлбэр заагаагүй'
              : LabelFor('ticket_type', r.ticket_type),
          Count: Number(r.Cnt),
        })),
        ByGeo: ByGeoRows.map((r) => ({
          Id: r.addr_prov_city,
          Count: Number(r.Cnt),
        }))
          .sort((a, b) => b.Count - a.Count)
          .slice(0, 8),
        Series: { labels, series: [values] },
      },
      Option: { StartDate, EndDate, Granularity },
    };

    StatsCache.set(CacheKey, { At: Date.now(), Payload });
    return res.send(JSON.stringify(Payload));
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

/**
 * Create a ticket and publish it in one action.
 *
 * A separate route rather than a flag on CustomSave, whose create path is six
 * levels of nesting with commented-out code in the middle - a seventh branch
 * there is how the existing ticket editor breaks. And not two client calls,
 * because those are not atomic: a failure between them strands a draft the
 * author never sees on the wall and cannot tell is stuck.
 */
async function CustomSaveAndPublish(req, res) {
  try {
    var result = { Success: true, Message: 'Successfully saved', Data: [] };
    const LogedUser = req.LogedUser;
    const Data = req.body.Data ? JSON.parse(req.body.Data) : null;

    if (!LogedUser || !Data) {
      return res.send(
        JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Information is missing'))
      );
    }

    if (!Data.adv_id_patient) {
      return res.send(
        JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Иргэний мэдээлэл олдсонгүй'))
      );
    }
    if (!Data.ticket_type || Data.ticket_type === '-1') {
      return res.send(
        JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Хэлбэрээ сонгоно уу?'))
      );
    }

    const CheckPatient = await SetExamAdvice(Data.adv_id_patient);
    if (CheckPatient.Check !== true) {
      return res.send(
        JSON.stringify(
          BaseControllerHelper.GetDefaultErrorResult(
            "Иргэн дээр идэвхитэй 'Асуумж' бүртгэгдсэн байна"
          )
        )
      );
    }

    const { Doctor, Organization } = await GetLogedOrganization(LogedUser);
    if (!Doctor) {
      return res.send(
        JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Эмчийн мэдээлэл олдсонгүй'))
      );
    }
    if (!Organization) {
      return res.send(
        JSON.stringify(
          BaseControllerHelper.GetDefaultErrorResult('Эмч байгууллагад харьяалалгүй байна')
        )
      );
    }
    if (!Organization.level) {
      return res.send(
        JSON.stringify(
          BaseControllerHelper.GetDefaultErrorResult(
            'Эмчийн харьяалагдах байгууллагын түвшин тодорхойгүй байна'
          )
        )
      );
    }

    const DataId = await BaseControllerHelper.BaseCreate({
      ObjectName: 'Advice',
      Data: {
        adv_id_patient: Data.adv_id_patient,
        ticket_type: Data.ticket_type,
        Body: Data.Body,
        // Forced server-side, and id_data is deliberately never read from the
        // request: the composer must not be able to publish over someone
        // else's ticket by posting an id.
        adv_ticket_closed: 'n',
        level: Organization.level,
        addr_prov_city: Organization.addr_prov_city,
        addr_soum_dist: Organization.addr_soum_dist,
        addr_bag_khoroo: Organization.addr_bag_khoroo,
      },
      LogedUser,
      SaveLog: true,
    });

    // The ticket is live at this point. A notification failure must not be
    // reported to the author as "save failed" when it plainly did not fail.
    try {
      const [Doctors] = await sequelize.query(
        'EXEC spGetAdviceNotificationUsers @UserId = :UserId',
        { replacements: { UserId: Doctor.UserId || LogedUser.Id } }
      );
      for (let s = 0; s < Doctors.length; s++) {
        await NotificationHelper.SaveNotification({
          Data: {
            Notes: 'Publish new ticket',
            LinkObjectName: 'Advice',
            LinkObjectId: DataId,
            NotesMn: 'Шинэ асуумж нийтэллээ',
            CreateUserId: Doctor.UserId || LogedUser.Id,
            CreateDoctorId: Doctor.id_data,
            Action: 'Publish',
            ToDoctorId: Doctors[s].DoctorId,
            ToUserId: Doctors[s].UserId,
            Url: '/admin/AdviceComment?AdviceId=' + DataId,
            ExpiredDate: format(
              addDays(new Date(ObjectHelper.getDateYMDHMS()), 30),
              'yyyy-MM-dd HH:mm:ss'
            ),
          },
          LogedUser,
          SendNotification: true,
        });
      }
    } catch (nex) {
      console.log('[AdviceController/CustomSaveAndPublish] notification fan-out failed:', nex);
    }

    result.Data = { DataId };
    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

//#endregion

module.exports = router;
