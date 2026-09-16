import React, { useEffect, useRef, useState } from "react";
// translation
import { useTranslation } from "react-i18next";
// helper
import Helper from "helper";

import AuthShell, {
  AuthField,
  AuthLink,
  AuthSubmit,
  PasswordToggle,
  SUPPORT_PHONE,
  useLanguageCatchUp,
} from "view/Auth/AuthShell";

const SUPPORT_AFTER_ATTEMPTS = 3;
const TYPING_IDLE_MS = 1500;

/**
 * The patient login.
 *
 * It was a split screen with an empty left half, a Creative Tim card, a round
 * teal button and purple/pink support text. It now uses the doctor login's
 * panel and scene, with the same inline errors and the same "call IT after
 * three failures" rule it already had. The "Remember me" checkbox is gone: its
 * value was never read by the login call, so it promised something the app did
 * not do.
 */
export default function PatientLoginPage() {
  const { t } = useTranslation();
  useLanguageCatchUp();

  const [UserName, setUserName] = useState("");
  const [Password, setPassword] = useState("");
  const [ShowPassword, setShowPassword] = useState(false);
  const [Loading, setLoading] = useState(false);
  const [Error, setError] = useState("");
  const [UserNameError, setUserNameError] = useState(false);
  const [PasswordError, setPasswordError] = useState(false);
  const [FailedAttempts, setFailedAttempts] = useState(0);
  const [Typing, setTyping] = useState(false);

  const IdleTimer = useRef(null);

  // The map calms down while someone is typing, as on the doctor login.
  const StopTyping = () => {
    if (IdleTimer.current) clearTimeout(IdleTimer.current);
    IdleTimer.current = null;
    setTyping(false);
  };
  const MarkTyping = () => {
    setTyping(true);
    if (IdleTimer.current) clearTimeout(IdleTimer.current);
    IdleTimer.current = setTimeout(() => setTyping(false), TYPING_IDLE_MS);
  };
  useEffect(
    () => () => {
      if (IdleTimer.current) clearTimeout(IdleTimer.current);
    },
    [],
  );

  useEffect(() => {
    const LogedUser = Helper.AuthHelper.GetLogedUserLocal();
    if (LogedUser && LogedUser.RoleId + "" === "4") {
      document.location = "/patient";
    }
  }, []);

  const Login = async () => {
    if (Loading) return;

    const MissingUserName = UserName === "";
    const MissingPassword = Password === "";
    setUserNameError(MissingUserName);
    setPasswordError(MissingPassword);
    if (MissingUserName || MissingPassword) {
      setError(
        MissingUserName
          ? t("Please enter your user name")
          : t("Please enter your password"),
      );
      return;
    }

    setError("");
    setLoading(true);
    await Helper.AuthHelper.PatientLogin(
      { UserName, Password },
      (Success, RoleId, Message) => {
        if (Success === true && RoleId) {
          if (RoleId + "" === "4") document.location = "/patient";
          return;
        }
        const attempts = FailedAttempts + 1;
        setFailedAttempts(attempts);
        if (
          attempts >= SUPPORT_AFTER_ATTEMPTS &&
          process.env.NODE_ENV !== "development"
        ) {
          setError(
            t("Мэдээллийн технологийн ажилтантай холбогдоно уу!") +
              " " +
              SUPPORT_PHONE,
          );
        } else {
          setError(Message ? t(Message) : t("An error occurred"));
        }
      },
    );
    setLoading(false);
  };

  return (
    <AuthShell Title={t("Welcome to MnCardio")} Quiet={Typing} onSubmit={Login}>
      <div role="alert" aria-live="polite">
        {Error ? <p className="err">{Error}</p> : null}
      </div>

      <AuthField
        Id="patient-login-username"
        Label={t("User name")}
        Icon="user"
        Bad={UserNameError}
      >
        <input
          id="patient-login-username"
          name="username"
          type="text"
          autoComplete="username"
          autoFocus
          className={UserNameError ? "bad" : undefined}
          aria-invalid={UserNameError || undefined}
          value={UserName}
          disabled={Loading}
          onBlur={StopTyping}
          onChange={(e) => {
            MarkTyping();
            setUserName(e.target.value);
            if (e.target.value) setUserNameError(false);
          }}
        />
      </AuthField>

      <AuthField
        Id="patient-login-password"
        Label={t("Password")}
        Icon="lock"
        Bad={PasswordError}
        Trailing={
          <PasswordToggle
            Shown={ShowPassword}
            onToggle={() => setShowPassword((v) => !v)}
          />
        }
      >
        <input
          id="patient-login-password"
          name="password"
          type={ShowPassword ? "text" : "password"}
          autoComplete="current-password"
          className={PasswordError ? "bad" : undefined}
          aria-invalid={PasswordError || undefined}
          value={Password}
          disabled={Loading}
          onBlur={StopTyping}
          onChange={(e) => {
            MarkTyping();
            setPassword(e.target.value);
            if (e.target.value) setPasswordError(false);
          }}
        />
      </AuthField>

      <AuthSubmit
        Loading={Loading}
        Label={t("Login")}
        LoadingLabel={t("Logging in...")}
      />

      <div className="row">
        <AuthLink To="/auth/forget-password">{t("Forgot password?")}</AuthLink>
      </div>
      {/* Self-registration is for doctors only. It used to link here to the
          doctor request form. Patients get access from their doctor. */}
      <p className="sub" style={{ margin: "12px 0 0" }}>
        {t("Нэвтрэх эрхээ эмчээсээ авна уу.")}
      </p>
    </AuthShell>
  );
}
