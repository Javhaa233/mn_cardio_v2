import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import PropTypes from "prop-types";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import { styled } from "@mui/material/styles";

import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";

import AdminNavbarLinks from "components/Navbars/AdminNavbarLinks";
import TopBarIconButton from "components/Navbars/TopBarIconButton";
import T from "components/Navbars/topBarTokens";
import { PatientSearch } from "@features/patient";
import { colors } from "@/theme/colors";
import { elevation } from "@/theme/tokens";
import customHistory from "customHistory";

const Navbar = styled(AppBar)({
  backgroundColor: colors.background.primary,
  // The navy-tinted token, not a 20px grey blur: that blur spread a dark band
  // over the tab strip and made the gap under the bar look bigger than it was.
  boxShadow: elevation[2],
  borderBottom: `1px solid ${colors.border.divider}`,
  marginBottom: "0",
  position: "sticky",
  top: "0",
  width: "100%",
  paddingTop: "0",
  zIndex: 1030,
  color: colors.text.strong,
  border: "0",
  borderRadius: "0",
  height: T.height,
  minHeight: T.height,
  display: "block",
});

const NavbarContainer = styled(Toolbar)(({ theme }) => ({
  position: "relative",
  paddingRight: T.sidePad,
  paddingLeft: T.sidePad,
  marginRight: "auto",
  marginLeft: "auto",
  width: "100%",
  height: T.height,
  minHeight: T.height,
  display: "flex",
  alignItems: "center",
  // MUI's Toolbar mixin sets minHeight 64 from `sm` up (and 48/56 below). Left
  // alone it kept this toolbar 64px tall inside the 48px bar, so every icon
  // sat centred on 32px - visibly low in the bar. Pin it at every breakpoint.
  [theme.breakpoints.up("xs")]: { minHeight: T.height },
  [theme.breakpoints.up("sm")]: { minHeight: T.height },
  "@media (min-width:0px) and (orientation: landscape)": {
    minHeight: T.height,
  },
  [theme.breakpoints.down("md")]: {
    paddingLeft: T.sidePadSm,
    paddingRight: T.sidePadSm,
  },
}));

/**
 * Admin top bar.
 *
 *   [ search ]  <- spacer ->  [ bell  help  flag ] | [ profile ]
 *     GROUP A                   GROUP B              GROUP C
 *     work context              utilities            identity
 *
 * Search is leftmost because it is the most-used control in the app: a session
 * starts with a register number. The right cluster answers "who am I / system".
 *
 * The open-tabs menu is NOT here - it sits at the end of the tab strip, with the
 * tabs it controls. That also keeps its count away from the notification badge,
 * where a neutral number reads as a second alert.
 *
 * Group A is left-anchored and B+C right-anchored with a flex spacer between, so
 * expanding the search consumes the spacer and NOTHING else in the bar moves.
 */
export default function AdminNavbar(props) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const [searchExpanded, setSearchExpanded] = useState(false);

  // Derived during render from the router's location. The old code ran a
  // useEffect keyed on `window.location.pathname`, which React does not track -
  // so it never re-ran on client-side navigation and the search box stayed stuck
  // hidden after leaving /admin/Cardiovascular.
  const showPatientSearch = pathname !== "/admin/Cardiovascular";

  return (
    <Navbar>
      <NavbarContainer component="nav" aria-label={t("Top bar")}>
        {/* GROUP A - work context */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: `${T.gapItem}px`,
            flex: "0 0 auto",
            minWidth: 0,
            // Below sm the expanded search takes over the whole bar rather than
            // fighting three clusters for ~560px.
            ...(searchExpanded && {
              position: { xs: "absolute", sm: "static" },
              left: { xs: T.sidePadSm, sm: "auto" },
              right: { xs: T.sidePadSm, sm: "auto" },
              zIndex: { xs: 2, sm: "auto" },
            }),
          }}
        >
          {showPatientSearch ? (
            <PatientSearch
              onExpandedChange={setSearchExpanded}
              Search={(SearchText) => {
                customHistory.push(
                  "/admin/PatientInfo?RegisterNo=" + SearchText,
                );
              }}
            />
          ) : null}
          {/* The open-tabs menu lives in the tab strip itself, with the tabs. */}
        </Box>

        <Box sx={{ flex: "1 1 auto", minWidth: 0 }} />

        {/* GROUPS B + C - utilities, divider, identity */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flex: "0 0 auto",
            height: "100%",
            visibility: {
              xs: searchExpanded ? "hidden" : "visible",
              sm: "visible",
            },
          }}
        >
          <AdminNavbarLinks />
          <Box
            sx={{
              display: { xs: "flex", md: "none" },
              alignItems: "center",
              ml: `${T.gapItem}px`,
            }}
          >
            <TopBarIconButton
              title={t("Menu")}
              aria-label="open drawer"
              onClick={props.handleDrawerToggle}
            >
              <MenuOutlinedIcon />
            </TopBarIconButton>
          </Box>
        </Box>
      </NavbarContainer>
    </Navbar>
  );
}

// The bar shell and its inner toolbar, for the patient portal's top bar
// (PatientNavbar), so both bars share one height, shadow and padding.
export { Navbar as TopBarShell, NavbarContainer as TopBarInner };

AdminNavbar.propTypes = {
  handleDrawerToggle: PropTypes.func,
};
