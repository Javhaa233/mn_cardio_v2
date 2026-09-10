import React, { useEffect, useState } from "react";
// translation
import { useTranslation } from "react-i18next";
// @mui/material components
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import InputAdornment from "@mui/material/InputAdornment";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";

// @mui/icons-material
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

// core components
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
import CardFooter from "components/Card/CardFooter";
import CustomInput from "components/CustomInput/CustomInput.jsx";
import Button from "components/CustomButtons/Button";
// helper
import Helper from "helper";
// history
import customHistory from "customHistory";

import { loginPageSx } from "assets/jss/material-dashboard-pro-react/views/loginPageStyle.js";
import { infoColor } from "assets/jss/material-dashboard-pro-react.js";

export default function PatientLoginPage() {
  const { t } = useTranslation();

  const [cardAnimaton, setCardAnimation] = useState("cardHidden");
  const [UserName, setUserName] = useState("");
  const [Password, setPassword] = useState("");
  const [Alert, setAlert] = useState(null);
  const [RememberMe, setRememberMe] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setTimeout(function () {
      setCardAnimation("");
    }, 700);
  }, []);

  useEffect(() => {
    const LogedUser = Helper.AuthHelper.GetLogedUserLocal();
    if (LogedUser && LogedUser.RoleId) {
      if (LogedUser.RoleId + "" === "4") {
        document.location = "/patient";
      }
    }
  }, [cardAnimaton]);

  const ShowAlert = (Message) => {
    const Alert = Helper.BaseCrudHelper.ShowAlert(Message, false, () =>
      setAlert(null),
    );
    setAlert(Alert);
  };

  const Login = async () => {
    if (UserName !== "" && Password !== "") {
      await Helper.AuthHelper.PatientLogin(
        { UserName, Password },
        (Success, RoleId, Message) => {
          if (Success === true && RoleId) {
            if (RoleId + "" === "4") {
              document.location = "/patient";
            }
          } else {
            const newFailedAttempts = failedAttempts + 1;
            setFailedAttempts(newFailedAttempts);
            if (
              newFailedAttempts >= 3 &&
              process.env.NODE_ENV !== "development"
            ) {
              ShowAlert(
                "Мэдээллийн технологийн ажилтантай холбогдоно уу! 99243182",
              );
            } else {
              ShowAlert(Message);
            }
          }
        },
      );
    }
  };

  return (
    <Box sx={loginPageSx.splitRoot}>
      {Alert}
      <Box sx={loginPageSx.splitContainer}>
        <Box sx={loginPageSx.leftPanel}></Box>
        <Box sx={loginPageSx.rightPanel}>
          <Box sx={loginPageSx.rightPanelCenter}>
            <Card
              login
              sx={{
                ...(cardAnimaton === "cardHidden"
                  ? loginPageSx.cardHidden
                  : undefined),
                ...loginPageSx.rightLoginCard,
              }}
            >
              <Box sx={loginPageSx.rightAvatarHeader}>
                <Box
                  component="h2"
                  sx={{
                    ...loginPageSx.welcomeTitle,
                    color: infoColor[0],
                    fontSize: "24px",
                    marginBottom: 0,
                    marginTop: "10px",
                  }}
                >
                  {t("Welcome to MnCardio")}
                </Box>
              </Box>
              <CardBody>
                <CustomInput
                  labelText={t("User name")}
                  formControlProps={{ fullWidth: true }}
                  inputProps={{
                    value: UserName,
                    onChange: (e) => setUserName(e.target.value),
                    endAdornment: (
                      <InputAdornment position="end">
                        <PersonOutlineIcon
                          sx={loginPageSx.inputAdornmentIcon}
                        />
                      </InputAdornment>
                    ),
                  }}
                />
                <CustomInput
                  labelText={t("Password")}
                  formControlProps={{ fullWidth: true }}
                  inputProps={{
                    value: Password,
                    onKeyDown: (event) => event.key === "Enter" && Login(),
                    onChange: (e) => setPassword(e.target.value),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          onMouseDown={(e) => e.preventDefault()}
                          edge="end"
                          sx={{ padding: "12px" }}
                        >
                          {showPassword ? (
                            <VisibilityOff
                              sx={loginPageSx.inputAdornmentIcon}
                            />
                          ) : (
                            <Visibility sx={loginPageSx.inputAdornmentIcon} />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                    type: showPassword ? "text" : "password",
                    autoComplete: "off",
                  }}
                />
                <Box sx={loginPageSx.rightActionsRow}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={RememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        size="small"
                      />
                    }
                    label={t("Remember me")}
                    sx={{
                      margin: 0,
                      "& .MuiFormControlLabel-label": {
                        fontSize: 13,
                        color: "#607d8b",
                      },
                    }}
                  />
                  <Link
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      customHistory.push("/auth/forget-password");
                    }}
                    sx={{
                      fontWeight: 500,
                      fontSize: 13,
                      color: "#0b6aa7",
                      "&:hover": { color: "#0b6aa7" },
                    }}
                  >
                    {t("Forgot password?")}
                  </Link>
                </Box>
              </CardBody>
              <CardFooter
                sx={loginPageSx.justifyContentCenter}
                style={{ paddingTop: "0" }}
              >
                <Button
                  round
                  color="info"
                  onClick={Login}
                  style={{ ...loginPageSx.loginButton, width: "220px" }}
                >
                  {t("Login")}
                </Button>
              </CardFooter>
              <Box sx={loginPageSx.rightBottomSupport}>
                <Link
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    customHistory.push("/auth/register");
                  }}
                  sx={{
                    fontWeight: 600,
                    fontSize: 13,
                    color: "#0b6aa7",
                    "&:hover": { color: "#0b6aa7" },
                  }}
                >
                  {t("Create account")}
                </Link>
              </Box>
            </Card>
          </Box>

          <Box sx={loginPageSx.pageBottomSupport}>
            <Box
              component="div"
              sx={{
                marginTop: "10px",
                fontWeight: 400,
                fontSize: 13,
                color: "#e53935",
              }}
            >
              Мэдээллийн технологийн ажилтантай холбогдох
            </Box>
            <Box
              component="div"
              sx={{ fontWeight: 700, fontSize: 14, color: "#8e24aa" }}
            >
              <a
                href="tel:+97699243182"
                style={{ textDecoration: "underline" }}
              >
                99243182
              </a>
            </Box>
            <Box
              component="div"
              sx={{
                fontWeight: 500,
                fontSize: 14,
                color: "#5b4196ff",
                marginTop: "12px",
              }}
            >
              Powered by ITSystem
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
