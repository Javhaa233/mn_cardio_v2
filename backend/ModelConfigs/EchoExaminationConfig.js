const { Models } = require('../config/DB');
const Model = Models.EchoExamination;

function EchoExaminationConfig() {
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
      { Name: 'test', Label: 'Test', Type: 'Text', md: 4, Position: 10 },
      {
        Name: 'user_mod',
        Label: 'Auteur de la derni',
        Type: 'Text',
        md: 4,
        Position: 11,
      },
      { Name: 'var_date', Label: 'Date', Type: 'Date', md: 4, Position: 12 },
      {
        Name: 'var_dico',
        Label: 'Dico',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        md: 4,
        OptionType: 'cardio_surgery_op',
        Position: 13,
      },
      {
        Name: 'var_dico_mult',
        Label: 'Dico mult',
        Type: 'CheckBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Multiple: true,
        md: 4,
        OptionType: 'cathlab_doctor',
        Position: 14,
      },
      { Name: 'var_foat', Label: 'Float', Type: 'Text', md: 4, Position: 15 },
      { Name: 'var_int', Label: 'Int', Type: 'Text', md: 4, Position: 16 },
      { Name: 'var_text', Label: 'Text', Type: 'Text', md: 4, Position: 17 },
      {
        Name: 'var_text_mult',
        Label: 'Text mult',
        Type: 'Text',
        md: 4,
        Position: 18,
      },
    ],
  ];

  this.ObjectName = 'EchoExamination';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'id_data';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Echo examination',
    NewObjectTitle: 'Echo examination create',
    EditObjectTitle: 'Echo examination edit',
  };
}

module.exports = EchoExaminationConfig;
