import { withTranslation } from "react-i18next";
import React, { Component } from "react";
import { saveAs } from "file-saver";
// translation

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
// import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";

// custom components
import DivLoading from "customComponents/DivLoading";
import Actions from "customComponents/CardiovascularDisease/Report/Components/Actions";
import Filter from "customComponents/CardiovascularDisease/Report/Components/Filter";
import Pagination from "customComponents/CardiovascularDisease/Report/Components/Pagination";
// helper
import Helper from "helper";
// server
import Server from "config/Server";

import { HeaderArray, RowColumns } from "assets/store/reportMonthTableColumns";

const rowSx = {
  "& .MuiTableCell-root": {
    position: "relative",
    border: "1px solid",
    maxWidth: "200px",
    padding: "10px",
    textAlign: "center",
    whiteSpace: "normal",
    wordWrap: "break-word",
    "& > div": { fontSize: "11px", lineHeight: 1 },
    "& > div.Number": { fontSize: "10px", fontWeight: 400 },
  },
};

class CVDReportMonthTable extends Component {
  constructor(props) {
    super(props);
    this.state = { Data: [], Total: 0, Loading: false, page: 0 };
    this.NowDate = Helper.ObjectHelper.getDateYMD();
    this.LogedUser = Helper.AuthHelper.GetLogedUserLocal();
    this.RoleId = this.LogedUser ? this.LogedUser.RoleId : null;
    this.OrganizationName =
      this.LogedUser &&
      this.LogedUser.Doctor &&
      this.LogedUser.Doctor.Organization
        ? this.LogedUser.Doctor.Organization.Name
        : "**********";
    this.HeaderArray = HeaderArray;
    this.RowColumns = RowColumns;

    this.Doctor = this.LogedUser ? this.LogedUser.Doctor : null;
    this.SearchOption = {
      StartDate: null,
      EndDate: null,
      OrganizationId: this.Doctor ? this.Doctor.OrganizationId : null,
      ProvinceCityId: null,
      SoumDistrictId: null,
      BagKhorooId: null,
      offset: 0,
      limit: 100,
    };

    this.debounceTimer = null;
  }

  componentDidMount() {
    this.GetData();
  }

  componentWillUnmount() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }

  GetData = async () => {
    const t = this.props.t;
    this.setState({ Loading: true });
    await Helper.BaseCrudHelper.CallService(
      "/CVDReport/GetReportMonthData",
      { SearchOption: this.SearchOption },
      (resData) => {
        resData && this.setState({ Data: resData.Data, Total: resData.Total });
        this.setState({ Loading: false });
      },
    );
  };

  // MonthNewsExportExcel
  MonthNewsExportExcel = async (SearchOption, callback) => {
    const Token = localStorage.getItem("MnCardioToken");
    await Server({
      method: "POST",
      url: "/CVDReport/MonthNewsExportExcel",
      headers: { authorization: "Bearer " + Token },
      data: { SearchOption },
      responseType: "blob",
    })
      .then((res) => {
        const Data = res.data;
        if (Data.Success === false) {
          callback && callback(Data);
        } else {
          const xlsxBlob = new Blob([Data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          saveAs(xlsxBlob, "MonthNewsExportExcel.xlsx");
          callback && callback();
        }
      })
      .catch((err) => {
        process.env.NODE_ENV === "development" && console.log({ err });
        callback && callback();
      });
  };

  TableNumbers = () => {
    const row = [];
    for (var i = 1; i <= 13; i++) {
      row.push(
        <TableCell key={i}>
          <div className="Number">{i}</div>
        </TableCell>,
      );
    }
    return row;
  };

  render() {
    const { Data, Loading, Total } = this.state;
    const { HeaderArray, RowColumns, TableNumbers } = this;
    const { t } = this.props;

    return (
      <div
        style={{
          position: "relative",
          height: "100%",
          padding: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div>
          <Filter
            ChangeValue={(SearchOption) => {
              this.SearchOption = {
                ...SearchOption,
                offset: 0,
                limit: this.SearchOption.limit,
              };
              this.setState({ page: 0 });
              if (this.debounceTimer) {
                clearTimeout(this.debounceTimer);
              }
              this.debounceTimer = setTimeout(() => {
                this.GetData();
              }, 800);
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Pagination
            ChangePage={(Page, Limit) => {
              this.SearchOption = {
                ...this.SearchOption,
                offset: Page,
                limit: Limit,
              };
              this.setState({ page: Page });
              this.GetData();
            }}
            Total={Total}
            PageSize={100}
            page={this.state.page}
          />
          <Actions
            download={async (callback) => {
              const SearchOption = this.SearchOption;
              await this.MonthNewsExportExcel(
                SearchOption,
                () => callback && callback(),
              );
            }}
            refresh={async (callback) => {
              await this.GetData();
              callback && callback();
            }}
          />
        </div>
        <div
          style={{
            flex: 1,
            overflow: "auto",
            border: "1px solid #ddd",
            borderRadius: "4px",
          }}
        >
          {Loading && <DivLoading WithoutCard={true} />}
          <TableContainer>
            <Table aria-label="sticky table" stickyHeader>
              <TableHead>
                {Array.isArray(HeaderArray) &&
                  HeaderArray.map((e, key) => (
                    <TableRow key={"Row-" + key} sx={rowSx}>
                      {e.map((eChild, keyChild) => {
                        return (
                          <TableCell
                            colSpan={eChild.colSpan ? eChild.colSpan : 1}
                            rowSpan={eChild.rowSpan ? eChild.rowSpan : 1}
                            key={"Cell-" + keyChild}
                          >
                            <div style={eChild.style ? eChild.style : {}}>
                              {eChild.Text}
                              {eChild.Name === "orgname"
                                ? " " + this.OrganizationName
                                : ""}
                              {eChild.Name === "sent_date"
                                ? " " + this.NowDate
                                : ""}
                              {eChild.Name === "month"
                                ? " " +
                                  Helper.ObjectHelper.getDateM() +
                                  " сарын мэдээ"
                                : ""}
                            </div>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                <TableRow sx={rowSx}>{TableNumbers()}</TableRow>
              </TableHead>
              {/* Table Body */}
              <TableBody>
                {Array.isArray(Data) && Data.length > 0 ? (
                  Data.map((item, key) => (
                    <TableRow key={"Row-" + key} sx={rowSx}>
                      {RowColumns.map((col, colKey) => (
                        <TableCell key={"Cell-" + colKey}>
                          <div>{item[col] ? item[col] : ""}</div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={54}>{t("No data found")}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div>
    );
  }
}

export default withTranslation(undefined, { withRef: true })(
  CVDReportMonthTable,
);
