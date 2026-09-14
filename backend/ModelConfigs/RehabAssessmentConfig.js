const { Models } = require('../config/DB');
const Model = Models.RehabAssessment;

/**
 * Rehabilitation risk and exercise-tolerance assessment - mobile tender 2.7,
 * tracker row 50.
 *
 * NOTHING HERE IS SCORED, AND THAT IS DELIBERATE. The tender names neither an
 * instrument nor a scale for this, and the equivalent decision for the ЗСӨ
 * cardiovascular risk score is an explicit ЗСҮТ deliverable (tracker 38).
 * add_rehabilitation_tables.sql says the same thing about these columns.
 * RiskLevel is a dictionary value a clinician chooses; ToleranceScore and
 * ToleranceUnit are free-form. When a methodology is approved, the calculation
 * goes in one place - not here.
 *
 * Keyed by PatRegNo, like every rehab-era table, rather than by Patient.id_data.
 */
function RehabAssessmentConfig() {
  this.Fields = [
    [
      { Name: 'Id', Label: 'Id', Type: 'Text', md: 4, Position: 1, EditField: false },
      {
        Name: 'PatRegNo',
        Label: 'Register number',
        Type: 'Text',
        Required: true,
        md: 4,
        Position: 1,
      },
      {
        Name: 'AssessmentDate',
        Label: 'Assessment date',
        Type: 'DateTime',
        md: 4,
        Position: 1,
      },
      {
        Name: 'RiskLevel',
        Label: 'Risk level',
        Type: 'SingleSelect',
        OptionType: 'rehab_risk',
        Config: { IdField: 'Value', TextField: 'Label' },
        md: 4,
        Position: 2,
      },
      { Name: 'ToleranceScore', Label: 'Tolerance score', Type: 'Number', md: 4, Position: 2 },
      { Name: 'ToleranceUnit', Label: 'Unit', Type: 'Text', md: 4, Position: 2 },
      {
        Name: 'Notes',
        Label: 'Notes',
        Type: 'TextArea',
        md: 12,
        Position: 3,
        GridField: false,
      },
      {
        Name: 'CreateDate',
        Label: 'Created',
        Type: 'Date',
        md: 4,
        Position: 4,
        EditField: false,
        GridField: false,
      },
    ],
  ];

  this.ObjectName = 'RehabAssessment';
  this.Model = Model;
  this.PK = 'Id';
  this.OptionTypes = Models.OptionTypes;
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Rehabilitation assessment',
    NewObjectTitle: 'New assessment',
    EditObjectTitle: 'Edit assessment',
  };
}

module.exports = RehabAssessmentConfig;
