import { withTranslation } from "react-i18next";
import React, { Component, createRef } from "react";
// translation
// @mui/material components
import { styled } from "@mui/material/styles";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// custom components
// import BaseNoData from "customComponents/BaseNoData";
// import BaseInfo from "customComponents/BaseViewControls/BaseInfo";
// import BaseArrayInfo from "customComponents/BaseViewControls/BaseArrayInfo";
// import BaseLabel from "customComponents/BaseViewControls/BaseLabel";
// import CustomTab from "customComponents/CustomTab";
import BaseLoading from "customComponents/BaseLoading";
// import CustomContainer from "customComponents/CustomContainer";
import UserDialogLink from "customComponents/DoctorProfile/UserDialogLink";
// helper
import Helper from "helper";

import customFormStyles from "assets/jss/material-dashboard-pro-react/custom/customFormStyles";

class Neelttei extends Component {
  constructor(props) {
    super(props);
    this.state = { Alert: null, Data: null, Loading: false };
    this.LogedUser = Helper.AuthHelper.GetLogedUserLocal();
    this.DataId = props.DataId || null;

    // refs
    this.ReportRef = createRef();
  }

  componentDidMount() {
    this.GetData();
  }

  GetData = async () => {
    const t = this.props.t;
    const { DataId } = this;
    this.setState({ Loading: true });
    if (DataId) {
      var SearchOption = Helper.BaseCrudHelper.GetSearchOption();
      SearchOption.SearchField = Helper.BaseCrudHelper.SetSearchField(
        "Id",
        DataId,
        SearchOption.SearchField,
        "Equals",
      );
      await Helper.BaseCrudHelper.BaseGetDetailInfo(
        { ObjectName: "CongenitalMalformations", SearchOption },
        (resData) => {
          resData &&
            resData.Success &&
            resData.Data &&
            this.setState({ Data: resData.Data });
          this.setState({ Loading: false });
        },
      );
    } else {
      this.setState({ Loading: false });
    }
  };

  Print = async (callback) => {
    const { DataId } = this;
    let alert = null;
    if (DataId) {
      await Helper.BaseCrudHelper.BasePrintReport(
        {
          Url: "/CongenitalMalformations/PrintReport",
          Data: { Id: DataId },
          FileName: "CongenitalMalformations.pdf",
        },
        (Success) => {
          alert = Helper.BaseCrudHelper.ShowAlert(
            Success ? "Successfully printed" : "Error",
            Success,
            () => {
              this.setState({ Alert: null });
              callback && callback();
            },
          );
          this.setState({ Alert: alert });
        },
      );
    } else {
      alert = Helper.BaseCrudHelper.ShowAlert("No data saved", false, () => {
        this.setState({ Alert: null });
        callback && callback();
      });
      this.setState({ Alert: alert });
    }
  };

  GetPrintNew = async (callback) => {
    const { DataId } = this;
    let alert = null;
    if (DataId) {
      await Helper.BaseCrudHelper.BasePrintReport(
        {
          Url: "/CongenitalMalformations/PrintReportNew",
          Data: { Id: DataId },
          FileName: "CongenitalMalformations.pdf",
        },
        (Success) => {
          alert = Helper.BaseCrudHelper.ShowAlert(
            Success ? "Successfully printed" : "Error",
            Success,
            () => {
              this.setState({ Alert: null });
              callback && callback();
            },
          );
          this.setState({ Alert: alert });
        },
      );
    } else {
      alert = Helper.BaseCrudHelper.ShowAlert("No data saved", false, () => {
        this.setState({ Alert: null });
        callback && callback();
      });
      this.setState({ Alert: alert });
    }
  };

  //
  Confirm = async (callback) => {
    const { DataId } = this;
    let alert = null;
    if (DataId) {
      await Helper.BaseCrudHelper.CallService(
        "/CongenitalMalformations/Confirm",
        { Id: DataId },
        (resData) => {
          if (resData) {
            alert = Helper.BaseCrudHelper.ShowAlert(
              resData.Message,
              resData.Success,
              () => {
                this.setState({ Alert: null });
                callback && callback();
              },
            );
            this.setState({ Alert: alert });
          }
        },
      );
    } else {
      alert = Helper.BaseCrudHelper.ShowAlert(
        "Information is missing",
        false,
        () => {
          this.setState({ Alert: null });
          callback && callback();
        },
      );
      this.setState({ Alert: alert });
    }
  };

  render() {
    const { Loading, Data, Alert } = this.state;
    const { t } = this.props;
    if (Loading) {
      return <BaseLoading />;
    } else {
      return (
        <div>
          {Alert}
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
                            DateStr: Data.CreatedDate,
                          })
                        : ""}
                    </span>
                  </div>
                </GridItem>
                <GridItem xs={12} sm={6} md={6}>
                  <div style={{ float: "right" }}>
                    <UserDialogLink UserId={Data ? Data.CreateUserId : null}>
                      {t("Doctor")}: {"\u00A0"}
                      <span style={{ fontWeight: "400" }}>
                        {Data && Data.Users ? Data.Users.UserName : ""}
                      </span>
                    </UserDialogLink>
                  </div>
                </GridItem>
              </GridContainer>
            </GridItem>
            <GridItem xs={12} sm={12} md={12} style={{ padding: "0 50px" }}>
              <h4 style={{ textAlign: "center", fontWeight: "500" }}>
                {t("НЭЭЛТТЭЙ МЭС ЗАСАЛ")}
              </h4>
            </GridItem>
          </GridContainer>
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

export default withTranslation(undefined, { withRef: true })(Neelttei);
