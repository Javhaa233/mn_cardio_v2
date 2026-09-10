import React from "react";
import i18n from "i18n";

// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import Button from "components/CustomButtons/Button";
import Box from "@mui/material/Box";

// custom components
import BaseCustomForm from "customComponents/Forms/BaseCustomForm";
import BaseLoading from "customComponents/BaseLoading";
import BaseNoData from "customComponents/BaseNoData";
import GroupPanel from "customComponents/GroupPanel";
import BaseRadio from "customComponents/BaseEditControls/BaseRadio";
import BaseCheckBox from "customComponents/BaseEditControls/BaseCheckBox";
import BaseTextField from "customComponents/BaseEditControls/BaseTextField";
import BaseTextArea from "customComponents/BaseEditControls/BaseTextArea";
import BaseSimpleDate from "customComponents/BaseEditControls/BaseSimpleDate";
import BaseTableGrid from "customComponents/BaseEditControls/BaseTableGrid";

// theme
import { colors } from "@/theme/colors";

// helper
import Helper from "helper";
import { getFieldWithValue } from "baseComponents/formHelpers";

/**
 * Identity fields that can be filled from the patient record and the signed-in
 * doctor instead of being typed. Keyed by field code, because the codes differ
 * between the surgery appendices and the Mongolian-authored forms.
 *
 * Coded fields are deliberately absent. Sex, for instance, is a `p_gender`
 * foreign key on the patient and a free-text or option field on the forms;
 * guessing the mapping would write a wrong clinical value, which is worse than
 * typing it. Only unambiguous text and dates are filled.
 */
const PREFILL = {
  PatientSurname: (p) => p && p.p_lastname,
  PatientFirstname: (p) => p && p.p_firstname,
  SocialSecurityNumber: (p) => p && p.p_registration,
  DateOfBirth: (p) => p && p.p_birthday,
  EmchlvvlegchiinTursunOgnooSarJil: (p) => p && p.p_birthday,
  DoctorInCharge: (p, d) => d,
  MesZaslynEmch: (p, d) => d,
};

/**
 * The tender marks BMI and BSA "/Autocalculator/" on every surgery form. The
 * height and weight codes differ between the surgery appendices (1.5-1.9) and
 * the atrial fibrillation registry (2.2), so the mapping is keyed by field code
 * rather than by form — a form that has none of these codes simply never
 * matches.
 *
 * BSA uses Mosteller, sqrt(cm * kg / 3600). The tender requires the value to be
 * calculated but names no formula; Mosteller is the usual one in cardiac
 * surgery, and it is on the list of things to confirm with the clinical team.
 *
 * BMI is the number only. The existing CVDBodySizeForm also derives a category
 * from it, but its boundaries leave 18.5, 24.9, 29.9, 30.0 and 34.9
 * unclassified, so that is deliberately not copied here.
 */
const AUTOCALC = [
  {
    Height: "HeightCm",
    Weight: "BodyWeightKg",
    Bmi: "BMIAutocalculator",
    Bsa: "BSAAutocalculator",
  },
  {
    Height: "UndurSm",
    Weight: "JinKg",
    Bmi: "BieiinJingiinIndeksKgM",
    Bsa: "BieiinGadarguugiinTalbaiM",
  },
];

const CALCULATED_FIELDS = new Set(
  AUTOCALC.reduce((acc, m) => acc.concat([m.Bmi, m.Bsa]), []),
);

/**
 * Renders any of the tender's phase-4 forms from the server-side field
 * dictionary (TenderFormField). There is deliberately nothing form-specific
 * here — the form is chosen by the `FormNo` prop, and everything else (labels,
 * control types, option lists, sections, conditional reveal) comes from the
 * database. Adding a field to a form is a DB row, not a code change.
 *
 * Answers are stored as JSON in TenderFormData.Data.
 */
class TenderForm extends BaseCustomForm {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      Fields: [],
      Sections: [],
      EditObject: {},
      DataId: null,
      isLoading: true,
      LoadError: null,
      // section rail
      NavCollapsed: false,
      NavFilter: "",
    };
    this.ModifyObject = {};
    // field codes filled from the patient record rather than typed
    this._prefilled = new Set();
    this._invalid = new Set();
  }

  componentDidMount() {
    this.LoadForm();
  }

  /**
   * Overrides the base implementation, and this is load-bearing.
   *
   * `getFieldWithValue` reads the value out of `EditObject` only, and it does so
   * by MUTATING the shared field descriptor rather than returning a copy. Two
   * things broke as a result, and both looked like separate bugs:
   *
   *  - A radio lost its selection about a third of a second after being
   *    clicked. The click writes to ModifyObject, the delayed re-render calls
   *    this method, EditObject still has the old value, and the control's
   *    "sync with props" effect resets it. In the coronary segment table, where
   *    the row is nothing but the control, the answer appeared to vanish.
   *  - Restoring a draft did nothing visible. The answers really were restored
   *    into state, but because the descriptor is mutated in place the `Config`
   *    prop kept the same object identity, so no control's effect re-ran and
   *    every one of them carried on showing the old value.
   *
   * Reading through ValueOf (ModifyObject first, then EditObject) and returning
   * a fresh object fixes both: the value is always the current one, and the new
   * identity makes the controls resync.
   */
  GetConfigField = (Name) => {
    const { Fields, EditObject } = this.state;
    const base = getFieldWithValue(Name, Fields, EditObject);
    if (!base) return null;

    const v = this.ValueOf(Name);
    const Value =
      base.Type === "CheckBox"
        ? Array.isArray(v)
          ? v
          : []
        : v === undefined || v === null
          ? ""
          : v;

    return { ...base, Value };
  };

  /** the signed-in doctor's name, for the "doctor in charge" fields */
  DoctorName = () => {
    const u = this.LogedUser;
    if (!u) return "";
    if (u.Doctor) {
      if (u.Doctor.FullName) return u.Doctor.FullName;
      const n = [u.Doctor.lastname, u.Doctor.firstname].filter(Boolean);
      if (n.length) return n.join(" ");
    }
    return u.FullName || "";
  };

  /**
   * Fill the identity fields from the patient record and the signed-in doctor.
   *
   * Only ever fills a field that is EMPTY and that the form actually declares —
   * a saved answer is never overwritten, and a form without these codes is
   * untouched. Filled values go into ModifyObject as well as EditObject, so
   * they are saved rather than merely displayed.
   */
  Prefill = (patient) => {
    const doctor = this.DoctorName();
    const declared = new Set(
      (this.state.Fields || []).flat().map((f) => f.Name),
    );

    const Next = {};
    Object.keys(PREFILL).forEach((code) => {
      if (!declared.has(code)) return;
      if (!this.IsEmpty(this.ValueOf(code))) return;
      const value = PREFILL[code](patient, doctor);
      if (value === undefined || value === null || value === "") return;
      // dates arrive as ISO timestamps; the controls want a plain date
      Next[code] =
        code.indexOf("Date") >= 0 || code.indexOf("Ognoo") >= 0
          ? (value + "").slice(0, 10)
          : value;
    });

    if (Object.keys(Next).length === 0) return;
    Object.keys(Next).forEach((k) => {
      this.ModifyObject[k] = Next[k];
      // Remembered so that a form nobody has typed into does not report itself
      // as having unsaved changes, warn on close, or leave a draft behind.
      // These values are still saved: Save posts the whole ModifyObject.
      this._prefilled.add(k);
    });
    this.setState({ EditObject: { ...this.state.EditObject, ...Next } });
  };

  /** the doctor's own changes, ignoring anything filled in for them */
  ChangedByUser = () =>
    Object.keys(this.ModifyObject).filter((k) => !this._prefilled.has(k));

  /** true when there is work that has not reached the server */
  HasUnsaved = () => this.ChangedByUser().length > 0;

  /** write the draft immediately rather than waiting for the debounce */
  FlushDraft = () => {
    if (this._draftTimer) {
      clearTimeout(this._draftTimer);
      this._draftTimer = null;
    }
    this.WriteDraft();
  };

  LoadForm = async () => {
    const { FormNo, PatientRegNo } = this.props;

    // NOTE: keep the config in a local. React 18 batches setState inside async
    // callbacks, so this.state.Config is not readable on the next line.
    let Config = null;
    let LoadError = null;

    await Helper.BaseCrudHelper.CallService(
      "/TenderForm/GetConfig",
      { FormCode: FormNo },
      (resData) => {
        if (resData && resData.Success && resData.Data) {
          Config = resData.Data;
          this.setState({
            Config: resData.Data,
            Fields: resData.Data.Fields,
            Sections: resData.Data.Sections || [],
          });
        } else {
          LoadError =
            (resData && resData.Message) || "Маягтын тохиргоо олдсонгүй";
          this.setState({ LoadError });
        }
      },
    );

    if (LoadError) {
      this.setState({ isLoading: false });
      return;
    }

    const { DataId } = this.props;
    const AllowDuplicate = Config && Config.AllowDuplicate === true;
    let Previous = null;

    if (DataId) {
      // opened from the list: edit that exact instance
      await Helper.BaseCrudHelper.CallService(
        "/TenderForm/GetData",
        { Id: DataId },
        (resData) => {
          if (resData && resData.Success && resData.Data) {
            this.setState({
              EditObject: resData.Data,
              DataId: resData.Data.Id || null,
            });
          }
        },
      );
    } else if (PatientRegNo && !AllowDuplicate) {
      // ordinary forms continue the patient's latest instance
      await Helper.BaseCrudHelper.CallService(
        "/TenderForm/GetData",
        { FormCode: FormNo, PatRegNo: PatientRegNo },
        (resData) => {
          if (resData && resData.Success && resData.Data) {
            this.setState({
              EditObject: resData.Data,
              DataId: resData.Data.Id || null,
            });
          }
        },
      );
    } else if (PatientRegNo && AllowDuplicate) {
      // Repeatable procedures (tender appendix 3.1) always start a NEW instance,
      // and offer to copy the previous one across.
      await Helper.BaseCrudHelper.CallService(
        "/TenderForm/GetPrevious",
        { FormCode: FormNo, PatRegNo: PatientRegNo },
        (resData) => {
          if (resData && resData.Success && resData.Data) {
            Previous = resData.Data;
            this.setState({ Previous: resData.Data });
          }
        },
      );
    }

    // The patient record, for the identity fields. Fetched last so a slow or
    // failed lookup delays nothing else - the form is fully usable without it.
    let PatientRow = null;
    if (PatientRegNo) {
      const SearchOption = Helper.BaseCrudHelper.GetSearchOption();
      SearchOption.SearchField = [
        { Field: "p_registration", Value: PatientRegNo, Op: "Equals" },
      ];
      await Helper.BaseCrudHelper.BaseGetDetail(
        { ObjectName: "Patient", SearchOption },
        (resData) => {
          if (resData && resData.Success && resData.Data) {
            PatientRow = resData.Data;
          }
        },
      );
    }

    this.setState({ isLoading: false }, () => {
      this.Prefill(PatientRow);
      // An unsaved draft outranks the duplicate offer: it is this doctor's own
      // work from a session that did not finish, and it is about to be lost.
      const draft = this.ReadDraft();
      if (draft) this.AskRestoreDraft(draft);
      else if (Previous) this.AskDuplicate(Previous);
    });
  };

  // ------------------------------------------------------------------
  // Draft autosave
  //
  // These forms run to 244 fields and are filled over a shift. Until now the
  // only thing standing between a doctor and a lost afternoon was remembering
  // to press Save, and a closed dialog, a session timeout or a reload threw
  // the lot away. Unsaved answers are mirrored to localStorage as they are
  // typed and offered back the next time the same form is opened for the same
  // patient.
  //
  // The draft is a convenience, never a source of truth: every read and write
  // is guarded, because localStorage throws outright in some privacy modes and
  // silently returns nothing in others.
  // ------------------------------------------------------------------

  DraftKey = () => {
    const { FormNo, PatientRegNo } = this.props;
    if (!FormNo || !PatientRegNo) return null;
    return (
      "tf:" + FormNo + ":" + PatientRegNo + ":" + (this.state.DataId || "new")
    );
  };

  WriteDraft = () => {
    const key = this.DraftKey();
    if (!key) return;
    try {
      // Nothing the doctor typed means nothing worth restoring - otherwise
      // merely opening a form would leave a draft and prompt on the next open.
      if (this.ChangedByUser().length === 0) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(
          key,
          JSON.stringify({
            At: new Date().toISOString(),
            Data: this.ModifyObject,
          }),
        );
      }
    } catch (e) {
      // out of quota, or storage disabled - the form still works
    }
  };

  /**
   * Takes an explicit key because saving a NEW record changes DataId, and so
   * changes what DraftKey() returns. The draft has to be removed under the key
   * it was written with, not the one that exists afterwards.
   */
  ClearDraft = (Key) => {
    const key = Key || this.DraftKey();
    if (!key) return;
    try {
      localStorage.removeItem(key);
    } catch (e) {
      /* nothing to recover from */
    }
  };

  ReadDraft = () => {
    const key = this.DraftKey();
    if (!key) return null;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.Data || Object.keys(parsed.Data).length === 0) {
        return null;
      }
      return parsed;
    } catch (e) {
      return null;
    }
  };

  AskRestoreDraft = (draft) => {
    const when = (draft.At || "").replace("T", " ").slice(0, 16);
    const count = Object.keys(draft.Data).length;
    this.setState({
      Alert: Helper.BaseCrudHelper.ShowConfirm(
        i18n.t("Хадгалагдаагүй ноорог олдлоо. Сэргээх үү?") +
          " (" +
          when +
          " — " +
          count +
          " " +
          i18n.t("талбар") +
          ")",
        () => {
          this.ModifyObject = { ...this.ModifyObject, ...draft.Data };
          this.setState({
            EditObject: { ...this.state.EditObject, ...draft.Data },
            Alert: null,
          });
        },
        () => {
          this.ClearDraft();
          this.setState({ Alert: null });
        },
      ),
    });
  };

  /**
   * BMI and BSA, recalculated whenever a height or weight is touched.
   *
   * Written to ModifyObject so they are saved, and to EditObject because the
   * dictionary-driven controls read what they display from there. The existing
   * implementation writes straight to the DOM by element id; that does not
   * survive a generic renderer, so this goes through state instead.
   */
  Recalculate = (Field) => {
    const map = AUTOCALC.find((m) => m.Height === Field || m.Weight === Field);
    if (!map) return;

    const h = parseFloat(this.ValueOf(map.Height));
    const w = parseFloat(this.ValueOf(map.Weight));

    const Next = {};
    if (h > 0 && w > 0) {
      Next[map.Bmi] = Math.round((w / (h * h)) * 10000 * 100) / 100;
      Next[map.Bsa] = Math.round(Math.sqrt((h * w) / 3600) * 100) / 100;
    } else {
      Next[map.Bmi] = null;
      Next[map.Bsa] = null;
    }

    Object.keys(Next).forEach((k) => {
      this.ModifyObject[k] = Next[k];
    });
    this.setState({ EditObject: { ...this.state.EditObject, ...Next } });
  };

  /** "duplicate the previous record?" - required by tender appendix 3.1 */
  AskDuplicate = (Previous) => {
    if (!Previous || !Previous.Answers) return;
    const when = Previous.PreviousDate || "";
    this.setState({
      Alert: Helper.BaseCrudHelper.ShowConfirm(
        i18n.t("Өмнөх мэдээллийг хуулах уу?") +
          " (" +
          when +
          " — " +
          Previous.FieldCount +
          " " +
          i18n.t("талбар") +
          ")",
        () => this.ApplyDuplicate(Previous),
        () => this.setState({ Alert: null }),
      ),
    });
  };

  /**
   * Copy the previous answers in as unsaved changes. DataId stays null, so
   * saving writes a new instance and the earlier record is untouched.
   */
  ApplyDuplicate = (Previous) => {
    if (!Previous || !Previous.Answers) return;
    this.ModifyObject = { ...this.ModifyObject, ...Previous.Answers };
    this.setState({
      EditObject: { ...this.state.EditObject, ...Previous.Answers },
      Alert: null,
      Duplicated: true,
    });
  };

  /**
   * Re-render policy.
   *
   * A full re-render of a 234-field form costs ~180ms, so doing it on every
   * answer made large forms feel frozen. Only two things actually need it:
   *   - answering a field that reveals a conditional child, which must be
   *     immediate or the child does not appear
   *   - the per-section answered/total counters, which can lag slightly
   * so everything else is coalesced into one delayed re-render.
   */
  ParentFields = () => {
    if (!this._parentFields) {
      this._parentFields = new Set(
        (this.state.Fields || [])
          .flat()
          .map((f) => f.ParentField)
          .filter(Boolean),
      );
    }
    return this._parentFields;
  };

  ChangeValueAfter = (Field) => {
    // Mirror to the draft on a longer delay than the re-render - it is storage
    // I/O, and nothing on screen depends on it.
    if (this._draftTimer) clearTimeout(this._draftTimer);
    this._draftTimer = setTimeout(() => {
      this._draftTimer = null;
      if (!this._unmounted) this.WriteDraft();
    }, 1000);

    // Height or weight: recalculate BMI/BSA now. This setState re-renders, so
    // it also covers the progress counters.
    this.Recalculate(Field);

    // A field the doctor has just filled is no longer flagged as missing, and
    // a prefilled value they have edited is now their own change.
    if (this._invalid && this._invalid.has(Field)) this._invalid.delete(Field);
    if (this._prefilled && this._prefilled.has(Field)) {
      this._prefilled.delete(Field);
    }

    if (this.ParentFields().has(Field)) {
      if (this._progressTimer) clearTimeout(this._progressTimer);
      this.forceUpdate();
      return;
    }
    if (this._progressTimer) clearTimeout(this._progressTimer);
    this._progressTimer = setTimeout(() => {
      this._progressTimer = null;
      if (!this._unmounted) this.forceUpdate();
    }, 350);
  };

  componentWillUnmount() {
    this._unmounted = true;
    if (this._progressTimer) clearTimeout(this._progressTimer);
    // Flush rather than drop: closing the dialog is exactly the case the draft
    // exists for.
    if (this._draftTimer) {
      clearTimeout(this._draftTimer);
      this.WriteDraft();
    }
  }

  /** which sections are expanded; the first one opens by default */
  OpenSections = () => {
    if (!this._open) {
      const first = (this.state.Sections || [])[0];
      this._open = new Set([first ? first.Code || "default" : "default"]);
    }
    return this._open;
  };

  ToggleSection = (key) => {
    const open = this.OpenSections();
    if (open.has(key)) open.delete(key);
    else open.add(key);
    this.forceUpdate();
  };

  ToggleAll = (groups) => {
    const open = this.OpenSections();
    const allOpen = groups.every((s) => open.has(s.Code || "default"));
    open.clear();
    if (!allOpen) groups.forEach((s) => open.add(s.Code || "default"));
    this.forceUpdate();
  };

  /** current value of a field, whether just edited or loaded from the server */
  ValueOf = (Name) => {
    if (Object.prototype.hasOwnProperty.call(this.ModifyObject, Name)) {
      return this.ModifyObject[Name];
    }
    const { EditObject } = this.state;
    return EditObject ? EditObject[Name] : undefined;
  };

  /** a field is hidden until its parent has the value that reveals it */
  IsVisible = (Field) => {
    if (!Field.ParentField) return true;
    const parent = this.ValueOf(Field.ParentField);
    if (parent === undefined || parent === null || parent === "") return false;
    return parent + "" === Field.ParentValue + "";
  };

  IsEmpty = (v) =>
    v === undefined ||
    v === null ||
    v === "" ||
    (Array.isArray(v) && v.length === 0);

  /**
   * Required fields that are visible and still empty.
   *
   * Visibility matters: a required field inside a section the answers have not
   * revealed is not owed. Choosing "coronary angiography only" must not demand
   * the angioplasty fields.
   */
  MissingRequired = () =>
    (this.state.Fields || [])
      .flat()
      .filter(
        (f) =>
          f.Required && this.IsVisible(f) && this.IsEmpty(this.ValueOf(f.Name)),
      );

  /**
   * Required-field check, run from Save.
   *
   * Returns true when the save must not proceed, having flagged the offending
   * fields and opened the section holding the first of them, so the doctor
   * lands on the problem rather than hunting for it.
   *
   * This lives on Save rather than on a separate confirm step because a doctor
   * should press one button, not two. Unsaved work is not at risk from a
   * refused save: it stays on screen and is already mirrored to the draft.
   */
  BlockOnMissingRequired = () => {
    const missing = this.MissingRequired();
    if (missing.length === 0) {
      if (this._invalid && this._invalid.size) this._invalid = new Set();
      return false;
    }

    this._invalid = new Set(missing.map((f) => f.Name));
    this.OpenSections().add(missing[0].SectionCode || "default");

    const names = missing
      .slice(0, 3)
      .map((f) => i18n.t(f.Label))
      .join(", ");
    this.setState({
      Alert: Helper.BaseCrudHelper.ShowAlert(
        i18n.t("Заавал бөглөх талбар бөглөгдөөгүй байна") +
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

  Save = async (callback) => {
    if (this.state.Saving) return;
    const { FormNo, PatientId, PatientRegNo } = this.props;
    const { DataId } = this.state;
    // Saving a new record replaces DataId, so remember which key the draft is
    // sitting under before that happens.
    const DraftKeyAtSave = this.DraftKey();

    if (!PatientRegNo) {
      this.setState({
        Alert: Helper.BaseCrudHelper.ShowAlert(
          "Иргэний мэдээлэл олдсонгүй",
          false,
          () => this.setState({ Alert: null }),
        ),
      });
      callback && callback(false);
      return;
    }

    if (this.BlockOnMissingRequired()) {
      callback && callback(false);
      return;
    }

    if (Object.keys(this.ModifyObject).length === 0) {
      this.setState({
        Alert: Helper.BaseCrudHelper.ShowAlert(
          "Өөрчлөлт хийгдээгүй байна",
          false,
          () => this.setState({ Alert: null }),
        ),
      });
      callback && callback(false);
      return;
    }

    this.setState({ Saving: true });
    await Helper.BaseCrudHelper.CallService(
      "/TenderForm/CustomSave",
      {
        FormCode: FormNo,
        PatRegNo: PatientRegNo,
        PatientId: PatientId || null,
        Id: DataId,
        Data: JSON.stringify(this.ModifyObject),
      },
      (resData) => {
        if (resData && resData.Success) {
          // fold the saved values into EditObject so a reopen shows them
          this.setState(
            {
              DataId: resData.Data ? resData.Data.Id : DataId,
              EditObject: { ...this.state.EditObject, ...this.ModifyObject },
              Alert: Helper.BaseCrudHelper.ShowAlert(
                resData.Message,
                true,
                () => this.setState({ Alert: null }),
              ),
            },
            () => {
              // The answers are on the server now, so the draft has nothing
              // left to protect.
              this.ClearDraft(DraftKeyAtSave);
              this.ModifyObject = {};
              this._prefilled = new Set();
              if (this._draftTimer) {
                clearTimeout(this._draftTimer);
                this._draftTimer = null;
              }
              this.setState({ Saving: false });
              callback && callback(true);
            },
          );
        } else {
          this.setState({
            Saving: false,
            Alert: Helper.BaseCrudHelper.ShowAlert(
              (resData && resData.Message) || "Хадгалахад алдаа гарлаа",
              false,
              () => this.setState({ Alert: null }),
            ),
          });
          callback && callback(false);
        }
      },
    );
  };

  RenderControl = (Field, Opts) => {
    const Config = this.GetConfigField(Field.Name);
    if (!Config) return null;

    const key = Field.Name;
    // BMI and BSA are derived, so they are shown but not typed into. The
    // tender marks them "/Autocalculator/".
    const Calculated = CALCULATED_FIELDS.has(key);
    // Inside the segment table the column heading is the label, so the control
    // must not repeat it. Cloned rather than mutated - the descriptor is shared
    // state.
    const Cfg = Opts && Opts.HideLabel ? { ...Config, Label: "" } : Config;
    const common = { ChangeValue: this.ChangeValue, Config: Cfg };

    let control;
    switch (Field.Type) {
      case "RadioBox":
        control = <BaseRadio key={key} {...common} />;
        break;
      case "Table":
        control = <BaseTableGrid key={key} {...common} />;
        break;
      case "CheckBox":
        control = <BaseCheckBox key={key} {...common} />;
        break;
      case "TextArea":
        control = <BaseTextArea key={key} {...common} FullWidth={true} />;
        break;
      case "Date":
        control = <BaseSimpleDate key={key} {...common} />;
        break;
      case "Number":
        control = (
          <BaseTextField
            key={key}
            {...common}
            Type="number"
            FullWidth={true}
            Disabled={Calculated}
          />
        );
        break;
      case "Text":
      default:
        control = (
          <BaseTextField
            key={key}
            {...common}
            FullWidth={true}
            Disabled={Calculated}
          />
        );
    }

    // A required field left empty at Confirm gets a marker until it is filled.
    // The mark goes on a wrapper rather than into the control, so it works the
    // same for every control type in the dictionary.
    if (this._invalid && this._invalid.has(key)) {
      return (
        <div
          key={key + "-invalid"}
          style={{
            borderLeft: "3px solid " + colors.status.danger,
            paddingLeft: 8,
            marginBottom: 4,
          }}
        >
          {control}
        </div>
      );
    }
    return control;
  };

  /**
   * The 19-segment coronary grid, drawn as one aligned table.
   *
   * The dictionary holds it as 38 separate full-width fields — SegLMCA and
   * SegLMCAPercent, SegLAD1 and SegLAD1Percent, and so on — which the generic
   * renderer stacks into 38 rows. The spec asks for a table, and a cath lab
   * reads it as a table. Pairing is by field code: X with X + "Percent", and
   * the segment name is the part of the label before the dash.
   */
  RenderSegmentGrid = (fields) => {
    const t = (k) => i18n.t(k);
    const bases = fields.filter((f) => f.Name.slice(-7) !== "Percent");
    if (bases.length === 0) return null;

    const cell = {
      border: "1px solid " + colors.border.default,
      padding: "2px 6px",
      verticalAlign: "middle",
    };

    return (
      <div key="segment-grid" style={{ overflowX: "auto", marginBottom: 10 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: colors.background.secondary }}>
              <th style={{ ...cell, textAlign: "left", width: "18%" }}>
                {t("Сегмент")}
              </th>
              <th style={{ ...cell, textAlign: "left" }}>{t("Байдал")}</th>
              <th style={{ ...cell, textAlign: "left", width: "18%" }}>
                {t("Нарийсал (%)")}
              </th>
            </tr>
          </thead>
          <tbody>
            {bases.map((b) => {
              const pct = fields.find((f) => f.Name === b.Name + "Percent");
              const name = (b.Label || b.Name).split(" - ")[0];
              return (
                <tr key={b.Name}>
                  <td style={{ ...cell, fontSize: 13 }}>{t(name)}</td>
                  <td style={cell}>
                    {this.RenderControl(b, { HideLabel: true })}
                  </td>
                  <td style={cell}>
                    {pct ? this.RenderControl(pct, { HideLabel: true }) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  /**
   * A section's controls, with the coronary segment fields lifted out into one
   * table at the position of the first of them.
   */
  RenderSectionBody = (visible) => {
    const segs = visible.filter((f) => f.Name.indexOf("Seg") === 0);
    if (segs.length < 4) return visible.map((f) => this.RenderControl(f));

    const out = [];
    let placed = false;
    visible.forEach((f) => {
      if (f.Name.indexOf("Seg") === 0) {
        if (!placed) {
          out.push(this.RenderSegmentGrid(segs));
          placed = true;
        }
        return;
      }
      out.push(this.RenderControl(f));
    });
    return out;
  };

  ScrollToSection = (key) => {
    this.OpenSections().add(key);
    this.forceUpdate(() => {
      const el = this._sectionEls && this._sectionEls[key];
      el && el.scrollIntoView({ block: "start", behavior: "smooth" });
    });
  };

  CustomRender = () => {
    const t = (k) => i18n.t(k);
    const { Fields, Sections, LoadError } = this.state;

    if (LoadError) return <BaseNoData Text={LoadError} />;

    const all = (Fields || []).flat();
    if (all.length === 0) {
      // A registered form with no dictionary rows is not an error - some tender
      // forms have no approved content yet (1.2's body is empty in the tender
      // document, 1.4 and 1.10 are scoped at contract signing). Say so, rather
      // than showing a blank panel that reads as broken.
      return (
        <div style={{ padding: "12px 4px" }}>
          <BaseNoData Text="Энэ маягтын талбарууд хараахан тодорхойлогдоогүй байна" />
          <div
            style={{
              fontSize: 13,
              color: colors.text.secondary,
              padding: "4px 10px",
              lineHeight: 1.6,
            }}
          >
            {t(
              "Тендерийн баримт бичигт энэ маягтын агуулга ороогүй тул эмнэлгээс батлагдсан маягтыг авах шаардлагатай.",
            )}
          </div>
        </div>
      );
    }

    const groups =
      Sections && Sections.length
        ? Sections
        : [{ Code: null, Label: null, Pos: 0 }];

    // Sections are collapsed by default and their controls are not rendered
    // until opened. Forms 1.5-1.9 carry 200+ fields; rendering them all at once
    // cost ~2s to open. Collapsed, they open immediately and the doctor works
    // one section at a time anyway.
    const open = this.OpenSections();
    const allOpen = groups.every((s) => open.has(s.Code || "default"));

    // The sections that have anything to show, in order.
    //
    // Deliberately no answered/total or completion state. These forms are not
    // meant to be filled end to end - a doctor records the one or two things
    // they have and saves - so a progress figure would report every record as
    // unfinished forever, which is noise rather than information. The rail
    // exists to find a section, nothing else.
    const stats = groups
      .map((section) => {
        const key = section.Code || "default";
        const visible = all.filter(
          (f) =>
            (f.SectionCode || null) === (section.Code || null) &&
            this.IsVisible(f),
        );
        if (visible.length === 0) return null;
        return { section, key, visible };
      })
      .filter(Boolean);

    const Unsaved = this.ChangedByUser().length;
    const Confirmed = this.state.EditObject
      ? this.state.EditObject.Status === 1
      : false;
    this._sectionEls = this._sectionEls || {};

    const NavOpen = this.state.NavCollapsed !== true;
    const NavFilter = (this.state.NavFilter || "").trim().toLowerCase();

    // Searching matches the FIELD labels as well as the section name, so
    // looking for the one row you came to fill in finds the section holding it
    // even when you cannot remember which section that is.
    const NavItems = NavFilter
      ? stats.filter((s) => {
          const label = (
            s.section.Label ? t(s.section.Label) : t("Талбарууд")
          ).toLowerCase();
          if (label.includes(NavFilter)) return true;
          return s.visible.some((f) =>
            (t(f.Label) + "").toLowerCase().includes(NavFilter),
          );
        })
      : stats;

    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: "12px",
          // Below `md` the rail sits ABOVE the form instead of beside it.
          //
          // This row had no `flexWrap`, so a 240px rail held its width at every
          // size: on a 390px phone it took roughly two thirds of the line and
          // left the form itself in a ~140px column. Stacking gives the form
          // the full width and keeps the section list reachable at the top,
          // where it also stops being sticky (see the rail below) - a sticky
          // block that tall would cover the form it is meant to navigate.
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        {/* Section rail — a way to find a section, and nothing more.

            No completion figures, no progress bars, no status colours. These
            forms are not filled end to end: a doctor records the one or two
            things they have and saves. A progress indicator would mark every
            record incomplete forever, which tells nobody anything.

            Sticky and independently scrollable, so the list stays put while the
            form scrolls beside it. */}
        <Box
          sx={{
            // Sticky only where it sits beside the form. Stacked above it, a
            // sticky rail would follow the doctor down the page and cover the
            // fields.
            position: { xs: "static", md: "sticky" },
            top: 0,
            alignSelf: { xs: "stretch", md: "flex-start" },
            flex: "0 0 auto",
            width: { xs: "100%", md: NavOpen ? 240 : 44 },
            // Capped short when stacked so it cannot push the first field off
            // the screen; the list scrolls inside that cap.
            maxHeight: { xs: "40vh", md: "72vh" },
            display: "flex",
            flexDirection: "column",
            border: "1px solid " + colors.border.subtle,
            borderRadius: "3px",
            background: colors.background.primary,
            zIndex: 3,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              flex: "0 0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: NavOpen ? "space-between" : "center",
              gap: 6,
              padding: "6px 8px",
              borderBottom: "1px solid " + colors.border.subtle,
            }}
          >
            {NavOpen ? (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: colors.text.secondary,
                }}
              >
                {t("Хэсгүүд")}
              </span>
            ) : null}
            <button
              type="button"
              aria-label={t(NavOpen ? "Хураах" : "Дэлгэх")}
              title={t(NavOpen ? "Хураах" : "Дэлгэх")}
              onClick={() =>
                this.setState({ NavCollapsed: NavOpen, NavFilter: "" })
              }
              style={{
                cursor: "pointer",
                border: "1px solid " + colors.border.light,
                background: colors.background.primary,
                borderRadius: 3,
                width: 24,
                height: 22,
                fontSize: 12,
                lineHeight: 1,
                padding: 0,
                color: colors.text.secondary,
              }}
            >
              {NavOpen ? "«" : "»"}
            </button>
          </div>

          {/* Finding the row you came to fill in. Matches field labels as well
              as section names, so you can type the field and land on the
              section that holds it. */}
          {NavOpen && stats.length > 8 ? (
            <div
              style={{
                flex: "0 0 auto",
                padding: "6px 8px",
                borderBottom: "1px solid " + colors.border.subtle,
              }}
            >
              <input
                type="search"
                value={this.state.NavFilter || ""}
                onChange={(e) => this.setState({ NavFilter: e.target.value })}
                placeholder={t("Хэсэг, талбар хайх")}
                aria-label={t("Хэсэг, талбар хайх")}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  fontSize: 12,
                  padding: "4px 7px",
                  borderRadius: 3,
                  border: "1px solid " + colors.input.border,
                  color: colors.input.text,
                  background: colors.input.background,
                  outline: "none",
                }}
              />
            </div>
          ) : null}

          <div style={{ flex: 1, overflowY: "auto", padding: 4 }}>
            {NavItems.length === 0 ? (
              <div
                style={{
                  fontSize: 11.5,
                  color: colors.text.secondary,
                  padding: "8px 6px",
                }}
              >
                {t("Хэсэг олдсонгүй")}
              </div>
            ) : null}

            {NavItems.map((s) => {
              const isOpen = open.has(s.key);
              const label = s.section.Label
                ? t(s.section.Label)
                : t("Талбарууд");
              const index = stats.indexOf(s) + 1;

              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => this.ScrollToSection(s.key)}
                  title={label}
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 7,
                    width: "100%",
                    textAlign: "left",
                    padding: NavOpen ? "5px 7px" : "5px 0",
                    marginBottom: 1,
                    cursor: "pointer",
                    borderRadius: 3,
                    border: "1px solid transparent",
                    background: isOpen
                      ? colors.background.infoTint
                      : "transparent",
                    boxShadow: isOpen
                      ? "inset 2px 0 0 0 " + colors.text.sectionHeading
                      : "none",
                    font: "inherit",
                    justifyContent: NavOpen ? "flex-start" : "center",
                  }}
                >
                  <span
                    style={{
                      flex: "0 0 auto",
                      fontSize: 10.5,
                      minWidth: NavOpen ? 14 : undefined,
                      textAlign: "right",
                      color: colors.text.muted,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {index}
                  </span>
                  {NavOpen ? (
                    <span
                      style={{
                        flex: 1,
                        minWidth: 0,
                        fontSize: 12,
                        lineHeight: 1.35,
                        fontWeight: isOpen ? 600 : 400,
                        color: isOpen
                          ? colors.text.sectionHeading
                          : colors.text.strong,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {label}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {NavOpen ? (
            <div
              style={{
                flex: "0 0 auto",
                borderTop: "1px solid " + colors.border.subtle,
                padding: "6px 8px",
              }}
            >
              <button
                type="button"
                onClick={() => this.ToggleAll(groups)}
                style={{
                  width: "100%",
                  cursor: "pointer",
                  border: "1px solid " + colors.border.light,
                  background: colors.background.primary,
                  borderRadius: 3,
                  fontSize: 11.5,
                  padding: "5px 8px",
                  color: colors.text.strong,
                }}
              >
                {allOpen ? t("Бүгдийг хаах") : t("Бүгдийг нээх")}
              </button>
            </div>
          ) : null}
        </Box>

        <GridContainer style={{ margin: 0, flex: 1, minWidth: 0 }}>
          <GridItem xs={12} md={12}>
            {stats.map((s) => {
              const { section, key, visible } = s;
              const isOpen = open.has(key);
              // The section name alone. The answered/total count that used to
              // sit here reported an incomplete form no matter how correctly it
              // had been filled, because these forms are not meant to be
              // completed in one sitting.
              const heading = section.Label ? t(section.Label) : t("Талбарууд");

              return (
                <GroupPanel key={key} title={null} level={1}>
                  <div
                    ref={(el) => {
                      this._sectionEls[key] = el;
                    }}
                    role="button"
                    tabIndex={0}
                    aria-expanded={isOpen}
                    onClick={() => this.ToggleSection(key)}
                    onKeyDown={(e) =>
                      (e.key === "Enter" || e.key === " ") &&
                      this.ToggleSection(key)
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      cursor: "pointer",
                      fontWeight: 500,
                      color: colors.text.sectionHeading,
                      padding: "2px 4px",
                      userSelect: "none",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        width: 12,
                        display: "inline-block",
                      }}
                    >
                      {isOpen ? "▾" : "▸"}
                    </span>
                    <span>{heading}</span>
                  </div>

                  {isOpen ? (
                    <div style={{ marginTop: 8 }}>
                      {this.RenderSectionBody(visible)}
                    </div>
                  ) : null}
                </GroupPanel>
              );
            })}

            {/* Action bar. Appendix 3.1 asks for a save button that travels
                with you ("ХАДГАЛАХ ТОВЧЛУУР БАЙЖ ХАДГАЛЖ ЯВАХ"), so it is
                pinned to the bottom and serves every section at once.

                One button, not two: Save runs the required-field check itself.
                Locking a completed record is a separate act by someone else,
                and lives on the list screen rather than in the doctor's way. */}
            <div
              style={{
                position: "sticky",
                bottom: 0,
                zIndex: 3,
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: colors.background.primary,
                borderTop: "1px solid " + colors.border.subtle,
                padding: "6px 2px",
                marginTop: 8,
              }}
            >
              <span style={{ fontSize: 12, color: colors.text.secondary }}>
                {Confirmed
                  ? t("Баталгаажсан")
                  : Unsaved > 0
                    ? t("Хадгалагдаагүй өөрчлөлт") + ": " + Unsaved
                    : t("Бүх өөрчлөлт хадгалагдсан")}
              </span>

              <span style={{ marginLeft: "auto" }}>
                <Button
                  color="info"
                  size="sm"
                  disabled={this.state.Saving === true}
                  onClick={() => this.Save()}
                >
                  {this.state.Saving ? t("Хадгалж байна...") : t("Хадгалах")}
                </Button>
              </span>
            </div>
          </GridItem>
        </GridContainer>
      </Box>
    );
  };

  render() {
    const { Alert, isLoading } = this.state;
    if (isLoading) return <BaseLoading />;
    return (
      <div style={{ height: "100%" }}>
        {Alert}
        {this.CustomRender()}
      </div>
    );
  }
}

export default TenderForm;
