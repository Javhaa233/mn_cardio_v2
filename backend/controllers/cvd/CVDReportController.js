const express = require('express');
const ExcelJS = require('exceljs');
const path = require('path');
const router = express.Router();

const BaseControllerHelper = require('../../helper/BaseControllerHelper');
const ObjectHelper = require('../../helper/ObjectHelper');

const { Models, Op, sequelize } = require('../../config/DB');
const { Sequelize } = require('sequelize');

// routes
router.post('/GetReportData', GetReportData);
router.post('/GetInspectionReportData', GetInspectionReportData);

router.post('/GetReportUnitData', GetReportUnitData);
router.post('/GetReportSoumData', GetReportSoumData);
router.post('/GetReportMonthData', GetReportMonthData);
router.post('/ReportExportExcel', ReportExportExcel);
router.post('/InspectionExportExcel', InspectionExportExcel);
router.post('/SoumReportExportExcel', SoumReportExportExcel);
router.post('/MonthNewsExportExcel', MonthNewsExportExcel);
router.post('/UnitExportExcel', UnitExportExcel);

// router.post("/GetBodySizeData", GetBodySizeData);

// Report Data
async function CustomReportData(LogedUser, Organization, Option, Excel) {
  var ReportData = [];

  var RoleId = LogedUser ? LogedUser.RoleId : null;
  const OrganizationId = Organization ? Organization.Id + '' : null;
  const OrgLevel = Organization ? Organization.level : null;
  // Data get
  var OrgIds = [];
  var ChildOrganizations = null;
  var Total = 0;

  if (parseInt(RoleId) !== 1) {
    OrgIds = [];
    OrgIds.push(OrganizationId);
    ChildOrganizations = await Models.Organization.findAll({
      where: { ParentOrganizationId: OrganizationId },
      attributes: ['Id'],
      raw: true,
    });
    if (ChildOrganizations && ChildOrganizations.length > 0) {
      ChildOrganizations.forEach((e) => {
        OrgIds.push(e.Id);
      });
    }
  } else if (Option.OrganizationId) {
    OrgIds.push(Option.OrganizationId);
    ChildOrganizations = await Models.Organization.findAll({
      where: { ParentOrganizationId: Option.OrganizationId },
      attributes: ['Id'],
      raw: true,
    });
    if (ChildOrganizations && ChildOrganizations.length > 0) {
      ChildOrganizations.forEach((e) => {
        OrgIds.push(e.Id);
      });
    }
  }

  var FindOption = {};

  FindOption['StartDate'] = Option.StartDate
    ? Option.StartDate
    : ObjectHelper.getDateYMD({ Date: new Date('2021-09-01') });
  FindOption['EndDate'] = Option.EndDate ? Option.EndDate : ObjectHelper.getDateYMD();
  FindOption['OrganizationId'] = Option.OrganizationId ? Option.OrganizationId : null;
  FindOption['ProvinceCityId'] = Option.ProvinceCityId ? Option.ProvinceCityId : null;
  FindOption['SoumDistrictId'] = Option.SoumDistrictId ? Option.SoumDistrictId : null;
  FindOption['BagKhorooId'] = Option.BagKhorooId ? Option.BagKhorooId : null;
  FindOption['CreateUserId'] = Option.CreateUserId ? Option.CreateUserId : null;

  FindOption['Offset'] = Option.offset * Option.limit;
  FindOption['Limit'] = Option.limit;

  FindOption['OrgIds'] = '';

  if (OrgIds && OrgIds.length > 0) {
    var OrgIdsStr = '';
    OrgIds.forEach(
      (e, key, array) => (OrgIdsStr += Object.is(array.length - 1, key) ? e + '' : e + ';')
    );
    FindOption['OrgIds'] = OrgIdsStr;
    console.log('[CVDReport] OrgIds array:', OrgIds);
    console.log('[CVDReport] OrgIds string:', OrgIdsStr);
  } else {
    console.log('[CVDReport] OrgIds is empty');
  }

  const [ProcedureData, spData] = await sequelize.query(
    `EXEC spCVDMonitoringReport
        @StartDate='${FindOption['StartDate']}',
        @EndDate='${FindOption['EndDate']}',
        @OrgIds='${FindOption['OrgIds']}',
        @OrganizationId=${FindOption['OrganizationId']},
        @ProvinceCityId=${FindOption['ProvinceCityId']},
        @SoumDistrictId=${FindOption['SoumDistrictId']},
        @BagKhorooId=${FindOption['BagKhorooId']},
        @Offset=${FindOption['Offset']},
        @Limit=${FindOption['Limit']}
    `
  );

  const [CountData, ctData] = await sequelize.query(
    `EXEC spCVDMonitoringReportTotal
        @StartDate='${FindOption['StartDate']}',
        @EndDate='${FindOption['EndDate']}',
        @OrgIds='${FindOption['OrgIds']}',
        @OrganizationId=${FindOption['OrganizationId']},
        @ProvinceCityId=${FindOption['ProvinceCityId']},
        @SoumDistrictId=${FindOption['SoumDistrictId']},
        @BagKhorooId=${FindOption['BagKhorooId']}
    `
  );

  if (CountData.length === 1) {
    Total = CountData[0]['Total'];
  }
  const monitoringIds = ProcedureData.map((d) => d.Id);

  // Lasr get data
  const LastHistoryDatas = await MonitoringLastData(monitoringIds, 'CVDHistory', Excel);
  const LastBodySizeDatas = await MonitoringLastData(monitoringIds, 'CVDBodySize', Excel);
  const LastRiskDatas = await MonitoringLastData(monitoringIds, 'CVDRisk', Excel);
  const LastSentPrescriptionDatas = await MonitoringLastData(
    monitoringIds,
    'CVDSentPrescription',
    Excel
  );
  const LastControlAndTransitionDatas = await MonitoringLastData(
    monitoringIds,
    'CVDControlAndTransition',
    Excel
  );
  const LastManagementDatas = await MonitoringLastData(monitoringIds, 'CVDManagement', Excel);
  const LastDiagnosiss = await MonitoringLastData(monitoringIds, 'CVDDiagnosis', Excel);

  if (ProcedureData && ProcedureData.length > 0) {
    for (let i = 0; i < ProcedureData.length; i++) {
      let MonitoringId = null;
      MonitoringId = ProcedureData[i] && ProcedureData[i].Id;
      // var LastHistoryData = LastHistoryDatas.find(
      //   (s) => s.MonitoringId == MonitoringId
      // );
      // var LastBodySizeData = LastBodySizeDatas.find(
      //   (s) => s.MonitoringId == MonitoringId
      // );
      // var LastRiskData = LastRiskDatas.find(
      //   (s) => s.MonitoringId == MonitoringId
      // );
      // var LastSentPrescriptionData = LastSentPrescriptionDatas.find(
      //   (s) => s.MonitoringId == MonitoringId
      // );
      // var LastControlAndTransitionData = LastControlAndTransitionDatas.find(
      //   (s) => s.MonitoringId == MonitoringId
      // );
      // var LastManagementData = LastManagementDatas.find(
      //   (s) => s.MonitoringId == MonitoringId
      // );
      // var LastDiagnosis = LastDiagnosiss.find(
      //   (s) => s.MonitoringId == MonitoringId
      // );

      // Last Datas

      // Add Last datas
      ProcedureData[i] = {
        ...ProcedureData[i],

        ...LastHistoryDatas[MonitoringId],
        ...LastBodySizeDatas[MonitoringId],
        ...LastRiskDatas[MonitoringId],
        ...LastSentPrescriptionDatas[MonitoringId],
        ...LastControlAndTransitionDatas[MonitoringId],
        ...LastManagementDatas[MonitoringId],
        ...LastDiagnosiss[MonitoringId],
      };
    }
    // Return data
    ReportData = ProcedureData;
  }

  return { ReportData, Total };
}

async function CustomInspectionReportData(LogedUser, Organization, Option, Excel) {
  var ReportData = [];

  var RoleId = LogedUser ? LogedUser.RoleId : null;
  const OrganizationId = Organization ? Organization.Id + '' : null;
  const OrgLevel = Organization ? Organization.level : null;
  // Data get
  var OrgIds = [];
  var ChildOrganizations = null;
  var Total = 0;

  if (parseInt(RoleId) !== 1) {
    OrgIds = [];
    OrgIds.push(OrganizationId);
    ChildOrganizations = await Models.Organization.findAll({
      where: { ParentOrganizationId: OrganizationId },
      attributes: ['Id'],
      raw: true,
    });
    if (ChildOrganizations && ChildOrganizations.length > 0) {
      ChildOrganizations.forEach((e) => {
        OrgIds.push(e.Id);
      });
    }
  } else if (Option.OrganizationId) {
    OrgIds.push(Option.OrganizationId);
    ChildOrganizations = await Models.Organization.findAll({
      where: { ParentOrganizationId: Option.OrganizationId },
      attributes: ['Id'],
      raw: true,
    });
    if (ChildOrganizations && ChildOrganizations.length > 0) {
      ChildOrganizations.forEach((e) => {
        OrgIds.push(e.Id);
      });
    }
  }

  var FindOption = {};

  FindOption['StartDate'] = Option.StartDate
    ? Option.StartDate
    : ObjectHelper.getDateYMD({ Date: new Date('2021-09-01') });
  FindOption['EndDate'] = Option.EndDate ? Option.EndDate : ObjectHelper.getDateYMD();
  FindOption['OrganizationId'] = Option.OrganizationId ? Option.OrganizationId : null;
  FindOption['ProvinceCityId'] = Option.ProvinceCityId ? Option.ProvinceCityId : null;
  FindOption['SoumDistrictId'] = Option.SoumDistrictId ? Option.SoumDistrictId : null;
  FindOption['BagKhorooId'] = Option.BagKhorooId ? Option.BagKhorooId : null;
  FindOption['CreateUserId'] = Option.CreateUserId ? Option.CreateUserId : null;

  FindOption['Offset'] = Option.offset * Option.limit;
  FindOption['Limit'] = Option.limit;

  FindOption['OrgIds'] = '';

  if (Array.isArray(OrgIds) && OrgIds.length > 0) {
    var OrgIdsStr = '';
    OrgIds.forEach((e, key, array) => {
      OrgIdsStr += Object.is(array.length - 1, key) ? e + '' : e + ';';
    });
    FindOption['OrgIds'] = OrgIdsStr;
  }

  const [ProcedureData, spData] = await sequelize.query(
    `EXEC spCVDInspectionReport
        @StartDate='${FindOption['StartDate']}',
        @EndDate='${FindOption['EndDate']}',
        @OrgIds='${FindOption['OrgIds']}',
        @OrganizationId=${FindOption['OrganizationId']},
        @ProvinceCityId=${FindOption['ProvinceCityId']},
        @SoumDistrictId=${FindOption['SoumDistrictId']},
        @BagKhorooId=${FindOption['BagKhorooId']},
        @Offset=${FindOption['Offset']},
        @Limit=${FindOption['Limit']}
    `
  );

  const [CountData, ctData] = await sequelize.query(
    `EXEC spCVDInspectionReportTotal
        @StartDate='${FindOption['StartDate']}',
        @EndDate='${FindOption['EndDate']}',
        @OrgIds='${FindOption['OrgIds']}',
        @OrganizationId=${FindOption['OrganizationId']},
        @ProvinceCityId=${FindOption['ProvinceCityId']},
        @SoumDistrictId=${FindOption['SoumDistrictId']},
        @BagKhorooId=${FindOption['BagKhorooId']}
    `
  );

  if (CountData.length === 1) Total = CountData[0]['Total'];

  const monitoringIds = ProcedureData.map((d) => d.Id);

  // Lasr get data
  const LastHistoryDatas = await MonitoringLastData(monitoringIds, 'CVDHistory', Excel);
  const LastBodySizeDatas = await MonitoringLastData(monitoringIds, 'CVDBodySize', Excel);
  const LastRiskDatas = await MonitoringLastData(monitoringIds, 'CVDRisk', Excel);

  if (ProcedureData && ProcedureData.length > 0) {
    for (let i = 0; i < ProcedureData.length; i++) {
      let MonitoringId = null;
      MonitoringId = ProcedureData[i] && ProcedureData[i].Id;
      // var LastHistoryData = LastHistoryDatas.find(
      //   (s) => s.MonitoringId == MonitoringId
      // );
      // var LastBodySizeData = LastBodySizeDatas.find(
      //   (s) => s.MonitoringId == MonitoringId
      // );
      // var LastRiskData = LastRiskDatas.find(
      //   (s) => s.MonitoringId == MonitoringId
      // );
      // var LastSentPrescriptionData = LastSentPrescriptionDatas.find(
      //   (s) => s.MonitoringId == MonitoringId
      // );
      // var LastControlAndTransitionData = LastControlAndTransitionDatas.find(
      //   (s) => s.MonitoringId == MonitoringId
      // );
      // var LastManagementData = LastManagementDatas.find(
      //   (s) => s.MonitoringId == MonitoringId
      // );
      // var LastDiagnosis = LastDiagnosiss.find(
      //   (s) => s.MonitoringId == MonitoringId
      // );

      // Last Datas

      // Add Last datas
      ProcedureData[i] = {
        ...ProcedureData[i],
        ...LastHistoryDatas[MonitoringId],
        ...LastBodySizeDatas[MonitoringId],
        ...LastRiskDatas[MonitoringId],
      };
    }
    // Return data
    ReportData = ProcedureData;
  }

  return { ReportData, Total };
}

async function CustomReportUnitData(LogedUser, Organization, Option, Excel) {
  var ReportData = [];

  var RoleId = LogedUser ? LogedUser.RoleId : null;
  const OrganizationId = Organization ? Organization.Id + '' : null;
  const OrgLevel = Organization ? Organization.level : null;
  var OrgIds = [];
  var ChildOrganizations = null;
  var Total = 0;

  if (parseInt(RoleId) !== 1) {
    OrgIds = [];
    OrgIds.push(OrganizationId);
    ChildOrganizations = await Models.Organization.findAll({
      where: { ParentOrganizationId: OrganizationId },
      attributes: ['Id'],
      raw: true,
    });
    if (ChildOrganizations && ChildOrganizations.length > 0) {
      ChildOrganizations.forEach((e) => {
        OrgIds.push(e.Id);
      });
    }
  } else if (Option.OrganizationId) {
    OrgIds.push(Option.OrganizationId);
    ChildOrganizations = await Models.Organization.findAll({
      where: { ParentOrganizationId: Option.OrganizationId },
      attributes: ['Id'],
      raw: true,
    });
    if (ChildOrganizations && ChildOrganizations.length > 0) {
      ChildOrganizations.forEach((e) => {
        OrgIds.push(e.Id);
      });
    }
  }

  var FindOption = {};

  FindOption['StartDate'] = Option.StartDate ? Option.StartDate : null;
  FindOption['EndDate'] = Option.EndDate ? Option.EndDate : null;
  FindOption['ProvinceCityId'] = Option.ProvinceCityId ? Option.ProvinceCityId : null;
  FindOption['SoumDistrictId'] = Option.SoumDistrictId ? Option.SoumDistrictId : null;
  FindOption['BagKhorooId'] = Option.BagKhorooId ? Option.BagKhorooId : null;
  FindOption['CreateUserId'] = Option.CreateUserId ? Option.CreateUserId : null;

  FindOption['Offset'] = Option.offset * Option.limit;
  FindOption['Limit'] = Option.limit;

  FindOption['OrgIds'] = '';

  if (OrgIds && OrgIds.length > 0) {
    var OrgIdsStr = '';
    OrgIds.forEach((e, key, array) => {
      OrgIdsStr += Object.is(array.length - 1, key) ? e + '' : e + ';';
    });
    FindOption['OrgIds'] = OrgIdsStr;
  }

  FindOption['StartDate'] = FindOption['StartDate']
    ? FindOption['StartDate']
    : ObjectHelper.getDateYMD({ Date: new Date('2021-09-01') });
  FindOption['EndDate'] = FindOption['EndDate'] ? FindOption['EndDate'] : ObjectHelper.getDateYMD();

  const [ProcedureData, spData] = await sequelize.query(
    `EXEC spCVDMonitoringReportUnit
        @StartDate='${FindOption['StartDate']}',
        @EndDate='${FindOption['EndDate']}',
        @OrgIds='${FindOption['OrgIds']}',
        @ProvinceCityId=${FindOption['ProvinceCityId']},
        @SoumDistrictId=${FindOption['SoumDistrictId']},
        @Offset=${FindOption['Offset']},
        @Limit=${FindOption['Limit']}
    `
  );

  ReportData = ProcedureData;
  return { ReportData, Total };
}

async function CustomReportSoumData(LogedUser, Organization, Option, Excel) {
  var ReportData = [];

  var RoleId = LogedUser ? LogedUser.RoleId : null;
  const OrganizationId = Organization ? Organization.Id + '' : null;
  const OrgLevel = Organization ? Organization.level : null;
  var OrgIds = [];
  var ChildOrganizations = null;
  var Total = 0;

  if (parseInt(RoleId) !== 1) {
    OrgIds = [];
    OrgIds.push(OrganizationId);
    ChildOrganizations = await Models.Organization.findAll({
      where: { ParentOrganizationId: OrganizationId },
      attributes: ['Id'],
      raw: true,
    });
    if (ChildOrganizations && ChildOrganizations.length > 0) {
      ChildOrganizations.forEach((e) => {
        OrgIds.push(e.Id);
      });
    }
  } else if (Option.OrganizationId) {
    OrgIds.push(Option.OrganizationId);
    ChildOrganizations = await Models.Organization.findAll({
      where: { ParentOrganizationId: Option.OrganizationId },
      attributes: ['Id'],
      raw: true,
    });
    if (ChildOrganizations && ChildOrganizations.length > 0) {
      ChildOrganizations.forEach((e) => {
        OrgIds.push(e.Id);
      });
    }
  }

  var FindOption = {};

  FindOption['StartDate'] = Option.StartDate ? Option.StartDate : null;
  FindOption['EndDate'] = Option.EndDate ? Option.EndDate : null;
  FindOption['OrganizationId'] = Option.OrganizationId ? Option.OrganizationId : null;
  FindOption['ProvinceCityId'] = Option.ProvinceCityId ? Option.ProvinceCityId : null;
  FindOption['SoumDistrictId'] = Option.SoumDistrictId ? Option.SoumDistrictId : null;
  FindOption['BagKhorooId'] = Option.BagKhorooId ? Option.BagKhorooId : null;
  FindOption['CreateUserId'] = Option.CreateUserId ? Option.CreateUserId : null;

  FindOption['Offset'] = Option.offset * Option.limit;
  FindOption['Limit'] = Option.limit;

  FindOption['OrgIds'] = '';

  if (OrgIds && OrgIds.length > 0) {
    var OrgIdsStr = '';
    OrgIds.forEach((e, key, array) => {
      OrgIdsStr += Object.is(array.length - 1, key) ? e + '' : e + ';';
    });
    FindOption['OrgIds'] = OrgIdsStr;
  }

  FindOption['StartDate'] = FindOption['StartDate']
    ? FindOption['StartDate']
    : ObjectHelper.getDateYMD({ Date: new Date('2021-09-01') });
  FindOption['EndDate'] = FindOption['EndDate'] ? FindOption['EndDate'] : ObjectHelper.getDateYMD();

  const [ProcedureData, spData] = await sequelize.query(
    `EXEC spCVDMonitoringReportSoum
        @StartDate='${FindOption['StartDate']}',
        @EndDate='${FindOption['EndDate']}',
        @OrgIds='${FindOption['OrgIds']}',
        @OrganizationId=${FindOption['OrganizationId']},
        @ProvinceCityId=${FindOption['ProvinceCityId']},
        @SoumDistrictId=${FindOption['SoumDistrictId']},
        @BagKhorooId=${FindOption['BagKhorooId']},
        @Offset=${FindOption['Offset']},
        @Limit=${FindOption['Limit']}
    `
  );

  ReportData = ProcedureData;
  return { ReportData, Total };
}

async function CustomReportMonthData(LogedUser, Organization, Option, Excel) {
  var ReportData = [];

  var RoleId = LogedUser ? LogedUser.RoleId : null;
  const OrganizationId = Organization ? Organization.Id + '' : null;
  const OrgLevel = Organization ? Organization.level : null;
  var OrgIds = [];
  var ChildOrganizations = null;
  var Total = 0;

  if (parseInt(RoleId) !== 1) {
    OrgIds = [];
    OrgIds.push(OrganizationId);
    ChildOrganizations = await Models.Organization.findAll({
      where: { ParentOrganizationId: OrganizationId },
      attributes: ['Id'],
      raw: true,
    });
    if (ChildOrganizations && ChildOrganizations.length > 0) {
      ChildOrganizations.forEach((e) => {
        OrgIds.push(e.Id);
      });
    }
  } else if (Option.OrganizationId) {
    OrgIds.push(Option.OrganizationId);
    ChildOrganizations = await Models.Organization.findAll({
      where: { ParentOrganizationId: Option.OrganizationId },
      attributes: ['Id'],
      raw: true,
    });
    if (ChildOrganizations && ChildOrganizations.length > 0) {
      ChildOrganizations.forEach((e) => {
        OrgIds.push(e.Id);
      });
    }
  }

  var FindOption = {};

  FindOption['StartDate'] = Option.StartDate ? Option.StartDate : null;
  FindOption['EndDate'] = Option.EndDate ? Option.EndDate : null;
  FindOption['OrganizationId'] = Option.OrganizationId ? Option.OrganizationId : null;
  FindOption['ProvinceCityId'] = Option.ProvinceCityId ? Option.ProvinceCityId : null;
  FindOption['SoumDistrictId'] = Option.SoumDistrictId ? Option.SoumDistrictId : null;
  FindOption['BagKhorooId'] = Option.BagKhorooId ? Option.BagKhorooId : null;
  FindOption['CreateUserId'] = Option.CreateUserId ? Option.CreateUserId : null;

  FindOption['Offset'] = Option.offset * Option.limit;
  FindOption['Limit'] = Option.limit;

  FindOption['OrgIds'] = '';

  if (OrgIds && OrgIds.length > 0) {
    var OrgIdsStr = '';
    OrgIds.forEach((e, key, array) => {
      OrgIdsStr += Object.is(array.length - 1, key) ? e + '' : e + ';';
    });
    FindOption['OrgIds'] = OrgIdsStr;
  }

  FindOption['StartDate'] = FindOption['StartDate']
    ? FindOption['StartDate']
    : ObjectHelper.getDateYMD({ Date: new Date('2021-09-01') });
  FindOption['EndDate'] = FindOption['EndDate'] ? FindOption['EndDate'] : ObjectHelper.getDateYMD();

  const [ProcedureData, spData] = await sequelize.query(
    `EXEC spCVDMonitoringReportMonth
        @StartDate='${FindOption['StartDate']}',
        @EndDate='${FindOption['EndDate']}',
        @OrgIds='${FindOption['OrgIds']}',
        @OrganizationId=${FindOption['OrganizationId']},
        @ProvinceCityId=${FindOption['ProvinceCityId']},
        @SoumDistrictId=${FindOption['SoumDistrictId']},
        @BagKhorooId=${FindOption['BagKhorooId']},
        @Offset=${FindOption['Offset']},
        @Limit=${FindOption['Limit']}
    `
  );

  ReportData = ProcedureData;
  return { ReportData, Total };
}

async function MonitoringLastData(MonitoringIds, ObjectName, Excel) {
  try {
    var Ids = null;
    var Attributes = null;
    if (ObjectName === 'CVDHistory') {
      Attributes = [
        'BuurniiArhagUwchin',
        'Holestrin',
        'TsusniiSahar',
        'ZurkhShigdees',
        'TarkhiHarvalt',
        'Stenokardi',
        'TsusHomsroh',
        'ZahiinSudas',
        'GerbulNasbaralt',
        'TamkhiTatdag',
        'IsDaraltEm',
        'IsDiabeticEm',
      ];
    } else if (ObjectName === 'CVDBodySize') {
      Attributes = [
        'Height',
        'Weigth',
        'Buselkhii',
        'BJI',
        'Tailbar',
        'HeartRate',
        'RespiratoryRate',
        'Temperature',
        'Saturatsi',
        'Sahar',
        'Cholesterol',
        'DaraltDeed',
        'DaraltDood',
        'UlunGlucose',
        'SanamsarguiGlucose',
      ];
    } else if (ObjectName === 'CVDRisk') {
      Attributes = ['Risk', 'DoctorAdvice'];
    } else if (ObjectName === 'CVDSentPrescription') {
      Attributes = ['SentData', 'ResData', 'DoctorRegNo', 'RequestStatus'];
    } else if (ObjectName === 'CVDControlAndTransition') {
      Attributes = [
        'HynaltandOrson',
        'HynaltandOrsonTorol',
        'HynaltandDahihHugatsaa',
        'Lavlagaa',
        'HynaltiinUzleg',
        'HynaltaasGarsan',
        'Tamhi',
        'EmiinTorol',
        'EmiinNer',
        'Glucose',
      ];
    } else if (ObjectName === 'CVDManagement') {
      Attributes = ['IsSentLavlagaa', 'IsAdviceFromLavlagaa', 'FutureAdvice'];
    } else if (ObjectName === 'CVDDiagnosis') {
      Attributes = ['MainDiagnosis', 'Comment'];
    }

    if (MonitoringIds && ObjectName && ObjectName !== '') {
      // var [Data, data] = await sequelize.query(
      //   "SELECT TOP 1 * FROM " +
      //     ObjectName +
      //     " WHERE MonitoringId=" +
      //     MonitoringId +
      //     " ORDER BY Id DESC"
      // );
      let where = {};
      if (!Excel) where = { MonitoringId: MonitoringIds };
      Ids = await Models[ObjectName].findAll({
        attributes: [[Sequelize.fn('MAX', Sequelize.col('Id')), 'Id']],
        where,
        group: ['MonitoringId'],
      });

      let idss = [];
      const LastDatas = {};
      for (let i = 0; i < Ids.length; i++) {
        idss.push(Ids[i].Id);
        if (idss.length > 2000 || (idss.length > 0 && i === Ids.length - 1)) {
          if (Ids && Attributes && Array.isArray(Attributes)) {
            const Model = Models[ObjectName];
            const LastData = await Model.findAll({
              attributes: ['MonitoringId', ...Attributes],
              where: { Id: idss },
              raw: true,
            });
            LastData.forEach((d) => (LastDatas[d.MonitoringId] = d));
            idss = [];
          }
        }
      }
      return LastDatas;
    }
    return null;
  } catch (ex) {
    console.log(ex);
    return [];
  }
}

async function SetPatAge(PatRegNo, CreateDate) {
  var PatRegNo = PatRegNo ? PatRegNo : '';
  var CreateDate = CreateDate ? CreateDate : new Date();

  var Age = 0;
  var PatRegYear = 0;
  var PatRegCentury = '';
  var PatRegMonth = 0;
  var PatRegMonthFirst = 0;
  var NowDate = CreateDate.getFullYear();
  var NowYear = NowDate.toString().substring(2, 4);
  PatRegYear = PatRegNo.substring(2, 4);
  PatRegMonth = PatRegNo.substring(4, 6);
  PatRegMonthFirst = PatRegMonth.substring(0, 1);
  PatRegCentury = PatRegMonthFirst >= 2 ? 'XXI' : PatRegMonthFirst <= 1 ? 'XX' : '';
  Age =
    PatRegCentury === 'XXI'
      ? parseInt(NowYear) - parseInt(PatRegYear)
      : PatRegCentury === 'XX'
        ? 100 + parseInt(NowYear) - parseInt(PatRegYear)
        : 0;

  return Age;
}

async function ConvertRowsData(RowsData) {
  const ConvertedData = [];

  if (RowsData && RowsData.length > 0) {
    //#region RowsData foreach
    await RowsData.forEach(async (e, index) => {
      if (e) {
        var ConvertedObject = {
          Number: '',
          ProvinceCity: '',
          SoumDistrict: '',
          BagKhoroo: '',
          HospitalName: '',
          PatFullName: '',
          PatRegisterNo: '',
          PatAge: '',
          PatGender: '',
          PatAddress: '',
          PatPhoneNumber: '',
          PatWorkplace: '',
          BuurniiArhagUwchin: '',
          IsHolestrin: '',
          TsusniiSahar: '',
          ZurkhShigdees: '',
          TarkhiHarvalt: '',
          Stenokardi: '',
          TsusHomsroh: '',
          ZahiinSudas: '',
          GerbulNasbaralt: '',
          TamkhiTatdag: '',
          IsDaraltEm: '',
          IsDiabeticEm: '',
          Height: '',
          Weigth: '',
          BJI: '',
          Buselkhii: '',
          DaraltDeed: '',
          DaraltDood: '',
          UlunGlucose: '',
          Cholesterol: '',
          RiskTo5: '',
          Risk5To10: '',
          Risk10To20: '',
          Risk20To30: '',
          RiskUp30: '',
          DiagnosedArterHypertension: '',
          DiagnosedDiabetes: '',
          Tablets: '',
          TestDiagnose: '',
          Advice: '',
          IsSentLavlagaa: '',
          IsAdviceFromLavlagaa: '',
          FurtherAdvice: '',
          HynaltandOrson: '',
          HyanaltDate: '',
          HynaltandOrsonTorol: '',
          HynaltiinUzleg: '',
          HynaltandDahihHugatsaa: '',
          IsTransfered: '',
          TransferNote: '',
          TransferDate: '',
          HariutssanEmch: '',
          UpdateDate: '',
        };

        // set object key
        ConvertedObject.Number = index + 1;
        ConvertedObject.ProvinceCity = e.ProvinceCity;
        ConvertedObject.SoumDistrict = e.SoumDistrict;
        ConvertedObject.BagKhoroo = e.BagKhoroo;
        ConvertedObject.HospitalName = e.OrganizationName;
        ConvertedObject.PatFullName = e.PatLastName + ' ' + e.PatFirstName;
        ConvertedObject.PatRegisterNo = e.PatRegNo;
        // ConvertedObject.PatAge = e.PatAge;
        ConvertedObject.PatGender = e.PatGender
          ? e.PatGender === 'M'
            ? 'Эрэгтэй'
            : 'Эмэгтэй'
          : '';
        ConvertedObject.PatAddress = e.PatAddress;
        ConvertedObject.PatPhoneNumber = e.PatPhoneNumber;
        // ConvertedObject.PatWorkplace = e.Patient ? e.Patient.p_workplace;
        ConvertedObject.BuurniiArhagUwchin = e.BuurniiArhagUwchin === 'y' ? '1' : '0';
        ConvertedObject.IsHolestrin = e.Holestrin === 'y' ? '1' : '0';
        ConvertedObject.TsusniiSahar = e.TsusniiSahar === 'y' ? '1' : '0';
        ConvertedObject.ZurkhShigdees = e.ZurkhShigdees === 'y' ? '1' : '0';
        ConvertedObject.TarkhiHarvalt = e.TarkhiHarvalt === 'y' ? '1' : '0';
        ConvertedObject.Stenokardi = e.Stenokardi === 'y' ? '1' : '0';
        ConvertedObject.TsusHomsroh = e.TsusHomsroh === 'y' ? '1' : '0';
        ConvertedObject.ZahiinSudas = e.ZahiinSudas === 'y' ? '1' : '0';
        ConvertedObject.GerbulNasbaralt = e.GerbulNasbaralt === 'y' ? '1' : '0';
        ConvertedObject.TamkhiTatdag = e.TamkhiTatdag === 'y' ? '1' : '0';
        ConvertedObject.IsDaraltEm = e.IsDaraltEm === 'y' ? '1' : '0';
        ConvertedObject.IsDiabeticEm = e.IsDiabeticEm === 'y' ? '1' : '0';
        ConvertedObject.Height = e.Height;
        ConvertedObject.Weigth = e.Weigth;
        ConvertedObject.BJI = e.BJI;
        ConvertedObject.Buselkhii = e.Buselkhii;
        ConvertedObject.DaraltDeed = e.DaraltDeed;
        ConvertedObject.DaraltDood = e.DaraltDood;
        ConvertedObject.UlunGlucose = e.UlunGlucose;
        ConvertedObject.Cholesterol = e.Cholesterol;
        ConvertedObject.RiskTo5 = e.Risk + '' === '1' ? '1' : '0';
        ConvertedObject.Risk5To10 = e.Risk + '' === '2' ? '1' : '0';
        ConvertedObject.Risk10To20 = e.Risk + '' === '3' ? '1' : '0';
        ConvertedObject.Risk20To30 = e.Risk + '' === '4' ? '1' : '0';
        ConvertedObject.RiskUp30 = e.Risk + '' === '5' ? '1' : '0';
        // ConvertedObject.DiagnosedArterHypertension = "-";
        // ConvertedObject.DiagnosedDiabetes = "-";
        ConvertedObject.Tablets = e.EmiinNer ? e.EmiinNer : '';
        ConvertedObject.TestDiagnose = '';
        ConvertedObject.Advice = '';
        ConvertedObject.IsSentLavlagaa = e.IsSentLavlagaa === 'y' ? '0' : '1';
        ConvertedObject.IsAdviceFromLavlagaa = e.IsAdviceFromLavlagaa === 'y' ? '0' : '1';
        ConvertedObject.FurtherAdvice = e.FutureAdvice ? e.FutureAdvice : '';
        ConvertedObject.HynaltandOrson = e.HynaltandOrson === 'y' ? '0' : '1';
        ConvertedObject.HyanaltDate = '';
        ConvertedObject.HynaltandOrsonTorol =
          e.HynaltandOrsonTorol === '1'
            ? 'Лавлагаа тусламжаас ирсэн'
            : e.HynaltandOrsonTorol === '2'
              ? 'Эрсдэлд суурилсан хяналт'
              : '';
        ConvertedObject.HynaltiinUzleg = '';
        ConvertedObject.HynaltandDahihHugatsaa = '';
        ConvertedObject.IsTransfered = '';
        ConvertedObject.TransferDate = '';
        ``;
        ConvertedObject.HariutssanEmch =
          (e.DocLastName ? e.DocLastName.substring(0, 1) + '.' : '') + e.DocFirstName;

        ConvertedObject.UpdateDate = ObjectHelper.getDateYMDHMS({
          Date: e.UpdateDate,
        });

        var PatAge = 0;
        PatAge = await SetPatAge(e.PatRegNo, e.CreateDate);
        ConvertedObject.PatAge = PatAge;
        //#region Patient workplace
        var PatWorkplace = e.PatWorkplace;
        var PatWorkplaceText = '';
        if (PatWorkplace === '1') {
          PatWorkplaceText = 'Ажилтай';
        } else if (PatWorkplace === '2') {
          PatWorkplaceText = 'Ажилгүй';
        } else if (PatWorkplace === '3') {
          PatWorkplaceText = 'Тэтгэвэрт';
        } else if (PatWorkplace === '4') {
          PatWorkplaceText = 'Групп';
        } else if (PatWorkplace === '5') {
          PatWorkplaceText = 'Оюутан';
        } else if (PatWorkplace === '6') {
          PatWorkplaceText = 'Малчин';
        } else {
          PatWorkplaceText = '';
        }
        ConvertedObject.PatWorkplace = PatWorkplaceText;
        //#endregion

        //#region Diagnosed Arter Hypertension
        var DiagnosedArterHypertension = '-';

        if (e.DiagnosedArterHypertension) {
          DiagnosedArterHypertension = e.DiagnosedArterHypertension === 'y' ? '1' : '0';
        } else {
          if (e.IsDaraltEm) {
            DiagnosedArterHypertension = e.IsDaraltEm === 'y' ? '1' : '0';
          }
        }

        ConvertedObject.DiagnosedArterHypertension = DiagnosedArterHypertension;
        //#endregion

        //#region DiagnosedDiabetes
        var DiagnosedDiabetes = '-';

        if (e.DiagnosedDiabetes) {
          DiagnosedDiabetes = e.DiagnosedDiabetes === 'y' ? '1' : '0';
        } else {
          if (e.IsDiabeticEm) {
            DiagnosedDiabetes = e.IsDiabeticEm === 'y' ? '1' : '0';
          } else if (e.TsusniiSahar) {
            DiagnosedDiabetes = e.TsusniiSahar === 'y' ? '1' : '0';
          }
        }

        ConvertedObject.DiagnosedDiabetes = DiagnosedDiabetes;
        //#endregion

        //#region HynaltiinUzleg
        var HynaltiinUzleg = '';
        if (e.HynaltiinUzleg === '1') {
          HynaltiinUzleg = 'Хугацаандаа ирсэн';
        } else if (e.HynaltiinUzleg === '2') {
          HynaltiinUzleg = 'Хугацаанаас өмнө';
        } else if (e.HynaltiinUzleg === '3') {
          HynaltiinUzleg = 'ожимдож ирсэн';
        }
        ConvertedObject.HynaltiinUzleg = HynaltiinUzleg;
        //#endregion

        //#region HynaltandDahihHugatsaa
        var HynaltandDahihHugatsaa = '';
        if (e.HynaltandDahihHugatsaa === '1') {
          HynaltandDahihHugatsaa = '1 сар';
        } else if (e.HynaltandDahihHugatsaa === '2') {
          HynaltandDahihHugatsaa = '3 сар';
        } else if (e.HynaltandDahihHugatsaa === '3') {
          HynaltandDahihHugatsaa = '6 сар';
        } else if (e.HynaltandDahihHugatsaa === '4') {
          HynaltandDahihHugatsaa = '12 сар';
        }
        ConvertedObject.HynaltandDahihHugatsaa = HynaltandDahihHugatsaa;
        //#endregion

        //#region TransferNote
        var TransferNote = '';
        if (e.HynaltaasGarsan === '1') {
          TransferNote = 'Сайжирсан';
        } else if (e.HynaltaasGarsan === '2') {
          TransferNote = 'Шилжсэн';
        } else if (e.HynaltaasGarsan === '3') {
          TransferNote = 'Нас барсан';
        } else if (e.HynaltaasGarsan === '4') {
          TransferNote = 'Тодорхойгүй';
        }
        ConvertedObject.TransferNote = TransferNote;
        //#endregion

        ConvertedData.push(ConvertedObject);
      }
    });
    //#endregion
  }

  return ConvertedData;
}

async function ConvertUnitData(RowsData) {
  var ConvertedData = [];
  if (RowsData && RowsData.length > 0) {
    await RowsData.forEach((e, index) => {
      var ConvertedObject = {};
      if (e) {
        ConvertedObject.Number = index + 1;
        ConvertedObject.SoumName = e.SoumName;
        ConvertedObject.CVDName = null;
        ConvertedObject.bolzoshguiCount = e.riskLt30;
        ConvertedObject.hamragdsanCount = e.patCnt;
        ConvertedObject.newDiagnosedCount = index + 1;
        ConvertedObject.treatmentCount = index + 1;
        ConvertedObject.activatedCount = e.patCnt;
        ConvertedObject.edgersenCount = e.patCnt;
        ConvertedObject.transferedCount = e.patCnt;
        ConvertedObject.nasBarsanCount = e.nasBarsanCount;
      }
      ConvertedData.push(ConvertedObject);
    });
  }
  return ConvertedData;
}

async function ConvertSoumData(RowsData) {
  var ConvertedData = [];
  if (RowsData && RowsData.length > 0) {
    await RowsData.map((e, index) => {
      var ConvertedObject = {};
      if (e) {
        ConvertedObject.Number = index + 1;
        ConvertedObject.orgName = e.orgName;
        ConvertedObject.genderM = e.genderM;
        ConvertedObject.genderF = e.genderF;
        ConvertedObject.ageLt40 = e.ageLt40;
        ConvertedObject.ageGte40 = e.ageGte40;
        ConvertedObject.allPatCnt = e.patCnt;
        // ConvertedObject.isCVD = e.TsusniiSahar;
        ConvertedObject.isCVD = e.isDaraltEm;
        ConvertedObject.buurniiArhagUwchin = e.buurniiArhagUwchin;
        ConvertedObject.riskGte30 = e.riskGte30;
        ConvertedObject.riskLt30 = e.riskLt30;
        ConvertedObject.newPatCnt = e.patCnt;
        ConvertedObject.arterCnt = e.isDaraltEm;
        ConvertedObject.tsusniiSahar = e.tsusniiSahar;
      }
      ConvertedData.push(ConvertedObject);
    });
  }

  return ConvertedData;
}

async function ConvertMonthData(RowsData) {
  var ConvertedData = [];
  if (RowsData && RowsData.length > 0) {
    RowsData.forEach(async (e, index) => {
      var ConvertedObject = {};
      if (e) {
        // ConvertedObject.Number = index + 1;
        ConvertedObject.orgName = e.orgName;
        ConvertedObject.genderF = e.genderF;
        ConvertedObject.genderM = e.genderM;
        ConvertedObject.ageLt40 = e.ageLt40;
        ConvertedObject.ageGte40 = e.ageGte40;
        ConvertedObject.allPatCnt = e.patCnt;
        ConvertedObject.isCVD = e.TsusniiSahar;
        ConvertedObject.buurniiArhagUwchin = e.buurniiArhagUwchin;
        ConvertedObject.riskGte30 = e.riskGte30;
        ConvertedObject.riskLt30 = e.riskLt30;
        ConvertedObject.newPatCnt = e.patCnt;
        ConvertedObject.arterCnt = e.IsDaraltEm;
        ConvertedObject.TsusniiSahar = e.TsusniiSahar;
      }
      ConvertedData.push(ConvertedObject);
    });
  }
  return ConvertedData;
}

// Data
async function GetReportData(req, res) {
  try {
    var result = {
      Success: true,
      Message: 'Successfully',
      Data: null,
      Total: 0,
    };
    // body params
    const Option = req.body.SearchOption;
    const LogedUser = req.LogedUser;
    const Organization = LogedUser && LogedUser.Doctor ? LogedUser.Doctor.Organization : null;

    if (LogedUser) {
      var RowsData = [];
      if (Organization) {
        const { ReportData, Total } = await CustomReportData(
          LogedUser,
          Organization,
          Option,
          false
        );
        RowsData = ReportData;
        RowsData = await ConvertRowsData(RowsData);

        result.Data = RowsData;
        result.Total = Total;
      }
    }
    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

// Inspection data
async function GetInspectionReportData(req, res) {
  try {
    var result = {
      Success: true,
      Message: 'Successfully',
      Data: null,
      Total: 0,
    };
    // body params
    const Option = req.body.SearchOption;
    const LogedUser = req.LogedUser;
    const Organization = LogedUser && LogedUser.Doctor ? LogedUser.Doctor.Organization : null;

    if (LogedUser) {
      var RowsData = [];
      if (Organization) {
        const { ReportData, Total } = await CustomInspectionReportData(
          LogedUser,
          Organization,
          Option,
          false
        );
        RowsData = ReportData;
        RowsData = await ConvertRowsData(RowsData);

        result.Data = RowsData;
        result.Total = Total;
      }
    }
    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

// Unit Data
async function GetReportUnitData(req, res) {
  try {
    var result = {
      Success: true,
      Message: 'Successfully',
      Data: null,
      Total: 0,
    };
    // body params
    const Option = req.body.SearchOption;
    const LogedUser = req.LogedUser;
    const Organization = LogedUser && LogedUser.Doctor ? LogedUser.Doctor.Organization : null;

    if (LogedUser) {
      var RowsData = [];

      const { ReportData, Total } =
        Organization && (await CustomReportUnitData(LogedUser, Organization, Option, false));
      RowsData = ReportData;
      RowsData = await ConvertUnitData(RowsData);

      result.Data = RowsData;
      result.Total = RowsData.length;
    }

    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

// Soum Data
async function GetReportSoumData(req, res) {
  try {
    var result = {
      Success: true,
      Message: 'Successfully',
      Data: null,
      Total: 0,
    };
    // body params
    const Option = req.body.SearchOption;
    const LogedUser = req.LogedUser;
    const Organization = LogedUser && LogedUser.Doctor ? LogedUser.Doctor.Organization : null;

    if (LogedUser) {
      var RowsData = [];

      const { ReportData, Total } =
        Organization && (await CustomReportSoumData(LogedUser, Organization, Option, false));
      RowsData = ReportData;
      RowsData = await ConvertSoumData(RowsData);

      result.Data = RowsData;
      result.Total = RowsData.length;
    }

    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

// Month Data
async function GetReportMonthData(req, res) {
  try {
    var result = {
      Success: true,
      Message: 'Successfully',
      Data: null,
      Total: 0,
    };
    // body params
    const Option = req.body.SearchOption;
    const LogedUser = req.LogedUser;
    const Organization = LogedUser && LogedUser.Doctor ? LogedUser.Doctor.Organization : null;

    if (LogedUser) {
      var RowsData = [];

      const { ReportData, Total } =
        Organization && (await CustomReportMonthData(LogedUser, Organization, Option, false));
      RowsData = ReportData;
      RowsData = await ConvertMonthData(RowsData);

      result.Data = RowsData;
      result.Total = RowsData.length;
    }
    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

// download excel
async function ReportExportExcel(req, res) {
  try {
    // body params
    var Option = req.body.SearchOption;
    Option.limit = 1000000;
    const LogedUser = req.LogedUser;
    const Organization = LogedUser && LogedUser.Doctor ? LogedUser.Doctor.Organization : null;

    var filePath = 'outputExcel/Monitoring.xlsx';
    var workBook = new ExcelJS.Workbook();
    workBook = await workBook.xlsx.readFile('inputExcel/Monitoring.xlsx');

    const newWorkSheet = workBook.getWorksheet('Sheet1');

    var RowsData = [];

    if (Organization) {
      const { ReportData, Total } = await CustomReportData(LogedUser, Organization, Option, true);
      RowsData = RowsData.concat(ReportData);
    }

    RowsData = await ConvertRowsData(RowsData);

    // Excel Add Row
    const rows = [];
    RowsData.map((d) => {
      const addRowArray = [];
      Object.keys(d).forEach((e) => {
        addRowArray.push(d[e]);
      });
      rows.push(addRowArray);
      // await newWorkSheet.addRow(addRowArray);
    });

    // console.log("excel", rows.length);
    newWorkSheet.addRows(rows);

    // for (let i = 0; i < RowsData.length; i++) {
    //   var RowObject;
    //   var addRowArray = [];
    //   RowObject = RowsData[i];
    //   await Object.keys(RowObject).forEach(async (e) => {
    //     await addRowArray.push(RowObject[e]);
    //   });
    //   await newWorkSheet.addRow(addRowArray);
    // }

    await workBook.xlsx.writeFile(path.resolve(filePath));

    console.log('write excel', new Date());
    res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return res.download(filePath);
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

// Inspection
async function InspectionExportExcel(req, res) {
  try {
    // body params
    var Option = req.body.SearchOption;
    Option.limit = 1000000;
    const LogedUser = req.LogedUser;
    const Organization = LogedUser && LogedUser.Doctor ? LogedUser.Doctor.Organization : null;

    var filePath = 'outputExcel/Inspection.xlsx';
    var workBook = new ExcelJS.Workbook();
    workBook = await workBook.xlsx.readFile('inputExcel/Inspection.xlsx');

    const newWorkSheet = workBook.getWorksheet('Sheet1');

    var RowsData = [];

    if (Organization) {
      const { ReportData, Total } = await CustomReportData(LogedUser, Organization, Option, true);
      RowsData = RowsData.concat(ReportData);
    }

    RowsData = await ConvertRowsData(RowsData);

    // Excel Add Row
    const rows = [];
    RowsData.forEach((d) => {
      const addRowArray = [];
      Object.keys(d).forEach((e) => addRowArray.push(d[e]));
      rows.push(addRowArray);
      // await newWorkSheet.addRow(addRowArray);
    });

    // console.log("excel", rows.length);
    newWorkSheet.addRows(rows);

    // for (let i = 0; i < RowsData.length; i++) {
    //   var RowObject;
    //   var addRowArray = [];
    //   RowObject = RowsData[i];
    //   await Object.keys(RowObject).forEach(async (e) => {
    //     await addRowArray.push(RowObject[e]);
    //   });
    //   await newWorkSheet.addRow(addRowArray);
    // }

    await workBook.xlsx.writeFile(path.resolve(filePath));

    console.log('write excel', new Date());
    res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return res.download(filePath);
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

// Unit data
async function UnitExportExcel(req, res) {
  try {
    // const ProvinceCityId = req.body.ProvinceCityId;
    var Option = req.body.SearchOption;
    Option.limit = 1000000;

    const LogedUser = req.LogedUser;
    const Organization = LogedUser && LogedUser.Doctor ? LogedUser.Doctor.Organization : null;
    // download file
    var filePath = 'outputExcel/NegdsenBurtgel.xlsx';

    if (LogedUser) {
      var workBook = new ExcelJS.Workbook();
      workBook = await workBook.xlsx.readFile('inputExcel/NegdsenBurtgel.xlsx');

      const newWorkSheet = workBook.getWorksheet('Sheet1');

      var RowsData = [];
      if (Organization) {
        const { ReportData, Total } = await CustomReportUnitData(
          LogedUser,
          Organization,
          Option,
          true
        );
        RowsData = ReportData;
      }

      RowsData = await ConvertUnitData(RowsData);

      console.log('Begin loop');
      // if (RowsData.length > 0) {
      //   for (var i = 0; i < RowsData.length; i++) {
      //     for (var j = 0; j < RowsData[i].length; j++) {
      //       newWorkSheet.addRow(RowsData[i][j]);
      //       console.log("Looping");
      //     }
      //   }
      // }
      const rows = [];
      RowsData.map((d) => {
        const addRowArray = [];
        Object.keys(d).forEach((e) => {
          addRowArray.push(d[e]);
        });
        rows.push(addRowArray);
        // await newWorkSheet.addRow(addRowArray);
      });

      // console.log("excel", rows.length);
      newWorkSheet.addRows(rows);

      console.log('End loop');

      await workBook.xlsx.writeFile(path.resolve(filePath));
    }

    res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return res.download(filePath);
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

// Soum Data
async function SoumReportExportExcel(req, res) {
  try {
    var Option = req.body.SearchOption;
    Option.limit = 1000000;

    const LogedUser = req.LogedUser;
    const Organization = LogedUser && LogedUser.Doctor ? LogedUser.Doctor.Organization : null;

    const AppId = LogedUser ? LogedUser.AppId : '1';
    const UserId = LogedUser ? LogedUser.Id : null;

    var filePath = 'outputExcel/Soum1.xlsx';
    var workBook = new ExcelJS.Workbook();
    workBook = await workBook.xlsx.readFile('inputExcel/Soum1.xlsx');

    const newWorkSheet = workBook.getWorksheet('Sheet1');

    var RowsData = [];

    if (Organization) {
      const { ReportData, Total } = await CustomReportSoumData(
        LogedUser,
        Organization,
        Option,
        true
      );
      RowsData = RowsData.concat(ReportData);
    }

    RowsData = await ConvertSoumData(RowsData);

    // Excel Add Row
    const rows = [];
    RowsData.map((d) => {
      const addRowArray = [];
      Object.keys(d).forEach((e) => {
        addRowArray.push(d[e]);
      });
      rows.push(addRowArray);
    });

    console.log('excel', rows.length);
    newWorkSheet.addRows(rows);

    await workBook.xlsx.writeFile(path.resolve(filePath));

    res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return res.download(filePath);
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

// Month news
async function MonthNewsExportExcel(req, res) {
  try {
    // body params
    var Option = req.body.SearchOption;
    if (Option) Option.limit = 1000000;
    const LogedUser = req.LogedUser;
    const AppId = LogedUser ? LogedUser.AppId : '1';
    const UserId = LogedUser ? LogedUser.Id : null;
    const Organization = LogedUser && LogedUser.Doctor ? LogedUser.Doctor.Organization : null;

    var filePath = 'outputExcel/MonthNewsExportExcel.xlsx';
    var workBook = new ExcelJS.Workbook();
    workBook = await workBook.xlsx.readFile('inputExcel/monthnews.xlsx');

    const newWorkSheet = workBook.getWorksheet('Sheet1');

    var RowsData = [];

    if (Organization) {
      const { ReportData, Total } = await CustomReportMonthData(
        LogedUser,
        Organization,
        Option,
        true
      );
      RowsData = RowsData.concat(ReportData);
    }

    RowsData = await ConvertMonthData(RowsData);

    // Excel Add Row
    const rows = [];
    RowsData.map((d) => {
      const addRowArray = [];
      Object.keys(d).forEach((e) => {
        addRowArray.push(d[e]);
      });
      rows.push(addRowArray);
    });

    console.log('excel', rows.length);
    newWorkSheet.addRows(rows);

    await workBook.xlsx.writeFile(path.resolve(filePath));

    res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return res.download(filePath);
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

// Find Patient data for Update

module.exports = router;
