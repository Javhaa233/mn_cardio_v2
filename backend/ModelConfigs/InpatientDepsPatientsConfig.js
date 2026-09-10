const { Models } = require('../config/DB');
const Model = Models.InpatientDepsPatients;

function InpatientDepsPatientsConfig() {
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
        Name: 'date_inpatient_list',
        Label: 'Date of registration in inpatient department',
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
        Name: 'date_waiting_list',
        Label: 'Date of registration in waiting list',
        Type: 'Date',
        md: 4,
        Position: 4,
      },
      {
        Name: 'department_id',
        Label: 'Department ID',
        Type: 'Text',
        md: 4,
        Position: 5,
      },
      {
        Name: 'doctor_id_inpatient_list',
        Label: 'Doctor id (registered in inpatient)',
        Type: 'Text',
        md: 4,
        Position: 6,
      },
      {
        Name: 'doctor_id_waiting_list',
        Label: 'Doctor ID (registered in waiting list)',
        Type: 'Text',
        md: 4,
        Position: 7,
      },
      {
        Name: 'id',
        Label: "Identifiant d'utilisateur",
        Type: 'Text',
        md: 4,
        Position: 8,
      },
      {
        Name: 'id_data',
        Label: 'Identifiant de la fiche',
        Type: 'Text',
        md: 4,
        Position: 9,
      },
      { Name: 'id_group', Label: 'Groupe', Type: 'Text', md: 4, Position: 10 },
      {
        Name: 'inpatient_p_notes',
        Label: 'Notes',
        Type: 'Text',
        md: 4,
        Position: 12,
      },
      {
        Name: 'p_diagnosis',
        Label: 'Diagnosis (ICD10)',
        Type: 'Text',
        md: 4,
        Position: 14,
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
      {
        Name: 'p_severity',
        Label: 'Severity',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        md: 4,
        OptionType: 'severity',
        Position: 16,
      },
      {
        Name: 'p_status',
        Label: 'Status of patient',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        md: 4,
        OptionType: 'p_status_of_inpatien',
        Position: 17,
      },
      {
        Name: 'p_telephone',
        Label: 'Telephone number',
        Type: 'Text',
        md: 4,
        Position: 18,
      },
      {
        Name: 'rec_status',
        Label: 'Status',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        md: 4,
        OptionType: 'rec_status',
        Position: 19,
      },
      {
        Name: 'user_mod',
        Label: 'Auteur de la derni',
        Type: 'Text',
        md: 4,
        Position: 21,
      },
    ],
  ];

  this.ObjectName = 'InpatientDepsPatients';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'id_data';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Patients of in-patient department',
    NewObjectTitle: 'Patients of in-patient department create',
    EditObjectTitle: 'Patients of in-patient department edit',
  };
}

module.exports = InpatientDepsPatientsConfig;
