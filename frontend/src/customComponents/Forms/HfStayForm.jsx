import React from "react";
// translation
import { withTranslation } from "react-i18next";
// @mui/material components
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// custom components
import CustomTab from "customComponents/CustomTab";
// import BaseField from "baseComponents/BaseField";
import BaseDate from "customComponents/BaseEditControls/BaseDate";
import BaseRadio from "customComponents/BaseEditControls/BaseRadio";
import BaseTextField from "customComponents/BaseEditControls/BaseTextField";
import BaseNoData from "customComponents/BaseNoData";
import BaseCustomForm from "customComponents/Forms/BaseCustomForm";
import GroupPanel from "customComponents/GroupPanel";
// helper
import Helper from "helper";

const styles = {
  labelHorizontal: {
    color: "#75736c",
    cursor: "pointer",
    display: "inline-flex",
    fontSize: "14px",
    lineHeight: "1.428571429",
    fontWeight: "400",
    paddingTop: "15px",
    marginRight: "0",
    textAlign: "left",
  },
};

class HfStayForm extends BaseCustomForm {
  constructor(props) {
    super(props);
  }

  GetFormConfig = async () => {
    this.setState({ isLoading: true });
    await Helper.BaseCrudHelper.CallService(
      "/HfStay/GetCustomFormData",
      {},
      (resData) => {
        if (resData && resData.Success && resData.Data)
          this.setState({
            Config: { Fields: resData.Data.Fields },
            Fields: resData.Data.Fields,
            isLoading: false,
          });
      },
    );
  };

  Save = async (callback) => {
    const { PatientId } = this.props;
    let alert = null;
    if (Object.keys(this.ModifyObject).length > 0) {
      await Helper.BaseCrudHelper.CallService(
        "/HfStay/CustomSave",
        {
          PatientId,
          Data: JSON.stringify({ ...this.ModifyObject, PatientId }),
        },
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

  ChangeValueAfter = (Field, Value) => {
    const childDiv = document.getElementById(Field + "Child");
    if (childDiv) {
      if (Value === "y") childDiv.style.display = "block";
      else childDiv.style.display = "none";
    }
  };

  GetDisplay = (Field) => {
    const { EditObject } = this.state;
    const Value = EditObject && EditObject[Field] ? EditObject[Field] : "";
    if (Value === "y") return "block";
    else return "none";
  };

  GetTabs = () => {
    var Tabs = [];
    Tabs.push({
      tabButton: "Ерөнхий мэдээлэл",
      tabContent: (
        <div>
          {/* <div className={classes.borderDiv}>
            <h4 className={classes.divHeader}>
              Эмчлүүлэгчийн талаарх мэдээлэл
            </h4>
          </div> */}
          <GroupPanel title="Эмнэлэгт хэвтэх үеийн мэдээлэл" level={1}>
            <BaseDate
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("StartedDate")}
              IsNull={true}
            />
            <BaseDate
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("DiagnosedDate")}
              IsNull={true}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("StayReason")}
              Row={true}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("DurationOfHf")}
              Unknown={true}
            />
          </GroupPanel>
          <GroupPanel title="Иргэнд өгөх мэдээлэл" level={1}>
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("IsGivenInfo")}
              Unknown={true}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("IsFamilyGivenInfo")}
              Unknown={true}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("IsGivenDestinyInfo")}
              Unknown={true}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("IsNeededPalliative")}
              Unknown={true}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("PalliativeType")}
              Unknown={true}
            />
          </GroupPanel>
          <GroupPanel title="Цаашид хянах төлөвлөгөө" level={1}>
            <BaseDate
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("OutDate")}
              IsNull={true}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("OutCondition")}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("IsGuardianGivenInfo")}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("MonitoringLevel")}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("IsMonitoringAmbulatory")}
              Unknown={true}
            />
          </GroupPanel>
        </div>
      ),
    });
    Tabs.push({
      tabButton: "Амьдралын хэв маяг",
      tabContent: (
        <div>
          <GroupPanel title="Амьдралын хэв маяг, амьдралын чанар" level={1}>
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("AskedLife")}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("Marriage")}
              Unknown={true}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("WorkCondition")}
              Unknown={true}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("PhysicalTherapy")}
              Unknown={true}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("HfEducation")}
              Unknown={true}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("Smoking")}
              Unknown={true}
              Row={true}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("DrinkingWeekly")}
              Unknown={true}
              Row={true}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("DrinkingLoop")}
              Unknown={true}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("Fatigue")}
              Unknown={true}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("Dyspnea")}
              Unknown={true}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("PhysicalActivity")}
              Unknown={true}
              Row={true}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("SelfService")}
              Unknown={true}
              Row={true}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("DailyActivity")}
              Unknown={true}
              Row={true}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("PainDiscomfort")}
              Unknown={true}
              Row={true}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("Anxiety")}
              Unknown={true}
              Row={true}
            />
            <BaseTextField
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("LifeQuality")}
              Unknown={true}
            />
          </GroupPanel>
          <GroupPanel title="Өвчний түүх" level={1}>
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("hist_hf")}
              Unknown={true}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("hist_revasc")}
              Unknown={true}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("hist_hypertension")}
              Unknown={true}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("hist_attrfib")}
              Unknown={true}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("hist_diabetes")}
              Unknown={true}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("hist_copd")}
              Unknown={true}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("hist_valvedisease")}
              Unknown={true}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("hist_valvesurgery")}
              Unknown={true}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("hist_dcm")}
              Unknown={true}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("hist_primary")}
              Unknown={true}
              Row={true}
            />
          </GroupPanel>
        </div>
      ),
    });
    Tabs.push({
      tabButton: "Шинжилгээ, Оношлогоо",
      tabContent: (
        <div>
          <GroupPanel title="Үзлэг шинжилгээ" level={1}>
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("Killip")}
            />
            <BaseTextField
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("Height")}
            />
          </GroupPanel>
          <GridContainer style={{ display: "flex" }}>
            <GridItem
              xs={12}
              sm={12}
              md={6}
              style={{ padding: "0 3px 0 15px", flex: 1 }}
            >
              <GroupPanel title="0-24 цаг" level={2}>
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("a_weight")}
                  md={6}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("a_sys")}
                  md={6}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("a_dias")}
                  md={6}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("a_hrate")}
                  md={6}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("a_hb")}
                  md={6}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("a_creat")}
                  md={6}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("a_kali")}
                  md={6}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("a_natri")}
                  md={6}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("a_ntprobnp")}
                  md={6}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("a_bnp")}
                  md={6}
                />
              </GroupPanel>
            </GridItem>
            <GridItem
              xs={12}
              sm={12}
              md={6}
              style={{ padding: "0 15px 0 3px", flex: 1 }}
            >
              <GroupPanel title="24 цагийн дараа" level={2}>
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("b_weight")}
                  md={6}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("b_sys")}
                  md={6}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("b_dias")}
                  md={6}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("b_hrate")}
                  md={6}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("b_hb")}
                  md={6}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("b_creat")}
                  md={6}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("b_kali")}
                  md={6}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("b_natri")}
                  md={6}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("b_ntprobnp")}
                  md={6}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("b_bnp")}
                  md={6}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("b_ferrit")}
                  md={6}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("b_transferrin")}
                  md={6}
                />
              </GroupPanel>
            </GridItem>
            <GridItem xs={12} sm={12} md={12}>
              <GroupPanel level={1}>
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("Nyha")}
                  Unknown
                />
              </GroupPanel>
            </GridItem>
          </GridContainer>
          <GroupPanel title="Оношилгоо" level={1}>
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("EcgRhythm")}
              Unknown={true}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("Lbbb")}
              Unknown={true}
            />
            <BaseTextField
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("Qrs")}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("LvefMethod")}
            />
            <BaseDate
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("LvefDate")}
              IsNull={true}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("Lvef")}
              Unknown={true}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("ChestXray")}
              Unknown={true}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("Spirometry")}
              Unknown={true}
            />
          </GroupPanel>
          <GroupPanel title="Судсаар хийгдсэн эмчилгээ" level={1}>
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("DiuerticDone")}
            />
            <div
              id="DiuerticDoneChild"
              style={{
                position: "relative",
                padding: "10px",
                border: "1px solid #ccc",
                margin: "10px",
                backgroundColor: "#f5f5f5",
                display: this.GetDisplay("DiuerticDone"),
              }}
            >
              <BaseDate
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("DiureticDate")}
                IsNull={true}
              />
            </div>
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("Inotropic")}
              Unknown={true}
            />
          </GroupPanel>
        </div>
      ),
    });
    Tabs.push({
      tabButton: "Эмчилгээ",
      tabContent: (
        <div>
          <GroupPanel title="Гарах үеийн эмчилгээ" level={1}>
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("inhibitor")}
              Unknown={true}
            />
            <div
              id="inhibitorChild"
              style={{
                position: "relative",
                padding: "10px",
                border: "1px solid #ccc",
                margin: "10px",
                backgroundColor: "#f5f5f5",
                display: this.GetDisplay("inhibitor"),
              }}
            >
              <BaseRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("inhibitor_tablet")}
                Row
              />
              <BaseTextField
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("inhibitor_dose")}
              />
            </div>
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("arb")}
              Unknown={true}
            />
            <div
              id="arbChild"
              style={{
                position: "relative",
                padding: "10px",
                border: "1px solid #ccc",
                margin: "10px",
                backgroundColor: "#f5f5f5",
                display: this.GetDisplay("arb"),
              }}
            >
              <BaseRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("arb_tablet")}
                Row
              />
              <BaseTextField
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("arb_dose")}
              />
            </div>
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("beta")}
              Unknown={true}
            />
            <div
              id="betaChild"
              style={{
                position: "relative",
                padding: "10px",
                border: "1px solid #ccc",
                margin: "10px",
                backgroundColor: "#f5f5f5",
                display: this.GetDisplay("beta"),
              }}
            >
              <BaseRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("beta_tablet")}
                Row
              />
              <BaseTextField
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("beta_dose")}
              />
            </div>
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("mra")}
              Unknown={true}
            />
            <div
              id="mraChild"
              style={{
                position: "relative",
                padding: "10px",
                border: "1px solid #ccc",
                margin: "10px",
                backgroundColor: "#f5f5f5",
                display: this.GetDisplay("mra"),
              }}
            >
              <BaseRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("mra_tablet")}
                Row
              />
              <BaseTextField
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("mra_dose")}
              />
            </div>
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("arni")}
              Unknown={true}
            />
            <div
              id="arniChild"
              style={{
                position: "relative",
                padding: "10px",
                border: "1px solid #ccc",
                margin: "10px",
                backgroundColor: "#f5f5f5",
                display: this.GetDisplay("arni"),
              }}
            >
              <BaseRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("arni_tablet")}
                Row
              />
              <BaseRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("arni_tablet_number")}
                Unknown
              />
            </div>
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("sinus_inhibitor")}
              Unknown={true}
            />
            <div
              id="sinus_inhibitorChild"
              style={{
                position: "relative",
                padding: "10px",
                border: "1px solid #ccc",
                margin: "10px",
                backgroundColor: "#f5f5f5",
                display: this.GetDisplay("sinus_inhibitor"),
              }}
            >
              <BaseRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("sinus_tablet")}
                Row
              />
              <BaseTextField
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("sinus_dose")}
              />
            </div>
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("loop_diuretics")}
              Unknown={true}
            />
            <div
              id="loop_diureticsChild"
              style={{
                position: "relative",
                padding: "10px",
                border: "1px solid #ccc",
                margin: "10px",
                backgroundColor: "#f5f5f5",
                display: this.GetDisplay("loop_diuretics"),
              }}
            >
              <BaseRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("loop_diuretics_tablet")}
                Row
              />
              <BaseRadio
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("loop_diuretics_cycle")}
                Unknown
              />
              <BaseTextField
                ChangeValue={this.ChangeValue}
                Config={this.GetConfigField("loop_diuretics_dose")}
              />
            </div>
          </GroupPanel>
          <GroupPanel level={1}>
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("OtherDiuretic")}
              Unknown={true}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("Digitalis")}
              Unknown={true}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("Statin")}
              Unknown={true}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("Nitrat")}
              Unknown={true}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("OralAnticoagulant")}
              Unknown={true}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("Antiagregant")}
              Unknown={true}
            />
            <BaseRadio
              ChangeValue={this.ChangeValue}
              Config={this.GetConfigField("DeviceTherapy")}
              Unknown={true}
            />
          </GroupPanel>
        </div>
      ),
    });
    return Tabs;
  };

  CustomRender = () => {
    const { t } = this.props;
    const { Fields, Alert } = this.state;
    return (
      <div style={{ height: "100%" }}>
        {Alert}
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
            {Fields ? (
              <CustomTab
                vertical
                shortVertical
                fillHeight
                tabs={this.GetTabs()}
              />
            ) : (
              <BaseNoData />
            )}
          </GridItem>
        </GridContainer>
      </div>
    );
  };
}

export default withTranslation(undefined, { withRef: true })(HfStayForm);
