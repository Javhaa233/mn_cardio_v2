import React, { useMemo } from "react";
import { Button, Grid, Box } from "@mui/material";
import BaseGrid from "baseComponents/BaseGrid/BaseGrid";
import RefreshIcon from "@mui/icons-material/Refresh";
import ExportIcon from "@mui/icons-material/SaveAlt";
import { Popup } from "components/customComponent/defaults";
import { useBaseGrid } from "newComponents/BaseGrid";
import useExcelImport from "./useExcelImport";
import { layout } from "./config";
import i18n from "i18n";

export default ({ formName, gridColumns, dataConfig, ...props }) => {
  const { defaultConfig, exportData, ref } = useBaseGrid({});
  const { visible, close, details, loadData, save, renderFields, config } =
    useExcelImport({ formName, dataConfig, ...props });

  // Convert gridColumns to BaseGrid Fields format
  const fields = useMemo(() => {
    if (!gridColumns || !Array.isArray(gridColumns)) return [];
    return gridColumns.map((col) => ({
      Name: col.field || col.accessorKey || col.id,
      Label: col.headerName || col.header || col.field || col.id,
      Type: col.type,
    }));
  }, [gridColumns]);

  if (!visible) {
    return null;
  }

  return (
    <Popup
      visible={true}
      title="Excel-ээс оруулах"
      width={900}
      height={620}
      clickClose={close}
      clickSave={save}
      loadButtonSelector={`form.${formName}.loading`}
    >
      <div style={{ paddingBottom: "10px", paddingTop: "10px" }}>
        <Grid container spacing={2} sx={{ marginBottom: 2 }}>
          {renderFields({ items: layout, fields: config.fields })}
          <Grid size={12}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 2,
              }}
            >
              <Button
                variant="outlined"
                onClick={loadData}
                startIcon={<RefreshIcon />}
              >
                Мэдээ татах
              </Button>
              <Button
                variant="outlined"
                onClick={exportData}
                startIcon={<ExportIcon />}
              >
                Export
              </Button>
            </Box>
          </Grid>
          <Grid size={12}>
            <Box sx={{ height: 400, marginTop: 2 }}>
              <BaseGrid
                Data={details || []}
                Fields={fields}
                PK="id"
                PageSize={25}
                OrderBy={true}
                Height={400}
                EnableColumnResizing={true}
              />
            </Box>
          </Grid>
        </Grid>
      </div>
    </Popup>
  );
};
