import { withTranslation } from "react-i18next";
import React, { Component } from "react";
// translation

import Divider from "@mui/material/Divider";

import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";

import UserDialogLink from "customComponents/DoctorProfile/UserDialogLink";
import BaseInfo from "customComponents/BaseViewControls/BaseInfo";
import BaseLoading from "customComponents/BaseLoading";

import Helper from "helper";
import { colors } from "@/theme/colors";

class LaboratoryTest extends Component {
  constructor(props) {
    super(props);
    this.state = { Alert: null, Data: {}, isLoading: false };
    this.LogedUser = Helper.AuthHelper.GetLogedUserLocal();
    this.DataId = props.DataId || null;
    this.SearchOption = Helper.BaseCrudHelper.GetSearchOption();
    this.SearchOption.SearchField = Helper.BaseCrudHelper.SetSearchField(
      "Id",
      this.DataId,
      this.SearchOption.SearchField,
      "Equals",
    );
  }

  componentDidMount() {
    this.GetData();
  }

  GetData = async () => {
    const t = this.props.t;
    const { DataId, SearchOption } = this;
    const { ObjectName } = this.props;
    this.setState({ isLoading: false });
    if (DataId) {
      await Helper.BaseCrudHelper.BaseGetDetailInfo(
        { ObjectName, SearchOption },
        (resData) => {
          resData &&
            resData.Success &&
            resData.Data &&
            this.setState({ Data: Object.assign({}, resData.Data) });
          this.setState({ isLoading: false });
        },
      );
    } else {
      this.setState({ isLoading: false });
    }
  };

  Print = async (callback) => {
    const { DataId } = this;
    const { i18n } = this.props;

    let alert = null;
    if (DataId) {
      await Helper.BaseCrudHelper.BasePrintReport(
        {
          Url: "/LaboratoryTest/PrintReport",
          Data: { Id: DataId, Language: i18n.language },
          FileName: "LaboratoryTest.pdf",
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
    const { isLoading, Data, Alert } = this.state;
    const { t } = this.props;

    if (isLoading) {
      return <BaseLoading />;
    } else {
      return (
        <div>
          {Alert}
          {Data && (
            <GridContainer style={{ width: "100%" }}>
              <GridItem xs={12} sm={12} md={12}>
                <GridContainer style={{ margin: "15px 0" }}>
                  <GridItem xs={12} md={6}>
                    <div style={{ float: "left" }}>
                      {t("Date of laboratory test")}: {"\u00A0"}
                      <span style={{ fontWeight: "400" }}>
                        &nbsp;{Data.LaboratoryTestDate || ""}
                      </span>
                    </div>
                  </GridItem>
                  <GridItem xs={12} md={6}>
                    <div style={{ float: "right", marginRight: "40px" }}>
                      <UserDialogLink
                        UserId={Data.Users ? Data.Users.Id : null}
                      >
                        {t("Doctor")}: {"\u00A0"}
                        <span style={{ fontWeight: "400" }}>
                          &nbsp;{Data.Users ? Data.Users.UserName : ""}
                        </span>
                      </UserDialogLink>
                    </div>
                  </GridItem>
                </GridContainer>
              </GridItem>
              <GridItem xs={12} sm={12} md={12} style={{ padding: "0 3px" }}>
                <BaseInfo Label="Зовиур" Value={Data.complaint} md={3} />
                <Divider variant="middle" />
                <BaseInfo
                  Label="Хавсарсан эмгэг"
                  Value={Data.disorders}
                  md={3}
                />
                <Divider variant="middle" />
                <BaseInfo
                  Label="Тогтмол уудаг эм"
                  Value={Data.regular_medication}
                  md={3}
                />
                <Divider variant="middle" />
                <BaseInfo Label="Онош" Value={Data.diagnosis} md={3} />
                <div
                  style={{
                    position: "relative",
                    padding: "20px 0 0",
                    borderTop: "2px solid #d9d9d9",
                    margin: "25px 0",
                    background: "none",
                  }}
                >
                  <GridContainer>
                    <GridItem sm={12} md={6}>
                      <div
                        style={{
                          position: "relative",
                          padding: "20px 10px 10px",
                          border: `1px solid ${colors.border.default}`,
                          margin: "25px 0",
                          backgroundColor: colors.background.surface,
                        }}
                      >
                        <h3
                          style={{
                            position: "absolute",
                            top: "-35px",
                            left: "15px",
                            padding: "0 10px",
                            backgroundColor: colors.background.primary,
                            border: `1px solid ${colors.border.default}`,
                            color: colors.text.heading,
                            textDecoration: "none",
                            fontSize: "18px",
                          }}
                        >
                          {t("Цусны дэлгэрэнгүй")}
                        </h3>
                        <BaseInfo
                          Label="Огноо"
                          Value={Helper.ObjectHelper.getDateYMD({
                            DateStr: Data.blood_test_date,
                          })}
                          md={5}
                        />
                        <BaseInfo Label="WBC" Value={Data.wbc} md={5} />
                        <BaseInfo Label="RBC" Value={Data.rbc} md={5} />
                        <BaseInfo Label="Hb" Value={Data.hb} md={5} />
                        <BaseInfo Label="Hct" Value={Data.hct} md={5} />
                        <BaseInfo
                          Label="Platelet"
                          Value={Data.platelet}
                          md={5}
                        />
                        <BaseInfo Label="СОЭ" Value={Data.coe} md={5} />
                      </div>
                    </GridItem>
                    <GridItem sm={12} md={6}>
                      <div
                        style={{
                          position: "relative",
                          padding: "20px 10px 10px",
                          border: `1px solid ${colors.border.default}`,
                          margin: "25px 0",
                          backgroundColor: colors.background.surface,
                        }}
                      >
                        <h3
                          style={{
                            position: "absolute",
                            top: "-35px",
                            left: "15px",
                            padding: "0 10px",
                            backgroundColor: colors.background.primary,
                            border: `1px solid ${colors.border.default}`,
                            color: colors.text.heading,
                            textDecoration: "none",
                            fontSize: "18px",
                          }}
                        >
                          {t("Эрсдлийн оноо")}
                        </h3>
                        <BaseInfo
                          Label="Euro score II"
                          Value={Data.euro_score_2}
                          md={5}
                        />
                        <BaseInfo
                          Label="Logistic Euroscore"
                          Value={Data.logistic_euroscore}
                          md={5}
                        />
                        <BaseInfo Label="STS" Value={Data.sts} md={5} />
                        <BaseInfo Label="NYHA class" Value={Data.nyha} md={5} />
                      </div>
                    </GridItem>
                  </GridContainer>
                </div>
                <div
                  style={{
                    position: "relative",
                    padding: "20px 0 0",
                    borderTop: "2px solid #d9d9d9",
                    borderBottom: "2px solid #d9d9d9",
                    margin: "25px 0",
                    background: "none",
                  }}
                >
                  <h3
                    style={{
                      position: "absolute",
                      top: "-40px",
                      left: "15px",
                      padding: "2px 15px",
                      backgroundColor: colors.background.primary,
                      border: "1px solid #d9d9d9",
                      borderRadius: "4px",
                      color: "#ff4747",
                      textDecoration: "none",
                      fontSize: "18px",
                      fontWeight: "400",
                      boxShadow: "0 1px 4px 0 rgba(0, 0, 0, 0.14)",
                    }}
                  >
                    {t("Биохими")}
                  </h3>
                  <GridContainer>
                    <GridItem sm={12} md={6}>
                      <div
                        style={{
                          position: "relative",
                          padding: "20px 10px 10px",
                          border: `1px solid ${colors.border.default}`,
                          margin: "25px 0",
                          backgroundColor: colors.background.surface,
                        }}
                      >
                        <h3
                          style={{
                            position: "absolute",
                            top: "-35px",
                            left: "15px",
                            padding: "0 10px",
                            backgroundColor: colors.background.primary,
                            border: `1px solid ${colors.border.default}`,
                            color: colors.text.heading,
                            textDecoration: "none",
                            fontSize: "18px",
                          }}
                        >
                          {t("Элэгний үйл ажиллагаа")}
                        </h3>
                        <BaseInfo
                          Label="Огноо"
                          Value={Helper.ObjectHelper.getDateYMD({
                            DateStr: Data.liver_test_date,
                          })}
                          md={5}
                        />
                        <BaseInfo
                          Label="Нийт уураг (г/л)"
                          Value={Data.total_proteoin}
                          md={5}
                        />
                        <BaseInfo
                          Label="Альбумин"
                          Value={Data.albumin}
                          md={5}
                        />
                        <BaseInfo Label="АСАТ" Value={Data.asat} md={5} />
                        <BaseInfo Label="АЛАТ" Value={Data.alat} md={5} />
                        <BaseInfo
                          Label="Нийт Билирубин"
                          Value={Data.total_bilirubin}
                          md={5}
                        />
                        <BaseInfo Label="ГГТ" Value={Data.ggt} md={5} />
                        <BaseInfo Label="Глюкоз" Value={Data.glucose} md={5} />
                      </div>
                      <div
                        style={{
                          position: "relative",
                          padding: "20px 10px 10px",
                          border: `1px solid ${colors.border.default}`,
                          margin: "25px 0",
                          backgroundColor: colors.background.surface,
                        }}
                      >
                        <h3
                          style={{
                            position: "absolute",
                            top: "-35px",
                            left: "15px",
                            padding: "0 10px",
                            backgroundColor: colors.background.primary,
                            border: `1px solid ${colors.border.default}`,
                            color: colors.text.heading,
                            textDecoration: "none",
                            fontSize: "18px",
                          }}
                        >
                          {t("Вирүсийн маркер")}
                        </h3>
                        <BaseInfo Label="HbsAg" Value={Data.hbs_ag} md={5} />
                        <BaseInfo Label="HCV" Value={Data.hcv} md={5} />
                        <BaseInfo Label="Тэмбүү" Value={Data.syphilis} md={5} />
                        <BaseInfo Label="HIV" Value={Data.hiv} md={5} />
                      </div>
                    </GridItem>
                    <GridItem sm={12} md={6}>
                      <div
                        style={{
                          position: "relative",
                          padding: "20px 10px 10px",
                          border: `1px solid ${colors.border.default}`,
                          margin: "25px 0",
                          backgroundColor: colors.background.surface,
                        }}
                      >
                        <h3
                          style={{
                            position: "absolute",
                            top: "-35px",
                            left: "15px",
                            padding: "0 10px",
                            backgroundColor: colors.background.primary,
                            border: `1px solid ${colors.border.default}`,
                            color: colors.text.heading,
                            textDecoration: "none",
                            fontSize: "18px",
                          }}
                        >
                          {t("Бөөрний үйл ажиллагаа")}
                        </h3>
                        <BaseInfo
                          Label="Огноо"
                          Value={Helper.ObjectHelper.getDateYMD({
                            DateStr: Data.kidney_test_date,
                          })}
                          md={5}
                        />
                        <BaseInfo
                          Label="Мочевин"
                          Value={Data.mochevin}
                          md={5}
                        />
                        <BaseInfo
                          Label="Креатинин"
                          Value={Data.creatinine}
                          md={5}
                        />
                      </div>
                      <div
                        style={{
                          position: "relative",
                          padding: "20px 10px 10px",
                          border: `1px solid ${colors.border.default}`,
                          margin: "25px 0",
                          backgroundColor: colors.background.surface,
                        }}
                      >
                        <h3
                          style={{
                            position: "absolute",
                            top: "-35px",
                            left: "15px",
                            padding: "0 10px",
                            backgroundColor: colors.background.primary,
                            border: `1px solid ${colors.border.default}`,
                            color: colors.text.heading,
                            textDecoration: "none",
                            fontSize: "18px",
                          }}
                        >
                          {t("Цус бүлэгнэлт")}
                        </h3>
                        <BaseInfo
                          Label="Огноо"
                          Value={Helper.ObjectHelper.getDateYMD({
                            DateStr: Data.tsusnii_bulegnelt_date,
                          })}
                          md={5}
                        />
                        <BaseInfo Label="PT" Value={Data.pt} md={5} />
                        <BaseInfo Label="INR" Value={Data.inr} md={5} />
                        <BaseInfo
                          Label="fibrinogen"
                          Value={Data.fibrinogen}
                          md={5}
                        />
                        <BaseInfo Label="TT" Value={Data.tt} md={5} />
                        <BaseInfo Label="АРТТ" Value={Data.aptt} md={5} />
                      </div>
                    </GridItem>
                  </GridContainer>
                </div>
                <BaseInfo Label="Цээжний КТГ" Value={Data.chest_ktg} md={3} />
                <Divider variant="middle" />
                <BaseInfo
                  Label="Цээжний рентген зураг"
                  Value={Data.chest_xray}
                  md={3}
                />
                <Divider variant="middle" />
                <BaseInfo
                  Label="Хэвлийн эхо"
                  Value={Data.abdomen_echo}
                  md={3}
                />
                <Divider variant="middle" />
                <BaseInfo Label="Спирометр" Value={Data.spirometry} md={3} />
                <Divider variant="middle" />
                <BaseInfo Label="Cathlab" Value={Data.chatlab} md={3} />
                <Divider variant="middle" />
                <BaseInfo
                  Label="Surgery plan"
                  Value={Data.surgical_plan}
                  md={3}
                />
              </GridItem>
            </GridContainer>
          )}
        </div>
      );
    }
  }
}

export default withTranslation(undefined, { withRef: true })(LaboratoryTest);
