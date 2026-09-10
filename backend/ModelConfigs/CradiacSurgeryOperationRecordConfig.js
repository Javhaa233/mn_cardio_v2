const { Models } = require('../config/DB');
const Model = Models.CradiacSurgeryOperationRecord;

function CradiacSurgeryOperationRecordConfig() {
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
        Name: 'image_name',
        Label: 'Image name',
        Type: 'Text',
        md: 4,
        Position: 7,
      },
      {
        Name: 'json_image',
        Label: 'JSON image',
        Type: 'Text',
        md: 4,
        Position: 8,
      },
      {
        Name: 'page_number',
        Label: 'Page number',
        Type: 'Text',
        md: 4,
        Position: 10,
      },
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
        Name: 'user_mod',
        Label: 'Last update author',
        Type: 'Text',
        md: 4,
        Position: 13,
      },
    ],
  ];

  this.ObjectName = 'CradiacSurgeryOperationRecord';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'id_data';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Cardiac surgery operation record',
    NewObjectTitle: 'Cardiac surgery operation record create',
    EditObjectTitle: 'Cardiac surgery operation record edit',
  };
}

module.exports = CradiacSurgeryOperationRecordConfig;
