import { withTranslation } from "react-i18next";
import React, { Component } from "react";
// translation
// @mui/material components
import Box from "@mui/material/Box";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// custom components
import BaseInfo from "customComponents/BaseViewControls/BaseInfo";
import BaseArrayInfo from "customComponents/BaseViewControls/BaseArrayInfo";
// import BaseLabel from "customComponents/BaseViewControls/BaseLabel";
// import CustomTab from "customComponents/CustomTab";
import BaseLoading from "customComponents/BaseLoading";
import BaseNoData from "customComponents/BaseNoData";
// import CustomContainer from "customComponents/CustomContainer";
import UserDialogLink from "customComponents/DoctorProfile/UserDialogLink";
import CustomTab from "customComponents/CustomTab";
import GroupPanel from "customComponents/GroupPanel";
// helper
import Helper from "helper";
import { colors } from "@/theme/colors";

import vascular1 from "assets/img/vascular-1.jpeg";
import vascular2 from "assets/img/vascular-2.png";
// import vascular3 from "assets/img/vascular-3.png";

const sx = {
  childDiv: {
    position: "relative",
    padding: "10px",
    border: `1px solid ${colors.border.default}`,
    margin: "10px",
    backgroundColor: colors.background.surfaceAlt,
  },
  customList: {
    fontWeight: 500,
    fontSize: "1.2em",
    padding: "15px",
    margin: "15px",
    border: "2px solid #003fd4",
    "& > ul": { margin: 0, padding: "0 15px" },
    "& > ul > li": { color: "#003fd4" },
  },
  customTable: {
    border: "1px solid ${colors.border.faint}",
    borderCollapse: "collapse",
    backgroundColor: colors.background.surfaceAlt,
    fontSize: "12px",
    "& > thead > tr": { border: "1px solid ${colors.border.faint}" },
    "& > tbody > tr": { border: "1px solid ${colors.border.faint}" },
    "& > tbody > tr > td": {
      padding: "2px 4px",
      border: "1px solid ${colors.border.faint}",
    },
    "& > tbody > tr > th": {
      padding: "2px 4px",
      border: "1px solid ${colors.border.faint}",
    },
    "& > thead > tr > th": {
      padding: "2px 4px",
      border: "1px solid ${colors.border.faint}",
    },
  },
};

class VascularDisease extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Alert: null,
      Data: null,
      TreatmentData: null,
      Loading: false,
      TreatmentLoading: false,
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
    this.setState({ Loading: true, TreatmentLoading: true });
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
        "DiseaseId",
        DataId,
        SubSearchOption.SearchField,
        "Equals",
      );
      await Helper.BaseCrudHelper.BaseGetDetailInfo(
        { ObjectName: "VascularDisease", SearchOption },
        (resData) => {
          resData.Success &&
            resData.Data &&
            this.setState({ Data: Object.assign({}, resData.Data) });
          this.setState({ Loading: false });
        },
      );
      // Treatment Data
      await Helper.BaseCrudHelper.BaseGetDetailInfo(
        {
          ObjectName: "VascularDiseaseTreatment",
          SearchOption: SubSearchOption,
        },
        (resData) => {
          resData &&
            resData.Success &&
            resData.Data &&
            this.setState({ TreatmentData: Object.assign({}, resData.Data) });

          this.setState({ TreatmentLoading: false });
        },
      );
    } else {
      this.setState({ Loading: false });
    }
  };

  Print = async (callback) => {
    const { DataId } = this;
    let alert = null;
    if (DataId) {
      await Helper.BaseCrudHelper.BasePrintReport(
        {
          Url: "/VascularDisease/PrintReport",
          Data: { Id: DataId },
          FileName: "VascularDisease.pdf",
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

  Confirm = async (callback) => {
    const { DataId } = this;
    let alert = null;
    if (DataId) {
      await Helper.BaseCrudHelper.CallService(
        "/VascularDisease/Confirm",
        { Id: DataId },
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

  GetTabs = () => {
    const { Data, TreatmentData, Loading, TreatmentLoading } = this.state;
    const { t } = this.props;
    var Tabs = [];

    // Main data
    Tabs.push({
      tabButton: "АМБУЛАТОРЫН БҮРТГЭЛ СУДАЛГАА",
      tabContent: (
        <div>
          {Loading ? (
            <BaseLoading />
          ) : (
            <div>
              {Data ? (
                <GroupPanel title={t("1. Титмийн архаг хамшинж")} level={1}>
                  <GroupPanel title={t("Үзлэгийн үеийн бодит үзлэг")} level={2}>
                    {/* <BaseInfo Label="АД (мм.муб)" Value={Data.ad} md={4} /> */}
                    <BaseInfo
                      Label="АД систол (мм.муб)"
                      Value={Data.ad_deed}
                      md={4}
                    />
                    <BaseInfo
                      Label="АД диастол (мм.муб)"
                      Value={Data.ad_dood}
                      md={4}
                    />
                    <BaseInfo Label="ЗЦТ (удаа/мин)" Value={Data.ztst} md={4} />
                    <BaseInfo Label="Өндөр (см)" Value={Data.undur} md={4} />
                    <BaseInfo Label="Жин (кг)" Value={Data.jin} md={4} />
                  </GroupPanel>
                  <Box sx={sx.customList}>
                    <ul>
                      {/* <li>ТИТМИЙН АРХАГ ХАМШИНЖ</li> */}
                      <li>ЦЭЭЖНИЙ ТОГТВОРТОЙ СТЕНОКАРДИ</li>
                      <li>СПАЗМ БҮХИЙ СТЕНОКАРДИ</li>
                      <li>АЧААЛЛЫН ҮЕИЙН ЦЭЭЖНИЙ СТЕНОКАРДИ</li>
                    </ul>
                  </Box>
                  <BaseInfo
                    Label="Цээжний тогтвортой бахын үйл ажиллагааны ангилал"
                    Value={
                      Data.vd_ccs_angilalObj ? Data.vd_ccs_angilalObj.Label : ""
                    }
                    md={4}
                  />
                  <GroupPanel
                    title={t("Үзлэгийн үеийн шинжилгээнүүд")}
                    level={1}
                  >
                    <GroupPanel title={t("ЦДШ-нд")} level={2}>
                      <BaseInfo Label="WBC (103/ul)" Value={Data.wbs} md={4} />
                      <BaseInfo Label="RBC (106/ul)" Value={Data.rbc} md={4} />
                      <BaseInfo Label="Hb (g/l)" Value={Data.hgb} md={4} />
                      <BaseInfo Label="HCT (%)" Value={Data.hct} md={4} />
                      <BaseInfo Label="PLT (103/ul)" Value={Data.plt} md={4} />
                    </GroupPanel>
                    <GroupPanel title={t("Биохими")} level={2}>
                      <GroupPanel
                        title={t("Холестеролын үзүүлэлтүүд")}
                        level={3}
                      >
                        <BaseInfo
                          Label="LDL (mmol/l)"
                          Value={Data.ldl}
                          md={4}
                        />
                        <BaseInfo
                          Label="HDL (mmol/l)"
                          Value={Data.hdl}
                          md={4}
                        />
                        <BaseInfo
                          Label="triglyceride (mmol/l)"
                          Value={Data.triglyceride}
                          md={4}
                        />
                        <BaseInfo
                          Label="Total cholesterine (mmol/l)"
                          Value={Data.cholesterine}
                          md={4}
                        />
                        <BaseInfo
                          Label=""
                          Value={Data.non_cholesterine}
                          md={4}
                        />
                        <BaseInfo
                          Label=""
                          Value={Data.uldets_cholesterine}
                          md={4}
                        />
                      </GroupPanel>
                      <BaseInfo Label="Кали" Value={Data.kali} md={4} />
                      <BaseInfo Label="Мочевин" Value={Data.mochevin} md={4} />
                      <BaseInfo
                        Label="Креатинин"
                        Value={Data.creatinin}
                        md={4}
                      />
                      <BaseInfo Label="Асат" Value={Data.asat} md={4} />
                      <BaseInfo Label="Алат" Value={Data.alam} md={4} />
                      <BaseInfo
                        Label="Санамсаргүй буюу хоолны дараах глюкоз (ммоль/л)"
                        Value={Data.sanamsargui_glukoz}
                        md={4}
                      />
                      <BaseInfo Label="HBA1C(%)" Value={Data.hba_1_c} md={4} />
                    </GroupPanel>

                    <GroupPanel title={t("Зүрхний цахилгаан бичлэг")} level={2}>
                      <BaseInfo
                        Label="Огноо (он/сар/өдөр)"
                        Value={Data.tsa_bichleg_date}
                        md={4}
                      />
                      <BaseInfo
                        Label="QRS бүрдэл (мс)"
                        Value={Data.qrs_burdel}
                        md={4}
                      />
                      <BaseArrayInfo
                        Label="Хэмнэл"
                        TextField="Label"
                        Values={Data.rhythmObj ? Data.rhythmObj : []}
                        md={4}
                      />
                      <BaseInfo
                        Label="Хэмнэл (Бусад)"
                        Value={Data.rhythm_other}
                        md={4}
                      />
                      <BaseArrayInfo
                        Label="Зүрхний хориг"
                        TextField="Label"
                        Values={Data.zurh_horigObj ? Data.zurh_horigObj : []}
                        md={4}
                      />
                      <BaseInfo
                        Label="Зүрхний хориг (Бусад)"
                        Value={Data.zurh_horig_other}
                        md={4}
                      />
                      <BaseInfo
                        Label="Сөрөг Т шүд"
                        Value={
                          Data.vd_surug_t_shvdObj
                            ? Data.vd_surug_t_shvdObj.Label
                            : ""
                        }
                        md={4}
                      />
                      <BaseInfo
                        Label="ST буулт"
                        Value={
                          Data.vd_st_buultObj ? Data.vd_st_buultObj.Label : ""
                        }
                        md={4}
                      />
                    </GroupPanel>

                    <GroupPanel
                      title={t("Зүрхний хэт авиан шинжилгээ")}
                      level={2}
                    >
                      <BaseInfo
                        Label="Огноо"
                        Value={Data.het_avia_date}
                        md={4}
                      />
                      <BaseInfo Label="LVDd (mm)" Value={Data.lvdd} md={4} />
                      <BaseInfo Label="LVDs (mm)" Value={Data.lvds} md={4} />
                      <BaseInfo Label="IVSd (mm)" Value={Data.ivsd} md={4} />
                      <BaseInfo Label="PWd (mm)" Value={Data.pwd} md={4} />
                      <BaseInfo Label="LVmass" Value={Data.lv_mass} md={4} />
                      <BaseInfo
                        Label="LVEF Teicholz (%)"
                        Value={Data.lvef_teicholz}
                        md={4}
                      />
                      <BaseInfo
                        Label="LVEF Simpson method (%)"
                        Value={Data.lvef_simpson_method}
                        md={4}
                      />
                      <BaseInfo Label="LV GLS" Value={Data.lv_gls} md={4} />
                      <BaseInfo
                        Label="LA volume (ml)"
                        Value={Data.la_volume}
                        md={4}
                      />
                      <BaseInfo Label="E/e (Med)" Value={Data.ee_med} md={4} />
                      <BaseInfo Label="E/e (Lat)" Value={Data.ee_lat} md={4} />
                      <BaseInfo
                        Label="Дундаж E/e"
                        Value={Data.dundaj_ee}
                        md={4}
                      />
                      <BaseInfo
                        Label="Таславч e (см/сек)"
                        Value={Data.taslavch_e}
                        md={4}
                      />
                      <BaseInfo
                        Label="Хажуу хана e (см/сек)"
                        Value={Data.hajuu_hana_e}
                        md={4}
                      />
                      <BaseInfo
                        Label="Уушгины артерийн систолын даралт (мм.муб)"
                        Value={Data.uushig_systol_daralt}
                        md={4}
                      />
                      <BaseInfo Label="TAPSE (mm)" Value={Data.tapse} md={4} />
                      <BaseInfo Label="RV FAC (%)" Value={Data.rv_fac} md={4} />
                    </GroupPanel>

                    <GroupPanel
                      title={t("Ханын хөдөлгөөний алдагдал")}
                      level={2}
                    >
                      {/* хөдөлгөөний алдагдалтай сегментийг зурна уу. /эсвэл 17 чеклист/ */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                          padding: "15px 30px",
                        }}
                      >
                        <img
                          alt="Ханын хөдөлгөөний алдагдал: хөдөлгөөний алдагдалтай сегментийг зурна уу"
                          src={vascular1}
                          style={{ marginBottom: "15px" }}
                        />
                        <img
                          alt="Ханын хөдөлгөөний алдагдал: хөдөлгөөний алдагдалтай сегментийг зурна уу"
                          src={vascular2}
                          style={{ maxWidth: "400px" }}
                        />
                      </div>

                      <GroupPanel level={3}>
                        <BaseInfo
                          Label="basal anterior"
                          Value={Data.segment1Obj ? Data.segment1Obj.Label : ""}
                          md={4}
                        />
                        <BaseInfo
                          Label="basal anteroseptal"
                          Value={Data.segment2Obj ? Data.segment2Obj.Label : ""}
                          md={4}
                        />
                        <BaseInfo
                          Label="basal inferoseptal"
                          Value={Data.segment3Obj ? Data.segment3Obj.Label : ""}
                          md={4}
                        />
                        <BaseInfo
                          Label="basal inferior"
                          Value={Data.segment4Obj ? Data.segment4Obj.Label : ""}
                          md={4}
                        />
                        <BaseInfo
                          Label="basal inferolateral"
                          Value={Data.segment5Obj ? Data.segment5Obj.Label : ""}
                          md={4}
                        />
                        <BaseInfo
                          Label="basal anterolateral"
                          Value={Data.segment6Obj ? Data.segment6Obj.Label : ""}
                          md={4}
                        />
                        <BaseInfo
                          Label="mid anterior"
                          Value={Data.segment7Obj ? Data.segment7Obj.Label : ""}
                          md={4}
                        />
                        <BaseInfo
                          Label="mid anteroseptal"
                          Value={Data.segment8Obj ? Data.segment8Obj.Label : ""}
                          md={4}
                        />
                        <BaseInfo
                          Label="mid inferoseptal"
                          Value={Data.segment9Obj ? Data.segment9Obj.Label : ""}
                          md={4}
                        />
                        <BaseInfo
                          Label="mid inferior"
                          Value={
                            Data.segment10Obj ? Data.segment10Obj.Label : ""
                          }
                          md={4}
                        />
                        <BaseInfo
                          Label="mid inferolateral"
                          Value={
                            Data.segment11Obj ? Data.segment11Obj.Label : ""
                          }
                          md={4}
                        />
                        <BaseInfo
                          Label="mid anterolateral"
                          Value={
                            Data.segment12Obj ? Data.segment12Obj.Label : ""
                          }
                          md={4}
                        />
                        <BaseInfo
                          Label="apical anterior"
                          Value={
                            Data.segment13Obj ? Data.segment13Obj.Label : ""
                          }
                          md={4}
                        />
                        <BaseInfo
                          Label="apical septal"
                          Value={
                            Data.segment14Obj ? Data.segment14Obj.Label : ""
                          }
                          md={4}
                        />
                        <BaseInfo
                          Label="apical inferior"
                          Value={
                            Data.segment15Obj ? Data.segment15Obj.Label : ""
                          }
                          md={4}
                        />
                        <BaseInfo
                          Label="apical lateral"
                          Value={
                            Data.segment16Obj ? Data.segment16Obj.Label : ""
                          }
                          md={4}
                        />
                        <BaseInfo
                          Label="apex"
                          Value={
                            Data.segment17Obj ? Data.segment17Obj.Label : ""
                          }
                          md={4}
                        />
                      </GroupPanel>
                    </GroupPanel>

                    <GroupPanel title={t("Хавхлагын эмгэг")} level={2}>
                      <BaseInfo
                        Label="Хавхлагын эмгэг"
                        Value={
                          Data.is_havhlaga_emgegObj
                            ? Data.is_havhlaga_emgegObj.Label
                            : ""
                        }
                        md={4}
                      />
                      {Data.is_havhlaga_emgegObj &&
                        Data.is_havhlaga_emgegObj.Value === "y" && (
                          <div
                            style={{
                              position: "relative",
                              padding: "20px 10px 10px",
                              border: `1px solid ${colors.border.default}`,
                              margin: "20px 0 10px",
                              backgroundColor: colors.background.surface,
                            }}
                          >
                            <BaseInfo
                              Label="2хх-ын нарийсал"
                              Value={
                                Data.h_e_2xx_narObj
                                  ? Data.h_e_2xx_narObj.Label
                                  : ""
                              }
                              md={4}
                            />
                            <BaseInfo
                              Label="2хх-ын дутагдал"
                              Value={
                                Data.h_e_2xx_dutObj
                                  ? Data.h_e_2xx_dutObj.Label
                                  : ""
                              }
                              md={4}
                            />
                            <BaseInfo
                              Label="3хх-ын нарийсал"
                              Value={
                                Data.h_e_3xx_narObj
                                  ? Data.h_e_3xx_narObj.Label
                                  : ""
                              }
                              md={4}
                            />
                            <BaseInfo
                              Label="3хх-ын дутагдал"
                              Value={
                                Data.h_e_3xx_dutObj
                                  ? Data.h_e_3xx_dutObj.Label
                                  : ""
                              }
                              md={4}
                            />
                            <BaseInfo
                              Label="Гол судасны хавхлагын нарийсал"
                              Value={
                                Data.h_e_gol_sudas_narObj
                                  ? Data.h_e_gol_sudas_narObj.Label
                                  : ""
                              }
                              md={4}
                            />
                            <BaseInfo
                              Label="Гол судасны хавхлагын дутагдал"
                              Value={
                                Data.h_e_gol_sudas_dutObj
                                  ? Data.h_e_gol_sudas_dutObj.Label
                                  : ""
                              }
                              md={4}
                            />

                            <BaseInfo
                              Label="УА-ын хавхлагын нарийсал"
                              Value={
                                Data.h_e_ua_narObj
                                  ? Data.h_e_ua_narObj.Label
                                  : ""
                              }
                              md={4}
                            />
                            <BaseInfo
                              Label="УА-ын хавхлагын дутагдал"
                              Value={
                                Data.h_e_ua_dutObj
                                  ? Data.h_e_ua_dutObj.Label
                                  : ""
                              }
                              md={4}
                            />
                          </div>
                        )}
                    </GroupPanel>

                    <GroupPanel
                      title={t("Титэм судсан дотуурх оношилгоо")}
                      level={2}
                    >
                      <BaseInfo
                        Label="Хийлгэсэн эсэх"
                        Value={
                          Data.is_titem_dotuurh_onshilgooObj
                            ? Data.is_titem_dotuurh_onshilgooObj.Label
                            : ""
                        }
                        md={4}
                      />
                      {Data.is_titem_dotuurh_onshilgooObj &&
                        Data.is_titem_dotuurh_onshilgooObj.Value === "y" && (
                          <div
                            style={{
                              position: "relative",
                              padding: "20px 10px 10px",
                              border: `1px solid ${colors.border.default}`,
                              margin: "20px 0 10px",
                              backgroundColor: colors.background.surface,
                            }}
                          >
                            <BaseInfo
                              Label="Титэм судсан дотуурх оношилгоо"
                              Value={
                                Data.vd_titem_dotuurh_dugneltObj
                                  ? Data.vd_titem_dotuurh_dugneltObj.Label
                                  : ""
                              }
                              md={4}
                            />
                            <BaseInfo
                              Label="Огноо (он/сар/өдөр)"
                              Value={Data.titem_dotuurh_date}
                              md={4}
                            />
                            <BaseInfo
                              Label="Титэм судсан дотуурх оношилгоо"
                              Value={
                                Data.vd_titem_dotuurh_onshilgooObj
                                  ? Data.vd_titem_dotuurh_onshilgooObj.Label
                                  : ""
                              }
                              md={4}
                            />
                            <BaseArrayInfo
                              Label="Титэм судсан дотуурх оношилгоонд нарийслын шалтгаан"
                              Values={
                                Data.vd_titem_onshilgoond_nar_shaltObj
                                  ? Data.vd_titem_onshilgoond_nar_shaltObj
                                  : []
                              }
                              md={4}
                            />
                            <BaseInfo
                              Label="Титэм судсан дотуурх оношилгоонд нарийслын шалтгаан (Бусад)"
                              Value={Data.vd_titem_onsh_nar_shalt_other}
                              md={4}
                            />
                            <BaseInfo
                              Label="Огноо (он/сар/өдөр)"
                              Value={Data.titem_dotuurh_emchil_date}
                              md={4}
                            />
                            <BaseArrayInfo
                              Label="Титэм судсан дотуурх эмчилгээ"
                              Values={
                                Data.vd_titem_dotuurh_emchilgeeObj
                                  ? Data.vd_titem_dotuurh_emchilgeeObj
                                  : []
                              }
                              md={4}
                            />
                          </div>
                        )}
                    </GroupPanel>
                  </GroupPanel>

                  <GroupPanel
                    title={t("ТИТМИЙН ЦОЧМОГ ХАМШИНЖ, ЗҮРХНИЙ ЦОЧМОГ ШИГДЭЭС")}
                    level={1}
                  >
                    <GroupPanel title={t("ТиСДО/Э-ийн үр дүн")} level={2}>
                      <BaseInfo
                        Label=""
                        Value={Data.angioObj ? Data.angioObj.Label : ""}
                        md={4}
                      />
                      <BaseInfo
                        Label=""
                        Value={Data.timi_lmcaObj ? Data.timi_lmcaObj.Label : ""}
                        md={4}
                      />
                      <BaseInfo
                        Label=""
                        Value={Data.timi_ladObj ? Data.timi_ladObj.Label : ""}
                        md={4}
                      />
                      <BaseInfo
                        Label=""
                        Value={Data.timi_lcxObj ? Data.timi_lcxObj.Label : ""}
                        md={4}
                      />
                      <BaseInfo
                        Label=""
                        Value={Data.timi_rcaObj ? Data.timi_rcaObj.Label : ""}
                        md={4}
                      />
                    </GroupPanel>

                    <GroupPanel title={t("Стент байршил")} level={2}>
                      <BaseInfo
                        Label="DES_LMCA"
                        Value={Data.des_lmcaObj ? Data.des_lmcaObj.Label : ""}
                        md={4}
                      />
                      <BaseInfo
                        Label="DES_LAD"
                        Value={Data.des_ladObj ? Data.des_ladObj.Label : ""}
                        md={4}
                      />
                      <BaseInfo
                        Label="DES_LCX"
                        Value={Data.des_lcxObj ? Data.des_lcxObj.Label : ""}
                        md={4}
                      />
                      <BaseInfo
                        Label="DES_RCA"
                        Value={Data.des_rcaObj ? Data.des_rcaObj.Label : ""}
                        md={4}
                      />
                      <BaseInfo
                        Label="DES_Ramus"
                        Value={Data.des_ramusObj ? Data.des_ramusObj.Label : ""}
                        md={4}
                      />
                    </GroupPanel>

                    <Box sx={sx.childDiv}>
                      <BaseInfo
                        Label="ТиСДО/Э-ийн хатгалтын хүндрэл"
                        Value={
                          Data.vd_kag_hundrelObj
                            ? Data.vd_kag_hundrelObj.Label
                            : ""
                        }
                        md={4}
                      />
                      <BaseInfo
                        Label="ТиСДО/Э-ийн хатгалтын хүндрэл (Бусад)"
                        Value={Data.vd_kag_hundrel_other}
                        md={4}
                      />
                      <BaseInfo
                        Label="ТиСДО/Э орсон хүрц"
                        Value={
                          Data.vd_kag_hurtsObj ? Data.vd_kag_hurtsObj.Label : ""
                        }
                        md={4}
                      />
                      <BaseInfo
                        Label="Cardiacarrest_admission"
                        Value={
                          Data.cardiacarrest_admissionObj
                            ? Data.cardiacarrest_admissionObj.Label
                            : ""
                        }
                        md={4}
                      />
                      <BaseInfo Label="Төгсгөл" Value={Data.tugsgul} md={4} />
                      <BaseInfo
                        Label="GRACE_score"
                        Value={Data.grace_score}
                        md={4}
                      />
                      <BaseInfo
                        Label="TIMI_riskscore"
                        Value={Data.time_riskscore}
                        md={4}
                      />
                    </Box>
                  </GroupPanel>
                </GroupPanel>
              ) : (
                <BaseNoData />
              )}
            </div>
          )}
        </div>
      ),
    });

    // Treatment
    Tabs.push({
      tabButton: "Эмчилгээ",
      tabContent: (
        <div>
          {!TreatmentLoading ? (
            <div>
              {TreatmentData ? (
                <div>
                  <GroupPanel level={2}>
                    <BaseInfo
                      Label="АХФС/ АРХ/ АРНС зөвлөсөн эсэх"
                      Value={
                        TreatmentData.emchilgee_checkObj
                          ? TreatmentData.emchilgee_checkObj.Label
                          : ""
                      }
                      md={4}
                    />
                    <GroupPanel level={3}>
                      <BaseInfo
                        Label="АХФС зөвлөсөн нэршил"
                        Value={
                          TreatmentData.axpc_nershilObj
                            ? TreatmentData.axpc_nershilObj.Label
                            : ""
                        }
                        md={4}
                      />
                      <BaseInfo
                        Label="АХФС  зөвлөсөн (бусад)"
                        Value={TreatmentData.axpc_other}
                        md={4}
                      />
                      <BaseInfo
                        Label="АХФС тун (мг/хоног)"
                        Value={TreatmentData.axpc_tun}
                        md={4}
                      />
                    </GroupPanel>
                    <GroupPanel level={3}>
                      <BaseInfo
                        Label="АРХ зөвлөсөн бол эмийн нэршил"
                        Value={
                          TreatmentData.apc_nershilObj
                            ? TreatmentData.apc_nershilObj.Label
                            : ""
                        }
                        md={4}
                      />
                      <BaseInfo
                        Label="АРХ зөвлөсөн (бусад)"
                        Value={TreatmentData.apc_other}
                        md={4}
                      />
                      <BaseInfo
                        Label="АРХ тун (мг/хоног)"
                        Value={TreatmentData.apc_tun}
                        md={4}
                      />
                    </GroupPanel>
                    <GroupPanel level={3}>
                      <BaseInfo
                        Label="Хэрэв АРНС зөвлөсөн бол тун"
                        Value={TreatmentData.aphc_tun}
                        md={4}
                      />
                    </GroupPanel>
                    <GroupPanel level={3}>
                      <BaseArrayInfo
                        Label="зөвлөөгүй бол шалтгаан"
                        Values={
                          TreatmentData.emchilgee_notcheckObj
                            ? TreatmentData.emchilgee_notcheckObj
                            : []
                        }
                        md={4}
                      />
                      <BaseInfo
                        Label="зөвлөөгүй бол шалтгаан (бусад)"
                        Value={TreatmentData.emchilgee_other}
                        md={4}
                      />
                    </GroupPanel>
                  </GroupPanel>

                  <GroupPanel level={2}>
                    <BaseInfo
                      Label="Бета хориглогч"
                      Value={
                        TreatmentData.is_beta_horiglogchObj
                          ? TreatmentData.is_beta_horiglogchObj.Label
                          : ""
                      }
                      md={4}
                    />
                    {TreatmentData.is_beta_horiglogchObj &&
                      TreatmentData.is_beta_horiglogchObj.Value === "y" && (
                        <div
                          style={{
                            position: "relative",
                            padding: "20px 10px 10px",
                            border: `1px solid ${colors.border.default}`,
                            margin: "20px 0 10px",
                            backgroundColor: colors.background.surface,
                          }}
                        >
                          <BaseInfo
                            Label="Хэрэв тийм бол"
                            Value={
                              TreatmentData.beta_horiglogch_nershilObj
                                ? TreatmentData.beta_horiglogch_nershilObj.Label
                                : ""
                            }
                            md={4}
                          />
                          <BaseInfo
                            Label="Бусад"
                            Value={TreatmentData.beta_horiglogch_other}
                            md={4}
                          />
                          <BaseInfo
                            Label="Тун (мг/хоног)"
                            Value={TreatmentData.beta_horiglogch_tun}
                            md={4}
                          />
                        </div>
                      )}
                  </GroupPanel>
                  <GroupPanel level={2}>
                    <BaseInfo
                      Label="Минералокортикоид рецепторын антагонист"
                      Value={
                        TreatmentData.is_mraObj
                          ? TreatmentData.is_mraObj.Label
                          : ""
                      }
                      md={4}
                    />
                    {TreatmentData.is_mraObj &&
                      TreatmentData.is_mraObj.Value === "y" && (
                        <div
                          style={{
                            position: "relative",
                            padding: "20px 10px 10px",
                            border: `1px solid ${colors.border.default}`,
                            margin: "20px 0 10px",
                            backgroundColor: colors.background.surface,
                          }}
                        >
                          <BaseInfo
                            Label="Хэрэв тийм бол"
                            Value={
                              TreatmentData.mra_checkObj
                                ? TreatmentData.mra_checkObj.Label
                                : ""
                            }
                            md={4}
                          />
                          <BaseInfo
                            Label="Тун (мг/хоног)"
                            Value={TreatmentData.mra_tun}
                            md={4}
                          />
                        </div>
                      )}
                    {/* no */}
                    {TreatmentData.is_mraObj &&
                      TreatmentData.is_mraObj.Value === "n" && (
                        <div
                          style={{
                            position: "relative",
                            padding: "20px 10px 10px",
                            border: `1px solid ${colors.border.default}`,
                            margin: "20px 0 10px",
                            backgroundColor: colors.background.surface,
                          }}
                        >
                          <BaseInfo
                            Label="Хэрэв үгүй бол"
                            Value={
                              TreatmentData.mra_notcheckObj
                                ? TreatmentData.mra_notcheckObj.Label
                                : ""
                            }
                            md={4}
                          />
                          <BaseInfo
                            Label="Бусад"
                            Value={TreatmentData.mra_notcheck_other}
                            md={4}
                          />
                        </div>
                      )}
                  </GroupPanel>
                  <GroupPanel level={2}>
                    <BaseInfo
                      Label="SGLT2 саатуулагч"
                      Value={
                        TreatmentData.is_sglt2Obj
                          ? TreatmentData.is_sglt2Obj.Label
                          : ""
                      }
                      md={4}
                    />
                    {/* yes */}
                    {TreatmentData.is_mraObj &&
                      TreatmentData.is_mraObj.Value === "y" && (
                        <div
                          style={{
                            position: "relative",
                            padding: "20px 10px 10px",
                            border: `1px solid ${colors.border.default}`,
                            margin: "20px 0 10px",
                            backgroundColor: colors.background.surface,
                          }}
                        >
                          <BaseInfo
                            Label="Хэрэв тийм бол"
                            Value={
                              TreatmentData.sglt2_checkObj
                                ? TreatmentData.sglt2_checkObj.Label
                                : ""
                            }
                            md={4}
                          />
                          <BaseInfo
                            Label="Тун"
                            Value={TreatmentData.sglt2_tun}
                            md={4}
                          />
                        </div>
                      )}
                    {/* no */}
                    {TreatmentData.is_mraObj &&
                      TreatmentData.is_mraObj.Value === "n" && (
                        <div
                          style={{
                            position: "relative",
                            padding: "20px 10px 10px",
                            border: `1px solid ${colors.border.default}`,
                            margin: "20px 0 10px",
                            backgroundColor: colors.background.surface,
                          }}
                        >
                          <BaseInfo
                            Label="Хэрэв тийм бол"
                            Value={
                              TreatmentData.sglt2_nocheckObj
                                ? TreatmentData.sglt2_nocheckObj.Label
                                : ""
                            }
                            md={4}
                          />
                          <BaseInfo
                            Label="Бусад"
                            Value={TreatmentData.sglt2_notcheck_other}
                            md={4}
                          />
                        </div>
                      )}
                  </GroupPanel>

                  <GroupPanel level={2}>
                    <BaseInfo
                      Label="Антиагрегант"
                      Value={
                        TreatmentData.is_antiagregantObj
                          ? TreatmentData.is_antiagregantObj.Label
                          : ""
                      }
                      md={4}
                    />
                    {TreatmentData.is_antiagregantObj &&
                      TreatmentData.is_antiagregantObj.Value === "n" && (
                        <div
                          style={{
                            position: "relative",
                            padding: "20px 10px 10px",
                            border: `1px solid ${colors.border.default}`,
                            margin: "20px 0 10px",
                            backgroundColor: colors.background.surface,
                          }}
                        >
                          <BaseInfo
                            Label="Антиагрегант зөвлөсөн эмийн нэршил"
                            Value={
                              TreatmentData.vd_antiagregant_checkObj
                                ? TreatmentData.vd_antiagregant_checkObj.Label
                                : ""
                            }
                            md={4}
                          />
                          <BaseInfo
                            Label="Бусад"
                            Value={TreatmentData.vd_antiagregant_other}
                            md={4}
                          />
                          <GroupPanel level={3}>
                            <BaseInfo
                              Label="Антиагрегант эмийн нэр"
                              Value={
                                TreatmentData.vd_antiagregant_em_nerObj
                                  ? TreatmentData.vd_antiagregant_em_nerObj
                                      .Label
                                  : ""
                              }
                              md={4}
                            />
                            <BaseInfo />
                          </GroupPanel>
                          <GroupPanel level={3}>
                            <BaseInfo
                              Label="Антиагрегант эмийн нэр"
                              Value={
                                TreatmentData.vd_antiagregant_em_ner1Obj
                                  ? TreatmentData.vd_antiagregant_em_ner1Obj
                                      .Label
                                  : ""
                              }
                              md={4}
                            />
                            <BaseInfo
                              Label="Антиагрегант эмийн тун1 (мг/хоног )"
                              Value={TreatmentData.vd_antiagregant_tun1}
                              md={4}
                            />
                          </GroupPanel>
                          <GroupPanel level={3}>
                            <BaseInfo
                              Label="Антиагрегант эмийн нэр2"
                              Value={
                                TreatmentData.vd_antiagregant_em_ner2Obj
                                  ? TreatmentData.vd_antiagregant_em_ner2Obj
                                      .Label
                                  : ""
                              }
                              md={4}
                            />
                            <BaseInfo
                              Label="Антиагрегант эмийн тун2 (мг/хоног )"
                              Value={TreatmentData.vd_antiagregant_tun2}
                              md={4}
                            />
                          </GroupPanel>
                        </div>
                      )}
                    <BaseInfo />
                    {/* yes */}
                  </GroupPanel>
                  <GroupPanel level={2}>
                    <BaseInfo
                      Label="Уухаар антикоагулянт"
                      Value={
                        TreatmentData.is_antikoagulyantObj
                          ? TreatmentData.is_antikoagulyantObj.Label
                          : ""
                      }
                      md={4}
                    />
                    {/* yes */}
                    {TreatmentData.is_antikoagulyantObj &&
                      TreatmentData.is_antikoagulyantObj.Value === "y" && (
                        <div
                          style={{
                            position: "relative",
                            padding: "20px 10px 10px",
                            border: `1px solid ${colors.border.default}`,
                            margin: "20px 0 10px",
                            backgroundColor: colors.background.surface,
                          }}
                        >
                          <GroupPanel level={3}>
                            <BaseInfo
                              Label="Уухаар антикоагулянт эм зөвлөсөн"
                              Value={
                                TreatmentData.vd_antikoagulyant_checkObj
                                  ? TreatmentData.vd_antikoagulyant_checkObj
                                  : ""
                              }
                              md={4}
                            />
                            <BaseInfo
                              Label="Бусад"
                              Value={TreatmentData.vd_antikoagulyant_other}
                              md={4}
                            />
                          </GroupPanel>
                          <GroupPanel level={3}>
                            <BaseInfo
                              Label="Уухаар антикоагулянт эмийн нэр"
                              Value={TreatmentData.vd_antikoagulyant_em_ner}
                              md={4}
                            />
                            <BaseInfo
                              Label="Уухаар антикоагулянт эмийн тун (мг/хоног )"
                              Value={TreatmentData.vd_antikoagulyant_tun}
                              md={4}
                            />
                          </GroupPanel>
                          <GroupPanel level={3}>
                            <BaseInfo
                              Label=""
                              Value={TreatmentData.vd_antikoagulyant_em_ner1}
                              md={4}
                            />
                            <BaseInfo
                              Label="Уухаар антикоагулянт эмийн тун1 (мг/хоног )"
                              Value={TreatmentData.vd_antikoagulyant_tun1}
                              md={4}
                            />
                          </GroupPanel>
                          <GroupPanel level={3}>
                            <BaseInfo
                              Label="Уухаар антикоагулянт эмийн нэр2"
                              Value={TreatmentData.vd_antikoagulyant_em_ner2}
                              md={4}
                            />
                            <BaseInfo
                              Label="Уухаар антикоагулянт эмийн тун2 (мг/хоног )"
                              Value={TreatmentData.vd_antikoagulyant_tun2}
                              md={4}
                            />
                          </GroupPanel>
                        </div>
                      )}
                  </GroupPanel>
                  <GroupPanel level={2}>
                    <BaseInfo
                      Label="Шээс хөөх эм"
                      Value={TreatmentData.is_shees_huuh_em}
                      md={4}
                    />
                    {/* yes */}

                    {TreatmentData.is_shees_huuh_emObj &&
                      TreatmentData.is_shees_huuh_emObj.Value === "y" && (
                        <div
                          style={{
                            position: "relative",
                            padding: "20px 10px 10px",
                            border: `1px solid ${colors.border.default}`,
                            margin: "20px 0 10px",
                            backgroundColor: colors.background.surface,
                          }}
                        >
                          <BaseInfo
                            Label="Шээс хөөх эм нэршил"
                            Value={
                              TreatmentData.shees_huuh_em_checkObj
                                ? TreatmentData.shees_huuh_em_checkObj.Label
                                : ""
                            }
                            md={4}
                          />
                          <BaseInfo
                            Label="Шээс хөөх эм (бусад)"
                            Value={TreatmentData.shees_huuh_em_other}
                            md={4}
                          />
                          <BaseInfo
                            Label="Шээс хөөх эм тун (мг/хоног)"
                            Value={TreatmentData.shees_huuh_em_tun}
                            md={4}
                          />
                        </div>
                      )}
                  </GroupPanel>
                  <GroupPanel level={2}>
                    <BaseInfo
                      Label="Липид бууруулах эм"
                      Value={
                        TreatmentData.is_lipid_buuruulahObj
                          ? TreatmentData.is_lipid_buuruulahObj.Label
                          : ""
                      }
                      md={4}
                    />
                    {/* yes */}
                    {TreatmentData.is_lipid_buuruulahObj &&
                      TreatmentData.is_lipid_buuruulahObj.Value === "y" && (
                        <div
                          style={{
                            position: "relative",
                            padding: "20px 10px 10px",
                            border: `1px solid ${colors.border.default}`,
                            margin: "20px 0 10px",
                            backgroundColor: colors.background.surface,
                          }}
                        >
                          <BaseInfo
                            Label="Липид бууруулах эм нэршил"
                            Value={
                              TreatmentData.lipid_buuruulah_em_checkObj
                                ? TreatmentData.lipid_buuruulah_em_checkObj
                                    .Label
                                : ""
                            }
                            md={4}
                          />
                          <BaseInfo
                            Label="Липид бууруулах эм (бусад)"
                            Value={TreatmentData.lipid_buuruulah_em_other}
                            md={4}
                          />
                          <BaseInfo
                            Label="Липид бууруулах эм тун (мг/хоног)"
                            Value={TreatmentData.lipid_buuruulah_em_tun}
                            md={4}
                          />
                        </div>
                      )}
                  </GroupPanel>
                  <GroupPanel level={2}>
                    <BaseInfo
                      Label="Судас тэлэгч эм"
                      Value={TreatmentData.is_sudas_telegch}
                      md={4}
                    />
                    {/* yes */}
                    {TreatmentData.is_sudas_telegchObj &&
                      TreatmentData.is_sudas_telegchObj.Value === "y" && (
                        <div
                          style={{
                            position: "relative",
                            padding: "20px 10px 10px",
                            border: `1px solid ${colors.border.default}`,
                            margin: "20px 0 10px",
                            backgroundColor: colors.background.surface,
                          }}
                        >
                          <BaseInfo
                            Label="Судас тэлэгч эм нэршил"
                            Value={TreatmentData.sudas_telegch_em_check}
                            md={4}
                          />
                          <BaseInfo
                            Label="Судас тэлэгч эм тун1 (мг/хоног)"
                            Value={TreatmentData.sudas_telegch_em_tun}
                            md={4}
                          />
                          <BaseInfo
                            Label="Судас тэлэгч эм тун2 (мг/хоног)"
                            Value={TreatmentData.sudas_telegch_em_tun2}
                            md={4}
                          />
                        </div>
                      )}
                  </GroupPanel>
                  <BaseInfo
                    Label="ХЯНАЛТ"
                    Value={TreatmentData.hyanalt}
                    md={4}
                  />
                  <BaseInfo
                    Label="Тэмдэглэл"
                    Value={TreatmentData.notes}
                    md={4}
                  />
                </div>
              ) : (
                <BaseNoData />
              )}
            </div>
          ) : (
            <BaseLoading />
          )}
        </div>
      ),
    });

    return Tabs;
  };

  render() {
    const { Alert, Data } = this.state;
    const { t } = this.props;
    return (
      <div style={{ height: "100%" }}>
        {Alert}
        {Data ? (
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
                        &nbsp;
                        {Helper.ObjectHelper.getDateYMD({
                          DateStr: Data.CreatedDate,
                        })}
                      </span>
                    </div>
                  </GridItem>
                  <GridItem xs={12} sm={6} md={6}>
                    <div style={{ float: "right" }}>
                      <UserDialogLink UserId={Data.CreateUserId || null}>
                        {t("Doctor")}: {"\u00A0"}
                        <span style={{ fontWeight: "400" }}>
                          {Data.Users ? Data.Users.UserName : ""}
                        </span>
                      </UserDialogLink>
                    </div>
                  </GridItem>
                </GridContainer>
              </GridItem>
              <GridItem xs={12} sm={12} md={12} style={{ padding: "0 50px" }}>
                <h4 style={{ textAlign: "center", fontWeight: "500" }}>
                  {t("Vascular disease")}
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
        ) : (
          <BaseNoData />
        )}
      </div>
    );
  }
}

export default withTranslation(undefined, { withRef: true })(VascularDisease);
