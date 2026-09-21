import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import i18next from "i18next";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";

import TopBarIconButton from "./TopBarIconButton";
import { FlagMN, FlagGB } from "./FlagGlyphs";
import Helper from "helper";

/**
 * One-flag language toggle. Replaces the two always-visible MN / EN text
 * buttons.
 *
 * The flag shown is the flag of the CURRENT language: seeing the Union Flag
 * means the UI is in English. Because a one-flag toggle is inherently ambiguous
 * about current-vs-next, the tooltip carries the whole disambiguation and is
 * phrased as an ACTION ("Switch to English"), never as a label.
 */
export default function LanguageToggle({ SeedFromAccount = true }) {
  const { t } = useTranslation();
  // Seeded from the stored user - moved here from AdminNavbarLinks. Read lazily
  // in the initialiser rather than in an effect, so there is no second render
  // and no setState-in-effect.
  const [Language, setLanguage] = useState(() => {
    if (!SeedFromAccount) {
      // Follow whatever the app already resolved, which i18n.js takes from the
      // saved choice and otherwise defaults to Mongolian.
      return i18next.resolvedLanguage || i18next.language || "mn";
    }
    const User = Helper.AuthHelper.GetLogedUserLocal();
    // Default Mongolian, not English - an account with no Language set is a
    // Mongolian clinician, and this effect calls changeLanguage() on mount, so
    // an "en" default actively forced the whole shell into English.
    return User && User.Language ? User.Language : "mn";
  });

  useEffect(() => {
    // With SeedFromAccount off there is nothing to apply: the language already
    // is what i18n resolved, and calling changeLanguage here would re-assert
    // the account's stored value over the patient's explicit choice.
    if (!SeedFromAccount) return;
    i18next.changeLanguage(Language);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ChangeLanguage = async () => {
    const previous = Language;
    const next = previous === "mn" ? "en" : "mn";

    // Optimistic: flip immediately, persist after. The old code awaited the
    // server round-trip BEFORE updating state, so a single click produced
    // visible dead time with no feedback at all.
    setLanguage(next);
    i18next.changeLanguage(next);

    try {
      await Helper.AuthHelper.ChangeLanguage(next);
    } catch (ex) {
      process.env.NODE_ENV === "development" && console.log(ex);
      setLanguage(previous);
      i18next.changeLanguage(previous);
    }
  };

  const isMn = Language === "mn";
  const label = isMn ? t("Switch to English") : t("Switch to Mongolian");

  return (
    <>
      <TopBarIconButton title={label} onClick={ChangeLanguage}>
        {isMn ? <FlagMN /> : <FlagGB />}
      </TopBarIconButton>
      {/* Announced to screen readers after the switch. */}
      <Box
        component="span"
        aria-live="polite"
        sx={{
          position: "absolute",
          width: 1,
          height: 1,
          overflow: "hidden",
          clip: "rect(0 0 0 0)",
          whiteSpace: "nowrap",
        }}
      >
        {isMn ? t("Mongolian") : t("English")}
      </Box>
    </>
  );
}

LanguageToggle.propTypes = {
  /**
   * Apply the signed-in account's `Language` field on mount.
   *
   * True on the doctor bar, which is how it has always behaved. FALSE on the
   * patient bar: CLAUDE.md section 6 is explicit that the portal follows a
   * saved choice and otherwise Mongolian, because a half-English portal has
   * shipped to citizens before. An account carrying Language "en" - often set
   * by accident, or by a clinician creating the account - would otherwise flip
   * the whole portal to English with the patient never having asked. The
   * toggle still switches the language and still persists it; it just does not
   * assert one on arrival.
   */
  SeedFromAccount: PropTypes.bool,
};
