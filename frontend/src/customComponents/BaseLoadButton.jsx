import React, { useState } from "react";

import { useTranslation } from "react-i18next";
import { Button, CircularProgress } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";

import { gridToolbarButtonSx } from "@/theme/controlStyles";

/**
 * The button on a list toolbar. 23 files, 35 call sites - almost every button
 * that sits beside a data grid comes through here.
 *
 * It used to render `components/CustomButtons/Button`, the Creative Tim
 * template button, which paints `color="primary"` purple (#9c27b0) from a
 * palette unrelated to `theme/colors.js`. Switching to MUI's Button changes
 * COLOUR ONLY, not size: `theme.js` MuiButton.root already forces padding,
 * minHeight and fontSize with `!important`, so the template's own metrics were
 * never reaching the screen either.
 *
 * The legacy `Color` prop is mapped rather than removed, so no call site
 * changes. What it now selects is a RANK, not a hue:
 *   success -> primary   the one filled button on the bar (Search, Save)
 *   danger  -> danger    outlined red
 *   rose    -> danger
 *   *       -> neutral   outlined ink (Export, Print, Refresh)
 *
 * If a bar ends up with two filled buttons, that is the call site's problem to
 * settle - one of them is not the primary action.
 */
const RANK_BY_COLOR = {
  success: "primary",
  danger: "danger",
  rose: "danger",
};

const BaseLoadButton = ({
  Float,
  ButtonText,
  Icon,
  onClick,
  Color = "success",
  sx = {},
  style = {},
}) => {
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleClick = async () => {
    setLoading(true);
    try {
      if (onClick) {
        await onClick(() => setLoading(false));
      }
    } catch (error) {
      setLoading(false);
    }
  };

  const rank = RANK_BY_COLOR[Color] || "neutral";
  const StartIcon = Icon || SaveIcon;

  return (
    // Was `float` plus a `clear: both` spacer, inside flex GridContainers that
    // do not care about floats. inline-flex is what the layout actually wanted.
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        width: sx.width || style.width || "auto",
        ...style,
        ...(Float
          ? { marginLeft: Float === "right" ? "auto" : undefined }
          : {}),
      }}
    >
      <Button
        variant={rank === "primary" ? "contained" : "outlined"}
        onClick={handleClick}
        disabled={loading}
        fullWidth={Boolean(sx.width || style.width)}
        // The spinner lives in the icon slot. It used to be a CircularProgress
        // absolutely positioned over the label with `color: Color` - i.e. the
        // string "success" as a CSS colour, which is invalid, so it rendered
        // browser-default black on top of the text.
        startIcon={
          loading ? (
            <CircularProgress size={14} thickness={5} color="inherit" />
          ) : (
            <StartIcon />
          )
        }
        sx={{ ...gridToolbarButtonSx[rank], ...sx }}
      >
        {t(ButtonText + "")}
      </Button>
    </div>
  );
};

export default BaseLoadButton;
