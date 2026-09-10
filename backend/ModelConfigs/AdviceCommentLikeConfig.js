const { Models } = require('../config/DB');
const Model = Models.AdviceCommentLike;

function AdviceCommentLikeConfig() {
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

  this.ObjectName = 'AdviceCommentLike';
  this.Model = Model;
  this.PK = 'Id';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'AdviceCommentLike',
    NewObjectTitle: 'AdviceCommentLike create',
    EditObjectTitle: 'AdviceCommentLike edit',
  };
}

module.exports = AdviceCommentLikeConfig;
