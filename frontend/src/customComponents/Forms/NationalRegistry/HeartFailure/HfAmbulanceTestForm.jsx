import { useTranslation } from "react-i18next";
import React from "react";
// translation
import { withTranslation } from "react-i18next";
// @mui/material components
import { Box } from "@mui/material";
// default components
// import GridContainer from "components/Grid/GridContainer";
// import GridItem from "components/Grid/GridItem";
// custom components
import GroupPanel from "customComponents/GroupPanel";
import BaseRadio from "customComponents/BaseEditControls/BaseRadio";
import BaseCheckBox from "customComponents/BaseEditControls/BaseCheckBox";
import BaseTextField from "customComponents/BaseEditControls/BaseTextField";
// import BaseTextArea from "customComponents/BaseEditControls/BaseTextArea";
// import BaseAutoComplete from "customComponents/BaseEditControls/BaseAutoComplete";
// import BaseLookUpGridLoad from "baseComponents/Controls/BaseLookUpGridLoad";
import BaseInputMask from "customComponents/BaseEditControls/BaseInputMask";

import BaseNoData from "customComponents/BaseNoData";
import BaseCustomForm from "customComponents/Forms/BaseCustomForm";
// import BaseField from "baseComponents/BaseField";
// helper
import Helper from "helper";

import customFormStyles from "assets/jss/material-dashboard-pro-react/custom/customFormStyles";
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import BaseTextArea from "customComponents/BaseEditControls/BaseTextArea";

class HfAmbulanceTestForm extends BaseCustomForm {
  constructor(props) {
    super(props);
    this.state = { ...this.state, jin: 0, Age: null, Gender: null };

    this.AmbulanceId = null;
    this.ModifyObject = {
      test_date: Helper.ObjectHelper.getDateYMD(),
      tsa_bichleg_date: Helper.ObjectHelper.getDateYMD(),
      het_avia_date: Helper.ObjectHelper.getDateYMD(),
      // mibi_date: Helper.ObjectHelper.getDateYMD(),
      // mri_date: Helper.ObjectHelper.getDateYMD(),
      titem_date: Helper.ObjectHelper.getDateYMD(),
      creatinin: 0,
      creatinin_type: "1",
    };
  }

  componentDidMount() {
    super.componentDidMount();

    const { AmbulanceId, Age, Gender } = this.props;

    // Set IDs from props if available
    if (AmbulanceId) {
      this.AmbulanceId = AmbulanceId;
      this.setState({ Age, Gender });
    }
  }

  componentDidUpdate(prevProps) {
    // Update data when AmbulanceId prop changes
    if (this.props.AmbulanceId !== prevProps.AmbulanceId) {
      this.AmbulanceId = this.props.AmbulanceId;
      this.setState({ Age: this.props.Age, Gender: this.props.Gender });

      // Load data if Fields are already loaded
      if (this.state.Fields && this.state.Fields.length > 0) {
        this.GetData();
      }
    }
  }

  SetId = (Id, Age, Gender) => {
    this.AmbulanceId = Id;
    this.setState({ Age, Gender });
    // Only load data if Fields config is already loaded, otherwise GetFormConfig will be called by componentDidMount
    if (this.state.Fields && this.state.Fields.length > 0) {
      this.GetData();
    }
  };

  GetData = async () => {
    const { ObjectName } = this.state;
    const { AmbulanceId } = this;
    if (AmbulanceId) {
      this.setState({ Loading: true });

      // Safety timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        process.env.NODE_ENV === "development" &&
          console.warn("GetData timeout - setting Loading to false");
        this.setState({ Loading: false, isLoading: false });
      }, 10000); // 10 second timeout

      try {
        var SearchOption = Helper.BaseCrudHelper.GetSearchOption();
        SearchOption.SearchField = [
          { Field: "AmbulanceId", Op: "Equals", Value: AmbulanceId },
        ];
        await Helper.BaseCrudHelper.BaseGetDetailInfo(
          { ObjectName, SearchOption },
          (resData) => {
            clearTimeout(timeoutId);
            if (resData && resData.Success) {
              this.setState({
                EditObject: Object.assign({}, resData.Data),
                Loading: false,
                isLoading: false,
              });
            } else {
              this.setState({ Loading: false, isLoading: false });
            }
          },
        );
      } catch (error) {
        clearTimeout(timeoutId);
        process.env.NODE_ENV === "development" &&
          console.error("GetData error:", error);
        this.setState({ Loading: false, isLoading: false });
      }
    } else {
      this.setState({ Loading: false, isLoading: false });
    }
  };

  ChangeValue = (Field, Value) => {
    const { EditObject, jin, Age, Gender } = this.state;
    this.ChangeValueBefore(Field, Value);
    this.ModifyObject[Field] = Value;
    this.MarkDirty();

    // Update state to trigger re-render for controlled components (like BaseCheckBox)
    this.setState((prevState) => ({
      EditObject: {
        ...prevState.EditObject,
        [Field]: Value,
      },
    }));

    let newVal = 0;
    if (Field === "creatinin" || Field === "creatinin_type") {
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

        this.ModifyObject["t_sh_h"] = parseFloat(newVal.toFixed(2));
        document.getElementById("t_sh_h").value = parseFloat(newVal.toFixed(2));
      }
    }

    if (
      this.ModifyObject["lvdd"] &&
      this.ModifyObject["ivss"] &&
      this.ModifyObject["pwd"]
    ) {
      newVal = 0;

      var lvddValue = isNaN(parseFloat(this.ModifyObject["lvdd"]))
        ? 0
        : parseFloat(this.ModifyObject["lvdd"]);
      var ivssValue = isNaN(parseFloat(this.ModifyObject["ivss"]))
        ? 0
        : parseFloat(this.ModifyObject["ivss"]);
      var pwdValue = isNaN(parseFloat(this.ModifyObject["pwd"]))
        ? 0
        : parseFloat(this.ModifyObject["pwd"]);

      newVal =
        0.8 *
          1.04 *
          (Math.pow(lvddValue + ivssValue + pwdValue, 3) -
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
      if (Value === "a" || Value === "y") childDiv.style.display = "block";
      else childDiv.style.display = "none";
    }

    if (noChildDiv) {
      if (Value === "n") {
        noChildDiv.style.display = "block";
      } else {
        noChildDiv.style.display = "none";
      }
    }

    if (Field === "hf_busad_shinjilgee") {
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
    if (Value === "a" || Value === "y") return "block";
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

  Save = async () => {
    await this.SaveWithCallback();
  };

  SaveWithCallback = async (callback) => {
    const { ObjectName, EditObject } = this.state;
    const { AmbulanceId } = this;

    if (!AmbulanceId) {
      callback && callback(true, null); // No ambulance ID yet, skip silently
      return;
    }

    if (Object.keys(this.ModifyObject).length === 0) {
      callback && callback(true, null); // No changes to save
      return;
    }

    let Data = null;
    if (EditObject && EditObject.Id) {
      Data = { ...this.ModifyObject, Id: EditObject.Id, Files: null };
      await Helper.BaseCrudHelper.BaseUpdate(
        { ObjectName, Data },
        (resData) => {
          if (resData) {
            callback && callback(resData.Success, resData.Message);
          } else {
            callback && callback(false, "Failed to save");
          }
        },
      );
    } else {
      Data = { ...this.ModifyObject, AmbulanceId, Files: null };
      await Helper.BaseCrudHelper.BaseCreate(
        { ObjectName, Data },
        (resData) => {
          if (resData) {
            callback && callback(resData.Success, resData.Message);
          } else {
            callback && callback(false, "Failed to save");
          }
        },
      );
    }
  };

  uploadFile = async (Id, callback) => {
    const { ObjectName } = this.state;
    const Value = this.ModifyObject["Files"];
    if (Value) {
      await Helper.BaseCrudHelper.BaseUploadFile(
        {
          LinkedObjectInfo: {
            LinkedObjectName: ObjectName,
            LinkedObjectId: Id,
            FieldName: "Files",
          },
          Value,
        },
        (resData) => {
          if (resData) {
            const alert = Helper.BaseCrudHelper.ShowAlert(
              resData.Message,
              resData.Success,
              () => {
                this.setState({ Alert: null });
                callback && callback(resData);
              },
            );
            this.setState({ Alert: alert });
          }
        },
      );
    }
  };

  CustomRender = () => {
    const { Fields, EditObject } = this.state;
    const { t } = this.props;

    return (
      <div style={{ padding: "0" }}>
        {Fields ? (
          <div style={{ margin: "-10px 0 0 0" }}>
            <GroupPanel title={t("Үзлэгийн үеийн шинжилгээнүүд")} level={1}>
              <GroupPanel title={t("Лабораторийн шинжилгээ")} level={2}>
                {/* <BaseDate
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("test_date")}
                /> */}
                <BaseInputMask
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("test_date")}
                  Mask={"9999-99-99"}
                  MaskChar={"_"}
                  defaultValue={Helper.ObjectHelper.getDateYMD()}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("tsagaan_es")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("yaltas_es")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("gemoglobin")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("natri")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("kali")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("sheesnii_huchil")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("creatinin")}
                  // Id={"creatinin"}
                  // Disabled={true}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("creatinin_type")}
                  defaultValue={"1"}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("mochevin")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("albumin")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("t_sh_h")}
                  Id="t_sh_h"
                  Disabled={true}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("alat")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("s_r_b")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("asat")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("g_g_t")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("digoksin_level")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("tumur")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("ferritin")}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hf_ferritin_type")}
                  defaultValue={"1"}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("n_t_pro_b_n_p")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("b_n_p")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hb_a1c")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("sanamsargui_glukoz")}
                />
              </GroupPanel>
              <div style={{ height: "40px" }}></div>
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
                  Value={
                    EditObject && EditObject["hf_rhythm"]
                      ? EditObject["hf_rhythm"]
                      : []
                  }
                  ChangeValue={(name, value) =>
                    this.ChangeValue("hf_rhythm", value)
                  }
                  Config={this.GetConfigField("hf_rhythm")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hf_rhythm_other")}
                  FullWidth={true}
                />
                <BaseCheckBox
                  Value={
                    EditObject && EditObject["hf_zurh_horig"]
                      ? EditObject["hf_zurh_horig"]
                      : []
                  }
                  ChangeValue={(name, value) =>
                    this.ChangeValue("hf_zurh_horig", value)
                  }
                  Config={this.GetConfigField("hf_zurh_horig")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hf_zurh_horig_other")}
                  FullWidth={true}
                />
              </GroupPanel>
              <div style={{ height: "40px" }}></div>
              <GroupPanel title={t("Зүрхний хэт авиан шинжилгээ")} level={2}>
                {/* <BaseInputMask ... /> ... */}
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
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("ivss")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("pwd")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("lvmass")}
                  Id="lvmass"
                  Disabled={true}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("lvef")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("lv_strain")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("la_volume")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("e_e_med")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("e_e_lat")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("e_med")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("e_lat")}
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
                  Config={this.GetConfigField("rvw_d")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("rv_fac")}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("havhlaga_emgeg")}
                />
                <div
                  id="havhlaga_emgegChild"
                  style={{
                    ...(customFormStyles.childDiv || {}),
                    display: this.GetDisplay("havhlaga_emgeg"),
                  }}
                >
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("h_e_2xx_nar")}
                    Unknown={false}
                    UnknownText={"No"}
                  />
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("h_e_2xx_dut")}
                    Unknown={false}
                    UnknownText={"No"}
                  />
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("h_e_3xx_nar")}
                    Unknown={false}
                    UnknownText={"No"}
                  />
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("h_e_3xx_dut")}
                    Unknown={false}
                    UnknownText={"No"}
                  />
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("h_e_gol_nar")}
                    Unknown={false}
                    UnknownText={"No"}
                  />
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("h_e_gol_dut")}
                    Unknown={false}
                    UnknownText={"No"}
                  />
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("h_e_ua_nar")}
                    Unknown={false}
                    UnknownText={"No"}
                  />
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("h_e_ua_dut")}
                    Unknown={false}
                    UnknownText={"No"}
                  />
                </div>

                <GridContainer>
                  <GridItem xs={12} md={6}>
                    <GroupPanel title={t("MIBI (сүүлийн шинжилгээ)")} level={3}>
                      {/* <BaseDate
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("")}
                      /> */}
                      <BaseInputMask
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("mibi_date")}
                        Mask={"9999-99-99"}
                        MaskChar={"_"}
                        defaultValue={Helper.ObjectHelper.getDateYMD()}
                      />
                      <BaseTextField
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("mibi_lvef")}
                      />
                      <BaseTextField
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("mibi_rvef")}
                      />
                    </GroupPanel>
                  </GridItem>
                  <GridItem xs={12} md={6}>
                    <GroupPanel title={t("MRI (сүүлийн шинжилгээ)")} level={3}>
                      {/* <BaseDate
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("")}
                      /> */}
                      <BaseInputMask
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("mri_date")}
                        Mask={"9999-99-99"}
                        MaskChar={"_"}
                        defaultValue={Helper.ObjectHelper.getDateYMD()}
                      />
                      <BaseTextField
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("mri_lvef")}
                      />
                      <BaseTextField
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("mri_rvef")}
                      />
                    </GroupPanel>
                  </GridItem>
                </GridContainer>
              </GroupPanel>
            </GroupPanel>

            <GroupPanel title={t("Титэм судсан дотуурх оношилгоо")} level={1}>
              {/* <BaseDate
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("titem_date")}
              /> */}
              <BaseInputMask
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("titem_date")}
                Mask={"9999-99-99"}
                MaskChar={"_"}
                defaultValue={Helper.ObjectHelper.getDateYMD()}
              />
              <BaseRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("hf_titem_dvgnelt")}
                Row={true}
                Unknown={false}
                UnknownText={"No"}
              />
            </GroupPanel>
            <GroupPanel title={t("Бусад шинжилгээнүүд")} level={1}>
              <BaseCheckBox
                Value={
                  EditObject && EditObject["hf_busad_shinjilgee"]
                    ? EditObject["hf_busad_shinjilgee"]
                    : []
                }
                ChangeValue={(name, value) =>
                  this.ChangeValue("hf_busad_shinjilgee", value)
                }
                Config={this.GetConfigField("hf_busad_shinjilgee")}
                boxMd={12}
              />

              <div id="hf_busad_shinjilgeeChilds">
                <div
                  id="hf_busad_shinjilgeeChild-10"
                  style={{
                    ...(customFormStyles.childDiv || {}),
                    display: this.GetValueDisplay("hf_busad_shinjilgee", "10"),
                  }}
                >
                  {/* <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("is_biopsi_uurchlult")}
                  />
                  <div
                    id="is_biopsi_uurchlultChild"
                    className={classes.childDiv}
                    style={{ display: this.GetDisplay("is_biopsi_uurchlult") }}
                  > */}
                  <BaseTextArea
                    Config={this.GetConfigField("biopsi_uurchlult")}
                    FullWidth={true}
                    Rows={3}
                  />
                  {/* </div> */}
                </div>
                <div
                  id="hf_busad_shinjilgeeChild-5"
                  style={{
                    ...(customFormStyles.childDiv || {}),
                    display: this.GetValueDisplay("hf_busad_shinjilgee", "5"),
                  }}
                >
                  {/* <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("is_cardio_pul_vo_max")}
                  />
                  <div
                    id="is_cardio_pul_vo_maxChild"
                    className={classes.childDiv}
                    style={{ display: this.GetDisplay("is_cardio_pul_vo_max") }}
                  > */}
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("cardio_pul_vo_max")}
                  />
                  {/* </div> */}
                </div>
              </div>
            </GroupPanel>
          </div>
        ) : (
          <BaseNoData />
        )}
      </div>
    );
  };
}

export default withTranslation(undefined, { withRef: true })(
  HfAmbulanceTestForm,
);
