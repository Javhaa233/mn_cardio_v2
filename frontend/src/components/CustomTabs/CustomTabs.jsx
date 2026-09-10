import React, { useState } from "react";
// nodejs library to set properties for components
import PropTypes from "prop-types";

// material-ui components
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
// core components
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
import CardHeader from "components/Card/CardHeader";

import {
  whiteColor,
  hexToRgb,
} from "assets/jss/material-dashboard-pro-react.js";

export default function CustomTabs(props) {
  const [value, setValue] = useState(0);
  const { headerColor, plainTabs, tabs = [], title } = props;

  const handleChange = (event, value) => setValue(value);

  return (
    <Card plain={plainTabs}>
      <CardHeader color={headerColor} plain={plainTabs}>
        {title ? (
          <Box
            sx={{
              float: "left",
              padding: "4px 6px 4px 0px", // reduced
              lineHeight: "20px", // reduced
            }}
          >
            {title}
          </Box>
        ) : null}

        <Tabs
          value={value}
          onChange={handleChange}
          sx={{
            minHeight: "unset !important",
            "& .MuiTabs-indicator": { display: "none" },
          }}
        >
          {tabs.map((prop, key) => {
            const icon = prop.tabIcon ? { icon: <prop.tabIcon /> } : {};

            return (
              <Tab
                key={key}
                label={prop.tabName}
                {...icon}
                sx={{
                  minHeight: "unset !important",
                  padding: "6px 10px", // reduced
                  marginLeft: "3px", // reduced
                  fontSize: "0.8rem", // smaller text
                  lineHeight: "20px", // reduced
                  borderRadius: "3px",
                  color: whiteColor + " !important",
                  "&:last-child": { marginLeft: "0px" },
                  "&.Mui-selected": {
                    backgroundColor: `rgba(${hexToRgb(whiteColor)}, 0.18)`,
                    transition: "0.2s background-color 0.1s",
                  },
                  "& .MuiTab-wrapper": {
                    fontSize: "11px", // reduced
                    lineHeight: "20px",
                    "& > svg": {
                      margin: "-1px 4px 0 0 !important", // tighter
                    },
                  },
                }}
              />
            );
          })}
        </Tabs>
      </CardHeader>

      <CardBody sx={{ padding: "10px 12px !important" }}>
        {" "}
        {/* reduced */}
        {tabs[value] && <div>{tabs[value].tabContent}</div>}
      </CardBody>
    </Card>
  );
}

CustomTabs.propTypes = {
  headerColor: PropTypes.oneOf([
    "warning",
    "success",
    "danger",
    "info",
    "primary",
    "rose",
  ]),
  title: PropTypes.string,
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      tabName: PropTypes.string.isRequired,
      tabIcon: PropTypes.object,
      tabContent: PropTypes.node.isRequired,
    }),
  ),
  plainTabs: PropTypes.bool,
};
