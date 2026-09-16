const express = require('express');
const soap = require('soap');
const router = express.Router();

const sign = require('../../helper/xypSign');

/**
 * ХУР (state data exchange) probe.
 *
 * This router used to sit in `routeGroups.public`, described there as a
 * "pre-auth bootstrap route". It is not one. Nothing in the frontend, the
 * mobile app or tests/acceptance calls it - the acceptance catalogue skips it
 * explicitly ("live SOAP call to xyp.gov.mn with real credentials"). It is a
 * developer probe that was never taken out of the public group.
 *
 * Unauthenticated, it let anyone on the internet make this server sign a
 * WS100008_registerOTPRequest with the hospital's own XYP_KEY and REGNUM, as
 * the hospital, without limit - RateLimit.AUTH_PATHS does not list it and the
 * global bucket only counts by default.
 *
 * Now: protected (server.js) plus RoleId 1 here, because "any doctor token"
 * is still too wide for something that spends the organisation's credentials
 * against a national platform.
 *
 * Kept rather than deleted - unlike the four TestController routes removed on
 * 2026-09-14 - because it is the only working reference for XYP SOAP signing,
 * and mobile tender 1.2 (pulling patient registration data from XYP) needs it.
 */

// routes
router.post('/testCall', RequireAdmin, testCall);

function RequireAdmin(req, res, next) {
  const LogedUser = req.LogedUser;
  if (!LogedUser || String(LogedUser.RoleId) !== '1') {
    return res.status(200).json({
      Success: false,
      Message: 'Хандах эрхгүй байна',
      Data: null,
    });
  }
  return next();
}

async function testCall(req, res) {
  try {
    const time = Math.floor(new Date() / 1000);
    const signData = new sign(process.env.XYP_KEY, process.env.XYP_TOKEN, time).sign();

    const url = 'https://xyp.gov.mn/meta-1.5.0/ws?WSDL';

    const args = {
      request: {
        regnum: process.env.REGNUM,
        jsonWSList: JSON.stringify([{ ws: 'WS100125_checkCitizenRegnum' }]),
        isSms: 0,
        isApp: 0,
        isEmail: 0,
        isKiosk: 0,
        phoneNum: 0,
      },
    };

    // Previously this was a callback pyramid that `return res.json(result)`d
    // BEFORE the SOAP work started, so the endpoint always answered
    // { Success: true, Data: {} } whatever happened and the real outcome only
    // ever reached console.log. It also read `result.return.request` without
    // checking `result`, so a SOAP-level error threw a TypeError inside a
    // callback with no try/catch around it - and with no uncaughtException
    // handler that took the whole process down, from an unauthenticated route.
    const client = await soap.createClientAsync(url, { endpoint: url });

    client.addHttpHeader('accessToken', signData.accessToken);
    client.addHttpHeader('timeStamp', signData.timeStamp);
    client.addHttpHeader('signature', signData.signature);

    const [Response] = await client.WS100008_registerOTPRequestAsync(args);

    return res.status(200).json({
      Success: true,
      Message: 'Successfully',
      Data: (Response && Response.return) || null,
    });
  } catch (ex) {
    console.log('XypService testCall failed', ex);
    return res.status(200).json({
      Success: false,
      Message: (ex && ex.message) || 'ХУР рүү хандахад алдаа гарлаа',
      Data: null,
    });
  }
}

module.exports = router;
