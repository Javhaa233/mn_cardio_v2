const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class PatientSendPage extends Sequelize.Model {}
PatientSendPage.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },

    type: { type: Sequelize.STRING },
    PatientId: { type: Sequelize.INTEGER },
    PatRegNo: { type: Sequelize.STRING },
    DoctorId: { type: Sequelize.INTEGER },
    CreateDate: { type: Sequelize.DATE },
    CreateUserId: { type: Sequelize.INTEGER },
    FromOrganizationId: { type: Sequelize.INTEGER },
    FromOrgName: { type: Sequelize.STRING },
    ToOrganizationId: { type: Sequelize.INTEGER },
    ToOrgName: { type: Sequelize.STRING },
    burtgel_code: { type: Sequelize.STRING },
    emd_no: { type: Sequelize.STRING },
    pat_address: { type: Sequelize.STRING },
    work_position: { type: Sequelize.STRING },
    ts_ye_sh: { type: Sequelize.STRING },
    sh_sye_sh: { type: Sequelize.STRING },
    biohimi: { type: Sequelize.STRING },
    rentgen: { type: Sequelize.STRING },
    other_test: { type: Sequelize.STRING },
    pat_notes: { type: Sequelize.STRING },
    main_diagnosis: { type: Sequelize.STRING },
    undeslel: { type: Sequelize.STRING },
    main_doctor_name: { type: Sequelize.STRING },
    medical_doctor_name: { type: Sequelize.STRING },
    em_emchilgee: { type: Sequelize.STRING },
    em_bus_emchilgee: { type: Sequelize.STRING },
    org_advice_notes: { type: Sequelize.STRING },
    Comment: { type: Sequelize.STRING },
    SendDate: { type: Sequelize.DATE },
  },
  {
    sequelize,
    tableName: 'PatientSendPage',
    modelName: 'PatientSendPage',
    timestamps: false,
  }
);

PatientSendPage.SearchField = ['Id', 'PatRegNo', 'CreateDate', 'FromOrgName', 'ToOrgName'];

PatientSendPage.SetAssocations = (Models) => {
  PatientSendPage.belongsTo(Models.Users, {
    as: 'Users',
    foreignKey: 'CreateUserId',
    targetKey: 'Id',
  });

  PatientSendPage.belongsTo(Models.DoctorsProfile, {
    as: 'DoctorsProfile',
    foreignKey: 'DoctorId',
    targetKey: 'id_data',
  });

  PatientSendPage.belongsTo(Models.Organization, {
    as: 'FromOrganization',
    foreignKey: 'FromOrganizationId',
    targetKey: 'Id',
  });

  PatientSendPage.belongsTo(Models.Organization, {
    as: 'ToOrganization',
    foreignKey: 'ToOrganizationId',
    targetKey: 'Id',
  });

  PatientSendPage.belongsTo(Models.Patient, {
    as: 'Patient',
    foreignKey: 'PatRegNo',
    targetKey: 'p_registration',
  });

  PatientSendPage.belongsTo(Models.JournalRef, {
    as: 'JournalRef',
    foreignKey: 'main_diagnosis',
    targetKey: 'id_data',
  });
};

PatientSendPage.SetFunctions = (Models) => {
  PatientSendPage.findAllNew = async function (Option) {
    const result = await PatientSendPage.findAll({
      ...Option,
      include: [
        {
          model: Models.Users,
          as: 'Users',
          attributes: ['Id', 'UserName', 'LastName', 'FirstName'],
        },
        {
          model: Models.Patient,
          as: 'Patient',
          attributes: [
            'id_data',
            'p_lastname',
            'p_firstname',
            'p_registration',
            'p_birthday',
            'FullName',
          ],
        },
        {
          model: Models.Organization,
          as: 'FromOrganization',
          attributes: ['Id', 'Name'],
        },
        {
          model: Models.Organization,
          as: 'ToOrganization',
          attributes: ['Id', 'Name'],
        },
        {
          model: Models.JournalRef,
          as: 'JournalRef',
          attributes: ['id_data', 'jr_label'],
        },
        {
          model: Models.DoctorsProfile,
          as: 'DoctorsProfile',
          attributes: ['id_data', 'firstname', 'lastname'],
        },
      ],
    });

    return result;
  };
};

module.exports = PatientSendPage;
