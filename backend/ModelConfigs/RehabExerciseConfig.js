const { Models } = require('../config/DB');
const Model = Models.RehabExercise;

/**
 * The rehabilitation exercise catalogue - mobile tender 2.7.
 *
 * WHY THIS CONFIG EXISTS AT ALL. The catalogue is 39 placeholder rows, because
 * the real exercise names, categories and durations are clinical content that
 * ЗСҮТ own, and CLAUDE.md §9 is explicit that clinical wording is not ours to
 * invent. Registering this config gives /api/BaseObject list, detail, create,
 * update and Excel export over the table with no new code (CLAUDE.md §4), so
 * the customer types the real 39 in themselves - with the category dropdown
 * populated from the rehab_category dictionary - and replacing a placeholder is
 * a row edit rather than a deployment.
 *
 * The three sibling tables (Progress, VitalSign, Assessment) hold patient data
 * and are registered read-mostly; this one is the only genuinely editable
 * catalogue of the four.
 *
 * Patients cannot reach any of them through /BaseObject: PatientScope has no
 * SCOPE_BY_OBJECT entry for these tables and ApplyPatientFilter fails closed.
 * Patients read rehabilitation data only through /api/patient/rehab/*.
 */
function RehabExerciseConfig() {
  this.Fields = [
    [
      { Name: 'Id', Label: 'Id', Type: 'Text', md: 4, Position: 1, EditField: false },
      {
        Name: 'Code',
        Label: 'Code',
        Type: 'Text',
        Required: true,
        md: 4,
        Position: 1,
      },
      {
        Name: 'Name',
        Label: 'Exercise name',
        Type: 'Text',
        Required: true,
        md: 8,
        Position: 2,
      },
      {
        Name: 'Description',
        Label: 'Description',
        Type: 'TextArea',
        md: 12,
        Position: 3,
        GridField: false,
      },
      // OptionType rather than a hardcoded list: the category wording is
      // drafted and awaiting ЗСҮТ sign-off, so it stays a dictionary edit.
      // Renders empty until seed_dico_rehab.sql has been run.
      {
        Name: 'CategoryCode',
        Label: 'Category',
        Type: 'SingleSelect',
        OptionType: 'rehab_category',
        Config: { IdField: 'Value', TextField: 'Label' },
        md: 4,
        Position: 4,
      },
      { Name: 'DurationSec', Label: 'Duration (sec)', Type: 'Number', md: 4, Position: 4 },
      { Name: 'OrderNo', Label: 'Order', Type: 'Number', md: 4, Position: 4 },
      // Free text on purpose. helper/MediaRef.js reads a prefix scheme -
      // file: / url: / asset: - so whichever hosting option the customer picks
      // is entered here as a value. A typed control would have to assume one.
      {
        Name: 'MediaRef',
        Label: 'Video reference',
        Type: 'Text',
        md: 8,
        Position: 5,
        GridField: false,
      },
      { Name: 'IsActive', Label: 'Active', Type: 'CheckBox', md: 4, Position: 5 },
      {
        Name: 'WarningText',
        Label: 'Warning',
        Type: 'TextArea',
        md: 12,
        Position: 5,
        GridField: false,
      },
      {
        Name: 'CreateDate',
        Label: 'Created',
        Type: 'Date',
        md: 4,
        Position: 6,
        EditField: false,
        GridField: false,
      },
    ],
  ];

  this.ObjectName = 'RehabExercise';
  this.Model = Model;
  this.PK = 'Id';
  this.OptionTypes = Models.OptionTypes;
  this.NewObject = { IsActive: true };
  this.TitleObject = {
    Title: 'Rehabilitation exercises',
    NewObjectTitle: 'New exercise',
    EditObjectTitle: 'Edit exercise',
  };
}

module.exports = RehabExerciseConfig;
