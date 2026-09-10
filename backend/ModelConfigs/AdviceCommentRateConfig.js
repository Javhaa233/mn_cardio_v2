const { Models } = require('../config/DB');
const Model = Models.AdviceCommentRate;

function AdviceCommentRateConfig() {
  this.Fields = [
    [
      { Name: 'Id', Label: 'Id', Type: 'Text', GridField: false },
      {
        Name: 'AdviceCommentId',
        Label: 'AdviceCommentId',
        Type: 'Text',
        md: 4,
      },
      { Name: 'UserId', Label: 'UserId', Type: 'Text', GridField: false },
      { Name: 'LikeDate', Label: 'LikeDate', Type: 'Text' },
    ],
  ];

  this.ObjectName = 'AdviceCommentRate';
  this.Model = Model;
  this.PK = 'Id';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'AdviceCommentRate',
    NewObjectTitle: 'AdviceCommentRate create',
    EditObjectTitle: 'AdviceCommentRate edit',
  };
}

module.exports = AdviceCommentRateConfig;
