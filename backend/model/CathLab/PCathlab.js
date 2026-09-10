const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class PCathlab extends Sequelize.Model {}
PCathlab.init(
  {
    id_data: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id: { type: Sequelize.INTEGER },

    id_group: { type: Sequelize.INTEGER },
    date_creation: { type: Sequelize.DATE },
    user_mod: { type: Sequelize.STRING },
    date_modif: { type: Sequelize.DATE },

    rec_status: { type: Sequelize.INTEGER },
    cath_lab_operation_procedure: { type: Sequelize.STRING },
    doctors_name: { type: Sequelize.STRING },
    cath_lab_operation_date: { type: Sequelize.DATE },
    PatientId: { type: Sequelize.INTEGER },
    PatRegNo: { type: Sequelize.STRING },
    OrganizationId: { type: Sequelize.INTEGER },
    Conclusion: { type: Sequelize.STRING },
    // Only define CreateUserId if it exists in the database
    // CreateUserId: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'PCathlab',
    modelName: 'PCathlab',
    timestamps: false,
  }
);
PCathlab.SearchField = [
  'id_data',
  'id',
  'id_group',
  'date_creation',
  'user_mod',
  'date_modif',
  'rec_status',
  'cath_lab_operation_procedure',
  'doctors_name',
  'cath_lab_operation_date',
  'PatientId',
  'OrganizationId',
  // 'CreateUserId', // Removed since column doesn't exist in database
];

PCathlab.SetAssocations = (Models) => {
  PCathlab.belongsTo(Models.Organization, {
    as: 'Organization',
    foreignKey: 'OrganizationId',
    targetKey: 'Id',
  });

  // Skip DoctorsProfile association since CreateUserId column doesn't exist in database
  // PCathlab.belongsTo(Models.DoctorsProfile, {
  //   as: 'DoctorsProfile',
  //   foreignKey: 'CreateUserId',
  //   targetKey: 'UserId',
  // });

  PCathlab.belongsTo(Models.Users, {
    as: 'Users',
    foreignKey: 'id',
    targetKey: 'Id',
  });

  PCathlab.hasMany(Models.PCathlabLookUp, {
    as: 'LookUpData',
    foreignKey: 'id_data',
  });

  PCathlab.hasMany(Models.CathlabElement, {
    as: 'CathlabElement',
    foreignKey: 'PCathlabId',
    targetKey: 'id_data',
  });

  PCathlab.belongsTo(Models.Patient, {
    as: 'Patient',
    foreignKey: 'PatientId',
  });
};

PCathlab.SetFunctions = (Models) => {
  PCathlab.createNew = async function (Data, ReturnIdField) {
    // Remove CreateUserId from data if it exists to avoid database error
    const cleanData = { ...Data };
    if (cleanData.hasOwnProperty('CreateUserId')) {
      delete cleanData.CreateUserId;
    }
    await PCathlab.create(cleanData);
    const [ReturnData] = await sequelize.query(
      'SELECT TOP 1  ' + ReturnIdField + ' FROM [PCathlab] ORDER BY ' + ReturnIdField + ' DESC '
    );
    return ReturnData[0][ReturnIdField];
  };

  PCathlab.updateNew = async function (Data, Id, PK) {
    // Remove CreateUserId from data if it exists to avoid database error
    const cleanData = { ...Data };
    if (cleanData.hasOwnProperty('CreateUserId')) {
      delete cleanData.CreateUserId;
    }
    await PCathlab.update(cleanData, {
      where: { [PK]: Id },
    });
    return Id;
  };

  PCathlab.findAllNew = async function (Option) {
    const result = await PCathlab.findAll({
      ...Option,
      include: [
        {
          model: Models.Users,
          as: 'Users',
          attributes: Models.Users.DetaultFields,
        },
        // Skip DoctorsProfile since CreateUserId column doesn't exist in database
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
        {
          model: Models.Patient,
          as: 'Patient',
          attributes: Models.Patient.DefaultFields,
        },
      ],
    });
    return result;
  };

  PCathlab.GetLookUpData = async function (PCathlabId) {
    const result = await Models.PCathlabLookUp.findAll({
      where: { id_data: PCathlabId },
    });
    return result;
  };

  PCathlab.findAllDetail = async function (Option) {
    const result = await PCathlab.findAll({
      ...Option,
      include: [
        { model: Models.PCathlabLookUp, as: 'LookUpData' },
        {
          model: Models.Users,
          as: 'Users',
          attributes: Models.Users.DetaultFields,
        },
        // Skip DoctorsProfile since CreateUserId column doesn't exist in database
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
        {
          model: Models.Patient,
          as: 'Patient',
          attributes: Models.Patient.DefaultFields,
        },
        {
          model: Models.CathlabElement,
          as: 'CathlabElement',
          include: [
            {
              model: Models.vwCathLabElementType,
              as: 'vwCathLabElementType',
              attributes: ['label', 'value'],
            },
            {
              model: Models.vwCathLabUniqueName,
              as: 'vwCathLabUniqueName',
              attributes: ['label', 'value'],
            },
            {
              model: Models.CathlabElementLookUp,
              as: 'LookUpData',
              include: [
                {
                  model: Models.vwCathLabElementTags,
                  as: 'vwCathLabElementTags',
                  attributes: ['label', 'value'],
                },
              ],
            },
          ],
        },
      ],
    });
    return result;
  };
};
module.exports = PCathlab;
