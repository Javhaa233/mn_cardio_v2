import React, { Component } from "react";
import Box from "@mui/material/Box";

import GridItem from "components/Grid/GridItem";
import Card from "components/Card/Card";
import CardHeader from "components/Card/CardHeader";
import CardBody from "components/Card/CardBody";
import DivLoading from "customComponents/DivLoading";

import Chart from "customComponents/CardiovascularDisease/Forms/ChartBar";
import reportStyles from "assets/jss/material-dashboard-pro-react/custom/reportStyles";

import Helper from "helper";

class Report6 extends Component {
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
      "/CVDAnalysis/GetAnalyzeData6",
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
            <Box component="h6" sx={reportStyles.cardIconTitle}>
              6. Зорилтот хүн амын дунд ЧШ-тэй байж болзошгүй нийт хүмүүсийн
              дотор Чихрийн шижинтэй, эмчилгээнд хамрагдсан өвчтөнүүдийн эзлэх
              хувь
            </Box>
          </CardHeader>
          <CardBody>
            {Loading ? (
              <div style={{ position: "relative", height: "180px" }}>
                <DivLoading />
              </div>
            ) : (
              <Chart Data={Data} chartType={"bar"} Id={"t5"} />
            )}
          </CardBody>
        </Card>
      </GridItem>
    );
  }
}

export default Report6;
