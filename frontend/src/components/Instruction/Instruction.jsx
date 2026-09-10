import React from "react";
import PropTypes from "prop-types";

// @mui/material components
import Box from "@mui/material/Box";

// core components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";

export default function Instruction(props) {
  const { title, text, image, className, imageClassName, imageAlt } = props;
  return (
    <Box className={className}>
      <GridContainer>
        <GridItem xs={12} sm={12} md={8}>
          <strong>{title}</strong>
          <p>{text}</p>
        </GridItem>
        <GridItem xs={12} sm={12} md={4}>
          <Box className={imageClassName}>
            <Box
              component="img"
              src={image}
              alt={imageAlt}
              sx={{
                width: "100%",
                height: "auto",
                borderRadius: "6px",
                display: "block",
                maxWidth: "100%",
              }}
            />
          </Box>
        </GridItem>
      </GridContainer>
    </Box>
  );
}

Instruction.defaultProps = {
  imageAlt: "...",
};

Instruction.propTypes = {
  title: PropTypes.node.isRequired,
  text: PropTypes.node.isRequired,
  image: PropTypes.string.isRequired,
  imageAlt: PropTypes.string,
  className: PropTypes.string,
  imageClassName: PropTypes.string,
};
