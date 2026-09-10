import Helper from "helper";

function CVDHelper() {}

CVDHelper.prototype.calculateRisk = async (data, callback) => {
  await Helper.BaseCrudHelper.CallService(
    "/RiskScores/CalculateRisk",
    data,
    (data) => callback && callback(data),
  );
};

/**
 * Gender and age for the risk lookup.
 *
 * The recorded values win; the registration number is only a fallback. That is
 * the same precedence the backend already applies in
 * CVDMonitoringController.getBirthDateAndAge, which prefers Patient.p_birthday
 * and parses the РД only when it is missing.
 *
 * WHAT CHANGED, and why it is a clinical change (needs ЗСҮТ sign-off):
 *
 *   AGE. The old code did `currentYear - birthYear`, a calendar-year
 *   subtraction that ignores whether the birthday has happened yet - so it was
 *   ONE YEAR TOO HIGH for everyone born later in the year. RiskScores rows are
 *   banded by minAge/maxAge, so that put patients sitting on a band boundary
 *   into the wrong band. This is the defect that actually moved risk scores.
 *   It now uses ObjectHelper.GetBirthDateFromRegNo, which is birthday-aware,
 *   applies the MM+20 century rule and rejects impossible dates.
 *
 *   GENDER. The old line was `parseInt(PatRegNo.substr(7, 8), 10) % 2`. The
 *   previous comment here claimed this read "the last three characters rather
 *   than the gender digit" and therefore changed the band for some patients.
 *   That reasoning was wrong: substr's second argument is a length, so on a
 *   10-character РД it runs to the end of the string, and an integer's parity
 *   is decided by its final digit - so for any well-formed РД it returned the
 *   same answer as reading the gender digit. What it did do was return "M"
 *   silently for malformed input, because parseInt gave NaN and NaN % 2 === 0
 *   is false. Gender now comes from the stored p_gender, and the fallback reads
 *   the last digit explicitly - the same rule PatientForm.jsx uses when it
 *   WRITES p_gender (even -> female).
 *
 * `patient` is optional; pass the Patient row when you have one (both callers
 * already receive it in their existing payload).
 */
CVDHelper.prototype.deriveGenderAge = (PatRegNo, patient) => {
  const regNo = PatRegNo
    ? String(PatRegNo).replace(/\s/g, "").toUpperCase()
    : "";

  // --- gender: stored value first, coded 1 = female / 2 = male -------------
  let gender = null;
  const stored = patient && patient.p_gender;
  if (stored !== null && stored !== undefined && stored !== "") {
    const s = String(stored).toUpperCase();
    if (s === "1" || s === "F" || s === "FEMALE") gender = "F";
    else if (s === "2" || s === "M" || s === "MALE") gender = "M";
  }
  if (!gender && /^\d$/.test(regNo.slice(-1))) {
    gender = parseInt(regNo.slice(-1), 10) % 2 === 0 ? "F" : "M";
  }

  // --- age: stored birthday first, then the validated РД parser ------------
  let age = null;
  const birthday = patient && patient.p_birthday;
  if (birthday) {
    const d = new Date(birthday);
    if (!isNaN(d.getTime())) {
      const today = new Date();
      age = today.getFullYear() - d.getFullYear();
      const m = today.getMonth() - d.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
    }
  }
  if (age === null && regNo) {
    const parsed = Helper.ObjectHelper.GetBirthDateFromRegNo(regNo);
    if (parsed && parsed.Age !== null && parsed.Age !== undefined)
      age = parsed.Age;
  }

  return { gender, age };
};

/**
 * The inputs the WHO/ISH band lookup expects, built from the same two records
 * the doctor screen uses: the patient's own history and their body measurements.
 *
 * `patient` is optional and only supplies gender/age; pass the Patient row when
 * the caller has one, so the recorded values are used in preference to the
 * registration number.
 */
CVDHelper.prototype.buildRiskInput = (PatRegNo, history, bodySize, patient) => {
  const num = (v) => (!isNaN(parseFloat(v)) ? parseFloat(v) : 0);

  const cholestrol = num(bodySize && bodySize.Cholesterol);
  const pressure = num(bodySize && bodySize.DaraltDeed);
  const BMI = num(bodySize && bodySize.BJI);
  const { gender, age } = CVDHelper.prototype.deriveGenderAge(
    PatRegNo,
    patient,
  );

  return {
    gender,
    age,
    isCholestrol: cholestrol === 0 ? "No" : "Yes",
    isDiabetes: history && history.TsusniiSahar === "y" ? "Yes" : "No",
    isSmoker: history && history.TamkhiTatdag === "y" ? "Yes" : "No",
    cholestrol,
    pressure,
    BMI,
  };
};

/** the colour/description band for a 1-5 risk level */
CVDHelper.prototype.riskBand = (level) => {
  switch (level) {
    case 5:
      return {
        bodyColor: "brown",
        bodyText:
          "Зүрхний шигдээс болон тархины харвалтын 10 жилийн эрсдэл 30-аас дээш хувь",
      };
    case 4:
      return {
        bodyColor: "red",
        bodyText:
          "Зүрхний шигдээс болон тархины харвалтын 10 жилийн эрсдэл 20-30 хувь",
      };
    case 3:
      return {
        bodyColor: "orange",
        bodyText:
          "Зүрхний шигдээс болон тархины харвалтын 10 жилийн эрсдэл 10-20 хувь",
      };
    case 2:
      return {
        bodyColor: "yellow",
        bodyText:
          "Зүрхний шигдээс болон тархины харвалтын 10 жилийн эрсдэл 5-10 хувь",
      };
    case 1:
      return {
        bodyColor: "green",
        bodyText:
          "Зүрхний шигдээс болон тархины харвалтын 10 жилийн эрсдэл 5-аас бага хувь",
      };
    default:
      return { bodyColor: null, bodyText: null };
  }
};

export default new CVDHelper();
