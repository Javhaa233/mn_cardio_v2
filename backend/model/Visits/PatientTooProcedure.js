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
    await PatientTooProcedure.create(Data);
    const [ReturnData] = await sequelize.query(
      'SELECT TOP 1  ' +
        ReturnIdField +
        ' FROM [PatientTooProcedure] ORDER BY ' +
        ReturnIdField +
        ' DESC '
    );
    return ReturnData[0][ReturnIdField];
  };
};

module.exports = PatientTooProcedure;
