const { Models } = require('../config/DB');
const Model = Models.Icd9PcLevel1;

function Icd9PcLevel1Config() {
  this.Fields = [
    [
      { Name: 'date_creation', Label: 'Date de cr', Type: 'Date' },
      { Name: 'date_modif', Label: 'Date de modification', Type: 'Date' },
      { Name: 'id', Label: "Identifiant d'utilisateur", Type: 'Text' },
      { Name: 'id_data', Label: 'Identifiant de la fiche', Type: 'Text' },
      { Name: 'id_group', Label: 'Groupe', Type: 'Text' },
      { Name: 'name', Label: 'Name', Type: 'Text' },
      { Name: 'name_mgl', Label: 'Name MGL', Type: 'Text' },
      { Name: 'number', Label: 'Number', Type: 'Text' },
      {
        Name: 'rec_status',
        Label: 'Status',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'rec_status',
      },
      { Name: 'user_mod', Label: 'Auteur de la derni', Type: 'Text' },
    ],
  ];

  this.ObjectName = 'Icd9PcLevel1';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'id_data';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'ICD9 PC Level 1',
    NewObjectTitle: 'ICD9 PC Level 1 create',
    EditObjectTitle: 'ICD9 PC Level 1 edit',
  };
}

module.exports = Icd9PcLevel1Config;
