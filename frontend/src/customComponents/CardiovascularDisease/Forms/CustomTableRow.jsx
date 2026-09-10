import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";

import TableCell from "@mui/material/TableCell";
import TextField from "@mui/material/TextField";
import TableRow from "@mui/material/TableRow";
import Button from "components/CustomButtons/Button";
import { styled } from "@mui/material/styles";

// icons
import AddIcon from "@mui/icons-material/Add";
import Close from "@mui/icons-material/Close";

const StyledTextField = styled(TextField)({
  width: "50%",
  margin: "auto",
});

export default function CustomTableRow(props) {
  const { t } = useTranslation();
  const { row = {}, index, RemoveTablets, AddSelectedTablets } = props;

  const [desc, setDesc] = useState(row.desc);
  const [dailyCount, setDailyCount] = useState(row.dailyCount);
  const [totalDays, setTotalDays] = useState(row.totalDays);
  const [tbltSize, setTbltSize] = useState(row.tbltSize);
  const [checker, setChecker] = useState(row.checker);

  useEffect(() => {
    setStates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row]);

  useEffect(() => {
    if (dailyCount !== null && totalDays !== null) {
      setTbltSize(dailyCount * totalDays);
    }
  }, [dailyCount, totalDays, checker]);

  const setStates = () => {
    setDesc(row.desc === 0 ? "" : row.desc);
    setDailyCount(row.dailyCount === 0 ? "" : row.dailyCount);
    setTotalDays(row.totalDays === 0 ? "" : row.totalDays);
    setTbltSize(row.tbltSize);
    setChecker(row.checker);
  };

  const checkNumber = (e) => {
    const onlyNums = e.replace(/[^0-9]/g, "");
    if (onlyNums.length < 10) {
      return onlyNums;
    } else if (onlyNums.length === 10) {
      const number = onlyNums.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
      return number;
    }
  };

  return (
    <TableRow key={row.tbltId} disabled>
      <TableCell component="th" scope="row" style={{ whiteSpace: "nowrap" }}>
        {index}
      </TableCell>
      <TableCell component="th" scope="row" style={{ whiteSpace: "nowrap" }}>
        {row.tbltNameInter + "(" + row.tbltSizeMixture + ")"}
      </TableCell>
      <TableCell
        align="center"
        component="th"
        scope="row"
        style={{ whiteSpace: "nowrap" }}
      >
        <StyledTextField
          size="small"
          disabled={checker}
          value={dailyCount}
          onChange={(e) => setDailyCount(checkNumber(e.target.value))}
        />
      </TableCell>
      <TableCell
        align="center"
        component="th"
        scope="row"
        style={{ whiteSpace: "nowrap" }}
      >
        <StyledTextField
          size="small"
          disabled={checker}
          value={totalDays}
          onChange={(e) => setTotalDays(checkNumber(e.target.value))}
        />
      </TableCell>
      <TableCell
        align="center"
        component="th"
        scope="row"
        style={{ whiteSpace: "nowrap" }}
      >
        {tbltSize}
      </TableCell>
      <TableCell
        align="center"
        component="th"
        scope="row"
        style={{ whiteSpace: "nowrap" }}
      >
        <TextField
          disabled={checker}
          value={desc}
          multiline
          size="small"
          maxRows={4}
          onChange={(event) => setDesc(event.target.value)}
          id="outlined-basic"
          variant="outlined"
        />
      </TableCell>
      <TableCell component="th" scope="row" style={{ whiteSpace: "nowrap" }}>
        {checker ? (
          <Button
            justIcon
            round
            color="danger"
            onClick={() => {
              setChecker(!checker);
              RemoveTablets && RemoveTablets({ ...row });
            }}
            style={{
              width: "25px",
              height: "25px",
              minWidth: "25px",
              paddingLeft: "3px",
              paddingRight: "3px",
            }}
          >
            <Close style={{ width: "20px", height: "20px" }} />
          </Button>
        ) : (
          <Button
            justIcon
            round
            color="success"
            onClick={() => {
              if (tbltSize !== null && tbltSize > 0) {
                setChecker(!checker);
                AddSelectedTablets &&
                  AddSelectedTablets({
                    ...row,
                    desc: desc,
                    dailyCount: dailyCount,
                    totalDays: totalDays,
                    tbltSize: tbltSize,
                  });
              }
            }}
            style={{
              width: "25px",
              height: "25px",
              minWidth: "25px",
              paddingLeft: "3px",
              paddingRight: "3px",
            }}
          >
            <AddIcon style={{ width: "20px", height: "20px" }} />
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}
