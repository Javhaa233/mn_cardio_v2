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
import GroupPanel from "customComponents/GroupPanel";
// helper
import Helper from "helper";

const sx = {
  customTable: {
    border: "1px solid #949494",
    borderCollapse: "collapse",
    backgroundColor: "#f5f5f5",
    fontSize: "12px",
    "& > thead > tr": { border: "1px solid #949494" },
    "& > tbody > tr": { border: "1px solid #949494" },
    "& > tbody > tr > td": { padding: "2px 4px", border: "1px solid #949494" },
    "& > tbody > tr > th": { padding: "2px 4px", border: "1px solid #949494" },
    "& > thead > tr > th": { padding: "2px 4px", border: "1px solid #949494" },
  },
};

class ValveDiseasesEndo extends Component {
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
        { ObjectName: "ValveDiseasesEndo", SearchOption },
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
          Url: "/ValveDiseasesEndo/PrintReport",
          Data: { Id: DataId },
          FileName: "ValveDiseasesEndo.pdf",
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
        "/ValveDiseasesEndo/Confirm",
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
            <div>
              <GridContainer style={{ width: "calc(100% - 30px)" }}>
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
                    {t("Valve disease (Endocarditis)")}
                  </h4>
                </GridItem>
              </GridContainer>
              <GridContainer
                style={{ margin: "0", width: "100%", minHeight: "760px" }}
              >
                <GridItem xs={12} sm={12} md={12}>
                  <GroupPanel title={t("Ерөнхий хэсэг")} level={1}>
                    <BaseInfo Label="Өндөр" Value={Data.undur} md={4} />
                    <BaseInfo Label="Жин" Value={Data.jin} md={4} />
                    <BaseInfo Label="Онош" Value={Data.onosh} md={4} />
                    <BaseInfo
                      Label="Хавсарсан онош"
                      Value={Data.hawsarsan_onosh}
                      md={4}
                    />
                    <BaseInfo
                      Label="Оношлогдсон огноо"
                      Value={Data.DiagnosedDate}
                      md={4}
                    />
                    <BaseInfo
                      Label="Хяналтанд орсон огноо"
                      Value={Data.StartedDate}
                      md={4}
                    />
                    <BaseInfo Label="Удамшил" Value={Data.udamshil} md={4} />
                    <BaseArrayInfo
                      Label="Одоогийн зовуурь"
                      TextField="Label"
                      Values={
                        Data.odoogiin_zowiurObj ? Data.odoogiin_zowiurObj : []
                      }
                      md={4}
                    />
                    <BaseInfo
                      Label="Тогтмол хэрэглэж байгаа эм, тариа"
                      Value={Data.em_taria_hereglej_bga}
                      md={4}
                    />
                    <BaseInfo
                      Label="Харвалт"
                      Value={Data.is_harvaltObj ? Data.is_harvaltObj.Label : ""}
                      md={4}
                    />
                  </GroupPanel>

                  <GroupPanel
                    title={t("Мэс заслын өмнөх бүрдүүлэх шинжилгээнүүд")}
                    level={1}
                  >
                    <GroupPanel title={t("Лабораторийн шинжилгээ")} level={2}>
                      <BaseInfo Label="" Value={Data.ShinjilgeeDate} md={4} />
                      <GridContainer>
                        <GridItem xs={12} md={6}>
                          <Box component="table" sx={sx.customTable}>
                            <thead>
                              <tr>
                                <th colSpan={2}>Цусны дэлгэрэнгүй:</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td width={"50%"}>WBC (103/ul)</td>
                                <td width={"50%"}>
                                  <div>{Data.wbc}</div>
                                </td>
                              </tr>
                              <tr>
                                <td>RBC (106/ul)</td>
                                <td>
                                  <div>{Data.rbc}</div>
                                </td>
                              </tr>
                              <tr>
                                <td>Hb (g/l)</td>
                                <td>
                                  <div>{Data.hb}</div>
                                </td>
                              </tr>
                              <tr>
                                <td>HCT (%)</td>
                                <td>
                                  <div>{Data.hct}</div>
                                </td>
                              </tr>
                              <tr>
                                <td>PLT (103/ul)</td>
                                <td>
                                  <div>{Data.plt}</div>
                                </td>
                              </tr>
                              <tr>
                                <td>СОЭ</td>
                                <td>
                                  <div>{Data.coe}</div>
                                </td>
                              </tr>
                            </tbody>
                          </Box>
                        </GridItem>
                        <GridItem xs={12} md={6}>
                          <Box component="table" sx={sx.customTable}>
                            <thead>
                              <tr>
                                <th colSpan={2}>Цус бүлэгнэлт</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td width={"50%"}>PT</td>
                                <td width={"50%"}>
                                  <div>{Data.pt}</div>
                                </td>
                              </tr>
                              <tr>
                                <td>INR</td>
                                <td>
                                  <div>{Data.inr}</div>
                                </td>
                              </tr>
                              <tr>
                                <td>fibrinogen</td>
                                <td>
                                  <div>{Data.fibrinogen}</div>
                                </td>
                              </tr>
                              <tr>
                                <td>TT</td>
                                <td>
                                  <div>{Data.tt}</div>
                                </td>
                              </tr>
                              <tr>
                                <td>APTT</td>
                                <td>
                                  <div>{Data.aptt}</div>
                                </td>
                              </tr>
                            </tbody>
                          </Box>
                        </GridItem>
                      </GridContainer>
                    </GroupPanel>
                    <GroupPanel title={t("Биохими")} level={2}>
                      <GridContainer>
                        <GridItem>
                          <Box component="table" sx={sx.customTable}>
                            <thead>
                              <tr>
                                <th colSpan={2}>Бөөрний үйл ажиллагаа</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td width={"50%"}>Мочевин (mmol/L)</td>
                                <td width={"50%"}>
                                  <div>{Data.mochevin}</div>
                                </td>
                              </tr>
                              <tr>
                                <td>Креатинин (мкмоль/л, мг/дл)</td>
                                <td>
                                  <div>{Data.creatinin}</div>
                                </td>
                              </tr>
                            </tbody>
                          </Box>
                          <div style={{ marginTop: "10px" }}>
                            <Box component="table" sx={sx.customTable}>
                              <tbody>
                                <tr>
                                  <td width={"50%"}>
                                    <b>ASLO</b>
                                  </td>
                                  <td width={"50%"}>
                                    <div>{Data.aslo}</div>
                                  </td>
                                </tr>
                                <tr>
                                  <td>
                                    <b>CRB</b>
                                  </td>
                                  <td>
                                    <div>{Data.crb}</div>
                                  </td>
                                </tr>
                                <tr>
                                  <td>
                                    <b>RF</b>
                                  </td>
                                  <td>
                                    <div>{Data.rf}</div>
                                  </td>
                                </tr>
                              </tbody>
                            </Box>
                          </div>
                        </GridItem>
                        <GridItem>
                          <Box component="table" sx={sx.customTable}>
                            <thead>
                              <tr>
                                <th colSpan={2}>
                                  {t("Элэгний үйл ажиллагаа")}
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td width={"50%"}>{t("Нийт уураг (г/л)")}</td>
                                <td width={"50%"}>
                                  <div>{Data.niit_uurag}</div>
                                </td>
                              </tr>
                              <tr>
                                <td>{t("Альбумин")}</td>
                                <td>
                                  <div>{Data.alibumin}</div>
                                </td>
                              </tr>
                              <tr>
                                <td>{t("АСАТ")}</td>
                                <td>
                                  <div>{Data.asat}</div>
                                </td>
                              </tr>
                              <tr>
                                <td>{t("АЛАТ")}</td>
                                <td>
                                  <div>{Data.alat}</div>
                                </td>
                              </tr>
                              <tr>
                                <td>{t("Нийт Билирубин")}</td>
                                <td>
                                  <div>{Data.niit_bilirubin}</div>
                                </td>
                              </tr>
                              <tr>
                                <td>{t("ГГТ")}</td>
                                <td>
                                  <div>{Data.ggt}</div>
                                </td>
                              </tr>
                              <tr>
                                <td>{t("Глюкоз (Mmol/L)")}</td>
                                <td>
                                  <div>{Data.glukoz}</div>
                                </td>
                              </tr>
                            </tbody>
                          </Box>
                        </GridItem>
                        <GridItem>
                          <Box component="table" sx={sx.customTable}>
                            <thead>
                              <tr>
                                <th colSpan={2}>{t("Вирүсийн маркер")}</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td width={"50%"}>HbsAg</td>
                                <td width={"50%"}>
                                  <div>{Data.is_hbs_ag}</div>
                                </td>
                              </tr>
                              <tr>
                                <td>HCV</td>
                                <td>
                                  <div>{Data.is_hcv}</div>
                                </td>
                              </tr>
                              <tr>
                                <td>{t("Тэмбүү")}</td>
                                <td>
                                  <div>{Data.is_tembvv}</div>
                                </td>
                              </tr>
                              <tr>
                                <td>HIV</td>
                                <td>
                                  <div>{Data.is_hiv}</div>
                                </td>
                              </tr>
                            </tbody>
                          </Box>
                        </GridItem>
                      </GridContainer>
                    </GroupPanel>
                    <GroupPanel title={t("Зүрхний цахилгаан бичлэг")} level={2}>
                      <BaseInfo Label="Огноо" Value={Data.ztsb_date} md={4} />
                      <BaseArrayInfo
                        Label="Хэмнэл"
                        TextField="Label"
                        Values={Data.rhythmObj ? Data.rhythmObj : []}
                        md={4}
                      />
                      <BaseInfo
                        Label="Бусад"
                        Value={Data.rhythm_other}
                        md={4}
                      />
                    </GroupPanel>

                    <GroupPanel
                      title={t("Зүрхний хэт авиан шинжилгээ")}
                      level={2}
                    >
                      <BaseInfo
                        Label="Огноо"
                        Value={Data.het_awia_date}
                        md={4}
                      />
                      <BaseInfo Label="LVDd (mm)" Value={Data.lvdd} md={4} />
                      <BaseInfo Label="LVDs (mm)" Value={Data.lvds} md={4} />
                      <BaseInfo Label="IVSd (mm)" Value={Data.ivsd} md={4} />
                      <BaseInfo Label="PWd (mm)" Value={Data.pwd} md={4} />
                      <BaseInfo
                        Label="LVmassi (mm)"
                        Value={Data.lv_massi}
                        md={4}
                      />
                      <BaseInfo
                        Label="LVEF (Simpson method) (%)"
                        Value={Data.lvef}
                        md={4}
                      />
                      <BaseInfo Label="LV GLS" Value={Data.lv_cls} md={4} />
                      <BaseInfo
                        Label="LA volume (ml)"
                        Value={Data.la_volume}
                        md={4}
                      />
                      <BaseInfo Label="E/e’ (Med)" Value={Data.ee_med} md={4} />
                      <BaseInfo Label="E/e’ (Lat)" Value={Data.ee_lat} md={4} />
                      <BaseInfo
                        Label="Дундаж E/e’ (см/сек)"
                        Value={Data.dundaj_ee}
                        md={4}
                      />
                      <BaseInfo
                        Label="Таславч e’ (см/сек)"
                        Value={Data.taslawch_e}
                        md={4}
                      />
                      <BaseInfo
                        Label="Хажуу хана e’"
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
                      title={t("Хавхлагын эмгэгийн шалтгаан")}
                      level={2}
                    >
                      <BaseInfo
                        Label="2 Хавтаст хавхлагын нарийсал"
                        Value={
                          Data.is_2xx_narObj ? Data.is_2xx_narObj.Label : ""
                        }
                        md={4}
                      />
                      {Data.is_2xx_narObj &&
                        Data.is_2xx_narObj.Value === "y" && (
                          <div
                            style={{
                              position: "relative",
                              padding: "20px 10px 10px",
                              border: "1px solid #ccc",
                              margin: "20px 0 10px",
                              backgroundColor: "#fafafa",
                            }}
                          >
                            <BaseArrayInfo
                              Label="Хавхлагын эмгэгийн шалтгаан"
                              TextField="Label"
                              Values={
                                Data.vvd2xx_nar_shaltgaanObj
                                  ? Data.vvd2xx_nar_shaltgaanObj
                                  : []
                              }
                              md={4}
                            />
                            <BaseInfo
                              Label="Бусад"
                              Value={Data.vvd2xx_nar_shaltgaan_other}
                              md={4}
                            />
                            <BaseInfo
                              Label="Хүндийн зэрэг"
                              Value={
                                Data.vvd2xx_nar_zeregObj
                                  ? Data.vvd2xx_nar_zeregObj.Label
                                  : ""
                              }
                              md={4}
                            />

                            <BaseInfo
                              Label="2 хавтаст хавхлагын онгойлтын талбай (planometry) (cm2)"
                              Value={Data.planometry}
                              md={4}
                            />
                            <BaseInfo
                              Label="2 хавтаст хавхлагын онгойлтын талбай (PHT) (cm2)"
                              Value={Data.pht}
                              md={4}
                            />
                            <BaseInfo
                              Label="MV mean PG (mmHg)"
                              Value={Data.mv_mean_pg}
                              md={4}
                            />
                            <BaseInfo
                              Label="MV PHT"
                              Value={Data.mv_pht}
                              md={4}
                            />
                            <BaseInfo
                              Label="Вилкинсийн шалгуур оноо"
                              Value={Data.vilkinsiin_shal_onoo}
                              md={4}
                            />
                          </div>
                        )}
                      <BaseInfo
                        Label="2 Хавтаст хавхлагын дутагдал"
                        Value={
                          Data.is_2xx_dutObj ? Data.is_2xx_dutObj.Label : ""
                        }
                        md={4}
                      />
                      {Data.is_2xx_dutObj &&
                        Data.is_2xx_dutObj.Value === "y" && (
                          <div
                            style={{
                              position: "relative",
                              padding: "20px 10px 10px",
                              border: "1px solid #ccc",
                              margin: "20px 0 10px",
                              backgroundColor: "#fafafa",
                            }}
                          >
                            <BaseArrayInfo
                              Label="Хавхлагын эмгэгийн шалтгаан"
                              TextField="Label"
                              Values={
                                Data.vvd2xx_dut_shaltgaanObj
                                  ? Data.vvd2xx_dut_shaltgaanObj
                                  : []
                              }
                              md={4}
                            />
                            <BaseInfo
                              Label="Бусад"
                              Value={Data.vvd2xx_dut_shaltgaan_other}
                              md={4}
                            />
                            <BaseInfo
                              Label="Хүндийн зэрэг"
                              Value={
                                Data.vvd2xx_dut_zeregObj
                                  ? Data.vvd2xx_dut_zeregObj.Label
                                  : ""
                              }
                              md={4}
                            />
                            <BaseInfo
                              Label="MR EROA (см2)"
                              Value={Data.mr_eroa}
                              md={4}
                            />
                            <BaseInfo
                              Label="MR Vena contract"
                              Value={Data.mr_vena_contract}
                              md={4}
                            />
                            <BaseInfo
                              Label="MR Volume (ml)"
                              Value={Data.mr_volume}
                              md={4}
                            />
                            <BaseInfo
                              Label="MR Fraction rate (%)"
                              Value={Data.mr_fraction_rate}
                              md={4}
                            />
                            <BaseInfo
                              Label="MR урсгалын зүүн тосгуурт эзлэх хувь (%)"
                              Value={Data.mr_zuun_tosguur_hubi}
                              md={4}
                            />
                          </div>
                        )}

                      {/* Gol sudas */}

                      <BaseInfo
                        Label="Гол судасны хавхлагын нарийсал"
                        Value={
                          Data.is_gol_sudas_narObj
                            ? Data.is_gol_sudas_narObj.Label
                            : ""
                        }
                        md={4}
                      />
                      {Data.is_gol_sudas_narObj &&
                        Data.is_gol_sudas_narObj.Value === "y" && (
                          <div
                            style={{
                              position: "relative",
                              padding: "20px 10px 10px",
                              border: "1px solid #ccc",
                              margin: "20px 0 10px",
                              backgroundColor: "#fafafa",
                            }}
                          >
                            <BaseArrayInfo
                              Label="Хавхлагын эмгэгийн шалтгаан"
                              TextField="Label"
                              Values={
                                Data.gol_sudas_nar_shaltgaanObj
                                  ? Data.gol_sudas_nar_shaltgaanObj
                                  : []
                              }
                              md={4}
                            />
                            <BaseInfo
                              Label="Бусад"
                              Value={Data.gol_sudas_nar_shaltgaan_other}
                              md={4}
                            />
                            <BaseInfo
                              Label="Хүндийн зэрэг"
                              Value={
                                Data.gol_sudas_nar_zeregObj
                                  ? Data.gol_sudas_nar_zeregObj.Label
                                  : ""
                              }
                              md={4}
                            />
                            <BaseInfo
                              Label="Гол судасны хавхлагын онгойлтын талбай (planometry) (cm2)"
                              Value={Data.gol_sudas_planometry}
                              md={4}
                            />
                            <BaseInfo
                              Label="AoV mean PG (mmHg)"
                              Value={Data.aov_mean_pg}
                              md={4}
                            />
                            <BaseInfo
                              Label="AoV V max (m/sec)"
                              Value={Data.aov_v_max}
                              md={4}
                            />
                            <BaseInfo
                              Label="AoV PG max (mm)"
                              Value={Data.aov_pg_max}
                              md={4}
                            />
                          </div>
                        )}

                      <BaseInfo
                        Label="Гол судасны хавхлагын дутагдал"
                        Value={
                          Data.is_gol_sudas_dutObj
                            ? Data.is_gol_sudas_dutObj.Label
                            : ""
                        }
                        md={4}
                      />
                      {Data.is_gol_sudas_dutObj &&
                        Data.is_gol_sudas_dutObj.Value === "y" && (
                          <div
                            style={{
                              position: "relative",
                              padding: "20px 10px 10px",
                              border: "1px solid #ccc",
                              margin: "20px 0 10px",
                              backgroundColor: "#fafafa",
                            }}
                          >
                            <BaseArrayInfo
                              Label="Хавхлагын эмгэгийн шалтгаан"
                              TextField="Label"
                              Values={
                                Data.gol_sudas_dut_shaltgaanObj
                                  ? Data.gol_sudas_dut_shaltgaanObj
                                  : []
                              }
                              md={4}
                            />
                            <BaseInfo
                              Label="Бусад"
                              Value={Data.gol_sudas_dut_shaltgaan_other}
                              md={4}
                            />
                            <BaseInfo
                              Label="Хүндийн зэрэг"
                              Value={
                                Data.gol_sudas_dut_zeregObj
                                  ? Data.gol_sudas_dut_zeregObj.Label
                                  : ""
                              }
                              md={4}
                            />
                            <BaseInfo
                              Label="AoReg PHT (m/sec)"
                              Value={Data.ao_reg_pht}
                              md={4}
                            />
                            <BaseInfo
                              Label="AoR vol (ml)"
                              Value={Data.aor_vol}
                              md={4}
                            />
                            <BaseInfo
                              Label="AoR EROA (см2)"
                              Value={Data.aor_eroa}
                              md={4}
                            />
                          </div>
                        )}
                    </GroupPanel>
                  </GroupPanel>
                  {/* Titem */}
                  <GroupPanel
                    title={t(
                      "Титэм судсан дотуурх оношилгоо (40-c дээш насны эрэгтэй, цэвэршилт)",
                    )}
                    level={1}
                  >
                    <BaseInfo Label="Огноо" Value={Data.titem_date} md={4} />
                    <BaseInfo
                      Label="Дүгнэлт"
                      Value={Data.dvgneltObj ? Data.dvgneltObj.Label : ""}
                      md={4}
                    />
                  </GroupPanel>

                  {/* Other tests */}
                  <GroupPanel title={t("Бусад шижилгээнүүд")} level={1}>
                    <BaseInfo
                      Label={t("Рентген КТ")}
                      Value={Data.rentgen_kti}
                      md={4}
                    />
                    <GroupPanel title={t("Гол судасны компьютер")} level={2}>
                      <BaseInfo
                        Label="Агатсоны оноо"
                        Value={Data.agatsonii_onoo}
                        md={4}
                      />
                      <BaseInfo
                        Label="Кальцийн оноо"
                        Value={Data.kaltsiin_onoo}
                        md={4}
                      />
                    </GroupPanel>
                    <GroupPanel
                      title={t(
                        "Цусны ариун чанар 3 удаа (халдварт эндокардитийн үед)",
                      )}
                      level={2}
                    >
                      <BaseInfo
                        Label="Нян илэрсэн эсэх"
                        Value={Data.is_nyanObj ? Data.is_nyanObj.Label : ""}
                        md={4}
                      />
                      {Data.is_nyanObj && Data.is_nyanObj.Value === "y" && (
                        <div
                          style={{
                            position: "relative",
                            padding: "20px 10px 10px",
                            border: "1px solid #ccc",
                            margin: "20px 0 10px",
                            backgroundColor: "#fafafa",
                          }}
                        >
                          <BaseInfo
                            Label="Нян /төрөл зүйлийг бичих/"
                            Value={Data.nyan}
                            md={4}
                          />
                        </div>
                      )}
                    </GroupPanel>
                  </GroupPanel>

                  <GroupPanel
                    title={t("Мэс заслын өмнөх эрсдэлт хүчин зүйлс")}
                    level={1}
                  >
                    <BaseInfo
                      Label="EuroScore Logistic (%)"
                      Value={Data.euro_score_logistic}
                      md={4}
                    />
                    <BaseInfo Label="Жин" Value={Data.jin_mes_umnu} md={4} />
                    <BaseInfo
                      Label="Өндөр"
                      Value={Data.undur_mes_umnu}
                      md={4}
                    />
                    <BaseInfo
                      Label="Тамхи"
                      Value={Data.tamhiObj ? Data.tamhiObj.Label : ""}
                      md={4}
                    />
                    <BaseInfo
                      Label="Чихрийн шижин"
                      Value={
                        Data.chihriin_shijinObj
                          ? Data.chihriin_shijinObj.Label
                          : ""
                      }
                      md={4}
                    />
                    <BaseInfo
                      Label="Артерийн даралт ихсэлт"
                      Value={Data.ad_ihseltObj ? Data.ad_ihseltObj.Label : ""}
                      md={4}
                    />
                    <BaseInfo
                      Label="Өөх тосны солилцооны өөрчлөлт"
                      Value={
                        Data.is_uuh_tos_soliltsoo_uurchlultObj
                          ? Data.is_uuh_tos_soliltsoo_uurchlultObj.Label
                          : ""
                      }
                      md={4}
                    />
                    <BaseInfo
                      Label="Бөөрний эмгэг"
                      Value={
                        Data.vvd_buurnii_emgegObj
                          ? Data.vvd_buurnii_emgegObj.Label
                          : ""
                      }
                      md={4}
                    />
                    <BaseInfo
                      Label="Уушгины архаг өвчин"
                      Value={
                        Data.vvd_uushig_arhag_emgegObj
                          ? Data.vvd_uushig_arhag_emgegObj.Label
                          : ""
                      }
                      md={4}
                    />
                    <BaseInfo
                      Label="Бусад судасны эмгэг"
                      Value={
                        Data.vvd_busad_sudasnii_emgegObj
                          ? Data.vvd_busad_sudasnii_emgegObj.Label
                          : ""
                      }
                      md={4}
                    />
                    <BaseInfo
                      Label="Тархины судасны эмгэг"
                      Value={
                        Data.vvd_tarhi_sudasnii_emgegObj
                          ? Data.vvd_tarhi_sudasnii_emgegObj.Label
                          : ""
                      }
                      md={4}
                    />
                    <BaseInfo
                      Label="Мэдрэлийн үйл ажиллагааны алдагдал"
                      Value={Data.is_medrelObj ? Data.is_medrelObj.Label : ""}
                      md={4}
                    />
                    <BaseInfo
                      Label="Гүрээний артерийн шум (Carotid bruits)"
                      Value={
                        Data.gvree_arter_shumObj
                          ? Data.gvree_arter_shumObj.Label
                          : ""
                      }
                      md={4}
                    />
                    <BaseArrayInfo
                      Label="Мэс заслын өмнөх зүрхний хэмнэл"
                      Values={
                        Data.mes_umnu_z_rhythmObj
                          ? Data.mes_umnu_z_rhythmObj
                          : []
                      }
                      md={4}
                    />
                    {/* <BaseInfo
                      Label="Мэс заслын өмнөх зүрхний хэмнэл (Бусад)"
                      Value={Data.mes_umnu_z_rhythm_other}
                      md={4}
                      
                    /> */}
                  </GroupPanel>

                  {/* Хавхлагын мэс заслын дараах байдал */}
                  <GroupPanel
                    title={t("Хавхлагын мэс заслын дараах байдал")}
                    level={1}
                  >
                    <div style={{ margin: "15px" }}>
                      <Box component="table" sx={sx.customTable}>
                        <tbody>
                          <tr>
                            <td width="20%"></td>
                            <td width="20%">Гол судасны хавхлага</td>
                            <td width="20%">Митраль хавхлага</td>
                            <td width="20%">3 хавтаст хавхлага (трикуспид)</td>
                            <td width="20%">УА-н хавхлага</td>
                          </tr>
                          <tr>
                            <td>Нарийсал</td>
                            <td>
                              <BaseInfo
                                Value={
                                  Data.a_gol_sud_narObj
                                    ? Data.a_gol_sud_narObj.Label
                                    : ""
                                }
                                md={4}
                              />
                            </td>
                            <td>
                              <BaseInfo
                                Value={
                                  Data.a_mit_narObj
                                    ? Data.a_mit_narObj.Label
                                    : ""
                                }
                                md={4}
                              />
                            </td>
                            <td>
                              <BaseInfo
                                Value={
                                  Data.a_vvd3xx_narObj
                                    ? Data.a_vvd3xx_narObj.Label
                                    : ""
                                }
                                md={4}
                              />
                            </td>
                            <td>
                              <BaseInfo
                                Value={
                                  Data.a_ua_narObj ? Data.a_ua_narObj.Label : ""
                                }
                                md={4}
                              />
                            </td>
                          </tr>
                          <tr>
                            <td>Дутагдал</td>
                            <td>
                              <BaseInfo
                                Value={
                                  Data.a_gol_sud_dutObj
                                    ? Data.a_gol_sud_dutObj.Label
                                    : ""
                                }
                                md={4}
                              />
                            </td>
                            <td>
                              <BaseInfo
                                Value={
                                  Data.a_mit_dutObj
                                    ? Data.a_mit_dutObj.Label
                                    : ""
                                }
                                md={4}
                              />
                            </td>
                            <td>
                              <BaseInfo
                                Value={
                                  Data.a_vvd3xx_dutObj
                                    ? Data.a_vvd3xx_dutObj.Label
                                    : ""
                                }
                                md={4}
                              />
                            </td>
                            <td>
                              <BaseInfo
                                Value={
                                  Data.a_ua_dutObj ? Data.a_ua_dutObj.Label : ""
                                }
                                md={4}
                              />
                            </td>
                          </tr>
                          <tr>
                            <td>Хавхлагын мэс ажилбар</td>
                            <td>
                              <BaseInfo
                                Value={
                                  Data.a_gol_sud_mes_ajilObj
                                    ? Data.a_gol_sud_mes_ajilObj.Label
                                    : ""
                                }
                                md={4}
                              />
                            </td>
                            <td>
                              <BaseInfo
                                Value={
                                  Data.a_mit_mes_ajilObj
                                    ? Data.a_mit_mes_ajilObj.Label
                                    : ""
                                }
                                md={4}
                              />
                            </td>
                            <td>
                              <BaseInfo
                                Value={
                                  Data.a_vvd3xx_mes_ajilObj
                                    ? Data.a_vvd3xx_mes_ajilObj.Label
                                    : ""
                                }
                                md={4}
                              />
                            </td>
                            <td>
                              <BaseInfo
                                Value={
                                  Data.a_ua_mes_ajilObj
                                    ? Data.a_ua_mes_ajilObj.Label
                                    : ""
                                }
                                md={4}
                              />
                            </td>
                          </tr>
                          <tr>
                            <td>Имплантын төрөл</td>
                            <td>
                              <BaseInfo
                                Value={
                                  Data.a_gol_sud_imp_typeObj
                                    ? Data.a_gol_sud_imp_typeObj.Label
                                    : ""
                                }
                                md={4}
                              />
                            </td>
                            <td>
                              <BaseInfo
                                Value={
                                  Data.a_mit_imp_typeObj
                                    ? Data.a_mit_imp_typeObj.Label
                                    : ""
                                }
                                md={4}
                              />
                            </td>
                            <td>
                              <BaseInfo
                                Value={
                                  Data.a_vvd3xx_imp_typeObj
                                    ? Data.a_vvd3xx_imp_typeObj.Label
                                    : ""
                                }
                                md={4}
                              />
                            </td>
                            <td>
                              <BaseInfo
                                Value={
                                  Data.a_ua_imp_typeObj
                                    ? Data.a_ua_imp_typeObj.Label
                                    : ""
                                }
                                md={4}
                              />
                            </td>
                          </tr>
                        </tbody>
                      </Box>
                    </div>

                    <GroupPanel title={t("Имплантын код")} level={2}>
                      <table style={{ width: "100%" }}>
                        <tbody>
                          <tr>
                            <td width={"25%"}>
                              <div>{Data.implant_kod1}</div>
                            </td>
                            <td width={"25%"}>
                              <div>{Data.implant_kod2}</div>
                            </td>
                            <td width={"25%"}>
                              <div>{Data.implant_kod3}</div>
                            </td>
                            <td width={"25%"}>
                              <div>{Data.implant_kod4}</div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </GroupPanel>

                    <GroupPanel title={t("Имплантын бренд/хэмжээ")} level={2}>
                      <GridContainer>
                        <GridItem xs={12} md={6}>
                          <BaseInfo
                            Label="St.Jude Medical"
                            Value={
                              Data.st_jude_medical_hemjeeObj
                                ? Data.st_jude_medical_hemjeeObj.Label
                                : ""
                            }
                            md={4}
                          />
                        </GridItem>
                        <GridItem xs={12} md={6}>
                          <BaseInfo
                            Label="Medtronic"
                            Value={
                              Data.medtronic_hemjeeObj
                                ? Data.medtronic_hemjeeObj.Label
                                : ""
                            }
                            md={4}
                          />
                        </GridItem>
                      </GridContainer>
                    </GroupPanel>

                    <BaseInfo
                      Label="Бентал мэс ажилбар"
                      Value={
                        Data.is_bental_mesObj ? Data.is_bental_mesObj.Label : ""
                      }
                      md={4}
                    />

                    <BaseInfo
                      Label="Дэвид мэс ажилбар"
                      Value={
                        Data.is_devid_mesObj ? Data.is_devid_mesObj.Label : ""
                      }
                      md={4}
                    />
                  </GroupPanel>
                  {/* Мэс заслын дараах хүндрэлүүд */}
                  <GroupPanel
                    title={t("Мэс заслын дараах хүндрэлүүд")}
                    level={1}
                  >
                    <BaseInfo
                      Label="Цус алдагдал"
                      Value={
                        Data.is_tsus_aldagdalObj
                          ? Data.is_tsus_aldagdalObj.Label
                          : ""
                      }
                      md={4}
                    />
                    <BaseInfo
                      Label="Хэм алдагдал"
                      Value={
                        Data.is_hem_aldagdalObj
                          ? Data.is_hem_aldagdalObj.Label
                          : ""
                      }
                      md={4}
                    />
                    <BaseInfo
                      Label="Тархины цус харвалт"
                      Value={
                        Data.is_tarhinii_tsus_harwaltObj
                          ? Data.is_tarhinii_tsus_harwaltObj.Label
                          : ""
                      }
                      md={4}
                    />
                    <BaseInfo
                      Label="Олон эрхтэний дутагдал"
                      Value={
                        Data.is_olon_erhtnii_dutObj
                          ? Data.is_olon_erhtnii_dutObj.Label
                          : ""
                      }
                      md={4}
                    />
                    <BaseInfo
                      Label="Үжил"
                      Value={Data.is_vjilObj ? Data.is_vjilObj.Label : ""}
                      md={4}
                    />
                  </GroupPanel>

                  {/* after monitoring */}
                  <GroupPanel title={t("Мэс заслын дараах хяналт")} level={1}>
                    <GroupPanel
                      title={t(
                        "Хиймэл хавхлагыг зүрхний ЭХОгоор үнэлэхийн өмнө",
                      )}
                      level={2}
                    >
                      <BaseInfo
                        Label="Хиймэл хавхлагын хэмжээ"
                        Value={Data.hiimel_hawh_hemjee}
                        md={4}
                      />
                      <BaseInfo
                        Label="Хиймэл хавхлагын төрөл"
                        Value={Data.hiimel_hawh_turul}
                        md={4}
                      />
                      <BaseInfo
                        Label="Мэс засал хийгдсэн огноо"
                        Value={Data.mes_zasal_date}
                        md={4}
                      />

                      <BaseInfo
                        Label="АД (систол) (мм.муб)"
                        Value={Data.ad_deed}
                        md={4}
                      />
                      <BaseInfo
                        Label="АД (диастол) (мм.муб)"
                        Value={Data.ad_dood}
                        md={4}
                      />
                      <BaseInfo
                        Label="Пульс (удаа)"
                        Value={Data.pulse}
                        md={4}
                      />
                      <BaseInfo
                        Label="Өндөр (см)"
                        Value={Data.undur_mes_daraa}
                        md={4}
                      />
                      <BaseInfo
                        Label="Жин (кг)"
                        Value={Data.jin_mes_daraa}
                        md={4}
                      />
                      <BaseInfo Label="БЖИ (кг/м2)" Value={Data.bji} md={4} />
                    </GroupPanel>
                  </GroupPanel>

                  {/* after monitoring */}
                  <GroupPanel title={t("Мэс заслын дараах хяналт")} level={1}>
                    <BaseInfo
                      Label="Мэс заслын дараах ЭХОКГ хяналт"
                      Value={
                        Data.vvd_mes_daraah_ehokgObj
                          ? Data.vvd_mes_daraah_ehokgObj.Label
                          : ""
                      }
                      md={4}
                    />
                    {/* ECHO ratings */}
                    <GroupPanel
                      title={t("Хиймэл хавхлагын ЭХО үнэлгээ")}
                      level={2}
                    >
                      <BaseInfo
                        Label="Хавхлагын гадуурх урсгал"
                        Value={
                          Data.is_gaduur_ursgalObj
                            ? Data.is_gaduur_ursgalObj.Label
                            : ""
                        }
                        md={4}
                      />

                      <BaseInfo
                        Label="Хиймэл хавхлагын бүтэц, хөдөлгөөн"
                        Value={
                          Data.vvd_hiimel_bvtets_hudObj
                            ? Data.vvd_hiimel_bvtets_hudObj.Label
                            : ""
                        }
                        md={4}
                      />

                      <BaseInfo
                        Label="Хиймэл хавхлагын дундаж даралт (mean PG) (mmHg)"
                        Value={Data.hiimel_dundaj_daralt}
                        md={4}
                      />
                      <BaseInfo
                        Label="Регургитацийн хүндийн зэрэг"
                        Value={Data.reg_hundiin_zereg}
                        md={4}
                      />
                      <BaseInfo
                        Label="Зүүн тосгуур (см)"
                        Value={Data.zvvn_tosguur}
                        md={4}
                      />
                      <BaseInfo
                        Label="зүүн ховдлын (см)"
                        Value={Data.zvvn_howdol}
                        md={4}
                      />
                      <BaseInfo
                        Label="Зүүн ховдлын агших чадвар (%)"
                        Value={Data.zvvn_howdol_agshih_chadwar}
                        md={4}
                      />
                      <BaseInfo
                        Label="УАД ихсэлт"
                        Value={
                          Data.is_uad_ihseltObj
                            ? Data.is_uad_ihseltObj.Label
                            : ""
                        }
                        md={4}
                      />
                      {Data.is_uad_ihseltObj &&
                        Data.is_uad_ihseltObj.Value === "y" && (
                          <div
                            style={{
                              position: "relative",
                              padding: "20px 10px 10px",
                              border: "1px solid #ccc",
                              margin: "20px 0 10px",
                              backgroundColor: "#fafafa",
                            }}
                          >
                            <BaseInfo
                              Label="SPAP (mmHg)"
                              Value={Data.spap}
                              md={4}
                            />
                          </div>
                        )}
                    </GroupPanel>

                    {/* treatment monitoring */}
                    <GroupPanel
                      title={t("Антикоагулянт эмчилгээний хяналт")}
                      level={2}
                    >
                      <BaseInfo
                        Label="INR"
                        Value={
                          Data.mes_daraa_inrObj
                            ? Data.mes_daraa_inrObj.Label
                            : ""
                        }
                        md={4}
                      />
                    </GroupPanel>
                  </GroupPanel>
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
}

export default withTranslation(undefined, { withRef: true })(ValveDiseasesEndo);
