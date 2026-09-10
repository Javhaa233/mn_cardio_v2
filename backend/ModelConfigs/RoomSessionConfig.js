const { Models } = require('../config/DB');
const Model = Models.RoomSession;

function RoomSessionConfig() {
  this.Fields = [
    [
      {
        Name: 'date_creation',
        Label: 'Date de cr',
        Type: 'Date',
        md: 4,
        Position: 1,
      },
      {
        Name: 'date_leave',
        Label: 'Date leave',
        Type: 'Date',
        md: 4,
        Position: 2,
      },
      {
        Name: 'date_modif',
        Label: 'Date de modification',
        Type: 'Date',
        md: 4,
        Position: 3,
      },
      {
        Name: 'id',
        Label: "Identifiant d'utilisateur",
        Type: 'Text',
        md: 4,
        Position: 4,
      },
      {
        Name: 'id_data',
        Label: 'Identifiant de la fiche',
        Type: 'Text',
        md: 4,
        Position: 5,
      },
      { Name: 'id_group', Label: 'Groupe', Type: 'Text', md: 4, Position: 6 },
      {
        Name: 'rec_status',
        Label: 'Status',
        Type: 'RadioBox',
        Config: { IdField: 'Value', TextField: 'Label' },
        md: 4,
        OptionType: 'rec_status',
        Position: 9,
      },
      { Name: 'room_id', Label: 'Room ID', Type: 'Text', md: 4, Position: 11 },
      {
        Name: 'user_mod',
        Label: 'Auteur de la derni',
        Type: 'Text',
        md: 4,
        Position: 12,
      },
    ],
  ];

  this.ObjectName = 'RoomSession';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'id_data';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Room session',
    NewObjectTitle: 'Room session create',
    EditObjectTitle: 'Room session edit',
  };
}

module.exports = RoomSessionConfig;
