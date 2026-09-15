import React, { useState } from "react";
// translation
import { useTranslation } from "react-i18next";
// @mui/material components
import AppBar from "@mui/material/AppBar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

import { colors } from "@/theme/colors";
import { radius } from "@/theme/tokens";

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
      {/* Same tab language as CustomTab: ink text, cyanInk selection. The bar
          used to be a flat #e6e6e6 grey slab with MUI's default blue. */}
      <AppBar
        position="static"
        color="default"
        elevation={0}
        sx={{
          backgroundColor: colors.brand.surface,
          borderBottom: `1px solid ${colors.brand.hairline}`,
        }}
      >
        <Tabs
          value={value}
          onChange={ChangeTab}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            "& .MuiTabs-indicator": {
              height: "3px",
              borderRadius: radius.pill,
              backgroundColor: colors.brand.cyan,
            },
            "& .MuiTab-root": {
              textTransform: "none",
              fontSize: "14px",
              fontWeight: 400,
              color: colors.brand.inkDim,
              "&:hover": { color: colors.brand.ink },
            },
            "& .MuiTab-root.Mui-selected": {
              color: colors.brand.cyanInk,
              fontWeight: 600,
            },
          }}
        >
          {GetTabHeaders()}
        </Tabs>
      </AppBar>
      {GetTabBodys()}
    </div>
  );
}
