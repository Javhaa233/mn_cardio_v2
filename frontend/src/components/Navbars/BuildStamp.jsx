import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { format, parseISO } from "date-fns";

import { colors } from "@/theme/colors";

/**
 * The version and build time of the running bundle, for the foot of the profile
 * menu.
 *
 * Until this existed there was no way to tell from inside the app which build you
 * were looking at - answering "when was the system last updated?" meant an SSH
 * session and the mtime of build/index.html. The values come from `define` in
 * vite.config.js and are baked in at build time, so the line cannot drift.
 *
 * Deliberately NOT a MenuItem: it is information, not an action. A MenuItem here
 * would be a focusable row that does nothing, and arrow-key navigation would stop
 * on it. A plain Box has no tabindex, so MUI's MenuList skips it.
 *
 * In `npm run dev` the time shown is when the dev server started. That is honest,
 * but it is not a deployment record.
 */
export default function BuildStamp() {
  const { t } = useTranslation();

  const version = typeof __APP_VERSION__ === "string" ? __APP_VERSION__ : "";
  const commit = typeof __BUILD_COMMIT__ === "string" ? __BUILD_COMMIT__ : "";

  // The stamp is UTC; date-fns renders it in the viewer's own zone, which is +08
  // for every real user. A bundle built before the define existed has no stamp at
  // all, hence the guard - the version alone is still worth showing.
  let built = "";
  try {
    built = format(parseISO(__BUILD_TIME__), "yyyy.MM.dd HH:mm");
  } catch {
    built = "";
  }

  if (!version && !built) return null;

  const label = [version ? "v" + version : "", built]
    .filter(Boolean)
    .join(" · ");
  const title =
    (built ? t("Сүүлд шинэчилсэн") + ": " + built : "") +
    (commit ? " (" + commit + ")" : "");

  return (
    <Box
      title={title.trim() || undefined}
      sx={{
        px: 2,
        pt: 0.75,
        pb: 0.25,
        textAlign: "center",
        cursor: "default",
        userSelect: "text", // so it can be copied straight into a bug report
      }}
    >
      <Typography variant="caption" sx={{ color: colors.brand.inkDim }}>
        {label}
      </Typography>
    </Box>
  );
}
