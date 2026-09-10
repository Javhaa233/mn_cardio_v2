import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { DataGrid } from "@mui/x-data-grid";
import { Box } from "@mui/material";
import Card from "components/Card/Card";
import CardHeader from "components/Card/CardHeader";
import CardBody from "components/Card/CardBody";
import GridContainer from "components/Grid/GridContainer";
import ShowPatient from "customComponents/FieldActions/ShowPatient";

import {
  Form as FormDialog,
  Filter,
  useDataGrid,
} from "customComponents/NationalRegistry/New/Icd";

export default (props) => {
  const formName = "icd";
  const filterFormName = `${formName}Filter`;

  const { t } = useTranslation();

  const {
    dataGrid: {
      ref,
      dataSource,
      refreshData,
      getFieldProps,
      defaultConfig,
      exportData,
      filter,
    },
    fn: { create, edit, deleteRow, setCurrent },
    confirmDialog,
  } = useDataGrid({ formName, gridName: formName, filterFormName, ...props });

  // Define columns for MUI DataGrid
  const columns = useMemo(
    () => [
      {
        field: "col2",
        headerName: t("Огноо"),
        width: 150,
        valueGetter: (value, row) => row.col2 || "",
      },
      {
        field: "patientRegister",
        headerName: t("Personal No"),
        width: 150,
        renderCell: (params) => (
          <ShowPatient rowdata={params.row} fieldName="patientRegister" />
        ),
      },
      {
        field: "doctorFullName",
        headerName: t("Эмч"),
        width: 200,
        valueGetter: (value, row) => row.DoctorsProfile?.FullName || "",
      },
      {
        field: "organization",
        headerName: t("Байгууллага"),
        width: 200,
        valueGetter: (value, row) =>
          row.DoctorsProfile?.Organization?.name || "",
      },
      {
        field: "provinceCity",
        headerName: t("Аймаг/Хот"),
        width: 150,
        valueGetter: (value, row) =>
          row.DoctorsProfile?.DictProvinceCity?.name || "",
      },
      {
        field: "soumDistrict",
        headerName: t("Сум/Дүүрэг"),
        width: 150,
        valueGetter: (value, row) =>
          row.DoctorsProfile?.DictSoumDistrict?.name || "",
      },
      {
        field: "bagKhoroo",
        headerName: t("Баг/Хороо"),
        width: 150,
        valueGetter: (value, row) =>
          row.DoctorsProfile?.DictBagKhoroo?.name || "",
      },
    ],
    [t],
  );

  // Transform data to include proper IDs
  const rows = useMemo(() => {
    if (!Array.isArray(dataSource)) return [];
    return dataSource.map((item, index) => ({
      ...item,
      id: item.id || index,
    }));
  }, [dataSource]);

  return (
    <Card style={{ margin: "10px", marginBottom: "40px" }}>
      <CardHeader color={"warning"} text title={t("Icd")} />
      <CardBody>
        <GridContainer>
          <FormDialog saved={refreshData} formName={formName} />
          {confirmDialog}
          {/* <Filter formName={filterFormName} filter={filter} /> */}

          <Box sx={{ height: 400, width: "100%", padding: "20px" }}>
            <DataGrid
              rows={rows}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 5 },
                },
              }}
              pageSizeOptions={[5, 10, 20, 30, 40, 50]}
              onRowDoubleClick={(params) => edit(params.row)}
              disableRowSelectionOnClick
              sx={{
                border: "1px solid #e0e0e0",
                "& .MuiDataGrid-cell": {
                  fontSize: "12px",
                  padding: "8px 12px",
                },
                "& .MuiDataGrid-columnHeader": {
                  backgroundColor: "#f5f5f5",
                  fontSize: "12px",
                  fontWeight: "bold",
                },
                "& .MuiDataGrid-row:hover": {
                  cursor: "pointer",
                },
              }}
            />
          </Box>
        </GridContainer>
      </CardBody>
    </Card>
  );
};
