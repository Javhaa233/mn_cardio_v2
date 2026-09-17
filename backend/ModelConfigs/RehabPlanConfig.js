const { Models } = require('../config/DB');
const Model = Models.RehabPlan;

/**
 * Patient programme assignments. Written by doctors through
 * /api/doctor/patients/:id/rehab/plan (which ends the previous plan and notifies
 * the patient); registered here for review and Excel export.
 */
function RehabPlanConfig() {
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
      { Name: 'ProgramId', Label: 'Programme', Type: 'Number', md: 4, Position: 1 },
      { Name: 'StartDate', Label: 'Start date', Type: 'Date', md: 4, Position: 2 },
      { Name: 'IntensityPct', Label: 'Intensity (%)', Type: 'Number', md: 4, Position: 2 },
      {
        Name: 'MaxHrOverride',
        Label: 'Max heart rate override',
        Type: 'Number',
        md: 4,
        Position: 2,
      },
      { Name: 'Status', Label: 'Status', Type: 'Text', md: 4, Position: 3 },
      { Name: 'EndedAt', Label: 'Ended', Type: 'DateTime', md: 4, Position: 3, EditField: false },
      { Name: 'Notes', Label: 'Notes', Type: 'TextArea', md: 12, Position: 4, GridField: false },
    ],
  ];

  this.ObjectName = 'RehabPlan';
  this.Model = Model;
  this.PK = 'Id';
  this.OptionTypes = Models.OptionTypes;
  this.NewObject = { Status: 'active' };
  this.TitleObject = {
    Title: 'Rehabilitation plans',
    NewObjectTitle: 'New plan',
    EditObjectTitle: 'Edit plan',
  };
}

module.exports = RehabPlanConfig;
