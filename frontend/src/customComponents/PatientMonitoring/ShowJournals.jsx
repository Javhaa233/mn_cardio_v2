import React from "react";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";

/**
 * The ICD10 cell.
 *
 * This used to render one <div> plus a <br> per code, stacking them
 * vertically. BaseGrid pins its rows with `min/maxHeight: <rowHeight>px
 * !important`, so any patient with more than one diagnosis overflowed the row
 * and the extra codes were clipped mid-glyph into the row below.
 *
 * Codes now sit on one line, and the full label of each - which the old
 * version parsed out and then threw away - is kept in the tooltip.
 */
export default function ShowJournals(props) {
  const { rowdata = null } = props;

  const entries =
    rowdata && Array.isArray(rowdata.Journals)
      ? rowdata.Journals.filter(
          (e) => e && e.JournalRef && e.JournalRef.jr_label,
        ).map((e) => {
          const str = e.JournalRef.jr_label;
          const i = str.indexOf(" ");
          return i === -1
            ? { code: str, label: "" }
            : { code: str.slice(0, i), label: str.slice(i + 1) };
        })
      : [];

  if (entries.length === 0) return null;

  const codes = entries.map((e) => e.code).join(", ");
  const full = entries
    .map((e) => (e.label ? e.code + " — " + e.label : e.code))
    .join("\n");

  return (
    <Tooltip
      title={<span style={{ whiteSpace: "pre-line" }}>{full}</span>}
      placement="top-start"
    >
      <Box
        component="span"
        sx={{
          display: "block",
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {codes}
      </Box>
    </Tooltip>
  );
}
