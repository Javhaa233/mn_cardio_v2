const { Models } = require('../config/DB');
const Model = Models.Substance;

function SubstanceConfig() {
  this.Fields = [
    [
      {
        Name: 'daily_max_value',
        Label: 'Daily max value',
        Type: 'Text',
        md: 4,
        Position: 1,
      },
      {
        Name: 'date_creation',
        Label: 'Date de cr',
        Type: 'Date',
        md: 4,
        Position: 2,
      },
      {
        Name: 'date_modif',
        Label: 'Date de modification',
        Type: 'Date',
        md: 4,
        Position: 3,
      },
      {
        Name: 'id',
        Label: "Identifiant d'utilisateur",
        Type: 'Text',
        md: 4,
        Position: 4,
      },
      {
        Name: 'id_data',
        Label: 'Identifiant de la fiche',
        Type: 'Text',
        md: 4,
        Position: 5,
      },
      { Name: 'id_group', Label: 'Groupe', Type: 'Text', md: 4, Position: 6 },
      { Name: 'name', Label: 'Name', Type: 'Text', md: 4, Position: 9 },
      {
        Name: 'rec_status',
        Label: 'Status',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        md: 4,
        OptionType: 'rec_status',
        Position: 10,
      },
      {
        Name: 'unit',
        Label: 'Unit',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        md: 4,
        OptionType: 'unit_dosage',
        Position: 12,
      },
      {
        Name: 'user_mod',
        Label: 'Auteur de la derni',
        Type: 'Text',
        md: 4,
        Position: 13,
      },
    ],
  ];

  this.ObjectName = 'Substance';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'id_data';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Substance',
    NewObjectTitle: 'Substance create',
    EditObjectTitle: 'Substance edit',
  };
}

module.exports = SubstanceConfig;
