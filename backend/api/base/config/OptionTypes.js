const {
  Models: { OptionTypes },
} = require('../../../config/DB');

const list = async (req, res, next) => {
  req.sort = req.sort ? req.sort : [{ selector: 'value', desc: false }];
  next();
};

const show = (req, res, next) => {
  next();
};

const lookup = async (req, res, next) => {
  req.sort = req.sort ? req.sort : [{ selector: 'value', desc: false }];
  next();
};

const create = async (req, res, next) => {
  next();
};

const update = async (req, res, next) => {
  next();
};

module.exports = {
  model: OptionTypes,
  middleware: { show, list, lookup, create, update },
  validation: {},
};
