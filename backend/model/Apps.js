const Sequelize = require('sequelize');
const sequelize = require('../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class Apps extends Sequelize.Model {}
Apps.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    Name: { type: Sequelize.STRING },
    Code: { type: Sequelize.STRING },
    Description: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'Apps',
    modelName: 'Apps',
    timestamps: false,
  }
);

Apps.SearchField = ['Id', 'Name', 'Code', 'Description'];

Apps.SetAssocations = (Models) => {};

Apps.SetFunctions = (Models) => {
  Apps.createNew = async function (Data, ReturnIdField) {
    await Apps.create(Data);
    const [ReturnData] = await sequelize.query(
      'SELECT TOP 1  ' + ReturnIdField + ' FROM [Apps] ORDER BY ' + ReturnIdField + ' DESC '
    );
    return ReturnData[0][ReturnIdField];
  };
};

module.exports = Apps;
