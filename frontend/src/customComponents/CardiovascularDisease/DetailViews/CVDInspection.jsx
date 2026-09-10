import { withTranslation } from "react-i18next";
import React, { Component, createRef } from "react";
// translation
// @mui/material components
import { styled } from "@mui/material/styles";
import Divider from "@mui/material/Divider";

// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// custom components
import BaseInfo from "customComponents/BaseViewControls/BaseInfo";
// import BaseArrayInfo from "customComponents/BaseViewControls/BaseArrayInfo";
// import BaseLabel from "customComponents/BaseViewControls/BaseLabel";
import CustomTab from "customComponents/CustomTab";
import BaseLoading from "customComponents/BaseLoading";
// import CustomContainer from "customComponents/CustomContainer";
import UserDialogLink from "customComponents/DoctorProfile/UserDialogLink";
// import CalculateRisk from "customComponents/CardiovascularDisease/CalculateRisk";
// helper
import Helper from "helper";
// import CVDAnalyze from "customComponents/CardiovascularDisease/Forms/CVDAnalyze";

const styles = {};

class CVDInspection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Alert: null,
      Data: null,
      Loading: false,
      bodyColor: null,
      bodyText: null,
    };

    this.LogedUser = Helper.AuthHelper.GetLogedUserLocal();
    this.DataId = props.DataId || null;

    // refs
    this.CVDAnalyzeRef = createRef();
  }

  componentDidMount() {
    this.GetData();
  }

  GetData = async () => {
    const t = this.props.t;
    const { DataId } = this;
    this.setState({ Loading: true });
    if (DataId) {
      var SearchOption = Helper.BaseCrudHelper.GetSearchOption();
      SearchOption.SearchField = Helper.BaseCrudHelper.SetSearchField(
        "Id",
        DataId,
        SearchOption.SearchField,
        "Equals",
      );

      // MonitoringData
      await Helper.BaseCrudHelper.BaseGetDetailInfo(
        { ObjectName: "vwCVDInspection", SearchOption },
        (resData) => {
          if (resData && resData.Success && resData.Data) {
            this.setState({ Data: Object.assign({}, resData.Data) }, () =>
              this.SetRiskLevel(parseInt(resData.Data.Risk)),
            );
          }
          this.setState({ Loading: false });
        },
      );
    }
    this.setState({ Loading: false });
  };

  SetRiskLevel = (level) => {
    const { bodyColor, bodyText } = this.SetColorAndText(level);
    this.setState({ bodyColor, bodyText });
  };

  SetColorAndText = (level) => {
    switch (level) {
      case 5:
        return {
          bodyColor: "brown",
          bodyText:
            "Зүрхний шигдээс болон тархины харвалтын 10 жилийн эрсдэл 30-аас дээш хувь",
        };
      case 4:
        return {
          bodyColor: "red",
          bodyText:
            "Зүрхний шигдээс болон тархины харвалтын 10 жилийн эрсдэл 20-30 хувь",
        };
      case 3:
        return {
          bodyColor: "orange",
          bodyText:
            "Зүрхний шигдээс болон тархины харвалтын 10 жилийн эрсдэл 10-20 хувь",
        };
      case 2:
        return {
          bodyColor: "khaki",
          bodyText:
            "Зүрхний шигдээс болон тархины харвалтын 10 жилийн эрсдэл 5-10 хувь",
        };
      case 1:
        return {
          bodyColor: "green",
          bodyText:
            "Зүрхний шигдээс болон тархины харвалтын 10 жилийн эрсдэл 5-аас бага хувь",
        };
      default:
        return { bodyColor: "white", bodyText: " " };
    }
  };

  render() {
    const { Loading, Data, Alert, bodyColor, bodyText } = this.state;
    const { t } = this.props;

    if (Loading) {
      return <BaseLoading />;
    } else {
      return (
        <>
          {Data && (
            <div>
              {Alert}
              <GridContainer style={{ width: "calc(100% - 30px)" }}>
                <GridItem xs={12} sm={12} md={12}>
                  <GridContainer style={{ margin: "15px 0" }}>
                    <GridItem xs={12} sm={6} md={6}>
                      <div style={{ float: "left" }}>
                        {t("Date")}: {"\u00A0"}
                        <span style={{ fontWeight: "400" }}>
                          &nbsp;
                          {Helper.ObjectHelper.getDateYMD({
                            DateStr: Data.CreateDate,
                          })}
                        </span>
                      </div>
                    </GridItem>
                    <GridItem xs={12} sm={6} md={6}>
                      <div style={{ float: "right" }}>
                        <UserDialogLink UserId={Data.CreateUserId}>
                          {t("Doctor")}: {"\u00A0"}
                          <span style={{ fontWeight: "400" }}>
                            {Data.Users ? Data.Users.UserName : ""}
                          </span>
                        </UserDialogLink>
                      </div>
                    </GridItem>
                  </GridContainer>
                </GridItem>
                <GridItem
                  xs={12}
                  sm={12}
                  md={12}
                  style={{ marginBottom: "16px" }}
                >
                  {/* <h4 style={{ textAlign: "center", fontWeight: "500" }}>
                Зүрх судасны өвчний хяналт
              </h4> */}

                  <div style={{ marginTop: "30px" }}>
                    <div
                      style={{
                        height: "100px",
                        margin: "10px",
                        border: "1px solid " + bodyColor,
                        display: "flex",
                      }}
                    >
                      <span
                        style={{
                          backgroundColor: "" + bodyColor,
                          width: "100px",
                          height: "100px",
                          color: "#fff",
                          fontWeight: "normal",
                          fontSize: "2.2rem",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        {Data ? Data.Score : null}
                      </span>
                      <span style={{ margin: "auto" }}>{bodyText}</span>
                    </div>
                  </div>
                </GridItem>
              </GridContainer>
            </div>
          )}
        </>
      );
    }
  }
}

export default withTranslation(undefined, { withRef: true })(CVDInspection);
