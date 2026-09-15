import React, { useState } from "react";
// translation
import { useTranslation } from "react-i18next";
// helper
import Helper from "helper";
// history
import customHistory from "customHistory";

import AuthShell, { AuthLink, useLanguageCatchUp } from "./AuthShell";

/**
 * Set a new password from the emailed link (?UserName=…&Token=…).
 *
 * Same service call and the same flow: a mismatch is reported in the panel;
 * the server's answer still comes as a dialog, because a success sends the user
 * on to the login page once they have read it.
 */
export default function ResetPassword() {
  const { t } = useTranslation();
  useLanguageCatchUp();

  // Both come from the emailed link and are read once. They were copied into
  // state from an effect, which is a cascading render for a value that is
  // known before the first one.
  const urlParam = (Name) =>
    Helper.BaseHelper.getUrlParam(window.location.href, Name) || "";
  const [UserName, setUserName] = useState(() => urlParam("UserName"));
  const [Token] = useState(() => urlParam("Token") || null);
  const [Password, setPassword] = useState("");
  const [ConfirmPassword, setConfirmPassword] = useState("");
  const [ShowPassword, setShowPassword] = useState(false);
  const [Alert, setAlert] = useState(null);
  const [Error, setError] = useState("");

  const ShowAlert = (Message, Success) => {
    const Alert = Helper.BaseCrudHelper.ShowAlert(Message, Success, () => {
      setAlert(null);
      if (Success === true) customHistory.push("/auth/login");
    });
    setAlert(Alert);
  };

  const RessetPass = async () => {
    if (Password + "" === ConfirmPassword + "") {
      setError("");
      await Helper.AuthHelper.ResetPassword(
        { UserName, Token, Password },
        (resData) => resData && ShowAlert(resData.Message, resData.Success),
      );
    } else {
      setError(t("Password iteration is incorrect"));
    }
  };

  return (
    <AuthShell Title={t("Шинээр нууц үг хуудас")} onSubmit={RessetPass}>
      {Alert}
      <div role="alert" aria-live="polite">
        {Error ? <p className="err">{Error}</p> : null}
      </div>

      <label htmlFor="reset-username">{t("User name")}</label>
      <input
        id="reset-username"
        name="username"
        type="text"
        autoComplete="username"
        value={UserName}
        onChange={(e) => setUserName(e.target.value)}
      />

      <label htmlFor="reset-password">{t("Password")}</label>
      <div className="pw">
        <input
          id="reset-password"
          name="new-password"
          type={ShowPassword ? "text" : "password"}
          autoComplete="new-password"
          value={Password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          aria-label={ShowPassword ? t("Hide password") : t("Show password")}
        >
          {ShowPassword ? t("Нуух") : t("Харах")}
        </button>
      </div>

      <label htmlFor="reset-confirm">{t("Confirm password")}</label>
      <input
        id="reset-confirm"
        name="confirm-password"
        type={ShowPassword ? "text" : "password"}
        autoComplete="new-password"
        className={Error ? "bad" : undefined}
        value={ConfirmPassword}
        onChange={(e) => {
          setConfirmPassword(e.target.value);
          if (Error) setError("");
        }}
      />

      <button className="btn" type="submit">
        {t("Save")}
      </button>

      <div className="row">
        <AuthLink To="/auth/login">{t("Login")}</AuthLink>
      </div>
    </AuthShell>
  );
}
