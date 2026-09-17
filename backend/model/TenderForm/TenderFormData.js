const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

// One row per filled form instance. Answers live in `Data` as JSON keyed by
// TenderFormField.FieldCode. NOTE: Sequelize's DataTypes.JSON is broken on the
// mssql dialect (it emits an invalid `JSON` column type), so this is TEXT
// (NVARCHAR(MAX)) and the controller parses/stringifies explicitly.
class TenderFormData extends Sequelize.Model {}
TenderFormData.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    FormCode: { type: Sequelize.STRING },
    FormVersion: { type: Sequelize.INTEGER },
    PatRegNo: { type: Sequelize.STRING },
    PatientId: { type: Sequelize.INTEGER },
    FormDate: { type: Sequelize.DATEONLY },
    VisitId: { type: Sequelize.INTEGER },
    SurgeryId: { type: Sequelize.INTEGER },
    DoctorId: { type: Sequelize.INTEGER },
    OrganizationId: { type: Sequelize.INTEGER },
    Data: { type: Sequelize.TEXT },
    Status: { type: Sequelize.INTEGER },
    rec_status: { type: Sequelize.INTEGER },
    CreateDate: { type: Sequelize.DATE },
    CreateUserId: { type: Sequelize.INTEGER },
    UpdateDate: { type: Sequelize.DATE },
    UpdateUserId: { type: Sequelize.INTEGER },
  },
  { sequelize, tableName: 'TenderFormData', modelName: 'TenderFormData', timestamps: false }
);

TenderFormData.SearchField = [
  'Id',
  'FormCode',
  'PatRegNo',
  'PatientId',
  'FormDate',
  'DoctorId',
  'OrganizationId',
  'Status',
  'rec_status',
  'CreateDate',
  // The answers themselves, so the unified search can look inside a form
  // without the caller having to know which field code holds what. It is a
  // LIKE over NVARCHAR(MAX), so it is a scan - fine at present volumes, and
  // the reason the screen keeps it as a separate, deliberate box rather than
  // folding it into the default search.
  'Data',
];

/**
 * The unified cross-form register needs the patient's name, the form's name and
 * the recording doctor alongside each row, and none of those live on this
 * table. ModelHelper.FindAllExec calls findAllNew when the request asks for
 * FindType 'AllData', which is the default, so this is where the joins belong -
 * the generic finder itself never adds an include.
 *
 * Attributes are listed explicitly: without that the join would drag every
 * patient column through the list and the Excel export.
 */
TenderFormData.SetFunctions = (Models) => {
  TenderFormData.findAllNew = async function (Option) {
    // Soft-deleted rows are excluded here rather than by the caller. The
    // generated per-form views drop rec_status 2 in their own SQL, but the
    // generic finder never filters it, so without this the unified register -
    // and its exports - would keep listing records the user had deleted.
    const NotDeleted = { rec_status: { [Sequelize.Op.ne]: 2 } };
    const Where =
      Option && Option.where ? { [Sequelize.Op.and]: [Option.where, NotDeleted] } : NotDeleted;

    return await TenderFormData.findAll({
      ...Option,
      where: Where,
      include: [
        {
          model: Models.Patient,
          as: 'Patient',
          attributes: ['id_data', 'p_lastname', 'p_firstname', 'p_registration'],
          required: false,
        },
        {
          model: Models.TenderForm,
          as: 'TenderForm',
          attributes: ['FormCode', 'NameMn', 'GroupCode'],
          required: false,
        },
        {
          model: Models.DoctorsProfile,
          as: 'DoctorsProfile',
          // FullName is a VIRTUAL built from lastname and firstname; both the
          // virtual and its sources are requested so the getter has something
          // to work with.
          attributes: ['id_data', 'lastname', 'firstname', 'FullName'],
          required: false,
        },
      ],
    });
  };
};

// Joined only for display on the unified list: patient name, form name and the
// doctor who recorded it. The form itself never uses these.
TenderFormData.SetAssocations = (Models) => {
  TenderFormData.belongsTo(Models.Patient, {
    as: 'Patient',
    foreignKey: 'PatientId',
    targetKey: 'id_data',
  });

  TenderFormData.belongsTo(Models.TenderForm, {
    as: 'TenderForm',
    foreignKey: 'FormCode',
    targetKey: 'FormCode',
  });

  // DoctorId holds a Users.Id, and DoctorsProfile.UserId is mapped onto the
  // `id` column, which is the one that matches it.
  TenderFormData.belongsTo(Models.DoctorsProfile, {
    as: 'DoctorsProfile',
    foreignKey: 'DoctorId',
    targetKey: 'UserId',
  });
};

module.exports = TenderFormData;
