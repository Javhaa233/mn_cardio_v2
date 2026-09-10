import { withTranslation } from "react-i18next";
import React, { Component } from "react";
// translation
// @mui/material components
import { Box } from "@mui/material";
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
import GroupPanel from "customComponents/GroupPanel";
// helper
import Helper from "helper";

const sxStyles = {};

class HfStay extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Alert: null,
      Data: {},
      LifeStoryData: null,
      LabTreatmentData: null,
      TreatmentDischargeData: null,
      HfStayLoading: false,
      HfLifeStoryLoading: false,
      HfLabTreatmentLoading: false,
      HfTreatmentDischargeLoading: false,
    };
    this.LogedUser = Helper.AuthHelper.GetLogedUserLocal();
    this.DataId = props.DataId || null;
  }

  componentDidMount() {
    this.GetData();
  }

  GetData = async () => {
    const t = this.props.t;
    const { DataId } = this;
    this.setState({
      HfStayLoading: true,
      HfLifeStoryLoading: true,
      HfLabTreatmentLoading: true,
      HfTreatmentDischargeLoading: true,
    });
    if (DataId) {
      var SearchOption = Helper.BaseCrudHelper.GetSearchOption();
      SearchOption.SearchField = Helper.BaseCrudHelper.SetSearchField(
        "Id",
        DataId,
        SearchOption.SearchField,
        "Equals",
      );
      // Sub SearchOption
      var SubSearchOption = Helper.BaseCrudHelper.GetSearchOption();
      SubSearchOption.SearchField = Helper.BaseCrudHelper.SetSearchField(
        "HfStayId",
        DataId,
        SubSearchOption.SearchField,
        "Equals",
      );
      await Helper.BaseCrudHelper.BaseGetDetailInfo(
        { ObjectName: "HfStay", SearchOption },
        (resData) => {
          if (resData && resData.Success && resData.Data) {
            this.setState({ Data: Object.assign({}, resData.Data) });
          }
          this.setState({ HfStayLoading: false });
        },
      );
      // Life Story Data
      await Helper.BaseCrudHelper.BaseGetDetailInfo(
        { ObjectName: "HfLifeStory", SearchOption: SubSearchOption },
        (resData) => {
          if (resData && resData.Success && resData.Data) {
            this.setState({ LifeStoryData: Object.assign({}, resData.Data) });
          }
          this.setState({ HfLifeStoryLoading: false });
        },
      );
      // Lab Treatment Data
      await Helper.BaseCrudHelper.BaseGetDetailInfo(
        { ObjectName: "HfLabTreatment", SearchOption: SubSearchOption },
        (resData) => {
          if (resData && resData.Success && resData.Data) {
            this.setState({
              LabTreatmentData: Object.assign({}, resData.Data),
            });
          }
          this.setState({ HfLabTreatmentLoading: false });
        },
      );
      // Treatment Discharge Data
      await Helper.BaseCrudHelper.BaseGetDetailInfo(
        { ObjectName: "HfTreatmentDischarge", SearchOption },
        (resData) => {
          if (resData && resData.Success && resData.Data) {
            this.setState({
              TreatmentDischargeData: Object.assign({}, resData.Data),
            });
          }
          this.setState({ HfTreatmentDischargeLoading: false });
        },
      );
    } else {
      this.setState({ HfStayLoading: false });
    }
  };

  Print = async (callback) => {
    const { DataId } = this;
    let alert = null;
    if (DataId) {
      await Helper.BaseCrudHelper.BasePrintReport(
        {
          Url: "/HfStay/PrintReport",
          Data: { Id: DataId },
          FileName: "HeartFailure.pdf",
        },
        (Success) => {
          alert = Helper.BaseCrudHelper.ShowAlert(
            Success ? "Successfully printed" : "Error",
            Success,
            () => {
              this.setState({ Alert: null });
              callback && callback();
            },
          );
          this.setState({ Alert: alert });
        },
      );
    } else {
      alert = Helper.BaseCrudHelper.ShowAlert("No data saved", false, () => {
        this.setState({ Alert: null });
        callback && callback();
      });
      this.setState({ Alert: alert });
    }
  };

  GetTabs = () => {
    const {
      Data,
      LifeStoryData,
      LabTreatmentData,
      TreatmentDischargeData,
      HfStayLoading,
      HfLifeStoryLoading,
      HfLabTreatmentLoading,
      HfTreatmentDischargeLoading,
    } = this.state;
    var Tabs = [];
    if (!HfStayLoading) {
      if (Data) {
        Tabs.push({
          tabButton: "General information",
          tabContent: (
            <div>
              <GroupPanel title="Эмнэлэгт хэвтэх үеийн мэдээлэл" level={1}>
                <BaseInfo
                  Label="Хэвтсэн огноо"
                  Value={Data.StartedDate}
                  md={4}
                />
                <BaseInfo
                  Label="Зүрхний дутагдал оншлогдсон огноо"
                  Value={Data.DiagnosedDate}
                  md={4}
                />
                <BaseInfo
                  Label="Эмнэлэгт хэвтсэн шалтгаан / Давтан үзүүлсэн шалтгаан"
                  Value={
                    Data.StayReasonObj ? Data.StayReasonObj.Label : "Unknown"
                  }
                  md={4}
                />
                <BaseInfo
                  Label="Зүрхний дутагдал оншлогдоод хэр хугацаа өнгөрсөн"
                  Value={
                    Data.DurationOfHfObj
                      ? Data.DurationOfHfObj.Label
                      : "Unknown"
                  }
                  md={4}
                />
              </GroupPanel>
              <GroupPanel title="Иргэнд өгөх мэдээлэл" level={1}>
                <BaseInfo
                  Label="Зүрхний дутагдлын тухай мэдээлэл өгсөн"
                  Value={
                    Data.IsGivenInfoObj ? Data.IsGivenInfoObj.Label : "Unknown"
                  }
                  md={4}
                />
                <BaseInfo
                  Label="Иргэн өр гэрт өгсөн"
                  Value={
                    Data.IsFamilyGivenInfoObj
                      ? Data.IsFamilyGivenInfoObj.Label
                      : "Unknown"
                  }
                  md={4}
                />
                <BaseInfo
                  Label="Өвчний тавилан, өвчний явцын тухай мэдээлэл өгсөн"
                  Value={
                    Data.IsGivenDestinyInfoObj
                      ? Data.IsGivenDestinyInfoObj.Label
                      : "Unknown"
                  }
                  md={4}
                />
                <BaseInfo
                  Label="Хөнгөвчлөх эмчилгээ шаардлагатай юу?"
                  Value={
                    Data.IsNeededPalliativeObj
                      ? Data.IsNeededPalliativeObj.Label
                      : "Unknown"
                  }
                  md={4}
                />
                <BaseInfo
                  Label="Иргэний хөнгөвчлөх эмчилгээний төрөл"
                  Value={
                    Data.PalliativeTypeObj
                      ? Data.PalliativeTypeObj.Label
                      : "Unknown"
                  }
                  md={4}
                />
              </GroupPanel>
              <GroupPanel title="Цаашид хянах төлөвлөгөө" level={1}>
                <BaseInfo
                  Label="Эмнэлэгээс гарсан хугацаа"
                  Value={Data.OutDate}
                  md={4}
                />
                <BaseInfo
                  Label="Эмнэлгээс гарах үеийн биеийн байдал"
                  Value={Data.OutConditionObj ? Data.OutConditionObj.Label : ""}
                  md={4}
                />
                <BaseInfo
                  Label="Асран хамгаалагчид мэдээлэлд хамрагдсан эсэх"
                  Value={
                    Data.IsGuardianGivenInfoObj
                      ? Data.IsGuardianGivenInfoObj.Label
                      : ""
                  }
                  md={4}
                />
                <BaseInfo
                  Label="Хяналтанд байх эмнэлгийн шатлал"
                  Value={
                    Data.MonitoringLevelObj
                      ? Data.MonitoringLevelObj.Label
                      : "Unknown"
                  }
                  md={4}
                />
                <BaseInfo
                  Label="Зүрхний дутагдлын амбулаторид хянах шаардлагатай"
                  Value={
                    Data.IsMonitoringAmbulatoryObj
                      ? Data.IsMonitoringAmbulatoryObj.Label
                      : ""
                  }
                  md={4}
                />
              </GroupPanel>
            </div>
          ),
        });
      }
    } else {
      Tabs.push({
        tabButton: "General information",
        tabContent: <BaseLoading />,
      });
    }

    if (!HfLifeStoryLoading) {
      if (LifeStoryData) {
        Tabs.push({
          tabButton: "Амьдралын хэв маяг",
          tabContent: (
            <div>
              <GroupPanel title="Амьдралын хэв маяг, амьдралын чанар" level={1}>
                <BaseInfo
                  Label="Иргэний амьдралын хэв маяг ба амьдралын чанарын хэсгийн асуултуудыг асуусан уу?"
                  Value={
                    LifeStoryData && LifeStoryData.AskedLifeObj
                      ? LifeStoryData.AskedLifeObj.Label
                      : ""
                  }
                  md={4}
                />
                <BaseInfo
                  Label="Гэрлэлт"
                  Value={
                    LifeStoryData && LifeStoryData.MarriageObj
                      ? LifeStoryData.MarriageObj.Label
                      : "Unknown"
                  }
                  md={4}
                />
                <BaseInfo
                  Label="Ажлын нөхцөл"
                  Value={
                    LifeStoryData && LifeStoryData.WorkConditionObj
                      ? LifeStoryData.WorkConditionObj.Label
                      : ""
                  }
                  md={4}
                />
                <BaseInfo
                  Label="Хөдөлгөөн засал эмчилгээнд хамрагдсан байдал"
                  Value={
                    LifeStoryData && LifeStoryData.PhysicalTherapyObj
                      ? LifeStoryData.PhysicalTherapyObj.Label
                      : "Unknown"
                  }
                  md={4}
                />
                <BaseInfo
                  Label="Зүрхний дутагдлын боловсрол олгох сургалтын хөтөлбөр"
                  Value={
                    LifeStoryData && LifeStoryData.HfEducationObj
                      ? LifeStoryData.HfEducationObj.Label
                      : "Unknown"
                  }
                  md={4}
                />
                <BaseInfo
                  Label="Тамхи татах зуршил"
                  Value={
                    LifeStoryData && LifeStoryData.SmokingObj
                      ? LifeStoryData.SmokingObj.Label
                      : "Unknown"
                  }
                  md={4}
                />
                <BaseInfo
                  Label="Архи, Та долоо хоногт хэдэн удаа стандарт уулт ууж байна вэ?"
                  Value={
                    LifeStoryData && LifeStoryData.DrinkingWeeklyObj
                      ? LifeStoryData.DrinkingWeeklyObj.Label
                      : "Unknown"
                  }
                  md={4}
                />
                <BaseInfo
                  Label="Архи, Та хэр давтамжтай стандарт уулт уудаг вэ? (Эмэгтэй бол 4 стандарт уулт, эрэгтэй бол 5 стандарт уулт)"
                  Value={
                    LifeStoryData && LifeStoryData.DrinkingLoopObj
                      ? LifeStoryData.DrinkingLoopObj.Label
                      : "Unknown"
                  }
                  md={4}
                />
                <BaseInfo
                  Label="Ядрах"
                  Value={
                    LifeStoryData && LifeStoryData.FatigueObj
                      ? LifeStoryData.FatigueObj.Label
                      : "Unknown"
                  }
                  md={4}
                />
                <BaseInfo
                  Label="Амьсгаадах"
                  Value={
                    LifeStoryData && LifeStoryData.DyspneaObj
                      ? LifeStoryData.DyspneaObj.Label
                      : "Unknown"
                  }
                  md={4}
                />
                <BaseInfo
                  Label="Хөдөлгөөний идэвхи"
                  Value={
                    LifeStoryData && LifeStoryData.PhysicalActivityObj
                      ? LifeStoryData.PhysicalActivityObj.Label
                      : "Unknown"
                  }
                  md={4}
                />
                <BaseInfo
                  Label="Өөрөө өөртөө үйлчлэх"
                  Value={
                    LifeStoryData && LifeStoryData.SelfServiceObj
                      ? LifeStoryData.SelfServiceObj.Label
                      : "Unknown"
                  }
                  md={4}
                />
                <BaseInfo
                  Label="Өдөр тутмын амьдралын идэвхи"
                  Value={
                    LifeStoryData && LifeStoryData.DailyActivityObj
                      ? LifeStoryData.DailyActivityObj.Label
                      : "Unknown"
                  }
                  md={4}
                />
                <BaseInfo
                  Label="Өвдөлт, тааламжгүй байдал"
                  Value={
                    LifeStoryData && LifeStoryData.PainDiscomfortObj
                      ? LifeStoryData.PainDiscomfortObj.Label
                      : "Unknown"
                  }
                  md={4}
                />
                <BaseInfo
                  Label="Сэтгэл түгжилт, сэтгэл гутрал"
                  Value={
                    LifeStoryData && LifeStoryData.AnxietyObj
                      ? LifeStoryData.AnxietyObj.Label
                      : "Unknown"
                  }
                  md={4}
                />
                <BaseInfo
                  Label="Амьдралын чанар"
                  Value={LifeStoryData ? LifeStoryData.LifeQuality : ""}
                  md={4}
                />
              </GroupPanel>
              <GroupPanel title="Өвчний түүх" level={1}>
                <BaseInfo
                  Label="Өмнө нь зүрхний шигдээсээр өвдсөн"
                  Value={
                    LifeStoryData && LifeStoryData.hist_hfObj
                      ? LifeStoryData.hist_hfObj.Label
                      : "Unknown"
                  }
                  md={4}
                />
                <BaseInfo
                  Label="Титэм судасны цусан хангамж сэргээх"
                  Value={
                    LifeStoryData && LifeStoryData.hist_revascObj
                      ? LifeStoryData.hist_revascObj.Label
                      : "Unknown"
                  }
                  md={4}
                />
                <BaseInfo
                  Label="Артерийн гипертензи"
                  Value={
                    LifeStoryData && LifeStoryData.hist_hypertensionObj
                      ? LifeStoryData.hist_hypertensionObj.Label
                      : "Unknown"
                  }
                  md={4}
                />
                <BaseInfo
                  Label="Тосгуурын жирвэгнээ / чичиргээ"
                  Value={
                    LifeStoryData && LifeStoryData.hist_attrfibObj
                      ? LifeStoryData.hist_attrfibObj.Label
                      : "Unknown"
                  }
                  md={4}
                />
                <BaseInfo
                  Label="Чихрийн шижин"
                  Value={
                    LifeStoryData && LifeStoryData.hist_diabetesObj
                      ? LifeStoryData.hist_diabetesObj.Label
                      : "Unknown"
                  }
                  md={4}
                />
                <BaseInfo
                  Label="Уушгины архаг бөглөрөлтөт өвчин"
                  Value={
                    LifeStoryData && LifeStoryData.hist_copdObj
                      ? LifeStoryData.hist_copdObj.Label
                      : "Unknown"
                  }
                  md={4}
                />
                <BaseInfo
                  Label="Зүрхний хавхлагын өвчин"
                  Value={
                    LifeStoryData && LifeStoryData.hist_valvediseaseObj
                      ? LifeStoryData.hist_valvediseaseObj.Label
                      : "Unknown"
                  }
                  md={4}
                />
                <BaseInfo
                  Label="Зүрхний хавхлагын мэс засал"
                  Value={
                    LifeStoryData && LifeStoryData.hist_valvesurgeryObj
                      ? LifeStoryData.hist_valvesurgeryObj.Label
                      : "Unknown"
                  }
                  md={4}
                />
                <BaseInfo
                  Label="Тэлэгдлийн кардиомиопати"
                  Value={
                    LifeStoryData && LifeStoryData.hist_dcmObj
                      ? LifeStoryData.hist_dcmObj.Label
                      : "Unknown"
                  }
                  md={4}
                />
                <BaseInfo
                  Label="Анхдагч шалтгаан"
                  Value={
                    LifeStoryData && LifeStoryData.hist_primaryObj
                      ? LifeStoryData.hist_primaryObj.Label
                      : "Unknown"
                  }
                  md={4}
                />
              </GroupPanel>
            </div>
          ),
        });
      }
    } else {
      Tabs.push({
        tabButton: "Амьдралын хэв маяг",
        tabContent: <BaseLoading />,
      });
    }

    if (!HfLabTreatmentLoading) {
      if (LabTreatmentData) {
        Tabs.push({
          tabButton: "Шинжилгээ, Оношлогоо",
          tabContent: (
            <div>
              <GroupPanel title="Үзлэг шинжилгээ" level={1}>
                <BaseInfo
                  Label="Хэвтэх үеийн Киллипийн ангилал"
                  Value={
                    LabTreatmentData && LabTreatmentData.KillipObj
                      ? LabTreatmentData.KillipObj.Label
                      : "Unknown"
                  }
                  md={4}
                />
                <BaseInfo
                  Label="Өндөр (см)"
                  Value={LabTreatmentData ? LabTreatmentData.Height : ""}
                  md={4}
                />
              </GroupPanel>
              <GridContainer style={{ display: "flex" }}>
                <GridItem
                  xs={12}
                  sm={12}
                  md={6}
                  style={{ padding: "0 3px 0 15px", flex: 1 }}
                >
                  <GroupPanel title="0-24 цаг" level={2}>
                    <BaseInfo
                      Label="Жин"
                      Value={
                        LabTreatmentData &&
                        LabTreatmentData.a_weight &&
                        LabTreatmentData.a_weight !== ""
                          ? LabTreatmentData.a_weight
                          : "Unknown"
                      }
                      md={6}
                    />
                    <BaseInfo
                      Label="Систолын даралт (мм.муб)"
                      Value={
                        LabTreatmentData &&
                        LabTreatmentData.a_sys &&
                        LabTreatmentData.a_sys !== ""
                          ? LabTreatmentData.a_sys
                          : "Unknown"
                      }
                      md={6}
                    />
                    <BaseInfo
                      Label="Диастолын даралт (мм.муб)"
                      Value={
                        LabTreatmentData &&
                        LabTreatmentData.a_dias &&
                        LabTreatmentData.a_dias !== ""
                          ? LabTreatmentData.a_dias
                          : "Unknown"
                      }
                      md={6}
                    />
                    <BaseInfo
                      Label="ЗЦТ (удаа/мин)"
                      Value={
                        LabTreatmentData &&
                        LabTreatmentData.a_hrate &&
                        LabTreatmentData.a_hrate !== ""
                          ? LabTreatmentData.a_hrate
                          : "Unknown"
                      }
                      md={6}
                    />
                    <BaseInfo
                      Label="Гемоглобин"
                      Value={
                        LabTreatmentData &&
                        LabTreatmentData.a_hb &&
                        LabTreatmentData.a_hb !== ""
                          ? LabTreatmentData.a_hb
                          : "Unknown"
                      }
                      md={6}
                    />
                    <BaseInfo
                      Label="Креатинин"
                      Value={
                        LabTreatmentData &&
                        LabTreatmentData.a_creat &&
                        LabTreatmentData.a_creat !== ""
                          ? LabTreatmentData.a_creat
                          : "Unknown"
                      }
                      md={6}
                    />
                    <BaseInfo
                      Label="Кали"
                      Value={
                        LabTreatmentData &&
                        LabTreatmentData.a_kali &&
                        LabTreatmentData.a_kali !== ""
                          ? LabTreatmentData.a_kali
                          : "Unknown"
                      }
                      md={6}
                    />
                    <BaseInfo
                      Label="Натри"
                      Value={
                        LabTreatmentData &&
                        LabTreatmentData.a_natri &&
                        LabTreatmentData.a_natri !== ""
                          ? LabTreatmentData.a_natri
                          : "Unknown"
                      }
                      md={6}
                    />
                    <BaseInfo
                      Label="NT-pro.BNP"
                      Value={
                        LabTreatmentData &&
                        LabTreatmentData.a_ntprobnp &&
                        LabTreatmentData.a_ntprobnp !== ""
                          ? LabTreatmentData.a_ntprobnp
                          : "Unknown"
                      }
                      md={6}
                    />
                    <BaseInfo
                      Label="BNP"
                      Value={
                        LabTreatmentData &&
                        LabTreatmentData.a_bnp &&
                        LabTreatmentData.a_bnp !== ""
                          ? LabTreatmentData.a_bnp
                          : "Unknown"
                      }
                      md={6}
                    />
                  </GroupPanel>
                </GridItem>
                <GridItem
                  xs={12}
                  sm={12}
                  md={6}
                  style={{ padding: "0 15px 0 3px", flex: 1 }}
                >
                  <GroupPanel title="24 цагийн дараа" level={2}>
                    <BaseInfo
                      Label="Жин"
                      Value={
                        LabTreatmentData &&
                        LabTreatmentData.b_weight &&
                        LabTreatmentData.b_weight !== ""
                          ? LabTreatmentData.b_weight
                          : "Unknown"
                      }
                      md={6}
                    />
                    <BaseInfo
                      Label="Систолын даралт (мм.муб)"
                      Value={
                        LabTreatmentData &&
                        LabTreatmentData.b_sys &&
                        LabTreatmentData.b_sys !== ""
                          ? LabTreatmentData.b_sys
                          : "Unknown"
                      }
                      md={6}
                    />
                    <BaseInfo
                      Label="Диастолын даралт (мм.муб)"
                      Value={
                        LabTreatmentData &&
                        LabTreatmentData.b_dias &&
                        LabTreatmentData.b_dias !== ""
                          ? LabTreatmentData.b_dias
                          : "Unknown"
                      }
                      md={6}
                    />
                    <BaseInfo
                      Label="ЗЦТ (удаа/мин)"
                      Value={
                        LabTreatmentData &&
                        LabTreatmentData.b_hrate &&
                        LabTreatmentData.b_hrate !== ""
                          ? LabTreatmentData.b_hrate
                          : "Unknown"
                      }
                      md={6}
                    />
                    <BaseInfo
                      Label="Гемоглобин"
                      Value={
                        LabTreatmentData &&
                        LabTreatmentData.b_hb &&
                        LabTreatmentData.b_hb !== ""
                          ? LabTreatmentData.b_hb
                          : "Unknown"
                      }
                      md={6}
                    />
                    <BaseInfo
                      Label="Креатинин"
                      Value={
                        LabTreatmentData &&
                        LabTreatmentData.b_creat &&
                        LabTreatmentData.b_creat !== ""
                          ? LabTreatmentData.b_creat
                          : "Unknown"
                      }
                      md={6}
                    />
                    <BaseInfo
                      Label="Кали"
                      Value={
                        LabTreatmentData &&
                        LabTreatmentData.b_kali &&
                        LabTreatmentData.b_kali !== ""
                          ? LabTreatmentData.b_kali
                          : "Unknown"
                      }
                      md={6}
                    />
                    <BaseInfo
                      Label="Натри"
                      Value={
                        LabTreatmentData &&
                        LabTreatmentData.b_natri &&
                        LabTreatmentData.b_natri !== ""
                          ? LabTreatmentData.b_natri
                          : "Unknown"
                      }
                      md={6}
                    />
                    <BaseInfo
                      Label="NT-pro.BNP"
                      Value={
                        LabTreatmentData &&
                        LabTreatmentData.b_ntprobnp &&
                        LabTreatmentData.b_ntprobnp !== ""
                          ? LabTreatmentData.b_ntprobnp
                          : "Unknown"
                      }
                      md={6}
                    />
                    <BaseInfo
                      Label="BNP"
                      Value={
                        LabTreatmentData &&
                        LabTreatmentData.b_bnp &&
                        LabTreatmentData.b_bnp !== ""
                          ? LabTreatmentData.b_bnp
                          : "Unknown"
                      }
                      md={6}
                    />
                    <BaseInfo
                      Label="Ферритин"
                      Value={
                        LabTreatmentData &&
                        LabTreatmentData.b_ferrit &&
                        LabTreatmentData.b_ferrit !== ""
                          ? LabTreatmentData.b_ferrit
                          : "Unknown"
                      }
                      md={6}
                    />
                    <BaseInfo
                      Label="Трансферрины хяналт"
                      Value={
                        LabTreatmentData &&
                        LabTreatmentData.b_transferrin &&
                        LabTreatmentData.b_transferrin !== ""
                          ? LabTreatmentData.b_transferrin
                          : "Unknown"
                      }
                      md={6}
                    />
                  </GroupPanel>
                </GridItem>
                <GridItem xs={12} sm={12} md={12}>
                  <GroupPanel level={1}>
                    <BaseInfo
                      Label="Нью-Йоркийн ангилал"
                      Value={
                        LabTreatmentData && LabTreatmentData.NyhaObj
                          ? LabTreatmentData.NyhaObj.Label
                          : "Unknown"
                      }
                      md={4}
                    />
                  </GroupPanel>
                </GridItem>
              </GridContainer>
              <GroupPanel title="Оношилгоо" level={1}>
                <BaseInfo
                  Label="ЗЦБ хэмнэл"
                  Value={
                    LabTreatmentData && LabTreatmentData.EcgRhythmObj
                      ? LabTreatmentData.EcgRhythmObj.Label
                      : "Unknown"
                  }
                  md={4}
                />
                <BaseInfo
                  Label="Гиссийн зүүн хөлийн хориг"
                  Value={
                    LabTreatmentData && LabTreatmentData.LbbbObj
                      ? LabTreatmentData.LbbbObj.Label
                      : "Unknown"
                  }
                  md={4}
                />
                <BaseInfo
                  Label="QRS өргөн"
                  Value={
                    LabTreatmentData && LabTreatmentData.QrsObj
                      ? LabTreatmentData.QrsObj.Label
                      : "Unknown"
                  }
                  md={4}
                />
                <BaseInfo
                  Label="EF тодорхойлсон аргачлал"
                  Value={
                    LabTreatmentData && LabTreatmentData.LvefMethodObj
                      ? LabTreatmentData.LvefMethodObj.Label
                      : "Unknown"
                  }
                  md={4}
                />
                <BaseInfo
                  Label="EF тодорхойлсон огноо"
                  Value={
                    LabTreatmentData ? LabTreatmentData.LvefDate : "Unknown"
                  }
                  md={4}
                />
                <BaseInfo
                  Label="EF%"
                  Value={
                    LabTreatmentData && LabTreatmentData.LvefObj
                      ? LabTreatmentData.LvefObj.Label
                      : "Unknown"
                  }
                  md={4}
                />
                <BaseInfo
                  Label="Цээжний рентген дүгнэлт"
                  Value={
                    LabTreatmentData && LabTreatmentData.ChestXrayObj
                      ? LabTreatmentData.ChestXrayObj.Label
                      : "Unknown"
                  }
                  md={4}
                />
                <BaseInfo
                  Label="Спирометрийн дүгнэлт"
                  Value={
                    LabTreatmentData && LabTreatmentData.SpirometryObj
                      ? LabTreatmentData.SpirometryObj.Label
                      : "Unknown"
                  }
                  md={4}
                />
              </GroupPanel>
              <GroupPanel title="Судсаар хийгдсэн эмчилгээ" level={1}>
                <BaseInfo
                  Label="Гогцооны шээс хөөгч"
                  Value={
                    LabTreatmentData && LabTreatmentData.DiuerticDoneObj
                      ? LabTreatmentData.DiuerticDoneObj.Label
                      : "Unknown"
                  }
                  md={4}
                />
                <Box
                  sx={{
                    position: "relative",
                    padding: "10px",
                    border: "1px solid #ccc",
                    margin: "10px 0 10px",
                    backgroundColor: "#fafafa",
                    display:
                      LabTreatmentData &&
                      LabTreatmentData.DiuerticDoneObj &&
                      LabTreatmentData.DiuerticDoneObj.Value === "y"
                        ? ""
                        : "none",
                  }}
                >
                  <BaseInfo
                    Label="Огноо"
                    Value={
                      LabTreatmentData
                        ? LabTreatmentData.DiureticDate
                        : "Unknown"
                    }
                    md={4}
                  />
                </Box>
                <BaseInfo
                  Label="Төлөвлөөгүй инотроп дэмжлэг"
                  Value={
                    LabTreatmentData && LabTreatmentData.InotropicObj
                      ? LabTreatmentData.InotropicObj.Label
                      : "Unknown"
                  }
                  md={4}
                />
              </GroupPanel>
            </div>
          ),
        });
      }
    } else {
      Tabs.push({
        tabButton: "Шинжилгээ, Оношлогоо",
        tabContent: <BaseLoading />,
      });
    }

    if (!HfTreatmentDischargeLoading) {
      if (TreatmentDischargeData) {
        Tabs.push({
          tabButton: "Эмчилгээ",
          tabContent: (
            <div>
              <GroupPanel title="Гарах үеийн эмчилгээ" level={1}>
                <div
                  style={{
                    position: "relative",
                    padding: "10px",
                    border: "1px solid #ccc",
                    margin: "10px",
                    backgroundColor: "#f5f5f5",
                    display:
                      TreatmentDischargeData &&
                      TreatmentDischargeData.inhibitorObj &&
                      TreatmentDischargeData.inhibitorObj.Value === "y"
                        ? ""
                        : "none",
                  }}
                >
                  <BaseInfo
                    Label="Эмийн нэр"
                    Value={
                      TreatmentDischargeData &&
                      TreatmentDischargeData.inhibitor_tabletObj
                        ? TreatmentDischargeData.inhibitor_tabletObj.Label
                        : "Unknown"
                    }
                    md={4}
                  />
                  <BaseInfo
                    Label="мг тун/хоног"
                    Value={
                      TreatmentDischargeData
                        ? TreatmentDischargeData.inhibitor_dose
                        : "Unknown"
                    }
                    md={4}
                  />
                </div>

                <BaseInfo
                  Label="АРХ"
                  Value={
                    TreatmentDischargeData && TreatmentDischargeData.arbObj
                      ? TreatmentDischargeData.arbObj.Label
                      : "Unknown"
                  }
                  md={4}
                />
                <div
                  style={{
                    position: "relative",
                    padding: "10px",
                    border: "1px solid #ccc",
                    margin: "10px",
                    backgroundColor: "#f5f5f5",
                    display:
                      TreatmentDischargeData &&
                      TreatmentDischargeData.arbObj &&
                      TreatmentDischargeData.arbObj.Value === "y"
                        ? ""
                        : "none",
                  }}
                >
                  <BaseInfo
                    Label="Эмийн нэр"
                    Value={
                      TreatmentDischargeData &&
                      TreatmentDischargeData.arb_tabletObj
                        ? TreatmentDischargeData.arb_tabletObj.Label
                        : ""
                    }
                    md={4}
                  />
                  <BaseInfo
                    Label="мг тун/хоног"
                    Value={
                      TreatmentDischargeData
                        ? TreatmentDischargeData.arb_dose
                        : ""
                    }
                    md={4}
                  />
                </div>

                <BaseInfo
                  Label="Бетахориглогч"
                  Value={
                    TreatmentDischargeData && TreatmentDischargeData.betaObj
                      ? TreatmentDischargeData.betaObj.Label
                      : "Unknown"
                  }
                  md={4}
                />
                <div
                  style={{
                    position: "relative",
                    padding: "10px",
                    border: "1px solid #ccc",
                    margin: "10px",
                    backgroundColor: "#f5f5f5",
                    display:
                      TreatmentDischargeData &&
                      TreatmentDischargeData.betaObj &&
                      TreatmentDischargeData.betaObj.Value === "y"
                        ? ""
                        : "none",
                  }}
                >
                  <BaseInfo
                    Label="Эмийн нэр"
                    Value={
                      TreatmentDischargeData &&
                      TreatmentDischargeData.beta_tabletObj
                        ? TreatmentDischargeData.beta_tabletObj.Label
                        : ""
                    }
                    md={4}
                  />
                  <BaseInfo
                    Label="мг тун/хоног"
                    Value={
                      TreatmentDischargeData
                        ? TreatmentDischargeData.beta_dose
                        : ""
                    }
                    md={4}
                  />
                </div>

                <BaseInfo
                  Label="Минералкортикойд рецепторийн антагонист"
                  Value={
                    TreatmentDischargeData && TreatmentDischargeData.mraObj
                      ? TreatmentDischargeData.mraObj.Label
                      : "Unknown"
                  }
                  md={4}
                />
                <div
                  style={{
                    position: "relative",
                    padding: "10px",
                    border: "1px solid #ccc",
                    margin: "10px",
                    backgroundColor: "#f5f5f5",
                    display:
                      TreatmentDischargeData &&
                      TreatmentDischargeData.mraObj &&
                      TreatmentDischargeData.mraObj.Value === "y"
                        ? ""
                        : "none",
                  }}
                >
                  <BaseInfo
                    Label="Эмийн нэр"
                    Value={
                      TreatmentDischargeData &&
                      TreatmentDischargeData.mra_tabletObj
                        ? TreatmentDischargeData.mra_tabletObj.Label
                        : ""
                    }
                    md={4}
                  />
                  <BaseInfo
                    Label="мг тун/хоног"
                    Value={
                      TreatmentDischargeData
                        ? TreatmentDischargeData.mra_dose
                        : ""
                    }
                    md={4}
                  />
                </div>

                <BaseInfo
                  Label="Ангиотензины рецептор нефрилизины хориглогч"
                  Value={
                    TreatmentDischargeData && TreatmentDischargeData.arniObj
                      ? TreatmentDischargeData.arniObj.Label
                      : "Unknown"
                  }
                  md={4}
                />
                <div
                  style={{
                    position: "relative",
                    padding: "10px",
                    border: "1px solid #ccc",
                    margin: "10px",
                    backgroundColor: "#f5f5f5",
                    display:
                      TreatmentDischargeData &&
                      TreatmentDischargeData.arniObj &&
                      TreatmentDischargeData.arniObj.Value === "y"
                        ? ""
                        : "none",
                  }}
                >
                  <BaseInfo
                    Label="Эмийн нэр"
                    Value={
                      TreatmentDischargeData &&
                      TreatmentDischargeData.arni_tabletObj
                        ? TreatmentDischargeData.arni_tabletObj.Label
                        : ""
                    }
                    md={4}
                  />
                  <BaseInfo
                    Label="Tab-ийн тоо"
                    Value={
                      TreatmentDischargeData &&
                      TreatmentDischargeData.arni_tablet_numberObj
                        ? TreatmentDischargeData.arni_tablet_numberObj.Label
                        : ""
                    }
                    md={4}
                  />
                </div>

                <BaseInfo
                  Label="Синусын зангилааг дарангуйлагч"
                  Value={
                    TreatmentDischargeData &&
                    TreatmentDischargeData.sinus_inhibitorObj
                      ? TreatmentDischargeData.sinus_inhibitorObj.Label
                      : "Unknown"
                  }
                  md={4}
                />
                <div
                  style={{
                    position: "relative",
                    padding: "10px",
                    border: "1px solid #ccc",
                    margin: "10px",
                    backgroundColor: "#f5f5f5",
                    display:
                      TreatmentDischargeData &&
                      TreatmentDischargeData.sinus_inhibitorObj &&
                      TreatmentDischargeData.sinus_inhibitorObj.Value === "y"
                        ? ""
                        : "none",
                  }}
                >
                  <BaseInfo
                    Label="Эмийн нэр"
                    Value={
                      TreatmentDischargeData &&
                      TreatmentDischargeData.sinus_tabletObj
                        ? TreatmentDischargeData.sinus_tabletObj.Label
                        : ""
                    }
                    md={4}
                  />
                  <BaseInfo
                    Label="мг тун/хоног"
                    Value={
                      TreatmentDischargeData
                        ? TreatmentDischargeData.sinus_dose
                        : ""
                    }
                    md={4}
                  />
                </div>

                <BaseInfo
                  Label="Гогцооны шээс хөөгч"
                  Value={
                    TreatmentDischargeData &&
                    TreatmentDischargeData.loop_diureticsObj
                      ? TreatmentDischargeData.loop_diureticsObj.Label
                      : "Unknown"
                  }
                  md={4}
                />
                <div
                  style={{
                    position: "relative",
                    padding: "10px",
                    border: "1px solid #ccc",
                    margin: "10px",
                    backgroundColor: "#f5f5f5",
                    display:
                      TreatmentDischargeData &&
                      TreatmentDischargeData.loop_diureticsObj &&
                      TreatmentDischargeData.loop_diureticsObj.Value === "y"
                        ? ""
                        : "none",
                  }}
                >
                  <BaseInfo
                    Label="Эмийн нэр"
                    Value={
                      TreatmentDischargeData &&
                      TreatmentDischargeData.loop_diuretics_tabletObj
                        ? TreatmentDischargeData.loop_diuretics_tabletObj.Label
                        : ""
                    }
                    md={4}
                  />
                  <BaseInfo
                    Label="Давтамж"
                    Value={
                      TreatmentDischargeData &&
                      TreatmentDischargeData.loop_diuretics_cycleObj
                        ? TreatmentDischargeData.loop_diuretics_cycleObj.Label
                        : "Unknown"
                    }
                    md={4}
                  />
                  <BaseInfo
                    Label="мг тун/хоног"
                    Value={
                      TreatmentDischargeData
                        ? TreatmentDischargeData.loop_diuretics_dose
                        : ""
                    }
                    md={4}
                  />
                </div>
              </GroupPanel>

              <GroupPanel level={1}>
                <BaseInfo
                  Label="Тиазид болон бусад шээс хөөгч"
                  Value={
                    TreatmentDischargeData &&
                    TreatmentDischargeData.OtherDiureticObj
                      ? TreatmentDischargeData.OtherDiureticObj.Label
                      : "Unknown"
                  }
                  md={4}
                />
                <BaseInfo
                  Label="Дигиталис"
                  Value={
                    TreatmentDischargeData &&
                    TreatmentDischargeData.DigitalisObj
                      ? TreatmentDischargeData.DigitalisObj.Label
                      : "Unknown"
                  }
                  md={4}
                />
                <BaseInfo
                  Label="Статин"
                  Value={
                    TreatmentDischargeData && TreatmentDischargeData.StatinObj
                      ? TreatmentDischargeData.StatinObj.Label
                      : "Unknown"
                  }
                  md={4}
                />
                <BaseInfo
                  Label="Нитрат"
                  Value={
                    TreatmentDischargeData && TreatmentDischargeData.NitratObj
                      ? TreatmentDischargeData.NitratObj.Label
                      : "Unknown"
                  }
                  md={4}
                />
                <BaseInfo
                  Label="Уухаар антикоагулянт"
                  Value={
                    TreatmentDischargeData &&
                    TreatmentDischargeData.OralAnticoagulantObj
                      ? TreatmentDischargeData.OralAnticoagulantObj.Label
                      : "Unknown"
                  }
                  md={4}
                />
                <BaseInfo
                  Label="Антиагрегант"
                  Value={
                    TreatmentDischargeData &&
                    TreatmentDischargeData.AntiagregantObj
                      ? TreatmentDischargeData.AntiagregantObj.Label
                      : "Unknown"
                  }
                  md={4}
                />
                <BaseInfo
                  Label="Төхөөрөмж эмчилгээ"
                  Value={
                    TreatmentDischargeData &&
                    TreatmentDischargeData.DeviceTherapyObj
                      ? TreatmentDischargeData.DeviceTherapyObj.Label
                      : "Unknown"
                  }
                  md={4}
                />
              </GroupPanel>
            </div>
          ),
        });
      }
    } else {
      Tabs.push({
        tabButton: "Эмчилгээ",
        tabContent: <BaseLoading />,
      });
    }

    return Tabs;
  };

  render() {
    const { HfStayLoading, Data, Alert } = this.state;
    const { t } = this.props;
    if (HfStayLoading || !Data) {
      return <BaseLoading />;
    } else {
      return (
        <div style={{ height: "100%" }}>
          {Alert}
          <div
            style={{ display: "flex", flexDirection: "column", height: "100%" }}
          >
            <GridContainer
              style={{ width: "calc(100% - 30px)", flex: "0 0 auto" }}
            >
              <GridItem xs={12} sm={12} md={12}>
                <GridContainer style={{ margin: "15px 0" }}>
                  <GridItem xs={12} sm={6} md={6}>
                    <div style={{ float: "left" }}>
                      {t("Date")}: {"\u00A0"}
                      <span style={{ fontWeight: "400" }}>
                        &nbsp;{Data ? Data.CreatedDate : ""}
                      </span>
                    </div>
                  </GridItem>
                  <GridItem xs={12} sm={6} md={6}>
                    <div style={{ float: "right" }}>
                      <UserDialogLink UserId={Data ? Data.CreateUserId : null}>
                        {t("Doctor")}: {"\u00A0"}
                        <span style={{ fontWeight: "400" }}>
                          {Data ? Data.Users.UserName : ""}
                        </span>
                      </UserDialogLink>
                    </div>
                  </GridItem>
                </GridContainer>
              </GridItem>
              <GridItem xs={12} sm={12} md={12} style={{ padding: "0 50px" }}>
                <h4 style={{ textAlign: "center", fontWeight: "500" }}>
                  Зүрхний дутагдалтай хэвтэн эмчлүүлэгчдийн бүртгэлийн асуумж
                </h4>
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
        </div>
      );
    }
  }
}

export default withTranslation(undefined, { withRef: true })(HfStay);
