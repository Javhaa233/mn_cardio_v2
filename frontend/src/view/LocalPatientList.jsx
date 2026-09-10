import { withTranslation } from "react-i18next";
import React, { Component, createRef } from "react";
// translation
// default components
import Card from "components/Card/Card";
import CardHeader from "components/Card/CardHeader";
import CardBody from "components/Card/CardBody";
// custom components
import RangeDate from "customComponents/RangeDate";
import BaseListManual from "baseComponents/BaseListManual";
import BaseDialog from "customComponents/BaseDialog";
import PatientForm from "customComponents/Forms/PatientForm";
import ShowPatient from "customComponents/FieldActions/ShowPatient";
import UserDialogLink from "customComponents/InPatient/FieldActions/UserDialogLink";
// helper
import Helper from "helper";

class LocalPatientList extends Component {
  constructor(props) {
    super(props);
    this.LogedUser = Helper.AuthHelper.GetLogedUserLocal();
    const searchOption = Helper.BaseCrudHelper.GetSearchOption();
    searchOption.OrderBy = { Field: "id_data", Type: "desc" };
    if (
      this.LogedUser &&
      this.LogedUser.Doctor &&
      this.LogedUser.Doctor.Organization
    ) {
      if (this.LogedUser.Doctor.Organization.addr_prov_city) {
        searchOption.SearchField.push({
          Field: "addr_prov_city",
          Value: this.LogedUser.Doctor.Organization.addr_prov_city,
          Op: "Equals",
        });
      }
      if (this.LogedUser.Doctor.Organization.addr_soum_dist) {
        searchOption.SearchField.push({
          Field: "addr_soum_dist",
          Value: this.LogedUser.Doctor.Organization.addr_soum_dist,
          Op: "Equals",
        });
      }
      //horoo bolon sumiin emneleg ved
      if (this.LogedUser.Doctor.Organization)
        if (this.LogedUser.Doctor.Organization.addr_bag_khoroo) {
          searchOption.SearchField.push({
            Field: "addr_bag_khoroo",
            Value: this.LogedUser.Doctor.Organization.addr_bag_khoroo,
            Op: "Equals",
          });
        }
    } else {
      searchOption.SearchField.push({
        Field: "id_data",
        Value: "-1",
        Op: "Equals",
      });
    }

    this.state = { Dialog: null, Alert: null, SearchOption: searchOption };

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

  componentDidMount() {
    if (!this.LogedUser.Doctor || !this.LogedUser.Doctor.Organization) {
      const alert = Helper.BaseCrudHelper.ShowAlert(
        "Not connected to the organization",
        false,
        () => this.setState({ Alert: null }),
      );

      this.setState({ Alert: alert });
    }
  }

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
    this.setState({ Dialog: Dialog });
  };

  render() {
    const { Dialog, Alert, SearchOption } = this.state;
    const { t } = this.props;

    return (
      <>
        {Dialog}
        {Alert}
        <Card
          style={{
            margin: 0,
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <CardHeader color="info" title={t("Local patient")} />
          <CardBody
            style={{
              padding: "10px 0 0 0",
              display: "flex",
              flexDirection: "column",
              flex: 1,
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
            <BaseListManual
              ref={(ref) => (this.BaseList = ref)}
              GridColumnActions={[
                { Field: "p_registration", Component: <ShowPatient /> },
                {
                  Field: "Users.UserName",
                  Component: <UserDialogLink FieldName="Users" />,
                },
              ]}
              GridHideCheck={true}
              SearchOption={SearchOption}
              onSearchOptionChange={this.handleSearchOptionChange}
              ObjectName="Patient"
              ShowData={this.ShowData}
            />
          </CardBody>
        </Card>
      </>
    );
  }
}

export default withTranslation(undefined, { withRef: true })(LocalPatientList);
