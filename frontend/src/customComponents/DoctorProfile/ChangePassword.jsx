import React, { Component } from "react";
import { withTranslation } from "react-i18next";

// @mui
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import CustomInput from "components/CustomInput/CustomInput.jsx";

import Helper from "helper";

const PasswordRegex =
  /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()+=\-?;,./{}|":<>[\]\\' ~_]).{8,}/;

class ChangePassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Password: "",
      ConfirmPassword: "",
      Alert: null,
      showPassword: false,
      showConfirmPassword: false,
      passwordFocused: false,
      confirmPasswordFocused: false,
    };
    this.PasswordRegex = PasswordRegex;
  }

  Save = async ({ DoctorId, UserId }, callback) => {
    const { t } = this.props;
    console.log("ChangePassword Save called with:", { DoctorId, UserId });
    const { Password, ConfirmPassword } = this.state;
    if (
      Password === "" ||
      Password.replace(/\s+/g, "") === "" ||
      ConfirmPassword === "" ||
      ConfirmPassword.replace(/\s+/g, "") === ""
    ) {
      const alert = Helper.BaseCrudHelper.ShowAlert(
        t("Please fill in all password fields"),
        false,
        () => this.setState({ Alert: null }),
      );
      this.setState({ Alert: alert });
      return;
    }

    let alert = null;
    if (DoctorId === null || UserId === null) {
      alert = Helper.BaseCrudHelper.ShowAlert(
        t("Information is missing"),
        false,
        () => this.setState({ Alert: null }),
      );
      this.setState({ Alert: alert });
      return;
    }

    if (Password + "" === ConfirmPassword + "") {
      if (PasswordRegex.test(Password)) {
        await Helper.DoctorsProfileHelper.ChangePassword(
          { DoctorId, UserId, NewPassword: Password },
          (resData) => {
            if (resData) {
              if (resData.Success) {
                callback && callback(resData);
              } else {
                alert = Helper.BaseCrudHelper.ShowAlert(
                  resData.Message,
                  resData.Success,
                  () => {
                    this.setState({ Alert: null });
                  },
                );
                this.setState({ Alert: alert });
              }
            }
          },
        );
      } else {
        alert = Helper.BaseCrudHelper.ShowAlert(
          t(
            "Password does not meet the requirements !!! Must be longer than 8, contain 1 uppercase letter, 1 special character, and 1 number",
          ),
          false,
          () => this.setState({ Alert: null }),
        );
        this.setState({ Alert: alert });
      }
    } else {
      alert = Helper.BaseCrudHelper.ShowAlert(
        t("Password verification is incorrect"),
        false,
        () => this.setState({ Alert: null }),
      );
      this.setState({ Alert: alert });
    }

    return;
  };

  render() {
    const { t } = this.props;
    const {
      Password,
      ConfirmPassword,
      Alert,
      showPassword,
      showConfirmPassword,
      passwordFocused,
      confirmPasswordFocused,
    } = this.state;

    return (
      <div>
        <style>
          {`
            input::-ms-reveal,
            input::-ms-clear,
            input::-webkit-credentials-auto-fill-button {
              display: none !important;
            }
          `}
        </style>
        {Alert}
        <GridContainer>
          <GridItem xs={12} sm={12} md={12}>
            <div style={{ position: "relative" }}>
              <CustomInput
                labelText={t("New password")}
                formControlProps={{ fullWidth: true }}
                inputProps={{
                  type: showPassword ? "text" : "password",
                  value: Password,
                  onChange: (e) => this.setState({ Password: e.target.value }),
                  onFocus: () => this.setState({ passwordFocused: true }),
                  onBlur: () => this.setState({ passwordFocused: false }),
                  autoComplete: "new-password",
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={t(
                          showPassword ? "Hide password" : "Show password",
                        )}
                        onClick={() =>
                          this.setState({ showPassword: !showPassword })
                        }
                        onMouseDown={(e) => e.preventDefault()}
                        edge="end"
                        sx={{ padding: "12px" }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </div>
            <div style={{ position: "relative" }}>
              <CustomInput
                labelText={t("Repeat your new password")}
                formControlProps={{ fullWidth: true }}
                inputProps={{
                  type: showConfirmPassword ? "text" : "password",
                  value: ConfirmPassword,
                  onChange: (e) =>
                    this.setState({ ConfirmPassword: e.target.value }),
                  onFocus: () =>
                    this.setState({ confirmPasswordFocused: true }),
                  onBlur: () =>
                    this.setState({ confirmPasswordFocused: false }),
                  autoComplete: "new-password",
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={t(
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password",
                        )}
                        onClick={() =>
                          this.setState({
                            showConfirmPassword: !showConfirmPassword,
                          })
                        }
                        onMouseDown={(e) => e.preventDefault()}
                        edge="end"
                        sx={{ padding: "12px" }}
                      >
                        {showConfirmPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </div>
          </GridItem>
        </GridContainer>
      </div>
    );
  }
}

export default withTranslation(undefined, { withRef: true })(ChangePassword);
