const { Models } = require('../../config/DB');
const Model = Models.PatientTransfer;

function PatientTransferConfig() {
  this.Fields = [
    [
      { Name: 'Id', Label: 'Id', Type: 'Text' },
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
      },
      {
        Name: 'DoctorId',
        Label: 'Doctor',
        Type: 'GridLookUpSingleLoad',
        Config: {
          ObjectName: 'DoctorsProfile',
          IdField: 'id_data',
          TextField: 'firstname',
          Fields: [
            // { Name: "id_data", Label: "Id" },
            { Name: 'lastname', Label: 'Last name' },
            { Name: 'firstname', Label: 'first name' },
          ],
          MinTextLength: '2',
        },
      },
      {
        Name: 'CreateUserId',
        Label: 'Create user',
        Type: 'SingelSelect',
        Config: {
          Model: Models.Users,
          IdField: 'Id',
          TextField: 'UserName',
          MinTextLength: 0,
        },
      },
      {
        Name: 'FromOrganizationId',
        Label: 'From organization',
        Type: 'Text',
        md: 4,
      },
      {
        Name: 'ToOrganizationId',
        Label: 'To organization',
        Type: 'Text',
        md: 4,
      },
      { Name: 'Diagnosis', Label: 'Diagnosis', Type: 'Text' },
      {
        Name: 'Purpose',
        Label: 'Зорилго',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: 'Мэс засалд', Value: '1' },
          { Label: 'Хэм судлалын мэс засал эмчилгээнд', Value: '2' },
          { Label: 'Ахисан түвшний ЭХО', Value: '3' },
          { Label: 'Тисдо/Эмчилгээнд', Value: '4' },
        ],
      },
      { Name: 'Comment', Label: 'Нэмэлт мэдээлэл', Type: 'TextArea' },
      {
        Name: 'TransferedDate',
        Label: 'Date of transfer',
        Type: 'Date',
        md: 4,
      },
      { Name: 'CreateDate', Label: 'Create date', Type: 'Date' },
    ],
  ];

  this.ObjectName = 'PatientTransfer';
  this.Model = Model;
  this.PK = 'Id';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Patient transfer',
    NewObjectTitle: 'Patient transfer create',
    EditObjectTitle: 'Patient transfer edit',
  };
}

module.exports = PatientTransferConfig;
