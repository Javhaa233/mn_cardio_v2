const { Models } = require('../config/DB');
const Model = Models.TicketSoumComment;

function TicketSoumCommentConfig() {
  this.Fields = [
    [
      { Name: 'comment', Label: 'Comment', Type: 'Text', md: 4, Position: 1 },
      {
        Name: 'date_creation',
        Label: 'Creation date',
        Type: 'Date',
        md: 4,
        Position: 2,
      },
      {
        Name: 'date_modif',
        Label: 'Update date',
        Type: 'Date',
        md: 4,
        Position: 3,
      },
      { Name: 'id', Label: 'User ID', Type: 'Text', md: 4, Position: 4 },
      { Name: 'id_data', Label: 'Record ID', Type: 'Text', md: 4, Position: 5 },
      { Name: 'id_group', Label: 'Group', Type: 'Text', md: 4, Position: 6 },
      {
        Name: 'rec_status',
        Label: 'Status',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        md: 4,
        OptionType: 'rec_status',
        Position: 9,
      },
      {
        Name: 'ticket_soum_id',
        Label: 'Ticket soum ID',
        Type: 'Text',
        md: 4,
        Position: 11,
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

  this.ObjectName = 'TicketSoumComment';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'id_data';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Ticket soum comment',
    NewObjectTitle: 'Ticket soum comment create',
    EditObjectTitle: 'Ticket soum comment edit',
  };
}

module.exports = TicketSoumCommentConfig;
