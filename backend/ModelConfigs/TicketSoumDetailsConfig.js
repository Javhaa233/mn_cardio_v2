const { Models } = require('../config/DB');
const Model = Models.TicketSoumDetails;

function TicketSoumDetailsConfig() {
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
      {
        Name: 'rec_status',
        Label: 'Status',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        md: 4,
        OptionType: 'rec_status',
        Position: 8,
      },
      {
        Name: 'user_mod',
        Label: 'Last update author',
        Type: 'Text',
        md: 4,
        Position: 10,
      },
    ],
  ];

  this.ObjectName = 'TicketSoumDetails';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'id_data';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Ticket soum details',
    NewObjectTitle: 'Ticket soum details create',
    EditObjectTitle: 'Ticket soum details edit',
  };
}

module.exports = TicketSoumDetailsConfig;
