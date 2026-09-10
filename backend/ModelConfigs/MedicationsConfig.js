const { Models } = require('../config/DB');
const Model = Models.Medications;

function MedicationsConfig() {
  this.Fields = [
    [
      {
        Name: 'Id',
        Label: 'Id',
        Type: 'Text',
        md: 4,
        Position: 1,
        GridField: false,
        EditField: false,
      },
      {
        Name: 'Name',
        Label: 'Name',
        Type: 'Text',
        md: 12,
        Position: 2,
        GridField: true,
        EditField: true,
      },
      {
        Name: 'Description',
        Label: 'Description',
        Type: 'TextArea',
        md: 12,
        Position: 3,
        GridField: true,
        EditField: true,
      },
      {
        Name: 'CreateUserId',
        Label: 'Created user',
        Type: 'SingleSelectLoad',
        Config: { ObjectName: 'Users', IdField: 'Id', TextField: 'UserName' },
        md: 4,
        Position: 4,
        GridField: true,
        EditField: false,
      },
      {
        Name: 'CreatedDate',
        Label: 'Create date',
        Type: 'Date',
        md: 4,
        Position: 5,
        GridField: true,
        EditField: false,
      },
    ],
  ];

  this.ObjectName = 'Medications';
  this.Model = Model;
  this.PK = 'Id';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Medications',
    NewObjectTitle: 'Medications create',
    EditObjectTitle: 'Medications edit',
  };
}

module.exports = MedicationsConfig;
