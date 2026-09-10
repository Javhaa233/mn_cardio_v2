import { useTranslation } from "react-i18next";
import React, { useState } from "react";

// import { Manager, Target, Popper } from "react-popper";

// @mui/material components
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Paper from "@mui/material/Paper";
import Grow from "@mui/material/Grow";
import Popper from "@mui/material/Popper";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";

// @mui/icons-material
import Person from "@mui/icons-material/Person";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";

// core components
import Button from "components/CustomButtons/Button";
import { adminNavbarLinksSx } from "assets/jss/material-dashboard-pro-react/components/adminNavbarLinksStyle.js";

// helper
import Helper from "helper";
// history
import customHistory from "customHistory";

export default function PatientNavbarLinks() {
  const { t } = useTranslation();
  const [openProfile, setOpenProfile] = useState(null);

  const handleClickProfile = (event) => {
    if (openProfile && openProfile.contains(event.target)) {
      setOpenProfile(null);
    } else {
      setOpenProfile(event.currentTarget);
    }
  };
  const handleCloseProfile = () => {
    setOpenProfile(null);
  };

  const User = Helper.AuthHelper.GetLogedUserLocal();

  return (
    <div>
      <Box sx={adminNavbarLinksSx.managerClasses}>
        <Button
          color="transparent"
          aria-label="Person"
          simple
          aria-owns={openProfile ? "profile-menu-list" : null}
          aria-haspopup="true"
          onClick={handleClickProfile}
          sx={adminNavbarLinksSx.buttonLink}
        >
          {/* The name is the part that costs width, so it is what drops on a
              phone - not the menu itself. The icon stays, so logout stays
              reachable at 360px. */}
          <Box
            component="span"
            sx={{
              ...adminNavbarLinksSx.userName,
              display: { xs: "none", sm: "inline" },
            }}
          >
            {User && User.Patient ? User.Patient.p_firstname : ""}
          </Box>
          <Person
            sx={{
              ...adminNavbarLinksSx.headerLinksSvg,
              ...adminNavbarLinksSx.links,
            }}
          />
        </Button>
        <Popper
          open={Boolean(openProfile)}
          anchorEl={openProfile}
          transition
          disablePortal
          placement="bottom-end"
          sx={{
            ...(openProfile ? null : adminNavbarLinksSx.popperClose),
            ...adminNavbarLinksSx.popperResponsive,
            ...adminNavbarLinksSx.popperNav,
          }}
        >
          {({ TransitionProps }) => (
            <Grow
              {...TransitionProps}
              id="profile-menu-list"
              style={{ transformOrigin: "0 0 0" }}
            >
              <Paper sx={adminNavbarLinksSx.dropdown}>
                <ClickAwayListener onClickAway={handleCloseProfile}>
                  <MenuList role="menu">
                    <MenuItem
                      onClick={() =>
                        customHistory.push("/patient/PatientProfile")
                      }
                      sx={{
                        ...adminNavbarLinksSx.dropdownItem,
                        ...adminNavbarLinksSx.primaryHover,
                      }}
                    >
                      <AccountCircleOutlinedIcon
                        sx={adminNavbarLinksSx.dropdownItemIcon}
                      />
                      <Box
                        component="span"
                        sx={adminNavbarLinksSx.dropdownItemText}
                      >
                        {t("Миний бүртгэл")}
                      </Box>
                    </MenuItem>
                    <Divider light />
                    <MenuItem
                      sx={{
                        ...adminNavbarLinksSx.dropdownItem,
                        ...adminNavbarLinksSx.primaryHover,
                        ...adminNavbarLinksSx.dropdownItemDanger,
                      }}
                      onClick={async () => {
                        await Helper.AuthHelper.PatientLogOut((success) => {
                          if (success) {
                            document.location = "/patientAuth/login";
                          }
                        });
                      }}
                    >
                      <LogoutOutlinedIcon
                        sx={adminNavbarLinksSx.dropdownItemIcon}
                      />
                      <Box
                        component="span"
                        sx={adminNavbarLinksSx.dropdownItemText}
                      >
                        {t("Гарах")}
                      </Box>
                    </MenuItem>
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </Box>
    </div>
  );
}
