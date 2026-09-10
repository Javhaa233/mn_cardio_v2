const express = require('express');
const router = express.Router();

const BaseControllerHelper = require('../../helper/BaseControllerHelper');

// routes
router.post('/GetListData', GetListData);

async function GetListData(req, res) {
  try {
    var result = { Success: true, Message: '', Data: [], Option: {} };
    const ObjectName = req.body.ObjectName;
    const LogedUser = req.LogedUser;
    if (ObjectName && LogedUser) {
      const Option = BaseControllerHelper.GetCrudRequestData(req);
      const ListData = await BaseControllerHelper.BaseGetList({
        ObjectName,
        LogedUser,
        Option,
      });
      result.Data = ListData.Data;
      result.Option = ListData.Option;
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
