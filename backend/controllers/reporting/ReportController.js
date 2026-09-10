const express = require('express');
const router = express.Router();

const { Models, Op, sequelize } = require('../../config/DB');

const BaseControllerHelper = require('../../helper/BaseControllerHelper');

// routes
router.post('/GetReport', GetReport);
router.post('/GetProvinceData', GetProvinceData);

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

    const StartDateQr = StartDate ? " @StartDate='" + StartDate + "'," : '';
    const EndDateQr = EndDate ? " @EndDate='" + EndDate + "'," : '';

    const [Data] = await sequelize.query(
      'EXEC spNewReport ' +
        StartDateQr +
        EndDateQr +
        ' @UserId=' +
        UserId +
        ', @addr_prov_city=' +
        addr_prov_city +
        ', @addr_soum_dist=' +
        addr_soum_dist +
        ', @addr_bag_khoroo=' +
        addr_bag_khoroo +
        ';'
    );

    result.Data = Data;

    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

module.exports = router;
