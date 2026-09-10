const express = require('express');
const router = express.Router();

const BaseControllerHelper = require('../../helper/BaseControllerHelper');

// routes
router.post('/CustomSave', CustomSave);

async function CustomSave(req, res) {
  try {
    var result = { Success: true, Message: 'Successfully saved', Data: {} };
    const AdviceId = req.body.AdviceId;
    const FollowUpData = JSON.parse(req.body.Data);
    const LogedUser = req.LogedUser;

    if (AdviceId && LogedUser && FollowUpData) {
      // Sanitize fu_pe_vs_heart: if non-numeric, move to fu_pe_other to avoid DB crash
      if (FollowUpData.fu_pe_vs_heart && isNaN(FollowUpData.fu_pe_vs_heart)) {
        const heartRateNote = `Heart rate: ${FollowUpData.fu_pe_vs_heart}`;
        FollowUpData.fu_pe_other = FollowUpData.fu_pe_other
          ? `${FollowUpData.fu_pe_other}. ${heartRateNote}`
          : heartRateNote;
        FollowUpData.fu_pe_vs_heart = null;
      }

      let FollowUpId = null;
      // update
      if (FollowUpData.id_data) {
        FollowUpId = await BaseControllerHelper.BaseUpdate({
          ObjectName: 'FollowUp',
          Data: FollowUpData,
          LogedUser,
          SaveLog: true,
        });
      } else {
        // create
        FollowUpId = await BaseControllerHelper.BaseCreate({
          ObjectName: 'FollowUp',
          Data: FollowUpData,
          LogedUser,
          SaveLog: true,
        });
      }

      result.Data = { DataId: FollowUpId };
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
