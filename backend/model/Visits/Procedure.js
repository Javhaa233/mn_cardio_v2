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
    // The id comes from the INSERT, not from a follow-up query.
    //
    // This used to be `SELECT TOP 1 <pk> FROM [Procedure] ORDER BY <pk> DESC` run
    // immediately after the create. Two concurrent creates both read the HIGHER
    // id, so the loser returned the winner's row and attached its child rows -
    // files, lookups, many-to-many links - to the wrong record. Reproduced
    // against the database: two creates in one transaction returned 5 and 6,
    // while the old query returned 6 for both.
    //
    // create() already carries the generated key: ReturnIdField is declared
    // autoIncrement, and Sequelize reads it back through OUTPUT INSERTED.
    const Created = await Procedure.create(Data);

    return Created[ReturnIdField];
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
