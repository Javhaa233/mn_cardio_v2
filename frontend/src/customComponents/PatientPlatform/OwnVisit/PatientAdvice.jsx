import { withTranslation } from "react-i18next";
import React, { Component } from "react";
import jsPDF from "jspdf";
// translation

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import Button from "components/CustomButtons/Button";

import { adviceManage } from "assets/store/adviceManage";

// helper
import Helper from "helper";
import { colors } from "@/theme/colors";
import { radius, elevation } from "@/theme/tokens";

import "assets/font/Roboto-Italic-normal";

class PatientAdvice extends Component {
  constructor(props) {
    super(props);
    this.state = {
      score: 0,
      level: null,
      customAdvice: [],
      Alert: null,
      userID: null,
      bodyColor: null,
      bodyText: null,
    };
    this.MonitoringId = null;
  }

  /**
   * The citizen computes their own risk (tender item 6:
   * "иргэн эрсдэлээ өөрөө боддог болгох").
   *
   * This calls the very same public endpoint and builds the very same inputs
   * the doctor screen does, through Helper.CVDHelper, so a patient checking
   * their own risk sees the number their clinician would see. It does not
   * write anything - the stored assessment stays the doctor's.
   */
  Calculate = async (history, bodySize, PatRegNo, patient) => {
    const t = this.props.t;

    const missing = [];
    if (!history) missing.push(t("Өвчний түүх"));
    if (!bodySize) missing.push(t("Биеийн хэмжээс"));
    if (missing.length) {
      this.setState({ CalcError: missing.join(", ") + " " + t("оруулна уу") });
      return;
    }

    const input = Helper.CVDHelper.buildRiskInput(
      PatRegNo,
      history,
      bodySize,
      patient,
    );

    // the band table needs a blood pressure and a BMI to land in a row
    if (!input.pressure) {
      this.setState({ CalcError: t("Даралт оруулна уу") });
      return;
    }
    if (!input.BMI) {
      this.setState({ CalcError: t("БЖИ оруулна уу") });
      return;
    }

    this.setState({ Calculating: true, CalcError: null });
    await Helper.CVDHelper.calculateRisk(input, (res) => {
      if (res && res.Success && res.Data) {
        const level = res.Data.risk;
        const { bodyColor, bodyText } = Helper.CVDHelper.riskBand(level);
        this.setState({
          score: res.Data.score,
          level,
          bodyColor,
          bodyText,
          Calculating: false,
        });
        this.CalculateAdvice(level, history, bodySize);
      } else {
        this.setState({
          Calculating: false,
          CalcError:
            (res && res.Message) ||
            t("Таны оруулсан үзүүлэлтэд тохирох эрсдэлийн үнэлгээ олдсонгүй"),
        });
      }
    });
  };

  CalculateAdvice = (level, history, bodySize) => {
    const t = this.props.t;
    var list = [];
    if (history && bodySize) {
      const result = Object.keys(history);
      Array.isArray(result) &&
        result.map((key) =>
          history[key] && history[key] === "y" && adviceManage[key]
            ? list.push(adviceManage[key])
            : null,
        );

      if (bodySize.BJI > 25) {
        list.push(adviceManage.BJI);
      }
      if (level > 4) {
        list.push(adviceManage.level5);
      } else if (level > 3) {
        list.push(adviceManage.level4);
      } else if (level > 2) {
        list.push(adviceManage.level3);
      } else if (level > 1) {
        list.push(adviceManage.level2);
      } else {
        list.push(adviceManage.level1);
      }
    }

    this.setState({ level, customAdvice: list });
  };

  AdvicePrint = (data) => {
    var doc = new jsPDF();
    doc.setFontSize(9);
    doc.setFont("Roboto-Italic", "normal");
    doc.text(10, 10, "#");
    doc.text(15, 10, "Зөвлөгөө");
    doc.text(10, 12, "_____________________________________________");

    if (data) {
      for (var i = 0; i < data.length; i++) {
        doc.text(10, 10 * (i + 2), i + 1 + ".");
        doc.text(15, 10 * (i + 2), data[i]);
      }
    }
    doc.save("advice.pdf");
  };

  render() {
    const { t, CanCalculate, onCalculate } = this.props;
    const {
      level,
      customAdvice,
      score,
      bodyColor,
      bodyText,
      Calculating,
      CalcError,
    } = this.state;

    return (
      <div>
        {/* tender item 6: the citizen's own risk result and the button that
            produces it. Shown whether or not a doctor has already assessed
            them - before this, the tab was blank until a clinician ran it. */}
        {CanCalculate ? (
          <div
            style={{
              // The panel every card on the portal uses (it was a grey 6px
              // outline). The printed table (#tabler) below is untouched.
              border: `1px solid ${colors.brand.hairline}`,
              borderRadius: radius.lg,
              backgroundColor: colors.brand.surface,
              boxShadow: elevation[1],
              padding: "14px 16px",
              marginBottom: 14,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div style={{ flex: "1 1 260px" }}>
                <div
                  style={{
                    fontWeight: 600,
                    marginBottom: 2,
                    color: colors.brand.ink,
                  }}
                >
                  {t("Зүрх судасны эрсдэлийн үнэлгээ")}
                </div>
                <div style={{ fontSize: 13, color: colors.brand.inkMuted }}>
                  {level
                    ? bodyText
                    : t(
                        "Өвчний түүх болон биеийн хэмжээсээ бөглөсний дараа эрсдэлээ тооцоолно уу",
                      )}
                </div>
              </div>

              {level ? (
                <div
                  aria-label={t("Эрсдэлийн түвшин")}
                  style={{
                    minWidth: 92,
                    textAlign: "center",
                    padding: "8px 12px",
                    borderRadius: 6,
                    background: bodyColor || colors.brand.tintSolid,
                    // Ink on the light bands, white on the dark ones.
                    color:
                      !bodyColor ||
                      bodyColor === "yellow" ||
                      bodyColor === "orange"
                        ? colors.brand.ink
                        : "#fff",
                    fontWeight: 600,
                  }}
                >
                  {t("Түвшин")} {level}
                  {score ? (
                    <div style={{ fontSize: 12, fontWeight: 400 }}>{score}</div>
                  ) : null}
                </div>
              ) : null}

              {/* The tab's one action, so the filled button. */}
              <Button
                color="primary"
                size="sm"
                disabled={Calculating === true}
                onClick={() => onCalculate && onCalculate()}
              >
                {Calculating ? t("Тооцоолж байна...") : t("Эрсдэлээ тооцоолох")}
              </Button>
            </div>

            {CalcError ? (
              <div
                style={{
                  marginTop: 8,
                  color: colors.status.dangerInk,
                  fontSize: 13,
                }}
              >
                {CalcError}
              </div>
            ) : null}
          </div>
        ) : null}

        {level !== null && customAdvice && customAdvice.length > 0 ? (
          <div>
            {/* Was a bare h5 over a near-black rule (styles/_misc.scss
                reaches bare headings). Not inside the printed #tabler. */}
            <div
              style={{
                fontWeight: 600,
                color: colors.brand.ink,
                paddingBottom: "6px",
                marginBottom: "10px",
                borderBottom: `1px solid ${colors.brand.hairline}`,
              }}
            >
              {t("Advice")}
            </div>
            <div
              style={{
                margin: "10px",
                fontStyle: "custom",
                border: "1px solid rgb(224,224,224)",
              }}
            >
              <Table size="small" id="tabler">
                <TableHead>
                  <TableRow
                    sx={{
                      "& .MuiTableCell-root": {
                        padding: "2px",
                        fontSize: "12px",
                      },
                    }}
                  >
                    <TableCell align="center" width="50px">
                      #
                    </TableCell>
                    <TableCell align="left">{t("Advice")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.isArray(customAdvice) &&
                    customAdvice.map((info, index) => (
                      <TableRow
                        sx={{
                          "& .MuiTableCell-root": {
                            padding: "2px",
                            fontSize: "12px",
                          },
                        }}
                        key={index}
                      >
                        <TableCell align="center" width="50px">
                          {index + 1}
                        </TableCell>
                        <TableCell align="left">{info}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
            <Button
              variant="contained"
              color="info"
              size="sm"
              onClick={() => this.AdvicePrint(customAdvice)}
            >
              {t("Print")}
            </Button>
          </div>
        ) : null}
      </div>
    );
  }
}

export default withTranslation(undefined, { withRef: true })(PatientAdvice);
