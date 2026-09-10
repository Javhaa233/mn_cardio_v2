const { Models } = require('../config/DB');
const Model = Models.Notification;

function NotificationConfig() {
  this.Fields = [
    [
      { Name: 'Id', Label: 'Id', Type: 'Text' },
      { Name: 'Notes', Label: 'Notes', Type: 'Text' },
      { Name: 'LinkObjectName', Label: 'LinkObjectName', Type: 'Text' },
      { Name: 'LinkObjectId', Label: 'LinkObjectId', Type: 'Text' },
      { Name: 'NotesMn', Label: 'NotesMn', Type: 'Text' },
      { Name: 'CreateDate', Label: 'CreateDate', Type: 'Date' },
      { Name: 'CreateUserId', Label: 'CreateUserId', Type: 'Text' },
      { Name: 'CreateDoctorId', Label: 'CreateDoctorId', Type: 'Text' },
      { Name: 'Action', Label: 'Action', Type: 'Text' },
      { Name: 'ToDoctorId', Label: 'ToDoctorId', Type: 'Text' },
      { Name: 'ToUserId', Label: 'ToUserId', Type: 'Text' },
      { Name: 'SeenDate', Label: 'SeenDate', Type: 'Date' },
      { Name: 'Seen', Label: 'Seen', Type: 'Text' },
    ],
  ];

  this.ObjectName = 'Notification';
  this.Model = Model;
  this.OptionTypes = null;
  this.PK = 'Id';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Notification',
    NewObjectTitle: 'Notification  create',
    EditObjectTitle: 'Notification  edit',
  };
}

module.exports = NotificationConfig;
