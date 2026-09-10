const { Models } = require('../config/DB');
const Model = Models.OrderTeamProcedure;

function OrderTeamProcedureConfig() {
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
      { Name: 'id', Label: 'User ID', Type: 'Text', md: 4, Position: 3 },
      { Name: 'id_data', Label: 'Record ID', Type: 'Text', md: 4, Position: 4 },
      { Name: 'id_group', Label: 'Group', Type: 'Text', md: 4, Position: 5 },
      { Name: 'note', Label: 'Note', Type: 'Text', md: 4, Position: 8 },
      { Name: 'order_id', Label: 'Order ID', Type: 'Text', md: 4, Position: 9 },
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
        Position: 10,
      },
      {
        Name: 'priority',
        Label: 'Priority',
        Type: 'Text',
        md: 4,
        Position: 11,
      },
      {
        Name: 'procedure_type',
        Label: 'Procedure type',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        md: 4,
        OptionType: 'team_procedure',
        Position: 12,
      },
      {
        Name: 'processed',
        Label: 'Processed',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        md: 4,
        OptionType: 'yorn',
        Position: 13,
      },
      {
        Name: 'rec_status',
        Label: 'Status',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        md: 4,
        OptionType: 'rec_status',
        Position: 14,
      },
      { Name: 'team_id', Label: 'Team ID', Type: 'Text', md: 4, Position: 16 },
      {
        Name: 'user_mod',
        Label: 'Last update author',
        Type: 'Text',
        md: 4,
        Position: 17,
      },
    ],
  ];

  this.ObjectName = 'OrderTeamProcedure';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'id_data';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Order team procedure',
    NewObjectTitle: 'Order team procedure create',
    EditObjectTitle: 'Order team procedure edit',
  };
}

module.exports = OrderTeamProcedureConfig;
