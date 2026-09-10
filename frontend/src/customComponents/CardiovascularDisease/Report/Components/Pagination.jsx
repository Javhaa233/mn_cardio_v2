import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from "react";
import TablePagination from "@mui/material/TablePagination";

export default function Pagination(props) {
  const { t } = useTranslation();
  const { ChangePage, Total = 0, PageSize = 100, page } = props;

  const [PageNumber, setPageNumber] = useState(0);
  const [Size, setSize] = useState(PageSize);

  useEffect(() => {
    if (page !== undefined && page !== PageNumber) {
      setPageNumber(page);
    }
  }, [page]);

  const ChangePageNumber = (event, newPage) => {
    setPageNumber(newPage);
    ChangePage && ChangePage(newPage, Size);
  };

  const ChangePageSize = (event) => {
    setSize(parseInt(event.target.value, 10));
    setPageNumber(0);
    ChangePage && ChangePage(0, parseInt(event.target.value, 10));
  };

  return (
    <TablePagination
      rowsPerPageOptions={[100, 250, 500, 1000]}
      component="div"
      count={Total ? Total : 0}
      rowsPerPage={Size}
      page={PageNumber}
      onPageChange={ChangePageNumber}
      onRowsPerPageChange={ChangePageSize}
      labelDisplayedRows={({ from, to, count }) =>
        `${from}-${to} ${t("Total")}: ${count}`
      }
      sx={{
        display: "flex",
        alignItems: "center",
        "& .MuiTablePagination-toolbar": {
          minHeight: "52px",
          paddingLeft: "0px",
        },
        "& .MuiTablePagination-displayedRows": {
          margin: 0,
        },
        "& .MuiTablePagination-actions": {
          marginLeft: "8px",
        },
      }}
    />
  );
}
