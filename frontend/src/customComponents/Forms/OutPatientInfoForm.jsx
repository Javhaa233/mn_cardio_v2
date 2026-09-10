import { useTranslation } from "react-i18next";
import React from "react";
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import BaseAutoComplete from "customComponents/BaseEditControls/BaseAutoComplete";
import BaseCustomForm from "customComponents/Forms/BaseCustomForm";
import BaseRichText from "customComponents/BaseEditControls/BaseRichText";
import BaseCheckBox from "customComponents/BaseEditControls/BaseCheckBox";
import Helper from "helper";
import { call } from "config/Server";
import { getFieldWithValue } from "baseComponents/formHelpers";

class OutPatientInfoForm extends BaseCustomForm {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      DiagnosisConfig: null,
      UuhEmSelectConfig: null,
      // Editable admission/discharge dates for the printout. Prefilled from the
      // Stay record; sent to the print endpoints as overrides and saved back to
      // the Stay record on Save. Orig* hold the loaded values to detect edits.
      AdmissionDate: "",
      DischargeDate: "",
      OrigAdmissionDate: "",
      OrigDischargeDate: "",
    };
  }

  GetConfigField = (FieldName) => {
    const { EditObject, Fields } = this.state;
    const field = getFieldWithValue(FieldName, Fields, EditObject);

    if (FieldName === "LifeAdviceSelect" && field && field.Data) {
      field.Data = field.Data.filter(
        (item) => item.Label !== "No135 тоотод үзүүлэх",
      );
    }

    if (FieldName === "organization_id" && field) {
      field.DataFilter = [];
    }

    return field;
  };

  GetData = async () => {
    const { StayId } = this.props;
    const { ObjectName } = this.state;

    if (StayId) {
      this.GetStayDates(StayId);
      var SearchOption = Helper.BaseCrudHelper.GetSearchOption();
      SearchOption.SearchField = [
        { Field: "StayId", Op: "Equals", Value: StayId },
      ];
      await Helper.BaseCrudHelper.BaseGetDetail(
        { ObjectName, SearchOption },
        (resData) =>
          resData &&
          this.setState({
            EditObject: Object.assign({}, resData.Data),
            isLoading: false,
          }),
      );
    } else {
      this.setState({ isLoading: false });
    }
  };

  // Prefill the editable date inputs from the Stay record.
  GetStayDates = async (StayId) => {
    var SearchOption = Helper.BaseCrudHelper.GetSearchOption();
    SearchOption.SearchField = [
      { Field: "id_data", Value: StayId, Op: "Equals" },
    ];
    await Helper.BaseCrudHelper.BaseGetDetailInfo(
      { ObjectName: "Stay", SearchOption },
      (resData) => {
        const stay = resData && resData.Data;
        if (stay) {
          const admission = stay.date_admission
            ? stay.date_admission.split("T")[0]
            : "";
          const discharge = stay.date_discharge
            ? stay.date_discharge.split("T")[0]
            : "";
          this.setState({
            AdmissionDate: admission,
            DischargeDate: discharge,
            OrigAdmissionDate: admission,
            OrigDischargeDate: discharge,
          });
        }
      },
    );
  };

  // Date overrides to send to the print endpoints (omitted when left blank).
  GetDateOverrides = () => {
    const { AdmissionDate, DischargeDate } = this.state;
    const overrides = {};
    if (AdmissionDate) overrides.DateAdmission = AdmissionDate;
    if (DischargeDate) overrides.DateDischarge = DischargeDate;
    return overrides;
  };

  // True when the doctor edited either date away from the loaded value.
  HasDateChanges = () => {
    const {
      AdmissionDate,
      DischargeDate,
      OrigAdmissionDate,
      OrigDischargeDate,
    } = this.state;
    return (
      (AdmissionDate || "") !== (OrigAdmissionDate || "") ||
      (DischargeDate || "") !== (OrigDischargeDate || "")
    );
  };

  // Persist edited admission/discharge dates to the Stay record. Sends only
  // valid (YYYY-MM-DD) values that actually changed. Returns true on success.
  SaveStayDates = async () => {
    const { StayId } = this.props;
    const {
      AdmissionDate,
      DischargeDate,
      OrigAdmissionDate,
      OrigDischargeDate,
    } = this.state;
    if (!StayId) return false;

    const dateRe = /^\d{4}-\d{2}-\d{2}$/;
    const payload = { StayId };
    if (dateRe.test(AdmissionDate) && AdmissionDate !== OrigAdmissionDate)
      payload.DateAdmission = AdmissionDate;
    if (dateRe.test(DischargeDate) && DischargeDate !== OrigDischargeDate)
      payload.DateDischarge = DischargeDate;

    if (!payload.DateAdmission && !payload.DateDischarge) return true;

    try {
      const res = await call({
        url: "/OutPatientInfo/UpdateStayDates",
        method: "POST",
        data: payload,
      });
      if (res?.Success) {
        this.setState({
          OrigAdmissionDate: payload.DateAdmission || OrigAdmissionDate,
          OrigDischargeDate: payload.DateDischarge || OrigDischargeDate,
        });
        return true;
      }
      return false;
    } catch (e) {
      console.error("Failed to save Stay dates:", e);
      return false;
    }
  };

  ChangeValue = (Field, Value) => {
    // 1. Keep the base logic (updating ModifyObject for saving)
    this.ModifyObject[Field] = Value;
    this.MarkDirty();

    // 2. Update the state to trigger a re-render
    // We update EditObject so that GetConfigField() picks up the new value
    this.setState(
      (prevState) => ({
        EditObject: {
          ...prevState.EditObject,
          [Field]: Value,
        },
      }),
      () => {
        // Callback after setState completes
      },
    );
  };

  // Logic for updating the RichText when Checkboxes change (Special Case)
  HandleUuhEmChange = (Field, Value) => {
    this.ModifyObject[Field] = Value;
    this.MarkDirty();

    const prevSelection = this.state.EditObject?.[Field] || [];
    const newSelection = Value || [];

    const config = this.GetConfigField("UuhEmSelect");
    let currentRichText = this.state.EditObject?.UuhEm || "";

    if (config?.Data) {
      // Find added items
      const addedValues = newSelection.filter(
        (v) => !prevSelection.includes(v),
      );
      // Find removed items
      const removedValues = prevSelection.filter(
        (v) => !newSelection.includes(v),
      );

      // Append added
      addedValues.forEach((val) => {
        const emData = config.Data.find((s) => s.Value + "" === val + "");
        if (emData) currentRichText += "<p>" + emData.Label + "</p>";
      });

      // Remove removed (only if exact match exists)
      removedValues.forEach((val) => {
        const emData = config.Data.find((s) => s.Value + "" === val + "");
        if (emData) {
          const label = emData.Label;
          // Simple replace for exact match of the auto-generated tag
          currentRichText = currentRichText.replace("<p>" + label + "</p>", "");
        }
      });
    }

    this.ModifyObject["UuhEm"] = currentRichText;

    const currentRichTextConfig =
      this.state.UuhEmSelectConfig || this.GetConfigField("UuhEm");

    this.setState((prevState) => ({
      EditObject: {
        ...prevState.EditObject,
        [Field]: Value,
        UuhEm: currentRichText,
      },
      UuhEmSelectConfig: { ...currentRichTextConfig, Value: currentRichText },
    }));
  };

  SelectDiagnosis = (value) => {
    const tempConfig =
      this.state.DiagnosisConfig || this.GetConfigField("Diagnosis");
    let tempValue = this.state.EditObject?.Diagnosis || "";
    const JournalMonName = value.JournalRefTranslation?.Mon || null;
    const JournalText = JournalMonName
      ? value.jr_label.split(" ")[0] + " " + JournalMonName
      : value.jr_label;

    tempValue += "<p>" + JournalText + "</p>";

    this.ModifyObject["Diagnosis"] = tempValue; // Sync for Save

    this.setState({
      DiagnosisConfig: { ...tempConfig, Value: tempValue },
      // Also update EditObject so other components know the diagnosis changed
      EditObject: { ...this.state.EditObject, Diagnosis: tempValue },
    });
  };

  SaveAndConfirm = (resData, callback) => {
    const confirmAlert = Helper.BaseCrudHelper.ShowConfirm(
      "Хэвлэх үү?",
      () => {
        this.setState({ Alert: null });
        this.Print(() => callback && callback());
      },
      () => {
        this.setState({ Alert: null });
        callback && callback();
      },
    );
    this.setState({ Alert: confirmAlert });
  };

  Print = async (callback) => {
    const { EditObject } = this.state;
    const { StayId, PatientId, patientRegister } = this.props;
    let alert = null;

    // If there's already a saved record, print directly
    if (EditObject && EditObject.Id) {
      await Helper.BaseCrudHelper.BasePrintReport(
        {
          Url: "/OutPatientInfo/PrintReport",
          Data: { Id: EditObject.Id, ...this.GetDateOverrides() },
          FileName: "OutPatientInfo.pdf",
        },
        (Success) => {
          alert = Helper.BaseCrudHelper.ShowAlert(
            Success ? "Successfully printed" : "Error",
            Success,
            () => {
              this.setState({ Alert: null });
              callback && callback();
            },
          );
          this.setState({ Alert: alert });
        },
      );
    } else if (StayId && Object.keys(this.ModifyObject).length > 0) {
      // Auto-save first if there are unsaved changes
      const isNew = !EditObject || !EditObject.Id;
      const serviceCall = isNew
        ? Helper.BaseCrudHelper.BaseCreate
        : Helper.BaseCrudHelper.BaseUpdate;

      const payload = {
        ObjectName: "OutPatientInfo",
        Data: isNew
          ? { ...this.ModifyObject, StayId, PatientId, patientRegister }
          : { ...this.ModifyObject, Id: EditObject.Id },
      };

      await serviceCall(payload, async (resData) => {
        if (resData && resData.Success && resData.Data && resData.Data.DataId) {
          // After successful save, print the newly created record
          const DataId = resData.Data.DataId;
          this.setState({
            EditObject: { ...this.state.EditObject, Id: DataId },
          });

          await Helper.BaseCrudHelper.BasePrintReport(
            {
              Url: "/OutPatientInfo/PrintReport",
              Data: { Id: DataId, ...this.GetDateOverrides() },
              FileName: "OutPatientInfo.pdf",
            },
            (Success) => {
              alert = Helper.BaseCrudHelper.ShowAlert(
                Success ? "Successfully printed" : "Error",
                Success,
                () => {
                  this.setState({ Alert: null });
                  callback && callback();
                },
              );
              this.setState({ Alert: alert });
            },
          );
        } else {
          // Save failed
          alert = Helper.BaseCrudHelper.ShowAlert(
            resData?.Message || "Failed to save outpatient info",
            false,
            () => {
              this.setState({ Alert: null });
              callback && callback();
            },
          );
          this.setState({ Alert: alert });
        }
      });
    } else if (StayId) {
      // Use PrintByStayId endpoint - it will auto-create OutPatientInfo if needed
      await Helper.BaseCrudHelper.BasePrintReport(
        {
          Url: "/OutPatientInfo/PrintByStayId",
          Data: { StayId, ...this.GetDateOverrides() },
          FileName: "OutPatientInfo.pdf",
        },
        (Success) => {
          alert = Helper.BaseCrudHelper.ShowAlert(
            Success ? "Successfully printed" : "Error",
            Success,
            () => {
              this.setState({ Alert: null });
              callback && callback();
            },
          );
          this.setState({ Alert: alert });
        },
      );
    } else {
      alert = Helper.BaseCrudHelper.ShowAlert(
        "Information is missing",
        false,
        () => {
          this.setState({ Alert: null });
          callback && callback();
        },
      );
      this.setState({ Alert: alert });
    }
  };

  Save = async (callback) => {
    const { EditObject } = this.state;
    const { StayId, PatientId, patientRegister } = this.props;

    const hasFormChanges = StayId && Object.keys(this.ModifyObject).length > 0;
    const hasDateChanges = this.HasDateChanges();

    if (!StayId || (!hasFormChanges && !hasDateChanges)) {
      const alert = Helper.BaseCrudHelper.ShowAlert(
        "Хадгалах мэдээлэл олдсонгүй",
        false,
        () => this.setState({ Alert: null }),
      );
      this.setState({ Alert: alert });
      callback?.({});
      return;
    }

    // Persist edited admission/discharge dates to the Stay record first.
    let datesSaved = true;
    if (hasDateChanges) {
      datesSaved = await this.SaveStayDates();
    }

    if (hasFormChanges) {
      const isNew = !EditObject || !EditObject.Id;
      const serviceCall = isNew
        ? Helper.BaseCrudHelper.BaseCreate
        : Helper.BaseCrudHelper.BaseUpdate;

      const payload = {
        ObjectName: "OutPatientInfo",
        Data: isNew
          ? { ...this.ModifyObject, StayId, PatientId, patientRegister }
          : { ...this.ModifyObject, Id: EditObject.Id },
      };

      await serviceCall(payload, (resData) => {
        if (resData) {
          const alert = Helper.BaseCrudHelper.ShowAlert(
            resData.Message,
            resData.Success,
            () => {
              this.setState({
                Alert: null,
                EditObject: resData.Data
                  ? { ...this.state.EditObject, Id: resData.Data.DataId }
                  : this.state.EditObject,
              });
              this.SaveAndConfirm(resData, callback);
            },
          );
          this.setState({ Alert: alert });
        }
      });
    } else {
      // Only the dates changed — already saved above. Report the real result.
      const alert = Helper.BaseCrudHelper.ShowAlert(
        datesSaved ? "Амжилттай хадгаллаа" : "Огноо хадгалахад алдаа гарлаа",
        datesSaved,
        () => {
          this.setState({ Alert: null });
          if (datesSaved) this.SaveAndConfirm({ Success: true }, callback);
          else callback?.({});
        },
      );
      this.setState({ Alert: alert });
    }
  };

  CustomRender = () => {
    const { t } = this.props;
    const { DiagnosisConfig, UuhEmSelectConfig } = this.state;
    const labelStyle = {
      display: "flex",
      alignItems: "center",
      fontWeight: "500",
      paddingRight: "10px",
    };

    return (
      <div>
        <GridContainer style={{ margin: "0", width: "100%" }}>
          <GridItem xs={12} style={{ margin: "10px" }}>
            {/* Editable admission / discharge dates for the printout */}
            <GridContainer>
              <GridItem xs={12} sm={2} style={labelStyle}>
                Хэвтсэн / гарсан огноо
              </GridItem>
              <GridItem
                xs={12}
                sm={10}
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <input
                  type="date"
                  value={this.state.AdmissionDate || ""}
                  onChange={(e) =>
                    this.setState({ AdmissionDate: e.target.value })
                  }
                  style={{
                    padding: "6px 8px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                />
                <span>—</span>
                <input
                  type="date"
                  value={this.state.DischargeDate || ""}
                  onChange={(e) =>
                    this.setState({ DischargeDate: e.target.value })
                  }
                  style={{
                    padding: "6px 8px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                />
              </GridItem>
            </GridContainer>

            <GridContainer>
              <GridItem xs={12}>
                <div
                  style={{
                    height: "1px",
                    backgroundColor: "#eee",
                    margin: "10px 0",
                  }}
                />
              </GridItem>
            </GridContainer>

            {/* Diagnosis Selection */}
            <GridContainer>
              <GridItem xs={12} sm={2} style={labelStyle}>
                Онош сонгох
              </GridItem>
              <GridItem xs={12} sm={10}>
                <BaseAutoComplete
                  Config={{
                    Name: "JournalICD",
                    Config: {
                      IdField: "id_data",
                      TextField: "jr_label",
                      MinTextLength: 1,
                      SearchUrl: "/CustomDataApi/GetJournalRefData",
                    },
                  }}
                  FullWidth
                  ObjectValue
                  ObjectSetValue
                  ChangeValue={(name, value) => this.SelectDiagnosis(value)}
                  CustomFilter={{ Type: "ICD" }}
                  HideLabel
                />
              </GridItem>
            </GridContainer>

            <GridContainer>
              <GridItem xs={12}>
                <div
                  style={{
                    height: "1px",
                    backgroundColor: "#eee",
                    margin: "10px 0",
                  }}
                />
              </GridItem>
            </GridContainer>

            {/* RichText Areas */}
            {[
              {
                label: "Онош",
                config: DiagnosisConfig || this.GetConfigField("Diagnosis"),
              },
              { label: "Шинжилгээ", field: "HiigdsenShinjilgee" },
              { label: "Эмчилгээ", field: "HiigdsenEmchilgee" },
            ].map((item, idx) => (
              <GridContainer key={idx}>
                <GridItem xs={12} sm={2} style={labelStyle}>
                  {item.label}
                </GridItem>
                <GridItem xs={12} sm={10}>
                  <BaseRichText
                    ChangeValue={this.ChangeValue}
                    Config={
                      item.field
                        ? { ...this.GetConfigField(item.field), Label: "" }
                        : { ...item.config, Label: "" }
                    }
                  />
                </GridItem>
              </GridContainer>
            ))}

            {/* -------------------- FIXED CHECKBOXES -------------------- */}
            {[
              {
                label: "Зөвлөгөө",
                field: "LifeAdviceSelect",
                otherField: "LifeAdviceOther",
                otherLabel: "Бусад зөвлөгөө",
              },
              {
                label: "Хяналт",
                field: "MonitoringSelect",
                otherField: "MonitoringOther",
                otherLabel: "Бусад хяналт",
              },
            ].map((item, idx) => {
              // 1. SAFELY GET CURRENT VALUE FROM STATE
              const currentValue =
                this.state.EditObject && this.state.EditObject[item.field]
                  ? this.state.EditObject[item.field]
                  : [];

              return (
                <React.Fragment key={idx}>
                  <GridContainer>
                    <GridItem xs={12} sm={2} style={labelStyle}>
                      {item.label}
                    </GridItem>
                    <GridItem xs={12} sm={10}>
                      <BaseCheckBox
                        Value={currentValue}
                        ChangeValue={(name, value) => {
                          this.ChangeValue(item.field, value);
                        }}
                        Config={this.GetConfigField(item.field)}
                        HideLabel
                      />
                    </GridItem>
                  </GridContainer>

                  <GridContainer>
                    <GridItem xs={12} sm={2} style={labelStyle}>
                      {item.otherLabel}
                    </GridItem>
                    <GridItem xs={12} sm={10}>
                      <BaseRichText
                        ChangeValue={this.ChangeValue}
                        Config={{
                          ...this.GetConfigField(item.otherField),
                          Label: "",
                        }}
                        FullWidth
                      />
                    </GridItem>
                  </GridContainer>

                  {idx === 0 && (
                    <GridContainer>
                      <GridItem xs={12}>
                        <div
                          style={{
                            height: "1px",
                            backgroundColor: "#eee",
                            margin: "10px 0",
                          }}
                        />
                      </GridItem>
                    </GridContainer>
                  )}
                </React.Fragment>
              );
            })}

            {/* -------------------- FIXED MEDICATION (UuhEmSelect) -------------------- */}
            {this.GetConfigField("UuhEmSelect") &&
              (() => {
                return (
                  <GridContainer>
                    <GridItem xs={12} sm={2} style={labelStyle}>
                      Эм
                    </GridItem>
                    <GridItem xs={12} sm={10}>
                      <BaseCheckBox
                        // 1. PASS VALUE
                        Value={
                          this.state.EditObject &&
                          this.state.EditObject["UuhEmSelect"]
                            ? this.state.EditObject["UuhEmSelect"]
                            : []
                        }
                        // 2. FORCE NAME (Use your custom handler)
                        ChangeValue={(name, value) => {
                          this.HandleUuhEmChange("UuhEmSelect", value);
                        }}
                        Config={this.GetConfigField("UuhEmSelect")}
                        HideLabel
                      />
                    </GridItem>
                  </GridContainer>
                );
              })()}

            <div style={{ margin: "10px 1px", fontWeight: "600" }}>
              ДЭЭРХ ЭМҮҮДИЙГ ЭМНЭЛГЭЭС ГАРСАН ӨДРӨӨС УУЖ ЭХЭЛНЭ ҮҮ!
            </div>

            <GridContainer>
              <GridItem xs={12} sm={2} style={labelStyle}>
                Эмийн жагсаалт
              </GridItem>
              <GridItem xs={12} sm={10}>
                <BaseRichText
                  FullWidth
                  ChangeValue={this.ChangeValue}
                  Config={{
                    ...(UuhEmSelectConfig || this.GetConfigField("UuhEm")),
                    Label: "",
                  }}
                />
              </GridItem>
            </GridContainer>
          </GridItem>
        </GridContainer>
      </div>
    );
  };
}

export default OutPatientInfoForm;
