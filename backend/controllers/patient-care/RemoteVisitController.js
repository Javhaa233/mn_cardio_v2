const express = require('express');
const router = express.Router();

const { Models } = require('../../config/DB');

const BaseControllerHelper = require('../../helper/BaseControllerHelper');
const ModelHelper = require('../../helper/ModelHelper');

// routes
router.post('/GetList', GetList);

async function GetList(req, res) {
  try {
    var result = { Success: true, Message: '', Data: [], Option: {} };
    const LogedUser = req.LogedUser;
    const Option = BaseControllerHelper.GetCrudRequestData(req);
    const RemoteVisitConfigData = await BaseControllerHelper.GetConfigData('RemoteVisit');
    const ModHelper = new ModelHelper(Models.RemoteVisit);
    const ListData = await BaseControllerHelper.BaseGetList({
      ObjectName: 'RemoteVisit',
      LogedUser,
      Option,
    });

    const RemoteVisits = JSON.parse(JSON.stringify(ListData.Data));
    for (let i = 0; i < RemoteVisits.length; i++) {
      let RemoteVisit = RemoteVisits[i];
      await ModHelper.GetInfoData(RemoteVisit, RemoteVisitConfigData);
      RemoteVisit = await BaseControllerHelper.BaseSetFiles({
        ConfigData: RemoteVisitConfigData,
        Data: RemoteVisit,
      });
    }

    result.Data = RemoteVisits;
    result.Option = ListData.Option;
    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

module.exports = router;
