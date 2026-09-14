import { useState } from "react";
import { useTranslation } from "react-i18next";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Divider from "@mui/material/Divider";
import Grow from "@mui/material/Grow";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import { styled } from "@mui/material/styles";

import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";

import ChangePasswordDialog from "customComponents/Profile/ChangePasswordDialog";
import { adminNavbarLinksSx } from "assets/jss/material-dashboard-pro-react/components/adminNavbarLinksStyle.js";
import { colors } from "@/theme/colors";
import Helper from "helper";
import customHistory from "customHistory";
import T from "./topBarTokens";

/**
 * The identity cluster: avatar + first name + chevron, with the profile menu.
 *
 * Built on ButtonBase, NOT Button - theme.js globally forces
 * `MuiButton.root { padding/minHeight/fontSize !important }`, which would
 * override any height set here. See TopBarIconButton for the full note.
 *
 * The old chip carried an inline `border: 1px solid #ddd`, which made it the one
 * outlined element in a row of five borderless icons. The avatar gives it enough
 * visual weight without a border.
 */
const Chip = styled(ButtonBase, {
  shouldForwardProp: (prop) => prop !== "active",
})(({ theme, active }) => ({
  height: T.button,
  "@media (pointer: coarse)": { height: T.buttonTouch },
  padding: "4px 8px 4px 4px",
  gap: T.gapGroup,
  borderRadius: T.radius,
  backgroundColor: active ? colors.background.selected : "transparent",
  transition: theme.transitions.create(["background-color"], {
    duration: theme.transitions.duration.shortest,
  }),
  "&:hover": {
    backgroundColor: active
      ? colors.background.selected
      : colors.background.hover,
  },
  "&:focus": { outline: "none" },
  "&.Mui-focusVisible": {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: 2,
  },
}));

export default function ProfileMenu() {
  const { t } = useTranslation();
  const [Dialog, setDialog] = useState(null);
  const [anchor, setAnchor] = useState(null);

  const User = Helper.AuthHelper.GetLogedUserLocal();
  const firstName = User && User.Doctor ? User.Doctor.firstname : "";
  const initial = firstName ? firstName.trim().charAt(0).toUpperCase() : "";

  const handleClick = (event) =>
    setAnchor(
      anchor && anchor.contains(event.target) ? null : event.currentTarget,
    );
  const handleClose = () => setAnchor(null);

  const ShowChangePassword = () => {
    handleClose();
    setDialog(<ChangePasswordDialog OnClose={() => setDialog(null)} />);
  };

  const open = Boolean(anchor);

  return (
    <>
      {Dialog}
      <Chip
        active={open}
        onClick={handleClick}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("Profile")}
      >
        <Avatar
          sx={{
            width: T.avatar,
            height: T.avatar,
            fontSize: 12,
            fontWeight: 600,
            bgcolor: "primary.main",
          }}
        >
          {initial || <PersonOutlineOutlinedIcon sx={{ fontSize: T.icon }} />}
        </Avatar>
        <Box
          component="span"
          sx={{
            ...adminNavbarLinksSx.userName,
            maxWidth: T.nameMaxWidth,
            display: { xs: "none", md: "block" },
          }}
        >
          {firstName}
        </Box>
        <KeyboardArrowDownOutlinedIcon
          sx={{
            fontSize: T.chevron,
            color: colors.text.muted,
            display: { xs: "none", md: "block" },
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 200ms",
          }}
        />
      </Chip>
      <Popper
        open={open}
        anchorEl={anchor}
        transition
        placement="bottom-end"
        modifiers={[{ name: "offset", options: { offset: [0, T.gapGroup] } }]}
        sx={{ zIndex: 1200 }}
      >
        {({ TransitionProps }) => (
          <Grow
            {...TransitionProps}
            id="profile-menu-list"
            style={{ transformOrigin: "top right" }}
          >
            <Paper sx={adminNavbarLinksSx.dropdown}>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList role="menu" autoFocusItem={open}>
                  <MenuItem
                    onClick={() => {
                      handleClose();
                      customHistory.push("/admin/Profile");
                    }}
                    sx={{
                      ...adminNavbarLinksSx.dropdownItem,
                      ...adminNavbarLinksSx.lightBlueHover,
                    }}
                  >
                    <AccountCircleOutlinedIcon
                      sx={adminNavbarLinksSx.dropdownItemIcon}
                    />
                    <Box
                      component="span"
                      sx={adminNavbarLinksSx.dropdownItemText}
                    >
                      {t("User information")}
                    </Box>
                  </MenuItem>
                  <MenuItem
                    onClick={ShowChangePassword}
                    sx={{
                      ...adminNavbarLinksSx.dropdownItem,
                      ...adminNavbarLinksSx.lightBlueHover,
                    }}
                  >
                    <LockOutlinedIcon
                      sx={adminNavbarLinksSx.dropdownItemIcon}
                    />
                    <Box
                      component="span"
                      sx={adminNavbarLinksSx.dropdownItemText}
                    >
                      {t("Change password")}
                    </Box>
                  </MenuItem>
                  <Divider light />
                  <MenuItem
                    sx={{
                      ...adminNavbarLinksSx.dropdownItem,
                      ...adminNavbarLinksSx.dropdownItemDanger,
                    }}
                    onClick={async () => {
                      await Helper.AuthHelper.LogOut((success) => {
                        // Deliberately a hard navigation: logout must tear down
                        // the SPA so no in-memory state (or open tab) survives.
                        if (success) document.location = "/auth/login";
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
                      {t("Logout")}
                    </Box>
                  </MenuItem>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
}
