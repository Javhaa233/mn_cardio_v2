const express = require('express');
const soap = require('soap');
const router = express.Router();

const sign = require('../../helper/xypSign');

// routes
router.post('/testCall', testCall);

async function testCall(req, res) {
  console.log('Test XYP call begin');
  var result = { Success: true, Message: 'Successfully', Data: {} };

  const time = Math.floor(new Date() / 1000);

  const data = new sign(process.env.XYP_KEY, process.env.XYP_TOKEN, time);
  const signData = data.sign();

  const citizenUrl = 'https://xyp.gov.mn/citizen-1.5.0/ws?WSDL';
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

  soap.createClientAsync(url, { endpoint: url }, function (err, client) {
    if (err) {
      console.log(err);
    }
    if (client) {
      client.addHttpHeader('accessToken', signData.accessToken);
      client.addHttpHeader('timeStamp', signData.timeStamp);
      client.addHttpHeader('signature', signData.signature);

      client.WS100008_registerOTPRequest(args, function (err, result) {
        if (err) console.log(err);
        console.log({
          result,
          request: result.return.request,
        });
      });
    }
  });

  // result.Data = clientResult;
  console.log('Return result');
  return res.status(200).json(result);
}

module.exports = router;
