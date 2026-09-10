const { Models } = require('../config/DB');
const Model = Models.PatientTooProcedure;

function PatientTooProcedureConfig() {
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
        Name: 'PatientId',
        Label: 'Patient ID',
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

  this.ObjectName = 'PatientTooProcedure';
  this.Model = Model;
  this.PK = 'id';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'PatientTooProcedure',
    NewObjectTitle: 'PatientTooProcedure create',
    EditObjectTitle: 'PatientTooProcedure edit',
  };
}

module.exports = PatientTooProcedureConfig;
