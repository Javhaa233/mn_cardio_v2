const { Models } = require('../config/DB');
const Model = Models.File;

function FileConfig() {
  this.Fields = [
    [
      { Name: 'comment', Label: 'Comment', Type: 'Text' },
      { Name: 'date_creation', Label: 'Date de cr', Type: 'Date' },
      { Name: 'date_modif', Label: 'Date de modification', Type: 'Date' },
      { Name: 'ext', Label: 'Extension', Type: 'Text' },
      { Name: 'generated_name', Label: 'Generated name', Type: 'Text' },
      { Name: 'hash', Label: 'HASH', Type: 'Text' },
      { Name: 'id', Label: "Identifiant d'utilisateur", Type: 'Text' },
      { Name: 'id_data', Label: 'Identifiant de la fiche', Type: 'Text' },
      { Name: 'id_group', Label: 'Groupe', Type: 'Text' },
      { Name: 'linked_id_data', Label: 'Linked primary key', Type: 'Text' },
      { Name: 'linked_q', Label: 'Linked questionnaire', Type: 'Text' },
      { Name: 'original_name', Label: 'Original name', Type: 'Text' },
      {
        Name: 'patient_id',
        Label: 'Patient ID',
        Type: 'GridLookUpSingleLoad',
        Config: {
          ObjectName: 'Patient',
          IdField: 'id_data',
          TextField: 'p_registration',
          Fields: [
            // { Name: "id_data", Label: "Id" },
            { Name: 'p_lastname', Label: 'Last name' },
            { Name: 'p_firstname', Label: 'first name' },
            { Name: 'p_registration', Label: 'Register' },
            { Name: 'DictProvinceCity.name', Label: 'City' },
          ],
          MinTextLength: '2',
        },
      },
      {
        Name: 'rec_status',
        Label: 'Status',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'rec_status',
      },
      { Name: 'size', Label: 'Size', Type: 'Text' },
      { Name: 'user_mod', Label: 'Auteur de la derni', Type: 'Text' },
    ],
  ];

  this.ObjectName = 'File';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'id_data';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'File',
    NewObjectTitle: 'File create',
    EditObjectTitle: 'File edit',
  };
}

module.exports = FileConfig;
