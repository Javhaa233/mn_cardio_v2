const Sequelize = require('sequelize');
const bcrypt = require('bcryptjs');
const { IsBcryptHash } = require('../../helper/PasswordPolicy');

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

    /*
     * Login lockout (tracker 20), added by
     * scripts/add_login_attempt_tracking.sql.
     *
     * helper/LoginGuard.js counts in memory when these are absent and persists
     * when they are present - but only if Sequelize knows about them. An
     * undeclared column on a WRITE is discarded silently, so persistence would
     * have appeared to work while storing nothing.
     *
     * LockedUntil is a timestamp, never a boolean: a permanent lock on a
     * username an attacker can guess is a denial-of-service against the real
     * doctor, on a system used for clinical work.
     */
    FailedLoginCount: { type: Sequelize.INTEGER },
    LastFailedLogin: { type: Sequelize.DATE },
    LockedUntil: { type: Sequelize.DATE },
    LockNotifiedDate: { type: Sequelize.DATE },
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
    // Already hashed by ModelHelper.SaveRoot when it arrives through BaseCreate;
    // see the same note in Users.createNew.
    if (Data.Password && !IsBcryptHash(Data.Password)) {
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

    // The id comes from the INSERT, not from a follow-up query.
    //
    // This used to be `SELECT TOP 1 <pk> FROM [PatientUsers] ORDER BY <pk> DESC` run
    // immediately after the create. Two concurrent creates both read the HIGHER
    // id, so the loser returned the winner's row. Reproduced against the
    // database: two creates in one transaction returned 5 and 6, while the old
    // query returned 6 for both.
    //
    // create() already carries the generated key - the PK is declared
    // autoIncrement and Sequelize reads it back through OUTPUT INSERTED.
    const Created = await PatientUsers.create(Data);

    return Created[ReturnIdField];
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
