import React, { useState } from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import SelfImprovementIcon from "@mui/icons-material/SelfImprovement";

import { colors } from "@/theme/colors";
import { radius, elevation } from "@/theme/tokens";

/**
 * Сэргээн засах контентын хуудасны нийтлэг жижиг хэсгүүд. Гадаргуу нь UI
 * дүрмийн дагуу: хуудасны карт radius.lg + hairline + elevation[1], дотор
 * самбар radius.md.
 */

/**
 * The app theme (theme.js MuiInputLabel) floats a label INSIDE the top edge of
 * the control. A single-line input leaves room for it; a select centres its
 * value and a multiline field starts at the top, so both drew the value
 * through the label. These give them the same room, for every field inside a
 * rehab panel or dialog.
 */
export const labelRoomSx = {
  "& .MuiFormControl-root:has(> .MuiInputLabel-root) .MuiInputBase-multiline": {
    pt: "16px",
  },
  // Switch labels came out in a pale grey that reads as disabled.
  "& .MuiFormControlLabel-label": { color: colors.brand.ink },
  "& .MuiFormControl-root:has(> .MuiInputLabel-root) .MuiSelect-select": {
    pt: "14px",
  },
};

export const panelSx = {
  bgcolor: colors.brand.surface,
  border: `1px solid ${colors.brand.hairline}`,
  borderRadius: radius.lg,
  boxShadow: elevation[1],
  ...labelRoomSx,
};

export const subPanelSx = {
  border: `1px solid ${colors.brand.hairline}`,
  borderRadius: radius.md,
  p: 2,
};

/** Хэсгийн гарчиг: дугаар, нэр, баруун талд нэмэлт. */
export function Section({ no, title, hint, action, children }) {
  return (
    <Box component="section" sx={subPanelSx}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        {no && (
          <Box
            sx={{
              width: 22,
              height: 22,
              borderRadius: radius.pill,
              bgcolor: colors.brand.tintSolid,
              color: colors.brand.cyanInk,
              display: "grid",
              placeItems: "center",
              flex: "none",
            }}
          >
            <Typography
              variant="caption"
              component="span"
              sx={{ fontWeight: 700 }}
            >
              {no}
            </Typography>
          </Box>
        )}
        <Typography variant="subtitle1" component="div" sx={{ flex: 1 }}>
          {title}
        </Typography>
        {action}
      </Stack>
      {hint && (
        <Typography
          variant="caption"
          component="div"
          color="text.secondary"
          sx={{ mt: -1, mb: 1.5 }}
        >
          {hint}
        </Typography>
      )}
      {children}
    </Box>
  );
}

Section.propTypes = {
  no: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  title: PropTypes.string,
  hint: PropTypes.node,
  action: PropTypes.node,
  children: PropTypes.node,
};

/** Бүхэл тооны талбар: хоосон бол "" хадгална, сөрөг оруулахгүй. */
export function NumField({
  label,
  value,
  onChange,
  min = 0,
  max,
  width = 150,
  ...rest
}) {
  return (
    <TextField
      label={label}
      type="number"
      size="small"
      value={value === null || value === undefined ? "" : value}
      onChange={(e) => {
        const raw = e.target.value;
        if (raw === "") return onChange("");
        const n = parseInt(raw, 10);
        if (!Number.isFinite(n)) return undefined;
        return onChange(Math.max(min, max ? Math.min(max, n) : n));
      }}
      inputProps={{ min, max }}
      sx={{ width }}
      {...rest}
    />
  );
}

NumField.propTypes = {
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onChange: PropTypes.func,
  min: PropTypes.number,
  max: PropTypes.number,
  width: PropTypes.number,
};

/** Хадгалаагүй өөрчлөлтийн цэг + текст. */
export function DirtyDot({ dirty }) {
  if (!dirty) return null;
  return (
    <Stack direction="row" alignItems="center" spacing={0.75}>
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: radius.pill,
          bgcolor: colors.status.warning,
        }}
      />
      <Typography variant="caption" sx={{ color: colors.status.warningInk }}>
        Хадгалаагүй өөрчлөлт
      </Typography>
    </Stack>
  );
}

DirtyDot.propTypes = { dirty: PropTypes.bool };

/** Засварлагчийн доод хэсэгт наалддаг үйлдлийн мөр. */
export function StickyBar({ children }) {
  return (
    <Box
      sx={{
        position: "sticky",
        bottom: 0,
        zIndex: 2,
        mt: 2,
        mx: -2,
        mb: -2,
        px: 2,
        py: 1.25,
        bgcolor: colors.brand.surface,
        borderTop: `1px solid ${colors.brand.hairline}`,
        borderBottomLeftRadius: radius.lg,
        borderBottomRightRadius: radius.lg,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5}>
        {children}
      </Stack>
    </Box>
  );
}

StickyBar.propTypes = { children: PropTypes.node };

/**
 * Жижиг зураг — ачаалж чадахгүй бол (тасалбар хугацаа дууссан, файл серверт
 * байхгүй) эвдэрсэн зургийн оронд дасгалын тэмдэг харуулна.
 */
export function Thumb({ src, width, height, iconSize = "medium" }) {
  const [failed, setFailed] = useState(null);
  const ok = src && failed !== src;
  return (
    <Box
      sx={{
        width,
        height,
        flex: "none",
        borderRadius: radius.sm,
        overflow: "hidden",
        bgcolor: colors.brand.canvas,
        display: "grid",
        placeItems: "center",
      }}
    >
      {ok ? (
        <Box
          component="img"
          src={src}
          alt=""
          onError={() => setFailed(src)}
          sx={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <SelfImprovementIcon
          fontSize={iconSize}
          sx={{ color: colors.brand.cyan }}
        />
      )}
    </Box>
  );
}

Thumb.propTypes = {
  src: PropTypes.string,
  width: PropTypes.number,
  height: PropTypes.number,
  iconSize: PropTypes.string,
};
