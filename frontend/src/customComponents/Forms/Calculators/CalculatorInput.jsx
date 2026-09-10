import React from "react";
import { useTranslation } from "react-i18next";
import { ListItem, ListItemText, Input, FormControl } from "@mui/material";

const CalculatorInput = ({ label, name, onChange, style, type = "text" }) => {
  const { t } = useTranslation();
  return (
    <ListItem style={style}>
      <div style={{ display: "flex", width: "100%", alignItems: "center" }}>
        <div style={{ width: "50%" }}>
          <ListItemText primary={t(label)} />
        </div>
        <div style={{ width: "50%" }}>
          <FormControl fullWidth size="small">
            <Input
              disableUnderline
              type={type}
              onChange={(e) => onChange(name, parseInt(e.target.value || "0"))}
              sx={{
                backgroundColor: "#e3f2fd",
                borderRadius: "4px",
                border: "1px solid #90caf9",
                padding: "6px 4px",
                display: "flex",
                alignItems: "center",
                "& input": {
                  color: "#1976d2",
                  fontWeight: 500,
                  padding: "0",
                },
                "&:hover": {
                  borderColor: "#42a5f5",
                },
                "&.Mui-focused": {
                  borderColor: "#1976d2",
                },
              }}
            />
          </FormControl>
        </div>
      </div>
    </ListItem>
  );
};

export default CalculatorInput;
