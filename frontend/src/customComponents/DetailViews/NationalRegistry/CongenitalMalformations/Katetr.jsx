import { withTranslation } from "react-i18next";
import React, { Component, createRef } from "react";
// translation
// @mui/material components
import { Box } from "@mui/material";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// custom components
// import BaseNoData from "customComponents/BaseNoData";
// import BaseInfo from "customComponents/BaseViewControls/BaseInfo";
// import BaseArrayInfo from "customComponents/BaseViewControls/BaseArrayInfo";
// import BaseLabel from "customComponents/BaseViewControls/BaseLabel";
// import CustomTab from "customComponents/CustomTab";
import BaseLoading from "customComponents/BaseLoading";
// import CustomContainer from "customComponents/CustomContainer";
import GroupPanel from "customComponents/GroupPanel";
import UserDialogLink from "customComponents/DoctorProfile/UserDialogLink";
// helper
import Helper from "helper";
import { colors } from "@/theme/colors";

const sxStyles = {
  childDiv: {
    position: "relative",
    padding: "10px",
    border: `1px solid ${colors.brand.hairline}`,
    margin: "10px",
    backgroundColor: colors.brand.tintSolid,
  },
  customTable: {
    border: `1px solid ${colors.brand.hairlineStrong}`,
    borderCollapse: "collapse",
    backgroundColor: colors.brand.tintSolid,
    fontSize: "12px",
    "& thead tr": { border: `1px solid ${colors.brand.hairlineStrong}` },
    "& tbody tr": { border: `1px solid ${colors.brand.hairlineStrong}` },
    "& tbody tr td": {
      padding: "2px 4px",
      border: `1px solid ${colors.brand.hairlineStrong}`,
    },
    "& tbody tr th": {
      padding: "2px 4px",
      border: `1px solid ${colors.brand.hairlineStrong}`,
    },
    "& thead tr th": {
      padding: "2px 4px",
      border: `1px solid ${colors.brand.hairlineStrong}`,
    },
  },
};

class Katetr extends Component {
  constructor(props) {
    super(props);
    this.state = { Alert: null, Data: null, Loading: false };
    this.LogedUser = Helper.AuthHelper.GetLogedUserLocal();
    this.DataId = props.DataId || null;

    // refs
    this.ReportRef = createRef();
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
        { ObjectName: "CongenitalMalformations", SearchOption },
        (resData) => {
          resData &&
            resData.Success &&
            resData.Data &&
            this.setState({ Data: resData.Data });
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
          Url: "/CongenitalMalformations/PrintReport",
          Data: { Id: DataId },
          FileName: "CongenitalMalformations.pdf",
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
          Url: "/CongenitalMalformations/PrintReportNew",
          Data: { Id: DataId },
          FileName: "CongenitalMalformations.pdf",
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
        "/CongenitalMalformations/Confirm",
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
          <GridContainer style={{ width: "calc(100% - 30px)" }}>
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
                {t("Катетр ангиографийн оношилгоо")}
              </h4>
            </GridItem>
          </GridContainer>
          <GridContainer
            style={{ margin: "0", width: "100%", minHeight: "760px" }}
          >
            <GridItem xs={12} sm={12} md={12}>
              {/* 1. ЕРӨНХИЙ МЭДЭЭЛЭЛ */}
              <GroupPanel title={t("1. ЕРӨНХИЙ МЭДЭЭЛЭЛ")} level={1}>
                <div
                  id="organizationOther"
                  // style={{ display: this.GetOrgOther() }}
                ></div>

                <div
                  id="is_udamshilChild"
                  style={sxStyles.childDiv}
                  // style={{ display: this.GetDisplay("is_udamshil") }}
                ></div>
              </GroupPanel>

              {/* 2. БОДИТ ҮЗЛЭГ */}
              <GroupPanel title={t("2. БОДИТ ҮЗЛЭГ")} level={1}>
                <GridContainer>
                  <GridItem xs={12} sm={6} md={6}></GridItem>
                  <GridItem xs={12} sm={6} md={6}></GridItem>
                </GridContainer>

                {/* ШИНЖ ТЭМДЭГ */}
                <GroupPanel title={t("ШИНЖ ТЭМДЭГ")} level={2}>
                  <GroupPanel title={t("Шуугианы шинж чанар")} level={3}>
                    <GridContainer>
                      <GridItem xs={12} sm={4} md={4}></GridItem>
                      <GridItem xs={12} sm={4} md={4}></GridItem>
                      <GridItem xs={12} sm={4} md={4}></GridItem>
                    </GridContainer>
                  </GroupPanel>
                </GroupPanel>
              </GroupPanel>

              {/* 3. ЛАБОРАТОРЫН ШИНЖИЛГЭЭ */}
              <GroupPanel title={t("3. ЛАБОРАТОРЫН ШИНЖИЛГЭЭ")} level={1}>
                <GridContainer>
                  <GridItem xs={12} md={6}>
                    <Box component="table" sx={sxStyles.customTable}>
                      <thead>
                        <tr>
                          <th colSpan={2}>{t("Цусны дэлгэрэнгүй")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td width={"50%"}>{t("WBC (103/ul)")}</td>
                          <td width={"50%"}></td>
                        </tr>
                        <tr>
                          <td>{t("RBC (106/ul)")}</td>
                          <td></td>
                        </tr>
                        <tr>
                          <td>{t("Hb (g/l)")}</td>
                          <td></td>
                        </tr>
                        <tr>
                          <td>{t("HCT (%)")}</td>
                          <td></td>
                        </tr>
                        <tr>
                          <td>{t("PLT (103/ul)")}</td>
                          <td></td>
                        </tr>
                        <tr>
                          <td>{t("СОЭ")}</td>
                          <td></td>
                        </tr>
                      </tbody>
                    </Box>
                  </GridItem>
                  <GridItem xs={12} md={6}>
                    <Box component="table" sx={sxStyles.customTable}>
                      <thead>
                        <tr>
                          <th colSpan={2}>{t("Цус бүлэгнэлт")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td width={"50%"}>{t("PT")}</td>
                          <td width={"50%"}></td>
                        </tr>
                        <tr>
                          <td>{t("INR")}</td>
                          <td></td>
                        </tr>
                        <tr>
                          <td>{t("fibrinogen")}</td>
                          <td></td>
                        </tr>
                        <tr>
                          <td>{t("TT")}</td>
                          <td></td>
                        </tr>
                        <tr>
                          <td>{t("APTT")}</td>
                          <td></td>
                        </tr>
                      </tbody>
                    </Box>
                  </GridItem>
                </GridContainer>

                <GroupPanel title={t("Биохими")} level={2}>
                  <GridContainer>
                    <GridItem xs={12} md={6}>
                      <Box component="table" sx={sxStyles.customTable}>
                        <thead>
                          <tr>
                            <th colSpan={2}>{t("Бөөрний үйл ажиллагаа")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td width={"50%"}>{t("Мочевин (mmol/L)")}</td>
                            <td width={"50%"}></td>
                          </tr>
                          <tr>
                            <td>{t("Креатинин (мкмоль/л, мг/дл)")}</td>
                            <td></td>
                          </tr>
                        </tbody>
                      </Box>
                      <div style={{ marginTop: "10px" }}>
                        <Box component="table" sx={sxStyles.customTable}>
                          <tbody>
                            <tr>
                              <td width={"50%"}>
                                <b>{t("ASLO")}</b>
                              </td>
                              <td width={"50%"}></td>
                            </tr>
                            <tr>
                              <td>
                                <b>{t("CRB")}</b>
                              </td>
                              <td></td>
                            </tr>
                            <tr>
                              <td>
                                <b>{t("RF")}</b>
                              </td>
                              <td></td>
                            </tr>
                          </tbody>
                        </Box>
                      </div>
                    </GridItem>
                    <GridItem xs={12} md={6}>
                      <Box component="table" sx={sxStyles.customTable}>
                        <thead>
                          <tr>
                            <th colSpan={2}>{t("Элэгний үйл ажиллагаа")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td width={"50%"}>{t("Нийт уураг (г/л)")}</td>
                            <td width={"50%"}></td>
                          </tr>
                          <tr>
                            <td>{t("Альбумин")}</td>
                            <td></td>
                          </tr>
                          <tr>
                            <td>{t("АСАТ")}</td>
                            <td></td>
                          </tr>
                          <tr>
                            <td>{t("АЛАТ")}</td>
                            <td></td>
                          </tr>
                          <tr>
                            <td>{t("Нийт Билирубин")}</td>
                            <td></td>
                          </tr>
                          <tr>
                            <td>{t("ГГТ")}</td>
                            <td></td>
                          </tr>
                          <tr>
                            <td>{t("Глюкоз (mmol/L)")}</td>
                            <td></td>
                          </tr>
                        </tbody>
                      </Box>
                    </GridItem>
                    <GridItem xs={12} md={6}>
                      <Box component="table" sx={sxStyles.customTable}>
                        <thead>
                          <tr>
                            <th colSpan={2}>{t("Вирүсийн маркер")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td width={"50%"}>{t("HbsAg")}</td>
                            <td width={"50%"}></td>
                          </tr>
                          <tr>
                            <td>{t("HCV")}</td>
                            <td></td>
                          </tr>
                          <tr>
                            <td>{t("Тэмбүү")}</td>
                            <td></td>
                          </tr>
                          <tr>
                            <td>{t("HIV")}</td>
                            <td></td>
                          </tr>
                        </tbody>
                      </Box>
                    </GridItem>
                  </GridContainer>
                </GroupPanel>
              </GroupPanel>

              {/* 4. ЗҮРХНИЙ ЦАХИЛГААН БИЧЛЭГ */}
              <GroupPanel
                title={t("4. ЗҮРХНИЙ ЦАХИЛГААН БИЧЛЭГ")}
                level={1}
              ></GroupPanel>

              {/* 5. ЗҮРХНИЙ ХЭТ АВИАН ОНОШИЛГОО */}
              <GroupPanel title={t("5. ЗҮРХНИЙ ХЭТ АВИАН ОНОШИЛГОО")} level={1}>
                {/* Баруун ховдлын хэмжээ */}

                <GroupPanel
                  title={t("Баруун ховдлын хэмжээ")}
                  level={2}
                ></GroupPanel>

                {/* ТХТЦоорхой байрлал */}
                <GroupPanel
                  title={t("ТХТЦоорхой байрлал")}
                  level={2}
                ></GroupPanel>

                {/* ХХТЦоорхой байрлал */}
                <GroupPanel
                  title={t("ХХТЦоорхой байрлал")}
                  level={2}
                ></GroupPanel>
              </GroupPanel>

              {/* 6. КАТЕТР АНГИОГРАФИ ШИНЖИЛГЭЭНИЙ ӨМНӨХ ОНОШ */}
              <GroupPanel
                title={t("6. КАТЕТР АНГИОГРАФИ ШИНЖИЛГЭЭНИЙ ӨМНӨХ ОНОШ")}
                level={1}
              ></GroupPanel>

              {/* 7. КАТЕТР АНГИОГРАФИ ШИНЖИЛГЭЭНИЙ ДАРААХ ОНОШ */}
              <GroupPanel
                title={t("7. КАТЕТР АНГИОГРАФИ ШИНЖИЛГЭЭНИЙ ДАРААХ ОНОШ")}
                level={1}
              ></GroupPanel>

              {/* 8. КАТЕТР АНГИОГРАФИ ШИНЖИЛГЭЭНИЙ ДАРАА */}
              <GroupPanel
                title={t("8. КАТЕТР АНГИОГРАФИ ШИНЖИЛГЭЭНИЙ ДАРАА")}
                level={1}
              ></GroupPanel>

              {/* 9. ЭМЧИЛГЭЭ */}
              <GroupPanel title={t("9. ЭМЧИЛГЭЭ")} level={1}>
                <Box sx={sxStyles.childDiv}>
                  <p>Антиагрегант:</p>
                </Box>

                <Box sx={sxStyles.childDiv}>
                  <p>Антикоагулянт:</p>
                </Box>

                <Box sx={sxStyles.childDiv}>
                  <p>Эндотелийн рецепторын антагонист:</p>
                </Box>

                <Box sx={sxStyles.childDiv}>
                  <p>PDE-ингибитор:</p>
                </Box>

                <Box sx={sxStyles.childDiv}>
                  <p>Шээс хөөх /МРА/:</p>
                </Box>

                <Box sx={sxStyles.childDiv}>
                  <p>β-хориглогч:</p>
                </Box>

                <Box sx={sxStyles.childDiv}>
                  <p>АРНС /ARNI/:</p>
                </Box>

                <Box sx={sxStyles.childDiv}>
                  <p>Ангиотензин хувиргагч фермент саатуулагч:</p>
                </Box>
              </GroupPanel>
            </GridItem>
          </GridContainer>
        </div>
      );
    }
  }
}

export default withTranslation(undefined, { withRef: true })(Katetr);
