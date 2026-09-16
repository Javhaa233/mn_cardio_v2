import React, { useEffect, useReducer, useRef } from "react";
import { useTranslation } from "react-i18next";

import LoginScene from "./LoginScene";
import BuildStamp from "components/Navbars/BuildStamp";
import centreLogo from "assets/img/new_print.png";
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
 * Line icons for the sign-in panel, drawn inline on a 24-unit grid. Inline SVG
 * rather than @mui/icons-material: these screens are styled by plain CSS in
 * LoginScene.css, and the icons take their colour from `currentColor` there.
 */
const ICON_PATHS = {
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-3.6 3.6-6 8-6s8 2.4 8 6" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7.5a4 4 0 0 1 8 0V11" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  eyeOff: (
    <>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
      <path d="M3.5 3.5l17 17" />
    </>
  ),
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
};

export function AuthIcon({ Name, className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {ICON_PATHS[Name]}
    </svg>
  );
}

/**
 * A labelled input with a leading icon. The label stays above the field so it
 * is always readable; `children` is the <input> itself, and `Trailing` an
 * optional button inside the right edge (the password reveal).
 */
export function AuthField({
  Id,
  Label,
  Icon,
  Bad = false,
  Trailing,
  children,
}) {
  return (
    <>
      <label htmlFor={Id}>{Label}</label>
      <div
        className={
          "field" + (Bad ? " bad" : "") + (Trailing ? " has-trailing" : "")
        }
      >
        <AuthIcon Name={Icon} className="field-ic" />
        {children}
        {Trailing}
      </div>
    </>
  );
}

/** The eye button that shows or hides a password field. */
export function PasswordToggle({ Shown, onToggle }) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      className="field-btn"
      onClick={onToggle}
      aria-pressed={Shown}
      aria-label={Shown ? t("Hide password") : t("Show password")}
      title={Shown ? t("Hide password") : t("Show password")}
    >
      <AuthIcon Name={Shown ? "eyeOff" : "eye"} />
    </button>
  );
}

/**
 * The panel's primary button. While loading, the arrow becomes a small ECG
 * trace that keeps drawing, the same motif as the backdrop behind the panel.
 */
export function AuthSubmit({ Loading = false, Label, LoadingLabel }) {
  return (
    <button
      className="btn"
      type="submit"
      disabled={Loading}
      aria-busy={Loading}
    >
      <span>{Loading ? LoadingLabel : Label}</span>
      {Loading ? (
        <svg className="btn-ecg" viewBox="0 0 28 16" aria-hidden="true">
          <polyline points="1,9 8,9 10.5,4 14,14 16.5,9 27,9" />
        </svg>
      ) : (
        <AuthIcon Name="arrow" className="btn-arrow" />
      )}
    </button>
  );
}

/**
 * The brand at the top of the panel: the National Cardiovascular Centre logo,
 * whose cyan and pink heart is the same heart the backdrop draws. The source is
 * 599x163, so at 72px tall (265px wide) it stays sharp on 2x screens.
 */
export function AuthBrand() {
  return (
    <div className="mark">
      <img
        className="mark-logo"
        src={centreLogo}
        width="265"
        height="72"
        alt="Зүрх судасны үндэсний төв - National Cardiovascular Centre"
      />
    </div>
  );
}

/**
 * The frame every sign-in screen shares with the doctor login: the animated
 * map, the brand mark and the title.
 *
 * Register, forgot password, reset password and the patient login were
 * Creative Tim cards - pink and purple gradient headers, round buttons, a
 * different background - so leaving the login page for "Forgot password?" felt
 * like leaving the product. They now render inside the same panel, styled by
 * LoginScene.css. LoginPage keeps its own frame markup but uses the same
 * brand, field and button pieces exported above.
 */
export default function AuthShell({
  Title,
  Sub,
  Quiet = false,
  Wide = false,
  onSubmit,
  children,
}) {
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
          <AuthBrand />

          <h1>{Title}</h1>
          {Sub ? <p className="sub">{Sub}</p> : null}

          {children}

          {/* Which build this is, before anyone signs in. Same component as the
              profile menu, so the two can never disagree. */}
          <BuildStamp />
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
