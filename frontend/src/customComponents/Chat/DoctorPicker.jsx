import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Autocomplete,
  Avatar,
  Box,
  Checkbox,
  CircularProgress,
  InputAdornment,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

import Helper from "helper";
import { colors } from "@/theme/colors";

/**
 * Browse and search the doctor directory.
 *
 * NOT baseComponents/Controls/BaseLookUpGridLoad. That control is a form-field
 * typeahead: an input with a Popper grid that stays EMPTY until you type, and it
 * only commits once you pick a row and then press a separate button. For "who do
 * I want to message?" that reads as "there are no doctors".
 *
 * So this shows people immediately and lets you narrow them down two ways -
 * by organisation, and by free text over name, profession and organisation.
 * Clicking a row IS the action; there is no second step.
 *
 * Paging is append-on-scroll. The server caps a page at 50, and there are ~3290
 * doctors, so without this only the first 50 were ever reachable.
 *
 * Organisation is the only filter because it is the only location a doctor
 * account is created with (the admin form sets OrganizationId and nothing
 * else). The old aimag / soum selects were built from DoctorsProfile address
 * columns that newer accounts leave empty, so they hid most doctors.
 */

const DEBOUNCE_MS = 350;
const PAGE_SIZE = 50;

export default function DoctorPicker({
  Multiple,
  SelectedIds,
  OnPick,
  Height = 320,
}) {
  const { t } = useTranslation();

  const [query, setQuery] = useState("");
  const [organization, setOrganization] = useState(null);

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [organizations, setOrganizations] = useState([]);

  // Guards against a slow early response overwriting a newer one.
  const seq = useRef(0);
  const viewportRef = useRef(null);

  /* ----------------------------------------------------------------- *
   * Filter lists (loaded once)
   * ----------------------------------------------------------------- */
  useEffect(() => {
    let cancelled = false;
    Helper.ChatHelper.GetDirectoryFilters((res) => {
      if (cancelled || !res || !res.Success || !res.Data) return;
      setOrganizations(res.Data.Organizations || []);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const organizationId = organization ? organization.Id : null;

  /* ----------------------------------------------------------------- *
   * Results
   * ----------------------------------------------------------------- */

  const fetchPage = useCallback(
    (pageNumber, { append }) => {
      const mine = ++seq.current;
      if (append) setLoadingMore(true);
      else setLoading(true);

      Helper.ChatHelper.SearchUsers(
        {
          SearchText: query.trim(),
          PageSize: PAGE_SIZE,
          PageNumber: pageNumber,
          OrganizationId: organizationId || undefined,
        },
        (res) => {
          if (mine !== seq.current) return;
          setLoading(false);
          setLoadingMore(false);
          if (!res || !res.Success) {
            if (!append) {
              setRows([]);
              setTotal(0);
            }
            return;
          }
          const data = Array.isArray(res.Data) ? res.Data : [];
          setTotal((res.Option && res.Option.Total) || 0);
          setRows((prev) => (append ? prev.concat(data) : data));
        },
      );
    },
    [query, organizationId],
  );

  // Any change to the query or the filters restarts from page 0.
  useEffect(() => {
    const id = setTimeout(
      () => {
        setPage(0);
        fetchPage(0, { append: false });
        if (viewportRef.current) viewportRef.current.scrollTop = 0;
      },
      query ? DEBOUNCE_MS : 0,
    );
    return () => clearTimeout(id);
  }, [query, organizationId, fetchPage]);

  const onScroll = useCallback(() => {
    const el = viewportRef.current;
    if (!el || loading || loadingMore) return;
    if (rows.length >= total) return;

    if (el.scrollHeight - el.scrollTop - el.clientHeight < 120) {
      const next = page + 1;
      setPage(next);
      fetchPage(next, { append: true });
    }
  }, [loading, loadingMore, rows.length, total, page, fetchPage]);

  const isSelected = (d) =>
    Array.isArray(SelectedIds) && SelectedIds.indexOf(d.UserId) > -1;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
      {/* Organisation.
          No floating `label`: the app's controls are 32px tall
          (CONTROL.fontSize / theme.js), and an outlined MUI label has nowhere to
          float to in that height - it lands on top of the value. The meaning
          lives in the placeholder instead. Typeahead, because there are
          hundreds of organisations. Hidden when there is nothing to choose
          from (a patient's care-team directory). */}
      {organizations.length > 0 ? (
        <Autocomplete
          size="small"
          fullWidth
          sx={{ mb: 1 }}
          options={organizations}
          value={organization}
          onChange={(_e, value) => setOrganization(value)}
          getOptionLabel={(o) => (o && o.Name) || ""}
          isOptionEqualToValue={(o, v) => o.Id === v.Id}
          renderOption={(props, o) => {
            // React warns when `key` arrives inside a spread.
            const { key, ...rest } = props;
            return (
              <li key={o.Id} {...rest}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 1,
                    width: "100%",
                  }}
                >
                  <span>{o.Name}</span>
                  <Typography
                    variant="caption"
                    component="span"
                    sx={{ color: colors.brand.inkMuted, flexShrink: 0 }}
                  >
                    {o.Count}
                  </Typography>
                </Box>
              </li>
            );
          }}
          noOptionsText={t("Илэрц олдсонгүй")}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={t("Бүх байгууллага")}
              inputProps={{
                ...params.inputProps,
                "aria-label": t("Байгууллага"),
              }}
            />
          )}
        />
      ) : null}

      <TextField
        autoFocus
        fullWidth
        size="small"
        placeholder={t("Эмчийн нэр, мэргэжил, байгууллагаар хайх")}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        inputProps={{
          "aria-label": t("Эмчийн нэр, мэргэжил, байгууллагаар хайх"),
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon
                fontSize="small"
                sx={{ color: colors.brand.inkMuted }}
              />
            </InputAdornment>
          ),
          endAdornment: loading ? (
            <InputAdornment position="end">
              <CircularProgress size={16} />
            </InputAdornment>
          ) : null,
        }}
      />

      <Typography
        variant="caption"
        component="div"
        sx={{ mt: 0.75, mb: 0.5, color: colors.brand.inkMuted }}
      >
        {loading && rows.length === 0
          ? t("Хайж байна...")
          : `${t("Нийт")}: ${total}${
              total > rows.length ? ` · ${t("үзүүлсэн")} ${rows.length}` : ""
            }`}
      </Typography>

      <Box
        ref={viewportRef}
        onScroll={onScroll}
        sx={{
          height: Height,
          overflowY: "auto",
          border: `1px solid ${colors.brand.hairline}`,
          borderRadius: 1,
          minHeight: 0,
        }}
      >
        {!loading && rows.length === 0 ? (
          <Typography
            variant="body2"
            component="div"
            sx={{ p: 3, textAlign: "center", color: colors.brand.inkMuted }}
          >
            {t("Илэрц олдсонгүй")}
          </Typography>
        ) : null}

        <List disablePadding>
          {rows.map((d) => (
            <ListItemButton
              key={`${d.UserType}-${d.UserId}`}
              onClick={() => OnPick(d)}
              selected={isSelected(d)}
              sx={{ "&.Mui-selected": { bgcolor: colors.brand.tint } }}
            >
              {Multiple ? (
                <Checkbox
                  edge="start"
                  tabIndex={-1}
                  disableRipple
                  checked={isSelected(d)}
                  sx={{ mr: 0.5, color: colors.brand.cyanInk }}
                />
              ) : null}

              <ListItemAvatar sx={{ minWidth: 44 }}>
                <Avatar
                  src={d.ImageSrc || undefined}
                  sx={{ width: 34, height: 34 }}
                >
                  {(d.Name || "?").charAt(0)}
                </Avatar>
              </ListItemAvatar>

              <ListItemText
                primaryTypographyProps={{ variant: "body2", component: "div" }}
                secondaryTypographyProps={{
                  variant: "caption",
                  component: "div",
                }}
                primary={d.Name || d.FullName || t("Нэргүй")}
                secondary={
                  [d.profession, d.OrganizationName]
                    .filter(Boolean)
                    .join(" · ") || null
                }
              />
            </ListItemButton>
          ))}
        </List>

        {loadingMore ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 1.5 }}>
            <CircularProgress size={18} />
          </Box>
        ) : null}

        {!loading && rows.length > 0 && rows.length >= total ? (
          <Typography
            variant="caption"
            component="div"
            sx={{ textAlign: "center", py: 1, color: colors.brand.inkMuted }}
          >
            {t("Бүгдийг үзүүллээ")}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
}
