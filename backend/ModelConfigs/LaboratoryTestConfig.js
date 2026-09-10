const { Models } = require('../config/DB');
const Model = Models.LaboratoryTest;

function LaboratoryTestConfig() {
  this.Fields = [
    [
      { Name: 'Id', Label: 'Id', Type: 'Text', EditField: false },
      {
        Name: 'LaboratoryTestDate',
        Label: 'Шинжилгээ өгсөн огноо',
        Type: 'Date',
      },
      { Name: 'complaint', Label: 'Зовиур', Type: 'Text' },
      { Name: 'disorders', Label: 'Хавсарсан эмгэг', Type: 'Text' },
      { Name: 'regular_medication', Label: 'Тогтмол уудаг эм', Type: 'Text' },
      { Name: 'diagnosis', Label: 'Онош', Type: 'Text' },
      { Name: 'blood_test_date', Label: 'Огноо', Type: 'Date' },
      { Name: 'wbc', Label: 'WBC', Type: 'Text' },
      { Name: 'rbc', Label: 'RBC', Type: 'Text' },
      { Name: 'hb', Label: 'Hb', Type: 'Text' },
      { Name: 'hct', Label: 'Hct', Type: 'Text' },
      { Name: 'platelet', Label: 'Platelet', Type: 'Text' },
      { Name: 'coe', Label: 'СОЭ', Type: 'Text' },
      { Name: 'euro_score_2', Label: 'Euro score II', Type: 'Text' },
      { Name: 'logistic_euroscore', Label: 'Logistic Euroscore', Type: 'Text' },
      { Name: 'sts', Label: 'STS', Type: 'Text' },
      { Name: 'nyha', Label: 'NYHA class', Type: 'Text' },
      { Name: 'liver_test_date', Label: 'Огноо', Type: 'Text' },
      { Name: 'total_proteoin', Label: 'Нийт уураг  г/л)', Type: 'Text' },
      { Name: 'albumin', Label: 'Альбумин', Type: 'Text' },
      { Name: 'asat', Label: 'АСАТ', Type: 'Text' },
      { Name: 'alat', Label: 'АЛАТ', Type: 'Text' },
      { Name: 'total_bilirubin', Label: 'Нийт Билирубин', Type: 'Text' },
      { Name: 'ggt', Label: 'ГГТ', Type: 'Text' },
      { Name: 'glucose', Label: 'Глюкоз', Type: 'Text' },
      { Name: 'kidney_test_date', Label: 'Огноо', Type: 'Text' },
      { Name: 'mochevin', Label: 'Мочевин', Type: 'Text' },
      { Name: 'creatinine', Label: 'Креатинин', Type: 'Text' },
      { Name: 'hbs_ag', Label: 'HbsAg', Type: 'Text' },
      { Name: 'hcv', Label: 'HCV', Type: 'Text' },
      { Name: 'syphilis', Label: 'Тэмбүү', Type: 'Text' },
      { Name: 'hiv', Label: 'HIV', Type: 'Text' },
      { Name: 'tsusnii_bulegnelt_date', Label: 'Огноо', Type: 'Text' },
      { Name: 'pt', Label: 'PT', Type: 'Text' },
      { Name: 'inr', Label: 'INR', Type: 'Text' },
      { Name: 'fibrinogen', Label: 'fibrinogen', Type: 'Text' },
      { Name: 'tt', Label: 'TT', Type: 'Text' },
      { Name: 'aptt', Label: 'АРТТ', Type: 'Text' },
      { Name: 'chest_ktg', Label: 'Цээжний КТГ', Type: 'Text' },
      { Name: 'chest_xray', Label: 'Цээжний рентген зураг', Type: 'Text' },
      { Name: 'abdomen_echo', Label: 'Хэвлийн эхо', Type: 'Text' },
      { Name: 'spirometry', Label: 'Спирометр', Type: 'Text' },
      { Name: 'chatlab', Label: 'КАГ', Type: 'Text' },
      { Name: 'surgical_plan', Label: 'Мэс заслын төлөвлөгөө', Type: 'Text' },
      { Name: 'CreateUserId', Label: 'Doctor', Type: 'Text', EditField: false },
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
        EditField: false,
      },
      { Name: 'CreateDate', Label: 'Create date', Type: 'Text' },
    ],
  ];

  this.ObjectName = 'LaboratoryTest';
  this.Model = Model;
  this.PK = 'Id';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Laboratory test',
    NewObjectTitle: 'Laboratory test create',
    EditObjectTitle: 'Laboratory test edit',
  };
}

module.exports = LaboratoryTestConfig;
