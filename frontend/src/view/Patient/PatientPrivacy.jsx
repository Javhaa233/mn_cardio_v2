import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";

import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import PageContainer from "customComponents/PageContainer";
import UniCard from "customComponents/UniCard";
import BaseNoData from "customComponents/BaseNoData";
import DivLoading from "customComponents/DivLoading";
import LoadError from "customComponents/LoadError";
import StatusChip from "customComponents/StatusChip";

import { colors } from "@/theme/colors";
import { space, radius } from "@/theme/tokens";
import { gridToolbarButtonSx } from "@/theme/controlStyles";
import Helper from "helper";

/**
 * Зөвшөөрөл ба хандалтын түүх — consent, and who has opened my record.
 *
 * Two tender obligations that were implemented server-side and reachable from
 * nowhere: consent capture for non-treatment use of personal data, and the
 * access log. They share a screen because they are one question from the
 * patient's side — what is done with my data, and who has seen it.
 *
 * CONSENT IS APPEND-ONLY on the server. Granting writes a new row against a
 * specific document version; withdrawing writes another. Nothing is edited in
 * place, so the history of what was agreed to and when survives - which is the
 * whole point of recording consent at all. `Superseded` marks a grant whose
 * document has since been revised.
 *
 * THE ACCESS LOG IS FEATURE-FLAGGED. With FEATURE_ACCESS_LOG_API off the
 * server answers 503 FEATURE_DISABLED, which is not an error and must not be
 * shown as one - the panel says the feature is not active here and stays out
 * of the way.
 */

/**
 * Is this consent document still a placeholder?
 *
 * THIS GUARD IS NOT COSMETIC. The seeded documents carry their own warning in
 * their body text - "[ЗАГВАР ТЕКСТ — ЗСҮТ-ийн хуулийн хэлтэс батлаагүй.
 * Үйлчлүүлэгчид харуулахгүй...]", i.e. template text, not approved by ЗСҮТ's
 * legal department, DO NOT SHOW TO CLIENTS - and every one of them is at
 * Version "0-draft" today.
 *
 * Showing that text to a patient, and worse recording a consent against it,
 * would produce a consent record with no legal standing and would put
 * unapproved wording in front of citizens. So a draft purpose renders as
 * pending: named, so the patient can see what will be asked, with no document
 * and no way to agree.
 *
 * The screen switches itself on per purpose the moment a real version is
 * seeded. Nothing here needs changing for that to happen.
 */
const isDraft = (row) => {
  const v = String(row.Version || "").toLowerCase();
  return v === "" || v.startsWith("0-") || v.includes("draft");
};

export default function PatientPrivacy() {
  const { t } = useTranslation();

  const [Consents, setConsents] = useState({
    loading: true,
    disabled: false,
    error: null,
    items: [],
  });
  const [Access, setAccess] = useState({
    loading: true,
    disabled: false,
    error: null,
    data: [],
  });
  const [Busy, setBusy] = useState("");
  const [ActionError, setActionError] = useState("");
  const [OpenDoc, setOpenDoc] = useState("");
  const [Doc, setDoc] = useState({ code: "", loading: false, text: "" });
  const [Reload, setReload] = useState(0);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [c, a] = await Promise.all([
        Helper.PatientApiHelper.GetConsents(),
        Helper.PatientApiHelper.GetAccessLog({ limit: 25 }),
      ]);
      if (cancelled) return;

      // Consent has its own feature flag, and answers 503 FEATURE_DISABLED the
      // same way the access log does. Rendering that as a red error with a
      // Retry that can never succeed is worse than saying it is not on.
      const consentOff = !c.success && c.code === "FEATURE_DISABLED";
      setConsents({
        loading: false,
        disabled: consentOff,
        error:
          c.success || consentOff
            ? null
            : c.message || t("Мэдээлэл ачаалахад алдаа гарлаа"),
        items:
          c.success && c.data && Array.isArray(c.data.items)
            ? c.data.items
            : [],
      });

      // FEATURE_DISABLED is a configuration answer, not a failure.
      const disabled = !a.success && a.code === "FEATURE_DISABLED";
      setAccess({
        loading: false,
        disabled,
        error:
          a.success || disabled
            ? null
            : a.message || t("Мэдээлэл ачаалахад алдаа гарлаа"),
        data: a.success && Array.isArray(a.data) ? a.data : [],
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [Reload, t]);

  const refresh = () => {
    setConsents((s) => ({ ...s, loading: true, error: null }));
    setAccess((s) => ({ ...s, loading: true, error: null }));
    setReload((n) => n + 1);
  };

  const toggleDoc = async (row) => {
    if (OpenDoc === row.PurposeCode) {
      setOpenDoc("");
      return;
    }
    setOpenDoc(row.PurposeCode);
    setDoc({ code: row.PurposeCode, loading: true, text: "" });
    const res = await Helper.PatientApiHelper.GetConsentDocument(
      row.PurposeCode,
    );
    setDoc({
      code: row.PurposeCode,
      loading: false,
      text:
        res.success && res.data ? res.data.BodyMn || res.data.Body || "" : "",
    });
  };

  /**
   * Both of these used to discard the result. A 409 CONSENT_DOC_SUPERSEDED or
   * a 503 then left the button doing nothing at all, with no way for the
   * patient to know their answer had not been recorded.
   */
  const write = async (row, call) => {
    setBusy(row.PurposeCode);
    setActionError("");
    const res = await call();
    setBusy("");
    if (!res.success) {
      setActionError(res.message || t("Үйлдэл амжилтгүй боллоо"));
      return;
    }
    refresh();
  };

  const grant = (row) =>
    write(row, () =>
      Helper.PatientApiHelper.GrantConsent(row.PurposeCode, row.DocumentId),
    );

  const withdraw = (row) =>
    write(row, () => Helper.PatientApiHelper.WithdrawConsent(row.PurposeCode));

  const RenderConsents = () => {
    if (Consents.loading) {
      return (
        <Box sx={{ position: "relative", minHeight: "160px" }}>
          <DivLoading WithoutCard />
        </Box>
      );
    }
    if (Consents.disabled) {
      return (
        <BaseNoData Text={t("Зөвшөөрлийн бүртгэл одоогоор идэвхгүй байна")} />
      );
    }
    if (Consents.error) {
      return <LoadError Message={Consents.error} Retry={refresh} />;
    }
    if (!Consents.items.length) {
      return <BaseNoData Text={t("Зөвшөөрлийн бүртгэл алга байна")} />;
    }

    return Consents.items.map((row) => {
      const granted = row.Granted === true;
      // null means never asked; false means asked and REFUSED. listConsents
      // warns about collapsing the two, because re-prompting someone who
      // already declined is exactly what consent records exist to prevent.
      const refused = row.Granted === false;
      const draft = isDraft(row);
      return (
        <Box
          key={row.PurposeCode}
          sx={{
            padding: space[3],
            marginBottom: space[2],
            border: `1px solid ${colors.brand.hairline}`,
            borderRadius: radius.md,
            backgroundColor: colors.brand.surface,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: space[2],
            }}
          >
            <Typography
              variant="h5"
              component="div"
              sx={{ color: colors.brand.ink, flex: 1, minWidth: 0 }}
            >
              {row.TitleMn}
            </Typography>
            <StatusChip
              Tone={draft ? "warning" : granted ? "success" : "neutral"}
              Label={
                draft
                  ? t("Бэлтгэгдэж байна")
                  : granted
                    ? t("Зөвшөөрсөн")
                    : refused
                      ? t("Татгалзсан")
                      : t("Асуугаагүй")
              }
            />
          </Box>

          {draft ? (
            <Typography
              variant="body2"
              sx={{ color: colors.brand.inkMuted, marginTop: space[1] }}
            >
              {t(
                "Зөвшөөрлийн эцсийн текст батлагдаагүй тул одоогоор баталгаажуулах боломжгүй байна.",
              )}
            </Typography>
          ) : null}

          {row.Superseded ? (
            <Typography
              variant="body2"
              sx={{ color: colors.status.warningInk, marginTop: space[1] }}
            >
              {t("Зөвшөөрлийн текст шинэчлэгдсэн тул дахин баталгаажуулна уу")}
            </Typography>
          ) : null}

          {granted && row.GrantedDate ? (
            <Typography
              variant="caption"
              component="div"
              sx={{ color: colors.brand.inkMuted, marginTop: space[1] }}
            >
              {t("Огноо")}:{" "}
              {Helper.ObjectHelper.getDateYMDDisplay(row.GrantedDate)}
            </Typography>
          ) : null}

          <Box
            sx={{
              display: draft ? "none" : "flex",
              flexWrap: "wrap",
              gap: space[2],
              marginTop: space[3],
            }}
          >
            {/* The full text before agreeing, which is the point of the
                separate document endpoint. */}
            <Button
              onClick={() => toggleDoc(row)}
              sx={gridToolbarButtonSx.neutral}
            >
              {OpenDoc === row.PurposeCode
                ? t("Текстийг хаах")
                : t("Дэлгэрэнгүй унших")}
            </Button>

            {granted ? (
              <Button
                onClick={() => withdraw(row)}
                disabled={Busy === row.PurposeCode}
                sx={gridToolbarButtonSx.danger}
              >
                {t("Зөвшөөрлөө цуцлах")}
              </Button>
            ) : (
              <Button
                onClick={() => grant(row)}
                disabled={Busy === row.PurposeCode}
                sx={gridToolbarButtonSx.primary}
              >
                {t("Зөвшөөрөх")}
              </Button>
            )}
          </Box>

          <Collapse in={OpenDoc === row.PurposeCode} unmountOnExit>
            <Box
              sx={{
                marginTop: space[3],
                padding: space[3],
                backgroundColor: colors.brand.tintSolid,
                borderRadius: radius.sm,
                whiteSpace: "pre-wrap",
                color: colors.brand.ink,
              }}
            >
              {Doc.loading && Doc.code === row.PurposeCode
                ? t("Ачаалж байна")
                : Doc.text || t("Зөвшөөрлийн текст бэлэн болоогүй байна")}
            </Box>
          </Collapse>
        </Box>
      );
    });
  };

  const RenderAccess = () => {
    if (Access.loading) {
      return (
        <Box sx={{ position: "relative", minHeight: "120px" }}>
          <DivLoading WithoutCard />
        </Box>
      );
    }
    if (Access.disabled) {
      return <BaseNoData Text={t("Хандалтын түүх одоогоор идэвхгүй байна")} />;
    }
    if (Access.error) {
      return <LoadError Message={Access.error} Retry={refresh} />;
    }
    if (!Access.data.length) {
      return <BaseNoData Text={t("Хандалтын бүртгэл алга байна")} />;
    }

    return Access.data.map((row, i) => (
      <Box
        key={row.Id || i}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: space[3],
          padding: `${space[2]} 0`,
          borderBottom:
            i === Access.data.length - 1
              ? "none"
              : `1px solid ${colors.border.subtle}`,
        }}
      >
        <Typography variant="body2" sx={{ color: colors.brand.ink }}>
          {row.UserName || row.DoctorName || t("Тодорхойгүй")}
        </Typography>
        <Typography variant="body2" sx={{ color: colors.brand.inkMuted }}>
          {Helper.ObjectHelper.getDateYMDDisplay(
            // LogDate, not CreateDate: the access-log rows are shaped by
            // listAccessLog, which selects and orders on LogDate. Reading the
            // wrong field left every date blank.
            row.LogDate,
          )}
        </Typography>
      </Box>
    ));
  };

  return (
    <PageContainer>
      <GridContainer spacing={2}>
        <GridItem xs={12} md={7}>
          <UniCard title={t("Хувийн мэдээлэл ашиглах зөвшөөрөл")}>
            {ActionError ? (
              <Box
                role="alert"
                sx={{
                  marginBottom: space[2],
                  color: colors.status.dangerInk,
                  backgroundColor: colors.status.dangerTint,
                  border: `1px solid ${colors.brand.hairline}`,
                  borderRadius: radius.sm,
                  padding: space[2],
                }}
              >
                {ActionError}
              </Box>
            ) : null}
            {RenderConsents()}
          </UniCard>
        </GridItem>
        <GridItem xs={12} md={5}>
          <UniCard title={t("Хандалтын түүх")}>{RenderAccess()}</UniCard>
        </GridItem>
      </GridContainer>
    </PageContainer>
  );
}
