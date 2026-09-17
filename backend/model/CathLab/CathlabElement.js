const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class CathlabElement extends Sequelize.Model {}
CathlabElement.init(
  {
    id_data: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id: { type: Sequelize.INTEGER },

    id_group: { type: Sequelize.INTEGER },
    date_creation: { type: Sequelize.DATE },
    user_mod: { type: Sequelize.STRING },

    date_modif: { type: Sequelize.DATE },

    rec_status: { type: Sequelize.INTEGER },
    comment: { type: Sequelize.STRING },
    tags: { type: Sequelize.STRING },
    type: { type: Sequelize.STRING },
    unique_name: { type: Sequelize.STRING },
    PCathlabId: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'CathlabElement',
    modelName: 'CathlabElement',
    timestamps: false,
  }
);

CathlabElement.SearchField = [
  'id_data',
  'id',
  'id_group',
  'date_creation',
  'user_mod',
  'date_modif',
  'rec_status',
  'comment',
  'tags',
  'type',
  'unique_name',
  'PCathlabId',
];

CathlabElement.SetAssocations = (Models) => {
  CathlabElement.belongsTo(Models.PCathlab, {
    as: 'PCathlab',
    foreignKey: 'PCathlabId',
  });

  CathlabElement.hasMany(Models.CathlabElementLookUp, {
    as: 'LookUpData',
    foreignKey: 'id_data',
  });

  CathlabElement.belongsTo(Models.vwCathLabElementType, {
    as: 'vwCathLabElementType',
    foreignKey: 'type',
    targetKey: 'value',
  });

  CathlabElement.belongsTo(Models.vwCathLabUniqueName, {
    as: 'vwCathLabUniqueName',
    foreignKey: 'unique_name',
    targetKey: 'value',
  });
};

CathlabElement.SetFunctions = (Models) => {
  CathlabElement.GetLookUpData = async function (Id) {
    const result = await CathlabElement.findAll({ where: { id_data: Id } });
    return result;
  };

  CathlabElement.createNew = async function (Data, ReturnIdField) {
    // The id comes from the INSERT, not from a follow-up query.
    //
    // This used to be `SELECT TOP 1 <pk> FROM [CathlabElement] ORDER BY <pk> DESC` run
    // immediately after the create. Two concurrent creates both read the HIGHER
    // id, so the loser returned the winner's row and attached its child rows -
    // files, lookups, many-to-many links - to the wrong record. Reproduced
    // against the database: two creates in one transaction returned 5 and 6,
    // while the old query returned 6 for both.
    //
    // create() already carries the generated key: ReturnIdField is declared
    // autoIncrement, and Sequelize reads it back through OUTPUT INSERTED.
    const Created = await CathlabElement.create(Data);

    return Created[ReturnIdField];
  };

  CathlabElement.findAllDetail = async function (Option) {
    const result = await CathlabElement.findAll({
      ...Option,
      include: [{ model: Models.CathlabElementLookUp, as: 'LookUpData' }],
    });
    return result;
  };
};
module.exports = CathlabElement;
