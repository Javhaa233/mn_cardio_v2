import React, { useState, useEffect } from "react";
// @mui/material components
import {
  Box,
  Button,
  TextField,
  InputAdornment,
  Typography,
} from "@mui/material";
// @mui/icons-material
import SearchIcon from "@mui/icons-material/Search";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
// translation
import { useTranslation } from "react-i18next";
// custom components
import SimpleSelect from "customComponents/SimpleSelect";
import Datetime from "customComponents/DateTime";
// helper
import Helper from "helper";
import { colors } from "@/theme/colors";
import { space, radius } from "@/theme/tokens";
import { gridToolbarButtonSx } from "@/theme/controlStyles";

/**
 * RangeDate Component
 *
 * A functional component for selecting date ranges with presets.
 * This is a migrated version from the original class component.
 *
 * Benefits of the migration to functional component:
 * 1. Simpler and cleaner syntax
 * 2. Better performance due to removal of unnecessary lifecycle methods
 * 3. Easier to test and debug
 * 4. Uses hooks for state and side effects management
 * 5. More readable and maintainable code
 */
// Every control in the filter bar - dates, range select, buttons - shares
// this height and radius so the row reads as one toolbar.
const CONTROL_HEIGHT = "32px";

const RangeDate = ({
  ChangeValue,
  hideRefresh,
  Refresh,
  Width = "560px",
  Search,
  HideSearchText = false,
}) => {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState("");

  const ConfigObj = {
    Name: "hugatsaa",
    Value: "1",
    Config: { IdField: "Value", TextField: "Label" },
    Data: [
      { Label: t("1 жил"), Value: "1" },
      { Label: t("6 сар"), Value: "2" },
      { Label: t("1 сар"), Value: "3" },
      { Label: t("7 хоног"), Value: "4" },
    ],
  };

  // Helper to get default "1 year" start date
  const getDefaultStartDate = () => {
    const d = new Date();
    d.setMonth(d.getMonth() - 12);
    return Helper.ObjectHelper.getDateYMD({ Date: d });
  };

  // State
  const [startDate, setStartDate] = useState(getDefaultStartDate());
  const [endDate, setEndDate] = useState(Helper.ObjectHelper.getDateYMD());
  const [selectValue, setSelectValue] = useState("1");
  const isInitialMount = React.useRef(true);
  const prevDates = React.useRef({ startDate, endDate });

  // Effect to notify parent when dates change
  useEffect(() => {
    // Skip the initial mount to prevent calling ChangeValue on component load
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevDates.current = { startDate, endDate };
      return;
    }

    // Only call ChangeValue if the dates have actually changed
    if (
      ChangeValue &&
      startDate &&
      endDate &&
      (startDate !== prevDates.current.startDate ||
        endDate !== prevDates.current.endDate)
    ) {
      prevDates.current = { startDate, endDate };
      ChangeValue(startDate, endDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  // Logic to calculate date ranges based on dropdown
  const handleRangeChange = React.useCallback((value) => {
    setSelectValue(value);

    if (value === "-1") {
      setStartDate(null);
      setEndDate(null);
      return;
    }

    const nowDate = new Date();

    // Logic specific to your requirements
    if (value === "1") nowDate.setMonth(nowDate.getMonth() - 12); // 1 year
    if (value === "2") nowDate.setMonth(nowDate.getMonth() - 6); // 6 months
    if (value === "3") nowDate.setMonth(nowDate.getMonth() - 1); // 1 month
    if (value === "4") nowDate.setDate(nowDate.getDate() - 7); // 7 days

    setStartDate(Helper.ObjectHelper.getDateYMD({ Date: nowDate }));
    setEndDate(Helper.ObjectHelper.getDateYMD());
  }, []);

  const handleRefresh = React.useCallback(() => {
    if (Refresh) Refresh();
  }, [Refresh]);

  return (
    <div style={{ width: "100%" }}>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: space[2],
          "& .MuiOutlinedInput-root, & .MuiInputBase-root": {
            height: CONTROL_HEIGHT,
            minHeight: CONTROL_HEIGHT,
            borderRadius: radius.xs,
            backgroundColor: colors.brand.surface,
          },
          "& .MuiOutlinedInput-input, & .MuiSelect-select": {
            display: "flex",
            alignItems: "center",
            color: colors.brand.ink,
          },
          "& .MuiButton-root": {
            height: CONTROL_HEIGHT,
            minHeight: CONTROL_HEIGHT,
          },
        }}
      >
        {/* Two bare date boxes side by side do not say what they are. */}
        <Typography
          variant="caption"
          component="label"
          sx={{ color: colors.brand.inkDim, flex: "0 0 auto" }}
        >
          {t("Хугацаа")}
        </Typography>

        <Datetime
          dateFormat="yyyy-MM-dd"
          Value={startDate || ""}
          maxDate={endDate || undefined}
          ChangeValue={setStartDate}
          FullWidth={true}
          Variant="outlined"
          Sx={{ flex: "0 1 122px", minWidth: "122px" }}
        />
        <Datetime
          dateFormat="yyyy-MM-dd"
          Value={endDate || ""}
          minDate={startDate || undefined}
          ChangeValue={setEndDate}
          FullWidth={true}
          Variant="outlined"
          Sx={{ flex: "0 1 122px", minWidth: "122px" }}
        />
        <SimpleSelect
          ChangeValue={handleRangeChange}
          Config={ConfigObj}
          defaultValueLabel="Бүх хугацаа"
          Variant="outlined"
          Value={selectValue}
          FullWidth={false}
          Width="110px"
          Sx={{ minWidth: "110px", height: CONTROL_HEIGHT + " !important" }}
        />
        {!hideRefresh && (
          <Button
            size="small"
            disableElevation
            onClick={handleRefresh}
            startIcon={<FilterAltOutlinedIcon />}
            sx={{
              ...gridToolbarButtonSx.primary,
              height: CONTROL_HEIGHT,
              minWidth: "100px",
            }}
          >
            {t("Filter")}
          </Button>
        )}
        {!HideSearchText && Search && (
          <TextField
            placeholder={t("Search field") + "..."}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && Search(searchText)}
            size="small"
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon
                    style={{ color: colors.brand.inkDim, fontSize: "18px" }}
                  />
                </InputAdornment>
              ),
            }}
            sx={{
              minWidth: "160px",
              flex: "1 1 220px",
              "& .MuiInputBase-input": { padding: "4px 8px" },
            }}
          />
        )}
        {!HideSearchText && Search && (
          <Button
            size="small"
            disableElevation
            onClick={() => Search(searchText)}
            startIcon={<SearchIcon />}
            sx={{
              ...gridToolbarButtonSx.neutral,
              height: CONTROL_HEIGHT,
              minWidth: "80px",
            }}
          >
            {t("Search")}
          </Button>
        )}
      </Box>
    </div>
  );
};

export default RangeDate;
