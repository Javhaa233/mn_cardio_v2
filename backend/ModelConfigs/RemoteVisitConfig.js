const { Models } = require('../config/DB');
const Model = Models.RemoteVisit;
// var { UserToRole, Roles } = Models;

function RemoteVisitConfig() {
  this.Fields = [
    [
      {
        Name: 'Id',
        Label: 'Id',
        Type: 'Text',
        md: 6,
        Position: 1,
        GridField: false,
        EditField: false,
      },
      // Label is 'Description' rather than 'Comment' so the patient-facing
      // textarea keeps the wording it has always shown (i18n: Тайлбар) now that
      // it takes its descriptor from here instead of a hand-written one in JSX.
      // Required because POST /api/patient/evisits refuses a blank comment
      // (COMMENT_REQUIRED) - declaring it puts the asterisk on the control.
      {
        Name: 'Comment',
        Label: 'Description',
        Type: 'Text',
        Required: true,
        md: 6,
        Position: 1,
      },
      {
        Name: 'PatientId',
        Label: 'Patient ID',
        Type: 'GridLookUpSingleLoad',
        Config: {
          ObjectName: 'Patient',
          IdField: 'id_data',
          TextField: 'p_registration',
          Fields: [
            // { Name: "id_data", Label: "Id" },
            { Name: 'p_lastname', Label: 'Last name' },
            { Name: 'p_firstname', Label: 'first name' },
            { Name: 'p_registration', Label: 'Register' },
            { Name: 'DictProvinceCity.name', Label: 'City' },
          ],
          MinTextLength: '2',
        },
        md: 6,
        Position: 1,
        EditField: false,
      },
      {
        Name: 'CreateDate',
        Label: 'Create date',
        Type: 'Date',
        md: 6,
        Position: 1,
        EditField: false,
      },
      // ---------------------------------------------------- booking (2.6) ---
      //
      // These exist so the WEB gets a triage screen for free through
      // /BaseObject - list, search, edit and Excel export with no new code.
      //
      // That is not duplication of /api/doctor/evisits. The mobile surface can
      // schedule, complete and cancel, but it can NEVER reassign a request to a
      // different doctor, because no endpoint there accepts an identifier for
      // who it is acting as - DoctorId always comes from the token. Reassigning
      // is a real clinic operation, and this is where it lives.
      {
        Name: 'RequestedDate',
        Label: 'Requested date',
        Type: 'DateTime',
        md: 6,
        Position: 2,
      },
      {
        Name: 'ScheduledDate',
        Label: 'Scheduled date',
        Type: 'DateTime',
        md: 6,
        Position: 2,
      },
      // OptionType, not a hardcoded list: the wording is drafted and awaiting
      // ЗСҮТ approval, so it must stay a dictionary edit rather than a code
      // change. Renders empty until seed_dico_remotevisit_status.sql has run.
      {
        Name: 'Status',
        Label: 'Status',
        Type: 'RadioBox',
        OptionType: 'remotevisit_status',
        Config: { IdField: 'Value', TextField: 'Label' },
        md: 6,
        Position: 3,
      },
      {
        Name: 'DoctorId',
        Label: 'Doctor',
        Type: 'GridLookUpSingleLoad',
        Config: {
          ObjectName: 'DoctorsProfile',
          IdField: 'id_data',
          TextField: 'FullName',
          Fields: [
            { Name: 'lastname', Label: 'Last name' },
            { Name: 'firstname', Label: 'First name' },
            { Name: 'Organization.Name', Label: 'Organization' },
          ],
          MinTextLength: '2',
        },
        md: 6,
        Position: 3,
      },
      // Free text rather than a validated URL control: the video platform is an
      // open customer question, so the shape of what goes here is not settled.
      {
        Name: 'MeetingUrl',
        Label: 'Meeting link',
        Type: 'Text',
        md: 12,
        Position: 4,
        GridField: false,
      },
      {
        Name: 'UpdateDate',
        Label: 'Updated',
        Type: 'DateTime',
        md: 6,
        Position: 4,
        EditField: false,
      },
      {
        Name: 'Files',
        Label: 'Files',
        Type: 'File',
        md: 4,
        Position: 0,
        GridField: false,
      },
    ],
  ];

  this.ObjectName = 'RemoteVisit';
  this.Model = Model;
  // Required for the Status field above: GetConfigData resolves an OptionType
  // by querying this model for the dico's rows.
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'Id';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'RemoteVisit',
    NewObjectTitle: 'RemoteVisit create',
    EditObjectTitle: 'RemoteVisit edit',
  };
}

module.exports = RemoteVisitConfig;
