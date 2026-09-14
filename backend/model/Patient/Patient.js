const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class Patient extends Sequelize.Model {}
Patient.init(
  {
    id_data: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id: { type: Sequelize.INTEGER },

    id_group: { type: Sequelize.INTEGER },
    date_creation: { type: Sequelize.DATE },
    user_mod: { type: Sequelize.STRING },
    date_modif: { type: Sequelize.DATE },

    rec_status: { type: Sequelize.INTEGER },

    /*
     * Confidentiality classification (tracker 21/22), added by
     * scripts/add_confidentiality_flag.sql.
     *
     * helper/Confidentiality.js SELECTS ConfidentialityLevel by name, and an
     * undeclared attribute on a read is what makes Sequelize produce an invalid
     * column reference - so without this the classification check fails on
     * every call and, because it fails safe, silently allows everything.
     *
     * No level is set on any row today: 357,156 patients, 0 classified. The
     * levels themselves cannot be seeded until ЗСҮТ supply the access-rights
     * matrix (BLOCKERS item 8).
     */
    ConfidentialityLevel: { type: Sequelize.STRING },
    ConfidentialitySetDate: { type: Sequelize.DATE },
    ConfidentialitySetUserId: { type: Sequelize.INTEGER },
    ConfidentialityReason: { type: Sequelize.STRING },
    p_familyname: { type: Sequelize.STRING },
    p_lastname: { type: Sequelize.STRING },
    p_firstname: { type: Sequelize.STRING },
    p_gender: { type: Sequelize.STRING },
    p_is_married: { type: Sequelize.STRING },
    p_birthday: { type: Sequelize.DATE },
    p_age: { type: Sequelize.INTEGER },
    p_ethnicity: { type: Sequelize.STRING },
    p_ethnicity_other: { type: Sequelize.STRING },
    p_address: { type: Sequelize.TEXT },
    p_temp_address: { type: Sequelize.TEXT },
    p_med_hist: { type: Sequelize.STRING },
    p_soc_hist: { type: Sequelize.STRING },
    p_operations: { type: Sequelize.STRING },
    p_trauma: { type: Sequelize.STRING },
    p_fam_hist: { type: Sequelize.STRING },
    p_registration: { type: Sequelize.STRING },
    p_noncom_dis: { type: Sequelize.STRING },
    p_com_dis: { type: Sequelize.STRING },
    p_oper_yorn: { type: Sequelize.STRING },
    p_trauma_yorn: { type: Sequelize.STRING },
    p_family_yorn: { type: Sequelize.STRING },
    p_nonc_yorn: { type: Sequelize.STRING },
    p_c_yorn: { type: Sequelize.STRING },
    p_soc_histyorn: { type: Sequelize.STRING },
    province: { type: Sequelize.STRING },
    p_rfactor: { type: Sequelize.STRING },
    ubdistricts: { type: Sequelize.STRING },
    p_noncom_dis_code: { type: Sequelize.STRING },
    p_com_dis_code: { type: Sequelize.STRING },
    p_fam_hist_code: { type: Sequelize.STRING },
    p_operations_code: { type: Sequelize.STRING },
    p_trauma_code: { type: Sequelize.STRING },
    p_social_hist_code: { type: Sequelize.STRING },
    p_workplace: { type: Sequelize.STRING },
    p_employeement: { type: Sequelize.STRING },
    p_health_insurance: { type: Sequelize.STRING },
    p_education: { type: Sequelize.STRING },
    p_occupation: { type: Sequelize.STRING },
    p_telephone: { type: Sequelize.STRING },
    p_telephone2: { type: Sequelize.STRING },
    addr_prov_city: { type: Sequelize.INTEGER },
    addr_soum_dist: { type: Sequelize.INTEGER },
    addr_bag_khoroo: { type: Sequelize.INTEGER },

    blood_type: { type: Sequelize.STRING },
    user_id: { type: Sequelize.INTEGER },

    Age: {
      type: Sequelize.VIRTUAL,
      get() {
        if (this.p_birthday) {
          var today = new Date();
          var birthDate = new Date(this.p_birthday);
          var age = today.getFullYear() - birthDate.getFullYear();
          var m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          return age;
        } else {
          return 0;
        }
      },
    },

    FullName: {
      type: Sequelize.VIRTUAL,
      get() {
        return (this.p_lastname ? this.p_lastname.substring(0, 1) + '.' : '') + this.p_firstname;
      },
    },
  },
  {
    sequelize,
    tableName: 'Patient',
    modelName: 'Patient',
    timestamps: false,
  }
);

Patient.DefaultFields = [
  'p_familyname',
  'p_lastname',
  'p_firstname',
  'p_gender',
  'p_birthday',
  'p_registration',
  'Age',
  'FullName',
  'p_telephone',
  'p_telephone2',
  'p_address',
];

Patient.SearchField = [
  'id_data',
  'id',
  'id_group',
  'date_creation',
  'user_mod',
  'date_modif',
  'rec_status',
  'p_familyname',
  'p_lastname',
  'p_firstname',
  'p_gender',
  'p_birthday',
  'p_address',
  'p_temp_address',
  'p_med_hist',
  'p_soc_hist',
  'p_operations',
  'p_trauma',
  'p_fam_hist',
  'p_registration',
  'p_noncom_dis',
  'p_com_dis',
  'p_oper_yorn',
  'p_trauma_yorn',
  'p_family_yorn',
  'p_nonc_yorn',
  'p_c_yorn',
  'p_soc_histyorn',
  'province',
  'p_rfactor',
  'ubdistricts',
  'p_noncom_dis_code',
  'p_com_dis_code',
  'p_fam_hist_code',
  'p_operations_code',
  'p_trauma_code',
  'p_social_hist_code',
  'p_workplace',
  'p_health_insurance',
  'p_education',
  'p_occupation',
  'p_telephone',
  'addr_prov_city',
  'addr_soum_dist',
  'addr_bag_khoroo',
  'blood_type',
  'user_id',
];

Patient.SetAssocations = (Models) => {
  Patient.hasMany(Models.PatientLookUp, {
    as: 'LookUpData',
    foreignKey: 'id_data',
  });

  Patient.belongsTo(Models.DictProvinceCity, {
    as: 'DictProvinceCity',
    foreignKey: 'addr_prov_city',
  });

  Patient.belongsTo(Models.DictSoumDistrict, {
    as: 'DictSoumDistrict',
    foreignKey: 'addr_soum_dist',
  });

  Patient.belongsTo(Models.DictBagKhoroo, {
    as: 'DictBagKhoroo',
    foreignKey: 'addr_bag_khoroo',
  });

  Patient.belongsTo(Models.Users, {
    as: 'Users',
    foreignKey: 'id',
  });

  Patient.belongsTo(Models.vwGender, {
    as: 'Gender',
    foreignKey: 'p_gender',
    targetKey: 'value',
  });

  Patient.belongsTo(Models.vwProvince, {
    as: 'Province',
    foreignKey: 'province',
    targetKey: 'value',
  });

  Patient.belongsTo(Models.PatientUsers, {
    as: 'LinkedUser',
    foreignKey: 'user_id',
  });
};

Patient.SetFunctions = (Models) => {
  Patient.createNew = async function (Data, ReturnIdField) {
    const CryllicRegex = /[^\u0000-\u00FE]+$/;

    const p_registration = Data.p_registration ? Data.p_registration : null;
    const p_lastname = Data.p_lastname ? Data.p_lastname : null;
    const p_firstname = Data.p_firstname ? Data.p_firstname : null;
    const p_familyname = Data.p_familyname ? Data.p_familyname : null;

    if (p_registration) {
      const check = await Patient.count({ where: { p_registration } }).then((count) => {
        return count > 0 ? false : true;
      });

      if (!check)
        throw {
          Success: false,
          Message: 'The patient personal number is a duplicate',
        };
    } else {
      throw {
        Success: false,
        Message: 'Регистрийн дугаар заавал оруулна уу',
      };
    }

    let cyrillicCheckMsg = '';
    if (p_firstname && !CryllicRegex.test(p_firstname.replace('-', ''))) {
      cyrillicCheckMsg += cyrillicCheckMsg ? ', ' : '';
      cyrillicCheckMsg += 'Нэр бичихдээ зөвхөн кирилл үсэг ашиглана уу';
    }

    if (p_lastname && !CryllicRegex.test(p_lastname.replace('-', ''))) {
      cyrillicCheckMsg += cyrillicCheckMsg ? ', ' : '';
      cyrillicCheckMsg += 'Овог бичихдээ зөвхөн кирилл үсэг ашиглана уу';
    }

    if (p_familyname && !CryllicRegex.test(p_familyname.replace('-', ''))) {
      cyrillicCheckMsg += cyrillicCheckMsg ? ', ' : '';
      cyrillicCheckMsg += 'Овог бичихдээ зөвхөн кирилл үсэг ашиглана уу';
    }

    if (cyrillicCheckMsg !== '') {
      throw { Success: false, Message: cyrillicCheckMsg };
    }
    // create action
    await Patient.create(Data);

    const [ReturnData] = await sequelize.query(
      'SELECT TOP 1  ' + ReturnIdField + ' FROM [Patient] ORDER BY ' + ReturnIdField + ' DESC '
    );

    return ReturnData[0][ReturnIdField];
  };

  Patient.findAllNew = async function (Option) {
    const result = await Patient.findAll({
      ...Option,
      include: [
        {
          model: Models.Users,
          as: 'Users',
          attributes: Models.Users.DetaultFields,
        },
        {
          model: Models.PatientUsers,
          as: 'LinkedUser',
          attributes: Models.PatientUsers.DetaultFields,
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
    });
    return result;
  };

  Patient.findAllDetail = async function (Option) {
    const result = await Patient.findAll({
      ...Option,
      include: [
        { model: Models.PatientLookUp, as: 'LookUpData' },
        {
          model: Models.vwGender,
          as: 'Gender',
          attributes: ['value', 'label'],
        },
        {
          model: Models.Users,
          as: 'Users',
          attributes: Models.Users.DetaultFields,
        },
        {
          model: Models.PatientUsers,
          as: 'LinkedUser',
          attributes: Models.PatientUsers.DetaultFields,
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
    });
    return result;
  };

  Patient.GetFiles = async function (id_data) {
    const Files = await Models.File.findAll({
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
      where: {
        LinkedObjectId: id_data,
        LinkedObjectName: 'Patient',
        rec_status: '9',
      },
    });
    return Files;
  };

  Patient.GetLookUpData = async function (DataId) {
    const result = await Models.PatientLookUp.findAll({
      where: { id_data: DataId },
    });
    return result;
  };
};

module.exports = Patient;
