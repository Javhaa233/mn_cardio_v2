const { Models } = require('../config/DB');
const Model = Models.CardiacSurgery;

function CardiacSurgeryConfig() {
  this.Fields = [
    [
      { Name: 'date_creation', Label: 'Creation date', Type: 'Date' },
      { Name: 'date_modif', Label: 'Update date', Type: 'Date' },
      { Name: 'date_operation', Label: 'Date of operation', Type: 'Date' },
      { Name: 'id', Label: 'User ID', Type: 'Text' },
      { Name: 'id_data', Label: 'Record ID', Type: 'Text' },
      { Name: 'id_group', Label: 'Group', Type: 'Text' },
      {
        Name: 'number_anastomosis',
        Label: 'Number of Anastomosis',
        Type: 'Text',
      },
      {
        Name: 'rec_status',
        Label: 'Status',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'rec_status',
      },
      { Name: 'user_mod', Label: 'Last update author', Type: 'Text' },
    ],
  ];

  this.ObjectName = 'CardiacSurgery';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'id_data';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Cardiac surgery',
    NewObjectTitle: 'Cardiac surgery create',
    EditObjectTitle: 'Cardiac surgery edit',
  };
}

module.exports = CardiacSurgeryConfig;
