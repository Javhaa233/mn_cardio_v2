const { Models } = require('../../config/DB');
const Model = Models.CVDDrugBalance;

function CVDDrugBalanceConfig() {
  this.Fields = [
    [
      { Name: 'Id', Label: 'Id', Type: 'Text' },
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
      {
        Name: 'Month',
        Label: 'Сар',
        Type: 'SingleSelect',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: '1', Value: '1' },
          { Label: '2', Value: '2' },
          { Label: '3', Value: '3' },
          { Label: '4', Value: '4' },
          { Label: '5', Value: '5' },
          { Label: '6', Value: '6' },
          { Label: '7', Value: '7' },
          { Label: '8', Value: '8' },
          { Label: '9', Value: '9' },
          { Label: '10', Value: '10' },
          { Label: '11', Value: '11' },
          { Label: '12', Value: '12' },
        ],
      },
      {
        Name: 'Em1',
        Label: 'Аспирин',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: 'Хангалттай', Value: 'h' },
          { Label: 'Дууссан', Value: 'd' },
        ],
      },
      {
        Name: 'Em2',
        Label: 'АХФХ',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: 'Хангалттай', Value: 'h' },
          { Label: 'Дууссан', Value: 'd' },
        ],
      },
      {
        Name: 'Em3',
        Label: 'бета блокатор',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: 'Хангалттай', Value: 'h' },
          { Label: 'Дууссан', Value: 'd' },
        ],
      },
      {
        Name: 'Em4',
        Label: 'кальцийн суваг хориглогч',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: 'Хангалттай', Value: 'h' },
          { Label: 'Дууссан', Value: 'd' },
        ],
      },
      {
        Name: 'Em5',
        Label: 'статин',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: 'Хангалттай', Value: 'h' },
          { Label: 'Дууссан', Value: 'd' },
        ],
      },
      {
        Name: 'Em6',
        Label: 'тиазид',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: 'Хангалттай', Value: 'h' },
          { Label: 'Дууссан', Value: 'd' },
        ],
      },
      {
        Name: 'Em7',
        Label: 'Метформин',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: 'Хангалттай', Value: 'h' },
          { Label: 'Дууссан', Value: 'd' },
        ],
      },
      {
        Name: 'Em8',
        Label: 'Сульфонилури',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: 'Хангалттай', Value: 'h' },
          { Label: 'Дууссан', Value: 'd' },
        ],
      },
      {
        Name: 'Em9',
        Label: 'Инсулин (тариагаар)',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: 'Хангалттай', Value: 'h' },
          { Label: 'Дууссан', Value: 'd' },
        ],
      },
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

  this.ObjectName = 'CVDDrugBalance';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'Id';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Cardiovascular disease drug',
    NewObjectTitle: 'Cardiovascular disease drug',
    EditObjectTitle: 'Cardiovascular disease drug',
  };
}

module.exports = CVDDrugBalanceConfig;
