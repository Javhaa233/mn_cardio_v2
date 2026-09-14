import { useTranslation } from "react-i18next";
import React, { useState, useRef, useEffect } from "react";
import { Box } from "@mui/material";
import {
  useGridApiContext,
  useGridSelector,
  gridVisibleColumnDefinitionsSelector,
  gridSortModelSelector,
} from "@mui/x-data-grid";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import { colors } from "@/theme/colors";
import { radius, motion } from "@/theme/tokens";

const CustomColumnHeaders = React.forwardRef(function CustomColumnHeaders(
  { filterValues, onFilterChange, showCheckbox, dense, headerRowHeight },
  ref,
) {
  const { t } = useTranslation();
  const apiRef = useGridApiContext();
  const columns = useGridSelector(apiRef, gridVisibleColumnDefinitionsSelector);
  const sortModel = useGridSelector(apiRef, gridSortModelSelector);
  const [resizingCol, setResizingCol] = useState(null);

  const headerViewportRef = useRef(null);

  // --- HEIGHT CONFIGURATION ---
  // 1. Single height for Title row
  const titleRowHeight = headerRowHeight || 30;
  // 2. Filter row height
  const filterRowHeight = 36;
  const totalHeaderHeight = titleRowHeight + filterRowHeight;

  useEffect(() => {
    const handleScroll = (params) => {
      if (headerViewportRef.current) {
        headerViewportRef.current.scrollLeft = params.left;
      }
    };

    const unsubscribe = apiRef.current.subscribeEvent(
      "scrollPositionChange",
      handleScroll,
    );

    return () => {
      unsubscribe();
    };
  }, [apiRef]);

  const handleSort = (column) => {
    if (column.sortable === false) return;

    const currentSort = sortModel.find((s) => s.field === column.field);
    let newSortDirection = "asc";

    if (currentSort) {
      if (currentSort.sort === "asc") newSortDirection = "desc";
      else newSortDirection = null;
    }

    apiRef.current.sortColumn(column.field, newSortDirection);
  };

  const handleResizeMouseDown = (event, col) => {
    event.preventDefault();
    event.stopPropagation();
    const startX = event.clientX;
    const startWidth = col.computedWidth;
    setResizingCol(col.field);

    const handleMouseMove = (moveEvent) => {
      const newWidth = Math.max(50, startWidth + (moveEvent.clientX - startX));
      apiRef.current.setColumnWidth(col.field, newWidth);
    };

    const handleMouseUp = () => {
      setResizingCol(null);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Column geometry only. Colour lives in the two row blocks below, so the
  // title row and the filter row can differ without duplicating the maths.
  //
  // This file used to hardcode #dee2e6 / #f8f9fa / #fafafa / #e4e4e4 / #ddd,
  // none of which were reachable from BaseGrid's skin. That is why the header
  // and the body used to visibly disagree. Everything here is a token now.
  const columnStyle = (col) => ({
    width: col.computedWidth,
    minWidth: col.computedWidth,
    maxWidth: col.computedWidth,
    flexShrink: 0,
    flexGrow: 0,
    boxSizing: "border-box",
    padding: "0 10px", // matches .MuiDataGrid-cell so columns line up
    display: "flex",
    alignItems: "center",
    position: "relative",
  });

  return (
    <Box
      ref={headerViewportRef}
      className="MuiDataGrid-columnHeaders"
      sx={{
        width: "100%",
        overflow: "hidden",
        borderBottom: "none",
        display: "flex",
        flexDirection: "column",
        zIndex: 1,
        minHeight: totalHeaderHeight,
        maxHeight: totalHeaderHeight,
        height: totalHeaderHeight,
      }}
    >
      <Box
        ref={ref}
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "max-content",
          minWidth: "100%",
          flexShrink: 0,
        }}
      >
        {/* --- TITLE/SORT HEADER ROW --- */}
        <Box
          sx={{
            display: "flex",
            height: titleRowHeight,
            minHeight: titleRowHeight,
            maxHeight: titleRowHeight,
            borderBottom: `1px solid ${colors.brand.hairline}`,
            // Opaque: rows scroll underneath this sticky header.
            backgroundColor: colors.brand.tintSolid,
          }}
        >
          {columns.map((col) => {
            const sortItem = sortModel.find((s) => s.field === col.field);
            const sortable = col.sortable !== false;

            return (
              <Box
                key={col.field}
                className="MuiDataGrid-columnHeader"
                onClick={() => handleSort(col)}
                sx={{
                  ...columnStyle(col),
                  fontWeight: 600,
                  fontSize: "11px",
                  letterSpacing: "0.4px",
                  textTransform: "uppercase",
                  color: colors.text.heading,
                  cursor: sortable ? "pointer" : "default",
                  userSelect: "none",
                  transition: `background-color ${motion.fast}`,
                  ...(sortable && {
                    // !important: BaseGrid's skin sets the header background
                    // with !important, which silently cancelled this hover.
                    "&:hover": {
                      backgroundColor: `${colors.brand.tintSolidHover} !important`,
                    },
                  }),
                  // Ensure the height matches exactly
                  height: "100%",
                  minHeight: "100%",
                  maxHeight: "100%",
                  // The resize handle is a child; reveal it on column hover.
                  "&:hover .BaseGrid-resizeHandle": {
                    backgroundColor: colors.brand.hairlineStrong,
                  },
                }}
              >
                <Box
                  sx={{
                    flex: 1,
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    lineHeight: "1.2",
                    alignSelf: "center",
                  }}
                >
                  {col.headerName}
                </Box>

                {/* The arrow slot is always present, at zero opacity when the
                    column is unsorted. Mounting it on click used to shrink the
                    label by 16px and re-ellipsise it under the cursor. */}
                {sortable && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      ml: 0.5,
                      flexShrink: 0,
                      width: "16px",
                      opacity: sortItem ? 1 : 0,
                      transition: `opacity ${motion.fast}`,
                    }}
                  >
                    {sortItem && sortItem.sort === "desc" ? (
                      <ArrowDownwardIcon
                        sx={{ fontSize: "16px", color: colors.brand.cyanInk }}
                      />
                    ) : (
                      <ArrowUpwardIcon
                        sx={{ fontSize: "16px", color: colors.brand.cyanInk }}
                      />
                    )}
                  </Box>
                )}

                <Box
                  className="BaseGrid-resizeHandle"
                  onMouseDown={(e) => handleResizeMouseDown(e, col)}
                  onClick={(e) => e.stopPropagation()}
                  sx={{
                    position: "absolute",
                    right: 0,
                    top: "6px",
                    bottom: "6px",
                    width: "3px",
                    borderRadius: radius.pill,
                    cursor: "col-resize",
                    transition: `background-color ${motion.fast}`,
                    "&:hover": {
                      backgroundColor: `${colors.brand.cyanDeep} !important`,
                    },
                    backgroundColor:
                      resizingCol === col.field
                        ? `${colors.brand.cyanDeep} !important`
                        : "transparent",
                    zIndex: 1,
                  }}
                />
              </Box>
            );
          })}
        </Box>

        {/* --- FILTER ROW --- */}
        {/* White, so the strip reads as a band of inputs rather than a third
            shade of grey between the tinted title row and the white body. */}
        <Box
          sx={{
            display: "flex",
            height: filterRowHeight,
            minHeight: filterRowHeight,
            maxHeight: filterRowHeight,
            backgroundColor: colors.brand.surface,
            borderBottom: `1px solid ${colors.brand.hairline}`,
          }}
        >
          {columns.map((col, colIndex) => {
            const isFilterable =
              col.filterable !== false &&
              col.field !== "__row_number__" &&
              col.field !== "__row_actions__";

            // The magnifier is drawn once, on the leftmost filter cell, to say
            // what this whole row is. Repeating it nine times is noise.
            const isFirstFilterable =
              isFilterable &&
              !columns
                .slice(0, colIndex)
                .some(
                  (c) =>
                    c.filterable !== false &&
                    c.field !== "__row_number__" &&
                    c.field !== "__row_actions__",
                );

            const filterKey = col.originalName || col.field;
            const filterValue = filterValues[filterKey] || "";

            return (
              <Box
                key={col.field}
                sx={{
                  ...columnStyle(col),
                  height: "100%",
                  minHeight: "100%",
                  maxHeight: "100%",
                }}
              >
                {isFilterable && (
                  <Box sx={{ position: "relative", width: "100%" }}>
                    {isFirstFilterable ? (
                      <SearchIcon
                        aria-hidden
                        sx={{
                          position: "absolute",
                          left: "6px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          fontSize: "14px",
                          color: colors.brand.inkDim,
                          pointerEvents: "none",
                        }}
                      />
                    ) : null}

                    {filterValue ? (
                      <Box
                        component="button"
                        type="button"
                        aria-label={t("Цэвэрлэх")}
                        title={t("Цэвэрлэх")}
                        onClick={() => onFilterChange(filterKey, "")}
                        sx={{
                          position: "absolute",
                          right: "3px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "18px",
                          height: "18px",
                          padding: 0,
                          border: "none",
                          cursor: "pointer",
                          borderRadius: radius.xs,
                          backgroundColor: "transparent",
                          color: colors.brand.inkDim,
                          "& svg": { fontSize: "13px" },
                          "&:hover": {
                            backgroundColor: colors.brand.tint,
                            color: colors.brand.cyanInk,
                          },
                        }}
                      >
                        <CloseIcon />
                      </Box>
                    ) : null}

                    <Box
                      component="input"
                      value={filterValue}
                      onChange={(e) =>
                        onFilterChange(filterKey, e.target.value)
                      }
                      onKeyDown={(e) => e.stopPropagation()}
                      // A narrow column (Age, Gender) clips the word down to
                      // "Ха", which reads as broken text rather than as a
                      // hint. The aria-label still names the field either way.
                      placeholder={col.computedWidth >= 90 ? t("Хайх") : ""}
                      aria-label={col.headerName}
                      sx={{
                        width: "100%",
                        height: "28px",
                        boxSizing: "border-box",
                        paddingTop: 0,
                        paddingBottom: 0,
                        paddingLeft: isFirstFilterable ? "23px" : "8px",
                        paddingRight: filterValue ? "23px" : "8px",
                        fontFamily: "inherit",
                        fontSize: "12.5px",
                        color: colors.text.primary,
                        backgroundColor: colors.brand.surface,
                        border: `1px solid ${colors.input.border}`,
                        borderRadius: radius.xs,
                        outline: "none",
                        transition: `border-color ${motion.fast}, box-shadow ${motion.fast}`,
                        "&::placeholder": { color: colors.input.placeholder },
                        "&:hover": { borderColor: colors.input.borderHover },
                        "&:focus": {
                          borderColor: colors.brand.cyanDeep,
                          boxShadow: `0 0 0 3px ${colors.brand.focus}`,
                        },
                      }}
                    />
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
});

export default CustomColumnHeaders;
