const { Models } = require('../config/DB');
const Model = Models.DrgroupBranches;

function DrgroupBranchesConfig() {
  this.Fields = [
    [
      { Name: 'name', Label: 'Name', Type: 'Text', md: 4, Position: 0 },
      {
        Name: 'date_creation',
        Label: 'Date de cr',
        Type: 'Date',
        md: 4,
        Position: 1,
        GridField: false,
        EditField: false,
      },
      {
        Name: 'date_modif',
        Label: 'Date de modification',
        Type: 'Date',
        md: 4,
        Position: 2,
        GridField: false,
        EditField: false,
      },
      {
        Name: 'DrgroupHospitals.name',
        Label: 'Hospital',
        Type: 'Text',
        EditField: false,
      },
      {
        Name: 'hospital_id',
        Label: 'Hospital ID',
        Type: 'SingleSelect',
        Config: {
          Model: Models.DrgroupHospitals,
          IdField: 'id_data',
          TextField: 'name',
        },
        md: 4,
        Position: 3,
        GridField: false,
      },
      {
        Name: 'id',
        Label: "Identifiant d'utilisateur",
        Type: 'Text',
        md: 4,
        Position: 4,
        GridField: false,
        EditField: false,
      },
      {
        Name: 'id_data',
        Label: 'Identifiant de la fiche',
        Type: 'Text',
        md: 4,
        GridField: false,
        EditField: false,
        Position: 5,
        GridField: false,
        EditField: false,
      },
      {
        Name: 'id_group',
        Label: 'Groupe',
        Type: 'Text',
        md: 4,
        Position: 6,
        GridField: false,
        EditField: false,
      },
      {
        Name: 'rec_status',
        Label: 'Status',
        Type: 'SingleSelect',
        Config: { IdField: 'Value', TextField: 'Label' },
        md: 4,
        OptionType: 'rec_status',
        Position: 10,
      },
      {
        Name: 'user_mod',
        Label: 'Auteur de la derni',
        Type: 'Text',
        md: 4,
        Position: 12,
        GridField: false,
        EditField: false,
      },
    ],
    [
      {
        Name: 'DrgroupDepartments',
        Label: 'Тасаг',
        Type: 'ListView',
        Config: {
          ObjectName: 'DrgroupDepartments',
          Fields: ['dico', 'value'],
          ForiegnKey: 'branch_id',
        },
        md: 12,
        Position: 1,
        GridField: false,
        EditField: true,
      },
    ],
  ];

  this.ObjectName = 'DrgroupBranches';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'id_data';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Doctors group branch',
    NewObjectTitle: 'Doctors group branch create',
    EditObjectTitle: 'Doctors group branch edit',
  };
}

module.exports = DrgroupBranchesConfig;
