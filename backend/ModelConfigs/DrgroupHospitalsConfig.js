const { Models } = require('../config/DB');
const Model = Models.DrgroupHospitals;

function DrgroupHospitalsConfig() {
  this.Fields = [
    [
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
        Name: 'DictSoumDistrict.name',
        Label: 'duureg/sum',
        Type: 'Text',
        EditField: false,
        Position: 2,
      },
      {
        Name: 'dsid',
        Label: 'duureg/sum id',
        Type: 'SingleSelect',
        Config: {
          Model: Models.DictSoumDistrict,
          IdField: 'id_data',
          TextField: 'name',
        },
        md: 4,
        Position: 3,
        GridField: false,
      },
      {
        Name: 'DictProvinceCity.name',
        Label: 'hot/aimag',
        Type: 'Text',
        EditField: false,
        Position: 0,
      },
      {
        Name: 'haid',
        Label: 'hot/aimag id',
        Type: 'SingleSelect',
        md: 4,
        Position: 0,
        Config: {
          Model: Models.DictProvinceCity,
          IdField: 'id_data',
          TextField: 'name',
        },
        GridField: false,
      },
      {
        Name: 'id',
        Label: "Identifiant d'utilisateur",
        Type: 'Text',
        md: 4,
        Position: 5,
        GridField: false,
        EditField: false,
      },
      {
        Name: 'id_data',
        Label: 'Identifiant de la fiche',
        Type: 'Text',
        md: 4,
        Position: 6,
        GridField: false,
        EditField: false,
      },
      {
        Name: 'id_group',
        Label: 'Groupe',
        Type: 'Text',
        md: 4,
        Position: 7,
        GridField: false,
        EditField: false,
      },
      {
        Name: 'DictBagKhoroo.name',
        Label: 'khoroo/bag id',
        Type: 'Text',
        EditField: false,
      },
      {
        Name: 'khbid',
        Label: 'khoroo/bag id',
        Type: 'SingleSelectLoad',
        md: 4,
        Position: 9,
        Config: {
          ObjectName: 'DictBagKhoroo',
          IdField: 'id_data',
          TextField: 'name',
          MinTextLength: 0,
        },
        GridField: false,
      },
      {
        Name: 'level',
        Label: 'Level',
        Type: 'SingleSelect',
        Config: { IdField: 'Value', TextField: 'Label' },
        md: 4,
        OptionType: 'hospital_level',
        Position: 10,
      },
      { Name: 'name', Label: 'Name', Type: 'Text', md: 4, Position: 12 },
      {
        Name: 'province',
        Label: 'Province',
        Type: 'SingleSelect',
        Config: { IdField: 'Value', TextField: 'Label' },
        md: 4,
        OptionType: 'aimag',
        Position: 13,
      },
      {
        Name: 'rec_status',
        Label: 'Status',
        Type: 'SingleSelect',
        Config: { IdField: 'Value', TextField: 'Label' },
        md: 4,
        OptionType: 'rec_status',
        Position: 14,
      },
      {
        Name: 'user_mod',
        Label: 'Auteur de la derni',
        Type: 'Text',
        md: 4,
        Position: 16,
        GridField: false,
        EditField: false,
      },
    ],
    [
      {
        Name: 'DrgroupBranches',
        Label: 'Салбар',
        Type: 'ListView',
        Config: {
          ObjectName: 'DrgroupBranches',
          Fields: ['dico', 'value'],
          ForiegnKey: 'hospital_id',
        },
        md: 12,
        Position: 1,
        GridField: false,
        EditField: true,
      },
    ],
  ];

  this.ObjectName = 'DrgroupHospitals';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'id_data';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Doctors group hospital',
    NewObjectTitle: 'Doctors group hospital create',
    EditObjectTitle: 'Doctors group hospital edit',
  };
}

module.exports = DrgroupHospitalsConfig;
