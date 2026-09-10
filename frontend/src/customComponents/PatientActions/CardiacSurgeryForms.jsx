import React, { useRef, useState } from "react";
// translation
import { useTranslation } from "react-i18next";
// @mui/material components
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
// default components
import Button from "components/CustomButtons/Button";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
// my components
import BaseDialog from "customComponents/BaseDialog";
// helper
import Helper from "helper";

import TenderForm from "customComponents/Forms/NationalRegistry/Surgery/TenderForm";
import TenderFormPrint from "customComponents/Report/TenderFormPrint";
import { TENDER_FORM_GROUPS } from "customComponents/Forms/NationalRegistry/Surgery/tenderForms";

// The surgery group. The list itself lives in tenderForms.js so this menu, the
// rhythm and angio menus, and the unified register all read the same one.
const FORMS = TENDER_FORM_GROUPS[0].forms;

export default function CardiacSurgeryForms(props) {
  const { t } = useTranslation();

  const {
    PatientId = null,
    PatientRegNo = null,
    className = "",
    // the menu is reusable: pass a different form list and label to get a
    // second entry (e.g. the angiography group) without another component
    Forms = FORMS,
    Label = "Зүрх судасны мэс заслын маягтууд",
    Color = "warning",
    Icon = ContentPasteIcon,
  } = props;

  const [MenuValue, setMenuValue] = useState(null);
  const [Dialog, setDialog] = useState(null);
  const [Alert, setAlertState] = useState(null);

  const FormRef = useRef(null);

  // A4 sheet for the instance currently open in the form
  const ShowPrint = (Form, DataId) => {
    setDialog(
      <BaseDialog
        Close={() => setDialog(null)}
        Title={t(Form.label)}
        MaxWidth="lg"
        ShowSave={false}
      >
        <TenderFormPrint
          FormCode={Form.no}
          DataId={DataId}
          PatRegNo={PatientRegNo}
        />
      </BaseDialog>,
    );
  };

  /**
   * Closing with unsaved answers asks first, and says what happens to them.
   *
   * The draft is written either way — declining to close is not a reason to
   * lose it — but a doctor who hits the X after twenty minutes of typing should
   * be told the work is kept, not left guessing.
   */
  const TryClose = () => {
    const form = FormRef.current;
    if (!form || !form.HasUnsaved || !form.HasUnsaved()) {
      setDialog(null);
      return;
    }
    form.FlushDraft && form.FlushDraft();
    setAlertState(
      Helper.BaseCrudHelper.ShowConfirm(
        t(
          "Хадгалагдаагүй өөрчлөлт байна. Хаавал ноорогт хадгалагдах бөгөөд дараа нь сэргээх боломжтой. Хаах уу?",
        ),
        () => {
          setAlertState(null);
          setDialog(null);
        },
        () => setAlertState(null),
      ),
    );
  };

  const ShowForm = (Form) => {
    setDialog(
      <BaseDialog
        Close={TryClose}
        Title={t(Form.label)}
        MaxWidth="md"
        Save={(stopLoading) => {
          if (FormRef.current && FormRef.current.Save) {
            FormRef.current.Save(() => stopLoading && stopLoading());
          } else {
            stopLoading && stopLoading();
          }
        }}
        ShowSave={true}
        ShowPrint={true}
        Print={(stopLoading) => {
          // DataId identifies the instance being edited, when there is one.
          //
          // It is deliberately not required. Form 3.1 is repeatable, so opening
          // it always starts a NEW instance and DataId stays null even for a
          // patient who has a saved record - which meant print on 3.1 always
          // refused with "save it first". Passing null is fine: the sheet then
          // loads the patient's most recent saved instance of this form, and
          // says so itself if there is not one.
          const DataId =
            FormRef.current && FormRef.current.state
              ? FormRef.current.state.DataId
              : null;
          stopLoading && stopLoading();
          ShowPrint(Form, DataId);
        }}
      >
        <TenderForm
          ref={FormRef}
          FormNo={Form.no}
          Title={t(Form.label)}
          PatientId={PatientId}
          PatientRegNo={PatientRegNo}
        />
      </BaseDialog>,
    );
  };

  return (
    <div>
      {Alert}
      {Dialog}
      <Button
        color={Color}
        disabled={!PatientId ? true : false}
        size="sm"
        className={className}
        onClick={(event) => setMenuValue(event.currentTarget)}
      >
        <Icon />
        {t(Label)}
      </Button>
      <Menu
        anchorEl={MenuValue}
        open={Boolean(MenuValue)}
        keepMounted
        onClose={() => setMenuValue(null)}
        slotProps={{ paper: { sx: { maxWidth: "520px" } } }}
      >
        {Forms.map((Form) => (
          <MenuItem
            key={Form.no}
            disabled={Form.disabled === true}
            onClick={() => {
              ShowForm(Form);
              setMenuValue(null);
            }}
            sx={{ whiteSpace: "normal" }}
          >
            {t(Form.label)}
            {Form.note ? (
              <span style={{ marginLeft: "6px", opacity: 0.6 }}>
                ({t(Form.note)})
              </span>
            ) : null}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}
