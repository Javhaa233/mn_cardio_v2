const { Models } = require('../config/DB');
const Model = Models.RehabProgramBlock;

/**
 * The ordered blocks of a programme day: video (an exercise's movements),
 * timed (walking / cycling / stairs with heart rate check-ins), vitals, image.
 *
 * DurationSteps is JSON day bands: [{"fromDay":1,"toDay":7,"min":10},...,
 * {"fromDay":22,"min":30}]. ShowFromDay hides a block until that programme day.
 */
function RehabProgramBlockConfig() {
  this.Fields = [
    [
      { Name: 'Id', Label: 'Id', Type: 'Text', md: 4, Position: 1, EditField: false },
      { Name: 'ProgramId', Label: 'Programme', Type: 'Number', md: 4, Position: 1, Required: true },
      { Name: 'OrderNo', Label: 'Order', Type: 'Number', md: 4, Position: 1 },
      { Name: 'Title', Label: 'Block title', Type: 'Text', md: 8, Position: 2, Required: true },
      {
        Name: 'Kind',
        Label: 'Kind (video / timed / vitals / image)',
        Type: 'Text',
        md: 4,
        Position: 2,
        Required: true,
      },
      { Name: 'ExerciseId', Label: 'Exercise', Type: 'Number', md: 4, Position: 3 },
      { Name: 'DurationSec', Label: 'Fixed duration (sec)', Type: 'Number', md: 4, Position: 3 },
      { Name: 'ShowFromDay', Label: 'Shown from day', Type: 'Number', md: 4, Position: 3 },
      {
        Name: 'CheckInEverySec',
        Label: 'Check-in every (sec)',
        Type: 'Number',
        md: 4,
        Position: 4,
      },
      { Name: 'IsActive', Label: 'Active', Type: 'CheckBox', md: 4, Position: 4 },
      {
        Name: 'DurationSteps',
        Label: 'Minutes by day (JSON)',
        Type: 'TextArea',
        md: 12,
        Position: 5,
        GridField: false,
      },
      {
        Name: 'GuideText',
        Label: 'Guide text',
        Type: 'TextArea',
        md: 12,
        Position: 6,
        GridField: false,
      },
      {
        Name: 'ThumbRef',
        Label: 'Photo reference',
        Type: 'Text',
        md: 8,
        Position: 7,
        GridField: false,
      },
    ],
  ];

  this.ObjectName = 'RehabProgramBlock';
  this.Model = Model;
  this.PK = 'Id';
  this.OptionTypes = Models.OptionTypes;
  this.NewObject = { IsActive: true, Kind: 'video' };
  this.TitleObject = {
    Title: 'Programme blocks',
    NewObjectTitle: 'New block',
    EditObjectTitle: 'Edit block',
  };
}

module.exports = RehabProgramBlockConfig;
