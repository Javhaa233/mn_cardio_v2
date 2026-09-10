const { Models } = require('../config/DB');
const Model = Models.SurgeryCondition;

function SurgeryConditionConfig() {
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
        Name: 'id',
        Label: "Identifiant d'utilisateur",
        Type: 'Text',
        md: 4,
        Position: 3,
      },
      {
        Name: 'id_data',
        Label: 'Identifiant de la fiche',
        Type: 'Text',
        md: 4,
        Position: 4,
      },
      { Name: 'id_group', Label: 'Groupe', Type: 'Text', md: 4, Position: 5 },
      { Name: 'name', Label: 'Name', Type: 'Text', md: 4, Position: 8 },
      {
        Name: 'rec_status',
        Label: 'Status',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        md: 4,
        OptionType: 'rec_status',
        Position: 9,
      },
      {
        Name: 'user_mod',
        Label: 'Auteur de la derni',
        Type: 'Text',
        md: 4,
        Position: 11,
      },
    ],
  ];

  this.ObjectName = 'SurgeryCondition';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'id_data';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Surgery condition',
    NewObjectTitle: 'Surgery condition create',
    EditObjectTitle: 'Surgery condition edit',
  };
}

module.exports = SurgeryConditionConfig;
