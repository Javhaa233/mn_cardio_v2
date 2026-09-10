import React from "react";
import PropTypes from "prop-types";
import { styled } from "@mui/material/styles";

import {
  defaultFont,
  grayColor,
} from "assets/jss/material-dashboard-pro-react.js";

const BlockQuote = styled("blockquote")({
  ...defaultFont,
  fontSize: "14px",
  padding: "10px 20px",
  margin: "0 0 20px",
  borderLeft: "5px solid " + grayColor[8],
});

const QuoteText = styled("p")({
  margin: "0 0 10px",
  fontStyle: "italic",
  fontSize: "17.5px",
});

const QuoteAuthor = styled("small")({
  display: "block",
  fontSize: "80%",
  lineHeight: "1.42857143",
  color: grayColor[1],
});

export default function Quote(props) {
  const { text, author } = props;
  return (
    <BlockQuote>
      <QuoteText>{text}</QuoteText>
      <QuoteAuthor>{author}</QuoteAuthor>
    </BlockQuote>
  );
}

Quote.propTypes = {
  text: PropTypes.node,
  author: PropTypes.node,
};
