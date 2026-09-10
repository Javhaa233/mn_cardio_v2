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
import BaseTextArea from "customComponents/BaseEditControls/BaseTextArea";
// import BaseAutoComplete from "customComponents/BaseEditControls/BaseAutoComplete";
// import BaseLookUpGridLoad from "baseComponents/Controls/BaseLookUpGridLoad";
import BaseInputMask from "customComponents/BaseEditControls/BaseInputMask";

import BaseNoData from "customComponents/BaseNoData";
import BaseCustomForm from "customComponents/Forms/BaseCustomForm";
// import BaseField from "baseComponents/BaseField";

// helper
import Helper from "helper";

import customFormStyles from "assets/jss/material-dashboard-pro-react/custom/customFormStyles";

const sx = customFormStyles;

class HfAmbulanceTreatmentForm extends BaseCustomForm {
  constructor(props) {
    super(props);

    this.AmbulanceId = null;
  }

  componentDidMount() {
    super.componentDidMount();

    const { AmbulanceId } = this.props;

    // Set ID from props if available
    if (AmbulanceId) {
      this.AmbulanceId = AmbulanceId;
    }
  }

  componentDidUpdate(prevProps) {
    // Update data when AmbulanceId prop changes
    if (this.props.AmbulanceId !== prevProps.AmbulanceId) {
      this.AmbulanceId = this.props.AmbulanceId;

      // Load data if Fields are already loaded
      if (this.state.Fields && this.state.Fields.length > 0) {
        this.GetData();
      }
    }
  }

  SetId = (Id) => {
    this.AmbulanceId = Id;
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
      var SearchOption = Helper.BaseCrudHelper.GetSearchOption();
      SearchOption.SearchField = [
        { Field: "AmbulanceId", Op: "Equals", Value: AmbulanceId },
      ];
      await Helper.BaseCrudHelper.BaseGetDetailInfo(
        { ObjectName, SearchOption },
        (resData) => {
          if (resData && resData.Success && resData.Data) {
            this.setState({
              EditObject: Object.assign({}, resData.Data),
              Loading: false,
              isLoading: false,
            });
          } else {
            // Initialize EditObject as empty object when no data is returned
            this.setState({ EditObject: {}, Loading: false, isLoading: false });
          }
        },
      );
    } else {
      // Initialize EditObject as empty object when no AmbulanceId
      this.setState({ EditObject: {}, Loading: false, isLoading: false });
    }
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

  ChangeValueAfter = (Field, Value) => {
    const childDiv = document.getElementById(Field + "Child");
    const noChildDiv = document.getElementById(Field + "NoChild");
    if (childDiv) {
      if (Value === "a" || Value === "y" || Value === "1")
        childDiv.style.display = "block";
      else childDiv.style.display = "none";
    }
    if (noChildDiv) {
      if (Value === "n") {
        noChildDiv.style.display = "block";
      } else {
        noChildDiv.style.display = "none";
      }
    }

    if (Field === "hf_emchilgee_check") {
      const childDivs = document.querySelector("#" + Field + "Childs");
      if (childDivs) {
        const childs = childDivs.children;
        if (childs) {
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
    }
  };

  GetDisplay = (Field) => {
    const { EditObject } = this.state;
    const Value = EditObject && EditObject[Field] ? EditObject[Field] : "";
    if (Value === "a" || Value === "y" || Value === "1") return "block";
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
      <div style={{ padding: "0" }}>
        {Array.isArray(Fields) && Fields.length > 0 ? (
          <div style={{ margin: "-10px 0 0 0" }}>
            <GroupPanel title={t("Эмчилгээ")} level={1}>
              <BaseRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("hf_emchilgee_check")}
              />
              <div id="hf_emchilgee_checkChilds">
                <Box
                  id="hf_emchilgee_checkChild-2"
                  sx={{
                    ...sx.childDiv,
                    display: this.GetValueDisplay("hf_emchilgee_check", 2),
                  }}
                >
                  {/* Хэрэв АХФС зөвлөсөн бол эмийн нэршлийг сонгож, тунг бичнэ үү */}
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("hf_axpc_nershil")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("hf_axpc_other")}
                    FullWidth={true}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("hf_axpc_tun")}
                  />
                  {/* Хэрэв АРХ зөвлөсөн бол эмийн нэршлийг сонгож, тунг бичнэ үү */}
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("hf_apc_nershil")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("hf_apc_other")}
                    FullWidth={true}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("hf_apc_tun")}
                  />
                </Box>

                {/* Хэрэв АРНС зөвлөсөн бол тунг бичнэ үү */}
                <Box
                  id="hf_emchilgee_checkChild-3"
                  sx={{
                    ...sx.childDiv,
                    display: this.GetValueDisplay("hf_emchilgee_check", 3),
                  }}
                >
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("aphc_tun")}
                  />
                </Box>

                {/* Not check treatment */}
                <Box
                  id="hf_emchilgee_checkChild-1"
                  sx={{
                    ...sx.childDiv,
                    display: this.GetValueDisplay("hf_emchilgee_check", 1),
                  }}
                >
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("hf_emchilgee_notcheck")}
                    Row={true}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("hf_emchilgee_notcheck_other")}
                    FullWidth={true}
                  />
                </Box>
              </div>

              {/* beta horiglogch */}
              <BaseRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("is_beta_horiglogch")}
              />
              <Box
                id="is_beta_horiglogchChild"
                sx={{
                  ...sx.childDiv,
                  display: this.GetDisplay("is_beta_horiglogch"),
                }}
              >
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hf_beta_horiglogch_nershil")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hf_beta_horiglogch_other")}
                  FullWidth={true}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hf_beta_horiglogch_tun")}
                />
              </Box>
              <Box
                id="is_beta_horiglogchNoChild"
                sx={{
                  ...sx.childDiv,
                  display: this.GetNoDisplay("is_beta_horiglogch"),
                }}
              >
                <BaseCheckBox
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hf_notbeta_horiglogch")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hf_notbeta_horiglogch_other")}
                  FullWidth={true}
                />
              </Box>
              {/* Минералокортикоид рецепторын антагонист */}
              <BaseRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("is_mra")}
              />
              <Box
                id="is_mraChild"
                sx={{ ...sx.childDiv, display: this.GetDisplay("is_mra") }}
              >
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hf_mra_check")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hf_mra_tun")}
                />
              </Box>

              <Box
                id="is_mraNoChild"
                sx={{ ...sx.childDiv, display: this.GetNoDisplay("is_mra") }}
              >
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hf_mra_notcheck")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hf_mra_notcheck_other")}
                  FullWidth={true}
                />
              </Box>

              {/* SGLT2 */}
              <BaseRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("is_sglt2")}
              />
              <Box
                id="is_sglt2Child"
                sx={{ ...sx.childDiv, display: this.GetDisplay("is_sglt2") }}
              >
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hf_sglt2_check")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hf_sglt2_tun")}
                />
              </Box>
              <Box
                id="is_sglt2NoChild"
                sx={{ ...sx.childDiv, display: this.GetNoDisplay("is_sglt2") }}
              >
                <BaseCheckBox
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hf_sglt2_notcheck")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hf_sglt2_notcheck_other")}
                  FullWidth={true}
                />
              </Box>

              <BaseRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("is_ibabradin")}
              />
              <Box
                id="is_ibabradinChild"
                sx={{
                  ...sx.childDiv,
                  display: this.GetDisplay("is_ibabradin"),
                }}
              >
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("ibabradin_tun")}
                />
              </Box>
              <BaseRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("is_antitrombotic")}
              />
              <Box
                id="is_antitromboticChild"
                sx={{
                  ...sx.childDiv,
                  display: this.GetDisplay("is_antitrombotic"),
                }}
              >
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hf_antitrombotic_check")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hf_antitrombotic_other")}
                  FullWidth={true}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hf_antitrombotic_tun")}
                />
              </Box>
              <BaseRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("is_digoksin")}
              />
              <Box
                id="is_digoksinChild"
                sx={{ ...sx.childDiv, display: this.GetDisplay("is_digoksin") }}
              >
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("digoksin_tun")}
                />
              </Box>
              <BaseRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("is_shees_huuh_em")}
              />
              <Box
                id="is_shees_huuh_emChild"
                sx={{
                  ...sx.childDiv,
                  display: this.GetDisplay("is_shees_huuh_em"),
                }}
              >
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hf_shees_huuh_em_check")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hf_shees_huuh_em_other")}
                  FullWidth={true}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hf_shees_huuh_em_tun")}
                />
              </Box>

              {/* Lipid buuruulah emuud */}
              <BaseRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("is_lipid_buuruulah")}
              />
              <Box
                id="is_lipid_buuruulahChild"
                sx={{
                  ...sx.childDiv,
                  display: this.GetDisplay("is_lipid_buuruulah"),
                }}
              >
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hf_lipid_buuruulah_em_check")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hf_lipid_buuruulah_em_other")}
                  FullWidth={true}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hf_lipid_buuruulah_em_tun")}
                />
              </Box>
              {/* <div
                id="is_sglt2NoChild"
                className={classes.childDiv}
                style={{ display: this.GetNoDisplay("is_sglt2") }}
              ></div> */}
              <BaseRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("is_sudas_telegch")}
              />
              <Box
                id="is_sudas_telegchChild"
                sx={{
                  ...sx.childDiv,
                  display: this.GetDisplay("is_sudas_telegch"),
                }}
              >
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hf_sudas_telegch_em_check")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hf_sudas_telegch_em_tun")}
                />
              </Box>
              {/* hf_tuhuurumj_zowloson */}
              <BaseRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("hf_tuhuurumj_zowloson")}
              />
              <Box
                id="hf_tuhuurumj_zowlosonChild"
                sx={{
                  ...sx.childDiv,
                  display: this.GetDisplay("hf_tuhuurumj_zowloson"),
                }}
              >
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hf_tuhuurumj_zowloson_check")}
                />
              </Box>
            </GroupPanel>

            <GroupPanel title={t("Сэргээн засах эмчилгээ")} level={1}>
              <BaseRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("sergen_zasah")}
              />
              <Box
                id="sergen_zasahNoChild"
                sx={{
                  ...sx.childDiv,
                  display: this.GetNoDisplay("sergen_zasah"),
                }}
              >
                <BaseCheckBox
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField(
                    "hf_sergeen_zasah_emchilgee_notcheck",
                  )}
                  Row={true}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("sergen_zasah_not_other")}
                  FullWidth={true}
                />
              </Box>
            </GroupPanel>
            <GroupPanel title={t("Цаашид")} level={1}>
              {/* <BaseDate
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("")}
              /> */}
              <BaseInputMask
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("davtan_date")}
                Mask={"9999-99-99"}
                MaskChar={"_"}
                defaultValue={Helper.ObjectHelper.getDateYMD()}
              />
              <BaseRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("hevtuuleh")}
              />
              <BaseRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("shiljuuleh")}
              />
              <BaseTextArea
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("notes")}
                Rows={5}
              />
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
  HfAmbulanceTreatmentForm,
);
