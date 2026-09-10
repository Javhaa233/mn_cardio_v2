const { Models } = require('../../config/DB');
const Model = Models.CVDHunAm;

function CVDHunAmConfig() {
  this.Fields = [
    [
      { Name: 'Id', Label: 'Id', Type: 'Text' },
      {
        Name: 'Type',
        Label: 'Бүртгэлийн төрөл',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: 'Сумын эмнэлэг', Value: 'soum' },
          { Label: 'Баг/Хорооны эмнэлэг', Value: 'bag_khoroo' },
        ],
      },
      {
        Name: 'Year',
        Label: 'Он',
        Type: 'SingleSelect',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: '2018', Value: '2018' },
          { Label: '2019', Value: '2019' },
          { Label: '2020', Value: '2020' },
          { Label: '2021', Value: '2021' },
          { Label: '2022', Value: '2022' },
          { Label: '2023', Value: '2023' },
          { Label: '2024', Value: '2024' },
          { Label: '2025', Value: '2025' },
        ],
      },
      { Name: 'Age0to17', Label: '0-17 нас', Type: 'Number' },
      { Name: 'Age18to39', Label: '18-39 нас', Type: 'Number' },
      { Name: '40-с дээш нас', Label: 'Age40up', Type: 'Number' },
      { Name: 'Type', Label: 'Төрөл', Type: 'Number' },
      {
        Name: 'ProvinceCityId',
        Label: 'Province/city',
        Type: 'SingleSelect',
        Config: {
          Model: Models.DictProvinceCity,
          IdField: 'id_data',
          TextField: 'name',
          MinTextLength: 1,
        },
      },
      {
        Name: 'SoumDistrictId',
        Label: 'Soum/district',
        Type: 'SingleSelect',
        md: 4,
        Config: {
          SearchType: 'AllData',
          Model: Models.DictSoumDistrict,
          ObjectName: 'DictSoumDistrict',
          IdField: 'id_data',
          TextField: 'name',
          MinTextLength: 0,
          Fields: [
            { Name: 'id_data', Label: 'Id' },
            { Name: 'name', Label: 'Name' },
            { Name: 'DictProvinceCity.name', Label: 'City' },
          ],
        },
      },
      {
        Name: 'BagKhorooId',
        Label: 'Bag/khoroo',
        Type: 'SingleSelectLoad',
        Config: {
          ObjectName: 'DictBagKhoroo',
          IdField: 'id_data',
          TextField: 'name',
          MinTextLength: 0,
          Fields: [
            { Name: 'id_data', Label: 'Id' },
            { Name: 'name', Label: 'Name' },
          ],
        },
      },
      { Name: 'OrganizationId', Label: 'Байгууллага', Type: 'Text' },
      { Name: 'CreateDate', Label: 'CreateDate', Type: 'Date' },
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
      { Name: 'UpdateDate', Label: 'UpdateDate', Type: 'Date' },
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

  this.ObjectName = 'CVDHunAm';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'Id';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Cardiovascular hun am',
    NewObjectTitle: 'Cardiovascular hun am create',
    EditObjectTitle: 'Cardiovascular hun am edit',
  };
}

module.exports = CVDHunAmConfig;
