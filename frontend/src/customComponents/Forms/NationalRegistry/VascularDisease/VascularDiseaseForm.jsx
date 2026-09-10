import { useTranslation } from "react-i18next";
import React, { createRef } from "react";
// translation
import { withTranslation } from "react-i18next";
// @mui/material components
import { Button, CircularProgress } from "@mui/material";
import { css } from "@emotion/css";
// @mui/icons-material
import SaveIcon from "@mui/icons-material/Save";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// custom components
import BaseCustomForm from "customComponents/Forms/BaseCustomForm";
import CustomTab from "customComponents/CustomTab";
import BaseRadio from "customComponents/BaseEditControls/BaseRadio";
import BaseCheckBox from "customComponents/BaseEditControls/BaseCheckBox";
import BaseTextField from "customComponents/BaseEditControls/BaseTextField";
import BaseTextArea from "customComponents/BaseEditControls/BaseTextArea";
// import BaseAutoComplete from "customComponents/BaseEditControls/BaseAutoComplete";
// import BaseLookUpGridLoad from "baseComponents/Controls/BaseLookUpGridLoad";
// import BaseLookUpGrid from "baseComponents/Controls/BaseLookUpGrid";
// import BaseSelect from "customComponents/BaseEditControls/BaseSelect";
import BaseInputMask from "customComponents/BaseEditControls/BaseInputMask";
import BaseNoData from "customComponents/BaseNoData";
import GroupPanel from "customComponents/GroupPanel";

// Forms
import VascularDiseaseTreatmentForm from "customComponents/Forms/NationalRegistry/VascularDisease/VascularDiseaseTreatmentForm";
// helper
import Helper from "helper";

import customFormStyles from "assets/jss/material-dashboard-pro-react/custom/customFormStyles";

import vascular1 from "assets/img/vascular-1.jpeg";
import vascular2 from "assets/img/vascular-2.png";
import vascular3 from "assets/img/vascular-3.png";

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

class VascularDiseaseForm extends BaseCustomForm {
  constructor(props) {
    super(props);
    this.state = { ...this.state, DataId: null, saveLoading: false };
    // refs
    this.VascularDiseaseTreatmentForm = createRef();
  }

  componentDidMount() {
    super.componentDidMount && super.componentDidMount();
  }

  GetData = () => {
    this.GetLastData();
  };

  GetLastData = async () => {
    const { PatientRegNo } = this.props;
    if (PatientRegNo) {
      await Helper.BaseCrudHelper.CallService(
        "/VascularDisease/GetLastData",
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
          // Set Disease Id
          this.VascularDiseaseTreatmentForm.SetId &&
            this.VascularDiseaseTreatmentForm.SetId(DataId);
        },
      );
    } else {
      const alert = Helper.BaseCrudHelper.ShowAlert(
        "Иргэний мэдээлэл олдсонгүй",
        false,
        () => this.setState({ Alert: null, saveLoading: false }),
      );
      this.setState({ Alert: alert });
    }
  };

  Save = async () => {
    const { EditObject } = this.state;
    const { PatientRegNo } = this.props;

    let alert = null;
    const Id = EditObject ? EditObject.Id : null;
    this.setState({ saveLoading: true });
    if (PatientRegNo && Object.keys(this.ModifyObject).length > 0) {
      await Helper.BaseCrudHelper.CallService(
        "/VascularDisease/CustomSave",
        {
          PatientRegNo,
          Id,
          Data: JSON.stringify({ ...this.ModifyObject }),
        },
        (resData) => {
          if (resData) {
            if (resData.Success && EditObject === null) {
              const DataId = resData.Data ? resData.Data.DataId : null;
              this.setState({ DataId });
              this.VascularDiseaseTreatmentForm.SetId &&
                this.VascularDiseaseTreatmentForm.SetId(DataId);
            }
            alert = Helper.BaseCrudHelper.ShowAlert(
              resData.Message,
              resData.Success,
              () => this.setState({ Alert: null, saveLoading: false }),
            );
            this.setState({ Alert: alert });
          }
        },
      );
    } else {
      alert = Helper.BaseCrudHelper.ShowAlert(
        "Information is missing",
        false,
        () => this.setState({ Alert: null, saveLoading: false }),
      );
      this.setState({ Alert: alert });
    }
  };

  Confirm = async (callback) => {
    const { DataId } = this.state;
    let alert = null;
    if (DataId) {
      await Helper.BaseCrudHelper.CallService(
        "/VascularDisease/Confirm",
        { Id: DataId },
        (resData) => {
          alert = Helper.BaseCrudHelper.ShowAlert(
            resData.Message,
            resData.Success,
            () => {
              this.setState({ Alert: null });
              callback && callback(resData.Success);
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
          callback && callback(false);
        },
      );
      this.setState({ Alert: alert });
    }
  };

  ChangeValue = (Field, Value) => {
    const { EditObject } = this.state;
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

    jin = isNaN(parseFloat(this.ModifyObject["jin"]))
      ? EditObject && EditObject.Id
        ? parseInt(EditObject.jin)
        : 0
      : parseFloat(this.ModifyObject["jin"]);
    undur = isNaN(parseFloat(this.ModifyObject["undur"]))
      ? EditObject && EditObject.Id
        ? parseInt(EditObject.undur)
        : 0
      : parseFloat(this.ModifyObject["undur"]);

    let newVal = 0;
    let bgt = 0;
    let lvddValue = 0;

    // БЖИ ба БГТ бодох
    if (undur && jin) {
      newVal = 0;
      newVal = jin / Math.pow(undur / 100, 2);

      this.ModifyObject["bji"] = parseFloat(newVal.toFixed(2));
      document.getElementById("bji").value = parseFloat(newVal.toFixed(2));

      bgt = 0;
      bgt = 0.20247 * Math.pow(undur / 100, 0.725) * Math.pow(jin, 0.425);
      this.ModifyObject["bgt"] = parseFloat(bgt.toFixed(2));
      document.getElementById("bgt").value = parseFloat(bgt.toFixed(2));
    }

    // (Тооцоолох) [[140 -нас(жил)]*жин(кг)]/[72*цусан дахь креатинин (тг/дл)], эмэгтэйд 0.85-р үржинэ)
    // if (this.ModifyObject["creatinin"] && jin && Age && Gender) {
    //   newVal = 0;
    //   const creatininValue = isNaN(parseFloat(this.ModifyObject["creatinin"]))
    //     ? 0
    //     : parseFloat(this.ModifyObject["creatinin"]);

    //   const constValue = Gender === "M" ? 1 : 0.85;
    //   newVal =
    //     (((140 - parseInt(Age)) * jin) / (72 * creatininValue)) * constValue;

    //   this.ModifyObject["t_sh_h"] = parseFloat(newVal.toFixed(2));
    //   document.getElementById("t_sh_h").value = parseFloat(newVal.toFixed(2));
    // }

    if (
      this.ModifyObject["lvdd"] &&
      this.ModifyObject["ivsd"] &&
      this.ModifyObject["pwd"]
    ) {
      newVal = 0;

      lvddValue = isNaN(parseFloat(this.ModifyObject["lvdd"]))
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
      this.ModifyObject["lv_mass"] = parseFloat(newVal.toFixed(2));
      document.getElementById("lv_mass").value = parseFloat(newVal.toFixed(2));
    }

    if (this.ModifyObject["lvdd"] && this.ModifyObject["lvds"]) {
      var efValue = 0;
      var svValue = 0;
      var edvValue = 0;
      var esvValue = 0;

      lvddValue = isNaN(parseFloat(this.ModifyObject["lvdd"]))
        ? 0
        : parseFloat(this.ModifyObject["lvdd"]);
      var lvdsValue = isNaN(parseFloat(this.ModifyObject["lvds"]))
        ? 0
        : parseFloat(this.ModifyObject["lvds"]);

      edvValue = (7 * lvddValue * lvddValue * lvddValue) / (2.4 + lvddValue);
      esvValue = (7 * lvdsValue * lvdsValue * lvdsValue) / (2.4 + lvdsValue);

      svValue = edvValue - esvValue;
      efValue = edvValue !== 0 ? ((edvValue - esvValue) / edvValue) * 100 : 0;

      this.ModifyObject["lvef_teicholz"] = parseFloat(efValue.toFixed(2));
      document.getElementById("lvef_teicholz").value = parseFloat(
        efValue.toFixed(2),
      );
      this.ModifyObject["sv"] = parseFloat(svValue.toFixed(2));
      document.getElementById("sv").value = parseFloat(svValue.toFixed(2));
    }

    process.env.NODE_ENV === "development" &&
      console.log({ ModifyObject: this.ModifyObject });

    this.ChangeValueAfter(Field, Value);
  };

  ChangeValueAfter = (Field, Value) => {
    const childDiv = document.getElementById(Field + "Child");
    const noChildDiv = document.getElementById(Field + "NoChild");
    if (childDiv) {
      if (Value === "a" || Value === "y" || Value + "" === "1")
        childDiv.style.display = "block";
      else childDiv.style.display = "none";
    }

    if (noChildDiv) {
      if (Value === "n") noChildDiv.style.display = "block";
      else noChildDiv.style.display = "none";
    }
  };

  GetDisplay = (Field) => {
    const { EditObject } = this.state;
    const Value = EditObject && EditObject[Field] ? EditObject[Field] : "";
    if (Value === "a" || Value === "y" || Value + "" === "1") return "block";
    else return "none";
  };

  GetNoDisplay = (Field) => {
    const { EditObject } = this.state;
    const Value = EditObject && EditObject[Field] ? EditObject[Field] : "";
    if (Value === "n") return "block";
    else return "none";
  };

  GetTabs = () => {
    const { Fields, saveLoading } = this.state;
    const { t } = this.props;
    var Tabs = [];
    Tabs.push({
      tabButton: "АМБУЛАТОРЫН БҮРТГЭЛ СУДАЛГАА",
      tabContent: (
        <div>
          {Fields ? (
            <div>
              <div style={{ minHeight: "50px" }}>
                <div
                  style={{
                    float: "right",
                    position: "relative",
                    display: "inline",
                  }}
                >
                  <Button
                    color="success"
                    size="sm"
                    startIcon={<SaveIcon />}
                    onClick={() => {
                      this.setState({ saveLoading: true });
                      this.Save();
                    }}
                    disabled={saveLoading}
                  >
                    {t("Save")}
                  </Button>
                  {saveLoading && (
                    <CircularProgress
                      size={24}
                      style={{
                        color: "green",
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        marginTop: -12,
                        marginLeft: -12,
                      }}
                    />
                  )}
                </div>
              </div>
              <GroupPanel title={t("1. Титмийн архаг хамшинж")} level={1}>
                <GroupPanel title={t("Үзлэгийн үеийн бодит үзлэг")} level={2}>
                  <GridContainer style={{ margin: "0", width: "100%" }}>
                    <GridItem xs={12} md={6}>
                      {/* <BaseTextField
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("ad")}
                      /> */}
                      <BaseTextField
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("ad_deed")}
                      />
                      <BaseTextField
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("ad_dood")}
                      />
                    </GridItem>
                    <GridItem xs={12} md={6}>
                      <BaseTextField
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("ztst")}
                      />
                    </GridItem>
                    <GridItem xs={12} md={6}>
                      <BaseTextField
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("undur")}
                      />
                    </GridItem>
                    <GridItem xs={12} md={6}>
                      <BaseTextField
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("jin")}
                      />
                    </GridItem>
                    <GridItem xs={12} md={6}>
                      <BaseTextField
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("bji")}
                        Id={"bji"}
                        Disabled={true}
                      />
                    </GridItem>
                    <GridItem xs={12} md={6}>
                      <BaseTextField
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("bgt")}
                        Id={"bgt"}
                        Disabled={true}
                      />
                    </GridItem>
                  </GridContainer>
                </GroupPanel>
                <BaseCheckBox
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("heartache")}
                />
                <BaseTextArea
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("heartache_other")}
                  FullWidth={true}
                />
                {/* <div className={this.props.classes.customList}>
                  <ul>
                    <li>{t("ЦЭЭЖНИЙ ТОГТВОРТОЙ СТЕНОКАРДИ")}</li>
                    <li>{t("СПАЗМ БҮХИЙ СТЕНОКАРДИ")}</li>
                    <li>{t("АЧААЛЛЫН ҮЕИЙН ЦЭЭЖНИЙ СТЕНОКАРДИ")}</li>
                  </ul>
                </div> */}
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("vd_ccs_angilal")}
                />
                <GroupPanel title={t("Үзлэгийн үеийн шинжилгээнүүд")} level={1}>
                  <GroupPanel title={t("ЦДШ-нд")} level={2}>
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("wbc")}
                    />
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("rbc")}
                    />
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("hgb")}
                    />
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("hct")}
                    />
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("plt")}
                    />
                  </GroupPanel>
                  <GroupPanel title={t("Биохими")} level={2}>
                    {/* Холестеролын үзүүлэлтүүд */}
                    <GroupPanel title={t("Холестеролын үзүүлэлтүүд")} level={3}>
                      <BaseTextField
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("ldl")}
                      />
                      <BaseTextField
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("hdl")}
                      />
                      <BaseTextField
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("triglyceride")}
                      />
                      <BaseTextField
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("cholesterine")}
                      />
                      <BaseTextField
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("non_cholesterine")}
                      />
                      <BaseTextField
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("uldets_cholesterine")}
                      />
                    </GroupPanel>

                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("kali")}
                    />
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("mochevin")}
                    />
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("creatinin")}
                    />
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("asat")}
                    />
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("alam")}
                    />
                    {/* <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("ferritin")}
                    />
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("sensitive_crp")}
                    /> */}
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("nt_pro_np")}
                    />
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("sanamsargui_glukoz")}
                    />
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("hba_1_c")}
                    />
                    {/* <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("troponin")}
                    /> */}
                  </GroupPanel>

                  <GroupPanel title={t("Зүрхний цахилгаан бичлэг")} level={2}>
                    {/* <BaseDate
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("tsa_bichleg_date")}
                    /> */}
                    <BaseInputMask
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("tsa_bichleg_date")}
                      Mask={"9999-99-99"}
                      MaskChar={"_"}
                      defaultValue={Helper.ObjectHelper.getDateYMD()}
                    />
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("qrs_burdel")}
                    />
                    <BaseCheckBox
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("rhythm")}
                    />
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("rhythm_other")}
                      FullWidth={true}
                    />
                    {/* zurhnii horig */}
                    <BaseCheckBox
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("zurh_horig")}
                    />
                    {/* giss_horig */}
                    <BaseCheckBox
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("giss_horig")}
                    />

                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("zurh_horig_other")}
                      FullWidth={true}
                    />
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("vd_surug_t_shvd")}
                    />
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("vd_st_buult")}
                    />
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("vd_wellness")}
                    />
                  </GroupPanel>

                  <GroupPanel
                    title={t("Зүрхний хэт авиан шинжилгээ")}
                    level={2}
                  >
                    {/* <BaseDate
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("het_avia_date")}
                    /> */}
                    <BaseInputMask
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("het_avia_date")}
                      Mask={"9999-99-99"}
                      MaskChar={"_"}
                      defaultValue={Helper.ObjectHelper.getDateYMD()}
                    />
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("lvdd")}
                    />
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("lvds")}
                    />
                    {/* <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("lvdd")}
                    /> */}
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
                      Config={this.GetConfigField("lv_mass")}
                      Id="lv_mass"
                      Disabled={true}
                    />
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("lvef_teicholz")}
                      Id="lvef_teicholz"
                      Disabled={true}
                    />
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("lvef_simpson_method")}
                    />
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("lv_gls")}
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
                    />
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("taslavch_e")}
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

                  <GroupPanel title={t("Ханын хөдөлгөөний алдагдал")} level={2}>
                    {/* хөдөлгөөний алдагдалтай сегментийг зурна уу. /эсвэл 17 чеклист/ */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: "15px 30px",
                      }}
                    >
                      <img
                        alt="Ханын хөдөлгөөний алдагдал: хөдөлгөөний алдагдалтай сегментийг зурна уу"
                        src={vascular1}
                        style={{ marginBottom: "15px" }}
                      />
                      <img
                        alt="Ханын хөдөлгөөний алдагдал: хөдөлгөөний алдагдалтай сегментийг зурна уу"
                        src={vascular2}
                        style={{ maxWidth: "400px" }}
                      />
                    </div>

                    <div className={this.props.classes.borderSubDiv}>
                      <BaseRadio
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("segment1")}
                      />
                      <BaseRadio
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("segment2")}
                      />
                      <BaseRadio
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("segment3")}
                      />
                      <BaseRadio
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("segment4")}
                      />
                      <BaseRadio
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("segment5")}
                      />
                      <BaseRadio
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("segment6")}
                      />
                      <BaseRadio
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("segment7")}
                      />
                      <BaseRadio
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("segment8")}
                      />
                      <BaseRadio
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("segment9")}
                      />
                      <BaseRadio
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("segment10")}
                      />
                      <BaseRadio
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("segment11")}
                      />
                      <BaseRadio
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("segment12")}
                      />
                      <BaseRadio
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("segment13")}
                      />
                      <BaseRadio
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("segment14")}
                      />
                      <BaseRadio
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("segment15")}
                      />
                      <BaseRadio
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("segment16")}
                      />
                      <BaseRadio
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("segment17")}
                      />
                    </div>
                  </GroupPanel>

                  <GroupPanel title={t("Хавхлагын эмгэг")} level={2}>
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("is_havhlaga_emgeg")}
                    />
                    <div
                      id="is_havhlaga_emgegChild"
                      className={this.props.classes.childDiv}
                      style={{ display: this.GetDisplay("is_havhlaga_emgeg") }}
                    >
                      <BaseRadio
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("havhlaga_emgeg_shaltgaan")}
                        // Unknown={true}
                        // UnknownText={"No"}
                      />
                      <BaseRadio
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("h_e_2xx_nar")}
                        Unknown={true}
                        UnknownText={"No"}
                      />
                      <BaseRadio
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("h_e_2xx_dut")}
                        Unknown={true}
                        UnknownText={"No"}
                      />
                      <BaseRadio
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("h_e_3xx_nar")}
                        Unknown={true}
                        UnknownText={"No"}
                      />
                      <BaseRadio
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("h_e_3xx_dut")}
                        Unknown={true}
                        UnknownText={"No"}
                      />
                      <BaseRadio
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("h_e_gol_sudas_nar")}
                        Unknown={true}
                        UnknownText={"No"}
                      />
                      <BaseRadio
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("h_e_gol_sudas_dut")}
                        Unknown={true}
                        UnknownText={"No"}
                      />
                      <BaseRadio
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("h_e_ua_nar")}
                        Unknown={true}
                        UnknownText={"No"}
                      />
                      <BaseRadio
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("h_e_ua_dut")}
                        Unknown={true}
                        UnknownText={"No"}
                      />
                    </div>
                  </GroupPanel>

                  <GroupPanel
                    title={t(
                      "Ачаалалтай зүрхний цахилгаан бичлэг /гүйлтийн зам буюу треадмилл/",
                    )}
                    level={2}
                  >
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("is_ach_tsa_bichleg")}
                    />
                    <div
                      id="is_ach_tsa_bichlegChild"
                      className={this.props.classes.childDiv}
                      style={{
                        display: this.GetDisplay("is_ach_tsa_bichlegChild"),
                      }}
                    >
                      <BaseRadio
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("vd_ach_tsa_bichleg")}
                      />
                      <div
                        id="vd_ach_tsa_bichlegChild"
                        className={this.props.classes.childDiv}
                        style={{
                          display: this.GetDisplay("vd_ach_tsa_bichlegChild"),
                        }}
                      >
                        <BaseRadio
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("bichleg_hariu_uye")}
                        />
                      </div>
                    </div>
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("is_ach_zhash")}
                    />
                    <div
                      id="is_ach_zhashChild"
                      className={this.props.classes.childDiv}
                      style={{ display: this.GetDisplay("is_ach_zhashChild") }}
                    >
                      <BaseRadio
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("vd_ach_zhash")}
                      />
                    </div>
                    {/* zurh tsumiin shinjilgee */}
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("is_zvrh_tsum_shinjilgee")}
                    />
                    <div
                      id="is_zvrh_tsum_shinjilgeeChild"
                      className={this.props.classes.childDiv}
                      style={{
                        display: this.GetDisplay(
                          "is_zvrh_tsum_shinjilgeeChild",
                        ),
                      }}
                    >
                      <BaseRadio
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("vd_zvrh_tsum_shinjilgee")}
                      />
                    </div>
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("is_holter_ekg")}
                    />
                    <div
                      id="is_holter_ekgChild"
                      className={this.props.classes.childDiv}
                      style={{ display: this.GetDisplay("is_holter_ekgChild") }}
                    >
                      <BaseRadio
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("vd_holter_ekg")}
                      />
                    </div>
                  </GroupPanel>
                  <GroupPanel
                    title={t("Титэм судасны компьютерт томографи")}
                    level={2}
                  >
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("is_titem_ktg")}
                    />
                    <div
                      id="is_titem_ktgChild"
                      className={this.props.classes.childDiv}
                      style={{
                        display: this.GetDisplay("is_titem_ktg"),
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          width: "100%",
                        }}
                      >
                        <img
                          alt="Титэм судасны компьютерт томографи"
                          src={vascular3}
                          style={{ width: "45%", marginBottom: "15px" }}
                        />
                      </div>
                      <div className={this.props.classes.borderSubDiv}>
                        <BaseRadio
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("vd_titem_ktg1")}
                        />
                        <BaseRadio
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("vd_titem_ktg2")}
                        />
                        <BaseRadio
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("vd_titem_ktg3")}
                        />
                        <BaseRadio
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("vd_titem_ktg4")}
                        />
                        <BaseRadio
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("vd_titem_ktg5")}
                        />
                        <BaseRadio
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("vd_titem_ktg6")}
                        />
                        <BaseRadio
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("vd_titem_ktg7")}
                        />
                        <BaseRadio
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("vd_titem_ktg8")}
                        />
                        <BaseRadio
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("vd_titem_ktg9")}
                        />
                        <BaseRadio
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("vd_titem_ktg10")}
                        />
                        <BaseRadio
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("vd_titem_ktg11")}
                        />
                        <BaseRadio
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("vd_titem_ktg12")}
                        />
                        <BaseRadio
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("vd_titem_ktg13")}
                        />
                        <BaseRadio
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("vd_titem_ktg14")}
                        />
                        <BaseRadio
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("vd_titem_ktg15")}
                        />
                        {/* <BaseCheckBox
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("vd_titem_ktg_dvgnelt")}
                        /> */}
                        <BaseRadio
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("titem_helber")}
                        />
                      </div>
                    </div>
                  </GroupPanel>
                  <GroupPanel title={t("Титэм судасны КТГ дүгнэлт")} level={2}>
                    <BaseCheckBox
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("vd_titem_ktg_dvgnelt")}
                    />
                  </GroupPanel>
                  <GroupPanel
                    title={t("Титэм судсан дотуурх оношилгоо")}
                    level={2}
                  >
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("is_titem_dotuurh_onshilgoo")}
                    />
                    <div
                      id="is_titem_dotuurh_onshilgooChild"
                      className={this.props.classes.childDiv}
                      style={{
                        display: this.GetDisplay("is_titem_dotuurh_onshilgoo"),
                      }}
                    >
                      <BaseRadio
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("vd_titem_dotuurh_dugnelt")}
                      />
                      {/* <BaseDate
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("titem_dotuurh_date")}
                      /> */}
                      <BaseInputMask
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("titem_dotuurh_date")}
                        Mask={"9999-99-99"}
                        MaskChar={"_"}
                        defaultValue={Helper.ObjectHelper.getDateYMD()}
                      />
                      <BaseRadio
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField(
                          "vd_titem_dotuurh_onshilgoo",
                        )}
                      />
                      <BaseCheckBox
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField(
                          "vd_titem_onshilgoond_nar_shalt",
                        )}
                      />
                      <BaseTextField
                        ChangeValue={this.ChangeValue}
                        FullWidth={true}
                        Config={this.GetConfigField(
                          "vd_titem_onsh_nar_shalt_other",
                        )}
                      />
                      {/* <BaseDate
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField(
                          "titem_dotuurh_emchil_date"
                        )}
                      /> */}
                      <BaseInputMask
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField(
                          "titem_dotuurh_emchil_date",
                        )}
                        Mask={"9999-99-99"}
                        MaskChar={"_"}
                        defaultValue={Helper.ObjectHelper.getDateYMD()}
                      />
                      <BaseCheckBox
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField(
                          "vd_titem_dotuurh_emchilgee",
                        )}
                      />
                    </div>
                  </GroupPanel>
                </GroupPanel>

                <GroupPanel
                  title={t("ТИТМИЙН ЦОЧМОГ ХАМШИНЖ, ЗҮРХНИЙ ЦОЧМОГ ШИГДЭЭС")}
                  level={1}
                >
                  <GroupPanel title={t("ТиСДЭ-ийн үр дүн")} level={2}>
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("angio")}
                    />
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("timi_lmca")}
                    />
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("timi_lad")}
                    />
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("timi_lcx")}
                    />
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("timi_rca")}
                    />
                  </GroupPanel>
                  <GroupPanel title={t("Стент байршил")} level={2}>
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("des_lmca")}
                    />
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("des_lad")}
                    />
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("des_lcx")}
                    />
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("des_rca")}
                    />
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("des_ramus")}
                    />
                  </GroupPanel>
                  {/*  */}
                  <div className={this.props.classes.childDiv}>
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("vd_kag_hundrel")}
                    />
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("vd_kag_hundrel_other")}
                    />
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("vd_kag_hurts")}
                    />
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("cardiacarrest_admission")}
                    />
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("tugsgul")}
                    />
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("grace_score")}
                    />
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("time_riskscore")}
                    />
                  </div>
                </GroupPanel>
              </GroupPanel>
            </div>
          ) : (
            <BaseNoData />
          )}
        </div>
      ),
    });
    // Tabs.push({
    //   tabButton: "Шинжилгээ",
    //   tabContent: <div></div>,
    // });
    Tabs.push({
      tabButton: "Эмчилгээ",
      tabContent: (
        <VascularDiseaseTreatmentForm
          ref={(ref) => (this.VascularDiseaseTreatmentForm = ref)}
          ObjectName="VascularDiseaseTreatment"
        />
      ),
    });
    return Tabs;
  };

  CustomRender = () => {
    return (
      <GridContainer
        style={{
          margin: "0",
          width: "100%",
          height: "100%",
          minHeight: 0,
        }}
      >
        <GridItem
          xs={12}
          md={12}
          style={{ height: "100%", display: "flex", flexDirection: "column" }}
        >
          <CustomTab vertical shortVertical fillHeight tabs={this.GetTabs()} />
        </GridItem>
      </GridContainer>
    );
  };
}

export default withTranslation(undefined, { withRef: true })(
  withMui5Styles(customFormStyles)(VascularDiseaseForm),
);
