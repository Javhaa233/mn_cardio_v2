import i18n from "i18n";
import {
  warningCardHeader,
  successCardHeader,
  dangerCardHeader,
  infoCardHeader,
  primaryCardHeader,
  roseCardHeader,
  whiteColor,
  blackColor,
  hexToRgb,
} from "assets/jss/material-dashboard-pro-react.js";
const cardHeaderStyle = {
  cardHeader: {
    padding: "0.75rem 1.25rem",
    marginBottom: "0",
    borderBottom: "none",
    background: "transparent",
    zIndex: "3 !important",
    "&$cardHeaderPlain,&$cardHeaderImage,&$cardHeaderContact,&$cardHeaderSignup,&$cardHeaderIcon,&$cardHeaderStats,&$warningCardHeader,&$successCardHeader,&$dangerCardHeader,&$infoCardHeader,&$primaryCardHeader,&$roseCardHeader":
      {
        margin: "0 15px",
        padding: "0",
        position: "relative",
        color: whiteColor,
      },
    "&:first-of-type": {
      borderRadius: "calc(.25rem - 1px) calc(.25rem - 1px) 0 0",
    },
    "&$warningCardHeader,&$successCardHeader,&$dangerCardHeader,&$infoCardHeader,&$primaryCardHeader,&$roseCardHeader":
      {
        "&:no($cardHeaderIcon):no($cardHeaderImage):no($cardHeaderText)": {
          borderRadius: "3px",
          marginTop: "-20px",
          padding: "15px",
        },
      },
    "&$cardHeaderStats svg": {
      fontSize: "36px",
      lineHeight: "56px",
      textAlign: "center",
      width: "36px",
      height: "36px",
      margin: "10px 10px 4px",
    },
    "&$cardHeaderStats .fab,&$cardHeaderStats .fas,&$cardHeaderStats .far,&$cardHeaderStats .fal,&$cardHeaderStats .material-icons":
      {
        fontSize: "36px",
        lineHeight: "56px",
        width: "56px",
        height: "56px",
        textAlign: "center",
        overflow: "unset",
        marginBottom: "1px",
      },
    "&$cardHeaderStats$cardHeaderIcon": { textAlign: "right" },
    "&$cardHeaderImage": {
      marginLeft: "15px",
      marginRight: "15px",
      marginTop: "-30px",
      borderRadius: "6px",
    },
    "&$cardHeaderText": { display: "inline-block" },
  },
  cardHeaderPlain: {
    marginLeft: "0px",
    marginRight: "0px",
    "&$cardHeaderImage": { margin: "0 !important" },
  },
  cardHeaderImage: {
    position: "relative",
    padding: "0",
    zIndex: "1",
    "& img": {
      width: "100%",
      borderRadius: "6px",
      pointerEvents: "none",
      boxShadow:
        "0 5px 15px -8px rgba(" +
        hexToRgb(blackColor) +
        ", 0.24), 0 8px 10px -5px rgba(" +
        hexToRgb(blackColor) +
        ", 0.2)",
    },
    "& a": { display: "block" },
  },
  cardHeaderContact: { margin: "0 15px", marginTop: "-20px" },
  cardHeaderSignup: {
    marginLeft: "20px",
    marginRight: "20px",
    marginTop: "-40px",
    padding: "20px 0",
    width: "100%",
    marginBottom: "15px",
  },
  cardHeaderStats: {
    "& $cardHeaderIcon": { textAlign: "right" },
    "& h1,& h2,& h3,& h4,& h5,& h6": { margin: "0 !important" },
  },
  cardHeaderIcon: {
    "&$warningCardHeader,&$successCardHeader,&$dangerCardHeader,&$infoCardHeader,&$primaryCardHeader,&$roseCardHeader":
      {
        background: "transparent",
        boxShadow: "none",
      },
    "& .fab,& .fas,& .far,& .fal,& .material-icons": {
      width: "33px",
      height: "33px",
      textAlign: "center",
      lineHeight: "33px",
    },
    "& svg": {
      width: "24px",
      height: "24px",
      textAlign: "center",
      lineHeight: "33px",
      margin: "5px 4px 0px",
    },
  },
  cardHeaderText: {},
  warningCardHeader: {
    color: whiteColor,
    "&:no($cardHeaderText):no($cardHeaderIcon)": {
      ...warningCardHeader,
    },
  },
  successCardHeader: {
    color: whiteColor,
    "&:no($cardHeaderText):no($cardHeaderIcon)": {
      ...successCardHeader,
    },
  },
  dangerCardHeader: {
    color: whiteColor,
    "&:no($cardHeaderText):no($cardHeaderIcon)": {
      ...dangerCardHeader,
    },
  },
  infoCardHeader: {
    color: whiteColor,
    "&:no($cardHeaderText):no($cardHeaderIcon)": {
      ...infoCardHeader,
    },
  },
  primaryCardHeader: {
    color: whiteColor,
    "&:no($cardHeaderText):no($cardHeaderIcon)": {
      ...primaryCardHeader,
    },
  },
  roseCardHeader: {
    color: whiteColor,
    "&:no($cardHeaderText):no($cardHeaderIcon)": {
      ...roseCardHeader,
    },
  },
};

export default cardHeaderStyle;
