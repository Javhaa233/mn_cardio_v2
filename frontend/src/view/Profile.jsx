import React from "react";
// translation
import { useTranslation } from "react-i18next";
// custom components
import UniCard from "customComponents/UniCard";
import CustomTab from "customComponents/CustomTab";
import General from "customComponents/Profile/General";
import History from "customComponents/Profile/History";

export default function Profile() {
  const { t } = useTranslation();

  const GetTabs = () => {
    var Tabs = [];
    Tabs.push({
      tabButton: t("General"),
      tabContent: <General />,
    });
    Tabs.push({
      tabButton: t("History"),
      tabContent: <History />,
    });
    return Tabs;
  };

  return (
    <UniCard title={t("Profile")} color="rose">
      <CustomTab tabs={GetTabs()} fillHeight />
    </UniCard>
  );
}
