import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import Typography from "@mui/material/Typography";
import ContactMailOutlinedIcon from "@mui/icons-material/ContactMailOutlined";

import Helper from "helper";
import {
  NormalizeEmail,
  NormalizePhone,
  ValidateEmail,
  ValidatePhone,
} from "helper/ContactValidation";
import { setAlert } from "store/reducers/system";
import { colors } from "@/theme/colors";
import { space } from "@/theme/tokens";
import {
  DialogHeader,
  FormField,
  dialogActionSx,
  dialogPaperSx,
} from "customComponents/Profile/profileDialogParts";

/** Fired on window after a successful save, so an open Profile page refreshes. */
export const CONTACT_UPDATED_EVENT = "mncardio:contact-updated";

/**
 * The email + phone form, as a small centred dialog.
 *
 * A plain MUI Dialog rather than BaseDialog on purpose: BaseDialog is a
 * draggable, resizable window pinned to the top-left and sized 900x80vh by
 * default - the shell for a clinical form, not for a two-field question.
 *
 * Mount it only while it should be visible; initial values are read once.
 */
export function ContactInfoDialog({
  Initial,
  Missing,
  OnLater,
  OnSaved,
  LaterLabel = "Later",
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [Email, setEmail] = useState((Initial && Initial.Email) || "");
  const [Phone, setPhone] = useState((Initial && Initial.Phone) || "");
  const [Errors, setErrors] = useState({});
  const [Saving, setSaving] = useState(false);
  const EmailRef = useRef(null);
  const PhoneRef = useRef(null);

  // Put the cursor where the work is: the phone when only the phone is missing.
  const FocusPhone = !!(Missing && !Missing.Email && Missing.Phone);

  const ClearError = (Name) =>
    Errors[Name] || Errors.Form
      ? setErrors((Prev) => ({ ...Prev, [Name]: null, Form: null }))
      : null;

  // On blur only once something is typed - tabbing past an empty field is not
  // a mistake yet.
  const CheckOnBlur = (Name, Value) => {
    if (!String(Value || "").trim()) return;
    const Error =
      Name === "Email" ? ValidateEmail(Value) : ValidatePhone(Value);
    setErrors((Prev) => ({ ...Prev, [Name]: Error }));
  };

  const Submit = (event) => {
    event.preventDefault();
    if (Saving) return;
    const Next = { Email: ValidateEmail(Email), Phone: ValidatePhone(Phone) };
    setErrors(Next);
    if (Next.Email) return EmailRef.current && EmailRef.current.focus();
    if (Next.Phone) return PhoneRef.current && PhoneRef.current.focus();

    setSaving(true);
    Helper.AuthHelper.UpdateMyContact(
      { Email: NormalizeEmail(Email), Phone: NormalizePhone(Phone) },
      (resData) => {
        setSaving(false);
        if (resData && resData.Success) {
          dispatch(
            setAlert({ success: true, message: t("Contact details saved") }),
          );
          window.dispatchEvent(
            new window.CustomEvent(CONTACT_UPDATED_EVENT, {
              detail: resData.Data,
            }),
          );
          OnSaved && OnSaved(resData.Data);
          return;
        }
        // The server's message is an i18n key; route it to the field it is about.
        const Message = (resData && resData.Message) || "Алдаа гарлаа";
        if (/email/i.test(Message)) {
          setErrors({ Email: Message });
          EmailRef.current && EmailRef.current.focus();
        } else if (/phone/i.test(Message)) {
          setErrors({ Phone: Message });
          PhoneRef.current && PhoneRef.current.focus();
        } else {
          setErrors({ Form: Message });
        }
      },
    );
  };

  return (
    <Dialog
      open
      fullWidth
      maxWidth="xs"
      aria-labelledby="contact-prompt-title"
      aria-describedby="contact-prompt-reason"
      // Escape means "later"; a stray click on the backdrop must not throw away
      // what was typed.
      onClose={(event, reason) => {
        if (reason === "backdropClick" || Saving) return;
        OnLater && OnLater();
      }}
      PaperProps={{
        component: "form",
        noValidate: true,
        onSubmit: Submit,
        sx: {
          ...dialogPaperSx,
          margin: { xs: space[3], sm: space[8] },
          width: { xs: `calc(100% - 24px)`, sm: "100%" },
        },
      }}
    >
      <DialogHeader
        Icon={ContactMailOutlinedIcon}
        Title={t("Complete your contact details")}
        Description={t(
          "Password recovery links and system notifications are sent to these.",
        )}
        TitleId="contact-prompt-title"
        DescriptionId="contact-prompt-reason"
      />

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: space[2],
          padding: `0 ${space[6]}`,
        }}
      >
        <FormField
          Id="contact-prompt-email"
          Label={t("Email")}
          Required
          inputRef={EmailRef}
          autoFocus={!FocusPhone}
          type="email"
          autoComplete="email"
          placeholder="name@example.mn"
          value={Email}
          disabled={Saving}
          Error={Errors.Email ? t(Errors.Email) : null}
          onChange={(e) => {
            setEmail(e.target.value);
            ClearError("Email");
          }}
          onBlur={() => CheckOnBlur("Email", Email)}
          slotProps={{ htmlInput: { maxLength: 100 } }}
        />
        <FormField
          Id="contact-prompt-phone"
          Label={t("Phone number")}
          Required
          inputRef={PhoneRef}
          autoFocus={FocusPhone}
          type="tel"
          autoComplete="tel"
          placeholder="99112233"
          value={Phone}
          disabled={Saving}
          Error={Errors.Phone ? t(Errors.Phone) : null}
          Hint={t("8 digits, e.g. 99112233")}
          onChange={(e) => {
            setPhone(e.target.value);
            ClearError("Phone");
          }}
          onBlur={() => CheckOnBlur("Phone", Phone)}
          slotProps={{ htmlInput: { inputMode: "numeric", maxLength: 12 } }}
        />
        {Errors.Form ? (
          <Typography
            variant="body2"
            role="alert"
            sx={{ color: colors.status.danger }}
          >
            {t(Errors.Form)}
          </Typography>
        ) : null}
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: space[2],
          padding: `${space[5]} ${space[6]} ${space[6]}`,
        }}
      >
        <Button
          type="button"
          disableElevation
          disabled={Saving}
          onClick={() => OnLater && OnLater()}
          sx={dialogActionSx("neutral")}
        >
          {t(LaterLabel)}
        </Button>
        <Button
          type="submit"
          disableElevation
          disabled={Saving}
          startIcon={
            Saving ? <CircularProgress size={14} color="inherit" /> : null
          }
          sx={dialogActionSx("primary")}
        >
          {t("Save")}
        </Button>
      </Box>
    </Dialog>
  );
}

/**
 * Mounted once in layouts/Admin.jsx. Asks every staff user with no email or no
 * phone to fill them in; "Later" hides it until the next login, and once both
 * are saved it never appears again.
 */
export default function ContactInfoPrompt() {
  const [Contact, setContact] = useState(null);

  useEffect(() => {
    // Cheap local check first; only a user who looks incomplete costs a request.
    // The server has the final say - a session stored before `telephone` was
    // part of the login payload always looks incomplete locally.
    if (!Helper.AuthHelper.ShouldCheckContact()) return undefined;
    let Alive = true;
    Helper.AuthHelper.RefreshContact((Data) => {
      if (Alive && Data && (Data.Missing.Email || Data.Missing.Phone)) {
        setContact(Data);
      }
    });
    return () => {
      Alive = false;
    };
  }, []);

  if (!Contact) return null;
  return (
    <ContactInfoDialog
      Initial={Contact}
      Missing={Contact.Missing}
      OnLater={() => {
        Helper.AuthHelper.SnoozeContactPrompt();
        setContact(null);
      }}
      OnSaved={() => setContact(null)}
    />
  );
}
