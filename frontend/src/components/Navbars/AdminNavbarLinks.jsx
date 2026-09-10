import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";

import Notification from "customComponents/Notification/Notification";
import { colors } from "@/theme/colors";

import HelpButton from "./HelpButton";
import LanguageToggle from "./LanguageToggle";
import ProfileMenu from "./ProfileMenu";
import TopBarOverflowMenu from "./TopBarOverflowMenu";
import T from "./topBarTokens";

/**
 * The right-hand side of the admin top bar: the utilities cluster, a divider,
 * and the identity cluster.
 *
 * This file used to hold the profile menu, the help button and the MN/EN buttons
 * inline (279 lines). Each now lives in its own file; this is pure composition.
 *
 * NOTE ON `adminNavbarLinksStyle.js`: the admin bar no longer imports its button
 * and icon keys, but DO NOT prune them from that file.
 * `components/Navbars/PatientNavbarLinks.jsx` imports the same object and
 * consumes `buttonLink`, `headerLinksSvg`, `links`, `managerClasses` and
 * `primaryHover`. Deleting them would silently break the patient-portal top bar,
 * which is out of scope here. Its dropdown keys are still used, by ProfileMenu
 * and TopBarOverflowMenu.
 */
export default function AdminNavbarLinks() {
  return (
    <>
      {/* Utilities. Notifications leads: it is the only control that changes on
          its own, and it is the one furthest from Logout inside the profile
          menu, so a mis-click near the right edge can never land on it. */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: `${T.gapItem}px`,
        }}
      >
        <Notification />
        <Box
          sx={{
            display: { xs: "none", sm: "flex" },
            alignItems: "center",
            gap: `${T.gapItem}px`,
          }}
        >
          <HelpButton />
          <LanguageToggle />
        </Box>
        <Box sx={{ display: { xs: "flex", sm: "none" } }}>
          <TopBarOverflowMenu />
        </Box>
      </Box>

      <Divider
        orientation="vertical"
        flexItem
        sx={{
          display: { xs: "none", sm: "block" },
          alignSelf: "center",
          height: T.dividerHeight,
          mx: `${T.gapGroup}px`,
          borderColor: colors.border.divider,
        }}
      />

      {/* Identity. Far right: universal convention, and the widest element, so
          it anchors the right edge and its bottom-end menu can never clip. */}
      <Box sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center" }}>
        <ProfileMenu />
      </Box>
    </>
  );
}
