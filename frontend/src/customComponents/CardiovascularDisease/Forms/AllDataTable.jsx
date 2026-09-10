import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { alpha } from "@mui/material/styles";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import SearchIcon from "@mui/icons-material/Search";
import InputBase from "@mui/material/InputBase";

import BaseLoading from "customComponents/BaseLoading";
import CustomTableRow from "./CustomTableRow";

import Helper from "helper";

const StyledTable = styled(Table)(({ theme }) => ({
  minWidth: 650,
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "& .MuiTableCell-root": {
    padding: "2px",
    fontSize: "12px",
  },
}));

const StyledSearchContainer = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.black, 0.15),
  "&:hover": { backgroundColor: alpha(theme.palette.common.black, 0.25) },
  marginRight: theme.spacing(0),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(0),
    width: "auto",
  },
}));

const StyledSearchIcon = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create("width"),
    [theme.breakpoints.up("md")]: { width: "20ch" },
  },
}));

export default function AllDataTable(props) {
  const { t } = useTranslation();

  const {
    Data = [],
    PatRegNo = null,
    Journals = [],
    AddToTablets,
    RemoveTablets,
  } = props;

  const [AllTablets, setAllTablets] = useState([]);
  const [SelectedTablets, setSelectedTablets] = useState(Data);
  const [filtered, setFiltered] = useState([]);
  const [searchField, setSearchField] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [TabletsLoading, setTabletsLoading] = useState(false);

  useEffect(() => {
    GetTabletsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const GetTabletsData = async () => {
    setTabletsLoading(true);
    let diagCodes =
      Array.isArray(Journals) &&
      Journals.map((diagCode) =>
        diagCode && diagCode.JournalRef
          ? typeof diagCode.JournalRef.jr_label === "string"
            ? diagCode.JournalRef.jr_label.substr(1, 3)
            : null
          : null,
      );

    diagCodes = diagCodes.filter((e) => e !== null);
    await Helper.BaseCrudHelper.CallService(
      "/EMDService/getTabletByDiagnosis",
      { diagCodes, PatRegNo },
      (resData) => {
        if (resData) {
          setAllTablets(resData.Data);
          setFiltered(resData.Data);
          setTabletsLoading(false);
        }
      },
    );
  };

  // useEffect(() => {
  //   searchTablets(AllTablets);
  // }, [searchField]);

  const SearchTablets = (SearchText) => {
    const NewFiltered = AllTablets.filter((tablet) => {
      return tablet.tbltNameInter
        .toLowerCase()
        .includes(SearchText.toLowerCase());
    });
    setFiltered(NewFiltered);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) =>
    setRowsPerPage(+event.target.value);

  const AddSelectedTablets = (row) => {
    var AddedTablets = SelectedTablets ? SelectedTablets : [];
    AddedTablets.push(row);
    setSelectedTablets(AddedTablets);
    AddToTablets && AddToTablets(AddedTablets);
  };

  const onRemoveTablets = (id) => {
    var idM = null;
    var RemovedTablets = SelectedTablets;
    RemovedTablets.length > 0 &&
      RemovedTablets.map((i) => {
        if (i.tbltId === id.tbltId) idM = i;
      });
    var index = RemovedTablets.indexOf(idM);
    RemovedTablets.splice(index, 1);
    setSelectedTablets(RemovedTablets);
    RemoveTablets && RemoveTablets(RemovedTablets);
  };

  const checkData = (id) => {
    var idM = null;
    var DataT = Data ? Data : [];
    DataT.forEach((i) => {
      if (i.tbltId === id) idM = i;
    });

    var index = DataT.indexOf(idM);
    if (index !== -1) {
      return { ...DataT[index], checker: true };
    } else {
      filtered.forEach((i) => {
        if (i.tbltId === id) idM = i;
      });

      return {
        ...idM,
        desc: 0,
        dailyCount: 0,
        totalDays: 0,
        tbltSize: 0,
        checker: false,
      };
    }
  };

  return (
    <div>
      <StyledSearchContainer>
        <StyledSearchIcon>
          <SearchIcon />
        </StyledSearchIcon>
        <StyledInputBase
          placeholder="Search…"
          value={searchField}
          inputProps={{ "aria-label": "search" }}
          onChange={(e) => {
            setSearchField(e.target.value);
            SearchTablets(e.target.value);
          }}
        />
      </StyledSearchContainer>
      <TableContainer>
        {TabletsLoading ? (
          <BaseLoading />
        ) : (
          <StyledTable size="small">
            <TableHead>
              <StyledTableRow>
                <TableCell></TableCell>
                <TableCell align="left">{t("Эмийн нэр")}</TableCell>
                <TableCell align="center">
                  {t("Өдөрт уух нийт эмийн ширхэг")}
                </TableCell>
                <TableCell align="center">{t("Нийт уух өдөр")}</TableCell>
                <TableCell align="center">{t("Нийт тоо ширхэг")}</TableCell>
                <TableCell align="center">{t("Тэмдэглэл")}</TableCell>
                <TableCell></TableCell>
              </StyledTableRow>
            </TableHead>
            <TableBody>
              {filtered !== null && filtered.length > 0
                ? filtered
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, index) => (
                      <CustomTableRow
                        key={index}
                        row={checkData(row.tbltId)}
                        index={page * rowsPerPage + index + 1}
                        AddSelectedTablets={AddSelectedTablets}
                        RemoveTablets={onRemoveTablets}
                      />
                    ))
                : null}
            </TableBody>
          </StyledTable>
        )}
      </TableContainer>
      {filtered !== null && filtered.length > 0 ? (
        <TablePagination
          rowsPerPageOptions={[]}
          component="div"
          count={filtered.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      ) : null}
    </div>
  );
}
