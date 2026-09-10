import React, { useState } from "react";
// translation
import { useTranslation } from "react-i18next";
// @mui/material components
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import InputAdornment from "@mui/material/InputAdornment";

// @mui/icons-material
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";

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

import { loginPageSx } from "assets/jss/material-dashboard-pro-react/views/loginPageStyle.js";

export default function ForgetPassword() {
  const { t } = useTranslation();

  const [cardAnimaton, setCardAnimation] = useState("cardHidden");
  const [UserName, setUserName] = useState("");
  const [Alert, setAlert] = useState(null);
  const [Loading, setLoading] = useState(false);

  React.useEffect(() => {
    const id = setTimeout(() => {
      setCardAnimation("");
    }, 700);
    return () => clearTimeout(id);
  }, []);

  const ShowAlert = (Message, Success) => {
    const Alert = Helper.BaseCrudHelper.ShowAlert(
      Message,
      Success === true,
      () => setAlert(null),
    );
    setAlert(Alert);
  };

  const ResetPassword = async () => {
    if (Loading) return;
    if (UserName === "") {
      ShowAlert(t("Please enter your user name"), false);
      return;
    }
    setLoading(true);
    await Helper.AuthHelper.ForgetPassword({ UserName }, (resData) => {
      ShowAlert(
        resData && resData.Message ? resData.Message : t("An error occurred"),
        resData ? resData.Success : false,
      );
    });
    setLoading(false);
  };

  return (
    <Box sx={loginPageSx.container}>
      {Alert}
      <GridContainer justifyContent="center">
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
                  {t("Forgot Password")}
                </Box>
              </CardHeader>
              <CardBody>
                <CustomInput
                  labelText={t("User name")}
                  helperText={t(
                    "A password reset link will be sent to the email address registered on your account",
                  )}
                  formControlProps={{ fullWidth: true }}
                  inputProps={{
                    value: UserName,
                    disabled: Loading,
                    onChange: (e) => setUserName(e.target.value),
                    onKeyDown: (event) =>
                      event.key === "Enter" && ResetPassword(),
                    endAdornment: (
                      <InputAdornment position="end">
                        <PersonOutlineIcon
                          sx={loginPageSx.inputAdornmentIcon}
                        />
                      </InputAdornment>
                    ),
                  }}
                />
              </CardBody>
              <CardFooter
                sx={loginPageSx.justifyContentCenter}
                style={{ paddingTop: "0", marginBottom: "0" }}
              >
                <Button
                  round
                  color="rose"
                  disabled={Loading}
                  onClick={ResetPassword}
                >
                  {Loading ? t("Sending...") : t("Reset Password")}
                </Button>
              </CardFooter>
              <CardFooter
                sx={loginPageSx.justifyContentCenter}
                style={{ marginBottom: "30px" }}
              >
                <Link
                  href=""
                  onClick={() => customHistory.push("/auth/login")}
                  sx={{
                    fontWeight: "500",
                    marginLeft: "5px",
                    color: "#9c27b0",
                    "&:hover": { color: "#9c27b0" },
                  }}
                >
                  {t("Back to Login")}
                </Link>
              </CardFooter>
            </Card>
          </form>
        </GridItem>
      </GridContainer>
    </Box>
  );
}
