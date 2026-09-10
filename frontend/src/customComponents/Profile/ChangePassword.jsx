import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import InputAdornment from "@mui/material/InputAdornment";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import IconButton from "@mui/material/IconButton";

import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import CustomInput from "components/CustomInput/CustomInput.jsx";

import Helper from "helper";

import { loginPageSx } from "assets/jss/material-dashboard-pro-react/views/loginPageStyle.js";

//const PasswordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()+=-\?;,./{}|\":<>\[\]\\\' ~_]).{8,}/;
const PasswordRegex =
  /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()+=-?;,./{}|":<>[\]'~_]).{8,}/;

class ChangePassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      OldPassword: "",
      NewPassword: "",
      ConfirmPassword: "",
      Alert: null,
      showOldPassword: false,
      showNewPassword: false,
      showConfirmPassword: false,
    };
    this.PasswordRegex = PasswordRegex;
  }

  Save = async (callback) => {
    const { OldPassword, NewPassword, ConfirmPassword } = this.state;
    if (
      NewPassword === "" &&
      NewPassword.replace(/\s+/g, "") === "" &&
      OldPassword === "" &&
      ConfirmPassword === ""
    ) {
      return;
    }

    let alert = null;
    if (NewPassword + "" === ConfirmPassword + "") {
      if (PasswordRegex.test(NewPassword)) {
        await Helper.AuthHelper.ChangePassword(
          { Password: OldPassword, NewPassword },
          (resData) => {
            if (resData) {
              alert = Helper.BaseCrudHelper.ShowAlert(
                resData.Message,
                resData.Success,
                () => {
                  this.setState({ Alert: null });
                  callback && callback();
                },
              );
              this.setState({ Alert: alert });
            }
          },
        );
      } else {
        alert = Helper.BaseCrudHelper.ShowAlert(
          "Password does not meet the requirements !!! Must be longer than 8, contain 1 uppercase letter, 1 special character, and 1 number",
          false,
          () => {
            this.setState({ Alert: null });
          },
        );
        this.setState({ Alert: alert });
      }
    } else {
      alert = Helper.BaseCrudHelper.ShowAlert(
        "Password verification is incorrect",
        false,
        () => this.setState({ Alert: null }),
      );
      this.setState({ Alert: alert });
    }
  };

  render() {
    const { t } = this.props;
    const { OldPassword, NewPassword, ConfirmPassword, Alert } = this.state;
    return (
      <div>
        {Alert}
        <GridContainer>
          <GridItem xs={12} sm={12} md={12}>
            <CustomInput
              labelText="Old password"
              formControlProps={{ fullWidth: true }}
              inputProps={{
                value: OldPassword,
                type: this.state.showOldPassword ? "text" : "password",
                onChange: (e) => this.setState({ OldPassword: e.target.value }),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={t(
                        this.state.showOldPassword
                          ? "Hide password"
                          : "Show password",
                      )}
                      onClick={() =>
                        this.setState({
                          showOldPassword: !this.state.showOldPassword,
                        })
                      }
                      onMouseDown={(e) => e.preventDefault()}
                      edge="end"
                      sx={{ padding: "12px" }}
                    >
                      {this.state.showOldPassword ? (
                        <VisibilityOff sx={loginPageSx.inputAdornmentIcon} />
                      ) : (
                        <Visibility sx={loginPageSx.inputAdornmentIcon} />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <CustomInput
              labelText="New password"
              formControlProps={{ fullWidth: true }}
              inputProps={{
                type: this.state.showNewPassword ? "text" : "password",
                value: NewPassword,
                onChange: (e) => this.setState({ NewPassword: e.target.value }),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={t(
                        this.state.showNewPassword
                          ? "Hide password"
                          : "Show password",
                      )}
                      onClick={() =>
                        this.setState({
                          showNewPassword: !this.state.showNewPassword,
                        })
                      }
                      onMouseDown={(e) => e.preventDefault()}
                      edge="end"
                      sx={{ padding: "12px" }}
                    >
                      {this.state.showNewPassword ? (
                        <VisibilityOff sx={loginPageSx.inputAdornmentIcon} />
                      ) : (
                        <Visibility sx={loginPageSx.inputAdornmentIcon} />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <CustomInput
              labelText="Repeat your new password"
              formControlProps={{ fullWidth: true }}
              inputProps={{
                value: ConfirmPassword,
                type: this.state.showConfirmPassword ? "text" : "password",
                onChange: (e) =>
                  this.setState({ ConfirmPassword: e.target.value }),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={t(
                        this.state.showConfirmPassword
                          ? "Hide password"
                          : "Show password",
                      )}
                      onClick={() =>
                        this.setState({
                          showConfirmPassword: !this.state.showConfirmPassword,
                        })
                      }
                      onMouseDown={(e) => e.preventDefault()}
                      edge="end"
                      sx={{ padding: "12px" }}
                    >
                      {this.state.showConfirmPassword ? (
                        <VisibilityOff sx={loginPageSx.inputAdornmentIcon} />
                      ) : (
                        <Visibility sx={loginPageSx.inputAdornmentIcon} />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </GridItem>
        </GridContainer>
      </div>
    );
  }
}

export default withTranslation(undefined, { withRef: true })(ChangePassword);
