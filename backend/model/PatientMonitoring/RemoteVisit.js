const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class RemoteVisit extends Sequelize.Model {}

/*
 * The booking columns below are declared only because they EXIST. Verified on
 * MnCardio_test 2026-09-14; add_remotevisit_booking_columns.sql and
 * add_remotevisit_meeting_url.sql have both been run there.
 *
 * That order matters and is easy to get backwards. Sequelize builds its SELECT
 * list from the declared attributes, so declaring a column the database does
 * not have turns every read of this table into "Invalid column name" - and this
 * table is already live behind GET /api/patient/evisits. Rehabilitation had the
 * opposite luck: its tables were absent entirely, so the endpoints merely 500'd
 * and nothing that worked stopped working. Here it would break a shipped
 * endpoint. DDL first, model second, always.
 *
 * DoctorId IS DoctorsProfile.id_data, not Users.Id. The original script's
 * comment said `DoctorsProfile.id`, which is the opposite - that column holds
 * the Users.Id (see the SELECT dp.id AS UserId in helper/CareTeam.js). Every
 * other DoctorId in this schema means id_data, and so does this one. Getting it
 * wrong joins the wrong doctor and nothing errors.
 */
RemoteVisit.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    Comment: { type: Sequelize.STRING },
    CreateDate: { type: Sequelize.DATE },
    PatientId: { type: Sequelize.INTEGER },

    RequestedDate: { type: Sequelize.DATE },
    ScheduledDate: { type: Sequelize.DATE },
    // defaultValue mirrors the column DEFAULT so an insert that omits Status
    // gets the same answer whether it goes through Sequelize or raw SQL.
    Status: { type: Sequelize.STRING, defaultValue: 'requested' },
    DoctorId: { type: Sequelize.INTEGER },
    UpdateDate: { type: Sequelize.DATE },
    MeetingUrl: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'RemoteVisit',
    modelName: 'RemoteVisit',
    timestamps: false,
  }
);

// Left as the patient's own free text. This drives the legacy generic search
// box, and a doctor looking for a request searches by what the patient wrote,
// not by a status code.
RemoteVisit.SearchField = ['Comment'];

RemoteVisit.SetAssocations = (Models) => {
  RemoteVisit.belongsTo(Models.Patient, {
    as: 'Patient',
    foreignKey: 'PatientId',
  });

  RemoteVisit.belongsTo(Models.DoctorsProfile, {
    as: 'Doctor',
    foreignKey: 'DoctorId',
    targetKey: 'id_data',
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
