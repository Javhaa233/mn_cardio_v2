const { Models } = require('../config/DB');
const Model = Models.OrderHospitalization;

function OrderHospitalizationConfig() {
  this.Fields = [
    [
      {
        Name: 'date_creation',
        Label: 'Date de cr',
        Type: 'Date',
        Position: 1,
        GridField: false,
        EditField: false,
      },
      {
        Name: 'date_modif',
        Label: 'Date de modification',
        Type: 'Date',
        Position: 2,
        GridField: false,
        EditField: false,
      },
      {
        Name: 'department_id',
        Label: 'Department ID',
        Type: 'SingleSelect',
        Config: {
          TextField: 'name',
          IdField: 'id_data',
          Model: Models.DrgroupDepartments,
        },
        Position: 3,
        GridField: false,
      },
      {
        Name: 'id',
        Label: "Identifiant d'utilisateur",
        Type: 'Text',
        Position: 4,
        GridField: false,
        EditField: false,
      },
      {
        Name: 'id_data',
        Label: 'Identifiant de la fiche',
        Type: 'Text',
        Position: 5,
        GridField: false,
        EditField: false,
      },
      {
        Name: 'id_group',
        Label: 'Groupe',
        Type: 'Text',
        Position: 6,
        GridField: false,
        EditField: false,
      },
      { Name: 'notes', Label: 'Notes', Type: 'Text', md: 4, Position: 9 },
      {
        Name: 'schedule_date',
        Label: 'Хэвтүүлэхээр төлөвлөсөн огноо',
        Type: 'Text',
        Position: 9,
      },

      { Name: 'phone', Label: 'Phone', Type: 'Text', md: 4, Position: 9 },
      {
        Name: 'order_id',
        Label: 'Order ID',
        Type: 'Text',
        Position: 10,
      },
      {
        Name: 'p_severity',
        Label: 'Severity',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'severity',
        Position: 11,
      },
      {
        Name: 'patient_from',
        Label: 'Patient from',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'mode_waitinglist',
        Position: 12,
      },
      {
        Name: 'Patient.p_firstname',
        Label: 'Patient',
        EditField: false,
        Position: 13,
      },
      {
        Name: 'patient_id',
        Label: 'Patient ID (for quicker searching)',
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
        Position: 13,
        GridField: false,
      },
      { Name: 'patient_register', Label: 'Status', Type: 'Text' },
      {
        Name: 'JournalRef.jr_label',
        Label: 'Preliminary disease',
        Type: 'Text',
        Position: 14,
        EditField: false,
      },
      {
        Name: 'preliminary_disease',
        Label: 'Preliminary disease',
        Type: 'SingleSelectLoad',
        Config: {
          ObjectName: 'JournalRef',
          TextField: 'jr_label',
          IdField: 'id_data',
          MinTextLength: 3,
        },
        Position: 14,
        GridField: false,
      },
      {
        Name: 'processed',
        Label: 'Processed',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'yorn',
        Position: 15,
      },
      {
        Name: 'rec_status',
        Label: 'Status',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'rec_status',
        Position: 16,
        GridField: false,
        EditField: false,
      },
      {
        Name: 'result',
        Label: 'Result',
        Type: 'Text',
        Position: 18,
        EditField: false,
      },
      {
        Name: 'user_mod',
        Label: 'Auteur de la derni',
        Type: 'Text',
        Position: 19,
        GridField: false,
        EditField: false,
      },
      {
        Name: 'where_from',
        Label: 'Where is patient from',
        Type: 'Text',
        Position: 20,
      },
    ],
  ];

  this.ObjectName = 'OrderHospitalization';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'id_data';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Order for hospitalization',
    NewObjectTitle: 'Order for hospitalization create',
    EditObjectTitle: 'Order for hospitalization edit',
  };
}

module.exports = OrderHospitalizationConfig;
