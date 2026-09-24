const { Models } = require('../config/DB');
const Model = Models.RehabMovement;

/**
 * One looping clip inside an exercise (9:16, silent MP4, 3-8 s; see
 * video/higgsfield-exercise-loops.md). Timed (WorkSec) or counted (Reps) per
 * movement. PrepSec is the "Дараагийн дасгал" preview, never below 10 in the
 * API. GuideText is one step per line. MediaRef / ThumbRef use the
 * helper/MediaRef.js prefix scheme. LoopStartMs / LoopEndMs loop a segment of an
 * uncut recording, for demos before clips are cut.
 */
function RehabMovementConfig() {
  this.Fields = [
    [
      { Name: 'Id', Label: 'Id', Type: 'Text', md: 4, Position: 1, EditField: false },
      { Name: 'ExerciseId', Label: 'Exercise', Type: 'Number', md: 4, Position: 1, Required: true },
      { Name: 'OrderNo', Label: 'Order', Type: 'Number', md: 4, Position: 1 },
      { Name: 'Name', Label: 'Movement name', Type: 'Text', md: 8, Position: 2, Required: true },
      { Name: 'WorkSec', Label: 'Time (sec)', Type: 'Number', md: 4, Position: 2 },
      { Name: 'Reps', Label: 'Repetitions', Type: 'Number', md: 4, Position: 3 },
      { Name: 'PrepSec', Label: 'Preview (sec)', Type: 'Number', md: 4, Position: 3 },
      { Name: 'RestSec', Label: 'Rest (sec)', Type: 'Number', md: 4, Position: 3 },
      { Name: 'Sets', Label: 'Sets', Type: 'Number', md: 4, Position: 3 },
      {
        Name: 'SetRestSec',
        Label: 'Rest between sets (sec)',
        Type: 'Number',
        md: 4,
        Position: 3,
        GridField: false,
      },
      {
        Name: 'WarningText',
        Label: 'Warning',
        Type: 'TextArea',
        md: 12,
        Position: 4,
        GridField: false,
      },
      // JSON, written by /RehabContent/SaveMovement, which validates it.
      {
        Name: 'Cues',
        Label: 'Messages (JSON)',
        Type: 'TextArea',
        md: 12,
        Position: 4,
        GridField: false,
        EditField: false,
      },
      {
        Name: 'GuideText',
        Label: 'Steps (one per line)',
        Type: 'TextArea',
        md: 12,
        Position: 4,
        GridField: false,
      },
      {
        Name: 'MediaRef',
        Label: 'Loop video reference',
        Type: 'Text',
        md: 8,
        Position: 5,
        GridField: false,
      },
      { Name: 'IsActive', Label: 'Active', Type: 'CheckBox', md: 4, Position: 5 },
      {
        Name: 'ThumbRef',
        Label: 'Photo reference',
        Type: 'Text',
        md: 8,
        Position: 6,
        GridField: false,
      },
      {
        Name: 'LoopStartMs',
        Label: 'Loop start (ms)',
        Type: 'Number',
        md: 4,
        Position: 7,
        GridField: false,
      },
      {
        Name: 'LoopEndMs',
        Label: 'Loop end (ms)',
        Type: 'Number',
        md: 4,
        Position: 7,
        GridField: false,
      },
    ],
  ];

  this.ObjectName = 'RehabMovement';
  this.Model = Model;
  this.PK = 'Id';
  this.OptionTypes = Models.OptionTypes;
  this.NewObject = { IsActive: true, PrepSec: 10 };
  this.TitleObject = {
    Title: 'Exercise movements',
    NewObjectTitle: 'New movement',
    EditObjectTitle: 'Edit movement',
  };
}

module.exports = RehabMovementConfig;
