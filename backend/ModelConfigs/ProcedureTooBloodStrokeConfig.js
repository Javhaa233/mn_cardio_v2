const { Models } = require('../config/DB');
const Model = Models.ProcedureTooBloodStroke;

function ProcedureTooBloodStrokeConfig() {
  this.Fields = [
    [
      //   {
      //     Name: "id",
      //     Label: "id",
      //     Type: "Text",
      //     md: 4,
      //     Position: 1
      //   },
      {
        Name: 'ProcedureId',
        Label: 'ProcedureId',
        Type: 'Text',
        md: 4,
        Position: 1,
      },
      {
        Name: 'BloodStrokeId',
        Label: 'BloodStrokeId',
        Type: 'Text',
        md: 4,
        Position: 1,
      },
      {
        Name: 'ChildRecStatus',
        Label: 'ChildRecStatus',
        Type: 'Text',
        md: 4,
        Position: 1,
      },
    ],
  ];

  this.ObjectName = 'ProcedureTooBloodStroke';
  this.Model = Model;
  this.PK = 'id';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'ProcedureTooBloodStroke',
    NewObjectTitle: 'ProcedureTooBloodStroke create',
    EditObjectTitle: 'ProcedureTooBloodStroke edit',
  };
}

module.exports = ProcedureTooBloodStrokeConfig;
