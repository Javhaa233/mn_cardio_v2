import React, { useCallback, useEffect, useState } from "react";
// translation
import { useTranslation } from "react-i18next";
// @mui/material components
import Box from "@mui/material/Box";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// custom components
import PageContainer from "customComponents/PageContainer";
import UniCard from "customComponents/UniCard";
import DivLoading from "customComponents/DivLoading";
import LoadError from "customComponents/LoadError";
import BaseNoData from "customComponents/BaseNoData";
// theme
import { colors } from "@/theme/colors";
// helper
import Helper from "helper";

/**
 * Mobile tender module 2.4 — Эмчийн зөвлөгөө.
 *
 * The advice a doctor has written for this patient. It had no route at all
 * before: the only thing called "Зөвлөгөө" in the portal was a tab inside the
 * CVD screen, and that is the *risk-score* advice calculator, which is a
 * different thing — it computes suggestions from a questionnaire rather than
 * showing what a doctor said.
 *
 * Reads /api/patient/advice, which returns each ticket with its AdviceComment
 * thread attached; the advice text lives on the comments, not the ticket.
 *
 * Not yet met: the tracker's acceptance also requires advice to arrive **with a
 * notification**. Notification has no patient recipient column, so that half is
 * schema work and is tracked separately.
 */
export default function PatientAdviceList() {
  const { t } = useTranslation();

  const [State, setState] = useState({ loading: true, error: false, data: [] });
  // Bumping this re-runs the effect; that is how Retry works without calling
  // setState synchronously from the effect body.
  const [Reload, setReload] = useState(0);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const res = await Helper.PatientApiHelper.GetAdvice({ limit: 50 });
      // The patient may have navigated away while the request was in flight.
      if (cancelled) return;

      if (!res.success) {
        setState({
          loading: false,
          error: true,
          data: [],
          message: res.message,
        });
        return;
      }
      setState({
        loading: false,
        error: false,
        data: Array.isArray(res.data) ? res.data : [],
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [Reload]);

  const retry = useCallback(() => {
    setState({ loading: true, error: false, data: [] });
    setReload((n) => n + 1);
  }, []);

  if (State.error) {
    return (
      <PageContainer>
        <LoadError Message={State.message} Retry={retry} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <GridContainer spacing={2}>
        <GridItem xs={12}>
          <div style={{ position: "relative" }}>
            {State.loading ? <DivLoading WithoutCard={true} /> : null}
            <UniCard title={t("Эмчийн зөвлөгөө")} color="rose">
              {!State.loading && State.data.length === 0 ? (
                <BaseNoData Text={t("Зөвлөгөө алга байна")} />
              ) : null}

              {State.data.map((ticket) => (
                <Box
                  key={ticket.id_data}
                  sx={{
                    marginBottom: "14px",
                    padding: "12px 14px",
                    border: "1px solid " + colors.border.subtle,
                    borderRadius: "3px",
                    backgroundColor: colors.background.surface,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "10px",
                      marginBottom: ticket.body ? "6px" : 0,
                    }}
                  >
                    <Box
                      sx={{
                        fontSize: "13px",
                        fontWeight: 500,
                        color: colors.text.primary,
                      }}
                    >
                      {ticket.body || t("Асуулт")}
                    </Box>
                    <Box
                      sx={{
                        flexShrink: 0,
                        fontSize: "12px",
                        color: colors.text.secondary,
                      }}
                    >
                      {ticket.date}
                    </Box>
                  </Box>

                  {/* The doctor's actual words. An open ticket with none yet is
                      normal, and saying so beats an empty box. */}
                  {ticket.comments && ticket.comments.length > 0 ? (
                    ticket.comments.map((c) => (
                      <Box
                        key={c.id_data}
                        sx={{
                          marginTop: "8px",
                          padding: "9px 11px",
                          borderRadius: "3px",
                          backgroundColor: colors.background.primary,
                          border: "1px solid " + colors.border.subtle,
                          fontSize: "12.5px",
                          lineHeight: 1.5,
                          color: colors.text.primary,
                        }}
                      >
                        {c.comment}
                        <Box
                          sx={{
                            marginTop: "4px",
                            fontSize: "11.5px",
                            color: colors.text.secondary,
                          }}
                        >
                          {c.date}
                        </Box>
                      </Box>
                    ))
                  ) : (
                    <Box
                      sx={{
                        fontSize: "12px",
                        color: colors.text.secondary,
                      }}
                    >
                      {t("Эмч хараахан хариу бичээгүй байна")}
                    </Box>
                  )}
                </Box>
              ))}
            </UniCard>
          </div>
        </GridItem>
      </GridContainer>
    </PageContainer>
  );
}
