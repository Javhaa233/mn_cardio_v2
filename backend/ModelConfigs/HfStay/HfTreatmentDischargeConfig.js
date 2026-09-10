const { Models } = require('../../config/DB');
const Model = Models.HfTreatmentDischarge;

function HfTreatmentDischargeConfig() {
  this.Fields = [
    [
      { Name: 'Id', Label: 'Id', Type: 'Text' },
      { Name: 'HfStayId', Label: 'Hf Stay Id', Type: 'Text' },
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
      { Name: 'CreatedDate', Label: 'Created Date', Type: 'Date' },
      {
        Name: 'inhibitor',
        Label: 'АХФС',
        Type: 'RadioBox',
        OptionType: 'yorn',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'inhibitor_tablet',
        Label: 'Эмийн нэр',
        Type: 'RadioBox',
        OptionType: 'hf_inhibitor_tablet',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      { Name: 'inhibitor_dose', Label: 'мг тун/хоног', Type: 'Text' },
      {
        Name: 'arb',
        Label: 'АРХ',
        Type: 'RadioBox',
        OptionType: 'yorn',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'arb_tablet',
        Label: 'Эмийн нэр',
        Type: 'RadioBox',
        OptionType: 'hf_arb_tablet',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      { Name: 'arb_dose', Label: 'мг тун/хоног', Type: 'Text' },
      {
        Name: 'beta',
        Label: 'Бетахориглогч',
        Type: 'RadioBox',
        OptionType: 'yorn',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'beta_tablet',
        Label: 'Эмийн нэр',
        Type: 'RadioBox',
        OptionType: 'hf_beta_tablet',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      { Name: 'beta_dose', Label: 'мг тун/хоног', Type: 'Text' },
      {
        Name: 'mra',
        Label: 'Минералкортикойд рецепторийн антагонист',
        Type: 'RadioBox',
        OptionType: 'yorn',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'mra_tablet',
        Label: 'Эмийн нэр',
        Type: 'RadioBox',
        OptionType: 'hf_mra_tablet',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      { Name: 'mra_dose', Label: 'мг тун/хоног', Type: 'Text' },
      {
        Name: 'arni',
        Label: 'Ангиотензины рецептор нефрилизины хориглогч',
        Type: 'RadioBox',
        OptionType: 'yorn',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'arni_tablet',
        Label: 'Эмийн нэр',
        Type: 'RadioBox',
        OptionType: 'hf_arni_tablet',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'arni_tablet_number',
        Label: 'Tab-ийн тоо',
        Type: 'RadioBox',
        OptionType: 'hf_arni_tablet_number',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'sinus_inhibitor',
        Label: 'Синусын зангилааг дарангуйлагч',
        Type: 'RadioBox',
        OptionType: 'yorn',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'sinus_tablet',
        Label: 'Эмийн нэр',
        Type: 'RadioBox',
        OptionType: 'hf_sinus_inhibitor_tablet',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      { Name: 'sinus_dose', Label: 'мг тун/хоног', Type: 'Text' },
      {
        Name: 'loop_diuretics',
        Label: 'Гогцооны шээс хөөгч',
        Type: 'RadioBox',
        OptionType: 'yorn',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'loop_diuretics_tablet',
        Label: 'Эмийн нэр',
        Type: 'RadioBox',
        OptionType: 'hf_loop_diuretics_tablet',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'loop_diuretics_cycle',
        Label: 'Давтамж',
        Type: 'RadioBox',
        OptionType: 'hf_loop_diuretics_cycle',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      { Name: 'loop_diuretics_dose', Label: 'Тун', Type: 'Text' },
      {
        Name: 'OtherDiuretic',
        Label: 'Тиазид болон бусад шээс хөөгч',
        Type: 'RadioBox',
        OptionType: 'yorn',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'Digitalis',
        Label: 'Дигиталис',
        Type: 'RadioBox',
        OptionType: 'yorn',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'Statin',
        Label: 'Статин',
        Type: 'RadioBox',
        OptionType: 'yorn',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'Nitrat',
        Label: 'Нитрат',
        Type: 'RadioBox',
        OptionType: 'yorn',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'OralAnticoagulant',
        Label: 'Уухаар антикоагулянт',
        Type: 'RadioBox',
        OptionType: 'hf_oral_anti',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'Antiagregant',
        Label: 'Антиагрегант',
        Type: 'RadioBox',
        OptionType: 'yorn',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
      {
        Name: 'DeviceTherapy',
        Label: 'Төхөөрөмж эмчилгээ',
        Type: 'RadioBox',
        OptionType: 'hf_device_therapy',
        Config: { IdField: 'Value', TextField: 'Label' },
      },
    ],
  ];

  this.ObjectName = 'HfTreatmentDischarge';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'Id';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Heart FailureTreatment Discharge',
    NewObjectTitle: 'Heart FailureTreatment Discharge create',
    EditObjectTitle: 'Heart FailureTreatment Discharge edit',
  };
}

module.exports = HfTreatmentDischargeConfig;
