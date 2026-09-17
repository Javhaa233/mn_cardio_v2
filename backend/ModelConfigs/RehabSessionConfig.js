const { Models } = require('../config/DB');
const Model = Models.RehabSession;

/**
 * Workouts done through the player. Patient data written only by the
 * patient app; registered read-only here so staff can review and export.
 * StopReason is JSON: {"symptoms":[...],"note":"..."}.
 */
function RehabSessionConfig() {
  this.Fields = [
    [
      { Name: 'Id', Label: 'Id', Type: 'Text', md: 4, Position: 1, EditField: false },
      {
        Name: 'PatRegNo',
        Label: 'Register number',
        Type: 'Text',
        md: 4,
        Position: 1,
        EditField: false,
      },
      {
        Name: 'DayNo',
        Label: 'Programme day',
        Type: 'Number',
        md: 4,
        Position: 1,
        EditField: false,
      },
      {
        Name: 'StartedAt',
        Label: 'Started',
        Type: 'DateTime',
        md: 4,
        Position: 2,
        EditField: false,
      },
      { Name: 'EndedAt', Label: 'Ended', Type: 'DateTime', md: 4, Position: 2, EditField: false },
      { Name: 'Status', Label: 'Status', Type: 'Text', md: 4, Position: 2, EditField: false },
      {
        Name: 'RestingHr',
        Label: 'Resting HR',
        Type: 'Number',
        md: 4,
        Position: 3,
        EditField: false,
      },
      { Name: 'MaxHr', Label: 'Max HR', Type: 'Number', md: 4, Position: 3, EditField: false },
      {
        Name: 'TargetHr',
        Label: 'Target HR',
        Type: 'Number',
        md: 4,
        Position: 3,
        EditField: false,
      },
      {
        Name: 'DurationSec',
        Label: 'Duration (sec)',
        Type: 'Number',
        md: 4,
        Position: 4,
        EditField: false,
      },
      {
        Name: 'CompletedBlocks',
        Label: 'Completed blocks',
        Type: 'Number',
        md: 4,
        Position: 4,
        EditField: false,
      },
      {
        Name: 'SkippedMovements',
        Label: 'Skipped movements',
        Type: 'Number',
        md: 4,
        Position: 4,
        EditField: false,
      },
      {
        Name: 'StopReason',
        Label: 'Stop reason',
        Type: 'TextArea',
        md: 12,
        Position: 5,
        EditField: false,
        GridField: false,
      },
    ],
  ];

  this.ObjectName = 'RehabSession';
  this.Model = Model;
  this.PK = 'Id';
  this.OptionTypes = Models.OptionTypes;
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Rehabilitation sessions',
    NewObjectTitle: 'New session',
    EditObjectTitle: 'Session',
  };
}

module.exports = RehabSessionConfig;
