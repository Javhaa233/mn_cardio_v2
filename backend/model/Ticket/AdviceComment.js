const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');
const Op = Sequelize.Op;

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class AdviceComment extends Sequelize.Model {}
AdviceComment.init(
  {
    id_data: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id: { type: Sequelize.INTEGER },

    id_group: { type: Sequelize.INTEGER },
    date_creation: { type: Sequelize.DATE },
    user_mod: { type: Sequelize.STRING },
    date_modif: { type: Sequelize.DATE },

    rec_status: { type: Sequelize.INTEGER },
    adv_com_id_adv: { type: Sequelize.INTEGER },
    adv_com_comment: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'AdviceComment',
    modelName: 'AdviceComment',
    timestamps: false,
  }
);

AdviceComment.SearchField = [
  'id_data',
  'id',
  'id_group',
  'date_creation',
  'user_mod',
  'date_modif',
  'rec_status',
  'adv_com_id_adv',
  'adv_com_comment',
];

AdviceComment.SetAssocations = (Models) => {
  AdviceComment.belongsTo(Models.Users, {
    as: 'Users',
    foreignKey: 'id',
  });

  AdviceComment.belongsTo(Models.AdviceCommentRate, {
    as: 'AdviceCommentRate',
    foreignKey: 'id_data',
    targetKey: 'AdviceCommentId',
  });

  AdviceComment.hasMany(Models.AdviceCommentLike, {
    as: 'AdviceCommentLike',
    foreignKey: 'AdviceCommentId',
    targetKey: 'id_data',
  });

  AdviceComment.belongsTo(Models.DoctorsProfile, {
    as: 'DoctorsProfile',
    foreignKey: 'id',
    targetKey: 'UserId',
  });
};

AdviceComment.SetFunctions = (Models) => {
  AdviceComment.GetFiles = async function (id_data) {
    const Files = await Models.File.findAll({
      where: {
        LinkedObjectId: id_data,
        LinkedObjectName: 'AdviceComment',
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

  AdviceComment.createNew = async function (Data, ReturnIdField) {
    await AdviceComment.create(Data);
    const [ReturnData] = await sequelize.query(
      'SELECT TOP 1  ' +
        ReturnIdField +
        ' FROM [AdviceComment] ORDER BY ' +
        ReturnIdField +
        ' DESC '
    );
    return ReturnData[0][ReturnIdField];
  };

  AdviceComment.findAllNew = async function (option) {
    try {
      const result = await AdviceComment.findAll({
        ...option,
        include: [
          {
            model: Models.AdviceCommentRate,
            as: 'AdviceCommentRate',
          },
          {
            model: Models.Users,
            as: 'Users',
            attributes: ['UserName', 'Id'],
          },
          {
            model: Models.DoctorsProfile,
            as: 'DoctorsProfile',
            attributes: ['id_data', 'id', 'firstname', 'lastname'],
          },
          {
            model: Models.AdviceCommentLike,
            as: 'AdviceCommentLike',
            include: [
              {
                model: Models.Users,
                as: 'Users',
                attributes: ['UserName', 'Id', 'Email'],
              },
            ],
          },
        ],
      });
      return result;
    } catch (ex) {
      console.log(ex);
      return [];
    }
  };
};

module.exports = AdviceComment;
