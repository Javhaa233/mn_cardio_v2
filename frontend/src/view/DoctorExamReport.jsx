import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
// @mui/material components
import { Box, CircularProgress, Typography } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
// default components
import PageContainer from "customComponents/PageContainer";
import UniCard from "customComponents/UniCard";
// custom components
import BaseGrid from "baseComponents/BaseGrid/BaseGrid";
import DoctorExamSearchToolbar from "customComponents/AllReport/DoctorExamSearchToolbar";
// helper
import Helper from "helper";
// theme
import { colors } from "@/theme/colors";
import { space, radius } from "@/theme/tokens";

/**
 * Эмчийн нэгдсэн үзлэгийн тайлан.
 *
 * Эмч тус бүр нэг мөр: байгууллага, хаяг, албан тушаал, нэр, утас, дараа нь
 * тухайн хүний системд үүсгэсэн бүртгэлийн тоонууд.
 *
 * Мөрүүд нэг дор ирдэг (≈3,300 эмч). Сервер талын хуудаслалт хийвэл BaseGrid
 * эрэмбэлэх чадвараа алдана - түүнд сервер талын эрэмбэлэлт байхгүй (BaseGrid
 * нь `OrderBy` prop-оо огт хэрэглэдэггүй) - харин "НИЙТ"-ээр эрэмбэлэх нь энэ
 * тайлангийн гол хэрэглээ тул client талд хуудаслав.
 */

const EMPTY_SUMMARY = { DoctorCount: 0, ActiveDoctorCount: 0, RecordCount: 0 };

// Тоог 1 234 хэлбэрээр. Grid болон KPI хоёр ижил харагдана.
const FormatNumber = (Value) => {
  const N = Number(Value) || 0;
  return N.toLocaleString("en-US").replace(/,/g, " ");
};

function StatTile({ label, value, accent }) {
  return (
    <Box
      sx={{
        flex: "1 1 160px",
        minWidth: 150,
        padding: space[3],
        borderRadius: radius.sm,
        // `tintSolid`, not `surface` - the card behind these tiles is already
        // white, so a white tile would be invisible.
        backgroundColor: colors.brand.tintSolid,
        borderLeft: "3px solid " + accent,
      }}
    >
      <Typography
        variant="caption"
        component="div"
        sx={{ color: colors.brand.inkMuted }}
      >
        {label}
      </Typography>
      <Typography variant="h2" component="div" sx={{ color: colors.brand.ink }}>
        {value}
      </Typography>
    </Box>
  );
}

export default function DoctorExamReport() {
  const { t } = useTranslation();

  const [Data, setData] = useState([]);
  const [IsLoading, setIsLoading] = useState(false);
  const [Alert, setAlert] = useState(null);
  const [Loaded, setLoaded] = useState(false);
  // Per-column filter boxes in the grid header. BaseGrid renders that row
  // unconditionally and hands the values back through SearchField, so the
  // filtering itself has to live here. On a 3,292-row table it earns its space.
  const [ColumnFilters, setColumnFilters] = useState({});

  const ShowAlert = useCallback((Message, Success) => {
    setAlert(
      Helper.BaseCrudHelper.ShowAlert(Message, Success, () => setAlert(null)),
    );
  }, []);

  const Search = useCallback(
    async (Filter, done) => {
      setIsLoading(true);
      await Helper.BaseCrudHelper.CallService(
        "Report/GetDoctorExamReport",
        Filter,
        (resData) => {
          setIsLoading(false);
          setLoaded(true);
          if (resData && resData.Success) {
            setData(resData.Data || []);
            setColumnFilters({});
          } else {
            setData([]);
            setColumnFilters({});
            ShowAlert(
              (resData && resData.Message) || t("An error occurred"),
              false,
            );
          }
          done && done();
        },
      );
    },
    [ShowAlert, t],
  );

  // Excel ба текст хоёр ижил зам: helper нь HTTP 200-аар ирдэг JSON алдааны
  // дугтуйг барьдаг, түүхий axios download барьдаггүй.
  const RunExport = useCallback(
    async (kind, Filter, done) => {
      const IsText = kind === "txt";
      const Fn = IsText
        ? Helper.BaseCrudHelper.ExportText
        : Helper.BaseCrudHelper.ExportExcel;

      await Fn(
        {
          Url: IsText
            ? "/Report/DoctorExamReportText"
            : "/Report/DoctorExamReportExcel",
          ReqData: Filter,
          FileName: IsText
            ? "EmchiinUzlegiinTailan.txt"
            : "EmchiinUzlegiinTailan.xlsx",
        },
        (resData) => {
          const Success = !!(resData && resData.Success);
          ShowAlert(
            Success
              ? t("Excel file downloaded")
              : (resData && resData.Message) || t("Excel export failed"),
            Success,
          );
          done && done();
        },
      );
    },
    [ShowAlert, t],
  );

  const FilteredData = useMemo(() => {
    const Active = Object.keys(ColumnFilters).filter(
      (k) => (ColumnFilters[k] || "").trim() !== "",
    );
    if (Active.length === 0) return Data;
    return Data.filter((row) =>
      Active.every((Field) =>
        String(
          row[Field] === null || row[Field] === undefined ? "" : row[Field],
        )
          .toLowerCase()
          .includes(ColumnFilters[Field].trim().toLowerCase()),
      ),
    );
  }, [Data, ColumnFilters]);

  // Derived from what is on screen, so the tiles never disagree with the grid
  // after a column filter. With no column filter this equals the server total.
  const Summary = useMemo(() => {
    if (FilteredData.length === 0) return EMPTY_SUMMARY;
    let Active = 0;
    let Records = 0;
    FilteredData.forEach((r) => {
      const Total = Number(r.TotalCount) || 0;
      if (Total > 0) Active += 1;
      Records += Total;
    });
    return {
      DoctorCount: FilteredData.length,
      ActiveDoctorCount: Active,
      RecordCount: Records,
    };
  }, [FilteredData]);

  const SearchFieldData = useMemo(
    () =>
      Object.keys(ColumnFilters).map((Field) => ({
        Field,
        Value: ColumnFilters[Field],
      })),
    [ColumnFilters],
  );

  const Fields = useMemo(
    () => [
      { Label: t("Байгууллага"), Name: "OrganizationName" },
      { Label: t("Аймаг/хот"), Name: "ProvinceName" },
      { Label: t("Сум/Дүүрэг"), Name: "SoumName" },
      { Label: t("Баг/Хороо"), Name: "BagName" },
      { Label: t("Албан тушаал"), Name: "Position" },
      { Label: t("Овог"), Name: "LastName" },
      { Label: t("Нэр"), Name: "FirstName" },
      { Label: t("Утас"), Name: "Telephone" },
      { Label: t("Үзлэг"), Name: "VisitCount" },
      { Label: t("ЭХО"), Name: "EchoCount" },
      { Label: t("ЭКГ"), Name: "EcgCount" },
      { Label: t("Ангиографи"), Name: "CathCount" },
      { Label: t("Зөвлөгөө"), Name: "AdviceCount" },
      { Label: t("Зөвлөгөөний хариу"), Name: "AdviceCommentCount" },
      { Label: t("ЗСӨ хяналт"), Name: "CvdCount" },
      { Label: t("Бусад бүртгэл"), Name: "OtherCount" },
      { Label: t("НИЙТ"), Name: "TotalCount" },
      { Label: t("Сүүлд бүртгэл хийсэн"), Name: "LastActivity" },
    ],
    [t],
  );

  return (
    <PageContainer>
      {Alert}
      <UniCard
        title={t("Эмчийн нэгдсэн үзлэгийн тайлан")}
        color="info"
        cardStyle={{
          margin: 0,
          width: "100%",
          height: "100%",
          flex: "1 1 auto",
          minHeight: 0,
          maxWidth: "100%",
          display: "flex",
          flexDirection: "column",
        }}
        cardBodyStyle={{
          padding: "10px 10px 0 10px",
          display: "flex",
          flexDirection: "column",
          flex: 1,
          overflow: "hidden",
        }}
      >
        <Box sx={{ flex: "0 0 auto" }}>
          <DoctorExamSearchToolbar
            Search={Search}
            ExportExcel={(Filter, done) => RunExport("xlsx", Filter, done)}
            ExportText={(Filter, done) => RunExport("txt", Filter, done)}
          />
        </Box>

        <Box
          sx={{
            flex: "0 0 auto",
            display: "flex",
            gap: space[2],
            marginTop: space[3],
          }}
        >
          <StatTile
            label={t("Нийт эмч")}
            value={FormatNumber(Summary.DoctorCount)}
            accent={colors.brand.inkMuted}
          />
          <StatTile
            label={t("Бүртгэл хийсэн эмч")}
            value={FormatNumber(Summary.ActiveDoctorCount)}
            accent={colors.brand.cyanInk}
          />
          <StatTile
            label={t("Нийт бүртгэл")}
            value={FormatNumber(Summary.RecordCount)}
            accent={colors.brand.cyan}
          />
        </Box>

        {/* Захиалагч үүнийг эмчийн ачаалал гэж уншвал буруу дүгнэлт гарна. */}
        <Box
          sx={{
            flex: "0 0 auto",
            display: "flex",
            alignItems: "center",
            gap: space[1],
            marginTop: space[2],
            color: colors.brand.inkDim,
          }}
        >
          <InfoOutlinedIcon sx={{ fontSize: 16 }} />
          <Typography variant="caption">
            {t(
              "Тоо бүр нь бичлэгийг системд үүсгэсэн хэрэглэгчээр тоологдоно — үзлэг хийсэн эмчээр биш.",
            )}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            flex: "1 1 auto",
            minHeight: 0,
            minWidth: 0,
            maxWidth: "100%",
            overflow: "hidden",
            position: "relative",
            marginTop: space[2],
          }}
        >
          <BaseGrid
            FillHeight={true}
            Fields={Fields}
            Data={FilteredData}
            PK="DoctorId"
            TextLength={40}
            PageSize={50}
            // 100 бол MIT DataGrid-ийн зөвшөөрдөг дээд хэмжээ (үүнээс дээш бол
            // алдаа шиддэг). Бүх 3,292 мөрийг нэг дор авахыг хүсвэл Excel /
            // Текст экспортыг ашиглана.
            PageSizeOptions={[30, 50, 100]}
            HideNumber={false}
            HideCheck={true}
            HideFilter={true}
            SearchFieldData={SearchFieldData}
            SearchField={(Field, Value) =>
              setColumnFilters((prev) => ({ ...prev, [Field]: Value }))
            }
            DisableCards={true}
            EnableColumnResizing={true}
            widthPattern={
              "60, 260l, 130l, 130l, 120l, 160l, 120l, 130l, 110l, " +
              "90r, 80r, 80r, 110r, 100r, 140r, 110r, 120r, 100r, 150c"
            }
            NoRowsText={
              Loaded
                ? t("Мэдээлэл олдсонгүй")
                : t("Хайх товчийг дарж тайланг гаргана уу")
            }
            ShowData={() => {}}
          />
          {IsLoading && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: space[2],
                backgroundColor: "rgba(255, 255, 255, 0.6)",
                zIndex: 2,
              }}
            >
              <CircularProgress size={36} />
              <Typography variant="body2">{t("Loading ...")}</Typography>
            </Box>
          )}
        </Box>
      </UniCard>
    </PageContainer>
  );
}
