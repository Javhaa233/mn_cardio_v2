const { Models } = require('../config/DB');
const Model = Models.RehabProgram;

/**
 * The rehabilitation programmes - one per disease group (mobile tender 2.7, player).
 *
 * Content is clinical (durations, day bands, warning wording) and is entered and
 * approved by the rehab team; seed_rehab_programs_draft.sql puts DRAFT rows on
 * MnCardio_test only. WarningTemplate uses {target} for the patient's target
 * heart rate. Tables: scripts/add_rehab_program_tables.sql.
 */
function RehabProgramConfig() {
  this.Fields = [
    [
      { Name: 'Id', Label: 'Id', Type: 'Text', md: 4, Position: 1, EditField: false },
      { Name: 'Code', Label: 'Code', Type: 'Text', md: 4, Position: 1, Required: true },
      { Name: 'OrderNo', Label: 'Order', Type: 'Number', md: 4, Position: 1 },
      { Name: 'Name', Label: 'Programme name', Type: 'Text', md: 8, Position: 2, Required: true },
      {
        Name: 'HasHrTarget',
        Label: 'Uses target heart rate',
        Type: 'CheckBox',
        md: 4,
        Position: 2,
      },
      {
        Name: 'DefaultIntensityPct',
        Label: 'Default intensity (%)',
        Type: 'Number',
        md: 4,
        Position: 3,
      },
      { Name: 'IsActive', Label: 'Active', Type: 'CheckBox', md: 4, Position: 3 },
      {
        Name: 'Description',
        Label: 'Description',
        Type: 'TextArea',
        md: 12,
        Position: 4,
        GridField: false,
      },
      {
        Name: 'WarningTemplate',
        Label: 'Warning before a session ({target})',
        Type: 'TextArea',
        md: 12,
        Position: 5,
        GridField: false,
      },
    ],
  ];

  this.ObjectName = 'RehabProgram';
  this.Model = Model;
  this.PK = 'Id';
  this.OptionTypes = Models.OptionTypes;
  this.NewObject = { IsActive: true, HasHrTarget: true, DefaultIntensityPct: 30 };
  this.TitleObject = {
    Title: 'Rehabilitation programmes',
    NewObjectTitle: 'New programme',
    EditObjectTitle: 'Edit programme',
  };
}

module.exports = RehabProgramConfig;
