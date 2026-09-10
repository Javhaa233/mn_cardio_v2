const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class CVDPatient extends Sequelize.Model {}
CVDPatient.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },

    RegNo: { type: Sequelize.STRING },
    FirstName: { type: Sequelize.STRING },
    LastName: { type: Sequelize.STRING },
    Gender: { type: Sequelize.STRING },
    PhoneNumber: { type: Sequelize.STRING },
    PhoneNumber2: { type: Sequelize.STRING },
    Workplace: { type: Sequelize.STRING },
    Address: { type: Sequelize.TEXT },
    TempAddress: { type: Sequelize.TEXT },

    CreateDate: { type: Sequelize.DATE },
    CreateUserId: { type: Sequelize.INTEGER },
    UpdateDate: { type: Sequelize.DATE },
    UpdateUserId: { type: Sequelize.INTEGER },

    FullName: {
      type: Sequelize.VIRTUAL,
      get() {
        return this.LastName + ' ' + this.FirstName;
      },
    },
  },
  {
    sequelize,
    tableName: 'CVDPatient',
    modelName: 'CVDPatient',
    timestamps: false,
  }
);

CVDPatient.SearchField = [
  'Id',
  'RegNo',
  'FirstName',
  'LastName',
  'PhoneNumber',
  'PhoneNumber2',
  'Workplace',
  'Address',
  'TempAddress',
  'CreateDate',
  'CreateUserId',
  'UpdateDate',
  'UpdateUserId',
  'FullName',
];

CVDPatient.DetaultFields = [
  'Id',
  'RegNo',
  'FirstName',
  'LastName',
  'FullName',
  'Gender',
  'PhoneNumber',
  'PhoneNumber2',
  'Workplace',
  'Address',
  'TempAddress',
];

CVDPatient.SetAssocations = (Models) => {
  CVDPatient.belongsTo(Models.Users, {
    as: 'Users',
    foreignKey: 'CreateUserId',
    targetKey: 'Id',
  });
  CVDPatient.belongsTo(Models.DoctorsProfile, {
    as: 'DoctorsProfile',
    foreignKey: 'CreateUserId',
    targetKey: 'UserId',
  });

  CVDPatient.belongsTo(Models.vwGender, {
    as: 'vwGender',
    foreignKey: 'Gender',
    targetKey: 'value',
  });
};

CVDPatient.SetFunctions = (Models) => {
  CVDPatient.createNew = async function (Data, ReturnIdField) {
    const RegNo = Data.RegNo ? Data.RegNo : null;
    if (RegNo) {
      const check = await CVDPatient.count({ where: { RegNo } }).then((count) => {
        return count > 0 ? false : true;
      });

      if (!check)
        throw {
          Success: false,
          Message: 'The patient personal number is a duplicate',
        };
    }
    // create action
    await CVDPatient.create(Data);

    const [ReturnData] = await sequelize.query(
      'SELECT TOP 1  ' + ReturnIdField + ' FROM [CVDPatient] ORDER BY ' + ReturnIdField + ' DESC '
    );

    return ReturnData[0][ReturnIdField];
  };

  CVDPatient.findAllNew = async function (Option) {
    // var Option = { ...Option, order: [["Id", "DESC"]] };
    const result = await CVDPatient.findAll({
      ...Option,
      include: [
        {
          model: Models.Users,
          as: 'Users',
          attributes: Models.Users.DetaultFields,
        },
        {
          model: Models.DoctorsProfile,
          as: 'DoctorsProfile',
          attributes: Models.DoctorsProfile.DefaultFields,
          include: [
            {
              model: Models.Organization,
              as: 'Organization',
              attributes: ['Id', 'Name'],
            },
            {
              model: Models.DictProvinceCity,
              as: 'DictProvinceCity',
              attributes: ['id_data', 'name', 'date_creation'],
            },
            {
              model: Models.DictSoumDistrict,
              as: 'DictSoumDistrict',
              attributes: ['id_data', 'name'],
            },
            {
              model: Models.DictBagKhoroo,
              as: 'DictBagKhoroo',
              attributes: ['id_data', 'name'],
            },
          ],
        },
        {
          model: Models.vwGender,
          as: 'vwGender',
          attributes: ['value', 'label'],
        },
      ],
    });
    // let newRes = [];
    // for (let i = 0; i < result.length; i++) {
    //   // newRes.push({
    //   //   ...result[i].dataValues,
    //   //   CVDHistory: await result[i].getCVDHistory(),
    //   // });
    //   result[i].dataValues.CVDHistory1 = await result[i].getCVDHistory();
    // }

    return result;
  };
};

module.exports = CVDPatient;
