import React, { useState, useEffect } from "react";
// translation
import { useTranslation } from "react-i18next";
// custom components
import Datetime from "customComponents/DateTime";
// helper
import Helper from "helper";

/**
 * ReportRangeDate Component
 *
 * A functional component for selecting date ranges for reports.
 */
const ReportRangeDate = ({ StartDate: propStartDate, ChangeValue }) => {
  const { t } = useTranslation();

  // State
  const [startDate, setStartDate] = useState(
    propStartDate || Helper.ObjectHelper.getDateYMD(),
  );
  const [endDate, setEndDate] = useState(Helper.ObjectHelper.getDateYMD());

  // Notify parent when date range changes
  useEffect(() => {
    if (ChangeValue && startDate && endDate) {
      ChangeValue(startDate, endDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  const labelStyle = {
    padding: 0,
    margin: "0 0 2px 0", // 🔽 reduced gap
    lineHeight: "14px",
    fontSize: "12px",
  };

  return (
    <div>
      {/* Label */}
      <h5 style={labelStyle}>{t("Date")}</h5>

      {/* Date range */}
      <div
        style={{
          display: "flex",
          flexWrap: "nowrap",
          gap: "8px",
          width: "100%",
        }}
      >
        {/* Start date */}
        <div style={{ flex: "0 0 110px", minWidth: 100 }}>
          <Datetime
            dateFormat="YYYY-MM"
            Value={Helper.ObjectHelper.getDateYM({ DateStr: startDate })}
            maxDate={endDate}
            ChangeValue={setStartDate}
            ViewMode="months"
            FullWidth
            Variant="outlined"
          />
        </div>

        {/* End date */}
        <div style={{ flex: "0 0 110px", minWidth: 100 }}>
          <Datetime
            dateFormat="YYYY-MM"
            Value={Helper.ObjectHelper.getDateYM({ DateStr: endDate })}
            minDate={startDate}
            ChangeValue={setEndDate}
            ViewMode="months"
            FullWidth
            Variant="outlined"
          />
        </div>
      </div>
    </div>
  );
};

export default ReportRangeDate;
