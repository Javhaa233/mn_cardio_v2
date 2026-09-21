import React from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";

import { TopBarShell, TopBarInner } from "components/Navbars/AdminNavbar";
import ProfileMenu from "components/Navbars/ProfileMenu";
import TopBarIconButton from "components/Navbars/TopBarIconButton";
import LanguageToggle from "components/Navbars/LanguageToggle";
import PatientNotificationBell from "components/Navbars/PatientNotificationBell";
import T from "components/Navbars/topBarTokens";

/**
 * The patient portal's top bar.
 *
 * It was its own 60px white AppBar with a Creative Tim profile button and a
 * pink round hamburger - 12px taller than the doctor's bar and built from none
 * of its parts. It now IS the doctor's bar shell (48px, same shadow and
 * padding), with the same profile chip (ProfileMenu, patient variant) and the
 * same icon button for the drawer. The profile menu stays visible at every
 * width: it is the only place a patient can log out.
 */
export default function PatientNavbar({ handleDrawerToggle }) {
  const { t } = useTranslation();
  return (
    <TopBarShell>
      <TopBarInner component="nav" aria-label={t("Top bar")}>
        <Box sx={{ flex: "1 1 auto", minWidth: 0 }} />
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          {/* The patient bar had no language control at all, so a patient who
              landed in English - or whose account carries Language "en" - had
              no way back to Mongolian short of clearing site data. The doctor
              bar has had this all along. */}
          <PatientNotificationBell />
          <LanguageToggle SeedFromAccount={false} />
          <ProfileMenu Variant="patient" />
          <Box
            sx={{
              // Phones reach the menu from the bottom bar's Цэс tab, so the
              // hamburger would be a second control for the same drawer. It
              // stays for tablet portrait (600-959), where there is no bottom
              // bar and the sidebar is still a temporary drawer.
              display: { xs: "none", sm: "flex", md: "none" },
              alignItems: "center",
              ml: `${T.gapItem}px`,
            }}
          >
            <TopBarIconButton
              title={t("Menu")}
              aria-label="open drawer"
              onClick={handleDrawerToggle}
            >
              <MenuOutlinedIcon />
            </TopBarIconButton>
          </Box>
        </Box>
      </TopBarInner>
    </TopBarShell>
  );
}
