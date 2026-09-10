import React, { useState } from "react";

import { useTranslation } from "react-i18next";
import { CircularProgress } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";

import Button from "components/CustomButtons/Button";

/**
 * BaseLoadButton Component
 *
 * A functional component for a button with loading state.
 * This is a migrated version from the original class component.
 *
 * Benefits of the migration to functional component:
 * 1. Simpler and cleaner syntax
 * 2. Better performance due to removal of unnecessary lifecycle methods
 * 3. Easier to test and debug
 * 4. Uses hooks for state management
 * 5. More readable and maintainable code
 */
const BaseLoadButton = ({
  Float = "right",
  ButtonText = "",
  Icon,
  onClick,
  Color = "success",
}) => {
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleClick = async () => {
    setLoading(true);
    try {
      if (onClick) {
        await onClick(() => setLoading(false));
      }
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        float: Float,
        display: Float === "left" ? "inline-block" : "block",
        marginRight: "15px",
      }}
    >
      <div style={{ float: Float, position: "relative" }}>
        <Button
          color={Color}
          size="sm"
          startIcon={Icon ? <Icon /> : <SaveIcon />}
          onClick={handleClick}
          disabled={loading}
        >
          {t(ButtonText + "")}
        </Button>
        {loading && (
          <CircularProgress
            size={24}
            style={{
              color: Color,
              position: "absolute",
              top: "50%",
              left: "50%",
              marginTop: -12,
              marginLeft: -12,
            }}
          />
        )}
      </div>
      <div style={{ clear: "both" }}></div>
    </div>
  );
};

export default BaseLoadButton;
