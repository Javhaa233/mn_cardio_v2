/*eslint-disable*/
import React from "react";
import PropTypes from "prop-types";
import { styled } from "@mui/material/styles";
import {
  defaultFont,
  container,
  containerFluid,
  primaryColor,
  whiteColor,
  grayColor
} from "assets/jss/material-dashboard-pro-react.js";

const FooterWrapper = styled("footer")({
  bottom: "0",
  borderTop: "1px solid " + grayColor[15],
  padding: "15px 0",
  ...defaultFont,
  zIndex: 4
});

const Container = styled("div", {
  shouldForwardProp: (prop) => prop !== "fluid"
})(({ fluid }) => ({
  zIndex: 3,
  ...(fluid ? containerFluid : container),
  position: "relative"
}));

const Right = styled("p")({
  margin: "0",
  fontSize: "14px",
  float: "right !important",
  padding: "15px"
});

const Left = styled("div")({
  float: "left !important",
  display: "block"
});

const Anchor = styled("a", {
  shouldForwardProp: (prop) => prop !== "white"
})(({ white }) => ({
  color: primaryColor[0],
  textDecoration: "none",
  backgroundColor: "transparent",
  ...(white && {
    "&,&:hover,&:focus": { color: whiteColor }
  })
}));

export default function Footer(props) {
  const { fluid, white } = props;

  return (
    <FooterWrapper>
      <Container fluid={fluid}>
        <Left />
        <Right>
          &copy; {1900 + new Date().getYear()}{" "}
          <Anchor href="https://www.itsystem.mn" target="_blank" white={white}>
            {"IT System LLC"}
          </Anchor>
        </Right>
      </Container>
    </FooterWrapper>
  );
}

Footer.propTypes = {
  fluid: PropTypes.bool,
  white: PropTypes.bool,
};
