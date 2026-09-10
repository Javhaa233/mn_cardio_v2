import { useTranslation } from "react-i18next";
import React from "react";
// translation
import { withTranslation } from "react-i18next";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// custom components
import CustomTab from "customComponents/CustomTab";
import BaseDate from "customComponents/BaseEditControls/BaseDate";
import BaseRadio from "customComponents/BaseEditControls/BaseRadio";
import BaseCheckBox from "customComponents/BaseEditControls/BaseCheckBox";
import BaseTextField from "customComponents/BaseEditControls/BaseTextField";
import BaseLabel from "customComponents/BaseViewControls/BaseLabel";
import BaseCustomTextField from "customComponents/BaseEditControls/BaseCustomTextField";
import CustomRadio from "customComponents/BaseEditControls/CustomRadio";
import BaseLoading from "customComponents/BaseLoading";
import BaseNoData from "customComponents/BaseNoData";
import CustomContainer from "customComponents/CustomContainer";
import BaseCustomForm from "customComponents/Forms/BaseCustomForm";
import GroupPanel from "customComponents/GroupPanel";
// helper
import Helper from "helper";

class SurgeryReportForm extends BaseCustomForm {
  constructor(props) {
    super(props);
  }

  ChangeValue = (Field, Value) => {
    this.ModifyObject[Field] = Value;
    this.MarkDirty();
    this.setState((prevState) => ({
      EditObject: {
        ...prevState.EditObject,
        [Field]: Value,
      },
    }));
  };

  Save = async (callback) => {
    const { PatientId } = this.props;
    const { ObjectName } = this.state;
    let alert = null;
    if (PatientId && ObjectName && Object.keys(this.ModifyObject).length > 0) {
      await Helper.BaseCrudHelper.BaseCreate(
        { ObjectName, Data: { ...this.ModifyObject, PatientId } },
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
    }
  };

  GetTabs = () => {
    const { t } = this.props;

    var Tabs = [];
    Tabs.push({
      tabButton: t("Page 1"),
      tabContent: (
        <div>
          <GroupPanel title={t("Hospitalisation")}>
            <BaseDate
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("date_of_admission")}
            />
            <BaseDate
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("date_of_operation")}
            />
            <BaseDate
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("date_of_discharge_death")}
            />
          </GroupPanel>
          <GroupPanel title={t("Cardiac history")}>
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("angina")}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("dyspnoea")}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("nb_prev_myo_infarction")}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("most_rcnt_myo_infarction")}
              Row={true}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("congestive_heart_failure")}
            />
          </GroupPanel>
          <GroupPanel title={t("Previous interventions")}>
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("prev_pci")}
              Row={true}
            />
            <BaseDate
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("date_last_pci")}
            />
            <BaseCheckBox
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("prev_surgery")}
            />
            <BaseDate
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("date_last_sur")}
            />
          </GroupPanel>
        </div>
      ),
    });
    Tabs.push({
      tabButton: t("Page 2"),
      tabContent: (
        <GroupPanel title={t("Pre-operative risk factors")}>
          <BaseTextField
            ChangeValue={this.ChangeValue}
            Config={{ ...this.GetConfigField("weight"), Type: "Number" }}
          />
          <BaseTextField
            ChangeValue={this.ChangeValue}
            Config={{ ...this.GetConfigField("height"), Type: "Number" }}
          />
          <BaseRadio
            ChangeValue={this.ChangeValue}
            Config={this.GetConfigField("smoking_history")}
          />
          <BaseRadio
            ChangeValue={this.ChangeValue}
            Config={this.GetConfigField("diab_treatment")}
          />
          <BaseRadio
            ChangeValue={this.ChangeValue}
            Config={this.GetConfigField("hypertension")}
          />
          <BaseRadio
            ChangeValue={this.ChangeValue}
            Config={this.GetConfigField("hypercholesterolaemia")}
          />
          <BaseCheckBox
            ChangeValue={this.ChangeValue}
            Config={this.GetConfigField("renal")}
          />
          <BaseTextField
            ChangeValue={this.ChangeValue}
            Config={{
              ...this.GetConfigField("last_preo_creatine"),
              Type: "Number",
            }}
          />
          <BaseRadio
            ChangeValue={this.ChangeValue}
            Config={this.GetConfigField("chr_lung_disease")}
          />
          <BaseRadio
            ChangeValue={this.ChangeValue}
            Config={this.GetConfigField("ext_card_arteriopathy")}
          />
          <BaseCheckBox
            ChangeValue={this.ChangeValue}
            Config={this.GetConfigField("cerebvas_disease_type")}
          />
          <BaseRadio
            ChangeValue={this.ChangeValue}
            Config={this.GetConfigField("neuro_dysfunction")}
          />
          <BaseRadio
            ChangeValue={this.ChangeValue}
            Config={this.GetConfigField("carotid_bruits")}
          />
          <BaseRadio
            ChangeValue={this.ChangeValue}
            Config={this.GetConfigField("preo_heart_rhythm")}
          />
        </GroupPanel>
      ),
    });
    Tabs.push({
      tabButton: t("Page 3"),
      tabContent: (
        <div>
          <GroupPanel
            title={t("Pre-operative haemodynamics and catheterisation")}
          >
            <BaseCheckBox
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("left_right_heart_cath")}
            />
            <BaseDate
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("date_last_cath")}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("nb_dis_cor_vess")}
              Row={true}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("lms_disease")}
              Row={true}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("ef_category")}
            />
            <BaseTextField
              ChangeValue={this.ChangeValue}
              Config={{ ...this.GetConfigField("ef_value"), Type: "Number" }}
            />
            <BaseTextField
              ChangeValue={this.ChangeValue}
              Config={{ ...this.GetConfigField("pa_systolic"), Type: "Number" }}
            />
            <BaseTextField
              ChangeValue={this.ChangeValue}
              Config={{ ...this.GetConfigField("av_gradient"), Type: "Number" }}
            />
            <BaseTextField
              ChangeValue={this.ChangeValue}
              Config={{ ...this.GetConfigField("lvedp"), Type: "Number" }}
            />
            <BaseTextField
              ChangeValue={this.ChangeValue}
              Config={{
                ...this.GetConfigField("mean_pawp_la"),
                Type: "Number",
              }}
            />
          </GroupPanel>
          <GroupPanel title={t("Pre-operative status and support")}>
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("iv_nit_hep_any_kind")}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("iv_inotropes")}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("ventilated")}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("cardio_shock")}
            />
          </GroupPanel>
        </div>
      ),
    });
    Tabs.push({
      tabButton: t("Page 4"),
      tabContent: (
        <div>
          <GroupPanel title={t("Operation")}>
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("procedure_group")}
              Row={true}
            />
          </GroupPanel>
          <GroupPanel title={t("Coronary surgery")}>
            <BaseTextField
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("dca_art_conduit")}
            />
            <BaseTextField
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("dca_ven_conduit")}
            />
            <BaseCheckBox
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("art_used_grafts")}
              Row={true}
            />
          </GroupPanel>
        </div>
      ),
    });
    Tabs.push({
      tabButton: t("Page 5"),
      tabContent: (
        <GroupPanel title={t("Valve surgery")}>
          <CustomContainer NoDivBorder>
            <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
              <BaseLabel
                Label={t("Aortic valve")}
                Weight="500"
                Color="#f54242"
                Size="15px"
              />
            </GridItem>
            <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
              <BaseLabel
                Label={t("Mitral valve")}
                Weight="500"
                Color="#f54242"
                Size="15px"
              />
            </GridItem>
            <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
              <BaseLabel
                Label={t("Tricuspid valve")}
                Weight="500"
                Color="#f54242"
                Size="15px"
              />
            </GridItem>
            <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
              <BaseLabel
                Label={t("Pulmonary valve")}
                Weight="500"
                Color="#f54242"
                Size="15px"
              />
            </GridItem>
          </CustomContainer>
          <CustomContainer Label={t("Stenosis")} MarginTop="10px">
            <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
              <CustomRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("stenosis_av")}
                Row={true}
              />
            </GridItem>
            <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
              <CustomRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("stenosis_mv")}
                Row={true}
              />
            </GridItem>
            <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
              <CustomRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("stenosis_tv")}
                Row={true}
              />
            </GridItem>
            <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
              <CustomRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("stenosis_pv")}
                Row={true}
              />
            </GridItem>
          </CustomContainer>
          <CustomContainer Label={t("Insufficiency")} MarginTop="10px">
            <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
              <CustomRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("insufficiency_av")}
                Row={true}
              />
            </GridItem>
            <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
              <CustomRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("insufficiency_mv")}
                Row={true}
              />
            </GridItem>
            <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
              <CustomRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("insufficiency_tv")}
                Row={true}
              />
            </GridItem>
            <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
              <CustomRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("insufficiency_pv")}
                Row={true}
              />
            </GridItem>
          </CustomContainer>
          <CustomContainer Label={t("Explant type")} MarginTop="10px">
            <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
              <CustomRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("explant_type_av")}
                Row={true}
              />
            </GridItem>
            <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
              <CustomRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("explant_type_mv")}
                Row={true}
              />
            </GridItem>
            <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
              <CustomRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("explant_type_tv")}
                Row={true}
              />
            </GridItem>
            <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
              <CustomRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("explant_type_pv")}
                Row={true}
              />
            </GridItem>
          </CustomContainer>
          <CustomContainer
            Label={t("Native valve pathology")}
            MarginTop="-5px"
            NoDivBorder
          >
            <GridItem xs={12} sm={3} md={3} style={{ padding: "0 5px" }}>
              <BaseCustomTextField
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("nat_val_path_av")}
                NoLabel={true}
                FullWidth={true}
              />
            </GridItem>
            <GridItem xs={12} sm={3} md={3} style={{ padding: "0 5px" }}>
              <BaseCustomTextField
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("nat_val_path_mv")}
                NoLabel={true}
                FullWidth={true}
              />
            </GridItem>
            <GridItem xs={12} sm={3} md={3} style={{ padding: "0 5px" }}>
              <BaseCustomTextField
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("nat_val_path_tv")}
                NoLabel={true}
                FullWidth={true}
              />
            </GridItem>
            <GridItem xs={12} sm={3} md={3} style={{ padding: "0 5px" }}>
              <BaseCustomTextField
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("nat_val_path_pv")}
                NoLabel={true}
                FullWidth={true}
              />
            </GridItem>
          </CustomContainer>
          <CustomContainer
            Label={t("Reason for repeat valve surgery")}
            MarginTop="10px"
            style={{ marginTop: "30px" }}
          >
            <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
              <CustomRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("rsn_rpt_vlv_sur_av")}
                Row={true}
              />
            </GridItem>
            <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
              <CustomRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("rsn_rpt_vlv_sur_mv")}
                Row={true}
              />
            </GridItem>
            <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
              <CustomRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("rsn_rpt_vlv_sur_tv")}
                Row={true}
              />
            </GridItem>
            <GridItem xs={12} sm={3} md={3}>
              <CustomRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("rsn_rpt_vlv_sur_pv")}
                Row={true}
              />
            </GridItem>
          </CustomContainer>
          <CustomContainer Label={t("Valve procedure")} MarginTop="10px">
            <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
              <CustomRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("valve_proc_av")}
                Row={true}
              />
            </GridItem>
            <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
              <CustomRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("valve_proc_mv")}
                Row={true}
              />
            </GridItem>
            <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
              <CustomRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("valve_proc_tv")}
                Row={true}
              />
            </GridItem>
            <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
              <CustomRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("valve_proc_pv")}
                Row={true}
              />
            </GridItem>
          </CustomContainer>
          <CustomContainer Label={t("Implant type")} MarginTop="10px">
            <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
              <CustomRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("implant_type_av")}
                Row={true}
              />
            </GridItem>
            <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
              <CustomRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("implant_type_mv")}
                Row={true}
              />
            </GridItem>
            <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
              <CustomRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("implant_type_tv")}
                Row={true}
              />
            </GridItem>
            <GridItem xs={12} sm={3} md={3} style={{ padding: "0 3px" }}>
              <CustomRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("implant_type_pv")}
                Row={true}
              />
            </GridItem>
          </CustomContainer>
          <CustomContainer
            Label={t("Implant code")}
            MarginTop="0px"
            NoDivBorder
          >
            <GridItem xs={12} sm={3} md={3} style={{ padding: "0 5px" }}>
              <BaseCustomTextField
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("implant_code_av")}
                NoLabel={true}
                FullWidth={true}
              />
            </GridItem>
            <GridItem xs={12} sm={3} md={3} style={{ padding: "0 5px" }}>
              <BaseCustomTextField
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("implant_code_mv")}
                NoLabel={true}
                FullWidth={true}
              />
            </GridItem>
            <GridItem xs={12} sm={3} md={3} style={{ padding: "0 5px" }}>
              <BaseCustomTextField
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("implant_code_tv")}
                NoLabel={true}
                FullWidth={true}
              />
            </GridItem>
            <GridItem xs={12} sm={3} md={3} style={{ padding: "0 5px" }}>
              <BaseCustomTextField
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("implant_code_pv")}
                NoLabel={true}
                FullWidth={true}
              />
            </GridItem>
          </CustomContainer>
          <CustomContainer
            Label={t("Valve / ring size")}
            MarginTop="0"
            style={{ marginTop: "0px" }}
            NoDivBorder
          >
            <GridItem xs={12} sm={3} md={3} style={{ padding: "0 5px" }}>
              <BaseCustomTextField
                ChangeValue={this.ChangeValue}
                Config={{
                  ...this.GetConfigField("valve_ring_size_av"),
                  Type: "Number",
                }}
                NoLabel={true}
                FullWidth={true}
              />
            </GridItem>
            <GridItem xs={12} sm={3} md={3} style={{ padding: "0 5px" }}>
              <BaseCustomTextField
                ChangeValue={this.ChangeValue}
                Config={{
                  ...this.GetConfigField("valve_ring_size_mv"),
                  Type: "Number",
                }}
                NoLabel={true}
                FullWidth={true}
              />
            </GridItem>
            <GridItem xs={12} sm={3} md={3} style={{ padding: "0 5px" }}>
              <BaseCustomTextField
                ChangeValue={this.ChangeValue}
                Config={{
                  ...this.GetConfigField("valve_ring_size_pv"),
                  Type: "Number",
                }}
                NoLabel={true}
                FullWidth={true}
              />
            </GridItem>
            <GridItem xs={12} sm={3} md={3} style={{ padding: "0 5px" }}>
              <BaseCustomTextField
                ChangeValue={this.ChangeValue}
                Config={{
                  ...this.GetConfigField("valve_ring_size_tv"),
                  Type: "Number",
                }}
                NoLabel={true}
                FullWidth={true}
              />
            </GridItem>
          </CustomContainer>
        </GroupPanel>
      ),
    });
    Tabs.push({
      tabButton: t("Page 6"),
      tabContent: (
        <GroupPanel title={t("Other procedures")}>
          <BaseCheckBox
            ChangeValue={this.ChangeValue}
            Config={this.GetConfigField("oth_car_proc_det")}
          />
          <BaseCheckBox
            ChangeValue={this.ChangeValue}
            Config={this.GetConfigField("oth_non_car_proc_det")}
          />
          <BaseCheckBox
            ChangeValue={this.ChangeValue}
            Config={this.GetConfigField("seg_aorta")}
          />
          <BaseCheckBox
            ChangeValue={this.ChangeValue}
            Config={this.GetConfigField("aortic_proc")}
          />
        </GroupPanel>
      ),
    });
    Tabs.push({
      tabButton: t("Page 7"),
      tabContent: (
        <GroupPanel title={t("Perfusion and myocardial protection")}>
          <BaseRadio
            ChangeValue={this.ChangeValue}
            Config={this.GetConfigField("cardiopulmonary_bypass")}
            Row={true}
          />
          <BaseTextField
            ChangeValue={this.ChangeValue}
            Config={{ ...this.GetConfigField("bypass_time"), Type: "Number" }}
          />
          <BaseTextField
            ChangeValue={this.ChangeValue}
            Config={{
              ...this.GetConfigField("cumulative_cross_clamp_time"),
              Type: "Number",
            }}
          />
          <BaseTextField
            ChangeValue={this.ChangeValue}
            Config={{
              ...this.GetConfigField("total_circulatory_arrest_time"),
              Type: "Number",
            }}
          />
        </GroupPanel>
      ),
    });
    Tabs.push({
      tabButton: t("Page 8"),
      tabContent: (
        <div>
          <GroupPanel title={t("Post-operative complications")}>
            <BaseCheckBox
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("re_operation")}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("new_post_operative_stroke")}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("new_post_operative_dialysis")}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("multi_system_failure")}
            />
          </GroupPanel>
          <GroupPanel title={t("Discharge details")}>
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("destination_on_discharge")}
              Row={true}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("patient_status_discharge")}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("primary_cause_death")}
              Row={true}
            />
          </GroupPanel>
        </div>
      ),
    });
    return Tabs;
  };

  CustomRender = () => {
    const { Alert, Fields, isLoading } = this.state;
    if (!isLoading) {
      return (
        <div
          style={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          {Alert}
          <GridContainer
            style={{
              margin: "0",
              width: "100%",
              flex: "1 1 auto",
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <GridItem
              xs={12}
              sm={12}
              md={12}
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {Fields.length > 0 ? (
                <CustomTab vertical hasMany fillHeight tabs={this.GetTabs()} />
              ) : (
                <BaseNoData />
              )}
            </GridItem>
          </GridContainer>
        </div>
      );
    } else {
      return <BaseLoading />;
    }
  };
}

export default withTranslation(undefined, { withRef: true })(SurgeryReportForm);
