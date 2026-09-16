const express = require('express');
const router = express.Router();

const BaseControllerHelper = require('../../helper/BaseControllerHelper');
const ConfigSheetHelper = require('../../helper/ConfigSheetHelper');

const { Models, sequelize } = require('../../config/DB');

// routes
router.post('/GetLastData', GetLastData);
router.post('/CustomSave', CustomSave);
router.post('/Confirm', Confirm);
router.post('/PrintReport', PrintReport);
router.post('/GetList', GetList);

async function PrintReport(req, res) {
  try {
    const Id = req.body.Id;
    const LogedUser = req.LogedUser;
    if (!LogedUser || !Id) {
      return res.send(
        JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Information is missing'))
      );
    }

    const Sheet = await ConfigSheetHelper.PrintObject({
      res,
      ObjectName: 'CongenitalMalformations',
      Id,
      LogedUser,
    });
    if (!Sheet) {
      return res.send(
        JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Маягтын тохиргоо олдсонгүй'))
      );
    }
    return Sheet;
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

async function GetLastData(req, res) {
  try {
    var result = { Success: true, Message: 'Successfully', Data: {} };
    const LogedUser = req.LogedUser;
    const { PatientRegNo, Category, AppId } = req.body;
    if (LogedUser && PatientRegNo && Category) {
      const [LastData, data] = await sequelize.query(
        'SELECT TOP 1 Id FROM CongenitalMalformations WHERE PatRegNo=:PatientRegNo AND n_category=:Category AND (is_confirm=\'no\' OR is_confirm IS NULL) ORDER BY Id DESC',
        { replacements: { PatientRegNo, Category } }
      );
      if (LastData.length === 1) {
        const DataId = LastData[0].Id;
        if (DataId) {
          const Option = {
            SearchText: '',
            limit: 1,
            offset: 0,
            SearchField: [{ Field: 'Id', Value: DataId, Op: 'Equals' }],
            FindType: 'AllData',
            WhereType: '',
          };
          const DetailData = await BaseControllerHelper.BaseDetailInfo({
            ObjectName: 'CongenitalMalformations',
            LogedUser,
            AppId,
            Option,
          });
          result.Success = true;
          result.Data = DetailData.Data;
        }
      } else {
        result.Success = false;
        result.Message = 'No data found';
      }
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

async function CustomSave(req, res) {
  try {
    var result = { Success: true, Message: 'Successfully saved', Data: {} };
    const LogedUser = req.LogedUser;
    const { Id, PatientRegNo } = req.body;
    const Data = JSON.parse(req.body.Data);

    if (PatientRegNo && LogedUser && Data) {
      //create vascular disease
      let CongenitalMalformationsId = null;
      if (Id) {
        CongenitalMalformationsId = await BaseControllerHelper.BaseUpdate({
          ObjectName: 'CongenitalMalformations',
          Data: { ...Data, Id },
          LogedUser,
          SaveLog: true,
        });
      } else {
        // create CongenitalMalformations
        CongenitalMalformationsId = await BaseControllerHelper.BaseCreate({
          ObjectName: 'CongenitalMalformations',
          Data: { ...Data, is_confirm: 'no', PatRegNo: PatientRegNo },
          LogedUser,
          SaveLog: true,
        });
      }

      result.Data = { DataId: CongenitalMalformationsId };
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

async function Confirm(req, res) {
  try {
    var result = { Success: true, Message: 'Successfully', Data: {} };
    const LogedUser = req.LogedUser;
    const { Id } = req.body;

    if (LogedUser && Id) {
      const data = await Models.CongenitalMalformations.findOne({
        where: { Id, is_confirm: 'no' },
        raw: true,
      });
      if (!data) {
        return res.send(
          JSON.stringify(
            BaseControllerHelper.GetDefaultErrorResult('Баталгаажуулах мэдээлэл олдсонгүй')
          )
        );
      }

      const CreateUserId = data.CreateUserId;
      if (CreateUserId !== LogedUser.Id) {
        return res.send(
          JSON.stringify(
            BaseControllerHelper.GetDefaultErrorResult(
              'Зөвхөн үүсгэсэн эмч баталгаажуулах боломжтой'
            )
          )
        );
      }

      await Models.CongenitalMalformations.update({ is_confirm: 'yes' }, { where: { Id } });

      result.Data = { DataId: Id };
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

// Get List
async function GetList(req, res) {
  try {
    var result = { Success: true, Message: '', Data: [], Option: {} };
    const ObjectName = req.body.ObjectName;
    const AppId = req.body.AppId;
    const LogedUser = req.LogedUser;

    const RoleId = LogedUser ? LogedUser.RoleId : null;

    if (ObjectName && LogedUser) {
      const OrganizationData = LogedUser.Doctor ? LogedUser.Doctor.Organization : null;
      const OrganizationId = OrganizationData ? OrganizationData.Id + '' : null;
      const OrgLevel = OrganizationData ? OrganizationData.level : null;

      var OrgIds = [];
      var ChildOrganizations = null;

      // 2 р түвшний эмнэлэг бол харьяалагдах сум, өрхийн эмнэлгүүдийн мэдээллийг харах боломжтой
      if (OrgLevel + '' === '2') {
        ChildOrganizations = await Models.Organization.findAll({
          where: { ParentOrganizationId: OrganizationId, level: '1' },
          attributes: ['Id'],
          raw: true,
        });

        if (ChildOrganizations && ChildOrganizations.length > 0) {
          ChildOrganizations.forEach((e) => OrgIds.push(e.Id));
        }
      }

      // 1-р түвшний эмнэлэг бол зөвхөн өөрийн харьяаны хяналтын мэдээллийг харах
      if (OrgLevel === null || OrgLevel + '' === '1') {
        OrgIds.push(OrganizationId);
      }

      // Байгууллагын ID-р хайх боломжтой талбар нэмэх
      var SearchOrgIdsField = {
        Field: 'organization_id',
        Value: OrgIds,
        Op: 'In',
      };

      // Идэвхигүй хяналт
      // var SearchNotInActive = {
      //   Field: "Status",
      //   Value: "inactive",
      //   Op: "NotEquals",
      // };

      // request Option
      var Option = BaseControllerHelper.GetCrudRequestData(req);
      parseInt(RoleId) !== 1 && Option.SearchField.push(SearchOrgIdsField);
      // Option.SearchField.push(SearchNotInActive);
      // Get List Data
      const ListData = await BaseControllerHelper.BaseGetList({
        ObjectName: 'CongenitalMalformations',
        LogedUser,
        AppId,
        Option,
      });

      // response data
      result.Data = ListData.Data;
      result.Option = ListData.Option;
    }
    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

module.exports = router;
