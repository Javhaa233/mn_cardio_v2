const { Models } = require('../config/DB');
const Model = Models.LookupOrderAnesthesia;

function LookupOrderAnesthesiaConfig() {
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
      {
        Name: 'id_anesthesia',
        Label: 'Anesthesia ID',
        Type: 'Text',
        md: 4,
        Position: 4,
      },
      { Name: 'id_data', Label: 'Record ID', Type: 'Text', md: 4, Position: 5 },
      { Name: 'id_group', Label: 'Group', Type: 'Text', md: 4, Position: 6 },
      {
        Name: 'id_order_surgery',
        Label: 'Order surgery ID',
        Type: 'Text',
        md: 4,
        Position: 7,
      },
      {
        Name: 'rec_status',
        Label: 'Status',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        md: 4,
        OptionType: 'rec_status',
        Position: 10,
      },
      {
        Name: 'user_mod',
        Label: 'Last update author',
        Type: 'Text',
        md: 4,
        Position: 12,
      },
    ],
  ];

  this.ObjectName = 'LookupOrderAnesthesia';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'id_data';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Lookup for order and anesthesia',
    NewObjectTitle: 'Lookup for order and anesthesia create',
    EditObjectTitle: 'Lookup for order and anesthesia edit',
  };
}

module.exports = LookupOrderAnesthesiaConfig;
