import { withTranslation } from "react-i18next";
import React from "react";
// @mui/material components
import IconButton from "@mui/material/IconButton";
// @mui/icons-material
import LocalHotelIcon from "@mui/icons-material/LocalHotel";
import CancelIcon from "@mui/icons-material/Cancel";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// custom components
import BaseGrid from "baseComponents/BaseGrid/BaseGrid";
import BaseList from "baseComponents/BaseList";
import DivLoading from "customComponents/DivLoading";
import ShowPatient from "customComponents/InPatient/FieldActions/ShowPatient";
import EditNotes from "customComponents/InPatient/FieldActions/EditNotes";
import UserDialogLink from "customComponents/InPatient/FieldActions/UserDialogLink";
// helper
import Helper from "helper";
import { colors } from "@/theme/colors";

class WaitingList extends BaseList {
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
      "result",
      "waiting",
      this.SearchOption.SearchField,
      "Equals",
    );
    this.setState({ DepartmentId }, () => {
      this.GetData();
    });
  };

  ToHospital = async (RowData) => {
    const { ShowAlert, ShowConfirm, t } = this.props;
    if (RowData && RowData.id_data) {
      ShowConfirm &&
        ShowConfirm(
          t("Are you sure you want to be hospitalized?"),
          async () =>
            await Helper.StayHelper.CustomSave(
              { OrderHospitalizationId: RowData.id_data },
              (resData) => {
                ShowAlert && ShowAlert(resData);
                this.GetData();
              },
            ),
        );
    }
  };

  CheckGetData = () => {
    const { DepartmentId } = this.state;
    return DepartmentId ? true : false;
  };

  Cancel = (RowData) => {
    const { ShowAlert, ShowConfirm, t } = this.props;
    if (RowData && RowData.id_data) {
      ShowConfirm &&
        ShowConfirm(
          t("Are you sure you want to cancel?"),
          async () =>
            await Helper.OrderHospitalizationHelper.CancelPatient(
              { OrderHospitalizationId: RowData.id_data },
              (resData) => {
                ShowAlert && ShowAlert(resData);
                this.GetData();
              },
            ),
        );
    }
  };

  SaveInfo = async (Field, SaveData) => {
    const { ShowAlert } = this.props;
    if (Field && SaveData) {
      await Helper.BaseCrudHelper.BaseUpdate(
        {
          ObjectName: "OrderHospitalization",
          Data: { [Field]: SaveData.Text, id_data: SaveData.RowData.id_data },
        },
        (resData) => {
          ShowAlert && ShowAlert(resData);
          this.GetData();
        },
      );
    }
  };

  CustomRender = () => {
    const { Data, GridOption, DialogData, isLoading, Alert } = this.state;
    const { t } = this.props;

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
                  { Name: "Patient.Age", Label: t("Age"), NoSorting: true },
                  {
                    Label: t("Gender"),
                    Name: "Patient.Gender.label",
                    Type: "Gender",
                  },
                  { Name: "Patient.p_telephone", Label: t("Patient phone") },
                  {
                    Name: "vwOrderHospitalizationInfo.WaitDay",
                    Label: t("Wait day"),
                  },
                  {
                    Name: "schedule_date",
                    Label: t("PlannedHospitalizationDate"),
                    Type: "Date",
                  },
                  {
                    Name: "vwSeverity.label",
                    Label: t("Severity"),
                    Type: "Translate",
                  },
                  { Name: "JournalRef.jr_label", Label: t("ICD10") },
                  // { Name: "phone", Label: t("Phone") },
                  { Name: "notes", Label: t("Notes") },
                  // { Name: "vvwModeWaitinglist.label", Label: t("Patient from") },
                  { Name: "Users.UserName", Label: t("User name") },
                  // {
                  //   Name: "Patient.DictProvinceCity.name",
                  //   Label: t("Province/City"),
                  // },
                  // {
                  //   Name: "Patient.DictSoumDistrict.name",
                  //   Label: t("Soum/District"),
                  // },
                  {
                    Name: "date_creation",
                    Label: t("QueueRegistrationDate"),
                    Type: "Date",
                  },
                ]}
                ColumnActions={[
                  {
                    Field: "Patient.p_registration",
                    Component: <ShowPatient />,
                  },
                  {
                    Field: "notes",
                    props: {
                      Field: "notes",
                      Title: t("Edit notes"),
                      Save: (SaveData) => this.SaveInfo("notes", SaveData),
                    },
                    Component: <EditNotes />,
                    onClick: () => {},
                  },
                  {
                    Field: "Users.UserName",
                    Component: <UserDialogLink FieldName="Users" />,
                  },
                ]}
                RowActions={[
                  {
                    Component: (
                      <IconButton
                        style={{
                          margin: "2px",
                          padding: "8px",
                          color: colors.brand.cyanInk,
                        }}
                        title={t("Hospitalize")}
                        onClick={() => {}}
                      >
                        <LocalHotelIcon fontSize="small" />
                      </IconButton>
                    ),
                    onClick: (data) => this.ToHospital(data),
                  },
                  {
                    Component: (
                      <IconButton
                        style={{
                          margin: "2px",
                          padding: "8px",
                          color: colors.status.dangerInk,
                        }}
                        title={t("Cancel")}
                        onClick={() => {}}
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
                OrderBy={this.OrderBy}
                PageSize={10}
                HideNumber={true}
                HideCheck={true}
                SearchFieldData={this.SearchOption.SearchField}
                FieldFilter={false}
                PK={"id_data"}
                ShowData={(EditData) => {}}
                RowActionFirst={true}
                widthPattern="80c, 150, 150, 120, 60r, 80c, 150, 40r, 140c, 150, 200, 250, 140, 120c, 120"
              />
            </div>
          </GridItem>
        </GridContainer>
      </div>
    );
  };
}

export default withTranslation(undefined, { withRef: true })(WaitingList);
