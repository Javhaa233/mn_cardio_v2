import { withTranslation } from "react-i18next";
import React, { Component } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
// translation
import { css } from "@emotion/css";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import Button from "components/CustomButtons/Button";

import { adviceManage } from "assets/store/adviceManage";

import Helper from "helper";

const withMui5Styles = (stylesCreator) => (WrappedComponent) => {
  const rawStyles =
    typeof stylesCreator === "function" ? stylesCreator() : stylesCreator;
  const classes = Object.keys(rawStyles).reduce((acc, key) => {
    acc[key] = css(rawStyles[key]);
    return acc;
  }, {});

  const WithMui5Styles = React.forwardRef((props, ref) => (
    <WrappedComponent {...props} ref={ref} classes={classes} />
  ));
  return WithMui5Styles;
};

const styles = () => ({
  table: { minWidth: 650 },
  tableRow: { "& .MuiTableCell-root": { padding: "2px", fontSize: "12px" } },
});

class CalculateRisk extends Component {
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

  SetMonitoringId = (MonitoringId) => {
    this.MonitoringId = MonitoringId;
    this.GetRiskData(MonitoringId);
  };

  GetRiskData = async (DataId) => {
    await Helper.BaseCrudHelper.CallService(
      "/CVDMonitoring/GetLastRiskData",
      { MonitoringId: DataId },
      (resData) => {
        if (resData && resData.Success && resData.Data) {
          const level = resData.Data.Risk;
          const { bodyColor, bodyText } = this.setBodyData(parseInt(level));
          this.setState({
            customAdvice: JSON.parse(resData.Data.DoctorAdvice),
            score: resData.Data.Score,
            level,
            bodyColor,
            bodyText,
          });
        }
      },
    );
  };

  setLevelNull = () => this.setState({ score: 0, level: null });

  // GetData = () => {};

  setBodyData = (level) => {
    if (level) {
      switch (level) {
        case 5:
          return {
            bodyColor: "brown",
            bodyText:
              "Зүрхний шигдээс болон тархины харвалтын 10 жилийн эрсдэл 30-аас дээш хувь",
          };
        case 4:
          return {
            bodyColor: "red",
            bodyText:
              "Зүрхний шигдээс болон тархины харвалтын 10 жилийн эрсдэл 20-30 хувь",
          };
        case 3:
          return {
            bodyColor: "orange",
            bodyText:
              "Зүрхний шигдээс болон тархины харвалтын 10 жилийн эрсдэл 10-20 хувь",
          };
        case 2:
          return {
            bodyColor: "yellow",
            bodyText:
              "Зүрхний шигдээс болон тархины харвалтын 10 жилийн эрсдэл 5-10 хувь",
          };
        case 1:
          return {
            bodyColor: "green",
            bodyText:
              "Зүрхний шигдээс болон тархины харвалтын 10 жилийн эрсдэл  5-аас бага хувь ",
          };
        default:
          return { bodyColor: "white", bodyText: "" };
      }
    } else {
      return { bodyColor: null, bodyText: null };
    }
  };

  SetIsValidated = (ModifyObject) => {
    if (ModifyObject) {
      const result = Object.assign({}, ModifyObject);
      var bol = true;
      Object.keys(result).forEach((item) => {
        if (result[item] === null) bol = false;
      });
      return bol;
    } else {
      return false;
    }
  };

  CalculateAdvice = (level, history, bodySize) => {
    var list = [];

    if (history && bodySize) {
      const result = Object.keys(history);
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

    this.setState({ customAdvice: list });
  };

  Calculate = async (history, bodySize) => {
    console.log("Calculate method called with:", { history, bodySize });
    const { PatRegNo } = this.props;
    let alert = null;

    let mssg = "";
    if (!history) {
      mssg += "Түүх оруулна уу";
    }

    if (!bodySize) {
      mssg += mssg === "" ? "" : ", ";
      mssg += "Биеийн хэмжээс оруулна уу";
    }

    if (mssg !== "") {
      console.log("Validation failed:", mssg);
      alert = Helper.BaseCrudHelper.ShowAlert(mssg, false, () =>
        this.setState({ Alert: null }),
      );
      this.setState({ Alert: alert });
      return;
    }
    console.log("Validation passed, proceeding with calculation...");

    // columns
    let gender = null;
    let isCholestrol = null;
    let isDiabetes = history.TsusniiSahar === "y" ? "Yes" : "No";
    let isSmoker = history.TamkhiTatdag === "y" ? "Yes" : "No";
    let age = 0;
    let cholestrol = !isNaN(parseFloat(bodySize.Cholesterol))
      ? parseFloat(bodySize.Cholesterol)
      : 0;
    let pressure =
      !isNaN(parseFloat(bodySize.DaraltDeed)) &&
      parseFloat(bodySize.DaraltDeed) > 0
        ? parseFloat(bodySize.DaraltDeed)
        : 0;
    let BMI =
      !isNaN(parseFloat(bodySize.BJI)) && parseFloat(bodySize.BJI) > 0
        ? parseFloat(bodySize.BJI)
        : 0;

    // gender & age calculate
    //
    // This used to be its own inline copy of the derivation, which meant the
    // doctor screen and the citizen self-assessment could drift apart - and
    // they had, because only the helper carried the fixes. Both now go through
    // Helper.CVDHelper.deriveGenderAge, so a citizen checking their own risk
    // gets the same band the clinician gets. See CVDHelper.js for what the old
    // arithmetic got wrong (age was a year too high for most of the year).
    const derived = Helper.CVDHelper.deriveGenderAge(
      PatRegNo,
      this.props.Patient,
    );
    gender = derived.gender;
    age = derived.age;

    if (cholestrol === 0) {
      isCholestrol = "No";
    } else {
      isCholestrol = "Yes";
    }

    if (BMI === 0) {
      alert = Helper.BaseCrudHelper.ShowAlert(
        "БЖИ 0-с их байх ёстой",
        false,
        () => this.setState({ Alert: null }),
      );
      this.setState({ Alert: alert });
    }

    if (pressure === 0) {
      alert = Helper.BaseCrudHelper.ShowAlert("Даралт оруулна уу", false, () =>
        this.setState({ Alert: null }),
      );
      this.setState({ Alert: alert });
    }

    await Helper.CVDHelper.calculateRisk(
      {
        gender,
        isCholestrol,
        isDiabetes,
        isSmoker,
        age,
        cholestrol,
        pressure,
        BMI,
      },
      (data) => {
        if (data.Success) {
          if (data.Data) {
            const level = data.Data.risk;
            const { bodyColor, bodyText } = this.setBodyData(level);
            this.setState({
              score: data.Data.score,
              level,
              bodyColor,
              bodyText,
            });

            this.CalculateAdvice(level, history, bodySize);
          }
        } else {
          alert = Helper.BaseCrudHelper.ShowAlert(data.Message, false, () =>
            this.setState({ Alert: null }),
          );
          this.setState({ Alert: alert });
        }
      },
    );
  };

  IsValidated = () => {
    const { score, level, customAdvice } = this.state;
    const myArrStr = JSON.stringify(customAdvice);
    if (score > 0 && level) {
      return { Score: score, Risk: level, DoctorAdvice: myArrStr };
    } else {
      return null;
    }
  };

  AdvicePrint = () => {
    const element = document.querySelector("#tabler");
    if (!element) return;

    html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(
        (pdfWidth - 20) / imgWidth,
        (pdfHeight - 20) / imgHeight,
      );
      const width = imgWidth * ratio;
      const height = imgHeight * ratio;

      pdf.addImage(imgData, "PNG", 10, 10, width, height);
      pdf.save("advice.pdf");
    });
  };

  render() {
    const { classes, t, GetRisk } = this.props;
    const { score, level, customAdvice, Alert, bodyColor, bodyText } =
      this.state;

    return (
      <div>
        {Alert}
        <Button
          color="danger"
          onClick={() => {
            if (GetRisk) {
              GetRisk();
            } else {
              console.error("GetRisk function is not defined");
            }
          }}
        >
          {t("Calculate risk")}
        </Button>
        <div style={{ marginTop: "30px" }}>
          {level ? (
            <div
              style={{
                height: "100px",
                margin: "10px",
                border: "1px solid " + bodyColor,
                display: "flex",
              }}
            >
              <span
                style={{
                  backgroundColor: "" + bodyColor,
                  width: "100px",
                  height: "100px",
                  color: "#fff",
                  fontWeight: "normal",
                  fontSize: "2.2rem",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {score ? score : 0}
              </span>
              <span style={{ margin: "auto" }}>{t(bodyText)}</span>
            </div>
          ) : null}
        </div>

        {level && customAdvice && customAdvice.length > 0 ? (
          <div>
            <h5
              style={{
                margin: 0,
                padding: 0,
                fontWeight: "400",
                marginBottom: "10px",
                borderBottom: "1px solid #2e2e2e",
              }}
            >
              {t("Advice")}
            </h5>
            <div
              style={{
                margin: "10px",
                fontStyle: "custom",
                border: "1px solid rgb(224,224,224)",
              }}
            >
              <Table size="small" id="tabler">
                <TableHead>
                  <TableRow className={classes.tableRow}>
                    <TableCell align="center" width="50px">
                      #
                    </TableCell>
                    <TableCell align="left">{t("Advice")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.isArray(customAdvice) &&
                    customAdvice.map((info, index) => (
                      <TableRow className={classes.tableRow} key={index}>
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
              onClick={() => this.AdvicePrint()}
            >
              {t("Print")}
            </Button>
          </div>
        ) : null}
      </div>
    );
  }
}

export default withTranslation(undefined, { withRef: true })(
  withMui5Styles(styles)(CalculateRisk),
);
