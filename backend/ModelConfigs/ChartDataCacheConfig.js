const { Models } = require('../config/DB');
const Model = Models.ChartDataCache;

function ChartDataCacheConfig() {
  this.Fields = [
    [
      { Name: 'data', Label: 'Data', Type: 'Text', md: 4, Position: 1 },
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
        Name: 'user_mod',
        Label: 'Last update author',
        Type: 'Text',
        md: 4,
        Position: 11,
      },
    ],
  ];

  this.ObjectName = 'ChartDataCache';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'id_data';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Cache for chart data',
    NewObjectTitle: 'Cache for chart data create',
    EditObjectTitle: 'Cache for chart data edit',
  };
}

module.exports = ChartDataCacheConfig;
