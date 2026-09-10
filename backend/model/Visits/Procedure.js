const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class Procedure extends Sequelize.Model {}
Procedure.init(
  {
    id_data: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id: { type: Sequelize.INTEGER },

    id_group: { type: Sequelize.INTEGER },
    date_creation: { type: Sequelize.DATE },
    user_mod: { type: Sequelize.STRING },
    date_modif: { type: Sequelize.DATE },

    rec_status: { type: Sequelize.INTEGER },
    order_id: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'Procedure',
    modelName: 'Procedure',
    timestamps: false,
  }
);
Procedure.SearchField = [
  'id_data',
  'id',
  'id_group',
  'date_creation',
  'user_mod',
  'date_modif',
  'rec_status',
  'order_id',
];
Procedure.SetAssocations = (Models) => {
  Procedure.belongsTo(Models.PatientTooProcedure, {
    as: 'PatientTooProcedure',
    foreignKey: 'id_data',
    targetKey: 'ProcedureId',
  });
};
Procedure.SetFunctions = (Models) => {
  Procedure.createNew = async function (Data, ReturnIdField) {
    await Procedure.create(Data);
    const [ReturnData] = await sequelize.query(
      'SELECT TOP 1 ' + ReturnIdField + ' FROM [Procedure] ORDER BY ' + ReturnIdField + ' DESC '
    );
    return ReturnData[0][ReturnIdField];
  };

  Procedure.findByPatientId = async function (PatientId, OtherOption) {
    var Result = await Procedure.findAll({
      where: { '$PatientTooProcedure.PatientId$': PatientId },
      include: [
        {
          model: Models.PatientTooProcedure,
          as: 'PatientTooProcedure',
          attributes: ['PatientId'],
        },
      ],
    });
    return Result;
  };
};

module.exports = Procedure;
