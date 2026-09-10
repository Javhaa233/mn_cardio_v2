const { Models } = require('../config/DB');
const Model = Models.AdviceComment;

function AdviceCommentConfig() {
  this.Fields = [
    [
      {
        Name: 'Users.UserName',
        Label: 'UserName',
        Type: 'Text',
        Position: 0,
        GridField: true,
      },
      {
        Name: 'adv_com_comment',
        Label: 'Comment',
        Type: 'TextArea',
        Position: 1,
      },
      { Name: 'adv_com_id_adv', Label: 'Advice ID', Type: 'Text', Position: 2 },
      {
        Name: 'date_creation',
        Label: 'Date de cr',
        Type: 'Date',
        Position: 3,
        GridField: false,
      },
      {
        Name: 'date_modif',
        Label: 'Date de modification',
        Type: 'Date',
        Position: 4,
        GridField: false,
      },
      {
        Name: 'id',
        Label: "Identifiant d'utilisateur",
        Type: 'SingleSelect',
        Config: { Model: Models.Users, IdField: 'Id', TextField: 'UserName' },
        Position: 5,
        GridField: false,
      },
      {
        Name: 'id_data',
        Label: 'Identifiant de la fiche',
        Type: 'Text',
        Position: 6,
        GridField: false,
      },
      {
        Name: 'id_group',
        Label: 'Groupe',
        Type: 'Text',
        Position: 7,
        GridField: false,
      },
      {
        Name: 'rec_status',
        Label: 'Status',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        OptionType: 'rec_status',
        Position: 10,
      },
      {
        Name: 'user_mod',
        Label: 'Auteur de la derni',
        Type: 'Text',
        Position: 12,
        GridField: false,
      },
      {
        Name: 'Files',
        Label: 'Files',
        Type: 'File',
        Position: 0,
        GridField: false,
      },
    ],
  ];

  this.ObjectName = 'AdviceComment';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'id_data';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Advice comment',
    NewObjectTitle: 'Advice comment create',
    EditObjectTitle: 'Advice comment edit',
  };
}

module.exports = AdviceCommentConfig;
