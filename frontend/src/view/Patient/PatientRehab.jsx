import React, { useEffect, useState, useCallback } from "react";
// translation
import { useTranslation } from "react-i18next";
// @mui/material components
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
// @mui/icons-material
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// custom components
import PageContainer from "customComponents/PageContainer";
import UniCard from "customComponents/UniCard";
import DivLoading from "customComponents/DivLoading";
import BaseNoData from "customComponents/BaseNoData";
// theme
import { colors } from "@/theme/colors";
import { space, radius } from "@/theme/tokens";
import { gridToolbarButtonSx } from "@/theme/controlStyles";
// helper
import Helper from "helper";

/**
 * Mobile tender module 2.7 — Сэргээн засах, дасгал хөдөлгөөн.
 *
 * The tracker's acceptance (row #41 / #56) is "Дасгал үзэх, гүйцэтгэлээ
 * тэмдэглэх" — the patient watches an exercise and marks their own completion —
 * plus vital signs shown as a chart (#51) and the latest assessment (#50).
 *
 * Two things this deliberately does NOT do:
 *
 *  - It does not play video. The 39 instruction videos are blocked on tracker
 *    #54 (ЗСҮТ supply the rehabilitation doctors who appear in them) and there
 *    is no delivery path: the file layer serves attachments over POST with
 *    Content-Disposition: attachment, which no <video> element can consume.
 *    `MediaRef` is carried through so a player can be dropped in later.
 *  - It does not score the assessment. The tender names no instrument, and the
 *    equivalent methodology decision for the ЗСӨ score is an explicit ЗСҮТ
 *    deliverable, so the assessment is displayed as recorded.
 *
 * The backing tables do not exist yet either — they are in
 * backend/scripts/add_rehabilitation_tables.sql, which is a DBA request. So a
 * failed load here is an expected state and says so, rather than looking broken.
 */
export default function PatientRehab() {
  const { t } = useTranslation();

  const [Exercises, setExercises] = useState({
    loading: true,
    error: false,
    data: [],
  });
  const [Progress, setProgress] = useState({
    loading: true,
    error: false,
    data: [],
  });
  const [Assessment, setAssessment] = useState({
    loading: true,
    error: false,
    data: null,
  });
  const [Saving, setSaving] = useState(null);
  const [Reload, setReload] = useState(0);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [ex, pr, as] = await Promise.all([
        Helper.PatientApiHelper.GetExercises(),
        Helper.PatientApiHelper.GetRehabProgress({ limit: 100 }),
        Helper.PatientApiHelper.GetRehabAssessment(),
      ]);
      if (cancelled) return;

      setExercises({
        loading: false,
        error: !ex.success,
        data: Array.isArray(ex.data) ? ex.data : [],
      });
      setProgress({
        loading: false,
        error: !pr.success,
        data: Array.isArray(pr.data) ? pr.data : [],
      });
      setAssessment({
        loading: false,
        error: !as.success,
        data: as.success ? as.data : null,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [Reload]);

  const markDone = useCallback(async (ExerciseId) => {
    setSaving(ExerciseId);
    const res = await Helper.PatientApiHelper.MarkExerciseDone({ ExerciseId });
    setSaving(null);
    if (res.success) setReload((n) => n + 1);
  }, []);

  // Completed today, so the list can show what is already ticked off.
  const today = new Date().toISOString().slice(0, 10);
  const doneToday = new Set(
    (Progress.data || [])
      .filter((p) => (p.CompletedAt || "").slice(0, 10) === today)
      .map((p) => p.ExerciseId),
  );

  const unavailable = Exercises.error && !Exercises.loading;

  return (
    <PageContainer>
      <GridContainer spacing={2}>
        <GridItem xs={12} md={8}>
          <div style={{ position: "relative" }}>
            {Exercises.loading ? <DivLoading WithoutCard={true} /> : null}
            <UniCard title={t("Дасгал хөдөлгөөн")} color="success">
              {unavailable ? (
                <BaseNoData
                  Text={t("Дасгалын хөтөлбөр хараахан бэлэн болоогүй байна")}
                />
              ) : null}

              {!Exercises.loading &&
              !unavailable &&
              Exercises.data.length === 0 ? (
                <BaseNoData Text={t("Дасгал алга байна")} />
              ) : null}

              {Exercises.data.map((ex) => {
                const done = doneToday.has(ex.Id);
                return (
                  <Box
                    key={ex.Id}
                    sx={{
                      display: "flex",
                      // Side by side from tablet up; stacked on a phone, where
                      // the title was squeezed into roughly 100px beside a
                      // button taking half the width, and wrapped to six lines.
                      flexDirection: { xs: "column", sm: "row" },
                      alignItems: { xs: "stretch", sm: "center" },
                      gap: space[3],
                      padding: space[3],
                      marginBottom: space[2],
                      border: "1px solid " + colors.brand.hairline,
                      borderRadius: radius.md,
                      backgroundColor: done
                        ? colors.background.infoTint
                        : colors.background.surface,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: space[3],
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flex: "0 0 auto",
                          color: done
                            ? colors.status.normal
                            : colors.brand.cyanInk,
                          "& svg": { width: "24px", height: "24px" },
                        }}
                      >
                        {done ? <CheckCircleIcon /> : <PlayCircleOutlineIcon />}
                      </Box>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="h5"
                          component="div"
                          sx={{ color: colors.brand.ink }}
                        >
                          {ex.Name}
                        </Typography>
                        {ex.Description ? (
                          <Typography
                            variant="body2"
                            sx={{ color: colors.brand.inkMuted }}
                          >
                            {ex.Description}
                          </Typography>
                        ) : null}
                        {ex.DurationSec ? (
                          <Typography
                            variant="caption"
                            component="div"
                            sx={{ color: colors.brand.inkMuted }}
                          >
                            {Math.round(ex.DurationSec / 60)} {t("минут")}
                          </Typography>
                        ) : null}
                      </Box>
                    </Box>

                    <Button
                      // One filled primary per row for the action. A completed
                      // exercise is a state, not an action, so it drops to a
                      // disabled neutral rather than a second filled button.
                      sx={{
                        ...(done
                          ? gridToolbarButtonSx.neutral
                          : gridToolbarButtonSx.primary),
                        flex: { xs: "1 1 auto", sm: "0 0 auto" },
                        alignSelf: { xs: "stretch", sm: "center" },
                      }}
                      disabled={done || Saving === ex.Id}
                      onClick={() => markDone(ex.Id)}
                    >
                      {done ? t("Гүйцэтгэсэн") : t("Гүйцэтгэлээ тэмдэглэх")}
                    </Button>
                  </Box>
                );
              })}
            </UniCard>
          </div>
        </GridItem>

        <GridItem xs={12} md={4}>
          <div style={{ position: "relative" }}>
            {Assessment.loading ? <DivLoading WithoutCard={true} /> : null}
            <UniCard title={t("Эрсдэлийн үнэлгээ")} color="warning">
              {Assessment.error || !Assessment.data ? (
                <BaseNoData Text={t("Үнэлгээ хараахан хийгдээгүй байна")} />
              ) : (
                <Box sx={{ color: colors.brand.ink }}>
                  <Box sx={{ marginBottom: "6px" }}>
                    {t("Эрсдэлийн түвшин")}: {Assessment.data.RiskLevel || "—"}
                  </Box>
                  <Box sx={{ marginBottom: "6px" }}>
                    {t("Ачааллын тэсвэр")}:{" "}
                    {Assessment.data.ToleranceScore || "—"}{" "}
                    {Assessment.data.ToleranceUnit || ""}
                  </Box>
                  <Box sx={{ color: colors.brand.inkMuted }}>
                    {Helper.ObjectHelper.getDateYMDDisplay(
                      Assessment.data.AssessmentDate,
                    )}
                  </Box>
                </Box>
              )}
            </UniCard>
          </div>
        </GridItem>
      </GridContainer>
    </PageContainer>
  );
}
