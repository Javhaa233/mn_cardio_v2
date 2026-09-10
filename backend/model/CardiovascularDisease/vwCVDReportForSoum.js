const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class vwCVDReportForSoum extends Sequelize.Model {}
vwCVDReportForSoum.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true },

    BirthDate: { type: Sequelize.DATE },
    PatRegNo: { type: Sequelize.STRING },
    Age: { type: Sequelize.TINYINT },
    Status: { type: Sequelize.STRING },
    IsActive: { type: Sequelize.STRING },
    ParentOrganizationId: { type: Sequelize.INTEGER },
    OrganizationId: { type: Sequelize.INTEGER },
    ProvinceCityId: { type: Sequelize.INTEGER },
    SoumDistrictId: { type: Sequelize.INTEGER },
    BagKhorooId: { type: Sequelize.INTEGER },
    ExpiredDate: { type: Sequelize.DATE },
    CanceledDate: { type: Sequelize.DATE },

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
        PatRegYear = PatRegNo.toString().substring(2, 4);
        PatRegMonth = PatRegNo.toString().substring(4, 6);
        PatRegMonthFirst = PatRegMonth.toString().substring(0, 1);
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
    tableName: 'vwCVDReportForSoum',
    modelName: 'vwCVDReportForSoum',
    timestamps: false,
  }
);

vwCVDReportForSoum.SetAssocations = (Models) => {
  vwCVDReportForSoum.belongsTo(Models.Users, {
    as: 'Users',
    foreignKey: 'CreateUserId',
    targetKey: 'Id',
  });
  vwCVDReportForSoum.belongsTo(Models.DoctorsProfile, {
    as: 'DoctorsProfile',
    foreignKey: 'CreateUserId',
    targetKey: 'UserId',
  });
  vwCVDReportForSoum.belongsTo(Models.Organization, {
    as: 'ParentOrganization',
    foreignKey: 'ParentOrganizationId',
    targetKey: 'Id',
  });
  vwCVDReportForSoum.belongsTo(Models.Organization, {
    as: 'Organization',
    foreignKey: 'OrganizationId',
    targetKey: 'Id',
  });
  vwCVDReportForSoum.belongsTo(Models.DictProvinceCity, {
    as: 'DictProvinceCity',
    foreignKey: 'ProvinceCityId',
  });
  vwCVDReportForSoum.belongsTo(Models.DictSoumDistrict, {
    as: 'DictSoumDistrict',
    foreignKey: 'SoumDistrictId',
  });
  vwCVDReportForSoum.belongsTo(Models.DictBagKhoroo, {
    as: 'DictBagKhoroo',
    foreignKey: 'BagKhorooId',
  });
  vwCVDReportForSoum.belongsTo(Models.CVDPatient, {
    as: 'CVDPatient',
    foreignKey: 'PatRegNo',
    targetKey: 'RegNo',
  });
  vwCVDReportForSoum.belongsTo(Models.Patient, {
    as: 'Patient',
    foreignKey: 'PatRegNo',
    targetKey: 'p_registration',
  });
  vwCVDReportForSoum.hasMany(Models.CVDHistory, {
    as: 'CVDHistory',
    foreignKey: 'Id',
    targetKey: 'MonitoringId',
  });
  vwCVDReportForSoum.hasMany(Models.CVDBodySize, {
    as: 'CVDBodySize',
    foreignKey: 'Id',
    targetKey: 'MonitoringId',
  });
  vwCVDReportForSoum.hasMany(Models.CVDRisk, {
    as: 'CVDRisk',
    foreignKey: 'Id',
    targetKey: 'MonitoringId',
  });
  vwCVDReportForSoum.hasMany(Models.CVDManagement, {
    as: 'CVDManagement',
    foreignKey: 'Id',
    targetKey: 'MonitoringId',
  });
  vwCVDReportForSoum.hasMany(Models.CVDSentPrescription, {
    as: 'CVDSentPrescription',
    foreignKey: 'Id',
    targetKey: 'MonitoringId',
  });
  vwCVDReportForSoum.hasMany(Models.CVDDiagnosis, {
    as: 'CVDDiagnosis',
    foreignKey: 'Id',
    targetKey: 'MonitoringId',
  });
};

vwCVDReportForSoum.SearchField = ['PatRegNo', 'Status'];

vwCVDReportForSoum.SetFunctions = (Models) => {
  vwCVDReportForSoum.findReportData = async function (Option) {
    const result = await vwCVDReportForSoum.findAll({
      ...Option,
      include: [
        {
          model: Models.CVDPatient,
          as: 'CVDPatient',
          attributes: Models.CVDPatient.DetaultFields,
        },
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
          model: Models.DoctorsProfile,
          as: 'DoctorsProfile',
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

module.exports = vwCVDReportForSoum;
