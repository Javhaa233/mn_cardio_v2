import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import BaseDialog from "customComponents/BaseDialog";
import PatientForm from "customComponents/Forms/PatientForm";

/**
 * "Шинэ өвчтөн" — register a patient from anywhere.
 *
 * Until now the ONLY way to create a patient was to type a registration number
 * into the top-bar search that matched nobody, which raised a confirm dialog
 * that then opened this same form. A doctor with a walk-in had to know to
 * search for someone who does not exist. This is that flow without the
 * riddle.
 *
 * PatientForm needs no props at all to create. It fetches its own field config,
 * renders its own loading and error states, and once the doctor types a
 * 10-character registration number its ChangeValueAfter fills in birthday,
 * gender and age from the number itself. So the whole component is a host for
 * the form plus the save wiring.
 *
 * Deliberately NOT passing `Config`: BaseCustomForm skips GetData() entirely if
 * a Config prop is present, and the form would never load.
 *
 * There is no global dialog host in this app - the idiom is that a component
 * holds the dialog element in its own state and renders it - so each caller
 * owns its own `open` flag and renders this.
 */
export default function NewPatientDialog({ open, onClose, onCreated }) {
  const { t } = useTranslation();
  const formRef = useRef(null);

  if (!open) return null;

  return (
    <BaseDialog
      Close={onClose}
      Title={t("Шинэ өвчтөн")}
      ShowSave={true}
      SaveButtonText={t("Бүртгэх")}
      Width="900px"
      Save={(stopLoading) => {
        const form = formRef.current;
        if (!form || !form.Save) {
          stopLoading && stopLoading();
          return;
        }
        form.Save((Success, Created) => {
          if (Success) {
            // The form's own alerts cover the failure path; the caller only
            // hears about success, and gets { DataId, RegisterNo } so it can
            // refresh a list or open the record it just created.
            onCreated && onCreated(Created || {});
            onClose && onClose();
          }
          stopLoading && stopLoading();
        });
      }}
    >
      <PatientForm ref={formRef} ObjectName="Patient" />
    </BaseDialog>
  );
}
