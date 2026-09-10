import { useTranslation } from "react-i18next";
import React from "react";
// translation
import { withTranslation } from "react-i18next";
// @mui/material components
import { Box } from "@mui/material";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// custom components
import BaseCustomForm from "customComponents/Forms/BaseCustomForm";
// import CustomTab from "customComponents/CustomTab";
import BaseRadio from "customComponents/BaseEditControls/BaseRadio";
import BaseCheckBox from "customComponents/BaseEditControls/BaseCheckBox";
import BaseTextField from "customComponents/BaseEditControls/BaseTextField";
//import BaseTextArea from "customComponents/BaseEditControls/BaseTextArea";
// import BaseAutoComplete from "customComponents/BaseEditControls/BaseAutoComplete";
import BaseLookUpGridLoad from "baseComponents/Controls/BaseLookUpGridLoad";
// import BaseLookUpGrid from "baseComponents/Controls/BaseLookUpGrid";
import BaseInputMask from "customComponents/BaseEditControls/BaseInputMask";
import BaseNoData from "customComponents/BaseNoData";
import GroupPanel from "customComponents/GroupPanel";
import CustomRadio from "customComponents/Forms/Components/CustomRadio";
import CustomTextField from "customComponents/Forms/NationalRegistry/CustomTextField";

// helper
import Helper from "helper";

import customFormStyles from "assets/jss/material-dashboard-pro-react/custom/customFormStyles";

const sx = customFormStyles;

class AtrialRhythmNewForm extends BaseCustomForm {
  constructor(props) {
    super(props);
    this.state = { ...this.state, DataId: null, Age: 0, Gender: null };
    this.ModifyObject = { visit_date: Helper.ObjectHelper.getDateYMD() };
  }

  GetData = async () => await this.GetLastData();

  GetLastData = async () => {
    const { PatientRegNo, t } = this.props;

    let alert = null;
    if (PatientRegNo) {
      await Helper.BaseCrudHelper.CallService(
        "/AtrialRhythmNew/GetLastData",
        { PatientRegNo },
        (resData) => {
          if (resData && resData.Success && resData.Data) {
            this.setState({
              DataId: resData.Data.Id,
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
          if (resData && resData.Success && resData.Data) {
            this.setState({
              Age: resData.Data.Age,
              Gender: resData.Data.p_gender,
            });
          } else {
            alert = Helper.BaseCrudHelper.ShowAlert(
              t("Иргэний мэдээлэл татахад алдаа гарлаа"),
              false,
              () => this.setState({ Alert: null, isLoading: false }),
            );
            this.setState({ Alert: alert });
          }
        },
      );
    } else {
      alert = Helper.BaseCrudHelper.ShowAlert(
        t("Иргэний мэдээлэл олдсонгүй"),
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
    if (PatientRegNo && Object.keys(this.ModifyObject).length > 0) {
      const Id = EditObject ? EditObject.Id : null;
      await Helper.BaseCrudHelper.CallService(
        "/AtrialRhythmNew/CustomSave",
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
          } else {
            callback && callback(false);
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

  Confirm = async (callback) => {
    const { DataId } = this.state;
    let alert = null;
    if (DataId) {
      await Helper.BaseCrudHelper.CallService(
        "/AtrialRhythmNew/Confirm",
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

    this.ModifyObject[Field] = Value;
    this.MarkDirty();
    this.setState((prevState) => ({
      EditObject: {
        ...prevState.EditObject,
        [Field]: Value,
      },
    }));

    jin = isNaN(parseFloat(this.ModifyObject["jin"]))
      ? EditObject && EditObject.Id
        ? parseFloat(EditObject.jin)
        : 0
      : parseFloat(this.ModifyObject["jin"]);
    undur = isNaN(parseFloat(this.ModifyObject["undur"]))
      ? EditObject && EditObject.Id
        ? parseFloat(EditObject.undur)
        : 0
      : parseFloat(this.ModifyObject["undur"]);

    let newVal = 0;
    let bgt = 0;

    // БЖИ ба БГТ бодох
    if (undur && jin) {
      newVal = 0;
      newVal = jin / Math.pow(undur / 100, 2);
      this.ModifyObject["bji"] = parseFloat(newVal.toFixed(2));
      document.getElementById("bji").value = parseFloat(newVal.toFixed(2));

      bgt = 0;
      bgt = 0.20247 * Math.pow(undur / 100, 0.725) * Math.pow(jin, 0.425);
      this.ModifyObject["bsa"] = parseFloat(bgt.toFixed(2));
      document.getElementById("bsa").value = parseFloat(bgt.toFixed(2));
    }

    if (Field === "creatinin") {
      // jin = ;
      // undur = ;

      let creatininValue =
        this.ModifyObject["creatinin"] &&
        isNaN(parseFloat(this.ModifyObject["creatinin"]))
          ? EditObject &&
            EditObject.Id &&
            isNaN(parseFloat(EditObject["creatinin"]))
            ? 0
            : parseFloat(EditObject["creatinin"])
          : parseFloat(this.ModifyObject["creatinin"]);
      const creatininType = this.ModifyObject["creatinin_type"]
        ? this.ModifyObject["creatinin_type"]
        : EditObject && EditObject.Id && EditObject["creatinin_type"]
          ? EditObject["creatinin_type"]
          : "1";

      // (Тооцоолох) [[140 -нас(жил)]*жин(кг)]/[72*цусан дахь креатинин (тг/дл)], эмэгтэйд 0.85-р үржинэ)
      if (!isNaN(parseFloat(creatininValue)) && jin && Age && Gender) {
        newVal = 0;

        if (creatininType === "2") {
          creatininValue = creatininValue * 0.0113;
        }
        const constValue = Gender === "M" ? 1 : 0.85;
        newVal =
          (((140 - parseFloat(Age)) * jin) / (72 * creatininValue)) *
          constValue;

        document.getElementById("t_sh_h").value = parseFloat(newVal.toFixed(2));
      }
    }

    // LV mass (g)
    if (
      this.ModifyObject["lvdd"] &&
      this.ModifyObject["lvds"] &&
      this.ModifyObject["pwd"]
    ) {
      newVal = 0;
      var lvddValue = isNaN(parseFloat(this.ModifyObject["lvdd"]))
        ? 0
        : parseFloat(this.ModifyObject["lvdd"]);
      var lvdsValue = isNaN(parseFloat(this.ModifyObject["lvds"]))
        ? 0
        : parseFloat(this.ModifyObject["lvds"]);
      var pwdValue = isNaN(parseFloat(this.ModifyObject["pwd"]))
        ? 0
        : parseFloat(this.ModifyObject["pwd"]);

      newVal =
        0.8 *
          1.04 *
          (Math.pow(lvddValue + lvdsValue + pwdValue, 3) -
            Math.pow(lvddValue, 3)) +
        0.6;
      this.ModifyObject["lvmass"] = parseFloat(newVal.toFixed(2));
      document.getElementById("lvmass").value = parseFloat(newVal.toFixed(2));
    }

    process.env.NODE_ENV === "development" &&
      console.log({ ModifyObject: this.ModifyObject });

    this.ChangeValueAfter(Field, Value);
    if (Field === "nyha") {
      this.forceUpdate();
    }
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
      if (Value === "n") noChildDiv.style.display = "block";
      else noChildDiv.style.display = "none";
    }

    if (Field === "organization_id") {
      const orgOther = document.getElementById("organizationOther");
      if (orgOther) orgOther.style.display = Value ? "none" : "block";
    }

    if (Field === "tasag") {
      const tasagOther = document.getElementById("tasagOther");
      if (tasagOther)
        tasagOther.style.display = Value && Value !== "-1" ? "none" : "block";
    }

    if (Field === "tamhidalt" || Field === "arhi_hereglee") {
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
    if (Value === "n") return "block";
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
    const { t } = this.props;

    return (
      <GridContainer style={{ margin: "0", width: "100%" }}>
        <GridItem xs={12} md={12}>
          {Fields ? (
            <div>
              <GroupPanel title={t("Үзлэг № 1 - Эхний үзлэг")} level={1}>
                <BaseInputMask
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("visit_date")}
                  defaultValue={Helper.ObjectHelper.getDateYMD()}
                  Mask={"9999-99-99"}
                  MaskChar={"_"}
                />

                <GroupPanel
                  title={t("1. Хэвтэн эмчлүүлэх/Зөвлөгөөний мэдээлэл")}
                  level={2}
                  collapsible
                >
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("type")}
                  />
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("advice_type")}
                  />
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("emch_type")}
                  />
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("hamrah_negj")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("hamrah_negj_other")}
                    FullWidth={true}
                  />
                </GroupPanel>
                <GroupPanel
                  title={t("2. Оролцогчийн мэдээлэл")}
                  level={2}
                  collapsible
                >
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("gender")}
                  />
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("is_tsevershilt")}
                    Unknown={true}
                  />
                  <BaseInputMask
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("birthdate")}
                    defaultValue={Helper.ObjectHelper.getDateYMD()}
                    Mask={"9999-99-99"}
                    MaskChar={"_"}
                  />
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("living")}
                  />
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("ger_bul")}
                  />
                  <BaseCheckBox
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("main_shaltgaan")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("main_shaltgaan_other")}
                    FullWidth={true}
                  />
                </GroupPanel>
                <GroupPanel
                  title={t(
                    "3. Зүрх судасны өвчлөлийн талаарх мэдээлэл / асуумж",
                  )}
                  level={2}
                  collapsible
                >
                  <BaseInputMask
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("shinj_start_date")}
                    defaultValue={Helper.ObjectHelper.getDateYMD()}
                    Mask={"9999-99-99"}
                    MaskChar={"_"}
                  />
                  <BaseInputMask
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("shinj_daraa_first_date")}
                    defaultValue={Helper.ObjectHelper.getDateYMD()}
                    Mask={"9999-99-99"}
                    MaskChar={"_"}
                  />
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("shinj_daraa_first_where")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField(
                      "shinj_daraa_first_where_other",
                    )}
                    FullWidth={true}
                  />

                  <BaseInputMask
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("hevtsen_ognoo")}
                    defaultValue={Helper.ObjectHelper.getDateYMD()}
                    Mask={"9999-99-99"}
                    MaskChar={"_"}
                  />
                  <BaseInputMask
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("onosh_ognoo")}
                    defaultValue={Helper.ObjectHelper.getDateYMD()}
                    Mask={"9999-99-99"}
                    MaskChar={"_"}
                  />
                </GroupPanel>
                <GroupPanel title={t("4. Бодит үзлэг")} level={2} collapsible>
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("undur")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("jin")}
                  />
                  <BaseTextField
                    Id="bji"
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("bji")}
                    Disabled
                  />
                  <BaseTextField
                    Id="bsa"
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("bsa")}
                    Disabled
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("ad_deed")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("ad_dood")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("z_ts_t")}
                  />
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("synus_hemnel")}
                    Unknown
                  />

                  <Box component="table" sx={sx.customTable}>
                    <thead>
                      <tr>
                        <th colSpan={2}>{t("Зүрх чагналтаар")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td
                          style={{ fontSize: "14px", fontWeight: "400" }}
                          width={"44%"}
                        >
                          <b>{t("Хавхлагын чимээ:")}</b>
                        </td>
                        <td>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("zurh_chagnalt")}
                            Unknown
                            UnknownText={t("Тодорхойгүй")}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontSize: "14px", fontWeight: "400" }}>
                          {t("Тийм бол:")}{" "}
                        </td>
                        <td></td>
                      </tr>

                      {/* aort */}
                      <tr>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              flex: "row",
                              justifyContent: "stretch",
                              fontSize: "14px",
                              fontWeight: "400",
                            }}
                          >
                            <div>{t("-Аортын хавхлага:")}</div>
                            <div>
                              {t("- Нарийсал")} <br />
                              {t("- Регургитаци")}
                            </div>
                          </div>
                        </td>
                        <td>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("aort_nar")}
                            Unknown
                            UnknownText={t("Тодорхойгүй")}
                          />
                          <br />
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("aort_reg")}
                            Unknown
                            UnknownText={t("Тодорхойгүй")}
                          />
                        </td>
                      </tr>
                      {/* mitral */}
                      <tr>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              flex: "row",
                              justifyContent: "stretch",
                              fontSize: "14px",
                              fontWeight: "400",
                            }}
                          >
                            <div>{t("-Митрал хавхлага:")}</div>
                            <div>
                              {t("- Нарийсал")} <br />
                              {t("- Регургитаци")}
                            </div>
                          </div>
                        </td>
                        <td>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("mitral_nar")}
                            Unknown
                            UnknownText={t("Тодорхойгүй")}
                          />
                          <br />
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("mitral_reg")}
                            Unknown
                            UnknownText={t("Тодорхойгүй")}
                          />
                        </td>
                      </tr>
                      {/* 3 havtast */}
                      <tr>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              flex: "row",
                              justifyContent: "stretch",
                              fontSize: "14px",
                              fontWeight: "400",
                            }}
                          >
                            <div>{t("-Гурван хавтаст:")}</div>
                            <div>
                              {t("- Нарийсал")} <br />
                              {t("- Регургитаци")}
                            </div>
                          </div>
                        </td>
                        <td>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("gurvan_havtast_nar")}
                            Unknown
                            UnknownText={t("Тодорхойгүй")}
                          />
                          <br />
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("gurvan_havtast_reg")}
                            Unknown
                            UnknownText={t("Тодорхойгүй")}
                          />
                        </td>
                      </tr>
                      {/* Uushig */}
                      <tr>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              flex: "row",
                              justifyContent: "stretch",
                              fontSize: "14px",
                              fontWeight: "400",
                            }}
                          >
                            <div>{t("-Уушгины хавхлага:")}</div>
                            <div>
                              {t("- Нарийсал")} <br />
                              {t("- Регургитаци")}
                            </div>
                          </div>
                        </td>
                        <td>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("uushig_nar")}
                            Unknown
                            UnknownText={t("Тодорхойгүй")}
                          />
                          <br />
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("uushig_reg")}
                            Unknown
                            UnknownText={t("Тодорхойгүй")}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontSize: "14px", fontWeight: "400" }}>
                          <b>{t("Уушгины хэржигнүүр")}</b>
                        </td>
                        <td>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("uushig_herjig")}
                            Unknown
                            UnknownText={t("Тодорхойгүй")}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontSize: "14px", fontWeight: "400" }}>
                          <b>{t("S3 морин төвөргөөн")}</b>
                        </td>
                        <td>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("s3_morin")}
                            Unknown
                            UnknownText={t("Тодорхойгүй")}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </Box>

                  <div style={{ height: "18px" }}></div>
                  <Box component="table" sx={sx.customTable}>
                    <thead>
                      <tr>
                        <th>{t("Шинж тэмдэг ба бодит үзлэг")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td
                          style={{ fontSize: "14px", fontWeight: "400" }}
                          width={"44%"}
                        >
                          <b>{t("Амьсгаадалт")}</b>
                        </td>
                        <td>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("nyha")}
                            Unknown
                            UnknownText={t("Тодорхойгүй")}
                          />
                          <table
                            style={{
                              border: "1px",
                              borderCollapse: "collapse",
                            }}
                          >
                            <tbody>
                              <tr
                                style={{
                                  fontWeight:
                                    (this.ModifyObject["nyha"] ||
                                      (this.state.EditObject &&
                                        this.state.EditObject["nyha"])) +
                                      "" ===
                                    "1"
                                      ? "bold"
                                      : "normal",
                                  color:
                                    (this.ModifyObject["nyha"] ||
                                      (this.state.EditObject &&
                                        this.state.EditObject["nyha"])) +
                                      "" ===
                                    "1"
                                      ? "#000"
                                      : "#555",
                                }}
                              >
                                <td>
                                  <b>{t("I зэрэг")}</b>
                                </td>
                                <td>
                                  {t(
                                    "Идэвхтэй хөдөлгөөн хязгаарлагдаагүй. Энгийн дасгал хөдөлгөөн нь амьсгаадах, ядарч сульдах, эсвэл зүрх дэлсэх шалтгаан болохгүй.",
                                  )}
                                </td>
                              </tr>
                              <tr
                                style={{
                                  fontWeight:
                                    (this.ModifyObject["nyha"] ||
                                      (this.state.EditObject &&
                                        this.state.EditObject["nyha"])) +
                                      "" ===
                                    "2"
                                      ? "bold"
                                      : "normal",
                                  color:
                                    (this.ModifyObject["nyha"] ||
                                      (this.state.EditObject &&
                                        this.state.EditObject["nyha"])) +
                                      "" ===
                                    "2"
                                      ? "#000"
                                      : "#555",
                                }}
                              >
                                <td>
                                  <b>{t("II зэрэг")}</b>
                                </td>
                                <td>
                                  {t(
                                    "Идэвхтэй хөдөлгөөн бага зэрэг хязгаарлагдана. Биеийн хүчний ердийн ачаалалын үед буюу энгийн дасгал хөдөлгөөнд амьсгаадах, ядрах, эсвэл зүрх дэлсэх шинж тэмдэг илэрнэ.",
                                  )}{" "}
                                </td>
                              </tr>
                              <tr
                                style={{
                                  fontWeight:
                                    (this.ModifyObject["nyha"] ||
                                      (this.state.EditObject &&
                                        this.state.EditObject["nyha"])) +
                                      "" ===
                                    "3"
                                      ? "bold"
                                      : "normal",
                                  color:
                                    (this.ModifyObject["nyha"] ||
                                      (this.state.EditObject &&
                                        this.state.EditObject["nyha"])) +
                                      "" ===
                                    "3"
                                      ? "#000"
                                      : "#555",
                                }}
                              >
                                <td>
                                  <b>{t("III зэрэг")}</b>
                                </td>
                                <td>
                                  {t(
                                    "Идэвхтэй хөдөлгөөн мэдэгдэхүйц хязгаарлагдана. Биеийн хүчний ердийнхөөс бага ачаалалын үед шинж тэмдэг илэрнэ, гэхдээ тайван байдалд амьсгаадалт илрэхгүй.",
                                  )}
                                </td>
                              </tr>
                              <tr
                                style={{
                                  fontWeight:
                                    (this.ModifyObject["nyha"] ||
                                      (this.state.EditObject &&
                                        this.state.EditObject["nyha"])) +
                                      "" ===
                                    "4"
                                      ? "bold"
                                      : "normal",
                                  color:
                                    (this.ModifyObject["nyha"] ||
                                      (this.state.EditObject &&
                                        this.state.EditObject["nyha"])) +
                                      "" ===
                                    "4"
                                      ? "#000"
                                      : "#555",
                                }}
                              >
                                <td>
                                  <b>{t("IV зэрэг")}</b>
                                </td>
                                <td>
                                  {t(
                                    "Зовуурь шинж тэмдэг илрэхгүйгээр ямар нэг дасгал хөдөлгөөн хийж чадахгүй. Тайван үед шинж тэмдэг илэрнэ. Ямар нэг дасгал хөдөлгөөн хийвэл бие тавгүй болж зовуурь шинж тэмдэг нэмэгдэнэ.",
                                  )}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontSize: "14px", fontWeight: "400" }}>
                          <b>{t("Цээжээр өвдөх")}</b>
                        </td>
                        <td>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("tseejeer_uvduh")}
                            Unknown
                            UnknownText={t("Тодорхойгүй")}
                          />
                          <div style={{ fontSize: "14px", fontWeight: "400" }}>
                            {t("Хэрэв тийм бол:")}
                          </div>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("tseejeer_uvduh_yes")}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontSize: "14px", fontWeight: "400" }}>
                          <b>{t("Түр зуур ухаан алдах")}</b>
                        </td>
                        <td>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("tur_uhaan_aldah")}
                            Unknown
                            UnknownText={t("Тодорхойгүй")}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontSize: "14px", fontWeight: "400" }}>
                          <b>{t("Ухаан балартах")}</b>
                        </td>
                        <td>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("uhaan_balartah")}
                            Unknown
                            UnknownText={t("Тодорхойгүй")}
                          />
                        </td>
                      </tr>

                      <tr>
                        <td style={{ fontSize: "14px", fontWeight: "400" }}>
                          <b>{t("Захын хаван")}</b>
                        </td>
                        <td>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("zahiin_havan")}
                            Unknown
                            UnknownText={t("Тодорхойгүй")}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </Box>
                </GroupPanel>

                <GroupPanel
                  title={t(
                    "5. Энэ үзлэгийн үед мэдэгдсэн хавсарсан өвчин ба/эсвэл эрсдэлт хүчин зүйлс",
                  )}
                  level={2}
                  collapsible
                >
                  <Box component="table" sx={sx.customTable}>
                    <thead>
                      <tr>
                        <th>
                          {t(
                            "Зүрх судасны ямарваа эрсдэлт хүчин зүйл байна уу?",
                          )}
                        </th>
                        <th>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("zurh_ersdelt_huchin")}
                            Unknown
                            UnknownText={t("Тодорхойгүй")}
                          />
                        </th>
                      </tr>
                      <tr>
                        <th colSpan={2}>
                          {t("Хэрэв тийм бол доорх хүснэгтийг бөглөнө үү.")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ fontSize: "14px", fontWeight: "400" }}>
                          <b>{t("Даралт ихсэлт")}</b>
                        </td>
                        <td>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("daralt_ihselt")}
                            Unknown
                            UnknownText={t("Тодорхойгүй")}
                          />
                          <br />
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("daralt_ihselt_yes")}
                            Unknown
                            UnknownText={t("Тодорхойгүй")}
                          />
                          <br />
                          <p>
                            {t(
                              '(*)(сонголтоор) Эмийн эмчилгээний талаар "Эмийн хэрэглээ" хэсэгт тэмдэглэнэ үү',
                            )}{" "}
                          </p>
                          <br />
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField(
                              "daralt_ihselt_hugatsaa",
                            )}
                            Unknown
                            UnknownText={t("Тодорхойгүй")}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontSize: "14px", fontWeight: "400" }}>
                          <b>{t("Тамхины хэрэглээ")}</b>
                        </td>
                        <td>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("tamhi_hereglee")}
                          />
                          <br />
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("tamhi_hereglee_yes")}
                          />
                          <br />
                          <CustomTextField
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("tamhi_hereglee_box")}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontSize: "14px", fontWeight: "400" }}>
                          <b>{t("Архины хэрэглээ")}</b>
                        </td>
                        <td>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("arhinii_hereglee")}
                          />
                          <br />
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("arhinii_hereglee_yes")}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontSize: "14px", fontWeight: "400" }}>
                          <b>{t("Эмийн хэрэглээ / хамаарал")}</b>
                        </td>
                        <td>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("emiin_hereglee")}
                          />
                          <br />
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("emiin_hereglee_yes")}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontSize: "14px", fontWeight: "400" }}>
                          <b>{t("Идэвхтэй хөдөлгөөн")}</b>
                        </td>
                        <td>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("idevhitei_hudul")}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontSize: "14px", fontWeight: "400" }}>
                          <b>{t("Чихрийн шижин")}</b>
                        </td>
                        <td>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("chihriin_shijin")}
                            Unknown
                            UnknownText={t("Тодорхойгүй")}
                          />
                          <br />
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("chihriin_shijin_yes")}
                          />
                          <br />
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField(
                              "chihriin_shijin_hugatsaa",
                            )}
                          />
                          <br />
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField(
                              "chihriin_shijin_odoo_emchilgee",
                            )}
                          />
                          <br />
                          <p>
                            {t(
                              "(*) Эмчилгээг эмийн хэрэглээ (жишээ нь 10-р хэсэг) хэсэгт тэмдэглэнэ үү.",
                            )}
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontSize: "14px", fontWeight: "400" }}>
                          <b>{t("Дислипидеми")}</b>
                        </td>
                        <td>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("dislipidemi")}
                            Unknown
                            UnknownText={t("Тодорхойгүй")}
                          />
                          <br />
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("dislipidemi_yes")}
                          />
                          <br />
                          <CustomTextField
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField(
                              "dislipidemi_yes_other",
                            )}
                          />
                          <br />
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("dislipidemi_udamshil")}
                          />
                          <br />
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("dislipidemi_hugatsaa")}
                          />
                          <br />
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField(
                              "dislipidemi_emchilgee",
                            )}
                          />
                          <br />
                          <p>
                            {t(
                              "(*) Эмчилгээг эмийн хэрэглээ (10-р хэсэг) хэсэгт тэмдэглэнэ үү.",
                            )}
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontSize: "14px", fontWeight: "400" }}>
                          <b>{t("Зүрх судасны өвчний удамшлын өгүүлэмж")}</b>
                        </td>
                        <td>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField(
                              "zurh_udamshliin_oguul",
                            )}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontSize: "14px", fontWeight: "400" }}>
                          <b>
                            {t(
                              "Гэнэт нас барах эмгэгийн удамшлын өгүүлэмж (40-өөс доош насны 1 ба түүнээс дээш төрөл садан)",
                            )}
                          </b>
                        </td>
                        <td>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("genet_nas_barah_udam")}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontSize: "14px", fontWeight: "400" }}>
                          <b>
                            {t(
                              "Титэм судасны эмгэгийн (ТСЭ) удамшлын өгүүлэмж",
                            )}
                          </b>
                        </td>
                        <td>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("titem_emgeg_udamshil")}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </Box>

                  <div style={{ height: "18px" }}></div>

                  <Box component="table" sx={sx.customTable}>
                    <thead>
                      <tr>
                        <th>{t("Зүрх судасны өвчний өгүүлэмжтэй эсэх?")}</th>
                        <td>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("zurh_sudas_oguulemj")}
                            Unknown
                            UnknownText={t("Тодорхойгүй")}
                          />
                        </td>
                      </tr>
                      <tr>
                        <th colSpan={2}>
                          {t("Тийм бол доорх хүснэгтийг бөглөнө үү.")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ fontSize: "14px", fontWeight: "400" }}>
                          {t("Тосгуурын жирвэгнээ (ТЖ)")}
                        </td>
                        <td>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("z_s_tosguur")}
                            Unknown
                            UnknownText={t("Тодорхойгүй")}
                          />
                          <br />
                          <p>{t("Тийм бол:")}</p>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("z_s_tosguur_yes")}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontSize: "14px", fontWeight: "400" }}>
                          {t("Зүрхний дутагдал (ЗД)")}
                        </td>
                        <td>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("z_s_dutagdal")}
                            Unknown
                            UnknownText={t("Тодорхойгүй")}
                          />
                          <br />
                          <p>
                            {t("Хэрэв тийм бол дараах мэдээллийг бөглөнө үү:")}
                          </p>
                          <CustomTextField
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("z_s_dutagdal_frakts")}
                          />
                          <br />

                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField(
                              "z_s_dutagdal_hugatsaa",
                            )}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontSize: "14px", fontWeight: "400" }}>
                          {t("Өмнөх харвалт ба/эсвэл эмболи үүссэн тохиолдол")}
                        </td>
                        <td>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("z_s_umnuh_harvalt")}
                          />
                          <br />
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField(
                              "z_s_umnuh_harvalt_suuliin_tohioldol",
                            )}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontSize: "14px", fontWeight: "400" }}>
                          {t("Өмнөх цус алдалт")}
                        </td>
                        <td>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField(
                              "z_s_umnuh_tsus_aldalt",
                            )}
                          />
                          <br />
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField(
                              "z_s_umnuh_tsus_aldalt_tohioldol",
                            )}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontSize: "14px", fontWeight: "400" }}>
                          {t("Захын судасны өвчин*1")}
                        </td>
                        <td>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("z_s_uvchin")}
                            Unknown
                            UnknownText={t("Тодорхойгүй")}
                          />
                          <br />
                          <p>{t("Тийм бол:")}</p>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("z_s_uvchin_yes")}
                            Unknown
                            UnknownText={t("Тодорхойгүй")}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontSize: "14px", fontWeight: "400" }}>
                          {t("Кардиомиопати1")}
                        </td>
                        <td>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("z_s_kardiomiopati")}
                            Unknown
                            UnknownText={t("Тодорхойгүй")}
                          />
                          <br />
                          <p>{t("Тийм бол:")}</p>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField(
                              "z_s_kardiomiopati_yes",
                            )}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontSize: "14px", fontWeight: "400" }}>
                          {t("Гүрээний артерийн товруу")}
                        </td>
                        <td>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("z_s_guree")}
                            Unknown
                            UnknownText={t("Тодорхойгүй")}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontSize: "14px", fontWeight: "400" }}>
                          {t("Доод мөчний артерийн өвчин")}
                        </td>
                        <td>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("z_s_dood_much")}
                            Unknown
                            UnknownText={t("Тодорхойгүй")}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontSize: "14px", fontWeight: "400" }}>
                          {t("Зүрх гэнэт зогсох")}
                        </td>
                        <td>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("z_s_genet_zogsoh")}
                            Unknown
                            UnknownText={t("Тодорхойгүй")}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontSize: "14px", fontWeight: "400" }}>
                          {t("Пэйсмэйкер/ Зүрхний дефибриллятор суулгац (ЗДС)")}
                        </td>
                        <td>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("z_s_pacemaker")}
                            Unknown
                            UnknownText={t("Тодорхойгүй")}
                          />
                          <br />
                          <p>{t("Тийм бол тодруулах:")}</p>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("z_s_pacemaker_yes")}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontSize: "14px", fontWeight: "400" }}>
                          {t("Аортын хавхлагад хийсэн өмнөх интервеншин")}
                        </td>
                        <td>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField(
                              "z_s_aort_intervention",
                            )}
                            Unknown
                            UnknownText={t("Тодорхойгүй")}
                          />
                          <br />
                          <p>
                            {t("Тийм бол доорх мэдээллийг бөглөнө үү:")}
                            <br />
                            <span>{t("Интервеншин")}</span>
                          </p>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField(
                              "z_s_aort_intervention_yes",
                            )}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontSize: "14px", fontWeight: "400" }}>
                          {t("Митрал хавхлагад хийсэн өмнөх интервеншин")}
                        </td>
                        <td>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField(
                              "z_s_mitral_intervention",
                            )}
                            Unknown
                            UnknownText={t("Тодорхойгүй")}
                          />
                          <br />
                          <p>
                            {t("Тийм бол доорх мэдээллийг бөглөнө үү:")}
                            <br />
                            <span>{t("Интервеншин")}</span>
                          </p>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField(
                              "z_s_mitral_intervention_yes",
                            )}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontSize: "14px", fontWeight: "400" }}>
                          {t(
                            "Гурван хавтаст хавхлагад хийсэн өмнөх интервеншин",
                          )}
                        </td>
                        <td>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField(
                              "z_s_3havtast_intervention",
                            )}
                            Unknown
                            UnknownText={t("Тодорхойгүй")}
                          />
                          <br />
                          <p>
                            {t("Тийм бол доорх мэдээллийг бөглөнө үү:")}
                            <br />
                            <span>{t("Интервеншин")}</span>
                          </p>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField(
                              "z_s_3havtast_intervention_yes",
                            )}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontSize: "14px", fontWeight: "400" }}>
                          {t("Аортын хавхлага одоо эмгэгтэй эсэх")}
                        </td>
                        <td>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("z_s_aort_emgeg")}
                            Unknown
                            UnknownText={t("Тодорхойгүй")}
                          />
                          <br />
                          <p>{t("Тийм бол тодруулах:")}</p>
                          <br />
                          <p>
                            {t(
                              "- Төрөл (хамаарах хэсгийг бүгдийг сонгоно уу):",
                            )}
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontSize: "14px", fontWeight: "400" }}>
                          {t("Митрал хавхлага одоо эмгэгтэй эсэх")}
                        </td>
                        <td></td>
                      </tr>
                      <tr>
                        <td style={{ fontSize: "14px", fontWeight: "400" }}>
                          {t("Гурван хавтаст хавхлага одоо эмгэгтэй эсэх")}
                        </td>
                        <td></td>
                      </tr>
                      <tr>
                        <td style={{ fontSize: "14px", fontWeight: "400" }}>
                          {t("Төрөлхийн өвчин эмгэгтэй эсэх")}
                        </td>
                        <td></td>
                      </tr>
                      <tr>
                        <td style={{ fontSize: "14px", fontWeight: "400" }}>
                          {t(
                            "Цус хөдлөлзүйд саад учруулах ховдлын хэм алдагдал байна уу?",
                          )}
                        </td>
                        <td></td>
                      </tr>
                      <tr>
                        <td style={{ fontSize: "14px", fontWeight: "400" }}>
                          {t("Зүрх судасны бусад өвчин эмгэгтэй эсэх")}
                        </td>
                        <td></td>
                      </tr>
                    </tbody>
                  </Box>

                  <div style={{ height: "18px" }}></div>

                  <Box component="table" sx={sx.customTable}>
                    <thead>
                      <tr>
                        <th>{t("Зүрх судасны бус өвчний түүх:")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ fontSize: "14px", fontWeight: "400" }}>
                          {t("Бамбай булчирхайн эмгэг")}
                        </td>
                        <td>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("zs_busad_bambai")}
                            Unknown
                            UnknownText={t("Тодорхойгүй")}
                          />
                          <br />
                          <p>{t("Тийм бол тодруулах:")} </p>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("zs_busad_bambai_yes")}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontSize: "14px", fontWeight: "400" }}>
                          {t("Бөөрний архаг өвчин")}
                        </td>
                        <td>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("zs_busad_buur")}
                            Unknown
                            UnknownText={t("Тодорхойгүй")}
                          />
                          <br />
                          <p>{t("Тийм бол тодруулах:")} </p>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("zs_busad_buur_yes")}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontSize: "14px", fontWeight: "400" }}>
                          {t("Элэгний өвчин")}
                        </td>
                        <td>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("zs_busad_eleg")}
                            Unknown
                            UnknownText={t("Тодорхойгүй")}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontSize: "14px", fontWeight: "400" }}>
                          {t("Уушгины архаг бөглөрөлт өвчин (COPD)")}
                        </td>
                        <td>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("zs_busad_uushig")}
                            Unknown
                            UnknownText={t("Тодорхойгүй")}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontSize: "14px", fontWeight: "400" }}>
                          {t("Нойрон дунд амьсгал тасалдах эмгэг")}
                        </td>
                        <td>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField(
                              "zs_busad_amisgal_tasaldah_yes",
                            )}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontSize: "14px", fontWeight: "400" }}>
                          {t("Хорт хавдар")}
                        </td>
                        <td>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("zs_busad_hort_havdar")}
                            Unknown
                            UnknownText={t("Тодорхойгүй")}
                          />
                          <br />
                          <p>{t("Тийм бол тодруулах:")} </p>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField(
                              "zs_busad_hort_havdar_yes",
                            )}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontSize: "14px", fontWeight: "400" }}>
                          {t("Ревматойд артрит")}
                        </td>
                        <td>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("zs_busad_artrit")}
                            Unknown
                            UnknownText={t("Тодорхойгүй")}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontSize: "14px", fontWeight: "400" }}>
                          {t("Сэтгэл гутрал")}
                        </td>
                        <td>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("zs_busad_gutral")}
                            Unknown
                            UnknownText={t("Тодорхойгүй")}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontSize: "14px", fontWeight: "400" }}>
                          {t("Танин мэдэхүйн хоцрогдол")}
                        </td>
                        <td>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("zs_busad_tanin")}
                            Unknown
                            UnknownText={t("Тодорхойгүй")}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontSize: "14px", fontWeight: "400" }}>
                          {t("Одоо жирэмсэн үү?")}
                        </td>
                        <td>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("zs_busad_pregnant")}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontSize: "14px", fontWeight: "400" }}>
                          {t(
                            "Хүний дархлал хомсдолын вирус (ХДХВ) халдвартай юу?",
                          )}
                        </td>
                        <td>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("zs_busad_autimun")}
                            Unknown
                            UnknownText={t("Тодорхойгүй")}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontSize: "14px", fontWeight: "400" }}>
                          {t("COVID-19 (одоо халдвартай юу?)")}
                        </td>
                        <td>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("zs_busad_hdhv")}
                            Unknown
                            UnknownText={t("Тодорхойгүй")}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontSize: "14px", fontWeight: "400" }}>
                          {t("Архаг аутоиммун өвчин")}
                        </td>
                        <td>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("zs_busad_covid")}
                            Unknown
                            UnknownText={t("Тодорхойгүй")}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </Box>
                </GroupPanel>
              </GroupPanel>
            </div>
          ) : (
            <BaseNoData />
          )}
        </GridItem>
      </GridContainer>
    );
  };
}

export default withTranslation(undefined, { withRef: true })(
  AtrialRhythmNewForm,
);
