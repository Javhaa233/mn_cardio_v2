import React from "react";
import PropTypes from "prop-types";
import { styled } from "@mui/material/styles";
import { grayColor } from "assets/jss/material-dashboard-pro-react.js";

const StyledCardFooter = styled("div", {
  shouldForwardProp: (prop) =>
    ![
      "plain",
      "profile",
      "pricing",
      "testimonial",
      "stats",
      "chart",
      "product",
    ].includes(prop),
})(
  ({ theme, plain, profile, pricing, testimonial, stats, chart, product }) => ({
    padding: "0",
    paddingTop: "12px",
    margin: "0 1.5rem 1rem",
    borderRadius: "0",
    justifyContent: "space-between",
    alignItems: "center",
    display: "flex",
    backgroundColor: "transparent",
    border: "0",
    transition: "all 0.2s ease-in-out",
    ...(plain && {
      paddingLeft: "5px",
      paddingRight: "5px",
      backgroundColor: "transparent",
    }),
    ...((profile || testimonial) && { marginTop: "-15px" }),
    ...(pricing && { zIndex: "2" }),
    ...(testimonial && { display: "block" }),
    ...(stats && {
      borderTop: "1px solid #e2e8f0",
      marginTop: "16px",
      paddingTop: "16px",
      "& svg": {
        position: "relative",
        top: "3px",
        marginRight: "6px",
        marginLeft: "3px",
        width: "16px",
        height: "16px",
        color: "#64748b",
        transition: "color 0.2s ease",
      },
      "& .fab,& .fas,& .far,& .fal,& .material-icons": {
        position: "relative",
        top: "3px",
        marginRight: "6px",
        marginLeft: "3px",
        fontSize: "16px",
        lineHeight: "16px",
        color: "#64748b",
      },
      "&:hover svg": {
        color: "#475569",
      },
    }),
    ...((chart || product) && { borderTop: "1px solid #e2e8f0" }),
  }),
);

function CardFooter(props) {
  const {
    className,
    children,
    plain,
    profile,
    pricing,
    testimonial,
    stats,
    chart,
    product,
    ...rest
  } = props;

  return (
    <StyledCardFooter
      className={className}
      plain={plain}
      profile={profile}
      pricing={pricing}
      testimonial={testimonial}
      stats={stats}
      chart={chart}
      product={product}
      {...rest}
    >
      {children}
    </StyledCardFooter>
  );
}

CardFooter.propTypes = {
  className: PropTypes.string,
  plain: PropTypes.bool,
  profile: PropTypes.bool,
  pricing: PropTypes.bool,
  testimonial: PropTypes.bool,
  stats: PropTypes.bool,
  chart: PropTypes.bool,
  product: PropTypes.bool,
  children: PropTypes.node,
};

export default CardFooter;
