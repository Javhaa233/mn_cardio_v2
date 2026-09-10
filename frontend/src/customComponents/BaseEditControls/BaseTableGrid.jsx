import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import Box from "@mui/material/Box";
import { TOUCH, COARSE } from "@/theme.js";

/**
 * A repeating grid inside a tender form.
 *
 * Some forms are not flat lists of questions — 2.1 has an ACT time/value log, a
 * pulmonary-vein isolation grid and a dose list. Those are tables on the paper
 * form and should stay tables on screen.
 *
 * The value is a JSON array of row objects stored in TenderFormData.Data, and
 * the column definition comes from the field dictionary (TenderFormField.
 * TableConfig), so adding a column is a DB change, not a code change.
 *
 * Config.TableRows fixes the row count (the vein grid is always 5); leaving it
 * null gives an add/remove log.
 */
export default function BaseTableGrid(props) {
  const { t } = useTranslation();
  const { Config, ChangeValue } = props;

  const columns = (Config && Config.TableColumns) || [];
  const fixedRows = Config && Config.TableRows ? Config.TableRows : null;

  const blankRow = () => {
    const r = {};
    columns.forEach((c) => (r[c.code] = ""));
    return r;
  };

  const parse = (v) => {
    if (Array.isArray(v)) return v;
    if (typeof v === "string" && v.trim()) {
      try {
        const p = JSON.parse(v);
        return Array.isArray(p) ? p : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  const [rows, setRows] = useState(() => {
    const existing = parse(Config && Config.Value);
    if (existing.length) return existing;
    return Array.from({ length: fixedRows || 1 }, blankRow);
  });

  // adopt a value that arrives after mount (loading an existing record)
  useEffect(() => {
    const existing = parse(Config && Config.Value);
    if (existing.length) setRows(existing);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Config && Config.Value]);

  const push = (next) => {
    setRows(next);
    // store only rows the user actually filled in
    const meaningful = next.filter((r) =>
      columns.some((c) => (r[c.code] || "").toString().trim() !== ""),
    );
    ChangeValue && ChangeValue(Config.Name, JSON.stringify(meaningful));
  };

  const setCell = (i, code, value) => {
    const next = rows.map((r, idx) =>
      idx === i ? { ...r, [code]: value } : r,
    );
    push(next);
  };

  if (!columns.length) return null;

  const cellStyle = {
    border: "1px solid #dfe3e8",
    padding: "2px 4px",
    verticalAlign: "middle",
  };

  return (
    <div style={{ margin: "8px 0 12px" }}>
      <div style={{ fontSize: 13, color: "#003366", marginBottom: 4 }}>
        {t(Config.Label || "")}
        {Config.Required ? " *" : ""}
      </div>

      {/* The scroller was already here and could never fire. The table below
          is `width: 100%` with no minimum, so it always fit its container by
          definition and simply squeezed its columns instead - with 5+ columns
          on a phone each input ended up a few characters wide. `minWidth` is
          what actually makes the overflow (and therefore this scroller) real.
          It is per-column so a 2-column table still fits without scrolling. */}
      <Box sx={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        <Box
          component="table"
          sx={{
            width: "100%",
            minWidth: `${Math.max(280, columns.length * 120 + 44)}px`,
            borderCollapse: "collapse",
            fontSize: 13,
            // Below 16px, iOS zooms the whole page when one of these cells
            // takes focus, and the doctor has to pinch back out between every
            // entry. Only raised for touch: 13px is right with a mouse.
            [COARSE]: { "& input": { fontSize: TOUCH.fontSize } },
          }}
        >
          <thead>
            <tr>
              {columns.map((c) => (
                <th
                  key={c.code}
                  style={{
                    ...cellStyle,
                    background: "#f6f7f9",
                    fontWeight: 500,
                    textAlign: "left",
                  }}
                >
                  {t(c.label || c.code)}
                </th>
              ))}
              {fixedRows ? null : <th style={{ ...cellStyle, width: 44 }} />}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {columns.map((c) => (
                  <td key={c.code} style={cellStyle}>
                    <input
                      type={
                        c.type === "Number"
                          ? "number"
                          : c.type === "Date"
                            ? "date"
                            : "text"
                      }
                      value={row[c.code] || ""}
                      aria-label={(c.label || c.code) + " " + (i + 1)}
                      onChange={(e) => setCell(i, c.code, e.target.value)}
                      style={{
                        width: "100%",
                        border: "none",
                        outline: "none",
                        padding: "6px 4px",
                        fontSize: 13,
                        background: "transparent",
                      }}
                    />
                  </td>
                ))}
                {fixedRows ? null : (
                  <td style={{ ...cellStyle, textAlign: "center" }}>
                    <Tooltip title={t("Мөр устгах")}>
                      <span>
                        <IconButton
                          size="small"
                          aria-label={t("Мөр устгах")}
                          disabled={rows.length <= 1}
                          onClick={() =>
                            push(rows.filter((_, idx) => idx !== i))
                          }
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </Box>
      </Box>

      {fixedRows ? null : (
        <div style={{ marginTop: 4 }}>
          <IconButton
            size="small"
            aria-label={t("Мөр нэмэх")}
            onClick={() => push([...rows, blankRow()])}
          >
            <AddIcon fontSize="small" />
          </IconButton>
          <span style={{ fontSize: 12, color: "#5b6472" }}>
            {t("Мөр нэмэх")}
          </span>
        </div>
      )}
    </div>
  );
}
