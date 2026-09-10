const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');
const Op = Sequelize.Op;
Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class EcgExamination extends Sequelize.Model {}
EcgExamination.init(
  {
    id_data: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id: { type: Sequelize.INTEGER },

    id_group: { type: Sequelize.INTEGER },
    date_creation: { type: Sequelize.DATE },
    user_mod: { type: Sequelize.STRING },
    date_modif: { type: Sequelize.DATE },

    rec_status: { type: Sequelize.INTEGER },
    comment: { type: Sequelize.STRING },
    OrganizationId: { type: Sequelize.INTEGER },
    PatientId: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'EcgExamination',
    modelName: 'EcgExamination',
    timestamps: false,
  }
);
EcgExamination.SearchField = [
  'id_data',
  'id',
  'id_group',
  'date_creation',
  'user_mod',
  'date_modif',
  'rec_status',
  'comment',
];

EcgExamination.SetAssocations = (Models) => {
  EcgExamination.belongsTo(Models.Patient, {
    as: 'Patient',
    foreignKey: 'PatientId',
    targetKey: 'id_data',
  });

  EcgExamination.belongsTo(Models.Users, {
    as: 'Users',
    foreignKey: 'id',
    targetKey: 'Id',
  });
  EcgExamination.belongsTo(Models.DoctorsProfile, {
    as: 'DoctorsProfile',
    foreignKey: 'id',
    targetKey: 'UserId',
  });

  EcgExamination.belongsTo(Models.Organization, {
    as: 'Organization',
    foreignKey: 'OrganizationId',
    targetKey: 'Id',
  });
};
EcgExamination.SetFunctions = (Models) => {
  EcgExamination.createNew = async function (Data, ReturnIdField) {
    await EcgExamination.create(Data);
    const [ReturnData] = await sequelize.query(
      'SELECT TOP 1 ' +
        ReturnIdField +
        ' FROM [EcgExamination] ORDER BY ' +
        ReturnIdField +
        ' DESC '
    );
    return ReturnData[0][ReturnIdField];
  };

  EcgExamination.GetFiles = async function (id_data) {
    const Files = await Models.File.findAll({
      where: {
        LinkedObjectId: id_data,
        LinkedObjectName: 'EcgExamination',
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

  EcgExamination.findAllNew = async function (Option) {
    var Result = await EcgExamination.findAll({
      ...Option,
      include: [
        {
          model: Models.Users,
          as: 'Users',
          attributes: ['UserName', 'Id'],
        },
        {
          model: Models.Patient,
          as: 'Patient',
          attributes: Models.Patient.DefaultFields,
        },
        {
          model: Models.DoctorsProfile,
          as: 'DoctorsProfile',
          attributes: Models.DoctorsProfile.DefaultFields,
        },
        {
          model: Models.Organization,
          as: 'Organization',
          include: [
            {
              model: Models.DictProvinceCity,
              as: 'DictProvinceCity',
              attributes: ['id_data', 'name', 'date_creation'],
            },
            {
              model: Models.DictSoumDistrict,
              as: 'DictSoumDistrict',
              attributes: ['id_data', 'name'],
            },
            {
              model: Models.DictBagKhoroo,
              as: 'DictBagKhoroo',
              attributes: ['id_data', 'name'],
            },
          ],
        },
      ],
    });
    return Result;
  };
};
module.exports = EcgExamination;
