import { withTranslation } from "react-i18next";
import React, { createRef } from "react";
// @mui/material components
import IconButton from "@mui/material/IconButton";
// @mui/icons-material
import CancelIcon from "@mui/icons-material/Cancel";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// custom components
import BaseGrid from "baseComponents/BaseGrid/BaseGrid";
import BaseDialog from "customComponents/BaseDialog";
import DivLoading from "customComponents/DivLoading";
import ShowPatient from "customComponents/InPatient/FieldActions/ShowPatient";
import EditNotes from "customComponents/InPatient/FieldActions/EditNotes";
import UserDialogLink from "customComponents/InPatient/FieldActions/UserDialogLink";
import { PatientActions } from "@features/patient";
import EditOutPatientInfo from "customComponents/InPatient/RowAction/EditOutPatientInfo";
import StayLeaveForm from "customComponents/Forms/StayLeaveForm";
import BaseList from "baseComponents/BaseList";
// helper
import Helper from "helper";

class AdmittedList extends BaseList {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      DialogData: null,
      DepartmentId: null,
      SelectedPatient: null,
    };

    this.SearchOption = Helper.BaseCrudHelper.GetSearchOption();
    this.SearchOption.PageOption.Limit = 10;
    this.SearchOption.OrderBy = { Field: "id_data", Type: "desc" };

    // refs
    this.DialogRef = createRef();
    this.Form = createRef();
  }

  componentDidMount() {
    if (super.componentDidMount) super.componentDidMount();
    if (this.props.DepartmentId) {
      this.SetDepartmentId(this.props.DepartmentId);
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.DepartmentId !== this.props.DepartmentId) {
      this.SetDepartmentId(this.props.DepartmentId);
    }
  }

  SetDepartmentId = (DepartmentId) => {
    this.SearchOption.PageOption.Page = 0;

    this.SearchOption.SearchField = Helper.BaseCrudHelper.SetSearchField(
      "department_id",
      DepartmentId,
      this.SearchOption.SearchField,
      "Equals",
    );

    this.SearchOption.SearchField = Helper.BaseCrudHelper.SetSearchField(
      "mode_discharge",
      null,
      this.SearchOption.SearchField,
      "Equals",
    );

    this.SearchOption.SearchField = Helper.BaseCrudHelper.SetSearchField(
      "p_status",
      "2",
      this.SearchOption.SearchField,
      "Equals",
    );

    this.setState({ DepartmentId }, () => {
      this.GetData();
    });
  };

  CheckGetData = () => {
    const { DepartmentId } = this.state;
    return DepartmentId ? true : false;
  };

  SelectRow = (rows) => {
    if (rows.length === 1) {
      const LastSelectRow = rows[0];
      this.setState({
        SelectedPatient: {
          PatientId:
            LastSelectRow.p_id ||
            LastSelectRow.Patient?.p_id ||
            LastSelectRow.Patient?.id,
          PatientRegNo:
            LastSelectRow.patient_register ||
            LastSelectRow.Patient?.p_registration,
          StayId: LastSelectRow.id_data,
        },
      });
    } else {
      this.setState({ SelectedPatient: null });
    }
  };

  SaveInfo = async (Field, SaveData) => {
    if (Field && SaveData) {
      await Helper.BaseCrudHelper.BaseUpdate(
        {
          ObjectName: "Stay",
          Data: { [Field]: SaveData.Text, id_data: SaveData.RowData.id_data },
        },
        (resData) => resData && resData.Success && this.GetData(),
      );
    }
  };

  StayLeaveFormShow = (StayId) => {
    const { ShowAlert } = this.props;
    this.setState({
      DialogData: (
        <BaseDialog
          ref={(ref) => (this.DialogRef = ref)}
          Close={() => this.setState({ DialogData: null })}
          Save={() => {
            this.Form.Save &&
              this.Form.Save((resData) => {
                if (resData && resData.Success) {
                  this.setState({ DialogData: null });
                  this.GetData();
                } else {
                  this.DialogRef.setState({ Loading: false });
                }
              });
          }}
          ShowSave={true}
        >
          <StayLeaveForm
            ref={(ref) => (this.Form = ref)}
            ObjectName="Stay"
            StayId={StayId}
            ShowAlert={ShowAlert}
          />
        </BaseDialog>
      ),
    });
  };

  Cancel = (RowData) => {
    const { ShowConfirm, t } = this.props;
    if (RowData && RowData.id_data) {
      ShowConfirm &&
        ShowConfirm(t("Are you sure you want to leave the department?"), () => {
          this.StayLeaveFormShow(RowData.id_data);
        });
    }
  };

  // OrderBy = (Field, Type) => {
  //   this.SearchOption.OrderBy = { Field: Field, Type: Type };
  //   this.GetData();
  // };

  CustomRender = () => {
    const { t } = this.props;
    const { Data, GridOption, DialogData, isLoading, Alert, SelectedPatient } =
      this.state;
    return (
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          flex: "1 1 auto",
          minHeight: 0,
          maxWidth: "100%",
          overflow: "hidden",
        }}
      >
        {isLoading ? <DivLoading WithoutCard /> : null}
        {DialogData}
        {Alert}
        <GridContainer
          direction="column"
          wrap="nowrap"
          sx={{ margin: 0, width: "100%", height: "100%" }}
          style={{
            flex: "1 1 auto",
            minHeight: 0,
            maxWidth: "100%",
            minWidth: 0,
          }}
        >
          <GridItem
            xs={12}
            sm={12}
            md={12}
            sx={{ padding: 0 }}
            style={{ flex: "0 0 auto" }}
          >
            <PatientActions
              PatientId={SelectedPatient?.PatientId}
              PatientRegNo={SelectedPatient?.PatientRegNo}
              StayId={SelectedPatient?.StayId}
            />
          </GridItem>
          <GridItem
            xs={12}
            sm={12}
            md={12}
            sx={{ padding: 0 }}
            style={{
              display: "flex",
              flexDirection: "column",
              flex: "1 1 auto",
              minHeight: 0,
              maxWidth: "100%",
              minWidth: 0,
            }}
          >
            <div
              style={{
                flex: "1 1 auto",
                minHeight: 0,
                maxWidth: "100%",
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                position: "relative",
                height: "100%",
              }}
            >
              <BaseGrid
                Dense={true}
                FillHeight={true}
                OrderBy={this.OrderBy}
                SelectRow={this.SelectRow}
                Fields={[
                  { Name: "Patient.p_lastname", Label: t("Last name") },
                  { Label: t("First name"), Name: "Patient.p_firstname" },
                  { Name: "Patient.p_registration", Label: t("Register") },
                  { Label: t("Age"), Name: "Patient.Age", NoSorting: true },
                  {
                    Label: t("Gender"),
                    Name: "Patient.Gender.label",
                    Type: "Gender",
                  },
                  {
                    Name: "vwSeverity.label",
                    Label: t("Severity"),
                    Type: "Translate",
                  },
                  { Name: "DiagnoseAdmission.jr_label", Label: t("Diagnosis") },
                  { Name: "inpatient_p_notes", Label: t("Notes") },
                  { Name: "Patient.p_telephone", Label: t("Phone") },
                  { Name: "vwStayInfo.TotalDay", Label: t("Total day") },
                  // {
                  //   Name: "Patient.DictProvinceCity.name",
                  //   Label: t("Province/City"),
                  // },
                  // {
                  //   Name: "Patient.DictSoumDistrict.name",
                  //   Label: t("Soum/District"),
                  // },
                  {
                    Name: "AdmissionUsers.UserName",
                    Label: t("Admission doctor"),
                  },
                  {
                    Name: "date_creation",
                    Label: t("Admission Date"),
                    Type: "Date",
                  },
                  {
                    Name: "vvwModeWaitinglist.label",
                    Label: t("Patient from"),
                  },
                ]}
                ColumnActions={[
                  {
                    Field: "Patient.p_registration",
                    Component: <ShowPatient />,
                  },
                  {
                    Field: "inpatient_p_notes",
                    props: {
                      Field: "inpatient_p_notes",
                      Title: t("Edit notes"),
                      Save: (SaveData) =>
                        this.SaveInfo("inpatient_p_notes", SaveData),
                    },
                    Component: <EditNotes />,
                    onClick: () => {},
                  },
                  {
                    Field: "AdmissionUsers.UserName",
                    Component: <UserDialogLink FieldName="AdmissionUsers" />,
                  },
                ]}
                RowActions={[
                  {
                    Component: (
                      <EditOutPatientInfo
                        StayField="id_data"
                        PatientField="p_id"
                        PatRegField="patient_register"
                        Where="InPatient"
                        t={t}
                        IsIconButton={true}
                      />
                    ),
                    onClick: () => {},
                  },
                  {
                    Component: (
                      <IconButton
                        style={{ margin: "2px", padding: "4px", color: "red" }}
                        title={t("Leave department")}
                      >
                        <CancelIcon fontSize="small" />
                      </IconButton>
                    ),
                    onClick: (data) => this.Cancel(data),
                  },
                ]}
                ChangePage={this.PageLimitChange}
                SearchField={this.SearchField}
                Data={Data}
                Option={GridOption}
                TextLength={200}
                PageSize={10}
                HideNumber={true}
                SearchFieldData={this.SearchOption.SearchField}
                FieldFilter={false}
                PK={"id_data"}
                ShowData={(EditData) => {}}
                RowActionFirst={true}
                widthPattern="80c, 150, 150, 130, 60r, 80c, 120c, 200, 200, 120, 50r, 150, 120c, 140"
              />
            </div>
          </GridItem>
        </GridContainer>
      </div>
    );
  };
}

export default withTranslation(undefined, { withRef: true })(AdmittedList);
