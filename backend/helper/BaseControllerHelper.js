const fs = require('fs');
var mime = require('mime-types');
const ExcelJS = require('exceljs');
const path = require('path');

const { Models, Op, sequelize } = require('../config/DB');

const ConfigHelper = require('./ConfigHelper');
var ModelHelper = require('./ModelHelper');
const BaseHelper = require('./BaseHelper');
const ObjectHelper = require('./ObjectHelper');
const ImageHelper = require('./ImageHelper');
const PatientScope = require('./PatientScope');

const translate = require('../reports/translate.js');

/**
 * Hard ceiling on how many rows one export may pull into memory.
 *
 * Every row is hydrated one at a time by GetInfoData and then deep-cloned
 * through JSON.parse(JSON.stringify(...)), so cost per row is high. 20,000 is
 * far more than any clinical export needs and stays well inside the 1 GB
 * max_memory_restart in ecosystem.config.js. Raise it with EXPORT_MAX_ROWS if a
 * genuine bulk extract is ever needed.
 */
const EXPORT_ROW_CAP =
  Number(process.env.EXPORT_MAX_ROWS) > 0 ? Number(process.env.EXPORT_MAX_ROWS) : 20000;

class BaseControllerHelper {
  translateLabel = function (word) {
    return translate(word, 'mn');
  };

  GetConfigData = async function (ObjectName) {
    const ModelConfig = ConfigHelper.getModelConfig(ObjectName);
    if (ModelConfig && ModelConfig.Fields.length > 0) {
      for (var i = 0; i < ModelConfig.Fields.length; i++) {
        for (var j = 0; j < ModelConfig.Fields[i].length; j++) {
          var Field = ModelConfig.Fields[i][j];
          if (Field.OptionType) {
            var [OptionData] = await sequelize.query(
              "SELECT label AS Label, value AS [Value] FROM OptionTypes WHERE dico=N'" +
                Field.OptionType +
                "'"
            );
            Field.Data = OptionData;
          }
          if (
            (Field.Type === 'SingleSelect' ||
              Field.Type === 'MultipleSelect' ||
              Field.Type === 'GridLookUpSingle') &&
            Field.OptionType === undefined
          ) {
            if (Field.Config && Field.Config.Model) {
              var OptionData = [];
              if (Field.Config.SearchType && Field.Config.SearchType === 'AllData') {
                if (Field.Config.Model.findAllNew) {
                  OptionData = await Field.Config.Model.findAllNew();
                } else {
                  OptionData = await Field.Config.Model.findAll();
                }
              } else {
                OptionData = await Field.Config.Model.findAll();
              }
              OptionData = JSON.parse(JSON.stringify(OptionData));
              Field.Data = OptionData;
            }
          }
          if (
            Field.Type === 'CheckBox' &&
            Field.OptionType == undefined &&
            Field.Config &&
            Field.Config.Model
          ) {
            var OptionData = await Field.Config.Model.findAll();
            OptionData = JSON.parse(JSON.stringify(OptionData));
            Field.Data = OptionData;
          }
        }
      }
    }
    return ModelConfig;
  };

  GetPageData = function (limit, page) {
    if (limit !== undefined && page !== undefined && limit !== null && page !== null) {
      const l = parseInt(limit, 10);
      const p = parseInt(page, 10);
      if (!isNaN(l) && !isNaN(p)) {
        return { Limit: l, Offset: p * l };
      }
    }
    return { Limit: undefined, Offset: undefined };
  };

  GetCrudRequestData = function (req) {
    const {
      PageSize,
      PageNumber,
      SearchText,
      WhereType,
      FindType,
      SearchField,
      OrderByType,
      OrderByField,
    } = req.body;

    const PageData = this.GetPageData(PageSize, PageNumber);
    const Option = {
      SearchText,
      limit: PageData.Limit,
      offset: PageData.Offset,
      /*
       * Default to an empty array rather than passing `undefined` through.
       *
       * 29 call sites across the controllers do `Option.SearchField.push(...)`
       * to append an organisation scope, with no guard — so omitting
       * SearchField from the request body crashed the handler with
       * "Cannot read properties of undefined (reading 'push')". It went
       * unnoticed because the web client always sends the field; a client that
       * does not (the mobile app, or any direct API caller) hit a hard failure
       * on endpoints as central as AtrialRhythmNew/GetList, which backs tender
       * form 2.2.
       *
       * Fixing it here rather than at the 29 call sites: an empty array is what
       * every one of them already assumes it is pushing onto.
       */
      SearchField: Array.isArray(SearchField) ? SearchField : [],
      FindType,
      WhereType,
    };
    if (OrderByField && OrderByType) Option.OrderBy = { OrderByField, OrderByType };
    return Option;
  };

  SetFooter = function (data, FooterData) {
    var result = [];
    if (Array.isArray(FooterData) && FooterData.length > 0) {
      for (var i = 0; i < FooterData.length; i++) {
        //row
        var Row = {};
        for (var j = 0; j < FooterData[i].length; j++) {
          //col
          if (FooterData[i][j].Function == 'SUM') {
            var value = data.reduce(
              (a, b) =>
                BaseHelper.GetFloat(a + '') + BaseHelper.GetFloat(b[FooterData[i][j].Field] + ''),
              0
            );
            Row[FooterData[i][j].Field] = value;
          }
          if (FooterData[i][j].Function == 'COUNT') {
            var value = data.length;
            Row[FooterData[i][j].Field] = value;
          }
          // if (FooterData[i][j].Function == "MAX") {
          //   var value = Math.max(data);
          //   Row[FooterData[i][j].Fields] = value;
          // }
        }
        result.push(Row);
      }
    }
    return result;
  };

  GetValue = function (Row, Names, index) {
    var f = Names[index];
    if (Row[f] === undefined || Row[f] === null) {
      return null;
    } else {
      if (Names.length - 1 === index) {
        return Row[Names[index]];
      } else if (Names.length - 1 > index) {
        var i = index + 1;
        return this.GetValue(Row[f], Names, i);
      }
    }
  };

  LogNoDataReturned = function (callerInfo = {}) {
    const { ObjectName, endpoint, filePath } = callerInfo;
    const timestamp = new Date().toISOString();

    console.log('========================================');
    console.log(`[NO DATA RETURNED] ${timestamp}`);
    if (filePath) console.log(`File: ${filePath}`);
    if (ObjectName) console.log(`ObjectName: ${ObjectName}`);
    if (endpoint) console.log(`Endpoint: ${endpoint}`);
    console.log('========================================');
  };

  GetDefaultErrorResult = function (ErrorMessage) {
    var result = { Success: false, Data: null, Message: 'An error occurred' };
    if (ErrorMessage) result.Message = ErrorMessage;
    return result;
  };

  GetFindOptionCustom = function ({ EndDate, StartDate, PageOption, OrderBy, DateField }) {
    var Option = {};
    if (PageOption) {
      var Limit = 20;
      if (PageOption.Limit) {
        Limit = BaseHelper.GetBvhel(PageOption.Limit + '');
        Option.limit = Limit;
      }
      if (PageOption.Page !== undefined)
        Option.offset = BaseHelper.GetBvhel(PageOption.Page + '') * Limit;
    }
    if (OrderBy && OrderBy.Field && OrderBy.Type) Option.order = [[OrderBy.Field, OrderBy.Type]];
    if (StartDate && EndDate && DateField)
      Option.where = { [DateField]: { [Op.between]: [StartDate, EndDate] } };
    return Option;
  };

  ensureUserForDoctor = async function (Data, LogedUser) {
    let userId = Data.UserId || Data.id;
    let user = null;

    if (!userId && Data.id_data) {
      const existingProfile = await Models.DoctorsProfile.findByPk(Data.id_data, { raw: true });
      if (existingProfile && (existingProfile.UserId || existingProfile.id)) {
        userId = existingProfile.UserId || existingProfile.id;
      }
    }

    if (userId) {
      user = await Models.Users.findByPk(userId);
      if (user) {
        Data.UserId = user.Id;
        Data.id = user.Id; // DoctorsProfile maps UserId to 'id' database field

        // Update associated user's details if they were modified
        const updateData = {};

        let newUserName =
          Data.UserName ||
          (Data.Users && Data.Users.UserName) ||
          (Data.UserData && Data.UserData.UserName);
        if (newUserName && newUserName !== user.UserName) updateData.UserName = newUserName;

        if (Data.email && Data.email !== user.Email) updateData.Email = Data.email;
        if (Data.lastname && Data.lastname !== user.LastName) updateData.LastName = Data.lastname;
        if (Data.firstname && Data.firstname !== user.FirstName)
          updateData.FirstName = Data.firstname;

        if (Object.keys(updateData).length > 0) {
          if (updateData.UserName) {
            const existingUser = await Models.Users.findOne({
              where: { UserName: updateData.UserName },
              raw: true,
            });
            if (existingUser && existingUser.Id !== user.Id) {
              const error = new Error('Username already exists');
              error.Message = 'Username already exists';
              throw error;
            }
          }
          await Models.Users.update(updateData, { where: { Id: user.Id } });
        }
      }
    }

    if (!user) {
      // Create user if not found
      const bcrypt = require('bcryptjs');

      // Try to get username and other info from various possible locations in Data
      const UserName =
        Data.UserName ||
        (Data.Users && Data.Users.UserName) ||
        (Data.UserData && Data.UserData.UserName) ||
        Data.email ||
        Data.telephone ||
        `user_${Date.now()}`;

      // Check if username already exists
      const existingUser = await Models.Users.findOne({
        where: { UserName: UserName },
        raw: true,
      });

      if (existingUser) {
        const error = new Error('Username already exists');
        error.Message = 'Username already exists';
        throw error;
      }

      const Email =
        Data.email || (Data.Users && Data.Users.Email) || (Data.UserData && Data.UserData.Email);
      const LastName =
        Data.lastname ||
        (Data.Users && Data.Users.LastName) ||
        (Data.UserData && Data.UserData.LastName);
      const FirstName =
        Data.firstname ||
        (Data.Users && Data.Users.FirstName) ||
        (Data.UserData && Data.UserData.FirstName);
      const password =
        Data.Password ||
        (Data.Users && Data.Users.Password) ||
        (Data.UserData && Data.UserData.Password) ||
        Data.telephone ||
        'Password123!';

      const hashPassword = await bcrypt.hash(password, 8);

      const userData = {
        UserName: UserName,
        Email: Email,
        LastName: LastName,
        FirstName: FirstName,
        Password: hashPassword,
        AppId: Data.AppId || (LogedUser ? LogedUser.AppId : null),
        IsActive: '1',
        CreateDate: new Date().toISOString(),
        CreateUserId: LogedUser ? LogedUser.Id : null,
        RoleId: Data.RoleId || 2, // Default RoleId for Doctors
      };

      const newUser = await Models.Users.create(userData);
      Data.UserId = newUser.Id;
      Data.id = newUser.Id; // DoctorsProfile maps UserId to 'id' database field
    }
    return Data;
  };

  // Add organization filter for non-admin users (show only own org + child orgs data)
  AddOrgFilter = async function ({ ObjectName, LogedUser, Option }) {
    if (!LogedUser || !Option) return;

    // Patients are scoped by their own identity, not by organisation. This runs
    // first and returns, so none of the staff logic below - including the
    // p_registration early return - can widen a patient's view.
    if (PatientScope.IsPatient(LogedUser)) {
      const scoped = PatientScope.ApplyPatientFilter({ ObjectName, LogedUser, Option });
      if (!scoped.Allowed) {
        Option.PatientScopeDenied = scoped.Reason;
      }
      return;
    }

    const RoleId = parseInt(LogedUser.RoleId);

    if (!Option.SearchField) Option.SearchField = [];

    // Patient: filter by creator role and user
    if (ObjectName === 'Patient') {
      const HasRegLookup = (Option.SearchField || []).some(
        (f) => f && f.Field === 'p_registration' && f.Op === 'Equals' && f.Value
      );
      if (HasRegLookup) return;

      Option.SearchField.push({
        Field: 'Users.RoleId',
        Value: '4',
        Op: 'NotEquals',
      });
      if (RoleId !== 1) {
        Option.SearchField.push({
          Field: 'Users.Id',
          Value: LogedUser.Id,
          Op: 'Equals',
        });
      }
      return;
    }

    // Admin (1) can see all other data
    if (RoleId === 1) return;

    // The full user object carries the organisation under Doctor; the degraded
    // JWT-only path (Auth.js, when the DB lookup fails) carries it flat. Read
    // both, or scoping silently falls open on the degraded path.
    const OrganizationId =
      (LogedUser.Doctor ? LogedUser.Doctor.OrganizationId : null) || LogedUser.OrganizationId || null;
    if (!OrganizationId) return;

    // Get child organization IDs
    const orgIds = [OrganizationId];
    const ChildOrganizations = await Models.Organization.findAll({
      where: { ParentOrganizationId: OrganizationId },
      attributes: ['Id'],
      raw: true,
    });
    if (ChildOrganizations && ChildOrganizations.length > 0) {
      ChildOrganizations.forEach((e) => orgIds.push(e.Id));
    }

    if (ObjectName === 'Organization') {
      Option.SearchField.push({
        Field: 'Id',
        Value: orgIds,
        Op: 'In',
      });
    } else if (ObjectName === 'DoctorsProfile') {
      Option.SearchField.push({
        Field: 'OrganizationId',
        Value: orgIds,
        Op: 'In',
      });
    } else if (ObjectName === 'Visit') {
      // Visit carries OrganizationId directly (stamped on create from
      // LogedUser.Doctor.OrganizationId), so no join is needed. Added for the
      // АМ-1Б register, which used to scope by Visit.id - the creating USER -
      // and so printed empty for anyone who had not typed the rows themselves.
      Option.SearchField.push({
        Field: 'OrganizationId',
        Value: orgIds,
        Op: 'In',
      });
    }
  };

  //base crud
  BaseCreate = async function ({ ObjectName, Data, LogedUser, SaveLog }) {
    // Stamp the owning patient so a row cannot be written for someone else.
    const PatientCreateGuard = PatientScope.ApplyPatientOwnership({ ObjectName, LogedUser, Data });
    if (!PatientCreateGuard.Allowed) {
      return null;
    }
    if (ObjectName === 'DoctorsProfile') {
      Data = await this.ensureUserForDoctor(Data, LogedUser);
    }

    const ModelConfig = await this.GetConfigData(ObjectName);
    if (!ModelConfig) {
      throw new Error(`Model configuration not found for ObjectName: ${ObjectName}`);
    }

    const PK = ModelConfig.PK;

    // Check if record already exists (Upsert support)
    let existingRecord = null;
    if (Data[PK]) {
      existingRecord = await ModelConfig.Model.findByPk(Data[PK], { raw: true });
    }

    if (!existingRecord) {
      // Username duplication validation for Users
      if (ObjectName === 'Users' && Data.UserName) {
        existingRecord = await Models.Users.findOne({
          where: { UserName: Data.UserName },
          raw: true,
        });
      } else if (ObjectName === 'DoctorsProfile') {
        const UserId = Data.id || Data.UserId;
        if (UserId) {
          existingRecord = await Models.DoctorsProfile.findOne({
            where: { UserId: UserId },
            raw: true,
          });
        }
      }
    }

    if (existingRecord) {
      // If record exists, perform update instead (Upsert)
      Data[PK] = existingRecord[PK];
      return await this.BaseUpdate({ ObjectName, Data, LogedUser, SaveLog });
    }

    var ModHelper = new ModelHelper(ModelConfig.Model);
    ModHelper.LogedUser = LogedUser;
    const CreatedId = await ModHelper.SaveRoot(ModelConfig, Data, true);
    if (SaveLog === true && CreatedId) {
      await this.CreateUserActionHistory({
        LinkObjectName: ObjectName,
        LinkObjectId: CreatedId,
        NotesMn: 'Шинээр бүртгэлээ',
        Notes: 'Create new record',
        Action: 'Create',
        LogedUser,
      });
    }
    return CreatedId;
  };

  BaseUpdate = async function ({ ObjectName, LogedUser, Data, SaveLog }) {
    const PatientUpdateGuard = PatientScope.ApplyPatientOwnership({ ObjectName, LogedUser, Data });
    if (!PatientUpdateGuard.Allowed) {
      return null;
    }
    if (ObjectName === 'DoctorsProfile') {
      Data = await this.ensureUserForDoctor(Data, LogedUser);
    }

    const ModelConfig = await this.GetConfigData(ObjectName);
    if (!ModelConfig) {
      throw new Error(`Model configuration not found for ObjectName: ${ObjectName}`);
    }

    // Username duplication validation for Users
    if ((ObjectName === 'Users' || ObjectName === 'DoctorsProfile') && Data.UserName) {
      const existingUser = await Models.Users.findOne({
        where: { UserName: Data.UserName },
        raw: true,
      });

      // If we're updating an existing user, allow the same username to be kept
      if (existingUser) {
        let currentUserId = null;
        if (ObjectName === 'Users') {
          currentUserId = Data.Id || Data.id;
        } else if (ObjectName === 'DoctorsProfile') {
          currentUserId = Data.UserId || Data.id;
        }

        // If this is an update operation (Id exists) and it's the same user, allow it
        if (currentUserId && existingUser.Id == currentUserId) {
          // Same user updating their info, proceed
        } else {
          // Updating to a different user's username
          const error = new Error('Username already exists');
          error.Message = 'Username already exists';
          throw error;
        }
      }
    }

    var ModHelper = new ModelHelper(ModelConfig.Model);
    ModHelper.LogedUser = LogedUser;
    const UpdateId = await ModHelper.SaveRoot(ModelConfig, Data, false);
    if (SaveLog === true && UpdateId) {
      await this.CreateUserActionHistory({
        LinkObjectName: ObjectName,
        LinkObjectId: UpdateId,
        NotesMn: 'Мэдээлэл заслаа',
        Notes: 'Update record',
        Action: 'Update',
        LogedUser,
      });
    }
    return UpdateId;
  };

  BaseGetList = async function ({ ObjectName, LogedUser, AppId, Option }) {
    const ModelConfig = await this.GetConfigData(ObjectName);
    if (!ModelConfig) {
      throw new Error(`Model configuration not found for ObjectName: ${ObjectName}`);
    }
    //set Filter AppId
    var ListFields = BaseHelper.GetFieldList(ModelConfig.Fields);
    if (ListFields.filter((s) => s.Name === 'AppId').length > 0) {
      if (Option.SearchField) {
        Option.SearchField.push({
          Field: 'AppId',
          Value: AppId,
          Op: 'Equals',
        });
      }
    }

    // Add organization filter for non-admin users
    await this.AddOrgFilter({ ObjectName, LogedUser, Option });

    if (Option.PatientScopeDenied) {
      return { Data: [], Option: { Total: 0, FooterData: [] } };
    }

    const ModHelper = new ModelHelper(ModelConfig.Model);
    ModHelper.LogedUser = LogedUser;
    let { Data, Total } = await ModHelper.FindAll(Option);
    Data = JSON.parse(JSON.stringify(Data));

    if (!Data || Data.length === 0) {
      this.LogNoDataReturned({
        ObjectName,
        endpoint: 'BaseGetList',
        filePath: __filename,
      });
    }

    return { Data, Option: { Total, FooterData: [] } };
  };

  BaseGetListInfo = async function ({ ObjectName, LogedUser, AppId, Option }) {
    try {
      const ModelConfig = await this.GetConfigData(ObjectName);
      if (!ModelConfig) {
        throw new Error(`Model configuration not found for ObjectName: ${ObjectName}`);
      }

      //set Filter AppId
      var ListFields = BaseHelper.GetFieldList(ModelConfig.Fields);
      if (ListFields.filter((s) => s.Name === 'AppId').length > 0) {
        if (Option.SearchField) {
          Option.SearchField.push({
            Field: 'AppId',
            Value: AppId,
            Op: 'Equals',
          });
        }
      }

      // Add organization filter for non-admin users
      await this.AddOrgFilter({ ObjectName, LogedUser, Option });

      if (Option.PatientScopeDenied) {
        return { Data: [], Option: { Total: 0, FooterData: [] } };
      }

      const ModHelper = new ModelHelper(ModelConfig.Model);
      ModHelper.LogedUser = LogedUser;
      const { Data, Total } = await ModHelper.FindAll(Option);
      for (var i = 0; i < Data.length; i++) {
        await ModHelper.GetInfoData(Data[i], ModelConfig);
      }

      if (!Data || Data.length === 0) {
        this.LogNoDataReturned({
          ObjectName,
          endpoint: 'BaseGetListInfo',
          filePath: __filename,
        });
      }

      return {
        Data: JSON.parse(JSON.stringify(Data)),
        Option: { Total, FooterData: [] },
      };
    } catch (ex) {
      console.log(ex);
      return { Data: [], Option: { Total: 0, FooterData: [] } };
    }
  };

  SetFieldValue = async function (EditObject, Fields) {
    for (var i = 0; i < Fields.length; i++) {
      for (var j = 0; j < Fields[i].length; j++) {
        var Field = Fields[i][j];
        if (
          (Field.Type == 'CheckBox' || Field.Type == 'MultipleSelect') &&
          Field.Multiple == true &&
          Field.OptionType
        ) {
          var Value = [];
          if (Array.isArray(EditObject.LookUpData) && EditObject.LookUpData.length > 0) {
            var values = EditObject.LookUpData.filter(
              (s) => s[Field.LookUpConfig.Field] == Field.Name
            );
            values.forEach((element) => {
              var Temp = Field.Data.filter(
                (l) =>
                  l[Field.Config.IdField] + '' === '' + element[Field.LookUpConfig.ChildValueField]
              );
              if (Temp.length == 1 && Value.indexOf(Temp[0][Field.Config.IdField]) === -1)
                Value.push(Temp[0][Field.Config.IdField] + '');
            });
          }
          EditObject[Field.Name] = Value;
        }

        if (
          (Field.Type == 'CheckBox' || Field.Type == 'MultipleSelect') &&
          Field.Multiple == true &&
          Field.ManyConfig
        ) {
          var Value = [];
          if (
            EditObject[Field.ManyConfig.Values] != undefined &&
            EditObject[Field.ManyConfig.Values] != null &&
            EditObject[Field.ManyConfig.Values].length > 0
          ) {
            var values = EditObject[Field.ManyConfig.Values];
            values.forEach((element) => {
              var Temp = Field.Data.filter(
                (l) => l[Field.Config.IdField] + '' === '' + element[Field.ManyConfig.ChildField]
              );
              if (Temp.length == 1 && Value.indexOf(Temp[0][Field.Config.IdField]) === -1) {
                Value.push(Temp[0][Field.Config.IdField] + '');
              }
            });
          }
          EditObject[Field.Name] = Value;
        }
      }
    }
    return EditObject;
  };

  BaseDetail = async function ({ ObjectName, LogedUser, AppId, Option }) {
    // Scoped by identity for patients. Unlike the list paths, this one never
    // consulted AddOrgFilter, so a patient could read any row by id.
    const PatientDetailGuard = PatientScope.ApplyPatientFilter({ ObjectName, LogedUser, Option });
    if (!PatientDetailGuard.Allowed) {
      return { Data: [], Option: { Total: 0, FooterData: [] } };
    }
    try {
      const ModelConfig = await this.GetConfigData(ObjectName);
      if (!ModelConfig) {
        throw new Error(`Model configuration not found for ObjectName: ${ObjectName}`);
      }
      //set Filter AppId
      const ListFields = BaseHelper.GetFieldList(ModelConfig.Fields);
      if (ListFields.filter((s) => s.Name === 'AppId').length > 0) {
        if (Option.SearchField) {
          Option.SearchField.push({
            Field: 'AppId',
            Value: AppId,
            Op: 'Equals',
          });
        }
      }
      var ModHelper = new ModelHelper(ModelConfig.Model);
      ModHelper.LogedUser = LogedUser;
      delete Option.limit;
      delete Option.offset;
      let { Data } = await ModHelper.FindDetail(Option);
      if (Data.length >= 1) {
        Data = ModHelper.GetNewObject(Data[0]);
        Data = await this.SetFieldValue(Data, ModelConfig.Fields);
        Data = await this.BaseSetFiles({ ConfigData: ModelConfig, Data });
        return { Data };
      } else {
        this.LogNoDataReturned({
          ObjectName,
          endpoint: 'BaseDetail',
          filePath: __filename,
        });
        return { Data: {} };
      }
    } catch (ex) {
      console.log(ex);
      return { Data: [], Option: { Total: 0, FooterData: [] } };
    }
  };

  BaseDetailInfo = async function ({ ObjectName, LogedUser, AppId, Option, SaveLog }) {
    const PatientDetailInfoGuard = PatientScope.ApplyPatientFilter({
      ObjectName,
      LogedUser,
      Option,
    });
    if (!PatientDetailInfoGuard.Allowed) {
      return { Data: [], Option: { Total: 0, FooterData: [] } };
    }
    try {
      const ModelConfig = await this.GetConfigData(ObjectName);
      if (!ModelConfig) {
        throw new Error(`Model configuration not found for ObjectName: ${ObjectName}`);
      }

      //set Filter AppId
      const ListFields = BaseHelper.GetFieldList(ModelConfig.Fields);
      if (ListFields.filter((s) => s.Name === 'AppId').length > 0) {
        if (Option.SearchField) {
          Option.SearchField.push({
            Field: 'AppId',
            Value: AppId,
            Op: 'Equals',
          });
        }
      }

      var ModHelper = new ModelHelper(ModelConfig.Model);
      ModHelper.LogedUser = LogedUser;
      delete Option.limit;
      delete Option.offset;
      var { Data } = await ModHelper.FindDetail(Option);
      if (Data.length >= 1) {
        Data = ModHelper.GetNewObject(Data[0]);
        Data = await this.SetFieldValue(Data, ModelConfig.Fields);
        Data = await this.BaseSetFiles({ ConfigData: ModelConfig, Data });
        await ModHelper.GetInfoData(Data, ModelConfig);
        return { Data };
      } else {
        this.LogNoDataReturned({
          ObjectName,
          endpoint: 'BaseDetailInfo',
          filePath: __filename,
        });
        return { Data: {} };
      }
    } catch (ex) {
      console.log(ex);
      return { Data: [], Option: { Total: 0, FooterData: [] } };
    }
  };

  BaseSetFiles = async function ({ ConfigData, Data, Thumbnail, Percentage }) {
    var Files = [];
    if (ConfigData.Model.GetFiles) {
      Files = await ConfigData.Model.GetFiles(Data[ConfigData.PK]);
      Files = JSON.parse(JSON.stringify(Files));
    }
    let FieldFiles = [];
    for (var i = 0; i < ConfigData.Fields.length; i++) {
      for (var j = 0; j < ConfigData.Fields[i].length; j++) {
        if (
          ConfigData.Fields[i][j].Type &&
          (ConfigData.Fields[i][j].Type === 'File' ||
            ConfigData.Fields[i][j].Type === 'SingleImage')
        ) {
          FieldFiles = Files.filter((s) => s.FieldName === ConfigData.Fields[i][j].Name);
          if (FieldFiles.length > 0) {
            if (Thumbnail) {
              FieldFiles = await this.GetFileSrcThumbnail(FieldFiles, Percentage);
            } else {
              FieldFiles = await this.GetFileSrc(FieldFiles);
            }
            Data[ConfigData.Fields[i][j].Name] = FieldFiles;
          } else {
            Data[ConfigData.Fields[i][j].Name] = [];
          }
        }
      }
    }

    return Data;
  };

  BaseDelete = async function ({ ObjectName, LogedUser, Option, SaveLog }) {
    // Option is passed straight to Model.destroy({ where: Option }), so an
    // unscoped patient delete would remove arbitrary rows from any model.
    if (PatientScope.IsPatient(LogedUser)) {
      const PatientDeleteScope = PatientScope.SCOPE_BY_OBJECT[ObjectName];
      const PatientDeleteOwner = PatientDeleteScope ? LogedUser[PatientDeleteScope.From] : null;
      if (
        !PatientDeleteScope ||
        PatientDeleteOwner === undefined ||
        PatientDeleteOwner === null ||
        PatientDeleteOwner === ''
      ) {
        return null;
      }
      Option = Object.assign({}, Option, { [PatientDeleteScope.Field]: PatientDeleteOwner });
    }
    try {
      const ModelConfig = await this.GetConfigData(ObjectName);
      if (!ModelConfig) {
        throw new Error(`Model configuration not found for ObjectName: ${ObjectName}`);
      }
      // Sequelize hands back the number of rows it actually removed. Return it
      // rather than a bare `true` so callers can tell "deleted" from "matched
      // nothing" - /BaseObject/destroy reported success for rows that never
      // existed because that distinction was thrown away here.
      const Removed = await ModelConfig.Model.destroy({ where: Option });
      if (Removed === 0) return 0;
      if (SaveLog === true) {
        await this.CreateUserActionHistory({
          LinkObjectName: ObjectName,
          LinkObjectId: null,
          NotesMn: 'Мэдээлэл устгалаа',
          Notes: 'Delete record',
          Action: 'Delete',
          LogedUser,
        });
      }
      return Removed;
    } catch (ex) {
      console.log(ex);
      return false;
    }
  };

  CreateUserActionHistory = async function ({
    LinkObjectName,
    LinkObjectId,
    Action,
    LogedUser,
    Notes,
    NotesMn,
  }) {
    if (LogedUser && Action && LinkObjectName) {
      const ModelConfig = await this.GetConfigData('UserActionHistory');
      var ModHelper = new ModelHelper(ModelConfig.Model);
      ModHelper.LogedUser = LogedUser;
      const DoctorId = LogedUser.Doctor ? LogedUser.Doctor.id_data : null;
      const Data = {
        LinkObjectName: LinkObjectName,
        LinkObjectId: LinkObjectId,
        LogDate: ObjectHelper.getDateYMDHMS(),
        Action: Action,
        UserId: LogedUser.Id,
        Notes: Notes,
        NotesMn: NotesMn,
        DoctorId: DoctorId,
      };
      await ModHelper.SaveRoot(ModelConfig, Data, true);
    }
  };

  // Security: Validate and sanitize file paths to prevent path traversal attacks
  ValidateFilePath = function (fileName) {
    if (!fileName || typeof fileName !== 'string') {
      throw new Error('Invalid file name');
    }

    // Check for path traversal attempts
    if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
      throw new Error('Invalid file name: path traversal detected');
    }

    // Ensure the resolved path is within ALLFILE_DIR
    const resolvedPath = path.resolve(process.env.ALLFILE_DIR, fileName);
    const baseDir = path.resolve(process.env.ALLFILE_DIR);

    if (!resolvedPath.startsWith(baseDir)) {
      throw new Error('Invalid file path: outside allowed directory');
    }

    return resolvedPath;
  };

  GetFileSrc = async function (Files) {
    var ResultFiles = [];
    for (var i = 0; i < Files.length; i++) {
      var File = {};
      const imageExt = mime.contentType(Files[i].ext);
      if (imageExt && imageExt.toLowerCase().indexOf('image') > -1) {
        try {
          // Validate file path for security
          const validatedPath = this.ValidateFilePath(Files[i].generated_name);

          if (fs.existsSync(validatedPath)) {
            var pathStat = fs.statSync(validatedPath);
            var thumbnail = '';
            if (pathStat.isDirectory() === true) {
              thumbnail = await ImageHelper.encodeBase64(
                path.join(validatedPath, 'file'),
                Files[i].ext
              );
            } else {
              thumbnail = await ImageHelper.encodeBase64(validatedPath, Files[i].ext);
            }
            File.FileSrc = thumbnail;
            File.Type = 'image/' + Files[i].ext;
          }
        } catch (ex) {
          console.log('GetFileSrc error:', ex.message);
          File.FileSrc = '';
          File.Type = '';
        }
      } else {
        File.Type = '';
      }
      File.FileInfo = { ...Files[i], Name: Files[i].original_name };
      ResultFiles.push(File);
    }
    return ResultFiles;
  };

  /**
   * GetFileSrcThumbnail, but the resized bytes are cached on disk.
   *
   * The uncached version runs `sharp` for every image on every request. A feed
   * page of 20 cards with avatars and photos is ~80 decode+resize operations at
   * roughly 30-40ms each - 2.5-3s of CPU for a single reader, before any
   * concurrency. That alone misses the 3-second acceptance criterion, and no
   * amount of SQL tuning helps, because the cost is not in the database.
   *
   * The cache is a sibling file in ALLFILE_DIR named
   * `<generated_name>_t<percentage>.b64` holding the finished data: URI.
   * Filesystem only: no schema, no DDL, no customer request. `generated_name`
   * is immutable for the life of an upload, so a cached thumbnail can never go
   * stale - there is no invalidation to get wrong.
   *
   * Any cache failure falls through to a normal resize; this can slow a request
   * down but can never break one.
   */
  GetFileSrcThumbnailCached = async function (Files, Percentage) {
    const Pct = Percentage || 100;
    const Result = [];

    for (var i = 0; i < Files.length; i++) {
      const Src = Files[i];
      const CacheName = Src.generated_name + '_t' + Pct + '.b64';
      let CachePath = null;

      try {
        CachePath = path.resolve(process.env.ALLFILE_DIR, CacheName);
        if (fs.existsSync(CachePath)) {
          Result.push({
            FileSrc: fs.readFileSync(CachePath, 'utf8'),
            Type: 'image/' + Src.ext,
            FileInfo: { ...Src, Name: Src.original_name },
          });
          continue;
        }
      } catch (ex) {
        console.log('GetFileSrcThumbnailCached read error:', ex.message);
        CachePath = null;
      }

      // Miss: do the real work once, then write the result beside the original.
      const [Built] = await this.GetFileSrcThumbnail([Src], Pct);
      if (Built && Built.FileSrc && CachePath) {
        try {
          fs.writeFileSync(CachePath, Built.FileSrc, 'utf8');
        } catch (ex) {
          console.log('GetFileSrcThumbnailCached write error:', ex.message);
        }
      }
      Result.push(Built);
    }

    return Result;
  };

  GetFileSrcThumbnail = async function (Files, Percentage) {
    var ResultFiles = [];
    for (var i = 0; i < Files.length; i++) {
      var File = {};
      const imageExt = mime.contentType(Files[i].ext);
      if (imageExt && imageExt.toLowerCase().indexOf('image') > -1) {
        try {
          // Validate file path for security
          const validatedPath = this.ValidateFilePath(Files[i].generated_name);

          if (fs.existsSync(validatedPath)) {
            var pathStat = fs.statSync(validatedPath);
            var thumbnail = '';
            if (pathStat.isDirectory() === true) {
              thumbnail = await ImageHelper.thumbnailBase64Sync(
                path.join(validatedPath, 'file'),
                Files[i].ext,
                Percentage
              );
            } else {
              thumbnail = await ImageHelper.thumbnailBase64Sync(
                validatedPath,
                Files[i].ext,
                Percentage
              );
            }
            File.FileSrc = thumbnail;
            File.Type = 'image/' + Files[i].ext;
          }
        } catch (ex) {
          console.log('GetFileSrcThumbnail error:', ex.message);
          File.Type = '';
        }
      } else {
        File.Type = '';
      }
      File.FileInfo = { ...Files[i], Name: Files[i].original_name };
      ResultFiles.push(File);
    }
    return ResultFiles;
  };

  BaseDownloadFile = async function (FileInfo) {
    try {
      if (FileInfo && FileInfo.generated_name && FileInfo.ext) {
        // Validate file path for security
        const validatedPath = this.ValidateFilePath(FileInfo.generated_name);

        if (fs.existsSync(validatedPath)) {
          var filePath = '';
          const pathStat = fs.statSync(validatedPath);
          if (pathStat.isDirectory() === true) {
            filePath = path.join(validatedPath, 'file');
          } else {
            filePath = validatedPath;
          }

          if (fs.existsSync(filePath)) {
            var ContentType = mime.contentType(FileInfo.ext);
            if (ContentType) {
              return { Path: filePath, ContentType: ContentType };
            } else {
              console.log('BaseDownloadFile: Invalid content type for extension:', FileInfo.ext);
              return null;
            }
          } else {
            console.log('BaseDownloadFile: File not found:', filePath);
            return null;
          }
        } else {
          console.log('BaseDownloadFile: Validated path does not exist:', validatedPath);
          return null;
        }
      } else {
        console.log('BaseDownloadFile: Invalid FileInfo provided');
        return null;
      }
    } catch (ex) {
      console.log('BaseDownloadFile error:', ex.message);
      return null;
    }
  };

  /**
   * Everything an export needs, independent of the file format: the rows, the
   * column headers and the provenance block.
   *
   * Shared by the .xlsx and .txt exports so the two can never disagree about
   * what was exported — the upgrade tender asks for both formats (§103) and
   * requires each to carry source marking.
   *
   * Returns null when the caller is not allowed to export this object at all.
   */
  BuildExport = async function ({ ObjectName, LogedUser, Option }) {
    // Otherwise export becomes a bulk extraction route around the read guards.
    const Guard = PatientScope.ApplyPatientFilter({ ObjectName, LogedUser, Option });
    if (!Guard.Allowed) return null;

    const ModelConfig = await this.GetConfigData(ObjectName);
    if (!ModelConfig) {
      throw new Error(`Model configuration not found for ObjectName: ${ObjectName}`);
    }

    //set Filter AppId
    const ListFields = BaseHelper.GetFieldList(ModelConfig.Fields);
    if (ListFields.filter((s) => s.Name === 'AppId').length > 0) {
      if (Option.SearchField) {
        Option.SearchField.push({
          Field: 'AppId',
          Value: LogedUser.AppId,
          Op: 'Equals',
        });
      }
    }

    const ModHelper = new ModelHelper(ModelConfig.Model);
    ModHelper.LogedUser = LogedUser;

    // The caller passes limit: 0 meaning "everything". Sequelize treats 0 as
    // falsy and emits no FETCH clause at all, so the query really was
    // unbounded: exporting Visit (~450,000 rows) allocated 2.3 GB and PM2
    // killed the process. Ask for one row more than the cap, so an overflow is
    // detectable without a second COUNT query.
    Option.offset = 0;
    Option.limit = EXPORT_ROW_CAP + 1;

    let { Data } = await ModHelper.FindAll(Option);
    if (Data.length > EXPORT_ROW_CAP) {
      throw {
        ExportTooLarge: true,
        Message:
          'Экспортлох мөрийн тоо хэтэрсэн байна (дээд хязгаар ' +
          EXPORT_ROW_CAP.toLocaleString('en-US') +
          ' мөр). Хайлт, шүүлтээ нарийсгаад дахин оролдоно уу.',
      };
    }

    for (var i = 0; i < Data.length; i++) {
      await ModHelper.GetInfoData(Data[i], ModelConfig);
    }
    Data = JSON.parse(JSON.stringify(Data));

    const columns = ListFields.filter(
      (s) => s.Name && (!s.GridField || s.GridField === true) && s.GridField !== false
    );

    const rows =
      Array.isArray(Data) && columns.length > 0
        ? Data.map((data) =>
            columns.map((value) =>
              ObjectHelper.getStrData(ObjectHelper.getValue(data, value.Name), value)
            )
          )
        : [];

    // An exported file leaves the system and has to stand on its own, so it
    // says which organisation and which database the rows came from, when it
    // was taken, and by whom.
    const ExportedBy =
      (LogedUser && (LogedUser.FullName || (LogedUser.Doctor && LogedUser.Doctor.FullName))) ||
      (LogedUser && LogedUser.UserName) ||
      '';
    const OrgName =
      (LogedUser && LogedUser.Doctor && LogedUser.Doctor.Organization
        ? LogedUser.Doctor.Organization.Name
        : null) || '';
    const ExportTitle = (ModelConfig.TitleObject && ModelConfig.TitleObject.Title) || ObjectName;

    const provenance = [
      'Байгууллага: ' + OrgName,
      'Мэдээллийн сан: ' + (process.env.SQL_DB || ''),
      'Бүртгэл: ' + this.translateLabel(ExportTitle),
      'Гаргасан огноо: ' + new Date().toISOString().slice(0, 19) + 'Z (UTC)',
      'Гаргасан хэрэглэгч: ' + ExportedBy,
    ];

    return {
      columns,
      headers: columns.map((value) => this.translateLabel(value.Label)),
      rows,
      provenance,
      // ObjectName is client-supplied and ends up in a path.
      safeName: String(ObjectName).replace(/[^A-Za-z0-9_-]/g, ''),
    };
  };

  /**
   * One file per request. The name used to be just the ObjectName, so two
   * people exporting the same registry at the same time wrote to the same path
   * and whoever downloaded second could receive the other one's rows - across
   * organisations. The browser names the saved file itself, so the name on disk
   * is not user-visible.
   */
  ExportFilePath = function (safeName, ext) {
    return (
      'outputExcel/' +
      safeName +
      '_' +
      Date.now() +
      '_' +
      Math.random().toString(36).slice(2, 8) +
      '.' +
      ext
    );
  };

  ExportExcel = async function ({ ObjectName, LogedUser, Option }) {
    try {
      const Export = await this.BuildExport({ ObjectName, LogedUser, Option });
      if (!Export) return { filePath: null };

      const { headers, rows, provenance } = Export;
      const filePath = this.ExportFilePath(Export.safeName, 'xlsx');

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(ObjectName);

      // Each provenance line is a single cell in column A so it spills over the
      // empty cells beside it and cannot widen the data columns below.
      provenance.forEach((line) => worksheet.addRow([line]));
      worksheet.addRow([]);
      for (let r = 1; r <= provenance.length; r++) {
        worksheet.getRow(r).font = { italic: true, size: 9 };
      }

      const HeaderRow = worksheet.addRow(headers);
      HeaderRow.font = { bold: true };
      // Keep the provenance block and the header visible while scrolling.
      worksheet.views = [{ state: 'frozen', ySplit: HeaderRow.number }];

      rows.forEach((row) => worksheet.addRow(row));

      const columnWidths = this.fitToColumn([headers, ...rows]);
      worksheet.columns = worksheet.columns.map((col, i) => ({
        ...col,
        // The provenance block can leave a column with no width entry when a
        // form exports fewer columns than the block is wide.
        width: columnWidths[i] ? columnWidths[i].wch : 20,
      }));

      await workbook.xlsx.writeFile(path.resolve(filePath));
      return { filePath };
    } catch (ex) {
      console.log(ex);
      // A row-cap refusal carries a message the user can act on; anything else
      // stays opaque as before.
      return { filePath: null, Message: ex && ex.ExportTooLarge ? ex.Message : null };
    }
  };

  /**
   * The same export as a tab-separated text file, which the upgrade tender asks
   * for alongside .xlsx (§103).
   *
   * Tabs rather than commas because the clinical labels are full sentences
   * containing commas, and UTF-8 with a BOM because that is what makes Excel on
   * Windows open Cyrillic correctly instead of as mojibake.
   */
  ExportText = async function ({ ObjectName, LogedUser, Option }) {
    try {
      const Export = await this.BuildExport({ ObjectName, LogedUser, Option });
      if (!Export) return { filePath: null };

      const { headers, rows, provenance } = Export;
      const filePath = this.ExportFilePath(Export.safeName, 'txt');

      // A tab or newline inside a value would break the column alignment.
      const cell = (v) =>
        (v === undefined || v === null ? '' : v + '').replace(/[\t\r\n]+/g, ' ');

      const lines = []
        .concat(provenance.map((p) => '# ' + p))
        .concat(['', headers.map(cell).join('\t')])
        .concat(rows.map((row) => row.map(cell).join('\t')));

      fs.writeFileSync(path.resolve(filePath), '﻿' + lines.join('\r\n'), 'utf8');
      return { filePath };
    } catch (ex) {
      console.log(ex);
      return { filePath: null, Message: ex && ex.ExportTooLarge ? ex.Message : null };
    }
  };


  fitToColumn = function (workSheetData) {
    // get maximum character of each column
    return workSheetData[0].map((a, i) => ({
      wch: Math.max(...workSheetData.map((a2) => a2[i] && a2[i].toString().length)),
    }));
  };
}

module.exports = new BaseControllerHelper();
