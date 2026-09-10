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
import GroupPanel from "customComponents/GroupPanel";
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

class HfHospitalizationForm extends BaseCustomForm {
  constructor(props) {
    super(props);
    this.state = { ...this.state, DataId: null, Age: 0, Gender: null };

    this.ModifyObject = {
      hospitalized_date: Helper.ObjectHelper.getDateYMD(),
      laboratory_test_date: Helper.ObjectHelper.getDateYMD(),
      tseej_rent_date: Helper.ObjectHelper.getDateYMD(),
      het_avia_date: Helper.ObjectHelper.getDateYMD(),
      // mibi_date: Helper.ObjectHelper.getDateYMD(),
      // mri_date: Helper.ObjectHelper.getDateYMD(),
      titem_date: Helper.ObjectHelper.getDateYMD(),
      discharge_date: Helper.ObjectHelper.getDateYMD(),
      creatinin: 0,
      creatinin_type: "1",
      g_creatinin: 0,
      g_creatinin_type: "1",
    };
  }

  GetData = () => {
    this.GetLastData();
  };

  GetLastData = async () => {
    const { PatientRegNo } = this.props;

    let alert = null;
    if (PatientRegNo && PatientRegNo) {
      await Helper.BaseCrudHelper.CallService(
        "/HfHospitalization/GetLastData",
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
        "/HfHospitalization/CustomSave",
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
        "/HfHospitalization/Confirm",
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
    // Update state to trigger re-render for checkboxes
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

    if (
      Field === "creatinin" ||
      Field === "g_creatinin" ||
      Field === "creatinin_type" ||
      Field === "g_creatinin_type"
    ) {
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
      if (
        Value === "a" ||
        Value === "y" ||
        (Field === "is_suulgats" && Value === "2") ||
        Value === "5"
      )
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

    if (
      Field === "hf_uwchinii_tvvh" ||
      Field === "hf_suulgats_emchilgee_turul" ||
      Field === "g_hf_emchilgee_check" ||
      Field === "hf_hewteh_uyd_hiigdsen_emchilgee" ||
      Field === "hf_hewtehed_nuluuluh_huchin_zuils" ||
      Field === "hf_emlegt_hiigdsen_shinjilgee" ||
      Field === "hf_hevteh_uyd_garsan_hvndrel"
    ) {
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

  GetConfigField = (FieldName) => {
    const { EditObject, Fields } = this.state;
    const { t } = this.props;

    // Get field configuration using the same helper as parent class
    let field = Helper.BaseCrudHelper.GetFieldByName(FieldName, Fields);

    // If organization_id field doesn't have proper config, provide default
    if (FieldName === "organization_id") {
      const { t } = this.props;
      if (
        !field ||
        !field.Config ||
        !field.Config.ObjectName ||
        !field.Config.TextField ||
        !field.Config.Fields ||
        !Array.isArray(field.Config.Fields) ||
        field.Config.Fields.length === 0 ||
        field.Config.Fields.every((f) => !f.Name)
      ) {
        field = {
          Name: "organization_id",
          Label: t("Эмнэлгийн нэр"),
          Required: false,
          DataFilter: [],
          Config: {
            ObjectName: "Organization",
            IdField: "Id",
            TextField: "Name",
            MinTextLength: 0,
            SearchType: "AllData",
            SearchUrl: "/BaseObject/",
            Fields: [
              { Name: "ParentOrganization.Name", Label: t("Parent") },
              { Name: "Name", Label: t("Name") },
            ],
          },
        };
      } else {
        // Clear any DataFilter from the field configuration
        field.DataFilter = [];
      }
    }

    if (field) {
      // Special handling for CheckBox fields - ensure array value
      if (field.Type === "CheckBox") {
        const value =
          EditObject && EditObject[FieldName] ? EditObject[FieldName] : [];
        field.Value = Array.isArray(value) ? value : [];
      } else {
        field.Value =
          EditObject && EditObject[FieldName] ? EditObject[FieldName] : "";
      }
      return field;
    }

    return null;
  };

  GetDisplay = (Field) => {
    const { EditObject } = this.state;
    const Value = EditObject && EditObject[Field] ? EditObject[Field] : "";
    if (
      Value === "y" ||
      (Field === "is_suulgats" && Value === "2") ||
      Value === "5"
    )
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
              {/* Эмнэлэгт хэвтэлтийн байдал */}
              <GroupPanel title={t("Эмнэлэгт хэвтэлтийн байдал")} level={1}>
                {/* <BaseDate
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hospitalized_date")}
                />
                <BaseInputMask
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hospitalized_date")}
                  Mask={"9999-99-99"}
                  MaskChar={"_"}
                  defaultValue={Helper.ObjectHelper.getDateYMD()}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("history_no")}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hf_hevtelt")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("or_honog")}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("tasag")}
                  Unknown={true}
                  UnknownText={"Other"}
                />
                <div id="tasagOther" style={{ display: this.GetTasagOther() }}>
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("tasag_other")}
                    FullWidth={true}
                  />
                </div>
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("or_honog_tulbur")}
                />

                {/* Organization */}
                <BaseLookUpGridLoad
                  ChangeValue={(value) =>
                    this.ChangeValue("organization_id", value)
                  }
                  Config={this.GetConfigField("organization_id")}
                  Value={this.GetConfigField("organization_id")?.Value}
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
              </GroupPanel>
              {/* <GroupPanel title={} level={2}>
              
            </GroupPanel> */}

              {/* Хэвтэх үеийн зовуурь, шинж тэмдэг */}
              <GroupPanel
                title={t("Хэвтэх үеийн зовуурь, шинж тэмдэг")}
                level={1}
              >
                {/* <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("b_ad")}
                /> */}
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("b_ad_deed")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("b_ad_dood")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("b_dd")}
                />
                {/* <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("b_dd_deed")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("b_dd_dood")}
                /> */}

                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("b_ztst")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("b_at")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("b_undur")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("b_jin")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("b_bji")}
                  Id="b_bji"
                  Disabled
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("b_bgt")}
                  Id="b_bgt"
                  Disabled
                />

                <BaseCheckBox
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("heartache")}
                />

                <BaseTextArea
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("heartache_other")}
                  FullWidth={true}
                />
                {/* <GroupPanel title={t("Хэвтэх үед илэрсэн шинж тэмдэг")} level={2}>
                 */}
                {/* zah */}
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hf_zahiin_shinj")}
                />
                <div
                  id="hf_zahiin_shinjChild"
                  className={this.props.classes.childDiv}
                  style={{ display: this.GetDisplay("hf_zahiin_shinj") }}
                >
                  <BaseCheckBox
                    ChangeValue={this.ChangeValue}
                    FullWidth={true}
                    Config={this.GetConfigField("hf_zahiin_shinj_code")}
                  />
                </div>
                {/* uushig */}
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hf_uushig_shinj")}
                />
                <div
                  id="hf_uushig_shinjChild"
                  className={this.props.classes.childDiv}
                  style={{ display: this.GetDisplay("hf_uushig_shinj") }}
                >
                  <BaseCheckBox
                    ChangeValue={this.ChangeValue}
                    FullWidth={true}
                    Config={this.GetConfigField("hf_uushig_shinj_code")}
                  />
                </div>
                {/* zurh */}
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hf_zurh_shinj")}
                />
                <div
                  id="hf_zurh_shinjChild"
                  className={this.props.classes.childDiv}
                  style={{ display: this.GetDisplay("hf_zurh_shinj") }}
                >
                  <BaseCheckBox
                    ChangeValue={this.ChangeValue}
                    FullWidth={true}
                    Config={this.GetConfigField("hf_zurh_shinj_code")}
                    boxMd={12}
                  />
                </div>
                {/* hevlii */}
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hf_hevliin_shinj")}
                />
                <div
                  id="hf_hevliin_shinjChild"
                  className={this.props.classes.childDiv}
                  style={{ display: this.GetDisplay("hf_hevliin_shinj") }}
                >
                  <BaseCheckBox
                    ChangeValue={this.ChangeValue}
                    FullWidth={true}
                    Config={this.GetConfigField("hf_hevliin_shinj_code")}
                  />
                </div>
              </GroupPanel>

              {/* </GroupPanel> */}

              {/* 3. Зүрхний дутагдлын шалтгаан ба эмнэлэгт хэвтэлтийн нөлөөлөх хүчин зүйлс */}
              <GroupPanel
                title={t(
                  "Зүрхний дутагдлын шалтгаан ба эмнэлэгт хэвтэлтийн нөлөөлөх хүчин зүйлс",
                )}
                level={1}
              >
                <BaseCheckBox
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hf_zvrh_dutagdal_shaltgaan")}
                />
                <BaseTextArea
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField(
                    "hf_zvrh_dutagdal_shaltgaan_other",
                  )}
                  FullWidth={true}
                  Rows={3}
                />
                <BaseCheckBox
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField(
                    "hf_hewtehed_nuluuluh_huchin_zuils",
                  )}
                  boxMd={6}
                />
                <div id="hf_hewtehed_nuluuluh_huchin_zuilsChilds">
                  <div
                    id="hf_hewtehed_nuluuluh_huchin_zuilsChild-11"
                    className={this.props.classes.childDiv}
                    style={{
                      display: this.GetValueDisplay(
                        "hf_hewtehed_nuluuluh_huchin_zuils",
                        "11",
                      ),
                    }}
                  >
                    <BaseCheckBox
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("hf_emchilgee_dagaagui")}
                    />
                  </div>
                </div>

                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField(
                    "hf_hewtehed_nuluuluh_huchin_zuils_other",
                  )}
                  FullWidth={true}
                />
              </GroupPanel>

              {/* Бусад мэдээлэл */}
              <GroupPanel title={t("Бусад мэдээлэл")} level={1}>
                <BaseCheckBox
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hf_hawsarsan_emgeg")}
                />
                <BaseTextArea
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hort_havdar_notes")}
                />
                <BaseTextArea
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("other_notes")}
                />

                {/* <GroupPanel title={t("Өвчний түүх")} level={2}>
                 */}
                <BaseCheckBox
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hf_uwchinii_tvvh")}
                  boxMd={12}
                />
                <div id="hf_uwchinii_tvvhChilds">
                  <div
                    id="hf_uwchinii_tvvhChild-1"
                    className={this.props.classes.childDiv}
                    style={{
                      display: this.GetValueDisplay("hf_uwchinii_tvvh", "1"),
                    }}
                  >
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("hf_himiin_emchilgee_turul")}
                    />

                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("hf_himiin_emchilgee_other")}
                      FullWidth={true}
                    />
                  </div>
                  <div
                    id="hf_uwchinii_tvvhChild-5"
                    className={this.props.classes.childDiv}
                    style={{
                      display: this.GetValueDisplay("hf_uwchinii_tvvh", "5"),
                    }}
                  >
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField(
                        "hf_suulgats_emchilgee_turul",
                      )}
                      // Unknown={true}
                      // UnknownText={"No"}
                    />
                    <div id="hf_suulgats_emchilgee_turulChilds">
                      <div
                        id="hf_suulgats_emchilgee_turulChild-3"
                        className={this.props.classes.childDiv}
                        style={{
                          display: this.GetValueDisplay(
                            "hf_suulgats_emchilgee_turul",
                            "3",
                          ),
                        }}
                      >
                        <BaseRadio
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("hf_pacemaker_turul")}
                        />
                      </div>
                      <div
                        id="hf_suulgats_emchilgee_turulChild-4"
                        className={this.props.classes.childDiv}
                        style={{
                          display: this.GetValueDisplay(
                            "hf_suulgats_emchilgee_turul",
                            "4",
                          ),
                        }}
                      >
                        <BaseRadio
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("hf_icd_turul")}
                        />
                      </div>
                    </div>
                  </div>
                  <div
                    id="hf_uwchinii_tvvhChild-6"
                    className={this.props.classes.childDiv}
                    style={{
                      display: this.GetValueDisplay("hf_uwchinii_tvvh", "6"),
                    }}
                  >
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("hf_cardiomiopati_turul")}
                      Row={true}
                    />
                  </div>
                </div>

                <BaseTextArea
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hf_uwchinii_tvvh_other")}
                />

                {/* </GroupPanel> */}

                <GroupPanel title={t("Асран хамгаалагч")} level={2}>
                  <BaseCheckBox
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("hf_asran_hamgaalagch")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("hf_asran_hamgaalagch_other")}
                    FullWidth={true}
                  />
                </GroupPanel>
                <GroupPanel title={t("Хорт зуршил")} level={2}>
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("hf_tamhi")}
                  />
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("hf_arhi")}
                  />
                </GroupPanel>
              </GroupPanel>

              {/* Үйл ажиллагааны үнэлгээ */}
              <GroupPanel title={t("Үйл ажиллагааны үнэлгээ")} level={1}>
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("is_life_quality")}
                />
                <div
                  id="is_life_qualityChild"
                  className={this.props.classes.childDiv}
                  style={{ display: this.GetDisplay("is_life_quality") }}
                >
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("life_minnesota")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("kccq")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("life_quality_other")}
                    FullWidth={true}
                  />
                </div>
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hf_nyha")}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hf_hudulguun_chadvhi")}
                  Row={true}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hf_amidraliin_idewhi")}
                  Row={true}
                />
              </GroupPanel>

              {/* Хэвтэх үеийн лабораторийн болон дүрс оношилгооны шинжилгээ */}
              <GroupPanel
                title={t(
                  "Хэвтэх үеийн лабораторийн болон дүрс оношилгооны шинжилгээ",
                )}
                level={1}
              >
                <GroupPanel
                  title={t(
                    "Хэвтэх үеийн лабораторийн шинжилгээний үзүүлэлтүүд (бичнэ үү)",
                  )}
                  level={2}
                >
                  {/* <BaseDate
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("laboratory_test_date")}
                  /> */}
                  <BaseInputMask
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("laboratory_test_date")}
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
                    Config={this.GetConfigField("ulaan_es")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("yaltas_es")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("niit_uurag")}
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
                    Id={"creatinin"}
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
                    Minus={true}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("alat")}
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
                    Config={this.GetConfigField("n_t_pro_b_n_p")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("b_n_p")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("saturatsi")}
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
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("sanamsargui_glukoz")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("hb_a1c")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("s_r_b")}
                  />
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
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("hf_rhythm")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("hf_rhythm_other")}
                    FullWidth={true}
                  />
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("hf_zurh_horig")}
                    Row={true}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("hf_zurh_horig_other")}
                    FullWidth={true}
                  />
                </GroupPanel>
                <div style={{ height: "40px" }}></div>
                <GroupPanel
                  title={t("Цээжний рентген зургийн өөрчлөлт")}
                  level={2}
                >
                  {/* <BaseDate
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("tseej_rent_date")}
                  /> */}
                  <BaseInputMask
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("tseej_rent_date")}
                    Mask={"9999-99-99"}
                    MaskChar={"_"}
                    defaultValue={Helper.ObjectHelper.getDateYMD()}
                  />
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("hf_tseej_rentgen_uurchlut")}
                    Row={true}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField(
                      "hf_tseej_rentgen_uurchlut_other",
                    )}
                    FullWidth={true}
                  />
                </GroupPanel>
                <div style={{ height: "40px" }}></div>
                <GroupPanel title={t("Зүрхний хэт авиан шинжилгээ")} level={2}>
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
                    Minus={true}
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
                    Config={this.GetConfigField("rv_fac")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("rvw_d")}
                  />

                  {/* Хавхлагын эмгэг */}
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("havhlaga_emgeg")}
                  />
                  <div
                    id="havhlaga_emgegChild"
                    className={this.props.classes.childDiv}
                    style={{ display: this.GetDisplay("havhlaga_emgeg") }}
                  >
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("h_e_2xx_nar")}
                    />
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("h_e_2xx_dut")}
                    />
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("h_e_3xx_nar")}
                    />
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("h_e_3xx_dut")}
                    />
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("h_e_gol_nar")}
                    />
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("h_e_gol_dut")}
                    />
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("h_e_ua_nar")}
                    />
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("h_e_ua_dut")}
                    />
                  </div>

                  <GridContainer>
                    <GridItem xs={12} md={6}>
                      <GroupPanel
                        title={t("MIBI (сүүлийн шинжилгээ)")}
                        level={3}
                      >
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
                      <GroupPanel
                        title={t("MRI (сүүлийн шинжилгээ)")}
                        level={3}
                      >
                        {/* <BaseDate
                          ChangeValue={this.ChangeValue}
                          Config={this.GetConfigField("mri_date")}
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

                  <GroupPanel
                    title={t("Титэм судсан дотуурх оношилгоо")}
                    level={2}
                  >
                    {/* <BaseDate
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("titem_date")}
                    /> */}
                    <BaseInputMask
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("titem_date")}
                      FullWidth={true}
                      Mask={"9999-99-99"}
                      MaskChar={"_"}
                      defaultValue={Helper.ObjectHelper.getDateYMD()}
                    />
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("hf_titem_dvgnelt")}
                      Row={true}
                      Unknown={false}
                    />
                  </GroupPanel>
                </GroupPanel>
              </GroupPanel>

              {/* Эмнэлэгт хэвтэх явцад хийгдсэн шинжилгээ ба эмчилгээ */}
              <GroupPanel
                title={t(
                  "Эмнэлэгт хэвтэх явцад хийгдсэн шинжилгээ ба эмчилгээ",
                )}
                level={1}
              >
                {/* Эмнэлэгт хэвтэх явцад хийгдсэн шинжилгээ */}
                <GroupPanel
                  title={t("Эмнэлэгт хэвтэх явцад хийгдсэн шинжилгээ")}
                  level={2}
                >
                  <BaseCheckBox
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField(
                      "hf_emlegt_hiigdsen_shinjilgee",
                    )}
                    boxMd={6}
                  />
                  <div id="hf_emlegt_hiigdsen_shinjilgeeChilds">
                    <div
                      id="hf_emlegt_hiigdsen_shinjilgeeChild-10"
                      className={this.props.classes.childDiv}
                      style={{
                        display: this.GetValueDisplay(
                          "hf_emlegt_hiigdsen_shinjilgee",
                          10,
                        ),
                      }}
                    >
                      <BaseTextArea
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("hya_biopsi_uurchlult")}
                        Rows={3}
                      />
                    </div>
                    <div
                      id="hf_emlegt_hiigdsen_shinjilgeeChild-5"
                      className={this.props.classes.childDiv}
                      style={{
                        display: this.GetValueDisplay(
                          "hf_emlegt_hiigdsen_shinjilgee",
                          5,
                        ),
                      }}
                    >
                      <BaseTextArea
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField("hya_cardio_pul_vo_max")}
                        Rows={3}
                      />
                    </div>
                  </div>
                </GroupPanel>
                {/* Эмнэлэгт хэвтэх үед хийгдсэн эмчилгээ */}
                <GroupPanel
                  title={t("Эмнэлэгт хэвтэх үед хийгдсэн эмчилгээ")}
                  level={2}
                >
                  <BaseCheckBox
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField(
                      "hf_hewteh_uyd_hiigdsen_emchilgee",
                    )}
                  />
                  <div id="hf_hewteh_uyd_hiigdsen_emchilgeeChilds">
                    <div
                      id="hf_hewteh_uyd_hiigdsen_emchilgeeChild-3"
                      className={this.props.classes.childDiv}
                      style={{
                        display: this.GetValueDisplay(
                          "hf_hewteh_uyd_hiigdsen_emchilgee",
                          3,
                        ),
                      }}
                    >
                      <BaseRadio
                        ChangeValue={this.ChangeValue}
                        Config={this.GetConfigField(
                          "hf_hevteh_uyed_suulgats_emchilgee_turul",
                        )}
                        // Unknown={true}
                        // UnknownText={"No"}
                      />
                      {/* <div id="hf_suulgats_emchilgee_turulChilds">
                        <div
                          id="hf_suulgats_emchilgee_turulChild-3"
                          className={this.props.classes.childDiv}
                          style={{
                            display: this.GetValueDisplay(
                              "hf_suulgats_emchilgee_turul",
                              "3"
                            ),
                          }}
                        >
                          <BaseRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("hf_pacemaker_turul")}
                          />
                        </div>
                        <div
                          id="hf_suulgats_emchilgee_turulChild-4"
                          className={this.props.classes.childDiv}
                          style={{
                            display: this.GetValueDisplay(
                              "hf_suulgats_emchilgee_turul",
                              "4"
                            ),
                          }}
                        >
                          <BaseRadio
                            ChangeValue={this.ChangeValue}
                            Config={this.GetConfigField("hf_icd_turul")}
                          />
                        </div>
                      </div> */}
                    </div>
                  </div>
                </GroupPanel>
              </GroupPanel>

              {/* Эмнэлэгт хэвтэх явцад ЗД-тай холбоотой дараах тусламж үйлчилгээг үзүүлсэн эсэх */}
              <GroupPanel
                title={t(
                  "Эмнэлэгт хэвтэх явцад ЗД-тай холбоотой дараах тусламж үйлчилгээг үзүүлсэн эсэх",
                )}
                level={1}
              >
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hyanasan_eseh")}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("is_tamhinaas_garah")}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("is_bolovsrol")}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("is_hutulbur")}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("is_hevten_emchluuleh")}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("is_inotrop")}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("is_suulgats")}
                />
                <div
                  id="is_suulgatsChild"
                  className={this.props.classes.childDiv}
                  style={{ display: this.GetDisplay("is_suulgats") }}
                >
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("hf_suulgats_turul")}
                  />
                </div>

                {/* Эмнэлэгт хэвтэх үед санал болгосон бусад тусламж үйлчилгээ */}
                <GroupPanel
                  title={t(
                    "Эмнэлэгт хэвтэх үед санал болгосон бусад тусламж үйлчилгээ",
                  )}
                  level={2}
                >
                  <BaseCheckBox
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField(
                      "hf_hewteh_uyd_sanal_tuslamj_uilchilgee",
                    )}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField(
                      "hf_hewteh_uyd_sanal_tuslamj_uilchilgee_other",
                    )}
                    FullWidth={true}
                  />
                </GroupPanel>

                {/* Сэргээн засах эмчилгээ */}
                <GroupPanel title={t("Сэргээн засах эмчилгээ")} level={2}>
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("sergen_zasah")}
                  />
                  <div
                    id="sergen_zasahNoChild"
                    className={this.props.classes.childDiv}
                    style={{ display: this.GetNoDisplay("sergen_zasah") }}
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
                  </div>
                </GroupPanel>
              </GroupPanel>

              {/* Эмнэлгээс гарсан байдал */}
              <GroupPanel title={t("Эмнэлгээс гарсан байдал")} level={1}>
                {/* Эмнэлгээс гарах үеийн үзүүлэлтүүд */}
                <GroupPanel
                  title={t("Эмнэлгээс гарах үеийн үзүүлэлтүүд")}
                  level={2}
                >
                  {/* <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("g_ad")}
                  /> */}

                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("g_ad_deed")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("g_ad_dood")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("g_ztst")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("g_jin")}
                  />
                </GroupPanel>

                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hf_emnlegees_garsan_baidal")}
                />
                <BaseCheckBox
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("hf_hevteh_uyd_garsan_hvndrel")}
                />
                <div id="hf_hevteh_uyd_garsan_hvndrelChilds">
                  <div
                    id="hf_hevteh_uyd_garsan_hvndrelChild-1"
                    className={this.props.classes.childDiv}
                    style={{
                      display: this.GetValueDisplay(
                        "hf_hevteh_uyd_garsan_hvndrel",
                        1,
                      ),
                    }}
                  >
                    <BaseCheckBox
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("hf_hem_aldagdal")}
                    />
                  </div>
                </div>

                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("is_hyanalt")}
                />
                {/* <div
                  id="is_hyanaltNoChild"
                  className={this.props.classes.childDiv}
                  style={{ display: this.GetNoDisplay("is_hyanalt") }}
                >
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField(
                      "hf_ambultoriin_hynalt_sanal_bolgoogvi"
                    )}
                  />
                </div> */}

                {/* Эмнэлгээс гарах үеийн зөвлөмж */}
                <GroupPanel
                  title={t("Эмнэлгээс гарах үеийн зөвлөмж")}
                  level={2}
                >
                  <BaseCheckBox
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField(
                      "hf_emnlegees_garah_uyiin_zowlomj",
                    )}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField(
                      "hf_emnlegees_garah_uyiin_zowlomj_other",
                    )}
                    FullWidth={true}
                  />
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("is_hunguwchluh_emchilgee")}
                  />
                  <div
                    id="is_hunguwchluh_emchilgeeNoChild"
                    className={this.props.classes.childDiv}
                    style={{
                      display: this.GetNoDisplay("is_hunguwchluh_emchilgee"),
                    }}
                  >
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("hf_hunguwchluh_emchilgee")}
                    />
                  </div>
                  {/* <BaseRadio
                    ChangeValue={this.ChangeValue}  
                    Config={this.GetConfigField("hf_emnlegees_garsan_baidal")}
                  /> */}
                </GroupPanel>
                {/* <GroupPanel title={t("")} level={1}>
            
          </GroupPanel> */}
              </GroupPanel>

              {/* Эмнэлгээс гарах үеийн лабораторийн шинжилгээ */}
              <GroupPanel
                title={t("Эмнэлгээс гарах үеийн лабораторийн шинжилгээ")}
                level={1}
              >
                {/* <BaseDate
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("discharge_date")}
                  /> */}
                <BaseInputMask
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("discharge_date")}
                  Mask={"9999-99-99"}
                  MaskChar={"_"}
                  defaultValue={Helper.ObjectHelper.getDateYMD()}
                />

                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("g_tsagaan_es")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("g_yaltas_es")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("g_gemoglobin")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("g_natri")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("g_kali")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("g_sheesnii_huchil")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("g_creatinin")}
                  Id={"g_creatinin"}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("g_creatinin_type")}
                  defaultValue={"1"}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("g_mochevin")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("g_albumin")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("g_t_sh_h")}
                  Id="g_t_sh_h"
                  Disabled={true}
                  Minus={true}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("g_alat")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("g_asat")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("g_g_g_t")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("g_digoksin_level")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("g_tumur")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("g_ferritin")}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("g_hf_ferritin_type")}
                />

                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("g_n_t_pro_b_n_p")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("g_b_n_p")}
                />
                {/* <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("g_saturatsi")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("g_tumur")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("g_ferritin")}
                  />
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("g_hf_ferritin_type")}
                  /> */}
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("g_s_r_b")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("g_hb_a1c")}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("g_sanamsargui_glukoz")}
                />
              </GroupPanel>

              {/* Эмнэлгээс гарах үеийн эмийн эмчилгээний зөвлөмж */}
              <GroupPanel
                title={t("Эмнэлгээс гарах үеийн эмийн эмчилгээний зөвлөмж")}
                level={1}
              >
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("g_hf_emchilgee_check")}
                />
                <div id="g_hf_emchilgee_checkChilds">
                  {/* Хэрэв АХФС зөвлөсөн бол эмийн нэршлийг сонгож, тунг бичнэ үү */}
                  <div
                    id="g_hf_emchilgee_checkChild-2"
                    className={this.props.classes.childDiv}
                    style={{
                      display: this.GetValueDisplay(
                        "g_hf_emchilgee_check",
                        "2",
                      ),
                    }}
                  >
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("g_hf_axpc_nershil")}
                    />
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("g_hf_axpc_other")}
                      FullWidth={true}
                    />
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("g_hf_axpc_tun")}
                    />
                    {/* Хэрэв АРХ зөвлөсөн бол эмийн нэршлийг сонгож, тунг бичнэ үү */}
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("g_hf_apc_nershil")}
                    />
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("g_hf_apc_other")}
                      FullWidth={true}
                    />
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("g_hf_apc_tun")}
                    />
                  </div>

                  <div
                    id="g_hf_emchilgee_checkChild-3"
                    className={this.props.classes.childDiv}
                    style={{
                      display: this.GetValueDisplay(
                        "g_hf_emchilgee_check",
                        "3",
                      ),
                    }}
                  >
                    {/* Хэрэв АРНС зөвлөсөн бол тунг бичнэ үү */}
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("g_aphc_tun")}
                    />
                  </div>

                  <div
                    id="g_hf_emchilgee_checkChild-1"
                    className={this.props.classes.childDiv}
                    style={{
                      display: this.GetValueDisplay(
                        "g_hf_emchilgee_check",
                        "1",
                      ),
                    }}
                  >
                    {/*  */}
                    <BaseRadio
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("g_hf_emchilgee_notcheck")}
                      Row={true}
                    />
                    <BaseTextField
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField(
                        "g_hf_emchilgee_notcheck_other",
                      )}
                      FullWidth={true}
                    />
                  </div>
                </div>
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("g_is_beta_horiglogch")}
                />
                <div
                  id="g_is_beta_horiglogchChild"
                  className={this.props.classes.childDiv}
                  style={{ display: this.GetDisplay("g_is_beta_horiglogch") }}
                >
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("g_hf_beta_horiglogch_nershil")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("g_hf_beta_horiglogch_other")}
                    FullWidth={true}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("g_hf_beta_horiglogch_tun")}
                  />
                </div>
                <div
                  id="g_is_beta_horiglogchNoChild"
                  className={this.props.classes.childDiv}
                  style={{
                    display: this.GetNoDisplay("g_is_beta_horiglogch"),
                  }}
                >
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("g_hf_notbeta_horiglogch")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField(
                      "g_hf_notbeta_horiglogch_other",
                    )}
                    FullWidth={true}
                  />
                </div>

                {/* Минералокортикоид рецепторын антагонист */}
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("g_is_mra")}
                />
                <div
                  id="g_is_mraChild"
                  className={this.props.classes.childDiv}
                  style={{ display: this.GetDisplay("g_is_mra") }}
                >
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("g_hf_mra_check")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("g_hf_mra_tun")}
                  />
                </div>

                <div
                  id="g_is_mraNoChild"
                  className={this.props.classes.childDiv}
                  style={{
                    display: this.GetNoDisplay("g_is_mra"),
                  }}
                >
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("g_hf_mra_notcheck")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("g_hf_mra_notcheck_other")}
                    FullWidth={true}
                  />
                </div>

                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("g_is_sglt2")}
                />
                <div
                  id="g_is_sglt2Child"
                  className={this.props.classes.childDiv}
                  style={{ display: this.GetDisplay("g_is_sglt2") }}
                >
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("g_hf_sglt2_check")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("g_hf_sglt2_tun")}
                  />
                </div>

                <div
                  id="g_is_sglt2NoChild"
                  className={this.props.classes.childDiv}
                  style={{
                    display: this.GetNoDisplay("g_is_sglt2"),
                  }}
                >
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("g_hf_sglt2_notcheck")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("g_hf_sglt2_notcheck_other")}
                    FullWidth={true}
                  />
                </div>

                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("g_is_ibabradin")}
                />

                <div
                  id="g_is_ibabradinChild"
                  className={this.props.classes.childDiv}
                  style={{ display: this.GetDisplay("g_is_ibabradin") }}
                >
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("g_ibabradin_tun")}
                  />
                </div>
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("g_is_antitrombotic")}
                />
                <div
                  id="g_is_antitromboticChild"
                  className={this.props.classes.childDiv}
                  style={{ display: this.GetDisplay("g_is_antitrombotic") }}
                >
                  <BaseCheckBox
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("g_hf_antitrombotic_check")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("g_hf_antitrombotic_other")}
                    FullWidth={true}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("g_hf_antitrombotic_tun")}
                  />
                </div>
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("g_is_digoksin")}
                />
                <div
                  id="g_is_digoksinChild"
                  className={this.props.classes.childDiv}
                  style={{ display: this.GetDisplay("g_is_digoksin") }}
                >
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("g_digoksin_tun")}
                  />
                </div>
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("g_is_shees_huuh_em")}
                />
                <div
                  id="g_is_shees_huuh_emChild"
                  className={this.props.classes.childDiv}
                  style={{
                    display: this.GetDisplay("g_is_shees_huuh_emChild"),
                  }}
                >
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("g_hf_shees_huuh_em_check")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("g_hf_shees_huuh_em_other")}
                    FullWidth={true}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("g_hf_shees_huuh_em_tun")}
                  />
                </div>

                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("g_is_lipid_buuruulah")}
                />
                <div
                  id="g_is_lipid_buuruulahChild"
                  className={this.props.classes.childDiv}
                  style={{
                    display: this.GetDisplay("g_is_lipid_buuruulah"),
                  }}
                >
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField(
                      "g_hf_lipid_buuruulah_em_check",
                    )}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField(
                      "g_hf_lipid_buuruulah_em_other",
                    )}
                    FullWidth={true}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("g_hf_lipid_buuruulah_em_tun")}
                  />
                </div>
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("g_is_sudas_telegch")}
                />
                <div
                  id="g_is_sudas_telegchChild"
                  className={this.props.classes.childDiv}
                  style={{ display: this.GetDisplay("g_is_sudas_telegch") }}
                >
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("g_hf_sudas_telegch_em_check")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("g_hf_sudas_telegch_em_tun")}
                  />
                </div>
              </GroupPanel>

              {/* Нас баралт */}
              <div
                id="hf_emnlegees_garsan_baidalChild"
                style={{
                  display: this.GetDisplay("hf_emnlegees_garsan_baidal"),
                }}
              >
                <GroupPanel title={t("Нас баралт")} level={1}>
                  {/* <BaseDate
                      ChangeValue={this.ChangeValue}
                      Config={this.GetConfigField("nb_date")}
                      IsNull={true}
                    /> */}
                  <BaseInputMask
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("nb_date")}
                    Mask={"9999-99-99"}
                    MaskChar={"_"}
                    defaultValue={Helper.ObjectHelper.getDateYMD()}
                  />
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("hf_nas_baralt_shaltgaan")}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField(
                      "hf_nas_baralt_shaltgaan_other",
                    )}
                    FullWidth={true}
                  />
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField(
                      "hf_zurhnii_shaltgaant_nas_baralt",
                    )}
                  />
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField(
                      "hf_zurhnii_shaltgaant_nas_baralt_other",
                    )}
                    FullWidth={true}
                  />
                </GroupPanel>
              </div>
            </div>
          ) : (
            <BaseNoData />
          )}
        </GridItem>
      </GridContainer>
    );
  };
}

const StyledComponent = withMui5Styles(customFormStyles)(HfHospitalizationForm);
const TranslatedComponent = withTranslation(undefined, { withRef: true })(
  StyledComponent,
);

export default TranslatedComponent;
