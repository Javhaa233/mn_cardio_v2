// translation
import { useTranslation } from "react-i18next";
// @mui/material components
import {
  Box,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
// @material-ui icons
import SettingsIcon from "@mui/icons-material/Settings";
import GroupIcon from "@mui/icons-material/Group";

import { colors } from "@/theme/colors";
import { space, radius, motion } from "@/theme/tokens";

/**
 * One group of teams in the left rail.
 *
 * Two things here are corrections rather than restyling:
 *
 * 1. The row was a plain `ListItem` with an `onClick`, so it could not be
 *    reached with the keyboard at all. It is a `ListItemButton` now.
 * 2. The settings gear was rendered ONLY on the already-active row, which made
 *    it unreachable by Tab and invisible until you had already committed to a
 *    team. It is always in the DOM now and simply revealed on hover or focus,
 *    so tabbing through the rail surfaces it.
 *
 * The active row previously used a mint `#c8fada` that belongs to no palette in
 * this app. It now uses the same language as a selected grid row: the brand
 * tint plus a 3px cyanInk accent down the leading edge.
 */
export default function DoctorTeamListItem(props) {
  const { t } = useTranslation();
  const { Data = [], ActiveDoctorTeamId = null, Header, onClick } = props;

  if (!Data || Data.length === 0) return null;

  return (
    <Box component="section" sx={{ marginBottom: space[3] }}>
      {Header ? (
        <Typography
          variant="overline"
          component="p"
          sx={{
            color: colors.brand.inkDim,
            padding: `${space[1]} ${space[2]}`,
            borderBottom: `1px solid ${colors.brand.hairline}`,
            marginBottom: space[1],
          }}
        >
          {Header}
        </Typography>
      ) : null}

      {Data.map((Team, index) => {
        const isActive = ActiveDoctorTeamId + "" === "" + Team.id_data;
        const count = Team.vwDoctorsTeamInfo
          ? Team.vwDoctorsTeamInfo.PatientCount
          : null;

        return (
          <ListItem
            key={"Item" + index}
            disablePadding
            secondaryAction={
              <Tooltip title={t("Багийн тохиргоо")}>
                <IconButton
                  className="doctor-team-gear"
                  aria-label={t("Багийн тохиргоо")}
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClick && onClick(Team.id_data, true);
                  }}
                  sx={{
                    width: "26px",
                    height: "26px",
                    padding: 0,
                    borderRadius: radius.xs,
                    color: colors.brand.inkDim,
                    opacity: isActive ? 1 : 0,
                    transition: `opacity ${motion.fast}, color ${motion.fast}`,
                    "& svg": { fontSize: "17px" },
                    "&:hover": {
                      backgroundColor: colors.brand.tint,
                      color: colors.brand.cyanInk,
                    },
                    "&:focus-visible": {
                      opacity: 1,
                      outline: `2px solid ${colors.brand.focus}`,
                      outlineOffset: "1px",
                    },
                  }}
                >
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
            }
            sx={{
              marginBottom: "2px",
              "&:hover .doctor-team-gear, &:focus-within .doctor-team-gear": {
                opacity: 1,
              },
            }}
          >
            <ListItemButton
              aria-current={isActive ? "true" : undefined}
              onClick={() => onClick && onClick(Team.id_data, false)}
              sx={{
                minWidth: 0,
                padding: `${space[2]} ${space[2]}`,
                paddingRight: space[8],
                borderRadius: radius.xs,
                backgroundColor: isActive ? colors.brand.tint : "transparent",
                boxShadow: isActive
                  ? `inset 3px 0 0 0 ${colors.brand.cyanInk}`
                  : "none",
                transition: `background-color ${motion.fast}`,
                "&:hover": { backgroundColor: colors.brand.tint },
                "&:focus-visible": {
                  outline: `2px solid ${colors.brand.focus}`,
                  outlineOffset: "-2px",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 0, marginRight: space[2] }}>
                <GroupIcon
                  sx={{
                    fontSize: "18px",
                    color: isActive
                      ? colors.brand.cyanInk
                      : colors.brand.inkDim,
                  }}
                />
              </ListItemIcon>

              <ListItemText
                disableTypography
                sx={{ minWidth: 0, margin: 0 }}
                primary={
                  <Typography
                    variant={isActive ? "h6" : "body2"}
                    // `component` is load-bearing: Typography would otherwise
                    // render variant h6 as a real <h6>, and _misc.scss styles
                    // bare headings at element level - `h6 { text-transform:
                    // uppercase }` - which shouted the active team's name.
                    component="span"
                    noWrap
                    sx={{
                      display: "block",
                      color: isActive ? colors.brand.ink : colors.text.primary,
                      lineHeight: 1.3,
                    }}
                  >
                    {Team.name}
                  </Typography>
                }
              />

              {count !== null && count !== undefined && count !== "" ? (
                <Box
                  aria-label={t("{{count}} өвчтөн", { count })}
                  sx={{
                    flex: "0 0 auto",
                    marginLeft: space[2],
                    padding: `0 ${space[2]}`,
                    borderRadius: radius.pill,
                    backgroundColor: isActive
                      ? colors.brand.surface
                      : colors.brand.tint,
                    border: `1px solid ${colors.brand.hairline}`,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: colors.brand.cyanInk, fontWeight: 600 }}
                  >
                    {count}
                  </Typography>
                </Box>
              ) : null}
            </ListItemButton>
          </ListItem>
        );
      })}
    </Box>
  );
}
