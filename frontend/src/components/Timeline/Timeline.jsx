```javascript
import React from "react";
import PropTypes from "prop-types";
import { styled } from "@mui/material/styles";

// core components
import Badge from "components/Badge/Badge.jsx";

import {
  infoColor,
  primaryColor,
  successColor,
  dangerColor,
  warningColor,
  whiteColor,
  blackColor,
  grayColor,
  hexToRgb
} from "assets/jss/material-dashboard-pro-react.js";

const TimelineContainer = styled("ul", {
  shouldForwardProp: (prop) => prop !== "simple"
})(({ theme, simple }) => ({
  listStyle: "none",
  padding: "20px 0 20px",
  position: "relative",
  marginTop: "30px",
  [theme.breakpoints.down("sm")]: {
    "&:before": { left: "5% !important" }
  },
  "&:before": {
    top: "50px",
    bottom: "0",
    position: "absolute",
    content: '" "',
    width: "3px",
    backgroundColor: grayColor[11],
    left: "50%",
    marginLeft: "-1px",
    ...(simple && { left: "5%" })
  },
  ...(simple && {
    marginTop: "30px",
    padding: "0 0 20px",
  })
}));

const TimelineItem = styled("li")({
  marginBottom: "20px",
  position: "relative",
  "&:before,&:after": { content: '" "', display: "table" },
  "&:after": { clear: "both" }
});

const TimelineBadge = styled("div", {
  shouldForwardProp: (prop) => prop !== "color" && prop !== "simple"
})(({ theme, color, simple }) => {
  const colors = {
    info: {
      backgroundColor: infoColor[0],
      boxShadow:
        "0 4px 20px 0px rgba(" +
        hexToRgb(blackColor) +
        ", 0.14), 0 7px 10px -5px rgba(" +
        hexToRgb(infoColor[0]) +
        ", 0.4)"
    },
    success: {
      backgroundColor: successColor[0],
      boxShadow:
        "0 4px 20px 0px rgba(" +
        hexToRgb(blackColor) +
        ", 0.14), 0 7px 10px -5px rgba(" +
        hexToRgb(successColor[0]) +
        ", 0.4)"
    },
    danger: {
      backgroundColor: dangerColor[0],
      boxShadow:
        "0 4px 20px 0px rgba(" +
        hexToRgb(blackColor) +
        ", 0.14), 0 7px 10px -5px rgba(" +
        hexToRgb(dangerColor[0]) +
        ", 0.4)"
    },
    warning: {
      backgroundColor: warningColor[0],
      boxShadow:
        "0 4px 20px 0px rgba(" +
        hexToRgb(blackColor) +
        ", 0.14), 0 7px 10px -5px rgba(" +
        hexToRgb(warningColor[0]) +
        ", 0.4)"
    },
    primary: {
      backgroundColor: primaryColor[0],
      boxShadow:
        "0 4px 20px 0px rgba(" +
        hexToRgb(blackColor) +
        ", 0.14), 0 7px 10px -5px rgba(" +
        hexToRgb(primaryColor[0]) +
        ", 0.4)"
    }
  };

  return {
    color: whiteColor,
    width: "50px",
    height: "50px",
    lineHeight: "51px",
    fontSize: "1.4em",
    textAlign: "center",
    position: "absolute",
    top: "16px",
    left: "50%",
    marginLeft: "-24px",
    zIndex: "100",
    borderTopRightRadius: "50%",
    borderTopLeftRadius: "50%",
    borderBottomRightRadius: "50%",
    borderBottomLeftRadius: "50%",
    [theme.breakpoints.down("sm")]: { left: "5% !important" },
    ...(simple && { left: "5%" }),
    ...(colors[color] || {})
  };
});

const BadgeIcon = styled("div")({
  width: "24px",
  height: "51px"
});

const TimelinePanel = styled("div", {
  shouldForwardProp: (prop) => prop !== "inverted" && prop !== "simple"
})(({ theme, inverted, simple }) => ({
  width: "45%",
  float: "left",
  padding: "20px",
  marginBottom: "20px",
  position: "relative",
  boxShadow: "0 1px 4px 0 rgba(" + hexToRgb(blackColor) + ", 0.14)",
  borderRadius: "6px",
  color: "rgba(" + hexToRgb(blackColor) + ", 0.87)",
  background: whiteColor,
  "&:before": {
    position: "absolute",
    top: "26px",
    right: "-15px",
    display: "inline-block",
    borderTop: "15px solid transparent",
    borderLeft: "15px solid " + grayColor[10],
    borderRight: "0 solid " + grayColor[10],
    borderBottom: "15px solid transparent",
    content: '" "'
  },
  "&:after": {
    position: "absolute",
    top: "27px",
    right: "-14px",
    display: "inline-block",
    borderTop: "14px solid transparent",
    borderLeft: "14px solid " + whiteColor,
    borderRight: "0 solid " + whiteColor,
    borderBottom: "14px solid transparent",
    content: '" "'
  },
  [theme.breakpoints.down("sm")]: {
    float: "right !important",
    width: "86% !important",
    "&:before": {
      borderLeftWidth: "0 !important",
      borderRightWidth: "15px !important",
      left: "-15px !important",
      right: "auto !important"
    },
    "&:after": {
      borderLeftWidth: "0 !important",
      borderRightWidth: "14px !important",
      left: "-14px !important",
      right: "auto !important"
    }
  },
  ...(simple && { width: "86%" }),
  ...((inverted || simple) && {
    [theme.breakpoints.up("sm")]: {
      float: "right",
      backgroundColor: whiteColor,
      "&:before": {
        borderLeftWidth: "0",
        borderRightWidth: "15px",
        left: "-15px",
        right: "auto"
      },
      "&:after": {
        borderLeftWidth: "0",
        borderRightWidth: "14px",
        left: "-14px",
        right: "auto"
      }
    }
  })
}));

const TimelineHeading = styled("div")({
  marginBottom: "15px"
});

const TimelineBody = styled("div")({
  fontSize: "14px",
  lineHeight: "21px"
});

const TimelineFooter = styled("div")({
  zIndex: "1000",
  position: "relative",
  float: "left"
});

const FooterTitle = styled("h6")({
  color: grayColor[7],
  fontWeight: "400",
  margin: "10px 0px 0px"
});

const FooterLine = styled("hr")({
  marginTop: "10px",
  marginBottom: "5px"
});

export default function Timeline(props) {
  const { stories, simple } = props;
  return (
    <TimelineContainer simple={simple}>
      {stories.map((prop, key) => {
        return (
          <TimelineItem key={key}>
            {prop.badgeIcon ? (
              <TimelineBadge color={prop.badgeColor} simple={simple}>
                <prop.badgeIcon style={{ width: "24px", height: "51px" }} />
              </TimelineBadge>
            ) : null}
            <TimelinePanel inverted={prop.inverted} simple={simple}>
              {prop.title ? (
                <TimelineHeading>
                  <Badge color={prop.titleColor}>{prop.title}</Badge>
                </TimelineHeading>
              ) : null}
              <TimelineBody>{prop.body}</TimelineBody>
              {prop.footerTitle ? (
                <FooterTitle>{prop.footerTitle}</FooterTitle>
              ) : null}
              {prop.footer ? <FooterLine /> : null}
              {prop.footer ? (
                <TimelineFooter>{prop.footer}</TimelineFooter>
              ) : null}
            </TimelinePanel>
          </TimelineItem>
        );
      })}
    </TimelineContainer>
  );
}

Timeline.propTypes = {
  stories: PropTypes.arrayOf(PropTypes.object).isRequired,
  simple: PropTypes.bool
};
```;
