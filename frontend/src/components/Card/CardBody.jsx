import React from "react";
import PropTypes from "prop-types";
import { styled } from "@mui/material/styles";

import {
  whiteColor,
  hexToRgb,
} from "assets/jss/material-dashboard-pro-react.js";

const StyledCardBody = styled("div", {
  shouldForwardProp: (prop) =>
    ![
      "background",
      "plain",
      "formHorizontal",
      "pricing",
      "signup",
      "color",
      "profile",
      "calendar",
    ].includes(prop),
})(
  ({
    theme,
    background,
    plain,
    formHorizontal,
    pricing,
    signup,
    color,
    profile,
    calendar,
  }) => ({
    padding: "16px 10px 10px 10px",
    // ---------------------------------------------------
    // ADDED: Set background color here
    // You can use "lightblue", a Hex code like "#E1F5FE",
    // or theme.palette.info.light if available.transparent
    backgroundColor: "white",
    // ---------------------------------------------------
    flex: "1 1 auto",
    minHeight: 0,
    maxWidth: "100%",
    display: "flex",
    flexDirection: "column",
    WebkitBoxFlex: "1",
    position: "relative",
    transition: "all 0.2s ease-in-out",
    borderRadius: "16px", // Match Card's border-radius for all corners
    ...(background && {
      position: "relative",
      zIndex: "2",
      minHeight: "280px",
      paddingTop: "40px",
      paddingBottom: "40px",
      maxWidth: "440px",
      margin: "0 auto",
    }),
    ...(plain && { paddingLeft: "8px", paddingRight: "8px" }),
    ...(formHorizontal && {
      paddingLeft: "15px",
      paddingRight: "15px",
      "& form": { margin: "0" },
    }),
    ...(pricing && { padding: "15px !important", margin: "0px !important" }),
    ...(signup && { padding: "0px 30px 0px 30px" }),
    ...(color && {
      borderRadius: "12px",
      "& h1,& h2,& h3": {
        "& small": { color: "rgba(" + hexToRgb(whiteColor) + ", 0.8)" },
      },
    }),
    ...(profile && { marginTop: "15px" }),
    ...(calendar && { padding: "0px !important" }),
  }),
);

function CardBody(props) {
  const {
    className,
    children,
    background,
    plain,
    formHorizontal,
    pricing,
    signup,
    color,
    profile,
    calendar,
    ...rest
  } = props;

  return (
    <StyledCardBody
      className={className}
      background={background}
      plain={plain}
      formHorizontal={formHorizontal}
      pricing={pricing}
      signup={signup}
      color={color}
      profile={profile}
      calendar={calendar}
      {...rest}
    >
      {children}
    </StyledCardBody>
  );
}

CardBody.propTypes = {
  className: PropTypes.string,
  background: PropTypes.bool,
  plain: PropTypes.bool,
  formHorizontal: PropTypes.bool,
  pricing: PropTypes.bool,
  signup: PropTypes.bool,
  color: PropTypes.bool,
  profile: PropTypes.bool,
  calendar: PropTypes.bool,
  children: PropTypes.node,
};

export default CardBody;
