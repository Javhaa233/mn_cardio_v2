const express = require('express');
const router = express.Router();

const BaseControllerHelper = require('../../helper/BaseControllerHelper');
const PrintHelper = require('../../helper/PrintHelper');

const { Models, sequelize } = require('../../config/DB');

const VascularDisease = require('../../reports/VascularDisease');

// routes
router.post('/GetLastData', GetLastData);
router.post('/CustomSave', CustomSave);
router.post('/Confirm', Confirm);
router.post('/PrintReport', PrintReport);
router.post('/GetList', GetList);

async function GetReportData(Id, LogedUser) {
  var DetailData = { Data: null, TreatmentData: null };
  const Option = {
    SearchText: '',
    limit: 1,
    offset: 0,
    SearchField: [{ Field: 'Id', Value: Id, Op: 'Equals' }],
    FindType: 'AllData',
    WhereType: '',
  };

  const SubOption = {
    SearchText: '',
    limit: 1,
    offset: 0,
    SearchField: [{ Field: 'DiseaseId', Value: Id, Op: 'Equals' }],
    FindType: 'AllData',
    WhereType: '',
  };

  const Data = await BaseControllerHelper.BaseDetailInfo({
    ObjectName: 'VascularDisease',
    LogedUser,
    Option,
  });

  const TreatmentData = await BaseControllerHelper.BaseDetailInfo({
    ObjectName: 'VascularDiseaseTreatment',
    LogedUser,
    Option: SubOption,
  });

  DetailData.Data = Data.Data;
  DetailData.TreatmentData = TreatmentData.Data;

  return DetailData;
}

async function PrintReport(req, res) {
  try {
    const Id = req.body.Id;
    const LogedUser = req.LogedUser;
    if (LogedUser && Id) {
      const Data = await GetReportData(Id, LogedUser);
      const html = VascularDisease(Data);
      return await PrintHelper.SendPdf({
        res,
        html,
        namePrefix: 'VascularDisease',
        downloadName: 'VascularDisease.pdf',
        footer: await PrintHelper.FooterFor(LogedUser),
      });
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

async function GetLastData(req, res) {
  try {
    var result = { Success: true, Message: 'Successfully', Data: {} };
    const LogedUser = req.LogedUser;
    const { PatientRegNo, AppId } = req.body;
    if (LogedUser && PatientRegNo) {
      const [LastData, data] = await sequelize.query(
        'SELECT TOP 1 Id FROM VascularDisease WHERE PatRegNo=:PatientRegNo AND (is_confirm=\'no\' OR is_confirm IS NULL) ORDER BY Id DESC',
        { replacements: { PatientRegNo } }
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
            ObjectName: 'VascularDisease',
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
      let VascularDiseaseId = null;
      if (Id) {
        VascularDiseaseId = await BaseControllerHelper.BaseUpdate({
          ObjectName: 'VascularDisease',
          Data: { ...Data, Id },
          LogedUser,
          SaveLog: true,
        });
      } else {
        // create VascularDisease
        VascularDiseaseId = await BaseControllerHelper.BaseCreate({
          ObjectName: 'VascularDisease',
          Data: {
            ...Data,
            is_confirm: 'no',
            PatRegNo: PatientRegNo,
          },
          LogedUser,
          SaveLog: true,
        });
      }

      result.Data = { DataId: VascularDiseaseId };
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
      const Disease = await Models.VascularDisease.findOne({
        where: { Id, is_confirm: 'no' },
        raw: true,
      });
      if (!Disease) {
        return res.send(
          JSON.stringify(
            BaseControllerHelper.GetDefaultErrorResult('Баталгаажуулах мэдээлэл олдсонгүй')
          )
        );
      }

      const Treatment = await Models.VascularDiseaseTreatment.findOne({
        where: { DiseaseId: Id },
        raw: true,
      });

      const CreateUserId = Disease.CreateUserId;
      if (CreateUserId !== LogedUser.Id) {
        return res.send(
          JSON.stringify(
            BaseControllerHelper.GetDefaultErrorResult(
              'Зөвхөн үүсгэсэн эмч баталгаажуулах боломжтой'
            )
          )
        );
      }

      if (!Treatment) {
        return res.send(
          JSON.stringify(
            BaseControllerHelper.GetDefaultErrorResult('Эмчилгээний бүртгэл дутуу байна')
          )
        );
      }

      if (Treatment) {
        await Models.VascularDisease.update({ is_confirm: 'yes' }, { where: { Id } });
      } else {
        return res.send(
          JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Бүртгэл дутуу байна'))
        );
      }

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
        ObjectName: 'VascularDisease',
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
