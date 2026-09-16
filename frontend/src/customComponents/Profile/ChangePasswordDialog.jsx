import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Typography from "@mui/material/Typography";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LockResetOutlinedIcon from "@mui/icons-material/LockResetOutlined";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

import Helper from "helper";
import { PASSWORD_RULES } from "helper/PasswordRules";
import { setAlert } from "store/reducers/system";
import { colors } from "@/theme/colors";
import { radius, space } from "@/theme/tokens";
import {
  DialogHeader,
  FormField,
  dialogActionSx,
  dialogPaperSx,
} from "customComponents/Profile/profileDialogParts";

const visuallyHidden = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
};

function PasswordField({ Visible, OnToggle, ...Props }) {
  const { t } = useTranslation();
  return (
    <FormField
      Required
      type={Visible ? "text" : "password"}
      slotProps={{
        htmlInput: { maxLength: 128 },
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label={t(Visible ? "Hide password" : "Show password")}
                onClick={OnToggle}
                onMouseDown={(e) => e.preventDefault()}
                edge="end"
                size="small"
                tabIndex={-1}
              >
                {Visible ? (
                  <VisibilityOffIcon fontSize="small" />
                ) : (
                  <VisibilityIcon fontSize="small" />
                )}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
      {...Props}
    />
  );
}

/**
 * Change your own password. Mount while visible; OnClose on cancel and after
 * a successful change. Used by the Profile page and both navbar menus.
 */
export default function ChangePasswordDialog({ OnClose }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [Values, setValues] = useState({ Current: "", Next: "", Confirm: "" });
  const [Visible, setVisible] = useState({});
  const [Errors, setErrors] = useState({});
  const [Attempted, setAttempted] = useState(false);
  const [CapsLock, setCapsLock] = useState(false);
  const [Saving, setSaving] = useState(false);
  const CurrentRef = useRef(null);
  const NextRef = useRef(null);
  const ConfirmRef = useRef(null);
  // Only ever called from event handlers, never during render.
  const Focus = (Name) => {
    const Ref =
      Name === "Current" ? CurrentRef : Name === "Next" ? NextRef : ConfirmRef;
    Ref.current && Ref.current.focus();
  };

  const Met = PASSWORD_RULES.map((Rule) => Rule.Test(Values.Next));
  const AllMet = Met.every(Boolean);
  const Matches = Values.Confirm !== "" && Values.Confirm === Values.Next;

  const Change = (Name) => (event) => {
    const Value = event.target.value;
    setValues((Prev) => ({ ...Prev, [Name]: Value }));
    if (Errors[Name] || Errors.Form)
      setErrors((Prev) => ({ ...Prev, [Name]: null, Form: null }));
  };

  const TrackCapsLock = (event) => {
    if (event.getModifierState) setCapsLock(event.getModifierState("CapsLock"));
  };

  const Toggle = (Name) => () =>
    setVisible((Prev) => ({ ...Prev, [Name]: !Prev[Name] }));

  const Validate = () => {
    const Next = {};
    if (!Values.Current) Next.Current = "Enter your current password";
    if (!AllMet) Next.Next = "The new password does not meet the requirements";
    else if (Values.Next === Values.Current)
      Next.Next = "The new password must differ from the current one";
    if (!Next.Next && Values.Confirm !== Values.Next)
      Next.Confirm = "The passwords do not match";
    return Next;
  };

  const Submit = (event) => {
    event.preventDefault();
    if (Saving) return;
    setAttempted(true);
    const Next = Validate();
    setErrors(Next);
    const First = ["Current", "Next", "Confirm"].find((Name) => Next[Name]);
    if (First) return Focus(First);

    setSaving(true);
    Helper.AuthHelper.ChangePassword(
      { Password: Values.Current, NewPassword: Values.Next },
      (resData) => {
        setSaving(false);
        if (resData && resData.Success) {
          dispatch(
            setAlert({
              success: true,
              message: t("Password changed successfully"),
            }),
          );
          OnClose && OnClose();
          return;
        }
        const Message = (resData && resData.Message) || "Алдаа гарлаа";
        if (/old password/i.test(Message)) {
          setErrors({ Current: Message });
          Focus("Current");
        } else if (/requirement/i.test(Message)) {
          setErrors({
            Next: "The new password does not meet the requirements",
          });
        } else {
          setErrors({ Form: Message });
        }
      },
    );
  };

  const CapsHint = CapsLock ? t("Caps Lock is on") : undefined;

  return (
    <Dialog
      open
      fullWidth
      maxWidth="xs"
      aria-labelledby="change-password-title"
      aria-describedby="change-password-reason"
      onClose={(event, reason) => {
        if (reason === "backdropClick" || Saving) return;
        OnClose && OnClose();
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
        Icon={LockResetOutlinedIcon}
        Title={t("Change password")}
        Description={t("Choose a password you do not use on other sites.")}
        TitleId="change-password-title"
        DescriptionId="change-password-reason"
        OnClose={OnClose}
        CloseDisabled={Saving}
      />

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: space[1],
          padding: `0 ${space[6]}`,
        }}
      >
        <PasswordField
          Id="change-password-current"
          Label={t("Одоогийн нууц үг")}
          autoFocus
          autoComplete="current-password"
          inputRef={CurrentRef}
          value={Values.Current}
          onChange={Change("Current")}
          onKeyDown={TrackCapsLock}
          onKeyUp={TrackCapsLock}
          disabled={Saving}
          Error={Errors.Current ? t(Errors.Current) : null}
          Hint={CapsHint}
          Visible={!!Visible.Current}
          OnToggle={Toggle("Current")}
        />

        <PasswordField
          Id="change-password-new"
          Label={t("Шинэ нууц үг")}
          autoComplete="new-password"
          inputRef={NextRef}
          value={Values.Next}
          onChange={Change("Next")}
          onKeyDown={TrackCapsLock}
          onKeyUp={TrackCapsLock}
          disabled={Saving}
          Error={Errors.Next ? t(Errors.Next) : null}
          Hint={CapsHint}
          Visible={!!Visible.Next}
          OnToggle={Toggle("Next")}
        />

        <Box
          sx={{
            marginTop: `-${space[2]}`,
            marginBottom: space[3],
            padding: `${space[3]} ${space[4]}`,
            backgroundColor: colors.brand.tint,
            borderRadius: radius.sm,
          }}
        >
          <Typography
            id="change-password-rules"
            variant="body2"
            sx={{ color: colors.brand.ink, fontWeight: 600 }}
          >
            {t("Your new password must contain:")}
          </Typography>
          <Box
            component="ul"
            aria-labelledby="change-password-rules"
            sx={{
              listStyle: "none",
              margin: `${space[2]} 0 0`,
              padding: 0,
              display: "grid",
              rowGap: space[1],
            }}
          >
            {PASSWORD_RULES.map((Rule, Index) => {
              const Ok = Met[Index];
              const Failed = Attempted && !Ok;
              return (
                <Box
                  component="li"
                  key={Rule.Key}
                  sx={{ display: "flex", alignItems: "center", gap: space[2] }}
                >
                  {Ok ? (
                    <CheckCircleIcon
                      aria-hidden
                      sx={{ fontSize: 18, color: colors.brand.cyanInk }}
                    />
                  ) : (
                    <RadioButtonUncheckedIcon
                      aria-hidden
                      sx={{
                        fontSize: 18,
                        color: Failed
                          ? colors.status.danger
                          : colors.brand.inkMuted,
                      }}
                    />
                  )}
                  <Typography
                    variant="body2"
                    component="span"
                    sx={{
                      color: Ok ? colors.brand.cyanInk : colors.brand.inkMuted,
                      fontWeight: Failed ? 600 : 400,
                    }}
                  >
                    {t(Rule.Label)}
                  </Typography>
                  <Box component="span" sx={visuallyHidden}>
                    {t(Ok ? "met" : "not met")}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        <PasswordField
          Id="change-password-confirm"
          Label={t("Шинэ нууц үгээ давтана уу")}
          autoComplete="new-password"
          inputRef={ConfirmRef}
          value={Values.Confirm}
          onChange={Change("Confirm")}
          onKeyDown={TrackCapsLock}
          onKeyUp={TrackCapsLock}
          onBlur={() =>
            Values.Confirm &&
            Values.Confirm !== Values.Next &&
            setErrors((Prev) => ({
              ...Prev,
              Confirm: "The passwords do not match",
            }))
          }
          disabled={Saving}
          Error={Errors.Confirm ? t(Errors.Confirm) : null}
          Hint={Matches && AllMet ? t("The passwords match") : CapsHint}
          Visible={!!Visible.Confirm}
          OnToggle={Toggle("Confirm")}
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
          justifyContent: "flex-end",
          gap: space[2],
          padding: `${space[4]} ${space[6]} ${space[6]}`,
        }}
      >
        <Button
          type="button"
          disableElevation
          disabled={Saving}
          onClick={() => OnClose && OnClose()}
          sx={dialogActionSx("neutral")}
        >
          {t("Cancel")}
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
          {t("Change password")}
        </Button>
      </Box>
    </Dialog>
  );
}
