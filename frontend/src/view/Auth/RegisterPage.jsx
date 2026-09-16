import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
// helper
import Helper from "helper";
import {
  ValidateEmail,
  ValidatePhone,
  NormalizeEmail,
  NormalizePhone,
} from "helper/ContactValidation";
import { PASSWORD_RULES, PasswordMeetsRules } from "helper/PasswordRules";

import AuthShell, {
  AuthField,
  AuthLink,
  AuthSubmit,
  PasswordToggle,
  useLanguageCatchUp,
} from "./AuthShell";

const EMPTY = {
  UserName: "",
  Password: "",
  PasswordConfirm: "",
  LastName: "",
  FirstName: "",
  Registration: "",
  Email: "",
  Telephone: "",
  License: "",
  Profession: "",
  OrgProvince: "",
  OrganizationId: "",
  addr_prov_city: "",
  addr_soum_dist: "",
  addr_bag_khoroo: "",
};

// Регистрийн дугаар - the server checks the same.
const REGISTRATION_REGEX = /^[А-ЯЁӨҮ]{2}\d{8}$/i;

// Field order, for focusing the first problem after a failed submit.
const ORDER = [
  "UserName",
  "Password",
  "PasswordConfirm",
  "LastName",
  "FirstName",
  "Registration",
  "Email",
  "Telephone",
  "License",
  "OrganizationId",
];

function Validate(Values) {
  const E = {};
  const UserName = Values.UserName.trim();
  if (!UserName) E.UserName = "Please enter your username";
  else if (/\s/.test(UserName) || UserName.length < 4)
    E.UserName = "The username must be at least 4 characters long";
  if (!PasswordMeetsRules(Values.Password))
    E.Password = "Нууц үг шаардлага хангахгүй байна";
  if (Values.Password !== Values.PasswordConfirm)
    E.PasswordConfirm = "Password iteration is incorrect";
  if (!Values.LastName.trim()) E.LastName = "Овгоо оруулна уу";
  if (!Values.FirstName.trim()) E.FirstName = "Нэрээ оруулна уу";
  if (!REGISTRATION_REGEX.test(Values.Registration.trim()))
    E.Registration = "Регистрийн дугаар буруу байна";
  const EmailError = ValidateEmail(Values.Email);
  if (EmailError) E.Email = EmailError;
  const PhoneError = ValidatePhone(Values.Telephone);
  if (PhoneError) E.Telephone = PhoneError;
  if (!Values.License.trim())
    E.License = "Мэргэжлийн үйл ажиллагааны зөвшөөрлийн дугаараа оруулна уу";
  if (!Values.OrganizationId)
    E.OrganizationId = "Ажилладаг байгууллагаа сонгоно уу";
  return E;
}

const CallPublic = (Url, Data) =>
  new Promise((Resolve) =>
    Helper.BaseCrudHelper.CallServiceWithoutToken(Url, Data, (Res) =>
      Resolve(Res || {}),
    ),
  );

/**
 * Doctor sign-up ("Эмчээр бүртгүүлэх").
 *
 * The doctor chooses their own password here. Submitting creates only a
 * REQUEST - there is no account until an administrator approves it, and then
 * they log in with the password they chose. Citizens do not register here; they
 * sign in through ХУР / ДАН.
 */
export default function RegisterPage() {
  const { t } = useTranslation();
  useLanguageCatchUp();

  const [Values, setValues] = useState(EMPTY);
  const [Errors, setErrors] = useState({});
  const [FormError, setFormError] = useState("");
  const [Loading, setLoading] = useState(false);
  const [Done, setDone] = useState("");
  const [ShowPassword, setShowPassword] = useState(false);
  // idle | checking | good | bad
  const [UserCheck, setUserCheck] = useState({ State: "idle", Message: "" });
  const [Provinces, setProvinces] = useState([]);
  const [Soums, setSoums] = useState([]);
  const [Bags, setBags] = useState([]);
  const [Organizations, setOrganizations] = useState([]);
  const [OrgFilter, setOrgFilter] = useState("");
  // Only the latest user-name check may land; an older, slower answer is dropped.
  const CheckSeq = useRef(0);
  const OrgSeq = useRef(0);

  useEffect(() => {
    // A signed-in staff member has no business here.
    const LogedUser = Helper.AuthHelper.GetLogedUserLocal();
    if (LogedUser && LogedUser.RoleId && LogedUser.RoleId + "" !== "4") {
      document.location = "/admin";
      return;
    }
    CallPublic("UserRequest/GetProvinceData", {
      ObjectName: "DictProvinceCity",
      Option: { Field: "name", Type: "NotEquals", Value: "" },
    }).then((Res) => Res.Success && setProvinces(Res.Data || []));
  }, []);

  const Set = (Field, Value) => {
    setValues((Prev) => ({ ...Prev, [Field]: Value }));
    if (Errors[Field]) setErrors((Prev) => ({ ...Prev, [Field]: null }));
    if (FormError) setFormError("");
  };

  const ChangeUserName = (Value) => {
    Set("UserName", Value);
    // Whatever was checked is no longer what is typed.
    CheckSeq.current += 1;
    if (UserCheck.State !== "idle")
      setUserCheck({ State: "idle", Message: "" });
  };

  const CheckUserName = async (Raw) => {
    const UserName = String(Raw || "").replace(/\s/g, "");
    if (UserName !== Raw) Set("UserName", UserName);
    if (UserName.length < 4) {
      setUserCheck({
        State: UserName ? "bad" : "idle",
        Message: UserName
          ? "The username must be at least 4 characters long"
          : "",
      });
      return;
    }
    const Seq = ++CheckSeq.current;
    setUserCheck({ State: "checking", Message: "" });
    const Res = await CallPublic("UserRequest/CheckUserName", { UserName });
    if (Seq !== CheckSeq.current) return;
    setUserCheck(
      Res.Success
        ? { State: "good", Message: "" }
        : {
            State: "bad",
            Message: Res.Message || "Сервертэй холбогдож чадсангүй",
          },
    );
  };

  const ChangeOrgProvince = async (Value) => {
    Set("OrgProvince", Value);
    Set("OrganizationId", "");
    setOrgFilter("");
    setOrganizations([]);
    if (!Value) return;
    const Seq = ++OrgSeq.current;
    const Res = await CallPublic("UserRequest/GetOrganizations", {
      ProvinceId: Value,
    });
    if (Seq === OrgSeq.current && Res.Success) setOrganizations(Res.Data || []);
  };

  const ChangeAddress = async (Field, Value) => {
    if (Field === "addr_prov_city") {
      setValues((Prev) => ({
        ...Prev,
        addr_prov_city: Value,
        addr_soum_dist: "",
        addr_bag_khoroo: "",
      }));
      setSoums([]);
      setBags([]);
      if (!Value) return;
      const Res = await CallPublic("UserRequest/GetProvinceData", {
        ObjectName: "DictSoumDistrict",
        Option: { Field: "id_province", Type: "Equals", Value },
      });
      if (Res.Success) setSoums(Res.Data || []);
    } else if (Field === "addr_soum_dist") {
      setValues((Prev) => ({
        ...Prev,
        addr_soum_dist: Value,
        addr_bag_khoroo: "",
      }));
      setBags([]);
      if (!Value) return;
      const Res = await CallPublic("UserRequest/GetProvinceData", {
        ObjectName: "DictBagKhoroo",
        Option: { Field: "id_soum", Type: "Equals", Value },
      });
      if (Res.Success) setBags(Res.Data || []);
    } else {
      Set(Field, Value);
    }
  };

  const Submit = async () => {
    if (Loading) return;
    const Found = Validate(Values);
    if (UserCheck.State === "bad" && !Found.UserName)
      Found.UserName = UserCheck.Message;
    const First = ORDER.find((Key) => Found[Key]);
    if (First) {
      setErrors(Found);
      setFormError("Тэмдэглэсэн талбаруудыг засна уу");
      const El = document.getElementById("register-" + First);
      El && El.focus();
      return;
    }

    setLoading(true);
    setFormError("");
    const Data = {
      UserName: Values.UserName.trim(),
      Password: Values.Password,
      LastName: Values.LastName.trim(),
      FirstName: Values.FirstName.trim(),
      Registration: Values.Registration.trim().toUpperCase(),
      Email: NormalizeEmail(Values.Email),
      Telephone: NormalizePhone(Values.Telephone),
      License: Values.License.trim(),
      Profession: Values.Profession.trim(),
      OrganizationId: Values.OrganizationId,
      addr_prov_city: Values.addr_prov_city,
      addr_soum_dist: Values.addr_soum_dist,
      addr_bag_khoroo: Values.addr_bag_khoroo,
    };
    const Res = await CallPublic("/UserRequest/Register", {
      Data: JSON.stringify(Data),
    });
    setLoading(false);
    if (Res.Success) {
      setValues(EMPTY);
      setDone(Res.Message || "Бүртгэлийн хүсэлт илгээгдлээ");
    } else {
      setFormError(Res.Message || "Сервертэй холбогдож чадсангүй");
    }
  };

  const Hint = (Field) =>
    Errors[Field] ? (
      <p className="hint bad" id={"register-" + Field + "-error"}>
        {t(Errors[Field])}
      </p>
    ) : null;

  const Text = (
    Field,
    Label,
    { Type = "text", Auto, Required = true, Placeholder } = {},
  ) => (
    <div>
      <label htmlFor={"register-" + Field}>
        {Label}
        {Required ? " *" : ""}
      </label>
      <input
        id={"register-" + Field}
        name={Field}
        type={Type}
        autoComplete={Auto}
        placeholder={Placeholder}
        className={Errors[Field] ? "bad" : undefined}
        aria-invalid={!!Errors[Field] || undefined}
        aria-describedby={
          Errors[Field] ? "register-" + Field + "-error" : undefined
        }
        value={Values[Field]}
        disabled={Loading}
        onChange={(e) => Set(Field, e.target.value)}
      />
      {Hint(Field)}
    </div>
  );

  const Select = (
    Field,
    Label,
    Options,
    OnChange,
    { Required = false, IdKey = "id_data", NameKey = "name" } = {},
  ) => (
    <div>
      <label htmlFor={"register-" + Field}>
        {Label}
        {Required ? " *" : ""}
      </label>
      <select
        id={"register-" + Field}
        name={Field}
        className={Errors[Field] ? "bad" : undefined}
        aria-invalid={!!Errors[Field] || undefined}
        value={Values[Field] || ""}
        disabled={Loading || Options.length === 0}
        onChange={(e) => OnChange(e.target.value)}
      >
        <option value="">{t("-- Сонгох --")}</option>
        {Options.map((o) => (
          <option key={o[IdKey]} value={o[IdKey] + ""}>
            {o[NameKey]}
          </option>
        ))}
      </select>
      {Hint(Field)}
    </div>
  );

  if (Done) {
    return (
      <AuthShell Title={t("Эмчээр бүртгүүлэх")}>
        <p className="ok" role="status">
          {t(Done)}
        </p>
        <p className="sub">
          {t(
            "Админ хүсэлтийг баталгаажуулсны дараа бүртгүүлэхдээ сонгосон нэр, нууц үгээрээ нэвтэрнэ.",
          )}
        </p>
        <div className="row">
          <AuthLink To="/auth/login">{t("Login")}</AuthLink>
        </div>
      </AuthShell>
    );
  }

  const Filter = OrgFilter.trim().toLowerCase();
  const OrgOptions = Filter
    ? Organizations.filter(
        (o) =>
          (o.Name || "").toLowerCase().includes(Filter) ||
          o.Id + "" === Values.OrganizationId,
      )
    : Organizations;
  const Met = PASSWORD_RULES.map((Rule) => Rule.Test(Values.Password));

  return (
    <AuthShell
      Title={t("Эмчээр бүртгүүлэх")}
      Sub={t(
        "Хүсэлтийг админ баталгаажуулсны дараа нэвтрэх эрх нээгдэнэ. Иргэд ХУР / ДАН-аар нэвтэрнэ.",
      )}
      Wide
      onSubmit={Submit}
    >
      <div role="alert" aria-live="polite">
        {FormError ? <p className="err">{t(FormError)}</p> : null}
      </div>

      <div className="section" role="heading" aria-level="2">
        {t("Нэвтрэх мэдээлэл")}
      </div>
      <AuthField
        Id="register-UserName"
        Label={t("User name") + " *"}
        Icon="user"
        Bad={UserCheck.State === "bad" || !!Errors.UserName}
      >
        <input
          id="register-UserName"
          name="UserName"
          type="text"
          autoComplete="username"
          autoFocus
          className={
            UserCheck.State === "bad" || Errors.UserName ? "bad" : undefined
          }
          aria-invalid={
            UserCheck.State === "bad" || !!Errors.UserName || undefined
          }
          aria-describedby="register-username-check"
          value={Values.UserName}
          disabled={Loading}
          onChange={(e) => ChangeUserName(e.target.value)}
          onBlur={(e) => CheckUserName(e.target.value)}
        />
      </AuthField>
      <p
        id="register-username-check"
        className={
          "hint" +
          (UserCheck.State === "bad" || Errors.UserName
            ? " bad"
            : UserCheck.State === "good"
              ? " good"
              : "")
        }
      >
        {Errors.UserName
          ? t(Errors.UserName)
          : UserCheck.State === "checking"
            ? t("Checking...")
            : UserCheck.State === "good"
              ? "✓ " + t("Нэр чөлөөтэй байна")
              : UserCheck.State === "bad"
                ? t(UserCheck.Message)
                : t("The username must be at least 4 characters long")}
      </p>

      <div className="grid2">
        <div>
          <AuthField
            Id="register-Password"
            Label={t("Password") + " *"}
            Icon="lock"
            Bad={!!Errors.Password}
            Trailing={
              <PasswordToggle
                Shown={ShowPassword}
                onToggle={() => setShowPassword((v) => !v)}
              />
            }
          >
            <input
              id="register-Password"
              name="new-password"
              type={ShowPassword ? "text" : "password"}
              autoComplete="new-password"
              className={Errors.Password ? "bad" : undefined}
              aria-invalid={!!Errors.Password || undefined}
              aria-describedby="register-password-rules"
              value={Values.Password}
              disabled={Loading}
              onChange={(e) => Set("Password", e.target.value)}
            />
          </AuthField>
        </div>
        <div>
          <AuthField
            Id="register-PasswordConfirm"
            Label={t("Confirm password") + " *"}
            Icon="lock"
            Bad={!!Errors.PasswordConfirm}
          >
            <input
              id="register-PasswordConfirm"
              name="confirm-password"
              type={ShowPassword ? "text" : "password"}
              autoComplete="new-password"
              className={Errors.PasswordConfirm ? "bad" : undefined}
              aria-invalid={!!Errors.PasswordConfirm || undefined}
              value={Values.PasswordConfirm}
              disabled={Loading}
              onChange={(e) => Set("PasswordConfirm", e.target.value)}
            />
          </AuthField>
          {Hint("PasswordConfirm")}
        </div>
      </div>
      <ul className="rules" id="register-password-rules">
        {PASSWORD_RULES.map((Rule, Index) => (
          <li
            key={Rule.Key}
            className={Met[Index] ? "met" : Errors.Password ? "bad" : undefined}
          >
            {t(Rule.Label)}
          </li>
        ))}
      </ul>

      <div className="section" role="heading" aria-level="2">
        {t("Хувийн мэдээлэл")}
      </div>
      <div className="grid2">
        {Text("LastName", t("Last name"), { Auto: "family-name" })}
        {Text("FirstName", t("First name"), { Auto: "given-name" })}
        {Text("Registration", t("Регистрийн дугаар"), {
          Placeholder: "УБ12345678",
        })}
        {Text("Email", t("Email"), { Type: "email", Auto: "email" })}
        {Text("Telephone", t("Telephone"), { Type: "tel", Auto: "tel" })}
      </div>

      <div className="section" role="heading" aria-level="2">
        {t("Мэргэжлийн мэдээлэл")}
      </div>
      <div className="grid2">
        {Text("License", t("Мэргэжлийн үйл ажиллагааны зөвшөөрлийн дугаар"))}
        {Text("Profession", t("Profession"), { Required: false })}
        {/* Not through Select(): its handler reads a ref, which the hooks
            lint only accepts written directly as an event prop. */}
        <div>
          <label htmlFor="register-OrgProvince">
            {t("Байгууллагын аймаг/хот")} *
          </label>
          <select
            id="register-OrgProvince"
            name="OrgProvince"
            value={Values.OrgProvince}
            disabled={Loading || Provinces.length === 0}
            onChange={(e) => ChangeOrgProvince(e.target.value)}
          >
            <option value="">{t("-- Сонгох --")}</option>
            {Provinces.map((o) => (
              <option key={o.id_data} value={o.id_data + ""}>
                {o.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="register-OrgFilter">{t("Байгууллага хайх")}</label>
          <input
            id="register-OrgFilter"
            type="search"
            value={OrgFilter}
            disabled={Loading || Organizations.length === 0}
            placeholder={
              Values.OrgProvince ? "" : t("Эхлээд аймаг/хот сонгоно уу")
            }
            onChange={(e) => setOrgFilter(e.target.value)}
          />
        </div>
      </div>
      {Select(
        "OrganizationId",
        t("Ажилладаг байгууллага"),
        OrgOptions,
        (v) => Set("OrganizationId", v),
        {
          Required: true,
          IdKey: "Id",
          NameKey: "Name",
        },
      )}

      <div className="section" role="heading" aria-level="2">
        {t("Хаяг")}
      </div>
      <div className="grid2">
        {Select("addr_prov_city", t("Province/city"), Provinces, (v) =>
          ChangeAddress("addr_prov_city", v),
        )}
        {Select("addr_soum_dist", t("Soum/district"), Soums, (v) =>
          ChangeAddress("addr_soum_dist", v),
        )}
        {Select("addr_bag_khoroo", t("Bag/khoroo"), Bags, (v) =>
          ChangeAddress("addr_bag_khoroo", v),
        )}
      </div>

      <AuthSubmit
        Loading={Loading}
        Label={t("Хүсэлт илгээх")}
        LoadingLabel={t("Sending...")}
      />

      <div className="row">
        <AuthLink To="/auth/login">{t("Login")}</AuthLink>
      </div>
    </AuthShell>
  );
}
