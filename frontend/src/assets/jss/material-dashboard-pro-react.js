import i18n from "i18n";
import { colors } from "@/theme/colors";
import { layout } from "@/theme/tokens";
/*!

=========================================================
* Material Dashboard PRO React - v1.8.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-pro-react
* Copyright 2019 Creative Tim (https://www.creative-tim.com)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/

// ##############################
// // // Function that converts from hex color to rgb color
// // // Example: input = #9c27b0 => output = 156, 39, 176
// // // Example: input = 9c27b0 => output = 156, 39, 176
// // // Example: input = #999 => output = 153, 153, 153
// // // Example: input = 999 => output = 153, 153, 153
// #############################
const hexToRgb = (input) => {
  input = input + "";
  input = input.replace("#", "");
  let hexRegex = /[0-9A-Fa-f]/g;
  if (!hexRegex.test(input) || (input.length !== 3 && input.length !== 6)) {
    throw new Error("input is not a valid hex color.");
  }
  if (input.length === 3) {
    let first = input[0];
    let second = input[1];
    let last = input[2];
    input = first + first + second + second + last + last;
  }
  input = input.toUpperCase(input);
  let first = input[0] + input[1];
  let second = input[2] + input[3];
  let last = input[4] + input[5];
  return (
    parseInt(first, 16) +
    ", " +
    parseInt(second, 16) +
    ", " +
    parseInt(last, 16)
  );
};

// ##############################
// // // Variables - Styles that are used on more than one component
// #############################

// Re-exported from the design tokens rather than declared here, so the sidebar,
// the two layout shells and this template file cannot drift apart. The literal
// 260/80 now lives once, in `src/theme/tokens.js`. Kept exported under the old
// names because six files already import them from here.
const drawerWidth = layout.drawerWidth;

const drawerMiniWidth = layout.drawerMiniWidth;

const transition = {
  transition: "all 0.33s cubic-bezier(0.685, 0.0473, 0.346, 1)",
};

const containerFluid = {
  paddingRight: "10px",
  paddingLeft: "10px",
  marginRight: "auto",
  marginLeft: "auto",
  "&:before,&:after": {
    display: "table",
    content: '" "',
  },
  "&:after": {
    clear: "both",
  },
};

const container = {
  paddingRight: "15px",
  paddingLeft: "15px",
  marginRight: "auto",
  marginLeft: "auto",
  "@media (min-width: 768px)": {
    width: "750px",
  },
  "@media (min-width: 992px)": {
    width: "970px",
  },
  "@media (min-width: 1200px)": {
    width: "1170px",
  },
  "&:before,&:after": {
    display: "table",
    content: '" "',
  },
  "&:after": {
    clear: "both",
  },
};

const defaultFont = {
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  fontWeight: "300",
  lineHeight: "1.5em",
};

const primaryColor = [
  colors.brand.cyanInk, // [0] was #9c27b0 - base. TEXT and filled-bg, 89 refs.
  colors.brand.cyanDeep, // [1] gradient light stop (primaryCardHeader)
  colors.brand.cyanInk, // [2] gradient dark stop
  colors.brand.cyan, // [3] light accent - NON-TEXT only, 2.69:1 on white
  colors.brand.ink, // [4] darkest step
];
// Phase 11 of the UI consistency program: the remaining template palettes on
// status and brand tokens. Index meanings are kept - [0] is the base (text and
// fills; the only index fed to hexToRgb, so it stays a hex), [1]-[4] gradient
// and hover steps, [5]+ light backgrounds. The template greens, reds, oranges,
// teal and pink no longer reach Card headers, badges, typography helpers,
// snackbars, pagination or checkboxes. [0] is the AA-passing ink of each hue.
const warningColor = [
  colors.status.warningInk, // [0] was #ff9800
  colors.status.warning, // [1]
  colors.status.warningInk, // [2]
  colors.status.warning, // [3]
  colors.status.warningInk, // [4]
  colors.status.warningTint, // [5] was #faf2cc
  colors.status.warningTint, // [6] was #fcf8e3
];
const dangerColor = [
  colors.status.dangerInk, // [0] was #f44336
  colors.status.danger, // [1]
  colors.status.dangerInk, // [2]
  colors.status.danger, // [3]
  colors.status.dangerInk, // [4]
  colors.status.dangerTint, // [5] was #ebcccc
  colors.status.dangerTint, // [6] was #f2dede
];
const successColor = [
  colors.status.successInk, // [0] was #4caf50
  colors.status.success, // [1]
  colors.status.successInk, // [2]
  colors.status.success, // [3]
  colors.status.successInk, // [4]
  colors.status.successTint, // [5] was #d0e9c6
  colors.status.successTint, // [6] was #dff0d8
];
const infoColor = [
  colors.brand.cyanInk, // [0] was #00acc1 (teal)
  colors.brand.cyanDeep, // [1]
  colors.brand.cyanInk, // [2]
  colors.brand.cyan, // [3] non-text only
  colors.brand.cyanInk, // [4]
  colors.brand.tintSolid, // [5] was #c4e3f3
  colors.brand.tintSolid, // [6] was #d9edf7
  colors.brand.cyanInk, // [7] was #3f51b5 (indigo)
];
// "rose" was the template accent pink. The product accent is the brand cyan;
// the brand pink (urgent) is reserved for the one urgent thing on a screen.
const roseColor = [
  colors.brand.cyanInk, // [0] was #e91e63
  colors.brand.cyanDeep, // [1]
  colors.brand.cyanInk, // [2]
  colors.brand.cyan, // [3]
  colors.brand.ink, // [4]
];
const grayColor = [
  colors.brand.inkDim, // [0] was #999 - the workhorse neutral, 56 refs
  "#777",
  colors.brand.ink, // [2] was #3C4858 - the Creative Tim heading navy
  "#AAAAAA",
  "#D2D2D2",
  "#DDD",
  "#555555",
  "#333",
  "#eee",
  "#ccc",
  "#e4e4e4",
  "#E5E5E5",
  "#f9f9f9",
  "#f5f5f5",
  colors.input.text, // [14] #495057 - identical; already named in colors.js
  "#e7e7e7",
  "#212121",
  "#c8c8c8",
  "#505050",
];
const blackColor = "#000";
const whiteColor = colors.brand.surface; // #ffffff - identical to the old "#FFF"
const twitterColor = "#55acee";
const facebookColor = "#3b5998";
const googleColor = "#dd4b39";
const linkedinColor = "#0976b4";
const pinterestColor = "#cc2127";
const youtubeColor = "#e52d27";
const tumblrColor = "#35465c";
const behanceColor = "#1769ff";
const dribbbleColor = "#ea4c89";
const redditColor = "#ff4500";

const boxShadow = {
  boxShadow:
    "0 10px 30px -12px rgba(" +
    hexToRgb(blackColor) +
    ", 0.42), 0 4px 25px 0px rgba(" +
    hexToRgb(blackColor) +
    ", 0.12), 0 8px 10px -5px rgba(" +
    hexToRgb(blackColor) +
    ", 0.2)",
};

const primaryBoxShadow = {
  boxShadow:
    "0 4px 20px 0 rgba(" +
    hexToRgb(blackColor) +
    ",.14), 0 7px 10px -5px rgba(" +
    hexToRgb(primaryColor[0]) +
    ",.4)",
};
const infoBoxShadow = {
  boxShadow:
    "0 4px 20px 0 rgba(" +
    hexToRgb(blackColor) +
    ",.14), 0 7px 10px -5px rgba(" +
    hexToRgb(infoColor[0]) +
    ",.4)",
};
const successBoxShadow = {
  boxShadow:
    "0 4px 20px 0 rgba(" +
    hexToRgb(blackColor) +
    ",.14), 0 7px 10px -5px rgba(" +
    hexToRgb(successColor[0]) +
    ",.4)",
};
const warningBoxShadow = {
  boxShadow:
    "0 4px 20px 0 rgba(" +
    hexToRgb(blackColor) +
    ",.14), 0 7px 10px -5px rgba(" +
    hexToRgb(warningColor[0]) +
    ",.4)",
};
const dangerBoxShadow = {
  boxShadow:
    "0 4px 20px 0 rgba(" +
    hexToRgb(blackColor) +
    ",.14), 0 7px 10px -5px rgba(" +
    hexToRgb(dangerColor[0]) +
    ",.4)",
};
const roseBoxShadow = {
  boxShadow:
    "0 4px 20px 0 rgba(" +
    hexToRgb(blackColor) +
    ",.14), 0 7px 10px -5px rgba(" +
    hexToRgb(roseColor[0]) +
    ",.4)",
};

const warningCardHeader = {
  background:
    "linear-gradient(60deg, " + warningColor[1] + ", " + warningColor[2] + ")",
  ...warningBoxShadow,
};
const successCardHeader = {
  background:
    "linear-gradient(60deg, " + successColor[1] + ", " + successColor[2] + ")",
  ...successBoxShadow,
};
const dangerCardHeader = {
  background:
    "linear-gradient(60deg, " + dangerColor[3] + ", " + dangerColor[4] + ")",
  ...dangerBoxShadow,
};
const infoCardHeader = {
  background:
    "linear-gradient(60deg, " + infoColor[1] + ", " + infoColor[2] + ")",
  ...infoBoxShadow,
};
const primaryCardHeader = {
  background:
    "linear-gradient(60deg, " + primaryColor[1] + ", " + primaryColor[2] + ")",
  ...primaryBoxShadow,
};
const roseCardHeader = {
  background:
    "linear-gradient(60deg, " + roseColor[3] + ", " + roseColor[4] + ")",
  ...roseBoxShadow,
};

const card = {
  display: "inline-block",
  position: "relative",
  width: "100%",
  margin: "25px 0",
  boxShadow: "0 1px 4px 0 rgba(" + hexToRgb(blackColor) + ", 0.14)",
  borderRadius: "6px",
  color: "rgba(" + hexToRgb(blackColor) + ", 0.87)",
  background: whiteColor,
};

const cardActions = {
  margin: "0 20px 10px",
  paddingTop: "10px",
  borderTop: "1px solid " + grayColor[8],
  height: "auto",
  ...defaultFont,
};

const cardHeader = {
  margin: "-20px 15px 0",
  borderRadius: "3px",
  padding: "15px",
};

const defaultBoxShadow = {
  border: "0",
  borderRadius: "3px",
  boxShadow:
    "0 10px 20px -12px rgba(" +
    hexToRgb(blackColor) +
    ", 0.42), 0 3px 20px 0px rgba(" +
    hexToRgb(blackColor) +
    ", 0.12), 0 8px 10px -5px rgba(" +
    hexToRgb(blackColor) +
    ", 0.2)",
  padding: "10px 0",
  transition: "all 150ms ease 0s",
};

const tooltip = {
  padding: "10px 15px",
  minWidth: "130px",
  color: whiteColor,
  lineHeight: "1.7em",
  background: "rgba(" + hexToRgb(grayColor[6]) + ",0.9)",
  border: "none",
  borderRadius: "3px",
  opacity: "1!important",
  boxShadow:
    "0 8px 10px 1px rgba(" +
    hexToRgb(blackColor) +
    ", 0.14), 0 3px 14px 2px rgba(" +
    hexToRgb(blackColor) +
    ", 0.12), 0 5px 5px -3px rgba(" +
    hexToRgb(blackColor) +
    ", 0.2)",
  maxWidth: "200px",
  textAlign: "center",
  fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif',
  fontSize: "12px",
  fontStyle: "normal",
  fontWeight: "400",
  textShadow: "none",
  textTransform: "none",
  letterSpacing: "normal",
  wordBreak: "normal",
  wordSpacing: "normal",
  wordWrap: "normal",
  whiteSpace: "normal",
  lineBreak: "auto",
};

const title = {
  color: grayColor[2],
  textDecoration: "none",
  fontWeight: "300",
  marginTop: "30px",
  marginBottom: "25px",
  minHeight: "32px",
  fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
  "& small": {
    color: grayColor[1],
    fontSize: "65%",
    fontWeight: "400",
    lineHeight: "1",
  },
};

const cardTitle = {
  ...title,
  marginTop: "0",
  marginBottom: "3px",
  minHeight: "auto",
  "& a": {
    ...title,
    marginTop: ".625rem",
    marginBottom: "0.75rem",
    minHeight: "auto",
  },
};

const cardSubtitle = {
  marginTop: "-.375rem",
};

const cardLink = {
  "& + $cardLink": {
    marginLeft: "1.25rem",
  },
};

export {
  hexToRgb,
  //variables
  drawerWidth,
  drawerMiniWidth,
  transition,
  container,
  containerFluid,
  boxShadow,
  card,
  defaultFont,
  primaryColor,
  warningColor,
  dangerColor,
  successColor,
  infoColor,
  roseColor,
  grayColor,
  blackColor,
  whiteColor,
  twitterColor,
  facebookColor,
  googleColor,
  linkedinColor,
  pinterestColor,
  youtubeColor,
  tumblrColor,
  behanceColor,
  dribbbleColor,
  redditColor,
  primaryBoxShadow,
  infoBoxShadow,
  successBoxShadow,
  warningBoxShadow,
  dangerBoxShadow,
  roseBoxShadow,
  warningCardHeader,
  successCardHeader,
  dangerCardHeader,
  infoCardHeader,
  primaryCardHeader,
  roseCardHeader,
  cardActions,
  cardHeader,
  defaultBoxShadow,
  tooltip,
  title,
  cardTitle,
  cardSubtitle,
  cardLink,
};
