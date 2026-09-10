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
    await CathlabElement.create(Data);
    const [ReturnData] = await sequelize.query(
      'SELECT TOP 1  ' +
        ReturnIdField +
        ' FROM [CathlabElement] ORDER BY ' +
        ReturnIdField +
        ' DESC '
    );
    return ReturnData[0][ReturnIdField];
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
