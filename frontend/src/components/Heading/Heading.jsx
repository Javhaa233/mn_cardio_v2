import React from "react";
import PropTypes from "prop-types";

// @mui/material components
import Box from "@mui/material/Box";

import { grayColor } from "assets/jss/material-dashboard-pro-react.js";

export default function Heading(props) {
  const { textAlign, category, title } = props;
  if (title || category) {
    return (
      <Box
        sx={{
          marginBottom: "30px",
          textAlign: textAlign || "left",
          "& h3": {
            marginTop: "10px",
            color: grayColor[2],
            textDecoration: "none",
          },
          "& p": {
            margin: "0 0 10px",
          },
        }}
      >
        {title ? <h3>{title}</h3> : null}
        {category ? <p>{category}</p> : null}
      </Box>
    );
  }
  return null;
}

Heading.propTypes = {
  title: PropTypes.node,
  category: PropTypes.node,
  textAlign: PropTypes.oneOf(["right", "left", "center"]),
};
