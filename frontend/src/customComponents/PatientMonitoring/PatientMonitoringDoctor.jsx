import { withTranslation } from "react-i18next";
import React from "react";
// @mui/material components
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { Typography, Link } from "@mui/material";
// @mui/icons-material
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
// custom components
import ListPageHeader from "customComponents/ListPageHeader";
import RangeDate from "customComponents/RangeDate";
import BaseGrid from "baseComponents/BaseGrid/BaseGrid";
import DivLoading from "customComponents/DivLoading";
import QuestionButton from "customComponents/PatientMonitoring/QuestionButton";
import navClick from "customComponents/PageTabs/navClick";
import BaseDialog from "customComponents/BaseDialog";
import MonitorQuestion from "customComponents/PatientMonitoring/MonitorQuestion";
import PatientMonitoring from "customComponents/PatientMonitoring/PatientMonitoring";
import ShowPatient from "customComponents/FieldActions/ShowPatient";
import BtnPatientMonitor from "customComponents/PatientMonitoring/Actions/BtnPatientMonitor";
import BtnRemovePatient from "customComponents/PatientMonitoring/Actions/BtnRemovePatient";
import BtnRemoteVisit from "customComponents/PatientMonitoring/Actions/BtnRemoteVisit";
import ShowJournals from "customComponents/PatientMonitoring/ShowJournals";
import RemoteVisitList from "customComponents/PatientPlatform/RemoteVisitList";

// helper
import Helper from "helper";
import { colors } from "@/theme/colors";
import { space, radius, elevation } from "@/theme/tokens";
import { gridToolbarButtonSx } from "@/theme/controlStyles";

class PatientMonitoringDoctor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      Config: props.Config || null,
      Data: [],
      GridOption: null,
      isLoading: false,
      Alert: null,
      DetailView: null,
      CommentDialog: null,
      PatientHistoryDialog: null,
      RemoteVisitDialog: null,
      exportLoading: false,
      // Separates "nobody is under your monitoring" from "your filters
      // excluded everyone" - an empty grid looks identical otherwise.
      IsFiltered: false,
    };

    this.LogedUser = Helper.AuthHelper.GetLogedUserLocal();
    this.SearchOption = Helper.BaseCrudHelper.GetSearchOption();
    this.SearchOption.SearchField = [
      { Field: "user_id", Value: this.LogedUser?.Id || "", Op: "Equals" },
      { Field: "is_active", Value: "1", Op: "Equals" },
    ];
  }

  componentDidMount() {
    this.GetConfigData && this.GetConfigData();
  }

  GetConfigData = async () => {
    const ObjectName = this.props.ObjectName || "PatientMonitoringDoctor";
    const { Config } = this.state;

    // Check if user is authenticated
    if (!this.LogedUser || !this.LogedUser.Id) {
      this.ShowAlert("User not authenticated", false);
      return;
    }

    if (Config) {
      this.GetData && this.GetData();
      return;
    }

    this.setState({ isLoading: true });
    await Helper.BaseCrudHelper.GetConfigData(ObjectName, (resData) => {
      if (resData && resData.Success && resData.Data) {
        this.setState({ Config: resData.Data }, () => {
          this.GetData && this.GetData();
        });
      } else {
        // If config data fails to load, still try to get data
        this.GetData && this.GetData();
      }
    });
  };

  ShowAlert = (message, success) => {
    const alert = Helper.BaseCrudHelper.ShowAlert(message, success, () =>
      this.setState({ Alert: null }),
    );
    this.setState({ Alert: alert });
  };

  ShowConfirm = (message, confirmFunc) => {
    const alert = Helper.BaseCrudHelper.ShowConfirm(message, confirmFunc, () =>
      this.setState({ Alert: null }),
    );
    this.setState({ Alert: alert });
  };

  OrderBy = (Field, Type) => {
    if (!this.SearchOption) return;
    this.SearchOption.OrderBy = { Field, Type };
    this.GetData && this.GetData();
  };

  SearchField = (Field, SearchText) => {
    if (!this.SearchOption) return;
    this.SearchOption.PageOption = {
      ...(this.SearchOption.PageOption || {}),
      Page: 0,
    };
    this.SearchOption.SearchField = Helper.BaseCrudHelper.SetSearchField(
      Field,
      SearchText,
      this.SearchOption.SearchField || [],
    );
    this.setState({ IsFiltered: true }, () => this.GetData());
  };

  PageLimitChange = (Page, Limit) => {
    if (!this.SearchOption) return;
    this.SearchOption.PageOption = {
      ...(this.SearchOption.PageOption || {}),
      Page,
      Limit,
    };
    this.GetData && this.GetData();
  };

  GetData = async () => {
    // Check if user is authenticated
    if (!this.LogedUser || !this.LogedUser.Id) {
      this.ShowAlert("User not authenticated", false);
      this.setState({ isLoading: false, Data: [], GridOption: null });
      return;
    }

    this.setState({ isLoading: true });
    await Helper.PatientMonitoringHelper.GetList(
      { SearchOption: this.SearchOption },
      (resData) => {
        if (resData) {
          if (resData.Success === false) this.ShowAlert(resData.Message, false);
          this.setState({
            Data: resData.Data || [],
            GridOption: Object.assign({}, resData.Option || {}),
          });
        }
        this.setState({ isLoading: false });
      },
    );
  };

  /**
   * Free-text search across the patient's name and register number.
   *
   * This used to write a `p_registration` Contains filter, so typing a name
   * returned nothing at all. SearchText goes through the model's SearchField
   * list instead, which now covers surname, first name and register.
   */
  SearchAll = (text) => {
    this.SearchOption.SearchText = text || undefined;
    this.SearchOption.PageOption = {
      ...(this.SearchOption.PageOption || {}),
      Page: 0,
    };
    this.setState({ IsFiltered: Boolean(text) }, () => this.GetData());
  };

  ClearFilters = () => {
    this.SearchOption.SearchText = undefined;
    this.SearchOption.PageOption = {
      ...(this.SearchOption.PageOption || {}),
      Page: 0,
    };
    // Keep only the two filters this list is defined by: my patients, active.
    this.SearchOption.SearchField = (
      this.SearchOption.SearchField || []
    ).filter((s) => s && (s.Field === "user_id" || s.Field === "is_active"));
    this.setState({ IsFiltered: false }, () => this.GetData());
  };

  HandleExportResult = (resData, Success) => {
    const { t } = this.props;
    this.setState({ exportLoading: false });
    this.ShowAlert(
      Success
        ? t("Excel file downloaded")
        : (resData && resData.Message) || t("Excel export failed"),
      Success,
    );
  };

  ExportExcel = async () => {
    const ObjectName = this.props.ObjectName || "PatientMonitoringDoctor";
    this.setState({ exportLoading: true });
    await Helper.BaseCrudHelper.ExportExcel(
      {
        ObjectName,
        Url: "/BaseObject/ExportExcel",
        SearchOption: this.SearchOption,
        FileName:
          ObjectName + "_" + new Date().toISOString().slice(0, 10) + ".xlsx",
      },
      this.HandleExportResult,
    );
  };

  /** The patient identity line shared by the question and remote-visit dialogs. */
  DialogHeader = (Patient) => {
    const { t } = this.props;
    if (!Patient) return null;

    return (
      <Box sx={{ display: "flex", gap: space[6], flexWrap: "wrap" }}>
        <Typography variant="body2">
          <b>{t("Patient name")}:</b> {Patient.FullName}
        </Typography>
        <Typography variant="body2">
          <b>{t("Personal number")}:</b>{" "}
          <Link
            href={`/admin/PatientInfo?RegisterNo=${Patient.p_registration}`}
            onClick={navClick(
              `/admin/PatientInfo?RegisterNo=${Patient.p_registration}`,
              // The dialog is modal: without closing it first its backdrop
              // would sit on top of the tab we just opened.
              () => this.setState({ CommentDialog: null }),
            )}
          >
            {Patient.p_registration}
          </Link>
        </Typography>
      </Box>
    );
  };

  ShowComments = (RowData) => {
    this.setState({
      CommentDialog: (
        <BaseDialog
          Close={() => this.setState({ CommentDialog: null })}
          Width="900px"
          HeaderContent={this.DialogHeader(RowData.Patient)}
        >
          <MonitorQuestion
            PatientId={RowData.patient_id}
            Patient={RowData.Patient}
            // The dialog is modal; close it so the chat dock is not under its backdrop.
            onChatOpened={() => this.setState({ CommentDialog: null })}
          />
        </BaseDialog>
      ),
    });
  };

  ShowPatientMonitoring = (RowData) => {
    const DialogData = (
      <BaseDialog
        Close={() => this.setState({ CommentDialog: null })}
        Width="900px"
        Height="600px"
        HeaderContent={this.DialogHeader(RowData.Patient)}
      >
        <PatientMonitoring
          ObjectName={"PatientMonitoring"}
          CustomRender={true}
          PatientId={RowData.patient_id}
          Patient={RowData.Patient}
        />
      </BaseDialog>
    );
    this.setState({ CommentDialog: DialogData });
  };

  ShowRemoteVisit = (RowData) => {
    const DialogData = (
      <BaseDialog
        Close={() => this.setState({ CommentDialog: null })}
        Height="500px"
        HeaderContent={this.DialogHeader(RowData.Patient)}
      >
        <RemoteVisitList
          ObjectName={"RemoteVisit"}
          CustomRender={true}
          PatientId={RowData.patient_id}
          Patient={RowData.Patient}
        />
      </BaseDialog>
    );
    this.setState({ CommentDialog: DialogData });
  };

  RemovePatient = async (RowData) => {
    const { t } = this.props;
    if (RowData) {
      this.ShowConfirm(
        t("Иргэнийг хяналтнаас гаргахдаа итгэлтэй байна уу?"),
        async () => {
          await Helper.PatientMonitoringHelper.RemovePatient(
            { PatientId: RowData.patient_id },
            (resData) => {
              if (resData) {
                this.ShowAlert(resData.Message, resData.Success);
                this.GetData();
              }
            },
          );
        },
      );
    }
  };

  /** Full-pane message for the states where there is no grid to show at all. */
  RenderNotice = (message) => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: space[3],
        padding: space[12],
        margin: space[3],
        textAlign: "center",
        backgroundColor: colors.brand.surface,
        border: `1px solid ${colors.brand.hairline}`,
        borderRadius: radius.lg,
        boxShadow: elevation[1],
      }}
    >
      <ReportProblemOutlinedIcon
        sx={{ fontSize: "28px", color: colors.brand.inkDim }}
      />
      <Typography variant="h4" component="div" sx={{ color: colors.brand.ink }}>
        {message}
      </Typography>
    </Box>
  );

  CustomRender = () => {
    const {
      DetailView,
      Alert,
      Data,
      GridOption,
      Config,
      CommentDialog,
      exportLoading,
      isLoading,
      IsFiltered,
    } = this.state;
    const { t } = this.props;

    if (!Config) {
      if (!this.LogedUser || !this.LogedUser.Id) {
        return this.RenderNotice(t("Нэвтэрсэн хэрэглэгч олдсонгүй"));
      }
      if (isLoading) {
        return (
          <Box sx={{ position: "relative", minHeight: "200px" }}>
            <DivLoading WithoutCard />
          </Box>
        );
      }
      return this.RenderNotice(t("Тохиргоо олдсонгүй"));
    }

    var FieldLists = Helper.BaseCrudHelper.GetFieldList(Config.Fields);
    // Override label for date_creation
    const dateField = FieldLists.find((f) => f.Name === "date_creation");
    if (dateField) {
      dateField.Label = t("Start date");
    }
    // Flex, so the diagnosis column absorbs the leftover width instead of
    // leaving a dead strip down the right of the grid.
    FieldLists.push({
      Name: "Journals",
      Label: t("ICD10"),
      NoFilter: true,
      NoSorting: true,
      Flex: 1,
    });

    return (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          flex: "1 1 auto",
          minHeight: 0,
          minWidth: 0,
          maxWidth: "100%",
          padding: space[3],
        }}
      >
        {Alert}
        {DetailView}
        {CommentDialog}

        <ListPageHeader
          Title={
            Config.TitleObject
              ? t(Config.TitleObject.Title + "")
              : t("Хувийн хяналт")
          }
          Overline={t("Миний хяналтад буй иргэд")}
          Count={GridOption ? GridOption.Total : undefined}
          Actions={
            <Button
              size="small"
              disableElevation
              onClick={this.ExportExcel}
              disabled={exportLoading}
              startIcon={
                exportLoading ? (
                  <CircularProgress size={14} thickness={5} color="inherit" />
                ) : (
                  <FileDownloadOutlinedIcon />
                )
              }
              sx={gridToolbarButtonSx.neutral}
            >
              {t("Excel")}
            </Button>
          }
        />

        <Box
          sx={{
            flex: "0 0 auto",
            padding: space[3],
            marginBottom: space[3],
            backgroundColor: colors.brand.surface,
            border: `1px solid ${colors.brand.hairline}`,
            borderRadius: radius.lg,
            boxShadow: elevation[1],
          }}
        >
          <RangeDate
            Width="100%"
            HideSearchText={false}
            Search={this.SearchAll}
            ChangeValue={(StartDate, EndDate) => {
              this.SearchOption.SearchField =
                Helper.BaseCrudHelper.SetSearchField(
                  "date_creation",
                  [StartDate, EndDate],
                  this.SearchOption.SearchField,
                  "Between",
                );
              this.setState({ IsFiltered: true }, () => this.GetData());
            }}
          />
        </Box>

        {/* The loading overlay is scoped to the grid, so the header and the
            filter bar stay usable while a search is in flight. */}
        <Box
          sx={{
            flex: "1 1 auto",
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          {isLoading ? <DivLoading WithoutCard /> : null}
          <BaseGrid
            Fields={FieldLists}
            HideNumber={false}
            Data={Data}
            Option={GridOption}
            TextLength={50}
            OrderBy={this.OrderBy}
            SearchField={this.SearchField}
            SearchFieldData={this.SearchOption.SearchField}
            PK={Config.PK ? Config.PK : "id_data"}
            ChangePage={this.PageLimitChange}
            HideCheck={true}
            FillHeight={true}
            ActionHeader={t("Actions")}
            NoRowsText={
              IsFiltered
                ? t("Шүүлтүүрт тохирох иргэн олдсонгүй")
                : t("Таны хяналтад иргэн бүртгэгдээгүй байна")
            }
            NoRowsAction={
              IsFiltered ? (
                <Button
                  size="small"
                  disableElevation
                  onClick={this.ClearFilters}
                  sx={gridToolbarButtonSx.neutral}
                >
                  {t("Шүүлтүүр цэвэрлэх")}
                </Button>
              ) : null
            }
            ColumnActions={[
              {
                Field: "Patient.p_registration",
                Component: <ShowPatient />,
              },
              { Field: "Journals", Component: <ShowJournals /> },
            ]}
            widthPattern="40c, 130l, 130l, 120l, 110c, 260l, 130r"
            RowActions={[
              {
                Component: <QuestionButton />,
                onClick: (Data) => {
                  this.ShowComments(Data);
                },
              },
              {
                Component: <BtnPatientMonitor />,
                onClick: (Data) => this.ShowPatientMonitoring(Data),
              },
              {
                Component: <BtnRemoteVisit />,
                onClick: (Data) => this.ShowRemoteVisit(Data),
              },
              {
                Component: <BtnRemovePatient />,
                onClick: (Data) => this.RemovePatient(Data),
              },
            ]}
          />
        </Box>
      </Box>
    );
  };

  render() {
    return this.CustomRender();
  }
}

export default withTranslation(undefined, { withRef: true })(
  PatientMonitoringDoctor,
);
