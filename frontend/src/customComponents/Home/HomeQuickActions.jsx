import { useState } from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";

import AirlineSeatFlatIcon from "@mui/icons-material/AirlineSeatFlat";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import GroupIcon from "@mui/icons-material/Group";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import EventNoteIcon from "@mui/icons-material/EventNote";

import Helper from "helper";
import { TilePanel } from "customComponents/Home/Tiles";
import { colors } from "@/theme/colors";
import { space } from "@/theme/tokens";
import customHistory from "customHistory";
import NewPatientDialog from "customComponents/Patient/NewPatientDialog";

/**
 * The six screens a doctor opens daily, one click from the landing page.
 *
 * Compact link rows rather than the six large ActionTile cards the patient home
 * uses: this sits in a 260-380px rail alongside other panels, and six cards
 * would make the rail taller than the viewport, at which point the sticky rail
 * stops behaving like one.
 *
 * Every label here is already a key in both translation catalogs.
 */
const ACTIONS = [
  {
    // `action` instead of `to`: this one opens a dialog rather than navigating.
    // Different glyph from "Created patient" below, which already owns
    // PersonAddAltIcon - two identical icons in a six-item list is a bug.
    key: "Шинэ өвчтөн",
    action: "new-patient",
    Icon: PersonAddAlt1Icon,
    roles: [1, 2, 3],
  },
  {
    key: "Personal monitoring",
    to: "/admin/PatientMonitoringDoctor",
    Icon: AssignmentTurnedInIcon,
  },
  { key: "My visits", to: "/admin/CreateAllVisits", Icon: EventNoteIcon },
  {
    key: "Created patient",
    to: "/admin/CreatePatients",
    Icon: PersonAddAltIcon,
  },
  { key: "ЗСЭ шалгах", to: "/admin/Cardiovascular", Icon: FavoriteBorderIcon },
  {
    key: "Team monitoring",
    to: "/admin/DoctorTeamCustom",
    Icon: GroupIcon,
    roles: [1, 2],
  },
  {
    key: "In patient",
    to: "/admin/InPatient",
    Icon: AirlineSeatFlatIcon,
    roles: [1, 2],
  },
];

export default function HomeQuickActions() {
  const { t } = useTranslation();
  const [newPatientOpen, setNewPatientOpen] = useState(false);

  const visible = ACTIONS.filter(
    (a) => !a.roles || Helper.AuthHelper.CheckRole(a.roles) === true,
  );

  // Most rows navigate; one opens a dialog. Rows that act rather than go are
  // announced as buttons, not links, so a screen reader is not told to expect a
  // page change that never comes.
  const run = (item) => {
    if (item.action === "new-patient") setNewPatientOpen(true);
    else if (item.to) customHistory.push(item.to);
  };

  return (
    <TilePanel Title={t("Түргэн үйлдэл")} Variant="panel">
      <NewPatientDialog
        open={newPatientOpen}
        onClose={() => setNewPatientOpen(false)}
        onCreated={({ RegisterNo }) => {
          // Land on the patient that was just created - registering someone is
          // almost always the first half of "and now examine them".
          if (RegisterNo) {
            customHistory.push("/admin/PatientInfo?RegisterNo=" + RegisterNo);
          }
        }}
      />
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        {visible.map((item) => (
          <Box
            key={item.key}
            onClick={() => run(item)}
            role={item.action ? "button" : "link"}
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                run(item);
              }
            }}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: space[2],
              padding: "8px 6px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "13px",
              color: colors.text.primary,
              "& svg": { fontSize: "18px", color: colors.text.muted },
              "&:hover": { backgroundColor: colors.background.hover },
              "&:focus": { outline: "none" },
              "&:focus-visible": {
                outline: `2px solid ${colors.button.primary}`,
                outlineOffset: "-2px",
              },
            }}
          >
            <item.Icon />
            <Box
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {t(item.key)}
            </Box>
          </Box>
        ))}
      </Box>
    </TilePanel>
  );
}
