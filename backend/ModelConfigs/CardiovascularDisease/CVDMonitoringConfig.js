const { Models } = require('../../config/DB');
const Model = Models.CVDMonitoring;

function CVDMonitoringConfig() {
  this.Fields = [
    [
      { Name: 'Id', Label: 'Id', Type: 'Text', EditField: false },
      { Name: 'PatRegNo', Label: 'Personal number' },
      { Name: 'BirthDate', Label: 'Status', Type: 'Text' },
      { Name: 'Age', Label: 'Status', Type: 'Text' },
      {
        Name: 'Status',
        Label: 'Status',
        Type: 'SingleSelect',
        Config: { IdField: 'Value', TextField: 'Label' },
        Data: [
          { Label: 'Идэвхигүй', Value: 'inactive' },
          { Label: 'Үзлэгийн өмнөх', Value: 'after_monitoring' },
          { Label: 'Идэвхитэй', Value: 'activated' },
          { Label: 'Хяналтнаас гарсан', Value: 'out_control' },
          { Label: 'Үзлэгт хамрагдсан', Value: 'expired' },
        ],
      },
      { Name: 'IsActive', Label: 'Status', Type: 'Text' },
      // InspectionDate
      { Name: 'StartedDate', Label: 'Control started date', Type: 'Text' },
      { Name: 'OutDate', Label: 'Expired date', Type: 'Text' },
      { Name: 'ExpiredDate', Label: 'Expired date', Type: 'Text' },
      { Name: 'CanceledDate', Label: 'out of control date', Type: 'Text' },
      { Name: 'date_status', Label: 'Хугацаа төлөв', Type: 'Text' },

      {
        Name: 'ParentOrganizationId',
        Label: 'Parent Organization Id',
        Type: 'Text',
      },
      { Name: 'OrganizationId', Label: 'Organization Id', Type: 'Text' },
      {
        Name: 'ProvinceCityId',
        Label: 'Province/city',
        Type: 'SingleSelect',
        Config: {
          Model: Models.DictProvinceCity,
          IdField: 'id_data',
          TextField: 'name',
          MinTextLength: 1,
        },
      },
      {
        Name: 'SoumDistrictId',
        Label: 'Soum/district',
        Type: 'SingleSelect',
        Config: {
          SearchType: 'AllData',
          Model: Models.DictSoumDistrict,
          ObjectName: 'DictSoumDistrict',
          IdField: 'id_data',
          TextField: 'name',
          MinTextLength: 0,
          Fields: [
            { Name: 'id_data', Label: 'Id' },
            { Name: 'name', Label: 'Name' },
          ],
        },
      },
      {
        Name: 'BagKhorooId',
        Label: 'Bag/khoroo',
        Type: 'SingleSelect',
        Config: {
          SearchType: 'AllData',
          Model: Models.DictBagKhoroo,
          ObjectName: 'DictBagKhoroo',
          IdField: 'id_data',
          TextField: 'name',
          MinTextLength: 0,
          Fields: [
            { Name: 'id_data', Label: 'Id' },
            { Name: 'name', Label: 'Name' },
          ],
        },
      },
      { Name: 'CreateDate', Label: 'Created Date', Type: 'Date' },
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
      { Name: 'UpdateDate', Label: 'Update Date', Type: 'Date' },
      {
        Name: 'UpdateUserId',
        Label: 'Update user',
        Type: 'SingelSelect',
        Config: {
          Model: Models.Users,
          IdField: 'Id',
          TextField: 'UserName',
          MinTextLength: 0,
        },
      },
    ],
  ];

  this.ObjectName = 'CVDMonitoring';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'Id';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Cardiovascular disease',
    NewObjectTitle: 'Cardiovascular disease',
    EditObjectTitle: 'Cardiovascular disease',
  };
}

module.exports = CVDMonitoringConfig;
