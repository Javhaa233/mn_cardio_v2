import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";

// @mui/material components
import { styled } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Box from "@mui/material/Box";

// Language components
import i18next from "i18next";

import {
  defaultFont,
  whiteColor,
  grayColor,
} from "assets/jss/material-dashboard-pro-react.js";
import { colors } from "@/theme/colors";
import { radius, elevation, motion } from "@/theme/tokens";

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

  // One segmented switch on a white pill, in the login panel's colours. It
  // was two separate teal (#00838f) Creative Tim round buttons, the inactive
  // one only told apart by 65% opacity.
  const LANGS = [
    { code: "mn", label: "Монгол" },
    { code: "en", label: "English" },
  ];
  var list = (
    <Box
      role="group"
      aria-label="Language"
      sx={{
        display: "inline-flex",
        gap: "2px",
        padding: "3px",
        borderRadius: radius.pill,
        backgroundColor: "rgba(255, 255, 255, 0.92)",
        border: `1px solid ${colors.brand.hairline}`,
        boxShadow: elevation[1],
      }}
    >
      {LANGS.map((l) => {
        const active = Language === l.code;
        return (
          <Box
            key={l.code}
            component="button"
            type="button"
            aria-pressed={active}
            onClick={() => !active && ChangeLanguage(l.code)}
            sx={{
              border: "none",
              font: "inherit",
              fontSize: "13px",
              fontWeight: active ? 600 : 500,
              lineHeight: 1,
              padding: "7px 14px",
              borderRadius: radius.pill,
              cursor: active ? "default" : "pointer",
              color: active ? colors.text.white : colors.brand.ink,
              backgroundColor: active ? colors.brand.cyanInk : "transparent",
              transition: `background-color ${motion.fast}, color ${motion.fast}`,
              "&:hover": active ? {} : { backgroundColor: colors.brand.tint },
              "&:focus-visible": {
                outline: `2px solid ${colors.brand.focus}`,
                outlineOffset: "1px",
              },
            }}
          >
            {l.label}
          </Box>
        );
      })}
    </Box>
  );

  return (
    <StyledAppBar position="static">
      <StyledToolbar>{list}</StyledToolbar>
    </StyledAppBar>
  );
}
