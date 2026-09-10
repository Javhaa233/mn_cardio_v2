const {
  Models: { HavhlagaEmgeg },
} = require('../../../config/DB');

const list = async (req, res, next) => {
  req.sort = req.sort ? req.sort : [{ selector: 'id', desc: true }];
  next();
};

const show = (req, res, next) => {
  next();
};

const lookup = async (req, res, next) => {
  req.sort = req.sort ? req.sort : [{ selector: 'id', desc: true }];
  next();
};

const create = async (req, res, next) => {
  req.body.CreateUserId = 7;
  req.body.CreateDate = '2024-03-20 00:00:05';
  next();
};

const update = async (req, res, next) => {
  next();
};

module.exports = {
  model: HavhlagaEmgeg,
  middleware: { show, list, lookup, create, update },
  validation: {},
};
