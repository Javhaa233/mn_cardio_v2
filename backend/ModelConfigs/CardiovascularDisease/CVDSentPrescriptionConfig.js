const { Models } = require('../../config/DB');
const Model = Models.CVDSentPrescription;

function CVDSentPrescriptionConfig() {
  this.Fields = [
    [
      { Name: 'Id', Label: 'Id', Type: 'Text' },
      { Name: 'MonitoringId', Label: 'CVDMonitoring Id', Type: 'Number' },
      { Name: 'SentData', Label: 'Жор үүсгэх дата', Type: 'Text' },
      { Name: 'ResData', Label: 'Хариу ирсэн дата', Type: 'Text' },
      //
      { Name: 'DoctorRegNo', Label: 'Doctor personal number', Type: 'Date' },
      { Name: 'RequestStatus', Label: 'Төлөв', Type: 'Text' },

      { Name: 'CreateDate', Label: 'Created Date', Type: 'Date' },
      {
        Name: 'CreateUserId',
        Label: 'Create user',
        Type: 'SingelSelect',
        Config: { Model: Models.Users, IdField: 'Id', TextField: 'UserName' },
      },
    ],
  ];

  this.ObjectName = 'CVDSentPrescription';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'Id';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Cardiovascular disease sent prescription',
    NewObjectTitle: 'Cardiovascular disease sent prescription create',
    EditObjectTitle: 'Cardiovascular disease sent prescription edit',
  };
}

module.exports = CVDSentPrescriptionConfig;
