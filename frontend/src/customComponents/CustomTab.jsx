import React, { useState } from "react";

import { useTranslation } from "react-i18next";
// nodejs library to set properties for components
import PropTypes from "prop-types";

// material-ui components
import { Tab, Tabs, Box } from "@mui/material";
import { useIsCompact } from "helper/useResponsive";

const styles = {
  tabRoot: { minHeight: "44px", marginTop: "6px", marginBottom: "0px" },
  displayNone: { display: "none !important" },
  horizontalDisplay: {
    display: "flex",
    flexWrap: "nowrap",
    gap: "8px",
    padding: "2px 2px 2px 15px",
  },
  pills: {
    float: "left",
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "5px 14px",
    color: "#344054",
    height: "auto",
    opacity: "1",
    margin: "0",
    fontSize: "13px",
    width: "auto",
    flex: "0 0 auto",
    minWidth: "auto",
    minHeight: "32px !important",
    maxHeight: "none",
    textAlign: "center",
    transition:
      "background-color 150ms ease, border-color 150ms ease, color 150ms ease, box-shadow 150ms ease",
    fontWeight: "600",
    lineHeight: 1.2,
    borderRadius: "999px",
    textTransform: "none",
    letterSpacing: "initial",
    whiteSpace: "normal",
    border: "1px solid #D0D5DD",
    backgroundColor: "#F2F4F7",
    "&:hover": {
      backgroundColor: "#FFFFFF",
      boxShadow: "0 1px 4px rgba(16, 24, 40, 0.12)",
    },
    "&.Mui-focusVisible": {
      outline: "2px solid rgba(76, 175, 80, 0.35)",
      outlineOffset: "2px",
    },
  },
  vertical: { borderBottom: "1px solid #4caf50" },
  hasMany: { width: "80px" },
  shortVertical: { width: "auto", paddingLeft: "10px", paddingRight: "10px" },
  selected: {
    "&,&:hover": {
      color: "#101828",
      backgroundColor: "#FFFFFF",
      borderColor: "#4caf50",
      boxShadow: "0 3px 14px rgba(16, 24, 40, 0.14)",
    },
  },
  // --- sideBar mode: a vertical rail of tabs on the left of the content ---
  sideRail: {
    flexShrink: 0,
    alignSelf: "stretch",
    borderRight: "1px solid #EAECF0",
    backgroundColor: "#FCFCFD",
    padding: "8px",
    boxSizing: "border-box",
    overflowY: "auto",
    "&::-webkit-scrollbar": { width: "8px" },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "rgba(16, 24, 40, 0.18)",
      borderRadius: "4px",
    },
  },
  sidePill: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    textAlign: "left",
    width: "100%",
    maxWidth: "100%",
    minHeight: "34px",
    padding: "7px 10px 7px 12px",
    margin: 0,
    color: "#475467",
    fontSize: "12.5px",
    fontWeight: 500,
    lineHeight: 1.3,
    letterSpacing: "initial",
    textTransform: "none",
    whiteSpace: "normal",
    borderRadius: "6px",
    transition: "background-color 150ms ease, color 150ms ease",
    gap: "9px",
    "& .MuiTab-iconWrapper": {
      margin: 0,
      flexShrink: 0,
      width: "17px",
      height: "17px",
      fontSize: "17px",
      color: "#98A2B3",
      transition: "color 150ms ease",
    },
    "&:hover .MuiTab-iconWrapper": { color: "#667085" },
    "&::before": {
      content: '""',
      position: "absolute",
      left: "3px",
      top: "6px",
      bottom: "6px",
      width: "3px",
      borderRadius: "2px",
      backgroundColor: "transparent",
      transition: "background-color 150ms ease",
    },
    "&:hover": { backgroundColor: "#F2F4F7", color: "#101828" },
    "&.Mui-focusVisible": {
      outline: "2px solid rgba(76, 175, 80, 0.35)",
      outlineOffset: "-2px",
    },
  },
  sidePillSelected: {
    "&,&:hover": {
      color: "#101828",
      fontWeight: 600,
      backgroundColor: "#ECFDF3",
      "& .MuiTab-iconWrapper": { color: "#4caf50" },
    },
    "&::before": { backgroundColor: "#4caf50" },
  },
};

const TabPanel = (props) => {
  const {
    children,
    value,
    index,
    fillHeight,
    vertical,
    style,
    keepMounted,
    ...other
  } = props;
  const isActive = value === index;

  // Inactive tabs are unmounted by default. With keepMounted they stay mounted
  // and are only hidden, so refs and unsaved edits survive a tab switch.
  if (!isActive && !keepMounted) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      {...other}
      style={{
        ...(style || {}),
        ...(fillHeight
          ? {
              flex: "1 1 auto",
              minHeight: 0,
              height: "100%",
              maxWidth: "100%",
              overflow: "auto",
              display: "flex",
              flexDirection: "column",
            }
          : {}),
        ...(isActive ? {} : { display: "none" }),
      }}
    >
      {children}
    </div>
  );
};

export default function CustomTab(props) {
  const { t } = useTranslation();
  const isCompact = useIsCompact();
  const {
    active = 0,
    vertical = false,
    hasMany = false,
    shortVertical = false,
    tabs = [],
    fillHeight = vertical,
    containerSx,
    noHorizontalPadding = false,
    centered = false,
    wrapped = true,
    keepMounted = false,
    children,
    endActions,
    onChange,
    // sideBar: render the tab buttons as a vertical rail beside the content
    sideBar = false,
    sideBarWidth = 230,
    sideBarMaxHeight = "calc(100vh - 150px)",
  } = props;

  const [value, setValue] = useState(active);

  const handleChange = (event, active) => {
    setValue(active);
    onChange && onChange(active);
  };

  const tabButtons = (
    <Tabs
      sx={{
        ...styles.tabRoot,
        "& .MuiTabs-indicator": { display: "none !important" },
        ...(vertical
          ? {
              "& .MuiTabs-flexContainer": {
                gap: "8px",
              },
            }
          : {
              "& .MuiTabs-flexContainer": {
                ...styles.horizontalDisplay,
                justifyContent: centered ? "center" : undefined,
                flexWrap: wrapped ? "wrap" : "nowrap",
              },
            }),
      }}
      value={value}
      onChange={handleChange}
      variant={vertical ? "standard" : wrapped ? "standard" : "scrollable"}
      scrollButtons={vertical ? false : "auto"}
      allowScrollButtonsMobile
    >
      {Array.isArray(tabs) &&
        tabs.map((prop, key) => (
          <Tab
            label={t(prop.tabButton + "")}
            key={key}
            wrapped={wrapped}
            sx={{
              ...styles.pills,
              ...(vertical ? styles.vertical : null),
              ...(hasMany ? styles.hasMany : null),
              ...(shortVertical ? styles.shortVertical : null),
              "&.Mui-selected": styles.selected["&,&:hover"],
              "&.Mui-selected:hover": styles.selected["&,&:hover"],
            }}
          />
        ))}
    </Tabs>
  );

  const sideTabButtons = (
    <Tabs
      // Below `md` the rail has already moved from beside the content to above
      // it (see the sideBar branch), so a VERTICAL orientation there produces a
      // full-width column of stacked tabs that can push the content itself off
      // the first screen. Horizontal + scrollable turns it into one strip.
      orientation={isCompact ? "horizontal" : "vertical"}
      variant={isCompact ? "scrollable" : "standard"}
      scrollButtons={isCompact ? "auto" : false}
      allowScrollButtonsMobile
      value={value}
      onChange={handleChange}
      sx={{
        minHeight: 0,
        "& .MuiTabs-indicator": { display: "none !important" },
        "& .MuiTabs-flexContainer": { gap: "2px" },
      }}
    >
      {Array.isArray(tabs) &&
        tabs.map((prop, key) => (
          <Tab
            label={t(prop.tabButton + "")}
            icon={prop.tabIcon || undefined}
            iconPosition={prop.tabIcon ? "start" : undefined}
            key={key}
            sx={{
              ...styles.sidePill,
              "&.Mui-selected": styles.sidePillSelected["&,&:hover"],
              "&.Mui-selected:hover": styles.sidePillSelected["&,&:hover"],
              "&.Mui-selected::before": styles.sidePillSelected["&::before"],
            }}
          />
        ))}
    </Tabs>
  );

  const tabContent =
    Array.isArray(tabs) &&
    tabs.map((prop, key) => (
      <TabPanel
        key={"Tb" + key}
        value={value}
        index={key}
        fillHeight={fillHeight}
        vertical={vertical}
        keepMounted={keepMounted}
        style={
          fillHeight
            ? {
                height: "100%",
                flex: "1 1 auto",
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
                minWidth: 0,
                maxWidth: "100%",
                overflow: "auto",
              }
            : undefined
        }
      >
        {prop.tabContent}
      </TabPanel>
    ));

  if (sideBar) {
    return (
      <Box
        sx={{
          backgroundColor: "#fff",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "stretch",
          width: "100%",
          minHeight: 0,
          border: "1px solid #EAECF0",
          borderRadius: "3px",
          overflow: "hidden",
          ...containerSx,
        }}
      >
        <Box
          sx={{
            ...styles.sideRail,
            width: { xs: "100%", md: sideBarWidth + "px" },
            maxHeight: { xs: "none", md: sideBarMaxHeight },
            borderRight: { xs: "none", md: "1px solid #EAECF0" },
            borderBottom: { xs: "1px solid #EAECF0", md: "none" },
          }}
        >
          {sideTabButtons}
        </Box>
        <Box
          sx={{
            flex: "1 1 auto",
            minWidth: 0,
            maxWidth: "100%",
            maxHeight: { xs: "none", md: sideBarMaxHeight },
            overflowY: { xs: "visible", md: "auto" },
            padding: "10px 12px 12px 12px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {endActions}
          {children}
          {tabContent}
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        backgroundColor: "#fff",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: fillHeight ? "100%" : "auto",
        minHeight: 0,
        overflow: "visible",
        ...containerSx,
      }}
    >
      <Box
        sx={{
          padding: "0 0px",
          flex: "0 0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "1px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pr: 2,
          }}
        >
          {tabButtons}
          {endActions}
        </Box>
        {children}
      </Box>
      <Box
        sx={{
          padding: vertical
            ? noHorizontalPadding
              ? fillHeight
                ? "10px 0"
                : "0"
              : fillHeight
                ? "10px 15px"
                : "0 15px"
            : "0 5px 5px 5px",
          flex: fillHeight ? "1 1 auto" : "0 0 auto",
          minHeight: 0,
          minWidth: 0,
          maxWidth: "100%",
          overflow: fillHeight ? "hidden" : "visible",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#fff",
          borderRadius: vertical ? 0 : "8px",
          margin: vertical ? 0 : "0 0px",
        }}
      >
        {tabContent}
      </Box>
    </Box>
  );
}

CustomTab.propTypes = {
  // index of the default active pill
  active: PropTypes.number,
  noHorizontalPadding: PropTypes.bool,
  centered: PropTypes.bool,
  wrapped: PropTypes.bool,
  // keep inactive tabs mounted (hidden) instead of unmounting them
  keepMounted: PropTypes.bool,
  // render the tab buttons as a vertical rail to the left of the content
  sideBar: PropTypes.bool,
  sideBarWidth: PropTypes.number,
  sideBarMaxHeight: PropTypes.string,
  children: PropTypes.node,
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      tabButton: PropTypes.string,
      tabContent: PropTypes.node,
    }),
  ).isRequired,
};
