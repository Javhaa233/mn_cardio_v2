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
    // The id comes from the INSERT, not from a follow-up query.
    //
    // This used to be `SELECT TOP 1 <pk> FROM [Apps] ORDER BY <pk> DESC` run
    // immediately after the create. Two concurrent creates both read the HIGHER
    // id, so the loser returned the winner's row and attached its child rows -
    // files, lookups, many-to-many links - to the wrong record. Reproduced
    // against the database: two creates in one transaction returned 5 and 6,
    // while the old query returned 6 for both.
    //
    // create() already carries the generated key: ReturnIdField is declared
    // autoIncrement, and Sequelize reads it back through OUTPUT INSERTED.
    const Created = await Apps.create(Data);

    return Created[ReturnIdField];
  };
};

module.exports = Apps;
