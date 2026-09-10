const express = require('express');
const router = express.Router();

const { sequelize } = require('../../config/DB');

const BaseControllerHelper = require('../../helper/BaseControllerHelper');

// routes
router.post('/GetCreateAllVisits', GetCreateAllVisits);
router.post('/GetCreatePatients', GetCreatePatients);

async function GetCreatePatients(req, res) {
  try {
    var result = {
      Success: true,
      Message: 'Successfully',
      Data: [],
      Option: {},
    };
    const LogedUser = req.LogedUser;
    const GrpType = req.body.SelectType;
    const StartDate = req.body.StartDate;
    const EndDate = req.body.EndDate;

    if (LogedUser) {
      // GrpType, StartDate and EndDate come straight from the request body and
      // used to be concatenated into the EXEC string, so any of them could
      // close the quote and append a statement. `replacements` hands them to
      // Sequelize's escaper instead.
      //
      // Keep the `[Data, data]` destructure and do NOT add
      // `type: QueryTypes.SELECT` - with EXEC under tedious that changes the
      // return shape to a bare row array and the loop below breaks.
      const [Data, data] = await sequelize.query(
        'EXEC spRepCreatePatients @UserId = :UserId, @GrpType = :GrpType, ' +
          '@StartDate = :StartDate, @EndDate = :EndDate;',
        { replacements: { UserId: LogedUser.Id, GrpType, StartDate, EndDate } }
      );

      var RepData = { labels: [], series: [[]] };
      for (var i = 0; i < Data.length; i++) {
        RepData.labels.push(Data[i].GrpType + '');
        RepData.series[0].push(Data[i].Counts);
      }

      result.Data = RepData;
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

async function GetCreateAllVisits(req, res) {
  try {
    var result = {
      Success: true,
      Message: 'Successfully',
      Data: null,
      Option: {},
    };
    const LogedUser = req.LogedUser;
    const GrpType = req.body.SelectType;
    const StartDate = req.body.StartDate;
    const EndDate = req.body.EndDate;

    if (LogedUser) {
      // Same injection as GetCreatePatients above; same fix.
      //
      // One nuance: this call used to pass @GrpType as N'...'. `replacements`
      // emits a plain '...'. GrpType is a grouping code (7DAYS / 1MONTH /
      // 6MONTH / 1YEAR from BaseDateSelect), so it is ASCII and unaffected. If
      // a Cyrillic value ever becomes possible here, that one parameter needs
      // `bind` rather than `replacements`.
      const [Data, data] = await sequelize.query(
        'EXEC spRepCreateAllVisits @UserId = :UserId, @GrpType = :GrpType, ' +
          '@StartDate = :StartDate, @EndDate = :EndDate;',
        { replacements: { UserId: LogedUser.Id, GrpType, StartDate, EndDate } }
      );
      var RepData = { labels: [], series: [[]] };
      for (var i = 0; i < Data.length; i++) {
        RepData.labels.push(Data[i].GrpType + '');
        RepData.series[0].push(Data[i].Counts);
      }
      result.Data = RepData;
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

module.exports = router;
