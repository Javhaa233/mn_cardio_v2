const Sequelize = require('sequelize');
const bcrypt = require('bcryptjs');

const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

// const MailHelper = require("../../helper/MailHelper");

class PatientUsers extends Sequelize.Model {}
PatientUsers.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },

    UserName: { type: Sequelize.STRING },
    Email: { type: Sequelize.STRING },
    LastName: { type: Sequelize.STRING },
    FirstName: { type: Sequelize.STRING },
    Password: { type: Sequelize.STRING },
    PlainPassword: { type: Sequelize.STRING },
    Email: { type: Sequelize.STRING },
    UserTypeId: { type: Sequelize.INTEGER },
    CreateDate: { type: Sequelize.DATE },
    CreateUserId: { type: Sequelize.STRING },
    IsActive: { type: Sequelize.STRING },
    PassExpireDate: { type: Sequelize.DATE },
    ForgotPassToken: { type: Sequelize.STRING },
    ForgotPassExpireDate: { type: Sequelize.DATE },
    AppId: { type: Sequelize.INTEGER },
    RoleId: { type: Sequelize.INTEGER },
    Language: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'PatientUsers',
    modelName: 'PatientUsers',
    timestamps: false,
  }
);

PatientUsers.SearchField = ['UserName', 'Email', 'FirstName', 'LastName'];

PatientUsers.DetaultFields = [
  'Id',
  'UserName',
  'Email',
  'FirstName',
  'LastName',
  'RoleId',
  'PassExpireDate',
];

PatientUsers.SetAssocations = (Models) => {
  PatientUsers.belongsTo(Models.Roles, {
    as: 'Role',
    foreignKey: 'RoleId',
  });
  PatientUsers.belongsTo(Models.Apps, {
    as: 'Apps',
    foreignKey: 'AppId',
  });
  PatientUsers.hasMany(Models.PatientUserToRole, {
    as: 'PatientUserToRole',
    foreignKey: 'UserId',
  });
  PatientUsers.belongsTo(Models.Users, {
    as: 'CreateUser',
    foreignKey: 'CreateUserId',
  });
};

PatientUsers.SetFunctions = (Models) => {
  PatientUsers.CreateCustom = async function (Data) {
    if (Data.Password) Data.Password = await bcrypt.hash(Data.Password, 8);

    // username duplicate check
    const UserName = Data.UserName || null;
    if (UserName) {
      const check = await PatientUsers.count({ where: { UserName } }).then((count) => {
        return count > 0 ? false : true;
      });

      if (!check) throw { Success: false, Message: 'The user name is a duplicate' };
    }

    const User = await PatientUsers.create(Data);

    return User;
  };

  PatientUsers.createNew = async function (Data, ReturnIdField) {
    if (Data.Password) {
      Data.Password = await bcrypt.hash(Data.Password, 8);
    }

    // username duplicate check
    const UserName = Data.UserName ? Data.UserName : null;
    if (UserName) {
      const check = await PatientUsers.count({ where: { UserName } }).then((count) => {
        return count > 0 ? false : true;
      });

      if (!check) throw { Success: false, Message: 'The user name is a duplicate' };
    } else {
      throw { Success: false, Message: 'User name is required' };
    }

    await PatientUsers.create(Data);
    const [ReturnData] = await sequelize.query(
      'SELECT TOP 1  ' + ReturnIdField + ' FROM [PatientUsers] ORDER BY ' + ReturnIdField + ' DESC '
    );
    return ReturnData[0][ReturnIdField];
  };

  PatientUsers.updateNew = async function (Data, DataId, PK) {
    const UserName = Data.UserName ? Data.UserName : null;
    if (UserName) {
      const check = await PatientUsers.count({
        where: { UserName, [Sequelize.Op.not]: { Id: DataId } },
      }).then((count) => {
        return count > 0 ? false : true;
      });

      if (!check) throw { Success: false, Message: 'The user name is a duplicate' };
    }

    await PatientUsers.update(Data, { where: { [PK]: DataId } });

    return DataId;
  };

  PatientUsers.findAllNew = async function (Option) {
    const result = await PatientUsers.findAll({
      ...Option,
      include: [
        { model: Models.Users, as: 'CreateUser' },
        { model: Models.Roles, as: 'Role' },
      ],
    });
    return result;
  };

  PatientUsers.findAllDetail = async function (Option) {
    const result = await PatientUsers.findAll({
      ...Option,
      include: [
        { model: Models.Roles, as: 'Role' },
        {
          model: Models.PatientUserToRole,
          as: 'PatientUserToRole',
          include: [{ model: Models.Roles, as: 'Roles' }],
        },
        { model: Models.Users, as: 'CreateUser' },
      ],
    });
    return result;
  };
};
module.exports = PatientUsers;
