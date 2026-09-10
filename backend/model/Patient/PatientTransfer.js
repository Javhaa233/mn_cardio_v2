const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class PatientTransfer extends Sequelize.Model {}
PatientTransfer.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    PatientId: { type: Sequelize.INTEGER },
    DoctorId: { type: Sequelize.INTEGER },
    CreateUserId: { type: Sequelize.INTEGER },
    FromOrganizationId: { type: Sequelize.INTEGER },
    ToOrganizationId: { type: Sequelize.INTEGER },
    Diagnosis: { type: Sequelize.INTEGER },
    Purpose: { type: Sequelize.TEXT },
    Comment: { type: Sequelize.TEXT },
    TransferedDate: { type: Sequelize.DATE },
    CreateDate: { type: Sequelize.DATE },
  },
  {
    sequelize,
    tableName: 'PatientTransfer',
    modelName: 'PatientTransfer',
    timestamps: false,
  }
);

PatientTransfer.SearchField = ['Id', 'CreateDate'];

PatientTransfer.SetAssocations = (Models) => {
  PatientTransfer.belongsTo(Models.Users, {
    as: 'Users',
    foreignKey: 'CreateUserId',
    targetKey: 'Id',
  });

  PatientTransfer.belongsTo(Models.DoctorsProfile, {
    as: 'DoctorsProfile',
    foreignKey: 'DoctorId',
    targetKey: 'id_data',
  });

  PatientTransfer.belongsTo(Models.Organization, {
    as: 'FromOrganization',
    foreignKey: 'FromOrganizationId',
    targetKey: 'Id',
  });

  PatientTransfer.belongsTo(Models.Organization, {
    as: 'ToOrganization',
    foreignKey: 'ToOrganizationId',
    targetKey: 'Id',
  });

  PatientTransfer.belongsTo(Models.Patient, {
    as: 'Patient',
    foreignKey: 'PatientId',
    targetKey: 'id_data',
  });

  PatientTransfer.belongsTo(Models.JournalRef, {
    as: 'JournalRef',
    foreignKey: 'Diagnosis',
    targetKey: 'id_data',
  });
};

PatientTransfer.SetFunctions = (Models) => {
  PatientTransfer.findAllNew = async function (Option) {
    const result = await PatientTransfer.findAll({
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

module.exports = PatientTransfer;
