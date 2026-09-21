import React from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { NavLink, useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import MenuIcon from "@mui/icons-material/Menu";

import patientPortalRoutes from "routes/patientPortalRoutes";
import { useIsPhone } from "helper/useResponsive";
import { colors } from "@/theme/colors";
import { layout, elevation, motion } from "@/theme/tokens";

/**
 * The patient portal's phone navigation.
 *
 * WHY THIS EXISTS
 * The portal inherited the doctor's shell: a 260px sidebar that collapses to a
 * hamburger drawer below 960px. That is right for a doctor, who works from a
 * desktop or a docked tablet and uses the whole route table. It is wrong for a
 * patient, who is on a phone and wants four things: today's numbers, their
 * notes, asking their doctor something, and the answer. Behind a hamburger,
 * all four cost two taps and a decision.
 *
 * So: a bottom bar on phones, the sidebar unchanged everywhere else. The
 * hamburger stays too - this bar is a shortcut to the common four, not a
 * replacement for the menu, which is what the fifth tab opens.
 *
 * PHONES ONLY, AND ONLY THIS PORTAL
 * `useIsPhone()` is `down("sm")`, i.e. under 600px. Between 600 and 959 there
 * is no bar and the sidebar is still a temporary drawer - that band is iPad
 * portrait, where a drawer is the right affordance and there is room for it.
 * The doctor shell gets no bar at any width.
 */

/**
 * The four, by path.
 *
 * Deliberately derived from `patientPortalRoutes` rather than restated here:
 * the label and the icon then cannot drift from what the sidebar shows for the
 * same destination, which is the usual way two navigations start disagreeing.
 */
const PRIMARY_PATHS = [
  "/PatientHome",
  "/PatientMonitoringPat",
  "/PatientQuestion",
  "/PatientAdvice",
];

/**
 * Bar labels, where the sidebar's wording is too long for a 78px tab.
 *
 * Only "Эмчийн зөвлөгөө" needs it: measured at 390px it is the one label that
 * wraps to two lines while the other four sit on one, which makes the bar look
 * broken rather than full. "Зөвлөгөө" is not a new coinage - it is the word
 * the ЗСӨ screen already uses for its own advice tab.
 *
 * The icon and the destination still come from the route table; this overrides
 * the label only, so the two navigations cannot point at different places.
 */
const SHORT_LABEL = {
  "/PatientAdvice": "Зөвлөгөө",
};

const BAR_HEIGHT = layout.bottomNavHeight;

/**
 * `env()` resolves to 0 today: index.html has no `viewport-fit=cover`, so iOS
 * reports no insets. The `max()` keeps a real 6px gap now and the rule starts
 * honouring the home indicator by itself the day that meta tag is added.
 */
export const BOTTOM_NAV_INSET = `calc(${BAR_HEIGHT}px + max(6px, env(safe-area-inset-bottom, 0px)))`;

export default function PatientBottomNav({ onOpenMenu, menuOpen }) {
  const { t } = useTranslation();
  const location = useLocation();
  const isPhone = useIsPhone();

  if (!isPhone) return null;

  const items = PRIMARY_PATHS.map((p) =>
    patientPortalRoutes.find((r) => r.path === p),
  ).filter(Boolean);

  // Which tab is current. `false` is meaningful to BottomNavigation - it means
  // none - and is what we want on the four routes that live behind the menu,
  // rather than falsely lighting up Нүүр.
  const activePath = items.find((r) =>
    location.pathname.startsWith("/patient" + r.path),
  );
  const value = activePath ? activePath.path : false;

  return (
    <Box
      component="nav"
      aria-label={t("Үндсэн цэс")}
      sx={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        // Above the top bar (1030); below the drawer this opens and the chat
        // dock (both 1200) and below any dialog (1300).
        zIndex: 1100,
        backgroundColor: colors.brand.surface,
        borderTop: `1px solid ${colors.brand.hairline}`,
        boxShadow: elevation[2],
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <BottomNavigation
        value={value}
        showLabels
        sx={{
          height: BAR_HEIGHT,
          backgroundColor: "transparent",
          "& .MuiBottomNavigationAction-root": {
            // MUI defaults this to 80px. Five of those is 400px, wider than a
            // 360px phone, and the bar would overflow before anything else
            // went wrong.
            minWidth: 0,
            padding: "6px 2px",
            color: colors.brand.inkMuted,
            transition: `color ${motion.fast}`,
            "&.Mui-selected": { color: colors.brand.cyanInk },
            "&:focus-visible": {
              outline: `2px solid ${colors.brand.focus}`,
              outlineOffset: "-2px",
              borderRadius: "6px",
            },
          },
          "& .MuiBottomNavigationAction-label": {
            fontSize: "11px",
            lineHeight: 1.2,
            // MUI shrinks unselected labels; at this size that is unreadable,
            // and every label here is a whole Mongolian word.
            "&.Mui-selected": { fontSize: "11px" },
          },
          "& .MuiSvgIcon-root": { fontSize: "22px" },
        }}
      >
        {items.map((r) => {
          const Icon = r.icon;
          const to = "/patient" + r.path;
          return (
            <BottomNavigationAction
              key={r.path}
              value={r.path}
              label={t(SHORT_LABEL[r.path] || r.name)}
              icon={<Icon />}
              // A real anchor, not a button: Enter, middle-click and the
              // browser's own "open in new tab" all come free, and a screen
              // reader announces a link rather than a button that moves you.
              //
              // No explicit aria-current: NavLink sets aria-current="page" on
              // the active link itself. (Three elements carry it on a phone -
              // this one plus the active link in each keep-mounted drawer -
              // but both drawers are display:none there, so exactly one is
              // exposed. Verified in the browser.)
              component={NavLink}
              to={to}
            />
          );
        })}

        {/* Not a link. This one opens the full route table - the same drawer
            the hamburger opens - so it is a button, and it says so. */}
        <BottomNavigationAction
          value="__menu"
          label={t("Цэс")}
          icon={<MenuIcon />}
          onClick={onOpenMenu}
          aria-expanded={!!menuOpen}
          aria-controls="app-nav-drawer"
        />
      </BottomNavigation>
    </Box>
  );
}

PatientBottomNav.propTypes = {
  /** Opens the sidebar drawer - the portal's full route table. */
  onOpenMenu: PropTypes.func.isRequired,
  /** Drawer open state, so the menu tab can report it to assistive tech. */
  menuOpen: PropTypes.bool,
};
