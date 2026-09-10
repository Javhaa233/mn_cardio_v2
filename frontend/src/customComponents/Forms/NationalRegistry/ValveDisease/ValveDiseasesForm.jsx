import { useTranslation } from "react-i18next";
import React from "react";
// translation
import { withTranslation } from "react-i18next";
// @mui/material components
import { styled } from "@mui/material/styles";
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

const ChildDiv = styled("div")({
  position: "relative",
  padding: "10px",
  border: "1px solid #ccc",
  margin: "10px",
  backgroundColor: "#f5f5f5",
});

class ValveDiseasesForm extends BaseCustomForm {
  constructor(props) {
    super(props);
    this.state = { ...this.state, DataId: null, saveLoading: false };
    this.ModifyObject = {
      DiagnosedDate: Helper.ObjectHelper.getDateYMD(),
      StartedDate: Helper.ObjectHelper.getDateYMD(),
      ShinjilgeeDate: Helper.ObjectHelper.getDateYMD(),
      ztsb_date: Helper.ObjectHelper.getDateYMD(),
      het_awia_date: Helper.ObjectHelper.getDateYMD(),
      titem_date: Helper.ObjectHelper.getDateYMD(),
      mes_zasal_date: Helper.ObjectHelper.getDateYMD(),
      hiimel_date: Helper.ObjectHelper.getDateYMD(),
      inr_date: Helper.ObjectHelper.getDateYMD(),
    };
  }

  GetData = () => {
    this.GetLastData();
  };

  GetLastData = async () => {
    const { PatientRegNo } = this.props;
    if (PatientRegNo) {
      await Helper.BaseCrudHelper.CallService(
        "/ValveDiseases/GetLastData",
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
        "/ValveDiseases/CustomSave",
        {
          PatientRegNo,
          Id,
          Data: JSON.stringify({ ...this.ModifyObject }),
        },
        (resData) => {
          if (resData) {
            if (resData.Data) {
              const DataId = resData.Data.DataId;
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
        "/ValveDiseases/Confirm",
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
      if (Value === "n") {
        noChildDiv.style.display = "block";
      } else {
        noChildDiv.style.display = "none";
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
                  <BaseInputMask
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("DiagnosedDate")}
                    FullWidth={true}
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
                  <ChildDiv
                    id="is_udamshilChild"
                    style={{ display: this.GetDisplay("is_udamshil") }}
                  >
                    <BaseTextArea
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("udamshil")}
                      FullWidth={true}
                      Rows={3}
                    />
                  </ChildDiv>
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
                  <BaseInputMask
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("hiimel_date")}
                    defaultValue={Helper.ObjectHelper.getDateYMD()}
                    Mask={"9999-99-99"}
                    MaskChar={"_"}
                  />

                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("is_gaduur_ursgal")}
                  />

                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("vvd_hiimel_bvtets_hud")}
                    Unknown={true}
                    UnknownText={"Үгүй"}
                  />

                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("hiimel_dundaj_daralt")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("reg_hundiin_zereg")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("zvvn_tosguur")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("zvvn_howdol")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("zvvn_howdol_agshih_chadwar")}
                  />
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("is_uad_ihselt")}
                  />
                  <ChildDiv
                    id="is_uad_ihseltChild"
                    style={{ display: this.GetDisplay("is_uad_ihselt") }}
                  >
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("spap")}
                    />
                  </ChildDiv>

                  {/* treatment monitoring */}
                  <GroupPanel
                    title={t("Антикоагулянт эмчилгээний хяналт")}
                    level={2}
                  >
                    <BaseInputMask
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("inr_date")}
                      defaultValue={Helper.ObjectHelper.getDateYMD()}
                      Mask={"9999-99-99"}
                      MaskChar={"_"}
                    />
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("mes_daraa_inr")}
                    />
                  </GroupPanel>
                </GroupPanel>
                {/* <div className={this.props.classes.borderDiv}>
                  <h4 className={this.props.classes.divHeader}>{t("")}</h4>
                </div>
                <div className={this.props.classes.borderDiv}>
                  <h4 className={this.props.classes.divHeader}>{t("")}</h4>
                </div> */}
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

export default withTranslation(undefined, { withRef: true })(ValveDiseasesForm);
