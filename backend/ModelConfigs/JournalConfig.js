const { Models } = require('../config/DB');
const Model = Models.Journal;

function JournalConfig() {
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
        Name: 'j_begin_date',
        Label: 'Begin date',
        Type: 'Date',
        md: 4,
        Position: 7,
      },
      {
        Name: 'j_begin_vid',
        Label: 'Begin visit ID',
        Type: 'Text',
        md: 4,
        Position: 8,
      },
      {
        Name: 'j_end_date',
        Label: 'End date',
        Type: 'Date',
        md: 4,
        Position: 9,
      },
      {
        Name: 'j_end_vid',
        Label: 'End visit ID',
        Type: 'Text',
        md: 4,
        Position: 10,
      },
      { Name: 'j_label', Label: 'Label', Type: 'Text', md: 4, Position: 11 },
      {
        Name: 'j_ref',
        Label: 'Referential',
        Type: 'Text',
        md: 4,
        Position: 12,
      },
      {
        Name: 'rec_status',
        Label: 'Status',
        Type: 'RadioBox',
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
      },
    ],
  ];

  this.ObjectName = 'Journal';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'id_data';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Journal',
    NewObjectTitle: 'Journal create',
    EditObjectTitle: 'Journal edit',
  };
}

module.exports = JournalConfig;
