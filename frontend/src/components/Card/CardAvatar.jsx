import React from "react";
import PropTypes from "prop-types";
import { styled } from "@mui/material/styles";

import {
  blackColor,
  hexToRgb,
} from "assets/jss/material-dashboard-pro-react.js";

const StyledCardAvatar = styled("div", {
  shouldForwardProp: (prop) =>
    !["plain", "profile", "testimonial", "testimonialFooter"].includes(prop),
})(({ theme, plain, profile, testimonial, testimonialFooter }) => ({
  "& img": {
    width: "100%",
    height: "auto",
    transition: "transform 0.3s ease",
    objectFit: "cover",
  },
  "&:hover img": {
    transform: "scale(1.05)",
  },
  ...((profile || testimonial) && {
    maxWidth: "130px",
    maxHeight: "130px",
    margin: "-50px auto 0",
    borderRadius: "50%",
    overflow: "hidden",
    padding: "0",
    border: "4px solid #ffffff",
    boxShadow:
      "0 8px 24px -4px rgba(0, 0, 0, 0.12), 0 4px 8px -2px rgba(0, 0, 0, 0.08)",
    transition: "all 0.3s ease",
    "&:hover": {
      boxShadow:
        "0 12px 32px -4px rgba(0, 0, 0, 0.16), 0 6px 12px -2px rgba(0, 0, 0, 0.1)",
      transform: "translateY(-2px)",
    },
    ...(plain && { marginTop: "0" }),
  }),
  ...(testimonial && {
    margin: "-50px auto 0",
    maxWidth: "100px",
    maxHeight: "100px",
    borderRadius: "50%",
    overflow: "hidden",
    padding: "0",
    border: "3px solid #ffffff",
    boxShadow:
      "0 8px 24px -4px rgba(0, 0, 0, 0.12), 0 4px 8px -2px rgba(0, 0, 0, 0.08)",
    transition: "all 0.3s ease",
    "&:hover": {
      boxShadow:
        "0 12px 32px -4px rgba(0, 0, 0, 0.16), 0 6px 12px -2px rgba(0, 0, 0, 0.1)",
      transform: "translateY(-2px)",
    },
    ...(plain && { marginTop: "0" }),
  }),
  ...(testimonialFooter && { marginBottom: "-50px", marginTop: "10px" }),
}));

function CardAvatar(props) {
  const {
    children,
    className,
    plain,
    profile,
    testimonial,
    testimonialFooter,
    ...rest
  } = props;

  return (
    <StyledCardAvatar
      className={className}
      plain={plain}
      profile={profile}
      testimonial={testimonial}
      testimonialFooter={testimonialFooter}
      {...rest}
    >
      {children}
    </StyledCardAvatar>
  );
}

CardAvatar.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  profile: PropTypes.bool,
  plain: PropTypes.bool,
  testimonial: PropTypes.bool,
  testimonialFooter: PropTypes.bool,
};

export default CardAvatar;
