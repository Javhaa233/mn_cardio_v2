import React from "react";
import { useTranslation } from "react-i18next";
import { ListItem, ListItemText, ListItemSecondaryAction } from "@mui/material";
import SimpleSelect from "customComponents/SimpleSelect";

const CalculatorSelect = ({
  label,
  name,
  options,
  onChange,
  style,
  width = "25%",
  config,
}) => {
  const { t } = useTranslation();
  return (
    <ListItem style={{ ...style, paddingTop: "4px", paddingBottom: "4px" }}>
      <div style={{ display: "flex", width: "100%", alignItems: "center" }}>
        <div style={{ width: "50%" }}>
          <ListItemText
            primary={t(label)}
            primaryTypographyProps={{ style: { fontSize: "0.9rem" } }}
          />
        </div>
        <div style={{ width: "50%" }}>
          <SimpleSelect
            ChangeValue={(Value) =>
              onChange(name, parseInt(Value ? Value : "0"))
            }
            Config={{
              Config: config || { IdField: "Id", TextField: "Name" },
              Data: options,
            }}
            FullWidth
            Label=""
            defaultValueLabel="-- Select --"
            Sx={{
              backgroundColor: "#e3f2fd",
              borderRadius: "4px",

              /* ✅ THE ONLY BORDER */
              border: "1px solid #90caf9",

              /* ❌ COMPLETELY KILL MUI OUTLINE */
              "& fieldset": {
                display: "none",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                display: "none",
              },

              /* ✅ HOVER */
              "&:hover": {
                borderColor: "#42a5f5",
              },

              /* ✅ FOCUS (NO EXTRA BORDER) */
              "&.Mui-focused": {
                borderColor: "#1976d2",
              },

              "& .MuiSelect-select": {
                padding: "6px 28px 6px 8px",
                color: "#1976d2",
                fontWeight: 500,
                fontSize: "0.85rem",
                display: "flex",
                alignItems: "center",
              },
            }}
          />
        </div>
      </div>
    </ListItem>
  );
};

export default CalculatorSelect;
