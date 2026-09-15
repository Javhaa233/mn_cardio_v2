import { useTranslation } from "react-i18next";
import React from "react";
// translation
import { withTranslation } from "react-i18next";
// @mui/material components
import Divider from "@mui/material/Divider";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import BaseLoadButton from "customComponents/BaseLoadButton";
import BaseLoading from "customComponents/BaseLoading";
import BaseCustomForm from "customComponents/Forms/BaseCustomForm";
import BaseSelect from "customComponents/BaseEditControls/BaseSelect";
// import BaseTextField from "customComponents/BaseEditControls/BaseTextField";
import BaseRadio from "customComponents/BaseEditControls/BaseRadio";
import BaseNoData from "customComponents/BaseNoData";

// helper
import Helper from "helper";

class CVDDrugForm extends BaseCustomForm {
  constructor(props) {
    super(props);
    this.Year = new Date().getFullYear() + "";
    this.Month = new Date().getMonth() + 1 + "";
    this.ModifyObject = {};
    this.LogedUser = Helper.AuthHelper.GetLogedUserLocal();

    this.Organization = this.LogedUser.Doctor
      ? this.LogedUser.Doctor.Organization
      : null;
  }

  GetData = async () => {
    this.setState({ isLoading: true });
    const { Organization, Year, Month } = this;
    if (Organization && Organization.Id) {
      await Helper.BaseCrudHelper.CallService(
        "/CVDDrug/GetDrugData",
        { OrganizationId: Organization.Id, Year, Month },
        (resData) => {
          if (resData) {
            this.setState({
              isLoading: false,
              EditObject: Object.assign({}, resData.Data),
            });
            // const alert = Helper.BaseCrudHelper.ShowAlert(
            //   Data.Message,
            //   Data.Success,
            //   () => {
            //     this.setState({ Alert: null });
            //     callback && callback();
            //   }
            // );
            // this.setState({ Alert: alert });}
          }
        },
      );
    } else {
      const alert = Helper.BaseCrudHelper.ShowAlert(
        "Information is missing",
        false,
        () => this.setState({ Alert: null }),
      );
      this.setState({ Alert: alert });
    }
  };

  CreateAndUpdate = async (callback) => {
    const { Year, Month } = this;
    this.ModifyObject["Year"] = Year;
    this.ModifyObject["Month"] = Month;

    let alert = null;
    if (Object.keys(this.ModifyObject).length > 0) {
      await Helper.BaseCrudHelper.CallService(
        "/CVDDrug/CreateAndUpdate",
        { Data: JSON.stringify(this.ModifyObject) },
        (resData) => {
          if (resData) {
            alert = Helper.BaseCrudHelper.ShowAlert(
              resData.Message,
              resData.Success,
              () => {
                this.setState({ Alert: null });
                callback && callback();
              },
            );
            this.setState({ Alert: alert });
          }
        },
      );
    } else {
      alert = Helper.BaseCrudHelper.ShowAlert(
        "Information is missing",
        false,
        () => {
          this.setState({ Alert: null });
          callback && callback();
        },
      );
      this.setState({ Alert: alert });
    }
  };

  ChangeValueAfter = (Field, Value) => {
    if (Field === "Year") {
      this.Year = Value;
    } else if (Field === "Month") {
      this.Month = Value;
    }
    (Field === "Year" || Field === "Month") && this.GetData();
  };

  CustomRender = () => {
    const { Alert, Fields, isLoading } = this.state;

    return (
      <div>
        {Alert}
        <div>
          {isLoading ? (
            <div style={{ height: "90px" }}>
              <BaseLoading />
            </div>
          ) : (
            <div style={{ margin: "0 1px" }}>
              <GridContainer>
                {Fields ? (
                  <div>
                    <GridContainer>
                      <GridItem xs={12} sm={4} md={3}>
                        <BaseRadio
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("Em1")}
                          md={6}
                          Row={true}
                        />
                      </GridItem>
                      <GridItem xs={12} sm={4} md={3}>
                        <BaseRadio
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("Em2")}
                          md={6}
                          Row={true}
                        />
                      </GridItem>
                      <GridItem xs={12} sm={4} md={3}>
                        <BaseRadio
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("Em3")}
                          md={6}
                          Row={true}
                        />
                      </GridItem>
                    </GridContainer>
                    <Divider style={{ marginBottom: "5px" }} />
                    <GridContainer>
                      <GridItem xs={12} sm={4} md={3}>
                        <BaseRadio
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("Em4")}
                          md={6}
                          Row={true}
                        />
                      </GridItem>
                      <GridItem xs={12} sm={4} md={3}>
                        <BaseRadio
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("Em5")}
                          md={6}
                          Row={true}
                        />
                      </GridItem>
                      <GridItem xs={12} sm={4} md={3}>
                        <BaseRadio
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("Em6")}
                          md={6}
                          Row={true}
                        />
                      </GridItem>
                    </GridContainer>
                    <Divider style={{ marginBottom: "5px" }} />
                    <GridContainer>
                      <GridItem xs={12} sm={4} md={3}>
                        <BaseRadio
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("Em7")}
                          md={6}
                          Row={true}
                        />
                      </GridItem>
                      <GridItem xs={12} sm={4} md={3}>
                        <BaseRadio
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("Em8")}
                          md={6}
                          Row={true}
                        />
                      </GridItem>
                      <GridItem xs={12} sm={4} md={3}>
                        <BaseRadio
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("Em9")}
                          md={6}
                          Row={true}
                        />
                      </GridItem>
                    </GridContainer>
                    <Divider />
                  </div>
                ) : (
                  <BaseNoData />
                )}
                <GridItem xs={12} sm={12} md={12}>
                  <div style={{ marginTop: "1px" }}>
                    <BaseLoadButton
                      ButtonText="Save"
                      Color="success"
                      Float="left"
                      onClick={(callback) => {
                        this.CreateAndUpdate(() => {
                          callback && callback();
                        });
                      }}
                    />
                  </div>
                </GridItem>
              </GridContainer>
            </div>
          )}
        </div>
      </div>
    );
  };

  render() {
    const { t } = this.props;
    const { Alert, isLoading } = this.state;
    const { Year, Month } = this;
    return (
      <div>
        {/* Year and month were md=1 columns: each label and select squeezed
            into ~110px, so "2026" ran into the "Сар:" label beside it. */}
        <GridContainer
          spacing={2}
          sx={{ marginTop: "10px", marginBottom: "10px" }}
        >
          <GridItem xs={12} sm={4} md={2}>
            <BaseSelect
              ChangeValue={this.ChangeValue}
              Config={{
                Name: "Year",
                Label: t("Он"),
                Type: "SingleSelect",
                Value: Year,
                Config: { IdField: "Value", TextField: "Label" },
                Data: [
                  { Label: t("2018"), Value: "2018" },
                  { Label: t("2019"), Value: "2019" },
                  { Label: t("2020"), Value: "2020" },
                  { Label: t("2021"), Value: "2021" },
                  { Label: t("2022"), Value: "2022" },
                  { Label: t("2023"), Value: "2023" },
                  { Label: t("2024"), Value: "2024" },
                  { Label: t("2025"), Value: "2025" },
                  { Label: t("2026"), Value: "2026" },
                ],
              }}
              md={6}
              Variant={"outlined"}
              FullWidth={true}
            />
          </GridItem>
          <GridItem xs={12} sm={4} md={2}>
            <BaseSelect
              ChangeValue={this.ChangeValue}
              Config={{
                Name: "Month",
                Label: t("Сар"),
                Type: "SingleSelect",
                Value: Month,
                Config: { IdField: "Value", TextField: "Label" },
                Data: [
                  { Label: t("1"), Value: "1" },
                  { Label: t("2"), Value: "2" },
                  { Label: t("3"), Value: "3" },
                  { Label: t("4"), Value: "4" },
                  { Label: t("5"), Value: "5" },
                  { Label: t("6"), Value: "6" },
                  { Label: t("7"), Value: "7" },
                  { Label: t("8"), Value: "8" },
                  { Label: t("9"), Value: "9" },
                  { Label: t("10"), Value: "10" },
                  { Label: t("11"), Value: "11" },
                  { Label: t("12"), Value: "12" },
                ],
              }}
              md={6}
              Variant={"outlined"}
              FullWidth={true}
            />
          </GridItem>
        </GridContainer>
        <Divider style={{ marginBottom: "5px" }} />
        {isLoading === false ? (
          <div>
            {Alert}
            {this.CustomRender()}
          </div>
        ) : (
          <BaseLoading />
        )}
      </div>
    );
  }
}

export default withTranslation(undefined, { withRef: true })(CVDDrugForm);
