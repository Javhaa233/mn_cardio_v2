class BaseHelper {
  GetBvhel(Value) {
    try {
      var result = parseInt(parseFloat('' + Value));
      if (!isNaN(result)) {
        var res = this.GetFloat(Value);
        if (res > result) {
          if (this.GetFloat(result) + this.GetFloat('0.5') <= res) return result + 1;
          else return result;
        }
        return result;
      } else {
        return 0;
      }
    } catch (ex) {
      console.log(ex);
    }
  }

  GetFloat(Value) {
    try {
      var result = parseFloat(Value);
      if (!isNaN(result)) return result;
      else return 0;
    } catch (ex) {
      console.log(ex);
    }
  }

  getDateStr(date) {
    if (date === undefined) {
      return new Date()
        .toISOString()
        .replace(/T/, ' ') // replace T with a space
        .replace(/\..+/, '');
    } else {
      return date
        .toISOString()
        .replace(/T/, ' ') // replace T with a space
        .replace(/\..+/, '');
    }
  }

  getDateNumbers(date) {
    if (date === undefined) {
      return new Date()
        .toISOString()
        .replace(/T/, '')
        .replace(/\..+/, '')
        .replace(/-/g, '')
        .replace(/:/g, '');
    } else {
      return date
        .toISOString()
        .replace(/T/, '')
        .replace(/\..+/, '')
        .replace(/-/g, '')
        .replace(/:/g, '');
    }
  }

  ObjectIsEmpty(obj) {
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) return false;
    }
    return JSON.stringify(obj) === JSON.stringify({});
  }

  ArraySort(property) {
    var sortOrder = 1;
    if (property[0] === '-') {
      sortOrder = -1;
      property = property.substr(1);
    }
    return function (a, b) {
      var result = a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
      return result * sortOrder;
    };
  }

  GetFieldList(Fields) {
    var result = [];
    for (var i = 0; i < Fields.length; i++) {
      for (var j = 0; j < Fields[i].length; j++) {
        var Field = Object.assign({}, Fields[i][j]);
        result.push(Field);
      }
    }
    return result;
  }

  GetNewObject = function (Objects) {
    return JSON.parse(JSON.stringify(Objects));
  };
}

module.exports = new BaseHelper();
// Trigger restart 1
