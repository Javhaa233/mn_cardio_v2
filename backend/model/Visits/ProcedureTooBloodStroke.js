const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class ProcedureTooBloodStroke extends Sequelize.Model {}
ProcedureTooBloodStroke.init(
  {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    ProcedureId: { type: Sequelize.INTEGER },
    BloodStrokeId: { type: Sequelize.INTEGER },
    ChildRecStatus: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'ProcedureTooBloodStroke',
    modelName: 'ProcedureTooBloodStroke',
    timestamps: false,
  }
);

ProcedureTooBloodStroke.SearchField = ['id', 'ProcedureId', 'BloodStrokeId', 'ChildRecStatus'];

ProcedureTooBloodStroke.SetAssocations = (Models) => {
  ProcedureTooBloodStroke.belongsTo(Models.Procedure, {
    as: 'Procedure',
    foreignKey: 'ProcedureId',
    targetKey: 'id_data',
  });
};

ProcedureTooBloodStroke.SetFunctions = (Models) => {
  ProcedureTooBloodStroke.createNew = async function (Data, ReturnIdField) {
    // The id comes from the INSERT, not from a follow-up query.
    //
    // This used to be `SELECT TOP 1 <pk> FROM [ProcedureTooBloodStroke] ORDER BY <pk> DESC` run
    // immediately after the create. Two concurrent creates both read the HIGHER
    // id, so the loser returned the winner's row and attached its child rows -
    // files, lookups, many-to-many links - to the wrong record. Reproduced
    // against the database: two creates in one transaction returned 5 and 6,
    // while the old query returned 6 for both.
    //
    // create() already carries the generated key: ReturnIdField is declared
    // autoIncrement, and Sequelize reads it back through OUTPUT INSERTED.
    const Created = await ProcedureTooBloodStroke.create(Data);

    return Created[ReturnIdField];
  };
};

module.exports = ProcedureTooBloodStroke;
