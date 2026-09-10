class EditObjectHelper {
  OnChanges = [];

  DialogLoad = function (Fields, EditObject, callback) {};

  ValueChange = function (Field, Value, EditObject, Fields, callback) {
    for (var i = 0; i < this.OnChanges.length; i++) {
      if (Field === this.OnChanges[i].Field) {
        typeof this.OnChanges[i].callback === "function" &&
          this.OnChanges[i].callback(Value, Fields, callback);
      }
    }
  };

  GetField = function (Fields, Name, callback) {
    for (var i = 0; i < Fields.length; i++) {
      for (var j = 0; j < Fields[i].length; j++) {
        if (Fields[i][j].Name === Name) callback && callback(Fields[i][j]);
      }
    }
  };
}

export default new EditObjectHelper();
