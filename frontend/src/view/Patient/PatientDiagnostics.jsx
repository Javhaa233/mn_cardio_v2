import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import MonitorHeartOutlinedIcon from "@mui/icons-material/MonitorHeartOutlined";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/Timeline";

import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import PageContainer from "customComponents/PageContainer";
import UniCard from "customComponents/UniCard";
import BaseNoData from "customComponents/BaseNoData";
import DivLoading from "customComponents/DivLoading";
import LoadError from "customComponents/LoadError";

import { colors } from "@/theme/colors";
import { space, radius } from "@/theme/tokens";
import { gridToolbarButtonSx } from "@/theme/controlStyles";
import Helper from "helper";

/**
 * 3.1 Шинжилгээ, оношилгоо — the patient's own investigations.
 *
 * WHY THIS SCREEN EXISTS
 * GET /api/patient/diagnostics has been implemented since the patient API
 * layer was built and had no web client at all, so the portal could show a
 * patient their blood-pressure diary but not one of their own test results.
 * That is the largest thing the citizen side was missing.
 *
 * WHAT IT DELIBERATELY DOES NOT SHOW
 * There is a sibling endpoint, /diagnostics/:type/:id, which answers with the
 * RAW table row. Those columns are the doctor's view of the record -
 * transliterated clinical names, free-text working notes, internal status
 * codes - and WHICH of them a patient may see is a clinical decision nobody
 * has signed off. So this screen renders the curated { title, date, summary }
 * the list already returns and stops there. Widening it is a question for
 * ЗСҮТ, not a frontend change.
 */

/** The four kinds the server groups results into. */
const TYPES = [
  { key: "lab", label: "Лабораторийн шинжилгээ", Icon: ScienceOutlinedIcon },
  { key: "echo", label: "Зүрхний эхо", Icon: FavoriteBorderOutlinedIcon },
  { key: "ecg", label: "Зүрхний цахилгаан бичлэг", Icon: TimelineOutlinedIcon },
  { key: "cathlab", label: "Ангиографи", Icon: MonitorHeartOutlinedIcon },
];

const TYPE_MAP = TYPES.reduce((acc, ty) => {
  acc[ty.key] = ty;
  return acc;
}, {});

const PAGE = 20;

export default function PatientDiagnostics() {
  const { t } = useTranslation();

  const [State, setState] = useState({
    loading: true,
    error: null,
    data: [],
    total: 0,
  });
  const [Filter, setFilter] = useState("");
  const [Limit, setLimit] = useState(PAGE);

  const [Reload, setReload] = useState(0);

  /**
   * Fetch inside the effect, with a cancelled guard - the same shape
   * PatientRehab uses.
   *
   * Not a `useCallback` the effect calls: this repo's eslint treats
   * react-hooks/set-state-in-effect as an ERROR, and it follows a direct call
   * into a callback that closes over setState. The guard is worth having
   * anyway, because switching filters quickly can land two responses out of
   * order.
   */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const params = { limit: Limit };
      if (Filter) params.type = Filter;
      const res = await Helper.PatientApiHelper.GetDiagnostics(params);
      if (cancelled) return;

      setState({
        loading: false,
        error: res.success
          ? null
          : res.message || t("Мэдээлэл ачаалахад алдаа гарлаа"),
        data: res.success && Array.isArray(res.data) ? res.data : [],
        total: res.success && typeof res.total === "number" ? res.total : 0,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [Filter, Limit, Reload, t]);

  const chooseType = (key) => {
    if (key === Filter) return;
    setState((s) => ({ ...s, loading: true, error: null }));
    setLimit(PAGE);
    setFilter(key);
  };

  const showMore = () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    setLimit((n) => n + PAGE);
  };

  const RenderBody = () => {
    if (State.loading) {
      return (
        <Box sx={{ position: "relative", minHeight: "180px" }}>
          <DivLoading WithoutCard />
        </Box>
      );
    }

    if (State.error) {
      return (
        <LoadError
          Message={State.error}
          Retry={() => {
            setState((x) => ({ ...x, loading: true, error: null }));
            setReload((n) => n + 1);
          }}
        />
      );
    }

    if (!State.data.length) {
      return (
        <BaseNoData
          Text={
            Filter
              ? t("Энэ төрлийн шинжилгээ бүртгэгдээгүй байна")
              : t("Шинжилгээ, оношилгооны бүртгэл байхгүй байна")
          }
        />
      );
    }

    return (
      <>
        {State.data.map((row) => {
          const meta = TYPE_MAP[row.type];
          const Icon = meta ? meta.Icon : ScienceOutlinedIcon;
          return (
            <Box
              key={row.type + "-" + row.id}
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: space[3],
                padding: space[3],
                marginBottom: space[2],
                border: `1px solid ${colors.brand.hairline}`,
                borderRadius: radius.md,
                backgroundColor: colors.brand.surface,
              }}
            >
              <Box
                sx={{
                  flex: "0 0 auto",
                  display: "flex",
                  color: colors.brand.cyanInk,
                  "& svg": { width: 24, height: 24 },
                }}
              >
                <Icon />
              </Box>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "baseline",
                    gap: space[2],
                  }}
                >
                  <Typography
                    variant="h5"
                    component="div"
                    sx={{ color: colors.brand.ink }}
                  >
                    {row.title || (meta ? t(meta.label) : row.type)}
                  </Typography>
                  <Typography
                    variant="caption"
                    component="span"
                    sx={{ color: colors.brand.inkMuted }}
                  >
                    {Helper.ObjectHelper.getDateYMDDisplay(row.date)}
                  </Typography>
                </Box>

                {/* `summary` is the server's own curated line. A record with
                    none is still worth listing: it tells the patient the
                    investigation happened, and when. */}
                <Typography
                  variant="body2"
                  sx={{
                    color: colors.brand.inkMuted,
                    whiteSpace: "pre-wrap",
                    marginTop: space[1],
                  }}
                >
                  {row.summary || t("Дүгнэлт бичигдээгүй байна")}
                </Typography>
              </Box>
            </Box>
          );
        })}

        {State.total > State.data.length ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              marginTop: space[3],
            }}
          >
            <Button onClick={showMore} sx={gridToolbarButtonSx.neutral}>
              {t("Илүүг харах")}
            </Button>
          </Box>
        ) : null}
      </>
    );
  };

  return (
    <PageContainer>
      <GridContainer spacing={2}>
        <GridItem xs={12}>
          <UniCard
            title={t("Шинжилгээ, оношилгоо")}
            actions={
              State.total ? (
                <Typography
                  variant="caption"
                  sx={{ color: colors.brand.inkMuted }}
                >
                  {State.total} {t("бичлэг")}
                </Typography>
              ) : null
            }
          >
            {/* Filter by kind. A flat date-ordered list answers "what has
                happened to me lately"; this answers "show me my echoes". */}
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: space[2],
                marginBottom: space[3],
              }}
            >
              <Button
                onClick={() => chooseType("")}
                sx={
                  Filter === ""
                    ? gridToolbarButtonSx.primary
                    : gridToolbarButtonSx.neutral
                }
              >
                {t("Бүгд")}
              </Button>
              {TYPES.map((ty) => (
                <Button
                  key={ty.key}
                  onClick={() => chooseType(ty.key)}
                  sx={
                    Filter === ty.key
                      ? gridToolbarButtonSx.primary
                      : gridToolbarButtonSx.neutral
                  }
                >
                  {t(ty.label)}
                </Button>
              ))}
            </Box>

            {RenderBody()}
          </UniCard>
        </GridItem>
      </GridContainer>
    </PageContainer>
  );
}
