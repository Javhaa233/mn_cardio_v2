import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";

// @mui/material components
import { styled } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Box from "@mui/material/Box";

// core components
import Button from "components/CustomButtons/Button";

// Language components
import i18next from "i18next";

import {
  defaultFont,
  whiteColor,
  grayColor,
} from "assets/jss/material-dashboard-pro-react.js";

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: "transparent",
  boxShadow: "none",
  borderBottom: "0",
  marginBottom: "0",
  position: "fixed",
  top: "0",
  width: "100%",
  paddingTop: "0",
  zIndex: "1029",
  color: grayColor[6],
  border: "0",
  borderRadius: "3px",
  padding: "0",
  transition: "all 150ms ease 0s",
  height: "60px",
  minHeight: "60px",
  display: "block",
}));

const StyledToolbar = styled(Toolbar)({
  height: "60px",
  minHeight: "60px",
  width: "100%",
  maxWidth: "100%",
  boxSizing: "border-box",
  paddingLeft: "16px",
  paddingRight: "16px",
  display: "flex",
  justifyContent: "flex-end",
});

const StyledList = styled(List)({
  ...defaultFont,
  fontSize: "14px",
  margin: 0,
  marginRight: 0,
  paddingLeft: "0",
  listStyle: "none",
  color: whiteColor,
  paddingTop: "0",
  paddingBottom: "0",
  display: "flex",
  alignItems: "center",
  gap: "6px",
  backgroundColor: "transparent",
  border: "0",
  borderRadius: "0",
  padding: 0,
});

const StyledListItem = styled(ListItem)(({ theme }) => ({
  float: "left",
  position: "relative",
  display: "block",
  width: "auto",
  margin: "0",
  padding: "0",
  [theme.breakpoints.down("sm")]: {
    zIndex: "999",
    width: "100%",
    paddingRight: "15px",
  },
}));

export default function AuthNavbar() {
  const { t } = useTranslation();
  const [Language, setLanguage] = useState("mn");

  useEffect(() => {
    ChangeLanguage("mn");
  }, []);

  const ChangeLanguage = (lang) => {
    setLanguage(lang);
    i18next.changeLanguage(lang);
  };

  var list = (
    <StyledList>
      <StyledListItem>
        <Button
          color="white"
          round={true}
          simple={false}
          size="sm"
          style={{
            border: "0",
            color: "#ffffff", // white font
            backgroundColor: "#00838f", // darker cyan
            minHeight: "30px",
            padding: "6px 14px",
            boxShadow: "none",
            opacity: Language === "mn" ? 1 : 0.65,
          }}
          onClick={() => {
            Language !== "mn" && ChangeLanguage("mn");
          }}
        >
          Монгол
        </Button>
      </StyledListItem>

      <StyledListItem>
        <Button
          color="white"
          round={true}
          simple={false}
          size="sm"
          style={{
            border: "0",
            color: "#ffffff", // white font
            backgroundColor: "#00838f", // darker cyan
            minHeight: "30px",
            padding: "6px 14px",
            boxShadow: "none",
            opacity: Language === "en" ? 1 : 0.65,
          }}
          onClick={() => {
            Language !== "en" && ChangeLanguage("en");
          }}
        >
          English
        </Button>
      </StyledListItem>
    </StyledList>
  );

  return (
    <StyledAppBar position="static">
      <StyledToolbar>{list}</StyledToolbar>
    </StyledAppBar>
  );
}
