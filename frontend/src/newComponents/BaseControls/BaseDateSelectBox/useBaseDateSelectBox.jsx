import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { getValue } from "utils/helper";

const formatDate = (date) => {
  var { month, year, day } = date;
  month = month.length < 2 ? "0" + month : month;
  day = day.length < 2 ? "0" + day : day;
  return [year, month, day].join("-");
};

export default ({ Name, ChangeValue, ValueSelector, ...props }) => {
  const Value = useSelector((state) => {
    return getValue(state, ValueSelector);
  });
  const [totalDays, setTotalDays] = useState(0);

  const [year, setYear] = useState(Value ? new Date(Value).getFullYear() : 0);
  const [month, setMonth] = useState(
    Value ? new Date(Value).getMonth() + 1 : 0,
  );
  const [day, setDay] = useState(Value ? new Date(Value).getDate() : 0);

  const [years, setYears] = useState([]);
  const [months, setMonths] = useState([]);
  const [days, setDays] = useState([]);

  const daysInMonth = () => {
    if (year && month) {
      return new Date(year, month, 0).getDate();
    }
    return 0;
  };

  useEffect(() => {
    var y = [];
    for (var i = 2000; i <= new Date().getFullYear(); i++) {
      y.push({ year: i });
    }

    var m = [...Array(12)].map((x, mm) => {
      return { month: mm + 1 };
    });
    setMonths(m);
    setYears(y);
  }, []);

  useEffect(() => {
    var d = [...Array(totalDays)].map((x, mm) => {
      return { day: mm + 1 };
    });
    setDays(d);
  }, [totalDays]);

  useEffect(() => {
    const totalDay = daysInMonth();
    setTotalDays(totalDay);
    totalDay < day && setDay(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month]);

  useEffect(() => {
    if (year && month && day) {
      const val = formatDate({
        year: year + "",
        month: month + "",
        day: day + "",
      });
      ChangeValue && ChangeValue(val, Name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month, day]);

  return {
    Value,
    days,
    year,
    month,
    day,
    setYear,
    setMonth,
    setDay,
    years,
    months,
  };
};
