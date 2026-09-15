import React, { Component, createRef } from "react";

// translation
import { withTranslation } from "react-i18next";

import { Box } from "@mui/material";

import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";

import RangeDate from "customComponents/RangeDate";
import UniCard from "customComponents/UniCard";

//reports
import Report1 from "customComponents/CardiovascularDisease/CustomReport/Report1";
import Report2 from "customComponents/CardiovascularDisease/CustomReport/Report2";
import Report3 from "customComponents/CardiovascularDisease/CustomReport/Report3";
import Report4 from "customComponents/CardiovascularDisease/CustomReport/Report4";
import Report5 from "customComponents/CardiovascularDisease/CustomReport/Report5";
import Report6 from "customComponents/CardiovascularDisease/CustomReport/Report6";
import Report7 from "customComponents/CardiovascularDisease/CustomReport/Report7";
import Report8 from "customComponents/CardiovascularDisease/CustomReport/Report8";
import Report9 from "customComponents/CardiovascularDisease/CustomReport/Report9";
import Report10 from "customComponents/CardiovascularDisease/CustomReport/Report10";
import Report11 from "customComponents/CardiovascularDisease/CustomReport/Report11";
import Report12 from "customComponents/CardiovascularDisease/CustomReport/Report12";
import Report13 from "customComponents/CardiovascularDisease/CustomReport/Report13";
import Report14 from "customComponents/CardiovascularDisease/CustomReport/Report14";
import Report15 from "customComponents/CardiovascularDisease/CustomReport/Report15";

class CVDIndicartors extends Component {
  constructor(props) {
    super(props);

    // refs
    this.Report1Ref = createRef();
    this.Report2Ref = createRef();
    this.Report3Ref = createRef();
    this.Report4Ref = createRef();
    this.Report5Ref = createRef();
    this.Report6Ref = createRef();
    this.Report7Ref = createRef();
    this.Report8Ref = createRef();
    this.Report9Ref = createRef();
    this.Report10Ref = createRef();
    this.Report11Ref = createRef();
    this.Report12Ref = createRef();
    this.Report13Ref = createRef();
    this.Report14Ref = createRef();
    this.Report15Ref = createRef();
  }

  GetData = async ({ StartDate, EndDate }) => {
    this.Report1Ref.GetReportData &&
      this.Report1Ref.GetReportData({ StartDate, EndDate });
    this.Report2Ref.GetReportData &&
      this.Report2Ref.GetReportData({ StartDate, EndDate });
    this.Report3Ref.GetReportData &&
      this.Report3Ref.GetReportData({ StartDate, EndDate });
    this.Report4Ref.GetReportData &&
      this.Report4Ref.GetReportData({ StartDate, EndDate });
    this.Report5Ref.GetReportData &&
      this.Report5Ref.GetReportData({ StartDate, EndDate });
    this.Report6Ref.GetReportData &&
      this.Report6Ref.GetReportData({ StartDate, EndDate });
    this.Report7Ref.GetReportData &&
      this.Report7Ref.GetReportData({ StartDate, EndDate });
    this.Report8Ref.GetReportData &&
      this.Report8Ref.GetReportData({ StartDate, EndDate });
    this.Report9Ref.GetReportData &&
      this.Report9Ref.GetReportData({ StartDate, EndDate });
    this.Report10Ref.GetReportData &&
      this.Report10Ref.GetReportData({ StartDate, EndDate });
    this.Report11Ref.GetReportData &&
      this.Report11Ref.GetReportData({ StartDate, EndDate });
    this.Report12Ref.GetReportData &&
      this.Report12Ref.GetReportData({ StartDate, EndDate });
    this.Report13Ref.GetReportData &&
      this.Report13Ref.GetReportData({ StartDate, EndDate });
    this.Report14Ref.GetReportData &&
      this.Report14Ref.GetReportData({ StartDate, EndDate });
    this.Report15Ref.GetReportData &&
      this.Report15Ref.GetReportData({ StartDate, EndDate });
  };

  render() {
    const { t } = this.props;
    // Was a bare Box on the canvas: the range floated above fifteen Creative
    // Tim cards. It is framed like every other page now; the cards inside are
    // the indicator panels (CustomReport/Report1..15).
    return (
      <UniCard title={t("Үзүүлэлт")} cardBodyStyle={{ overflowY: "auto" }}>
        <Box sx={{ flex: "0 0 auto", mb: 1.5 }}>
          <RangeDate
            ChangeValue={(StartDate, EndDate) =>
              this.GetData({ StartDate, EndDate })
            }
            Refresh={() => {}}
          />
        </Box>
        <GridContainer spacing={1.5} sx={{ width: "100%", margin: 0 }}>
          <Report1 ref={(ref) => (this.Report1Ref = ref)} />
          <Report2 ref={(ref) => (this.Report2Ref = ref)} />
          <Report3 ref={(ref) => (this.Report3Ref = ref)} />
          <Report4 ref={(ref) => (this.Report4Ref = ref)} />
          <Report5 ref={(ref) => (this.Report5Ref = ref)} />
          <Report6 ref={(ref) => (this.Report6Ref = ref)} />
          <Report7 ref={(ref) => (this.Report7Ref = ref)} />
          <Report8 ref={(ref) => (this.Report8Ref = ref)} />
          <Report9 ref={(ref) => (this.Report9Ref = ref)} />
          <Report10 ref={(ref) => (this.Report10Ref = ref)} />
          <Report11 ref={(ref) => (this.Report11Ref = ref)} />
          <Report12 ref={(ref) => (this.Report12Ref = ref)} />
          <Report13 ref={(ref) => (this.Report13Ref = ref)} />
          <Report14 ref={(ref) => (this.Report14Ref = ref)} />
          <Report15 ref={(ref) => (this.Report15Ref = ref)} />
        </GridContainer>
      </UniCard>
    );
  }
}

export default withTranslation(undefined, { withRef: true })(CVDIndicartors);
