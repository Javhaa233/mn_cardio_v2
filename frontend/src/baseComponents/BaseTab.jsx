import React, { useState } from "react";
// translation
import { useTranslation } from "react-i18next";
// @mui/material components
import AppBar from "@mui/material/AppBar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {children}
    </div>
  );
};

export default function BaseTab(props) {
  const { t } = useTranslation();

  const { Tabss = [] } = props;

  const [value, setValue] = useState(0);

  const ChangeTab = (event, newValue) => setValue(newValue);

  const GetTabHeaders = () => {
    let TabHeader = [];
    for (let i = 0; i < Tabss.length; i++) {
      TabHeader.push(<Tab key={"Th" + i} label={t(Tabss[i].Label + "")} />);
    }
    return TabHeader;
  };

  const GetTabBodys = () => {
    var TabBody = [];
    for (var i = 0; i < Tabss.length; i++) {
      TabBody.push(
        <TabPanel key={"Tb" + i} value={value} index={i}>
          {Tabss[i].TabBody}
        </TabPanel>,
      );
    }
    return TabBody;
  };

  return (
    <div>
      <AppBar
        position="static"
        color="default"
        elevation={0}
        style={{ backgroundColor: "#e6e6e6" }}
      >
        <Tabs
          value={value}
          onChange={ChangeTab}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          {GetTabHeaders()}
        </Tabs>
      </AppBar>
      {GetTabBodys()}
    </div>
  );
}
