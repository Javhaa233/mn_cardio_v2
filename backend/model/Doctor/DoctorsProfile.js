const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class DoctorsProfile extends Sequelize.Model {}
DoctorsProfile.init(
  {
    id_data: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    UserId: { type: Sequelize.INTEGER, field: 'id' },
    id_group: { type: Sequelize.INTEGER },
    date_creation: { type: Sequelize.DATE },
    user_mod: { type: Sequelize.STRING },
    date_modif: { type: Sequelize.DATE },
    rec_status: { type: Sequelize.INTEGER },

    /*
     * Practice licence (tracker 13), added by
     * scripts/add_doctor_licence_code.sql.
     *
     * DECLARED HERE BECAUSE SEQUELIZE SILENTLY DISCARDS WHAT IT DOES NOT KNOW.
     * The columns existed in the database and SetLicense reported success, but
     * update() dropped every one of them - the code was never written, the
     * report never moved, and nothing errored. An undeclared column on a write
     * fails silently; an undeclared column on a read is what makes Sequelize
     * throw "Invalid column name". Only one of those tells you.
     *
     * LicenseSource is 'admin' for a code typed in by an administrator and
     * 'emkht' for one fetched from the national registry - which of those it
     * will be is still a customer question (BLOCKERS item 4), and recording it
     * means a later sync needs no schema change.
     */
    LicenseCode: { type: Sequelize.STRING },
    LicenseIssuedDate: { type: Sequelize.DATE },
    LicenseExpireDate: { type: Sequelize.DATE },
    LicenseVerifiedDate: { type: Sequelize.DATE },
    LicenseVerifiedUserId: { type: Sequelize.INTEGER },
    LicenseSource: { type: Sequelize.STRING },

    professional_degrees: { type: Sequelize.STRING },
    experiences: { type: Sequelize.STRING },
    province_city: { type: Sequelize.STRING },
    addr_prov_city: { type: Sequelize.INTEGER },
    ProvCityName: { type: Sequelize.STRING },
    addr_soum_dist: { type: Sequelize.INTEGER },
    SoumDistName: { type: Sequelize.STRING },
    addr_bag_khoroo: { type: Sequelize.INTEGER },
    BagKhorooName: { type: Sequelize.STRING },
    organisation: { type: Sequelize.STRING },
    position: { type: Sequelize.STRING },
    profession: { type: Sequelize.STRING },
    telephone: { type: Sequelize.STRING },
    email: { type: Sequelize.STRING },
    skype: { type: Sequelize.STRING },
    firstname: { type: Sequelize.STRING },
    lastname: { type: Sequelize.STRING },
    personal_number: { type: Sequelize.STRING },
    dr_group_id: { type: Sequelize.INTEGER },
    dr_group_type: { type: Sequelize.INTEGER },
    is_editor: { type: Sequelize.STRING },
    OrganizationId: { type: Sequelize.INTEGER },
    AppId: { type: Sequelize.INTEGER },
    // Virtual column
    FullName: {
      // The dependency list is what lets a grid filter on FullName reach the
      // real columns - without it the search has nothing to translate to and
      // is dropped.
      type: new Sequelize.VIRTUAL(Sequelize.STRING, ['lastname', 'firstname']),
      get() {
        return (this.lastname ? this.lastname.substring(0, 1) + '.' : '') + this.firstname;
      },
    },
  },
  {
    sequelize,
    tableName: 'DoctorsProfile',
    modelName: 'DoctorsProfile',
    timestamps: false,
  }
);

DoctorsProfile.DefaultFields = ['id_data', 'UserId', 'lastname', 'firstname', 'FullName'];

DoctorsProfile.SearchField = [
  'id_data',
  'UserId',
  'id_group',
  'date_creation',
  'user_mod',
  'date_modif',
  'rec_status',
  'professional_degrees',
  'experiences',
  'addr_prov_city',
  'ProvCityName',
  'addr_soum_dist',
  'SoumDistName',
  'addr_bag_khoroo',
  'BagKhorooName',
  'organisation',
  'profession',
  'telephone',
  'email',
  'skype',
  'firstname',
  'lastname',
  'dr_group_id',
  'dr_group_type',
  'is_editor',
  'OrganizationId',
  'AppId',
];

DoctorsProfile.SetAssocations = (Models) => {
  DoctorsProfile.belongsTo(Models.Apps, {
    as: 'Apps',
    foreignKey: 'AppId',
  });
  DoctorsProfile.belongsTo(Models.Users, {
    as: 'Users',
    foreignKey: 'UserId',
  });

  DoctorsProfile.belongsTo(Models.vwProvince, {
    as: 'Province',
    foreignKey: 'province_city',
    targetKey: 'value',
  });

  DoctorsProfile.belongsTo(Models.DictProvinceCity, {
    as: 'DictProvinceCity',
    foreignKey: 'addr_prov_city',
  });

  DoctorsProfile.belongsTo(Models.DictSoumDistrict, {
    as: 'DictSoumDistrict',
    foreignKey: 'addr_soum_dist',
  });

  DoctorsProfile.belongsTo(Models.DictBagKhoroo, {
    as: 'DictBagKhoroo',
    foreignKey: 'addr_bag_khoroo',
  });

  DoctorsProfile.belongsTo(Models.Organization, {
    as: 'Organization',
    foreignKey: 'OrganizationId',
  });
};

DoctorsProfile.SetFunctions = (Models) => {
  DoctorsProfile.createNew = async function (Data, ReturnIdField) {
    await DoctorsProfile.create(Data);

    const [ReturnData] = await sequelize.query(
      'SELECT TOP 1  ' +
        ReturnIdField +
        ',id AS UserId FROM [DoctorsProfile] ORDER BY ' +
        ReturnIdField +
        ' DESC '
    );

    const DoctorId = ReturnData[0][ReturnIdField];
    // const UserId = ReturnData[0]["UserId"];
    // if (DoctorId && UserId) {
    //   const User = await Models.Users.createNew({
    //     LastName: Data.lastname,
    //     FirstName: Data.firstname,
    //     UserName: Data.UserName,
    //     Password: Data.telephone ? Data.telephone : null,
    //     RoleId: Data.Role,
    //     AppId: Data.AppId,
    //     Email: Data.email,
    //     CreateDate: new Date(),
    //     CreateUserId: UserId,
    //   });
    //   if (User) {
    //     await DoctorsProfile.update(
    //       { id: User.Id },
    //       { where: { id_data: DoctorId } }
    //     );
    //   }
    // }

    return DoctorId;
  };

  DoctorsProfile.findAllNew = async function (Option) {
    const result = await DoctorsProfile.findAll({
      ...Option,
      include: [
        {
          model: Models.Users,
          as: 'Users',
          attributes: Models.Users.DefaultFields,
        },
        {
          model: Models.vwProvince,
          as: 'Province',
          attributes: ['value', 'label'],
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
        {
          model: Models.Organization,
          as: 'Organization',
          include: [
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
      ],
    });
    return result;
  };

  DoctorsProfile.GetFiles = async function (id_data) {
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
        LinkedObjectName: 'DoctorsProfile',
        rec_status: '9',
      },
    });
    return Files;
  };
};

module.exports = DoctorsProfile;
