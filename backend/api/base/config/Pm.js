const {
  Models: { Pm },
  sequelize,
} = require('../../../config/DB');
const { format } = require('date-fns');

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
  req.body.CreateUserId = req.LogedUser.Id;
  req.body.CreateDate = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
  next();
};

const update = async (req, res, next) => {
  next();
};

module.exports = {
  model: Pm,
  middleware: { show, list, lookup, create, update },
  validation: {},
};
