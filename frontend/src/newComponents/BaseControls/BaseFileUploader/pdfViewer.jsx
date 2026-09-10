import React from "react";
import { Dialog, DialogContent, DialogActions, Button } from "@mui/material";

export default ({ src, visible, setVisible, ...props }) => {
  return (
    <Dialog
      open={visible}
      onClose={() => setVisible(false)}
      maxWidth="md"
      fullWidth
      {...props}
    >
      <DialogContent style={{ height: "600px", padding: 0 }}>
        <div style={{ width: "100%", height: "100%" }}>
          <embed
            src={src}
            style={{
              height: "100%",
              width: "100%",
            }}
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => setVisible(false)}
          variant="contained"
          color="success"
        >
          Хаах
        </Button>
      </DialogActions>
    </Dialog>
  );
};
