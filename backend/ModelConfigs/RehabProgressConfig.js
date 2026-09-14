const { Models } = require('../config/DB');
const Model = Models.RehabProgress;

/**
 * What the patient actually completed - mobile tender 2.7.
 *
 * REVIEW ONLY. Every field is EditField: false, on purpose. This table is the
 * patient's own record of the exercise they did, written through
 * POST /api/patient/rehab/progress; a clinician editing it would be rewriting
 * what somebody reported about themselves. The config exists so the web can
 * READ and export it - the tender's "list in a menu, searchable, exportable"
 * requirement - not so it can be corrected.
 *
 * If the clinical team later needs to amend a row, that is a customer decision
 * with an audit trail attached, not a matter of flipping these flags.
 */
function RehabProgressConfig() {
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
        Name: 'CompletedAt',
        Label: 'Completed at',
        Type: 'DateTime',
        md: 4,
        Position: 1,
        EditField: false,
      },
      {
        Name: 'ExerciseId',
        Label: 'Exercise',
        Type: 'Number',
        md: 4,
        Position: 2,
        EditField: false,
      },
      {
        Name: 'DurationSec',
        Label: 'Duration (sec)',
        Type: 'Number',
        md: 4,
        Position: 2,
        EditField: false,
      },
      {
        Name: 'Notes',
        Label: 'Notes',
        Type: 'TextArea',
        md: 12,
        Position: 3,
        EditField: false,
        GridField: false,
      },
    ],
  ];

  this.ObjectName = 'RehabProgress';
  this.Model = Model;
  this.PK = 'Id';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Rehabilitation progress',
    NewObjectTitle: 'Progress',
    EditObjectTitle: 'Progress',
  };
}

module.exports = RehabProgressConfig;
