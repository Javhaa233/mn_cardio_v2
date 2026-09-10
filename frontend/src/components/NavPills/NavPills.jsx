import React, { useState } from "react";
// nodejs library to set properties for components
import PropTypes from "prop-types";
import SwipeableViews from "react-swipeable-views";

// material-ui components
import { styled } from "@mui/material/styles";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Box from "@mui/material/Box";

// core components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";

import {
  roseColor,
  primaryColor,
  infoColor,
  successColor,
  warningColor,
  dangerColor,
  whiteColor,
  blackColor,
  grayColor,
  hexToRgb,
} from "assets/jss/material-dashboard-pro-react.js";

const ContentWrapper = styled("div")({
  marginTop: "10px",
});

const TabContent = styled("div")({});

const getColorStyles = (color) => {
  const colorMap = {
    primary: primaryColor[0],
    info: infoColor[0],
    success: successColor[0],
    warning: warningColor[0],
    danger: dangerColor[0],
    rose: roseColor[0],
  };

  const bgColor = colorMap[color] || primaryColor[0];

  return {
    "&.Mui-selected": {
      color: whiteColor,
      backgroundColor: bgColor,
      boxShadow: `0 4px 20px 0px rgba(${hexToRgb(blackColor)}, 0.14), 0 7px 10px -5px rgba(${hexToRgb(bgColor)}, 0.4)`,
    },
    "&.Mui-selected:hover": {
      color: whiteColor,
      backgroundColor: bgColor,
      boxShadow: `0 4px 20px 0px rgba(${hexToRgb(blackColor)}, 0.14), 0 7px 10px -5px rgba(${hexToRgb(bgColor)}, 0.4)`,
    },
  };
};

export default function NavPills(props) {
  const { tabs, color, horizontal, alignCenter } = props;

  const [active, setActive] = useState(props.active);

  const handleChange = (event, active) => {
    setActive(active);
  };
  const handleChangeIndex = (index) => {
    setActive(index);
  };

  const tabButtons = (
    <Tabs
      value={active}
      onChange={handleChange}
      centered={alignCenter}
      sx={{
        marginTop: "10px",
        paddingLeft: "0",
        marginBottom: "0",
        overflow: "visible !important",
        "& .MuiTabs-fixed": {
          overflow: "visible !important",
        },
        "& .MuiTabs-flexContainer": {
          ...(horizontal && { display: "block" }),
          "@media (max-width: 600px)": {
            display: "flex",
            flexWrap: "wrap",
          },
        },
        "& .MuiTabs-indicator": {
          display: "none",
        },
      }}
    >
      {tabs.map((prop, key) => {
        var icon = {};
        if (prop.tabIcon) {
          icon["icon"] = (
            <prop.tabIcon
              sx={{
                width: "30px",
                height: "30px",
                display: "block",
                margin: "15px 0 !important",
              }}
            />
          );
        }

        return (
          <Tab
            label={prop.tabButton}
            key={key}
            {...icon}
            sx={{
              float: "left",
              position: "relative",
              display: "block",
              padding: "8px 3px",
              color: grayColor[6],
              height: "auto",
              opacity: "1",
              margin: "0",
              fontSize: "11px",
              maxWidth: "100%",
              minWidth: "100px",
              minHeight: "10px",
              textAlign: "center",
              transition: "all .3s",
              fontWeight: "400",
              lineHeight: "24px",
              borderRadius: prop.tabIcon ? "4px" : "0",
              textTransform: "uppercase",
              letterSpacing: "initial",
              ...(horizontal && {
                width: "100%",
                float: "none !important",
                "& + button": {
                  margin: "3px 0",
                },
              }),
              ...getColorStyles(color),
            }}
          />
        );
      })}
    </Tabs>
  );
  const tabContent = (
    <ContentWrapper>
      <SwipeableViews
        axis={"x"}
        index={active}
        onChangeIndex={handleChangeIndex}
        style={{ overflowY: "hidden" }}
      >
        {tabs.map((prop, key) => {
          return <TabContent key={key}>{prop.tabContent}</TabContent>;
        })}
      </SwipeableViews>
    </ContentWrapper>
  );
  return horizontal ? (
    <GridContainer>
      <GridItem {...horizontal.tabsGrid} style={{ padding: "0 5px" }}>
        {tabButtons}
      </GridItem>
      <GridItem {...horizontal.contentGrid} style={{ padding: "0 5px" }}>
        {tabContent}
      </GridItem>
    </GridContainer>
  ) : (
    <div>
      {tabButtons}
      {tabContent}
    </div>
  );
}

NavPills.defaultProps = {
  active: 0,
  color: "primary",
};

NavPills.propTypes = {
  // index of the default active pill
  active: PropTypes.number,
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      tabButton: PropTypes.string,
      tabIcon: PropTypes.object,
      tabContent: PropTypes.node,
    }),
  ).isRequired,
  color: PropTypes.oneOf([
    "primary",
    "warning",
    "danger",
    "success",
    "info",
    "rose",
  ]),
  direction: PropTypes.string,
  horizontal: PropTypes.shape({
    tabsGrid: PropTypes.object,
    contentGrid: PropTypes.object,
  }),
  alignCenter: PropTypes.bool,
};
