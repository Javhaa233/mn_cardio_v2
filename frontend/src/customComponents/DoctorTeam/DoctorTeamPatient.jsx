import { createRef } from "react";
// translation
import { withTranslation } from "react-i18next";
// @material-ui core components
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
// @material-ui icons
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
// custom components
import BaseList from "baseComponents/BaseList";
import BaseGrid from "baseComponents/BaseGrid/BaseGrid";
import RowActionButton from "baseComponents/BaseGrid/RowActionButton";
import RangeDate from "customComponents/RangeDate";
import DivLoading from "customComponents/DivLoading";
import BaseDialog from "customComponents/BaseDialog";
import DoctorTeamHeader from "customComponents/DoctorTeam/DoctorTeamHeader";
import DoctorTeamPatientNotes from "customComponents/DoctorTeam/DoctorTeamPatientNotes";
import { PatientActions } from "@features/patient";
import ShowPatient from "customComponents/FieldActions/ShowPatient";
import ShowJournals from "customComponents/PatientMonitoring/ShowJournals";

import EditComment from "customComponents/DoctorTeam/FieldActions/EditComment";
// helper
import Helper from "helper";
import { colors } from "@/theme/colors";
import { space, radius, elevation } from "@/theme/tokens";
import { gridToolbarButtonSx } from "@/theme/controlStyles";

//customer components
class DoctorTeamPatient extends BaseList {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      DialogData: null,
      DoctorTeamId: props.DoctorTeamId || null,
      exportLoading: false,
      // Distinguishes "this team has nobody in it" from "your filters excluded
      // everyone" - the empty grid looks identical otherwise.
      IsFiltered: false,
      ObjectName: "DoctorsTeamPatient",
    };
    this.SearchOption = Helper.BaseCrudHelper.GetSearchOption();
    this.SearchOption.PageOption.Limit = 10;
    this.SearchOption.OrderBy = { Field: "id_data", Type: "DESC" };

    // refs
    this.PatientActionsRef = createRef();
  }

  setTeamId = (teamId) => {
    if (teamId && teamId !== this.state.DoctorTeamId) {
      this.setState({ DoctorTeamId: teamId }, () => {
        this.GetData();
      });
    }
  };

  GetData = async () => {
    const { DoctorTeamId } = this.state;

    if (DoctorTeamId) {
      this.setState({ isLoading: true });
      this.SearchOption.SearchField = Helper.BaseCrudHelper.SetSearchField(
        "team_id",
        DoctorTeamId,
        this.SearchOption.SearchField,
        "Equals",
      );
      this.SearchOption.SearchField = Helper.BaseCrudHelper.SetSearchField(
        "rec_status",
        "2",
        this.SearchOption.SearchField,
        "NotEquals",
      );

      return new Promise((resolve) => {
        Helper.DoctorTeamHelper.GetList(
          { SearchOption: this.SearchOption },
          (resData) => {
            if (resData) {
              this.setState({
                Data: resData.Data || [],
                GridOption: Object.assign({}, resData.Option || {}),
                isLoading: false,
              });
              this.ClearPatientSelection();
            } else {
              this.setState({ isLoading: false, Data: [], GridOption: {} });
            }
            resolve();
          },
        );
      });
    } else {
      this.setState({ isLoading: false });
    }
  };

  ClearPatientSelection = () => {
    const { DoctorTeamId } = this.state;
    this.PatientActionsRef &&
      this.PatientActionsRef.SetValues &&
      this.PatientActionsRef.SetValues({
        PatientId: null,
        PatientRegNo: null,
        PatientName: null,
        SelectedCount: 0,
        TeamId: DoctorTeamId,
        DoctorsTeamPatientId: null,
      });
  };

  SelectRow = (rows) => {
    const { DoctorTeamId } = this.state;

    // The grid is single-select, so anything other than exactly one row means
    // "nothing to act on" - but the action bar now says so out loud instead of
    // just going dead.
    if (rows.length !== 1) {
      this.PatientActionsRef &&
        this.PatientActionsRef.SetValues &&
        this.PatientActionsRef.SetValues({
          PatientId: null,
          PatientRegNo: null,
          PatientName: null,
          SelectedCount: rows.length,
          TeamId: DoctorTeamId,
          DoctorsTeamPatientId: null,
        });
      return;
    }

    const LastSelectRow = rows[0];
    if (!LastSelectRow) return;

    const patient = LastSelectRow.Patient || {};
    const name = [patient.p_lastname, patient.p_firstname]
      .filter(Boolean)
      .join(" ");

    this.PatientActionsRef &&
      this.PatientActionsRef.SetValues &&
      this.PatientActionsRef.SetValues({
        PatientId: LastSelectRow.patient_id,
        PatientRegNo: patient.p_registration || null,
        PatientName: name || null,
        SelectedCount: 1,
        TeamId: DoctorTeamId,
        DoctorsTeamPatientId: LastSelectRow.id_data,
      });
  };

  ShowPatientNotes = (RowData) => {
    const { DoctorTeamId } = this.state;
    var dialog = (
      <BaseDialog
        Close={() => this.setState({ DialogData: null })}
        Height="500px"
        Width="400px"
        Padding="1"
      >
        <DoctorTeamPatientNotes
          TeamId={DoctorTeamId}
          PatientId={RowData.patient_id}
        />
      </BaseDialog>
    );
    this.setState({ DialogData: dialog });
  };

  RemovePatient = async (RowData) => {
    const { DoctorTeamId } = this.state;
    const { t } = this.props;
    let alert = null;
    alert = Helper.BaseCrudHelper.ShowConfirm(
      t("Багаас гаргахдаа итгэлтэй байна уу?"),
      async () => {
        await Helper.DoctorTeamHelper.RemovePatient(
          {
            patient_id: RowData.patient_id,
            team_id: DoctorTeamId,
            DoctorsTeamPatientId: RowData.id_data,
          },
          (resData) => {
            if (resData) {
              alert = Helper.BaseCrudHelper.ShowAlert(
                resData.Message,
                resData.Success,
                () => {
                  this.setState({ Alert: null });
                  this.GetData();
                },
              );
              this.setState({ Alert: alert });
            }
          },
        );
      },
      () => this.setState({ Alert: null }),
    );
    this.setState({ Alert: alert });
  };

  createAndUpdateNotes = async (Field, SaveData) => {
    const { ObjectName } = this.state;
    const { t } = this.props;

    if (!ObjectName || !Field || !SaveData || !SaveData.RowData) {
      return Promise.resolve({
        Success: false,
        Message: t("Мэдээлэл дутуу байна"),
      });
    }

    const updateData = {
      [Field]: SaveData.Text || "",
      id_data: SaveData.RowData.id_data,
    };

    return new Promise((resolve) => {
      Helper.BaseCrudHelper.BaseUpdate(
        { ObjectName, Data: updateData },
        async (resData) => {
          if (resData && resData.Success) {
            await this.GetData();
            resolve(resData);
          } else {
            const alert = Helper.BaseCrudHelper.ShowAlert(
              (resData && resData.Message) || t("Тэмдэглэл хадгалагдсангүй"),
              false,
              () => this.setState({ Alert: null }),
            );
            this.setState({ Alert: alert });
            resolve(resData);
          }
        },
      );
    });
  };

  /** Free-text search across the list, server-side. */
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
    // Keep only the two scoping filters this list is defined by.
    this.SearchOption.SearchField = (
      this.SearchOption.SearchField || []
    ).filter((s) => s && (s.Field === "team_id" || s.Field === "rec_status"));
    this.setState({ IsFiltered: false }, () => this.GetData());
  };

  HandleExportResult = (resData, Success) => {
    const { t } = this.props;
    this.setState({ exportLoading: false });
    const alert = Helper.BaseCrudHelper.ShowAlert(
      Success
        ? t("Excel file downloaded")
        : (resData && resData.Message) || t("Excel export failed"),
      Success,
      () => this.setState({ Alert: null }),
    );
    this.setState({ Alert: alert });
  };

  /**
   * Uses the generic /BaseObject/ExportExcel, NOT the domain route.
   * `/DoctorsTeam/ExportDoctorsTeamPatient` looks like the obvious choice but
   * it opens with an unconditional error return before its own try block, so
   * it can never succeed.
   */
  ExportExcel = async () => {
    const ObjectName = "DoctorsTeamPatient";
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

  CustomRender = () => {
    const {
      Data,
      GridOption,
      DialogData,
      isLoading,
      Alert,
      IsFiltered,
      exportLoading,
    } = this.state;
    const { t, Team, GroupLabel, OnSettings } = this.props;

    const panelSx = {
      backgroundColor: colors.brand.surface,
      border: `1px solid ${colors.brand.hairline}`,
      borderRadius: radius.lg,
      boxShadow: elevation[1],
    };

    return (
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          padding: space[3],
        }}
      >
        {Alert}
        {DialogData}

        <DoctorTeamHeader
          Team={Team}
          GroupLabel={GroupLabel}
          PatientCount={GridOption ? GridOption.Total : undefined}
          OnSettings={OnSettings}
          OnExport={this.ExportExcel}
          Exporting={exportLoading}
        />

        <Box sx={{ ...panelSx, padding: space[3], marginBottom: space[3] }}>
          <RangeDate
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
            Refresh={() => this.GetData()}
            Search={this.SearchAll}
          />
        </Box>

        <PatientActions
          ref={(ref) => (this.PatientActionsRef = ref)}
          ShowSelectionHint={true}
        />

        <Box sx={{ flex: "1 1 auto", position: "relative", minHeight: 0 }}>
          {isLoading ? <DivLoading WithoutCard /> : null}
          <BaseGrid
            OrderBy={this.OrderBy}
            SelectRow={this.SelectRow}
            SingleSelect
            Fields={[
              { Name: "Patient.p_lastname", Label: t("Last name") },
              { Name: "Patient.p_firstname", Label: t("First name") },
              { Name: "Patient.p_registration", Label: t("Register") },
              { Name: "Patient.Age", Label: t("Age") },
              { Name: "Patient.Gender.label", Label: t("Gender") },
              {
                Name: "Journals",
                Label: t("ICD10"),
                NoFilter: true,
                NoSorting: true,
              },
              { Name: "Users.UserName", Label: t("Doctor") },
              { Name: "comment", Label: t("Notes") },
              {
                Name: "date_creation",
                Label: t("Created date"),
                Type: "Date",
              },
            ]}
            ColumnActions={[
              {
                Field: "Patient.p_registration",
                Component: <ShowPatient />,
              },
              { Field: "Journals", Component: <ShowJournals /> },
              {
                Field: "comment",
                props: {
                  Field: "comment",
                  Title: "Notes",
                  Save: (SaveData) =>
                    this.createAndUpdateNotes("comment", SaveData),
                },
                Component: <EditComment />,
                onClick: () => {},
              },
            ]}
            RowActions={[
              {
                Component: (
                  <RowActionButton
                    label={t("Notes")}
                    icon={<ChatBubbleOutlineIcon />}
                  />
                ),
                onClick: (Data) => this.ShowPatientNotes(Data),
              },
              {
                Component: (
                  <RowActionButton
                    label={t("Remove")}
                    icon={<RemoveCircleOutlineIcon />}
                    danger
                  />
                ),
                onClick: (Data) => this.RemovePatient(Data),
              },
            ]}
            NoRowsText={
              IsFiltered
                ? t("Шүүлтүүрт тохирох өвчтөн олдсонгүй")
                : t("Энэ багт өвчтөн бүртгэгдээгүй байна")
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
            ChangePage={this.PageLimitChange}
            SearchField={this.SearchField}
            Data={Data}
            Option={GridOption}
            TextLength={20}
            PageSize={10}
            SearchFieldData={[]}
            HideNumber
            PK={"id_data"}
            ShowData={() => {}}
            widthPattern="130l, 130l, 100l, 40c, 60c, 100c, 120l, 150l, 110c, 90r"
          />
        </Box>
      </Box>
    );
  };
}

export default withTranslation(undefined, { withRef: true })(DoctorTeamPatient);
