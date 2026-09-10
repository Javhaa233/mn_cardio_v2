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
import CVDAnalyze from "customComponents/CardiovascularDisease/Forms/CVDAnalyze";

const styles = {};

class CVDMonitoring extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Alert: null,
      Data: null,
      CVDHistoryData: null,
      CVDBodySizeData: null,
      CVDRiskData: null,
      Loading: false,
      CVDHistoryLoading: false,
      CVDBodySizeLoading: false,
      CVDRiskLoading: false,
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
    this.setState({
      Loading: true,
      CVDHistoryLoading: true,
      CVDBodySizeLoading: true,
      CVDRiskLoading: true,
    });
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
        { ObjectName: "CVDMonitoring", SearchOption },
        (resData) => {
          if (resData && resData.Success && resData.Data) {
            this.setState({ Data: Object.assign({}, resData.Data) });
          }
          this.setState({ Loading: false });
        },
      );

      // CVDHistory Data
      await Helper.BaseCrudHelper.CallService(
        "/CVDMonitoring/GetLastHistoryData",
        { MonitoringId: DataId },
        (resData) => {
          if (resData && resData.Success) {
            this.setState({
              CVDHistoryData: Object.assign({}, resData.Data),
              CVDHistoryLoading: false,
            });
          }
        },
      );
      // CVDBodySize Data
      await Helper.BaseCrudHelper.CallService(
        "/CVDMonitoring/GetLastBodySizeData",
        { MonitoringId: DataId },
        (resData) => {
          if (resData && resData.Success) {
            this.setState({
              CVDBodySizeData: Object.assign({}, resData.Data),
              CVDBodySizeLoading: false,
            });
          }
        },
      );

      // CVDRisk Data
      await Helper.BaseCrudHelper.CallService(
        "/CVDMonitoring/GetLastRiskData",
        { MonitoringId: DataId },
        (resData) => {
          if (resData && resData.Success && resData.Data) {
            this.setState(
              {
                CVDRiskData: Object.assign({}, resData.Data),
                CVDRiskLoading: false,
              },
              () => this.SetRiskLevel(parseInt(resData.Data.Risk)),
            );
          }
        },
      );
    } else {
      this.setState({ Loading: false });
    }
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

  GetTabs = () => {
    const {
      CVDHistoryData,
      CVDBodySizeData,
      CVDHistoryLoading,
      CVDBodySizeLoading,
    } = this.state;

    var Tabs = [];
    // History
    if (!CVDHistoryLoading && CVDHistoryData) {
      Tabs.push({
        tabButton: "1. ЗСӨ-ний түүх",
        tabContent: (
          <div style={{ margin: "0 0px" }}>
            <BaseInfo
              Label="1. ЧШ-ийн нефропати-г оролцуулаад бөөрний архаг өвчтэй эсэх"
              Value={
                CVDHistoryData.BuurniiArhagUwchinObj
                  ? CVDHistoryData.BuurniiArhagUwchinObj.Label
                  : ""
              }
              md={8}
              Left={true}
            />
            <Divider variant="middle" />
            <BaseInfo
              Label="2. Батлагдсан эсвэл нийт холестрин өндөртэй эсэх"
              Value={
                CVDHistoryData.HolestrinObj
                  ? CVDHistoryData.HolestrinObj.Label
                  : ""
              }
              md={8}
              Left={true}
            />
            <Divider variant="middle" />
            <BaseInfo
              Label="3. Батлагдсан ЧШ эсвэл цусны сахар өндөртэй эсэх"
              Value={
                CVDHistoryData.TsusniiSaharObj
                  ? CVDHistoryData.TsusniiSaharObj.Label
                  : ""
              }
              md={8}
              Left={true}
            />
            <Divider variant="middle" />
            <BaseInfo
              Label="4. Өмнө нь зүрхний шигдээс болж байсан эсэх"
              Value={
                CVDHistoryData.ZurkhShigdeesObj
                  ? CVDHistoryData.ZurkhShigdeesObj.Label
                  : ""
              }
              md={8}
              Left={true}
            />
            <Divider variant="middle" />
            <BaseInfo
              Label="5. Өмнө нь тархины харвалт болж байсан эсэх"
              Value={
                CVDHistoryData.TarkhiHarvaltObj
                  ? CVDHistoryData.TarkhiHarvaltObj.Label
                  : ""
              }
              md={8}
              Left={true}
            />
            <Divider variant="middle" />
            <BaseInfo
              Label="6. Стенокарди/ цээжний бахтай байсан эсэх"
              Value={
                CVDHistoryData.StenokardiObj
                  ? CVDHistoryData.StenokardiObj.Label
                  : ""
              }
              md={8}
              Left={true}
            />
            <Divider variant="middle" />
            <BaseInfo
              Label="7. Тархины цус хомсрох түр зуурын дайрлага болж байсан эсэх"
              Value={
                CVDHistoryData.TsusHomsrohObj
                  ? CVDHistoryData.TsusHomsrohObj.Label
                  : ""
              }
              md={8}
              Left={true}
            />
            <Divider variant="middle" />
            <BaseInfo
              Label="8. Захын судасны өвчтэй эсэх"
              Value={
                CVDHistoryData.ZahiinSudasObj
                  ? CVDHistoryData.ZahiinSudasObj.Label
                  : ""
              }
              md={8}
              Left={true}
            />
            <Divider variant="middle" />
            <BaseInfo
              Label="9. Гэр бүлд ЗСӨ-ний цаг бусын (эм>65, эр >55) нас баралтын түүх байсан эсэх"
              Value={
                CVDHistoryData.GerbulNasbaraltObj
                  ? CVDHistoryData.GerbulNasbaraltObj.Label
                  : ""
              }
              md={8}
              Left={true}
            />
            <Divider variant="middle" />
            <BaseInfo
              Label="10. Тамхи хэрэглэж байгаа эсэх /тамхинаас гараад 12 сар болоогүй бол татдаг гэж тооцно/"
              Value={
                CVDHistoryData.TamkhiTatdagObj
                  ? CVDHistoryData.TamkhiTatdagObj.Label
                  : ""
              }
              md={8}
              Left={true}
            />
          </div>
        ),
      });
    } else {
      Tabs.push({
        tabButton: "1. ЗСӨ-ний түүх",
        tabContent: <BaseLoading />,
      });
    }
    // Body size
    if (!CVDBodySizeLoading && CVDBodySizeData) {
      Tabs.push({
        tabButton: "2. Биеийн хэмжээс",
        tabContent: (
          <div>
            <BaseInfo Label="Өндөр" Value={CVDBodySizeData.Height} md={4} />
            <Divider variant="middle" />
            <BaseInfo Label="Жин" Value={CVDBodySizeData.Weigth} md={4} />
            <Divider variant="middle" />
            <BaseInfo
              Label="Бүсэлхийн тойргийн хэмжээ /см/"
              Value={CVDBodySizeData.Buselkhii}
              md={4}
            />
            <Divider variant="middle" />
            <BaseInfo Label="БЖИ (кг/м2)" Value={CVDBodySizeData.BJI} md={4} />
            <Divider variant="middle" />
            <BaseInfo Label="Тайлбар" Value={CVDBodySizeData.Tailbar} md={4} />
            <Divider variant="middle" />
            <BaseInfo
              Label="ЗЦТ (удаа/мин)"
              Value={CVDBodySizeData.HeartRate}
              md={4}
            />
            <Divider variant="middle" />
            <BaseInfo
              Label="Амьсгалын тоо"
              Value={CVDBodySizeData.RespiratoryRate}
              md={4}
            />
            <Divider variant="middle" />
            <BaseInfo
              Label="Температур"
              Value={CVDBodySizeData.Temperature}
              md={4}
            />
            <Divider variant="middle" />
            <BaseInfo
              Label="Сатураци"
              Value={CVDBodySizeData.Saturatsi}
              md={4}
            />
            <Divider variant="middle" />
            <BaseInfo
              Label="Холестерин mmol/m"
              Value={CVDBodySizeData.Cholesterol}
              md={4}
            />
            <Divider variant="middle" />
            <BaseInfo
              Label="Даралт (систол) (мм.муб)"
              Value={CVDBodySizeData.DaraltDeed}
              md={4}
            />
            <Divider variant="middle" />
            <BaseInfo
              Label="Даралт (диастол) (мм.муб)"
              Value={CVDBodySizeData.DaraltDood}
              md={4}
            />
            <Divider variant="middle" />
            <BaseInfo
              Label="Өлөн үеийн цусны глюкозын хэмжээ"
              Value={CVDBodySizeData.UlunGlucose}
              md={4}
            />
            <Divider variant="middle" />
            <BaseInfo
              Label="Санамсаргүй үеийн цусны глюкозын хэмжээ"
              Value={CVDBodySizeData.SanamsarguiGlucose}
              md={4}
            />
          </div>
        ),
      });
    } else {
      Tabs.push({
        tabButton: "2. Биеийн хэмжээс",
        tabContent: <BaseLoading />,
      });
    }

    Tabs.push({
      tabButton: "3. Анализ",
      tabContent: (
        <CVDAnalyze
          ref={(ref) => (this.CVDAnalyzeRef = ref)}
          Id="HistoryChart"
          MonitoringId={this.DataId}
        />
      ),
    });

    return Tabs;
  };

  render() {
    const { Loading, Data, CVDRiskData, Alert, bodyColor, bodyText } =
      this.state;
    const { t } = this.props;

    if (Loading) {
      return <BaseLoading />;
    } else {
      return (
        <>
          {Data && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              {Alert}
              <GridContainer
                style={{ width: "calc(100% - 30px)", flex: "0 0 auto" }}
              >
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

                  <div style={{ marginTop: "0px" }}>
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
                          color: "black",
                          fontWeight: "normal",
                          fontSize: "2.2rem",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        {CVDRiskData ? CVDRiskData.Score : null}
                      </span>
                      <span style={{ margin: "auto", color: "black" }}>
                        {bodyText}
                      </span>
                    </div>
                  </div>
                </GridItem>
              </GridContainer>
              <GridContainer
                style={{
                  margin: "0",
                  width: "100%",
                  flex: "1 1 auto",
                  minHeight: 0,
                }}
              >
                <GridItem xs={12} sm={12} md={12} style={{ height: "100%" }}>
                  <CustomTab
                    vertical
                    shortVertical
                    fillHeight
                    tabs={this.GetTabs()}
                  />
                </GridItem>
              </GridContainer>
            </div>
          )}
        </>
      );
    }
  }
}

export default withTranslation(undefined, { withRef: true })(CVDMonitoring);
