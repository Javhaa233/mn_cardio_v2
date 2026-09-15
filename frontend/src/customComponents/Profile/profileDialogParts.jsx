import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import FormLabel from "@mui/material/FormLabel";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";

import Helper from "helper";
import { colors } from "@/theme/colors";
import { elevation, radius, space } from "@/theme/tokens";
import { gridToolbarButtonSx } from "@/theme/controlStyles";

/**
 * Shared pieces of the account dialogs - the contact prompt, change password,
 * edit profile and the admin's doctor dialog - so they read as one family:
 * same header, same label-above-field layout, same sections, same buttons.
 */

export const fieldGridSx = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
  columnGap: space[5],
  rowGap: 0,
};

/** Icon + title over a hairline, then a two-column field grid. */
export function FormSection({ Id, Icon, Title, Description, children }) {
  return (
    <Box role="group" aria-labelledby={Id} sx={{ minWidth: 0 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: space[2],
          paddingBottom: space[2],
          marginBottom: space[3],
          borderBottom: `1px solid ${colors.brand.hairline}`,
        }}
      >
        <Icon aria-hidden sx={{ fontSize: 20, color: colors.brand.cyanInk }} />
        <Typography
          id={Id}
          variant="h5"
          component="div"
          sx={{ color: colors.brand.ink }}
        >
          {Title}
        </Typography>
        {Description ? (
          <Typography
            variant="caption"
            component="div"
            sx={{ color: colors.brand.inkDim, marginLeft: "auto" }}
          >
            {Description}
          </Typography>
        ) : null}
      </Box>
      <Box sx={fieldGridSx}>{children}</Box>
    </Box>
  );
}

/**
 * Searchable organisation list. Searches the server as you type instead of
 * pulling all ~700 organisations up front.
 */
export function OrganizationPicker({ Id, Value, OnChange, Disabled, Error }) {
  const { t } = useTranslation();
  const [Options, setOptions] = useState([]);
  const [Query, setQuery] = useState("");
  const [Loading, setLoading] = useState(false);
  const [Open, setOpen] = useState(false);

  useEffect(() => {
    if (!Open) return undefined;
    let Alive = true;
    const Timer = setTimeout(
      () => {
        setLoading(true);
        const SearchOption = Helper.BaseCrudHelper.GetSearchOption();
        SearchOption.PageOption.Limit = 50;
        SearchOption.SearchField = Query
          ? [{ Field: "Name", Value: Query, Op: "Contains" }]
          : [];
        Helper.BaseCrudHelper.BaseGetList(
          { ObjectName: "Organization", SearchOption },
          (resData) => {
            if (!Alive) return;
            setLoading(false);
            setOptions(
              Array.isArray(resData && resData.Data) ? resData.Data : [],
            );
          },
        );
      },
      Query ? 300 : 0,
    );
    return () => {
      Alive = false;
      clearTimeout(Timer);
    };
  }, [Open, Query]);

  // The current value must be among the options or MUI cannot show it - but
  // only while it matches what is typed, or a search for another name would
  // "find" the current organisation.
  const ValueMatches =
    !!Value &&
    (!Query ||
      String(Value.Name || "")
        .toLowerCase()
        .includes(Query.toLowerCase()));
  const AllOptions =
    ValueMatches && !Options.some((Option) => Option.Id === Value.Id)
      ? [Value, ...Options]
      : Options;

  return (
    <Autocomplete
      id={Id}
      options={AllOptions}
      value={Value}
      disabled={Disabled}
      open={Open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      onChange={(event, Option) =>
        OnChange(Option ? { Id: Option.Id, Name: Option.Name } : null)
      }
      onInputChange={(event, Text, reason) => {
        if (reason === "input") setQuery(Text);
        if (reason === "clear") setQuery("");
      }}
      getOptionLabel={(Option) => (Option && Option.Name) || ""}
      isOptionEqualToValue={(A, B) => A.Id === B.Id}
      filterOptions={(Items) => Items}
      loading={Loading}
      noOptionsText={t("No data")}
      loadingText={t("Loading...")}
      renderInput={(Params) => (
        <TextField
          {...Params}
          size="small"
          placeholder={t("Search organization")}
          error={!!Error}
          helperText={Error || " "}
        />
      )}
    />
  );
}

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
