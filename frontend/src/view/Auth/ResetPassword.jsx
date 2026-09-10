import React, { useEffect, useState } from "react";
// translation
import { useTranslation } from "react-i18next";
// @mui/material components
import Box from "@mui/material/Box";
import { Link, InputAdornment } from "@mui/material";

// @mui/icons-material
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import EmailIcon from "@mui/icons-material/Email";

// core components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
import CardHeader from "components/Card/CardHeader";
import CardFooter from "components/Card/CardFooter";
import CustomInput from "components/CustomInput/CustomInput.jsx";
import Button from "components/CustomButtons/Button";
// helper
import Helper from "helper";
// history
import customHistory from "customHistory";

// styles
import { loginPageSx } from "assets/jss/material-dashboard-pro-react/views/loginPageStyle.js";

export default function ResetPassword() {
  const { t } = useTranslation();

  const [cardAnimaton, setCardAnimation] = useState("cardHidden");
  const [UserName, setUserName] = useState("");
  const [Password, setPassword] = useState("");
  const [ConfirmPassword, setConfirmPassword] = useState("");
  const [Alert, setAlert] = useState(null);
  const [Token, setToken] = useState(null);

  useEffect(() => {
    const id = setTimeout(() => {
      setCardAnimation("");
    }, 700);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    const userNameParam = Helper.BaseHelper.getUrlParam(
      window.location.href,
      "UserName",
    );

    const tokenParam = Helper.BaseHelper.getUrlParam(
      window.location.href,
      "Token",
    );

    if (tokenParam) {
      setToken((prevToken) =>
        prevToken !== tokenParam ? tokenParam : prevToken,
      );
    }
    if (userNameParam) {
      setUserName((prevUserName) =>
        prevUserName !== userNameParam ? userNameParam : prevUserName,
      );
    }
  }, []);

  const ShowAlert = (Message, Success) => {
    const Alert = Helper.BaseCrudHelper.ShowAlert(Message, Success, () => {
      setAlert(null);
      if (Success === true) customHistory.push("/auth/login");
    });
    setAlert(Alert);
  };

  const RessetPass = async () => {
    if (Password + "" === ConfirmPassword + "") {
      await Helper.AuthHelper.ResetPassword(
        { UserName, Token, Password },
        (resData) => resData && ShowAlert(resData.Message, resData.Success),
      );
    } else {
      ShowAlert("Password iteration is incorrect", false);
    }
  };

  return (
    <Box sx={loginPageSx.container}>
      {Alert}
      <GridContainer justify="center">
        <GridItem xs={12} sm={6} md={4}>
          <form>
            <Card
              login
              sx={
                cardAnimaton === "cardHidden"
                  ? loginPageSx.cardHidden
                  : undefined
              }
            >
              <CardHeader
                sx={{ ...loginPageSx.cardHeader, ...loginPageSx.textCenter }}
                color="rose"
              >
                <Box component="h4" sx={loginPageSx.cardTitle}>
                  Шинээр нууц үг хуудас
                </Box>
              </CardHeader>
              <CardBody>
                <CustomInput
                  labelText="User name"
                  formControlProps={{ fullWidth: true }}
                  inputProps={{
                    value: UserName,
                    onChange: (e) => setUserName(e.target.value),
                    endAdornment: (
                      <InputAdornment position="end">
                        <EmailIcon sx={loginPageSx.inputAdornmentIcon} />
                      </InputAdornment>
                    ),
                  }}
                />

                <CustomInput
                  labelText="Password"
                  formControlProps={{ fullWidth: true }}
                  inputProps={{
                    value: Password,
                    onKeyDown: (event) => {
                      if (event.key === "Enter") {
                        // intentionally empty
                      }
                    },
                    onChange: (e) => setPassword(e.target.value),
                    endAdornment: (
                      <InputAdornment position="end">
                        <LockOutlinedIcon sx={loginPageSx.inputAdornmentIcon} />
                      </InputAdornment>
                    ),
                    type: "password",
                    autoComplete: "off",
                  }}
                />

                <CustomInput
                  labelText="Confirm password"
                  formControlProps={{ fullWidth: true }}
                  inputProps={{
                    value: ConfirmPassword,
                    onKeyDown: (event) => {
                      if (event.key === "Enter") {
                        // intentionally empty
                      }
                    },
                    onChange: (e) => setConfirmPassword(e.target.value),
                    endAdornment: (
                      <InputAdornment position="end">
                        <LockOutlinedIcon sx={loginPageSx.inputAdornmentIcon} />
                      </InputAdornment>
                    ),
                    type: "password",
                    autoComplete: "off",
                  }}
                />
              </CardBody>
              <CardFooter
                sx={loginPageSx.justifyContentCenter}
                style={{ paddingTop: "0", marginBottom: "0" }}
              >
                <Button round color="rose" onClick={() => RessetPass()}>
                  {t("Save")}
                </Button>
              </CardFooter>
              <CardFooter
                sx={loginPageSx.justifyContentCenter}
                style={{ marginBottom: "30px" }}
              >
                <div
                  style={{
                    display: "flex",
                    width: "100%",
                    justifyContent: "center",
                    marginTop: "5px",
                  }}
                >
                  <Link
                    href
                    sx={{
                      fontWeight: "500",
                      marginLeft: "10px",
                      color: "#e91e63",
                      "&:hover": { color: "#e91e63" },
                    }}
                    onClick={() => customHistory.push("/auth/login")}
                  >
                    {t("Login")}
                  </Link>
                </div>

                {/* <Button
                  color="primary"
                  simple
                  size="lg"
                  block
                  onClick={() => {
                    customHistory.push("/auth/register");
                  }}
                >
                  Бүртгүүлэх
                </Button> */}
              </CardFooter>
            </Card>
          </form>
        </GridItem>
      </GridContainer>
    </Box>
  );
}
