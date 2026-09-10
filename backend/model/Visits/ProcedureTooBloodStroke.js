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
    await ProcedureTooBloodStroke.create(Data);
    const [ReturnData] = await sequelize.query(
      'SELECT TOP 1  ' +
        ReturnIdField +
        ' FROM [ProcedureTooBloodStroke] ORDER BY ' +
        ReturnIdField +
        ' DESC '
    );
    return ReturnData[0][ReturnIdField];
  };
};

module.exports = ProcedureTooBloodStroke;
