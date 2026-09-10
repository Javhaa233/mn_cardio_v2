const { Models } = require('../config/DB');
const Model = Models.SurgeryDoctorNurseDictionary;

function SurgeryDoctorNurseDictionaryConfig() {
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
        Name: 'firstname',
        Label: 'First name',
        Type: 'Text',
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
        Name: 'lastname',
        Label: 'Last name',
        Type: 'Text',
        md: 4,
        Position: 8,
      },
      {
        Name: 'rec_status',
        Label: 'Status',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        md: 4,
        OptionType: 'rec_status',
        Position: 10,
      },
      {
        Name: 'type',
        Label: 'Type',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        md: 4,
        OptionType: 'surgery_doctor_nurse',
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

  this.ObjectName = 'SurgeryDoctorNurseDictionary';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'id_data';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Surgery doctor and nurse dictionary',
    NewObjectTitle: 'Surgery doctor and nurse dictionary create',
    EditObjectTitle: 'Surgery doctor and nurse dictionary edit',
  };
}

module.exports = SurgeryDoctorNurseDictionaryConfig;
