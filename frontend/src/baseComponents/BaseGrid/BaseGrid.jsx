import React, {
  useState,
  useEffect,
  useMemo,
  cloneElement,
  useCallback,
  useRef,
} from "react";
import { debounce } from "lodash";
import {
  DataGrid,
  gridPageCountSelector,
  gridPageSelector,
  useGridApiContext,
  useGridSelector,
  gridPageSizeSelector,
  gridRowCountSelector,
  useGridApiRef,
} from "@mui/x-data-grid";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  TextField,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import SearchIcon from "@mui/icons-material/Search";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import { useTranslation } from "react-i18next";
import CustomColumnHeaders from "./CustomColumnHeaders";
import BaseGridCards from "./BaseGridCards";
import { useIsPhone } from "helper/useResponsive";
import Helper from "helper";
import { colors } from "@/theme/colors";
import { radius, motion } from "@/theme/tokens";

/**
 * The one grid skin.
 *
 * There used to be two: this block, and a `cleanSx` object layered over it for
 * callers that passed `Clean`. They disagreed on borders, zebra striping, header
 * type and every colour, so which one a screen got was an accident of whoever
 * wrote it. `CustomColumnHeaders` followed neither and hardcoded a third set of
 * greys, which is why a `Clean` grid showed a bordered grey header above a
 * borderless body.
 *
 * Now: one skin here, the same tokens in CustomColumnHeaders, and `Clean` kept
 * as an accepted no-op because ~30 call sites still pass it (and BaseTable still
 * reads it for its fitted-height maths).
 *
 * Separation comes from a hairline row rule, a hover wash and a selected accent
 * - not from a grid of vertical borders plus zebra stripes. At 13px with 15+
 * columns those compete with the hover and selected states and win, which is
 * exactly backwards: the row you are pointing at should be the loudest thing.
 */
const StyledDataGrid = styled(DataGrid)(
  ({ theme, dense, rowHeight, showFilterRow }) => ({
    border: `1px solid ${colors.brand.hairline} !important`,
    borderRadius: radius.xs,
    backgroundColor: `${colors.brand.surface} !important`,
    "& .MuiDataGrid-main": {
      borderRadius: radius.xs,
      backgroundColor: `${colors.brand.surface} !important`,
      overflow: "hidden",
    },
    "& .MuiDataGrid-virtualScroller": {
      marginTop: "0 !important",
    },
    "& .MuiDataGrid-columnHeaders": {
      margin: "0 !important",
      padding: "0 !important",
    },
    "& .MuiDataGrid-columnHeaders, & .MuiDataGrid-columnHeaderContainer": {
      zIndex: "105 !important",
      backgroundColor: `${colors.brand.tint} !important`,
      backgroundImage: "none !important",
      borderBottom: `1px solid ${colors.brand.hairline}`,
      minHeight: "var(--header-height, 40px) !important",
      maxHeight: "var(--header-height, 40px) !important",
      lineHeight: "1.2 !important",
      color: `${colors.text.heading} !important`,
    },
    "& .MuiDataGrid-columnHeadersInner, & .MuiDataGrid-columnHeaderRow": {
      backgroundColor: `${colors.brand.tint} !important`,
    },
    "& .MuiDataGrid-columnHeaders .MuiDataGrid-filler": {
      backgroundColor: `${colors.brand.tint} !important`,
    },
    "& .MuiDataGrid-filler, & [class*='MuiDataGrid-filler']": {
      backgroundColor: `${colors.brand.surface} !important`,
    },
    "& .MuiDataGrid-scrollbarFiller--header": {
      backgroundColor: `${colors.brand.tint} !important`,
    },
    "& .MuiDataGrid-columnHeaderTitle": {
      fontWeight: 600,
      fontSize: "11px",
      letterSpacing: "0.4px",
      textTransform: "uppercase",
      color: `${colors.text.heading} !important`,
      whiteSpace: "normal",
      lineHeight: "1.3",
      wordBreak: "break-word",
    },
    "& .MuiDataGrid-columnHeader": {
      backgroundColor: `${colors.brand.tint} !important`,
      padding: "0 10px !important",
      borderRight: "none",
      color: `${colors.text.heading} !important`,
      "& .MuiDataGrid-iconButtonContainer": { display: "none !important" },
      "& .MuiDataGrid-sortIcon": { display: "none !important" },
      "& .MuiDataGrid-menuIcon": { color: `${colors.text.heading} !important` },
      "&:last-of-type": { borderRight: "none" },
    },
    "& .MuiDataGrid-cell": {
      padding: "6px 10px !important",
      fontSize: "13px",
      color: colors.text.primary,
      borderRight: "none",
      borderBottom: "none",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      lineHeight: "1.4",
      display: "flex",
      alignItems: "center",
      minHeight: "36px !important",
      // The row owns the focus ring; a second one on the cell reads as noise.
      "&:focus, &:focus-within": { outline: "none" },
    },
    "& .MuiDataGrid-row": {
      borderBottom: `1px solid ${colors.brand.hairline}`,
      minHeight: `${rowHeight}px !important`,
      maxHeight: `${rowHeight}px !important`,
      transition: `background-color ${motion.fast}`,
      "&:hover": {
        backgroundColor: `${colors.brand.tint} !important`,
        cursor: "pointer",
      },
      // This accent bar has never rendered. It used to be written as
      // "inset 3px 0 0 0 ${colors.grid.selectedAccent}" inside plain double
      // quotes, so the interpolation shipped as literal text and the browser
      // dropped the declaration.
      "&.Mui-selected, &.Mui-selected:hover": {
        backgroundColor: `${colors.brand.tint} !important`,
        boxShadow: `inset 3px 0 0 0 ${colors.brand.cyanInk}`,
      },
      // Keyboard users got nothing here before. Doctors are asked to work these
      // lists without a mouse (CLAUDE.md section 6), so the focused row has to
      // be findable.
      "&:focus-within": {
        outline: `2px solid ${colors.brand.focus}`,
        outlineOffset: "-2px",
      },
      "&:last-of-type": { borderBottom: "none" },
    },
    "& .MuiDataGrid-footerContainer": {
      borderTop: `1px solid ${colors.brand.hairline}`,
      backgroundColor: colors.brand.surface,
      minHeight: "36px !important",
      height: "36px !important",
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start",
      color: colors.text.secondary,
    },
    "& .MuiTablePagination-root": {
      fontSize: "12.5px",
      color: colors.text.secondary,
    },
    "& .MuiTablePagination-toolbar": {
      paddingLeft: "8px",
    },
    "& .MuiDataGrid-virtualScroller, & .MuiDataGrid-virtualScrollerContent, & .MuiDataGrid-virtualScrollerRenderZone, & .MuiDataGrid-dataContainer, & .MuiDataGrid-window":
      {
        backgroundColor: `${colors.brand.surface} !important`,
        "&::-webkit-scrollbar": {
          width: "8px",
          height: "8px",
        },
        "&::-webkit-scrollbar-track": {
          backgroundColor: "transparent",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: colors.brand.hairlineStrong,
          borderRadius: radius.xs,
          "&:hover": {
            backgroundColor: colors.brand.inkDim,
          },
        },
      },
    "& .MuiDataGrid-filterForm": {
      padding: "8px 16px",
      gap: "12px",
      "& .MuiInputBase-root": {
        height: "40px",
        fontSize: "14px",
      },
      "& .MuiInputLabel-root": {
        transform: "translate(14px, 10px) scale(1)",
        "&.Mui-focused, &.MuiFormLabel-filled": {
          transform: "translate(14px, -9px) scale(0.75)",
        },
      },
    },
  }),
);

// Shared chrome for the two small controls in the footer - the page-size select
// and the go-to-page box. They are `variant="standard"` fields wearing a border,
// so the border has to be drawn by hand.
const footerControlSx = {
  height: "26px",
  fontSize: "12.5px",
  border: `1px solid ${colors.input.border}`,
  borderRadius: radius.xs,
  backgroundColor: colors.brand.surface,
  color: colors.text.primary,
  transition: `border-color ${motion.fast}, box-shadow ${motion.fast}`,
  "&:hover": { borderColor: colors.input.borderHover },
  "&:focus-within": {
    borderColor: colors.brand.cyanDeep,
    boxShadow: `0 0 0 3px ${colors.brand.focus}`,
  },
  "&:before, &:after": { display: "none" },
};

// 28x28 so the target clears the 24px minimum. These used to be zero-padding
// IconButtons wrapping a 23px glyph, which is smaller than that on every side.
const footerNavButtonSx = {
  width: "28px",
  height: "28px",
  padding: 0,
  borderRadius: radius.xs,
  color: colors.text.secondary,
  transition: `background-color ${motion.fast}, color ${motion.fast}`,
  "&:hover": {
    backgroundColor: colors.brand.tint,
    color: colors.brand.cyanInk,
  },
  "&:focus-visible": {
    outline: `2px solid ${colors.brand.focus}`,
    outlineOffset: "1px",
  },
  "&.Mui-disabled": { opacity: 0.35 },
};

const footerLabelSx = {
  fontSize: "12.5px",
  color: colors.text.secondary,
  lineHeight: 1,
  display: "flex",
  alignItems: "center",
  whiteSpace: "nowrap",
};

const CustomPagination = React.forwardRef(
  function CustomPagination(props, ref) {
    const { t } = useTranslation();
    const apiRef = useGridApiContext();
    const page = useGridSelector(apiRef, gridPageSelector);
    const pageCount = useGridSelector(apiRef, gridPageCountSelector);
    const pageSize = useGridSelector(apiRef, gridPageSizeSelector);
    const rowCount = useGridSelector(apiRef, gridRowCountSelector);

    const handlePageChange = (event) => {
      const value = parseInt(event.target.value, 10);
      if (!isNaN(value) && value > 0 && value <= pageCount) {
        apiRef.current.setPage(value - 1);
      }
    };

    const handlePageSizeChange = (event) => {
      const newPageSize = parseInt(event.target.value, 10);
      apiRef.current.setPageSize(newPageSize);
      apiRef.current.setPage(0); // Reset to first page when page size changes
    };

    const start = rowCount === 0 ? 0 : page * pageSize + 1;
    const end = Math.min((page + 1) * pageSize, rowCount);

    // Reading order: how many rows per page, then where you are, then how to
    // move. "Go to page" used to lead the row and the count trailed the paging
    // controls, which put the answer to "how much is there?" last.
    return (
      <Box
        ref={ref}
        sx={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          pl: 1.25,
          pr: 1.25,
          gap: 1.5,
          width: "100%",
          height: "100%",
        }}
      >
        <Box
          sx={{ display: "flex", alignItems: "center", height: "100%", gap: 1 }}
        >
          <Typography sx={footerLabelSx}>{t("Show rows")}:</Typography>
          <Select
            value={pageSize}
            onChange={handlePageSizeChange}
            size="small"
            variant="standard"
            sx={{
              ...footerControlSx,
              px: 0.75,
              "& .MuiSelect-select": {
                py: 0,
                pr: "18px !important",
                fontSize: "12.5px",
              },
              "& .MuiSelect-icon": {
                fontSize: "16px",
                right: 0,
                color: colors.text.secondary,
              },
            }}
          >
            {[5, 10, 20, 30, 50, 100].map((size) => (
              <MenuItem
                key={size}
                value={size}
                sx={{ fontSize: "12.5px", minHeight: "30px" }}
              >
                {size}
              </MenuItem>
            ))}
          </Select>
        </Box>

        {/* The count is the one number worth scanning for, so it is the only
            thing in the footer at full text colour and weight. */}
        <Typography sx={footerLabelSx}>
          <Box
            component="span"
            sx={{ color: colors.text.primary, fontWeight: 600 }}
          >
            {start}-{end}
          </Box>
          <Box component="span" sx={{ mx: 0.5 }}>
            {t("of")}
          </Box>
          <Box
            component="span"
            sx={{ color: colors.text.primary, fontWeight: 600 }}
          >
            {rowCount}
          </Box>
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            height: "100%",
            gap: 0.5,
          }}
        >
          <IconButton
            size="small"
            aria-label={t("Previous page")}
            onClick={() => apiRef.current.setPage(page - 1)}
            disabled={page === 0}
            sx={footerNavButtonSx}
          >
            <ChevronLeftIcon sx={{ fontSize: "20px" }} />
          </IconButton>
          <IconButton
            size="small"
            aria-label={t("Next page")}
            onClick={() => apiRef.current.setPage(page + 1)}
            disabled={page >= pageCount - 1}
            sx={footerNavButtonSx}
          >
            <ChevronRightIcon sx={{ fontSize: "20px" }} />
          </IconButton>
        </Box>

        <Box
          sx={{ display: "flex", alignItems: "center", height: "100%", gap: 1 }}
        >
          <Typography sx={footerLabelSx}>{t("Go to page")}:</Typography>
          <TextField
            value={pageCount === 0 ? 0 : page + 1}
            onChange={handlePageChange}
            size="small"
            variant="standard"
            inputProps={{ "aria-label": t("Go to page") }}
            sx={{
              width: "40px",
              "& .MuiInputBase-root": {
                ...footerControlSx,
                px: 0.25,
              },
              "& .MuiInputBase-input": {
                textAlign: "center",
                fontSize: "12.5px",
                padding: "1px 2px",
                color: colors.text.primary,
              },
            }}
          />
        </Box>
      </Box>
    );
  },
);

// Empty state for every grid - MUI's default overlay is an unstyled English
// string, which contradicts the Mongolian-throughout rule in CLAUDE.md §6.
// `message`/`action` let a screen say WHICH kind of empty this is - a list with
// nothing in it yet reads very differently from a filter that excluded
// everything, and the generic line cannot tell them apart.
const NoRowsOverlay = ({ message, action }) => {
  const { t } = useTranslation();
  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
      }}
    >
      <InboxOutlinedIcon
        sx={{ fontSize: "28px", color: colors.brand.inkDim, opacity: 0.6 }}
      />
      <Typography sx={{ fontSize: "13px", color: colors.text.secondary }}>
        {message || t("Мэдээлэл олдсонгүй")}
      </Typography>
      {action || null}
    </Box>
  );
};

// Helper function to parse width pattern string
const parseWidthPattern = (pattern) => {
  if (!pattern || typeof pattern !== "string") return null;

  return pattern
    .split(",")
    .map((w) => w.trim())
    .filter(Boolean)
    .map((w) => {
      // Extract alignment suffix (l, r, c)
      const alignMatch = w.match(/^(\d+)([lrc])?$/i);
      if (!alignMatch) return null;

      const width = parseInt(alignMatch[1], 10);
      const alignChar = alignMatch[2]?.toLowerCase() || "l";

      let align = "left";
      if (alignChar === "r") align = "right";
      else if (alignChar === "c") align = "center";

      return !isNaN(width) && width > 0 ? { width, align } : null;
    })
    .filter((w) => w !== null);
};

// Helper function to get nested object values
const getNestedValue = (obj, path) => {
  return path.split(".").reduce((current, key) => current?.[key], obj);
};

export default function BaseGrid(props) {
  const { t } = useTranslation();
  const {
    Data = [],
    SearchFieldData = [],
    PK = "Id",
    SelectRow,
    OrderBy = null,
    HideFilter,
    ShowFilterRow = true,
    // Opt-in: the row-action bars on some screens can only act on one record,
    // so letting the grid tick a second one just silently disables them.
    SingleSelect = false,
    NoRowsText,
    NoRowsAction,
    Fields = [],
    SearchField,
    HideNumber,
    HideCheck,
    RowClickSelect,
    TextLength,
    ShowData,
    RowActions = [],
    ColumnActions = [],
    Option,
    PageSize = 20,
    Page,
    ChangePage,
    RowNumber,
    EnableColumnResizing = true,
    ColumnResizeMode = "onChange",
    Dense = false,
    RowHeight,
    HeaderRowHeight,
    FillHeight = true,
    Height,
    MaxHeight,
    ActionHeader,
    widthPattern,
    HidePagination = false,
    RowActionFirst = false,
    // Clean: was an opt-in second skin. There is one skin now, so this is a
    // no-op here - still accepted because ~30 call sites pass it, and BaseTable
    // reads it for its own fitted-height maths.
    Clean = false,
    // Below `sm` the grid renders as a card list instead of a table - see
    // BaseGridCards.jsx for why. These two are the escape hatches:
    //   CardFields   - field names to show on the card, in order. Defaults to
    //                  the first few columns, which on these screens are
    //                  already the identifying ones.
    //   DisableCards - keep the real grid at every width. For the few places
    //                  where the table IS the content (a comparison matrix)
    //                  rather than a list of records.
    CardFields,
    DisableCards = false,
  } = props;

  // Phone only. A tablet in portrait keeps the real grid: at 768px the table
  // is legible and a doctor scanning a ward list wants the density.
  const isPhone = useIsPhone();

  const apiRef = useGridApiRef();
  const [columnWidths, setColumnWidths] = useState({});

  const computedRowHeight =
    typeof RowHeight === "number" ? RowHeight : Dense ? 32 : 36;
  const finalHeaderRowHeight = HeaderRowHeight || 30;

  // Header Title Row (Single height) + Filter Row (36px)
  const titleHeight = finalHeaderRowHeight;
  const filterHeight = 36;
  const totalHeaderHeight = titleHeight + filterHeight;

  const [rowSelectionModel, setRowSelectionModel] = useState({
    type: "include",
    ids: new Set(),
  });
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: PageSize,
  });

  // Initialize filterValues from SearchFieldData
  const [filterValues, setFilterValues] = useState(() => {
    const initial = {};
    if (Array.isArray(SearchFieldData)) {
      SearchFieldData.forEach((item) => {
        if (item && item.Field) {
          initial[item.Field] = item.Value || "";
        }
      });
    }
    return initial;
  });

  // Sync filterValues with SearchFieldData prop
  useEffect(() => {
    if (Array.isArray(SearchFieldData)) {
      const newFilterValues = {};
      SearchFieldData.forEach((item) => {
        if (item && item.Field) {
          newFilterValues[item.Field] = item.Value || "";
        }
      });
      setFilterValues((prev) => {
        // Only update if there's an actual change to avoid unnecessary rerenders
        const isChanged = Object.keys(newFilterValues).some(
          (key) => newFilterValues[key] !== prev[key],
        );
        if (isChanged) return { ...prev, ...newFilterValues };
        return prev;
      });
    }
  }, [SearchFieldData]);

  const gridContainerRef = useRef(null);

  // Transform data to ensure proper row IDs (Client-side filtering removed)
  const rows = useMemo(() => {
    if (!Data) return [];
    if (!Array.isArray(Data)) {
      console.warn("BaseGrid: Data prop is not an array", Data);
      return [];
    }

    return Data.map((item, index) => ({
      ...item,
      id: item[PK] !== undefined && item[PK] !== null ? item[PK] : index,
    }));
  }, [Data, PK]);

  // Initialize column widths once the grid is ready
  useEffect(() => {
    if (apiRef.current && rows.length > 0) {
      const timer = setTimeout(() => {
        const allCols = apiRef.current.getAllColumns();
        const newWidths = {};

        let hasValidUpdate = false;
        allCols.forEach((col) => {
          // SAFEGUARD: Only update if the width is greater than 0
          if (col.computedWidth > 0) {
            newWidths[col.field] = col.computedWidth;
            hasValidUpdate = true;
          }
        });

        if (hasValidUpdate) {
          setColumnWidths((prev) => ({ ...prev, ...newWidths }));
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [apiRef, rows.length]);

  // Handle column width changes
  const handleColumnWidthChange = useCallback((params) => {
    setColumnWidths((prev) => ({
      ...prev,
      [params.colDef.field]: params.width,
    }));
  }, []);

  // Debounced search function
  const debouncedSearch = useMemo(
    () =>
      debounce((field, value) => {
        if (SearchField && typeof SearchField === "function") {
          SearchField(field, value);
        }
      }, 500),
    [SearchField],
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Handle filter change
  const handleFilterChange = useCallback(
    (field, value) => {
      setFilterValues((prev) => ({ ...prev, [field]: value }));
      debouncedSearch(field, value);
    },
    [debouncedSearch],
  );

  // Sync pagination when PageSize prop changes
  const syncPagination = useCallback(() => {
    setPaginationModel((prev) => {
      if (prev.pageSize !== PageSize) {
        return {
          page: 0, // Reset to first page when page size changes
          pageSize: PageSize,
        };
      }
      return prev;
    });
  }, [PageSize]);

  useEffect(() => {
    if (PageSize) {
      syncPagination();
    }
  }, [syncPagination, PageSize]);

  // Sync pagination when Page prop changes
  useEffect(() => {
    if (typeof Page === "number" && Page >= 0) {
      setPaginationModel((prev) => {
        if (prev.page !== Page) {
          return { ...prev, page: Page };
        }
        return prev;
      });
    }
  }, [Page]);

  // Memoize the pagination model update to avoid direct state updates in effects
  const handlePaginationModelChange = useCallback(
    (newModel) => {
      setPaginationModel(newModel);
      // Notify parent component about pagination changes
      if (ChangePage && typeof ChangePage === "function") {
        ChangePage(newModel.page, newModel.pageSize);
      }
    },
    [ChangePage],
  );

  // Transform Fields to DataGrid columns
  const columns = useMemo(() => {
    const cols = [];
    const widths = parseWidthPattern(widthPattern);
    let widthIndex = 0;

    // Add row number column if not hidden
    if (!HideNumber) {
      const rowNumConfig =
        widths && widths[widthIndex]
          ? widths[widthIndex]
          : { width: 50, align: "center" };
      if (widths) widthIndex++;

      cols.push({
        field: "__row_number__",
        headerName: t("#"),
        width: columnWidths["__row_number__"] || rowNumConfig.width,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        align: rowNumConfig.align,
        headerAlign: rowNumConfig.align,
        renderCell: (params) => (
          <div
            style={{
              textAlign: rowNumConfig.align,
              color: colors.text.muted,
              fontWeight: "500",
            }}
          >
            {params.api.getRowIndexRelativeToVisibleRows(params.id) + 1}
          </div>
        ),
      });
    }

    // Helper to add actions column
    const addActionsColumn = () => {
      if (Array.isArray(RowActions) && RowActions.length > 0) {
        const actionsConfig =
          widths && widths[widthIndex]
            ? widths[widthIndex]
            : { width: 80, align: "center" };
        if (widths) widthIndex++;

        cols.push({
          field: "__row_actions__",
          headerName: ActionHeader || "",
          width: columnWidths["__row_actions__"] || actionsConfig.width,
          sortable: false,
          filterable: false,
          disableColumnMenu: true,
          align: actionsConfig.align,
          headerAlign: actionsConfig.align,
          renderCell: (params) => {
            const justifyContent =
              actionsConfig.align === "left"
                ? "flex-start"
                : actionsConfig.align === "center"
                  ? "center"
                  : "flex-end";

            return (
              <div
                style={{
                  display: "flex",
                  justifyContent,
                  alignItems: "center",
                  gap: "4px",
                  height: "100%",
                }}
              >
                {RowActions.map((action, idx) => {
                  if (!action || !action.Component) return null;

                  const shouldWireClick =
                    typeof action.onClick === "function" &&
                    action.onClick.length > 0;

                  if (!shouldWireClick) {
                    return (
                      <span
                        key={`row_action_${idx}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        style={{ display: "inline-flex" }}
                      >
                        {cloneElement(action.Component, {
                          rowdata: params.row,
                          ...(action.props || {}),
                        })}
                      </span>
                    );
                  }

                  return (
                    <span
                      key={`row_action_${idx}`}
                      style={{ display: "inline-flex" }}
                    >
                      {cloneElement(action.Component, {
                        rowdata: params.row,
                        ...(action.props || {}),
                        onClick: (e) => {
                          if (e && typeof e.preventDefault === "function")
                            e.preventDefault();
                          if (e && typeof e.stopPropagation === "function")
                            e.stopPropagation();
                          action.onClick(params.row);
                        },
                      })}
                    </span>
                  );
                })}
              </div>
            );
          },
        });
      }
    };

    if (RowActionFirst) {
      addActionsColumn();
    }

    // Add data columns based on Fields
    Fields.forEach((field) => {
      const columnConfig =
        widths && widths[widthIndex]
          ? widths[widthIndex]
          : { width: field.Width || 150, align: "left" };
      if (widths) widthIndex++;

      // MUI DataGrid v8 does not support dots in field names — normalize them
      const safeFieldName = field.Name.replace(/\./g, "__");

      const columnDef = {
        field: safeFieldName,
        originalName: field.Name,
        headerName: t(field.Label || field.Name),
        width: columnWidths[safeFieldName] || columnConfig.width,
        sortable: field.NoSorting !== true,
        filterable: field.NoFilter !== true,
        flex: field.Flex || 0,
        align: columnConfig.align,
        headerAlign: columnConfig.align,
        valueGetter: (value, row) => getNestedValue(row, field.Name),
        renderCell: (params) => {
          const fieldAction =
            Array.isArray(ColumnActions) && ColumnActions.length > 0
              ? ColumnActions.find((a) => a && a.Field === field.Name)
              : null;

          if (fieldAction && fieldAction.Component) {
            return cloneElement(fieldAction.Component, {
              rowdata: params.row,
              fieldName: field.Name,
              ...(fieldAction.props || {}),
              onClick: (Type) =>
                typeof fieldAction.onClick === "function"
                  ? fieldAction.onClick(params.row, Type)
                  : undefined,
            });
          }

          let value = params.value;

          // Handle gender field formatting
          if ((field.Name === "p_gender" || field.Type === "Gender") && value) {
            value = Helper.ObjectHelper.getGenderLabel(value);
          }

          // Handle translation
          if (field.Type === "Translate" && value) {
            value = t(value + "");
          }

          // Handle special field types
          if (field.Type === "Date" && value) {
            const dateValue = new Date(value);
            if (!isNaN(dateValue.getTime())) {
              value = dateValue.toLocaleDateString();
            }
          }

          // Avoid rendering raw objects/arrays
          if (
            value !== null &&
            value !== undefined &&
            typeof value === "object"
          ) {
            return "";
          }

          // Apply text length limit if specified (unless NoTruncate is set)
          if (TextLength && value && value.toString && !field.NoTruncate) {
            const fullText = value.toString();
            const truncated = fullText.substring(0, TextLength);
            value =
              fullText.length > TextLength ? truncated + "..." : truncated;
          }

          return value !== null && value !== undefined ? value : "";
        },
      };

      cols.push(columnDef);
    });

    if (!RowActionFirst) {
      addActionsColumn();
    }

    return cols;
  }, [
    Fields,
    HideNumber,
    TextLength,
    ColumnActions,
    RowActions,
    ActionHeader,
    widthPattern,
    columnWidths,
    t,
    RowActionFirst,
  ]);

  // Update parent when selection changes
  useEffect(() => {
    if (SelectRow && typeof SelectRow === "function") {
      let selectedRows = [];

      if (Array.isArray(rowSelectionModel)) {
        // Handle array format (MUI DataGrid returns array of IDs)
        selectedRows = rows.filter((row) => rowSelectionModel.includes(row.id));
      } else if (
        rowSelectionModel?.ids &&
        typeof rowSelectionModel.ids.has === "function"
      ) {
        // Handle object format { type, ids: Set }
        selectedRows = rows.filter((row) => rowSelectionModel.ids.has(row.id));
      }

      SelectRow(selectedRows);
    }
  }, [rowSelectionModel, SelectRow, rows]);

  // Handle row click for selection only
  const handleRowClick = (params) => {
    if (RowClickSelect) {
      setRowSelectionModel((prev) => {
        const prevIds = prev?.ids instanceof Set ? prev.ids : new Set();
        const nextIds = new Set(prevIds);

        if (nextIds.has(params.id)) nextIds.delete(params.id);
        else nextIds.add(params.id);

        return { type: "include", ids: nextIds };
      });
    }
  };

  // Handle double-click to show detail form
  const handleCellDoubleClick = (params) => {
    if (ShowData && typeof ShowData === "function") {
      ShowData(params.row);
    }
  };

  const containerHeight = FillHeight ? "100%" : Height || "auto";
  const containerMaxHeight = MaxHeight || undefined;

  return (
    <Box
      ref={gridContainerRef}
      sx={{
        ...(FillHeight
          ? {
              flex: "1 1 auto",
              minHeight: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }
          : {
              height: containerHeight,
              maxHeight: containerMaxHeight,
              display: "flex",
              flexDirection: "column",
            }),
        width: "100%",
        backgroundColor: colors.brand.surface,
      }}
    >
      <Box
        sx={{
          flex: "1 1 auto",
          minHeight: 0,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          "& .MuiDataGrid-root": {
            backgroundColor: `${colors.brand.surface} !important`,
          },
        }}
      >
        {isPhone && !DisableCards ? (
          <BaseGridCards
            rows={rows}
            columns={columns}
            paginationModel={paginationModel}
            onPaginationModelChange={handlePaginationModelChange}
            rowCount={Option?.Total}
            serverSide={Boolean(ChangePage)}
            hidePagination={HidePagination}
            hideCheck={HideCheck}
            rowSelectionModel={rowSelectionModel}
            setRowSelectionModel={setRowSelectionModel}
            onOpen={ShowData}
            noRowsText={NoRowsText}
            noRowsAction={NoRowsAction}
            cardFields={CardFields}
          />
        ) : (
          <StyledDataGrid
            apiRef={apiRef}
            rows={rows}
            columns={columns}
            paginationModel={paginationModel}
            onPaginationModelChange={handlePaginationModelChange}
            pageSizeOptions={[5, 10, 20, 30, 50, 100]}
            checkboxSelection={!HideCheck}
            disableRowSelectionOnClick={!RowClickSelect}
            rowSelectionModel={rowSelectionModel}
            onRowSelectionModelChange={setRowSelectionModel}
            onRowClick={handleRowClick}
            onCellDoubleClick={handleCellDoubleClick}
            onColumnWidthChange={handleColumnWidthChange}
            columnResizeMode={ColumnResizeMode}
            rowHeight={computedRowHeight}
            hideFooter={HidePagination}
            disableColumnFilter={HideFilter}
            disableColumnSelector
            disableDensitySelector
            autoHeight={false}
            paginationMode={ChangePage ? "server" : "client"}
            rowCount={ChangePage ? Option?.Total || rows.length : undefined}
            slots={{
              columnHeaders: CustomColumnHeaders,
              pagination: !HidePagination ? CustomPagination : null,
              noRowsOverlay: NoRowsOverlay,
            }}
            disableMultipleRowSelection={SingleSelect}
            slotProps={{
              columnHeaders: {
                filterValues,
                onFilterChange: handleFilterChange,
                showCheckbox: !HideCheck,
                dense: Dense,
                headerRowHeight: finalHeaderRowHeight,
              },
              noRowsOverlay: { message: NoRowsText, action: NoRowsAction },
            }}
            sx={{
              flex: "1 1 auto",
              minHeight: 0,
              width: "100%",
              backgroundColor: `${colors.brand.surface} !important`,
              "--header-height": `${totalHeaderHeight}px`,
            }}
            getRowId={(row) => row.id}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: PageSize },
              },
            }}
            columnHeaderHeight={totalHeaderHeight}
          />
        )}
      </Box>
    </Box>
  );
}
