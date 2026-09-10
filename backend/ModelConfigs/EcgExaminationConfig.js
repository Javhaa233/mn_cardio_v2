const { Models } = require('../config/DB');
const Model = Models.EcgExamination;

function EcgExaminationConfig() {
  this.Fields = [
    [
      {
        Name: 'PatientId',
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
        Position: 0,
        EditField: false,
        GridField: true,
      },
      {
        Name: 'DoctorsProfile.FullName',
        Label: 'Doctor',
        Type: 'Text',
        Position: 0,
        EditField: false,
      },
      {
        Name: 'OrganizationId',
        Label: 'OrganizationId',
        Type: 'Text',
        md: 4,
        Position: 0,
        GridField: false,
      },
      {
        Name: 'Organization.Name',
        Label: 'Organization',
        Type: 'Text',
        md: 4,
        Position: 0,
        EditField: false,
      },
      {
        Name: 'Patient.p_lastname',
        Type: 'Text',
        Label: 'Last name',
        EditField: false,
        Position: 0,
      },
      {
        Name: 'Patient.p_firstname',
        Type: 'Text',
        Label: 'First name',
        EditField: false,
        Position: 0,
      },
      {
        Name: 'Patient.p_registration',
        Type: 'Text',
        Label: 'Register',
        EditField: false,
        Position: 0,
      },
      {
        Name: 'Patient.p_birthday',
        Type: 'Text',
        Label: 'Birth date',
        EditField: false,
        Position: 0,
      },
      {
        Name: 'Patient.Age',
        Type: 'Text',
        Label: 'Age',
        EditField: false,
        Position: 0,
      },
      { Name: 'comment', Label: 'Comment', Type: 'Text', md: 4, Position: 1 },
      {
        Name: 'Files',
        Label: 'Files',
        Type: 'File',
        md: 4,
        GridField: false,
        Position: 1,
      },
      {
        Name: 'date_creation',
        Label: 'Date de cr',
        Type: 'Date',
        md: 4,
        Position: 2,
        EditField: false,
        GridField: false,
      },
      {
        Name: 'date_modif',
        Label: 'Date de modification',
        Type: 'Date',
        md: 4,
        Position: 3,
        EditField: false,
      },
      {
        Name: 'id',
        Label: "Identifiant d'utilisateur",
        Type: 'Text',
        md: 4,
        Position: 4,
        EditField: false,
        GridField: false,
      },
      {
        Name: 'id_data',
        Label: 'Identifiant de la fiche',
        Type: 'Text',
        md: 4,
        Position: 5,
        EditField: false,
        GridField: false,
      },
      {
        Name: 'id_group',
        Label: 'Groupe',
        Type: 'Text',
        md: 4,
        Position: 6,
        EditField: false,
        GridField: false,
      },
      {
        Name: 'rec_status',
        Label: 'Status',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        md: 4,
        OptionType: 'rec_status',
        Position: 9,
        EditField: false,
        GridField: false,
      },
      {
        Name: 'user_mod',
        Label: 'Auteur de la derni',
        Type: 'Text',
        md: 4,
        Position: 11,
        EditField: false,
        GridField: false,
      },
    ],
  ];

  this.ObjectName = 'EcgExamination';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'id_data';
  this.AttachFiles = true;
  this.NewObject = {};
  this.TitleObject = {
    Title: 'ECG examination',
    NewObjectTitle: 'ECG examination create',
    EditObjectTitle: 'ECG examination edit',
  };
}

module.exports = EcgExaminationConfig;
