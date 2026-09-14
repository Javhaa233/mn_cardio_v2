import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import i18next from "i18next";

import Box from "@mui/material/Box";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Divider from "@mui/material/Divider";
import Grow from "@mui/material/Grow";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";

import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import MoreVertOutlinedIcon from "@mui/icons-material/MoreVertOutlined";

import ChangePasswordDialog from "customComponents/Profile/ChangePasswordDialog";
import { adminNavbarLinksSx } from "assets/jss/material-dashboard-pro-react/components/adminNavbarLinksStyle.js";
import Helper from "helper";
import customHistory from "customHistory";

import TopBarIconButton from "./TopBarIconButton";
import { FlagMN, FlagGB } from "./FlagGlyphs";
import T from "./topBarTokens";

/**
 * Sub-`sm` overflow. Merges the utilities AND identity clusters into ONE menu:
 * two nearly identical dropdowns 36px apart on a phone is worse than one.
 *
 * Today's bar has no overflow at all - the search alone consumes ~292px of a
 * ~560px viewport - so this is the safety valve that makes every control
 * reachable at every width.
 */
export default function TopBarOverflowMenu() {
  const { t } = useTranslation();
  const [anchor, setAnchor] = useState(null);
  const [Dialog, setDialog] = useState(null);

  const User = Helper.AuthHelper.GetLogedUserLocal();
  const isMn = (User && User.Language) === "mn";

  const open = Boolean(anchor);
  const handleClose = () => setAnchor(null);

  const ChangeLanguage = async () => {
    const next = isMn ? "en" : "mn";
    handleClose();
    i18next.changeLanguage(next);
    try {
      await Helper.AuthHelper.ChangeLanguage(next);
    } catch (ex) {
      process.env.NODE_ENV === "development" && console.log(ex);
    }
  };

  const ShowChangePassword = () => {
    handleClose();
    setDialog(<ChangePasswordDialog OnClose={() => setDialog(null)} />);
  };

  const item = (icon, label, onClick, danger) => (
    <MenuItem
      onClick={onClick}
      sx={{
        ...adminNavbarLinksSx.dropdownItem,
        ...(danger
          ? adminNavbarLinksSx.dropdownItemDanger
          : adminNavbarLinksSx.lightBlueHover),
      }}
    >
      {icon}
      <Box component="span" sx={adminNavbarLinksSx.dropdownItemText}>
        {label}
      </Box>
    </MenuItem>
  );

  return (
    <>
      {Dialog}
      <TopBarIconButton
        title={t("More")}
        active={open}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(event) => setAnchor(open ? null : event.currentTarget)}
      >
        <MoreVertOutlinedIcon />
      </TopBarIconButton>
      <Popper
        open={open}
        anchorEl={anchor}
        transition
        placement="bottom-end"
        modifiers={[{ name: "offset", options: { offset: [0, T.gapGroup] } }]}
        sx={{ zIndex: 1200 }}
      >
        {({ TransitionProps }) => (
          <Grow {...TransitionProps} style={{ transformOrigin: "top right" }}>
            <Paper sx={adminNavbarLinksSx.dropdown}>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList role="menu" autoFocusItem={open}>
                  {item(
                    <HelpOutlineOutlinedIcon
                      sx={adminNavbarLinksSx.dropdownItemIcon}
                    />,
                    t("User handbook"),
                    () => {
                      handleClose();
                      customHistory.push("/admin/Handbook");
                    },
                  )}
                  {item(
                    <Box
                      sx={{
                        ...adminNavbarLinksSx.dropdownItemIcon,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {isMn ? <FlagMN /> : <FlagGB />}
                    </Box>,
                    isMn ? t("Switch to English") : t("Switch to Mongolian"),
                    ChangeLanguage,
                  )}
                  <Divider light />
                  {item(
                    <AccountCircleOutlinedIcon
                      sx={adminNavbarLinksSx.dropdownItemIcon}
                    />,
                    t("User information"),
                    () => {
                      handleClose();
                      customHistory.push("/admin/Profile");
                    },
                  )}
                  {item(
                    <LockOutlinedIcon
                      sx={adminNavbarLinksSx.dropdownItemIcon}
                    />,
                    t("Change password"),
                    ShowChangePassword,
                  )}
                  <Divider light />
                  {item(
                    <LogoutOutlinedIcon
                      sx={adminNavbarLinksSx.dropdownItemIcon}
                    />,
                    t("Logout"),
                    async () => {
                      await Helper.AuthHelper.LogOut((success) => {
                        if (success) document.location = "/auth/login";
                      });
                    },
                    true,
                  )}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
}
