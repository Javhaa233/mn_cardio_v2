import { withTranslation } from "react-i18next";
import React, { Component } from "react";
// translation
// @mui/material components
import CircularProgress from "@mui/material/CircularProgress";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import Button from "components/CustomButtons/Button";
// custom components
// import Datetime from "customComponents/DateTime";
// import SimpleSelect from "customComponents/SimpleSelect";
// import SingleSelect from "customComponents/AllReport/SingleSelect";
import ReportRangeDate from "customComponents/AllReport/ReportRangeDate";
import ReportLocationSelect from "customComponents/AllReport/ReportLocationSelect";
import UniCard from "customComponents/UniCard";
// helper
import Helper from "helper";

class AllReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      StartDate: Helper.ObjectHelper.getDateYM(),
      EndDate: Helper.ObjectHelper.getDateYM(),
      UserId: null,
      addr_prov_city: null,
      addr_soum_dist: null,
      addr_bag_khoroo: null,
      isLoading: false,
    };
  }

  componentDidMount() {
    const NowDate = new Date();
    this.setState({
      StartDate: Helper.ObjectHelper.getDateYM(
        NowDate.setMonth(NowDate.getMonth() - 6),
      ),
    });
  }

  GetReportData = async () => {
    const t = this.props.t;
    const {
      StartDate,
      EndDate,
      UserId,
      addr_prov_city,
      addr_soum_dist,
      addr_bag_khoroo,
    } = this.state;

    const ReqData = {
      StartDate,
      EndDate,
      UserId,
      addr_prov_city,
      addr_soum_dist,
      addr_bag_khoroo,
    };

    this.setState({ isLoading: true });
    await Helper.BaseCrudHelper.CallService(
      "Report/GetReport",
      ReqData,
      (resData) => {
        resData && resData.Success && this.setState({ isLoading: false });
      },
    );
  };

  render() {
    const { t } = this.props;
    const { isLoading, StartDate } = this.state;

    return (
      <UniCard title={t("Report")} color="rose">
        <GridContainer>
          <GridItem md={2} sm={2} xs={12}>
            <ReportRangeDate
              ChangeValue={(StartDate, EndDate) =>
                this.setState({ StartDate, EndDate })
              }
              StartDate={StartDate}
            />
            <div>
              <h5>{t("Doctor")}</h5>
            </div>
            <ReportLocationSelect />
            <div
              style={{
                position: "relative",
                marginTop: "10px",
                width: "100%",
              }}
            >
              <Button
                color="danger"
                style={{ width: "100%" }}
                onClick={() => this.GetReportData()}
                disabled={isLoading}
              >
                {t("Search")}
              </Button>
              {isLoading && (
                <CircularProgress
                  size={24}
                  style={{
                    color: "#00a4d6",
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    marginTop: -12,
                    marginLeft: -12,
                  }}
                />
              )}
            </div>
          </GridItem>
          <GridItem md={8} sm={8} xs={12}></GridItem>
        </GridContainer>
      </UniCard>
    );
  }
}

export default withTranslation(undefined, { withRef: true })(AllReport);
