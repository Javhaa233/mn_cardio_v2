import React, { Component } from "react";

import Typography from "@mui/material/Typography";

import GridItem from "components/Grid/GridItem";
import DivLoading from "customComponents/DivLoading";

import Chart from "customComponents/CardiovascularDisease/Forms/ChartBar";

import Helper from "helper";
import Box from "@mui/material/Box";
import { colors } from "@/theme/colors";
import { radius, elevation } from "@/theme/tokens";

// A chart card on the same surface as UniCard. The title wraps: indicator names
// are long clinical sentences, so they cannot use UniCard's one-line header.
const indicatorCardSx = {
  height: "100%",
  minHeight: "270px",
  display: "flex",
  flexDirection: "column",
  gap: 1,
  p: 2,
  backgroundColor: colors.brand.surface,
  border: `1px solid ${colors.brand.hairline}`,
  borderRadius: radius.lg,
  boxShadow: elevation[1],
};
const indicatorTitleSx = { color: colors.brand.ink, fontWeight: 600 };

class Report15 extends Component {
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
      "/CVDAnalysis/GetAnalyzeData15",
      { StartDate: StartDate || null, EndDate: EndDate || null },
      (resData) =>
        resData && this.setState({ Data: resData.Data, Loading: false }),
    );
  };

  render() {
    const { Data, Loading } = this.state;
    return (
      <GridItem xs={12} sm={6} md={4}>
        <Box sx={indicatorCardSx}>
          <Typography variant="body2" component="div" sx={indicatorTitleSx}>
            15. Сүүлийн 3 сарын хугацаанд нөөц нь дуусаагүй ЗСӨ/ЧШ-гийн үндсэн 9
            эмийг тодорхойлсон жагсаалтын хувь
          </Typography>
          <Box sx={{ flex: 1, minHeight: 0 }}>
            {Loading ? (
              <div style={{ position: "relative", height: "180px" }}>
                <DivLoading />
              </div>
            ) : (
              <div>
                <Chart Data={Data} chartType={"bar"} Id={"t14"} />
              </div>
            )}
          </Box>
        </Box>
      </GridItem>
    );
  }
}

export default Report15;
