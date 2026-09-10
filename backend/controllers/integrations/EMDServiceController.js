const express = require('express');
const router = express.Router();

const BaseControllerHelper = require('../../helper/BaseControllerHelper');
const EMDServiceHelper = require('../../helper/EMDServiceHelper');

// routes
router.post('/getTablet', getTablet);
router.post('/getTabletByDiagnosis', getTabletByDiagnosis);

// Buh emiin jagsaalt
async function getTablet(req, res) {
  var result = { Success: true, Message: 'Successfully', Data: {} };
  try {
    result.Data = await EMDServiceHelper.getTablet();
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
  // response data
  return res.send(result);
}

// Onoshd hamaarah emiin jagsaalt
async function getTabletByDiagnosis(req, res) {
  var result = { Success: true, Message: 'Successfully', Data: [] };
  try {
    const PatRegNo = req.body.PatRegNo;
    const diagCodes = req.body.diagCodes;
    const LogedUser = req.LogedUser;

    if (PatRegNo && LogedUser) {
      if (diagCodes && diagCodes.length > 0) {
        var Tablets = [];
        // const NewTablets = diagCodes.forEach(async (diagCode) => {
        //   return Tablets;
        // });
        for (let i = 0; i < diagCodes.length; i++) {
          const NewIcdTablets = await EMDServiceHelper.getTabletByDiagnosis(diagCodes[i], PatRegNo);
          if (NewIcdTablets && NewIcdTablets.listTabletModel) {
            const listTabletModel = NewIcdTablets.listTabletModel;
            for (let j = 0; j < listTabletModel.length; j++) {
              listTabletModel[j]['diagCode'] = NewIcdTablets.diagModel.diagCode;
            }
            Tablets = Tablets.concat(NewIcdTablets.listTabletModel);
          }
        }

        // tablets data
        result.Data = Tablets;
      }
    }
    return res.send(result);
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

module.exports = router;
