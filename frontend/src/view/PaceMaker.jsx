import React from "react";
// custom components
import UniCard from "customComponents/UniCard";
import CustomTab from "customComponents/CustomTab";
import OutPatientInfoReport from "customComponents/Report/OutPatientInfoReport";
import EPSAblation from "customComponents/Report/EPSAblation";

export default function PaceMaker() {
  const GetTabs = () => {
    var Tabs = [];
    Tabs.push({
      tabButton: "ЭФШ, аблацийн маягт",
      tabContent: <EPSAblation />,
    });
    Tabs.push({
      tabButton: "About hospitalized",
      tabContent: <OutPatientInfoReport DataId={1008} />,
    });
    // Tabs.push({
    //   tabButton: "ПЕЙСМЕЙКЕР 1",
    //   tabContent: <PaceMakerOneReport />,
    // });
    // Tabs.push({
    //   tabButton: "ПЕЙСМЕЙКЕР 2",
    //   tabContent: <PaceMakerTwoReport />,
    // });
    // Tabs.push({
    //   tabButton: "ПЕЙСМЕЙКЕР 3",
    //   tabContent: <PaceMakerThreeReport />,
    // });
    return Tabs;
  };

  return (
    <UniCard showHeader={false}>
      <CustomTab tabs={GetTabs()} fillHeight />
    </UniCard>
  );
}
