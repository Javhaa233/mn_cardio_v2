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
  this.PK = 'Id';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'RemoteVisit',
    NewObjectTitle: 'RemoteVisit create',
    EditObjectTitle: 'RemoteVisit edit',
  };
}

module.exports = RemoteVisitConfig;
