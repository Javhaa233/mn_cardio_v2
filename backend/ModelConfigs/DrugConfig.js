const { Models } = require('../config/DB');
const Model = Models.Drug;

function DrugConfig() {
  this.Fields = [
    [
      { Name: 'amount', Label: 'Amount', Type: 'Text', md: 4, Position: 1 },
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
        Name: 'dosage_id',
        Label: 'Dosage ID',
        Type: 'Text',
        md: 4,
        Position: 4,
      },
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
        Name: 'user_mod',
        Label: 'Auteur de la derni',
        Type: 'Text',
        md: 4,
        Position: 12,
      },
    ],
  ];

  this.ObjectName = 'Drug';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'id_data';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Drug',
    NewObjectTitle: 'Drug create',
    EditObjectTitle: 'Drug edit',
  };
}

module.exports = DrugConfig;
