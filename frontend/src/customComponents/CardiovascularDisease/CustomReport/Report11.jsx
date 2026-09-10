import React, { Component } from "react";

import Typography from "@mui/material/Typography";

import GridItem from "components/Grid/GridItem";
import Card from "components/Card/Card";
import CardHeader from "components/Card/CardHeader";
import CardBody from "components/Card/CardBody";
import DivLoading from "customComponents/DivLoading";

import Chart from "customComponents/CardiovascularDisease/Forms/ChartBar";

import Helper from "helper";

const cardIconTitleSx = {
  marginTop: "15px",
  marginBottom: "15px",
  textAlign: "justify",
  fontSize: "12px",
  fontWeight: "500",
};

class Report11 extends Component {
  constructor(props) {
    super(props);
    this.state = { Data: null, Loading: false };
  }

  componentDidMount = () => {
    this.GetReportData({});
  };

  GetReportData = async ({ StartDate, EndDate }) => {
    this.setState({ Loading: true });
    await Helper.BaseCrudHelper.CallService(
      "/CVDAnalysis/GetAnalyzeData11",
      { StartDate: StartDate || null, EndDate: EndDate || null },
      (resData) =>
        resData && this.setState({ Data: resData.Data, Loading: false }),
    );
  };

  render() {
    const { Data, Loading } = this.state;
    return (
      <GridItem xs={12} sm={6} md={4}>
        <Card style={{ minHeight: "270px", marginTop: 0, marginBottom: 0 }}>
          <CardHeader color="rose" icon>
            <Typography component="h6" sx={cardIconTitleSx}>
              11. ЗСӨ-ний сүүлчийн үзлэгээр ЗСӨ-ний түүхтэй эсвэл ЗСӨ-ний эрсдэл
              ≥ 30% -тай , АД-нь {"< 130/80"} идэвхтэй өвчтөний эзлэх хувь
            </Typography>
          </CardHeader>
          <CardBody>
            {Loading ? (
              <div style={{ position: "relative", height: "180px" }}>
                <DivLoading />
              </div>
            ) : (
              <div>
                <Chart Data={Data} chartType={"bar"} Id={"t10"} />
              </div>
            )}
          </CardBody>
        </Card>
      </GridItem>
    );
  }
}

export default Report11;
