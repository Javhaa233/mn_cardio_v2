import React from "react";
// @mui material components
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
// @mui/icons-material
import MenuIcon from "@mui/icons-material/Menu";
// core components
import PatientNavbarLinks from "./PatientNavbarLinks";
import Button from "components/CustomButtons/Button";
import {
  containerFluid,
  grayColor,
} from "assets/jss/material-dashboard-pro-react.js";

export default function PatientNavbar({ handleDrawerToggle }) {
  return (
    <AppBar
      style={{
        backgroundColor: "#FFF",
        boxShadow: "none",
        borderBottom: "0",
        marginBottom: "0",
        position: "sticky",
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
      }}
    >
      <Toolbar
        style={{
          paddingRight: "10px",
          paddingLeft: "10px",
          marginRight: "auto",
          marginLeft: "auto",
          height: "60px",
          minHeight: "60px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", flex: "1 auto" }}></div>
        {/* Visible at EVERY width. This was `{ xs: "none", md: "block" }`,
            which hid the profile menu below 960px - and that menu is the only
            place a patient can log out. Below `md` the bar was a hamburger and
            nothing else, with no overflow fallback (the admin bar has
            TopBarOverflowMenu; this one never did), so a patient on a phone or
            an iPad in portrait could not sign out at all. The menu is a single
            36px icon button, so it fits at 360px; only its name label drops
            (see PatientNavbarLinks). */}
        <Box sx={{ display: "block" }}>
          <PatientNavbarLinks />
        </Box>
        <Box
          sx={{
            display: { xs: "flex", md: "none" },
            alignItems: "center",
            height: "100%",
          }}
        >
          <Button
            justIcon
            round
            color="rose"
            simple
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            style={{ marginTop: "0" }}
          >
            <MenuIcon style={{ width: "22px", height: "22px" }} />
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
