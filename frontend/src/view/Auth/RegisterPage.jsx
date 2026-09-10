import { withTranslation } from "react-i18next";
import React, { Component, createRef } from "react";
// translation
// @mui/material components
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import CircularProgress from "@mui/material/CircularProgress";

// core components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import Button from "components/CustomButtons/Button";
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
import CardHeader from "components/Card/CardHeader";
import CardFooter from "components/Card/CardFooter";
// custom components
import BaseTextField from "customComponents/BaseEditControls/BaseTextField";
import SingleSelect from "customComponents/Register/SingleSelect";
import UserNameText from "customComponents/Register/UserNameText";
// helper
import Helper from "helper";
// history
import customHistory from "customHistory";
// styles
import { loginPageSx } from "assets/jss/material-dashboard-pro-react/views/loginPageStyle.js";

class RegisterPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cardAnimaton: "cardHidden",
      Alert: null,
      IsActive: true,
      Loading: false,
    };

    this.ModifyObject = {};

    // useRef
    this.SelectRef1 = createRef();
    this.SelectRef2 = createRef();
    this.SelectRef3 = createRef();
  }

  componentDidMount() {
    setTimeout(() => {
      const t = this.props.t;
      this.setState({ cardAnimaton: "" });
    }, 700);

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
    this.setState({ Loading: true });
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

  GetProvinceData = async ({ ObjectName, Option }) => {
    await Helper.BaseCrudHelper.CallServiceWithoutToken(
      "UserRequest/GetProvinceData",
      { ObjectName, Option },
      (resData) => {
        if (resData && resData.Success) {
          if (ObjectName === "DictProvinceCity") {
            this.SelectRef1 && this.SelectRef1.setState({ Data: resData.Data });
          } else if (ObjectName === "DictSoumDistrict") {
            this.SelectRef2 && this.SelectRef2.setState({ Data: resData.Data });
            this.SelectRef3 && this.SelectRef3.setState({ Data: [] });
          } else if (ObjectName === "DictBagKhoroo") {
            this.SelectRef3 && this.SelectRef3.setState({ Data: resData.Data });
          }
        }
      },
    );
  };

  ChangeValue = (Field, Value) => {
    this.ModifyObject[Field] = Value;
    process.env.NODE_ENV === "development" &&
      console.log({ ModifyObject: this.ModifyObject });
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
    }
    if (Field === "addr_soum_dist") {
      this.GetProvinceData({
        ObjectName: "DictBagKhoroo",
        Option: { Field: "id_soum", Type: "Equals", Value },
      });
      this.ModifyObject["addr_bag_khoroo"] = null;
    }
  };

  GetConfigField = (FieldName) => {
    var Field = Helper.BaseCrudHelper.GetConfigField(FieldName, this.Fields);
    return Field;
  };

  render() {
    const { t } = this.props;

    this.Fields = [
      { Name: "UserName", Label: t("User name") },
      { Name: "LastName", Label: t("Last name") },
      { Name: "FirstName", Label: t("First name") },
      { Name: "Email", Label: t("Email") },
      { Name: "Telephone", Label: t("Telephone") },
      { Name: "OrgName", Label: t("Organization name"), Type: "Text" },
      { Name: "addr_prov_city", Label: t("Province/city") },
      { Name: "addr_soum_dist", Label: t("Soum/district") },
      { Name: "addr_bag_khoroo", Label: t("Bag/khoroo") },
    ];

    const {
      ChangeValue,
      CheckUserName,
      GetConfigField,
      Register,
      ModifyObject,
    } = this;
    const { Alert, cardAnimaton, Loading, IsActive } = this.state;
    return (
      <Box sx={loginPageSx.container}>
        {Alert}
        <GridContainer justify="center">
          <GridItem xs={12} sm={6} md={6}>
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
                  color="primary"
                >
                  <Box component="h4" sx={loginPageSx.cardTitle}>
                    {t("Sign Up page")}
                  </Box>
                </CardHeader>

                <CardBody>
                  <UserNameText
                    ChangeValue={ChangeValue}
                    CheckUserName={CheckUserName}
                    Config={GetConfigField("UserName")}
                    FullWidth={true}
                  />
                  <BaseTextField
                    ChangeValue={ChangeValue}
                    Config={GetConfigField("LastName")}
                    FullWidth={true}
                    md={4}
                  />
                  <BaseTextField
                    ChangeValue={ChangeValue}
                    Config={GetConfigField("FirstName")}
                    FullWidth={true}
                    md={4}
                  />
                  <BaseTextField
                    ChangeValue={ChangeValue}
                    Config={GetConfigField("Email")}
                    FullWidth={true}
                    md={4}
                  />
                  <BaseTextField
                    ChangeValue={ChangeValue}
                    Config={GetConfigField("Telephone")}
                    FullWidth={true}
                    md={4}
                  />
                  <BaseTextField
                    ChangeValue={ChangeValue}
                    Config={GetConfigField("OrgName")}
                    FullWidth={true}
                    md={4}
                  />
                  <SingleSelect
                    ChangeValue={ChangeValue}
                    Config={GetConfigField("addr_prov_city")}
                    Value={ModifyObject["addr_prov_city"]}
                    ref={(ref) => {
                      this.SelectRef1 = ref;
                    }}
                  />
                  <SingleSelect
                    ChangeValue={ChangeValue}
                    Config={GetConfigField("addr_soum_dist")}
                    Value={ModifyObject["addr_soum_dist"]}
                    ref={(ref) => (this.SelectRef2 = ref)}
                  />
                  <SingleSelect
                    ChangeValue={ChangeValue}
                    Config={GetConfigField("addr_bag_khoroo")}
                    Value={ModifyObject["addr_bag_khoroo"]}
                    ref={(ref) => (this.SelectRef3 = ref)}
                  />
                </CardBody>
                <CardFooter
                  sx={loginPageSx.justifyContentCenter}
                  style={{
                    paddingTop: "0",
                    marginBottom: "20px",
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    style={{
                      float: "right",
                      position: "relative",
                      display: "inline",
                    }}
                  >
                    <Button
                      round
                      color="primary"
                      disabled={IsActive || Loading}
                      onClick={() => Register()}
                    >
                      {t("Sign Up")}
                    </Button>
                    {Loading && (
                      <CircularProgress
                        size={24}
                        style={{
                          color: "#9c27b0",
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          marginTop: -12,
                          marginLeft: -12,
                        }}
                      />
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      width: "100%",
                      justifyContent: "center",
                      marginTop: "5px",
                    }}
                  >
                    <Link
                      href=""
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
                </CardFooter>
              </Card>
            </form>
          </GridItem>
        </GridContainer>
      </Box>
    );
  }
}

export default withTranslation(undefined, { withRef: true })(RegisterPage);
