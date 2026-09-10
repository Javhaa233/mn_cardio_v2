import { useTranslation } from "react-i18next";
import React from "react";
// translation
import { withTranslation } from "react-i18next";
// @mui/material components
import { css } from "@emotion/css";

// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";

// custom components
import BaseCustomForm from "customComponents/Forms/BaseCustomForm";
// import CustomTab from "customComponents/CustomTab";
import BaseRadio from "customComponents/BaseEditControls/BaseRadio";
import BaseCheckBox from "customComponents/BaseEditControls/BaseCheckBox";
import BaseTextField from "customComponents/BaseEditControls/BaseTextField";
import BaseTextArea from "customComponents/BaseEditControls/BaseTextArea";
import BaseAutoComplete from "customComponents/BaseEditControls/BaseAutoComplete";
import BaseLookUpGridLoad from "baseComponents/Controls/BaseLookUpGridLoad";
// import BaseLookUpGrid from "baseComponents/Controls/BaseLookUpGrid";
import BaseInputMask from "customComponents/BaseEditControls/BaseInputMask";
// import BaseNoData from "customComponents/BaseNoData";
import GroupPanel from "customComponents/GroupPanel";

import CustomTextField from "customComponents/Forms/NationalRegistry/CustomTextField";
import CustomRadio from "customComponents/Forms/Components/CustomRadio";

// helper
import Helper from "helper";

import customFormStyles from "assets/jss/material-dashboard-pro-react/custom/customFormStyles";

const withMui5Styles = (stylesObj) => (WrappedComponent) => {
  const classes = Object.keys(stylesObj).reduce((acc, key) => {
    acc[key] = css(stylesObj[key]);
    return acc;
  }, {});

  const WithMui5Styles = React.forwardRef((props, ref) => (
    <WrappedComponent {...props} classes={classes} ref={ref} />
  ));
  return WithMui5Styles;
};

class KatetrForm extends BaseCustomForm {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      saveLoading: false,
      DataId: null,
      Age: 0,
      Gender: null,
    };
    this.ModifyObject = {
      n_type: "Насанд хүрэгчид",
      n_category: "katetr",
      ognoo: Helper.ObjectHelper.getDateYMD(),
      DiagnosedDate: Helper.ObjectHelper.getDateYMD(),
      StartedDate: Helper.ObjectHelper.getDateYMD(),
      ShinjilgeeDate: Helper.ObjectHelper.getDateYMD(),
      ztsb_date: Helper.ObjectHelper.getDateYMD(),
      het_awia_date: Helper.ObjectHelper.getDateYMD(),
    };
  }

  GetData = () => {
    this.GetLastData();
  };

  GetLastData = async () => {
    const { PatientRegNo } = this.props;

    let alert = null;
    if (PatientRegNo) {
      await Helper.BaseCrudHelper.CallService(
        "/CongenitalMalformations/GetLastData",
        { PatientRegNo, Category: "katetr" },
        (resData) => {
          let DataId = null;
          if (resData && resData.Success && resData.Data) {
            DataId = resData.Data.Id;
            this.setState({
              DataId,
              EditObject: Object.assign({}, resData.Data),
              isLoading: false,
            });
          } else {
            this.setState({ isLoading: false });
          }
        },
      );

      // get Patient data
      var SearchOption = Helper.BaseCrudHelper.GetSearchOption();
      SearchOption.SearchField = [
        { Field: "p_registration", Value: PatientRegNo, Op: "Equals" },
      ];
      await Helper.BaseCrudHelper.BaseGetDetail(
        { ObjectName: "Patient", SearchOption },
        (resData) => {
          if (resData && resData.Data && resData.Success) {
            this.setState({
              Age: resData.Data.Age,
              Gender: resData.Data.p_gender,
            });
          } else {
            alert = Helper.BaseCrudHelper.ShowAlert(
              "Иргэний мэдээлэл татахад алдаа гарлаа",
              false,
              () => this.setState({ Alert: null, isLoading: false }),
            );
            this.setState({ Alert: alert });
          }
        },
      );
    } else {
      alert = Helper.BaseCrudHelper.ShowAlert(
        "Иргэний мэдээлэл олдсонгүй",
        false,
        () => this.setState({ Alert: null, isLoading: false }),
      );
      this.setState({ Alert: alert });
    }
  };

  Save = async (callback) => {
    const { EditObject } = this.state;
    const { PatientRegNo } = this.props;

    let alert = null;
    if (Object.keys(this.ModifyObject).length > 0) {
      const Id = EditObject ? EditObject.Id : null;
      await Helper.BaseCrudHelper.CallService(
        "/CongenitalMalformations/CustomSave",
        {
          PatientRegNo,
          Id,
          Data: JSON.stringify(this.ModifyObject),
        },
        (resData) => {
          let DataId = null;
          if (resData) {
            DataId = resData.Data ? resData.Data.DataId : null;
            this.setState({ DataId });
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
          callback && callback(true);
        },
      );
      this.setState({ Alert: alert });
    }
  };

  Confirm = async (callback) => {
    const { DataId } = this.state;
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

  ChangeValue = (Field, Value) => {
    const { EditObject, Age, Gender } = this.state;
    this.ChangeValueBefore(Field, Value);

    let jin = 0;
    let undur = 0;

    if (Field === "creatinin" || Field === "g_creatinin") {
      // jin = ;
      // undur = ;
    }

    this.ModifyObject[Field] = Value;
    this.MarkDirty();
    this.setState((prevState) => ({
      EditObject: {
        ...prevState.EditObject,
        [Field]: Value,
      },
    }));

    jin = isNaN(parseFloat(this.ModifyObject["b_jin"]))
      ? EditObject && EditObject.Id
        ? parseInt(EditObject.b_jin)
        : 0
      : parseFloat(this.ModifyObject["b_jin"]);
    undur = isNaN(parseFloat(this.ModifyObject["b_undur"]))
      ? EditObject && EditObject.Id
        ? parseInt(EditObject.b_undur)
        : 0
      : parseFloat(this.ModifyObject["b_undur"]);

    let newVal = 0;
    let bgt = 0;

    // БЖИ ба БГТ бодох
    if (undur && jin) {
      newVal = 0;

      newVal = jin / Math.pow(undur / 100, 2);

      this.ModifyObject["b_bji"] = parseFloat(newVal.toFixed(2));
      document.getElementById("b_bji").value = parseFloat(newVal.toFixed(2));

      bgt = 0;
      bgt = 0.20247 * Math.pow(undur / 100, 0.725) * Math.pow(jin, 0.425);
      this.ModifyObject["b_bgt"] = parseFloat(bgt.toFixed(2));
      document.getElementById("b_bgt").value = parseFloat(bgt.toFixed(2));
    }

    const creatininValue = isNaN(parseFloat(this.ModifyObject["creatinin"]))
      ? 0
      : parseFloat(this.ModifyObject["creatinin"]);
    // (Тооцоолох) [[140 -нас(жил)]*жин(кг)]/[72*цусан дахь креатинин (тг/дл)], эмэгтэйд 0.85-р үржинэ)
    if (creatininValue && jin && Age && Gender) {
      newVal = 0;

      const constValue = Gender === "M" ? 1 : 0.85;
      newVal =
        (((140 - parseInt(Age)) * jin) / (72 * creatininValue)) * constValue;

      this.ModifyObject["t_sh_h"] = parseFloat(newVal.toFixed(2));
      document.getElementById("t_sh_h").value = parseFloat(newVal.toFixed(2));
    }

    // Эмнэлгээс гарах үеийн лабораторийн шинжилгээ

    const g_creatininValue = isNaN(parseFloat(this.ModifyObject["g_creatinin"]))
      ? 0
      : parseFloat(this.ModifyObject["g_creatinin"]);

    // (Тооцоолох) [[140 -нас(жил)]*жин(кг)]/[72*цусан дахь креатинин (тг/дл)], эмэгтэйд 0.85-р үржинэ)
    if (g_creatininValue && jin && Age && Gender) {
      newVal = 0;

      const constValue = Gender === "M" ? 1 : 0.85;
      newVal =
        (((140 - parseInt(Age)) * jin) / (72 * g_creatininValue)) * constValue;

      this.ModifyObject["g_t_sh_h"] = parseFloat(newVal.toFixed(2));
      document.getElementById("g_t_sh_h").value = parseFloat(newVal.toFixed(2));
    }

    //
    if (
      this.ModifyObject["lvdd"] &&
      this.ModifyObject["ivsd"] &&
      this.ModifyObject["pwd"]
    ) {
      newVal = 0;

      var lvddValue = isNaN(parseFloat(this.ModifyObject["lvdd"]))
        ? 0
        : parseFloat(this.ModifyObject["lvdd"]);
      var ivsdValue = isNaN(parseFloat(this.ModifyObject["ivsd"]))
        ? 0
        : parseFloat(this.ModifyObject["ivsd"]);
      var pwdValue = isNaN(parseFloat(this.ModifyObject["pwd"]))
        ? 0
        : parseFloat(this.ModifyObject["pwd"]);

      newVal =
        0.8 *
          1.04 *
          (Math.pow(lvddValue + ivsdValue + pwdValue, 3) -
            Math.pow(lvddValue, 3)) +
        0.6;
      this.ModifyObject["lv_massi"] = parseFloat(newVal.toFixed(2));
      document.getElementById("lv_massi").value = parseFloat(newVal.toFixed(2));
    }

    process.env.NODE_ENV === "development" &&
      console.log({ ModifyObject: this.ModifyObject });

    this.ChangeValueAfter(Field, Value);
  };

  ChangeValueAfter = (Field, Value) => {
    const childDiv = document.getElementById(Field + "Child");
    const noChildDiv = document.getElementById(Field + "NoChild");
    if (childDiv) {
      if (Value === "a" || Value === "y" || Value === "5")
        childDiv.style.display = "block";
      else childDiv.style.display = "none";
    }

    if (noChildDiv) {
      if (Value === "n" || (Field === "is_hyanalt" && Value + "" === "2")) {
        noChildDiv.style.display = "block";
      } else {
        noChildDiv.style.display = "none";
      }
    }

    if (Field === "organization_id") {
      const orgOther = document.getElementById("organizationOther");
      if (orgOther) {
        orgOther.style.display = Value ? "none" : "block";
      }
    }

    if (Field === "tasag") {
      const orgOther = document.getElementById("tasagOther");
      if (orgOther) {
        orgOther.style.display = Value && Value !== "-1" ? "none" : "block";
      }
    }

    if (Field === "hf_hevteh_uyd_garsan_hvndrel") {
      const childDivs = document.querySelector("#" + Field + "Childs");
      if (childDivs) {
        const childs = childDivs.children;
        for (let i = 0; i < childs.length; i++) {
          if (childs[i]) {
            if (Array.isArray(Value)) {
              childs[i].style.display = Value.includes(
                childs[i].id.replace(Field + "Child-", ""),
              )
                ? "block"
                : "none";
            } else {
              childs[i].style.display =
                Value === childs[i].id.replace(Field + "Child-", "")
                  ? "block"
                  : "none";
            }
          }
        }
      }
    }
  };

  GetOrgOther = () => {
    const { EditObject } = this.state;
    const Value =
      EditObject && EditObject["organization_id"]
        ? EditObject["organization_id"]
        : null;

    return Value ? "none" : "block";
  };

  GetTasagOther = () => {
    const { EditObject } = this.state;
    const Value =
      EditObject && EditObject["tasag"] ? EditObject["tasag"] : null;

    return Value ? "none" : "block";
  };

  GetDisplay = (Field) => {
    const { EditObject } = this.state;
    const Value = EditObject && EditObject[Field] ? EditObject[Field] : "";
    if (Value === "y" || Value === "5") return "block";
    else return "none";
  };

  GetNoDisplay = (Field) => {
    const { EditObject } = this.state;
    const Value = EditObject && EditObject[Field] ? EditObject[Field] : "";
    if (Value === "n" || (Field === "is_hyanalt" && Value + "" === "2"))
      return "block";
    else return "none";
  };

  GetValueDisplay = (Field, Val) => {
    const { EditObject } = this.state;
    const Value = EditObject && EditObject[Field] ? EditObject[Field] : "";
    if (Array.isArray(Value))
      return Value.includes(Val + "") ? "block" : "none";
    else return Value + "" === Val + "" ? "block" : "none";
  };

  CustomRender = () => {
    const { Fields } = this.state;
    const { t, classes } = this.props;

    return (
      <GridContainer style={{ margin: "0", width: "100%" }}>
        <GridItem xs={12} md={12}>
          {Fields && Fields.length > 0 && (
            <div>
              {/* 1. ЕРӨНХИЙ МЭДЭЭЛЭЛ */}
              <GroupPanel title={t("1. ЕРӨНХИЙ МЭДЭЭЛЭЛ")} level={1}>
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("n_type")}
                  defaultValue={"Насанд хүрэгчид"}
                />

                <BaseInputMask
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("ognoo")}
                  Mask={"9999-99-99"}
                  MaskChar={"_"}
                  defaultValue={Helper.ObjectHelper.getDateYMD()}
                />
                <BaseLookUpGridLoad
                  ChangeValue={(value) =>
                    this.ChangeValue("organization_id", value)
                  }
                  Config={this.GetConfigField("organization_id")}
                  WithLabel={true}
                />
                <div
                  id="organizationOther"
                  style={{ display: this.GetOrgOther() }}
                >
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("organization_other")}
                    FullWidth={true}
                  />
                </div>

                <BaseAutoComplete
                  Config={this.GetConfigField("onosh")}
                  FullWidth={true}
                  ChangeValue={this.ChangeValue}
                />
                <BaseAutoComplete
                  Config={this.GetConfigField("hawsarsan_onosh")}
                  FullWidth={true}
                  ChangeValue={this.ChangeValue}
                />

                <BaseInputMask
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("DiagnosedDate")}
                  defaultValue={Helper.ObjectHelper.getDateYMD()}
                  Mask={"9999-99-99"}
                  MaskChar={"_"}
                />
                <BaseInputMask
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("StartedDate")}
                  defaultValue={Helper.ObjectHelper.getDateYMD()}
                  Mask={"9999-99-99"}
                  MaskChar={"_"}
                />

                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("is_udamshil")}
                />
                <div
                  id="is_udamshilChild"
                  className={classes.childDiv}
                  style={{ display: this.GetDisplay("is_udamshil") }}
                >
                  <BaseTextArea
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("udamshil")}
                    FullWidth={true}
                    Rows={3}
                  />
                </div>
                <BaseCheckBox
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("odoogiin_zowiur")}
                />
                <BaseTextArea
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("em_taria_hereglej_bga")}
                  FullWidth={true}
                  Rows={3}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("is_harvalt")}
                />
              </GroupPanel>

              {/* 2. БОДИТ ҮЗЛЭГ */}
              <GroupPanel title={t("2. БОДИТ ҮЗЛЭГ")} level={1}>
                <GridContainer>
                  <GridItem xs={12} sm={6} md={6}>
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("jin")}
                    />
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("undur")}
                    />
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("ad_deed")}
                    />
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("ad_dood")}
                    />
                  </GridItem>
                  <GridItem xs={12} sm={6} md={6}>
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("ztst")}
                    />
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("at")}
                    />
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("saturatsi")}
                    />
                  </GridItem>
                </GridContainer>

                {/* ШИНЖ ТЭМДЭГ */}
                <GroupPanel title={t("ШИНЖ ТЭМДЭГ")} level={2}>
                  <BaseCheckBox
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("zahiin_shinj")}
                    boxMd={6}
                  />
                  <BaseCheckBox
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("uushginii_shinj")}
                    boxMd={6}
                  />
                  <BaseCheckBox
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("zurhnii_shinj")}
                    boxMd={6}
                  />
                  <BaseCheckBox
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("hevliin_shinj")}
                    boxMd={6}
                  />
                  {/* <BaseCheckBox
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("shuugian_shinj_chanar")}
                  boxMd={6}
                /> */}
                  <GroupPanel title={t("Шуугианы шинж чанар")} level={3}>
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("shuugian_systol")}
                    />
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("shuugian_diastol")}
                    />
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("shuugian_bairlal")}
                      boxMd={3}
                    />
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("shuugian_damjilt")}
                    />
                    <GridContainer>
                      <GridItem xs={12} sm={4} md={4}>
                        <BaseTextField
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("shuugian_tod")}
                        />
                      </GridItem>
                      <GridItem xs={12} sm={4} md={4}>
                        <BaseTextField
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("shuugian_sulavtar")}
                        />
                      </GridItem>
                      <GridItem xs={12} sm={4} md={4}>
                        <BaseTextField
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("shuugian_sul")}
                        />
                      </GridItem>
                    </GridContainer>
                  </GroupPanel>
                </GroupPanel>
              </GroupPanel>

              {/* 3. ЛАБОРАТОРЫН ШИНЖИЛГЭЭ */}
              <GroupPanel title={t("3. ЛАБОРАТОРЫН ШИНЖИЛГЭЭ")} level={1}>
                <BaseInputMask
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("ShinjilgeeDate")}
                  defaultValue={Helper.ObjectHelper.getDateYMD()}
                  Mask={"9999-99-99"}
                  MaskChar={"_"}
                />
                <GridContainer>
                  <GridItem xs={12} md={6}>
                    <table className={classes.customTable}>
                      <thead>
                        <tr>
                          <th colSpan={2}>{t("Цусны дэлгэрэнгүй")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td width={"50%"}>{t("WBC (103/ul)")}</td>
                          <td width={"50%"}>
                            <CustomTextField
                              ChangeValue={this.ChangeValue}
                              Config={this.GetConfigField("wbc")}
                            />
                          </td>
                        </tr>
                        <tr>
                          <td>{t("RBC (106/ul)")}</td>
                          <td>
                            <CustomTextField
                              ChangeValue={this.ChangeValue}
                              Config={this.GetConfigField("rbc")}
                            />
                          </td>
                        </tr>
                        <tr>
                          <td>{t("Hb (g/l)")}</td>
                          <td>
                            <CustomTextField
                              ChangeValue={this.ChangeValue}
                              Config={this.GetConfigField("hb")}
                            />
                          </td>
                        </tr>
                        <tr>
                          <td>{t("HCT (%)")}</td>
                          <td>
                            <CustomTextField
                              ChangeValue={this.ChangeValue}
                              Config={this.GetConfigField("hct")}
                            />
                          </td>
                        </tr>
                        <tr>
                          <td>{t("PLT (103/ul)")}</td>
                          <td>
                            <CustomTextField
                              ChangeValue={this.ChangeValue}
                              Config={this.GetConfigField("plt")}
                            />
                          </td>
                        </tr>
                        <tr>
                          <td>{t("СОЭ")}</td>
                          <td>
                            <CustomTextField
                              ChangeValue={this.ChangeValue}
                              Config={this.GetConfigField("coe")}
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </GridItem>
                  <GridItem xs={12} md={6}>
                    <table className={classes.customTable}>
                      <thead>
                        <tr>
                          <th colSpan={2}>{t("Цус бүлэгнэлт")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td width={"50%"}>{t("PT")}</td>
                          <td width={"50%"}>
                            <CustomTextField
                              ChangeValue={this.ChangeValue}
                              Config={this.GetConfigField("pt")}
                            />
                          </td>
                        </tr>
                        <tr>
                          <td>{t("INR")}</td>
                          <td>
                            <CustomTextField
                              ChangeValue={this.ChangeValue}
                              Config={this.GetConfigField("inr")}
                            />
                          </td>
                        </tr>
                        <tr>
                          <td>{t("fibrinogen")}</td>
                          <td>
                            <CustomTextField
                              ChangeValue={this.ChangeValue}
                              Config={this.GetConfigField("fibrinogen")}
                            />
                          </td>
                        </tr>
                        <tr>
                          <td>{t("TT")}</td>
                          <td>
                            <CustomTextField
                              ChangeValue={this.ChangeValue}
                              Config={this.GetConfigField("tt")}
                            />
                          </td>
                        </tr>
                        <tr>
                          <td>{t("APTT")}</td>
                          <td>
                            <CustomTextField
                              ChangeValue={this.ChangeValue}
                              Config={this.GetConfigField("aptt")}
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </GridItem>
                </GridContainer>

                <GroupPanel title={t("Биохими")} level={2}>
                  <GridContainer>
                    <GridItem xs={12} md={6}>
                      <table className={classes.customTable}>
                        <thead>
                          <tr>
                            <th colSpan={2}>{t("Бөөрний үйл ажиллагаа")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td width={"50%"}>{t("Мочевин (mmol/L)")}</td>
                            <td width={"50%"}>
                              <CustomTextField
                                ChangeValue={this.ChangeValue}
                                Config={this.GetConfigField("mochevin")}
                              />
                            </td>
                          </tr>
                          <tr>
                            <td>{t("Креатинин (мкмоль/л, мг/дл)")}</td>
                            <td>
                              <CustomTextField
                                ChangeValue={this.ChangeValue}
                                Config={this.GetConfigField("creatinin")}
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <div style={{ marginTop: "10px" }}>
                        <table className={classes.customTable}>
                          <tbody>
                            <tr>
                              <td width={"50%"}>
                                <b>{t("ASLO")}</b>
                              </td>
                              <td width={"50%"}>
                                <CustomTextField
                                  ChangeValue={this.ChangeValue}
                                  Config={this.GetConfigField("aslo")}
                                />
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <b>{t("CRB")}</b>
                              </td>
                              <td>
                                <CustomTextField
                                  ChangeValue={this.ChangeValue}
                                  Config={this.GetConfigField("crb")}
                                />
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <b>{t("RF")}</b>
                              </td>
                              <td>
                                <CustomTextField
                                  ChangeValue={this.ChangeValue}
                                  Config={this.GetConfigField("rf")}
                                />
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </GridItem>
                    <GridItem xs={12} md={6}>
                      <table className={classes.customTable}>
                        <thead>
                          <tr>
                            <th colSpan={2}>{t("Элэгний үйл ажиллагаа")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td width={"50%"}>{t("Нийт уураг (г/л)")}</td>
                            <td width={"50%"}>
                              <CustomTextField
                                ChangeValue={this.ChangeValue}
                                Config={this.GetConfigField("niit_uurag")}
                              />
                            </td>
                          </tr>
                          <tr>
                            <td>{t("Альбумин")}</td>
                            <td>
                              <CustomTextField
                                ChangeValue={this.ChangeValue}
                                Config={this.GetConfigField("alibumin")}
                              />
                            </td>
                          </tr>
                          <tr>
                            <td>{t("АСАТ")}</td>
                            <td>
                              <CustomTextField
                                ChangeValue={this.ChangeValue}
                                Config={this.GetConfigField("asat")}
                              />
                            </td>
                          </tr>
                          <tr>
                            <td>{t("АЛАТ")}</td>
                            <td>
                              <CustomTextField
                                ChangeValue={this.ChangeValue}
                                Config={this.GetConfigField("alat")}
                              />
                            </td>
                          </tr>
                          <tr>
                            <td>{t("Нийт Билирубин")}</td>
                            <td>
                              <CustomTextField
                                ChangeValue={this.ChangeValue}
                                Config={this.GetConfigField("niit_bilirubin")}
                              />
                            </td>
                          </tr>
                          <tr>
                            <td>{t("ГГТ")}</td>
                            <td>
                              <CustomTextField
                                ChangeValue={this.ChangeValue}
                                Config={this.GetConfigField("ggt")}
                              />
                            </td>
                          </tr>
                          <tr>
                            <td>{t("Глюкоз (mmol/L)")}</td>
                            <td>
                              <CustomTextField
                                ChangeValue={this.ChangeValue}
                                Config={this.GetConfigField("glukoz")}
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </GridItem>
                    <GridItem xs={12} md={6}>
                      <table className={classes.customTable}>
                        <thead>
                          <tr>
                            <th colSpan={2}>{t("Вирүсийн маркер")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td width={"50%"}>{t("HbsAg")}</td>
                            <td width={"50%"}>
                              <CustomRadio
                                ChangeValue={this.ChangeValue}
                                Config={this.GetConfigField("is_hbs_ag")}
                              />
                            </td>
                          </tr>
                          <tr>
                            <td>{t("HCV")}</td>
                            <td>
                              <CustomRadio
                                ChangeValue={this.ChangeValue}
                                Config={this.GetConfigField("is_hcv")}
                              />
                            </td>
                          </tr>
                          <tr>
                            <td>{t("Тэмбүү")}</td>
                            <td>
                              <CustomRadio
                                ChangeValue={this.ChangeValue}
                                Config={this.GetConfigField("is_tembvv")}
                              />
                            </td>
                          </tr>
                          <tr>
                            <td>{t("HIV")}</td>
                            <td>
                              <CustomRadio
                                ChangeValue={this.ChangeValue}
                                Config={this.GetConfigField("is_hiv")}
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </GridItem>
                  </GridContainer>
                </GroupPanel>
              </GroupPanel>

              {/* 4. ЗҮРХНИЙ ЦАХИЛГААН БИЧЛЭГ */}
              <GroupPanel title={t("4. ЗҮРХНИЙ ЦАХИЛГААН БИЧЛЭГ")} level={1}>
                <BaseInputMask
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("ztsb_date")}
                  Mask={"9999-99-99"}
                  MaskChar={"_"}
                  defaultValue={Helper.ObjectHelper.getDateYMD()}
                />
                <BaseCheckBox
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("rhythm")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("rhythm_other")}
                />
              </GroupPanel>

              {/* 5. ЗҮРХНИЙ ХЭТ АВИАН ОНОШИЛГОО */}
              <GroupPanel title={t("5. ЗҮРХНИЙ ХЭТ АВИАН ОНОШИЛГОО")} level={1}>
                <BaseInputMask
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("het_awia_date")}
                  defaultValue={Helper.ObjectHelper.getDateYMD()}
                  Mask={"9999-99-99"}
                  MaskChar={"_"}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("lvdd")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("lvds")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("ivsd")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("pwd")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("lv_massi")}
                  Id="lv_massi"
                  Disabled={true}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("lvef")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("lv_cls")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("la_volume")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("ee_med")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("ee_lat")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("dundaj_ee")}
                  Id="dundaj_ee"
                  Disabled={true}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("taslawch_e")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hajuu_hana_e")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("uushig_systol_daralt")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("tapse")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("rv_fac")}
                />

                {/* Баруун ховдлын хэмжээ */}

                <GroupPanel title={t("Баруун ховдлын хэмжээ")} level={2}>
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("bh_basal")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("bh_mid")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("bh_longitudinal")}
                  />
                </GroupPanel>

                {/* ТХТЦоорхой байрлал */}
                <GroupPanel title={t("ТХТЦоорхой байрлал")} level={2}>
                  {/* <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("txt_tso")}
                /> */}
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("txt_tso_helber")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("txt_tso_hemjee")}
                  />
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("txt_shunt_chiglel")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("txt_shunt_urs_hurd")}
                  />
                </GroupPanel>

                {/* ХХТЦоорхой байрлал */}
                <GroupPanel title={t("ХХТЦоорхой байрлал")} level={2}>
                  {/* <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("xxt_tso")}
                /> */}
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("xxt_tso_helber")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("xxt_tso_hemjee")}
                  />
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("xxt_shunt_chiglel")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("xxt_shunt_urs_hurd")}
                  />
                </GroupPanel>

                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("rvot")}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("rvot_gipertrofi")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("rv")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("rv_zuzaan")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("ra")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("ra_zuzaan")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("tapse")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("rv_fac")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("rv_strain")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("lvot")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("pa_mpa")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("rb")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("lb")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("qp_qs")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("gxx_ursgaliin_hurd")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("gol_sudas_ursgaliin_hurd")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("uushig_ursgaliin_hurd")}
                />

                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("is_havhlaga")}
                />
              </GroupPanel>

              {/* 6. КАТЕТР АНГИОГРАФИ ШИНЖИЛГЭЭНИЙ ӨМНӨХ ОНОШ */}
              <GroupPanel
                title={t("6. КАТЕТР АНГИОГРАФИ ШИНЖИЛГЭЭНИЙ ӨМНӨХ ОНОШ")}
                level={1}
              >
                {/* Тосгуур хоорондын таславчийн цоорхой
                    Ховдол хоорондын таславчийн цоорхой
                    Артерийн битрүүрээгүй цорго
                    Уушгины артерийн нарийсал
                    Бусад /___________________________/ */}

                {/* <BaseAutoComplete
                  Config={this.GetConfigField("katetr_b_onosh")}
                  FullWidth={true}
                  ChangeValue={this.ChangeValue}
                /> */}

                <BaseCheckBox
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("neelttei_mes_onosh")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("neelttei_mes_onosh_other")}
                  FullWidth={true}
                />

                {/*  */}
                <BaseTextArea
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("shinjilgee_notes")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("niit_shinjilgee_urgeljilsen")}
                  FullWidth={true}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("k_hatgalt_sudas")}
                  FullWidth={true}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("k_fluroscopi_full_time")}
                  FullWidth={true}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("k_tod_bodis_hemjee")}
                  FullWidth={true}
                />
              </GroupPanel>

              {/* 7. КАТЕТР АНГИОГРАФИ ШИНЖИЛГЭЭНИЙ ДАРААХ ОНОШ */}
              <GroupPanel
                title={t("7. КАТЕТР АНГИОГРАФИ ШИНЖИЛГЭЭНИЙ ДАРААХ ОНОШ")}
                level={1}
              >
                <BaseAutoComplete
                  Config={this.GetConfigField("katetr_n_onosh")}
                  FullWidth={true}
                  ChangeValue={this.ChangeValue}
                />
              </GroupPanel>

              {/* 8. КАТЕТР АНГИОГРАФИ ШИНЖИЛГЭЭНИЙ ДАРАА */}
              <GroupPanel
                title={t("8. КАТЕТР АНГИОГРАФИ ШИНЖИЛГЭЭНИЙ ДАРАА")}
                level={1}
              >
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("n_qp_qs")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("n_pvr")}
                />
              </GroupPanel>

              {/* 9. ЭМЧИЛГЭЭ */}
              <GroupPanel title={t("9. ЭМЧИЛГЭЭ")} level={1}>
                <div className={classes.childDiv}>
                  <p>Антиагрегант:</p>
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("antiagregant_name")}
                    FullWidth={true}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("antiagregant_tun")}
                  />
                </div>

                <div className={classes.childDiv}>
                  <p>Антикоагулянт:</p>
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("antikoagulyant_name")}
                    FullWidth={true}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("antikoagulyant_tun")}
                  />
                </div>

                <div className={classes.childDiv}>
                  <p>Эндотелийн рецепторын антагонист:</p>
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("era_name")}
                    FullWidth={true}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("era_tun")}
                  />
                </div>

                <div className={classes.childDiv}>
                  <p>PDE-ингибитор:</p>
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("pde_name")}
                    FullWidth={true}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("pde_tun")}
                  />
                </div>

                <div className={classes.childDiv}>
                  <p>Шээс хөөх /МРА/:</p>
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("shees_huuh_name")}
                    FullWidth={true}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("shees_huuh_tun")}
                  />
                </div>

                <div className={classes.childDiv}>
                  <p>β-хориглогч:</p>
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("beta_name")}
                    FullWidth={true}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("beta_tun")}
                  />
                </div>

                <div className={classes.childDiv}>
                  <p>АРНС /ARNI/:</p>
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("aphc_arni_name")}
                    FullWidth={true}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("aphc_arni_tun")}
                  />
                </div>

                <div className={classes.childDiv}>
                  <p>Ангиотензин хувиргагч фермент саатуулагч:</p>
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("ahfs_name")}
                    FullWidth={true}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("ahfs_tun")}
                  />
                </div>
              </GroupPanel>
            </div>
          )}
        </GridItem>
      </GridContainer>
    );
  };
}

export default withTranslation(undefined, { withRef: true })(
  withMui5Styles(customFormStyles)(KatetrForm),
);
