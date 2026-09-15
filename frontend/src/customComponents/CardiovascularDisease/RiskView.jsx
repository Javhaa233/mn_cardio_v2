import React from "react";

import StatusChip from "customComponents/StatusChip";
import { colors } from "@/theme/colors";

// Level → the band text, the tone of the word, and the scale hue of the dot.
const LEVELS = {
  1: { text: "5-аас бага хувь", tone: "success" },
  2: { text: "5-10 хувь", tone: "warning" },
  3: { text: "10-20 хувь", tone: "warning" },
  4: { text: "20-30 хувь", tone: "danger" },
  5: { text: "30-аас дээш хувь", tone: "danger" },
};

/**
 * The 10-year risk band in the CVD examination grids.
 *
 * It was white text on the band's solid colour, filling the cell. On the
 * 5-10% yellow that is ~1.4:1 - unreadable - and a column of it out-shouted
 * the rest of the row. It is the shared status pill now: the word in a tone
 * that passes AA, the band's own colour (unchanged) in the dot.
 */
export default function RiskView(props) {
  const { rowdata } = props;
  const level = rowdata ? rowdata.Risk : "";
  const band = LEVELS[level];
  if (!band) return null;

  return (
    <StatusChip Tone={band.tone} Dot={colors.risk[level]} Label={band.text} />
  );
}
