const { Models } = require('../config/DB');
const Model = Models.ExaminationEchoNotation;
var ModelLookUp = Models.ExaminationEchoNotationLookUp;

function ExaminationEchoNotationConfig() {
  this.Fields = [
    [
      { Name: 'comment', Label: 'Comment', Type: 'Text', md: 4, Position: 1 },
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
        Name: 'section_name',
        Label: 'Section name',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        md: 4,
        OptionType: 'echo_section_name',
        Position: 11,
      },
      {
        Name: 'tags',
        Label: 'Tags',
        Type: 'CheckBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        LookUpConfig: {
          Model: ModelLookUp,
          ParentValueField: 'id_data',
          ChildValueField: 'value',
          IdField: 'id_lookup',
          Field: 'id_question',
        },
        Multiple: true,
        md: 4,
        OptionType: 'echo_element_tag',
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

  this.ObjectName = 'ExaminationEchoNotation';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'id_data';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Echo examination notation',
    NewObjectTitle: 'Echo examination notation create',
    EditObjectTitle: 'Echo examination notation edit',
  };
}

module.exports = ExaminationEchoNotationConfig;
