import { withTranslation } from "react-i18next";
import React, { Component } from "react";
// translation
// @mui/material components
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// custom components
import UniCard from "customComponents/UniCard";
import BaseInfo from "customComponents/BaseViewControls/BaseInfo";
import BaseArrayInfo from "customComponents/BaseViewControls/BaseArrayInfo";
// import BaseLabel from "customComponents/BaseViewControls/BaseLabel";
// import CustomTab from "customComponents/CustomTab";
import BaseLoading from "customComponents/BaseLoading";
import BaseNoData from "customComponents/BaseNoData";
// import CustomContainer from "customComponents/CustomContainer";
import UserDialogLink from "customComponents/DoctorProfile/UserDialogLink";
import GroupPanel from "customComponents/GroupPanel";
// helper
import Helper from "helper";
import { colors } from "@/theme/colors";

const sx = {};

class HfHospitalization extends Component {
  constructor(props) {
    super(props);
    this.state = { Alert: null, Data: null, Loading: false };

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
      await Helper.BaseCrudHelper.BaseGetDetailInfo(
        { ObjectName: "HfHospitalization", SearchOption },
        (resData) => {
          resData &&
            resData.Success &&
            resData.Data &&
            this.setState({ Data: Object.assign({}, resData.Data) });
          this.setState({ Loading: false });
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
          Url: "/HfHospitalization/PrintReport",
          Data: { Id: DataId },
          FileName: "HeartFailureHospitalization.pdf",
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
        "/HfHospitalization/Confirm",
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
          this.setState({ Alert: null });
          callback && callback();
        },
      );
      this.setState({ Alert: alert });
    }
  };

  render() {
    const { Loading, Data, Alert } = this.state;
    const { t } = this.props;
    if (Loading) {
      return <BaseLoading />;
    } else {
      return (
        <div>
          {Alert}
          {Data ? (
            <UniCard title={t("Heart Failure (Hospitalization)")}>
              <div style={{ padding: "10px 0 0 0" }}>
                <GridContainer style={{ width: "calc(100% - 20px)" }}>
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
                </GridContainer>
                <GridContainer
                  style={{ margin: "0", width: "100%", minHeight: "760px" }}
                >
                  <GridItem xs={12} sm={12} md={12}>
                    <div>
                      {/* 1. Эмнэлэгт хэвтэлтийн байдал */}
                      <GroupPanel
                        title={t("Эмнэлэгт хэвтэлтийн байдал")}
                        level={1}
                      >
                        <BaseInfo
                          Label="Эмнэлэгт хэвтсэн огноо"
                          Value={Data.hospitalized_date}
                          md={4}
                        />
                        <BaseInfo
                          Label="Өвчний түүхийн дугаар"
                          Value={Data.history_no}
                          md={4}
                        />
                        <BaseInfo
                          Label="Эмнэлэгт хэвтэлтийн байдал"
                          Value={
                            Data.hf_hevteltObj ? Data.hf_hevteltObj.Label : ""
                          }
                          md={4}
                        />
                        <BaseInfo
                          Label="Ор хоног"
                          Value={Data.or_honog}
                          md={4}
                        />
                        <BaseInfo
                          Label="Эмнэлгээс гарсан тасаг"
                          Value={Data.tasagObj ? Data.tasagObj.Label : ""}
                          md={4}
                        />
                        <BaseInfo
                          Label="Эмнэлгээс гарсан тасаг (Бусад)"
                          Value={Data.tasag_other}
                          md={4}
                        />
                        <BaseInfo
                          Label="Ор хоногийн төлбөр (төг)"
                          Value={Data.or_honog_tulbur}
                          md={4}
                        />
                        <BaseInfo
                          Label="Эрүүл мэндийн байгууллага"
                          Value={
                            Data.Organization ? Data.Organization.Name : ""
                          }
                          md={4}
                          WithLabel={true}
                        />
                        {!Data.Organization && Data.organization_other && (
                          <BaseInfo
                            Label="Эрүүл мэндийн байгууллага (Бусад)"
                            Value={Data.organization_other}
                            md={4}
                            WithLabel={true}
                          />
                        )}
                      </GroupPanel>

                      {/* 2. Хэвтэх үеийн зовуурь, шинж тэмдэг */}
                      <GroupPanel
                        title={t("Хэвтэх үеийн зовуурь, шинж тэмдэг")}
                        level={1}
                      >
                        <BaseInfo
                          Label="Артерийн даралт (систол) (мм.муб)"
                          Value={Data.b_ad_deed}
                          md={4}
                        />
                        <BaseInfo
                          Label="Артерийн даралт (диастол) (мм.муб)"
                          Value={Data.b_ad_dood}
                          md={4}
                        />
                        <BaseInfo
                          Label="Дундаж даралт (мм.муб)"
                          Value={Data.b_dd}
                          md={4}
                        />
                        <BaseInfo
                          Label="ЗЦТ (удаа/мин)"
                          Value={Data.b_ztst}
                          md={4}
                        />
                        <BaseInfo
                          Label="Амьсгалын тоо (удаа/мин)"
                          Value={Data.b_at}
                          md={4}
                        />
                        <BaseInfo
                          Label="Өндөр (см)"
                          Value={Data.b_undur}
                          md={4}
                        />
                        <BaseInfo
                          Label="Жин (Эмнэлэгт хэвтэх үеийн) (кг)"
                          Value={Data.b_jin}
                          md={4}
                        />
                        <BaseInfo
                          Label="БЖИ (кг/м2)"
                          Value={Data.b_bji}
                          md={4}
                        />
                        <BaseInfo
                          Label="БГТ (BSA) (м2)"
                          Value={Data.b_bgt}
                          md={4}
                        />

                        <BaseArrayInfo
                          Label="Хэвтэх үеийн зовуурь"
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

                      {/* 3. Зүрхний дутагдлын шалтгаан ба эмнэлэгт хэвтэлтийн нөлөөлөх хүчин зүйлс */}
                      <GroupPanel
                        title={t(
                          "Зүрхний дутагдлын шалтгаан ба эмнэлэгт хэвтэлтийн нөлөөлөх хүчин зүйлс",
                        )}
                        level={1}
                      >
                        <BaseArrayInfo
                          Label="Шалтгаан"
                          TextField={"Label"}
                          LinedField={"Lined"}
                          Values={
                            Data.hf_zvrh_dutagdal_shaltgaanObj
                              ? Data.hf_zvrh_dutagdal_shaltgaanObj
                              : []
                          }
                          md={4}
                        />
                        <BaseInfo
                          Label="Бусад"
                          Value={Data.hf_zvrh_dutagdal_shaltgaan_other}
                          md={4}
                        />
                        <BaseArrayInfo
                          Label="Энэ удаагийн эмнэлэгт хэвтэхэд нөлөөлөгч хүчин зүйлс"
                          TextField={"Label"}
                          LinedField={"Lined"}
                          Values={
                            Data.hf_hewtehed_nuluuluh_huchin_zuilsObj
                              ? Data.hf_hewtehed_nuluuluh_huchin_zuilsObj
                              : []
                          }
                          md={4}
                        />
                        <BaseArrayInfo
                          Label="Эмчилгээний зааврыг дагаагүй"
                          TextField={"Label"}
                          LinedField={"Lined"}
                          Values={
                            Data.hf_emchilgee_dagaaguiObj
                              ? Data.hf_emchilgee_dagaaguiObj
                              : []
                          }
                          md={4}
                        />
                        <BaseInfo
                          Label="Бусад"
                          Value={Data.hf_hewtehed_nuluuluh_huchin_zuils_other}
                          md={4}
                        />
                      </GroupPanel>

                      {/* 4. Бусад мэдээлэл */}
                      <GroupPanel title={t("Бусад мэдээлэл")} level={1}>
                        <BaseArrayInfo
                          Label="Хавсарсан эмгэг"
                          TextField={"Label"}
                          LinedField={"Lined"}
                          Values={
                            Data.hf_hawsarsan_emgegObj
                              ? Data.hf_hawsarsan_emgegObj
                              : []
                          }
                          md={4}
                        />
                        <BaseInfo
                          Label="Эмгэг судлалын шинжилгээгээр батлагдсан хорт хавдар,төрөл/үе шат"
                          Value={Data.hort_havdar_notes}
                          md={4}
                        />
                        <BaseInfo
                          Label="Бусад, бичих"
                          Value={Data.other_notes}
                          md={4}
                        />

                        <BaseArrayInfo
                          Label="Бусад мэдээлэл"
                          TextField={"Label"}
                          LinedField={"Lined"}
                          Values={
                            Data.hf_uwchinii_tvvhObj
                              ? Data.hf_uwchinii_tvvhObj
                              : []
                          }
                          md={4}
                        />
                        <BaseInfo
                          Label="Хими эмчилгээ хийлгэсэн бол төрөл"
                          Value={
                            Data.hf_himiin_emchilgee_turulObj
                              ? Data.hf_himiin_emchilgee_turulObj.Label
                              : ""
                          }
                          md={4}
                        />
                        <BaseInfo
                          Label="Суулгац эмчилгээ хийлгэсэн бол төрөл"
                          Value={
                            Data.hf_suulgats_emchilgee_turulObj
                              ? Data.hf_suulgats_emchilgee_turulObj.Label
                              : ""
                          }
                          md={4}
                        />
                        <BaseInfo
                          Label="Кардиомиопати (ишемийн бус) оношлогдсон бол төрөл"
                          Value={
                            Data.hf_cardiomiopati_turulObj
                              ? Data.hf_cardiomiopati_turulObj.Label
                              : ""
                          }
                          md={4}
                        />
                        <BaseInfo
                          Label="Пейсмейкер"
                          Value={
                            Data.hf_pacemaker_turulObj
                              ? Data.hf_pacemaker_turulObj.Label
                              : ""
                          }
                          md={4}
                        />
                        <BaseInfo
                          Label="ICD"
                          Value={
                            Data.hf_icd_turulObj
                              ? Data.hf_icd_turulObj.Label
                              : ""
                          }
                          md={4}
                        />

                        <GroupPanel title={t("Асран хамгаалагч")} level={2}>
                          <BaseArrayInfo
                            Label="Асран хамгаалагч"
                            TextField={"Label"}
                            LinedField={"Lined"}
                            Value={
                              Data.hf_asran_hamgaalagchObj
                                ? Data.hf_asran_hamgaalagchObj.Label
                                : ""
                            }
                            md={4}
                          />
                          <BaseInfo
                            Label="Асран хамгаалагч (Бусад)"
                            Value={Data.hf_asran_hamgaalagch_other}
                            md={4}
                          />
                        </GroupPanel>
                        <GroupPanel title={t("Хорт зуршил")} level={2}>
                          <BaseInfo
                            Label="Тамхи"
                            Value={
                              Data.hf_tamhiObj ? Data.hf_tamhiObj.Label : ""
                            }
                            md={4}
                          />
                          <BaseInfo
                            Label="Архи"
                            Value={Data.hf_arhiObj ? Data.hf_arhiObj.Label : ""}
                            md={4}
                          />
                        </GroupPanel>
                      </GroupPanel>

                      {/* 5. Үйл ажиллагааны үнэлгээ */}
                      <GroupPanel
                        title={t("Үйл ажиллагааны үнэлгээ")}
                        level={1}
                      >
                        <BaseInfo
                          Label="Амьдралын чанар тодорхойлсон эсэх"
                          Value={
                            Data.is_life_qualityObj
                              ? Data.is_life_qualityObj.Label
                              : ""
                          }
                          md={4}
                        />
                        {Data.is_life_qualityObj &&
                          Data.is_life_qualityObj.Value === "y" && (
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
                                Label="Minnesota LHFQ оноо"
                                Value={Data.life_minnesota}
                                md={4}
                              />
                              <BaseInfo
                                Label="KCCQ оноо"
                                Value={Data.kccq}
                                md={4}
                              />
                              <BaseInfo
                                Label="Бусад"
                                Value={Data.life_quality_other}
                                md={4}
                              />
                            </div>
                          )}

                        <BaseInfo
                          Label="Эмнэлгээс гарах үеийн Нью-Йоркийн үйл ажиллагааны ангилал (NYHA)"
                          Value={Data.hf_nyhaObj ? Data.hf_nyhaObj.Label : ""}
                          md={4}
                        />
                        <BaseInfo
                          Label="Хөдөлгөөний чадавхи"
                          Value={
                            Data.hf_hudulguun_chadvhiObj
                              ? Data.hf_hudulguun_chadvhiObj.Label
                              : ""
                          }
                          md={4}
                          Row={true}
                        />
                        <BaseInfo
                          Label="Өдөр тутмын амьдралын идэвхи"
                          Value={
                            Data.hf_amidraliin_idewhiObj
                              ? Data.hf_amidraliin_idewhiObj.Label
                              : ""
                          }
                          md={4}
                          Row={true}
                        />
                      </GroupPanel>

                      {/* 6. Хэвтэх үеийн лабораторийн болон дүрс оношилгооны шинжилгээ */}
                      <GroupPanel
                        title={t(
                          "Хэвтэх үеийн лабораторийн болон дүрс оношилгооны шинжилгээ",
                        )}
                        level={1}
                      >
                        <GroupPanel
                          title={t(
                            "Хэвтэх үеийн лабораторийн шинжилгээний үзүүлэлтүүд (бичнэ үү)",
                          )}
                          level={2}
                        >
                          <BaseInfo
                            Label="Огноо"
                            Value={Data.laboratory_test_date}
                            md={4}
                          />
                          <BaseInfo
                            Label="Цагаан эс (x10^9/л)"
                            Value={Data.tsagaan_es}
                            md={4}
                          />
                          <BaseInfo
                            Label="Ялтас эс (x10^9/л)"
                            Value={Data.yaltas_es}
                            md={4}
                          />
                          <BaseInfo
                            Label="Гемоглобин (г/дл)"
                            Value={Data.gemoglobin}
                            md={4}
                          />
                          <BaseInfo
                            Label="Натри (ммоль/л)"
                            Value={Data.natri}
                            md={4}
                          />
                          <BaseInfo
                            Label="Kали (ммоль/л)"
                            Value={Data.kali}
                            md={4}
                          />
                          <BaseInfo
                            Label="Шээсний хүчил (мг/дл)"
                            Value={Data.sheesnii_huchil}
                            md={4}
                          />
                          <BaseInfo
                            Label="Креатинин"
                            Value={Data.creatinin}
                            md={4}
                          />
                          <BaseInfo Value={Data.creatinin_type} md={4} />
                          <BaseInfo
                            Label="Мочевин (ОУН/л)"
                            Value={Data.mochevin}
                            md={4}
                          />
                          <BaseInfo
                            Label="Альбумин (г/л)"
                            Value={Data.albumin}
                            md={4}
                          />
                          <BaseInfo
                            Label="ТШХ (мл/мин)"
                            Value={Data.t_sh_h}
                            md={4}
                          />
                          <BaseInfo
                            Label="Алат (ОУН/л)"
                            Value={Data.alat}
                            md={4}
                          />
                          <BaseInfo
                            Label="Асат (ОУН/л)"
                            Value={Data.asat}
                            md={4}
                          />
                          <BaseInfo
                            Label="ГГТ (ОУН/л)"
                            Value={Data.g_g_t}
                            md={4}
                          />
                          <BaseInfo
                            Label="Дигоксин түвшин (мкг/л)"
                            Value={Data.digoksin_level}
                            md={4}
                          />
                          <BaseInfo
                            Label="Төмөр (ммоль/л)"
                            Value={Data.tumur}
                            md={4}
                          />
                          <BaseInfo
                            Label="Ферритин (мкг/л, нг/мл)"
                            Value={Data.ferritin}
                            md={4}
                          />
                          <BaseInfo
                            Value={
                              Data.g_hf_ferritin_typeObj
                                ? Data.g_hf_ferritin_typeObj.Label
                                : ""
                            }
                            md={4}
                          />
                          <BaseInfo
                            Label="NT-proBNP (пг/мл)"
                            Value={Data.n_t_pro_b_n_p}
                            md={4}
                          />
                          <BaseInfo
                            Label="BNP (пг/мл)"
                            Value={Data.b_n_p}
                            md={4}
                          />
                          <BaseInfo
                            Label="HbA1c (% (ЧШ-тэй))"
                            Value={Data.hb_a1c}
                            md={4}
                          />
                          <BaseInfo
                            Label="Санамсаргүй глюкоз (ммоль/л)"
                            Value={Data.sanamsargui_glukoz}
                            md={4}
                          />
                          <BaseInfo
                            Label="СРБ (мг/дл)"
                            Value={Data.s_r_b}
                            md={4}
                          />
                        </GroupPanel>
                        <GroupPanel
                          title={t("Зүрхний цахилгаан бичлэг")}
                          level={2}
                        >
                          <BaseInfo
                            Label="Огноо"
                            Value={Data.tsa_bichleg_date}
                            md={4}
                          />
                          <BaseInfo
                            Label="QRS бүрдэл"
                            Value={Data.qrs_burdel}
                            md={4}
                          />
                          <BaseArrayInfo
                            Label="Хэмнэл"
                            TextField={"Label"}
                            LinedField={"Lined"}
                            Values={Data.hf_rhythmObj ? Data.hf_rhythmObj : []}
                            md={4}
                          />
                          <BaseInfo
                            Label="Хэмнэл (Бусад)"
                            Value={Data.hf_rhythm_other}
                            md={4}
                          />
                          <BaseArrayInfo
                            Label="Зүрхний хориг"
                            TextField={"Label"}
                            LinedField={"Lined"}
                            Values={
                              Data.hf_zurh_horigObj ? Data.hf_zurh_horigObj : []
                            }
                            md={4}
                          />
                          <BaseInfo
                            Label="Зүрхний хориг (Бусад)"
                            Value={Data.hf_zurh_horig_other}
                            md={4}
                          />
                        </GroupPanel>
                        <div style={{ height: "40px" }}></div>
                        <GroupPanel
                          title={t("Цээжний рентген зургийн өөрчлөлт")}
                          level={2}
                        >
                          <BaseInfo
                            Label="Огноо"
                            Value={Data.tseej_rent_date}
                            md={4}
                          />
                          <BaseInfo
                            Label="Цээжний рентген зургийн өөрчлөлт"
                            Value={
                              Data.hf_tseej_rentgen_uurchlutObj
                                ? Data.hf_tseej_rentgen_uurchlutObj.Label
                                : ""
                            }
                            md={4}
                            Row={true}
                          />
                          <BaseInfo
                            Label="Бусад"
                            Value={Data.hf_tseej_rentgen_uurchlut_other}
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
                            Value={Data.het_avia_date}
                            md={4}
                          />
                          <BaseInfo
                            Label="Огноо"
                            Value={Data.het_avia_date}
                            md={4}
                          />
                          <BaseInfo
                            Label="LVDd (mm)"
                            Value={Data.lvdd}
                            md={4}
                          />
                          <BaseInfo
                            Label="LVDs (mm)"
                            Value={Data.lvds}
                            md={4}
                          />
                          <BaseInfo
                            Label="IVSs (mm)"
                            Value={Data.ivss}
                            md={4}
                          />
                          <BaseInfo Label="PWd (mm)" Value={Data.pwd} md={4} />
                          <BaseInfo
                            Label="LVmass (mm)"
                            Value={Data.lvmass}
                            md={4}
                          />
                          <BaseInfo
                            Label="LVEF (Simpson method) (%)"
                            Value={Data.lvef}
                            md={4}
                          />
                          <BaseInfo
                            Label="LV strain (mm)"
                            Value={Data.lv_strain}
                            md={4}
                          />
                          <BaseInfo
                            Label="LA volume (ml)"
                            Value={Data.la_volume}
                            md={4}
                          />
                          <div>
                            <BaseInfo
                              Label="Med (mm)"
                              Value={Data.e_e_med}
                              md={4}
                            />
                            <BaseInfo
                              Label="Lat (mm)"
                              Value={Data.e_e_lat}
                              md={4}
                            />
                          </div>
                          <BaseInfo
                            Label="Уушгины артерийн систолын даралт (мм куб)"
                            Value={Data.uushig_systol_daralt}
                            md={4}
                          />
                          <BaseInfo
                            Label="RV FAC (%)"
                            Value={Data.rv_fac}
                            md={4}
                          />

                          <BaseInfo
                            Label="Хавхлагын эмгэг"
                            Value={
                              Data.havhlaga_emgegObj
                                ? Data.havhlaga_emgegObj.Label
                                : ""
                            }
                            md={4}
                          />
                          {Data.havhlaga_emgegObj &&
                            Data.havhlaga_emgeg.Value === "y" && (
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
                                      ? Data.h_e_2xx_narObj
                                      : ""
                                  }
                                  md={4}
                                />
                                <BaseInfo
                                  Label="2хх-ын дутагдал"
                                  Value={
                                    Data.h_e_2xx_dutObj
                                      ? Data.h_e_2xx_dutObj
                                      : ""
                                  }
                                  md={4}
                                />
                                <BaseInfo
                                  Label="3хх-ын нарийсал"
                                  Value={
                                    Data.h_e_3xx_narObj
                                      ? Data.h_e_3xx_narObj
                                      : ""
                                  }
                                  md={4}
                                />
                                <BaseInfo
                                  Label="3хх-ын дутагдал"
                                  Value={
                                    Data.h_e_3xx_dutObj
                                      ? Data.h_e_3xx_dutObj
                                      : ""
                                  }
                                  md={4}
                                />
                                <BaseInfo
                                  Label="Гол судасны хавхлагын нарийсал"
                                  Value={
                                    Data.h_e_gol_narObj
                                      ? Data.h_e_gol_narObj
                                      : ""
                                  }
                                  md={4}
                                />
                                <BaseInfo
                                  Label="Гол судасны хавхлагын дутагдал"
                                  Value={
                                    Data.h_e_gol_dutObj
                                      ? Data.h_e_gol_dutObj
                                      : ""
                                  }
                                  md={4}
                                />
                                <BaseInfo
                                  Label="УА-ын хавхлагын нарийсал"
                                  Value={
                                    Data.h_e_ua_narObj ? Data.h_e_ua_narObj : ""
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

                          <GridContainer>
                            <GridItem xs={12} md={6}>
                              <GroupPanel
                                title={t("MIBI (сүүлийн шинжилгээ)")}
                                level={3}
                              >
                                <BaseInfo
                                  Label="Огноо"
                                  Value={Data.mibi_date}
                                  md={4}
                                />
                                <BaseInfo
                                  Label="LVEF (%)"
                                  Value={Data.mibi_lvef}
                                  md={4}
                                />
                                <BaseInfo
                                  Label="RVEF (%)"
                                  Value={Data.mibi_rvef}
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
                                  Value={Data.mri_date}
                                  md={4}
                                />
                                <BaseInfo
                                  Label="LVEF (%)"
                                  Value={Data.mri_lvef}
                                  md={4}
                                />
                                <BaseInfo
                                  Label="RVEF (%)"
                                  Value={Data.mri_rvef}
                                  md={4}
                                />
                              </GroupPanel>
                            </GridItem>
                          </GridContainer>
                        </GroupPanel>
                      </GroupPanel>

                      {/* 7. Эмнэлэгт хэвтэх явцад хийгдсэн шинжилгээ ба эмчилгээ */}
                      <GroupPanel
                        title={t(
                          "Эмнэлэгт хэвтэх явцад хийгдсэн шинжилгээ ба эмчилгээ",
                        )}
                        level={1}
                      >
                        <GroupPanel
                          title={t("Эмнэлэгт хэвтэх явцад хийгдсэн шинжилгээ")}
                          level={2}
                        >
                          <BaseArrayInfo
                            Label="Хэрэв эмнэлэгт хэвтэх үед өвөрмөц шинжилгээ хийгдсэн бол"
                            TextField={"Label"}
                            LinedField={"Lined"}
                            Values={
                              Data.hf_emlegt_hiigdsen_shinjilgeeObj
                                ? Data.hf_emlegt_hiigdsen_shinjilgeeObj
                                : []
                            }
                            md={4}
                          />
                          <BaseInfo
                            Label="Эмгэг судлалын хариуг бичнэ үү"
                            Value={Data.hya_biopsi_uurchlult}
                            md={4}
                          />
                          <BaseInfo
                            Label="VO2max (мл/кг/мин)"
                            Value={Data.hya_cardio_pul_vo_max}
                            md={4}
                          />
                        </GroupPanel>
                      </GroupPanel>

                      {/* 8. Эмнэлэгт хэвтэх явцад ЗД-тай холбоотой дараах тусламж үйлчилгээг үзүүлсэн эсэх */}
                      <GroupPanel
                        title={t(
                          "Эмнэлэгт хэвтэх явцад ЗД-тай холбоотой дараах тусламж үйлчилгээг үзүүлсэн эсэх",
                        )}
                        level={1}
                      >
                        <BaseInfo
                          Label="Эмнэлэгт хэвтэх үед ЗД-ын менежментийн хөтөчийн дагуу хянасан эсэх"
                          Value={
                            Data.hyanasan_esehObj
                              ? Data.hyanasan_esehObj.Label
                              : ""
                          }
                          md={4}
                        />
                        <BaseInfo
                          Label="Тамхинаас гарах зөвлөмж өгсөн эсэх"
                          Value={
                            Data.is_tamhinaas_garahObj
                              ? Data.is_tamhinaas_garahObj.Label
                              : ""
                          }
                          md={4}
                        />
                        <BaseInfo
                          Label="Өвчний талаарх боловсрол олгосон эсэх"
                          Value={
                            Data.is_bolovsrolObj
                              ? Data.is_bolovsrolObj.Label
                              : ""
                          }
                          md={4}
                        />
                        <BaseInfo
                          Label="ЗД-ын хөтөлбөрт хамрагдсан эсэх"
                          Value={
                            Data.is_hutulburObj ? Data.is_hutulburObj.Label : ""
                          }
                          md={4}
                        />
                        <BaseInfo
                          Label="ЭЭТ-д хэвтэн эмчлүүлсэн эсэх"
                          Value={
                            Data.is_hevten_emchluulehObj
                              ? Data.is_hevten_emchluulehObj.Label
                              : ""
                          }
                          md={4}
                        />
                        <BaseInfo
                          Label="Судсаар инотроп эмчилгээ хийгдсэн эсэх"
                          Value={
                            Data.is_inotropObj ? Data.is_inotropObj.Label : ""
                          }
                          md={4}
                        />
                        <BaseInfo
                          Label="Суулгац эмчилгээ (CRT-D, CRT-P, ICD, CCM)"
                          Value={
                            Data.is_suulgatsObj ? Data.is_suulgatsObj.Label : ""
                          }
                          md={4}
                        />
                        {Data.is_suulgatsObj &&
                          Data.is_suulgatsObj.Value === "2" && (
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
                                Label="Хэрэв ТИЙМ бол"
                                Value={
                                  Data.hf_suulgats_turulObj
                                    ? Data.hf_suulgats_turulObj.Label
                                    : ""
                                }
                                md={4}
                              />
                            </div>
                          )}
                      </GroupPanel>

                      {/* 9. Эмнэлгээс гарсан байдал */}
                      <GroupPanel
                        title={t("Эмнэлгээс гарсан байдал")}
                        level={1}
                      >
                        <GroupPanel
                          title={t("Эмнэлгээс гарах үеийн зөвлөмж")}
                          level={2}
                        >
                          <BaseArrayInfo
                            Label="Эмчлүүлэгчийг эмнэлгээс гарах үед дараах зөвлөмжийг зөвлөсөн эсэх"
                            TextField={"Label"}
                            LinedField={"Lined"}
                            Values={
                              Data.hf_emnlegees_garah_vyiin_zowlomjObj
                                ? Data.hf_emnlegees_garah_vyiin_zowlomjObj
                                : []
                            }
                            md={4}
                          />
                          <BaseInfo
                            Label="Бусад"
                            Value={Data.hf_emnlegees_garah_vyiin_zowlomj_other}
                            md={4}
                          />
                          <BaseInfo
                            Label="Хөнгөвчлөх эмчилгээ"
                            Value={
                              Data.hf_hunguwchluh_emchilgeeObj
                                ? Data.hf_hunguwchluh_emchilgeeObj.Label
                                : ""
                            }
                            md={4}
                          />
                          {/* <BaseInfo
                          Label="Эмчлүүлэгчийг эмнэлэгт хэвтэх үед зөвлөсөн бусад тусламж үйлчилгээ"
                          Value={
                            Data.hf_emnlegees_garsan_baidalObj
                              ? Data.hf_emnlegees_garsan_baidalObj.Label
                              : ""
                          }
                          md={4}
                          
                        /> */}
                        </GroupPanel>
                        <GroupPanel
                          title={t(
                            "Эмнэлэгт хэвтэх үед санал болгосон бусад тусламж үйлчилгээ",
                          )}
                          level={2}
                        >
                          <BaseArrayInfo
                            Label="Эмчлүүлэгчийг эмнэлэгт хэвтэх үед зөвлөсөн бусад тусламж үйлчилгээ"
                            TextField={"Label"}
                            LinedField={"Lined"}
                            Values={
                              Data.hf_hewteh_uyd_sanal_tuslamj_uilchilgeeObj
                                ? Data.hf_hewteh_uyd_sanal_tuslamj_uilchilgeeObj
                                : []
                            }
                            md={4}
                          />
                          <BaseInfo
                            Label="Бусад"
                            Value={
                              Data.hf_hewteh_uyd_sanal_tuslamj_uilchilgee_other
                            }
                            md={4}
                          />
                        </GroupPanel>
                        <BaseInfo
                          Label="Эмнэлгээс гарсан байдал"
                          Value={
                            Data.hf_emnlegees_garsan_baidalObj
                              ? Data.hf_emnlegees_garsan_baidalObj.Label
                              : ""
                          }
                          md={4}
                        />
                        <BaseArrayInfo
                          Label="Эмнэлэгт хэвтэх хугацаанд гарсан хүндрэл"
                          TextField={"Label"}
                          LinedField={"Lined"}
                          Values={
                            Data.hf_hevteh_uyd_garsan_hvndrelObj
                              ? Data.hf_hevteh_uyd_garsan_hvndrelObj
                              : []
                          }
                          md={4}
                        />
                        <BaseInfo
                          Label="Бусад хүндрэл"
                          Value={Data.hf_hevteh_uyd_garsan_hvndrel_other}
                          md={4}
                        />
                        <BaseInfo
                          Label="ЗД-ын амбулаторийн хяналт санал болгосон эсэх"
                          Value={
                            Data.is_hyanaltObj ? Data.is_hyanaltObj.Label : ""
                          }
                          md={4}
                        />
                        {Data.is_hyanaltObj &&
                          Data.is_hyanaltObj.Value === "n" && (
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
                                Label="Хэрэв ҮГҮЙ бол тодруулна уу"
                                Value={
                                  Data.hf_ambultoriin_hynalt_sanal_bolgoogviObj
                                    ? Data
                                        .hf_ambultoriin_hynalt_sanal_bolgoogviObj
                                        .Label
                                    : ""
                                }
                                md={4}
                              />
                            </div>
                          )}

                        <GroupPanel
                          title={t("Сэргээн засах эмчилгээ")}
                          level={2}
                        >
                          <BaseInfo
                            Label="Сэргээн засах эмчилгээ санал болгосон эсэх"
                            Value={
                              Data.sergen_zasahObj
                                ? Data.sergen_zasahObj.Label
                                : ""
                            }
                            md={4}
                          />
                          {Data.sergen_zasahObj &&
                            Data.sergen_zasahObj.Value === "n" && (
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
                                    Data.hf_sergeen_zasah_emchilgee_notcheckObj
                                      ? Data.hf_sergeen_zasah_emchilgee_notcheckObj
                                      : []
                                  }
                                  md={4}
                                />
                                <BaseInfo
                                  Label="Бусад"
                                  Value={Data.sergen_zasah_not_other}
                                  md={4}
                                />
                              </div>
                            )}
                        </GroupPanel>
                        <GroupPanel
                          title={t("Эмнэлгээс гарах үеийн үзүүлэлтүүд")}
                          level={2}
                        >
                          {/* <BaseInfo
                          Label="Артерийн даралт (мм.муб)"
                          Value={Data.g_ad}
                          md={4}
                        /> */}
                          <BaseInfo
                            Label="Артерийн даралт (систол) (мм.муб)"
                            Value={Data.g_ad_deed}
                            md={4}
                          />
                          <BaseInfo
                            Label="Артерийн даралт (диастол) (мм.муб)"
                            Value={Data.g_ad_dood}
                            md={4}
                          />
                          <BaseInfo
                            Label="ЗЦТ (удаа/мин)"
                            Value={Data.g_ztst}
                            md={4}
                          />
                          <BaseInfo
                            Label="Жин (кг)"
                            Value={Data.g_jin}
                            md={4}
                          />
                        </GroupPanel>
                        {/* <div className={classes.borderDiv}>
            <h4 className={classes.divHeader}>{t("")}</h4>
          </div> */}
                      </GroupPanel>

                      {/* 10. Эмнэлгээс гарах үеийн лабораторийн шинжилгээ */}
                      <GroupPanel
                        title={t(
                          "Эмнэлгээс гарах үеийн лабораторийн шинжилгээ",
                        )}
                        level={1}
                      >
                        <BaseInfo
                          Label="Эмнэлгээс гарсан огноо"
                          Value={Data.discharge_date}
                          md={4}
                        />

                        <BaseInfo
                          Label="Цагаан эс (x10^9/л)"
                          Value={Data.g_tsagaan_es}
                          md={4}
                        />
                        <BaseInfo
                          Label="Ялтас эс (x10^9/л)"
                          Value={Data.g_yaltas_es}
                          md={4}
                        />
                        <BaseInfo
                          Label="Гемоглобин (г/дл)"
                          Value={Data.g_gemoglobin}
                          md={4}
                        />
                        <BaseInfo
                          Label="Натри (ммоль/л)"
                          Value={Data.g_natri}
                          md={4}
                        />
                        <BaseInfo
                          Label="Kали (ммоль/л)"
                          Value={Data.g_kali}
                          md={4}
                        />
                        <BaseInfo
                          Label="Шээсний хүчил (мг/дл)"
                          Value={Data.g_sheesnii_huchil}
                          md={4}
                        />
                        <BaseInfo
                          Label="Креатинин"
                          Value={Data.g_creatinin}
                          md={4}
                        />
                        <BaseInfo
                          Label="Мочевин (ОУН/л)"
                          Value={Data.g_mochevin}
                          md={4}
                        />
                        <BaseInfo
                          Label="Альбумин (г/л)"
                          Value={Data.g_albumin}
                          md={4}
                        />
                        <BaseInfo
                          Label="ТШХ (мл/мин)"
                          Value={Data.g_t_sh_h}
                          md={4}
                        />
                        <BaseInfo
                          Label="Алат (ОУН/л)"
                          Value={Data.g_alat}
                          md={4}
                        />
                        <BaseInfo
                          Label="Асат (ОУН/л)"
                          Value={Data.g_asat}
                          md={4}
                        />
                        <BaseInfo
                          Label="ГГТ (ОУН/л)"
                          Value={Data.g_g_g_t}
                          md={4}
                        />
                        <BaseInfo
                          Label="Дигоксин түвшин (мкг/л)"
                          Value={Data.g_digoksin_level}
                          md={4}
                        />
                        <BaseInfo
                          Label="NT-proBNP (пг/мл)"
                          Value={Data.g_n_t_pro_b_n_p}
                          md={4}
                        />
                        <BaseInfo
                          Label="BNP (пг/мл)"
                          Value={Data.g_b_n_p}
                          md={4}
                        />
                        <BaseInfo
                          Label="Трансферрин сатураци (%)"
                          Value={Data.g_saturatsi}
                          md={4}
                        />
                        <BaseInfo
                          Label="Төмөр (ммоль/л)"
                          Value={Data.g_tumur}
                          md={4}
                        />
                        <BaseInfo
                          Label="Ферритин (мкг/л,  нг/мл)"
                          Value={Data.g_ferritin}
                          md={4}
                        />
                        <BaseInfo
                          Value={
                            Data.g_hf_ferritin_typeObj
                              ? Data.g_hf_ferritin_typeObj.Label
                              : ""
                          }
                          md={4}
                        />
                        <BaseInfo
                          Label="СРБ (мг/дл)"
                          Value={Data.g_s_r_b}
                          md={4}
                        />
                        <BaseInfo
                          Label="HbA1c (% (ЧШ-тэй))"
                          Value={Data.g_hb_a1c}
                          md={4}
                        />
                        <BaseInfo
                          Label="Санамсаргүй глюкоз (ммоль/л)"
                          Value={Data.g_sanamsargui_glukoz}
                          md={4}
                        />
                      </GroupPanel>

                      {/* 11.  Эмнэлгээс гарах үеийн эмийн эмчилгээний зөвлөмж*/}
                      <GroupPanel
                        title={t(
                          "Эмнэлгээс гарах үеийн эмийн эмчилгээний зөвлөмж",
                        )}
                        level={1}
                      >
                        <BaseInfo
                          Label="АХФС/ АРХ/ АРНС зөвлөсөн эсэх"
                          Value={
                            Data.g_hf_emchilgee_checkObj
                              ? Data.g_hf_emchilgee_checkObj.Label
                              : ""
                          }
                          md={4}
                        />
                        {/* Хэрэв АХФС зөвлөсөн бол эмийн нэршлийг сонгож, тунг бичнэ үү */}
                        <BaseInfo
                          Label="Хэрэв АХФС зөвлөсөн бол"
                          Value={
                            Data.g_hf_axpc_nershilObj
                              ? Data.g_hf_axpc_nershilObj.Label
                              : ""
                          }
                          md={4}
                        />
                        <BaseInfo
                          Label="Бусад"
                          Value={Data.g_hf_axpc_other}
                          md={4}
                        />
                        <BaseInfo
                          Label="Тун (мг/хоног)"
                          Value={Data.g_hf_axpc_tun}
                          md={4}
                        />

                        {/* Хэрэв АРХ зөвлөсөн бол эмийн нэршлийг сонгож, тунг бичнэ үү */}
                        <BaseInfo
                          Label="Хэрэв АХС зөвлөсөн бол"
                          Value={
                            Data.g_hf_apc_nershilObj
                              ? Data.g_hf_apc_nershilObj.Label
                              : ""
                          }
                          md={4}
                        />
                        <BaseInfo
                          Label="Бусад"
                          Value={Data.g_hf_apc_other}
                          md={4}
                        />
                        <BaseInfo
                          Label="Тун (мг/хоног)"
                          Value={Data.g_hf_apc_tun}
                          md={4}
                        />
                        {/* Хэрэв АРНС зөвлөсөн бол тунг бичнэ үү */}
                        <BaseInfo
                          Label="Тун (мг/хоног)"
                          Value={Data.g_aphc_tun}
                          md={4}
                        />
                        {/*  */}
                        <BaseInfo
                          Label="Дээрхээс аль нэгийг зөвлөөгүй бол"
                          Value={
                            Data.g_hf_emchilgee_notcheckObj
                              ? Data.g_hf_emchilgee_notcheckObj.Label
                              : ""
                          }
                          md={4}
                          Row={true}
                        />
                        <BaseInfo
                          Label="Бусад"
                          Value={Data.g_hf_emchilgee_notcheck_other}
                          md={4}
                        />

                        <BaseInfo
                          Label="Бета хориглогч"
                          Value={
                            Data.g_is_beta_horiglogchObj
                              ? Data.g_is_beta_horiglogchObj.Label
                              : ""
                          }
                          md={4}
                        />
                        {Data.g_is_beta_horiglogchObj &&
                          Data.g_is_beta_horiglogchObj.Value === "y" && (
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
                                  Data.g_hf_beta_horiglogch_nershilObj
                                    ? Data.g_hf_beta_horiglogch_nershilObj.Label
                                    : ""
                                }
                                md={4}
                              />
                              <BaseInfo
                                Label="Бусад"
                                Value={Data.g_hf_beta_horiglogch_other}
                                md={4}
                              />
                              <BaseInfo
                                Label="Тун (мг/хоног)"
                                Value={Data.g_hf_beta_horiglogch_tun}
                                md={4}
                              />
                            </div>
                          )}

                        {/* Минералокортикоид рецепторын антагонист */}
                        <BaseInfo
                          Label="Минералокортикоид рецепторын антагонист"
                          Value={Data.g_is_mraObj ? Data.g_is_mraObj.Label : ""}
                          md={4}
                        />
                        {Data.g_is_mraObj && Data.g_is_mraObj.Value === "y" && (
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
                                Data.g_hf_mra_checkObj
                                  ? Data.g_hf_mra_checkObj.Label
                                  : ""
                              }
                              md={4}
                            />
                            <BaseInfo
                              Label="Тун (мг/хоног)"
                              Value={Data.g_hf_mra_tun}
                              md={4}
                            />
                            <BaseInfo
                              Label="Хэрэв үгүй бол"
                              Value={
                                Data.g_hf_mra_notcheckObj
                                  ? Data.g_hf_mra_notcheckObj.Label
                                  : ""
                              }
                              md={4}
                            />
                            <BaseInfo
                              Label="Бусад"
                              Value={Data.g_hf_mra_notcheck_other}
                              md={4}
                            />
                          </div>
                        )}

                        <BaseInfo
                          Label="SGLT2 саатуулагч"
                          Value={
                            Data.g_is_sglt2Obj ? Data.g_is_sglt2Obj.Label : ""
                          }
                          md={4}
                        />
                        {Data.g_is_sglt2Obj &&
                          Data.g_is_sglt2Obj.Value === "y" && (
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
                                  Data.g_hf_sglt2_checkObj
                                    ? Data.g_hf_sglt2_checkObj.Label
                                    : ""
                                }
                                md={4}
                              />
                              <BaseInfo
                                Label="Тун (мг/хоног)"
                                Value={Data.g_hf_sglt2_tun}
                                md={4}
                              />
                              <BaseInfo
                                Label="Хэрэв үгүй бол"
                                Value={
                                  Data.g_hf_sglt2_notcheckObj
                                    ? Data.g_hf_sglt2_notcheckObj.Label
                                    : ""
                                }
                                md={4}
                              />
                              <BaseInfo
                                Label="Бусад"
                                Value={Data.g_hf_sglt2_notcheck_other}
                                md={4}
                              />
                            </div>
                          )}

                        <BaseInfo
                          Label="Ивабрадин зөвлөсөн эсэх"
                          Value={
                            Data.g_is_ibabradinObj
                              ? Data.g_is_ibabradin.Label
                              : ""
                          }
                          md={4}
                        />
                        {Data.g_is_ibabradinObj &&
                          Data.g_is_ibabradinObj.Value && (
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
                                Value={Data.g_ibabradin_tun}
                                md={4}
                              />
                            </div>
                          )}

                        <BaseInfo
                          Label="Антитромботик зөвлөсөн эсэх"
                          Value={
                            Data.g_is_antitromboticObj
                              ? Data.g_is_antitromboticObj.Label
                              : ""
                          }
                          md={4}
                        />
                        {Data.g_is_antitromboticObj &&
                          Data.g_is_antitromboticObj.Value && (
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
                                  Data.g_hf_antitrombotic_checkObj
                                    ? Data.g_hf_antitrombotic_checkObj.Label
                                    : ""
                                }
                                md={4}
                              />
                              <BaseInfo
                                Label="Бусад"
                                Value={Data.g_hf_antitrombotic_other}
                                md={4}
                              />
                            </div>
                          )}

                        <BaseInfo
                          Label="Дигоксин"
                          Value={
                            Data.g_is_digoksinObj
                              ? Data.g_is_digoksinObj.Label
                              : ""
                          }
                          md={4}
                        />
                        {Data.g_is_digoksinObj &&
                          Data.g_is_digoksinObj.Value && (
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
                                Value={Data.g_digoksin_tun}
                                md={4}
                              />
                            </div>
                          )}

                        <BaseInfo
                          Label="Шээс хөөх эм"
                          Value={
                            Data.g_is_shees_huuh_emObj
                              ? Data.g_is_shees_huuh_emObj.Label
                              : ""
                          }
                          md={4}
                        />
                        {Data.g_is_shees_huuh_emObj &&
                          Data.g_is_shees_huuh_emObj.Value && (
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
                                  Data.g_hf_shees_huuh_em_checkObj
                                    ? Data.g_hf_shees_huuh_em_checkObj.Label
                                    : ""
                                }
                                md={4}
                              />
                              <BaseInfo
                                Label="Бусад"
                                Value={Data.g_hf_shees_huuh_em_other}
                                md={4}
                              />
                              <BaseInfo
                                Label="Тун (мг/хоног)"
                                Value={Data.g_hf_shees_huuh_em_tun}
                                md={4}
                              />
                            </div>
                          )}

                        <BaseInfo
                          Label="Липид бууруулах эм"
                          Value={
                            Data.g_is_lipid_buuruulahObj
                              ? Data.g_is_lipid_buuruulahObj.Label
                              : ""
                          }
                          md={4}
                        />
                        {Data.g_is_lipid_buuruulahObj &&
                          Data.g_is_lipid_buuruulahObj.Value === "y" && (
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
                                  Data.g_hf_lipid_buuruulah_em_checkObj
                                    ? Data.g_hf_lipid_buuruulah_em_checkObj
                                        .Label
                                    : ""
                                }
                                md={4}
                              />
                              <BaseInfo
                                Label="Бусад"
                                Value={Data.g_hf_lipid_buuruulah_em_other}
                                md={4}
                              />
                              <BaseInfo
                                Label="Тун (мг/хоног)"
                                Value={Data.g_hf_lipid_buuruulah_em_tun}
                                md={4}
                              />
                            </div>
                          )}

                        <BaseInfo
                          Label="Судас тэлэгч эм"
                          Value={
                            Data.g_is_sudas_telegchObj
                              ? Data.g_is_sudas_telegchObj.Label
                              : ""
                          }
                          md={4}
                        />
                        {Data.g_is_sudas_telegchObj &&
                          Data.g_is_sudas_telegchObj.Value === "y" && (
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
                                  Data.g_hf_sudas_telegch_em_checkObj
                                    ? Data.g_hf_sudas_telegch_em_checkObj.Label
                                    : ""
                                }
                                md={4}
                              />
                              <BaseInfo
                                Label="Тун (мг/хоног)"
                                Value={Data.g_hf_sudas_telegch_em_tun}
                                md={4}
                              />
                            </div>
                          )}
                      </GroupPanel>

                      {/* Нас баралт */}
                      {Data.hf_emnlegees_garsan_baidalObj &&
                        Data.hf_emnlegees_garsan_baidalObj.Value + "" ===
                          "5" && (
                          <GroupPanel title={t("Нас баралт")} level={1}>
                            <BaseInfo
                              Label="Нас барсан шалтгаан"
                              Value={
                                Data.nas_barah_shaltgaanObj
                                  ? Data.nas_barah_shaltgaanObj.Label
                                  : ""
                              }
                              md={4}
                            />
                            <BaseInfo
                              Label="Зазад хийгдсэн эсэх"
                              Value={Data.is_zazObj ? Data.is_zazObj.Label : ""}
                              md={4}
                            />
                          </GroupPanel>
                        )}
                    </div>
                  </GridItem>
                </GridContainer>
              </div>
            </UniCard>
          ) : (
            <BaseNoData />
          )}
        </div>
      );
    }
  }
}

export default withTranslation(undefined, { withRef: true })(HfHospitalization);
