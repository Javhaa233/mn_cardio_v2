const { Models } = require('../config/DB');
const Model = Models.CathlabElement;
var ModelLookUp = Models.CathlabElementLookUp;

function CathlabElementConfig() {
  this.Fields = [
    [
      { Name: 'comment', Label: 'Comment', Type: 'Text', Position: 1 },
      { Name: 'date_creation', Label: 'Date de cr', Type: 'Date', Position: 2 },
      {
        Name: 'date_modif',
        Label: 'Date de modification',
        Type: 'Date',
        Position: 3,
      },
      {
        Name: 'id',
        Label: "Identifiant d'utilisateur",
        Type: 'Text',
        Position: 4,
      },
      {
        Name: 'id_data',
        Label: 'Identifiant de la fiche',
        Type: 'Text',
        Position: 5,
      },
      { Name: 'id_group', Label: 'Groupe', Type: 'Text', Position: 6 },
      {
        Name: 'rec_status',
        Label: 'Status',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'rec_status',
        Position: 9,
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
        OptionType: 'cath_lab_elemnt_tags',
        Position: 11,
      },
      {
        Name: 'type',
        Label: 'Type',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'cath_lab_elemnt_type',
        Position: 12,
      },
      {
        Name: 'unique_name',
        Label: 'Unique name',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'cath_lab_unique_name',
        Position: 13,
      },
      {
        Name: 'user_mod',
        Label: 'Auteur de la derni',
        Type: 'Text',
        Position: 14,
      },
    ],
  ];

  this.ObjectName = 'CathlabElement';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'id_data';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Cath lab element (entity)',
    NewObjectTitle: 'Cath lab element (entity) create',
    EditObjectTitle: 'Cath lab element (entity) edit',
  };
}

module.exports = CathlabElementConfig;
