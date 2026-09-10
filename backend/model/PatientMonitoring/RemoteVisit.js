const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class RemoteVisit extends Sequelize.Model {}

RemoteVisit.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    Comment: { type: Sequelize.STRING },
    CreateDate: { type: Sequelize.DATE },
    PatientId: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'RemoteVisit',
    modelName: 'RemoteVisit',
    timestamps: false,
  }
);

RemoteVisit.SearchField = ['Comment'];

RemoteVisit.SetAssocations = (Models) => {
  RemoteVisit.belongsTo(Models.Patient, {
    as: 'Patient',
    foreignKey: 'PatientId',
  });
};

RemoteVisit.SetFunctions = (Models) => {
  RemoteVisit.GetFiles = async function (id_data) {
    const Files = await Models.File.findAll({
      where: {
        LinkedObjectId: id_data,
        LinkedObjectName: 'RemoteVisit',
        rec_status: { [Op.in]: ['9', '1'] },
      },
      attributes: [
        'id_data',
        'id',
        'ext',
        'hash',
        'original_name',
        'generated_name',
        'linked_q',
        'linked_id_data',
        'size',
        'patient_id',
        'LinkedObjectName',
        'LinkedObjectId',
        'FieldName',
      ],
    });
    return Files;
  };

  RemoteVisit.findAllDetail = async function (Option) {
    const result = await RemoteVisit.findAll({
      ...Option,
      include: [{ model: Models.Patient, as: 'Patient' }],
    });
    return result;
  };
};
module.exports = RemoteVisit;
