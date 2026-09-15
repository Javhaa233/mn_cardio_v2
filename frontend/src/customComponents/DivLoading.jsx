import React from "react";
// @mui material components
import CircularProgress from "@mui/material/CircularProgress";

import { colors } from "@/theme/colors";

/**
 * The one loading spinner: a cyan arc over a hairline track.
 *
 * DivLoading, BaseLoading and PageLoading each drew their own - grey arcs on a
 * #eef3fd track, and a #1a90ff arc for the full page - so the app had three
 * loading looks. The arc is not text, so the brighter `cyan` is allowed here.
 */
export function BrandSpinner({ Size = 40, Thickness = 3.6 }) {
  return (
    <div style={{ position: "relative", width: Size, height: Size }}>
      {/* The track is decoration; the arc below carries role="progressbar". */}
      <CircularProgress
        aria-hidden
        variant="determinate"
        value={100}
        size={Size}
        thickness={Thickness}
        style={{ color: colors.brand.hairline, position: "absolute", left: 0 }}
      />
      <CircularProgress
        variant="indeterminate"
        disableShrink
        size={Size}
        thickness={Thickness}
        style={{
          color: colors.brand.cyan,
          animationDuration: "650ms",
          position: "absolute",
          left: 0,
          strokeLinecap: "round",
        }}
      />
    </div>
  );
}

export default function DivLoading(props) {
  const { WithoutCard = false } = props;

  return (
    <div
      style={{
        position: "absolute",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: "2",
        top: 0,
        bottom: 0,
        borderRadius: "inherit",
        // The canvas colour at 65%: the content underneath stays readable as
        // context instead of disappearing behind a grey (130,130,130) wash.
        backgroundColor: "rgba(234, 242, 248, 0.65)",
        right: WithoutCard ? 0 : "-10px",
        left: WithoutCard ? 0 : "-10px",
      }}
    >
      <BrandSpinner />
    </div>
  );
}
