const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');
// const Op = Sequelize.Op;

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

const OrganizationHelper = require('../../helper/OrganizationHelper');

class Organization extends Sequelize.Model {}
Organization.init(
  {
    Id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },

    Name: { type: Sequelize.STRING },
    CreateUserId: { type: Sequelize.INTEGER },
    CreateDate: { type: Sequelize.DATE },
    OrganizationTypeId: { type: Sequelize.STRING },
    ParentOrganizationId: { type: Sequelize.INTEGER },
    addr_prov_city: { type: Sequelize.INTEGER },
    ProvCityName: { type: Sequelize.STRING },
    addr_soum_dist: { type: Sequelize.INTEGER },
    SoumDistName: { type: Sequelize.STRING },
    addr_bag_khoroo: { type: Sequelize.INTEGER },
    BagKhorooName: { type: Sequelize.STRING },
    level: { type: Sequelize.STRING },
    HospitalTypeId: { type: Sequelize.STRING },
    IsSoumHospital: { type: Sequelize.STRING },
    Logo: { type: Sequelize.BLOB },

    // Merge bookkeeping - see scripts/add_organization_merge_columns.sql
    IsActive: { type: Sequelize.BOOLEAN, defaultValue: true },
    MergedIntoId: { type: Sequelize.INTEGER },
    MergedDate: { type: Sequelize.DATE },
    MergedUserId: { type: Sequelize.INTEGER },
  },
  {
    sequelize,
    tableName: 'Organization',
    modelName: 'Organization',
    timestamps: false,
  }
);

Organization.DetaultFields = ['Id', 'Name'];

Organization.SearchField = [
  'Id',
  'Name',
  'CreateDate',
  'CreateUserId',
  'OrganizationType',
  'ParentOrganizationId',
  'addr_prov_city',
  'ProvCityName',
  'addr_soum_dist',
  'SoumDistName',
  'addr_bag_khoroo',
  'BagKhorooName',
  'level',
  'HospitalTypeId',
  'IsActive',
  'MergedIntoId',
];

Organization.SetAssocations = (Models) => {
  Organization.belongsTo(Models.DictProvinceCity, {
    as: 'DictProvinceCity',
    foreignKey: 'addr_prov_city',
  });
  Organization.belongsTo(Models.DictSoumDistrict, {
    as: 'DictSoumDistrict',
    foreignKey: 'addr_soum_dist',
  });
  Organization.belongsTo(Models.DictBagKhoroo, {
    as: 'DictBagKhoroo',
    foreignKey: 'addr_bag_khoroo',
  });
  Organization.belongsTo(Models.Organization, {
    as: 'ParentOrganization',
    foreignKey: 'ParentOrganizationId',
    targetKey: 'Id',
  });
  Organization.belongsTo(Models.vwOrganizationType, {
    as: 'vwOrganizationType',
    foreignKey: 'OrganizationTypeId',
    targetKey: 'value',
  });
  Organization.belongsTo(Models.vwOrganizationLevel, {
    as: 'vwOrganizationLevel',
    foreignKey: 'level',
    targetKey: 'value',
  });
  Organization.belongsTo(Models.vwOrganizationHospitalType, {
    as: 'vwOrganizationHospitalType',
    foreignKey: 'HospitalTypeId',
    targetKey: 'value',
  });
  Organization.belongsTo(Models.Users, {
    as: 'CreateUser',
    foreignKey: 'CreateUserId',
  });
};

Organization.SetFunctions = (Models) => {
  Organization.findAllNew = async function (Option) {
    var Result = await Organization.findAll({
      ...Option,
      include: [
        {
          model: Models.Users,
          as: 'CreateUser',
          attributes: Models.Users.DetaultFields,
        },
        {
          model: Models.vwOrganizationHospitalType,
          as: 'vwOrganizationHospitalType',
          attributes: ['value', 'label'],
        },
        {
          model: Models.vwOrganizationType,
          as: 'vwOrganizationType',
          attributes: ['value', 'label'],
        },
        {
          model: Models.Organization,
          as: 'ParentOrganization',
          attributes: ['Name', 'Id', 'OrganizationTypeId'],
        },
        {
          model: Models.DictProvinceCity,
          as: 'DictProvinceCity',
          attributes: ['id_data', 'name', 'date_creation', 'is_city'],
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
    return Result;
  };

  Organization.createNew = async function (Data, ReturnIdField) {
    Data = await OrganizationHelper.SetDictNames(Models, Data);
    // The id comes from the INSERT, not from a follow-up query.
    //
    // This used to be `SELECT TOP 1 <pk> FROM [Organization] ORDER BY <pk> DESC` run
    // immediately after the create. Two concurrent creates both read the HIGHER
    // id, so the loser returned the winner's row and attached its child rows -
    // files, lookups, many-to-many links - to the wrong record. Reproduced
    // against the database: two creates in one transaction returned 5 and 6,
    // while the old query returned 6 for both.
    //
    // create() already carries the generated key: ReturnIdField is declared
    // autoIncrement, and Sequelize reads it back through OUTPUT INSERTED.
    const Created = await Organization.create(Data);

    return Created[ReturnIdField];
  };

  Organization.updateNew = async function (Data, DataId, PK) {
    console.log('Organization.updateNew - DataId received:', DataId);
    console.log('Organization.updateNew - PK:', PK);
    console.log('Organization.updateNew - Data.Id:', Data.Id);
    console.log('Organization.updateNew - Data.ParentOrganizationId:', Data.ParentOrganizationId);

    Data = await OrganizationHelper.SetDictNames(Models, Data);

    console.log('Organization.updateNew - Updating where:', { [PK]: DataId });

    const UpdateData = await Organization.update(Data, {
      where: { [PK]: DataId },
      logging: (sql) => console.log('SQL:', sql),
    });

    return UpdateData;
  };
};

module.exports = Organization;
