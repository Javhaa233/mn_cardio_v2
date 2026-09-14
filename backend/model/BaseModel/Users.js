const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');
const bcrypt = require('bcryptjs');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

// const MailHelper = require("../../helper/MailHelper");

class Users extends Sequelize.Model {}

Users.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },

    UserName: { type: Sequelize.STRING },
    Email: { type: Sequelize.STRING },

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
    LastName: { type: Sequelize.STRING },
    FirstName: { type: Sequelize.STRING },
    Password: { type: Sequelize.STRING },
    Name: { type: Sequelize.STRING },
    UserTypeId: { type: Sequelize.INTEGER },
    IsActive: { type: Sequelize.STRING },
    CreateDate: { type: Sequelize.DATE },
    CreateUserId: { type: Sequelize.STRING },
    RoleId: { type: Sequelize.INTEGER },
    ForgotPassToken: { type: Sequelize.STRING },
    ForgotPassExpireDate: { type: Sequelize.DATE },
    AppId: { type: Sequelize.INTEGER },
    Language: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'Users',
    modelName: 'Users',
    timestamps: false,
  }
);

Users.SearchField = ['UserName', 'Email', 'FirstName', 'LastName'];

Users.DetaultFields = ['Id', 'UserName', 'Email', 'FirstName', 'LastName', 'RoleId'];

Users.SetAssocations = (Models) => {
  Users.hasMany(Models.UserToRole, { as: 'UserToRole', foreignKey: 'UserId' });
  Users.belongsTo(Models.Roles, { as: 'Role', foreignKey: 'RoleId' });
  Users.belongsTo(Models.Apps, { as: 'Apps', foreignKey: 'AppId' });
  Users.belongsTo(Models.Users, {
    as: 'CreateUser',
    foreignKey: 'CreateUserId',
  });
};

Users.SetFunctions = (Models) => {
  Users.CreateCustom = async function (Data) {
    const User = await Users.create(Data);
    return User;
  };

  Users.createNew = async function (Data, ReturnIdField) {
    // username duplicate check
    const UserName = Data.UserName ? Data.UserName : null;
    if (UserName) {
      const check = await Users.count({ where: { UserName } }).then((count) => {
        return count > 0 ? false : true;
      });

      if (!check) throw { Success: false, Message: 'The user name is a duplicate' };
    } else {
      throw { Success: false, Message: 'User name is required' };
    }

    // email duplicate check (blank emails are allowed to repeat)
    const Email = Data.Email ? String(Data.Email).trim() : '';
    if (Email) {
      const emailCount = await Users.count({
        where: Sequelize.where(
          Sequelize.fn('LOWER', Sequelize.col('Email')),
          Email.toLowerCase()
        ),
      });
      if (emailCount > 0) throw { Success: false, Message: 'The email address is a duplicate' };
    }

    if (Data.Password) {
      Data.Password = await bcrypt.hash(Data.Password, 8);
    }

    // if (Data.Email) {
    //   const link = process.env.CLIENT_APP_URL + "auth/login";
    //   const Email = Data.Email;
    //   const MailContent = {
    //     to: Email,
    //     subject: "MnCardio - Нууц үг шинэчлэх",
    //     html: `Сайн байна уу<br />Системд нэвтрэх нууц үг<br />
    // <br /><a target="_blanks" href="${link}">${link}</a><br /><br />Хэрэглэгчийн нэр: ${UserName}<br />Нууц үг: ${Data.telephone}<br /><br />MnCardio системийг ашиглаж байгаа танд баярлалаа.`,
    //   };
    //   const MailRes = await MailHelper.SendMail(MailContent);
    //   if (MailRes === null) {
    //     throw { Success: false, Message: "Е мэйл илгээхэд алдаа гарлаа" };
    //   }
    // }

    await Users.create(Data);

    const [ReturnData] = await sequelize.query(
      'SELECT TOP 1  ' + ReturnIdField + ' FROM [Users] ORDER BY ' + ReturnIdField + ' DESC '
    );

    return ReturnData[0][ReturnIdField];
  };

  Users.updateNew = async function (Data, DataId, PK) {
    const UserName = Data.UserName ? Data.UserName : null;
    if (UserName) {
      const check = await Users.count({
        where: { UserName, [Sequelize.Op.not]: { Id: DataId } },
      }).then((count) => {
        return count > 0 ? false : true;
      });

      if (!check) throw { Success: false, Message: 'The user name is a duplicate' };
    }

    // email duplicate check (blank emails are allowed to repeat)
    const Email = Data.Email ? String(Data.Email).trim() : '';
    if (Email) {
      const emailCount = await Users.count({
        where: {
          [Sequelize.Op.and]: [
            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('Email')), Email.toLowerCase()),
            { [Sequelize.Op.not]: { Id: DataId } },
          ],
        },
      });
      if (emailCount > 0) throw { Success: false, Message: 'The email address is a duplicate' };
    }

    await Users.update(Data, { where: { [PK]: DataId } });

    return DataId;
  };

  Users.findAllNew = async function (Option) {
    const result = await Users.findAll({
      ...Option,
      include: [
        { model: Models.Users, as: 'CreateUser' },
        { model: Models.Roles, as: 'Role' },
      ],
    });
    return result;
  };

  Users.findAllDetail = async function (Option) {
    const result = await Users.findAll({
      ...Option,
      include: [
        { model: Models.Roles, as: 'Role' },
        { model: Models.Apps, as: 'Apps' },
        {
          model: Models.UserToRole,
          as: 'UserToRole',
          include: [{ model: Models.Roles, as: 'Roles' }],
        },
        { model: Models.Users, as: 'CreateUser' },
      ],
    });
    return result;
  };
};
module.exports = Users;
