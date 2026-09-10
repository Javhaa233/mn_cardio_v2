import React from "react";
// @mui/material components
import { TableRow, TableCell, TextField } from "@mui/material";
// translation
import { useTranslation } from "react-i18next";

import { grayColor } from "assets/jss/material-dashboard-pro-react.js";

export default function FilterRow(props) {
  const { t } = useTranslation();
  const { Fields, HideNumber, HideCheck, GetSearchFieldValue, SearchField } =
    props;

  let myTimeout = null;

  const textFieldSx = {
    "& .MuiInputBase-input": {
      color: "#495057",
      backgroundColor: "#ffffff",
      fontWeight: "400",
      fontSize: "14px",
      height: "30px",
      boxSizing: "border-box",
      padding: "8px 12px",
      lineHeight: 1.5,
      "&::placeholder": {
        color: grayColor[3],
        opacity: 1,
      },
    },
    "& .MuiInput-underline:before": {
      borderBottomColor: "#D2D2D2 !important",
      borderBottomWidth: "1px !important",
    },
    "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
      borderBottomColor: "#D2D2D2 !important",
      borderBottomWidth: "1px !important",
    },
    "& .MuiInput-underline:after": {
      borderBottomColor: "#9c27b0",
    },
  };

  return (
    <TableRow tabIndex={-1} key="RowFilter" hover={false}>
      {HideNumber ? null : (
        <TableCell
          key={"ColFNumber"}
          style={{ padding: 0, whiteSpace: "nowrap" }}
        ></TableCell>
      )}

      {HideCheck ? null : (
        <TableCell
          key={"ColFCheck"}
          style={{ padding: 0, whiteSpace: "nowrap" }}
        ></TableCell>
      )}

      {Array.isArray(Fields) &&
        Fields.filter((col) => col.GridField !== false).map((Field, index) => (
          <TableCell
            key={"ColF" + index}
            style={{ padding: 0, whiteSpace: "nowrap" }}
          >
            {Field.Type === "Date" || Field.NoFilter ? (
              <div></div>
            ) : (
              <TextField
                size="small"
                fullWidth={true}
                defaultValue={GetSearchFieldValue(Field.Name)}
                placeholder={t("Search")}
                sx={textFieldSx}
                onChange={(event) => {
                  const value = event.target ? event.target.value : null;
                  myTimeout && clearTimeout(myTimeout);
                  myTimeout = setTimeout(() => {
                    SearchField && SearchField(Field.Name, value);
                  }, 500);
                  // if (event.target.value.length === 0 && SearchField) {
                  //   if (SearchField) {
                  //     SearchField(Field.Name, "");
                  //   }
                  // }
                }}
                disabled={Field.Type === "Date"}
              />
            )}
          </TableCell>
        ))}
    </TableRow>
  );
}
