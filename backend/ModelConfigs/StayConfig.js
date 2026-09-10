const { Models } = require('../config/DB');
const Model = Models.Stay;

function StayConfig() {
  this.Fields = [
    [
      {
        Name: 'current_room_id',
        Label: 'Current Room ID',
        Type: 'Text',
        Position: 1,
      },
      {
        Name: 'date_creation',
        Label: 'Date de cr',
        Type: 'Date',
        Position: 2,
      },
      {
        Name: 'date_discharge',
        Label: 'Date of discharge',
        Type: 'Date',
        Position: 3,
      },
      {
        Name: 'date_admission',
        Label: 'Date of admission',
        Type: 'Date',
        Position: 4,
      },
      {
        Name: 'date_modif',
        Label: 'Date de modification',
        Type: 'Date',
        Position: 5,
      },
      {
        Name: 'department_id',
        Label: 'Department ID',
        Type: 'Text',
        Position: 6,
      },
      {
        Name: 'diagnose_admission',
        Label: 'Diagnose of admission',
        Type: 'Text',
        Position: 7,
      },
      {
        Name: 'diagnose_discharge',
        Label: 'Diagnose of discharge',
        Type: 'Number',
        Position: 8,
      },
      {
        Name: 'doctor_discharge',
        Label: 'Doctor of discharge',
        Type: 'Text',
        Position: 9,
      },
      {
        Name: 'from_department',
        Label: 'From department',
        Type: 'Text',
        Position: 10,
      },
      {
        Name: 'from_where',
        Label: 'From where',
        Type: 'SingleSelect',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'mode_waitinglist',
        Position: 11,
        GridField: false,
      },
      {
        Name: 'id',
        Label: "Identifiant d'utilisateur",
        Type: 'Text',
        Position: 12,
      },
      {
        Name: 'id_data',
        Label: 'Identifiant de la fiche',
        Type: 'Text',
        Position: 13,
      },
      { Name: 'id_group', Label: 'Groupe', Type: 'Text', md: 4, Position: 14 },
      {
        Name: 'inpatient_p_notes',
        Label: 'Notes',
        Type: 'Text',
        Position: 15,
      },
      {
        Name: 'mode_admission',
        Label: 'Mode of admission',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'mode_admission',
        Position: 16,
      },
      {
        Name: 'mode_discharge',
        Label: 'Mode of discharge',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'mode_discharge',
        Position: 17,
      },
      {
        Name: 'p_id',
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
      { Name: 'patient_register', Label: 'Status', Type: 'Text' },
      {
        Name: 'rec_status',
        Label: 'Status',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'rec_status',
      },
      {
        Name: 'to_department',
        Label: 'Which department refer patient to',
        Type: 'SingleSelect',
        Config: {
          Model: Models.DrgroupDepartments,
          IdField: 'id_data',
          TextField: 'name',
        },
        Position: 20,
        GridField: false,
      },
      {
        Name: 'to_where',
        Label: 'To where',
        Type: 'SingleSelect',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'mode_discharge',
        Position: 21,
        GridField: false,
      },
      {
        Name: 'user_mod',
        Label: 'Auteur de la derni',
        Type: 'Text',
        Position: 22,
      },
      //new
      {
        Name: 'severity_admission',
        Label: 'Severity on admission',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'severity',
        Position: 23,
      },
      {
        Name: 'p_status',
        Label: 'Status of patient',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'p_status_of_inpatien',
        Position: 24,
      },
      { Name: 'archive_date', Label: 'Data of archive', Type: 'Date' },
      { Name: 'RefferalTo', Label: 'Where refer patient to', Type: 'Text' },
    ],
  ];

  this.ObjectName = 'Stay';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'id_data';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Stay',
    NewObjectTitle: 'Stay create',
    EditObjectTitle: 'Stay edit',
  };
}

module.exports = StayConfig;
