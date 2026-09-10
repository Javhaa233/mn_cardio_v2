import { withTranslation } from "react-i18next";
import PageContainer from "customComponents/PageContainer";
import React, { Component } from "react";
// translation
// @mui/material components
import CircularProgress from "@mui/material/CircularProgress";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import UniCard from "customComponents/UniCard";
// custom components
import BaseGrid from "baseComponents/BaseGrid/BaseGrid";
import SearchToolbar from "customComponents/AllReport/SearchToolbar";
// helper
import Helper from "helper";

class Reports extends Component {
  constructor(props) {
    super(props);
    this.state = { Data: [], IsLoading: false, Alert: null };
  }

  ShowAlert = (Message, Success) => {
    const Alert = Helper.BaseCrudHelper.ShowAlert(Message, Success, () =>
      this.setState({ Alert: null }),
    );
    this.setState({ Alert });
  };

  componentDidMount() {
    this.GetReportData({
      StartDate: null,
      EndDate: null,
      UserId: null,
      addr_prov_city: null,
      addr_soum_dist: null,
      addr_bag_khoroo: null,
    });
  }

  GetReportData = async (
    {
      StartDate,
      EndDate,
      UserId,
      addr_prov_city,
      addr_soum_dist,
      addr_bag_khoroo,
    },
    callback,
  ) => {
    const t = this.props.t;
    const ReqData = {
      StartDate,
      EndDate,
      UserId,
      addr_prov_city,
      addr_soum_dist,
      addr_bag_khoroo,
    };

    this.setState({ IsLoading: true });
    await Helper.BaseCrudHelper.CallService(
      "Report/GetReport",
      ReqData,
      (resData) => {
        if (resData && resData.Success) {
          this.setState({ Data: resData.Data });
        } else {
          this.setState({ Data: [] });
          this.ShowAlert(
            (resData && resData.Message) || t("An error occurred"),
            false,
          );
        }
        callback && callback(resData);
      },
    );
    this.setState({ IsLoading: false });
  };

  render() {
    const { Data, IsLoading, Alert } = this.state;
    const { t } = this.props;

    return (
      <PageContainer>
        {Alert}
        <UniCard
          title={t("Report")}
          color="rose"
          cardStyle={{
            margin: "0px 0 0 0",
            flex: "1 1 auto",
            height: "100%",
            minHeight: 0,
            maxWidth: "100%",
            display: "flex",
            flexDirection: "column",
          }}
          cardBodyStyle={{
            padding: "10px 10px 0 10px",
            display: "flex",
            flexDirection: "column",
            flex: 1,
            overflow: "hidden",
          }}
        >
          <div style={{ flex: "0 0 auto" }}>
            <SearchToolbar
              SearchReport={(
                {
                  StartDate,
                  EndDate,
                  UserId,
                  addr_prov_city,
                  addr_soum_dist,
                  addr_bag_khoroo,
                },
                callback,
              ) => {
                this.GetReportData(
                  {
                    StartDate,
                    EndDate,
                    UserId,
                    addr_prov_city,
                    addr_soum_dist,
                    addr_bag_khoroo,
                  },
                  (resData) => callback && callback(resData),
                );
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: "1 1 auto",
              minHeight: 0,
              minWidth: 0,
              maxWidth: "100%",
              overflow: "hidden",
              position: "relative",
              marginTop: "10px",
            }}
          >
            <BaseGrid
              // OrderBy={this.OrderBy}
              FillHeight={true}
              Fields={[
                { Label: t("Он, сар"), Name: "Months", NoSorting: true },
                { Label: t("Visit"), Name: "VisitCount", NoSorting: true },
                {
                  Label: t("Patient"),
                  Name: "PatientCount",
                  NoSorting: true,
                },
                { Label: t("ECHO"), Name: "EchoCount", NoSorting: true },
                {
                  Label: t("Advice"),
                  Name: "AdviceCount",
                  NoSorting: true,
                },
                {
                  Label: t("Advice comment"),
                  Name: "AdviceCommentCount",
                  NoSorting: true,
                },
                {
                  Label: t("Cathlab"),
                  Name: "PCathlabCount",
                  NoSorting: true,
                },
              ]}
              Data={Data}
              TextLength={20}
              PageSize={100}
              HideNumber={true}
              HideCheck={true}
              HideFilter={true}
              HidePagination={true}
              SearchFieldData={[]}
              FieldFilter={false}
              widthPattern="60, 120r, 120r, 120r, 120r, 120r, 120r, 120r"
              ShowData={() => {}}
            />
            {IsLoading && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  backgroundColor: "rgba(255, 255, 255, 0.6)",
                  zIndex: 2,
                }}
              >
                <CircularProgress size={36} />
                <span>{t("Loading ...")}</span>
              </div>
            )}
          </div>
        </UniCard>
      </PageContainer>
    );
  }
}

export default withTranslation(undefined, { withRef: true })(Reports);
