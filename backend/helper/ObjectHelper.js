class ObjectHelper {
  getValue = function (Obj, FieldName) {
    try {
      var Names = FieldName.split('.');
      var ValObj = Obj;
      for (var i = 0; i < Names.length; i++) {
        ValObj = ValObj[Names[i]];
      }
      return ValObj;
    } catch (ex) {
      return null;
    }
  };

  getStrData = function (strData, Field) {
    var temp = [];
    var strData = strData;
    if (Field && Field.Type === 'Date' && strData && strData.indexOf('Z') !== -1)
      strData = this.getDateYMDHMS({ DateStr: strData });
    if (Field && Field.OptionType && Array.isArray(Field.Data)) {
      temp = Field.Data.filter((s) => s.Value + '' === strData + '');
      if (temp.length > 0) strData = temp[0].Label;
    } else if (
      Field &&
      Field.Config &&
      Field.Type === 'SingleSelect' &&
      Field.Data &&
      Field.Data.length > 0
    ) {
      temp = Field.Data.filter((s) => s[Field.Config.IdField] + '' === strData + '');
      if (temp.length > 0) strData = temp[0][Field.Config.TextField];
    }
    if (strData === null) strData = '';
    else strData = strData + '';
    return strData;
  };

  getDateYMD = function (Option) {
    var date = null;
    if (!Option) {
      date = new Date();
    } else {
      if (!Option.Date && Option.DateStr) date = new Date(Option.DateStr.replace('.000Z', ''));
      if (Option.Date && !Option.DateStr) date = Option.Date;
      if (!Option.Date && !Option.DateStr) date = new Date();
    }

    function pad2(n) {
      return (n < 10 ? '0' : '') + n;
    }
    return date.getFullYear() + '-' + pad2(date.getMonth() + 1) + '-' + pad2(date.getDate());
  };

  getRomanizeMonth = function (Month) {
    var Month = Month + '';
    var RomanText = '';
    if (Month === '1') {
      RomanText = 'I';
    } else if (Month === '2') {
      RomanText = 'II';
    } else if (Month === '3') {
      RomanText = 'III';
    } else if (Month === '4') {
      RomanText = 'IV';
    } else if (Month === '5') {
      RomanText = 'V';
    } else if (Month === '6') {
      RomanText = 'VI';
    } else if (Month === '7') {
      RomanText = 'VII';
    } else if (Month === '8') {
      RomanText = 'VIII';
    } else if (Month === '9') {
      RomanText = 'IX';
    } else if (Month === '10') {
      RomanText = 'X';
    } else if (Month === '11') {
      RomanText = 'XI';
    } else if (Month === '12') {
      RomanText = 'XII';
    }
    return RomanText;
  };

  getDateYMDHMS = function (Option) {
    var date = null;
    if (!Option) {
      date = new Date();
    } else {
      if (!Option.Date && Option.DateStr) date = new Date(Option.DateStr.replace('.000Z', ''));
      if (Option.Date && !Option.DateStr) date = Option.Date;
      if (!Option.Date && !Option.DateStr) date = new Date();
    }

    function pad2(n) {
      return (n < 10 ? '0' : '') + n;
    }

    return (
      date.getFullYear() +
      '-' +
      pad2(date.getMonth() + 1) +
      '-' +
      pad2(date.getDate()) +
      ' ' +
      pad2(date.getHours()) +
      ':' +
      pad2(date.getMinutes()) +
      ':' +
      pad2(date.getSeconds())
    );
  };

  getDateToStrFromStr = function (dateStr) {
    if (dateStr === undefined) {
      return new Date()
        .toISOString()
        .replace(/T/, ' ') // replace T with a space
        .replace(/\..+/, '');
    } else {
      return dateStr
        .replace(/T/, ' ') // replace T with a space
        .replace(/\..+/, '');
    }
  };

  getDateNumbers = function (date) {
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
  };

  ArraySort = function (property) {
    var sortOrder = 1;
    if (property[0] === '-') {
      sortOrder = -1;
      property = property.substr(1);
    }
    return function (a, b) {
      var result = a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
      return result * sortOrder;
    };
  };

  GetAgeDateStr = function (dateString) {
    var today = new Date();
    var birthDate = new Date(dateString);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };
}

module.exports = new ObjectHelper();
