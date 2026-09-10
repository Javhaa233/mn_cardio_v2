import React, { useEffect, useRef, useState } from "react";
// translation
import { useTranslation } from "react-i18next";
// scene
import LoginScene from "./LoginScene";
// assets
import logo from "assets/img/new_logo.png";
// history
import customHistory from "customHistory";
// helper
import Helper from "helper";

// After this many failures we stop repeating the server's message and point the
// user at IT support instead, which is what they actually need by then.
const SUPPORT_AFTER_ATTEMPTS = 3;
const SUPPORT_PHONE = "99243182";

// How long after the last keystroke the backdrop stays calmed.
const TYPING_IDLE_MS = 1500;

export default function LoginPage() {
  const { t } = useTranslation();

  const [UserName, setUserName] = useState("");
  const [Password, setPassword] = useState("");
  const [ShowPassword, setShowPassword] = useState(false);
  const [Loading, setLoading] = useState(false);
  const [Error, setError] = useState("");
  const [UserNameError, setUserNameError] = useState(false);
  const [PasswordError, setPasswordError] = useState(false);
  const [FailedAttempts, setFailedAttempts] = useState(0);
  const [Typing, setTyping] = useState(false);

  // `Typing` calms the backdrop while credentials are being entered. It must NOT
  // be driven by focus. The username input carries autoFocus, so onFocus fired at
  // mount and the scene was quieted from its very first frame - which paused the
  // intro animations permanently. Eight rule blocks in LoginScene.css start at
  // opacity:0 and only become visible VIA an animation (.hfill - the heart fill -
  // plus .blip, .ring, .reglink, .hub-glow, .hub-core, .wave, .aimag), so they
  // never appeared at all until the user clicked elsewhere and blurred the field.
  // Confirmed in Chrome: at t=16s the stage was still "quiet" and .hfill was
  // still opacity 0. Driving this from real input fixes it at the source.
  const IdleTimer = useRef(null);

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

  useEffect(() => () => {
    if (IdleTimer.current) clearTimeout(IdleTimer.current);
  }, []);

  // Already signed in - don't make them log in twice.
  useEffect(() => {
    const LogedUser = Helper.AuthHelper.GetLogedUserLocal();
    if (LogedUser) {
      if (LogedUser.RoleId + "" === "4") document.location = "/patient";
      else document.location = "/admin";
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

    await Helper.AuthHelper.Login(
      { UserName, Password },
      (Success, RoleId, Message) => {
        if (Success === true && RoleId) {
          if (RoleId + "" === "4") document.location = "/patient";
          else document.location = "/admin";
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
          setError(Message || t("An error occurred"));
        }
      },
    );

    setLoading(false);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    Login();
  };

  return (
    <div className="login-v2">
      <LoginScene Quiet={Typing} />

      <main className="shell">
        <form className="panel" onSubmit={onSubmit} noValidate>
          <div className="mark">
            <img src={logo} alt="" />
            <b>
              {t("Зүрх судасны үндэсний систем")}
              <span>{t("Эмнэлзүйн бүртгэл ба зайн оношилгоо")}</span>
            </b>
          </div>

          <h1>{t("Login")}</h1>
          <p className="sub">{t("Байгууллагаас олгосон эрхээ ашиглана уу.")}</p>

          {/* Announced to screen readers without stealing focus. */}
          <div role="alert" aria-live="polite">
            {Error ? <p className="err">{Error}</p> : null}
          </div>

          <label htmlFor="login-username">{t("User name")}</label>
          <input
            id="login-username"
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

          <label htmlFor="login-password">{t("Password")}</label>
          <div className="pw">
            <input
              id="login-password"
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
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={
                ShowPassword ? t("Hide password") : t("Show password")
              }
            >
              {ShowPassword ? t("Нуух") : t("Харах")}
            </button>
          </div>

          <button className="btn" type="submit" disabled={Loading}>
            {Loading ? t("Logging in...") : t("Login")}
          </button>

          <div className="row">
            <a
              href="/auth/forget-password"
              onClick={(e) => {
                e.preventDefault();
                customHistory.push("/auth/forget-password");
              }}
            >
              {t("Forgot password?")}
            </a>
            <a
              href="/auth/register"
              onClick={(e) => {
                e.preventDefault();
                customHistory.push("/auth/register");
              }}
            >
              {t("Create account")}
            </a>
          </div>

          <div className="foot">
            smr.telemedicine.mn
            <br />
            {t("ЭМЯ-ны Мэдээллийн технологийн зөвлөлөөр батлагдсан")} ·
            2022.04.15
            <br />
            {t("Мэдээллийн технологийн ажилтантай холбогдох")}:{" "}
            <a href={"tel:+976" + SUPPORT_PHONE}>{SUPPORT_PHONE}</a>
          </div>
        </form>
      </main>
    </div>
  );
}
