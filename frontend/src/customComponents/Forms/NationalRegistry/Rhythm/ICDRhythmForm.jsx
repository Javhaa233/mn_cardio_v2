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
// import BaseCheckBox from "baseComponents/Controls/BaseCheckBox";
import BaseTextField from "customComponents/BaseEditControls/BaseTextField";
import BaseTextArea from "customComponents/BaseEditControls/BaseTextArea";
// import BaseAutoComplete from "customComponents/BaseEditControls/BaseAutoComplete";
import BaseLookUpGridLoad from "baseComponents/Controls/BaseLookUpGridLoad";
// import BaseLookUpGrid from "baseComponents/Controls/BaseLookUpGrid";
import BaseInputMask from "customComponents/BaseEditControls/BaseInputMask";
import BaseNoData from "customComponents/BaseNoData";
import GroupPanel from "customComponents/GroupPanel";

import CustomCheckBox from "customComponents/Forms/Components/CustomCheckBox";
import CustomRadio from "customComponents/Forms/Components/CustomRadio";
import CustomTextField from "customComponents/Forms/NationalRegistry/CustomTextField";

// helper
import Helper from "helper";

import customFormStyles from "assets/jss/material-dashboard-pro-react/custom/customFormStyles";

const sx = customFormStyles;

class ICDRhythmForm extends BaseCustomForm {
  constructor(props) {
    super(props);
    this.state = { ...this.state, DataId: null, Age: 0, Gender: null };
    this.ModifyObject = {};
  }

  GetData = async () => await this.GetLastData();

  GetLastData = async () => {
    const { PatientRegNo } = this.props;

    let alert = null;
    if (PatientRegNo) {
      await Helper.BaseCrudHelper.CallService(
        "/ICDRhythm/GetLastData",
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
        "/ICDRhythm/CustomSave",
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
        "/ICDRhythm/Confirm",
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
      if (Value === "a" || Value === "y" || Value === "5")
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

    if (Field === "tamhidalt") {
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
                <Box
                  id="organizationOther"
                  sx={{ display: this.GetOrgOther() }}
                >
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("organization_other")}
                    FullWidth={true}
                  />
                </Box>

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
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("now_age")}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("suulgasan_baidal")}
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
                  Config={this.GetConfigField("monitoring_hostpital_name")}
                  FullWidth={true}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("code")}
                  FullWidth={true}
                />
              </GroupPanel>

              {/* III. Өвчний түүх болон эрсдэлт хүчин зүйлс */}
              <GroupPanel
                title={t("III. Өвчний түүх болон эрсдэлт хүчин зүйлс")}
                level={1}
              >
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("anhdagch")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("anhdagch_other")}
                  FullWidth={true}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hoyordogch")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hoyordogch_other")}
                  FullWidth={true}
                />

                {/*  */}
                <BaseCheckBox
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hem_aldagdal_helber")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hem_aldagdal_helber_other")}
                  FullWidth={true}
                />

                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("zurh_suuri_emgeg")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("zurh_suuri_emgeg_other")}
                  FullWidth={true}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("zuun_hovdol_ef")}
                />
              </GroupPanel>

              {/* IV. Титэм судасны эмгэгт хүчин зүйлс */}
              <GroupPanel
                title={t("IV. Титэм судасны эмгэгт хүргэх эрсдэлт хүчин зүйлс")}
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
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("zurh_genet_uhel")}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("tamhidalt")}
                />
                <Box id="tamhidaltChilds">
                  <Box
                    id="tamhidaltChild-4"
                    sx={{
                      ...sx.childDiv,
                      display: this.GetValueDisplay("tamhidalt", "4"),
                    }}
                  >
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("tamhinaas_garsan_hugatsaa")}
                      FullWidth={true}
                    />
                  </Box>
                  <Box
                    id="tamhidaltChild-6"
                    sx={{
                      ...sx.childDiv,
                      display: this.GetValueDisplay("tamhidalt", "6"),
                    }}
                  >
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("dundaj_tamhinii_too")}
                    />
                  </Box>
                </Box>

                {/* <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("arhi_hereglee")}
                />
                <Box id="arhi_heregleeChilds">
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
                </Box> */}
                {/* <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("")}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("")}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("")}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("")}
                /> */}
              </GroupPanel>

              {/* V. Бусад онцлох өвчний түүх */}
              <GroupPanel title={t("V. Бусад онцлох өвчний түүх")} level={1}>
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
                <Box
                  id="havhlaga_gajig_mesChild"
                  sx={{
                    ...sx.childDiv,
                    display: this.GetDisplay("havhlaga_gajig_mes"),
                  }}
                >
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("y_havhlaga_gajig_mes")}
                    FullWidth={true}
                  />
                </Box>

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
                <Box
                  id="haldvart_endokarditChild"
                  sx={{
                    ...sx.childDiv,
                    display: this.GetDisplay("haldvart_endokardit"),
                  }}
                >
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("y_haldvart_endokardit")}
                    Unknown={true}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("y_uusgech")}
                    FullWidth={true}
                  />
                </Box>

                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("umnu_tarhi_sudas")}
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
                  />
                </Box>

                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("is_tisde")}
                  Unknown={true}
                />
                <Box
                  id="is_tisdeChild"
                  sx={{ ...sx.childDiv, display: this.GetDisplay("is_tisde") }}
                >
                  <BaseInputMask
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("tisde_date")}
                    defaultValue={Helper.ObjectHelper.getDateY()}
                    Mask={"9999"}
                    MaskChar={"_"}
                  />
                </Box>

                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("is_gabg")}
                  Unknown={true}
                />
                <Box
                  id="is_gabgChild"
                  sx={{ ...sx.childDiv, display: this.GetDisplay("is_gabg") }}
                >
                  <BaseInputMask
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("gabg_date")}
                    defaultValue={Helper.ObjectHelper.getDateY()}
                    Mask={"9999"}
                    MaskChar={"_"}
                  />
                </Box>

                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("is_other_uvchin")}
                  Unknown={true}
                />
                <Box
                  id="is_other_uvchinChild"
                  sx={{
                    ...sx.childDiv,
                    display: this.GetDisplay("is_other_uvchin"),
                  }}
                >
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("y_uusgech")}
                    FullWidth={true}
                  />
                </Box>
              </GroupPanel>

              {/* VI. ICD суулгах ажилбар */}
              <GroupPanel title={t("VI. ICD суулгах ажилбар")} level={1}>
                {/* ICD-ийн хэлбэр */}
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("helber")}
                />

                {/*  */}
                <Box component="table" sx={sx.customTable}>
                  <tbody>
                    <tr style={{ backgroundColor: "#fefefe" }}>
                      <td width={"18%"}></td>
                      <td width={"25%"}>Баруун тосгуур</td>
                      <td width={"25%"}>Баруун ховдол</td>
                      <td width={"32%"} colSpan={"2"}>
                        Зүүн ховдол
                      </td>
                    </tr>
                    <tr>
                      <td>Элетродийн бэхэлгээ</td>
                      <td>
                        <CustomRadio
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("electrid_behelgee_bt")}
                          Row={true}
                        />
                      </td>
                      <td>
                        <CustomRadio
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("electrid_behelgee_bh")}
                          Row={true}
                        />
                      </td>
                      <td colSpan={"2"}>
                        <CustomRadio
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("electrid_behelgee_zh")}
                          Row={true}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>Хатгалт хийсэн судас</td>
                      <td>
                        <CustomRadio
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("hatgalt_sudas_bt")}
                          Row={true}
                        />
                      </td>
                      <td>
                        <CustomRadio
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("hatgalt_sudas_bh")}
                          Row={true}
                        />
                      </td>
                      <td colSpan={"2"}>
                        <CustomRadio
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("hatgalt_sudas_zh")}
                          Row={true}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>Элетродийн загвар</td>
                      <td>
                        <CustomRadio
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("electrod_zagvar_bt")}
                          Row={true}
                        />
                        <br />
                        <CustomTextField
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField(
                            "electrod_zagvar_bt_other",
                          )}
                        />
                      </td>
                      <td>
                        <CustomRadio
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("electrod_zagvar_bh")}
                          Row={true}
                        />
                        <br />
                        <CustomTextField
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField(
                            "electrod_zagvar_bh_other",
                          )}
                        />
                      </td>
                      <td colSpan={"2"}>
                        <CustomRadio
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("electrod_zagvar_zh")}
                          Row={true}
                        />
                        <br />
                        <CustomTextField
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField(
                            "electrod_zagvar_zh_other",
                          )}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>Электродийн байрлал</td>
                      <td>
                        <CustomRadio
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("electrod_bairlal_bt")}
                          Row={true}
                        />
                      </td>
                      <td>
                        <CustomRadio
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("electrod_bairlal_bh")}
                          Row={true}
                        />
                      </td>
                      <td>
                        Баруун хажуу байрлалд:
                        <br />
                        <CustomRadio
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField(
                            "electrod_bairlal_zh_bhajuu",
                          )}
                          Row={true}
                        />
                      </td>
                      <td>
                        Зүүн хажуу байрлалд:
                        <br />
                        <CustomRadio
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField(
                            "electrod_bairlal_zh_zhajuu",
                          )}
                          Row={true}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>Электродийн загвар №</td>
                      <td>
                        <CustomTextField
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("electrod_zagvar_no_bt")}
                        />
                      </td>
                      <td>
                        <CustomTextField
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("electrod_zagvar_no_bh")}
                        />
                      </td>
                      <td colSpan={"2"}>
                        <CustomTextField
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("electrod_zagvar_no_zh")}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>Электродийн сериал №</td>
                      <td>
                        <CustomTextField
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("electrod_serial_no_bt")}
                        />
                      </td>
                      <td>
                        <CustomTextField
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("electrod_serial_no_bh")}
                        />
                      </td>
                      <td colSpan={"2"}>
                        <CustomTextField
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("electrod_serial_no_zh")}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>P/R амплитуди (mV)</td>
                      <td>
                        <CustomTextField
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("pr_amp_bt")}
                        />
                      </td>
                      <td>
                        <CustomTextField
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("pr_amp_bh")}
                        />
                      </td>
                      <td colSpan={"2"}>
                        <CustomTextField
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("pr_amp_zh")}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>Slew rate (V/s)</td>
                      <td>
                        <CustomTextField
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("slew_rate_bt")}
                        />
                      </td>
                      <td>
                        <CustomTextField
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("slew_rate_bh")}
                        />
                      </td>
                      <td colSpan={"2"}>
                        <CustomTextField
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("slew_rate_zh")}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>Pacing threshold (V) @ 0.5 ms</td>
                      <td>
                        <CustomTextField
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("pacing_thres_bt")}
                        />
                      </td>
                      <td>
                        <CustomTextField
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("pacing_thres_bh")}
                        />
                      </td>
                      <td colSpan={"2"}>
                        <CustomTextField
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("pacing_thres_zh")}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>Resistance (at 5V) Ohm</td>
                      <td>
                        <CustomTextField
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("resistance_bt")}
                        />
                      </td>
                      <td>
                        <CustomTextField
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("resistance_bh")}
                        />
                      </td>
                      <td colSpan={"2"}>
                        <CustomTextField
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("resistance_zh")}
                        />
                      </td>
                    </tr>
                  </tbody>
                </Box>

                {/* Төхөөрөмжийн пейсмейкерийн үзүүлэлтүүд */}
                <GroupPanel
                  title={t("Төхөөрөмжийн пейсмейкерийн үзүүлэлтүүд")}
                  level={2}
                >
                  <Box component="table" sx={sx.customTable}>
                    <tbody>
                      <tr>
                        <td>Электродийн хэлбэр</td>
                        <td>Slew rate</td>
                        <td>Pacing threshold</td>
                        <td>Pacing Impedance</td>
                      </tr>
                      <tr>
                        <td>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("tuh_electrod_helber")}
                            Row={true}
                          />
                        </td>
                        <td>
                          <CustomTextField
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("tuh_slew_rate")}
                          />
                        </td>
                        <td>
                          <CustomTextField
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("tuh_pacing_thres")}
                          />
                        </td>
                        <td>
                          <CustomTextField
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("tuh_pacing_impa")}
                          />
                        </td>
                      </tr>
                      {/* <tr>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr> */}
                    </tbody>
                  </Box>
                </GroupPanel>
                {/* Pulse Generator */}
                <GroupPanel title={t("Pulse Generator")} level={2}>
                  <Box component="table" sx={sx.customTable}>
                    <tbody>
                      <tr>
                        <td>Загвар</td>
                        <td>Модел №</td>
                        <td>Сериал №</td>
                        <td>Байрлал</td>
                      </tr>
                      <tr>
                        <td>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("pulse_zagvar")}
                            Row={true}
                          />
                          <br />
                          <CustomTextField
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("pulse_zagvar_other")}
                          />
                        </td>
                        <td>
                          <CustomTextField
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("pulse_model_no")}
                          />
                        </td>
                        <td>
                          <CustomTextField
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("pulse_serial_no")}
                          />
                        </td>
                        <td>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("pulse_bairlal")}
                            Row={true}
                          />
                          <br />
                          <CustomTextField
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("pulse_bairlal_other")}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </Box>
                </GroupPanel>
                {/* Дефибрилляторийн зааг тест (DFT testing) */}
                <GroupPanel
                  title={t("Дефибрилляторийн зааг тест (DFT testing)")}
                  level={2}
                >
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("is_dft_testing")}
                  />
                  <Box
                    id="is_dft_testingChild"
                    sx={{
                      ...sx.childDiv,
                      display: this.GetDisplay("is_dft_testing"),
                    }}
                  >
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("y_dft_testing")}
                    />
                  </Box>

                  <Box component="table" sx={sx.customTable}>
                    <tbody>
                      <tr>
                        <td>Ажилбар хийгдсэн нийт хугацаа (мин : сек)</td>
                        <td>Флюроскопи хийгдсэн хийт хугацаа (мин : сек)</td>
                        <td>Гадаргуугийн тун (mGy.cm2)</td>
                        <td>Арьсны тун (mGy)</td>
                      </tr>
                      <tr>
                        <td>
                          <CustomTextField
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("ajilbar_full_time")}
                          />
                        </td>
                        <td>
                          <CustomTextField
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("fulu_full_time")}
                          />
                        </td>
                        <td>
                          <CustomTextField
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("gadar_tun")}
                          />
                        </td>
                        <td>
                          <CustomTextField
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("aris_tun")}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </Box>
                </GroupPanel>
              </GroupPanel>
              {/* VII. Хүндрэл (эмнэлэгт байх үеийн) */}
              <GroupPanel
                title={t("VII. Хүндрэл (эмнэлэгт байх үеийн)")}
                level={1}
              >
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("is_hundrel")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hevteh_hundrel_other")}
                  FullWidth={true}
                />
              </GroupPanel>
              {/* VIII. Багажийг дахин суулгах болон эргүүлж авах */}
              <GroupPanel
                title={t("VIII. Багажийг дахин суулгах болон эргүүлж авах")}
                level={1}
              >
                {/* Үүсгүүрийг эргүүлж авах: */}
                <GroupPanel title={t("Үүсгүүрийг эргүүлж авах")} level={2}>
                  <p>Зөвхөн дахиж суулгах тохиолдолд бөглөнө</p>
                  <BaseInputMask
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("s_first_date")}
                    defaultValue={Helper.ObjectHelper.getDateYMD()}
                    Mask={"9999-99-99"}
                    MaskChar={"_"}
                  />
                  <BaseInputMask
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("s_solison_date")}
                    defaultValue={Helper.ObjectHelper.getDateYMD()}
                    Mask={"9999-99-99"}
                    MaskChar={"_"}
                  />
                  <Box component="table" sx={sx.customTable}>
                    <tbody>
                      <tr>
                        <td>Загвар</td>
                        <td>Модел №</td>
                        <td>Сериал №</td>
                        <td>Байрлал</td>
                        <td>Шалтгаан</td>
                      </tr>
                      <tr>
                        <td>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("uus_zagvar")}
                            Row={true}
                          />
                        </td>
                        <td>
                          <CustomTextField
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("uus_model_no")}
                          />
                        </td>
                        <td>
                          <CustomTextField
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("uus_serial_no")}
                          />
                        </td>
                        <td>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("uus_bairlal")}
                            Row={true}
                          />
                        </td>
                        <td>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("uus_shaltgaan")}
                            Row={true}
                          />
                          <br />
                          <CustomTextField
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("uus_shaltgaan_other")}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </Box>
                </GroupPanel>
                {/* Электродийг эргүүлж авах */}
                <GroupPanel title={t("Электродийг эргүүлж авах")} level={2}>
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("is_electrod_awsan")}
                  />
                  <BaseInputMask
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("electrod_bair_date")}
                    defaultValue={Helper.ObjectHelper.getDateYMD()}
                    Mask={"9999-99-99"}
                    MaskChar={"_"}
                  />
                  <Box component="table" sx={sx.customTable}>
                    <tbody>
                      <tr>
                        <td>Байрлал</td>
                        <td>Загвар</td>
                        <td>Модел №</td>
                        <td>Сериал №</td>
                        <td>Шалтгаан</td>
                      </tr>
                      <tr>
                        <td>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("e_electrod_bairlal")}
                            Row={true}
                          />
                        </td>
                        <td>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("e_electrod_zagvar")}
                            Row={true}
                          />
                        </td>
                        <td>
                          <CustomTextField
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("e_electrod_model_no")}
                            FullWidth={true}
                          />
                        </td>
                        <td>
                          <CustomTextField
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("e_electrod_serial_no")}
                            FullWidth={true}
                          />
                        </td>
                        <td>
                          <CustomRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("e_electrod_shaltgaan")}
                            Row={true}
                          />
                          <br />
                          <CustomTextField
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField(
                              "e_electrod_shaltgaan_other",
                            )}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </Box>
                </GroupPanel>
              </GroupPanel>
              {/*  */}
              {/* <Box sx={sx.borderDiv}>
                <Box component="h4" sx={sx.divHeader}>{t("")}</Box>
              </Box> */}
            </div>
          ) : (
            <BaseNoData />
          )}
        </GridItem>
      </GridContainer>
    );
  };
}

export default withTranslation(undefined, { withRef: true })(ICDRhythmForm);
