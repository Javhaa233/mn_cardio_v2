import React, { useEffect, useReducer, useRef } from "react";
import { useTranslation } from "react-i18next";

import LoginScene from "./LoginScene";
import logo from "assets/img/new_logo.png";
import customHistory from "customHistory";

export const SUPPORT_PHONE = "99243182";

/**
 * Re-render once if the language changed while this page was mounting.
 *
 * AuthNavbar switches to Mongolian in an effect on mount, while the sign-in
 * page is still arriving as a lazy chunk. If that switch lands between the
 * page's first render and react-i18next's subscription, the page stays in the
 * browser's language (English in a fresh browser) until something else
 * re-renders it. The old Creative Tim pages hid this by accident: their 700ms
 * card fade-in re-rendered them. Call it at the top of a function sign-in page.
 */
export function useLanguageCatchUp() {
  const { i18n } = useTranslation();
  const RenderedWith = useRef(i18n.language);
  const [, Rerender] = useReducer((n) => n + 1, 0);
  useEffect(() => {
    if (i18n.language !== RenderedWith.current) Rerender();
  }, [i18n]);
}

/**
 * The frame every sign-in screen shares with the doctor login: the animated
 * map, the brand mark, the title, and the support footer.
 *
 * Register, forgot password, reset password and the patient login were
 * Creative Tim cards - pink and purple gradient headers, round buttons, a
 * different background - so leaving the login page for "Forgot password?" felt
 * like leaving the product. They now render inside the same panel, styled by
 * LoginScene.css. LoginPage itself keeps its own markup (it is the reference).
 */
export default function AuthShell({
  Title,
  Sub,
  Quiet = false,
  Wide = false,
  onSubmit,
  children,
}) {
  const { t } = useTranslation();

  return (
    <div className="login-v2">
      <LoginScene Quiet={Quiet} />

      <main className="shell">
        <form
          className={"panel" + (Wide ? " wide" : "")}
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit && onSubmit();
          }}
        >
          <div className="mark">
            <img src={logo} alt="" />
            <b>
              {t("Зүрх судасны үндэсний систем")}
              <span>{t("Эмнэлзүйн бүртгэл ба зайн оношилгоо")}</span>
            </b>
          </div>

          <h1>{Title}</h1>
          {Sub ? <p className="sub">{Sub}</p> : null}

          {children}

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

/** An in-app link that navigates without a full page load. */
export function AuthLink({ To, children }) {
  return (
    <a
      href={To}
      onClick={(e) => {
        e.preventDefault();
        customHistory.push(To);
      }}
    >
      {children}
    </a>
  );
}
