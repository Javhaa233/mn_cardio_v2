import { withTranslation } from "react-i18next";
import React, { Component } from "react";
// translation
// @mui/material components
import Box from "@mui/material/Box";
// default components
import GridContainer from "components/Grid/GridContainer";
// import BaseRadio from "customComponents/BaseEditControls/BaseRadio";
import GridItem from "components/Grid/GridItem";
import BaseLoadButton from "customComponents/BaseLoadButton";
import BaseLoading from "customComponents/BaseLoading";
// import HunAmAddrSelect from "customComponents/CardiovascularDisease/Forms/HunAmAddrSelect";
// import HunAmYearSelect from "customComponents/CardiovascularDisease/Forms/HunAmYearSelect";

import CustomTextField from "customComponents/CardiovascularDisease/Forms/CustomTextField";
// helper
import Helper from "helper";

const selectSx = { width: "fit-content" };

const rowSx = {
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "flex-start",
  gap: "10px",
  marginTop: "20px",
};

const tableSx = {
  width: "50%",
  borderCollapse: "separate",
  borderSpacing: "0 3px", // space between rows

  "& th": {
    textAlign: "center",
    fontWeight: "600",
    color: "#444",
    paddingBottom: "4px",
  },

  "& td": {
    padding: "1px 10px",
    verticalAlign: "middle",
  },

  /* First column (labels) */
  "& td:first-of-type": {
    backgroundColor: "#f4fbff",
    color: "#333",
    fontWeight: "500",
    borderRadius: "4px 0 0 4px",
    width: "240px",
  },

  /* Value columns */
  "& td:nth-of-type(2), & td:nth-of-type(3)": {
    backgroundColor: "#fff",
    border: "1px solid #e0e0e0",
    borderLeft: "none",
    borderRadius: "0 4px 4px 0",
  },

  /* Input inside table */
  "& input": {
    textAlign: "right",
  },
};

class CVDHunAmForm extends Component {
  constructor(props) {
    super(props);
    const { t } = this.props;
    this.state = { Alert: null, Loading: false, EditObject: null };
    this.ProvCityName = null;
    this.SoumDistName = null;
    this.BagKhorooName = null;
    this.ModifyObject = {
      Year: new Date().getFullYear() + "",
      Type: null,
      ProvinceCityId: null,
      SoumDistrictId: null,
      BagKhorooId: null,
      Er0to17Age: 0,
      Em0to17Age: 0,
      Er18to39Age: 0,
      Em18to39Age: 0,
      Er40upAge: 0,
      Em40upAge: 0,
    };
    this.Fields = [
      {
        Name: "Type",
        Config: { IdField: "Value", TextField: "Label" },
        Data: [
          { Label: t("Сумын эмнэлэг"), Value: "soum" },
          { Label: t("Баг/Хорооны эмнэлэг"), Value: "bag_khoroo" },
        ],
      },
      {
        Name: "Year",
        Label: t("Он"),
        Data: [
          "2018",
          "2019",
          "2020",
          "2021",
          "2022",
          "2023",
          "2024",
          "2025",
          "2026",
        ],
      },
      { Name: "ProvinceCityId", Label: t("Province/city") },
      { Name: "SoumDistrictId", Label: t("Soum/district") },
      { Name: "BagKhorooId", Label: t("Bag/khoroo") },
    ];
    this.LogedUser = Helper.AuthHelper.GetLogedUserLocal();
    this.Year = new Date().getFullYear() + "";

    this.Organization = this.LogedUser.Doctor
      ? this.LogedUser.Doctor.Organization
      : null;
  }

  componentDidMount = () => {
    // this.GetProvinceData({
    //   ObjectName: "DictProvinceCity",
    //   Option: { Field: "name", Type: "NotEquals", Value: "" },
    // });
    this.GetData();
    this.GetOrganization();
  };

  GetData = async () => {
    const { Organization } = this;
    if (Organization && Organization.Id) {
      await Helper.BaseCrudHelper.CallService(
        "/CVDHunAm/GetData",
        { OrganizationId: Organization.Id, Year: this.Year },
        (resData) => {
          if (resData && resData.Data) {
            const loadedData = Object.assign({}, resData.Data);
            // Merge loaded data into ModifyObject to preserve existing values on save
            this.ModifyObject = {
              ...this.ModifyObject,
              Er0to17Age: loadedData.Er0to17Age ?? 0,
              Em0to17Age: loadedData.Em0to17Age ?? 0,
              Er18to39Age: loadedData.Er18to39Age ?? 0,
              Em18to39Age: loadedData.Em18to39Age ?? 0,
              Er40upAge: loadedData.Er40upAge ?? 0,
              Em40upAge: loadedData.Em40upAge ?? 0,
            };
            this.setState({ EditObject: loadedData });
          }
        },
      );
    }
  };

  GetOrganization = () => {
    const { Organization } = this;
    this.ProvCityName = Organization ? Organization.ProvCityName : null;
    this.SoumDistName = Organization ? Organization.SoumDistName : null;
    this.BagKhorooName = Organization ? Organization.BagKhorooName : null;

    // Change ModifyObject
    this.ModifyObject["OrganizationId"] = Organization ? Organization.Id : null;
    this.ModifyObject["ProvinceCityId"] = Organization
      ? Organization.addr_prov_city
      : null;
    this.ModifyObject["SoumDistrictId"] = Organization
      ? Organization.addr_soum_dist
      : null;
    this.ModifyObject["BagKhorooId"] = Organization
      ? Organization.addr_bag_khoroo
      : null;
  };

  GetConfigField = (FieldName) => {
    var Field = Helper.BaseCrudHelper.GetConfigField(FieldName, this.Fields);
    return Field;
  };

  CreateAndUpdate = async (callback) => {
    const { Organization } = this;

    let alert = null;
    if (Organization && Organization.Id) {
      if (Object.keys(this.ModifyObject).length > 0) {
        await Helper.BaseCrudHelper.CallService(
          "/CVDHunAm/CreateAndUpdate",
          { Data: JSON.stringify(this.ModifyObject) },
          (resData) => {
            if (resData) {
              const alert = Helper.BaseCrudHelper.ShowAlert(
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

  ChangeValue = (Field, Value) => {
    this.ModifyObject[Field] = Value;
    process.env.NODE_ENV === "development" &&
      console.log({ ModifyObject: this.ModifyObject });
    this.ChangeValueAfter(Field, Value);
  };

  ChangeValueAfter = (Field, Value) => {
    if (Field === "ProvinceCityId") {
      this.GetProvinceData({
        ObjectName: "DictSoumDistrict",
        Option: { Field: "id_province", Type: "Equals", Value },
      });
      this.ModifyObject["SoumDistrictId"] = null;
      this.ModifyObject["BagKhorooId"] = null;
    }
    if (Field === "SoumDistrictId") {
      this.GetProvinceData({
        ObjectName: "DictBagKhoroo",
        Option: { Field: "id_soum", Type: "Equals", Value },
      });
      this.ModifyObject["BagKhorooId"] = null;
    }

    // IsSum
    if (Field === "Type") {
      var IsSum = Value === "soum" ? true : false;
      this.GetProvinceData({
        ObjectName: "DictProvinceCity",
        Option: { Field: "name", Type: "NotEquals", Value: "" },
      });
      this.setState({ TypeValue: Value, IsSum, Checked: false });
    }

    // Checked
    if (this.state.IsSum) {
      if (this.ModifyObject["SoumDistrictId"]) this.setState({ Checked: true });
      else this.setState({ Checked: false });
    } else if (this.ModifyObject["BagKhorooId"])
      this.setState({ Checked: true });
    else this.setState({ Checked: false });
  };

  // Get addr data
  // GetProvinceData = async ({ ObjectName, Option }) => {
  //   const ReqData = {
  //     ObjectName,
  //     Option,
  //   };
  // await Helper.BaseCrudHelper.CallServiceWithoutToken(
  //     "UserRequest/GetProvinceData",
  //     ReqData,
  //     (resData) => {
  //       if (Data.Success) {
  //         if (ObjectName === "DictProvinceCity") {
  //           this.SelectRef1 && this.SelectRef1.setState({ Data: resData.Data });
  //         } else if (ObjectName === "DictSoumDistrict") {
  //           this.SelectRef2 && this.SelectRef2.setState({ Data: resData.Data });
  //           this.SelectRef3 && this.SelectRef3.setState({ Data: [] });
  //         } else if (ObjectName === "DictBagKhoroo") {
  //           this.SelectRef3 && this.SelectRef3.setState({ Data: resData.Data });
  //         }
  //       }
  //     }
  //   );
  // };

  render() {
    const { t } = this.props;
    const { Alert, EditObject, Loading } = this.state;
    const { ChangeValue } = this;

    return (
      <div>
        {Alert}
        <GridContainer style={{ minWidth: "500px" }}>
          <GridItem xs={12} md={12}>
            {Loading ? (
              <div style={{ height: "90px" }}>
                <BaseLoading />
              </div>
            ) : (
              <div style={{ margin: "0 10px" }}>
                <GridContainer>
                  <GridItem xs={12} sm={12} md={8}>
                    <Box sx={rowSx}>
                      <Box sx={selectSx}>
                        {t("Year")}:{" "}
                        <span style={{ fontWeight: "bold" }}>{this.Year}</span>
                        {/* <HunAmYearSelect
                          ChangeValue={ChangeValue}
                          Config={GetConfigField("Year")}
                        /> */}
                      </Box>
                      <Box sx={selectSx}>
                        {t("Province/City")}:{" "}
                        <span style={{ fontWeight: "bold" }}>
                          {this.ProvCityName}
                        </span>
                        {/* <HunAmAddrSelect
                          ChangeValue={ChangeValue}
                          Config={GetConfigField("ProvinceCityId")}
                          ref={(ref) => {
                            this.SelectRef1 = ref;
                          }}
                        /> */}
                      </Box>
                      <Box sx={selectSx}>
                        {t("Soum/district")}:{" "}
                        <span style={{ fontWeight: "bold" }}>
                          {this.SoumDistName}
                        </span>
                        {/* <HunAmAddrSelect
                          ChangeValue={ChangeValue}
                          Config={GetConfigField("SoumDistrictId")}
                          ref={(ref) => (this.SelectRef2 = ref)}
                        /> */}
                      </Box>
                      <Box sx={selectSx}>
                        {t("Bag/khoroo")}:{" "}
                        <span style={{ fontWeight: "bold" }}>
                          {this.BagKhorooName}
                        </span>
                        {/* <HunAmAddrSelect
                            ChangeValue={ChangeValue}
                            Config={GetConfigField("BagKhorooId")}
                            ref={(ref) => (this.SelectRef3 = ref)}
                          /> */}
                      </Box>
                    </Box>
                  </GridItem>
                  <GridItem xs={12} sm={12} md={12}>
                    <Box sx={{ marginTop: "15px" }}>
                      <Box component="table" sx={tableSx}>
                        <thead>
                          <tr>
                            <th>Нас</th>
                            <th>Эр</th>
                            <th>Эм</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>0-17 нас</td>
                            <td>
                              <CustomTextField
                                Type={"number"}
                                Value={EditObject ? EditObject.Er0to17Age : 0}
                                Field="Er0to17Age"
                                ChangeValue={ChangeValue}
                                Style={{ width: "100%" }}
                              />
                            </td>
                            <td>
                              <CustomTextField
                                Type={"number"}
                                Value={EditObject ? EditObject.Em0to17Age : 0}
                                Field="Em0to17Age"
                                ChangeValue={ChangeValue}
                                Style={{ width: "100%" }}
                              />
                            </td>
                          </tr>
                          <tr>
                            <td>18-39 нас</td>
                            <td>
                              <CustomTextField
                                Type={"number"}
                                Value={EditObject ? EditObject.Er18to39Age : 0}
                                Field="Er18to39Age"
                                ChangeValue={ChangeValue}
                                Style={{ width: "100%" }}
                              />
                            </td>
                            <td>
                              <CustomTextField
                                Type={"number"}
                                Value={EditObject ? EditObject.Em18to39Age : 0}
                                Field="Em18to39Age"
                                ChangeValue={ChangeValue}
                                Style={{ width: "100%" }}
                              />
                            </td>
                          </tr>
                          <tr>
                            <td>40-дээш нас</td>
                            <td>
                              <CustomTextField
                                Type={"number"}
                                Value={EditObject ? EditObject.Er40upAge : 0}
                                Field="Er40upAge"
                                ChangeValue={ChangeValue}
                                Style={{ width: "100%" }}
                              />
                            </td>
                            <td>
                              <CustomTextField
                                Type={"number"}
                                Value={EditObject ? EditObject.Em40upAge : 0}
                                Field="Em40upAge"
                                ChangeValue={ChangeValue}
                                Style={{ width: "100%" }}
                              />
                            </td>
                          </tr>
                        </tbody>
                      </Box>
                      <div style={{ marginTop: "20px" }}>
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
                    </Box>
                  </GridItem>
                </GridContainer>
              </div>
            )}
          </GridItem>
        </GridContainer>
      </div>
    );
  }
}

export default withTranslation(undefined, { withRef: true })(CVDHunAmForm);
