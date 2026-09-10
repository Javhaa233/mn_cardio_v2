import {
  whiteColor,
  hexToRgb,
} from "assets/jss/material-dashboard-pro-react.js";

const customTabsStyle = {
  cardTitle: {
    float: "left",
    padding: "10px 10px 10px 0",
    lineHeight: "24px",
  },

  cardTitleRTL: {
    float: "right",
    padding: "10px 0 10px 10px !important",
  },

  displayNone: {
    display: "none !important",
  },

  tabsRoot: {
    "& $tabRootButton": { fontSize: "0.875rem" },
  },

  tabRootButton: {
    padding: "8px 12px",
    borderRadius: "3px",
    lineHeight: "22px",
    color: `${whiteColor} !important`,
    marginLeft: "4px",
    "&:last-child": { marginLeft: 0 },
  },

  tabLabel: {
    fontWeight: 500,
    fontSize: "12px",
  },

  tabSelected: {
    backgroundColor: `rgba(${hexToRgb(whiteColor)}, 0.2)`,
    transition: "background-color 0.2s",
  },

  tabWrapper: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "12px",
    lineHeight: "22px",
    fontWeight: 500,
    "& svg": {
      marginTop: "-1px",
    },
  },
};

export default customTabsStyle;
