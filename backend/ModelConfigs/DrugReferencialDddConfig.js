const { Models } = require('../config/DB');
const Model = Models.DrugReferencialDdd;

function DrugReferencialDddConfig() {
  this.Fields = [
    [
      { Name: 'admcode', Label: 'AdmCode', Type: 'Text', md: 4, Position: 1 },
      { Name: 'atc_code', Label: 'ATC code', Type: 'Text', md: 4, Position: 2 },
      { Name: 'comment', Label: 'Comment', Type: 'Text', md: 4, Position: 3 },
      {
        Name: 'date_creation',
        Label: 'Date de cr',
        Type: 'Date',
        md: 4,
        Position: 4,
      },
      {
        Name: 'date_modif',
        Label: 'Date de modification',
        Type: 'Date',
        md: 4,
        Position: 5,
      },
      { Name: 'ddd', Label: 'DDD', Type: 'Text', md: 4, Position: 6 },
      {
        Name: 'id',
        Label: "Identifiant d'utilisateur",
        Type: 'Text',
        md: 4,
        Position: 7,
      },
      {
        Name: 'id_data',
        Label: 'Identifiant de la fiche',
        Type: 'Text',
        md: 4,
        Position: 8,
      },
      { Name: 'id_group', Label: 'Groupe', Type: 'Text', md: 4, Position: 9 },
      {
        Name: 'rec_status',
        Label: 'Status',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        md: 4,
        OptionType: 'rec_status',
        Position: 12,
      },
      { Name: 'unit', Label: 'Unit', Type: 'Text', md: 4, Position: 14 },
      {
        Name: 'user_mod',
        Label: 'Auteur de la derni',
        Type: 'Text',
        md: 4,
        Position: 15,
      },
    ],
  ];

  this.ObjectName = 'DrugReferencialDdd';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'id_data';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Drug referencial DDD',
    NewObjectTitle: 'Drug referencial DDD create',
    EditObjectTitle: 'Drug referencial DDD edit',
  };
}

module.exports = DrugReferencialDddConfig;
