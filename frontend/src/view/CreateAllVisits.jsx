import { withTranslation } from "react-i18next";
import React, { Component, createRef } from "react";
// translation
// @mui/material components
import CircularProgress from "@mui/material/CircularProgress";
// @mui/icons-material
import ImportExportIcon from "@mui/icons-material/ImportExport";
import PrintIcon from "@mui/icons-material/Print";
// default components
import UniCard from "customComponents/UniCard";
import Button from "components/CustomButtons/Button";
// custom componets
import BaseListManual from "baseComponents/BaseListManual";
import BaseDialog from "customComponents/BaseDialog";
// import PatientForm from "customComponents/Forms/PatientForm";
import CustomTab from "customComponents/CustomTab";
import Visit from "customComponents/DetailViews/Visit";
import Echo from "customComponents/DetailViews/Echo";
import Ecg from "customComponents/DetailViews/Ecg";
import Tcd2 from "customComponents/DetailViews/Tcd2";
import BloodStroke from "customComponents/DetailViews/BloodStroke";
import SurgeryReport from "customComponents/DetailViews/SurgeryReport";

import MonitoringRhythm from "customComponents/DetailViews/NationalRegistry/Rhythm/MonitoringRhythm";
import IsActive from "customComponents/NationalRegistry/Components/IsActive";
import ShowPatient from "customComponents/FieldActions/ShowPatient";
import RangeDate from "customComponents/RangeDate";
// helper
import Helper from "helper";
import Visit2 from "./Visit2";
import TCD from "./TCD";

const LogedUser = Helper.AuthHelper.GetLogedUserLocal();

class CreateAllVisits extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Dialog: null,
      Alert: null,
      exportLoading: false,
      printLoading: false,
      visitSearchOption: this.GetSearchOption(),
      echoSearchOption: this.GetSearchOption(),
      ecgSearchOption: this.GetSearchOption(),
      bloodStrokeSearchOption: this.GetSearchOption(),
      surgeryReportSearchOption: this.GetSearchOption(),
      tcdSearchOption: this.GetSearchOption(),
      monitoringRhythmSearchOption: (() => {
        const opt = this.GetSearchOption();
        opt.OrderBy = { Field: "Id", Type: "desc" };
        return opt;
      })(),
    };

    // refs
    this.Form = createRef();
    this.Visits = createRef();
    this.Echos = createRef();
    this.Ecgs = createRef();
    this.tcds = createRef();
    this.BloodStrokes = createRef();
    this.CardiacSurgeryReports = createRef();
    this.MonitoringRhythms = createRef();
  }

  handleSearchOptionChange = (key, newOption) => {
    this.setState({ [key]: newOption });
  };

  ShowAlert = (Message, Success) => {
    const Alert = Helper.BaseCrudHelper.ShowAlert(Message, Success, () =>
      this.setState({ Alert: null }),
    );
    this.setState({ Alert });
  };

  HandleExportResult = (resData) => {
    const t = this.props.t;
    this.setState({ exportLoading: false });
    const Success = !!(resData && resData.Success);
    this.ShowAlert(
      Success
        ? t("Excel file downloaded")
        : (resData && resData.Message) || t("Excel export failed"),
      Success,
    );
  };

  /**
   * Print the АМ-1Б examination register for the date range on screen.
   *
   * The range lives inside `visitSearchOption` as a Between filter on
   * visit_date, put there by the RangeDate above; the endpoint wants the two
   * dates as StartDate / EndDate, so it is read back out rather than tracked
   * twice and allowed to drift.
   */
  PrintAmbulatori = async () => {
    const t = this.props.t;
    const { visitSearchOption } = this.state;

    const range = (visitSearchOption.SearchField || []).find(
      (f) => f && f.Field === "visit_date" && Array.isArray(f.Value),
    );
    if (!range) {
      this.ShowAlert(t("Эхлээд хугацааны интервалаа сонгоно уу"), false);
      return;
    }

    this.setState({ printLoading: true });
    await Helper.BaseCrudHelper.BasePrintReport(
      {
        Url: "/Visit/PrintAmbulatori",
        Data: {
          StartDate: range.Value[0],
          EndDate: range.Value[1],
          BeginDate: range.Value[0],
          // Every other filter the user has narrowed the list with - the
          // per-column search boxes on organisation, doctor, patient and so on.
          // Without these the PDF silently disagreed with the grid it prints
          // from. The server applies them inside the caller's organisation
          // scope, so this cannot widen what they are allowed to see.
          SearchField: (visitSearchOption.SearchField || []).filter(
            (f) => f && f.Field !== "visit_date",
          ),
        },
        FileName: "AM-1B_" + range.Value[0] + "_" + range.Value[1] + ".pdf",
      },
      (resData) => {
        this.setState({ printLoading: false });
        const Success = !!(resData && resData.Success);
        this.ShowAlert(
          Success ? t("Файл татагдлаа") : t("Хэвлэхэд алдаа гарлаа"),
          Success,
        );
      },
    );
  };

  ShowData = (ObjectName, data) => {
    if (ObjectName === "EcgExamination") {
      this.setState({
        Dialog: (
          <BaseDialog
            Close={() => this.setState({ Dialog: null })}
            Title="Ecg"
            Width="600px"
            Height="300px"
          >
            <Ecg DataId={data.id_data} ObjectName="EcgExamination" />
          </BaseDialog>
        ),
      });
    }

    if (ObjectName === "Visit") {
      this.setState({
        Dialog: (
          <BaseDialog
            Close={() => this.setState({ Dialog: null })}
            Title="Visit"
          >
            <Visit DataId={data.id_data} ObjectName="Visit" />
          </BaseDialog>
        ),
      });
    }

    if (ObjectName === "ExaminationEcho") {
      this.setState({
        Dialog: (
          <BaseDialog
            Close={() => this.setState({ Dialog: null })}
            Title="Echo"
            Scroll="body"
            Width="1100px"
          >
            <Echo DataId={data.id_data} ObjectName="ExaminationEcho" />
          </BaseDialog>
        ),
      });
    }

    if (ObjectName === "BloodStroke") {
      this.setState({
        Dialog: (
          <BaseDialog
            Close={() => this.setState({ Dialog: null })}
            Title="Blood stroke"
            Width="600px"
            Height="300px"
          >
            <BloodStroke DataId={data.id_data} ObjectName="BloodStroke" />
          </BaseDialog>
        ),
      });
    }

    if (ObjectName === "CardiacSurgeryReport") {
      this.setState({
        Dialog: (
          <BaseDialog
            Close={() => this.setState({ Dialog: null })}
            Title="Open heart surgery"
          >
            <SurgeryReport DataId={data.id_data} />
          </BaseDialog>
        ),
      });
    }
    if (ObjectName === "MonitoringRhythm") {
      this.setState({
        Dialog: (
          <BaseDialog
            Close={() => this.setState({ Dialog: null })}
            Title="Monitoring Rhythm"
          >
            <MonitoringRhythm DataId={data.Id} ObjectName="MonitoringRhythm" />
          </BaseDialog>
        ),
      });
    }
    if (ObjectName === "PCathlab") {
      this.setState({
        Dialog: (
          <BaseDialog
            Close={() => this.setState({ Dialog: null })}
            Title="Tcd2"
          >
            <Tcd2 DataId={data.id_data} ObjectName="PCathlab" />
          </BaseDialog>
        ),
      });
    }
  };

  GetSearchOption = () => {
    const IsAdmin = this.props.IsAdmin || LogedUser?.RoleId + "" === "1";
    var SearchOption = null;
    if (!IsAdmin) {
      SearchOption = Helper.BaseCrudHelper.GetSearchOption();
      SearchOption.SearchField = [
        { Field: "user_id", Value: LogedUser.Id, Op: "Equals" },
      ];
      SearchOption.OrderBy = { Field: "id_data", Type: "desc" };
    } else {
      SearchOption = Helper.BaseCrudHelper.GetSearchOption();
      SearchOption.OrderBy = { Field: "id_data", Type: "desc" };
    }
    return SearchOption;
  };

  GetTabs = () => {
    var Tabs = [];

    const {
      exportLoading,
      printLoading,
      visitSearchOption,
      echoSearchOption,
      ecgSearchOption,
      bloodStrokeSearchOption,
      surgeryReportSearchOption,
      tcdSearchOption,
      monitoringRhythmSearchOption,
    } = this.state;
    const { t, IsAdmin } = this.props;

    /*  Tabs.push({
      tabButton: "Үзлэг",
      tabContent: <Visit2 />,
    });
*/

    Tabs.push({
      tabButton: "Visit",
      tabContent: (
        <div
          style={{
            padding: "0px",
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <RangeDate
              ChangeValue={(StartDate, EndDate) => {
                const newOption = { ...visitSearchOption };
                newOption.SearchField = Helper.BaseCrudHelper.SetSearchField(
                  "visit_date",
                  [StartDate, EndDate],
                  newOption.SearchField,
                  "Between",
                );
                this.handleSearchOptionChange("visitSearchOption", newOption);
              }}
            />
            {!this.props.HideExports && (
              <div style={{ position: "relative" }}>
                <Button
                  color="success"
                  size="sm"
                  onClick={async () => {
                    this.setState({ exportLoading: true });
                    await Helper.BaseCrudHelper.ExportExcel(
                      {
                        ObjectName: "Visit",
                        Url: "/BaseObject/ExportExcel",
                        SearchOption: visitSearchOption,
                        FileName: !IsAdmin
                          ? "CreatedVisit.xlsx"
                          : "AllVisit.xlsx",
                      },
                      this.HandleExportResult,
                    );
                  }}
                  disabled={exportLoading}
                >
                  <ImportExportIcon style={{ marginRight: "4px" }} />
                  {t("Export")}
                </Button>
                {exportLoading && (
                  <CircularProgress
                    size={24}
                    style={{
                      color: "#00b530",
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      marginTop: -12,
                      marginLeft: -12,
                    }}
                  />
                )}

                {/* Upgrade tender item 4.1 — АМ-1Б «Эмчийн үзлэгийн бүртгэл».
                    The register itself is reports/Ambulatori.js, which has
                    always matched the tender's appendix but could never run:
                    /Visit/PrintAmbulatori threw ReferenceError on an undeclared
                    reportDir, and nothing in the frontend called it. This is the
                    entry point it never had. It prints whatever date range the
                    RangeDate beside it is showing. */}
                <Button
                  color="info"
                  size="sm"
                  style={{ marginLeft: "6px" }}
                  disabled={printLoading}
                  onClick={() => this.PrintAmbulatori()}
                >
                  <PrintIcon style={{ marginRight: "4px" }} />
                  {t("АМ-1Б бүртгэл хэвлэх")}
                </Button>
              </div>
            )}
          </div>
          <BaseListManual
            ref={(ref) => (this.Visits = ref)}
            GridColumnActions={[
              {
                Field: "Patient.p_registration",
                Component: <ShowPatient />,
              },
            ]}
            GridHideCheck={true}
            Fields={[
              { Label: t("Visit date"), Name: "visit_date", Type: "Date" },
              { Label: t("Personal No"), Name: "Patient.p_registration" },
              { Label: t("Last Name"), Name: "Patient.p_lastname" },
              { Label: t("First Name"), Name: "Patient.p_firstname" },
              { Label: t("Organization"), Name: "Organization.Name" },
              { Label: t("Doctor"), Name: "DoctorsProfile.firstname" },
              { Label: t("Create date"), Name: "date_creation", Type: "Date" },
              { Label: t("Age"), Name: "Patient.Age" },
              { Label: t("Modif date"), Name: "date_modif", Type: "Date" },
              { Label: t("Main diagnosis"), Name: "main_diagnosis" },
              { Label: t("ICD10"), Name: "icd10" },
            ]}
            SearchOption={visitSearchOption}
            onSearchOptionChange={(opt) =>
              this.handleSearchOptionChange("visitSearchOption", opt)
            }
            ObjectName="Visit"
            ShowData={(EditObject) => this.ShowData("Visit", EditObject)}
            widthPattern="40r,100c, 120,150, 150, 200, 100, 100c, 40r, 100c, 200, 200"
          />
        </div>
      ),
    });

    Tabs.push({
      tabButton: "ECHO",
      tabContent: (
        <div
          style={{
            padding: "0px",
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "10px",
            }}
          >
            <RangeDate
              ChangeValue={(StartDate, EndDate) => {
                const newOption = { ...echoSearchOption };
                newOption.SearchField = Helper.BaseCrudHelper.SetSearchField(
                  "date_creation",
                  [StartDate, EndDate],
                  newOption.SearchField,
                  "Between",
                );
                this.handleSearchOptionChange("echoSearchOption", newOption);
              }}
            />
            {!this.props.HideExports && (
              <div style={{ position: "relative" }}>
                <Button
                  color="success"
                  size="sm"
                  onClick={async () => {
                    this.setState({ exportLoading: true });
                    await Helper.BaseCrudHelper.ExportExcel(
                      {
                        ObjectName: "ExaminationEcho",
                        Url: "/BaseObject/ExportExcel",
                        SearchOption: echoSearchOption,
                        FileName: !IsAdmin
                          ? "CreatedEcho.xlsx"
                          : "AllEcho.xlsx",
                      },
                      this.HandleExportResult,
                    );
                  }}
                  disabled={exportLoading}
                >
                  <ImportExportIcon style={{ marginRight: "4px" }} />
                  {t("Export")}
                </Button>
                {exportLoading && (
                  <CircularProgress
                    size={24}
                    style={{
                      color: "#00b530",
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      marginTop: -12,
                      marginLeft: -12,
                    }}
                  />
                )}
              </div>
            )}
          </div>
          <BaseListManual
            ref={(ref) => (this.Echos = ref)}
            GridColumnActions={[
              { Field: "Patient.p_registration", Component: <ShowPatient /> },
            ]}
            GridHideCheck={true}
            SearchOption={echoSearchOption}
            onSearchOptionChange={(opt) =>
              this.handleSearchOptionChange("echoSearchOption", opt)
            }
            ObjectName="ExaminationEcho"
            ShowData={(EditObject) =>
              this.ShowData("ExaminationEcho", EditObject)
            }
            Fields={[
              {
                Label: t("Шинжилгээ хийсэн огноо"),
                Name: "echo_date",
                Type: "Date",
              },
              { Label: t("Personal No"), Name: "Patient.p_registration" },
              { Label: t("Last Name"), Name: "Patient.p_lastname" },
              { Label: t("First Name"), Name: "Patient.p_firstname" },
              { Label: t("Organization"), Name: "Organization.Name" },
              { Label: t("Doctor"), Name: "DoctorsProfile.firstname" },
              { Label: t("Create date"), Name: "date_creation", Type: "Date" },
              { Label: t("Age"), Name: "Patient.Age" },
              { Label: t("Modif date"), Name: "date_modif", Type: "Date" },
            ]}
            widthPattern="40r, 100c,100c, 150, 150, 220, 150, 100c, 40r, 100c"
          />
        </div>
      ),
    });

    Tabs.push({
      tabButton: "ECG",
      tabContent: (
        <div
          style={{
            padding: "0px",
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "10px",
            }}
          >
            <RangeDate
              ChangeValue={(StartDate, EndDate) => {
                const newOption = { ...ecgSearchOption };
                newOption.SearchField = Helper.BaseCrudHelper.SetSearchField(
                  "date_creation",
                  [StartDate, EndDate],
                  newOption.SearchField,
                  "Between",
                );
                this.handleSearchOptionChange("ecgSearchOption", newOption);
              }}
            />
            {!this.props.HideExports && (
              <div style={{ position: "relative" }}>
                <Button
                  color="success"
                  size="sm"
                  onClick={async () => {
                    this.setState({ exportLoading: true });
                    await Helper.BaseCrudHelper.ExportExcel(
                      {
                        ObjectName: "EcgExamination",
                        Url: "/BaseObject/ExportExcel",
                        SearchOption: ecgSearchOption,
                        FileName: !IsAdmin ? "CreatedECG.xlsx" : "AllECG.xlsx",
                      },
                      this.HandleExportResult,
                    );
                  }}
                  disabled={exportLoading}
                >
                  <ImportExportIcon style={{ marginRight: "4px" }} />
                  {t("Export")}
                </Button>
                {exportLoading && (
                  <CircularProgress
                    size={24}
                    style={{
                      color: "#00b530",
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      marginTop: -12,
                      marginLeft: -12,
                    }}
                  />
                )}
              </div>
            )}
          </div>
          <BaseListManual
            ref={(ref) => (this.Ecgs = ref)}
            GridColumnActions={[
              { Field: "Patient.p_registration", Component: <ShowPatient /> },
            ]}
            GridHideCheck={true}
            SearchOption={ecgSearchOption}
            onSearchOptionChange={(opt) =>
              this.handleSearchOptionChange("ecgSearchOption", opt)
            }
            ObjectName="EcgExamination"
            ShowData={(EditObject) =>
              this.ShowData("EcgExamination", EditObject)
            }
            Fields={[
              { Label: t("Personal No"), Name: "Patient.p_registration" },
              { Label: t("Last Name"), Name: "Patient.p_lastname" },
              { Label: t("First Name"), Name: "Patient.p_firstname" },
              { Label: t("Organization"), Name: "Organization.Name" },
              { Label: t("Doctor"), Name: "DoctorsProfile.firstname" },
              { Label: t("Create date"), Name: "date_creation", Type: "Date" },
              { Label: t("Age"), Name: "Patient.Age" },
              { Label: t("Modif date"), Name: "date_modif", Type: "Date" },
            ]}
            widthPattern="40r, 100, 150, 150, 200, 150,100c, 40r, 100c"
          />
        </div>
      ),
    });

    Tabs.push({
      tabButton: "INR",
      tabContent: (
        <div
          style={{
            padding: "0px",
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "10px",
            }}
          >
            <RangeDate
              ChangeValue={(StartDate, EndDate) => {
                const newOption = { ...bloodStrokeSearchOption };
                newOption.SearchField = Helper.BaseCrudHelper.SetSearchField(
                  "date_creation",
                  [StartDate, EndDate],
                  newOption.SearchField,
                  "Between",
                );
                this.handleSearchOptionChange(
                  "bloodStrokeSearchOption",
                  newOption,
                );
              }}
            />
            {!this.props.HideExports && (
              <div style={{ position: "relative" }}>
                <Button
                  color="success"
                  size="sm"
                  onClick={async () => {
                    this.setState({ exportLoading: true });
                    await Helper.BaseCrudHelper.ExportExcel(
                      {
                        ObjectName: "BloodStroke",
                        Url: "/BaseObject/ExportExcel",
                        SearchOption: bloodStrokeSearchOption,
                        FileName: !IsAdmin ? "CreatedINR.xlsx" : "AllINR.xlsx",
                      },
                      this.HandleExportResult,
                    );
                  }}
                  disabled={exportLoading}
                >
                  <ImportExportIcon style={{ marginRight: "4px" }} />
                  {t("Export")}
                </Button>
                {exportLoading && (
                  <CircularProgress
                    size={24}
                    style={{
                      color: "#00b530",
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      marginTop: -12,
                      marginLeft: -12,
                    }}
                  />
                )}
              </div>
            )}
          </div>
          <BaseListManual
            ref={(ref) => (this.BloodStrokes = ref)}
            GridColumnActions={[
              { Field: "Patient.p_registration", Component: <ShowPatient /> },
            ]}
            GridHideCheck={true}
            SearchOption={bloodStrokeSearchOption}
            onSearchOptionChange={(opt) =>
              this.handleSearchOptionChange("bloodStrokeSearchOption", opt)
            }
            ObjectName="BloodStroke"
            ShowData={(EditObject) => this.ShowData("BloodStroke", EditObject)}
            Fields={[
              { Label: t("Personal No"), Name: "Patient.p_registration" },
              { Label: t("Last Name"), Name: "Patient.p_lastname" },
              { Label: t("First Name"), Name: "Patient.p_firstname" },
              { Label: t("Organization"), Name: "Organization.Name" },
              { Label: t("Doctor"), Name: "DoctorsProfile.firstname" },
              { Label: t("Create date"), Name: "date_creation", Type: "Date" },
              { Label: t("Age"), Name: "Patient.Age" },
              { Label: t("Modif date"), Name: "date_modif", Type: "Date" },
            ]}
            widthPattern="40r, 100, 220, 150, 150, 120, 100c, 40r, 100c, 120, 80r,100c,100c"
          />
        </div>
      ),
    });

    Tabs.push({
      tabButton: "Open heart surgery",
      tabContent: (
        <div
          style={{
            padding: "0px",
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "10px",
            }}
          >
            <RangeDate
              ChangeValue={(StartDate, EndDate) => {
                const newOption = { ...surgeryReportSearchOption };
                newOption.SearchField = Helper.BaseCrudHelper.SetSearchField(
                  "date_creation",
                  [StartDate, EndDate],
                  newOption.SearchField,
                  "Between",
                );
                this.handleSearchOptionChange(
                  "surgeryReportSearchOption",
                  newOption,
                );
              }}
            />
            {!this.props.HideExports && (
              <div style={{ position: "relative" }}>
                <Button
                  color="success"
                  size="sm"
                  onClick={async () => {
                    this.setState({ exportLoading: true });
                    await Helper.BaseCrudHelper.ExportExcel(
                      {
                        ObjectName: "CardiacSurgeryReport",
                        Url: "/BaseObject/ExportExcel",
                        SearchOption: surgeryReportSearchOption,
                        FileName: !IsAdmin
                          ? "CreatedSurgeryReport.xlsx"
                          : "AllSurgeryReport.xlsx",
                      },
                      this.HandleExportResult,
                    );
                  }}
                  disabled={exportLoading}
                >
                  <ImportExportIcon style={{ marginRight: "4px" }} />
                  {t("Export")}
                </Button>
                {exportLoading && (
                  <CircularProgress
                    size={24}
                    style={{
                      color: "#00b530",
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      marginTop: -12,
                      marginLeft: -12,
                    }}
                  />
                )}
              </div>
            )}
          </div>
          <BaseListManual
            ref={(ref) => (this.CardiacSurgeryReports = ref)}
            GridColumnActions={[
              { Field: "Patient.p_registration", Component: <ShowPatient /> },
            ]}
            GridHideCheck={true}
            SearchOption={surgeryReportSearchOption}
            onSearchOptionChange={(opt) =>
              this.handleSearchOptionChange("surgeryReportSearchOption", opt)
            }
            ObjectName="CardiacSurgeryReport"
            ShowData={(EditObject) =>
              this.ShowData("CardiacSurgeryReport", EditObject)
            }
            Fields={[
              { Label: t("Personal No"), Name: "Patient.p_registration" },
              { Label: t("Last Name"), Name: "Patient.p_lastname" },
              { Label: t("First Name"), Name: "Patient.p_firstname" },
              { Label: t("Organization"), Name: "Organization.Name" },
              { Label: t("Doctor"), Name: "DoctorsProfile.firstname" },
              { Label: t("Create date"), Name: "date_creation", Type: "Date" },
              { Label: t("Age"), Name: "Patient.Age" },
              { Label: t("Modif date"), Name: "date_modif", Type: "Date" },
            ]}
            widthPattern="40r, 100, 150, 150, 220, 100, 100c, 40r, 100c"
          />
        </div>
      ),
    });
    /*
    Tabs.push({
      tabButton: "ТиСДО/Э",
      tabContent: <TCD />,
    });
    */
    Tabs.push({
      tabButton: "ТиСДО/Э",
      tabContent: (
        <div
          style={{
            padding: "0px",
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "10px",
            }}
          >
            <RangeDate
              ChangeValue={(StartDate, EndDate) => {
                const newOption = { ...tcdSearchOption };
                newOption.SearchField = Helper.BaseCrudHelper.SetSearchField(
                  "date_creation",
                  [StartDate, EndDate],
                  newOption.SearchField,
                  "Between",
                );
                this.handleSearchOptionChange("tcdSearchOption", newOption);
              }}
            />
            {!this.props.HideExports && (
              <div style={{ position: "relative" }}>
                <Button
                  color="success"
                  size="sm"
                  onClick={async () => {
                    this.setState({ exportLoading: true });
                    await Helper.BaseCrudHelper.ExportExcel(
                      {
                        ObjectName: "PCathlab",
                        Url: "/BaseObject/ExportExcel",
                        SearchOption: tcdSearchOption,
                        FileName: !IsAdmin ? "CreatedTCD.xlsx" : "AllTCD.xlsx",
                      },
                      this.HandleExportResult,
                    );
                  }}
                  disabled={exportLoading}
                >
                  <ImportExportIcon style={{ marginRight: "4px" }} />
                  {t("Export")}
                </Button>
                {exportLoading && (
                  <CircularProgress
                    size={24}
                    style={{
                      color: "#00b530",
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      marginTop: -12,
                      marginLeft: -12,
                    }}
                  />
                )}
              </div>
            )}
          </div>
          <BaseListManual
            ref={(ref) => (this.tcds = ref)}
            GridColumnActions={[
              { Field: "Patient.p_registration", Component: <ShowPatient /> },
            ]}
            GridHideCheck={true}
            Fields={[
              { Label: t("Personal No"), Name: "Patient.p_registration" },
              {
                Name: "Conclusion",
                Label: t("Conclusion"),
                visable: false,
              }, // Харагдана
              {
                Name: "date_creation",
                Label: t("Date"),
                visable: false,
              }, // Харагдана
            ]}
            SearchOption={tcdSearchOption}
            onSearchOptionChange={(opt) =>
              this.handleSearchOptionChange("tcdSearchOption", opt)
            }
            ObjectName="PCathlab"
            ShowData={(EditObject) => this.ShowData("PCathlab", EditObject)}
            widthPattern="40r,100c, 400, 100c"
          />
        </div>
      ),
    });

    Tabs.push({
      tabButton: "Monitoring Rhythm",
      tabContent: (
        <div
          style={{
            padding: "0px",
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "10px",
            }}
          >
            <RangeDate
              ChangeValue={(StartDate, EndDate) => {
                const newOption = { ...monitoringRhythmSearchOption };
                newOption.SearchField = Helper.BaseCrudHelper.SetSearchField(
                  "CreatedDate",
                  [StartDate, EndDate],
                  newOption.SearchField,
                  "Between",
                );
                this.handleSearchOptionChange(
                  "monitoringRhythmSearchOption",
                  newOption,
                );
              }}
            />
            {!this.props.HideExports && (
              <div style={{ position: "relative" }}>
                <Button
                  color="success"
                  size="sm"
                  onClick={async () => {
                    this.setState({ exportLoading: true });
                    await Helper.BaseCrudHelper.ExportExcel(
                      {
                        ObjectName: "MonitoringRhythm",
                        Url: "/BaseObject/ExportExcel",
                        SearchOption: monitoringRhythmSearchOption,
                        FileName: !IsAdmin
                          ? "CreatedMonitoringRhythm.xlsx"
                          : "AllMonitoringRhythm.xlsx",
                      },
                      this.HandleExportResult,
                    );
                  }}
                  disabled={exportLoading}
                >
                  <ImportExportIcon style={{ marginRight: "4px" }} />
                  {t("Export")}
                </Button>
                {exportLoading && (
                  <CircularProgress
                    size={24}
                    style={{
                      color: "#00b530",
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      marginTop: -12,
                      marginLeft: -12,
                    }}
                  />
                )}
              </div>
            )}
          </div>
          <BaseListManual
            ref={(ref) => (this.MonitoringRhythms = ref)}
            GridColumnActions={[
              { Field: "PatRegNo", Component: <ShowPatient /> },
              { Field: "is_confirm", Component: <IsActive /> },
            ]}
            GridHideCheck={true}
            Fields={[
              { Label: t("Doctor"), Name: "DoctorsProfile.FullName" },
              { Label: t("Personal No"), Name: "PatRegNo" },
              { Label: t("Confirmation"), Name: "is_confirm" },
              { Label: t("Visit date"), Name: "visit_date", Type: "Date" },
              { Label: t("Create date"), Name: "date_creation", Type: "Date" },
            ]}
            SearchOption={monitoringRhythmSearchOption}
            onSearchOptionChange={(opt) =>
              this.handleSearchOptionChange("monitoringRhythmSearchOption", opt)
            }
            ObjectName="MonitoringRhythm"
            ShowData={(EditObject) =>
              this.ShowData("MonitoringRhythm", EditObject)
            }
            widthPattern="40r, 200, 100, 100c, 100c, 100c"
          />
        </div>
      ),
    });

    return Tabs;
  };

  render() {
    const { Dialog, Alert } = this.state;
    const { t } = this.props;
    const IsAdmin = this.props.IsAdmin || false;
    return (
      <>
        {Dialog}
        {Alert}
        <UniCard title={IsAdmin ? t("All visits") : t("My visits")}>
          <CustomTab tabs={this.GetTabs()} fillHeight={true} wrapped={true} />
        </UniCard>
      </>
    );
  }
}

export default withTranslation(undefined, { withRef: true })(CreateAllVisits);
