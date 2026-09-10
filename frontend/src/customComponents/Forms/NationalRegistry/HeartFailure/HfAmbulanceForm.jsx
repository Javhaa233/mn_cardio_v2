import { useTranslation } from "react-i18next";
import React, { createRef } from "react";
// translation
import { withTranslation } from "react-i18next";
// @mui/material components
import { Box } from "@mui/material";
import { css } from "@emotion/css";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// custom components
import CustomTab from "customComponents/CustomTab";
import GroupPanel from "customComponents/GroupPanel";

import BaseCustomForm from "customComponents/Forms/BaseCustomForm";
import BaseRadio from "customComponents/BaseEditControls/BaseRadio";
import BaseCheckBox from "customComponents/BaseEditControls/BaseCheckBox";
import BaseTextField from "customComponents/BaseEditControls/BaseTextField";
import BaseTextArea from "customComponents/BaseEditControls/BaseTextArea";
// import BaseAutoComplete from "customComponents/BaseEditControls/BaseAutoComplete";
import BaseLookUpGridLoad from "baseComponents/Controls/BaseLookUpGridLoad";
// import BaseLookUpGrid from "baseComponents/Controls/BaseLookUpGrid";
// import BaseSelect from "customComponents/BaseEditControls/BaseSelect";
import BaseInputMask from "customComponents/BaseEditControls/BaseInputMask";
import BaseNoData from "customComponents/BaseNoData";

// Forms
import HfAmbulanceTestForm from "customComponents/Forms/NationalRegistry/HeartFailure/HfAmbulanceTestForm";
import HfAmbulanceTreatmentForm from "customComponents/Forms/NationalRegistry/HeartFailure/HfAmbulanceTreatmentForm";
import customFormStyles from "assets/jss/material-dashboard-pro-react/custom/customFormStyles";

// helper
import Helper from "helper";

const sx = customFormStyles;

class HfAmbulanceForm extends BaseCustomForm {
  constructor(props) {
    super(props);
    // Extend parent state instead of replacing it
    this.state = {
      ...this.state,
      DataId: null,
      saveLoading: false,
      Age: null,
      Gender: null,
    };

    this.ModifyObject = { ambulance_date: Helper.ObjectHelper.getDateYMD() };
    // refs
    this.HfAmbulanceTestForm = createRef();
    this.HfAmbulanceTreatmentForm = createRef();
  }

  componentDidUpdate(prevProps, prevState) {
    // After loading completes, initialize child components with data
    if (prevState.isLoading && !this.state.isLoading) {
      const { DataId, Age, Gender } = this.state;
      if (
        this.HfAmbulanceTestForm &&
        this.HfAmbulanceTestForm.current &&
        this.HfAmbulanceTestForm.current.SetId
      ) {
        this.HfAmbulanceTestForm.current.SetId(DataId, Age, Gender);
      }
      if (
        this.HfAmbulanceTreatmentForm &&
        this.HfAmbulanceTreatmentForm.current &&
        this.HfAmbulanceTreatmentForm.current.SetId
      ) {
        this.HfAmbulanceTreatmentForm.current.SetId(DataId);
      }
    }
  }

  GetData = async () => await this.GetLastData();

  GetLastData = async () => {
    const { PatientRegNo } = this.props;

    if (PatientRegNo) {
      try {
        const getAmbulanceData = new Promise((resolve) => {
          Helper.BaseCrudHelper.CallService(
            "/HfAmbulance/GetLastData",
            { PatientRegNo },
            (resData) => resolve(resData),
          );
        });

        const getPatientData = new Promise((resolve) => {
          var SearchOption = Helper.BaseCrudHelper.GetSearchOption();
          SearchOption.SearchField = [
            { Field: "p_registration", Value: PatientRegNo, Op: "Equals" },
          ];
          Helper.BaseCrudHelper.BaseGetDetail(
            { ObjectName: "Patient", SearchOption },
            (resData) => resolve(resData),
          );
        });

        const [ambulanceRes, patientRes] = await Promise.all([
          getAmbulanceData,
          getPatientData,
        ]);

        let newState = { isLoading: false };
        let DataId = null;
        let Age = this.state.Age;
        let Gender = this.state.Gender;

        // Process Ambulance Data
        if (ambulanceRes && ambulanceRes.Success && ambulanceRes.Data) {
          DataId = ambulanceRes.Data.Id;
          newState.DataId = DataId;
          newState.EditObject = Object.assign({}, ambulanceRes.Data);
        }

        // Process Patient Data
        if (patientRes && patientRes.Data && patientRes.Success) {
          Age = patientRes.Data.Age;
          Gender = patientRes.Data.p_gender;
          newState.Age = Age;
          newState.Gender = Gender;
        }

        this.setState(newState, () => {
          // Update child components after state update
          if (this.HfAmbulanceTestForm && this.HfAmbulanceTestForm.current) {
            if (this.HfAmbulanceTestForm.current.SetId) {
              this.HfAmbulanceTestForm.current.SetId(DataId, Age, Gender);
            }
            if (this.HfAmbulanceTestForm.current.setState) {
              this.HfAmbulanceTestForm.current.setState({ Age, Gender });
            }
          }
          if (
            this.HfAmbulanceTreatmentForm &&
            this.HfAmbulanceTreatmentForm.current &&
            this.HfAmbulanceTreatmentForm.current.SetId
          ) {
            this.HfAmbulanceTreatmentForm.current.SetId(DataId);
          }
        });
      } catch (error) {
        console.error("Error loading data:", error);
        this.setState({ isLoading: false });
      }
    } else {
      const alert = Helper.BaseCrudHelper.ShowAlert(
        "Иргэний мэдээлэл олдсонгүй",
        false,
        () => this.setState({ Alert: null }),
      );
      this.setState({ Alert: alert, isLoading: false });
    }
  };

  // Id of the record being edited. After the first save the created Id lives in
  // state.DataId — without it every following save would create a new record.
  GetDataId = () => {
    const { EditObject, DataId } = this.state;
    return (EditObject ? EditObject.Id : null) || DataId || null;
  };

  // Remember the Id returned by a create so the next save updates that record
  // and the child tabs attach to it.
  ApplyCreatedId = (DataId) => {
    if (!DataId) return;
    const { Age, Gender } = this.state;
    this.setState((prevState) => ({
      DataId,
      EditObject: {
        ...(prevState.EditObject || {}),
        ...this.ModifyObject,
        Id: DataId,
      },
    }));
    if (
      this.HfAmbulanceTestForm &&
      this.HfAmbulanceTestForm.current &&
      this.HfAmbulanceTestForm.current.SetId
    ) {
      this.HfAmbulanceTestForm.current.SetId(DataId, Age, Gender);
    }
    if (
      this.HfAmbulanceTreatmentForm &&
      this.HfAmbulanceTreatmentForm.current &&
      this.HfAmbulanceTreatmentForm.current.SetId
    ) {
      this.HfAmbulanceTreatmentForm.current.SetId(DataId);
    }
  };

  Save = async () => {
    const { PatientRegNo } = this.props;

    let alert = null;
    const Id = this.GetDataId();
    this.setState({ saveLoading: true });
    if (PatientRegNo && Object.keys(this.ModifyObject).length > 0) {
      await Helper.BaseCrudHelper.CallService(
        "/HfAmbulance/CustomSave",
        {
          PatientRegNo,
          Id,
          Data: JSON.stringify(this.ModifyObject),
        },
        (resData) => {
          if (resData) {
            if (resData.Success && resData.Data && !Id) {
              this.ApplyCreatedId(resData.Data.DataId);
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

  SaveAll = async (callback) => {
    let allSuccess = true;
    let messages = [];

    // Save HfAmbulanceForm
    const { PatientRegNo } = this.props;
    const Id = this.GetDataId();

    if (PatientRegNo && Object.keys(this.ModifyObject).length > 0) {
      await new Promise((resolve) => {
        Helper.BaseCrudHelper.CallService(
          "/HfAmbulance/CustomSave",
          {
            PatientRegNo,
            Id,
            Data: JSON.stringify(this.ModifyObject),
          },
          (resData) => {
            if (resData) {
              if (resData.Success && resData.Data && !Id) {
                this.ApplyCreatedId(resData.Data.DataId);
              }
              if (!resData.Success) {
                allSuccess = false;
                messages.push(resData.Message);
              }
            }
            resolve();
          },
        );
      });
    }

    // Save HfAmbulanceTestForm
    if (
      this.HfAmbulanceTestForm &&
      this.HfAmbulanceTestForm.current &&
      this.HfAmbulanceTestForm.current.SaveWithCallback
    ) {
      await new Promise((resolve) => {
        this.HfAmbulanceTestForm.current.SaveWithCallback(
          (success, message) => {
            if (!success) {
              allSuccess = false;
              if (message) messages.push(message);
            }
            resolve();
          },
        );
      });
    }

    // Save HfAmbulanceTreatmentForm
    if (
      this.HfAmbulanceTreatmentForm &&
      this.HfAmbulanceTreatmentForm.current &&
      this.HfAmbulanceTreatmentForm.current.SaveWithCallback
    ) {
      await new Promise((resolve) => {
        this.HfAmbulanceTreatmentForm.current.SaveWithCallback(
          (success, message) => {
            if (!success) {
              allSuccess = false;
              if (message) messages.push(message);
            }
            resolve();
          },
        );
      });
    }

    // Show result alert and close dialog on success
    const alertMessage = allSuccess
      ? "Амжилттай хадгаллаа"
      : messages.length > 0
        ? messages.join(", ")
        : "Алдаа гарлаа";
    const alert = Helper.BaseCrudHelper.ShowAlert(
      alertMessage,
      allSuccess,
      () => {
        this.setState({ Alert: null, saveLoading: false });
        callback && callback(allSuccess);
      },
    );
    this.setState({ Alert: alert, saveLoading: false });
  };

  Confirm = async (callback) => {
    const { DataId } = this.state;
    let alert = null;
    if (DataId) {
      await Helper.BaseCrudHelper.CallService(
        "/HfAmbulance/Confirm",
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
      if (Value === "n") noChildDiv.style.display = "block";
      else noChildDiv.style.display = "none";
    }

    if (Field === "organization_id") {
      const orgOther = document.getElementById("organizationOther");
      if (orgOther) orgOther.style.display = Value ? "none" : "block";
    }

    if (
      Field === "jin" &&
      this.HfAmbulanceTestForm &&
      this.HfAmbulanceTestForm.current &&
      this.HfAmbulanceTestForm.current.setState
    ) {
      this.HfAmbulanceTestForm.current.setState({ jin: Value });
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

  GetTabs = () => {
    const { Fields, DataId, Age, Gender, EditObject } = this.state;
    const { t } = this.props;
    var Tabs = [];
    Tabs.push({
      tabButton: "Үзлэг",
      tabContent: (
        <div style={{ padding: "0" }}>
          {Fields ? (
            <div style={{ margin: "-10px 0 0 0" }}>
              <GroupPanel title={t("Амбулаторийн үзлэгийн мэдээлэл")} level={1}>
                {/* <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("diagnosed_year")}
                /> */}
                <BaseInputMask
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("diagnosed_year")}
                  defaultValue={Helper.ObjectHelper.getDateYMD()}
                  Mask={"9999"}
                  MaskChar={"_"}
                  LabelWidth={40}
                />
                {/* <BaseDate
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("ambulance_date")}
                /> */}
                {/* <BaseInputMask
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("ambulance_date")}
                  Mask={"9999-99-99"}
                  MaskChar={"_"}
                /> */}
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("ambulance_type")}
                  LabelWidth={40}
                />
                <BaseLookUpGridLoad
                  ChangeValue={(value) =>
                    this.ChangeValue("organization_id", value)
                  }
                  Config={this.GetConfigField("organization_id")}
                  WithLabel={true}
                  LabelWidth={40}
                />
                <div
                  id="organizationOther"
                  style={{ display: this.GetOrgOther() }}
                >
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("organization_other")}
                    FullWidth={true}
                    LabelWidth={40}
                  />
                </div>
              </GroupPanel>
              <GroupPanel
                title={t("Үзлэгийн үеийн зовуурь, шинж тэмдэг")}
                level={1}
              >
                {/* <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("ad")}
                /> */}
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("ad_deed")}
                  LabelWidth={40}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("ad_dood")}
                  LabelWidth={40}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("zts")}
                  LabelWidth={40}
                />
                <BaseTextField
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("jin")}
                  LabelWidth={40}
                />
                <BaseRadio
                  ChangeValue={this.ChangeValue}
                  Config={this.GetConfigField("nyha")}
                  Unknown={false}
                  UnknownText={"No"}
                  LabelWidth={40}
                />

                <BaseCheckBox
                  Value={
                    EditObject && EditObject["heartache"]
                      ? EditObject["heartache"]
                      : []
                  }
                  ChangeValue={(name, value) =>
                    this.ChangeValue("heartache", value)
                  }
                  Config={this.GetConfigField("heartache")}
                  LabelWidth={40}
                />
                <BaseTextArea
                  ChangeValue={this.ChangeValue}
                  FullWidth={true}
                  Rows={2}
                  Config={this.GetConfigField("heartache_other")}
                  LabelWidth={40}
                />
                <GroupPanel
                  title={t("Илрэх шинж тэмдэг")}
                  level={2}
                  className={css({ margin: "20px 0 10px 0 !important" })}
                >
                  {/* zah */}
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("hf_zahiin_shinj")}
                    LabelWidth={40}
                  />
                  <Box
                    id="hf_zahiin_shinjChild"
                    sx={{
                      ...sx.childDiv,
                      p: 1,
                      display: this.GetDisplay("hf_zahiin_shinj"),
                    }}
                  >
                    <BaseCheckBox
                      Value={
                        EditObject && EditObject["hf_zahiin_shinj_code"]
                          ? EditObject["hf_zahiin_shinj_code"]
                          : []
                      }
                      ChangeValue={(name, value) =>
                        this.ChangeValue("hf_zahiin_shinj_code", value)
                      }
                      FullWidth={true}
                      Config={this.GetConfigField("hf_zahiin_shinj_code")}
                      LabelWidth={40}
                    />
                  </Box>
                  {/* uushig */}
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("hf_uushig_shinj")}
                    LabelWidth={40}
                  />
                  <Box
                    id="hf_uushig_shinjChild"
                    sx={{
                      ...sx.childDiv,
                      p: 1,
                      display: this.GetDisplay("hf_uushig_shinj"),
                    }}
                  >
                    <BaseCheckBox
                      Value={
                        EditObject && EditObject["hf_uushig_shinj_code"]
                          ? EditObject["hf_uushig_shinj_code"]
                          : []
                      }
                      ChangeValue={(name, value) =>
                        this.ChangeValue("hf_uushig_shinj_code", value)
                      }
                      Config={this.GetConfigField("hf_uushig_shinj_code")}
                      LabelWidth={40}
                    />
                  </Box>
                  {/* zurh */}
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("hf_zurh_shinj")}
                    LabelWidth={40}
                  />
                  <Box
                    id="hf_zurh_shinjChild"
                    sx={{
                      ...sx.childDiv,
                      p: 1,
                      display: this.GetDisplay("hf_zurh_shinj"),
                    }}
                  >
                    <BaseCheckBox
                      Value={
                        EditObject && EditObject["hf_zurh_shinj_code"]
                          ? EditObject["hf_zurh_shinj_code"]
                          : []
                      }
                      ChangeValue={(name, value) =>
                        this.ChangeValue("hf_zurh_shinj_code", value)
                      }
                      Config={this.GetConfigField("hf_zurh_shinj_code")}
                      LabelWidth={40}
                    />
                  </Box>
                  {/* hevlii */}
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("hf_hevliin_shinj")}
                    LabelWidth={40}
                  />
                  <Box
                    id="hf_hevliin_shinjChild"
                    sx={{
                      ...sx.childDiv,
                      p: 1,
                      display: this.GetDisplay("hf_hevliin_shinj"),
                    }}
                  >
                    <BaseCheckBox
                      Value={
                        EditObject && EditObject["hf_hevliin_shinj_code"]
                          ? EditObject["hf_hevliin_shinj_code"]
                          : []
                      }
                      ChangeValue={(name, value) =>
                        this.ChangeValue("hf_hevliin_shinj_code", value)
                      }
                      Config={this.GetConfigField("hf_hevliin_shinj_code")}
                      LabelWidth={40}
                    />
                  </Box>
                </GroupPanel>
              </GroupPanel>
            </div>
          ) : (
            <BaseNoData />
          )}
        </div>
      ),
    });
    Tabs.push({
      tabButton: "Шинжилгээ",
      tabContent: (
        <div style={{ padding: "0" }}>
          <HfAmbulanceTestForm
            ref={this.HfAmbulanceTestForm}
            ObjectName="HfAmbulanceTest"
            AmbulanceId={DataId}
            Age={Age}
            Gender={Gender}
          />
        </div>
      ),
    });
    Tabs.push({
      tabButton: "Эмчилгээ",
      tabContent: (
        <div style={{ padding: "0" }}>
          <HfAmbulanceTreatmentForm
            ref={this.HfAmbulanceTreatmentForm}
            ObjectName="HfAmbulanceTreatment"
            AmbulanceId={DataId}
          />
        </div>
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
          {/* keepMounted: the Шинжилгээ / Эмчилгээ forms are saved through refs,
              so they must stay mounted even while another tab is shown. */}
          <CustomTab
            vertical
            shortVertical
            fillHeight
            keepMounted
            tabs={this.GetTabs()}
          />
        </GridItem>
      </GridContainer>
    );
  };
}

export default withTranslation(undefined, { withRef: true })(HfAmbulanceForm);
