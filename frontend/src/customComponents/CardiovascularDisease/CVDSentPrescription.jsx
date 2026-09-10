import { withTranslation } from "react-i18next";
import React, { Component, createRef } from "react";
// translation
// @mui/material components
import { css } from "@emotion/css";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// custom components
import BaseLoading from "customComponents/BaseLoading";
import UserDialogLink from "customComponents/DoctorProfile/UserDialogLink";
// helper
import Helper from "helper";

const styles = {
  request_status: {
    color: "white",
    backgroundColor: "red",
    marginLeft: "5px",
    padding: "1px 8px",
    borderRadius: "2px",
  },
  error_text: {
    display: "flex",
    justifyContent: "flex-start",
    width: "100%",
    color: "#8c0303",
    fontWeight: "400",
    backgroundColor: "#ffc9c9",
    margin: "10px 0",
    padding: "12px 15px",
    border: "1px solid #e01919",
    borderRadius: "6px",
    "& > span": { marginLeft: "22px" },
  },
};

const withMui5Styles = (stylesObj) => (WrappedComponent) => {
  const classes = Object.keys(stylesObj).reduce((acc, key) => {
    acc[key] = css(stylesObj[key]);
    return acc;
  }, {});

  const WithMui5Styles = React.forwardRef((props, ref) => (
    <WrappedComponent {...props} classes={classes} ref={ref} />
  ));
  return WithMui5Styles;
};

class CVDMonitoring extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Alert: null,
      Data: null,
      Loading: false,
      Tablets: [],
      SentData: null,
      ResData: null,
    };
    this.bodyColor = null;
    this.bodyText = null;
    this.LogedUser = Helper.AuthHelper.GetLogedUserLocal();
    this.DataId = props.DataId || null;

    // refs
    this.CVDAnalyzeRef = createRef();
  }

  componentDidMount() {
    this.GetData();
  }

  GetData = async () => {
    const { DataId } = this;
    this.setState({
      Loading: false,
      CVDHistoryLoading: true,
      CVDBodySizeLoading: true,
      CVDRiskLoading: true,
    });
    if (DataId) {
      let SearchOption = Helper.BaseCrudHelper.GetSearchOption();
      SearchOption.SearchField = Helper.BaseCrudHelper.SetSearchField(
        "Id",
        DataId,
        SearchOption.SearchField,
        "Equals",
      );
      await Helper.BaseCrudHelper.BaseGetDetailInfo(
        { ObjectName: "CVDSentPrescription", SearchOption },
        (resData) => {
          if (resData.Success && resData.Data) {
            const tempData = JSON.parse(resData.Data.SentData);
            const receiveData = JSON.parse(resData.Data.ResData);
            this.setState({
              Data: Object.assign({}, resData.Data),
              Tablets: tempData.tablets,
              ResData: Object.assign({}, receiveData),
              SentData: tempData,
            });
          }
          this.setState({ Loading: false });
        },
      );
    } else {
      this.setState({ Loading: false });
    }
  };

  render() {
    const { ResData, SentData, Tablets, Loading, Data, Alert } = this.state;
    const { classes, t } = this.props;

    if (Loading) {
      return <BaseLoading />;
    } else {
      return (
        <div>
          {Alert}
          {Data && (
            <GridContainer style={{ width: "calc(100% - 30px)" }}>
              <GridItem xs={12} sm={12} md={12}>
                <GridContainer style={{ margin: "15px 0" }}>
                  <GridItem xs={12} sm={6} md={6}>
                    <div style={{ float: "left" }}>
                      {t("Date")}: {"\u00A0"}
                      <span style={{ fontWeight: "400" }}>
                        &nbsp;
                        {Data
                          ? Helper.ObjectHelper.getDateYMD({
                              DateStr: Data.CreateDate,
                            })
                          : ""}
                      </span>
                    </div>
                  </GridItem>
                  <GridItem xs={12} sm={6} md={6}>
                    <div style={{ float: "right" }}>
                      <UserDialogLink UserId={Data.CreateUserId || null}>
                        {t("Doctor")}: {"\u00A0"}
                        <span style={{ fontWeight: "400" }}>
                          {Data.Users ? Data.Users.UserName : ""}
                        </span>
                      </UserDialogLink>
                    </div>
                  </GridItem>
                  <GridItem xs={12} sm={12} md={12}>
                    <div style={{ marginTop: "20px", marginBottom: "35px" }}>
                      <h5
                        style={{
                          fontSize: "14px",
                          margin: 0,
                          padding: 0,
                          fontWeight: "400",
                          marginBottom: "10px",
                        }}
                      >
                        {t("Төлөв")}:
                        <span
                          className={classes.request_status}
                          style={{
                            backgroundColor:
                              Data.RequestStatus === "successfully"
                                ? "#00941b"
                                : "#ff1717",
                          }}
                        >
                          {t(
                            Data.RequestStatus === "successfully"
                              ? "Successfully"
                              : "Unsuccessfully",
                          )}
                        </span>
                      </h5>
                      {Data.RequestStatus === "unsuccessfully" && (
                        <div className={classes.error_text}>
                          <i
                            className="fa fa-times-circle"
                            style={{ fontSize: "22px" }}
                          />
                          <span>{ResData ? ResData.respMsg : null}</span>
                        </div>
                      )}
                    </div>
                  </GridItem>
                  <GridItem xs={12} sm={12} md={12}>
                    <div style={{ marginBottom: "35px" }}>
                      <h5
                        style={{
                          fontSize: "14px",
                          margin: 0,
                          padding: 0,
                          fontWeight: "400",
                          marginBottom: "10px",
                          borderBottom: "1px solid #2e2e2e",
                        }}
                      >
                        {t("The diagnosis")}:
                      </h5>
                      {SentData && SentData.receiptDiag
                        ? SentData.receiptDiag
                        : null}
                      <h5
                        style={{
                          fontSize: "13px",
                          margin: 0,
                          padding: 0,
                          marginTop: "15px",
                          fontWeight: "400",
                          marginBottom: "0px",
                          color: "#6e6e6e",
                        }}
                      >
                        {t("Нэмэлт тайлбар")}:
                      </h5>

                      {SentData && SentData.desc ? SentData.desc : null}
                    </div>
                  </GridItem>
                  <GridItem
                    xs={12}
                    sm={12}
                    md={12}
                    style={{ marginBottom: "16px" }}
                  >
                    <div style={{ marginTop: "30px" }}>
                      <h5
                        style={{
                          margin: 0,
                          fontSize: "14px",
                          padding: 0,
                          fontWeight: "400",
                          marginBottom: "10px",
                          borderBottom: "1px solid #2e2e2e",
                        }}
                      >
                        {t("Эмийн жагсаалт")}:
                      </h5>
                      <TableContainer>
                        <Table className={classes.table} size="small">
                          <TableHead>
                            <TableRow className={classes.tableRow}>
                              <TableCell width="50px" align="center">
                                #
                              </TableCell>
                              <TableCell align="left">
                                {t("Эмийн нэр")}
                              </TableCell>
                              <TableCell align="center">{t("Т/Ш")}</TableCell>
                              <TableCell width="300px" align="center">
                                {t("Тэмдэглэл")}
                              </TableCell>
                              <TableCell align="center">%-тэй</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {Array.isArray(Tablets) && Tablets.length > 0
                              ? Tablets.map((row, index) => (
                                  <TableRow key={index}>
                                    <TableCell
                                      width="50px"
                                      align="center"
                                    ></TableCell>
                                    <TableCell align="left">
                                      {row.name + "(" + row.tbltTypeName + ")"}
                                    </TableCell>
                                    <TableCell align="center">
                                      {row.tbltSize}
                                    </TableCell>
                                    <TableCell width="300px" align="center">
                                      <p
                                        style={{
                                          width: "300px",
                                          overflowY: "auto",
                                        }}
                                      >
                                        {row.desc}
                                      </p>
                                    </TableCell>
                                    <TableCell align="center">
                                      {row.isDiscount}
                                    </TableCell>
                                  </TableRow>
                                ))
                              : null}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </div>
                  </GridItem>
                </GridContainer>
              </GridItem>
            </GridContainer>
          )}
          <GridContainer
            style={{ margin: "0", width: "100%", minHeight: "760px" }}
          >
            <GridItem xs={12} sm={12} md={12}></GridItem>
          </GridContainer>
        </div>
      );
    }
  }
}

export default withTranslation(undefined, { withRef: true })(
  withMui5Styles(styles)(CVDMonitoring),
);
