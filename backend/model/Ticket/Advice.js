const Sequelize = require('sequelize');
const sequelize = require('../../config/DbConnection');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

class Advice extends Sequelize.Model {}

Advice.init(
  {
    id_data: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id: { type: Sequelize.INTEGER },

    id_group: { type: Sequelize.INTEGER },
    date_creation: { type: Sequelize.DATE },
    user_mod: { type: Sequelize.STRING },
    date_modif: { type: Sequelize.DATE },

    rec_status: { type: Sequelize.INTEGER },
    adv_id_patient: { type: Sequelize.INTEGER },
    // The column is nvarchar(30) and holds a status CODE - '3' draft, 'n' open,
    // 'y' closed - which is how every controller and every screen reads it.
    // Declaring it DATE made Sequelize date-parse those codes on the way out,
    // so 'y' arrived at the client as the string "Invalid date" and no caller
    // could tell an open ticket from a closed one. Writes were unaffected,
    // which is why it survived this long.
    adv_ticket_closed: { type: Sequelize.STRING },
    ticket_type: { type: Sequelize.STRING },
    soum_ticket: { type: Sequelize.STRING },
    addr_prov_city: { type: Sequelize.INTEGER },
    addr_soum_dist: { type: Sequelize.INTEGER },
    addr_bag_khoroo: { type: Sequelize.INTEGER },
    level: { type: Sequelize.STRING },
    AppId: { type: Sequelize.INTEGER },
    Body: { type: Sequelize.STRING },
  },
  {
    sequelize,
    tableName: 'Advice',
    modelName: 'Advice',
    timestamps: false,
  }
);

Advice.SearchField = [
  'id_data',
  'id',
  'id_group',
  'date_creation',
  'user_mod',
  'date_modif',
  'rec_status',
  'adv_id_patient',
  'adv_ticket_closed',
  'ticket_type',
  'soum_ticket',
  'addr_prov_city',
  'addr_soum_dist',
  'addr_bag_khoroo',
  'level',
  'AppId',
  'Body',
];

Advice.SetAssocations = (Models) => {
  Advice.belongsTo(Models.Apps, { as: 'Apps', foreignKey: 'AppId' });

  Advice.hasMany(Models.AdviceComment, {
    as: 'AdviceComment',
    foreignKey: 'adv_com_id_adv',
  });

  Advice.belongsTo(Models.Users, { as: 'Users', foreignKey: 'id' });

  Advice.belongsTo(Models.Patient, {
    as: 'Patient',
    foreignKey: 'adv_id_patient',
  });

  Advice.belongsTo(Models.vwAdviceViews, {
    as: 'vwAdviceViews',
    foreignKey: 'id_data',
    targetKey: 'AdviceId',
  });

  Advice.belongsTo(Models.vwAdviceInfo, {
    as: 'vwAdviceInfo',
    foreignKey: 'id_data',
    targetKey: 'AdviceId',
  });

  Advice.belongsTo(Models.DoctorsProfile, {
    as: 'DoctorsProfile',
    foreignKey: 'id',
    targetKey: 'UserId',
  });

  //new Assocations
  Advice.belongsTo(Models.DictProvinceCity, {
    as: 'DictProvinceCity',
    foreignKey: 'addr_prov_city',
  });

  Advice.belongsTo(Models.DictSoumDistrict, {
    as: 'DictSoumDistrict',
    foreignKey: 'addr_soum_dist',
  });

  Advice.belongsTo(Models.DictBagKhoroo, {
    as: 'DictBagKhoroo',
    foreignKey: 'addr_bag_khoroo',
  });
};

Advice.SetFunctions = (Models) => {
  const Op = Sequelize.Op;

  /**
   * Files attached to a ticket.
   *
   * `File` is one generic table keyed by LinkedObjectName + LinkedObjectId +
   * FieldName, so photos on a ticket need no schema change at all - only this
   * static plus a `Files` field descriptor in ModelConfigs/AdviceConfig.js.
   * BaseControllerHelper.BaseSetFiles looks this up by name, and both it and
   * the download path assume exactly this attribute set, so do not trim it.
   *
   * Mirrors AdviceComment.GetFiles.
   */
  Advice.GetFiles = async function (id_data) {
    const Files = await Models.File.findAll({
      where: {
        LinkedObjectId: id_data,
        LinkedObjectName: 'Advice',
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

  /**
   * The feed finder.
   *
   * Deliberately narrower than findAllNew, which joins 8 tables including both
   * aggregate views and the full patient record:
   *
   *  - It omits p_registration and the patient's name. The feed is a wall read
   *    by every doctor in the aimag; full patient identity belongs on the
   *    scoped detail page, not on every card. Age and gender are enough to
   *    render "45 нас · Эрэгтэй".
   *  - It joins neither vwAdviceInfo nor vwAdviceViews. Those are aggregate
   *    views of unknown cost; the controller fetches both counts once per page
   *    with a bounded IN (...) instead of once per row.
   *
   * All five includes are belongsTo, so this stays one flat LEFT JOIN with one
   * row per ticket and OFFSET/FETCH remains exact. subQuery:false is explicit
   * insurance against Sequelize deciding otherwise.
   */
  Advice.findAllFeed = async function (Option) {
    return await Advice.findAll({
      ...Option,
      attributes: [
        'id_data',
        'id',
        'date_creation',
        'date_modif',
        'rec_status',
        'adv_id_patient',
        'adv_ticket_closed',
        'ticket_type',
        'soum_ticket',
        'addr_prov_city',
        'addr_soum_dist',
        'level',
        'Body',
      ],
      include: [
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
        {
          model: Models.DoctorsProfile,
          as: 'DoctorsProfile',
          attributes: ['id_data', 'UserId', 'firstname', 'lastname', 'FullName'],
          // Which hospital is asking. Two attributes off an already-joined
          // table, so it costs a column list rather than a query; the detail
          // page needs it, and it used to cost a whole extra profile round trip
          // there. The feed card can use it too.
          include: [{ model: Models.Organization, as: 'Organization', attributes: ['Id', 'Name'] }],
        },
        { model: Models.Users, as: 'Users', attributes: ['Id', 'UserName'] },
        {
          model: Models.Patient,
          as: 'Patient',
          attributes: ['id_data', 'p_gender', 'p_birthday'],
        },
      ],
      subQuery: false,
    });
  };

  Advice.findAllNew = async function (Option) {
    const includeArray = [
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
      { model: Models.vwAdviceInfo, as: 'vwAdviceInfo' },
      {
        model: Models.DoctorsProfile,
        as: 'DoctorsProfile',
        attributes: ['id_data', 'UserId', 'firstname', 'lastname', 'FullName'],
      },
      {
        model: Models.Patient,
        as: 'Patient',
        attributes: [
          'id_data',
          'p_lastname',
          'p_birthday',
          'p_gender',
          'p_firstname',
          'p_registration',
        ],
        include: [{ model: Models.vwProvince, as: 'Province' }],
      },
      {
        model: Models.Users,
        as: 'Users',
        attributes: ['UserName', 'Id'],
      },
      {
        model: Models.vwAdviceViews,
        as: 'vwAdviceViews',
        attributes: ['AdviceId', 'ViewQty'],
      },
    ];

    try {
      const result = await Advice.findAll({
        ...Option,
        include: includeArray,
      });
      return result;
    } catch (error) {
      if (
        error.name === 'SequelizeDatabaseError' &&
        (error.message.includes('Invalid column name') || error.message.includes('CreateUserId'))
      ) {
        // If there's an error with CreateUserId column, retry without DoctorsProfile
        const filteredInclude = includeArray.filter((item) => item.as !== 'DoctorsProfile');
        return await Advice.findAll({
          ...Option,
          include: filteredInclude,
        });
      } else {
        // Re-throw other errors
        console.error('Error in Advice.findAllNew:');
        if (error.parent && error.parent.errors) {
          console.error('Nested errors in AggregateError:');
          error.parent.errors.forEach((err, index) => {
            console.error(`Error ${index}:`, err.message);
          });
        } else {
          console.error(error);
        }
        throw error;
      }
    }
  };

  Advice.createNew = async function (Data, ReturnIdField) {
    // The id comes from the INSERT, not from a follow-up query. Two concurrent
    // creates both read the HIGHER id from `SELECT TOP 1 ... ORDER BY ... DESC`,
    // so the loser returned the winner's row. Reproduced against the database:
    // two creates in one transaction returned 5 and 6, the old query 6 for both.
    //
    // Both branches keep their instance, so the retry path returns its own id
    // rather than whatever happened to be last in the table.
    let Created = null;
    try {
      // Attempt to create with all data including any CreateUserId field
      Created = await Advice.create(Data);
    } catch (error) {
      if (
        error.name === 'SequelizeDatabaseError' &&
        (error.message.includes('Invalid column name') || error.message.includes('CreateUserId'))
      ) {
        // If CreateUserId column doesn't exist, remove it and try again
        const cleanData = { ...Data };
        if (cleanData.hasOwnProperty('CreateUserId')) {
          delete cleanData.CreateUserId;
        }
        Created = await Advice.create(cleanData);
      } else {
        throw error;
      }
    }

    return Created[ReturnIdField];
  };

  Advice.findAllDetail = async function (Option) {
    const includeArray = [
      { model: Models.vwAdviceInfo, as: 'vwAdviceInfo' },
      {
        model: Models.DoctorsProfile,
        as: 'DoctorsProfile',
        attributes: ['id_data', 'UserId', 'firstname', 'lastname', 'FullName'],
      },
      {
        model: Models.Patient,
        as: 'Patient',
        attributes: ['id_data', 'p_lastname', 'p_birthday', 'p_gender', 'p_firstname'],
        include: [{ model: Models.vwProvince, as: 'Province' }],
      },
      { model: Models.Users, as: 'Users', attributes: ['UserName'] },
      {
        model: Models.vwAdviceViews,
        as: 'vwAdviceViews',
        attributes: ['AdviceId', 'ViewQty'],
      },
    ];

    try {
      const result = await Advice.findAll({
        ...Option,
        include: includeArray,
      });
      return result;
    } catch (error) {
      if (
        error.name === 'SequelizeDatabaseError' &&
        (error.message.includes('Invalid column name') || error.message.includes('CreateUserId'))
      ) {
        // If there's an error with CreateUserId column, retry without DoctorsProfile
        const filteredInclude = includeArray.filter((item) => item.as !== 'DoctorsProfile');
        return await Advice.findAll({
          ...Option,
          include: filteredInclude,
        });
      } else {
        // Re-throw other errors
        throw error;
      }
    }
  };
};

module.exports = Advice;
