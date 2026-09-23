import { withTranslation } from "react-i18next";
import React, { Component } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
// translation
import { Box, Button, Typography } from "@mui/material";
import colors from "@/theme/colors";
import { gridToolbarButtonSx } from "@/theme/controlStyles";

import BaseLoading from "customComponents/BaseLoading";

import Helper from "helper";
import { createMarkup } from "utils/sanitize";
import { call } from "config/Server";

// images
// import hospitalLogo from "assets/img/hospital_logo.jpg";
// import mnCardio from "assets/img/mnCardio_print.jpg";

// new images
// import hospitalNewLogo from "assets/img/new_logo.jpg";
import mnCardioNew from "assets/img/new_print.png";
import mnCardioNewLogo from "assets/img/new_print_logo.png";

const styles = {
  body: {
    margin: "0 auto",
    padding: "15px",
    fontSize: "16px",
    fontWeight: "400",
    width: "210mm",
    minHeight: "297mm",
    position: "relative",
    overflow: "visible", // хэвлэлтэд тасрахгүй байхаар
  },
  noBreak: {
    pageBreakInside: "avoid",
    breakInside: "avoid",
    display: "block",
    wordBreak: "keep-all", // ← үг таслахгүй
    overflowWrap: "normal", // ← wrap хийхгүй
    whiteSpace: "normal", // ← мөр таслахыг зөвшөөрнө
  },
  avoidBreak: {
    pageBreakInside: "avoid",
    breakInside: "avoid",
    display: "block",
    wordBreak: "keep-all",
    overflowWrap: "normal",
    whiteSpace: "normal",
    padding: "5px 0",
  },
};

class OutPatientInfoReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Data: null,
      PatientData: null,
      InPatientInfo: null,
      DataId: props.DataId || null,
      Alert: null,
      Loaded: false,
      OrganizationLogo: null,
      Login: null,
      Reissuing: false,
    };
    this.LogedUser = Helper.AuthHelper.GetLogedUserLocal();
    // Refs to the editable admission/discharge date spans so we can read the
    // doctor's edits on print and persist them back to the Stay record.
    this.admissionRef = React.createRef();
    this.dischargeRef = React.createRef();
  }

  componentDidMount() {
    this.GetDetailView();
    this.GetOrganizationLogo();
  }

  componentDidUpdate(prevProps, prevState) {
    const { Data, PatientData, InPatientInfo, Loaded } = this.state;
    if (Data && PatientData && InPatientInfo && !Loaded) {
      this.setState({ Loaded: true }, () => {
        const t = this.props.t;
        if (this.props.onLoad) this.props.onLoad();
      });
    }
  }

  GetOrganizationLogo = async () => {
    try {
      const OrganizationId =
        this.LogedUser?.Doctor?.OrganizationId ||
        this.LogedUser?.Doctor?.Organization?.Id;
      if (OrganizationId) {
        const response = await call({
          url: `/Organization/GetOne/${OrganizationId}`,
          method: "GET",
        });
        if (response?.success && response?.data?.Logo?.uri) {
          this.setState({ OrganizationLogo: response.data.Logo.uri });
        }
      }
    } catch (error) {
      console.error("Failed to fetch organization logo:", error);
    }
  };

  GetDetailView = async () => {
    const { DataId } = this.state;
    var SearchOption = Helper.BaseCrudHelper.GetSearchOption();
    SearchOption.SearchField = [{ Field: "Id", Value: DataId, Op: "Equals" }];
    await Helper.BaseCrudHelper.BaseGetDetailInfo(
      { ObjectName: "OutPatientInfo", SearchOption },
      (resData) => {
        if (resData && resData.Data) {
          this.setState({ Data: resData.Data });
          this.GetPatientData(resData.Data.PatientId);
          this.GetInPatientInfo(resData.Data.StayId);
        }
      },
    );
  };

  GetInPatientInfo = async (StayId) => {
    if (StayId) {
      var SearchOption = Helper.BaseCrudHelper.GetSearchOption();
      SearchOption.SearchField = [
        { Field: "id_data", Value: StayId, Op: "Equals" },
      ];
      await Helper.BaseCrudHelper.BaseGetDetailInfo(
        { ObjectName: "Stay", SearchOption },
        (resData) => resData && this.setState({ InPatientInfo: resData.Data }),
      );
    }
  };

  GetPatientData = async (PatientId) => {
    if (PatientId) {
      await Helper.PatientShowHelper.GetPatientInfoById(
        PatientId,
        (resData) => {
          if (resData && resData.Success) {
            this.setState({ PatientData: resData.Data });
          }
        },
      );
    }
  };

  // The patient portal password. Opening this report used to reset it (it
  // called GetPatientPlainPassword on mount), breaking the sheet the patient
  // already had. Now it is issued when the report is PRINTED, once per stay:
  // a reprint gets AlreadyIssued and prints the login name only. A password
  // already on screen is kept, so printing twice in one sitting shows it twice.
  PrepareLogin = async () => {
    const { DataId, Login } = this.state;
    if (Login?.PlainPassword) return;
    try {
      const res = await call({
        url: "/OutPatientInfo/IssueLoginForPrint",
        method: "POST",
        data: { Id: DataId },
      });
      const Next = res?.Success && res?.Data ? res.Data : { Failed: true };
      await new Promise((resolve) => this.setState({ Login: Next }, resolve));
    } catch (e) {
      await new Promise((resolve) =>
        this.setState({ Login: { Failed: true } }, resolve),
      );
    }
  };

  // The patient lost the sheet: issue a new password, replacing the old one.
  AskReissue = () => {
    const { t } = this.props;
    const alert = Helper.BaseCrudHelper.ShowConfirm(
      t(
        "Өвчтөнд шинэ нууц үг олгох уу? Өмнө хэвлэсэн нууц үг ажиллахаа болино.",
      ),
      () => {
        this.setState({ Alert: null });
        this.Reissue();
      },
      () => this.setState({ Alert: null }),
    );
    this.setState({ Alert: alert });
  };

  Reissue = async () => {
    const { t } = this.props;
    const PatientId = this.state.Data?.PatientId;
    if (!PatientId) return;
    this.setState({ Reissuing: true });
    try {
      const res = await call({
        url: "/OutPatientInfo/GetPatientPlainPassword",
        method: "POST",
        data: { PatientId },
      });
      if (res?.Success && res?.Data?.PlainPassword) {
        this.setState({ Login: { ...res.Data, AlreadyIssued: false } });
      } else {
        this.setState({
          Alert: Helper.BaseCrudHelper.ShowAlert(
            res?.Message || t("Нууц үг олгож чадсангүй"),
            false,
            () => this.setState({ Alert: null }),
          ),
        });
      }
    } catch (e) {
      this.setState({
        Alert: Helper.BaseCrudHelper.ShowAlert(
          t("Нууц үг олгож чадсангүй"),
          false,
          () => this.setState({ Alert: null }),
        ),
      });
    } finally {
      this.setState({ Reissuing: false });
    }
  };

  Print = async (callback) => {
    let alert = null;
    await this.PrepareLogin();
    const element = document.querySelector("#divToPrint");
    if (!element) return;

    // Strip the on-screen "editable" styling (dashed underline) so the PDF stays clean.
    const editables = Array.from(element.querySelectorAll(".editable-date"));
    const savedStyles = editables.map((el) => el.getAttribute("style"));
    editables.forEach((el) => {
      el.style.borderBottom = "none";
      el.style.background = "transparent";
    });
    const restoreEditableStyles = () => {
      editables.forEach((el, i) => {
        if (savedStyles[i] == null) el.removeAttribute("style");
        else el.setAttribute("style", savedStyles[i]);
      });
    };

    html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
    })
      .then((canvas) => {
        restoreEditableStyles();
        const image = { type: "png", quality: 1.0 };
        const margin = [0.5, 0.5]; // [top/bottom, left/right] in inches

        const imgWidth = 8.5; // PDF Page width
        const pageHeight = 11; // PDF Page height

        const innerPageWidth = imgWidth - margin[1] * 2;
        const innerPageHeight = pageHeight - margin[0] * 2;

        // Calculate the height of one PDF page in canvas pixels
        const pxPageHeight = Math.floor(
          canvas.width * (innerPageHeight / innerPageWidth),
        );

        const pdf = new jsPDF("p", "in", [imgWidth, pageHeight]);
        const ctx = canvas.getContext("2d", { willReadFrequently: true });

        let currentY = 0;
        const fullHeight = canvas.height;
        let pageNum = 0;

        while (currentY < fullHeight) {
          let chunkHeight = pxPageHeight;

          // If not the last chunk, try to find a blank line near the bottom to avoid splitting text
          if (currentY + chunkHeight < fullHeight) {
            // Look for a blank line in the bottom 10% of the page
            const searchRange = Math.floor(pxPageHeight * 0.15);
            let foundBlank = false;

            for (
              let y = currentY + chunkHeight;
              y > currentY + chunkHeight - searchRange;
              y--
            ) {
              const rowData = ctx.getImageData(0, y, canvas.width, 1).data;
              let isBlank = true;

              // Check every 20th pixel for performance
              for (let i = 0; i < rowData.length; i += 80) {
                // If pixel is not white (approx)
                if (
                  rowData[i] < 250 ||
                  rowData[i + 1] < 250 ||
                  rowData[i + 2] < 250
                ) {
                  isBlank = false;
                  break;
                }
              }

              if (isBlank) {
                chunkHeight = y - currentY;
                foundBlank = true;
                break;
              }
            }
          } else {
            chunkHeight = fullHeight - currentY;
          }

          if (pageNum > 0) pdf.addPage();

          // Slice the canvas
          const pageCanvas = document.createElement("canvas");
          pageCanvas.width = canvas.width;
          pageCanvas.height = chunkHeight;
          const pageCtx = pageCanvas.getContext("2d");

          pageCtx.fillStyle = "white";
          pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          pageCtx.drawImage(
            canvas,
            0,
            currentY,
            canvas.width,
            chunkHeight,
            0,
            0,
            canvas.width,
            chunkHeight,
          );

          const pdfChunkHeight = (chunkHeight * innerPageWidth) / canvas.width;
          const imgData = pageCanvas.toDataURL(
            "image/" + image.type,
            image.quality,
          );

          pdf.addImage(
            imgData,
            image.type,
            margin[1],
            margin[0],
            innerPageWidth,
            pdfChunkHeight,
          );

          currentY += chunkHeight;
          pageNum++;
        }

        pdf.save("OutPatientInfo.pdf");
        // Persist any date edits back to the Stay record (inpatient only).
        this.SaveStayDates();
        alert = Helper.BaseCrudHelper.ShowAlert(
          "Successfully printed",
          true,
          () => {
            this.setState({ Alert: null });
            callback && callback();
          },
        );
        this.setState({ Alert: alert });
      })
      .catch(() => {
        restoreEditableStyles();
      });
  };

  // Inline date the user can edit on screen before printing. Uncontrolled on
  // purpose: html2canvas reads the live DOM text, so edits flow into the PDF
  // without React re-rendering and resetting the caret.
  renderEditableDate = (initialValue, ref) => (
    <span
      ref={ref}
      className="editable-date"
      contentEditable
      suppressContentEditableWarning
      style={{
        borderBottom: "1px dashed #1976d2",
        outline: "none",
        cursor: "text",
        padding: "0 2px",
        display: "inline-block",
        minWidth: "70px",
      }}
    >
      {initialValue}
    </span>
  );

  // Persist the edited admission/discharge dates back to the Stay record.
  // Only runs for inpatient reports, only sends valid (YYYY-MM-DD) values that
  // actually changed.
  SaveStayDates = async () => {
    const { InPatientInfo } = this.state;
    const isInPatient = this.props.IsInPatient || !!InPatientInfo?.OutDate;
    const StayId = InPatientInfo?.id_data;
    if (!isInPatient || !StayId) return;

    const dateRe = /^\d{4}-\d{2}-\d{2}$/;
    const origAdmission = InPatientInfo.date_admission
      ? InPatientInfo.date_admission.split("T")[0]
      : "";
    const origDischarge = InPatientInfo.date_discharge
      ? InPatientInfo.date_discharge.split("T")[0]
      : "";
    const newAdmission = this.admissionRef.current
      ? this.admissionRef.current.textContent.trim()
      : "";
    const newDischarge = this.dischargeRef.current
      ? this.dischargeRef.current.textContent.trim()
      : "";

    const payload = { StayId };
    if (dateRe.test(newAdmission) && newAdmission !== origAdmission)
      payload.DateAdmission = newAdmission;
    if (dateRe.test(newDischarge) && newDischarge !== origDischarge)
      payload.DateDischarge = newDischarge;

    if (!payload.DateAdmission && !payload.DateDischarge) return;

    try {
      const res = await call({
        url: "/OutPatientInfo/UpdateStayDates",
        method: "POST",
        data: payload,
      });
      if (res?.Success) {
        this.setState((prev) => ({
          InPatientInfo: {
            ...prev.InPatientInfo,
            date_admission:
              payload.DateAdmission || prev.InPatientInfo.date_admission,
            date_discharge:
              payload.DateDischarge || prev.InPatientInfo.date_discharge,
          },
        }));
      }
    } catch (e) {
      console.error("Failed to save Stay dates:", e);
    }
  };

  NewPrint = (callback) => this.Print(callback);

  // Mirrors backend/reports/PatientLoginSlip.js, so the client-printed sheet
  // and the server PDF hand the patient the same box. This is inside
  // #divToPrint (html2canvas), so it keeps to inline styles and no bare
  // headings or tables.
  renderLoginSlip = () => {
    const { PatientData, Login } = this.state;
    const UserName =
      Login?.UserName ||
      PatientData?.LinkedUser?.UserName ||
      PatientData?.p_registration;
    if (!UserName) return null;

    const Mono = {
      fontFamily: '"Consolas", "Courier New", monospace',
      fontWeight: "bold",
      fontSize: "20px",
      letterSpacing: "1px",
    };
    const Password = Login?.PlainPassword
      ? String(Login.PlainPassword).replace(/^(\d{3})(\d{3})$/, "$1 $2")
      : null;

    return (
      <Box
        sx={{
          ...styles.avoidBreak,
          marginBottom: "10px",
          border: `1px solid ${colors.brand.hairlineStrong}`,
          padding: "8px",
        }}
      >
        <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
          Иргэний платформ (үзлэгийн түүх) орох:
        </div>
        <div>https://smr.telemedicine.mn/patient</div>
        <div style={{ marginTop: "6px" }}>
          Нэвтрэх нэр: <span style={Mono}>{UserName}</span>
        </div>
        {Password ? (
          <>
            <div>
              Нууц үг: <span style={Mono}>{Password}</span>
            </div>
            {Login?.ExpireDate && (
              <div>Нууц үгийн хүчинтэй хугацаа: {Login.ExpireDate}</div>
            )}
            <div style={{ marginTop: "4px", fontSize: "14px" }}>
              1. Утсан дээрээ дээрх хаягийг нээнэ. 2. Нэвтрэх нэрт регистрийн
              дугаараа бичнэ. 3. Нууц үгийн 6 оронтой тоог хоосон зайгүйгээр
              бичнэ.
            </div>
          </>
        ) : Login?.AlreadyIssued ? (
          <div style={{ fontSize: "14px" }}>
            Нууц үгийг өмнө нь хэвлэж өгсөн. Мартсан бол эмчдээ хандаж шинэ нууц
            үг авна уу.
          </div>
        ) : null}
      </Box>
    );
  };

  // Screen-only: outside #divToPrint, so it never reaches the PDF.
  renderLoginActions = () => {
    const { t } = this.props;
    const { Login, Reissuing } = this.state;
    return (
      <Box
        sx={{
          width: "210mm",
          margin: "0 auto 8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 1,
        }}
      >
        <Typography
          variant="caption"
          component="span"
          sx={{ color: colors.text.secondary }}
        >
          {Login?.PlainPassword
            ? t("Нууц үг олгогдлоо — хэвлээд өвчтөнд өгнө үү")
            : t("Нууц үг хэвлэх үед нэг удаа олгогдоно")}
        </Typography>
        <Button
          size="small"
          sx={gridToolbarButtonSx.neutral}
          disabled={Reissuing}
          onClick={this.AskReissue}
        >
          {t("Шинэ нууц үг олгох")}
        </Button>
      </Box>
    );
  };

  render() {
    const { Data, PatientData, InPatientInfo, Alert, OrganizationLogo } =
      this.state;
    const { t, IsInPatient } = this.props;
    const isInPatient = IsInPatient || !!InPatientInfo?.OutDate;
    const hasUuhEm =
      !!Data?.UuhEm &&
      Data.UuhEm.replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .trim().length > 0;

    return (
      <div>
        {Alert}
        <div style={{ width: "100%" }}>
          {!Data || !PatientData || !InPatientInfo ? (
            <BaseLoading />
          ) : (
            <>
              {this.renderLoginActions()}
              <div
                style={{
                  margin: "0 auto",
                  width: "210mm",
                  border: "1px solid #ccc",
                }}
              >
                <Box id="divToPrint" sx={styles.body}>
                  <div
                    style={{
                      display: "inline-block",
                      width: "100%",
                      marginBottom: "4px",
                    }}
                  >
                    <div style={{ float: "left", marginLeft: "16px" }}>
                      {/* Use organization logo if available, otherwise default */}
                      <img
                        alt="Logo"
                        src={OrganizationLogo || mnCardioNewLogo}
                        style={{ width: "auto", height: "40px" }}
                      />
                    </div>
                    <div style={{ float: "right", marginRight: "16px" }}>
                      <img
                        alt="Cardion center"
                        src={mnCardioNew}
                        style={{ width: "auto", height: "40px" }}
                      />
                    </div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <h5 style={{ fontSize: "18px", fontWeight: "500" }}>
                      {InPatientInfo.DrgroupDepartments
                        ? InPatientInfo.DrgroupDepartments.name
                        : ""}
                      {isInPatient
                        ? "т хэвтэн эмчлүүлсэн тухай"
                        : "т амбулатороор үзүүлсэн тухай"}
                    </h5>
                  </div>

                  <div style={{ marginBottom: "15px" }}>
                    <div style={{ display: "inline-block", width: "100%" }}>
                      <div style={{ fontWeight: "bold" }}>
                        {PatientData.p_lastname} овогтой{" "}
                        {PatientData.p_firstname}{" "}
                        {PatientData.p_birthday
                          ? Helper.ObjectHelper.GetAgeDateStr(
                              PatientData.p_birthday,
                            )
                          : "..."}{" "}
                        нас/
                        {PatientData.p_genderObj
                          ? Helper.ObjectHelper.getGenderLabel(
                              PatientData.p_genderObj.Value ||
                                PatientData.p_genderObj.Label,
                            )
                          : "..."}
                        ,
                      </div>
                      Улсын 3-р төв эмнэлгийн{" "}
                      {InPatientInfo.DrgroupDepartments
                        ? InPatientInfo.DrgroupDepartments.name
                        : ""}
                      т{" "}
                      {isInPatient ? (
                        <>
                          {this.renderEditableDate(
                            InPatientInfo.date_admission
                              ? InPatientInfo.date_admission.split("T")[0]
                              : ".......",
                            this.admissionRef,
                          )}
                          {" - "}
                          {this.renderEditableDate(
                            InPatientInfo.date_discharge
                              ? InPatientInfo.date_discharge.split("T")[0]
                              : ".......",
                            this.dischargeRef,
                          )}{" "}
                        </>
                      ) : (
                        <>
                          {this.renderEditableDate(
                            Data.CreateDate
                              ? Data.CreateDate.split("T")[0]
                              : ".......",
                          )}{" "}
                        </>
                      )}
                      {isInPatient
                        ? "өдөр хэвтэн эмчлүүлсэн"
                        : "өдөр амбулатороор үзүүлсэн"}
                    </div>
                    <Box sx={styles.avoidBreak}>
                      {/* Онош: {}  */}
                      <p
                        dangerouslySetInnerHTML={createMarkup(
                          "Онош: " +
                            Data.Diagnosis +
                            (isInPatient
                              ? " оноштойгоор хэвтэн эмчлүүлэв."
                              : " оноштойгоор амбулатороор үзүүлэв."),
                        )}
                      />
                    </Box>
                  </div>
                  <div style={{ width: "100%", marginBottom: "15px" }}>
                    <Box sx={styles.avoidBreak}>
                      <div style={{ fontWeight: "bold" }}>
                        Хийгдсэн оношилгоо, шинжилгээ:
                      </div>
                      <div
                        style={{ fontSize: "16px" }}
                        dangerouslySetInnerHTML={createMarkup(
                          Data.HiigdsenShinjilgee,
                        )}
                      />
                    </Box>
                  </div>
                  <div style={{ marginBottom: "15px" }}>
                    <Box sx={styles.avoidBreak}>
                      <div style={{ fontWeight: "bold" }}>
                        Хийгдсэн эмчилгээ:
                      </div>

                      <div
                        style={{
                          fontSize: "16px",
                          paddingLeft: "4px",
                        }}
                        dangerouslySetInnerHTML={createMarkup(
                          Data.HiigdsenEmchilgee,
                        )}
                      />
                    </Box>
                  </div>

                  {/* New */}
                  {/* <div style={{ marginBottom: "4px" }}>
                  <div style={{ fontWeight: "bold" }}>
                    Зүрхний шигдээсийн дараах сэргээн засах эмчилгээнд явах:
                  </div>
                  <div
                    style={{ fontSize: "16px" }}
                    dangerouslySetInnerHTML={createMarkup(Data.SergeenZasah)}
                  />
                </div> */}

                  <div style={{ marginBottom: "4px" }}>
                    <div style={{ fontWeight: "bold" }}>Цаашид:</div>
                    <div>
                      <div style={{ fontWeight: "bold" }}>
                        Амьдралын хэв маяг
                      </div>
                      <div style={{ paddingLeft: "4px", fontSize: "16px" }}>
                        {/* <div>
                        {Data.LifeAdviceSelectObj.map((e, key) => (
                          <div key={key}>{e.Label}</div>
                        ))}
                      </div>
                      <div
                        style={{ display: "inline-block", width: "100%" }}
                        dangerouslySetInnerHTML={{
                          __html: Data.LifeAdviceOther,
                        }}
                      /> */}
                        <ul style={{ marginLeft: "4px", marginBottom: "0" }}>
                          {Data.LifeAdviceSelectObj.filter(
                            (e) => e.Label !== "No135 тоотод үзүүлэх",
                          ).map((e, key) => (
                            <li key={key}>{e.Label}</li>
                          ))}
                        </ul>
                        {Data.LifeAdviceOther &&
                          Data.LifeAdviceOther.split(
                            /<\/p>|<br\s*\/?>|<\/div>|\n/gi,
                          )
                            .map((part) => {
                              return part
                                .replace(/<(p|div)[^>]*>/gi, "")
                                .replace(/&nbsp;/g, " ")
                                .trim();
                            })
                            .filter(
                              (content) =>
                                content.replace(/<[^>]+>/g, "").trim().length >
                                0,
                            )
                            .map((content, i) => (
                              <div
                                key={`adv-other-${i}`}
                                style={{ marginLeft: "24px" }}
                                dangerouslySetInnerHTML={createMarkup(content)}
                              />
                            ))}
                      </div>
                    </div>
                    <Box sx={styles.avoidBreak}>
                      <div style={{ fontWeight: "bold" }}>Хяналт</div>
                      <div style={{ paddingLeft: "0", fontSize: "16px" }}>
                        <ul style={{ marginLeft: "4px", marginBottom: "0" }}>
                          {Data.MonitoringSelectObj.map((e, key) => (
                            <li key={key}>{e.Label}</li>
                          ))}
                        </ul>
                        {Data.MonitoringOther &&
                          Data.MonitoringOther.split(
                            /<\/p>|<br\s*\/?>|<\/div>|\n/gi,
                          )
                            .map((part) => {
                              return part
                                .replace(/<(p|div)[^>]*>/gi, "")
                                .replace(/&nbsp;/g, " ")
                                .trim();
                            })
                            .filter(
                              (content) =>
                                content.replace(/<[^>]+>/g, "").trim().length >
                                0,
                            )
                            .map((content, i) => (
                              <div
                                key={`mon-other-${i}`}
                                style={{ marginLeft: "24px" }}
                                dangerouslySetInnerHTML={createMarkup(content)}
                              />
                            ))}
                        {/* <div>
                        {Data.MonitoringSelectObj.map((e, key) => (
                          <div key={key}>{e.Label}</div>
                        ))}
                      </div> */}
                        {/* <div
                        style={{ display: "inline-block", width: "100%" }}
                        dangerouslySetInnerHTML={createMarkup(Data.Monitoring)}
                      /> */}
                        {/* <div
                        style={{ display: "inline-block", width: "100%" }}
                        dangerouslySetInnerHTML={createMarkup(Data.MonitoringOther)}
                      /> */}
                      </div>
                    </Box>
                    <div>
                      <div style={{ fontWeight: "bold" }}>Эмэн эмчилгээ</div>
                      <div style={{ paddingLeft: "8px" }}>
                        {/* <div>
                        {Array.isArray(Data.UuhEmSelectObj) &&Data.UuhEmSelectObj.map((e, key) => (
                          <div key={key}>{e.Label}</div>
                        ))}
                      </div> */}
                        <div
                          dangerouslySetInnerHTML={createMarkup(Data.UuhEm)}
                        />
                        {isInPatient && hasUuhEm && (
                          <>
                            <div
                              style={{ margin: "10px 0", fontWeight: "bold" }}
                            >
                              ДЭЭРХ ЭМҮҮДИЙГ ЭМНЭЛГЭЭС ГАРСАН ӨДРӨӨС УУЖ ЭХЭЛНЭ
                              ҮҮ!
                            </div>
                            <div>
                              Цус шингэлэх эмүүдийг зогсоовол стент бөглөрч
                              Зүрхний шигдээсээр хүндэрдэг тул эмчийн
                              зааваргүйгээр эм зогсоохгүйг анхаарна уу.
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {this.renderLoginSlip()}
                  <div style={{ textAlign: "right" }}>
                    <div>
                      Эмчийн нэр:{" "}
                      {
                        "......................................................."
                      }{" "}
                      {this.LogedUser.Doctor.FullName}
                    </div>
                  </div>
                  <div style={{ marginTop: "10px", textAlign: "right" }}>
                    <div>
                      Мэдээллийг бүрэн уншиж танилцсан, зөвшөөрсөн иргэн:
                      {
                        " ......................................................."
                      }
                    </div>
                  </div>
                </Box>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
}

export default withTranslation(undefined, { withRef: true })(
  OutPatientInfoReport,
);
