import React from "react";
import { useTranslation } from "react-i18next";
import {
  ListItemButton,
  ListItemText,
  ListItemSecondaryAction,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";

const CalculatorOption = ({
  selected,
  onClick,
  label,
  secondaryLabel,
  points,
}) => {
  const { t } = useTranslation();

  return (
    <ListItemButton
      selected={selected}
      onClick={onClick}
      sx={{ paddingTop: "4px", paddingBottom: "4px" }}
    >
      <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
        {selected && (
          <CheckIcon
            style={{
              color: "#4caf50",
              marginRight: "6px",
              fontSize: "17px",
            }}
          />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <ListItemText
            primary={label}
            secondary={secondaryLabel}
            primaryTypographyProps={{ style: { fontSize: "0.9rem" } }}
            secondaryTypographyProps={{ style: { fontSize: "0.8rem" } }}
          />
        </div>
        <div
          style={{
            marginLeft: "11px",
            flexShrink: 0,
            minWidth: "56px",
            textAlign: "center",
            backgroundColor: "#e3f2fd",
            borderRadius: "3px",
            padding: "0.5px 6px",
            border: "1px solid #90caf9",
            fontWeight: 500,
          }}
        >
          <ListItemText
            primary={points + " " + t("point")}
            primaryTypographyProps={{
              style: { color: "#1976d2", fontWeight: 500, fontSize: "0.85rem" },
            }}
          />
        </div>
      </div>
    </ListItemButton>
  );
};

export default CalculatorOption;
