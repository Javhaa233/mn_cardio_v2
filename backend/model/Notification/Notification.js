const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');
const Op = Sequelize.Op;
Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class Notification extends Sequelize.Model {}
Notification.init(
  {
    Id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    Notes: { type: Sequelize.INTEGER },
    LinkObjectName: { type: Sequelize.INTEGER },
    LinkObjectId: { type: Sequelize.INTEGER },
    NotesMn: { type: Sequelize.STRING },
    CreateDate: { type: Sequelize.DATE },
    CreateUserId: { type: Sequelize.INTEGER },
    CreateDoctorId: { type: Sequelize.INTEGER },
    Action: { type: Sequelize.STRING },
    ToDoctorId: { type: Sequelize.INTEGER },
    ToUserId: { type: Sequelize.INTEGER },
    SeenDate: { type: Sequelize.DATE },
    Seen: { type: Sequelize.STRING },
    Url: { type: Sequelize.STRING },
    ExpiredDate: { type: Sequelize.DATE },
  },
  {
    sequelize,
    tableName: 'Notification',
    modelName: 'Notification',
    timestamps: false,
  }
);

Notification.SearchField = [
  'Id',
  'Notes',
  'NotesMn',
  'LinkObjectName',
  'LinkObjectId',
  'CreateDate',
  'CreateUserId',
  'CreateDoctorId',
  'Action',
  'ToDoctorId',
  'ToUserId',
  'SeenDate',
  'Seen',
];

Notification.SetAssocations = (Models) => {
  Notification.belongsTo(Models.Users, {
    as: 'CreateUsers',
    foreignKey: 'CreateUserId',
    targetKey: 'Id',
  });

  Notification.belongsTo(Models.Users, {
    as: 'ToUsers',
    foreignKey: 'ToUserId',
    targetKey: 'Id',
  });

  Notification.belongsTo(Models.DoctorsProfile, {
    as: 'CreateDoctorsProfile',
    foreignKey: 'CreateDoctorId',
    targetKey: 'id_data',
  });

  Notification.belongsTo(Models.DoctorsProfile, {
    as: 'ToDoctorsProfile',
    foreignKey: 'ToDoctorId',
    targetKey: 'id_data',
  });

  Notification.belongsTo(Models.ObjectNameDic, {
    as: 'ObjectNameDic',
    foreignKey: 'LinkObjectName',
    targetKey: 'ObjectName',
  });
};

Notification.SetFunctions = (Models) => {
  Notification.createNew = async function (Data, ReturnIdField) {
    await Notification.create(Data);
    const [ReturnData] = await sequelize.query(
      'SELECT TOP 1  ' + ReturnIdField + ' FROM [Notification] ORDER BY ' + ReturnIdField + ' DESC '
    );
    return ReturnData[0][ReturnIdField];
  };

  Notification.findAllNew = async function (Option) {
    const result = await Notification.findAll({
      ...Option,
      include: [
        {
          model: Models.Users,
          as: 'CreateUsers',
          attributes: Models.Users.DefaultFields,
        },
        {
          model: Models.Users,
          as: 'ToUsers',
          attributes: Models.Users.DefaultFields,
        },
        {
          model: Models.DoctorsProfile,
          as: 'CreateDoctorsProfile',
          attributes: Models.DoctorsProfile.DefaultFields,
        },
        {
          model: Models.DoctorsProfile,
          as: 'ToDoctorsProfile',
          attributes: Models.DoctorsProfile.DefaultFields,
        },
        { model: Models.ObjectNameDic, as: 'ObjectNameDic' },
      ],
    });
    return result;
  };
};
module.exports = Notification;
