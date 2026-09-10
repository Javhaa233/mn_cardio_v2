import React from "react";
import PropTypes from "prop-types";
import { styled } from "@mui/material/styles";

import {
  primaryColor,
  warningColor,
  dangerColor,
  successColor,
  infoColor,
  roseColor,
  grayColor,
} from "assets/jss/material-dashboard-pro-react.js";

const InfoAreaWrapper = styled("div")({
  maxWidth: "360px",
  margin: "0 auto",
  padding: "0px",
});

const IconWrapper = styled("div", {
  shouldForwardProp: (prop) => !["iconColor"].includes(prop),
})(({ theme, iconColor }) => {
  const colorStyles = {
    primary: { color: primaryColor[0] },
    warning: { color: warningColor[0] },
    danger: { color: dangerColor[0] },
    success: { color: successColor[0] },
    info: { color: infoColor[0] },
    rose: { color: roseColor[0] },
    gray: { color: grayColor[0] },
  };

  return {
    float: "left",
    marginTop: "24px",
    marginRight: "10px",
    ...(iconColor && colorStyles[iconColor]),
  };
});

const IconStyled = styled("div")({
  width: "36px",
  height: "36px",
});

const DescriptionWrapper = styled("div")({
  color: grayColor[0],
  overflow: "hidden",
});

const Title = styled("h4")({
  color: grayColor[2],
  margin: "30px 0 15px",
  textDecoration: "none",
  fontSize: "18px",
});

const Description = styled("p")({
  color: grayColor[0],
  overflow: "hidden",
  marginTop: "0px",
  fontSize: "14px",
});

export default function InfoArea(props) {
  const { title, description, iconColor, icon: Icon } = props;

  return (
    <InfoAreaWrapper>
      <IconWrapper iconColor={iconColor}>
        <IconStyled as={Icon} />
      </IconWrapper>
      <DescriptionWrapper>
        <Title>{title}</Title>
        <Description>{description}</Description>
      </DescriptionWrapper>
    </InfoAreaWrapper>
  );
}

InfoArea.defaultProps = { iconColor: "gray" };

InfoArea.propTypes = {
  icon: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  iconColor: PropTypes.oneOf([
    "primary",
    "warning",
    "danger",
    "success",
    "info",
    "rose",
    "gray",
  ]),
};
