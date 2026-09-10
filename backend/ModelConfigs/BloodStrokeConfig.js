const { Models } = require('../config/DB');
const Model = Models.BloodStroke;

function BloodStrokeConfig() {
  this.Fields = [
    [
      { Name: 'DoctorsProfile.FullName', Label: 'Doctor', Type: 'Text' },
      {
        Name: 'OrganizationId',
        Label: 'Эрүүл мэндийн байгууллага',
        Type: 'GridLookUpSingleLoad',
        Config: {
          ObjectName: 'Organization',
          IdField: 'Id',
          TextField: 'Name',
          MinTextLength: 0,
          SearchType: 'AllData',
          Fields: [
            { Name: 'Id', Label: 'Id' },
            { Name: 'Name', Label: 'Name' },
          ],
        },
        GridField: false,
      },
      { Name: 'Organization.Name', Label: 'Organization', Type: 'Text' },
      { Name: 'Patient.p_lastname', Type: 'Text', Label: 'Last name' },
      { Name: 'Patient.p_firstname', Type: 'Text', Label: 'First name' },
      { Name: 'Patient.p_registration', Type: 'Text', Label: 'Register' },
      { Name: 'Patient.p_birthday', Type: 'Text', Label: 'Birth date' },
      { Name: 'Patient.Age', Type: 'Text', Label: 'Age' },
      { Name: 'date', Label: 'Date', Type: 'Date' },
      {
        Name: 'type',
        Label: 'Type',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'blood_stroke_type',
      },
      { Name: 'inr_value', Label: 'Inr value', Type: 'Number' },

      { Name: 'date_creation', Label: 'Creation date', Type: 'Date' },
      { Name: 'date_modif', Label: 'Update date', Type: 'Date' },
      { Name: 'id', Label: 'User ID', Type: 'Text', GridField: false },
      { Name: 'id_data', Label: 'Record ID', Type: 'Text', GridField: false },
      { Name: 'id_group', Label: 'Group', Type: 'Text', GridField: false },
      {
        Name: 'rec_status',
        Label: 'Status',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'rec_status',
        GridField: false,
      },
      {
        Name: 'user_mod',
        Label: 'Last update author',
        Type: 'Text',
        GridField: false,
      },
    ],
  ];

  this.ObjectName = 'BloodStroke';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'id_data';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'INR',
    NewObjectTitle: 'INR create',
    EditObjectTitle: 'INR edit',
  };
}

module.exports = BloodStrokeConfig;
