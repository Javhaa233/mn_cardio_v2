const { Models } = require('../config/DB');
const Model = Models.OrderSurgery;

function OrderSurgeryConfig() {
  this.Fields = [
    [
      { Name: 'b_virus', Label: 'B virus', Type: 'Text', md: 4, Position: 1 },
      { Name: 'c_virus', Label: 'C virus', Type: 'Text', md: 4, Position: 2 },
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
        Name: 'date_planned',
        Label: 'Planned date',
        Type: 'Date',
        md: 4,
        Position: 5,
      },
      {
        Name: 'hiv_virus',
        Label: 'HIV virus',
        Type: 'Text',
        md: 4,
        Position: 6,
      },
      {
        Name: 'id',
        Label: "Identifiant d'utilisateur",
        Type: 'Text',
        md: 4,
        Position: 7,
      },
      {
        Name: 'id_data',
        Label: 'Identifiant de la fiche',
        Type: 'Text',
        md: 4,
        Position: 8,
      },
      { Name: 'id_group', Label: 'Groupe', Type: 'Text', md: 4, Position: 9 },
      {
        Name: 'order_id',
        Label: 'Order ID',
        Type: 'Text',
        md: 4,
        Position: 12,
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
        Position: 13,
      },
      {
        Name: 'priority',
        Label: 'Priority',
        Type: 'Text',
        md: 4,
        Position: 14,
      },
      {
        Name: 'processed',
        Label: 'Processed',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        md: 4,
        OptionType: 'yorn',
        Position: 15,
      },
      {
        Name: 'rec_status',
        Label: 'Status',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        md: 4,
        OptionType: 'rec_status',
        Position: 16,
      },
      { Name: 'room', Label: 'Room ID', Type: 'Text', md: 4, Position: 18 },
      {
        Name: 'surgery_condition',
        Label: 'Condition',
        Type: 'Text',
        md: 4,
        Position: 19,
      },
      {
        Name: 'user_mod',
        Label: 'Auteur de la derni',
        Type: 'Text',
        md: 4,
        Position: 20,
      },
    ],
  ];

  this.ObjectName = 'OrderSurgery';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'id_data';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Order surgery',
    NewObjectTitle: 'Order surgery create',
    EditObjectTitle: 'Order surgery edit',
  };
}

module.exports = OrderSurgeryConfig;
