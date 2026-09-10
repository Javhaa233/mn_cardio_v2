import React, { useRef, useState, useEffect } from "react";
import {
  Autocomplete,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

// translation
import { useTranslation } from "react-i18next";

import useSelect from "newComponents/BaseControls/useSelect";

export default ({ config, ...props }) => {
  const { t } = useTranslation();

  const { dataSource, value, changeValue, validate, validatorRef } = useSelect({
    config,
    ...props,
  });

  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      if (dataSource && Array.isArray(dataSource)) {
        setOptions(dataSource);
      } else if (dataSource && typeof dataSource.load === "function") {
        try {
          const result = await dataSource.load({});
          // Handle both formats: { data: [...] } and direct array
          const data = result?.data || result || [];
          setOptions(data);
        } catch (error) {
          console.error("Error loading lookup options:", error);
          setOptions([]);
        }
      }
    };

    loadData();
  }, [dataSource]);

  useEffect(() => {
    if (value && options.length > 0) {
      const selected = options.find(
        (item) => item[config.valueExpr || "Id"] === value,
      );
      setSelectedOption(selected || null);
    } else {
      setSelectedOption(null);
    }
  }, [value, options, config.valueExpr]);

  const handleChange = (event, newValue) => {
    if (newValue) {
      changeValue(newValue[config.valueExpr || "Id"]);
    } else {
      changeValue(null);
    }
  };

  const handleRowClick = (item) => {
    changeValue(item[config.valueExpr || "Id"]);
    setOpen(false);
  };

  return (
    <>
      <Autocomplete
        value={selectedOption}
        onChange={handleChange}
        options={options}
        getOptionLabel={(option) =>
          option ? String(option[config.displayExpr || "Name"] || "") : ""
        }
        isOptionEqualToValue={(option, value) =>
          option[config.valueExpr || "Id"] === value[config.valueExpr || "Id"]
        }
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={t("-- Select --")}
            variant="outlined"
            onBlur={validate}
            size="small"
          />
        )}
        onOpen={() => setOpen(true)}
        open={false}
        {...config}
      />

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {t("Select")}
          <IconButton
            aria-label="close"
            onClick={() => setOpen(false)}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {config.columns &&
                    config.columns.map((col, idx) => (
                      <TableCell key={idx}>{col.caption}</TableCell>
                    ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {options.map((item, index) => (
                  <TableRow
                    key={item[config.valueExpr || "Id"] || index}
                    onClick={() => handleRowClick(item)}
                    hover
                    sx={{ cursor: "pointer" }}
                    selected={value === item[config.valueExpr || "Id"]}
                  >
                    {config.columns &&
                      config.columns.map((col, idx) => (
                        <TableCell key={idx}>{item[col.dataField]}</TableCell>
                      ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>
    </>
  );
};
