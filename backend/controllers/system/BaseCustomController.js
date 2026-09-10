const Helper = require('../../helper');

const { Models, Op, sequelize: DB } = require('../../config/DB');

class BaseCustomController {
  constructor() {
    this.DB = DB;
    this.Op = Op;
    this.Models = Models;
    this.Helper = Helper;
    this.result = { Success: true, Message: '', Data: null };
  }

  NewListResult = () => {
    return { Success: true, Message: '', Data: [], Option: {} };
  };

  NewObjectResult = () => {
    return { Success: true, Message: '', Data: {} };
  };

  NewNullResult = () => {
    return { Success: true, Message: '', Data: null };
  };
}

module.exports = BaseCustomController;
