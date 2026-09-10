const { Models } = require('../config/DB');
const Model = Models.MedicineDosage;

function MedicineDosageConfig() {
  this.Fields = [
    [
      {
        Name: 'date_creation',
        Label: 'Date de cr',
        Type: 'Date',
        md: 4,
        Position: 1,
      },
      {
        Name: 'date_modif',
        Label: 'Date de modification',
        Type: 'Date',
        md: 4,
        Position: 2,
      },
      {
        Name: 'description',
        Label: 'Description',
        Type: 'Text',
        md: 4,
        Position: 3,
      },
      { Name: 'form_id', Label: 'Form ID', Type: 'Text', md: 4, Position: 4 },
      {
        Name: 'id',
        Label: "Identifiant d'utilisateur",
        Type: 'Text',
        md: 4,
        Position: 5,
      },
      {
        Name: 'id_data',
        Label: 'Identifiant de la fiche',
        Type: 'Text',
        md: 4,
        Position: 6,
      },
      { Name: 'id_group', Label: 'Groupe', Type: 'Text', md: 4, Position: 7 },
      { Name: 'package', Label: 'Package', Type: 'Text', md: 4, Position: 10 },
      {
        Name: 'rec_status',
        Label: 'Status',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        md: 4,
        OptionType: 'rec_status',
        Position: 11,
      },
      {
        Name: 'unit',
        Label: 'Unit',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        md: 4,
        OptionType: 'unit_dosage',
        Position: 13,
      },
      {
        Name: 'user_mod',
        Label: 'Auteur de la derni',
        Type: 'Text',
        md: 4,
        Position: 14,
      },
      { Name: 'value', Label: 'Value', Type: 'Text', md: 4, Position: 15 },
    ],
  ];

  this.ObjectName = 'MedicineDosage';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'id_data';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Medicine dosage',
    NewObjectTitle: 'Medicine dosage create',
    EditObjectTitle: 'Medicine dosage edit',
  };
}

module.exports = MedicineDosageConfig;
