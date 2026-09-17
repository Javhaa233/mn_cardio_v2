const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class DoctorTooDepartment extends Sequelize.Model {}
DoctorTooDepartment.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    DoctorId: { type: Sequelize.INTEGER },
    DepartmentId: { type: Sequelize.INTEGER },
    CreateDate: { type: Sequelize.DATE },
    CreateUserId: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'DoctorTooDepartment',
    modelName: 'DoctorTooDepartment',
    timestamps: false,
  }
);

DoctorTooDepartment.SearchField = ['Id', 'DoctorId', 'DepartmentId', 'CreateDate', 'CreateUserId'];

DoctorTooDepartment.SetAssocations = (Models) => {
  DoctorTooDepartment.belongsTo(Models.Users, {
    as: 'CreateUser',
    foreignKey: 'CreateUserId',
    targetKey: 'Id',
  });

  DoctorTooDepartment.belongsTo(Models.DoctorsProfile, {
    as: 'DoctorsProfile',
    foreignKey: 'DoctorId',
    targetKey: 'id_data',
  });

  DoctorTooDepartment.belongsTo(Models.DrgroupDepartments, {
    as: 'DrgroupDepartments',
    foreignKey: 'DepartmentId',
    targetKey: 'id_data',
  });
};

DoctorTooDepartment.SetFunctions = (Models) => {
  DoctorTooDepartment.findAllNew = async function (Option) {
    var Result = await DoctorTooDepartment.findAll({
      ...Option,
      include: [
        {
          model: Models.Users,
          as: 'CreateUser',
          attributes: Models.Users.DetaultFields,
        },
        {
          model: Models.DoctorsProfile,
          as: 'DoctorsProfile',
          attributes: ['firstname', 'lastname', 'id_data'],
        },
        {
          model: Models.DrgroupDepartments,
          as: 'DrgroupDepartments',
          attributes: ['id_data', 'name'],
        },
      ],
    });
    return Result;
  };

  DoctorTooDepartment.createNew = async function (Data, ReturnIdField) {
    // The id comes from the INSERT, not from a follow-up query.
    //
    // This used to be `SELECT TOP 1 <pk> FROM [DoctorTooDepartment] ORDER BY <pk> DESC` run
    // immediately after the create. Two concurrent creates both read the HIGHER
    // id, so the loser returned the winner's row and attached its child rows -
    // files, lookups, many-to-many links - to the wrong record. Reproduced
    // against the database: two creates in one transaction returned 5 and 6,
    // while the old query returned 6 for both.
    //
    // create() already carries the generated key: ReturnIdField is declared
    // autoIncrement, and Sequelize reads it back through OUTPUT INSERTED.
    const Created = await DoctorTooDepartment.create(Data);

    return Created[ReturnIdField];
  };
};

module.exports = DoctorTooDepartment;
