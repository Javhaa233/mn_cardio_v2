const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class PatientTooProcedure extends Sequelize.Model {}
PatientTooProcedure.init(
  {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    PatientId: { type: Sequelize.INTEGER },
    ProcedureId: { type: Sequelize.INTEGER },
    ChildRecStatus: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'PatientTooProcedure',
    modelName: 'PatientTooProcedure',
    timestamps: false,
  }
);
PatientTooProcedure.SearchField = ['id', 'PatientId', 'ProcedureId', 'ChildRecStatus'];

PatientTooProcedure.SetAssocations = (Models) => {
  PatientTooProcedure.belongsTo(Models.Patient, {
    as: 'Patient',
    foreignKey: 'PatientId',
  });
};

PatientTooProcedure.SetFunctions = (Models) => {
  PatientTooProcedure.createNew = async function (Data, ReturnIdField) {
    // The id comes from the INSERT, not from a follow-up query.
    //
    // This used to be `SELECT TOP 1 <pk> FROM [PatientTooProcedure] ORDER BY <pk> DESC` run
    // immediately after the create. Two concurrent creates both read the HIGHER
    // id, so the loser returned the winner's row and attached its child rows -
    // files, lookups, many-to-many links - to the wrong record. Reproduced
    // against the database: two creates in one transaction returned 5 and 6,
    // while the old query returned 6 for both.
    //
    // create() already carries the generated key: ReturnIdField is declared
    // autoIncrement, and Sequelize reads it back through OUTPUT INSERTED.
    const Created = await PatientTooProcedure.create(Data);

    return Created[ReturnIdField];
  };
};

module.exports = PatientTooProcedure;
