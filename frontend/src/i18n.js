import i18n from "i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

// Mongolian is the product language: this is a Mongolian national system and
// every source key in the catalogs is already Mongolian. Falling back to "en"
// meant any browser reporting en-US - which is most of them, and every headless
// one - rendered the citizen portal in English.
const fallbackLng = ["mn"];
const availableLanguages = ["en", "mn"];

const options = {
  // order and from where user language should be detected.
  //
  // "localStorage" has to be FIRST and has to be here at all: `caches` below
  // writes the chosen language to localStorage, but a key missing from this
  // list is never read back, so the toggle was written and then ignored on the
  // next load.
  //
  // "navigator" and "htmlTag" are gone: an en-US phone (and index.html's
  // lang="en") made the patient portal half English - every key with an
  // English translation switched, every Mongolian-only key did not. The staff
  // side never showed it because AuthNavbar forces "mn" on mount; the patient
  // login and portal have no language switch at all. A saved choice still
  // wins; with none, the fallback below (mn) applies.
  order: ["localStorage", "cookie"],

  // keys or params to lookup language from
  lookupQuerystring: "lng",
  lookupCookie: "i18next",
  lookupLocalStorage: "i18nextLng",
  lookupFromPathIndex: 0,
  lookupFromSubdomainIndex: 0,

  // cache user language on
  caches: ["localStorage", "cookie"],
  excludeCacheFor: ["cimode"], // languages to not persist (cookie, localStorage)

  // optional expire and domain for set cookie
  cookieMinutes: 10,
  cookieDomain: "myDomain",

  // optional htmlTag with lang attribute, the default is:
  htmlTag: document.documentElement,

  // only detect languages that are in the whitelist
  checkWhitelist: true,
};

i18n
  .use(Backend) // load translation using xhr -> see /public/locales. We will add locales in the next step

  .use(LanguageDetector) // detect user language

  .use(initReactI18next) // pass the i18n instance to react-i18next.

  .init({
    fallbackLng, // if user computer language is not on the list of available languages, than we will be using the fallback language specified earlier
    debug: false,
    whitelist: availableLanguages,
    detection: options,
    nsSeparator: false,
    keySeparator: false,
    interpolation: { escapeValue: false },
  });

export default i18n;
