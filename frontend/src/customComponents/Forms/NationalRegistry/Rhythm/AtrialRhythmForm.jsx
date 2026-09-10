import { useTranslation } from "react-i18next";
import React from "react";
// translation
import { withTranslation } from "react-i18next";
// @mui/material components
import { Box } from "@mui/material";
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
// import BaseAutoComplete from "customComponents/BaseEditControls/BaseAutoComplete";
import BaseLookUpGridLoad from "baseComponents/Controls/BaseLookUpGridLoad";
// import BaseLookUpGrid from "baseComponents/Controls/BaseLookUpGrid";
import BaseInputMask from "customComponents/BaseEditControls/BaseInputMask";
import BaseNoData from "customComponents/BaseNoData";
import GroupPanel from "customComponents/GroupPanel";

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

const sx = customFormStyles;

class AtrialRhythmForm extends BaseCustomForm {
  constructor(props) {
    super(props);
    this.state = { ...this.state, DataId: null, Age: 0, Gender: null };
    this.ModifyObject = { visit_date: Helper.ObjectHelper.getDateYMD() };
  }

  GetData = async () => await this.GetLastData();

  GetLastData = async () => {
    const { PatientRegNo } = this.props;

    let alert = null;
    if (PatientRegNo) {
      await Helper.BaseCrudHelper.CallService(
        "/AtrialRhythm/GetLastData",
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
    if (PatientRegNo && Object.keys(this.ModifyObject).length > 0) {
      const Id = EditObject ? EditObject.Id : null;
      await Helper.BaseCrudHelper.CallService(
        "/AtrialRhythm/CustomSave",
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
        "/AtrialRhythm/Confirm",
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
              <GroupPanel title={t("Эмчид үзүүлэх үеийн бүртгэл")} level={1}>
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
                  Config={this.GetConfigField("visit_date")}
                  defaultValue={Helper.ObjectHelper.getDateYMD()}
                  Mask={"9999-99-99"}
                  MaskChar={"_"}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("doctor_name")}
                  FullWidth={true}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("out_score")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("monitoring_hostpital_name")}
                  FullWidth={true}
                />
                <GroupPanel
                  title={t("Шинж тэмдэг (хэд хэдийг сонгож болно)")}
                  level={2}
                >
                  <BaseCheckBox
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("r_symptoms")}
                    boxMd={4}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("r_symptoms_other")}
                    FullWidth={true}
                  />
                </GroupPanel>
              </GroupPanel>
              <GroupPanel
                title={t("Титэм судасны эмгэгт хүргэх эрсдэлт хүчин зүйлс")}
                level={1}
              >
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("daralt_ihselt")}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("uuh_tos_uurchlult")}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("chihriin_shijin")}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("ishemi_urid")}
                  Unknown={true}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("zurh_genet_uhel")}
                  Unknown={true}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("tamhidalt")}
                />
                <div id="tamhidaltChilds">
                  <div
                    id="tamhidaltChild-4"
                    style={{
                      ...sx.childDiv,
                      display: this.GetValueDisplay("tamhidalt", "4"),
                    }}
                  >
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("tamhinaas_garsan_hugatsaa")}
                      FullWidth={true}
                    />
                  </div>
                  <div
                    id="tamhidaltChild-6"
                    style={{
                      ...sx.childDiv,
                      display: this.GetValueDisplay("tamhidalt", "6"),
                    }}
                  >
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("dundaj_tamhinii_too")}
                    />
                  </div>
                </div>

                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("arhi_hereglee")}
                />
                <div id="arhi_heregleeChilds">
                  <Box
                    id="arhi_heregleeChild-4"
                    sx={{
                      ...sx.childDiv,
                      display: this.GetValueDisplay("arhi_hereglee", "4"),
                    }}
                  >
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("arhinaas_garsan_hugatsaa")}
                      FullWidth={true}
                    />
                  </Box>
                </div>
              </GroupPanel>

              <GroupPanel title={t("Бусад онцлох өвчний түүх")} level={1}>
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hereg_emgeg")}
                  Unknown={true}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("havhlaga_gajig_mes")}
                  Unknown={true}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("cardiomiopati")}
                  Unknown={true}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("arhag_dutagdal")}
                  Unknown={true}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("miokardit")}
                  Unknown={true}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("haldvart_endokardit")}
                  Unknown={true}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("buur_dutagdal")}
                  Unknown={true}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("umnu_tarhi_sudas")}
                  Unknown={true}
                />
                <Box
                  id="umnu_tarhi_sudasChild"
                  sx={{
                    ...sx.childDiv,
                    display: this.GetDisplay("umnu_tarhi_sudas"),
                  }}
                >
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("y_umnu_tarhi_sudas")}
                    Row={true}
                  />
                </Box>
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("is_tisde")}
                  Unknown={true}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("is_gabg")}
                  Unknown={true}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("uushig_arhag")}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("giperti")}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("gipoti")}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("zahiin_sudas_emgeg")}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("amisgal_noir_tasaldah")}
                />
                <BaseTextArea
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("other_uwchin")}
                />

                <GroupPanel
                  title={t("Тосгуурын жирвэгнээгийн тохиолдлын давтамж")}
                  level={2}
                >
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("suuliin_48_tsag")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("ehnii_udaa")}
                  />
                </GroupPanel>
              </GroupPanel>
              <GroupPanel title={t("Зүрхний цахилгаан бичлэг ")} level={2}>
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("qrs_duration")}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("left_bbb")}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("right_bbb")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("ztst")}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("zuun_hovdol_gipertrofi")}
                />
              </GroupPanel>
              <GroupPanel title={t("Зүүн тосгуурын хэмжээ")} level={2}>
                <BaseCheckBox
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("zuun_tosguur_hemjee")}
                  boxMd={4}
                />
              </GroupPanel>
              <GroupPanel
                title={t("Зүүн ховдолын цацалтын фракцын хэмжээ")}
                level={2}
              >
                <BaseCheckBox
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("zuun_tsatsalt_frakts")}
                  boxMd={4}
                />
              </GroupPanel>
              <GroupPanel
                title={t("Хэм алдагдлын эсрэг эмийн хэрэглээ")}
                level={2}
              >
                <BaseCheckBox
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hem_aldagdal_esreg")}
                  boxMd={4}
                />
              </GroupPanel>
              <GroupPanel title={t("Өмнө хийгдэсэн эмчилгээ")} level={2}>
                <BaseCheckBox
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("umnuh_emchilgee")}
                  boxMd={4}
                />
              </GroupPanel>
              <GroupPanel title={t("Тогтмол уудаг эмийн хэрэглээ ")} level={2}>
                <BaseCheckBox
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("togtmol_uudag_em")}
                  boxMd={4}
                />
              </GroupPanel>
              <GroupPanel title={t("Эрсдлийн үнэлгээ ")} level={2}>
                <GridContainer>
                  <GridItem xs={12} md={6}>
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("chads2_score")}
                      LabelWidth={50}
                    />
                  </GridItem>
                  <GridItem xs={12} md={6}>
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("chads2_vasc_score")}
                      LabelWidth={50}
                    />
                  </GridItem>
                  <GridItem xs={12} md={6}>
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("has_bled_score")}
                      LabelWidth={50}
                    />
                  </GridItem>
                  <GridItem xs={12} md={6}>
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("c2hest_score")}
                      LabelWidth={50}
                    />
                  </GridItem>
                </GridContainer>
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
  withMui5Styles(customFormStyles)(AtrialRhythmForm),
);
