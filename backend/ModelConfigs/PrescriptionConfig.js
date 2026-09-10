const { Models } = require('../config/DB');
const Model = Models.Prescription;

function PrescriptionConfig() {
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
      { Name: 'duration', Label: 'Duration', Type: 'Text', md: 4, Position: 4 },
      {
        Name: 'id',
        Label: "Identifiant d'utilisateur",
        Type: 'Text',
        md: 4,
        Position: 5,
      },
      {
        Name: 'id_data',
        Label: 'Identifiant de la fiche',
        Type: 'Text',
        md: 4,
        Position: 6,
      },
      { Name: 'id_group', Label: 'Groupe', Type: 'Text', md: 4, Position: 7 },
      {
        Name: 'id_origin',
        Label: 'Origin ID',
        Type: 'Text',
        md: 4,
        Position: 8,
      },
      {
        Name: 'mode',
        Label: 'Mode/Root',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        md: 4,
        OptionType: 'presc_medicine_mode',
        Position: 11,
      },
      {
        Name: 'rec_status',
        Label: 'Status',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        md: 4,
        OptionType: 'rec_status',
        Position: 12,
      },
      {
        Name: 'start_date',
        Label: 'Start date',
        Type: 'Date',
        md: 4,
        Position: 14,
      },
      {
        Name: 'status',
        Label: 'Status',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        md: 4,
        OptionType: 'status',
        Position: 15,
      },
      {
        Name: 'times',
        Label: 'Frequency',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        md: 4,
        OptionType: 'presc_medicine_times',
        Position: 16,
      },
      {
        Name: 'user_mod',
        Label: 'Auteur de la derni',
        Type: 'Text',
        md: 4,
        Position: 17,
      },
    ],
  ];

  this.ObjectName = 'Prescription';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'id_data';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Prescription',
    NewObjectTitle: 'Prescription create',
    EditObjectTitle: 'Prescription edit',
  };
}

module.exports = PrescriptionConfig;
