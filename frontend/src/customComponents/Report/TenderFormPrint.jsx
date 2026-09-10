import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Box from "@mui/material/Box";

import Button from "components/CustomButtons/Button";
import BaseLoading from "customComponents/BaseLoading";
import BaseNoData from "customComponents/BaseNoData";

import Helper from "helper";

/**
 * A4 print sheet for any tender phase-4 form.
 *
 * The sheet itself is built on the server by reports/TenderForm.js from the
 * same field dictionary that renders the editor. This component only previews
 * it and offers the two ways out: the browser's print dialog, or a PDF.
 *
 * That split is the point. Preview and PDF are the same document, so what the
 * doctor checks on screen is what comes out of the printer - there is no second
 * layout that can drift from the first. It also means the sheet renders inside
 * an <iframe>, which is why this file no longer carries the block of
 * `@media print` rules that used to fight the MUI dialog's clipping: a
 * standalone document has no dialog ancestors to escape from.
 */
export default function TenderFormPrint(props) {
  const { FormCode, DataId, PatRegNo } = props;
  const { t } = useTranslation();

  const [blank, setBlank] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sheet, setSheet] = useState({ key: null, html: "", error: "" });

  const frameRef = useRef(null);

  // Identifies the sheet currently being asked for. Loading is DERIVED from it
  // rather than flipped by hand, so toggling "blank" shows the spinner on the
  // same render that starts the fetch - no setState inside the effect body,
  // which this project's eslint config treats as an error, not a warning.
  const requestKey = [
    FormCode,
    blank ? "blank" : DataId || "",
    PatRegNo || "",
  ].join("|");

  const loading = sheet.key !== requestKey;
  const { html, error } = sheet;

  useEffect(() => {
    let cancelled = false;

    Helper.BaseCrudHelper.CallService(
      "/TenderForm/PrintHtml",
      // With no DataId this prints the patient's most recent saved instance,
      // which is what makes print work on the repeatable forms where the open
      // editor is always a new, unsaved instance.
      { FormCode, Id: blank ? null : DataId, PatRegNo, Blank: blank },
      (res) => {
        if (cancelled) return;
        if (res && res.Success && res.Data && res.Data.Html) {
          setSheet({ key: requestKey, html: res.Data.Html, error: "" });
        } else {
          setSheet({
            key: requestKey,
            html: "",
            error:
              (res && res.Message) ||
              t("Хэвлэх бүртгэл олдсонгүй. Эхлээд маягтыг хадгална уу."),
          });
        }
      },
    );

    return () => {
      cancelled = true;
    };
  }, [requestKey, FormCode, DataId, PatRegNo, blank, t]);

  /** Print the sheet, not the page around it. */
  const handlePrint = useCallback(() => {
    const frame = frameRef.current;
    if (!frame || !frame.contentWindow) return;
    frame.contentWindow.focus();
    frame.contentWindow.print();
  }, []);

  const handleDownload = useCallback(() => {
    setDownloading(true);
    Helper.BaseCrudHelper.BasePrintReport(
      {
        Url: "/TenderForm/PrintReport",
        Data: {
          FormCode,
          Id: blank ? null : DataId,
          PatRegNo,
          Blank: blank,
        },
        FileName: `${FormCode}${blank ? "-хоосон" : ""}.pdf`,
      },
      () => setDownloading(false),
    );
  }, [FormCode, DataId, PatRegNo, blank]);

  return (
    <div>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 1,
          mb: 1,
        }}
      >
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={blank}
              onChange={(e) => setBlank(e.target.checked)}
            />
          }
          // A blank sheet is how the paper form is actually used at the bedside:
          // filled by hand first, entered afterwards.
          label={t("Хоосон маягт")}
        />
        <Button color="info" onClick={handlePrint} disabled={loading || !html}>
          {t("Хэвлэх")}
        </Button>
        <Button
          color="primary"
          onClick={handleDownload}
          disabled={loading || !html || downloading}
        >
          {downloading ? t("Татаж байна...") : t("PDF татах")}
        </Button>
      </Box>

      {loading ? <BaseLoading /> : null}
      {!loading && error ? <BaseNoData Text={error} /> : null}

      {!loading && !error ? (
        <iframe
          ref={frameRef}
          title={t("Хэвлэх маягт")}
          srcDoc={html}
          style={{
            width: "100%",
            height: "70vh",
            border: "1px solid #ddd",
            background: "#fff",
          }}
        />
      ) : null}
    </div>
  );
}
