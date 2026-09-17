const Sequelize = require('sequelize');
const sequelize = require('../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class File extends Sequelize.Model {}

File.init(
  {
    id_data: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id: { type: Sequelize.INTEGER },

    id_group: { type: Sequelize.INTEGER },
    date_creation: { type: Sequelize.DATE },
    user_mod: { type: Sequelize.STRING },
    date_modif: { type: Sequelize.DATE },

    rec_status: { type: Sequelize.INTEGER },
    comment: { type: Sequelize.STRING },
    ext: { type: Sequelize.STRING },
    hash: { type: Sequelize.STRING },
    original_name: { type: Sequelize.STRING },
    generated_name: { type: Sequelize.STRING },
    linked_q: { type: Sequelize.INTEGER },
    linked_id_data: { type: Sequelize.INTEGER },
    size: { type: Sequelize.INTEGER },
    patient_id: { type: Sequelize.INTEGER },
    LinkedObjectName: { type: Sequelize.STRING },
    LinkedObjectId: { type: Sequelize.INTEGER },
    FieldName: { type: Sequelize.STRING },

    /*
     * duration_ms and media_state (scripts/add_file_media_columns.sql) are
     * DELIBERATELY NOT DECLARED HERE. helper/MediaMeta.js reads and writes them
     * with guarded raw SQL instead.
     *
     * model/Patient/Patient.js declares ConfidentialityLevel the ordinary way
     * for the same situation, and that is normally right. File is the exception
     * because of blast radius: a declared attribute goes into the default
     * SELECT of every File query, so on a database where the script has not run
     * yet, EVERY attachment in the application - not just chat media - fails
     * with an invalid column reference. The confidentiality script had already
     * been applied when its column was declared; this one is still a request to
     * whoever holds SQL access, so the code has to work on both sides of it.
     */
  },
  {
    sequelize,
    tableName: 'File',
    modelName: 'File',
    timestamps: false,
  }
);

File.SearchField = [
  'id_data',
  'id',
  'id_group',
  'date_creation',
  'user_mod',
  'date_modif',
  'rec_status',
  'comment',
  'ext',
  'hash',
  'original_name',
  'generated_name',
  'linked_q',
  'linked_id_data',
  'size',
  'patient_id',
  'FieldName',
];

File.createNew = async function (Data, ReturnIdField) {
  // The id comes from the INSERT, not from a follow-up query.
  //
  // This used to be `SELECT TOP 1 <pk> FROM [File] ORDER BY <pk> DESC` run
  // immediately after the create. Two concurrent creates both read the HIGHER
  // id, so the loser returned the winner's row and attached its child rows -
  // files, lookups, many-to-many links - to the wrong record. Reproduced
  // against the database: two creates in one transaction returned 5 and 6,
  // while the old query returned 6 for both.
  //
  // create() already carries the generated key: ReturnIdField is declared
  // autoIncrement, and Sequelize reads it back through OUTPUT INSERTED.
  const Created = await File.create(Data);

  return Created[ReturnIdField];
};

module.exports = File;
