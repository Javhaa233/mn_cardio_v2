const Sequelize = require('sequelize');
const sequelize = require('../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class File extends Sequelize.Model {}

File.init(
  {
    id_data: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id: { type: Sequelize.INTEGER },

    id_group: { type: Sequelize.INTEGER },
    date_creation: { type: Sequelize.DATE },
    user_mod: { type: Sequelize.STRING },
    date_modif: { type: Sequelize.DATE },

    rec_status: { type: Sequelize.INTEGER },
    comment: { type: Sequelize.STRING },
    ext: { type: Sequelize.STRING },
    hash: { type: Sequelize.STRING },
    original_name: { type: Sequelize.STRING },
    generated_name: { type: Sequelize.STRING },
    linked_q: { type: Sequelize.INTEGER },
    linked_id_data: { type: Sequelize.INTEGER },
    size: { type: Sequelize.INTEGER },
    patient_id: { type: Sequelize.INTEGER },
    LinkedObjectName: { type: Sequelize.STRING },
    LinkedObjectId: { type: Sequelize.INTEGER },
    FieldName: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'File',
    modelName: 'File',
    timestamps: false,
  }
);

File.SearchField = [
  'id_data',
  'id',
  'id_group',
  'date_creation',
  'user_mod',
  'date_modif',
  'rec_status',
  'comment',
  'ext',
  'hash',
  'original_name',
  'generated_name',
  'linked_q',
  'linked_id_data',
  'size',
  'patient_id',
  'FieldName',
];

File.createNew = async function (Data, ReturnIdField) {
  await File.create(Data);
  const [ReturnData] = await sequelize.query(
    'SELECT TOP 1  ' + ReturnIdField + ' FROM [File] ORDER BY ' + ReturnIdField + ' DESC '
  );
  return ReturnData[0][ReturnIdField];
};

module.exports = File;
