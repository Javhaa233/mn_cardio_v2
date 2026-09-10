import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Divider from "@mui/material/Divider";
import Grow from "@mui/material/Grow";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import Tooltip from "@mui/material/Tooltip";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { adminNavbarLinksSx } from "assets/jss/material-dashboard-pro-react/components/adminNavbarLinksStyle.js";
import { colors } from "@/theme/colors";
import useTabActions from "./useTabActions";

/**
 * Every open tab in one list, so jumping to a page is one click even when the
 * strip has scrolled it out of view.
 *
 * Lives at the right end of the tab strip, not in the top bar: it is a tab
 * control, so it belongs with the tabs. Keeping it here also keeps its count
 * away from the notification bell - a neutral tab count sitting next to an
 * unread-alert badge reads as a second alert.
 */
export default function OpenTabsMenu({
  routeIndex,
  onSelect,
  onClose,
  homePath,
  size = 30,
}) {
  const { t } = useTranslation();
  const [anchor, setAnchor] = useState(null);

  const items = useSelector((s) => s.tabs.items);
  const activeKey = useSelector((s) => s.tabs.activeKey);

  // Close-all shares the guarded path; per-row close is handed down from the
  // strip so both routes through the same confirm.
  const { requestCloseAll, confirm } = useTabActions(homePath);

  const open = Boolean(anchor);
  const close = () => setAnchor(null);

  const label = (tab) =>
    tab.titleOverride ||
    (tab.title.base ? t(tab.title.base) : "") +
      (tab.title.suffix ? " · " + tab.title.suffix : "");

  return (
    <>
      {confirm}
      <Tooltip title={t("Нээлттэй цонхнууд")} placement="bottom">
        <Badge
          badgeContent={items.length}
          color="primary"
          // A permanent "1" is noise; the count only says something at two.
          invisible={items.length < 2}
          overlap="circular"
          sx={{
            "& .MuiBadge-badge": {
              height: 15,
              minWidth: 15,
              fontSize: 10,
              fontWeight: 600,
              border: `2px solid ${colors.background.primary}`,
              transform: "scale(1) translate(30%, -25%)",
            },
          }}
        >
          <IconButton
            size="small"
            aria-label={t("Нээлттэй цонхнууд")}
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={(event) => setAnchor(open ? null : event.currentTarget)}
            sx={{
              width: size,
              height: size,
              borderRadius: "7px",
              color: open ? colors.button.primary : colors.brand.inkMuted,
              backgroundColor: open
                ? colors.background.selected
                : "transparent",
              "&:hover": { backgroundColor: colors.brand.tint },
              "& .MuiSvgIcon-root": { fontSize: 18 },
            }}
          >
            <ExpandMoreIcon />
          </IconButton>
        </Badge>
      </Tooltip>

      <Popper
        open={open}
        anchorEl={anchor}
        transition
        placement="bottom-end"
        modifiers={[{ name: "offset", options: { offset: [0, 6] } }]}
        sx={{ zIndex: 1200 }}
      >
        {({ TransitionProps }) => (
          <Grow {...TransitionProps} style={{ transformOrigin: "top right" }}>
            <Paper sx={{ ...adminNavbarLinksSx.dropdown, minWidth: 280 }}>
              <ClickAwayListener onClickAway={close}>
                <Box>
                  <OverlayScrollbarsComponent
                    defer
                    options={{ scrollbars: { autoHide: "leave" } }}
                    style={{ maxHeight: 400 }}
                  >
                    <MenuList role="menu">
                      {items.map((tab) => {
                        const isActive = tab.key === activeKey;
                        return (
                          <MenuItem
                            key={tab.key}
                            onClick={() => {
                              close();
                              onSelect(tab);
                            }}
                            sx={{
                              ...adminNavbarLinksSx.dropdownItem,
                              ...adminNavbarLinksSx.lightBlueHover,
                              position: "relative",
                              pl: "14px",
                              fontWeight: isActive ? 600 : 400,
                              backgroundColor: isActive
                                ? colors.background.selected
                                : undefined,
                              color: isActive
                                ? colors.button.primary
                                : undefined,
                              "&::before": isActive
                                ? {
                                    content: '""',
                                    position: "absolute",
                                    left: 0,
                                    top: 6,
                                    bottom: 6,
                                    width: "3px",
                                    borderRadius: "2px",
                                    backgroundColor: colors.button.primary,
                                  }
                                : undefined,
                            }}
                          >
                            <Box
                              component="span"
                              sx={{
                                ...adminNavbarLinksSx.dropdownItemText,
                                flex: 1,
                                minWidth: 0,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                color: "inherit",
                              }}
                            >
                              {label(tab)}
                            </Box>
                            {tab.dirty ? (
                              <Box
                                aria-label={t("Хадгалаагүй")}
                                sx={{
                                  flex: "0 0 auto",
                                  width: 6,
                                  height: 6,
                                  mr: "4px",
                                  borderRadius: "50%",
                                  backgroundColor: colors.button.primary,
                                }}
                              />
                            ) : null}
                            <IconButton
                              size="small"
                              aria-label={t("Хаах")}
                              onClick={(event) => {
                                event.stopPropagation();
                                onClose(tab);
                              }}
                              sx={{
                                flex: "0 0 auto",
                                width: 20,
                                height: 20,
                                "& .MuiSvgIcon-root": { fontSize: 16 },
                              }}
                            >
                              <CloseOutlinedIcon />
                            </IconButton>
                          </MenuItem>
                        );
                      })}
                    </MenuList>
                  </OverlayScrollbarsComponent>

                  <Divider light />
                  <MenuItem
                    onClick={() => {
                      close();
                      requestCloseAll();
                    }}
                    sx={{
                      ...adminNavbarLinksSx.dropdownItem,
                      ...adminNavbarLinksSx.dropdownItemDanger,
                    }}
                  >
                    <Box
                      component="span"
                      sx={adminNavbarLinksSx.dropdownItemText}
                    >
                      {t("Бүх цонхыг хаах")}
                    </Box>
                  </MenuItem>
                </Box>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
}
