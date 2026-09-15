import { withTranslation } from "react-i18next";
import React, { Component, createRef } from "react";
// translation
// @mui/material components
import CircularProgress from "@mui/material/CircularProgress";
// @mui/icons-material
import ImportExportIcon from "@mui/icons-material/ImportExport";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
// default components
import UniCard from "customComponents/UniCard";
import Button from "components/CustomButtons/Button";
// custom components
import BaseListManual from "baseComponents/BaseListManual";
import BaseDialog from "customComponents/BaseDialog";
import PatientForm from "customComponents/Forms/PatientForm";
import RangeDate from "customComponents/RangeDate";
import NewPatientDialog from "customComponents/Patient/NewPatientDialog";
import ShowPatient from "customComponents/FieldActions/ShowPatient";
import UserDialogLink from "customComponents/InPatient/FieldActions/UserDialogLink";
// helper
import Helper from "helper";
import { colors } from "@/theme/colors";

const LogedUser = Helper.AuthHelper.GetLogedUserLocal();

class CreatePatientList extends Component {
  constructor(props) {
    super(props);
    const searchOption = Helper.BaseCrudHelper.GetSearchOption();
    searchOption.OrderBy = { Field: "id_data", Type: "desc" };

    this.state = {
      Dialog: null,
      NewPatientOpen: false,
      Alert: null,
      exportLoading: false,
      SearchOption: searchOption,
    };

    // refs
    this.PatientDialogRef = createRef();
    this.Form = createRef();
    this.BaseList = createRef();
  }

  handleSearchOptionChange = (newSearchOption) => {
    const t = this.props.t;
    this.setState({ SearchOption: newSearchOption }, () => {
      if (this.BaseList) {
        this.BaseList.GetData();
      }
    });
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

  ShowData = (EditObject) => {
    var Dialog = (
      <BaseDialog
        ref={(ref) => (this.PatientDialogRef = ref)}
        Close={() => this.setState({ Dialog: null })}
        Title="Edit patient"
        ShowSave={true}
        Save={(callback) => {
          this.Form.Save &&
            this.Form.Save((Success) => {
              if (Success) {
                this.setState({ Dialog: null });
                this.BaseList.GetData && this.BaseList.GetData();
              }
              callback && callback();
            });
        }}
      >
        <PatientForm
          ref={(ref) => (this.Form = ref)}
          ObjectName="Patient"
          PatientId={EditObject.id_data}
          RegisterNo={EditObject.p_registration}
        />
      </BaseDialog>
    );
    this.setState({ Dialog });
  };

  render() {
    const { Dialog, Alert, exportLoading, SearchOption } = this.state;
    const { t } = this.props;
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          flex: "1 1 auto",
          minHeight: 0,
          minWidth: 0,
          maxWidth: "100%",
        }}
      >
        {Dialog}
        {Alert}
        <NewPatientDialog
          open={this.state.NewPatientOpen}
          onClose={() => this.setState({ NewPatientOpen: false })}
          onCreated={() => this.BaseList.GetData && this.BaseList.GetData()}
        />
        <UniCard
          title={t("Created patient")}
          cardStyle={{ flex: "1 1 auto", minHeight: 0 }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "0px 0 0px 0",
            }}
          >
            <RangeDate
              ChangeValue={(StartDate, EndDate) => {
                const newSearchOption = { ...SearchOption };
                newSearchOption.SearchField =
                  Helper.BaseCrudHelper.SetSearchField(
                    "date_creation",
                    [StartDate, EndDate],
                    newSearchOption.SearchField,
                    "Between",
                  );
                this.handleSearchOptionChange(newSearchOption);
              }}
              Refresh={() => {
                const newSearchOption = { ...SearchOption };
                if (
                  newSearchOption.SearchField &&
                  newSearchOption.SearchField.length > 0
                ) {
                  newSearchOption.SearchField =
                    newSearchOption.SearchField.filter(
                      (el) => el.Field !== "date_creation",
                    );
                  this.handleSearchOptionChange(newSearchOption);
                }
              }}
            />
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              {/* This screen lists the patients you have created and, until
                  now, gave you no way to create one - the only route was to
                  search the top bar for a registration number that matched
                  nobody. */}
              {Helper.AuthHelper.CheckRole([1, 2, 3]) === true && (
                <Button
                  color="info"
                  size="sm"
                  onClick={() => this.setState({ NewPatientOpen: true })}
                >
                  <PersonAddAlt1Icon style={{ marginRight: "4px" }} />
                  {t("Шинэ өвчтөн")}
                </Button>
              )}
              {!this.props.HideExport && (
                <div style={{ position: "relative" }}>
                  <Button
                    color="success"
                    size="sm"
                    onClick={async () => {
                      this.setState({ exportLoading: true });
                      await Helper.BaseCrudHelper.ExportExcel(
                        {
                          ObjectName: "Patient",
                          Url: "/BaseObject/ExportExcel",
                          SearchOption: SearchOption,
                          FileName: "CreatedPatient.xlsx",
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
                        color: colors.brand.cyanInk,
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
          </div>
          <div
            style={{
              flex: "1 1 auto",
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <BaseListManual
              ref={(ref) => (this.BaseList = ref)}
              GridColumnActions={[
                { Field: "p_registration", Component: <ShowPatient /> },
                {
                  Field: "Users.UserName",
                  Component: <UserDialogLink FieldName="Users" />,
                },
              ]}
              SearchOption={SearchOption}
              onSearchOptionChange={this.handleSearchOptionChange}
              Fields={[
                { Label: t("Personal No"), Name: "p_registration" },
                { Label: t("Last Name"), Name: "p_lastname" },
                { Label: t("First Name"), Name: "p_firstname" },
                { Label: t("Family name"), Name: "p_familyname" },
                { Label: t("Birthday"), Name: "p_birthday", Type: "Date" },
                { Label: t("Gender"), Name: "p_gender", Type: "Gender" },
                { Label: t("Ethnicity other"), Name: "ethnicity_other" },
                {
                  Label: t("Date de creation"),
                  Name: "date_creation",
                  Type: "Date",
                },
                { Label: t("Organization"), Name: "Organization.Name" },
                { Label: t("Doctor"), Name: "Users.UserName" },
              ]}
              ObjectName="Patient"
              ShowData={this.ShowData}
              GridHideCheck={true}
              widthPattern="40r, 150, 150, 150, 150, 60c, 100c, 40r, 100, 100, 40r, 150, 150, 150, 120, 120, 120, 120c"
            />
          </div>
        </UniCard>
      </div>
    );
  }
}

export default withTranslation(undefined, { withRef: true })(CreatePatientList);
