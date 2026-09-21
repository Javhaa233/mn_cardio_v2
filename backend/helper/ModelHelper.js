const bcrypt = require('bcryptjs');

const { sequelize, Op } = require('../config/DB');

const BaseHelper = require('./BaseHelper');
const ObjectHelper = require('./ObjectHelper');

function ModelHelper(Model) {
  this.Model = Model ? Model : null;
}

ModelHelper.prototype.LogedUser = {};

/**
 * Resolve a search field to the real columns behind it.
 *
 * A VIRTUAL attribute is computed in JS after the rows come back, so putting it
 * in a WHERE clause makes Sequelize throw and the whole list fails with
 * "An error occurred" - which is what every grid filter on DoctorsProfile.FullName
 * did. Returns:
 *   null  - an ordinary column, use it as-is
 *   []    - virtual with no declared dependencies: skip the filter, never crash
 *   [...] - virtual with dependencies: the concrete columns to search instead
 *
 * Accepts both 'Column' and 'Association.Column'.
 */
ModelHelper.prototype.GetVirtualFields = function (Path) {
  try {
    if (!this.Model || !Path) return null;

    var Target = this.Model;
    var Attr = Path;
    var Prefix = '';

    if (Path.indexOf('.') !== -1) {
      var Parts = Path.split('.');
      Attr = Parts.pop();
      var Assoc = this.Model.associations ? this.Model.associations[Parts.join('.')] : null;
      if (!Assoc || !Assoc.target) return null;
      Target = Assoc.target;
      Prefix = Parts.join('.') + '.';
    }

    var Attributes = Target.rawAttributes || {};
    var Definition = Attributes[Attr];
    if (!Definition || !Definition.type) return null;
    if (Definition.type.key !== 'VIRTUAL') return null;

    var Fields = Definition.type.fields || [];
    return Fields.map((f) => (Prefix ? '$' + Prefix + f + '$' : f));
  } catch (ex) {
    console.log('[ModelHelper] GetVirtualFields failed for', Path, ex.message);
    return null;
  }
};

ModelHelper.prototype.GetFindOption = async function (Option) {
  if (!Option) return {};

  var FindOption = {};
  const WhereType = Option.WhereType == 'Contains' ? 'Contains' : 'Equals';
  const SearchField = this.Model.SearchField;
  if (Option.SearchText && Option.SearchText != '') {
    var where = {};
    if (SearchField && SearchField.length > 0) {
      for (var i = 0; i < SearchField.length; i++) {
        if (WhereType == 'Contains') {
          where[SearchField[i]] = { [Op.like]: '%' + Option.SearchText + '%' };
        } else {
          //Equals
          where[SearchField[i]] = Option.SearchText + '';
        }
      }
    }
    FindOption['where'] = { [Op.or]: where };
  }

  if (Option.SearchField && Option.SearchField.length > 0) {
    var where = {};
    // OR groups standing in for virtual fields, kept apart from `where` because
    // several of them would collide on the same Op.or key
    var VirtualWhere = [];
    for (var i = 0; i < Option.SearchField.length; i++) {
      var Field = Option.SearchField[i];
      if (
        Field &&
        Field.Value &&
        Field.Value.toString().replace(/\s/g, '').length > 0 &&
        Field.Field &&
        Field.Op
      ) {
        var Fl = '';
        if (Field.Field.indexOf('.') != -1) Fl = '$' + Field.Field + '$';
        else Fl = Field.Field;

        // A virtual attribute has no column to compare against. Search the
        // columns it is built from when they are declared, otherwise drop the
        // filter - either way the list must not fail.
        var Virtual = this.GetVirtualFields(Field.Field);
        if (Virtual) {
          if (Virtual.length > 0 && Field.Value !== 'null') {
            var Parts = Virtual.map(function (Column) {
              var Condition = {};
              if (Field.Op === 'Contains')
                Condition[Column] = { [Op.like]: '%' + Field.Value + '%' };
              else Condition[Column] = '' + Field.Value + '';
              return Condition;
            });
            VirtualWhere.push({ [Op.or]: Parts });
          } else {
            console.log('[ModelHelper] skipping filter on virtual field', Field.Field);
          }
          continue;
        }

        if (Field.Value === 'null') {
          if (Field.Op === 'Equals') where[Fl + ''] = { [Op.eq]: null };
          if (Field.Op === 'NotEquals') where[Fl + ''] = { [Op.ne]: null };
        } else if (Field.Value) {
          if (Field.Op === 'Contains') where[Fl + ''] = { [Op.like]: '%' + Field.Value + '%' };
          if (Field.Op === 'Equals') where[Fl + ''] = '' + Field.Value + '';
          if (Field.Op === 'Between')
            where[Fl + ''] = { [Op.between]: [Field.Value[0], Field.Value[1]] };
          if (Field.Op === 'In') where[Fl + ''] = { [Op.in]: Field.Value };
          if (Field.Op === 'NotEquals') where[Fl + ''] = { [Op.ne]: Field.Value };
        }

        // DEBUG: Log each search field being processed
        console.log('[ModelHelper] Processing SearchField:', {
          Field: Field.Field,
          Value: Field.Value,
          Op: Field.Op,
          ProcessedField: Fl,
        });
      }
    }

    if (Object.keys(where).length > 0 || VirtualWhere.length > 0) {
      const AndParts = Object.keys(where).length > 0 ? [where].concat(VirtualWhere) : VirtualWhere;
      FindOption['where'] = { ...FindOption['where'], [Op.and]: AndParts };
      // DEBUG: Log final where clause
      console.log(
        '[ModelHelper] Final WHERE clause:',
        JSON.stringify(FindOption['where'], null, 2)
      );
    }
  }

  var { offset, limit } = Option;
  if (offset !== undefined && limit !== undefined) {
    FindOption['offset'] = offset;
    FindOption['limit'] = limit;
  }

  if (Option.OrderBy) {
    if (Option.OrderBy.OrderByField && Option.OrderBy.OrderByField.indexOf('.') === -1) {
      FindOption['order'] = [[Option.OrderBy.OrderByField, Option.OrderBy.OrderByType]];
    } else {
      FindOption['order'] = [
        [sequelize.col(Option.OrderBy.OrderByField), Option.OrderBy.OrderByType],
      ];
    }
  }
  return { FindOption };
};

/**
 * Add the includes that association-path filters need in order to bind.
 *
 * A filter on `Assoc.Column` is turned into Sequelize's `$Assoc.Column$`
 * syntax by GetFindOption. That syntax only resolves if the association is
 * ALSO included in the query — otherwise SQL Server answers
 * "The multi-part identifier "Assoc.Column" could not be bound" and the whole
 * list fails.
 *
 * That is not hypothetical. BaseControllerHelper.AddOrgFilter scopes the
 * Patient register with `Users.RoleId` and `Users.Id`, and the plain list path
 * runs Model.findAll with no includes at all — so listing Patient failed
 * outright for every role, while the SAME call filtered by p_registration
 * worked, because AddOrgFilter returns early for that case before adding the
 * filters. 358,148 patients, and the register could not be listed.
 *
 * Includes are added with `attributes: []` so nothing extra is selected, and
 * `required: false` so the join cannot silently drop rows on its own — the
 * where clause remains the only thing that filters.
 *
 * Only associations that actually exist on the model are added; an unknown
 * prefix is left alone for the existing error handling to report.
 */
ModelHelper.prototype.AddFilterIncludes = function (FindOption) {
  try {
    if (!FindOption || !FindOption.where || !this.Model || !this.Model.associations) return;

    // Collect every $Assoc.Column$ key anywhere in the where tree.
    var Needed = new Set();
    var Walk = function (Node, Depth) {
      if (!Node || Depth > 6) return;
      if (Array.isArray(Node)) return Node.forEach((n) => Walk(n, Depth + 1));
      if (typeof Node !== 'object') return;
      // Symbol keys (Op.and / Op.or) carry nested conditions.
      Object.getOwnPropertySymbols(Node).forEach((s) => Walk(Node[s], Depth + 1));
      Object.keys(Node).forEach(function (k) {
        var m = /^\$(.+)\.[^.]+\$$/.exec(k);
        if (m) Needed.add(m[1]);
        Walk(Node[k], Depth + 1);
      });
    };
    Walk(FindOption.where, 0);
    if (!Needed.size) return;

    if (!Array.isArray(FindOption.include)) {
      FindOption.include = FindOption.include ? [FindOption.include] : [];
    }

    var Existing = new Set(
      FindOption.include.map((i) => (i && (i.as || (i.association && i.association.as))) || null)
    );

    Needed.forEach((As) => {
      if (Existing.has(As)) return;
      var Assoc = this.Model.associations[As];
      if (!Assoc || !Assoc.target) return;
      FindOption.include.push({ model: Assoc.target, as: As, attributes: [], required: false });
    });
  } catch (ex) {
    // A list that cannot be scoped must still not crash; the filter will fail
    // loudly on its own if the include really was required.
    console.log('[ModelHelper] AddFilterIncludes failed:', ex.message);
  }
};

ModelHelper.prototype.FindAllExec = async function (Option, FindOption) {
  var result = { Data: [], Total: 0 };
  var CountQuery = '';
  try {
    this.AddFilterIncludes(FindOption);
    if (this.Model.findAllNew && Option.FindType == 'AllData') {
      result.Data = await this.Model.findAllNew({
        ...FindOption,
        logging: (sql) => {
          console.log(sql);
          CountQuery = sql.replace('Executing (default): ', '');
        },
      });
    } else {
      result.Data = await this.Model.findAll({
        ...FindOption,
        logging: (sql) => {
          console.log(sql);
          CountQuery = sql.replace('Executing (default): ', '');
        },
      });
    }
  } catch (error) {
    console.error(`[ModelHelper] Error in FindAllExec for model ${this.Model.name}:`);
    console.error('FindOption:', JSON.stringify(FindOption, null, 2));
    if (error.name === 'SequelizeDatabaseError') {
      console.error('SQL:', error.sql);
      if (error.parent && error.parent.errors) {
        error.parent.errors.forEach((err, index) => {
          console.error(`Nested Error ${index}:`, err.message);
        });
      }
    }
    throw error;
  }

  // Build COUNT query by wrapping the original SELECT as a derived table
  if (CountQuery !== '') {
    // Remove SQL Server pagination (ORDER BY ... OFFSET N ROWS FETCH NEXT N ROWS ONLY)
    let cleanQuery = CountQuery.replace(
      /\s+ORDER\s+BY\s+.*?OFFSET\s+\d+\s+ROWS\s+FETCH\s+NEXT\s+\d+\s+ROWS\s+ONLY/is,
      ''
    );
    // Remove standalone LIMIT/OFFSET (MySQL-style, just in case)
    cleanQuery = cleanQuery
      .replace(/\s+LIMIT\s+\d+/gi, '')
      .replace(/\s+OFFSET\s+\d+(?!\s+ROWS)/gi, '')
      .replace(/[;\s]+$/, '');

    CountQuery = 'SELECT COUNT(1) AS [Total] FROM (' + cleanQuery + ') AS [CountQuery]';
    console.log('COUNT Query:', CountQuery);
  }

  // console.log({ CountQuery });
  if (CountQuery !== '') {
    const [CountData] = await sequelize.query(CountQuery);
    if (CountData.length === 1) result.Total = CountData[0]['Total'];
  }
  return result;
};

ModelHelper.prototype.FindAll = async function (Option) {
  const { FindOption } = await this.GetFindOption(Option);
  const result = this.FindAllExec(Option, FindOption);
  return result;
};

ModelHelper.prototype.FindDetail = async function (Option) {
  var result = { Data: [], Total: 0 };
  const { FindOption } = await this.GetFindOption(Option);
  if (this.Model.findAllDetail) result.Data = await this.Model.findAllDetail(FindOption);
  else if (this.Model.findAllNew) result.Data = await this.Model.findAllNew(FindOption);
  else result.Data = await this.Model.findAll(FindOption);
  return result;
};

ModelHelper.prototype.SetDefaultValue = async function (Fields, Data, IsNew) {
  for (var i = 0; i < Fields.length; i++) {
    const Field = Fields[i];
    switch (Field.Name) {
      case 'OrganizationId':
        if (IsNew === true && !Data['OrganizationId'])
          Data['OrganizationId'] = this.LogedUser.Doctor
            ? this.LogedUser.Doctor.OrganizationId
            : null;
        break;
      case 'id':
        if (IsNew === true && !Data['id'])
          Data['id'] = this.LogedUser && this.LogedUser.Id ? this.LogedUser.Id : null;
        break;
      case 'id_group':
        if (IsNew === true && !Data['id_group']) Data['id_group'] = '1';
        break;
      // Stamps the time as well as the date. NOTE: on the live schema this is
      // mostly inert - 91 of the 92 date_creation/date_created columns are SQL
      // `date` (measured 2026-09-15; one is datetime2), so the server drops the
      // time on write. The message time the apps display comes from date_modif
      // (datetime, stamped at create) - see helper/CreatedAt.js. Harmless to
      // keep, and correct for any column that is, or becomes, datetime.
      case 'date_creation':
        if (IsNew === true && !Data['date_creation'])
          Data['date_creation'] = ObjectHelper.getDateYMDHMS();
        break;
      case 'date_created':
        if (IsNew === true && !Data['date_created'])
          Data['date_created'] = ObjectHelper.getDateYMDHMS();
        break;
      case 'user_mod':
        if (IsNew === true && !Data['user_mod'])
          Data['user_mod'] =
            this.LogedUser && this.LogedUser.UserName ? this.LogedUser.UserName : null;
        break;
      case 'UpdateDate':
        if (!Data['UpdateDate']) Data['UpdateDate'] = ObjectHelper.getDateYMDHMS();
        break;
      case 'UpdateUserId':
        if (!Data['UpdateUserId'])
          Data['UpdateUserId'] = this.LogedUser.Id ? this.LogedUser.Id : null;
        break;
      case 'date_modif':
        Data['date_modif'] = ObjectHelper.getDateYMDHMS();
        break;
      case 'rec_status':
        if (IsNew === true && !Data['rec_status']) Data['rec_status'] = '9';
        break;
      case 'CreateUserId':
        if (IsNew === true && !Data['CreateUserId']) {
          Data['CreateUserId'] = this.LogedUser.Id ? this.LogedUser.Id : null;
        }
        break;
      case 'CreateDate':
        if (IsNew === true && !Data['CreateDate'])
          Data['CreateDate'] = ObjectHelper.getDateYMDHMS();
        break;
      case 'CreatedDate':
        if (IsNew === true && !Data['CreatedDate']) Data['CreatedDate'] = ObjectHelper.getDateYMD();
        break;
      case 'p_registration':
        if (IsNew === true && Data['p_registration'])
          Data['p_registration'] = Data['p_registration'].toUpperCase();
        break;
      case 'RegNo':
        if (IsNew === true && Data['RegNo']) Data['RegNo'] = Data['RegNo'].toUpperCase();
        break;
      case 'PatRegNo':
        if (Data['PatRegNo']) Data['PatRegNo'] = Data['PatRegNo'].toUpperCase();
        break;
      case 'personal_number':
        if (Data['personal_number'])
          Data['personal_number'] = Data['personal_number'].toUpperCase();
        break;
      case 'p_firstname':
        if (Data['p_firstname']) {
          const p_firstname = Data['p_firstname'];
          Data['p_firstname'] =
            p_firstname.charAt(0).toUpperCase() + p_firstname.slice(1).toLowerCase();
        }
        break;
      case 'p_lastname':
        if (Data['p_lastname']) {
          const p_lastname = Data['p_lastname'];
          Data['p_lastname'] =
            p_lastname.charAt(0).toUpperCase() + p_lastname.slice(1).toLowerCase();
        }
        break;
      case 'AppId':
        if (IsNew === true && !Data['AppId'])
          Data['AppId'] = this.LogedUser && this.LogedUser.AppId;
        break;
    }
  }
  return;
};

ModelHelper.prototype.SaveRoot = async function (ModelConfig, Data, IsNew) {
  var Fields = ModelConfig.Fields;
  Fields = BaseHelper.GetFieldList(Fields);
  const Model = ModelConfig.Model;
  const PK = ModelConfig.PK;
  var SaveLookUp = [];
  var SaveManyObject = [];
  let DataId = Data[PK];
  var SaveData = null;

  await this.SetDefaultValue(Fields, Data, IsNew);
  //  password field
  var PassFields = Fields.filter(
    (s) =>
      s.Type === 'Password' && Object.keys(Data).filter((l) => l + '' === '' + s.Name).length === 1
  );
  for (var i = 0; i < PassFields.length; i++) {
    var F = PassFields[i];
    var HashPassword = await bcrypt.hash(Data[F.Name], 8);
    Data[F.Name] = HashPassword;
  }

  Fields.filter(
    (s) =>
      s.Multiple === true && Object.keys(Data).filter((l) => l + '' === '' + s.Name).length === 1
  ).forEach(async (Field) => {
    //multiple value fields
    if (
      Field.Multiple == true &&
      Field.OptionType &&
      Field.LookUpConfig &&
      (Field.Type === 'CheckBox' || Field.Type === 'MultipleSelect')
    ) {
      var LookUpConfig = Field.LookUpConfig;
      SaveLookUp.push({
        LookUpConfig: LookUpConfig,
        Data: Data[Field.Name],
        Field: Field,
      });
      Data[Field.Name] = null;
    }

    if (
      Field.Multiple == true &&
      Field.ManyConfig &&
      (Field.Type == 'CheckBox' || Field.Type == 'MultipleSelect')
    ) {
      var ManyConfig = Field.ManyConfig;
      SaveManyObject.push({ ManyConfig, Data: Data[Field.Name] });
    }
  });

  if (IsNew === false) {
    //update
    if (Model.updateNew) {
      await Model.updateNew(Data, DataId, PK);
    } else {
      await Model.update(Data, {
        where: { [PK]: DataId },
        logging: (sql, ops) => {
          console.log(sql);
          if (ops && ops.bind) {
            console.log(ops.bind);
          }
        },
      });
    }
  } else {
    //create
    if (Model.createNew) {
      DataId = await Model.createNew(Data, PK);
    } else {
      SaveData = await Model.create(Data);
      DataId = SaveData[PK];
    }
  }

  if (DataId) {
    for (var i = 0; i < SaveLookUp.length; i++) {
      var LookUp = SaveLookUp[i];
      await this.SaveLookUpData(DataId, LookUp.Field, LookUp.LookUpConfig, LookUp.Data);
    }

    SaveManyObject.forEach(async (ManyObject) => {
      await this.SaveManyObject(DataId, ManyObject.ManyConfig, ManyObject.Data);
    });
  }

  return DataId;
};

ModelHelper.prototype.SaveManyObject = async function (ParentId, ManyConfig, Data) {
  try {
    if (ManyConfig) {
      await ManyConfig.Model.destroy({
        where: { [ManyConfig.ParentField]: ParentId },
      });
      //insert
      Data.forEach(async (d) => {
        var newData = {
          [ManyConfig.ParentField]: ParentId,
          [ManyConfig.ChildField]: d,
        };
        await ManyConfig.Model.create(newData);
      });

      return true;
    }
  } catch (ex) {
    console.error(ex);
    return false;
  }
};

ModelHelper.prototype.SaveLookUpData = async function (ParentId, Field, LookUpConfig, Data) {
  try {
    if (LookUpConfig && LookUpConfig.Model) {
      await LookUpConfig.Model.destroy({
        where: {
          [LookUpConfig.Field]: Field.Name,
          [LookUpConfig.ParentValueField]: ParentId,
        },
      });

      Data &&
        Array.isArray(Data) &&
        Data.forEach(async (d) => {
          var newData = {
            [LookUpConfig.ParentValueField]: ParentId,
            [LookUpConfig.ChildValueField]: d,
            [LookUpConfig.Field]: Field.Name,
          };
          await LookUpConfig.Model.create(newData);
        });

      return true;
    }
  } catch (ex) {
    console.error(ex);
    return false;
  }
};

ModelHelper.prototype.GetNewObject = function (Objects) {
  return JSON.parse(JSON.stringify(Objects));
};

ModelHelper.prototype.GetInfoData = async function (Data, ModelConfig) {
  //single object data
  var LookUpData = [];
  var CallModel = true;

  if (ModelConfig.Model.GetLookUpData) {
    LookUpData = await ModelConfig.Model.GetLookUpData(Data[ModelConfig.PK]);
    LookUpData = BaseHelper.GetNewObject(LookUpData);
    CallModel = false;
  }
  for (var i = 0; i < ModelConfig.Fields.length; i++) {
    for (var j = 0; j < ModelConfig.Fields[i].length; j++) {
      var Field = ModelConfig.Fields[i][j];
      if (Field.Type === 'SingleSelect' || Field.Type === 'RadioBox') {
        var Temp = [];
        if (Array.isArray(Field.Data)) {
          if (Field.Config) {
            Temp = Field.Data.filter((s) => s[Field.Config.IdField] + '' === Data[Field.Name] + '');
          } else {
            Temp = Field.Data.filter((s) => s['Value'] + '' === Data[Field.Name] + '');
          }
        }
        if (Temp.length === 1) {
          Data[Field.Name + 'Obj'] = { ...Temp[0], Password: null };
        } else if (Temp.length === 0) {
          Data[Field.Name + 'Obj'] = null;
        }
      }

      if (Field.Type === 'GridLookUpSingle') {
        var Temp;
        if (Field.Config) {
          Temp = Field.Data.filter((s) => s[Field.Config.IdField] + '' === Data[Field.Name] + '');
        }

        if (Temp.length === 1) {
          Data[Field.Name + 'Obj'] = { ...Temp[0], Password: null };
        } else if (Temp.length === 0) {
          Data[Field.Name + 'Obj'] = null;
        }
      }

      if (Field.Type === 'GridLookUpSingleLoad') {
        if (Field.Config) {
          const [Temp] = await sequelize.query(
            'SELECT * FROM ' +
              Field.Config.ObjectName +
              ' WHERE ' +
              Field.Config.IdField +
              '=' +
              Data[Field.Name]
          );
          if (Temp.length === 1) {
            Data[Field.Name + 'Obj'] = { ...Temp[0], Password: null };
          } else if (Temp.length === 0) {
            Data[Field.Name + 'Obj'] = null;
          }
        } else {
          Data[Field.Name + 'Obj'] = null;
        }
      }

      //multiple object data
      if (
        Field.Multiple == true &&
        Field.OptionType &&
        Field.LookUpConfig &&
        (Field.Type === 'CheckBox' || Field.Type === 'MultipleSelect')
      ) {
        var LookUpConfig = Field.LookUpConfig;
        var Result = [];
        var MultipleData = [];
        if (CallModel) {
          MultipleData = await LookUpConfig.Model.findAll({
            where: {
              [LookUpConfig.Field]: Field.Name,
              [LookUpConfig.ParentValueField]: Data[ModelConfig.PK],
            },
          });
        } else {
          MultipleData = LookUpData.filter(
            (s) =>
              s[LookUpConfig.Field] + '' === '' + Field.Name &&
              s[LookUpConfig.ParentValueField] + '' === '' + Data[ModelConfig.PK]
          );
        }

        for (var l = 0; l < MultipleData.length; l++) {
          var temp =
            Field.Data &&
            Array.isArray(Field.Data) &&
            Field.Data.filter(
              (s) =>
                s[Field.Config.IdField] + '' == MultipleData[l][LookUpConfig.ChildValueField] + ''
            );
          if (temp.length === 1) {
            Result.push(temp[0]);
          }
        }

        Data[Field.Name + 'Obj'] = BaseHelper.GetNewObject(Result);

        // if (
        //   Field.Multiple == true &&
        //   Field.ManyConfig &&
        //   (Field.Type == "CheckBox" || Field.Type == "MultipleSelect")
        // ) {
        //   var ManyConfig = Field.ManyConfig;
        //   var MultipleData = await ManyConfig.Model.findAll({
        //     where: { [ParentField]: Data[ModelConfig.PK] }
        //   });
        //   Data[Field.Name + "Obj"] = this.GetNewObject(MultipleData);
        // }
      }
    }
  }
};

module.exports = ModelHelper;
