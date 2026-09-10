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
    await DoctorTooDepartment.create(Data);
    const [ReturnData] = await sequelize.query(
      'SELECT TOP 1  ' +
        ReturnIdField +
        ' FROM [DoctorTooDepartment] ORDER BY ' +
        ReturnIdField +
        ' DESC '
    );
    return ReturnData[0][ReturnIdField];
  };
};

module.exports = DoctorTooDepartment;
