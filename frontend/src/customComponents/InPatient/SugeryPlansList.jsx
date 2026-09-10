import { useTranslation } from "react-i18next";
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
import EditSanal from "customComponents/InPatient/FieldActions/EditSanal";
import UserDialogLink from "customComponents/InPatient/FieldActions/UserDialogLink";
import Filter from "customComponents/InPatient/Filter";
// helper
import Helper from "helper";

class SugeryPlansList extends BaseList {
  constructor(props) {
    super(props);
    this.state = { ...this.state, DialogData: null, DepartmentId: null };
    this.SearchOption = Helper.BaseCrudHelper.GetSearchOption();
    this.SearchOption.OrderBy = { Field: "Id", Type: "desc" };
  }

  ShowConfirm = (Message, ConfirmFunct) => {
    const alert = Helper.BaseCrudHelper.ShowConfirm(
      Message,
      () => {
        ConfirmFunct();
        this.setState({ Alert: null });
      },
      () => this.setState({ Alert: null }),
    );
    this.setState({ Alert: alert });
  };

  ShowAlert = (Data) => {
    if (Data) {
      const alert = Helper.BaseCrudHelper.ShowAlert(
        Data.Message,
        Data.Success,
        () => {
          this.setState({ Alert: null });
          this.GetData();
        },
      );
      this.setState({ Alert: alert });
    }
  };

  ToHospital = async (RowData) => {
    const { t } = this.props;
    if (RowData && RowData.Id) {
      this.ShowConfirm(t("SurgeryProceedConfirm"), async () => {
        await Helper.SurgeryPlansHelper.CustomSave(
          { SurgeryPlansId: RowData.Id },
          (resData) => this.ShowAlert(resData),
        );
      });
    }
  };

  Cancel = (RowData) => {
    const { t } = this.props;
    if (RowData && RowData.Id) {
      this.ShowConfirm(t("Are you sure you want to cancel?"), async () => {
        await Helper.SurgeryPlansHelper.CancelPatient(
          { id: RowData.Id },
          (resData) => this.ShowAlert(resData),
        );
      });
    }
  };

  SetFilter = (DepartmentId) => {
    let depId = DepartmentId;
    if (depId === "-1") depId = null;
    this.setState({ DepartmentId: depId });
    this.SearchOption.PageOption.Page = 0;

    this.SearchOption.SearchField = Helper.BaseCrudHelper.SetSearchField(
      "department_id",
      depId,
      this.SearchOption.SearchField,
      "Equals",
    );

    this.GetData();
  };

  SaveInfo = async (Field, SaveData) => {
    if (Field && SaveData) {
      await Helper.BaseCrudHelper.BaseUpdate(
        {
          ObjectName: "SurgeryPlans",
          Data: { [Field]: SaveData.Text, Id: SaveData.RowData.Id },
        },
        (resData) => {
          this.ShowAlert(resData);
          this.GetData();
        },
      );
    }
  };

  CustomRender = () => {
    const { t } = this.props;
    const { Data, GridOption, DialogData, isLoading, Alert } = this.state;

    return (
      <div style={{ position: "relative" }}>
        {isLoading ? <DivLoading WithoutCard /> : null}
        {DialogData}
        {Alert}
        <Filter SetFilter={this.SetFilter} />
        <GridContainer style={{ width: "100%" }}>
          <GridItem xs={12} sm={12} md={12}>
            <BaseGrid
              Fields={[
                { Name: "Patient.p_registration", Label: t("Register") },
                { Name: "Patient.p_lastname", Label: t("Last name") },
                { Name: "Patient.p_firstname", Label: t("First name") },
                { Name: "Patient.Age", Label: t("Age"), NoSorting: true },
                { Name: "Patient.Gender.label", Label: t("Gender") },
                { Name: "Patient.p_telephone", Label: t("Patient phone") },
                //  {
                //    Name: "vwSurgeryPlansInfo.WaitDay",
                //    Label: t("Wait day"),
                //  },
                {
                  Name: "ognoo",
                  Label: t("PlannedSurgeryDate"),
                  Type: "Date",
                },
                //  { Name: "vwSeverity.label", Label: t("Severity") },
                //  { Name: "JournalRef.jr_label", Label: t("ICD10") },
                // { Name: "phone", Label: t("Phone") },
                {
                  Name: "nemelt_sanal",
                  Label: t("AdditionalDoctorSuggestions"),
                  Type: "Text",
                },
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
                  Name: "CreateDate",
                  Label: t("QueueRegistrationDate"),
                  Type: "Date",
                },
              ]}
              ColumnActions={[
                { Field: "Patient.p_registration", Component: <ShowPatient /> },
                {
                  Field: "nemelt_sanal",
                  props: {
                    Field: "nemelt_sanal",
                    Title: t("AdditionalSuggestion"),
                    Save: (SaveData) => this.SaveInfo("nemelt_sanal", SaveData),
                  },
                  Component: <EditSanal />,
                  onClick: () => {},
                },
                // {
                //   Field: "phone",
                //   props: {
                //     Field: "phone",
                //     Title: "Edit phone",
                //     Save: (SaveData) => this.SaveInfo("phone", SaveData),
                //   },
                //   Component: <EditNotes />,
                //   onClick: () => {},
                // },
                {
                  Field: "Users.UserName",
                  Component: <UserDialogLink FieldName="Users" />,
                },
              ]}
              RowActions={[
                // {
                //   Component: (
                //     <IconButton
                //       style={{ margin: "2px", padding: "8px", color: "green" }}
                //       title="Хэвтүүлэх"
                //       onClick={() => {}}
                //     >
                //       <LocalHotelIcon fontSize="small" />
                //     </IconButton>
                //   ),
                //   onClick: (data) => this.ToHospital(data),
                // },
                {
                  Component: (
                    <IconButton
                      style={{ margin: "2px", padding: "8px", color: "red" }}
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
              SearchFieldData={[]}
              FieldFilter={false}
              PK={"Id"}
              ShowData={(EditData) => {}}
            />
          </GridItem>
        </GridContainer>
      </div>
    );
  };
}

export default SugeryPlansList;
