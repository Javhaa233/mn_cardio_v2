const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class OrderHospitalization extends Sequelize.Model {}
OrderHospitalization.init(
  {
    id_data: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id: { type: Sequelize.INTEGER },

    id_group: { type: Sequelize.INTEGER },
    date_creation: { type: Sequelize.DATE },
    user_mod: { type: Sequelize.STRING },
    date_modif: { type: Sequelize.DATE },

    rec_status: { type: Sequelize.INTEGER },
    department_id: { type: Sequelize.INTEGER },
    notes: { type: Sequelize.STRING },
    schedule_date: { type: Sequelize.DATE },
    patient_from: { type: Sequelize.STRING },
    patient_id: { type: Sequelize.INTEGER },
    patient_register: { type: Sequelize.STRING },
    processed: { type: Sequelize.STRING },
    result: { type: Sequelize.STRING },
    p_severity: { type: Sequelize.STRING },
    where_from: { type: Sequelize.STRING },
    order_id: { type: Sequelize.INTEGER },
    preliminary_disease: { type: Sequelize.INTEGER },
    phone: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'OrderHospitalization',
    modelName: 'OrderHospitalization',
    timestamps: false,
  }
);

OrderHospitalization.SearchField = [
  'id_data',
  'id',
  'id_group',
  'date_creation',
  'user_mod',
  'date_modif',
  'rec_status',
  'department_id',
  'notes',
  'schedule_date',
  'patient_from',
  'patient_id',
  'patient_register',
  'processed',
  'result',
  'p_severity',
  'where_from',
  'order_id',
  'preliminary_disease',
];

OrderHospitalization.SetAssocations = (Models) => {
  OrderHospitalization.belongsTo(Models.DrgroupDepartments, {
    as: 'DrgroupDepartments',
    foreignKey: 'department_id',
    targetKey: 'id_data',
  });

  OrderHospitalization.belongsTo(Models.JournalRef, {
    as: 'JournalRef',
    foreignKey: 'preliminary_disease',
    targetKey: 'id_data',
  });

  OrderHospitalization.belongsTo(Models.Patient, {
    as: 'Patient',
    foreignKey: 'patient_id',
    targetKey: 'id_data',
  });

  OrderHospitalization.belongsTo(Models.vwOrderHospitalizationInfo, {
    as: 'vwOrderHospitalizationInfo',
    foreignKey: 'id_data',
    targetKey: 'OrderHospitalizationId',
  });

  OrderHospitalization.belongsTo(Models.vwSeverity, {
    as: 'vwSeverity',
    foreignKey: 'p_severity',
    targetKey: 'value',
  });

  OrderHospitalization.belongsTo(Models.vvwModeWaitinglist, {
    as: 'vvwModeWaitinglist',
    foreignKey: 'patient_from',
    targetKey: 'value',
  });

  OrderHospitalization.belongsTo(Models.DoctorsProfile, {
    as: 'DoctorsProfile',
    foreignKey: 'id',
    targetKey: 'UserId',
  });

  OrderHospitalization.belongsTo(Models.Users, {
    as: 'Users',
    foreignKey: 'id',
    targetKey: 'Id',
  });
};

OrderHospitalization.SetFunctions = (Models) => {
  OrderHospitalization.createNew = async function (Data, ReturnIdField) {
    await OrderHospitalization.create(Data);
    const [ReturnData] = await sequelize.query(
      'SELECT TOP 1  ' +
        ReturnIdField +
        ' FROM [OrderHospitalization] ORDER BY ' +
        ReturnIdField +
        ' DESC '
    );
    return ReturnData[0][ReturnIdField];
  };

  OrderHospitalization.findAllNew = async function (Option) {
    const result = await OrderHospitalization.findAll({
      ...Option,
      attributes: [
        'id_data',
        'id',
        'date_creation',
        'date_modif',
        'department_id',
        'notes',
        'schedule_date',
        'patient_from',
        'patient_id',
        'processed',
        'result',
        'p_severity',
        'where_from',
        'order_id',
        'preliminary_disease',
        'phone',
      ],
      include: [
        {
          model: Models.DrgroupDepartments,
          as: 'DrgroupDepartments',
          attributes: ['name', 'id_data'],
        },
        {
          model: Models.JournalRef,
          as: 'JournalRef',
          attributes: ['jr_label', 'id_data'],
        },
        {
          model: Models.Patient,
          as: 'Patient',
          attributes: Models.Patient.DefaultFields,
          include: [
            {
              model: Models.vwGender,
              as: 'Gender',
              attributes: ['value', 'label'],
            },
            {
              model: Models.DictProvinceCity,
              as: 'DictProvinceCity',
              attributes: ['id_data', 'name'],
            },
            {
              model: Models.DictSoumDistrict,
              as: 'DictSoumDistrict',
              attributes: ['id_data', 'name'],
            },
          ],
        },
        {
          model: Models.vwSeverity,
          as: 'vwSeverity',
          attributes: ['value', 'label'],
        },
        {
          model: Models.vvwModeWaitinglist,
          as: 'vvwModeWaitinglist',
          attributes: ['value', 'label'],
        },
        {
          model: Models.DoctorsProfile,
          as: 'DoctorsProfile',
          attributes: ['lastname', 'firstname', 'id_data', 'id'],
        },
        { model: Models.Users, as: 'Users', attributes: ['UserName', 'Id'] },
        {
          model: Models.vwOrderHospitalizationInfo,
          as: 'vwOrderHospitalizationInfo',
        },
      ],
    });
    return result;
  };
};
module.exports = OrderHospitalization;
