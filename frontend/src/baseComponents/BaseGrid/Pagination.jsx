import { useTranslation } from "react-i18next";
import React, { useState } from "react";
import TablePagination from "@mui/material/TablePagination";

export default function Pagination(props) {
  const { t } = useTranslation();
  const {
    Option = {},
    PageSize = 20,
    ChangePage,
    RowsPerPageOptions = [2, 5, 10, 20, 30, 40, 50, 100],
    ...others
  } = props;

  const [pageNumber, setPageNumber] = useState(0);
  const [pageSize, setPageSize] = useState(PageSize ? PageSize : 20);

  const ChangePageNumber = (event, newPage) => {
    setPageNumber(newPage);
    ChangePage && ChangePage(newPage, pageSize);
  };

  const ChangePageSize = (event) => {
    setPageSize(parseInt(event.target.value, 10));
    setPageNumber(0);
    ChangePage && ChangePage(0, parseInt(event.target.value, 10));
  };

  return (
    <TablePagination
      rowsPerPageOptions={RowsPerPageOptions}
      component="div"
      count={Option?.Total ?? 0}
      rowsPerPage={pageSize}
      page={pageNumber}
      onPageChange={ChangePageNumber}
      onRowsPerPageChange={ChangePageSize}
      // MUI's own defaults are English ("Rows per page:", "1–10 of 438"). Same
      // words and order as the BaseGrid footer; a caller can still override.
      labelRowsPerPage={t("Show rows") + ":"}
      labelDisplayedRows={({ from, to, count }) =>
        `${from}-${to} ${t("of")} ${count}`
      }
      sx={{
        "& .MuiTablePagination-toolbar": {
          display: "flex",
          alignItems: "center",
          paddingLeft: "10px",
          minHeight: "52px",
        },
        "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
          {
            display: "flex",
            alignItems: "center",
            margin: 0,
            lineHeight: 1,
          },
        "& .MuiTablePagination-displayedRows": {
          minWidth: "140px",
        },
        "& .MuiTablePagination-select": {
          minWidth: "80px",
          paddingLeft: "16px",
          paddingRight: "32px",
        },
        "& .MuiTablePagination-actions": {
          display: "flex",
          alignItems: "center",
          marginLeft: "8px",
        },
        "& .MuiTablePagination-actions button": {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
      }}
      {...others}
    />
  );
}
