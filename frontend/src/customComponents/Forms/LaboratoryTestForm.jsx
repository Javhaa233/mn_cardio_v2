import { useTranslation } from "react-i18next";
import React from "react";
// translation
import { withTranslation } from "react-i18next";
// @mui/material components
import { styled } from "@mui/material/styles";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// custom components
import BaseDate from "customComponents/BaseEditControls/BaseDate";
import BaseTextField from "customComponents/BaseEditControls/BaseTextField";
import BaseTextArea from "customComponents/BaseEditControls/BaseTextArea";
import BaseCustomForm from "customComponents/Forms/BaseCustomForm";
// helper
import Helper from "helper";
import { colors } from "@/theme/colors";

const styles = {
  borderDiv: {
    position: "relative",
    padding: "20px 10px 10px",
    border: `1px solid ${colors.border.default}`,
    margin: "25px 0 10px",
    backgroundColor: colors.background.surface,
  },
  divHeader: {
    position: "absolute",
    top: "-25px",
    left: "20px",
    padding: "2px 10px",
    border: `1px solid ${colors.border.default}`,
    backgroundColor: colors.background.primary,
    fontWeight: "500",
    color: "#f54242",
  },
  labelHorizontal: {
    color: colors.label.primary,
    cursor: "pointer",
    display: "inline-flex",
    fontSize: "14px",
    lineHeight: "1.428571429",
    fontWeight: "400",
    paddingTop: "15px",
    marginRight: "0",
    textAlign: "right",
    "@media (min-width: 992px)": { float: "right" },
  },
};

class LaboratoryTestForm extends BaseCustomForm {
  constructor(props) {
    super(props);
  }

  Save = async (callback) => {
    const { PatientId } = this.props;
    const { ObjectName } = this.state;

    let alert = null;
    if (Object.keys(this.ModifyObject).length > 0) {
      await Helper.BaseCrudHelper.BaseCreate(
        { ObjectName, Data: { ...this.ModifyObject, PatientId } },
        (resData) => {
          if (resData) {
            alert = Helper.BaseCrudHelper.ShowAlert(
              resData.Message,
              resData.Success,
              () => {
                this.setState({ Alert: null });
                callback && callback(resData.Success);
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
          callback && callback(false);
        },
      );
      this.setState({ Alert: alert });
    }
  };

  CustomRender = () => {
    // const { Fields } = this.state;
    const { t } = this.props;
    return (
      <GridContainer style={{ margin: "0", width: "100%" }}>
        <GridItem xs={12} md={12}>
          <BaseDate
            ChangeValue={this.ChangeValue}
            Config={this.GetConfigField("LaboratoryTestDate")}
          />
          <BaseTextArea
            ChangeValue={this.ChangeValue}
            Config={this.GetConfigField("complaint")}
            FullWidth={true}
            Rows={3}
          />
          <BaseTextField
            ChangeValue={this.ChangeValue}
            Config={this.GetConfigField("disorders")}
            FullWidth={true}
          />
          <BaseTextField
            ChangeValue={this.ChangeValue}
            Config={this.GetConfigField("regular_medication")}
            FullWidth={true}
          />
          <BaseTextField
            ChangeValue={this.ChangeValue}
            Config={this.GetConfigField("diagnosis")}
            FullWidth={true}
          />
          <div
            style={{
              position: "relative",
              padding: "10px 0 0",
              borderTop: "2px solid #d9d9d9",
              margin: "15px 0",
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
                  <BaseDate
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("blood_test_date")}
                    FullWidth={true}
                    md={5}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("wbc")}
                    FullWidth={true}
                    md={5}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("rbc")}
                    FullWidth={true}
                    md={5}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("hb")}
                    FullWidth={true}
                    md={5}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("hct")}
                    FullWidth={true}
                    md={5}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("platelet")}
                    FullWidth={true}
                    md={5}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("coe")}
                    FullWidth={true}
                    md={5}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("coe")}
                    FullWidth={true}
                    md={5}
                  />
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
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("euro_score_2")}
                    FullWidth={true}
                    md={5}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("logistic_euroscore")}
                    FullWidth={true}
                    md={5}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("sts")}
                    FullWidth={true}
                    md={5}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("nyha")}
                    FullWidth={true}
                    md={5}
                  />
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
                  <BaseDate
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("liver_test_date")}
                    FullWidth={true}
                    md={5}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("total_proteoin")}
                    FullWidth={true}
                    md={5}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("albumin")}
                    FullWidth={true}
                    md={5}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("asat")}
                    FullWidth={true}
                    md={5}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("alat")}
                    FullWidth={true}
                    md={5}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("total_bilirubin")}
                    FullWidth={true}
                    md={5}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("ggt")}
                    FullWidth={true}
                    md={5}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("glucose")}
                    FullWidth={true}
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
                    {t("Вирүсийн маркер")}
                  </h3>
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("hbs_ag")}
                    FullWidth={true}
                    md={5}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("hcv")}
                    FullWidth={true}
                    md={5}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("syphilis")}
                    FullWidth={true}
                    md={5}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("hiv")}
                    FullWidth={true}
                    md={5}
                  />
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
                  <BaseDate
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("kidney_test_date")}
                    FullWidth={true}
                    md={5}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("mochevin")}
                    FullWidth={true}
                    md={5}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("creatinine")}
                    FullWidth={true}
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
                  <BaseDate
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("tsusnii_bulegnelt_date")}
                    FullWidth={true}
                    md={5}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("pt")}
                    FullWidth={true}
                    md={5}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("inr")}
                    FullWidth={true}
                    md={5}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("fibrinogen")}
                    FullWidth={true}
                    md={5}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("tt")}
                    FullWidth={true}
                    md={5}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("aptt")}
                    FullWidth={true}
                    md={5}
                  />
                </div>
              </GridItem>
            </GridContainer>
          </div>
          <BaseTextArea
            ChangeValue={this.ChangeValue}
            Config={this.GetConfigField("chest_ktg")}
            FullWidth={true}
            Rows={3}
          />
          <BaseTextArea
            ChangeValue={this.ChangeValue}
            Config={this.GetConfigField("chest_xray")}
            FullWidth={true}
            Rows={3}
          />
          <BaseTextArea
            ChangeValue={this.ChangeValue}
            Config={this.GetConfigField("abdomen_echo")}
            FullWidth={true}
            Rows={3}
          />
          <BaseTextArea
            ChangeValue={this.ChangeValue}
            Config={this.GetConfigField("spirometry")}
            FullWidth={true}
            Rows={3}
          />
          <BaseTextArea
            ChangeValue={this.ChangeValue}
            Config={this.GetConfigField("chatlab")}
            FullWidth={true}
            Rows={3}
          />
          <BaseTextArea
            ChangeValue={this.ChangeValue}
            Config={this.GetConfigField("surgical_plan")}
            FullWidth={true}
            Rows={3}
          />
        </GridItem>
      </GridContainer>
    );
  };
}

export default withTranslation(undefined, { withRef: true })(
  LaboratoryTestForm,
);
