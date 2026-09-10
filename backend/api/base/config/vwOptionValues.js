const {
  Models: { vwOptionValues },
} = require('../../../config/DB');

const list = async (req, res, next) => {
  req.sort = req.sort ? req.sort : [{ selector: 'orderNum', desc: false }];
  next();
};

const show = (req, res, next) => {
  next();
};

const lookup = async (req, res, next) => {
  req.sort = req.sort ? req.sort : [{ selector: 'orderNum', desc: false }];
  next();
};

module.exports = {
  model: vwOptionValues,
  middleware: { show, list, lookup },
  validation: {},
};
