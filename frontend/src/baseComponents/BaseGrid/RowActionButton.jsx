import React from "react";
import { IconButton, Tooltip } from "@mui/material";

import { colors } from "@/theme/colors";
import { radius, motion } from "@/theme/tokens";

/**
 * The icon button in a grid's row-actions column.
 *
 * There were four different renderings of this across the table screens - a
 * bare IconButton with an inline `color: "red"`, a Creative Tim `Button`, a
 * full bespoke component, and one good version with a Tooltip and an aria-label
 * hidden inside TenderFormTable.jsx. This is that good one, lifted out.
 *
 * `stopPropagation` is not optional: the row is double-clickable (it opens the
 * detail dialog) and clickable to select, so without it every row action also
 * fires the row's own handler.
 *
 * Shaped to be dropped straight into BaseGrid's `RowActions` array, which
 * clones the element with `rowdata` injected:
 *
 *   RowActions={[
 *     { Component: <RowActionButton label={t("Засах")} icon={<EditIcon />} />,
 *       onClick: (row) => this.Edit(row) },
 *   ]}
 */
export default function RowActionButton({
  rowdata,
  label,
  icon,
  onClick,
  run,
  danger = false,
  disabled = false,
}) {
  const handler = onClick || run;

  const button = (
    <IconButton
      size="small"
      aria-label={label}
      disabled={disabled}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handler && handler(rowdata);
      }}
      sx={{
        width: "28px",
        height: "28px",
        padding: 0,
        borderRadius: radius.xs,
        color: danger ? colors.status.danger : colors.text.secondary,
        transition: `background-color ${motion.fast}, color ${motion.fast}`,
        "& svg": { fontSize: "18px" },
        "&:hover": {
          backgroundColor: danger
            ? "rgba(220, 53, 69, 0.08)"
            : colors.brand.tint,
          color: danger ? colors.status.danger : colors.brand.cyanInk,
        },
        "&:focus-visible": {
          outline: `2px solid ${colors.brand.focus}`,
          outlineOffset: "1px",
        },
        "&.Mui-disabled": { opacity: 0.35 },
      }}
    >
      {icon}
    </IconButton>
  );

  // Tooltip does not forward to a disabled child, so wrap it to keep the label
  // reachable when the action is unavailable.
  return disabled ? (
    <Tooltip title={label}>
      <span style={{ display: "inline-flex" }}>{button}</span>
    </Tooltip>
  ) : (
    <Tooltip title={label}>{button}</Tooltip>
  );
}
