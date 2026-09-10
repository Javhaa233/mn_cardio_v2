const express = require('express');
const router = express.Router();

const { Models, Op } = require('../../config/DB');

const BaseControllerHelper = require('../../helper/BaseControllerHelper');

// routes
router.post('/GetJournalRefData', GetJournalRefData);

async function GetJournalRefData(req, res) {
  try {
    var result = { Success: true, Message: '', Data: [], Option: {} };
    var Type = req.body.Type;
    var SearchText = req.body.SearchText;
    var Journals = [];
    var where = { jr_label: { [Op.like]: '%' + SearchText + '%' } };
    if (Type === 'ICD') {
      where = { ...where, jr_type: { [Op.in]: [5] } };
    } else {
      where = { ...where, jr_type: { [Op.in]: [1, 2, 3, 4] } };
    }
    Journals = await Models.JournalRef.findAllNew({
      where,
      limit: 1000,
      offset: 0,
    });
    Journals = JSON.parse(JSON.stringify(Journals));

    result.Data = Journals;
    return res.send(JSON.stringify(result));
  } catch (ex) {
    console.log(ex);
    return res.send(JSON.stringify(BaseControllerHelper.GetDefaultErrorResult()));
  }
}

module.exports = router;
