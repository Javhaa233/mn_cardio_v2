const { Models } = require('../config/DB');
const Model = Models.Surgerybackgroundimage;

function SurgerybackgroundimageConfig() {
  this.Fields = [
    [
      {
        Name: 'date_creation',
        Label: 'Creation date',
        Type: 'Date',
        md: 4,
        Position: 1,
      },
      {
        Name: 'date_modif',
        Label: 'Update date',
        Type: 'Date',
        md: 4,
        Position: 2,
      },
      { Name: 'ext', Label: 'Extension', Type: 'Text', md: 4, Position: 3 },
      {
        Name: 'generated_name',
        Label: 'Generated name',
        Type: 'Text',
        md: 4,
        Position: 4,
      },
      { Name: 'hash', Label: 'HASH', Type: 'Text', md: 4, Position: 5 },
      { Name: 'id', Label: 'User ID', Type: 'Text', md: 4, Position: 6 },
      { Name: 'id_data', Label: 'Record ID', Type: 'Text', md: 4, Position: 7 },
      { Name: 'id_group', Label: 'Group', Type: 'Text', md: 4, Position: 8 },
      {
        Name: 'original_name',
        Label: 'Original name',
        Type: 'Text',
        md: 4,
        Position: 11,
      },
      {
        Name: 'patient_id',
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
        md: 4,
        Position: 12,
      },
      {
        Name: 'rec_status',
        Label: 'Status',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        md: 4,
        OptionType: 'rec_status',
        Position: 13,
      },
      { Name: 'size', Label: 'Size', Type: 'Text', md: 4, Position: 15 },
      {
        Name: 'type',
        Label: 'Type',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        md: 4,
        OptionType: 'surgery_bg_img_type',
        Position: 16,
      },
      {
        Name: 'user_mod',
        Label: 'Last update author',
        Type: 'Text',
        md: 4,
        Position: 17,
      },
    ],
  ];

  this.ObjectName = 'Surgerybackgroundimage';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'id_data';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Surgery background image',
    NewObjectTitle: 'Surgery background image create',
    EditObjectTitle: 'Surgery background image edit',
  };
}

module.exports = SurgerybackgroundimageConfig;
