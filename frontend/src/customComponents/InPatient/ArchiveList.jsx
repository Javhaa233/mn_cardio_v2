import { withTranslation } from "react-i18next";
import React from "react";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// custom components
import BaseGrid from "baseComponents/BaseGrid/BaseGrid";
import BaseList from "baseComponents/BaseList";
import DivLoading from "customComponents/DivLoading";
import ShowPatient from "customComponents/InPatient/FieldActions/ShowPatient";
import UserDialogLink from "customComponents/InPatient/FieldActions/UserDialogLink";
import EditOutPatientInfo from "customComponents/InPatient/RowAction/EditOutPatientInfo";
// helper
import Helper from "helper";

class ArchiveList extends BaseList {
  constructor(props) {
    super(props);
    this.state = { ...this.state, DialogData: null, DepartmentId: null };
    this.SearchOption = Helper.BaseCrudHelper.GetSearchOption();
    this.SearchOption.PageOption.Limit = 10;
    this.SearchOption.OrderBy = { Field: "id_data", Type: "desc" };
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
      "p_status",
      ["3", "4"],
      this.SearchOption.SearchField,
      "In",
    );

    this.setState({ DepartmentId }, () => {
      this.GetData();
    });
  };

  CheckGetData = () => {
    const { DepartmentId } = this.state;
    return DepartmentId ? true : false;
  };

  CustomRender = () => {
    const { t } = this.props;
    const { Data, GridOption, DialogData, isLoading, Alert } = this.state;

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
                  {
                    Name: "DiagnoseAdmission.jr_label",
                    Label: t("Admission diagnosis"),
                  },
                  {
                    Name: "DiagnoseDischarge.jr_label",
                    Label: t("Discharge diagnosis"),
                  },
                  { Name: "inpatient_p_notes", Label: t("Notes") },
                  { Name: "vwStayInfo.TotalDay", Label: t("Total day") },
                  { Name: "vwPStatusOfInpatien.label", Label: t("Status") },
                  {
                    Name: "AdmissionUsers.UserName",
                    Label: t("Admission doctor"),
                  },
                  {
                    Name: "DischargeUsers.UserName",
                    Label: t("Discharge doctor"),
                  },
                  // {
                  //   Name: "Patient.DictProvinceCity.name",
                  //   Label: t("Province/City"),
                  // },
                  // {
                  //   Name: "Patient.DictSoumDistrict.name",
                  //   Label: t("Soum/District"),
                  // },
                  { Name: "ArchiveUsers.UserName", Label: t("Archive doctor") },
                  {
                    Name: "date_admission",
                    Label: t("Admission Date"),
                    Type: "Date",
                  },
                  {
                    Name: "date_discharge",
                    Label: t("Discharge date"),
                    Type: "Date",
                  },
                  {
                    Name: "date_archive",
                    Label: t("Archive date"),
                    Type: "Date",
                  },
                  { Name: "vwModeDischarge.label", Label: t("To where") },
                ]}
                ColumnActions={[
                  {
                    Field: "Patient.p_registration",
                    Component: <ShowPatient />,
                  },
                  // {
                  //   Field: "inpatient_p_notes",
                  //   props: {
                  //     Field: "inpatient_p_notes",
                  //     Title: "Edit notes",
                  //     Save: (SaveData) => {},
                  //   },
                  //   Component: <EditNotes />,
                  // },
                  {
                    Field: "AdmissionUsers.UserName",
                    Component: <UserDialogLink FieldName="AdmissionUsers" />,
                  },
                  {
                    Field: "DischargeUsers.UserName",
                    Component: <UserDialogLink FieldName="DischargeUsers" />,
                  },
                  {
                    Field: "ArchiveUsers.UserName",
                    Component: <UserDialogLink FieldName="ArchiveUsers" />,
                  },
                ]}
                RowActions={[
                  {
                    Component: (
                      <EditOutPatientInfo
                        OutPatientInfoField="OutPatientInfo"
                        StayField="id_data"
                        InPatientField={"InPatientId"}
                        PatientField={"p_id"}
                        Where="Archive"
                        t={t}
                        IsIconButton={true}
                      />
                    ),
                    onClick: () => {},
                  },
                ]}
                ChangePage={this.PageLimitChange}
                SearchField={this.SearchField}
                Data={Data}
                Option={GridOption}
                TextLength={200}
                OrderBy={this.OrderBy}
                PageSize={10}
                HideNumber={true}
                HideCheck={true}
                SearchFieldData={this.SearchOption.SearchField}
                FieldFilter={false}
                PK={"id_data"}
                ShowData={(EditData) => {}}
                RowActionFirst={true}
                widthPattern="60c, 130, 130, 110r, 60r, 80c, 150, 200, 200, 200, 40r, 100c, 140, 140, 140, 100c, 100c, 100c, 120, 400c"
              />
            </div>
          </GridItem>
        </GridContainer>
      </div>
    );
  };
}

export default withTranslation(undefined, { withRef: true })(ArchiveList);
