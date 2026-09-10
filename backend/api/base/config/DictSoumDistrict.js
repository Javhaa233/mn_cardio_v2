const {
  Models: { DictSoumDistrict },
} = require('../../../config/DB');

const list = async (req, res, next) => {
  next();
};

const show = (req, res, next) => {
  next();
};

const lookup = async (req, res, next) => {
  next();
};

const create = async (req, res, next) => {
  next();
};

const update = async (req, res, next) => {
  next();
};

module.exports = {
  model: DictSoumDistrict,
  middleware: { show, list, lookup, create, update },
  validation: {},
};
