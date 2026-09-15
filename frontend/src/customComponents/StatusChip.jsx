import React from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";

import { colors } from "@/theme/colors";
import { radius, space } from "@/theme/tokens";

/**
 * A record's state as a small pill: a coloured dot and the word.
 *
 * The status columns used to be white text on saturated fills - #2bb559,
 * #ff5757, #ffcc00 - in nine separate files. White on that yellow is about
 * 1.4:1, so "Тодорхойгүй" and "Хугацаа тулсан" were close to unreadable, and a
 * list of them was a stripe of green and red that shouted louder than the data.
 * The pill keeps the same meaning per colour, puts the word in a dark ink that
 * passes AA on its own tint, and repeats the meaning in the dot so it survives
 * without colour vision too. Same shape as the count pill in ListPageHeader.
 */
const TONES = {
  success: {
    ink: colors.status.successInk,
    tint: colors.status.successTint,
    dot: colors.status.success,
  },
  danger: {
    ink: colors.status.dangerInk,
    tint: colors.status.dangerTint,
    dot: colors.status.danger,
  },
  warning: {
    ink: colors.status.warningInk,
    tint: colors.status.warningTint,
    dot: colors.status.warning,
  },
  info: {
    ink: colors.brand.cyanInk,
    tint: colors.brand.tint,
    dot: colors.brand.cyan,
  },
  neutral: {
    ink: colors.brand.inkMuted,
    tint: "rgba(13, 58, 92, 0.07)",
    dot: colors.brand.inkDim,
  },
};

export default function StatusChip({ Tone = "neutral", Label, Dot, children }) {
  const tone = TONES[Tone] || TONES.neutral;
  const text = Label ?? children;
  return (
    <Box
      component="span"
      // Narrow grid columns ellipsize the word; the title keeps it readable.
      title={typeof text === "string" ? text : undefined}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        maxWidth: "100%",
        padding: `1px ${space[2]}`,
        borderRadius: radius.pill,
        backgroundColor: tone.tint,
        color: tone.ink,
        typography: "caption",
        fontWeight: 600,
        lineHeight: 1.6,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        verticalAlign: "middle",
      }}
    >
      <Box
        component="span"
        aria-hidden
        sx={{
          flex: "0 0 auto",
          width: "6px",
          height: "6px",
          borderRadius: radius.pill,
          // A scale with more steps than tones (the CVD risk levels) keeps
          // its own hue in the dot; the word stays in the tone ink.
          backgroundColor: Dot || tone.dot,
        }}
      />
      {text}
    </Box>
  );
}

StatusChip.propTypes = {
  Tone: PropTypes.oneOf(["success", "danger", "warning", "info", "neutral"]),
  Label: PropTypes.node,
  /** Optional dot colour overriding the tone (fills only, never text). */
  Dot: PropTypes.string,
  children: PropTypes.node,
};
