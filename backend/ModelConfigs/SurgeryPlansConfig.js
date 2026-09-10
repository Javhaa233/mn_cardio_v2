const { Models } = require('../config/DB');
const Model = Models.SurgeryPlans;
const ModelLookUp = Models.SurgeryPlansLookUp;

function SurgeryPlansConfig() {
  this.Fields = [
    [
      { Name: 'Id', Label: 'Id', Type: 'Text' },
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
      { Name: 'CreateDate', Label: 'Created Date', Type: 'Date' },
      { Name: 'UpdateUserId', Label: 'Updated user', Type: 'Text' },
      { Name: 'UpdatedDate', Label: 'Updated date', Type: 'Text' },
      { Name: 'ConfirmUserId', Label: 'Confirm user', Type: 'Text' },
      { Name: 'ConfirmedDate', Label: 'Confirmed date', Type: 'Text' },

      {
        Name: 'type_exam1',
        Label: 'At outpatients due to',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'type_exam1',
        GridField: false,
      },
      { Name: 'ognoo', Label: 'Огноо', Type: 'Text' },
      {
        Name: 'organization_id',
        Label: 'Эрүүл мэндийн байгууллага',
        Type: 'GridLookUpSingleLoad',
        Config: {
          ObjectName: 'Organization',
          IdField: 'Id',
          TextField: 'Name',
          MinTextLength: 0,
          SearchType: 'AllData',
          Fields: [
            { Name: 'Id', Label: 'Id' },
            { Name: 'Name', Label: 'Name' },
          ],
        },
        DataFilter: [{ Field: 'level', Value: ['2', '3'], Op: 'In' }],
      },
      {
        Name: 'organization_other',
        Label: 'Эрүүл мэндийн байгууллага (Бусад)',
        Type: 'Text',
      },
      { Name: 'diagnosis', Label: 'Мэс заслын онош', Type: 'Text' },
      { Name: 'surgery_name', Label: 'Хийх мэс заслын нэр', Type: 'Text' },
      { Name: 'surgery_date', Label: 'Хугацаа', Type: 'Text' },
      { Name: 'surgery_doctors', Label: 'Мэс заслын эмч', Type: 'TextArea' },
      { Name: 'tasag', Label: 'Тасаг', Type: 'Text' },
      { Name: 'tnha_virus', Label: 'TPHA ДОХ,ВС вирус /+-/', Type: 'Text' },
      {
        Name: 'medeeguijuuleg_turul',
        Label: 'Мэдээгүйжүүлгийн төрөл',
        Type: 'Text',
      },
      {
        Name: 'ersdel_zereg',
        Label: 'Эмнэлзүйн эрсдэлийн зэрэг',
        Type: 'Text',
      },
      { Name: 'comment', Label: 'Тайлбар', Type: 'TextArea' },
      // {
      //   Name: "nemelt_sanal",
      //   Label: "Тайлбар, эмч нарын зөвлөгөөний нэмэлт санал",
      //   Type: "TextArea",
      // },
    ],
  ];

  this.ObjectName = 'SurgeryPlans';
  this.Model = Model;
  this.PK = 'Id';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Surgery plan',
    NewObjectTitle: 'Surgery plan create',
    EditObjectTitle: 'Surgery plan edit',
  };
}

module.exports = SurgeryPlansConfig;
