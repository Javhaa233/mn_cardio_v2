const { Models } = require('../config/DB');
const Model = Models.JournalRef;

function JournalRefConfig() {
  this.Fields = [
    [
      {
        Name: 'date_creation',
        Label: 'Date de cr',
        Type: 'Date',
        GridField: true,
        md: 4,
        Position: 1,
      },
      {
        Name: 'date_modif',
        Label: 'Date de modification',
        Type: 'Date',
        GridField: false,
        md: 4,
        Position: 2,
      },
      {
        Name: 'id',
        Label: "Identifiant d'utilisateur",
        Type: 'Text',
        GridField: false,
        md: 4,
        Position: 3,
      },
      {
        Name: 'id_data',
        Label: 'Identifiant de la fiche',
        Type: 'Text',
        GridField: false,
        md: 4,
        Position: 4,
      },
      { Name: 'id_group', Label: 'Groupe', Type: 'Text', md: 4, Position: 5 },
      {
        Name: 'jr_help',
        Label: 'Help',
        GridField: false,
        Type: 'Text',
        md: 4,
        Position: 7,
      },
      {
        Name: 'jr_label',
        Label: 'Label',
        Type: 'TextArea',
        md: 12,
        Position: 8,
        EditField: true,
      },
      {
        Name: 'jr_type',
        Label: 'Type',
        Type: 'SingleSelect',
        Config: { IdField: 'Value', TextField: 'Label' },
        md: 4,
        OptionType: 'ref_type',
        Position: 9,
        EditField: true,
      },
      {
        Name: 'rec_status',
        Label: 'Status',
        Type: 'SingleSelect',
        Config: { IdField: 'Value', TextField: 'Label' },
        md: 4,
        OptionType: 'rec_status',
        Position: 11,
      },
      {
        Name: 'user_mod',
        Label: 'Auteur de la derni',
        Type: 'Text',
        GridField: false,
        md: 4,
        Position: 13,
      },
    ],
  ];

  this.ObjectName = 'JournalRef';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'id_data';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Journal referencial',
    NewObjectTitle: 'Journal referencial create',
    EditObjectTitle: 'Journal referencial edit',
  };
}

module.exports = JournalRefConfig;
