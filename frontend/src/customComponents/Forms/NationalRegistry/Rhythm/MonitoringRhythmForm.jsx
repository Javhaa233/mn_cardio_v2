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
import GroupPanel from "customComponents/GroupPanel";
// import BaseCheckBox from "customComponents/BaseEditControls/BaseCheckBox";
import BaseTextField from "customComponents/BaseEditControls/BaseTextField";
import BaseTextArea from "customComponents/BaseEditControls/BaseTextArea";
// import BaseAutoComplete from "customComponents/BaseEditControls/BaseAutoComplete";
import BaseLookUpGridLoad from "baseComponents/Controls/BaseLookUpGridLoad";
// import BaseLookUpGrid from "baseComponents/Controls/BaseLookUpGrid";
import BaseInputMask from "customComponents/BaseEditControls/BaseInputMask";
import BaseNoData from "customComponents/BaseNoData";

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

class MonitoringRhythmForm extends BaseCustomForm {
  constructor(props) {
    super(props);
    this.state = { ...this.state, DataId: null, Age: 0, Gender: null };
    this.ModifyObject = {
      suulgasan_ognoo: Helper.ObjectHelper.getDateYMD(),
      hevtsen_ognoo: Helper.ObjectHelper.getDateYMD(),
      garsan_ognoo: Helper.ObjectHelper.getDateYMD(),
    };
  }

  GetData = async () => await this.GetLastData();

  GetLastData = async () => {
    const { PatientRegNo } = this.props;
    let alert = null;
    if (PatientRegNo && PatientRegNo) {
      await Helper.BaseCrudHelper.CallService(
        "/MonitoringRhythm/GetLastData",
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
        "/MonitoringRhythm/CustomSave",
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
        "/MonitoringRhythm/Confirm",
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

    jin = isNaN(parseFloat(this.ModifyObject["b_jin"]))
      ? EditObject && EditObject.Id
        ? parseFloat(EditObject.b_jin)
        : 0
      : parseFloat(this.ModifyObject["b_jin"]);
    undur = isNaN(parseFloat(this.ModifyObject["b_undur"]))
      ? EditObject && EditObject.Id
        ? parseFloat(EditObject.b_undur)
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

      // Эмнэлгээс гарах үеийн лабораторийн шинжилгээ

      let g_creatininValue =
        this.ModifyObject["g_creatinin"] &&
        isNaN(parseFloat(this.ModifyObject["g_creatinin"]))
          ? EditObject &&
            EditObject.Id &&
            isNaN(parseFloat(EditObject["g_creatinin"]))
            ? 0
            : parseFloat(EditObject["g_creatinin"])
          : parseFloat(this.ModifyObject["g_creatinin"]);

      const g_creatininType = this.ModifyObject["g_creatinin_type"]
        ? this.ModifyObject["g_creatinin_type"]
        : EditObject && EditObject.Id && EditObject["g_creatinin_type"]
          ? EditObject["g_creatinin_type"]
          : "1";

      // (Тооцоолох) [[140 -нас(жил)]*жин(кг)]/[72*цусан дахь креатинин (тг/дл)], эмэгтэйд 0.85-р үржинэ)
      if (!isNaN(parseFloat(g_creatininValue)) && jin && Age && Gender) {
        newVal = 0;

        if (g_creatininType === "2") {
          g_creatininValue = g_creatininValue * 0.0113;
        }

        const constValue = Gender === "M" ? 1 : 0.85;
        newVal =
          (((140 - parseFloat(Age)) * jin) / (72 * g_creatininValue)) *
          constValue;

        this.ModifyObject["g_t_sh_h"] = parseFloat(newVal.toFixed(2));
        document.getElementById("g_t_sh_h").value = parseFloat(
          newVal.toFixed(2),
        );
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
  };

  ChangeValueAfter = (Field, Value) => {
    const childDiv = document.getElementById(Field + "Child");
    const noChildDiv = document.getElementById(Field + "NoChild");
    if (childDiv) {
      if (Value === "a" || Value === "y" || Value === "2" || Value === "5")
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

    if (Field === "hf_uwchinii_tvvh") {
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
    if (Value === "a" || Value === "y" || Value === "2" || Value === "5")
      return "block";
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
              {/* I. Ерөнхий хэсэг */}
              <GroupPanel title={t("I. Ерөнхий хэсэг")} level={1} />
              {/* II. Эмнэлэгт хэвтэх үеийн бүртгэл */}
              <GroupPanel
                title={t("II. Эмнэлэгт хэвтэх үеийн бүртгэл")}
                level={1}
              >
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
                <BaseInputMask
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("suulgasan_ognoo")}
                  defaultValue={Helper.ObjectHelper.getDateYMD()}
                  Mask={"9999-99-99"}
                  MaskChar={"_"}
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
                  Config={this.GetConfigField("garsan_ognoo")}
                  defaultValue={Helper.ObjectHelper.getDateYMD()}
                  Mask={"9999-99-99"}
                  MaskChar={"_"}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("code")}
                />
              </GroupPanel>
              {/* III.Хяналтын бүртгэл */}
              <GroupPanel title={t("III.Хяналтын бүртгэл")} level={1}>
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hyanalt")}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hyanalt_type")}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hyanalt_arga")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hyanalt_arga_other")}
                  FullWidth={true}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("is_hugatsaa")}
                />

                <div
                  id="is_hugatsaaChild"
                  className={this.props.classes.childDiv}
                  style={{ display: this.GetDisplay("is_hugatsaa") }}
                >
                  <BaseInputMask
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("y_hugatsaa")}
                    defaultValue={Helper.ObjectHelper.getDateYMD()}
                    Mask={"9999-99-99"}
                    MaskChar={"_"}
                  />
                </div>
                <div
                  id="is_hugatsaaNoChild"
                  className={this.props.classes.childDiv}
                  style={{ display: this.GetNoDisplay("is_hugatsaa") }}
                >
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("n_hugatsaa")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("n_hugatsaa_other")}
                    FullWidth={true}
                  />
                  {/*  */}
                </div>

                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("baidal")}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("r_hyanalt_idevhi_baidal")}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hf_nyha")}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hyanalt_baidal")}
                />
                {/* orhison_shaltgaan */}
                <div
                  id="hyanalt_baidalChild"
                  className={this.props.classes.childDiv}
                  style={{ display: this.GetDisplay("hyanalt_baidal") }}
                >
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("orhison_shaltgaan")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("orhison_shaltgaan_other")}
                    FullWidth={true}
                  />
                </div>
              </GroupPanel>
              {/* IV. Нас баралтын бүртгэл */}
              <GroupPanel title={t("IV. Нас баралтын бүртгэл")} level={1}>
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("nas_baralt_shaltgaan")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("nas_baralt_shaltgaan_other")}
                  FullWidth={true}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("is_hevtelt")}
                />
                <BaseInputMask
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("nas_barsan_ognoo")}
                  defaultValue={Helper.ObjectHelper.getDateYMD()}
                  Mask={"9999-99-99"}
                  MaskChar={"_"}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("is_zadlan")}
                />
              </GroupPanel>
              {/* V. Эмнэлзүйн байдал ( одоогийн байдал ) */}
              <GroupPanel
                title={t("V. Эмнэлзүйн байдал ( одоогийн байдал )")}
                level={1}
              >
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("is_dahilt")}
                />
                <div
                  id="is_dahiltChild"
                  className={this.props.classes.childDiv}
                  style={{ display: this.GetDisplay("is_dahilt") }}
                >
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("if_shinj_turul")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("shinj_turul_other")}
                    FullWidth={true}
                  />
                </div>
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hovdliin_horig")}
                />

                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("is_uurchlult")}
                />
                <div
                  id="is_uurchlultChild"
                  className={this.props.classes.childDiv}
                  style={{ display: this.GetDisplay("is_uurchlult") }}
                >
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("if_uurchlult_hemnel")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("uurchlult_hemnel_other")}
                    FullWidth={true}
                  />
                </div>
              </GroupPanel>
              {/* VI. Үр дүнгийн байдал */}
              <GroupPanel title={t("VI. Үр дүнгийн байдал")} level={1}>
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("is_emiin_hyanalt")}
                />
                <div
                  id="is_emiin_hyanaltChild"
                  className={this.props.classes.childDiv}
                  style={{ display: this.GetDisplay("is_emiin_hyanalt") }}
                >
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("if_yamar_em")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("em_other")}
                    FullWidth={true}
                  />
                </div>

                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("is_ablation_dahilt")}
                />
                <div
                  id="is_ablation_dahiltChild"
                  className={this.props.classes.childDiv}
                  style={{ display: this.GetDisplay("is_ablation_dahilt") }}
                >
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("if_ablation_dahilt")}
                  />
                </div>

                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("is_bainga_pm")}
                />
                <div
                  id="is_bainga_pmChild"
                  className={this.props.classes.childDiv}
                  style={{ display: this.GetDisplay("is_bainga_pm") }}
                >
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("if_pm")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("pm_other")}
                    FullWidth={true}
                  />
                </div>

                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("is_icd")}
                />
                <div
                  id="is_icdChild"
                  className={this.props.classes.childDiv}
                  style={{ display: this.GetDisplay("is_icd") }}
                >
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("if_icd")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("icd_other")}
                    FullWidth={true}
                  />
                </div>

                <BaseTextArea
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("m_notes")}
                />
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
  withMui5Styles(customFormStyles)(MonitoringRhythmForm),
);
