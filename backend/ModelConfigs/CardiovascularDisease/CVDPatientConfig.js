const { Models } = require('../../config/DB');
const Model = Models.CVDPatient;

function CVDPatientConfig() {
  this.Fields = [
    [
      { Name: 'Id', Label: 'Id', Type: 'Text' },
      {
        Name: 'RegNo',
        Label: 'Personal number',
        Type: 'GridLookUpSingleLoad',
        Config: {
          ObjectName: 'Patient',
          IdField: 'id_data',
          TextField: 'p_registration',
          Fields: [
            // { Name: "id_data", Label: "Id" },
            { Name: 'p_lastname', Label: 'Last name' },
            { Name: 'p_firstname', Label: 'first name' },
            { Name: 'p_registration', Label: 'Register' },
            { Name: 'DictProvinceCity.name', Label: 'City' },
          ],
          MinTextLength: '2',
        },
      },
      { Name: 'FirstName', Label: 'First name', Type: 'Text' },
      { Name: 'LastName', Label: 'Last name', Type: 'Text' },
      {
        Name: 'Gender',
        Label: 'Gender',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'sexe',
      },
      { Name: 'PhoneNumber', Label: 'Phone number', Type: 'Text' },
      { Name: 'PhoneNumber2', Label: 'Family phone number', Type: 'Text' },
      {
        Name: 'Workplace',
        Label: 'Ажил эрхлэлтийн байдал',
        Type: 'SingleSelect',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: 'Ажилтай', Value: '1' },
          { Label: 'Ажилгүй', Value: '2' },
          { Label: 'Тэтгэвэрт', Value: '3' },
          { Label: 'Групп', Value: '4' },
          { Label: 'Оюутан', Value: '5' },
          { Label: 'Малчин', Value: '6' },
          { Label: 'Хувийн хэвшил', Value: '7' },
        ],
      },
      { Name: 'Address', Label: 'Living address', Type: 'Text' },
      { Name: 'TempAddress', Label: 'Temporary address', Type: 'Text' },

      { Name: 'CreateDate', Label: 'Created Date', Type: 'Date' },
      {
        Name: 'CreateUserId',
        Label: 'Create user',
        Type: 'SingelSelect',
        Config: {
          Model: Models.Users,
          IdField: 'Id',
          TextField: 'UserName',
          MinTextLength: 0,
        },
      },
      { Name: 'UpdateDate', Label: 'Update Date', Type: 'Date' },
      {
        Name: 'UpdateUserId',
        Label: 'Update user',
        Type: 'SingelSelect',
        Config: {
          Model: Models.Users,
          IdField: 'Id',
          TextField: 'UserName',
          MinTextLength: 0,
        },
      },
    ],
  ];

  this.ObjectName = 'CVDPatient';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'Id';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Cardiovascular disease patient',
    NewObjectTitle: 'Cardiovascular disease patient',
    EditObjectTitle: 'Cardiovascular disease patient',
  };
}

module.exports = CVDPatientConfig;
