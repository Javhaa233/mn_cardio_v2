import React from "react";
import { Button, DialogActions } from "@mui/material";

export default ({ clickClose }) => {
  return (
    <DialogActions>
      <Button onClick={clickClose} variant="contained">
        Буцах
      </Button>
    </DialogActions>
  );
};
