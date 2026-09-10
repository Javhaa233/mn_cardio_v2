const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class CVDMonitoring extends Sequelize.Model {}
CVDMonitoring.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },

    PatRegNo: { type: Sequelize.STRING },
    BirthDate: { type: Sequelize.DATE },
    Age: { type: Sequelize.STRING },
    Status: { type: Sequelize.STRING },
    IsActive: { type: Sequelize.STRING },
    ParentOrganizationId: { type: Sequelize.INTEGER },
    OrganizationId: { type: Sequelize.INTEGER },
    ProvinceCityId: { type: Sequelize.INTEGER },
    SoumDistrictId: { type: Sequelize.INTEGER },
    BagKhorooId: { type: Sequelize.INTEGER },
    StartedDate: { type: Sequelize.DATE },
    OutUserId: { type: Sequelize.INTEGER },
    OutDate: { type: Sequelize.DATE },
    ExpiredDate: { type: Sequelize.DATE },
    CanceledDate: { type: Sequelize.DATE },

    date_status: { type: Sequelize.DATE },

    CreateDate: { type: Sequelize.DATE },
    CreateUserId: { type: Sequelize.INTEGER },
    UpdateDate: { type: Sequelize.DATE },
    UpdateUserId: { type: Sequelize.INTEGER },

    PatAge: {
      type: Sequelize.VIRTUAL,
      get() {
        const PatRegNo = this.PatRegNo ? this.PatRegNo : '';
        const CreateDate = this.CreateDate ? this.CreateDate : new Date();
        var Age = 0;
        var PatRegYear = 0;
        var PatRegCentury = '';
        var PatRegMonth = 0;
        var PatRegMonthFirst = 0;
        const NowDate = CreateDate.getFullYear();
        const NowYear = NowDate.toString().substring(2, 4);
        PatRegYear = PatRegNo.substring(2, 4);
        PatRegMonth = PatRegNo.substring(4, 6);
        PatRegMonthFirst = PatRegMonth.substring(0, 1);
        PatRegCentury = PatRegMonthFirst >= 2 ? 'XXI' : PatRegMonthFirst <= 1 ? 'XX' : '';
        Age =
          PatRegCentury === 'XXI'
            ? parseInt(NowYear) - parseInt(PatRegYear)
            : PatRegCentury === 'XX'
              ? 100 + parseInt(NowYear) - parseInt(PatRegYear)
              : 0;

        return Age;
      },
    },
  },
  {
    sequelize,
    tableName: 'CVDMonitoring',
    modelName: 'CVDMonitoring',
    timestamps: false,
  }
);

CVDMonitoring.SearchField = [
  'Id',
  'PatRegNo',
  'CreateDate',
  'CreateUserId',
  'UpdateDate',
  'UpdateUserId',
  'date_status',
];

CVDMonitoring.SetAssocations = (Models) => {
  CVDMonitoring.belongsTo(Models.Users, {
    as: 'Users',
    foreignKey: 'CreateUserId',
    targetKey: 'Id',
  });
  CVDMonitoring.belongsTo(Models.Users, {
    as: 'UpdateUsers',
    foreignKey: 'UpdateUserId',
    targetKey: 'Id',
  });
  CVDMonitoring.belongsTo(Models.Users, {
    as: 'OutUsers',
    foreignKey: 'OutUserId',
    targetKey: 'Id',
  });
  CVDMonitoring.belongsTo(Models.DoctorsProfile, {
    as: 'DoctorsProfile',
    foreignKey: 'CreateUserId',
    targetKey: 'UserId',
  });
  CVDMonitoring.belongsTo(Models.DoctorsProfile, {
    as: 'OutDoctor',
    foreignKey: 'OutUserId',
    targetKey: 'UserId',
  });
  CVDMonitoring.belongsTo(Models.Organization, {
    as: 'ParentOrganization',
    foreignKey: 'ParentOrganizationId',
    targetKey: 'Id',
  });
  CVDMonitoring.belongsTo(Models.Organization, {
    as: 'Organization',
    foreignKey: 'OrganizationId',
    targetKey: 'Id',
  });
  CVDMonitoring.belongsTo(Models.DictProvinceCity, {
    as: 'DictProvinceCity',
    foreignKey: 'ProvinceCityId',
  });
  CVDMonitoring.belongsTo(Models.DictSoumDistrict, {
    as: 'DictSoumDistrict',
    foreignKey: 'SoumDistrictId',
  });
  CVDMonitoring.belongsTo(Models.DictBagKhoroo, {
    as: 'DictBagKhoroo',
    foreignKey: 'BagKhorooId',
  });
  CVDMonitoring.belongsTo(Models.CVDPatient, {
    as: 'CVDPatient',
    foreignKey: 'PatRegNo',
    targetKey: 'RegNo',
  });
  CVDMonitoring.belongsTo(Models.Patient, {
    as: 'Patient',
    foreignKey: 'PatRegNo',
    targetKey: 'p_registration',
  });
  CVDMonitoring.hasMany(Models.CVDHistory, {
    as: 'CVDHistory',
    foreignKey: 'Id',
    targetKey: 'MonitoringId',
  });
  CVDMonitoring.hasMany(Models.CVDBodySize, {
    as: 'CVDBodySize',
    foreignKey: 'Id',
    targetKey: 'MonitoringId',
  });
  CVDMonitoring.hasMany(Models.CVDRisk, {
    as: 'CVDRisk',
    foreignKey: 'Id',
    targetKey: 'MonitoringId',
  });
  CVDMonitoring.hasMany(Models.CVDManagement, {
    as: 'CVDManagement',
    foreignKey: 'Id',
    targetKey: 'MonitoringId',
  });
  CVDMonitoring.hasMany(Models.CVDSentPrescription, {
    as: 'CVDSentPrescription',
    foreignKey: 'Id',
    targetKey: 'MonitoringId',
  });
  CVDMonitoring.hasMany(Models.CVDDiagnosis, {
    as: 'CVDDiagnosis',
    foreignKey: 'Id',
    targetKey: 'MonitoringId',
  });
};

CVDMonitoring.SetFunctions = (Models) => {
  CVDMonitoring.findAllNew = async function (Option) {
    const NewOption = { ...Option, order: [['Id', 'DESC']] };
    const result = await CVDMonitoring.findAll({
      ...NewOption,
      include: [
        {
          model: Models.Patient,
          as: 'Patient',
          attributes: Models.Patient.DetaultFields,
        },
        {
          model: Models.Users,
          as: 'Users',
          attributes: Models.Users.DetaultFields,
        },
        {
          model: Models.Users,
          as: 'OutUsers',
          attributes: Models.Users.DetaultFields,
        },
        {
          model: Models.DoctorsProfile,
          as: 'DoctorsProfile',
          attributes: Models.DoctorsProfile.DefaultFields,
          include: [
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
        },
        {
          model: Models.DoctorsProfile,
          as: 'OutDoctor',
          attributes: Models.DoctorsProfile.DefaultFields,
          include: [
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
        },
        {
          model: Models.DictProvinceCity,
          as: 'DictProvinceCity',
          attributes: ['id_data', 'name', 'date_creation', 'is_city'],
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
        {
          model: Models.Organization,
          as: 'Organization',
        },
      ],
    });
    // let newRes = [];
    // for (let i = 0; i < result.length; i++) {
    //   // newRes.push({
    //   //   ...result[i].dataValues,
    //   //   CVDHistory: await result[i].getCVDHistory(),
    //   // });
    //   result[i].dataValues.CVDHistory1 = await result[i].getCVDHistory();
    // }

    return result;
  };

  // ReportData
  CVDMonitoring.findReportData = async function (Option) {
    // var Option = { ...Option, order: [["Id", "DESC"]] };
    const result = await CVDMonitoring.findAll({
      ...Option,
      include: [
        {
          model: Models.CVDPatient,
          as: 'CVDPatient',
          attributes: Models.CVDPatient.DetaultFields,
        },
        {
          model: Models.Users,
          as: 'Users',
          attributes: Models.Users.DetaultFields,
        },
        {
          model: Models.DoctorsProfile,
          as: 'DoctorsProfile',
          attributes: Models.DoctorsProfile.DefaultFields,
        },
        {
          model: Models.DoctorsProfile,
          as: 'OutDoctor',
          attributes: Models.DoctorsProfile.DefaultFields,
        },
        {
          model: Models.DictProvinceCity,
          as: 'DictProvinceCity',
          attributes: ['id_data', 'name', 'date_creation', 'is_city'],
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
        { model: Models.Organization, as: 'Organization' },
      ],
    });

    return result;
  };
};

module.exports = CVDMonitoring;
