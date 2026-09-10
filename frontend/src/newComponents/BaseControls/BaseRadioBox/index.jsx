import React from "react";
// translation
import { useTranslation } from "react-i18next";
import { RadioGroup, FormControlLabel, Radio } from "@mui/material";

import useSelect from "../useLocalSelect";

export default ({ config, ...props }) => {
  const { t } = useTranslation();

  const { value, changeValue, dataSource } = useSelect(props);

  const handleChange = (event) => {
    changeValue(event.target.value);
  };

  // Determine layout
  const isGrid = config.columns && config.columns > 1;
  const layoutSx = isGrid
    ? {
        display: "grid",
        gridTemplateColumns: `repeat(${config.columns}, 1fr)`,
        width: "100%",
      }
    : {
        display: "flex",
        flexDirection: config.layout === "horizontal" ? "row" : "column",
      };

  return (
    <RadioGroup
      value={value || ""}
      onChange={handleChange}
      sx={layoutSx}
      {...config}
    >
      {dataSource &&
        dataSource.map((item, index) => (
          <FormControlLabel
            key={item[config.valueExpr || "id"] || index}
            value={item[config.valueExpr || "id"]}
            control={<Radio />}
            label={t(item.label || item.text)}
            sx={{ paddingLeft: "16px" }}
          />
        ))}
    </RadioGroup>
  );
};
