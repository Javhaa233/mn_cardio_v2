const { Models } = require('../config/DB');
const Model = Models.HospitalUnit;

function HospitalUnitConfig() {
  this.Fields = [
    [
      { Name: 'branch_id', Label: 'Branch ID', Type: 'Text' },
      { Name: 'capacity', Label: 'Capacity', Type: 'Text' },
      { Name: 'date_creation', Label: 'Date de cr', Type: 'Date' },
      { Name: 'date_modif', Label: 'Date de modification', Type: 'Date' },
      { Name: 'department_id', Label: 'Department ID', Type: 'Text' },
      { Name: 'id', Label: "Identifiant d'utilisateur", Type: 'Text' },
      { Name: 'id_data', Label: 'Identifiant de la fiche', Type: 'Text' },
      { Name: 'id_group', Label: 'Groupe', Type: 'Text' },
      { Name: 'name', Label: 'Name', Type: 'Text' },
      { Name: 'price', Label: 'Price', Type: 'Text' },
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

  this.ObjectName = 'HospitalUnit';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'id_data';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Hospital unit',
    NewObjectTitle: 'Hospital unit create',
    EditObjectTitle: 'Hospital unit edit',
  };
}

module.exports = HospitalUnitConfig;
