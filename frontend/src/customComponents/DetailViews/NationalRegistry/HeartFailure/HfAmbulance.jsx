import { withTranslation } from "react-i18next";
import React, { Component } from "react";
// translation
// @mui/material components
import { Box } from "@mui/material";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// custom components
import BaseNoData from "customComponents/BaseNoData";
import BaseInfo from "customComponents/BaseViewControls/BaseInfo";
import BaseArrayInfo from "customComponents/BaseViewControls/BaseArrayInfo";
// import BaseLabel from "customComponents/BaseViewControls/BaseLabel";
import CustomTab from "customComponents/CustomTab";
import BaseLoading from "customComponents/BaseLoading";
// import CustomContainer from "customComponents/CustomContainer";
import UserDialogLink from "customComponents/DoctorProfile/UserDialogLink";
import GroupPanel from "customComponents/GroupPanel";
// helper
import Helper from "helper";
import { colors } from "@/theme/colors";

const sxStyles = {
  childDiv: {
    position: "relative",
    padding: "10px",
    border: `1px solid ${colors.border.default}`,
    margin: "10px",
    backgroundColor: colors.background.surfaceAlt,
  },
};

class HfAmbulance extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Alert: null,
      Data: null,
      TestData: null,
      TreatmentData: null,
      Loading: false,
      TestLoading: false,
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
    this.setState({ Loading: true });
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
        "AmbulanceId",
        DataId,
        SubSearchOption.SearchField,
        "Equals",
      );
      await Helper.BaseCrudHelper.BaseGetDetailInfo(
        { ObjectName: "HfAmbulance", SearchOption },
        (resData) => {
          resData &&
            resData.Success &&
            resData.Data &&
            this.setState({ Data: Object.assign({}, resData.Data) });
          this.setState({ Loading: false });
        },
      );
      // Test Data
      await Helper.BaseCrudHelper.BaseGetDetailInfo(
        { ObjectName: "HfAmbulanceTest", SearchOption: SubSearchOption },
        (resData) => {
          resData &&
            resData.Success &&
            resData.Data &&
            this.setState({ TestData: Object.assign({}, resData.Data) });
          this.setState({ TestLoading: false });
        },
      );
      // Treatment Data
      await Helper.BaseCrudHelper.BaseGetDetailInfo(
        { ObjectName: "HfAmbulanceTreatment", SearchOption: SubSearchOption },
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
          Url: "/HfAmbulance/PrintReport",
          Data: { Id: DataId },
          FileName: "HeartFailureAmbulance.pdf",
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

  GetPrintNew = async (callback) => {
    const { DataId } = this;
    let alert = null;
    if (DataId) {
      await Helper.BaseCrudHelper.BasePrintReport(
        {
          Url: "/HfAmbulance/PrintReportNew",
          Data: { Id: DataId },
          FileName: "HeartFailureAmbulance.pdf",
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

  //
  Confirm = async (callback) => {
    const { DataId } = this;
    let alert = null;
    if (DataId) {
      await Helper.BaseCrudHelper.CallService(
        "/HfAmbulance/Confirm",
        { Id: DataId },
        (resData) => {
          if (resData) {
            alert = Helper.BaseCrudHelper.ShowAlert(
              resData.Message,
              resData.Success,
              () => {
                callback && callback();
                this.setState({ Alert: null });
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
          callback && callback();
          this.setState({ Alert: null });
        },
      );
      this.setState({ Alert: alert });
    }
  };

  GetTabs = () => {
    const {
      Data,
      TestData,
      TreatmentData,
      Loading,
      TestLoading,
      TreatmentLoading,
    } = this.state;
    const { t } = this.props;

    var Tabs = [];
    Tabs.push({
      tabButton: "Үзлэг",
      tabContent: (
        <div>
          {Loading ? (
            <BaseLoading />
          ) : (
            <div>
              {Data ? (
                <div>
                  <GroupPanel
                    title={t("Амбулаторийн үзлэгийн мэдээлэл")}
                    level={1}
                  >
                    <BaseInfo
                      Label="Зүрхний дутагдал оношлогдсон огноо"
                      Value={Data.diagnosed_year}
                      md={4}
                    />
                    {/* <BaseInfo
                      Label="Огноо"
                      Value={Data.ambulance_date}
                      md={4}
                    /> */}
                    <BaseInfo
                      Label="Амбулаторийн төрөл"
                      Value={
                        Data.ambulance_typeObj
                          ? Data.ambulance_typeObj.Label
                          : ""
                      }
                      md={4}
                    />
                    <BaseInfo
                      Label="Эрүүл мэндийн байгууллага"
                      Value={Data.Organization ? Data.Organization.Name : ""}
                      md={4}
                      WithLabel={true}
                    />
                    {!Data.Organization && Data.organization_other && (
                      <BaseInfo
                        Label="Эрүүл мэндийн байгууллага (Бусад)"
                        Value={Data.organization_other}
                        md={4}
                      />
                    )}
                  </GroupPanel>
                  <GroupPanel
                    title={t("Үзлэгийн үеийн зовуурь, шинж тэмдэг")}
                    level={1}
                  >
                    {/* <BaseInfo
                          Label="Артерийн даралт (мм.муб)"
                          Value={Data.ad}
                          md={4}
                        /> */}
                    <BaseInfo
                      Label="Артерийн даралт (систол) мм.муб"
                      Value={Data.ad_deed}
                      md={4}
                    />
                    <BaseInfo
                      Label="Артерийн даралт (диастол) мм.муб"
                      Value={Data.ad_dood}
                      md={4}
                    />
                    <BaseInfo Label="ЗЦТ (удаа/мин)" Value={Data.zts} md={4} />
                    <BaseInfo Label="Жин (кг)" Value={Data.jin} md={4} />
                    <BaseInfo
                      Label="Нью-Йоркийн үйл ажиллагааны ангилал (NYHA)"
                      Value={Data.nyhaObj ? Data.nyhaObj.Label : ""}
                      md={4}
                    />

                    <BaseArrayInfo
                      Label="Одоогийн зовуурь"
                      TextField={"Label"}
                      LinedField={"Lined"}
                      Values={Data.heartacheObj ? Data.heartacheObj : []}
                      md={4}
                    />
                    <BaseInfo
                      Label="Зовуурь (Бусад)"
                      Value={Data.heartache_other}
                      md={4}
                    />

                    <GroupPanel title={t("Илрэх шинж тэмдэг")} level={2}>
                      {/* zah */}
                      <BaseInfo
                        Label="ЗД-ын захын шинж тэмдэг"
                        Value={
                          Data.hf_zahiin_shinjObj
                            ? Data.hf_zahiin_shinjObj.Label
                            : ""
                        }
                        md={4}
                      />
                      {Data.hf_zahiin_shinjObj &&
                        Data.hf_zahiin_shinjObj.Value === "y" && (
                          <div
                            style={{
                              position: "relative",
                              padding: "20px 10px 10px",
                              border: `1px solid ${colors.border.default}`,
                              margin: "20px 0 10px",
                              backgroundColor: colors.background.surface,
                            }}
                          >
                            <BaseArrayInfo
                              Label="ЗД-ын захын шинж тэмдэг"
                              TextField={"Label"}
                              LinedField={"Lined"}
                              Values={
                                Data.hf_zahiin_shinj_codeObj
                                  ? Data.hf_zahiin_shinj_codeObj
                                  : []
                              }
                              md={4}
                            />
                          </div>
                        )}
                      {/* uushig */}
                      <BaseInfo
                        Label="ЗД-ын уушгины шинж тэмдэг"
                        Value={
                          Data.hf_uushig_shinjObj
                            ? Data.hf_uushig_shinjObj.Label
                            : ""
                        }
                        md={4}
                      />
                      {Data.hf_uushig_shinjObj &&
                        Data.hf_uushig_shinjObj.Value === "y" && (
                          <div
                            style={{
                              position: "relative",
                              padding: "20px 10px 10px",
                              border: `1px solid ${colors.border.default}`,
                              margin: "20px 0 10px",
                              backgroundColor: colors.background.surface,
                            }}
                          >
                            <BaseArrayInfo
                              Label="ЗД-ын уушгины шинж тэмдэг"
                              TextField={"Label"}
                              LinedField={"Lined"}
                              Values={
                                Data.hf_uushig_shinj_codeObj
                                  ? Data.hf_uushig_shinj_codeObj
                                  : []
                              }
                              md={4}
                            />
                          </div>
                        )}
                      {/* zurh */}
                      <BaseInfo
                        Label="ЗД-ын зүрхний шинж тэмдэг"
                        Value={
                          Data.hf_zurh_shinjObj
                            ? Data.hf_zurh_shinjObj.Label
                            : ""
                        }
                        md={4}
                      />
                      {Data.hf_zurh_shinjObj &&
                        Data.hf_zurh_shinjObj.Value === "y" && (
                          <div
                            style={{
                              position: "relative",
                              padding: "20px 10px 10px",
                              border: `1px solid ${colors.border.default}`,
                              margin: "20px 0 10px",
                              backgroundColor: colors.background.surface,
                            }}
                          >
                            <BaseArrayInfo
                              Label="ЗД-ын зүрхний шинж тэмдэг"
                              TextField={"Label"}
                              LinedField={"Lined"}
                              Values={
                                Data.hf_zurh_shinj_codeObj
                                  ? Data.hf_zurh_shinj_codeObj
                                  : []
                              }
                              md={4}
                            />
                          </div>
                        )}
                      {/* hevlii */}
                      <BaseInfo
                        Label="ЗД-ын хэвлийн шинж тэмдэг"
                        Value={
                          Data.hf_hevliin_shinjObj
                            ? Data.hf_hevliin_shinjObj.Label
                            : ""
                        }
                        md={4}
                      />
                      {Data.hf_hevliin_shinjObj &&
                        Data.hf_hevliin_shinjObj.Value === "y" && (
                          <div
                            style={{
                              position: "relative",
                              padding: "20px 10px 10px",
                              border: `1px solid ${colors.border.default}`,
                              margin: "20px 0 10px",
                              backgroundColor: colors.background.surface,
                            }}
                          >
                            <BaseArrayInfo
                              Label="ЗД-ын хэвлийн шинж тэмдэг"
                              TextField={"Label"}
                              LinedField={"Lined"}
                              Values={
                                Data.hf_hevliin_shinj_codeObj
                                  ? Data.hf_hevliin_shinj_codeObj
                                  : []
                              }
                              md={4}
                            />
                          </div>
                        )}
                    </GroupPanel>
                  </GroupPanel>
                </div>
              ) : (
                <BaseNoData />
              )}
            </div>
          )}
        </div>
      ),
    });

    // Test
    Tabs.push({
      tabButton: "Шинжилгээ",
      tabContent: (
        <div>
          {TestLoading ? (
            <BaseLoading />
          ) : (
            <div>
              {TestData ? (
                <div>
                  <GroupPanel
                    title={t("Үзлэгийн үеийн шинжилгээнүүд")}
                    level={1}
                  >
                    <GroupPanel title={t("Лабораторийн шинжилгээ")} level={2}>
                      <BaseInfo
                        Label="Огноо"
                        Value={TestData.test_date}
                        md={4}
                      />
                      <BaseInfo
                        Label="Цагаан эс (x10^9/л)"
                        Value={TestData.tsagaan_es}
                        md={4}
                      />
                      <BaseInfo
                        Label="Ялтас эс (x10^9/л)"
                        Value={TestData.yaltas_es}
                        md={4}
                      />
                      <BaseInfo
                        Label="Гемоглобин (г/дл)"
                        Value={TestData.gemoglobin}
                        md={4}
                      />
                      <BaseInfo
                        Label="Натри (ммоль/л)"
                        Value={TestData.natri}
                        md={4}
                      />
                      <BaseInfo
                        Label="Kали (ммоль/л)"
                        Value={TestData.kali}
                        md={4}
                      />
                      <BaseInfo
                        Label="Шээсний хүчил (мг/дл)"
                        Value={TestData.sheesnii_huchil}
                        md={4}
                      />
                      <BaseInfo
                        Label="Креатинин"
                        Value={TestData.creatinin}
                        md={4}
                      />
                      <BaseInfo Value={TestData.creatinin_type} md={4} />
                      <BaseInfo
                        Label="Мочевин (ОУН/л)"
                        Value={TestData.mochevin}
                        md={4}
                      />
                      <BaseInfo
                        Label="Альбумин (г/л)"
                        Value={TestData.albumin}
                        md={4}
                      />
                      <BaseInfo
                        Label="ТШХ (мл/мин)"
                        Value={TestData.t_sh_h}
                        md={4}
                      />
                      <BaseInfo
                        Label="Алат (ОУН/л)"
                        Value={TestData.alat}
                        md={4}
                      />
                      <BaseInfo
                        Label="СРБ (мг/дл)"
                        Value={TestData.s_r_b}
                        md={4}
                      />
                      <BaseInfo
                        Label="Асат (ОУН/л)"
                        Value={TestData.asat}
                        md={4}
                      />
                      <BaseInfo
                        Label="ГГТ (ОУН/л)"
                        Value={TestData.g_g_t}
                        md={4}
                      />
                      <BaseInfo
                        Label="Дигоксин түвшин (мкг/л)"
                        Value={TestData.digoksin_level}
                        md={4}
                      />
                      <BaseInfo
                        Label="Төмөр (ммоль/л)"
                        Value={TestData.tumur}
                        md={4}
                      />
                      <BaseInfo
                        Label="Ферритин (мкг/л,  нг/мл)"
                        Value={TestData.ferritin}
                        md={4}
                      />
                      <BaseInfo Value={TestData.hf_ferritin_type} md={4} />
                      <BaseInfo
                        Label="NT-proBNP (пг/мл)"
                        Value={TestData.n_t_pro_b_n_p}
                        md={4}
                      />
                      <BaseInfo
                        Label="BNP (пг/мл)"
                        Value={TestData.b_n_p}
                        md={4}
                      />
                      <BaseInfo
                        Label="HbA1c (% (ЧШ-тэй))"
                        Value={TestData.hb_a1c}
                        md={4}
                      />
                      <BaseInfo
                        Label="Санамсаргүй глюкоз (ммоль/л)"
                        Value={TestData.sanamsargui_glukoz}
                        md={4}
                      />
                    </GroupPanel>
                    <div style={{ height: "40px" }}></div>
                    <GroupPanel title={t("Зүрхний цахилгаан бичлэг")} level={2}>
                      <BaseInfo
                        Label="Огноо"
                        Value={TestData.tsa_bichleg_date}
                        md={4}
                      />
                      <BaseInfo
                        Label="QRS бүрдэл"
                        Value={TestData.qrs_burdel}
                        md={4}
                      />
                      <BaseArrayInfo
                        Label="Хэмнэл"
                        TextField={"Label"}
                        LinedField={"Lined"}
                        Values={
                          TestData.hf_rhythmObj ? TestData.hf_rhythmObj : []
                        }
                        md={4}
                      />
                      <BaseInfo
                        Label="Хэмнэл (Бусад)"
                        Value={TestData.hf_rhythm_other}
                        md={4}
                      />
                      <BaseArrayInfo
                        Label="Зүрхний хориг"
                        TextField={"Label"}
                        LinedField={"Lined"}
                        Values={
                          TestData.hf_zurh_horigObj
                            ? TestData.hf_zurh_horigObj
                            : []
                        }
                        md={4}
                      />
                      <BaseInfo
                        Label="Зүрхний хориг (Бусад)"
                        Value={TestData.hf_zurh_horig_other}
                        md={4}
                      />
                    </GroupPanel>
                    <div style={{ height: "40px" }}></div>
                    <GroupPanel
                      title={t("Зүрхний хэт авиан шинжилгээ")}
                      level={2}
                    >
                      <BaseInfo
                        Label="Огноо"
                        Value={TestData.het_avia_date}
                        md={4}
                      />
                      <BaseInfo
                        Label="LVDd (mm)"
                        Value={TestData.lvdd}
                        md={4}
                      />
                      <BaseInfo
                        Label="LVDs (mm)"
                        Value={TestData.lvds}
                        md={4}
                      />
                      <BaseInfo
                        Label="IVSs (mm)"
                        Value={TestData.ivss}
                        md={4}
                      />
                      <BaseInfo Label="PWd (mm)" Value={TestData.pwd} md={4} />
                      <BaseInfo
                        Label="LVmass (mm)"
                        Value={TestData.lvmass}
                        md={4}
                      />
                      <BaseInfo
                        Label="LVEF (Simpson method) (%)"
                        Value={TestData.lvef}
                        md={4}
                      />
                      <BaseInfo
                        Label="LV strain (mm)"
                        Value={TestData.lv_strain}
                        md={4}
                      />
                      <BaseInfo
                        Label="LA volume (ml)"
                        Value={TestData.la_volume}
                        md={4}
                      />
                      <div>
                        <BaseInfo
                          Label="Med (mm)"
                          Value={TestData.e_e_med}
                          md={4}
                        />
                        <BaseInfo
                          Label="Lat (mm)"
                          Value={TestData.e_e_lat}
                          md={4}
                        />
                      </div>
                      <BaseInfo
                        Label="Уушгины артерийн систолын даралт (мм куб)"
                        Value={TestData.uushig_systol_daralt}
                        md={4}
                      />
                      <BaseInfo
                        Label="RV FAC (%)"
                        Value={TestData.rv_fac}
                        md={4}
                      />

                      {/* Havhlagiin emgeg */}
                      <BaseInfo
                        Label="Хавхлагын эмгэг"
                        Value={
                          TestData.havhlaga_emgegObj
                            ? TestData.havhlaga_emgegObj.Label
                            : ""
                        }
                        md={4}
                      />
                      {TestData.havhlaga_emgegObj &&
                        TestData.havhlaga_emgeg.Value === "y" && (
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
                                TestData.h_e_2xx_narObj
                                  ? TestData.h_e_2xx_narObj
                                  : ""
                              }
                              md={4}
                            />
                            <BaseInfo
                              Label="2хх-ын дутагдал"
                              Value={
                                TestData.h_e_2xx_dutObj
                                  ? TestData.h_e_2xx_dutObj
                                  : ""
                              }
                              md={4}
                            />
                            <BaseInfo
                              Label="3хх-ын нарийсал"
                              Value={
                                TestData.h_e_3xx_narObj
                                  ? TestData.h_e_3xx_narObj
                                  : ""
                              }
                              md={4}
                            />
                            <BaseInfo
                              Label="3хх-ын дутагдал"
                              Value={
                                TestData.h_e_3xx_dutObj
                                  ? TestData.h_e_3xx_dutObj
                                  : ""
                              }
                              md={4}
                            />
                            <BaseInfo
                              Label="Гол судасны хавхлагын нарийсал"
                              Value={
                                TestData.h_e_gol_narObj
                                  ? TestData.h_e_gol_narObj
                                  : ""
                              }
                              md={4}
                            />
                            <BaseInfo
                              Label="Гол судасны хавхлагын дутагдал"
                              Value={
                                TestData.h_e_gol_dutObj
                                  ? TestData.h_e_gol_dutObj
                                  : ""
                              }
                              md={4}
                            />
                            <BaseInfo
                              Label="УА-ын хавхлагын нарийсал"
                              Value={
                                TestData.h_e_ua_narObj
                                  ? TestData.h_e_ua_narObj
                                  : ""
                              }
                              md={4}
                            />
                            <BaseInfo
                              Label="УА-ын хавхлагын дутагдал"
                              Value={
                                TestData.h_e_ua_dutObj
                                  ? TestData.h_e_ua_dutObj.Label
                                  : ""
                              }
                              md={4}
                            />
                          </div>
                        )}

                      <GridContainer>
                        <GridItem xs={12} md={6}>
                          <GroupPanel
                            title={t("MIBI (сүүлийн шинжилгээ)")}
                            level={3}
                          >
                            <BaseInfo
                              Label="Огноо"
                              Value={TestData.mibi_date}
                              md={4}
                            />
                            <BaseInfo
                              Label="LVEF (%)"
                              Value={TestData.mibi_lvef}
                              md={4}
                            />
                            <BaseInfo
                              Label="RVEF (%)"
                              Value={TestData.mibi_rvef}
                              md={4}
                            />
                          </GroupPanel>
                        </GridItem>
                        <GridItem xs={12} md={6}>
                          <GroupPanel
                            title={t("MRI (сүүлийн шинжилгээ)")}
                            level={3}
                          >
                            <BaseInfo
                              Label="Огноо"
                              Value={TestData.mri_date}
                              md={4}
                            />
                            <BaseInfo
                              Label="LVEF (%)"
                              Value={TestData.mri_lvef}
                              md={4}
                            />
                            <BaseInfo
                              Label="RVEF (%)"
                              Value={TestData.mri_rvef}
                              md={4}
                            />
                          </GroupPanel>
                        </GridItem>
                      </GridContainer>
                    </GroupPanel>
                  </GroupPanel>

                  <GroupPanel
                    title={t("Титэм судсан дотуурх оношилгоо")}
                    level={1}
                  >
                    <BaseInfo
                      Label="Огноо"
                      Value={TestData.titem_date}
                      md={4}
                    />
                    <BaseInfo
                      Label="Дүгнэлт"
                      Value={
                        TestData.hf_titem_dvgneltObj
                          ? TestData.hf_titem_dvgneltObj.Label
                          : ""
                      }
                      md={4}
                    />
                  </GroupPanel>
                  <GroupPanel title={t("Бусад шинжилгээнүүд")} level={1}>
                    <BaseArrayInfo
                      Label="Хэрэв доорх өвөрмөц шинжилгээнээс хийгдсэн бол"
                      TextField={"Label"}
                      LinedField={"Lined"}
                      Values={
                        TestData.hf_busad_shinjilgeeObj
                          ? TestData.hf_busad_shinjilgeeObj
                          : []
                      }
                      md={4}
                    />
                    <BaseInfo
                      Label="Эмгэг судлалын хариуг бичнэ үү"
                      Value={TestData.biopsi_uurchlult}
                      md={4}
                    />
                    <BaseInfo
                      Label="VO2max (мл/кг/мин)"
                      Value={TestData.cardio_pul_vo_max}
                      md={4}
                    />
                  </GroupPanel>
                </div>
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
          {TreatmentLoading ? (
            <BaseLoading />
          ) : (
            <div>
              {TreatmentData ? (
                <div>
                  <GroupPanel title={t("Эмчилгээ")} level={1}>
                    <BaseInfo
                      Label="АХФС/ АРХ/ АРНС зөвлөсөн эсэх"
                      Value={
                        TreatmentData && TreatmentData.hf_emchilgee_checkObj
                          ? TreatmentData.hf_emchilgee_checkObj.Label
                          : ""
                      }
                      md={4}
                    />
                    {/* Хэрэв АХФС зөвлөсөн бол эмийн нэршлийг сонгож, тунг бичнэ үү */}
                    <BaseInfo
                      Label="Хэрэв АХФС зөвлөсөн бол"
                      Value={
                        TreatmentData && TreatmentData.hf_axpc_nershilObj
                          ? TreatmentData.hf_axpc_nershilObj.Label
                          : ""
                      }
                      md={4}
                    />
                    <BaseInfo
                      Label="АХФС бусад"
                      Value={TreatmentData && TreatmentData.hf_axpc_other}
                      md={4}
                    />
                    <BaseInfo
                      Label="АХФС тун"
                      Value={TreatmentData && TreatmentData.hf_axpc_tun}
                      md={4}
                    />
                    {/* Хэрэв АРХ зөвлөсөн бол эмийн нэршлийг сонгож, тунг бичнэ үү */}
                    <BaseInfo
                      Label="Хэрэв АХС зөвлөсөн бол"
                      Value={
                        TreatmentData && TreatmentData.hf_apc_nershilObj
                          ? TreatmentData.hf_apc_nershilObj.Label
                          : ""
                      }
                      md={4}
                    />
                    <BaseInfo
                      Label="АРХ бусад"
                      Value={TreatmentData && TreatmentData.hf_apc_other}
                      md={4}
                    />
                    <BaseInfo
                      Label="АРХ тун"
                      Value={TreatmentData && TreatmentData.hf_apc_tun}
                      md={4}
                    />
                    {/* Хэрэв АРНС зөвлөсөн бол тунг бичнэ үү */}
                    <BaseInfo
                      Label="Хэрэв АРНС зөвлөсөн бол тун"
                      Value={TreatmentData && TreatmentData.aphc_tun}
                      md={4}
                    />
                    {/*  */}
                    <BaseInfo
                      Label="Дээрхээс аль нэгийг зөвлөөгүй бол"
                      Value={
                        TreatmentData && TreatmentData.hf_emchilgee_notcheckObj
                          ? TreatmentData.hf_emchilgee_notcheckObj.Label
                          : ""
                      }
                      md={4}
                    />
                    <BaseInfo
                      Label="Бусад"
                      Value={
                        TreatmentData &&
                        TreatmentData.hf_emchilgee_notcheck_other
                      }
                      md={4}
                    />
                    <BaseInfo
                      Label="Бета хориглогч"
                      Value={
                        TreatmentData && TreatmentData.is_beta_horiglogchObj
                          ? TreatmentData.is_beta_horiglogchObj.Label
                          : ""
                      }
                      md={4}
                    />
                    {TreatmentData &&
                      TreatmentData.is_beta_horiglogchObj &&
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
                              TreatmentData &&
                              TreatmentData.hf_beta_horiglogch_nershilObj
                                ? TreatmentData.hf_beta_horiglogch_nershilObj
                                    .Label
                                : ""
                            }
                            md={4}
                          />
                          <BaseInfo
                            Label="Бусад"
                            Value={
                              TreatmentData &&
                              TreatmentData.hf_beta_horiglogch_other
                            }
                            md={4}
                          />
                          <BaseInfo
                            Label="Тун (мг/хоног)"
                            Value={
                              TreatmentData &&
                              TreatmentData.hf_beta_horiglogch_tun
                            }
                            md={4}
                          />
                        </div>
                      )}
                    {/* Минералокортикоид рецепторын антагонист */}
                    <BaseInfo
                      Label="Минералокортикоид рецепторын антагонист"
                      Value={
                        TreatmentData && TreatmentData.is_mraObj
                          ? TreatmentData.is_mraObj.Label
                          : ""
                      }
                      md={4}
                    />
                    {TreatmentData &&
                      TreatmentData.is_mraObj &&
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
                              TreatmentData && TreatmentData.hf_mra_checkObj
                                ? TreatmentData.hf_mra_checkObj.Label
                                : ""
                            }
                            md={4}
                          />
                          <BaseInfo
                            Label="Тун (мг/хоног)"
                            Value={TreatmentData && TreatmentData.hf_mra_tun}
                            md={4}
                          />
                        </div>
                      )}
                    {TreatmentData &&
                      TreatmentData.is_mraObj &&
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
                              TreatmentData && TreatmentData.hf_mra_notcheckObj
                                ? TreatmentData.hf_mra_notcheckObj.Label
                                : ""
                            }
                            md={4}
                          />
                          <BaseInfo
                            Label="Бусад"
                            Value={
                              TreatmentData &&
                              TreatmentData.hf_mra_notcheck_other
                            }
                            md={4}
                          />
                        </div>
                      )}

                    <BaseInfo
                      Label="SGLT2 саатуулагч"
                      Value={
                        TreatmentData && TreatmentData.is_sglt2Obj
                          ? TreatmentData.is_sglt2Obj.Label
                          : ""
                      }
                      md={4}
                    />
                    {TreatmentData &&
                      TreatmentData.is_sglt2Obj &&
                      TreatmentData.is_sglt2Obj.Value === "y" && (
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
                              TreatmentData && TreatmentData.hf_sglt2_checkObj
                                ? TreatmentData.hf_sglt2_checkObj.Label
                                : ""
                            }
                            md={4}
                          />
                          <BaseInfo
                            Label="Тун (мг/хоног)"
                            Value={TreatmentData && TreatmentData.hf_sglt2_tun}
                            md={4}
                          />
                        </div>
                      )}

                    {TreatmentData &&
                      TreatmentData.is_sglt2Obj &&
                      TreatmentData.is_sglt2Obj.Value === "n" && (
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
                              TreatmentData &&
                              TreatmentData.hf_sglt2_notcheckObj
                                ? TreatmentData.hf_sglt2_notcheckObj.Label
                                : ""
                            }
                            md={4}
                          />
                          <BaseInfo
                            Label="Бусад"
                            Value={
                              TreatmentData &&
                              TreatmentData.hf_sglt2_notcheck_other
                            }
                            md={4}
                          />
                        </div>
                      )}

                    <BaseInfo
                      Label="Ивабрадин зөвлөсөн эсэх"
                      Value={
                        TreatmentData && TreatmentData.is_ibabradinObj
                          ? TreatmentData.is_ibabradinObj.Label
                          : ""
                      }
                      md={4}
                    />
                    {TreatmentData &&
                      TreatmentData.is_ibabradinObj &&
                      TreatmentData.is_ibabradinObj.Value === "y" && (
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
                            Label="Тун (мг/хоног)"
                            Value={TreatmentData && TreatmentData.ibabradin_tun}
                            md={4}
                          />
                        </div>
                      )}

                    <BaseInfo
                      Label="Антитромботик зөвлөсөн эсэх"
                      Value={
                        TreatmentData && TreatmentData.is_antitromboticObj
                          ? TreatmentData.is_antitromboticObj.Label
                          : ""
                      }
                      md={4}
                    />
                    {TreatmentData &&
                      TreatmentData.is_antitromboticObj &&
                      TreatmentData.is_antitromboticObj.Value === "y" && (
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
                              TreatmentData &&
                              TreatmentData.hf_antitrombotic_checkObj
                                ? TreatmentData.hf_antitrombotic_checkObj.Label
                                : ""
                            }
                            md={4}
                          />
                          <BaseInfo
                            Label="Бусад"
                            Value={
                              TreatmentData &&
                              TreatmentData.hf_antitrombotic_other
                            }
                            md={4}
                          />
                        </div>
                      )}

                    <BaseInfo
                      Label="Дигоксин"
                      Value={
                        TreatmentData && TreatmentData.is_digoksinObj
                          ? TreatmentData.is_digoksinObj.Label
                          : ""
                      }
                      md={4}
                    />
                    {TreatmentData &&
                      TreatmentData.is_digoksinObj &&
                      TreatmentData.is_digoksinObj.Value === "y" && (
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
                            Label="Тун (мг/хоног)"
                            Value={TreatmentData && TreatmentData.digoksin_tun}
                            md={4}
                          />
                        </div>
                      )}

                    <BaseInfo
                      Label="Шээс хөөх эм"
                      Value={
                        TreatmentData && TreatmentData.is_shees_huuh_emObj
                          ? TreatmentData.is_shees_huuh_emObj.Label
                          : ""
                      }
                      md={4}
                    />
                    {TreatmentData &&
                      TreatmentData.is_shees_huuh_emObj &&
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
                            Label="Хэрэв тийм бол"
                            Value={
                              TreatmentData &&
                              TreatmentData.hf_shees_huuh_em_checkObj
                                ? TreatmentData.hf_shees_huuh_em_checkObj.Label
                                : ""
                            }
                            md={4}
                          />
                          <BaseInfo
                            Label="Бусад"
                            Value={
                              TreatmentData &&
                              TreatmentData.hf_shees_huuh_em_other
                            }
                            md={4}
                          />
                          <BaseInfo
                            Label="Тун (мг/хоног)"
                            Value={
                              TreatmentData &&
                              TreatmentData.hf_shees_huuh_em_tun
                            }
                            md={4}
                          />
                        </div>
                      )}

                    <BaseInfo
                      Label="Липид бууруулах эм"
                      Value={
                        TreatmentData && TreatmentData.is_lipid_buuruulahObj
                          ? TreatmentData.is_lipid_buuruulahObj.Label
                          : ""
                      }
                      md={4}
                    />
                    {TreatmentData &&
                      TreatmentData.is_lipid_buuruulahObj &&
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
                            Label="Хэрэв тийм бол"
                            Value={
                              TreatmentData &&
                              TreatmentData.hf_lipid_buuruulah_em_checkObj
                                ? TreatmentData.hf_lipid_buuruulah_em_checkObj
                                    .Label
                                : ""
                            }
                            md={4}
                          />
                          <BaseInfo
                            Label="Бусад"
                            Value={
                              TreatmentData &&
                              TreatmentData.hf_lipid_buuruulah_em_other
                            }
                            md={4}
                          />
                          <BaseInfo
                            Label="Тун (мг/хоног)"
                            Value={
                              TreatmentData &&
                              TreatmentData.hf_lipid_buuruulah_em_tun
                            }
                            md={4}
                          />
                        </div>
                      )}

                    <BaseInfo
                      Label="Судас тэлэгч эм"
                      Value={
                        TreatmentData && TreatmentData.is_sudas_telegchObj
                          ? TreatmentData.is_sudas_telegchObj.Label
                          : ""
                      }
                      md={4}
                    />
                    {TreatmentData &&
                      TreatmentData.is_sudas_telegchObj &&
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
                            Label="Хэрэв тийм бол"
                            Value={
                              TreatmentData &&
                              TreatmentData.hf_sudas_telegch_em_checkObj
                                ? TreatmentData.hf_sudas_telegch_em_checkObj
                                    .Label
                                : ""
                            }
                            md={4}
                          />
                          <BaseInfo
                            Label="Тун (мг/хоног)"
                            Value={
                              TreatmentData &&
                              TreatmentData.hf_sudas_telegch_em_tun
                            }
                            md={4}
                          />
                        </div>
                      )}
                    {/* hf_tuhuurumj_zowloson */}
                    <BaseInfo
                      Label="Төхөөрөмжит эмчилгээ зөвлөсөн, санал болгосон эсэх"
                      Value={
                        TreatmentData && TreatmentData.hf_tuhuurumj_zowlosonObj
                          ? TreatmentData.hf_tuhuurumj_zowlosonObj.Label
                          : ""
                      }
                      md={4}
                    />
                    {TreatmentData &&
                      TreatmentData.hf_tuhuurumj_zowlosonObj &&
                      TreatmentData.hf_tuhuurumj_zowlosonObj.Value === "y" && (
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
                              TreatmentData &&
                              TreatmentData.hf_tuhuurumj_zowloson_checkObj
                                ? TreatmentData.hf_tuhuurumj_zowloson_checkObj
                                    .Label
                                : ""
                            }
                            md={4}
                          />
                        </div>
                      )}
                  </GroupPanel>

                  <GroupPanel title={t("Сэргээн засах эмчилгээ")} level={1}>
                    <BaseInfo
                      Label="Сэргээн засах эмчилгээ"
                      Value={
                        TreatmentData && TreatmentData.sergen_zasahObj
                          ? TreatmentData.sergen_zasahObj.Label
                          : ""
                      }
                      md={4}
                    />
                    {TreatmentData &&
                      TreatmentData.sergen_zasahObj &&
                      TreatmentData.sergen_zasahObj.Value === "n" && (
                        <div
                          style={{
                            position: "relative",
                            padding: "20px 10px 10px",
                            border: `1px solid ${colors.border.default}`,
                            margin: "20px 0 10px",
                            backgroundColor: colors.background.surface,
                          }}
                        >
                          <BaseArrayInfo
                            Label="Сэргээн засах эмчилгээ санал болгоогүй"
                            TextField={"Label"}
                            LinedField={"Lined"}
                            Values={
                              TreatmentData &&
                              TreatmentData.hf_sergeen_zasah_emchilgee_notcheckObj
                                ? TreatmentData.hf_sergeen_zasah_emchilgee_notcheckObj
                                : []
                            }
                            md={4}
                          />
                          <BaseInfo
                            Label="Бусад"
                            Value={
                              TreatmentData &&
                              TreatmentData.sergen_zasah_not_other
                            }
                            md={4}
                          />
                        </div>
                      )}
                    {TreatmentData &&
                      TreatmentData.sergen_zasahObj &&
                      TreatmentData.sergen_zasahObj.Value === "n" && (
                        <div
                          style={{
                            position: "relative",
                            padding: "20px 10px 10px",
                            border: `1px solid ${colors.border.default}`,
                            margin: "20px 0 10px",
                            backgroundColor: colors.background.surface,
                          }}
                        >
                          <BaseArrayInfo
                            Label="Сэргээн засах эмчилгээ санал болгоогүй"
                            TextField={"Label"}
                            LinedField={"Lined"}
                            Values={
                              Data &&
                              TreatmentData.hf_sergeen_zasah_emchilgee_notcheckObj
                                ? TreatmentData.hf_sergeen_zasah_emchilgee_notcheckObj
                                : []
                            }
                            md={4}
                          />
                          <BaseInfo
                            Label="Бусад"
                            Value={
                              Data ? TreatmentData.sergen_zasah_not_other : ""
                            }
                            md={4}
                          />
                        </div>
                      )}
                  </GroupPanel>
                  <GroupPanel title={t("Цаашид")} level={1}>
                    <BaseInfo
                      Label="Давтан үзүүлсэн огноо"
                      Value={TreatmentData.davtan_date}
                      md={4}
                    />
                    <BaseInfo
                      Label="Эмнэлэгт хэвтүүлэх"
                      Value={
                        TreatmentData.hevtuulehObj
                          ? TreatmentData.hevtuulehObj.Label
                          : ""
                      }
                      md={4}
                    />
                    <BaseInfo
                      Label="Шилжүүлэх"
                      Value={
                        TreatmentData.shiljuulehObj
                          ? TreatmentData.shiljuulehObj.Label
                          : ""
                      }
                      md={4}
                    />
                    <BaseInfo
                      Label="Тэмдэглэл"
                      Value={TreatmentData.notes}
                      md={4}
                    />
                  </GroupPanel>
                </div>
              ) : (
                <BaseNoData />
              )}
            </div>
          )}
        </div>
      ),
    });

    return Tabs;
  };

  render() {
    const { Loading, Data, Alert } = this.state;
    const { t } = this.props;
    if (Loading) {
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
                        &nbsp;
                        {Data
                          ? Helper.ObjectHelper.getDateYMD({
                              DateStr: Data.CreatedDate,
                            })
                          : ""}
                      </span>
                    </div>
                  </GridItem>
                  <GridItem xs={12} sm={6} md={6}>
                    <div style={{ float: "right" }}>
                      <UserDialogLink UserId={Data ? Data.CreateUserId : null}>
                        {t("Doctor")}: {"\u00A0"}
                        <span style={{ fontWeight: "400" }}>
                          {Data && Data.Users ? Data.Users.UserName : ""}
                        </span>
                      </UserDialogLink>
                    </div>
                  </GridItem>
                </GridContainer>
              </GridItem>
              <GridItem xs={12} sm={12} md={12} style={{ padding: "0 50px" }}>
                <h4 style={{ textAlign: "center", fontWeight: "500" }}>
                  {t("Heart Failure (Ambulance)")}
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

export default withTranslation(undefined, { withRef: true })(HfAmbulance);
