import { withTranslation } from "react-i18next";
import React, { Component } from "react";
// helper
import Helper from "helper";
import { CheckContact } from "helper/ContactValidation";

import AuthShell, { AuthLink } from "./AuthShell";

const FIELDS = [
  "UserName",
  "LastName",
  "FirstName",
  "Email",
  "Telephone",
  "OrgName",
  "addr_prov_city",
  "addr_soum_dist",
  "addr_bag_khoroo",
];

/**
 * Request a doctor account.
 *
 * The data flow is the one this page always had - the same four services
 * (CheckUserName, GetProvinceData x3, Register), the same contact validation,
 * the same "Sign Up stays disabled until the user name is confirmed free" rule,
 * the same cascade that clears soum and bag when the level above changes - but
 * the controls are native inputs and selects inside the login panel instead of
 * a purple Creative Tim card with MUI selects fed through refs.
 */
class RegisterPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Alert: null,
      // true = Sign Up disabled, until the user name check succeeds.
      IsActive: true,
      Loading: false,
      Error: "",
      Values: FIELDS.reduce((acc, f) => ({ ...acc, [f]: "" }), {}),
      Provinces: [],
      Soums: [],
      Bags: [],
      // idle | checking | good | bad
      UserCheck: "idle",
      UserCheckMessage: "",
    };

    this.ModifyObject = {};
  }

  componentDidMount() {
    this.GetProvinceData({
      ObjectName: "DictProvinceCity",
      Option: { Field: "name", Type: "NotEquals", Value: "" },
    });

    const LogedUser = Helper.AuthHelper.GetLogedUserLocal();
    if (LogedUser && LogedUser.RoleId) {
      if (LogedUser.RoleId + "" !== "4") {
        document.location = "/admin";
      }
    }
  }

  ShowAlert = (Message, Success) => {
    const Alert = Helper.BaseCrudHelper.ShowAlert(Message, Success, () => {
      this.setState({ Loading: false, Alert: null });
      if (Success) {
        this.ModifyObject = {};
        window.location.reload();
      }
    });
    this.setState({ Alert });
  };

  Register = async () => {
    if (this.state.IsActive || this.state.Loading) return;
    // Required on every new request: an account without them can neither
    // reset its password nor be contacted. The server checks the same.
    const ContactError = CheckContact(this.ModifyObject, {
      EmailKey: "Email",
      PhoneKey: "Telephone",
      Required: true,
    });
    if (ContactError) {
      this.setState({ Error: this.props.t(ContactError) });
      return;
    }
    this.setState({ Loading: true, Error: "" });
    await Helper.BaseCrudHelper.CallService(
      "/UserRequest/Register",
      { Data: JSON.stringify(this.ModifyObject) },
      (resData) => resData && this.ShowAlert(resData.Message, resData.Success),
    );
  };

  CheckUserName = async (UserName, callback) => {
    this.setState({ IsActive: true });
    if (
      UserName &&
      UserName !== "" &&
      UserName.length > 0 &&
      UserName.replace(/\s/g, "").length > 0
    ) {
      if (UserName.length >= 4 && UserName.replace(/\s/g, "").length >= 4) {
        await Helper.BaseCrudHelper.CallServiceWithoutToken(
          "UserRequest/CheckUserName",
          { UserName },
          (resData) => {
            if (resData) {
              callback && callback(resData, 1500);
              setTimeout(() => {
                this.setState({ IsActive: !resData.Success });
              }, 1500);
            }
          },
        );
      } else {
        callback &&
          callback(
            {
              Success: false,
              Message: "The username must be at least 4 characters long",
            },
            100,
          );
      }
    } else {
      callback &&
        callback({ Success: false, Message: "Please enter your username" }, 10);
    }
  };

  // Blur on the user name: strip spaces, then ask the server whether it is free.
  RunUserNameCheck = (Raw) => {
    const UserName = String(Raw || "").replace(/\s/g, "");
    this.ChangeValue("UserName", UserName);
    this.setState({ UserCheck: "checking", UserCheckMessage: "" });
    this.CheckUserName(UserName, (Data, TimeDuration) => {
      const Delay = isNaN(parseInt(TimeDuration))
        ? 1500
        : parseInt(TimeDuration);
      setTimeout(() => {
        this.setState({
          UserCheck: Data.Success ? "good" : "bad",
          UserCheckMessage: Data.Message || "",
        });
      }, Delay);
    });
  };

  GetProvinceData = async ({ ObjectName, Option }) => {
    await Helper.BaseCrudHelper.CallServiceWithoutToken(
      "UserRequest/GetProvinceData",
      { ObjectName, Option },
      (resData) => {
        if (resData && resData.Success) {
          if (ObjectName === "DictProvinceCity") {
            this.setState({ Provinces: resData.Data || [] });
          } else if (ObjectName === "DictSoumDistrict") {
            this.setState({ Soums: resData.Data || [], Bags: [] });
          } else if (ObjectName === "DictBagKhoroo") {
            this.setState({ Bags: resData.Data || [] });
          }
        }
      },
    );
  };

  ChangeValue = (Field, Value) => {
    this.ModifyObject[Field] = Value;
    this.setState((prev) => ({ Values: { ...prev.Values, [Field]: Value } }));
    this.ChangeValueAfter(Field, Value);
  };

  ChangeValueAfter = (Field, Value) => {
    if (Field === "addr_prov_city") {
      this.GetProvinceData({
        ObjectName: "DictSoumDistrict",
        Option: { Field: "id_province", Type: "Equals", Value },
      });
      this.ModifyObject["addr_soum_dist"] = null;
      this.ModifyObject["addr_bag_khoroo"] = null;
      this.setState((prev) => ({
        Values: { ...prev.Values, addr_soum_dist: "", addr_bag_khoroo: "" },
        Soums: [],
        Bags: [],
      }));
    }
    if (Field === "addr_soum_dist") {
      this.GetProvinceData({
        ObjectName: "DictBagKhoroo",
        Option: { Field: "id_soum", Type: "Equals", Value },
      });
      this.ModifyObject["addr_bag_khoroo"] = null;
      this.setState((prev) => ({
        Values: { ...prev.Values, addr_bag_khoroo: "" },
        Bags: [],
      }));
    }
  };

  Text = (Field, Label, { Type = "text", Required = false, Auto } = {}) => {
    const { Values, Loading } = this.state;
    const id = "register-" + Field;
    return (
      <div>
        <label htmlFor={id}>
          {Label}
          {Required ? " *" : ""}
        </label>
        <input
          id={id}
          name={Field}
          type={Type}
          autoComplete={Auto}
          value={Values[Field]}
          disabled={Loading}
          onChange={(e) => this.ChangeValue(Field, e.target.value)}
        />
      </div>
    );
  };

  Select = (Field, Label, Options) => {
    const { t } = this.props;
    const { Values, Loading } = this.state;
    const id = "register-" + Field;
    return (
      <div>
        <label htmlFor={id}>{Label}</label>
        <select
          id={id}
          name={Field}
          value={Values[Field] || ""}
          disabled={Loading || Options.length === 0}
          onChange={(e) => this.ChangeValue(Field, e.target.value)}
        >
          <option value="">{t("-- Сонгох --")}</option>
          {Options.map((o) => (
            <option key={o.id_data} value={o.id_data + ""}>
              {t(o.name + "")}
            </option>
          ))}
        </select>
      </div>
    );
  };

  render() {
    const { t } = this.props;
    const {
      Alert,
      Loading,
      IsActive,
      Error,
      Values,
      Provinces,
      Soums,
      Bags,
      UserCheck,
      UserCheckMessage,
    } = this.state;

    return (
      <AuthShell Title={t("Sign Up page")} Wide onSubmit={this.Register}>
        {Alert}
        <div role="alert" aria-live="polite">
          {Error ? <p className="err">{Error}</p> : null}
        </div>

        <label htmlFor="register-UserName">{t("User name")}</label>
        <input
          id="register-UserName"
          name="UserName"
          type="text"
          autoComplete="username"
          autoFocus
          className={UserCheck === "bad" ? "bad" : undefined}
          aria-invalid={UserCheck === "bad" || undefined}
          aria-describedby="register-username-check"
          value={Values.UserName}
          disabled={Loading || UserCheck === "checking"}
          onChange={(e) => this.ChangeValue("UserName", e.target.value)}
          onBlur={(e) => this.RunUserNameCheck(e.target.value)}
        />
        <p
          id="register-username-check"
          className={
            "hint" +
            (UserCheck === "bad" ? " bad" : UserCheck === "good" ? " good" : "")
          }
        >
          {UserCheck === "checking"
            ? t("Checking...")
            : UserCheck === "good"
              ? UserCheckMessage
                ? t(UserCheckMessage)
                : "✓"
              : UserCheck === "bad"
                ? t(UserCheckMessage)
                : t("The username must be at least 4 characters long")}
        </p>

        <div className="grid2">
          {this.Text("LastName", t("Last name"), { Auto: "family-name" })}
          {this.Text("FirstName", t("First name"), { Auto: "given-name" })}
          {this.Text("Email", t("Email"), {
            Type: "email",
            Required: true,
            Auto: "email",
          })}
          {this.Text("Telephone", t("Telephone"), {
            Type: "tel",
            Required: true,
            Auto: "tel",
          })}
        </div>

        {this.Text("OrgName", t("Organization name"), {
          Auto: "organization",
        })}

        <div className="grid2">
          {this.Select("addr_prov_city", t("Province/city"), Provinces)}
          {this.Select("addr_soum_dist", t("Soum/district"), Soums)}
          {this.Select("addr_bag_khoroo", t("Bag/khoroo"), Bags)}
        </div>

        <button className="btn" type="submit" disabled={IsActive || Loading}>
          {Loading ? t("Sending...") : t("Sign Up")}
        </button>

        <div className="row">
          <AuthLink To="/auth/login">{t("Login")}</AuthLink>
        </div>
      </AuthShell>
    );
  }
}

export default withTranslation(undefined, { withRef: true })(RegisterPage);
