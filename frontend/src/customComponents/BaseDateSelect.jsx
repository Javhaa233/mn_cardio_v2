import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from "react";
import SimpleSelect from "customComponents/SimpleSelect";
import Helper from "helper";

export default function BaseDateSelect(props) {
  const { t } = useTranslation();

  // "4" (7 days) stays the default, so every existing caller behaves exactly as
  // before. Screens whose data is not daily can ask for a wider opening range
  // rather than showing an empty chart on load.
  const { AutoLoad, ChangeValue, DefaultRange = "4" } = props;

  const ConfigObj = {
    Name: "hugatsaa",
    Value: DefaultRange,
    Config: { IdField: "Value", TextField: "Label" },
    Data: [
      { Label: t("1 year"), Value: 1 },
      { Label: t("6 months"), Value: 2 },
      { Label: t("1 month"), Value: 3 },
      { Label: t("7 days"), Value: 4 },
    ],
  };

  const [SelectValue, setSelectValue] = useState(Number(DefaultRange));

  useEffect(() => {
    AutoLoad && ChangeDateRangeSelect(String(DefaultRange));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ChangeDateRangeSelect = (selectValue) => {
    var NowDate = new Date();
    var eDate = "";
    var Type = "";
    if (selectValue === "1") {
      //1 jil
      Type = "1YEAR";
      NowDate.setMonth(NowDate.getMonth() - 12);
    }
    if (selectValue === "2") {
      //6 sar
      Type = "6MONTH";
      NowDate.setMonth(NowDate.getMonth() - 6);
    }
    if (selectValue === "3") {
      //1 sar
      Type = "1MONTH";
      NowDate.setMonth(NowDate.getMonth() - 1);
    }
    if (selectValue === "4") {
      //7 honog
      Type = "7DAYS";
      NowDate.setDate(NowDate.getDate() - 7);
    }
    eDate = Helper.ObjectHelper.getDateYMD();
    ChangeValue &&
      ChangeValue({
        StartDate: Helper.ObjectHelper.getDateYMD({ Date: NowDate }),
        EndDate: eDate,
        SelectType: Type,
      });
  };

  return (
    <SimpleSelect
      ChangeValue={(Value) => {
        setSelectValue(Value);
        ChangeDateRangeSelect(Value);
      }}
      DefaultValue={SelectValue}
      Config={ConfigObj}
      Variant="outlined"
      FullWidth={true}
      Sx={{
        "& .MuiSelect-select": {
          padding: "4px 8px 4px 10px !important",
          fontSize: "12px",
        },
        borderRadius: "4px",
      }}
    />
  );
}
