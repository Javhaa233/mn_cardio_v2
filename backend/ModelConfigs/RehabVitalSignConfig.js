const { Models } = require('../config/DB');
const Model = Models.RehabVitalSign;

/**
 * Vital signs recorded around a rehabilitation exercise - mobile tender 2.7.
 *
 * Phase is before / during / after, from the rehab_phase dictionary. Borg is
 * the rating of perceived exertion - a number the patient reports, not a
 * calculated one, and deliberately left unvalidated here because the scale in
 * use (the 6-20 original or the 0-10 modified) has not been confirmed by the
 * clinical team. Ask before adding a range check: enforcing the wrong one would
 * reject valid readings.
 *
 * Written by the patient through /api/patient/rehab/vitals. This config exists
 * so the web can review and correct what was recorded, not so staff can enter
 * it - whether a clinician records vitals during a supervised session is a
 * customer question (tracker 51/56 word it as the patient's own record).
 */
function RehabVitalSignConfig() {
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
      { Name: 'MeasuredAt', Label: 'Measured at', Type: 'DateTime', md: 4, Position: 1 },
      {
        Name: 'Phase',
        Label: 'Phase',
        Type: 'SingleSelect',
        OptionType: 'rehab_phase',
        Config: { IdField: 'Value', TextField: 'Label' },
        md: 4,
        Position: 2,
      },
      { Name: 'ExerciseId', Label: 'Exercise', Type: 'Number', md: 4, Position: 2 },
      { Name: 'Pulse', Label: 'Pulse', Type: 'Number', md: 4, Position: 3 },
      // Text, not Number: this is recorded as "120/80", the same way
      // PatientMonitoring stores the systolic half as a string.
      { Name: 'BloodPressure', Label: 'Blood pressure', Type: 'Text', md: 4, Position: 3 },
      { Name: 'Borg', Label: 'Borg (RPE)', Type: 'Number', md: 4, Position: 3 },
      {
        Name: 'Notes',
        Label: 'Notes',
        Type: 'TextArea',
        md: 12,
        Position: 4,
        GridField: false,
      },
    ],
  ];

  this.ObjectName = 'RehabVitalSign';
  this.Model = Model;
  this.PK = 'Id';
  this.OptionTypes = Models.OptionTypes;
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Rehabilitation vital signs',
    NewObjectTitle: 'New reading',
    EditObjectTitle: 'Edit reading',
  };
}

module.exports = RehabVitalSignConfig;
