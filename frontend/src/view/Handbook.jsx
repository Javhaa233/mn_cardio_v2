import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";

import { colors } from "@/theme/colors";

const HANDBOOK_URL = "/document/MnCardio Handbook Edited.pdf";

/**
 * The user handbook, rendered in-app.
 *
 * This replaces the top bar's old `window.open(..., "_blank")`, which opened a
 * second browser tab (and threw outright when a popup blocker returned null).
 * A plain <iframe> is deliberate over the installed-but-unused `react-pdf`: the
 * browser's own PDF viewer already gives search, zoom, print and download, and
 * react-pdf would need its pdf.js worker wired into Vite for no gain.
 */
export default function Handbook() {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        backgroundColor: colors.background.primary,
        borderRadius: "6px",
        overflow: "hidden",
      }}
    >
      <Box
        component="iframe"
        src={`${HANDBOOK_URL}#toolbar=1`}
        title={t("User handbook")}
        sx={{ flex: 1, minHeight: 0, width: "100%", border: 0 }}
      />
    </Box>
  );
}
