import React from "react";
import cx from "classnames";
import PropTypes from "prop-types";

// @mui/material components
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import { TableRow, TableFooter } from "@mui/material";

import {
  warningColor,
  primaryColor,
  dangerColor,
  successColor,
  infoColor,
  roseColor,
  grayColor,
  blackColor,
  defaultFont,
  hexToRgb,
} from "assets/jss/material-dashboard-pro-react.js";

const StyledTableWrapper = styled("div")({
  overflowX: "auto", // Allow horizontal scrolling when needed but handle it gracefully
  width: "100%",
  display: "block",
});

const StyledTable = styled(Table)({
  marginBottom: "0",
  width: "100%",
  maxWidth: "100%",
  backgroundColor: "transparent",
  borderSpacing: "0",
  borderCollapse: "collapse",
  tableLayout: "auto", // Allow table to adjust to content
  overflow: "visible", // Remove auto overflow, let content determine behavior
});

const StyledTableHead = styled(TableHead, {
  shouldForwardProp: (prop) => prop !== "tableHeaderColor",
})(({ tableHeaderColor }) => {
  const colorMap = {
    warning: warningColor[0],
    primary: primaryColor[0],
    danger: dangerColor[0],
    success: successColor[0],
    info: infoColor[0],
    rose: roseColor[0],
    gray: grayColor[0],
  };

  return {
    color: colorMap[tableHeaderColor] || grayColor[0],
  };
});

const StyledTableRow = styled(TableRow, {
  shouldForwardProp: (prop) =>
    !["isHead", "isBody", "hover", "striped", "rowColor"].includes(prop),
})(({ isHead, isBody, hover, striped, rowColor }) => ({
  ...(isHead && { height: "56px" }),
  ...(isBody && { height: "48px" }),
  ...(hover && {
    "&:hover": {
      backgroundColor: grayColor[13],
    },
  }),
  ...(striped && {
    backgroundColor: grayColor[12],
  }),
  ...(rowColor === "warning" && {
    backgroundColor: warningColor[6],
    "&:hover": {
      backgroundColor: warningColor[5],
    },
  }),
  ...(rowColor === "danger" && {
    backgroundColor: dangerColor[6],
    "&:hover": {
      backgroundColor: dangerColor[5],
    },
  }),
  ...(rowColor === "success" && {
    backgroundColor: successColor[6],
    "&:hover": {
      backgroundColor: successColor[5],
    },
  }),
  ...(rowColor === "info" && {
    backgroundColor: infoColor[6],
    "&:hover": {
      backgroundColor: infoColor[5],
    },
  }),
}));

const StyledTableCell = styled(TableCell, {
  shouldForwardProp: (prop) =>
    ![
      "isHead",
      "tableShopping",
      "isTotal",
      "isAmount",
      "isRight",
      "cellColor",
    ].includes(prop),
})(({
  theme,
  isHead,
  tableShopping,
  isTotal,
  isAmount,
  isRight,
  cellColor,
}) => {
  const colorMap = {
    warning: warningColor[0],
    primary: primaryColor[0],
    danger: dangerColor[0],
    success: successColor[0],
    info: infoColor[0],
    rose: roseColor[0],
    gray: grayColor[0],
  };

  return {
    ...defaultFont,
    lineHeight: "1.42857143",
    padding: "12px 8px!important",
    verticalAlign: "middle",
    fontSize: "1em",
    borderBottom: "none",
    borderTop: "1px solid " + grayColor[5],
    position: "relative",
    whiteSpace: "nowrap", // Prevent text wrapping in cells
    [theme.breakpoints.down("sm")]: {
      minHeight: "24px",
      minWidth: "32px",
      whiteSpace: "normal", // Allow wrapping on small screens
    },
    ...(isHead && {
      color: "rgba(" + hexToRgb(blackColor) + ", 0.87)",
      border: "none !important",
    }),
    ...(tableShopping && {
      fontSize: "0.9em !important",
      textTransform: "uppercase !important",
    }),
    ...(!tableShopping &&
      isHead && {
        fontSize: "1.25em !important",
      }),
    ...(isTotal && {
      fontWeight: "500",
      fontSize: "1.25em",
      paddingTop: "14px",
      textAlign: "right",
    }),
    ...(isAmount && {
      fontSize: "26px",
      fontWeight: "300",
      marginTop: "5px",
      textAlign: "right",
    }),
    ...(isRight && {
      textAlign: "right",
    }),
    ...(cellColor && {
      color: colorMap[cellColor],
    }),
  };
});

export default function CustomTable(props) {
  const {
    tableHead,
    tableData,
    tableHeaderColor,
    hover,
    colorsColls,
    coloredColls,
    customCellClasses,
    customClassesForCells,
    striped,
    tableShopping,
    customHeadCellClasses,
    customHeadClassesForCells,
  } = props;
  return (
    <StyledTableWrapper>
      <StyledTable>
        {tableHead ? (
          <StyledTableHead tableHeaderColor={tableHeaderColor}>
            <StyledTableRow isHead>
              {tableHead.map((prop, key) => {
                const customHeadClass =
                  customHeadClassesForCells.indexOf(key) !== -1
                    ? customHeadCellClasses[
                        customHeadClassesForCells.indexOf(key)
                      ]
                    : "";
                return (
                  <StyledTableCell
                    isHead
                    tableShopping={tableShopping}
                    className={customHeadClass}
                    key={key}
                  >
                    {prop}
                  </StyledTableCell>
                );
              })}
            </StyledTableRow>
          </StyledTableHead>
        ) : null}
        <TableBody>
          {tableData.map((prop, key) => {
            var rowColor = "";
            var rowColored = false;
            if (prop.color) {
              rowColor = prop.color;
              rowColored = true;
              prop = prop.data;
            }
            if (prop.total) {
              return (
                <StyledTableRow
                  key={key}
                  isBody
                  hover={hover}
                  striped={striped && key % 2 === 0}
                  rowColor={rowColored ? rowColor : undefined}
                >
                  <StyledTableCell colSpan={prop.colspan} />
                  <StyledTableCell isTotal>Total</StyledTableCell>
                  <StyledTableCell isAmount>{prop.amount}</StyledTableCell>
                  {tableHead.length - (prop.colspan - 0 + 2) > 0 ? (
                    <StyledTableCell
                      colSpan={tableHead.length - (prop.colspan - 0 + 2)}
                    />
                  ) : null}
                </StyledTableRow>
              );
            }
            if (prop.purchase) {
              return (
                <StyledTableRow
                  key={key}
                  isBody
                  hover={hover}
                  striped={striped && key % 2 === 0}
                  rowColor={rowColored ? rowColor : undefined}
                >
                  <StyledTableCell colSpan={prop.colspan} />
                  <StyledTableCell isRight colSpan={prop.col.colspan}>
                    {prop.col.text}
                  </StyledTableCell>
                </StyledTableRow>
              );
            }
            return (
              <StyledTableRow
                key={key}
                isBody
                hover={hover}
                onDoubleClick={() => {}}
                striped={striped && key % 2 === 0}
                rowColor={rowColored ? rowColor : undefined}
              >
                {prop.map((prop, key) => {
                  const cellColor =
                    coloredColls.indexOf(key) !== -1
                      ? colorsColls[coloredColls.indexOf(key)]
                      : undefined;
                  const customCellClass =
                    customClassesForCells.indexOf(key) !== -1
                      ? customCellClasses[customClassesForCells.indexOf(key)]
                      : "";
                  return (
                    <StyledTableCell
                      cellColor={cellColor}
                      className={customCellClass}
                      key={key}
                    >
                      {prop}
                    </StyledTableCell>
                  );
                })}
              </StyledTableRow>
            );
          })}
        </TableBody>
        <TableFooter>
          {/* <TableRow>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              count={1000}
              rowsPerPage={1}
              page={2}
            />
          </TableRow> */}
        </TableFooter>
      </StyledTable>
    </StyledTableWrapper>
  );
}

CustomTable.defaultProps = {
  tableHeaderColor: "gray",
  hover: true,
  colorsColls: [],
  coloredColls: [],
  striped: false,
  customCellClasses: [],
  customClassesForCells: [],
  customHeadCellClasses: [],
  customHeadClassesForCells: [],
};

CustomTable.propTypes = {
  tableHeaderColor: PropTypes.oneOf([
    "warning",
    "primary",
    "danger",
    "success",
    "info",
    "rose",
    "gray",
  ]),
  tableHead: PropTypes.arrayOf(PropTypes.string),
  // Of(PropTypes.arrayOf(PropTypes.node)) || Of(PropTypes.object),
  tableData: PropTypes.array,
  hover: PropTypes.bool,
  coloredColls: PropTypes.arrayOf(PropTypes.number),
  // Of(["warning","primary","danger","success","info","rose","gray"]) - colorsColls
  colorsColls: PropTypes.array,
  customCellClasses: PropTypes.arrayOf(PropTypes.string),
  customClassesForCells: PropTypes.arrayOf(PropTypes.number),
  customHeadCellClasses: PropTypes.arrayOf(PropTypes.string),
  customHeadClassesForCells: PropTypes.arrayOf(PropTypes.number),
  striped: PropTypes.bool,
  // this will cause some changes in font
  tableShopping: PropTypes.bool,
};
