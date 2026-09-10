import React, { Component } from "react";

import Typography from "@mui/material/Typography";

import Chart from "./Chart";
// helper
import Helper from "helper";

const headerSx = {
  position: "absolute",
  top: "-17px",
  left: 0,
  right: "auto",
  bottom: "auto",
  display: "inline-block",
  margin: 0,
  padding: "4px 12px",
  backgroundColor: "#9C27B0",
  color: "#fff",
  fontWeight: "400",
  fontSize: "14px",
};

class CVDAnalyze extends Component {
  constructor(props) {
    super(props);
    this.state = { Data: null };
    this.Data = {};

    this.MonitoringId = null;
    this.SearchOption = Helper.BaseCrudHelper.GetSearchOption();
    this.SearchOption.PageOption.Limit = 1000;
    this.SearchOption.OrderBy = { Field: "Id", Type: "desc" };
  }

  SetMonitoringId = (MonitoringId) => {
    this.MonitoringId = MonitoringId;
    this.GetData();
  };

  componentDidMount() {
    const { MonitoringId } = this.props;
    if (MonitoringId) {
      this.MonitoringId = MonitoringId;
      this.GetData();
    }
  }

  componentDidUpdate(prevProps) {
    const { MonitoringId } = this.props;
    if (MonitoringId && MonitoringId !== prevProps.MonitoringId) {
      this.MonitoringId = MonitoringId;
      this.GetData();
    }
  }

  GetData = async (callback) => {
    const { MonitoringId } = this;
    if (MonitoringId && MonitoringId !== "") {
      await Helper.BaseCrudHelper.CallService(
        "/CVDMonitoring/GetAnalyzeData",
        { MonitoringId },
        (resData) => {
          if (resData) {
            if (resData.Data) this.setState({ Data: resData.Data });
            const alert = Helper.BaseCrudHelper.ShowAlert(
              resData.Message,
              resData.Success,
              () => {
                this.setState({ Alert: null });
                callback && callback(resData.Success);
              },
            );
            this.setState({ Alert: alert });
          }
        },
      );
    }
  };

  render() {
    const { t } = this.props;
    const { Data } = this.state;
    const { Id } = this.props;

    return (
      <div style={{ marginRight: "15px" }}>
        {Data && Data.Daralt && Data.Daralt.length > 0 ? (
          <div>
            <div
              style={{
                position: "relative",
                margin: "30px 0",
                borderTop: "1px solid #9C27B0",
              }}
            >
              <Typography component="h5" sx={headerSx}>
                Систол, диастол даралт (мм.муб)
              </Typography>
            </div>
            <Chart Data={Data.Daralt} chartType={"line"} Id={Id + "line"} />
          </div>
        ) : null}
        {Data && Data.BJI && Data.BJI.length > 0 ? (
          <div>
            <div
              style={{
                position: "relative",
                margin: "30px 0",
                borderTop: "1px solid #4CAF50",
              }}
            >
              <Typography component="h5" sx={headerSx}>
                БЖИ (кг/м2)
              </Typography>
            </div>
            <Chart
              Data={Data.BJI}
              chartType={"area-spline"}
              Id={Id + "area-line"}
            />
          </div>
        ) : null}
        {Data && Data.Cholesterol && Data.Cholesterol.length > 0 ? (
          <div>
            <div
              style={{
                position: "relative",
                margin: "30px 0",
                borderTop: "1px solid rgb(244,67,54)",
              }}
            >
              <Typography component="h5" sx={headerSx}>
                Холестерин
              </Typography>
            </div>
            <Chart
              Data={Data.Cholesterol}
              chartType={"spline"}
              Id={Id + "spline"}
            />
          </div>
        ) : null}
        {Data && Data.Risk && Data.Risk.length > 0 ? (
          <div>
            <div
              style={{
                position: "relative",
                margin: "30px 0",
                borderTop: "1px solid rgb(0,172,193)",
              }}
            >
              <Typography component="h5" sx={headerSx}>
                ЗСӨ-ний 10 жилийн эрсдэл
              </Typography>
            </div>
            <Chart Data={Data.Risk} chartType={"bar"} Id={Id + "bar"} />
          </div>
        ) : null}
      </div>
    );
  }
}

export default CVDAnalyze;
