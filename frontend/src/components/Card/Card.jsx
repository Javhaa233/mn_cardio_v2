import React from "react";
import PropTypes from "prop-types";
import { styled } from "@mui/material/styles";

import {
  primaryColor,
  infoColor,
  successColor,
  dangerColor,
  warningColor,
  roseColor,
  whiteColor,
  blackColor,
  grayColor,
  hexToRgb,
} from "assets/jss/material-dashboard-pro-react.js";

const StyledCard = styled("div", {
  shouldForwardProp: (prop) =>
    ![
      "plain",
      "profile",
      "blog",
      "raised",
      "background",
      "pricing",
      "color",
      "product",
      "testimonial",
      "chart",
      "login",
    ].includes(prop),
})(({
  theme,
  plain,
  profile,
  blog,
  raised,
  background,
  pricing,
  color,
  product,
  testimonial,
  chart,
  login,
}) => {
  const cardColors = {
    primary: {
      background:
        "linear-gradient(60deg," +
        primaryColor[1] +
        "," +
        primaryColor[4] +
        ")",
      "& h1 small": { color: "rgba(" + hexToRgb(whiteColor) + ", 0.8)" },
      color: whiteColor,
    },
    info: {
      background:
        "linear-gradient(60deg," + infoColor[1] + "," + infoColor[4] + ")",
      "& h1 small": { color: "rgba(" + hexToRgb(whiteColor) + ", 0.8)" },
      color: whiteColor,
    },
    success: {
      background:
        "linear-gradient(60deg," +
        successColor[1] +
        "," +
        successColor[4] +
        ")",
      "& h1 small": { color: "rgba(" + hexToRgb(whiteColor) + ", 0.8)" },
      color: whiteColor,
    },
    warning: {
      background:
        "linear-gradient(60deg," +
        warningColor[1] +
        "," +
        warningColor[4] +
        ")",
      "& h1 small": { color: "rgba(" + hexToRgb(whiteColor) + ", 0.8)" },
      color: whiteColor,
    },
    danger: {
      background:
        "linear-gradient(60deg," + dangerColor[1] + "," + dangerColor[4] + ")",
      "& h1 small": { color: "rgba(" + hexToRgb(whiteColor) + ", 0.8)" },
      color: whiteColor,
    },
    rose: {
      background:
        "linear-gradient(60deg," + roseColor[1] + "," + roseColor[4] + ")",
      "& h1 small": { color: "rgba(" + hexToRgb(whiteColor) + ", 0.8)" },
      color: whiteColor,
    },
  };

  return {
    border: "1px solid #e2e8f0",
    marginBottom: "30px",
    marginTop: "30px",
    borderRadius: "16px",
    color: "rgba(" + hexToRgb(blackColor) + ", 0.87)",
    background: "linear-gradient(180deg, #ffffff 0%, #fafbfc 100%)",
    width: "100%",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.06)",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    minWidth: "0",
    wordWrap: "break-word",
    fontSize: ".875rem",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      boxShadow:
        "0 8px 24px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.08)",
      transform: "translateY(-2px)",
    },
    ...(plain && {
      background: "transparent",
      boxShadow: "none",
      border: "none",
      "&:hover": { transform: "none", boxShadow: "none" },
    }),
    ...((profile || testimonial) && {
      marginTop: "30px",
      textAlign: "center",
    }),
    ...(blog && { marginTop: "60px" }),
    ...(raised && {
      boxShadow:
        "0 20px 40px -12px rgba(0, 0, 0, 0.15), 0 8px 20px -8px rgba(0, 0, 0, 0.1)",
      "&:hover": {
        boxShadow:
          "0 25px 50px -12px rgba(0, 0, 0, 0.2), 0 12px 24px -8px rgba(0, 0, 0, 0.12)",
        transform: "translateY(-4px)",
      },
    }),
    ...(background && {
      backgroundPosition: "center center",
      backgroundSize: "cover",
      textAlign: "center",
      overflow: "hidden",
      "&:after": {
        position: "absolute",
        zIndex: "1",
        width: "100%",
        height: "100%",
        display: "block",
        left: "0",
        top: "0",
        content: '""',
        background:
          "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)",
        borderRadius: "16px",
      },
      "& small": {
        color: "rgba(" + hexToRgb(whiteColor) + ", 0.7) !important",
      },
    }),
    ...(product && { marginTop: "30px" }),
    ...(chart && { "& p": { marginTop: "0px", paddingTop: "0px" } }),
    ...(login && {
      transform: "translate3d(0, 0, 0)",
      transition: "all 300ms ease-in-out",
      backdropFilter: "blur(10px)",
      background: "rgba(255, 255, 255, 0.95)",
    }),
    ...(color && cardColors[color]),
    ...(pricing && {
      textAlign: "center",
      "&:after": {
        backgroundColor: "rgba(" + hexToRgb(blackColor) + ", 0.7) !important",
      },
      "& ul": {
        listStyle: "none",
        padding: 0,
        maxWidth: "240px",
        margin: "10px auto",
      },
      "& ul li": {
        color: grayColor[0],
        textAlign: "center",
        padding: "12px 0px",
        borderBottom: "1px solid rgba(" + hexToRgb(grayColor[0]) + ",0.3)",
      },
      "& ul li:last-child": { border: 0 },
      "& ul li b": { color: grayColor[2] },
      "& h1": { marginTop: "30px" },
      "& h1 small": {
        display: "inline-flex",
        height: 0,
        fontSize: "18px",
      },
      "& h1 small:first-of-type": {
        position: "relative",
        top: "-17px",
        fontSize: "26px",
      },
      "& ul li svg, & ul li .fab,& ul li .fas,& ul li .far,& ul li .fal,& ul li .material-icons":
        {
          position: "relative",
          top: "7px",
        },
      ...(color &&
        pricing &&
        color && {
          "& ul li": {
            color: whiteColor,
            borderColor: "rgba(" + hexToRgb(whiteColor) + ",0.3)",
            "& b, & svg,& .fab,& .fas,& .far,& .fal,& .material-icons": {
              color: whiteColor,
              fontWeight: "700",
            },
          },
        }),
      ...(background &&
        pricing &&
        background && {
          "& ul li": {
            color: whiteColor,
            borderColor: "rgba(" + hexToRgb(whiteColor) + ",0.3)",
            "& b, & svg,& .fab,& .fas,& .far,& .fal,& .material-icons": {
              color: whiteColor,
              fontWeight: "700",
            },
          },
        }),
    }),
  };
});

function Card(props) {
  const {
    className,
    children,
    plain,
    profile,
    blog,
    raised,
    background,
    pricing,
    color,
    product,
    testimonial,
    chart,
    login,
    ...rest
  } = props;

  return (
    <StyledCard
      className={className}
      plain={plain}
      profile={profile}
      blog={blog}
      raised={raised}
      background={background}
      pricing={pricing}
      color={color}
      product={product}
      testimonial={testimonial}
      chart={chart}
      login={login}
      {...rest}
    >
      {children}
    </StyledCard>
  );
}

Card.propTypes = {
  className: PropTypes.string,
  plain: PropTypes.bool,
  profile: PropTypes.bool,
  blog: PropTypes.bool,
  raised: PropTypes.bool,
  background: PropTypes.bool,
  pricing: PropTypes.bool,
  testimonial: PropTypes.bool,
  color: PropTypes.oneOf([
    "primary",
    "info",
    "success",
    "warning",
    "danger",
    "rose",
  ]),
  product: PropTypes.bool,
  chart: PropTypes.bool,
  login: PropTypes.bool,
  children: PropTypes.node,
};

export default Card;
