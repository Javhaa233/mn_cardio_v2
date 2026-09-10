const { Models } = require('../config/DB');
const Model = Models.SmsQueue;

function SmsQueueConfig() {
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
      {
        Name: 'rec_status',
        Label: 'Status',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        md: 4,
        OptionType: 'rec_status',
        Position: 8,
      },
      {
        Name: 'textdata',
        Label: 'Message text',
        Type: 'Text',
        md: 4,
        Position: 10,
      },
      {
        Name: 'tonumber',
        Label: 'To number',
        Type: 'Text',
        md: 4,
        Position: 11,
      },
      {
        Name: 'touserid',
        Label: 'To user ID',
        Type: 'Text',
        md: 4,
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

  this.ObjectName = 'SmsQueue';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'id_data';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'SMS queue',
    NewObjectTitle: 'SMS queue create',
    EditObjectTitle: 'SMS queue edit',
  };
}

module.exports = SmsQueueConfig;
