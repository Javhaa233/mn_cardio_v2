import { useTranslation } from "react-i18next";
import React from "react";
// @mui/material components
import FormLabel from "@mui/material/FormLabel";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// custom components
import BaseRadio from "customComponents/BaseEditControls/BaseRadio";
import BaseTextField from "customComponents/BaseEditControls/BaseTextField";
import BaseTextArea from "customComponents/BaseEditControls/BaseTextArea";
import BaseSimpleDate from "customComponents/BaseEditControls/BaseSimpleDate";
import BaseSelect from "customComponents/BaseEditControls/BaseSelect";
import BaseCustomTextField from "customComponents/BaseEditControls/BaseCustomTextField";
import BaseNoData from "customComponents/BaseNoData";
import BaseCustomForm from "customComponents/Forms/BaseCustomForm";
// helper
import Helper from "helper";

const styles = {
  labelHorizontal: {
    color: "#75736c",
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

class PaceMakerThreeForm extends BaseCustomForm {
  constructor(props) {
    super(props);
    this.state = { ...this.state, Dialog: null, NoData: false };
    this.PacemakerTblTwo = null;
  }

  Print = async (callback) => {
    const { EditObject } = this.state;

    let alert = null;
    if (EditObject && EditObject.Id) {
      await Helper.BaseCrudHelper.BasePrintReport(
        {
          Url: "/PacemakerThree/PrintReport",
          Data: { Id: EditObject.Id },
          FileName: "PaceMakerThreeReport.pdf",
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

  GetData = async () => {
    let { PacemakerTblTwo } = this;
    const { ObjectName } = this.state;
    const { StayId } = this.props;
    if ((ObjectName, StayId)) {
      var SearchOption = Helper.BaseCrudHelper.GetSearchOption();
      SearchOption.SearchField = [
        { Field: "stay_id_data", Op: "Equals", Value: StayId },
      ];

      this.setState({ NoData: true });
      await Helper.BaseCrudHelper.BaseGetDetailInfo(
        { ObjectName, SearchOption },
        async (resData) => {
          if (resData && resData.Success && resData.Data) {
            PacemakerTblTwo = resData.Data;
            this.setState({ NoData: false });
            this.ModifyObject = {
              tbl_two_id: PacemakerTblTwo.Id,
              pat_history_id: PacemakerTblTwo.pat_history_id,
              department: PacemakerTblTwo.department,
            };
            process.env.NODE_ENV === "development" &&
              console.log({ ModifyObject: this.ModifyObject });

            await Helper.BaseCrudHelper.BaseGetDetail(
              { ObjectName, SearchOption },
              (resData) => {
                if (resData && resData.Success) {
                  if (!resData.Data) {
                    this.setState({
                      EditObject: {
                        pat_history_id: PacemakerTblTwo.pat_history_id,
                        department: PacemakerTblTwo.department,
                      },
                      isLoading: false,
                    });
                  }
                  if (resData.Data)
                    this.setState({
                      EditObject: Object.assign({}, resData.Data),
                      isLoading: false,
                    });
                }
              },
            );
          } else {
            this.setState({ isLoading: false });
          }
        },
      );
    } else {
      this.setState({ isLoading: false });
    }
  };

  SaveAndConfirm = (callback) => {
    const confirmAlert = Helper.BaseCrudHelper.ShowConfirm(
      "Хэвлэх үү?",
      () => {
        this.setState({ Alert: null });
        this.Print(() => callback && callback());
      },
      () => {
        this.setState({ Alert: null });
        callback && callback();
      },
    );
    this.setState({ Alert: confirmAlert });
  };

  Save = async (callback) => {
    const { PatientId, StayId } = this.props;
    const { ObjectName, EditObject, NoData } = this.state;

    let alert = null;
    if (
      ObjectName &&
      Object.keys(this.ModifyObject).length > 0 &&
      PatientId &&
      StayId
    ) {
      var Data = null;
      if (EditObject && EditObject.Id) {
        Data = { ...this.ModifyObject, Id: EditObject.Id };
      } else {
        Data = {
          ...this.ModifyObject,
          pat_id_data: PatientId,
          stay_id_data: StayId,
        };
      }

      await Helper.PacemakerHelper.CustomSavePacemakerThree(
        { ObjectName, Data },
        (resData) => {
          if (resData && resData.Data) {
            alert = Helper.BaseCrudHelper.ShowAlert(
              resData.Message,
              resData.Success,
              () => {
                this.setState({
                  Alert: null,
                  EditObject: { Id: resData.Data.DataId },
                });
                this.SaveAndConfirm(callback);
              },
            );
            this.setState({ Alert: alert });
          }
        },
      );
    } else {
      alert = Helper.BaseCrudHelper.ShowAlert(
        !NoData ? "Information is missing" : "Pacemaker 2 бүртгээгүй байна",
        false,
        () => {
          this.setState({ Alert: null });
          callback && callback();
        },
      );
      this.setState({ Alert: alert });
    }
  };

  CustomRender = () => {
    const { t } = this.props;
    const { Fields, Dialog, NoData } = this.state;
    return (
      <div>
        {Dialog}
        <GridContainer style={{ margin: "0", width: "100%" }}>
          <GridItem xs={12} sm={12} md={12}>
            {Fields ? (
              NoData ? (
                <BaseNoData Text="Pacemaker 2 бүртгээгүй байна" />
              ) : (
                <div>
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("pat_history_id")}
                    Disabled
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("department")}
                    Disabled
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("treatment_name")}
                    FullWidth={true}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("clinical_diagnosis")}
                    FullWidth={true}
                  />
                  <GridContainer>
                    <GridItem xs={12} sm={12} md={3}>
                      <FormLabel style={styles.labelHorizontal}>
                        Эхэлсэн огноо, цаг, минут
                      </FormLabel>
                    </GridItem>
                    <GridItem xs={12} sm={12} md={9}>
                      <GridContainer>
                        <GridItem xs={12} sm={12} md={4}>
                          <BaseSimpleDate
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("started_date")}
                          />
                        </GridItem>
                        <GridItem xs={12} sm={12} md={4}>
                          <BaseCustomTextField
                            ChangeValue={this.ChangeValue}
                            Config={{
                              ...this.GetConfigField("started_hour"),
                              Label: t("Цаг"),
                            }}
                          />
                        </GridItem>
                        <GridItem xs={12} sm={12} md={4}>
                          <BaseCustomTextField
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("started_min")}
                          />
                        </GridItem>
                      </GridContainer>
                    </GridItem>
                  </GridContainer>
                  <GridContainer>
                    <GridItem xs={12} sm={12} md={3}>
                      <FormLabel style={styles.labelHorizontal}>
                        Үргэлжилсэн цаг, минут
                      </FormLabel>
                    </GridItem>
                    <GridItem xs={12} sm={12} md={9}>
                      <GridContainer>
                        <GridItem xs={12} sm={12} md={3}>
                          <BaseCustomTextField
                            ChangeValue={this.ChangeValue}
                            Config={{
                              ...this.GetConfigField("dur_hour"),
                              Label: t("Цаг"),
                            }}
                            FullWidth={true}
                          />
                        </GridItem>
                        <GridItem xs={12} sm={12} md={3}>
                          <BaseCustomTextField
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("dur_min")}
                            FullWidth={true}
                          />
                        </GridItem>
                      </GridContainer>
                    </GridItem>
                  </GridContainer>
                  <BaseTextArea
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("scriptum")}
                    Rows="8"
                  />
                  <GridContainer>
                    <GridItem xs={12} sm={12} md={3}>
                      <FormLabel style={styles.labelHorizontal}>
                        Рентген тун, хугацаа
                      </FormLabel>
                    </GridItem>
                    <GridItem xs={12} sm={12} md={9}>
                      <GridContainer>
                        <GridItem xs={12} sm={12} md={6}>
                          <BaseCustomTextField
                            ChangeValue={this.ChangeValue}
                            Config={{
                              ...this.GetConfigField("xray_dose"),
                              Label: t("Тун"),
                            }}
                          />
                        </GridItem>
                        <GridItem xs={12} sm={12} md={6}>
                          <BaseCustomTextField
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("xray_time")}
                          />
                        </GridItem>
                      </GridContainer>
                    </GridItem>
                  </GridContainer>
                  <GridContainer>
                    <GridItem xs={12} sm={12} md={3}>
                      <FormLabel style={styles.labelHorizontal}>
                        Пейсмейкер:
                      </FormLabel>
                    </GridItem>
                    <GridItem xs={12} sm={12} md={9}>
                      <GridContainer>
                        <GridItem xs={12} sm={12} md={6}>
                          <BaseCustomTextField
                            ChangeValue={this.ChangeValue}
                            Config={{
                              ...this.GetConfigField("pm_model"),
                              Label: t("Загвар"),
                            }}
                          />
                        </GridItem>
                        <GridItem xs={12} sm={12} md={6}>
                          <BaseCustomTextField
                            ChangeValue={this.ChangeValue}
                            Config={{
                              ...this.GetConfigField("pm_serial"),
                              Label: t("Сери"),
                            }}
                          />
                        </GridItem>
                        <GridItem xs={12} sm={12} md={6}>
                          <BaseCustomTextField
                            ChangeValue={this.ChangeValue}
                            Config={{
                              ...this.GetConfigField("pm_pos"),
                              Label: t("Байрлал"),
                            }}
                          />
                        </GridItem>
                      </GridContainer>
                    </GridItem>
                  </GridContainer>
                  <GridContainer>
                    <GridItem xs={12} sm={12} md={3}>
                      <FormLabel style={styles.labelHorizontal}>
                        Баруун тосгуур:
                      </FormLabel>
                    </GridItem>
                    <GridItem xs={12} sm={12} md={9}>
                      <GridContainer>
                        <GridItem xs={12} sm={12} md={6}>
                          <BaseCustomTextField
                            ChangeValue={this.ChangeValue}
                            Config={{
                              ...this.GetConfigField("bt_model"),
                              Label: t("Загвар"),
                            }}
                          />
                        </GridItem>
                        <GridItem xs={12} sm={12} md={6}>
                          <BaseCustomTextField
                            ChangeValue={this.ChangeValue}
                            Config={{
                              ...this.GetConfigField("bt_serial"),
                              Label: t("Сери"),
                            }}
                          />
                        </GridItem>
                        <GridItem xs={12} sm={12} md={6}>
                          <BaseCustomTextField
                            ChangeValue={this.ChangeValue}
                            Config={{
                              ...this.GetConfigField("bt_pos"),
                              Label: t("Байрлал"),
                            }}
                          />
                        </GridItem>
                        <GridItem xs={12} sm={12} md={6}>
                          <BaseCustomTextField
                            ChangeValue={this.ChangeValue}
                            Config={{
                              ...this.GetConfigField("bt_sens"),
                              Label: t("Мэдрэмж"),
                            }}
                          />
                        </GridItem>
                        <GridItem xs={12} sm={12} md={6}>
                          <BaseCustomTextField
                            ChangeValue={this.ChangeValue}
                            Config={{
                              ...this.GetConfigField("bt_pow"),
                              Label: t("Босго хүч"),
                            }}
                          />
                        </GridItem>
                        <GridItem xs={12} sm={12} md={6}>
                          <BaseCustomTextField
                            ChangeValue={this.ChangeValue}
                            Config={{
                              ...this.GetConfigField("bt_res"),
                              Label: t("Эсэргүүцэл"),
                            }}
                          />
                        </GridItem>
                      </GridContainer>
                    </GridItem>
                  </GridContainer>
                  <GridContainer>
                    <GridItem xs={12} sm={12} md={3}>
                      <FormLabel style={styles.labelHorizontal}>
                        Баруун ховдол:
                      </FormLabel>
                    </GridItem>
                    <GridItem xs={12} sm={12} md={9}>
                      <GridContainer>
                        <GridItem xs={12} sm={12} md={6}>
                          <BaseCustomTextField
                            ChangeValue={this.ChangeValue}
                            Config={{
                              ...this.GetConfigField("bh_model"),
                              Label: t("Загвар"),
                            }}
                          />
                        </GridItem>
                        <GridItem xs={12} sm={12} md={6}>
                          <BaseCustomTextField
                            ChangeValue={this.ChangeValue}
                            Config={{
                              ...this.GetConfigField("bh_serial"),
                              Label: t("Сери"),
                            }}
                          />
                        </GridItem>
                        <GridItem xs={12} sm={12} md={6}>
                          <BaseCustomTextField
                            ChangeValue={this.ChangeValue}
                            Config={{
                              ...this.GetConfigField("bh_pos"),
                              Label: t("Байрлал"),
                            }}
                          />
                        </GridItem>
                        <GridItem xs={12} sm={12} md={6}>
                          <BaseCustomTextField
                            ChangeValue={this.ChangeValue}
                            Config={{
                              ...this.GetConfigField("bh_sens"),
                              Label: t("Мэдрэмж"),
                            }}
                          />
                        </GridItem>
                        <GridItem xs={12} sm={12} md={6}>
                          <BaseCustomTextField
                            ChangeValue={this.ChangeValue}
                            Config={{
                              ...this.GetConfigField("bh_pow"),
                              Label: t("Босго хүч"),
                            }}
                          />
                        </GridItem>
                        <GridItem xs={12} sm={12} md={6}>
                          <BaseCustomTextField
                            ChangeValue={this.ChangeValue}
                            Config={{
                              ...this.GetConfigField("bh_res"),
                              Label: t("Эсэргүүцэл"),
                            }}
                          />
                        </GridItem>
                      </GridContainer>
                    </GridItem>
                  </GridContainer>
                  <BaseTextArea
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("biopsy_and_other")}
                    Rows="8"
                  />
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("about_wound")}
                    Row
                  />
                  <BaseTextArea
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("after_diagnosis")}
                    Rows="8"
                  />
                  <BaseTextArea
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("anes_type")}
                    Rows="8"
                  />
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("pm_cond")}
                    Row
                  />

                  <GridContainer>
                    <GridItem xs={12} sm={12} md={3}>
                      <FormLabel className={styles.labelHorizontal}>
                        Баруун ховдол:
                      </FormLabel>
                    </GridItem>
                    <GridItem xs={12} sm={12} md={9}>
                      <GridContainer>
                        <GridItem xs={12} sm={12} md={6}>
                          <BaseCustomTextField
                            ChangeValue={this.ChangeValue}
                            Config={{
                              ...this.GetConfigField("wire_fix"),
                              Label: t("Бэхэлгээнд"),
                            }}
                          />
                        </GridItem>
                        <GridItem xs={12} sm={12} md={6}>
                          <BaseCustomTextField
                            ChangeValue={this.ChangeValue}
                            Config={{
                              ...this.GetConfigField("wire_under"),
                              Label: t("Арьсан дор"),
                            }}
                          />
                        </GridItem>
                        <GridItem xs={12} sm={12} md={6}>
                          <BaseCustomTextField
                            ChangeValue={this.ChangeValue}
                            Config={{
                              ...this.GetConfigField("wire_skin"),
                              Label: t("Арьсанд"),
                            }}
                          />
                        </GridItem>
                      </GridContainer>
                    </GridItem>
                  </GridContainer>

                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("ab_before")}
                    FullWidth={true}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("ab_during")}
                    FullWidth={true}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("ab_after")}
                    FullWidth={true}
                  />
                  <BaseSelect
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("operating_emch")}
                    FullWidth={true}
                  />
                  <BaseSelect
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("support_emch")}
                    FullWidth={true}
                  />
                  <BaseSelect
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("surg_nurse")}
                    FullWidth={true}
                  />
                  <BaseSelect
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("engineer")}
                    FullWidth={true}
                  />
                  <BaseSelect
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("technician")}
                    FullWidth={true}
                  />
                  <BaseSelect
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("anes_emch")}
                    FullWidth={true}
                  />
                  <BaseSelect
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("anes_nurse")}
                    FullWidth={true}
                  />
                  <BaseSelect
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("emch")}
                    FullWidth={true}
                  />
                </div>
              )
            ) : (
              <BaseNoData />
            )}
          </GridItem>
        </GridContainer>
      </div>
    );
  };
}

export default PaceMakerThreeForm;
