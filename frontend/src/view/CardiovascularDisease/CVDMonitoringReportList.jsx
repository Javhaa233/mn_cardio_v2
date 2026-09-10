import { withTranslation } from "react-i18next";
import React, { Component, createRef } from "react";

// translation

import UniCard from "customComponents/UniCard";
import CustomTab from "customComponents/CustomTab";
import CVDReportTable from "customComponents/CardiovascularDisease/Report/CVDReportTable";
import CVDInspectionReportTable from "customComponents/CardiovascularDisease/Report/CVDInspectionReportTable";
import CVDReportUnitTable from "customComponents/CardiovascularDisease/Report/CVDReportUnitTable";
import CVDReportSoumTable from "customComponents/CardiovascularDisease/Report/CVDReportSoumTable";
import CVDReportMonthTable from "customComponents/CardiovascularDisease/Report/CVDReportMonthTable";

class CVDMonitoringList extends Component {
  constructor(props) {
    super(props);
    // refs
    this.CVDReportTableRef = createRef();
    this.CVDInspectionReportTableRef = createRef();
    this.CVDReportUnitTableRef = createRef();
    this.CVDReportSoumTableRef = createRef();
    this.CVDReportMonthTableRef = createRef();
  }

  // Tabs
  GetTabs = () => {
    const t = this.props.t;
    var Tabs = [];

    Tabs.push({
      tabButton: "Дэлгэрэнгүй бүртгэл",
      tabContent: (
        <CVDReportTable
          ref={(ref) => (this.CVDReportTableRef = ref)}
          CustomRender={true}
        />
      ),
    });

    Tabs.push({
      tabButton: "Үзлэг",
      tabContent: (
        <CVDInspectionReportTable
          ref={(ref) => (this.CVDInspectionReportTableRef = ref)}
          CustomRender={true}
        />
      ),
    });

    Tabs.push({
      tabButton: "Нэгдсэн бүртгэл",
      tabContent: (
        <CVDReportUnitTable
          ref={(ref) => (this.CVDReportUnitTableRef = ref)}
          CustomRender={true}
        />
      ),
    });

    Tabs.push({
      tabButton: "Сум",
      tabContent: (
        <CVDReportSoumTable
          ref={(ref) => (this.CVDReportSoumTableRef = ref)}
          CustomRender={true}
        />
      ),
    });

    Tabs.push({
      tabButton: "Сарын мэдээ",
      tabContent: (
        <CVDReportMonthTable
          ref={(ref) => (this.CVDReportMonthTableRef = ref)}
          CustomRender={true}
        />
      ),
    });

    return Tabs;
  };

  render() {
    const { t } = this.props;
    return (
      <UniCard
        title={t("Report")}
        color="warning"
        cardBodyStyle={{
          padding: 0,
          paddingLeft: 16,
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
        }}
      >
        <CustomTab
          vertical
          noHorizontalPadding
          fillHeight
          tabs={this.GetTabs()}
        />
      </UniCard>
    );
  }
}

export default withTranslation(undefined, { withRef: true })(CVDMonitoringList);
