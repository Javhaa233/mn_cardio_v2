const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();

const { Models, Op, sequelize } = require('../../config/DB');

const BaseControllerHelper = require('../../helper/BaseControllerHelper');
const DoctorExamReport = require('../../helper/DoctorExamReportHelper');

// routes
router.post('/GetReport', GetReport);
router.post('/GetProvinceData', GetProvinceData);
router.post('/GetDoctorExamReport', GetDoctorExamReport);
router.post('/DoctorExamReportExcel', DoctorExamReportExcel);
router.post('/DoctorExamReportText', DoctorExamReportText);

async function GetProvinceData(req, res) {
  try {
    var result = { Success: true, Data: [], Option: {} };
    const { ObjectName, Option } = req.body;

    var where = {};
    if (Option && Option.Field) {
      var Field = Option.Field;
      if (Option.Type === 'NotEquals') where[Op.not] = { [Field]: Option.Value };
      if (Option.Type === 'Equals') where[Field] = Option.Value;
    }

    // Models[undefined] is undefined, so a request without ObjectName died on
    // `Model.findAll` with a TypeError and reported the opaque "An error
    // occurred". Say which parameter is wrong instead.
    if (!ObjectName || typeof ObjectName !== 'string') {
      return res.send(
        JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('ObjectName шаардлагатай'))
      );
    }
    const Model = Object.prototype.hasOwnProperty.call(Models, ObjectName)
      ? Models[ObjectName]
      : null;
    if (!Model || typeof Model.findAll !== 'function') {
      return res.send(
        JSON.stringify(
          BaseControllerHelper.GetDefaultErrorResult('ObjectName олдсонгүй: ' + ObjectName)
        )
      );
    }

    const Data = await Model.findAll({
      where: where,
      attributes: ['id_data', 'name'],
    });

    result.Data = Data;

    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

async function GetReport(req, res) {
  try {
    var result = { Success: true, Message: '', Data: [] };
    const LogedUser = req.LogedUser;
    var StartDate = req.body.StartDate;
    var EndDate = req.body.EndDate;
    const UserId = req.body.UserId;
    var addr_prov_city =
      req.body.addr_prov_city && req.body.addr_prov_city !== '-1' ? req.body.addr_prov_city : null;
    var addr_soum_dist =
      req.body.addr_soum_dist && req.body.addr_soum_dist !== '-1' ? req.body.addr_soum_dist : null;
    var addr_bag_khoroo =
      req.body.addr_bag_khoroo && req.body.addr_bag_khoroo !== '-1'
        ? req.body.addr_bag_khoroo
        : null;

    // Every one of these came straight from req.body and was concatenated into
    // the EXEC string. StartDate/EndDate landed INSIDE single quotes, so
    // "2020-01-01'; <statement>; --" closed the quote and ran; UserId and the
    // three addr_* values were interpolated unquoted, which needed no quote to
    // escape at all. `replacements` hands them to Sequelize's escaper instead.
    //
    // The two dates stay conditional - spNewReport treats an omitted @StartDate
    // differently from a NULL one - but now only the PARAMETER NAME is chosen by
    // the condition; the value is always bound.
    //
    // Keep the `[Data]` destructure and do NOT add `type: QueryTypes.SELECT`:
    // with EXEC under tedious that changes the return shape. See
    // controllers/organization/DashboardController.js for the same note.
    const StartDateQr = StartDate ? ' @StartDate = :StartDate,' : '';
    const EndDateQr = EndDate ? ' @EndDate = :EndDate,' : '';

    const [Data] = await sequelize.query(
      'EXEC spNewReport ' +
        StartDateQr +
        EndDateQr +
        ' @UserId = :UserId,' +
        ' @addr_prov_city = :addr_prov_city,' +
        ' @addr_soum_dist = :addr_soum_dist,' +
        ' @addr_bag_khoroo = :addr_bag_khoroo;',
      {
        replacements: {
          StartDate: StartDate || null,
          EndDate: EndDate || null,
          UserId: UserId || null,
          addr_prov_city,
          addr_soum_dist,
          addr_bag_khoroo,
        },
      }
    );

    result.Data = Data;

    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

// #region Эмчийн нэгдсэн үзлэгийн тайлан

/** Хүсэлтээс шүүлтийг гаргаж авна. Утгуудыг helper дотор хатуу цэвэрлэдэг. */
function GetReportFilter(req) {
  const Body = req.body || {};
  return {
    StartDate: Body.StartDate,
    EndDate: Body.EndDate,
    OrganizationId: Body.OrganizationId,
    addr_prov_city: Body.addr_prov_city,
    addr_soum_dist: Body.addr_soum_dist,
    addr_bag_khoroo: Body.addr_bag_khoroo,
    SearchText: Body.SearchText,
  };
}

async function GetDoctorExamReport(req, res) {
  try {
    const LogedUser = req.LogedUser;
    if (!LogedUser) {
      return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
    }

    const { Data, Total, Summary } = await DoctorExamReport.GetData({
      LogedUser,
      Filter: GetReportFilter(req),
    });

    return res.send(
      JSON.stringify({
        Success: true,
        Message: '',
        Data,
        Option: { Total, Summary, Columns: DoctorExamReport.COLUMNS },
      })
    );
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

/**
 * Файлыг илгээсний дараа устгана - CVDReportController нь тогтмол зам руу бичээд
 * цэвэрлэдэггүй тул зэрэг татсан хоёр хүн бие биеийнхээ мөрийг авдаг. Энд
 * ExportFilePath давхцахгүй нэр өгч, download-ийн дараа устгана.
 */
function SendAndCleanup(res, filePath, contentType) {
  res.set('Content-Type', contentType);
  return res.download(filePath, (err) => {
    err && console.log('DoctorExamReport download error:', err.message);
    fs.unlink(path.resolve(filePath), () => {});
  });
}

async function DoctorExamReportExcel(req, res) {
  try {
    const LogedUser = req.LogedUser;
    if (!LogedUser) {
      return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
    }

    const { filePath } = await DoctorExamReport.ExportExcel({
      LogedUser,
      Filter: GetReportFilter(req),
    });
    if (!filePath) {
      return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
    }

    return SendAndCleanup(
      res,
      filePath,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

async function DoctorExamReportText(req, res) {
  try {
    const LogedUser = req.LogedUser;
    if (!LogedUser) {
      return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
    }

    const { filePath } = await DoctorExamReport.ExportText({
      LogedUser,
      Filter: GetReportFilter(req),
    });
    if (!filePath) {
      return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
    }

    return SendAndCleanup(res, filePath, 'text/plain; charset=utf-8');
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

// #endregion

module.exports = router;
