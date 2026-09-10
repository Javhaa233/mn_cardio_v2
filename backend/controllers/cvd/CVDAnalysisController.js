const express = require('express');
const router = express.Router();

const { Models, Op, sequelize } = require('../../config/DB');

const BaseControllerHelper = require('../../helper/BaseControllerHelper');
const ObjectHelper = require('../../helper/ObjectHelper');

// routes
router.post('/GetAnalyzeData1', GetAnalyzeData1);
router.post('/GetAnalyzeData2', GetAnalyzeData2);
router.post('/GetAnalyzeData3', GetAnalyzeData3);
router.post('/GetAnalyzeData4', GetAnalyzeData4);
router.post('/GetAnalyzeData5', GetAnalyzeData5);
router.post('/GetAnalyzeData6', GetAnalyzeData6);
router.post('/GetAnalyzeData7', GetAnalyzeData7);
router.post('/GetAnalyzeData8', GetAnalyzeData8);
router.post('/GetAnalyzeData9', GetAnalyzeData9);
router.post('/GetAnalyzeData10', GetAnalyzeData10);
router.post('/GetAnalyzeData11', GetAnalyzeData11);
router.post('/GetAnalyzeData12', GetAnalyzeData12);
router.post('/GetAnalyzeData13', GetAnalyzeData13);
router.post('/GetAnalyzeData14', GetAnalyzeData14);
router.post('/GetAnalyzeData15', GetAnalyzeData15);

// Байгууллагад харьяалагдах хүн амын тоо
async function GetCountData({ Year, LogedUser }) {
  var PopulationData = null;

  const currentYear = Year ? Year : new Date().getFullYear() + '';
  // var Year = Year ? Year : "2021";

  var Organization = null;
  var OrganizationId = null;
  var ParentOrganizationId = null;
  var OrgLevel = null;

  var Total18to39Age = 0;
  var Total40upAge = 0;
  const OrgIds = [];

  if (LogedUser) {
    if (LogedUser.Doctor && LogedUser.Doctor.Organization) {
      Organization = LogedUser.Doctor.Organization;
      OrganizationId = Organization ? Organization.Id : null;
      ParentOrganizationId =
        Organization && Organization.ParentOrganizationId
          ? Organization.ParentOrganizationId
          : null;
      OrgLevel = Organization ? Organization.level : null;
    }

    // 2 р түвшний эмнэлэг бол харьяалагдах сум, өрхийн эмнэлгүүдийн мэдээллийг харах боломжтой
    // if (OrgLevel + "" === "2") {
    //   OrgIds.push(OrganizationId);
    //   let ChildOrganizations = await Models.Organization.findAll({
    //     where: { ParentOrganizationId: OrganizationId, level: "1" },
    //     attributes: ["Id"],
    // raw: true,
    //
    //   });

    //   if (ChildOrganizations && ChildOrganizations.length > 0) {
    //     ChildOrganizations.forEach((e, key) => {
    //       OrgIds.push(e.Id);
    //     });
    //   }
    // }

    // 1-р түвшний эмнэлэг бол зөвхөн өөрийн харьяаны хяналтын мэдээллийг харах
    // if (OrgLevel === null || OrgLevel + "" === "1") {
    OrgIds.push(OrganizationId);
    // }

    if (OrganizationId) {
      let whereOption = { Year: currentYear };

      // if (OrgLevel + "" !== "3") {
      whereOption = { ...whereOption, OrganizationId: { [Op.in]: OrgIds } };
      // }

      PopulationData = await Models.CVDHunAm.findOne({
        where: whereOption,
        attributes: ['Id', 'Er18to39Age', 'Em18to39Age', 'Er40upAge', 'Em40upAge'],
        raw: true,
      });
      if (PopulationData) {
        Total18to39Age =
          parseInt(PopulationData.Er18to39Age) + parseInt(PopulationData.Em18to39Age);
        Total40upAge = parseInt(PopulationData.Er40upAge) + parseInt(PopulationData.Em40upAge);
      }

      return { Total18to39Age, Total40upAge };
    }
  } else {
    return { Total18to39Age, Total40upAge };
  }
}

async function GetMonitoringData({ StartDate, EndDate, OrgLevel, OrganizationId }) {
  try {
    const OrgIds = [];
    const startDate = StartDate ? StartDate : '2021-08-01';
    const endDate = EndDate ? EndDate : ObjectHelper.getDateYMD();
    // 2 р түвшний эмнэлэг бол харьяалагдах сум, өрхийн эмнэлгүүдийн мэдээллийг харах боломжтой
    // if (OrgLevel + "" === "2") {
    //   OrgIds.push(OrganizationId);
    //   let ChildOrganizations = await Models.Organization.findAll({
    //     where: { ParentOrganizationId: OrganizationId, level: "1" },
    //     attributes: ["Id"],
    //     raw: true,
    //   });

    //   if (ChildOrganizations && ChildOrganizations.length > 0) {
    //     ChildOrganizations.forEach((e, key) => {
    //       OrgIds.push(e.Id);
    //     });
    //   }
    // }

    // 1-р түвшний эмнэлэг бол зөвхөн өөрийн харьяаны хяналтын мэдээллийг харах
    // if (OrgLevel === null || OrgLevel + "" === "1") {
    OrgIds.push(OrganizationId);
    // }

    var CVDMonitoringData = [];

    let Where = {};
    Where = { OrganizationId: { [Op.in]: OrgIds } };

    if (startDate && endDate) {
      Where.CreateDate = {
        [Op.between]: [new Date(), new Date(endDate)],
      };
    }

    if (OrganizationId) {
      CVDMonitoringData = await Models.vwCVDReportForSoum.findAll({
        where: Where,
        attributes: ['Id', 'PatRegNo', 'CreateDate', 'PatAge', 'Status', 'IsActive'],
        raw: true,
        logging: (q) => console.log(q),
      });
    }

    return CVDMonitoringData;
  } catch (ex) {
    console.log(ex);
    return [];
  }
}

// 1.	Зорилтот хүн амын дотор ЗСӨ-ний эрсдэлээ тодорхойлуулсан 18-39 ба 40 ба түүнээс дээш насны хүмүүсийн эзлэх хувь -
async function GetAnalyzeData1(req, res) {
  try {
    var result = { Success: true, Message: '', Data: {} };
    const LogedUser = req.LogedUser;
    const { StartDate, EndDate } = req.body;
    // const UserId = LogedUser ? LogedUser.Id : null;
    const OrganizationId =
      LogedUser && LogedUser.Doctor && LogedUser.Doctor.Organization
        ? LogedUser.Doctor.Organization.Id
        : null;
    const OrgLevel =
      LogedUser && LogedUser.Doctor && LogedUser.Doctor.Organization
        ? LogedUser.Doctor.Organization.level
        : null;

    var countOf18 = 0;
    var countOf40 = 0;

    var inMonitoring18 = 0;
    var inMonitoring40 = 0;

    var percentof18 = 0;
    var percentof40 = 0;

    // Харьяалагдах хүн амын мэдээлэл татах
    const { Total18to39Age, Total40upAge } = await GetCountData({ LogedUser });
    countOf18 = parseInt(Total18to39Age);
    countOf40 = parseInt(Total40upAge);

    // Хяналтанд хамрагдсан хүмүүсийн мэдээлэл
    const CVDMonitoringData = await GetMonitoringData({
      StartDate,
      EndDate,
      OrgLevel,
      OrganizationId,
    });
    CVDMonitoringData.forEach((e, key) => {
      e.Age < 40 && inMonitoring18++;
      e.Age >= 40 && inMonitoring40++;
    });

    percentof18 = countOf18 > 0 ? (inMonitoring18 * 100) / countOf18 : 0;
    percentof40 = countOf40 > 0 ? (inMonitoring40 * 100) / countOf40 : 0;

    var dataRowsDaralt = ['18-39 нас', percentof18.toFixed(2)];
    var dataColumnsDaralt = ['40-дээш нас', percentof40.toFixed(2)];

    result.Message = 'Successfully';
    result.Data = [dataRowsDaralt, dataColumnsDaralt];
    return res.send(result);
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

// 2.	Зорилтот хүн амын дотор ЗСӨ-ний түүхтэй бөгөөд эмчилгээ хийлгэж эхэлсэн өвчтөнүүдийн эзлэх хувь
async function GetAnalyzeData2(req, res) {
  try {
    var result = {
      Success: true,
      Message: 'Мэдээлэл амжилттай татлаа',
      Data: {},
      DataId: null,
    };
    const LogedUser = req.LogedUser;
    const { StartDate, EndDate } = req.body;
    if (LogedUser) {
      const UserId = LogedUser ? LogedUser.Id : null;
      const OrganizationId =
        LogedUser && LogedUser.Doctor && LogedUser.Doctor.Organization
          ? LogedUser.Doctor.Organization.Id
          : null;
      const OrgLevel =
        LogedUser && LogedUser.Doctor && LogedUser.Doctor.Organization
          ? LogedUser.Doctor.Organization.level
          : null;

      var countOf18 = 0;
      var countOf40 = 0;

      var history18 = 0;
      var history40 = 0;

      var inMonitoring18 = 0;
      var inMonitoring40 = 0;

      // Харьяалагдах хүн амын мэдээлэл татах
      var { Total18to39Age, Total40upAge } = await GetCountData({ LogedUser });
      countOf18 = parseInt(Total18to39Age);
      countOf40 = parseInt(Total40upAge);

      // Хяналтанд хамрагдсан хүний тоо
      const CVDMonitoringData = await GetMonitoringData({
        StartDate,
        EndDate,
        OrgLevel,
        OrganizationId,
      });

      CVDMonitoringData.forEach((e, key) => {
        e.Age < 40 && inMonitoring18++;
        e.Age >= 40 && inMonitoring40++;
      });

      // Тооцоолох
      history18 = (countOf18 * 14) / 100;
      history40 = (countOf40 * 14) / 100;

      var inMonitoring18percent = history18 > 0 ? (inMonitoring18 * 100) / history18 : 0;
      var inMonitoring40percent = history40 > 0 ? (inMonitoring40 * 100) / history40 : 0;

      var dataRowsDaralt = ['18-39 нас', inMonitoring18percent.toFixed(2)];
      var dataColumnsDaralt = ['40-дээш нас', inMonitoring40percent.toFixed(2)];

      result.Data = [dataRowsDaralt, dataColumnsDaralt];
    }
    return res.send(result);
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

// 3.	Зорилтот хүн амын дотор ЗСӨ-ний 10 жилийн эрсдэл нь 30 ба түүнээс дээш (≥30%) хувьтай, эмчилгээнд хамрагдаж эхэлсэн өвчтөний эзлэх хувь
async function GetAnalyzeData3(req, res) {
  try {
    var result = {
      Success: true,
      Message: 'Мэдээлэл амжилттай татлаа',
      Data: {},
      DataId: null,
    };
    const LogedUser = req.LogedUser;
    const { StartDate, EndDate } = req.body;
    const UserId = LogedUser ? LogedUser.Id : null;
    const OrganizationId =
      LogedUser && LogedUser.Doctor && LogedUser.Doctor.Organization
        ? LogedUser.Doctor.Organization.Id
        : null;

    var potentialPercent = 19.3;
    var countOf18 = 0;
    var countOf40 = 0;
    var inMonitoring18 = 0;
    var inMonitoring40 = 0;

    var countOfRisked18 = 0;
    var countOfRisked40 = 0;

    // Харьяалагдах хүн амын мэдээлэл татах
    var { Total18to39Age, Total40upAge } = await GetCountData({ LogedUser });
    countOf18 = parseInt(Total18to39Age);
    countOf40 = parseInt(Total40upAge);

    // Хяналтанд хамрагдсан хүний тоо
    var CVDMonitoringData = null;

    CVDMonitoringData = await Models.vwCVDReportForSoum.findAll({
      where: { OrganizationId },
      attributes: ['Id', 'PatRegNo', 'CreateDate', 'Age'],
      raw: true,
    });

    if (CVDMonitoringData && CVDMonitoringData.length > 0) {
      for (var i = 0; i < CVDMonitoringData.length; i++) {
        var MonitoringId = null;
        var LastHistoryData = {};
        var LastRiskData = {};
        var LastBodySizeData = {};

        MonitoringId = CVDMonitoringData[i] && CVDMonitoringData[i].Id;
        // Last Datas
        const RiskData = await Models.CVDRisk.findOne({
          where: { MonitoringId },
          attributes: ['Id'],
          order: [['Id', 'DESC']],
          raw: true,
          // logging: (q) => console.log(q),
        });

        // Last data get by PK
        if (RiskData) {
          const Id = RiskData.Id;
          if (Id) {
            LastRiskData = await Models.CVDRisk.findByPk(Id, {
              attributes: ['Risk'],
              raw: true,
            });

            if (LastRiskData.Risk + '' === '5') {
              CVDMonitoringData[i].Age < 40 && countOfRisked18++;
              CVDMonitoringData[i].Age >= 40 && countOfRisked40++;
            }
          }
        }
      }
    }

    // Тооцоолох

    // var potential40 = (countOf40 * potentialPercent) / 100;
    var potential18 = (countOf18 * potentialPercent) / 100;
    var potential40 = (countOf40 * potentialPercent) / 100;

    var inMonitoring18percent = potential18 > 0 ? (countOfRisked18 * 100) / potential18 : 0;
    var inMonitoring40percent = potential40 > 0 ? (countOfRisked40 * 100) / potential40 : 0;

    var dataRowsDaralt = ['18-39 нас', inMonitoring18percent.toFixed(2)];

    var dataColumnsDaralt = ['40-дээш нас', inMonitoring40percent.toFixed(2)];

    result.Data = [dataRowsDaralt, dataColumnsDaralt];
    return res.send(result);
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

// 4.	Зорилтот хүн амын дунд АГ-тэй байж болзошгүй нийт хүмүүсийн дотор АГ-ийн улмаас эмчилгээ хийлгэж эхэлсэн хүний эзлэх хувь
async function GetAnalyzeData4(req, res) {
  try {
    var result = {
      Success: true,
      Message: 'Мэдээлэл амжилттай татлаа',
      Data: {},
      DataId: null,
    };
    const LogedUser = req.LogedUser;
    const { StartDate, EndDate } = req.body;
    const UserId = LogedUser ? LogedUser.Id : null;
    const OrganizationId =
      LogedUser && LogedUser.Doctor && LogedUser.Doctor.Organization
        ? LogedUser.Doctor.Organization.Id
        : null;

    var potentialPercent = 22.6;
    var countOf18 = 0;
    var countOf40 = 0;

    // Харьяалагдах хүн амын мэдээлэл татах
    var { Total18to39Age, Total40upAge } = await GetCountData({ LogedUser });
    countOf18 = parseInt(Total18to39Age);
    countOf40 = parseInt(Total40upAge);

    // var allHunAm = countOf18 + countOf40;
    // var countOfRisked = 0;
    var countOfRisked18 = 0;
    var countOfRisked40 = 0;

    // Хяналтанд хамрагдсан хүний тоо
    const CVDMonitoringData = await Models.vwCVDReportForSoum.findAll({
      where: { OrganizationId },
      attributes: ['Id', 'PatRegNo', 'CreateDate', 'Age'],
      raw: true,
    });

    if (CVDMonitoringData && CVDMonitoringData.length > 0) {
      for (var i = 0; i < CVDMonitoringData.length; i++) {
        var MonitoringId = null;
        let Age = null;
        var LastHistoryData = {};
        var LastBodySizeData = {};

        MonitoringId = CVDMonitoringData[i] && CVDMonitoringData[i].Id;
        Age = CVDMonitoringData[i] && CVDMonitoringData[i].Age;

        // Last Datas
        const HistoryData = await Models.CVDHistory.findOne({
          where: { MonitoringId },
          attributes: ['Id'],
          order: [['Id', 'DESC']],
          raw: true,
          // logging: (q) => console.log(q),
        });

        // const [BodySizeData, bodySizedata] = await sequelize.query(
        //   "SELECT TOP 1 Id FROM CVDBodySize WHERE MonitoringId=" +
        //     MonitoringId +
        //     " ORDER BY Id DESC"
        // );

        // Last data get by PK
        if (HistoryData) {
          const Id = HistoryData.Id;
          if (Id) {
            LastHistoryData = await Models.CVDHistory.findByPk(Id, {
              attributes: ['Id', 'IsDaraltEm'],
              raw: true,
            });

            // if (LastHistoryData.IsDaraltEm === "y") countOfRisked++;

            if (LastHistoryData && LastHistoryData.IsDaraltEm === 'y' && Age) {
              Age < 40 && countOfRisked18++;
              Age >= 40 && countOfRisked40++;
            }
          }
        }
      }
    }

    // Тооцоолох

    // var potential40 = (countOf40 * potentialPercent) / 100;
    var potential18 = (countOf18 * potentialPercent) / 100;
    var potential40 = (countOf40 * potentialPercent) / 100;

    var inMonitoring18percent = potential18 > 0 ? (countOfRisked18 * 100) / potential18 : 0;
    var inMonitoring40percent = potential40 > 0 ? (countOfRisked40 * 100) / potential40 : 0;

    var dataRowsDaralt = ['18-39 нас', inMonitoring18percent.toFixed(2)];

    var dataColumnsDaralt = ['40-дээш нас', inMonitoring40percent.toFixed(2)];

    result.Data = [dataRowsDaralt, dataColumnsDaralt];
    return res.send(result);
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

// 5.	АГ- тэй бүртгэгдсэн өвчтөнүүдийн дотор АД нь <130/80 ба <140/90 тэй өвчтөний эзлэх хувь
async function GetAnalyzeData5(req, res) {
  try {
    var result = {
      Success: true,
      Message: 'Мэдээлэл амжилттай татлаа',
      Data: {},
      DataId: null,
    };
    const LogedUser = req.LogedUser;
    const { StartDate, EndDate } = req.body;
    const UserId = LogedUser ? LogedUser.Id : null;
    const OrganizationId =
      LogedUser && LogedUser.Doctor && LogedUser.Doctor.Organization
        ? LogedUser.Doctor.Organization.Id
        : null;

    var countOfAG = 0;
    var countOf130and80 = 0;
    var countOf140and90 = 0;
    var countOf18 = 0;
    var countOf40 = 0;

    var inMonitoring18percent = 0;
    var inMonitoring40percent = 0;

    // Харьяалагдах хүн амын мэдээлэл татах
    var { Total18to39Age, Total40upAge } = await GetCountData({ LogedUser });
    countOf18 = parseInt(Total18to39Age);
    countOf40 = parseInt(Total40upAge);

    // Хяналтанд хамрагдсан хүний тоо
    // var CVDMonitoringData = null;

    const CVDMonitoringData = await Models.vwCVDReportForSoum.findAll({
      where: { OrganizationId },
      raw: true,
    });

    // CVDMonitoringData = JSON.parse(JSON.stringify(CVDMonitoringData));

    if (CVDMonitoringData && CVDMonitoringData.length > 0) {
      for (var i = 0; i < CVDMonitoringData.length; i++) {
        var MonitoringId = null;
        var LastHistoryData = {};
        var LastBodySizeData = {};

        MonitoringId = CVDMonitoringData[i] && CVDMonitoringData[i].Id;
        // Last Datas
        // var [HistoryData, historyData] = await sequelize.query(
        //   "SELECT TOP 1 Id FROM CVDHistory WHERE MonitoringId=" +
        //     MonitoringId +
        //     " ORDER BY Id DESC"
        // );
        // HistoryData = JSON.parse(JSON.stringify(HistoryData));

        const HistoryData = await Models.CVDHistory.findOne({
          where: { MonitoringId },
          attributes: ['Id'],
          order: [['Id', 'DESC']],
          raw: true,
          // logging: (q) => console.log(q),
        });

        // var [, bodySizedata] = await sequelize.query(
        //   "SELECT TOP 1 Id FROM  WHERE MonitoringId=" +
        //     MonitoringId +
        //     " ORDER BY Id DESC"
        // );
        // BodySizeData = JSON.parse(JSON.stringify(BodySizeData));

        const BodySizeData = await Models.CVDBodySize.findOne({
          where: { MonitoringId },
          attributes: ['Id'],
          order: [['Id', 'DESC']],
          raw: true,
          // logging: (q) => console.log(q),
        });

        // Last data get by PK
        if (HistoryData) {
          const Id = HistoryData.Id;
          if (Id) {
            LastHistoryData = await Models.CVDHistory.findByPk(Id, {
              attributes: ['IsDaraltEm'],
              raw: true,
            });
            // LastHistoryData = JSON.parse(JSON.stringify(LastHistoryData));
          }
        }

        // Last data get by PK
        if (BodySizeData) {
          const Id = BodySizeData.Id;
          if (Id) {
            LastBodySizeData = await Models.CVDBodySize.findByPk(Id, {
              attributes: ['DaraltDeed', 'DaraltDood'],
              raw: true,
            });
            // LastBodySizeData = JSON.parse(JSON.stringify(LastBodySizeData));
          }
        }
        // Add Last datas
        CVDMonitoringData[i] = {
          ...CVDMonitoringData[i],
          ...LastHistoryData,
          ...LastBodySizeData,
        };
      }
    }

    CVDMonitoringData &&
      CVDMonitoringData.forEach((e, key) => {
        e.IsDaraltEm === 'y' && countOfAG++;
        var DaraltDeed = 0;
        var DaraltDood = 0;

        // Дээд, доод даралтын мэдээлэл
        DaraltDeed = isNaN(parseInt(e.DaraltDeed)) ? 0 : parseInt(e.DaraltDeed);
        DaraltDood = isNaN(parseInt(e.DaraltDood)) ? 0 : parseInt(e.DaraltDood);

        // Дээд, доод даралтын мэдээллийг шалгаад хувьсагчаа өсгөх
        e.IsDaraltEm === 'y' && DaraltDeed <= 130 && DaraltDood <= 80 && countOf130and80++;
        e.IsDaraltEm === 'y' &&
          DaraltDeed > 130 &&
          DaraltDeed <= 140 &&
          DaraltDood > 80 &&
          DaraltDood <= 90 &&
          countOf140and90++;
      });

    inMonitoring18percent = countOfAG > 0 ? (countOf130and80 * 100) / countOfAG : 0;
    inMonitoring40percent = countOfAG > 0 ? (countOf140and90 * 100) / countOfAG : 0;

    var dataRowsDaralt = ['<130/80', inMonitoring18percent.toFixed(2)];
    var dataColumnsDaralt = ['<140/90', inMonitoring40percent.toFixed(2)];
    result.Data = [dataRowsDaralt, dataColumnsDaralt];
    return res.send(result);
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

// 6.	Зорилтот хүн амын дунд ЧШ-тэй байж болзошгүй нийт хүмүүсийн дотор Чихрийн шижинтэй, эмчилгээнд хамрагдсан өвчтөнүүдийн эзлэх хувь
async function GetAnalyzeData6(req, res) {
  try {
    var result = {
      Success: true,
      Message: 'Мэдээлэл амжилттай татлаа',
      Data: {},
      DataId: null,
    };
    const LogedUser = req.LogedUser;
    const { StartDate, EndDate } = req.body;
    const UserId = LogedUser ? LogedUser.Id : null;
    const OrganizationId =
      LogedUser && LogedUser.Doctor && LogedUser.Doctor.Organization
        ? LogedUser.Doctor.Organization.Id
        : null;

    var potentialPercent = 9.7;
    var countOf18 = 0;
    var countOf40 = 0;

    var inMonitoring18 = 0;
    var inMonitoring40 = 0;

    // Харьяалагдах хүн амын мэдээлэл татах
    var { Total18to39Age, Total40upAge } = await GetCountData({ LogedUser });
    countOf18 = parseInt(Total18to39Age);
    countOf40 = parseInt(Total40upAge);

    // var allHunAm = countOf18 + countOf40;
    // var countOfRisked = 0;
    var countOfRisked18 = 0;
    var countOfRisked40 = 0;
    // Хяналтанд хамрагдсан хүний тоо
    const CVDMonitoringData = await Models.vwCVDReportForSoum.findAll({
      where: { OrganizationId },
      attributes: ['Id', 'PatRegNo', 'CreateDate', 'Age'],
      raw: true,
    });

    if (CVDMonitoringData && CVDMonitoringData.length > 0) {
      for (var i = 0; i < CVDMonitoringData.length; i++) {
        var MonitoringId = null;
        var LastHistoryData = {};

        MonitoringId = CVDMonitoringData[i] && CVDMonitoringData[i].Id;
        // Last Datas
        // var [HistoryData, historyData] = await sequelize.query(
        //   "SELECT TOP 1 Id FROM CVDHistory WHERE MonitoringId=" +
        //     MonitoringId +
        //     " ORDER BY Id DESC"
        // );
        const HistoryData = await Models.CVDHistory.findOne({
          where: { MonitoringId },
          attributes: ['Id'],
          order: [['Id', 'DESC']],
          raw: true,
          // logging: (q) => console.log(q),
        });

        // Last data get by PK
        if (HistoryData) {
          const Id = HistoryData.Id;
          if (Id) {
            LastHistoryData = await Models.CVDHistory.findByPk(Id, {
              attributes: ['IsDiabeticEm'],
              raw: true,
            });

            if (LastHistoryData.IsDiabeticEm === 'y') {
              CVDMonitoringData[i].Age < 40 && countOfRisked18++;
              CVDMonitoringData[i].Age >= 40 && countOfRisked40++;
            }
          }
        }
      }
    }

    // Тооцоолох

    // var potential40 = (countOf40 * potentialPercent) / 100;

    var potential18 = (countOf18 * potentialPercent) / 100;
    var potential40 = (countOf40 * potentialPercent) / 100;

    var inMonitoring18percent = potential18 > 0 ? (countOfRisked18 * 100) / potential18 : 0;
    var inMonitoring40percent = potential40 > 0 ? (countOfRisked40 * 100) / potential40 : 0;

    var dataRowsDaralt = ['18-39 нас', inMonitoring18percent.toFixed(2)];

    var dataColumnsDaralt = ['40-дээш нас', inMonitoring40percent.toFixed(2)];

    result.Data = [dataRowsDaralt, dataColumnsDaralt];
    return res.send(result);
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

// 7.	Зүрхний шигдээс, тархины харвалтын хоёрдогч урьдчилан сэргийлэх эмчилгээ хийлгэж байгаа ЗСӨ-ний түүхтэй идэвхтэй өвчтөнүүдийн хувь
async function GetAnalyzeData7(req, res) {
  try {
    var result = {
      Success: true,
      Message: 'Мэдээлэл амжилттай татлаа',
      Data: {},
      DataId: null,
    };
    const LogedUser = req.LogedUser;
    const { StartDate, EndDate } = req.body;
    const UserId = LogedUser ? LogedUser.Id : null;
    const OrganizationId =
      LogedUser && LogedUser.Doctor && LogedUser.Doctor.Organization
        ? LogedUser.Doctor.Organization.Id
        : null;
    const OrgLevel =
      LogedUser && LogedUser.Doctor && LogedUser.Doctor.Organization
        ? LogedUser.Doctor.Organization.level
        : null;

    // •	ЗСӨ-ний түүхтэй  бүртгэгдсэн нийт өвчтөний тоо – 680
    var AllMonitoringCount = 0;
    // •	Статин, аспирин, АД буулгах эм хэрэглэж байгаа ЗСӨ-ний түүхтэй бүртгэгдсэн өвчтөний тоо – 390
    var ReqMonitoringCount = 0;

    // Хяналтанд хамрагдсан идэвхитэй хүний тоо
    const CVDMonitoringData = await GetMonitoringData({
      StartDate,
      EndDate,
      OrgLevel,
      OrganizationId,
    });
    CVDMonitoringData &&
      CVDMonitoringData.forEach((e, key) => {
        (e.Status === 'activated' || e.Status === 'out_control') && AllMonitoringCount++;
      });

    if (CVDMonitoringData && CVDMonitoringData.length > 0) {
      for (var i = 0; i < CVDMonitoringData.length; i++) {
        var MonitoringId = null;
        var LastManagement = {};

        MonitoringId = CVDMonitoringData[i] && CVDMonitoringData[i].Id;
        // Last Datas
        // var [ManagementData, managementData] = await sequelize.query(
        //   "SELECT TOP 1 Id FROM  WHERE MonitoringId=" +
        //     MonitoringId +
        //     " ORDER BY Id DESC"
        // );
        //  = JSON.parse(JSON.stringify(ManagementData));

        const ManagementData = await Models.CVDManagement.findOne({
          where: { MonitoringId },
          attributes: ['Id'],
          order: [['Id', 'DESC']],
          raw: true,
          // logging: (q) => console.log(q),
        });

        // Last data get by PK
        if (ManagementData) {
          const Id = ManagementData.Id;
          if (Id) {
            LastManagement = await Models.CVDManagement.findByPk(Id, {
              attributes: ['PreventiveTreatment'],
              raw: true,
            });
            // LastManagement = JSON.parse(JSON.stringify(LastManagement));
          }
        }

        // Add Last datas
        CVDMonitoringData[i] = {
          ...CVDMonitoringData[i],
          ...LastManagement,
        };
      }
    }

    // Require count in Monitoring
    CVDMonitoringData &&
      CVDMonitoringData.forEach((e) => {
        e.PreventiveTreatment === 'y' && ReqMonitoringCount++;
      });
    //Хоёрдогч урьдчилан сэргийлэх эмчилгээнд хамрагдсан ЗСӨ-ний түүхтэй өвчтөнүүдийн эзлэх хувь/
    var InResultPercent =
      AllMonitoringCount > 0 ? (ReqMonitoringCount * 100) / AllMonitoringCount : 0;

    var dataRowsDaralt = ['Иргэнүүдийн эзлэх хувь', InResultPercent.toFixed(2)];

    result.Data = [dataRowsDaralt];
    return res.send(result);
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

// 8. Статинаар эмчлэгдэж байгаа ЗСӨ-ний ≥ 30% эрсдэл бүхий идэвхтэй өвчтөнүүдийн хувь (ЗСӨ-ий түүхтэй өвчтөнүүдийг оролцуулахгүй)
async function GetAnalyzeData8(req, res) {
  try {
    var result = {
      Success: true,
      Message: 'Мэдээлэл амжилттай татлаа',
      Data: {},
      DataId: null,
    };
    const LogedUser = req.LogedUser;
    const UserId = LogedUser ? LogedUser.Id : null;

    const OrganizationId =
      LogedUser && LogedUser.Doctor && LogedUser.Doctor.Organization
        ? LogedUser.Doctor.Organization.Id
        : null;

    //•	Статинаар эмчлэх боломжтой ЗСӨ-ний ≥ 30% эрсдэлтэй идэвхтэй өвчтөний тоо – 398
    var Risk5Count = 0;

    //•	Статинаар эмчлүүлж буй ЗСӨ-ний ≥ 30% эрсдэлтэй бүртгэгдсэн өвчтөнүүдийн тоо – 45
    var InStatinCount = 0;

    // Хяналтанд хамрагдсан хүний тоо
    // var CVDMonitoringData = null;
    const CVDMonitoringData = await Models.vwCVDReportForSoum.findAll({
      where: { OrganizationId },
      attributes: ['Id'],
      raw: true,
    });

    if (CVDMonitoringData && CVDMonitoringData.length > 0) {
      for (var i = 0; i < CVDMonitoringData.length; i++) {
        var LastRiskData = {};
        var LastControlData = {};

        const MonitoringId = CVDMonitoringData[i] && CVDMonitoringData[i].Id;
        // Last Datas
        const RiskData = await Models.CVDRisk.findOne({
          where: { MonitoringId, Risk: 5 },
          attributes: ['Id'],
          order: [['Id', 'DESC']],
          raw: true,
          // logging: (q) => console.log(q),
        });

        const ControlData = await Models.CVDControlAndTransition.findOne({
          where: { MonitoringId },
          attributes: ['Id'],
          order: [['Id', 'DESC']],
          raw: true,
          // logging: (q) => console.log(q),
        });

        // Last data get by PK
        if (RiskData) {
          const Id = RiskData.Id;
          if (Id) {
            LastRiskData = await Models.CVDRisk.findByPk(Id, {
              attributes: ['Risk'],
              raw: true,
            });
          }
        }

        // CVDControlAndTransition
        if (ControlData) {
          const Id = ControlData.Id;
          if (Id) {
            LastControlData = await Models.CVDControlAndTransition.findByPk(Id, {
              attributes: ['EmiinTorol'],
              raw: true,
            });
          }
        }

        // Add Last datas
        if (RiskData) {
          CVDMonitoringData[i] = {
            ...CVDMonitoringData[i],
            ...LastRiskData,
            ...LastControlData,
          };
        }
      }
    }

    CVDMonitoringData &&
      (await CVDMonitoringData.forEach((e) => {
        e.Risk + '' === '5' && Risk5Count++;
        e.Risk + '' === '5' && e.EmiinTorol === '1' && InStatinCount++;
      }));

    //ЗСӨ-ний ≥ 30% эрсдэлтэй Статин хэрэглэж байгаа өвчтөнүүдийн хувь
    var InStatinPercent = Risk5Count > 0 ? (InStatinCount * 100) / Risk5Count : 0;

    var dataRowsDaralt = ['Иргэнүүдийн эзлэх хувь', InStatinPercent.toFixed(2)];

    result.Data = [dataRowsDaralt];
    return res.send(result);
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

// 9. ЗСӨ-ний эрсдэлээ сүүлчийн үзлэгээр зөв тодорхойлуулсан ЗСӨ-ний эрсдэлтэй идэвхтэй өвчтөний хувь
async function GetAnalyzeData9(req, res) {
  try {
    var result = {
      Success: true,
      Message: 'Мэдээлэл амжилттай татлаа',
      Data: {},
      DataId: null,
    };
    const LogedUser = req.LogedUser;
    const { StartDate, EndDate } = req.body;
    const UserId = LogedUser ? LogedUser.Id : null;
    const OrganizationId =
      LogedUser && LogedUser.Doctor && LogedUser.Doctor.Organization
        ? LogedUser.Doctor.Organization.Id
        : null;
    const OrgLevel =
      LogedUser && LogedUser.Doctor && LogedUser.Doctor.Organization
        ? LogedUser.Doctor.Organization.level
        : null;

    var countOf18 = 0;
    var countOf40 = 0;

    var inMonitoring18 = 0;
    var inMonitoring40 = 0;

    var percentof18 = 0;
    var percentof40 = 0;

    // Харьяалагдах хүн амын мэдээлэл татах
    const { Total18to39Age, Total40upAge } = await GetCountData({ LogedUser });
    countOf18 = parseInt(Total18to39Age);
    countOf40 = parseInt(Total40upAge);

    // Хяналтанд хамрагдсан хүмүүсийн мэдээлэл
    const CVDMonitoringData = await GetMonitoringData({
      StartDate,
      EndDate,
      OrgLevel,
      OrganizationId,
    });
    CVDMonitoringData.forEach((e, key) => {
      e.Age < 40 && e.Status === 'activated' && e.IsActive === '1' && inMonitoring18++;
      e.Age >= 40 && e.Status === 'activated' && e.IsActive === '1' && inMonitoring40++;
    });

    percentof18 = countOf18 > 0 ? (inMonitoring18 * 100) / countOf18 : 0;
    percentof40 = countOf40 > 0 ? (inMonitoring40 * 100) / countOf40 : 0;

    var dataRowsDaralt = ['18-39 нас', percentof18.toFixed(2)];
    var dataColumnsDaralt = ['40-дээш нас', percentof40.toFixed(2)];

    result.Data = [dataRowsDaralt, dataColumnsDaralt];
    return res.send(result);
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

// 10.	ЗСӨ-ний сүүлчийн үзлэгээр цусны даралтыг нь хэмжиж тэмдэглэсэн ЗСӨ-ний эрсдэлтэй идэвхтэй өвчтөний хувь
async function GetAnalyzeData10(req, res) {
  try {
    var result = {
      Success: true,
      Message: 'Мэдээлэл амжилттай татлаа',
      Data: {},
      DataId: null,
    };
    const LogedUser = req.LogedUser;
    const { StartDate, EndDate } = req.body;
    const UserId = LogedUser ? LogedUser.Id : null;
    const OrganizationId =
      LogedUser && LogedUser.Doctor && LogedUser.Doctor.Organization
        ? LogedUser.Doctor.Organization.Id
        : null;
    const OrgLevel =
      LogedUser && LogedUser.Doctor && LogedUser.Doctor.Organization
        ? LogedUser.Doctor.Organization.level
        : null;

    var countOf18 = 0;
    var countOf40 = 0;

    var inMonitoring18 = 0;
    var inMonitoring40 = 0;

    var percentof18 = 0;
    var percentof40 = 0;

    // Харьяалагдах хүн амын мэдээлэл татах
    const { Total18to39Age, Total40upAge } = await GetCountData({ LogedUser });
    countOf18 = parseInt(Total18to39Age);
    countOf40 = parseInt(Total40upAge);

    // Хяналтанд хамрагдсан хүмүүсийн мэдээлэл
    const CVDMonitoringData = await GetMonitoringData({
      StartDate,
      EndDate,
      OrgLevel,
      OrganizationId,
    });
    CVDMonitoringData.forEach((e, key) => {
      e.Age < 40 && e.Status === 'activated' && e.IsActive === '1' && inMonitoring18++;
      e.Age >= 40 && e.Status === 'activated' && e.IsActive === '1' && inMonitoring40++;
    });

    percentof18 = countOf18 > 0 ? (inMonitoring18 * 100) / countOf18 : 0;
    percentof40 = countOf40 > 0 ? (inMonitoring40 * 100) / countOf40 : 0;

    var dataRowsDaralt = ['18-39 нас', percentof18.toFixed(2)];
    var dataColumnsDaralt = ['40-дээш нас', percentof40.toFixed(2)];

    result.Data = [dataRowsDaralt, dataColumnsDaralt];
    return res.send(result);
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

// 11. ЗСӨ-ний сүүлчийн үзлэгээр ЗСӨ-ний түүхтэй эсвэл ЗСӨ-ний эрсдэл ≥ 30% -тай , АД-нь {"< 130/80"} идэвхтэй өвчтөний эзлэх
async function GetAnalyzeData11(req, res) {
  try {
    var result = {
      Success: true,
      Message: 'Мэдээлэл амжилттай татлаа',
      Data: {},
      DataId: null,
    };
    const LogedUser = req.LogedUser;
    const UserId = LogedUser ? LogedUser.Id : null;
    const OrganizationId =
      LogedUser && LogedUser.Doctor && LogedUser.Doctor.Organization
        ? LogedUser.Doctor.Organization.Id
        : null;

    var countOfRisked18 = 0;
    var countOfRisked40 = 0;
    var countOf130and80and18 = 0;
    var countOf130and80and40 = 0;
    var countOf18 = 0;
    var countOf40 = 0;

    // Харьяалагдах хүн амын мэдээлэл татах
    var { Total18to39Age, Total40upAge } = await GetCountData({ LogedUser });
    countOf18 = parseInt(Total18to39Age);
    countOf40 = parseInt(Total40upAge);

    // Хяналтанд хамрагдсан хүний тоо

    const CVDMonitoringData = await Models.vwCVDReportForSoum.findAll({
      where: { OrganizationId },
      attributes: ['Id', 'PatRegNo', 'CreateDate', 'Age', 'Status', 'IsActive'],
      raw: true,
    });

    if (CVDMonitoringData && CVDMonitoringData.length > 0) {
      for (var i = 0; i < CVDMonitoringData.length; i++) {
        var MonitoringId = null;
        var LastHistoryData = {};
        var LastRiskData = {};
        var LastBodySizeData = {};

        if (
          CVDMonitoringData[i].Status === 'activated' &&
          CVDMonitoringData[i].IsActive + '' === '1'
        ) {
          MonitoringId = CVDMonitoringData[i] && CVDMonitoringData[i].Id;
          // Last Datas
          const RiskData = await Models.CVDRisk.findOne({
            where: { MonitoringId },
            attributes: ['Id'],
            order: [['Id', 'DESC']],
            raw: true,
            // logging: (q) => console.log(q),
          });

          // Last data get by PK
          if (RiskData) {
            const Id = RiskData.Id;
            if (Id) {
              LastRiskData = await Models.CVDRisk.findByPk(Id, {
                attributes: ['Risk'],
                raw: true,
              });

              if (LastRiskData.Risk + '' === '5') {
                const BodySizeData = await Models.CVDBodySize.findOne({
                  where: { MonitoringId },
                  attributes: ['Id'],
                  order: [['Id', 'DESC']],
                  raw: true,
                  // logging: (q) => console.log(q),
                });
                if (BodySizeData) {
                  const Id = BodySizeData.Id;
                  if (Id) {
                    LastBodySizeData = await Models.CVDBodySize.findByPk(Id, {
                      attributes: ['DaraltDeed', 'DaraltDood'],
                      raw: true,
                    });

                    var DaraltDeed = 0;
                    var DaraltDood = 0;

                    // Дээд, доод даралтын мэдээлэл
                    DaraltDeed = isNaN(parseInt(LastBodySizeData.DaraltDeed))
                      ? 0
                      : parseInt(LastBodySizeData.DaraltDeed);
                    DaraltDood = isNaN(parseInt(LastBodySizeData.DaraltDood))
                      ? 0
                      : parseInt(LastBodySizeData.DaraltDood);

                    if (DaraltDeed <= 130 && DaraltDood <= 80) {
                      if (CVDMonitoringData[i].Age < 40) {
                        countOfRisked18++;
                        countOf130and80and18++;
                      } else if (CVDMonitoringData[i].Age >= 40) {
                        countOfRisked40++;
                        countOf130and80and40++;
                      }
                    } else {
                      if (CVDMonitoringData[i].Age < 40) {
                        countOfRisked18++;
                      } else if (CVDMonitoringData[i].Age >= 40) {
                        countOfRisked40++;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    // Тооцоолох

    // var potential40 = (countOf40 * potentialPercent) / 100;

    var inMonitoring18percent =
      countOf130and80and18 > 0 ? (countOf130and80and18 * 100) / countOfRisked18 : 0;
    var inMonitoring40percent =
      countOf130and80and40 > 0 ? (countOf130and80and40 * 100) / countOfRisked40 : 0;

    var dataRowsDaralt = ['18-39 нас', inMonitoring18percent.toFixed(2)];

    var dataColumnsDaralt = ['40-дээш нас', inMonitoring40percent.toFixed(2)];

    result.Data = [dataRowsDaralt, dataColumnsDaralt];
    return res.send(result);
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

// 12. ЗСӨ-ний сүүлчийн үзлэгээр <30% эрсдэлтэй, артерийн даралт нь <140/90, идэвхтэй өвчтөний хувь/
async function GetAnalyzeData12(req, res) {
  try {
    var result = {
      Success: true,
      Message: 'Мэдээлэл амжилттай татлаа',
      Data: {},
      DataId: null,
    };
    const LogedUser = req.LogedUser;
    const UserId = LogedUser ? LogedUser.Id : null;
    const OrganizationId =
      LogedUser && LogedUser.Doctor && LogedUser.Doctor.Organization
        ? LogedUser.Doctor.Organization.Id
        : null;

    var countOfRisked18 = 0;
    var countOfRisked40 = 0;
    var countOf130and80and18 = 0;
    var countOf130and80and40 = 0;
    var countOf18 = 0;
    var countOf40 = 0;

    // Харьяалагдах хүн амын мэдээлэл татах
    var { Total18to39Age, Total40upAge } = await GetCountData({ LogedUser });
    countOf18 = parseInt(Total18to39Age);
    countOf40 = parseInt(Total40upAge);

    // Хяналтанд хамрагдсан хүний тоо
    var CVDMonitoringData = null;

    CVDMonitoringData = await Models.vwCVDReportForSoum.findAll({
      where: { OrganizationId },
      attributes: ['Id', 'PatRegNo', 'CreateDate', 'Age', 'Status', 'IsActive'],
      raw: true,
    });

    if (CVDMonitoringData && CVDMonitoringData.length > 0) {
      for (var i = 0; i < CVDMonitoringData.length; i++) {
        var MonitoringId = null;

        var LastRiskData = {};
        var LastBodySizeData = {};

        MonitoringId = CVDMonitoringData[i] && CVDMonitoringData[i].Id;
        // Last Datas
        const RiskData = await Models.CVDRisk.findOne({
          where: { MonitoringId },
          attributes: ['Id'],
          order: [['Id', 'DESC']],
          raw: true,
          // logging: (q) => console.log(q),
        });

        // Last data get by PK
        if (RiskData.length) {
          const Id = RiskData.Id;
          if (Id) {
            LastRiskData = await Models.CVDRisk.findByPk(Id, {
              attributes: ['Risk'],
            });

            if ((LastRiskData.Risk = '5')) {
              const BodySizeData = await Models.CVDBodySize.findOne({
                where: { MonitoringId },
                attributes: ['Id'],
                order: [['Id', 'DESC']],
                raw: true,
                // logging: (q) => console.log(q),
              });
              if (BodySizeData) {
                const Id = BodySizeData.Id;
                if (Id) {
                  LastBodySizeData = await Models.CVDBodySize.findByPk(Id, {
                    attributes: ['DaraltDeed', 'DaraltDood'],
                    raw: true,
                  });

                  var DaraltDeed = 0;
                  var DaraltDood = 0;
                  // Дээд, доод даралтын мэдээлэл
                  DaraltDeed = isNaN(parseInt(LastBodySizeData.DaraltDeed))
                    ? 0
                    : parseInt(LastBodySizeData.DaraltDeed);
                  DaraltDood = isNaN(parseInt(LastBodySizeData.DaraltDood))
                    ? 0
                    : parseInt(LastBodySizeData.DaraltDood);

                  if (DaraltDeed <= 140 && DaraltDood <= 90) {
                    if (
                      CVDMonitoringData[i].Age < 40 &&
                      CVDMonitoringData[i].Status === 'activated' &&
                      CVDMonitoringData[i].IsActive === '1'
                    ) {
                      countOfRisked18++;
                      countOf130and80and18++;
                    } else if (
                      CVDMonitoringData[i].Age >= 40 &&
                      CVDMonitoringData[i].Status === 'activated' &&
                      CVDMonitoringData[i].IsActive === '1'
                    ) {
                      countOfRisked40++;
                      countOf130and80and40++;
                    }
                  } else {
                    if (
                      CVDMonitoringData[i].Age < 40 &&
                      CVDMonitoringData[i].Status === 'activated' &&
                      CVDMonitoringData[i].IsActive === '1'
                    ) {
                      countOfRisked18++;
                    } else if (
                      CVDMonitoringData[i].Age >= 40 &&
                      CVDMonitoringData[i].Status === 'activated' &&
                      CVDMonitoringData[i].IsActive === '1'
                    ) {
                      countOfRisked40++;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    // Тооцоолох

    var inMonitoring18percent =
      countOf130and80and18 > 0 ? (countOf130and80and18 * 100) / countOfRisked18 : 0;
    var inMonitoring40percent =
      countOf130and80and40 > 0 ? (countOf130and80and40 * 100) / countOfRisked40 : 0;

    var dataRowsDaralt = ['18-39 нас', inMonitoring18percent.toFixed(2)];

    var dataColumnsDaralt = ['40-дээш нас', inMonitoring40percent.toFixed(2)];

    result.Data = [dataRowsDaralt, dataColumnsDaralt];
    return res.send(result);
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

// 13.  (Сүүлийн 12 сарын эцсийн хэмжилтээр HbA1c<6.5%-тай чихрийн шижинтэй идэвхтэй өвчтөнүүдийн хувь)
async function GetAnalyzeData13(req, res) {
  try {
    var result = {
      Success: true,
      Message: 'Мэдээлэл амжилттай татлаа',
      Data: {},
      DataId: null,
    };
    const LogedUser = req.LogedUser;
    const UserId = LogedUser ? LogedUser.Id : null;
    const OrganizationId =
      LogedUser && LogedUser.Doctor && LogedUser.Doctor.Organization
        ? LogedUser.Doctor.Organization.Id
        : null;

    //••	Сүүлийн 12 сарын хугацаанд дор хаяж нэг удаа HbA1c-оо хэмжүүлсэн ЧШ-тэй идэвхтэй өвчтөнүүдийн тоо – 375
    var countOfAll = 0;

    //•	•	Сүүлийн 12 сарын эцсийн хэмжилтээр HbA1c<6.5% -тай ЧШ-тэй  идэвхтэй өвчтөнүүдийн тоо–268
    var InGlucoseCount = 0;

    // Хяналтанд хамрагдсан хүний тоо
    const CVDMonitoringData = await Models.vwCVDReportForSoum.findAll({
      where: { OrganizationId },
      raw: true,
    });

    if (CVDMonitoringData && CVDMonitoringData.length > 0) {
      for (var i = 0; i < CVDMonitoringData.length; i++) {
        var MonitoringId = null;
        var LastControlData = {};

        MonitoringId = CVDMonitoringData[i] && CVDMonitoringData[i].Id;
        // Last Datas
        const ControlData = await Models.CVDControlAndTransition.findOne({
          where: { MonitoringId },
          attributes: ['Id'],
          order: [['Id', 'DESC']],
          raw: true,
          // logging: (q) => console.log(q),
        });

        // Last data get by PK
        if (ControlData) {
          const Id = ControlData.Id;
          if (Id) {
            LastControlData = await Models.CVDControlAndTransition.findByPk(Id, {
              attributes: ['Glucose'],
              raw: true,
            });
            // LastControlData = JSON.parse(JSON.stringify(LastControlData));
          }
        }

        // Add Last datas
        CVDMonitoringData[i] = {
          ...CVDMonitoringData[i],
          ...LastControlData,
        };
      }
    }

    CVDMonitoringData &&
      CVDMonitoringData.forEach((e) => {
        e.Glucose && countOfAll++;
        e.Glucose === '1' &&
          (e.Status === 'activated' || e.Status === 'out_control') &&
          InGlucoseCount++;
      });

    //(Сүүлийн 12 сарын эцсийн хэмжилтээр HbA1c<6.5%-тай чихрийн шижинтэй идэвхтэй өвчтөнүүдийн хувь)
    var InGlucosePercent = countOfAll > 0 ? (InGlucoseCount * 100) / countOfAll : 0;

    var dataRowsDaralt = [
      // "Сүүлийн 12 сарын эцсийн хэмжилтээр HbA1c<6.5%-тай чихрийн шижинтэй идэвхтэй өвчтөнүүдийн хувь",
      'Иргэнүүдийн хувь',
      InGlucosePercent.toFixed(2),
    ];

    result.Data = [dataRowsDaralt];
    return res.send(result);
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

// 14. (Чихрийн шижингийн сүүлийн үзлэгээр ӨҮГ<5.6 ммоль/л,  буюу <100 мг/дл чихрийн шижинтэй идэвхтэй өвчтөнүүдийн хувь)
async function GetAnalyzeData14(req, res) {
  try {
    var result = {
      Success: true,
      Message: 'Мэдээлэл амжилттай татлаа',
      Data: {},
      DataId: null,
    };
    const LogedUser = req.LogedUser;
    const UserId = LogedUser ? LogedUser.Id : null;
    const OrganizationId =
      LogedUser && LogedUser.Doctor && LogedUser.Doctor.Organization
        ? LogedUser.Doctor.Organization.Id
        : null;

    var potentialPercent = 9.7;
    var countOf18 = 0;
    var countOf40 = 0;

    var inMonitoring18 = 0;
    var inMonitoring40 = 0;

    // Харьяалагдах хүн амын мэдээлэл татах
    var { Total18to39Age, Total40upAge } = await GetCountData({ LogedUser });
    countOf18 = parseInt(Total18to39Age);
    countOf40 = parseInt(Total40upAge);

    // var allHunAm = countOf18 + countOf40;
    // var countOfRisked = 0;
    var countOfRisked18 = 0;
    var countOfRisked40 = 0;
    // Хяналтанд хамрагдсан хүний тоо
    // var CVDMonitoringData = null;

    const CVDMonitoringData = await Models.vwCVDReportForSoum.findAll({
      where: { OrganizationId },
      attributes: ['Id', 'PatRegNo', 'CreateDate', 'Age', 'Status', 'IsActive'],
      raw: true,
    });
    // CVDMonitoringData = JSON.parse(JSON.stringify(CVDMonitoringData));

    if (CVDMonitoringData && CVDMonitoringData.length > 0) {
      for (var i = 0; i < CVDMonitoringData.length; i++) {
        var MonitoringId = null;

        var LastBodySizeData = {};

        MonitoringId = CVDMonitoringData[i] && CVDMonitoringData[i].Id;
        // Last Datasz
        const HistoryData = await Models.CVDHistory.findOne({
          where: { MonitoringId },
          attributes: ['Id'],
          order: [['Id', 'DESC']],
          raw: true,
          // logging: (q) => console.log(q),
        });

        const BodySizeData = await Models.CVDBodySize.findOne({
          where: { MonitoringId },
          attributes: ['Id'],
          order: [['Id', 'DESC']],
          raw: true,
          // logging: (q) => console.log(q),
        });

        if (BodySizeData) {
          const Id = BodySizeData.Id;
          if (Id) {
            LastBodySizeData = await Models.CVDBodySize.findByPk(Id, {
              attributes: ['UlunGlucose'],
              raw: true,
            });

            var UlunGlucose = parseFloat(LastBodySizeData.UlunGlucose);

            if (UlunGlucose < 5.6) {
              if (
                CVDMonitoringData[i].Age < 40 &&
                CVDMonitoringData[i].Status === 'activated' &&
                CVDMonitoringData[i].IsActive === '1'
              ) {
                countOfRisked18++;
              } else if (
                CVDMonitoringData[i].Age >= 40 &&
                CVDMonitoringData[i].Status === 'activated' &&
                CVDMonitoringData[i].IsActive === '1'
              ) {
                countOfRisked40++;
              }
            }
          }
        }
      }
    }

    // Тооцоолох

    // var potential40 = (countOf40 * potentialPercent) / 100;

    // var potential18 = (countOf18 * potentialPercent) / 100;
    // var potential40 = (countOf40 * potentialPercent) / 100;

    var inMonitoring18percent = countOfRisked18 > 0 ? (countOfRisked18 * 100) / countOf18 : 0;
    var inMonitoring40percent = countOfRisked40 > 0 ? (countOfRisked40 * 100) / countOf40 : 0;

    var dataRowsDaralt = ['18-39 нас', inMonitoring18percent.toFixed(2)];

    var dataColumnsDaralt = ['40-дээш нас', inMonitoring40percent.toFixed(2)];

    result.Data = [dataRowsDaralt, dataColumnsDaralt];
    return res.send(result);
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

// 15. (Сүүлийн 3 сарын хугацаанд нөөц нь дуусаагүй ЗСӨ/ЧШ-гийн  үндсэн эмийн хувь )
async function GetAnalyzeData15(req, res) {
  try {
    var result = {
      Success: true,
      Message: 'Мэдээлэл амжилттай татлаа',
      Data: {},
      DataId: null,
    };
    const LogedUser = req.LogedUser;
    const UserId = LogedUser ? LogedUser.Id : null;
    if (LogedUser && LogedUser.Doctor && LogedUser.Doctor.Organization) {
      var Organization = LogedUser.Doctor.Organization;
      var OrganizationId = Organization ? Organization.Id : null;
    }

    //•	ЗСӨ/ЧШ-гийн дараах үндсэн (Аспирин, АХФХ, бета блокатор, кальцийн суваг хориглогч, статин, тиазид, Метформин, Сульфонилури, Инсулин (тариагаар) эмийн тоо - 9,
    var countOfAll = 9;

    //•	Сүүлийн 3 сарын хугацаанд нөөц нь дуусаагүй ЗСӨ/ЧШ-гийн үндсэн эмийн тоо- 6

    // // Харьяалагдах хорооны эмийн мэдээлэл татах

    var BalanceData = null;
    // BalancedData = await Models.vwCVDDrugLast3Month.findAll({
    //   limit: 3,
    //   where: { CreateUserId: UserId },
    // });

    var [DrugData, drugData] = await sequelize.query(
      'SELECT TOP 3 * FROM dbo.CVDDrugBalance WHERE Id IN ' +
        '(SELECT TOP 3 Id FROM dbo.CVDDrugBalance WHERE Id IN ' +
        '(SELECT TOP 3 MAX(Id) AS Id FROM dbo.CVDDrugBalance WHERE OrganizationId=' +
        OrganizationId +
        ' GROUP BY  [Year], [Month]' +
        ' ORDER BY [Year] DESC, [Month] DESC)' +
        ' ORDER BY [Month] ASC)' +
        ' ORDER BY [Year] DESC, [Month] DESC'
    );

    var dataRowsBalance = ['Эмийн хувь'];
    var dataXDate = ['x'];

    BalanceData = DrugData;
    if (BalanceData && BalanceData.length > 0) {
      for (let i = 0; i < BalanceData.length; i++) {
        var BalancedObj = BalanceData[i];

        if (BalancedObj) {
          dataXDate.push(BalancedObj.Year + '-' + BalancedObj.Month + '-01');

          var InBalancedCount = 0;
          var InBalancedPercent = 0;
          Object.keys(BalancedObj).forEach((e, key) => {
            if (e.indexOf('Em') + '' !== '-1') {
              BalancedObj[e] === 'h' && InBalancedCount++;
            }
          });

          InBalancedPercent = countOfAll > 0 ? (InBalancedCount * 100) / countOfAll : 0;

          InBalancedPercent = parseFloat(InBalancedPercent);

          dataRowsBalance.push(InBalancedPercent.toFixed(2));
        }
      }
    }

    // response data
    result.Data = [dataRowsBalance, null, dataXDate];
    return res.send(result);
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

module.exports = router;
