/* eslint-disable no-undef */
import React, { useState } from "react";
import PropTypes from "prop-types";
// @mui/material components
import { styled } from "@mui/material/styles";
import Checkbox from "@mui/material/Checkbox";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableRow from "@mui/material/TableRow";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
// @mui/icons-material
import Edit from "@mui/icons-material/Edit";
import Close from "@mui/icons-material/Close";
import Check from "@mui/icons-material/Check";

import {
  defaultFont,
  primaryColor,
  dangerColor,
  grayColor,
  blackColor,
  hexToRgb,
} from "assets/jss/material-dashboard-pro-react.js";

const StyledTable = styled(Table)({
  marginBottom: "0",
});

const StyledTableRow = styled(TableRow)({
  position: "relative",
  borderBottom: "1px solid " + grayColor[5],
});

const StyledTableCell = styled(TableCell, {
  shouldForwardProp: (prop) => prop !== "isActions",
})(({ isActions }) => ({
  ...defaultFont,
  padding: isActions ? "12px 8px !important" : "0",
  verticalAlign: "middle",
  border: "none",
  lineHeight: "1.42857143",
  fontSize: "14px",
}));

const StyledCheckbox = styled(Checkbox)({
  "&.Mui-checked": {
    color: primaryColor[0] + "!important",
  },
});

const CheckedIcon = styled(Check)({
  width: "20px",
  height: "20px",
  border: "1px solid rgba(" + hexToRgb(blackColor) + ", .54)",
  borderRadius: "3px",
});

const UncheckedIcon = styled(Check)({
  width: "0px",
  height: "0px",
  padding: "9px",
  border: "1px solid rgba(" + hexToRgb(blackColor) + ", .54)",
  borderRadius: "3px",
});

const StyledIconButton = styled(IconButton)({
  width: "27px",
  height: "27px",
  padding: "0",
});

const EditIcon = styled(Edit)({
  width: "17px",
  height: "17px",
  backgroundColor: "transparent",
  color: primaryColor[0],
  boxShadow: "none",
});

const CloseIcon = styled(Close)({
  width: "17px",
  height: "17px",
  backgroundColor: "transparent",
  color: dangerColor[0],
  boxShadow: "none",
});

const StyledTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ tooltip: className }} />
))({
  padding: "10px 15px",
  minWidth: "130px",
  color: "#555555",
  lineHeight: "1.7em",
  background: "#FFFFFF",
  border: "none",
  borderRadius: "3px",
  boxShadow:
    "0 8px 10px 1px rgba(" +
    hexToRgb(blackColor) +
    ", 0.14), 0 3px 14px 2px rgba(" +
    hexToRgb(blackColor) +
    ", 0.12), 0 5px 5px -3px rgba(" +
    hexToRgb(blackColor) +
    ", 0.2)",
  maxWidth: "200px",
  textAlign: "center",
  fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif',
  fontSize: "12px",
  fontStyle: "normal",
  fontWeight: "400",
  textShadow: "none",
  textTransform: "none",
  letterSpacing: "normal",
  wordBreak: "normal",
  wordSpacing: "normal",
  wordWrap: "normal",
  whiteSpace: "normal",
  lineBreak: "auto",
});

export default function Tasks(props) {
  const { checkedIndexes, tasksIndexes, tasks } = props;

  const [checked, setChecked] = useState([...checkedIndexes]);
  const handleToggle = (value) => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];
    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }
    setChecked(newChecked);
  };
  const tableCellClasses = classes.tableCell;
  return (
    <Table className={classes.table}>
      <TableBody>
        {tasksIndexes.map((value) => (
          <TableRow key={value} className={classes.tableRow}>
            <TableCell className={tableCellClasses}>
              <Checkbox
                checked={checked.indexOf(value) !== -1}
                tabIndex={-1}
                onClick={() => handleToggle(value)}
                checkedIcon={<Check className={classes.checkedIcon} />}
                icon={<Check className={classes.uncheckedIcon} />}
                classes={{
                  checked: classes.checked,
                  root: classes.root,
                }}
              />
            </TableCell>
            <TableCell className={tableCellClasses}>{tasks[value]}</TableCell>
            <TableCell className={classes.tableActions}>
              <Tooltip
                id="tooltip-top"
                title="Edit Task"
                placement="top"
                classes={{ tooltip: classes.tooltip }}
              >
                <IconButton
                  aria-label="Edit"
                  className={classes.tableActionButton}
                >
                  <Edit
                    className={
                      classes.tableActionButtonIcon + " " + classes.edit
                    }
                  />
                </IconButton>
              </Tooltip>
              <Tooltip
                id="tooltip-top-start"
                title="Remove"
                placement="top"
                classes={{ tooltip: classes.tooltip }}
              >
                <IconButton
                  aria-label="Close"
                  className={classes.tableActionButton}
                >
                  <Close
                    className={
                      classes.tableActionButtonIcon + " " + classes.close
                    }
                  />
                </IconButton>
              </Tooltip>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

Tasks.propTypes = {
  tasksIndexes: PropTypes.arrayOf(PropTypes.number),
  tasks: PropTypes.arrayOf(PropTypes.node),
  checkedIndexes: PropTypes.array,
};
