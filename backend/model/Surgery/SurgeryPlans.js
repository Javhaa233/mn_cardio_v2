const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

class SurgeryPlans extends Sequelize.Model {}
SurgeryPlans.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },

    is_confirm: { type: Sequelize.STRING },
    PatRegNo: { type: Sequelize.STRING },
    CreateUserId: { type: Sequelize.INTEGER },
    CreateDate: { type: Sequelize.DATE },
    UpdateUserId: { type: Sequelize.INTEGER },
    UpdatedDate: { type: Sequelize.DATE },
    ConfirmUserId: { type: Sequelize.INTEGER },
    ConfirmedDate: { type: Sequelize.DATE },

    type_exam1: { type: Sequelize.STRING },

    ognoo: { type: Sequelize.STRING },

    department_id: { type: Sequelize.INTEGER },
    organization_id: { type: Sequelize.INTEGER },
    organization_other: { type: Sequelize.STRING },

    diagnosis: { type: Sequelize.STRING },
    surgery_name: { type: Sequelize.STRING },
    surgery_date: { type: Sequelize.DATE },
    surgery_doctors: { type: Sequelize.STRING },
    tasag: { type: Sequelize.STRING },
    tnha_virus: { type: Sequelize.STRING },
    medeeguijuuleg_turul: { type: Sequelize.STRING },
    ersdel_zereg: { type: Sequelize.STRING },
    comment: { type: Sequelize.STRING },
    nemelt_sanal: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'SurgeryPlans',
    modelName: 'SurgeryPlans',
    timestamps: false,
  }
);

//Assocations
SurgeryPlans.SetAssocations = (Models) => {
  SurgeryPlans.belongsTo(Models.DrgroupDepartments, {
    as: 'DrgroupDepartments',
    foreignKey: 'department_id',
    targetKey: 'id_data',
  });
  SurgeryPlans.belongsTo(Models.Patient, {
    as: 'Patient',
    foreignKey: 'PatRegNo',
    targetKey: 'p_registration',
  });
  SurgeryPlans.belongsTo(Models.Users, {
    as: 'Users',
    foreignKey: 'CreateUserId',
    targetKey: 'Id',
  });
  SurgeryPlans.belongsTo(Models.DoctorsProfile, {
    as: 'DoctorsProfile',
    foreignKey: 'CreateUserId',
    targetKey: 'UserId',
  });
  SurgeryPlans.belongsTo(Models.Organization, {
    as: 'Organization',
    foreignKey: 'organization_id',
    targetKey: 'Id',
  });
  SurgeryPlans.hasMany(Models.SurgeryPlansLookUp, {
    as: 'LookUpData',
    foreignKey: 'id_data',
  });
};

SurgeryPlans.SetFunctions = (Models) => {
  SurgeryPlans.findAllNew = async function (Option) {
    const result = await SurgeryPlans.findAll({
      ...Option,
      include: [
        {
          model: Models.DrgroupDepartments,
          as: 'DrgroupDepartments',
          attributes: ['name', 'id_data'],
        },
        {
          model: Models.Patient,
          as: 'Patient',
          attributes: [
            'p_familyname',
            'p_lastname',
            'p_firstname',
            'p_gender',
            'p_birthday',
            'p_registration',
            'p_telephone',
            'Age',
          ],
          include: [
            { model: Models.vwGender, as: 'Gender' },
            {
              model: Models.DictProvinceCity,
              as: 'DictProvinceCity',
              attributes: ['id_data', 'name'],
            },
            {
              model: Models.DictSoumDistrict,
              as: 'DictSoumDistrict',
              attributes: ['id_data', 'name'],
            },
          ],
        },
      ],
    });
    return result;
  };

  SurgeryPlans.findAllDetail = async function (Option) {
    const result = await SurgeryPlans.findAll({
      ...Option,
      include: [
        {
          model: Models.Users,
          as: 'Users',
          attributes: Models.Users.DetaultFields,
        },
        {
          model: Models.DoctorsProfile,
          as: 'DoctorsProfile',
          attributes: ['id_data', 'firstname', 'lastname'],
        },
        {
          model: Models.Patient,
          as: 'Patient',
          attributes: ['id_data', 'p_lastname', 'p_firstname', 'p_registration'],
        },
        { model: Models.SurgeryPlansLookUp, as: 'LookUpData' },
      ],
    });
    return result;
  };
};

module.exports = SurgeryPlans;
