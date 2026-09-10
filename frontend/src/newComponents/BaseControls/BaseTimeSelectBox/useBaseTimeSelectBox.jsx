import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getValue } from "utils/helper";

const formatDate = (date) => {
  var { month, year, day } = date;
  month = month.length < 2 ? "0" + month : month;
  day = day.length < 2 ? "0" + day : day;
  return [year, month, day].join("-");
};

const getHour = (value) => {
  if (
    value &&
    typeof value === "string" &&
    value.length > 0 &&
    value.indexOf(":") > -1
  ) {
    return value.split(":")[0];
  } else {
    return "00";
  }
};
const getMinut = (value) => {
  if (
    value &&
    typeof value === "string" &&
    value.length > 0 &&
    value.indexOf(":") > -1
  ) {
    return value.split(":")[1];
  } else {
    return "00";
  }
};

export default ({ Name, ChangeValue, ValueSelector, Config, ...props }) => {
  const Value = useSelector((state) => {
    return getValue(state, ValueSelector);
  });
  const [hour, setHour] = useState();
  const [minut, setMinut] = useState();

  const renderValue = (i) => {
    return `${i}`.length === 1 ? `0${i}` : `${i}`;
  };

  useEffect(() => {
    if (Value) {
      setHour(getHour(Value));
      setMinut(getMinut(Value));
    } else {
      setHour("00");
      setMinut("00");
    }
  }, [Value]);

  const hours = () => {
    return [...Array(24)].map((x, i) => ({ id: renderValue(i) }));
  };

  const minuts = () => {
    return [...Array(12)].map((x, i) => ({ id: renderValue(i * 5) }));
  };

  useEffect(() => {
    if (hour && minut) {
      ChangeValue && ChangeValue(hour + ":" + minut, Name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hour, minut]);

  return {
    Value,
    minut,
    hour,
    hours: hours(),
    minuts: minuts(),
    setHour,
    setMinut,
    Config,
  };
};
