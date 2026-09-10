import { useTranslation } from "react-i18next";
import React from "react";
// translation
import { withTranslation } from "react-i18next";
// @mui/material components
import { css } from "@emotion/css";
// import { CircularProgress } from "@mui/material";
// @mui/icons-material
// import SaveIcon from "@mui/icons-material/Save";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// import Button from "components/CustomButtons/Button";
// custom components
import BaseCustomForm from "customComponents/Forms/BaseCustomForm";
import BaseRadio from "customComponents/BaseEditControls/BaseRadio";
import BaseCheckBox from "customComponents/BaseEditControls/BaseCheckBox";
import GroupPanel from "customComponents/GroupPanel";
import BaseTextField from "customComponents/BaseEditControls/BaseTextField";
import BaseTextArea from "customComponents/BaseEditControls/BaseTextArea";
import BaseAutoComplete from "customComponents/BaseEditControls/BaseAutoComplete";
// import BaseLookUpGridLoad from "baseComponents/Controls/BaseLookUpGridLoad";
// import BaseLookUpGrid from "baseComponents/Controls/BaseLookUpGrid";
// import BaseSelect from "customComponents/BaseEditControls/BaseSelect";
import BaseInputMask from "customComponents/BaseEditControls/BaseInputMask";
import BaseNoData from "customComponents/BaseNoData";

import CustomTextField from "customComponents/Forms/NationalRegistry/CustomTextField";
import CustomRadio from "customComponents/Forms/Components/CustomRadio";
// helper
import Helper from "helper";

import customFormStyles from "assets/jss/material-dashboard-pro-react/custom/customFormStyles";

const withMui5Styles = (styles) => (WrappedComponent) => {
  const classes = Object.keys(styles).reduce((acc, key) => {
    acc[key] = css(styles[key]);
    return acc;
  }, {});

  const WithMui5Styles = React.forwardRef((props, ref) => (
    <WrappedComponent {...props} classes={classes} ref={ref} />
  ));
  return WithMui5Styles;
};

class ValveDiseasesEndoForm extends BaseCustomForm {
  constructor(props) {
    super(props);
    this.state = { ...this.state, DataId: null, saveLoading: false };
    this.ModifyObject = {
      DiagnosedDate: Helper.ObjectHelper.getDateYMD(),
      StartedDate: Helper.ObjectHelper.getDateYMD(),
      het_awia_date: Helper.ObjectHelper.getDateYMD(),
      ShinjilgeeDate: Helper.ObjectHelper.getDateYMD(),
      ztsb_date: Helper.ObjectHelper.getDateYMD(),
      tsus_date: Helper.ObjectHelper.getDateYMD(),
      davtan_mes_zasal_date: Helper.ObjectHelper.getDateYMD(),
    };
  }

  GetData = () => {
    this.GetLastData();
  };

  GetLastData = async () => {
    const { PatientRegNo } = this.props;
    if (PatientRegNo) {
      await Helper.BaseCrudHelper.CallService(
        "/ValveDiseasesEndo/GetLastData",
        { PatientRegNo },
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
    } else {
      const alert = Helper.BaseCrudHelper.ShowAlert(
        "Иргэний мэдээлэл олдсонгүй",
        false,
        () => this.setState({ Alert: null, saveLoading: false }),
      );
      this.setState({ Alert: alert, isLoading: false });
    }
  };

  Save = async (callback) => {
    const { EditObject } = this.state;
    const { PatientRegNo } = this.props;

    let alert = null;
    if (PatientRegNo && Object.keys(this.ModifyObject).length > 0) {
      const Id = EditObject ? EditObject.Id : null;
      await Helper.BaseCrudHelper.CallService(
        "/ValveDiseasesEndo/CustomSave",
        {
          PatientRegNo,
          Id,
          Data: JSON.stringify({ ...this.ModifyObject }),
        },
        (resData) => {
          if (resData) {
            let DataId = null;
            if (resData.Data) {
              DataId = resData.Data.DataId;
              this.setState({ DataId });
            }
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
        "/ValveDiseasesEndo/Confirm",
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
    this.ModifyObject[Field] = Value;
    this.MarkDirty();
    this.setState((prevState) => ({
      EditObject: {
        ...prevState.EditObject,
        [Field]: Value,
      },
    }));

    let newVal = 0;
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
      if (Value === "a" || Value === "y") childDiv.style.display = "block";
      else childDiv.style.display = "none";
    }

    if (noChildDiv) {
      if (Value === "n") noChildDiv.style.display = "block";
      else noChildDiv.style.display = "none";
    }

    if (Field === "zurhnii_uwchnii_tuuh") {
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

  GetDisplay = (Field) => {
    const { EditObject } = this.state;
    const Value = EditObject && EditObject[Field] ? EditObject[Field] : "";
    const allows = ["a", "y"];
    // if (Value === "a" || Value === "y") return "block";
    // else return "none";
    return allows.includes(Value) ? "block" : "none";
  };

  GetNoDisplay = (Field) => {
    const { EditObject } = this.state;
    const allows = ["n"];
    const Value = EditObject && EditObject[Field] ? EditObject[Field] : "";
    // if (Value === "n") return "block";
    // else return "none";

    return allows.includes(Value) ? "block" : "none";
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
          <div>
            {Fields ? (
              <div>
                <GroupPanel title={t("Ерөнхий хэсэг")} level={1}>
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("undur")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("jin")}
                  />
                  {/* <BaseTextArea
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("p_address")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("p_phonenumber")}
                  /> */}
                  {/* <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("")}
                    FullWidth={true}
                  /> */}
                  <BaseAutoComplete
                    Config={this.GetConfigField("onosh")}
                    FullWidth={true}
                    ChangeValue={this.ChangeValue}
                  />
                  {/* <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("")}
                    FullWidth={true}
                  /> */}
                  <BaseAutoComplete
                    Config={this.GetConfigField("hawsarsan_onosh")}
                    FullWidth={true}
                    ChangeValue={this.ChangeValue}
                  />
                  {/* <BaseDate
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("DiagnosedDate")}
                  /> */}
                  <BaseInputMask
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("DiagnosedDate")}
                    defaultValue={Helper.ObjectHelper.getDateYMD()}
                    Mask={"9999-99-99"}
                    MaskChar={"_"}
                  />
                  {/* <BaseDate
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("StartedDate")}
                  /> */}
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
                    className={this.props.classes.childDiv}
                    style={{ display: this.GetDisplay("is_udamshil") }}
                  >
                    <BaseTextArea
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("udamshil")}
                      FullWidth={true}
                      Rows={3}
                    />
                  </div>
                  {/* <BaseCheckBox
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("odoogiin_zowiur")}
                  /> */}
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
                  {/* <div
                    id="is_harvaltChild"
                    className={this.props.classes.childDiv}
                    style={{ display: this.GetDisplay("is_harvalt") }}
                  > */}
                  <BaseCheckBox
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("harvalt_zowiur")}
                    boxMd={4}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("harvalt_zowiur_other")}
                    FullWidth={true}
                  />
                  {/* </div> */}
                </GroupPanel>
                <GroupPanel title={t("Зүрх судасны өвчний түүх")} level={1}>
                  <BaseCheckBox
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("zurhnii_uwchnii_tuuh")}
                    md={6}
                    boxMd={4}
                  />
                  <div id="zurhnii_uwchnii_tuuhChilds">
                    <div
                      id="zurhnii_uwchnii_tuuhChild-7"
                      className={this.props.classes.childDiv}
                      style={{
                        display: this.GetValueDisplay("hf_uwchinii_tvvh", 7),
                      }}
                    >
                      <BaseRadio
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("suulgats_tuhuurumj")}
                      />
                    </div>
                  </div>
                </GroupPanel>
                {/* Эрсдэлт хүчин зүйлс */}
                <GroupPanel title={t("Эрсдэлт хүчин зүйлс")} level={1}>
                  <BaseCheckBox
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("ersdeluud")}
                    md={6}
                    boxMd={4}
                  />
                </GroupPanel>
                {/* Зүрхний хэт авиан шинжилгээ */}
                <GroupPanel title={t("Зүрхний хэт авиан шинжилгээ")} level={2}>
                  {/* <BaseDate
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("")}
                    /> */}
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
                </GroupPanel>
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("is_2xx_dut")}
                />
                <div
                  id="is_2xx_dutChild"
                  className={this.props.classes.childDiv}
                  style={{ display: this.GetDisplay("is_2xx_dut") }}
                >
                  <BaseCheckBox
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("vvd2xx_dut_shaltgaan")}
                  />
                  <BaseTextArea
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("vvd2xx_dut_shaltgaan_other")}
                    FullWidth={true}
                    Rows={3}
                  />
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("vvd2xx_dut_zereg")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("mr_eroa")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("mr_vena_contract")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("mr_volume")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("mr_fraction_rate")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("mr_zuun_tosguur_hubi")}
                  />
                </div>
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("is_gol_sudas_dut")}
                />
                <div
                  id="is_gol_sudas_dutChild"
                  className={this.props.classes.childDiv}
                  style={{
                    display: this.GetDisplay("is_gol_sudas_dut"),
                  }}
                >
                  <BaseCheckBox
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("gol_sudas_dut_shaltgaan")}
                  />
                  <BaseTextArea
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField(
                      "gol_sudas_dut_shaltgaan_other",
                    )}
                    FullWidth={true}
                    Rows={3}
                  />
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("gol_sudas_dut_zereg")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("ao_reg_pht")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("aor_vol")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("aor_eroa")}
                  />
                </div>
                {/* Эндокардитын вегитаци */}
                <GroupPanel title={t("Эндокардитын вегитаци")} level={2}>
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("uuriin_havhlaga")}
                  />
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("hiimel_havhlaga")}
                  />
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("vegitasi_bairlal")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("vegitasi_hemjee")}
                  />
                </GroupPanel>

                {/* Лабораторийн шинжилгээ */}
                <GroupPanel title={t("Лабораторийн шинжилгээ")} level={2}>
                  {/* <BaseDate
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("ShinjilgeeDate")}
                    /> */}
                  <BaseInputMask
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("ShinjilgeeDate")}
                    defaultValue={Helper.ObjectHelper.getDateYMD()}
                    Mask={"9999-99-99"}
                    MaskChar={"_"}
                  />
                  <GridContainer>
                    <GridItem xs={12} md={6}>
                      <table className={this.props.classes.customTable}>
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
                            <td>{t("RBC ((106/ul))")}</td>
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
                      <table className={this.props.classes.customTable}>
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

                  <GroupPanel title={t("Биохими")} level={3}>
                    <GridContainer>
                      <GridItem>
                        <table className={this.props.classes.customTable}>
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
                                <CustomRadio
                                  ChangeValue={this.ChangeValue}
                                  Config={this.GetConfigField("creatinin_type")}
                                />
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <div style={{ marginTop: "10px" }}>
                          <table className={this.props.classes.customTable}>
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
                      <GridItem>
                        <table className={this.props.classes.customTable}>
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
                      <GridItem>
                        <table className={this.props.classes.customTable}>
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

                {/* Зүрхний цахилгаан бичлэг */}
                <GroupPanel title={t("Зүрхний цахилгаан бичлэг")} level={2}>
                  {/* <BaseDate
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("ztsb_date")}
                    /> */}
                  <BaseInputMask
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("ztsb_date")}
                    defaultValue={Helper.ObjectHelper.getDateYMD()}
                    Mask={"9999-99-99"}
                    MaskChar={"_"}
                  />
                  <BaseCheckBox
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("rhythm")}
                  />
                  <BaseTextArea
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("rhythm_other")}
                    FullWidth={true}
                    Rows={3}
                  />

                  {/*  */}
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("is_ct_mri")}
                  />
                  <div
                    id="is_ct_mriChild"
                    className={this.props.classes.childDiv}
                    style={{ display: this.GetDisplay("is_ct_mri") }}
                  >
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("ct_mri_garsan_uurchlult")}
                      FullWidth={true}
                    />
                  </div>
                </GroupPanel>

                {/* Цусны ариун чанар  */}
                <GroupPanel title={t("Цусны ариун чанар")} level={2}>
                  <BaseInputMask
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("tsus_date")}
                    defaultValue={Helper.ObjectHelper.getDateYMD()}
                    Mask={"9999-99-99"}
                    MaskChar={"_"}
                  />
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("is_davtan")}
                  />
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("is_nyan_urgasan")}
                  />

                  <div
                    id="is_nyan_urgasanChild"
                    className={this.props.classes.childDiv}
                    style={{ display: this.GetDisplay("is_nyan_urgasan") }}
                  >
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("urgasan_uusgegch")}
                      FullWidth={true}
                    />
                  </div>
                </GroupPanel>

                {/* Их шалгуур */}
                <GroupPanel title={t("Их шалгуур")} level={2}>
                  <BaseCheckBox
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("ih_shalguur")}
                    md={6}
                  />
                </GroupPanel>

                {/* Эндокардитын хүндрэл */}
                <GroupPanel title={t("Эндокардитын хүндрэл")} level={2}>
                  <BaseCheckBox
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("endo_hundrel")}
                    md={6}
                  />
                </GroupPanel>

                {/* Антибиотик */}
                <GroupPanel title={t("Антибиотик")} level={1}>
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("antibiotic_name")}
                    FullWidth={true}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("antibiotic_days")}
                    FullWidth={true}
                  />
                </GroupPanel>

                {/* Нас баралт */}
                <GroupPanel title={t("Нас баралт")} level={1}>
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("is_nas_baralt")}
                  />
                  <div
                    id="is_nas_baraltChild"
                    className={this.props.classes.childDiv}
                    style={{ display: this.GetDisplay("is_nas_baralt") }}
                  >
                    <BaseCheckBox
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("vvd_nas_baralt")}
                    />
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("nas_baralt_shaltgaan")}
                    />
                  </div>
                </GroupPanel>

                {/* Мэс засалд орсон эсэх */}
                <GroupPanel title={t("Мэс засалд орсон эсэх")} level={1}>
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("is_mes_zasald_orson")}
                  />
                  <div
                    id="is_mes_zasald_orsonChild"
                    className={this.props.classes.childDiv}
                    style={{ display: this.GetDisplay("is_mes_zasald_orson") }}
                  >
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("havhlaga_bairlal")}
                      FullWidth={true}
                    />
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("havhlaga_turul")}
                      FullWidth={true}
                    />
                    <BaseInputMask
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("davtan_mes_zasal_date")}
                      defaultValue={Helper.ObjectHelper.getDateYMD()}
                      Mask={"9999-99-99"}
                      MaskChar={"_"}
                    />
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("hoish_days")}
                    />
                  </div>
                </GroupPanel>

                <GroupPanel title={t("Мэс заслын дараах хүндрэл")} level={1}>
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("is_tsus_aldagdal")}
                  />
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("is_hem_aldagdal")}
                  />
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("is_tarhinii_tsus_harwalt")}
                  />
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("is_olon_erhtnii_dut")}
                  />
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("is_vjil")}
                  />
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("is_haldvart_dahisan")}
                  />
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("is_davtan_mes_zasal")}
                  />
                </GroupPanel>
              </div>
            ) : (
              <BaseNoData />
            )}
          </div>
        </GridItem>
      </GridContainer>
    );
  };
}

export default withTranslation(undefined, { withRef: true })(
  withMui5Styles(customFormStyles)(ValveDiseasesEndoForm),
);
