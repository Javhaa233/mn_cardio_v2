import React, { useState } from "react";
import { Button, TextField, Grid } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useTranslation } from "react-i18next";

export default ({ filter, formName }) => {
  const { t } = useTranslation();
  const [filterValues, setFilterValues] = useState({
    Name: "",
  });

  const handleFieldChange = (field, value) => {
    setFilterValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleFilter = () => {
    const filters = [];

    if (filterValues.Name && filterValues.Name.trim() !== "") {
      filters.push(["Name", "contains", filterValues.Name.trim()]);
    }

    // Join filters with "and"
    let finalFilter = null;
    if (filters.length > 0) {
      if (filters.length === 1) {
        finalFilter = filters[0];
      } else {
        finalFilter = [];
        for (let i = 0; i < filters.length; i++) {
          if (i > 0) finalFilter.push("and");
          finalFilter.push(filters[i]);
        }
      }
    }

    if (filter) {
      filter(finalFilter);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleFilter();
    }
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "8px",
        alignItems: "center",
        width: "100%",
      }}
    >
      <Grid container spacing={1} alignItems="center">
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            sx={{ minWidth: 220 }}
            size="small"
            label="Name"
            fullWidth
            value={filterValues.Name}
            onChange={(e) => handleFieldChange("Name", e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </Grid>
        <Grid>
          <Button
            size="small"
            variant="contained"
            onClick={handleFilter}
            startIcon={<SearchIcon />}
            sx={{
              boxShadow: "none",
              textTransform: "none",
              whiteSpace: "nowrap",
              minWidth: "100px",
              height: "32px",
            }}
          >
            {t("Search")}
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};
