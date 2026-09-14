import React from "react";
import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import FormLabel from "@mui/material/FormLabel";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";

import { colors } from "@/theme/colors";
import { elevation, radius, space } from "@/theme/tokens";
import { gridToolbarButtonSx } from "@/theme/controlStyles";

/**
 * Shared pieces of the three account dialogs - the contact prompt, change
 * password and edit profile - so they read as one family: same header, same
 * label-above-field layout, same buttons.
 */

export const fieldLabelSx = {
  typography: "body2",
  fontWeight: 600,
  color: colors.brand.ink,
  display: "block",
  marginBottom: space[1],
  "&.Mui-focused": { color: colors.brand.ink },
  "&.Mui-error": { color: colors.brand.ink },
  "& .MuiFormLabel-asterisk": { color: colors.status.danger },
};

// Dialog actions are the one place a 30px toolbar button is too small a target.
export const dialogActionSx = (rank) => ({
  ...gridToolbarButtonSx[rank],
  height: "36px",
});

export const dialogPaperSx = {
  borderRadius: radius.md,
  boxShadow: elevation[4],
};

/** Icon badge + title + one line of explanation, with an optional close button. */
export function DialogHeader({
  Icon,
  Title,
  Description,
  TitleId,
  DescriptionId,
  OnClose,
  CloseDisabled = false,
}) {
  const { t } = useTranslation();
  return (
    <Box
      sx={{
        display: "flex",
        gap: space[4],
        alignItems: "flex-start",
        padding: `${space[6]} ${space[6]} ${space[4]}`,
      }}
    >
      <Box
        aria-hidden
        sx={{
          flexShrink: 0,
          width: "40px",
          height: "40px",
          borderRadius: radius.md,
          backgroundColor: colors.brand.tint,
          color: colors.brand.cyanInk,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon sx={{ fontSize: 24 }} />
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        {/* component="div": a bare h3 is restyled by _misc.scss. */}
        <Typography
          id={TitleId}
          variant="h3"
          component="div"
          sx={{ color: colors.brand.ink }}
        >
          {Title}
        </Typography>
        {Description ? (
          <Typography
            id={DescriptionId}
            variant="body2"
            sx={{ color: colors.brand.inkDim, marginTop: space[1] }}
          >
            {Description}
          </Typography>
        ) : null}
      </Box>
      {OnClose ? (
        <IconButton
          aria-label={t("Close")}
          onClick={OnClose}
          disabled={CloseDisabled}
          size="small"
          sx={{ color: colors.brand.inkDim, margin: "-4px -8px 0 0" }}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </Box>
  );
}

/**
 * Label above a text field. The helper line always takes its height (" " when
 * empty) so an error appearing never shifts the fields below it.
 */
export function FormField({
  Id,
  Label,
  Required = false,
  Error,
  Hint,
  ContainerSx,
  ...TextFieldProps
}) {
  return (
    <Box sx={{ minWidth: 0, ...(ContainerSx || {}) }}>
      <FormLabel htmlFor={Id} required={Required} sx={fieldLabelSx}>
        {Label}
      </FormLabel>
      <TextField
        id={Id}
        fullWidth
        size="small"
        error={!!Error}
        helperText={Error || Hint || " "}
        {...TextFieldProps}
      />
    </Box>
  );
}
