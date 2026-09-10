const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const sequelize = require('../../config/DbConnection');
Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class DoctorsTeam extends Sequelize.Model {}
DoctorsTeam.init(
  {
    id_data: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id: { type: Sequelize.INTEGER },

    id_group: { type: Sequelize.INTEGER },
    date_creation: { type: Sequelize.DATE },
    user_mod: { type: Sequelize.STRING },
    date_modif: { type: Sequelize.DATE },

    rec_status: { type: Sequelize.INTEGER },
    name: { type: Sequelize.STRING },
    extra_info: { type: Sequelize.INTEGER },
    description: { type: Sequelize.STRING },
    procedures: { type: Sequelize.STRING },
    AppId: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'DoctorsTeam',
    modelName: 'DoctorsTeam',
    timestamps: false,
  }
);

DoctorsTeam.SearchField = [
  'id_data',
  'id',
  'id_group',
  'date_creation',
  'user_mod',
  'date_modif',
  'rec_status',
  'name',
  'extra_info',
  'description',
  'AppId',
  'vwDoctorsTeamInfo.DoctorCount',
  'vwDoctorsTeamInfo.PatientCount',
];

DoctorsTeam.SetAssocations = (Models) => {
  DoctorsTeam.belongsTo(Models.Apps, {
    as: 'Apps',
    foreignKey: 'AppId',
  });
  DoctorsTeam.hasMany(Models.LookupDoctorTeam, {
    as: 'LookupDoctorTeam',
    foreignKey: 'team_id',
    //  targetKey: "team_id"
  });

  DoctorsTeam.hasMany(Models.DoctorsTeamLookUp, {
    as: 'LookUpData',
    foreignKey: 'id_data',
  });

  DoctorsTeam.hasMany(Models.DoctorsTeamPatient, {
    as: 'DoctorsTeamPatient',
    foreignKey: 'team_id',
  });

  DoctorsTeam.hasOne(Models.vwDoctorsTeamInfo, {
    as: 'vwDoctorsTeamInfo',
    foreignKey: 'DoctorTeamId',
    sourceKey: 'id_data',
  });
};

DoctorsTeam.SetFunctions = (Models) => {
  DoctorsTeam.createNew = async function (Data, ReturnIdField) {
    await DoctorsTeam.create(Data);
    const [ReturnData] = await sequelize.query(
      'SELECT TOP 1  ' + ReturnIdField + ' FROM [DoctorsTeam] ORDER BY ' + ReturnIdField + ' DESC '
    );
    return ReturnData[0][ReturnIdField];
  };

  DoctorsTeam.findAllNew = async function (Option) {
    try {
      const result = await DoctorsTeam.findAll({
        ...Option,
        attributes: {
          include: [
            [
              sequelize.literal(
                `(SELECT COUNT(*) FROM LookupDoctorTeam ldt WHERE ldt.team_id = [DoctorsTeam].[id_data] AND ISNULL(ldt.rec_status, 0) <> 2)`
              ),
              '__DoctorCount',
            ],
            [
              sequelize.literal(
                `(SELECT COUNT(*) FROM DoctorsTeamPatient dtp WHERE dtp.team_id = [DoctorsTeam].[id_data] AND ISNULL(dtp.rec_status, 0) <> 2)`
              ),
              '__PatientCount',
            ],
          ],
        },
        include: [
          { model: Models.Apps, as: 'Apps' },
          { model: Models.DoctorsTeamLookUp, as: 'LookUpData' },
        ],
      });
      return result.map((r) => {
        const obj = r.toJSON ? r.toJSON() : r;
        obj.vwDoctorsTeamInfo = {
          DoctorTeamId: obj.id_data,
          DoctorCount: obj.__DoctorCount || 0,
          PatientCount: obj.__PatientCount || 0,
        };
        delete obj.__DoctorCount;
        delete obj.__PatientCount;
        return obj;
      });
    } catch (ex) {
      console.log(ex);
      return [];
    }
  };

  DoctorsTeam.GetByDoctorId = async function (DoctorId, Option) {
    try {
      var where = { 
        '$LookupDoctorTeam.doctor_id$': DoctorId,
        rec_status: { [Op.ne]: '2' }
      };
      if (Option.where) where = { ...where, ...Option.where };
      var Result = await DoctorsTeam.findAll({
        where: where,
        include: [
          { model: Models.Apps, as: 'Apps' },
          {
            model: Models.LookupDoctorTeam,
            as: 'LookupDoctorTeam',
            where: { rec_status: { [Op.ne]: '2' } },
            attributes: ['team_id', 'doctor_id'],
          },
          { model: Models.vwDoctorsTeamInfo, as: 'vwDoctorsTeamInfo' },
        ],
      });
      return Result;
    } catch (ex) {
      console.log(ex);
      return [];
    }
  };

  DoctorsTeam.findAllDetail = async function (Option) {
    const result = await DoctorsTeam.findAll({
      ...Option,
      include: [
        { model: Models.Apps, as: 'Apps' },
        { model: Models.DoctorsTeamLookUp, as: 'LookUpData' },
      ],
    });
    return result;
  };
};

module.exports = DoctorsTeam;
