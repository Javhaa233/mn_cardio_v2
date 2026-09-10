import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  Avatar,
  Box,
  Checkbox,
  CircularProgress,
  InputAdornment,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  MenuItem,
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
 * So this shows people immediately and lets you narrow them down three ways -
 * by aimag, by soum/district, and by free text over name, profession and
 * organisation. Clicking a row IS the action; there is no second step.
 *
 * Paging is append-on-scroll. The server caps a page at 50, and there are ~3290
 * doctors, so without this only the first 50 were ever reachable.
 *
 * The aimag and soum filters are keyed by NAME, not by addr_prov_city id: the
 * ids and the stored names disagree on real rows (id 10 is Дундговь, yet rows
 * carry ProvCityName 'Улаанбаатар'), so filtering by id pulled Адаацаг doctors
 * into a search for the capital. See SearchUsers in ChatController.
 */

const DEBOUNCE_MS = 350;
const PAGE_SIZE = 50;
const ALL = "__all__";

export default function DoctorPicker({
  Multiple,
  SelectedIds,
  OnPick,
  Height = 320,
}) {
  const { t } = useTranslation();

  const [query, setQuery] = useState("");
  const [province, setProvince] = useState(ALL);
  const [soum, setSoum] = useState(ALL);

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [filters, setFilters] = useState({ Provinces: [], Soums: [] });

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
      setFilters({
        Provinces: res.Data.Provinces || [],
        Soums: res.Data.Soums || [],
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const soumOptions = useMemo(() => {
    if (province === ALL) return [];
    return filters.Soums.filter((s) => s.ProvinceName === province);
  }, [filters.Soums, province]);

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
          ProvinceName: province === ALL ? "" : province,
          SoumName: soum === ALL ? "" : soum,
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
    [query, province, soum],
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
  }, [query, province, soum, fetchPage]);

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
      {/* Aimag / soum.
          No floating `label` on these: the app's controls are 32px tall
          (CONTROL.fontSize / theme.js), and an outlined MUI label has nowhere to
          float to in that height - it lands on top of the value. The meaning
          lives in the default option text instead. */}
      <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
        <TextField
          select
          size="small"
          fullWidth
          value={province}
          onChange={(e) => {
            setProvince(e.target.value);
            setSoum(ALL); // a soum from the old aimag would match nothing
          }}
        >
          <MenuItem value={ALL}>{t("Бүх аймаг / хот")}</MenuItem>
          {filters.Provinces.map((p) => (
            <MenuItem key={p.Name} value={p.Name}>
              {p.Name} ({p.Count})
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          size="small"
          fullWidth
          value={soum}
          disabled={province === ALL || soumOptions.length === 0}
          onChange={(e) => setSoum(e.target.value)}
        >
          <MenuItem value={ALL}>{t("Бүх сум / дүүрэг")}</MenuItem>
          {soumOptions.map((s) => (
            <MenuItem key={s.Name} value={s.Name}>
              {s.Name} ({s.Count})
            </MenuItem>
          ))}
        </TextField>
      </Box>

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
                  [
                    d.profession,
                    d.OrganizationName,
                    d.SoumDistName,
                    d.ProvCityName,
                  ]
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
