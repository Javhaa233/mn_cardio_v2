const { Models } = require('../config/DB');
const Model = Models.ObjectNameDic;

function ObjectNameDicConfig() {
  this.Fields = [
    [
      { Name: 'Id', Label: 'Id', Type: 'Text', md: 4, Position: 1 },
      {
        Name: 'ObjectName',
        Label: 'ObjectName',
        Type: 'Text',
        md: 4,
        Position: 1,
      },
      {
        Name: 'ObjectNameMn',
        Label: 'ObjectNameMn',
        Type: 'Text',
        md: 4,
        Position: 1,
      },
      {
        Name: 'CreateDate',
        Label: 'CreateDate',
        Type: 'Date',
        md: 4,
        Position: 1,
      },
      {
        Name: 'CreateUserId',
        Label: 'CreateUserId',
        Type: 'Text',
        md: 4,
        Position: 1,
      },
      { Name: 'Id', Label: 'Id', Type: 'Text', md: 4, Position: 1 },
    ],
  ];

  this.ObjectName = 'ObjectNameDic';
  this.Model = Model;
  this.OptionTypes = null;
  this.PK = 'id_data';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'ObjectName Dic',
    NewObjectTitle: 'ObjectName Dic create',
    EditObjectTitle: 'ObjectName Dic edit',
  };
}

module.exports = ObjectNameDicConfig;
