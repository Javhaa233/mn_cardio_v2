import i18n from "i18n";
class ObjectHelper {
  GetBvhel(Value) {
    try {
      var result = parseInt(parseFloat("" + Value));
      if (!isNaN(result)) {
        var res = this.GetFloat(Value);
        if (res > result) {
          if (this.GetFloat(result) + this.GetFloat("0.5") <= res) {
            return result + 1;
          } else {
            return result;
          }
        }
        return result;
      } else {
        return 0;
      }
    } catch (ex) {
      process.env.NODE_ENV === "development" && console.log(ex);
    }
  }

  GetFloat(Value) {
    try {
      var result = parseFloat(Value);
      if (!isNaN(result)) return result;
      else return 0;
    } catch (ex) {
      process.env.NODE_ENV === "development" && console.log(ex);
    }
  }

  getValue = function (Obj, FieldName) {
    try {
      var Names = FieldName.split(".");
      var ValObj = Obj;
      for (var i = 0; i < Names.length; i++) {
        ValObj = ValObj[Names[i]];
      }
      return ValObj;
    } catch (ex) {
      return null;
    }
  };

  getDateY = function (Option) {
    var date = null;
    if (!Option) {
      date = new Date();
    } else {
      if (!Option.Date && Option.DateStr)
        date = new Date(Option.DateStr.replace(".000Z", ""));
      if (Option.Date && !Option.DateStr) date = Option.Date;
      if (!Option.Date && !Option.DateStr) date = new Date();
    }
    return date.getFullYear();
  };

  getDateYM = function (Option) {
    var date = null;
    if (!Option) {
      date = new Date();
    } else {
      if (!Option.Date && Option.DateStr)
        date = new Date(Option.DateStr.replace(".000Z", ""));
      if (Option.Date && !Option.DateStr) date = Option.Date;
      if (!Option.Date && !Option.DateStr) date = new Date();
    }

    function pad2(n) {
      return (n < 10 ? "0" : "") + n;
    }
    return date.getFullYear() + "-" + pad2(date.getMonth() + 1);
  };

  getDateM = function (Option) {
    var date = null;
    if (!Option) {
      date = new Date();
    } else {
      if (!Option.Date && Option.DateStr)
        date = new Date(Option.DateStr.replace(".000Z", ""));
      if (Option.Date && !Option.DateStr) date = Option.Date;
      if (!Option.Date && !Option.DateStr) date = new Date();
    }
    return date.getMonth() + 1;
  };

  getDateYMD = function (Option) {
    var date = null;
    if (!Option) {
      date = new Date();
    } else {
      if (!Option.Date && Option.DateStr)
        date = new Date(Option.DateStr.replace(".000Z", ""));
      if (Option.Date && !Option.DateStr) date = Option.Date;
      if (!Option.Date && !Option.DateStr) date = new Date();
    }

    function pad2(n) {
      return (n < 10 ? "0" : "") + n;
    }
    return (
      date.getFullYear() +
      "-" +
      pad2(date.getMonth() + 1) +
      "-" +
      pad2(date.getDate())
    );
  };

  /**
   * A date for DISPLAY, or an empty string.
   *
   * `getDateYMD` above defaults to `new Date()` whenever it is handed nothing,
   * which is right for "stamp this record now" and actively wrong for showing
   * a stored value: a row with no date then renders as today, which reads as
   * real data. That is the same trap BaseSimpleDate has.
   *
   * It also copes with the two shapes the API actually returns for the same
   * column - a plain "2021-11-09" and a full "2011-10-13T09:27:31.000Z" -
   * which were reaching the advice list and the home tiles unformatted.
   */
  getDateYMDDisplay = function (value) {
    if (value === null || value === undefined || value === "") return "";
    const parsed = new Date(String(value).replace(".000Z", ""));
    if (isNaN(parsed.getTime())) return String(value);
    return this.getDateYMD({ Date: parsed });
  };

  getDateYMDHMS = function (Option) {
    var date = null;
    if (!Option) {
      date = new Date();
    } else {
      if (!Option.Date && Option.DateStr)
        date = new Date(Option.DateStr.replace(".000Z", ""));
      if (Option.Date && !Option.DateStr) date = Option.Date;
      if (!Option.Date && !Option.DateStr) date = new Date();
    }

    function pad2(n) {
      return (n < 10 ? "0" : "") + n;
    }
    return (
      date.getFullYear() +
      "-" +
      pad2(date.getMonth() + 1) +
      "-" +
      pad2(date.getDate()) +
      " " +
      pad2(date.getHours()) +
      ":" +
      pad2(date.getMinutes()) +
      ":" +
      pad2(date.getSeconds())
    );
  };

  getDateToStrFromStr = function (dateStr) {
    if (dateStr === undefined) {
      return new Date()
        .toISOString()
        .replace(/T/, " ") // replace T with a space
        .replace(/\..+/, "");
    } else {
      return dateStr
        .replace(/T/, " ") // replace T with a space
        .replace(/\..+/, "");
    }
  };

  getDateNumbers = function (date) {
    if (date === undefined) {
      return new Date()
        .toISOString()
        .replace(/T/, "")
        .replace(/\..+/, "")
        .replace(/-/g, "")
        .replace(/:/g, "");
    } else {
      return date
        .toISOString()
        .replace(/T/, "")
        .replace(/\..+/, "")
        .replace(/-/g, "")
        .replace(/:/g, "");
    }
  };

  ArraySort = function (property) {
    var sortOrder = 1;
    if (property[0] === "-") {
      sortOrder = -1;
      property = property.substr(1);
    }
    return function (a, b) {
      var result =
        a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
      return result * sortOrder;
    };
  };

  ArraySortDesc = function (property) {
    var sortOrder = 1;
    if (property[0] === "-") {
      sortOrder = -1;
      property = property.substr(1);
    }
    return function (a, b) {
      var result =
        a[property] > b[property] ? -1 : a[property] < b[property] ? 1 : 0;
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

  // Registration number structure: LLYYMMDDNN (LL=letters, YYMMDD=birthdate, NN=numbers)
  // If born in 2000+, MM is +20 (e.g. 21=January 2000s, 32=December 2000s)
  // Same rule as backend getBirthDateAndAge (CVDMonitoringController)
  GetBirthDateFromRegNo = function (RegNo) {
    const Empty = { BirthDate: null, Age: null };
    if (!RegNo || typeof RegNo !== "string") return Empty;

    const regNoUpper = RegNo.replace(/\s/g, "").toUpperCase();

    // Must start with exactly 2 Cyrillic or Latin letters
    if (!/^[A-ZА-ЯӨҮЁ]{2}/.test(regNoUpper)) return Empty;

    const datePart = regNoUpper.substring(2, 8);
    if (!/^\d{6}$/.test(datePart)) return Empty;

    const yy = parseInt(datePart.substring(0, 2), 10);
    const mm = parseInt(datePart.substring(2, 4), 10);
    const dd = parseInt(datePart.substring(4, 6), 10);

    var year, month;
    if (mm >= 21 && mm <= 32) {
      year = 2000 + yy;
      month = mm - 20;
    } else if (mm >= 1 && mm <= 12) {
      year = 1900 + yy;
      month = mm;
    } else {
      return Empty;
    }

    if (dd < 1 || dd > 31) return Empty;

    const birthDate = new Date(year, month - 1, dd);
    // Reject impossible dates (e.g. Feb 30) that Date rolls over
    if (
      birthDate.getFullYear() !== year ||
      birthDate.getMonth() !== month - 1 ||
      birthDate.getDate() !== dd
    ) {
      return Empty;
    }

    const today = new Date();
    if (birthDate > today) return Empty;

    var age = today.getFullYear() - year;
    const m = today.getMonth() - (month - 1);
    if (m < 0 || (m === 0 && today.getDate() < dd)) age--;

    return {
      BirthDate: `${year}-${String(month).padStart(2, "0")}-${String(
        dd,
      ).padStart(2, "0")}`,
      Age: age,
    };
  };

  getGenderLabel = function (Value) {
    if (!Value) return "";
    const valStr = String(Value).toUpperCase();
    if (valStr === "1" || valStr === "F" || valStr === "FEMALE") {
      return i18n.t("Female");
    } else if (valStr === "2" || valStr === "M" || valStr === "MALE") {
      return i18n.t("Male");
    }
    return i18n.t(Value + "");
  };
}

export default new ObjectHelper();
