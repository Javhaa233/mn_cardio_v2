import React, { useState } from "react";
// translation
import { useTranslation } from "react-i18next";
// helper
import Helper from "helper";

import AuthShell, {
  AuthField,
  AuthLink,
  AuthSubmit,
  useLanguageCatchUp,
} from "./AuthShell";

/**
 * Request a password reset link.
 *
 * Same service call and messages as before. The result is shown in the panel
 * (green or red) instead of a modal, the way the login page reports its own
 * errors.
 */
export default function ForgetPassword() {
  const { t } = useTranslation();
  useLanguageCatchUp();

  const [UserName, setUserName] = useState("");
  const [Loading, setLoading] = useState(false);
  const [Error, setError] = useState("");
  const [Done, setDone] = useState("");

  const ResetPassword = async () => {
    if (Loading) return;
    setDone("");
    if (UserName === "") {
      setError(t("Please enter your user name"));
      return;
    }
    setError("");
    setLoading(true);
    await Helper.AuthHelper.ForgetPassword({ UserName }, (resData) => {
      const Message =
        resData && resData.Message
          ? t(resData.Message)
          : t("An error occurred");
      if (resData && resData.Success) setDone(Message);
      else setError(Message);
    });
    setLoading(false);
  };

  return (
    <AuthShell
      Title={t("Forgot Password")}
      Sub={t(
        "A password reset link will be sent to the email address registered on your account",
      )}
      onSubmit={ResetPassword}
    >
      <div role="alert" aria-live="polite">
        {Error ? <p className="err">{Error}</p> : null}
        {Done ? <p className="ok">{Done}</p> : null}
      </div>

      <AuthField
        Id="forget-username"
        Label={t("User name")}
        Icon="user"
        Bad={Boolean(Error && !UserName)}
      >
        <input
          id="forget-username"
          name="username"
          type="text"
          autoComplete="username"
          autoFocus
          className={Error && !UserName ? "bad" : undefined}
          value={UserName}
          disabled={Loading}
          onChange={(e) => {
            setUserName(e.target.value);
            if (e.target.value) setError("");
          }}
        />
      </AuthField>

      <AuthSubmit
        Loading={Loading}
        Label={t("Reset Password")}
        LoadingLabel={t("Sending...")}
      />

      <div className="row">
        <AuthLink To="/auth/login">{t("Back to Login")}</AuthLink>
      </div>
    </AuthShell>
  );
}
