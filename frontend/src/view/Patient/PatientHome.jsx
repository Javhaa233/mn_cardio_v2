import React, { useCallback, useEffect, useState } from "react";
// translation
import { useTranslation } from "react-i18next";
// @mui/material components
import Box from "@mui/material/Box";
// @mui/icons-material
import DescriptionIcon from "@mui/icons-material/Description";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import VideocamIcon from "@mui/icons-material/Videocam";
import FavoriteIcon from "@mui/icons-material/Favorite";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// custom components
import PageContainer from "customComponents/PageContainer";
import { StatTile, ActionTile, ListTile } from "customComponents/Home/Tiles";
// theme
import { colors } from "@/theme/colors";
// helper
import Helper from "helper";

/**
 * The patient landing page.
 *
 * Logging in previously dropped a patient on a static profile card, which told
 * them nothing about their own care. This shows what they came to see - their
 * latest measurements, whether the doctor has replied - and then routes them on.
 *
 * Everything here comes from /api/patient/*, the same surface the mobile app
 * will consume, so the two stay in step. No request carries a patient id; the
 * server derives it from the token.
 */
export default function PatientHome() {
  const { t } = useTranslation();

  const [Profile, setProfile] = useState({
    loading: true,
    error: false,
    data: null,
  });
  const [Journal, setJournal] = useState({
    loading: true,
    error: false,
    data: [],
  });
  const [Questions, setQuestions] = useState({
    loading: true,
    error: false,
    data: [],
  });
  const [Advice, setAdvice] = useState({
    loading: true,
    error: false,
    data: [],
  });

  // Each tile loads independently: one slow or failing request must not blank
  // the whole page.
  const load = useCallback(async (fetcher, setter, pick) => {
    const res = await fetcher();
    if (!res.success) {
      setter({ loading: false, error: true, data: null });
      return;
    }
    setter({ loading: false, error: false, data: pick ? pick(res) : res.data });
  }, []);

  useEffect(() => {
    load(() => Helper.PatientApiHelper.GetMe(), setProfile);
    load(() => Helper.PatientApiHelper.GetJournal({ limit: 5 }), setJournal);
    load(
      () => Helper.PatientApiHelper.GetQuestions({ limit: 5 }),
      setQuestions,
    );
    load(() => Helper.PatientApiHelper.GetAdvice({ limit: 5 }), setAdvice);
  }, [load]);

  const latest =
    Array.isArray(Journal.data) && Journal.data.length ? Journal.data[0] : null;

  // A reply from the doctor is the thing a patient is actually waiting for.
  const replies = Array.isArray(Questions.data)
    ? Questions.data.filter((q) => q.is_doctor + "" === "1").length
    : 0;

  const fullName = Profile.data
    ? [Profile.data.p_lastname, Profile.data.p_firstname]
        .filter(Boolean)
        .join(" ")
    : "";

  return (
    <PageContainer>
      <Box
        sx={{
          marginBottom: "14px",
          fontSize: "19px",
          fontWeight: 500,
          color: colors.text.primary,
        }}
      >
        {Profile.loading
          ? t("Ачаалж байна")
          : fullName
            ? t("Сайн байна уу") + ", " + fullName
            : t("Сайн байна уу")}
      </Box>

      <GridContainer spacing={2}>
        <GridItem xs={12} sm={6} md={3}>
          <StatTile
            Title={t("Сүүлийн даралт")}
            Value={latest ? latest.blood_pressure : null}
            Unit={t("мм.муб")}
            Hint={latest ? latest.date : null}
            Color="info"
            Loading={Journal.loading}
            Error={Journal.error}
            To="/patient/PatientMonitoringPat"
          />
        </GridItem>
        <GridItem xs={12} sm={6} md={3}>
          <StatTile
            Title={t("Судасны цохилт")}
            Value={latest ? latest.pulse : null}
            Hint={latest ? latest.date : null}
            Color="primary"
            Loading={Journal.loading}
            Error={Journal.error}
            To="/patient/PatientMonitoringPat"
          />
        </GridItem>
        <GridItem xs={12} sm={6} md={3}>
          <StatTile
            Title={t("Жин")}
            Value={latest ? latest.weight : null}
            Unit={t("кг")}
            Hint={latest ? latest.date : null}
            Color="success"
            Loading={Journal.loading}
            Error={Journal.error}
            To="/patient/PatientMonitoringPat"
          />
        </GridItem>
        <GridItem xs={12} sm={6} md={3}>
          <StatTile
            Title={t("Эмчийн хариу")}
            Value={replies}
            Color="rose"
            Loading={Questions.loading}
            Error={Questions.error}
            To="/patient/PatientQuestion"
          />
        </GridItem>

        <GridItem xs={12} md={6}>
          <ListTile
            Title={t("Сүүлийн тэмдэглэл")}
            Color="info"
            Loading={Journal.loading}
            Error={Journal.error}
            Items={Journal.data}
            EmptyText={t("Тэмдэглэл алга байна")}
            RenderItem={(row) => (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "10px",
                }}
              >
                <span>{row.date}</span>
                <span style={{ color: colors.text.secondary }}>
                  {[row.blood_pressure, row.pulse, row.weight]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </Box>
            )}
          />
        </GridItem>

        <GridItem xs={12} md={6}>
          <ListTile
            Title={t("Эмчийн зөвлөгөө")}
            Color="rose"
            Loading={Advice.loading}
            Error={Advice.error}
            Items={Advice.data}
            EmptyText={t("Зөвлөгөө алга байна")}
            RenderItem={(row) => (
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "10px",
                  }}
                >
                  <span>{row.body || t("Асуулт")}</span>
                  <span style={{ color: colors.text.secondary }}>
                    {row.date}
                  </span>
                </Box>
                {row.comments && row.comments.length ? (
                  <Box sx={{ marginTop: "2px", color: colors.text.secondary }}>
                    {row.comments[row.comments.length - 1].comment}
                  </Box>
                ) : null}
              </Box>
            )}
          />
        </GridItem>

        <GridItem xs={12} sm={6} md={3}>
          <ActionTile
            Title={t("Тэмдэглэл")}
            Description={t("Даралт, жин, эм бүртгэх")}
            Icon={<DescriptionIcon />}
            To="/patient/PatientMonitoringPat"
            Color="info"
          />
        </GridItem>
        <GridItem xs={12} sm={6} md={3}>
          <ActionTile
            Title={t("Асуулт")}
            Description={t("Эмчээс асуух")}
            Icon={<ChatBubbleIcon />}
            To="/patient/PatientQuestion"
            Color="primary"
          />
        </GridItem>
        <GridItem xs={12} sm={6} md={3}>
          <ActionTile
            Title={t("Цахим үзлэг")}
            Description={t("Хүсэлт илгээх")}
            Icon={<VideocamIcon />}
            To="/patient/PatientRemoteVisit"
            Color="warning"
          />
        </GridItem>
        <GridItem xs={12} sm={6} md={3}>
          <ActionTile
            Title={t("Эмчийн зөвлөгөө")}
            Description={t("Эмчээс ирсэн зөвлөгөө")}
            Icon={<RecordVoiceOverIcon />}
            To="/patient/PatientAdvice"
            Color="rose"
          />
        </GridItem>
        <GridItem xs={12} sm={6} md={3}>
          <ActionTile
            Title={t("ЗСӨ")}
            Description={t("Эрсдэлээ үнэлэх")}
            Icon={<FavoriteIcon />}
            To="/patient/PatientCVD"
            Color="rose"
          />
        </GridItem>
        <GridItem xs={12} sm={6} md={3}>
          <ActionTile
            Title={t("Миний бүртгэл")}
            Description={t("Хувийн мэдээлэл")}
            Icon={<AccountBoxIcon />}
            To="/patient/PatientProfile"
            Color="success"
          />
        </GridItem>
      </GridContainer>
    </PageContainer>
  );
}
