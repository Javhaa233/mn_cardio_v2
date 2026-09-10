const { Models } = require('../config/DB');
const Model = Models.DrgroupDepartments;

function DrgroupDepartmentsConfig() {
  this.Fields = [
    [
      {
        Name: 'AppId',
        Label: 'App',
        Type: 'SingleSelect',
        Config: { Model: Models.Apps, TextField: 'Name', IdField: 'Id' },
        Position: 0,
        EditField: false,
        GridField: true,
      },
      {
        Name: 'Organization.Name',
        Label: 'Organization',
        Type: 'Text',
        Position: 0,
        EditField: false,
      },
      {
        Name: 'name',
        Label: 'Name',
        Type: 'Text',
        md: 4,
        Position: 1,
        EditField: true,
      },
      {
        Name: 'OrganizationId',
        Label: 'Organization',
        Type: 'GridLookUpSingle',
        md: 4,
        Config: {
          Model: Models.Organization,
          IdField: 'Id',
          TextField: 'Name',
          MinTextLength: 1,
          SearchType: 'AllData',
          Fields: [
            { Name: 'ParentOrganization.Name', Label: 'Parent' },
            { Name: 'Id', Label: 'Id' },
            { Name: 'Name', Label: 'Name' },
            { Name: 'vwOrganizationType.label', Label: 'Type' },
          ],
        },
        GridField: false,
        EditField: true,
        Position: 0,
      },
      {
        Name: 'date_creation',
        Label: 'Date de cr',
        Type: 'Date',
        md: 4,
        Position: 10,
        EditField: false,
      },
      {
        Name: 'date_modif',
        Label: 'Date de modification',
        Type: 'Date',
        md: 4,
        Position: 3,
        GridField: false,
        EditField: false,
      },
      {
        Name: 'id',
        Label: "Identifiant d'utilisateur",
        Type: 'Text',
        md: 4,
        Position: 4,
        GridField: false,
        EditField: false,
      },
      {
        Name: 'id_data',
        Label: 'Identifiant de la fiche',
        Type: 'Text',
        md: 4,
        Position: 5,
        GridField: false,
        EditField: false,
      },
      {
        Name: 'id_group',
        Label: 'Groupe',
        Type: 'Text',
        md: 4,
        Position: 6,
        GridField: false,
        EditField: false,
      },
      {
        Name: 'rec_status',
        Label: 'Status',
        Type: 'SingleSelect',
        Config: { IdField: 'Value', TextField: 'Label' },
        md: 4,
        OptionType: 'rec_status',
        Position: 10,
        EditField: false,
        GridField: false,
      },
      {
        Name: 'user_mod',
        Label: 'Auteur de la derni',
        Type: 'Text',
        md: 4,
        Position: 12,
        GridField: false,
        EditField: false,
      },
    ],
    [
      {
        Name: 'Doctors',
        Label: 'Doctors',
        Type: 'ListView',
        Config: {
          ObjectName: 'DoctorTooDepartment',
          Fields: ['dico', 'value'],
          ForiegnKey: 'DepartmentId',
          DataFilter: [{ Field: 'DoctorId', Value: 'null', Op: 'NotEquals' }],
        },
        md: 12,
        Position: 1,
        GridField: false,
        EditField: true,
      },
    ],
  ];

  this.ObjectName = 'DrgroupDepartments';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'id_data';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Doctors group department',
    NewObjectTitle: 'Doctors group department create',
    EditObjectTitle: 'Doctors group department edit',
  };
}

module.exports = DrgroupDepartmentsConfig;
