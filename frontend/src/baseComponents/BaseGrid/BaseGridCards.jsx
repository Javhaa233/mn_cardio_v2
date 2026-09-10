import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import { colors } from "@/theme/colors";
import { radius, space, elevation } from "@/theme/tokens";

/**
 * The phone rendering of a list.
 *
 * WHY A SEPARATE RENDERING AND NOT A NARROW TABLE
 * Every grid column in this app is given a FIXED pixel width, from a
 * `widthPattern` string used in 53 files - no `flex`, no `minWidth`. A registry
 * list is therefore 900-1500px wide by construction. On a 390px phone that is
 * two-axis scrolling: to read one patient's row you scroll right, losing the
 * name column, then back left to find the next row. The data is all present
 * and none of it is usable one-handed.
 *
 * So below `sm` the same rows are rendered as cards instead. Same data, same
 * formatting, no horizontal scrolling.
 *
 * WHY IT REUSES `columns` RATHER THAN READING `Fields`
 * The column definitions already carry everything that makes a cell correct:
 * date formatting, gender labels, translation, text truncation, and the
 * `ColumnActions` components some screens inject per field. Re-deriving any of
 * that here would mean a phone silently showing raw values where the desktop
 * shows formatted ones. Calling the SAME `renderCell` keeps them identical.
 *
 * This is safe because no data column's `renderCell` touches `params.api` -
 * they read `params.value` and `params.row` only. The one that does is the row
 * number, and a card has no row number.
 */

/** Columns that describe the grid's chrome rather than the record. */
const ROW_NUMBER_FIELD = "__row_number__";
const ROW_ACTIONS_FIELD = "__row_actions__";

/** How many fields a card shows before it stops being scannable. */
const DEFAULT_CARD_FIELDS = 4;

export default function BaseGridCards({
  rows,
  columns,
  paginationModel,
  onPaginationModelChange,
  rowCount,
  serverSide,
  hidePagination,
  hideCheck,
  rowSelectionModel,
  setRowSelectionModel,
  onOpen,
  noRowsText,
  noRowsAction,
  cardFields,
}) {
  const { t } = useTranslation();

  const dataColumns = useMemo(
    () =>
      columns.filter(
        (c) => c.field !== ROW_NUMBER_FIELD && c.field !== ROW_ACTIONS_FIELD,
      ),
    [columns],
  );

  const actionsColumn = useMemo(
    () => columns.find((c) => c.field === ROW_ACTIONS_FIELD),
    [columns],
  );

  /**
   * Which fields make the card.
   *
   * Default is the first few columns, because list screens here are already
   * authored with the identifying columns first - patient, date, status. A
   * screen that needs different ones passes `CardFields` with the field names.
   */
  const visibleColumns = useMemo(() => {
    if (Array.isArray(cardFields) && cardFields.length > 0) {
      const wanted = cardFields.map((f) => String(f).replace(/\./g, "__"));
      const picked = wanted
        .map((name) => dataColumns.find((c) => c.field === name))
        .filter(Boolean);
      if (picked.length > 0) return picked;
    }
    return dataColumns.slice(0, DEFAULT_CARD_FIELDS);
  }, [dataColumns, cardFields]);

  // Client-side paging. In server mode the parent already handed us one page.
  const pagedRows = useMemo(() => {
    if (serverSide || hidePagination) return rows;
    const start = paginationModel.page * paginationModel.pageSize;
    return rows.slice(start, start + paginationModel.pageSize);
  }, [rows, paginationModel, serverSide, hidePagination]);

  const total = serverSide ? rowCount || rows.length : rows.length;
  const pageCount = Math.max(1, Math.ceil(total / paginationModel.pageSize));
  const atFirst = paginationModel.page <= 0;
  const atLast = paginationModel.page >= pageCount - 1;

  const selectedIds =
    rowSelectionModel?.ids instanceof Set ? rowSelectionModel.ids : new Set();

  const toggle = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setRowSelectionModel({ type: "include", ids: next });
  };

  /** Resolve one cell exactly the way the grid would. */
  const cellContent = (col, row) => {
    const value = col.valueGetter
      ? col.valueGetter(row[col.field], row)
      : row[col.field];
    if (typeof col.renderCell === "function") {
      return col.renderCell({ value, row, id: row.id, field: col.field });
    }
    return value === null || value === undefined ? "" : value;
  };

  if (!pagedRows.length) {
    return (
      <Box
        sx={{
          padding: space[8],
          textAlign: "center",
          color: colors.text.muted,
        }}
      >
        <Typography variant="body2">{noRowsText || t("No data")}</Typography>
        {noRowsAction}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flex: "1 1 auto",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          flex: "1 1 auto",
          minHeight: 0,
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          display: "flex",
          flexDirection: "column",
          gap: space[2],
          padding: space[2],
        }}
      >
        {pagedRows.map((row) => {
          const [primary, ...rest] = visibleColumns;
          const isSelected = selectedIds.has(row.id);

          return (
            <Box
              key={row.id}
              // The whole card is the tap target for opening the record. On a
              // desktop grid that affordance is a double-click, which does not
              // exist on touch, so without this a phone user can see a record
              // and never open it.
              onClick={onOpen ? () => onOpen(row) : undefined}
              sx={{
                border: `1px solid ${
                  isSelected ? colors.brand.cyanInk : colors.brand.hairline
                }`,
                borderRadius: radius.sm,
                backgroundColor: "#fff",
                boxShadow: elevation[1],
                padding: space[3],
                cursor: onOpen ? "pointer" : "default",
                display: "flex",
                flexDirection: "column",
                gap: space[1],
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: space[2],
                }}
              >
                {!hideCheck && (
                  <Checkbox
                    checked={isSelected}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => toggle(row.id)}
                    sx={{ padding: 0, marginTop: "2px" }}
                  />
                )}
                {primary && (
                  <Typography
                    variant="h5"
                    sx={{ flex: 1, minWidth: 0, wordBreak: "break-word" }}
                  >
                    {cellContent(primary, row)}
                  </Typography>
                )}
              </Box>

              {rest.map((col) => {
                const content = cellContent(col, row);
                if (content === "" || content === null || content === undefined)
                  return null;
                return (
                  <Box
                    key={col.field}
                    sx={{
                      display: "flex",
                      gap: space[2],
                      alignItems: "baseline",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: colors.text.muted,
                        flex: "0 0 40%",
                        minWidth: 0,
                        wordBreak: "break-word",
                      }}
                    >
                      {col.headerName}
                    </Typography>
                    <Box
                      sx={{
                        flex: 1,
                        minWidth: 0,
                        fontSize: "14px",
                        wordBreak: "break-word",
                      }}
                    >
                      {content}
                    </Box>
                  </Box>
                );
              })}

              {actionsColumn && (
                <Box
                  onClick={(e) => e.stopPropagation()}
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: space[1],
                    marginTop: space[1],
                    paddingTop: space[2],
                    borderTop: `1px solid ${colors.brand.hairline}`,
                  }}
                >
                  {actionsColumn.renderCell({ row, id: row.id })}
                </Box>
              )}
            </Box>
          );
        })}
      </Box>

      {!hidePagination && (
        <Box
          sx={{
            flex: "0 0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: space[2],
            // Clear the chat FAB. It is `position: fixed` at bottom:30/right:30
            // and 60px across (customComponents/Chat/Chat.jsx), so it lands
            // exactly on top of the "next page" button at the bottom-right of
            // a phone. Without this the list cannot be paged forward at all -
            // caught by a browser probe, not by reading the code.
            paddingRight: { xs: "96px", sm: space[2] },
            borderTop: `1px solid ${colors.brand.hairline}`,
          }}
        >
          <IconButton
            disabled={atFirst}
            aria-label={t("Previous")}
            onClick={() =>
              onPaginationModelChange({
                ...paginationModel,
                page: paginationModel.page - 1,
              })
            }
          >
            <ChevronLeftIcon />
          </IconButton>
          <Typography variant="caption" sx={{ color: colors.text.muted }}>
            {paginationModel.page + 1} / {pageCount} ({total})
          </Typography>
          <IconButton
            disabled={atLast}
            aria-label={t("Next")}
            onClick={() =>
              onPaginationModelChange({
                ...paginationModel,
                page: paginationModel.page + 1,
              })
            }
          >
            <ChevronRightIcon />
          </IconButton>
        </Box>
      )}
    </Box>
  );
}
