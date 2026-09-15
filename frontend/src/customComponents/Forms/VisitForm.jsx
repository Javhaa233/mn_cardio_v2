import { withTranslation } from "react-i18next";
import React, { createRef } from "react";
// @mui/material components
import Divider from "@mui/material/Divider";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// custom components
import JournalMajorFindings from "customComponents/JournalMajorFindings";
import JournalICD from "customComponents/JournalICD";
import JournalTreatment from "customComponents/JournalTreatment";

import BaseCustomForm from "customComponents/Forms/BaseCustomForm";

import BaseRadio from "customComponents/BaseEditControls/BaseRadio";
import BaseCheckBox from "customComponents/BaseEditControls/BaseCheckBox";
import BaseTextField from "customComponents/BaseEditControls/BaseTextField";
import BaseAutoComplete from "customComponents/BaseEditControls/BaseAutoComplete";
import BaseTextArea from "customComponents/BaseEditControls/BaseTextArea";
import BaseField from "baseComponents/BaseField";
import BaseNoData from "customComponents/BaseNoData";
import BaseInputMask from "customComponents/BaseEditControls/BaseInputMask";
// helper
import Helper from "helper";

class VisitForm extends BaseCustomForm {
  constructor(props) {
    super(props);
    // DataId names the record being edited. Null means "new visit", which was
    // the only mode this form had until saving learned to update in place.
    this.state = { ...this.state, Journals: [], DataId: props.DataId || null };
    this.ChangeObject = true; // Start as true since visit_date is pre-filled
    this.ModifyObject = { visit_date: Helper.ObjectHelper.getDateYMD() };
    // required fields found empty at the last save attempt
    this._invalid = new Set();

    // refs
    this.JournalTreatment = createRef();
  }

  RemoveJournals = (JournalId) => {
    const { Journals } = this.state;
    const JournalsUpdate = Journals.filter(
      (item) =>
        item.JournalRef && item.JournalRef.id_data + "" !== JournalId + "",
      1,
    );
    this.setState({ Journals: JournalsUpdate });
  };

  AddJournals = (Journal) => {
    const { Journals } = this.state;
    if (
      !Journals.some(
        (item) =>
          item.JournalRef && item.JournalRef.id_data === Journal.id_data,
      )
    ) {
      const JournalsUpdate = Object.assign(
        [],
        [...Journals, { id: null, JournalRef: Journal }],
      );
      this.setState({ Journals: JournalsUpdate });
      if (Journal.jr_type + "" === "1") {
        this.JournalTreatment.AddData &&
          this.JournalTreatment.AddData({
            id: null,
            JournalRef: Journal,
            j_label: null,
          });
      }
    } else {
      const { t } = this.props;

      this.setState({
        Alert: Helper.BaseCrudHelper.ShowAlert(
          t("Selected value already exists"),
          false,
          () => this.setState({ Alert: null }),
        ),
      });
    }
  };

  ChangeValue = (Field, Value) => {
    if (Field + "" !== "visit_date") this.ChangeObject = true;
    if (Field === "JournalICD" || Field === "OtherJournal")
      this.AddJournals(Value);
    else {
      this.ModifyObject[Field] = Value;
      this.MarkDirty();
      // A field the doctor has just filled is no longer flagged as missing.
      if (this._invalid && this._invalid.has(Field))
        this._invalid.delete(Field);
      // Update state to trigger re-render for checkboxes
      this.setState((prevState) => ({
        EditObject: {
          ...prevState.EditObject,
          [Field]: Value,
        },
      }));
    }
    process.env.NODE_ENV === "development" &&
      console.log({ ModifyObject: this.ModifyObject });

    // This override replaced the base implementation wholesale and never called
    // either hook, so ChangeValueAfter has been dead on this form - which is
    // what CLAUDE.md §6 relies on for conditional reveal and autocalculation.
    // Calling it costs nothing today (the default body is empty) and stops the
    // next person wiring a hook that silently never fires.
    this.ChangeValueAfter(Field, Value);
  };

  /** current value of a field, whether just edited or loaded from the server */
  ValueOf = (Name) => {
    if (Object.prototype.hasOwnProperty.call(this.ModifyObject, Name)) {
      return this.ModifyObject[Name];
    }
    const { EditObject } = this.state;
    return EditObject ? EditObject[Name] : undefined;
  };

  IsEmpty = (v) =>
    v === undefined ||
    v === null ||
    v === "" ||
    (Array.isArray(v) && v.length === 0);

  /**
   * Required fields that are still empty.
   *
   * Tracker row №97's acceptance line ends "заавал талбарын шалгалт хийгдэнэ".
   * The check reads the same `Required` flag the server already publishes in
   * VisitConfig, so which fields are mandatory stays a database decision.
   */
  MissingRequired = () =>
    (this.state.Fields || [])
      .flat()
      .filter((f) => f && f.Required && this.IsEmpty(this.ValueOf(f.Name)));

  /** true when the save must not proceed; flags the offending fields first */
  BlockOnMissingRequired = () => {
    const { t } = this.props;
    const missing = this.MissingRequired();
    if (missing.length === 0) {
      if (this._invalid && this._invalid.size) this._invalid = new Set();
      return false;
    }

    this._invalid = new Set(missing.map((f) => f.Name));
    const names = missing
      .slice(0, 3)
      .map((f) => t(f.Label))
      .join(", ");
    this.setState({
      Alert: Helper.BaseCrudHelper.ShowAlert(
        t("Заавал бөглөх талбар бөглөгдөөгүй байна") +
          " (" +
          missing.length +
          "): " +
          names +
          (missing.length > 3 ? "…" : ""),
        false,
        () => this.setState({ Alert: null }),
      ),
    });
    return true;
  };

  GetFormConfig = async () => {
    const { PatientId } = this.props;
    this.setState({ isLoading: true });
    await Helper.BaseCrudHelper.CallService(
      "/Visit/GetCustomFormData",
      { PatientId },
      (resData) => {
        resData &&
          resData.Data &&
          this.setState({
            Config: { Fields: resData.Data.Fields },
            Fields: resData.Data.Fields,
            Journals: resData.Data.Journals,
            isLoading: false,
          });
      },
    );
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

  Print = async (callback) => {
    const { PatientId } = this.props;
    let alert = null;

    // Print the record on screen when there is one.
    //
    // This used to ask GetLastVisitId for the patient's most RECENT visit and
    // print that, whatever was open. Editing an older examination and pressing
    // print therefore handed the doctor a different visit's sheet. The lookup
    // stays as the fallback for a form that has not been saved yet.
    const OpenId = this.state.DataId;
    if (OpenId) {
      await Helper.BaseCrudHelper.BasePrintReport(
        {
          Url: "/Visit/PrintReport",
          Data: { Id: OpenId },
          FileName: "Visit.pdf",
        },
        (Success) => {
          const { t } = this.props;
          alert = Helper.BaseCrudHelper.ShowAlert(
            Success ? t("Successfully printed") : t("Error"),
            Success,
            () => {
              this.setState({ Alert: null });
              callback && callback();
            },
          );
          this.setState({ Alert: alert });
        },
      );
      return;
    }

    if (PatientId) {
      await Helper.BaseCrudHelper.CallService(
        "/Visit/GetLastVisitId",
        { PatientId },
        async (resData) => {
          if (
            resData &&
            resData.Success &&
            resData.Data &&
            resData.Data.DataId
          ) {
            const DataId = resData.Data.DataId;
            await Helper.BaseCrudHelper.BasePrintReport(
              {
                Url: "/Visit/PrintReport",
                Data: { Id: DataId },
                FileName: "Visit.pdf",
              },
              (Success) => {
                const { t } = this.props;
                alert = Helper.BaseCrudHelper.ShowAlert(
                  Success ? t("Successfully printed") : t("Error"),
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
            const { t } = this.props;
            alert = Helper.BaseCrudHelper.ShowAlert(
              t("No visit found to print"),
              false,
              () => {
                this.setState({ Alert: null });
                callback && callback();
              },
            );
            this.setState({ Alert: alert });
          }
        },
      );
    } else {
      const { t } = this.props;
      alert = Helper.BaseCrudHelper.ShowAlert(
        t("Patient information is missing"),
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
    const { PatientId, PatRegNo } = this.props;
    const { Journals } = this.state;

    let alert = null;

    if (this.BlockOnMissingRequired()) {
      callback && callback(false);
      return;
    }

    if (this.ChangeObject === true) {
      this.ModifyObject["Journals"] = Journals.filter(
        (s) => s.JournalRef && s.JournalRef.jr_type !== "1",
      );
      var JournalTreatments = this.JournalTreatment.GetValue();
      this.ModifyObject["Journals"] = [
        ...this.ModifyObject["Journals"],
        ...JournalTreatments,
      ];
      await Helper.BaseCrudHelper.CallService(
        "/Visit/CustomSave",
        {
          PatientId,
          PatRegNo,
          // Naming an existing record makes the save an edit instead of an
          // insert. Without it every save wrote a NEW Visit row, so reopening
          // an examination and correcting a typo left two records behind.
          // The server verifies the id belongs to this patient before using it.
          Id: this.state.DataId || this.props.DataId || null,
          Data: JSON.stringify({
            ...this.ModifyObject,
            PatientId,
            PatRegNo,
            Files: null,
          }),
        },
        (resData) => {
          if (resData) {
            // Remember the record just written, so a second Save in the same
            // sitting edits it rather than inserting another one.
            if (resData.Success && resData.Data && resData.Data.DataId) {
              this.setState({ DataId: resData.Data.DataId });
            }
            if (resData.Success && this.ModifyObject["Files"]) {
              if (resData.Data) {
                this.uploadFile(resData.Data.DataId, callback);
              } else {
                callback && callback(false);
              }
            } else {
              if (resData.Message) {
                alert = Helper.BaseCrudHelper.ShowAlert(
                  resData.Message,
                  resData.Success,
                  () => {
                    this.setState({ Alert: null });
                  },
                );
                this.setState({ Alert: alert });
              }
              callback && callback(resData.Success);
            }
          } else {
            callback && callback(false);
          }
        },
      );
    } else {
      const { t } = this.props;
      alert = Helper.BaseCrudHelper.ShowAlert(
        t("Information is missing"),
        false,
        () => {
          this.setState({ Alert: null });
        },
      );
      this.setState({ Alert: alert });
      callback && callback(false);
    }
  };

  CustomRender = () => {
    const { t } = this.props;
    const { Journals, Fields, EditObject } = this.state;
    const FileConfig = this.GetConfigField("Files");
    return (
      <GridContainer style={{ margin: "0", width: "100%" }}>
        <GridItem xs={12} md={12}>
          {Fields ? (
            <GridContainer>
              {/* Visit Date */}
              {this.GetConfigField("visit_date") && (
                <GridItem xs={12} md={12}>
                  <BaseInputMask
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("visit_date")}
                    Mask={"9999-99-99"}
                    MaskChar={"_"}
                    defaultValue={Helper.ObjectHelper.getDateYMD()}
                    md={4}
                  />
                </GridItem>
              )}

              {/* Exam Types and Disease */}
              {this.GetConfigField("type_exam1") && (
                <GridItem xs={12} md={12}>
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("type_exam1")}
                    md={4}
                  />
                </GridItem>
              )}
              {this.GetConfigField("type_exam2") && (
                <GridItem xs={12} md={12}>
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("type_exam2")}
                    md={4}
                  />
                </GridItem>
              )}
              {this.GetConfigField("disease") && (
                <GridItem xs={12} md={12}>
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("disease")}
                    md={4}
                  />
                </GridItem>
              )}

              {/* Referred by and Chief Complaint */}
              {this.GetConfigField("referred_by_13a") && (
                <GridItem xs={12} md={12}>
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("referred_by_13a")}
                    md={4}
                  />
                </GridItem>
              )}
              {this.GetConfigField("chief_complaint") && (
                <GridItem xs={12} md={12}>
                  <BaseCheckBox
                    Value={
                      EditObject && EditObject["chief_complaint"]
                        ? EditObject["chief_complaint"]
                        : []
                    }
                    ChangeValue={(name, value) =>
                      this.ChangeValue("chief_complaint", value)
                    }
                    Config={this.GetConfigField("chief_complaint")}
                    boxMd={6}
                    Compact={false}
                    md={4}
                  />
                </GridItem>
              )}

              {/* Other Chief Complaint */}
              {this.GetConfigField("other_chief_complaint") && (
                <GridItem xs={12} md={12}>
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("other_chief_complaint")}
                    FullWidth={true}
                    md={4}
                  />
                </GridItem>
              )}

              {/* Notes */}
              {this.GetConfigField("Notes") && (
                <GridItem xs={12} md={12}>
                  <BaseTextArea
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("Notes")}
                    FullWidth={true}
                    md={4}
                    Rows={2}
                  />
                </GridItem>
              )}

              {/* Vital Signs - Vertical Order */}
              {this.GetConfigField("s_bp") && (
                <GridItem xs={12} md={12}>
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("s_bp")}
                    FullWidth={true}
                    md={4}
                  />
                </GridItem>
              )}
              {this.GetConfigField("d_bp") && (
                <GridItem xs={12} md={12}>
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("d_bp")}
                    FullWidth={true}
                    md={4}
                  />
                </GridItem>
              )}
              {this.GetConfigField("pe_vs_heart") && (
                <GridItem xs={12} md={12}>
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("pe_vs_heart")}
                    FullWidth={true}
                    md={4}
                  />
                </GridItem>
              )}

              {/* Additional Fields - Vertical Order */}
              {this.GetConfigField("paralysis") && (
                <GridItem xs={12} md={12}>
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("paralysis")}
                    md={4}
                  />
                </GridItem>
              )}
              {this.GetConfigField("inr") && (
                <GridItem xs={12} md={12}>
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("inr")}
                    FullWidth={true}
                    md={4}
                  />
                </GridItem>
              )}
              {this.GetConfigField("weight") && (
                <GridItem xs={12} md={12}>
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("weight")}
                    FullWidth={true}
                    md={4}
                  />
                </GridItem>
              )}

              {/* Main Diagnosis */}
              {this.GetConfigField("main_diagnosis") && (
                <GridItem xs={12} md={12}>
                  <BaseAutoComplete
                    Config={this.GetConfigField("main_diagnosis")}
                    FullWidth={true}
                    ChangeValue={this.ChangeValue}
                    ObjectValue={true}
                    ObjectSetValue={true}
                    md={4}
                  />
                </GridItem>
              )}

              {/* Main Diagnosis Notes */}
              {this.GetConfigField("main_diagnosis_notes") && (
                <GridItem xs={12} md={12}>
                  <BaseTextArea
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("main_diagnosis_notes")}
                    FullWidth={true}
                    md={4}
                    Rows={2}
                  />
                </GridItem>
              )}

              {/* ---------------------------------------------------------
                  Form АМ-1Б (А/611, appendix 11) — tender item 4.1.
                  The register's columns that the examination form had no way
                  to capture. Declaring them in VisitConfig is not enough:
                  CustomRender is hand-written, so a field with no JSX here
                  renders nowhere at all.
                  --------------------------------------------------------- */}
              {this.GetConfigField("exam_type_icd") && (
                <GridItem xs={12} md={12}>
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("exam_type_icd")}
                    FullWidth={true}
                    md={4}
                  />
                </GridItem>
              )}

              {this.GetConfigField("cause_icd10") && (
                <GridItem xs={12} md={12}>
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("cause_icd10")}
                    FullWidth={true}
                    md={4}
                  />
                </GridItem>
              )}

              {this.GetConfigField("procedure_icd9") && (
                <GridItem xs={12} md={12}>
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("procedure_icd9")}
                    FullWidth={true}
                    md={4}
                  />
                </GridItem>
              )}

              {this.GetConfigField("has_complication") && (
                <GridItem xs={12} md={12}>
                  <BaseRadio
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("has_complication")}
                    md={4}
                  />
                </GridItem>
              )}

              {this.GetConfigField("incapacity_days") && (
                <GridItem xs={12} md={12}>
                  <BaseTextField
                    ChangeValue={this.ChangeValue}
                    Config={this.GetConfigField("incapacity_days")}
                    Type="number"
                    FullWidth={true}
                    md={4}
                  />
                </GridItem>
              )}

              {/* Journal Selectors */}
              {this.GetConfigField("JournalICD") && (
                <GridItem xs={12} md={12}>
                  <BaseAutoComplete
                    Config={this.GetConfigField("JournalICD")}
                    FullWidth={true}
                    ObjectValue={true}
                    ChangeValue={this.ChangeValue}
                    CustomFilter={{ Type: "ICD" }}
                    md={4}
                  />
                </GridItem>
              )}
              {this.GetConfigField("OtherJournal") && (
                <GridItem xs={12} md={12}>
                  <BaseAutoComplete
                    Config={this.GetConfigField("OtherJournal")}
                    FullWidth={true}
                    ObjectValue={true}
                    ChangeValue={this.ChangeValue}
                    CustomFilter={{ Type: "OtherJournal" }}
                    md={4}
                  />
                </GridItem>
              )}

              <GridItem xs={12} md={12}>
                <JournalICD
                  Label={t("ICD10")}
                  Data={
                    Array.isArray(Journals)
                      ? Journals.filter(
                          (s) =>
                            s.JournalRef && s.JournalRef.jr_type + "" === "5",
                        )
                      : []
                  }
                  Remove={(JournalId) => this.RemoveJournals(JournalId)}
                  md={4}
                />
              </GridItem>

              <GridItem xs={12} md={12}>
                <JournalTreatment
                  ref={(ref) => (this.JournalTreatment = ref)}
                  Label={t("Treatment")}
                  Data={
                    Array.isArray(Journals)
                      ? Journals.filter(
                          (s) =>
                            s.JournalRef && s.JournalRef.jr_type + "" === "1",
                        )
                      : []
                  }
                  Remove={(JournalId) => this.RemoveJournals(JournalId)}
                  FullWidth={true}
                  md={4}
                />
              </GridItem>

              <GridItem xs={12} md={12}>
                <JournalMajorFindings
                  Label={t("Major findings")}
                  Data={
                    Array.isArray(Journals)
                      ? Journals.filter(
                          (s) =>
                            s.JournalRef && s.JournalRef.jr_type + "" === "4",
                        )
                      : []
                  }
                  Remove={(JournalId) => this.RemoveJournals(JournalId)}
                  md={4}
                />
              </GridItem>

              <GridItem xs={12} md={12}>
                <JournalMajorFindings
                  Label={t("Procedures")}
                  Data={
                    Array.isArray(Journals)
                      ? Journals.filter(
                          (s) =>
                            s.JournalRef && s.JournalRef.jr_type + "" === "2",
                        )
                      : []
                  }
                  Remove={(JournalId) => this.RemoveJournals(JournalId)}
                  md={4}
                />
              </GridItem>

              <GridItem xs={12} md={12}>
                <JournalMajorFindings
                  Label={t("Referral")}
                  Data={
                    Array.isArray(Journals)
                      ? Journals.filter(
                          (s) =>
                            s.JournalRef && s.JournalRef.jr_type + "" === "3",
                        )
                      : []
                  }
                  Remove={(JournalId) => this.RemoveJournals(JournalId)}
                  md={4}
                />
              </GridItem>

              {/* Files Section */}
              {FileConfig && (
                <GridItem xs={12} md={12}>
                  <BaseField
                    WithLabel={true}
                    Config={{ ...FileConfig }}
                    Value={
                      FileConfig && FileConfig.Value ? FileConfig.Value : []
                    }
                    ChangeValue={this.ChangeValue}
                    md={4}
                  />
                </GridItem>
              )}
            </GridContainer>
          ) : (
            <BaseNoData />
          )}
        </GridItem>
      </GridContainer>
    );
  };
}

export default withTranslation(undefined, { withRef: true })(VisitForm);
