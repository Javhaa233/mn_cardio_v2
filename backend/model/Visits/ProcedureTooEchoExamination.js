const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class ProcedureTooEchoExamination extends Sequelize.Model {}

ProcedureTooEchoExamination.init(
  {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    ProcedureId: { type: Sequelize.INTEGER },
    EchoExaminationId: { type: Sequelize.INTEGER },
    ChildRecStatus: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'ProcedureTooEchoExamination',
    modelName: 'ProcedureTooEchoExamination',
    timestamps: false,
  }
);

ProcedureTooEchoExamination.SearchField = [
  'id',
  'ProcedureId',
  'EchoExaminationId',
  'ChildRecStatus',
];

ProcedureTooEchoExamination.createNew = async function (Data, ReturnIdField) {
  await ProcedureTooEchoExamination.create(Data);
  const [ReturnData] = await sequelize.query(
    'SELECT TOP 1  ' +
      ReturnIdField +
      ' FROM [ProcedureTooEchoExamination] ORDER BY ' +
      ReturnIdField +
      ' DESC '
  );
  return ReturnData[0][ReturnIdField];
};

module.exports = ProcedureTooEchoExamination;
