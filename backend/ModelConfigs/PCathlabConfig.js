const { Models } = require('../config/DB');
const Model = Models.PCathlab;
var ModelLookUp = Models.PCathlabLookUp;

function PCathlabConfig() {
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
      },
      { Name: 'PatRegNo', Label: 'Personal number' },
      {
        Name: 'cath_lab_operation_date',
        Label: 'Date of cath lab operation',
        Type: 'Date',
        md: 4,
        Position: 1,
      },
      {
        Name: 'cath_lab_operation_procedure',
        Label: 'Procedure',
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
        md: 4,
        OptionType: 'procedure_performed',
        Position: 2,
      },
      {
        Name: 'date_creation',
        Label: 'Date de cr',
        Type: 'Date',
        md: 4,
        Position: 3,
      },
      {
        Name: 'date_modif',
        Label: 'Date de modification',
        Type: 'Date',
        md: 4,
        Position: 4,
      },
      {
        Name: 'doctors_name',
        Label: "Doctor's name",
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
        md: 4,
        OptionType: 'cathlab_doctor',
        Position: 5,
      },
      {
        Name: 'id',
        Label: "Identifiant d'utilisateur",
        Type: 'Text',
        md: 4,
        Position: 6,
      },
      {
        Name: 'id_data',
        Label: 'Identifiant de la fiche',
        Type: 'Text',
        md: 4,
        Position: 7,
      },
      { Name: 'id_group', Label: 'Groupe', Type: 'Text', md: 4, Position: 8 },
      {
        Name: 'rec_status',
        Label: 'Status',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        md: 4,
        OptionType: 'rec_status',
        Position: 11,
      },
      {
        Name: 'Conclusion',
        Label: 'Conclusion',
        Type: 'TextArea',
        md: 4,
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

  this.ObjectName = 'PCathlab';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'id_data';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Cath lab operation',
    NewObjectTitle: 'Cath lab operation create',
    EditObjectTitle: 'Cath lab operation edit',
  };
}

module.exports = PCathlabConfig;
