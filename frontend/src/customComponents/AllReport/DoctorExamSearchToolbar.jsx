import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
// @mui/material components
import {
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
// @mui/icons-material
import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/Download";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
// custom components
import Datetime from "customComponents/DateTime";
import SimpleSelect from "customComponents/SimpleSelect";
import ReportLocationSelect from "customComponents/AllReport/ReportLocationSelect";
// helper
import Helper from "helper";
// theme
import { colors } from "@/theme/colors";
import { space, radius } from "@/theme/tokens";
import { gridToolbarButtonSx } from "@/theme/controlStyles";

// Бүх хяналт нэг мөр шиг харагдахын тулд нэг өндөр, нэг радиус.
const CONTROL_HEIGHT = "32px";

// Хугацааны бэлэн сонголтууд. "-1" нь SimpleSelect-ийн defaultValueLabel-ийн
// утга бөгөөд БҮХ ЦАГ ҮЕ-ийг илэрхийлнэ - хоёр огнооны талбарыг цэвэрлэнэ.
// "0" нь хэрэглэгч огноогоо гараар өөрчилсөн үед тавигдана, ингэснээр сонголтын
// бичиг талбарууд дээрх утгатай зөрөхгүй.
const PERIOD_ALL = "-1";
const PERIOD_CUSTOM = "0";
const PERIOD_MONTHS = { 1: 12, 2: 6, 3: 3, 4: 1 };

/**
 * Эмчийн нэгдсэн үзлэгийн тайлангийн шүүлтийн мөр.
 *
 * Огноо анхнаасаа хоосон - тайлан нь эхлээд БҮХ хугацааг харуулна. Ашиглалтын
 * тайлангийн эхний асуулт "хэн огт ашиглаагүй вэ" учраас анхдагчаар хугацаа
 * хязгаарлах нь хариуг нь нуудаг.
 *
 * Ачаалалтын төлвийг callback дээр унтраана - хуучин SearchToolbar.jsx нь
 * setTimeout(2000)-оор унтраадаг, өгөгдөл ирсэн эсэхээс үл хамаарна.
 */
export default function DoctorExamSearchToolbar({
  Search,
  ExportExcel,
  ExportText,
}) {
  const { t } = useTranslation();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [period, setPeriod] = useState(PERIOD_ALL);
  const [searchText, setSearchText] = useState("");
  const [location, setLocation] = useState({
    addr_prov_city: null,
    addr_soum_dist: null,
    addr_bag_khoroo: null,
  });

  const [searching, setSearching] = useState(false);
  const [exporting, setExporting] = useState(null);

  const BuildFilter = useCallback(
    () => ({
      StartDate: startDate || null,
      EndDate: endDate || null,
      SearchText: searchText || null,
      addr_prov_city: location.addr_prov_city,
      addr_soum_dist: location.addr_soum_dist,
      addr_bag_khoroo: location.addr_bag_khoroo,
    }),
    [startDate, endDate, searchText, location],
  );

  const PeriodConfig = useMemo(
    () => ({
      Name: "period",
      Config: { IdField: "Value", TextField: "Label" },
      Data: [
        { Label: t("1 жил"), Value: "1" },
        { Label: t("6 сар"), Value: "2" },
        { Label: t("3 сар"), Value: "3" },
        { Label: t("1 сар"), Value: "4" },
        { Label: t("7 хоног"), Value: "5" },
        { Label: t("Бусад (гараар)"), Value: PERIOD_CUSTOM },
      ],
    }),
    [t],
  );

  const handlePeriodChange = useCallback((Value) => {
    setPeriod(Value);

    // Бүх цаг үе: огноог цэвэрлэнэ. Сервер тал огноогүй үед хугацааны шүүлтийг
    // огт нэмдэггүй тул бүх бичлэг тоологдоно.
    if (Value === PERIOD_ALL) {
      setStartDate("");
      setEndDate("");
      return;
    }
    // Гараар сонгосон бол одоо байгаа огноог хэвээр үлдээнэ.
    if (Value === PERIOD_CUSTOM) return;

    const From = new Date();
    if (Value === "5") From.setDate(From.getDate() - 7);
    else From.setMonth(From.getMonth() - (PERIOD_MONTHS[Value] || 12));

    setStartDate(Helper.ObjectHelper.getDateYMD({ Date: From }));
    setEndDate(Helper.ObjectHelper.getDateYMD());
  }, []);

  // Огноог гараар өөрчилбөл сонголтын бичиг худал болохоос сэргийлнэ.
  const handleDateChange = useCallback((Setter) => {
    return (Value) => {
      Setter(Value);
      setPeriod(PERIOD_CUSTOM);
    };
  }, []);

  const handleSearch = useCallback(() => {
    if (!Search) return;
    setSearching(true);
    Search(BuildFilter(), () => setSearching(false));
  }, [Search, BuildFilter]);

  const handleExport = useCallback(
    (kind) => {
      const fn = kind === "txt" ? ExportText : ExportExcel;
      if (!fn) return;
      setExporting(kind);
      fn(BuildFilter(), () => setExporting(null));
    },
    [ExportExcel, ExportText, BuildFilter],
  );

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        alignItems: "flex-end",
        flexWrap: "wrap",
        gap: space[2],
        "& .MuiOutlinedInput-root, & .MuiInputBase-root": {
          height: CONTROL_HEIGHT,
          minHeight: CONTROL_HEIGHT,
          borderRadius: radius.xs,
          backgroundColor: colors.brand.surface,
        },
        "& .MuiButton-root": {
          height: CONTROL_HEIGHT,
          minHeight: CONTROL_HEIGHT,
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-end", gap: space[2] }}>
        <Box>
          <Typography
            variant="caption"
            component="label"
            sx={{ color: colors.brand.inkDim, display: "block", mb: "2px" }}
          >
            {t("Хугацаа")}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: space[2] }}>
            <SimpleSelect
              ChangeValue={handlePeriodChange}
              Config={PeriodConfig}
              defaultValueLabel="Бүх цаг үе"
              Variant="outlined"
              Value={period}
              FullWidth={false}
              Width="130px"
              Sx={{ minWidth: "130px", height: CONTROL_HEIGHT + " !important" }}
            />
            <Datetime
              dateFormat="yyyy-MM-dd"
              Value={startDate}
              maxDate={endDate || undefined}
              ChangeValue={handleDateChange(setStartDate)}
              FullWidth={true}
              Variant="outlined"
              Sx={{ flex: "0 1 122px", minWidth: "122px" }}
            />
            <Datetime
              dateFormat="yyyy-MM-dd"
              Value={endDate}
              minDate={startDate || undefined}
              ChangeValue={handleDateChange(setEndDate)}
              FullWidth={true}
              Variant="outlined"
              Sx={{ flex: "0 1 122px", minWidth: "122px" }}
            />
          </Box>
        </Box>
      </Box>

      <ReportLocationSelect
        ChangeValue={(FieldObjects) => setLocation({ ...FieldObjects })}
      />

      <Box>
        <Typography
          variant="caption"
          component="label"
          sx={{ color: colors.brand.inkDim, display: "block", mb: "2px" }}
        >
          {t("Эмч, байгууллага хайх")}
        </Typography>
        <TextField
          placeholder={t("Овог, нэр, албан тушаал, байгууллага")}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          size="small"
          variant="outlined"
          sx={{ minWidth: "230px" }}
        />
      </Box>

      <Button
        size="small"
        disableElevation
        onClick={handleSearch}
        disabled={searching}
        startIcon={searching ? <CircularProgress size={14} /> : <SearchIcon />}
        sx={{
          ...gridToolbarButtonSx.primary,
          height: CONTROL_HEIGHT,
          minWidth: "110px",
        }}
      >
        {t("Хайх")}
      </Button>

      <Button
        size="small"
        disableElevation
        onClick={() => handleExport("xlsx")}
        disabled={exporting !== null}
        startIcon={
          exporting === "xlsx" ? (
            <CircularProgress size={14} />
          ) : (
            <DownloadIcon />
          )
        }
        sx={{
          ...gridToolbarButtonSx.neutral,
          height: CONTROL_HEIGHT,
          minWidth: "110px",
        }}
      >
        {t("Excel")}
      </Button>

      {/* Тендер §103 нь жагсаалтыг .xlsx БА .txt хоёр хэлбэрээр шаарддаг. */}
      <Button
        size="small"
        disableElevation
        onClick={() => handleExport("txt")}
        disabled={exporting !== null}
        startIcon={
          exporting === "txt" ? (
            <CircularProgress size={14} />
          ) : (
            <DescriptionOutlinedIcon />
          )
        }
        sx={{
          ...gridToolbarButtonSx.neutral,
          height: CONTROL_HEIGHT,
          minWidth: "90px",
        }}
      >
        {t("Текст")}
      </Button>
    </Box>
  );
}
