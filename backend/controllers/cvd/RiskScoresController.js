const express = require('express');
const ExcelJS = require('exceljs');
const router = express.Router();

const { Models, Op } = require('../../config/DB');

const BaseControllerHelper = require('../../helper/BaseControllerHelper');

/**
 * Admin-only gate for the one route here that WRITES.
 *
 * /RiskScores used to sit in routeGroups.public, so CreateFromExcel - which
 * bulkCreates the whole WHO/ISH band table from inputExcel/RiskScores.xlsx with
 * no truncate - was reachable by anyone who could reach the host, and could be
 * replayed to grow the table without bound. The prefix is now protected, but
 * patients are allowed through it (they need CalculateRisk), so the write still
 * has to be closed separately rather than left to the prefix allowlist.
 */
function RequireAdmin(req, res, next) {
  const LogedUser = req.LogedUser;
  if (!LogedUser || String(LogedUser.RoleId) !== '1') {
    return res.send(
      JSON.stringify({ Success: false, Message: 'Хандах эрхгүй байна', Data: null })
    );
  }
  return next();
}

// routes
router.post('/CalculateRisk', CalculateRisk);
router.post('/CreateFromExcel', RequireAdmin, CreateFromExcel);

async function CalculateRisk(req, res) {
  var result = {
    Success: true,
    Message: 'Successfully',
    Data: { score: 0, risk: 0 },
  };
  const body = req.body;
  try {
    if (!body) {
      return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult('Data not found')));
    }
    // let riskScore = 0;
    // columns
    const gender = body.gender;
    const isCholestrol = body.isCholestrol;
    const isDiabetes = body.isDiabetes;
    const isSmoker = body.isSmoker;
    const age = body.age;
    const cholestrol = body.cholestrol ? parseFloat(body.cholestrol).toFixed(1) : 0;
    const pressure = body.pressure ? parseFloat(body.pressure).toFixed(2) : 0;
    const BMI = body.BMI ? parseFloat(body.BMI).toFixed(2) : 0;

    let where = { gender, isCholestrol, isDiabetes, isSmoker };

    where = {
      ...where,
      minAge: { [Op.lte]: age },
      maxAge: { [Op.gte]: age },
      minPressure: { [Op.lte]: pressure },
      maxPressure: { [Op.gte]: pressure },
    };

    // Holestrin uzsen eseh shalgah
    if (isCholestrol === 'Yes') {
      if (cholestrol) {
        where = {
          ...where,
          minCholestrol: { [Op.lte]: cholestrol },
          maxCholestrol: { [Op.gte]: cholestrol },
        };
      }
    } else {
      where = {
        ...where,
        minBMI: { [Op.lte]: BMI },
        maxBMI: { [Op.gt]: BMI },
      };
    }

    const risk = await Models.RiskScores.findOne({ where, raw: true });

    result.Data = risk && { score: risk.score, risk: risk.risk };
    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

// RiskScores insert into from Excel
async function CreateFromExcel(req, res) {
  try {
    var workBook = new ExcelJS.Workbook();
    workBook = await workBook.xlsx.readFile('inputExcel/RiskScores.xlsx');

    const diabetes = workBook.getWorksheet('Diabetes');
    const noDiabetes = workBook.getWorksheet('No Diabetes');
    const bmi = workBook.getWorksheet('BMI');
    const diabetesData = [];
    const noDiabetesData = [];
    const bmiData = [];
    diabetes.eachRow({ includeEmpty: true }, function (row, rowNumber) {
      diabetesData.push(row.values);
    });
    noDiabetes.eachRow({ includeEmpty: true }, function (row, rowNumber) {
      noDiabetesData.push(row.values);
    });
    bmi.eachRow({ includeEmpty: true }, function (row, rowNumber) {
      bmiData.push(row.values);
    });

    const riskInsertData = [];
    diabetesData.forEach((e) => {
      if (e.length > 0) {
        riskInsertData.push({
          gender: e[1],
          isCholestrol: e[2],
          isDiabetes: e[3],
          isSmoker: e[4],
          minAge: e[5],
          maxAge: e[6],
          minCholestrol: e[7],
          maxCholestrol: e[8],
          minPressure: e[9],
          maxPressure: e[10],
          minBMI: e[11],
          maxBMI: e[12],
          score: e[13],
          risk: e[14],
        });
      }
    });
    noDiabetesData.forEach((e) => {
      if (e.length > 0) {
        riskInsertData.push({
          gender: e[1],
          isCholestrol: e[2],
          isDiabetes: e[3],
          isSmoker: e[4],
          minAge: e[5],
          maxAge: e[6],
          minCholestrol: e[7],
          maxCholestrol: e[8],
          minPressure: e[9],
          maxPressure: e[10],
          minBMI: e[11],
          maxBMI: e[12],
          score: e[13],
          risk: e[14],
        });
      }
    });
    bmiData.forEach((e) => {
      if (e.length > 0) {
        riskInsertData.push({
          gender: e[1],
          isCholestrol: e[2],
          isDiabetes: e[3],
          isSmoker: e[4],
          minAge: e[5],
          maxAge: e[6],
          minCholestrol: e[7],
          maxCholestrol: e[8],
          minPressure: e[9],
          maxPressure: e[10],
          minBMI: e[11],
          maxBMI: e[12],
          score: e[13],
          risk: e[14],
        });
      }
    });

    await Models.RiskScores.bulkCreate(riskInsertData);

    return res.send(JSON.stringify({ riskInsertData, count: riskInsertData.length }));
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

module.exports = router;
