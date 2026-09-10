import React, { useCallback, useMemo, useRef } from "react";
import { IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import BaseCrudManager from "baseComponents/BaseCrudManager";
import DoctorTeamHelper from "helper/DoctorTeamHelper";

const gridFields = [
  { Name: "AppId", Label: "App", Type: "SingleSelect", Position: 0 },
  { Name: "name", Label: "Name", Type: "Text", Position: 1 },
  {
    Name: "vwDoctorsTeamInfo.DoctorCount",
    Label: "Doctor count",
    Type: "Text",
    Position: 8,
  },
  {
    Name: "vwDoctorsTeamInfo.PatientCount",
    Label: "Patient count",
    Type: "Text",
    Position: 9,
  },
  { Name: "user_mod", Label: "Last update author", Type: "Text", Position: 12 },
  { Name: "date_creation", Label: "Creation date", Type: "Date", Position: 20 },
];

// Filter out soft-deleted teams (rec_status = 2)
const initialSearchOption = {
  PageOption: { Page: 0, Limit: 20 },
  FindType: "AllData",
  WhereType: "Contains",
  SearchField: [{ Field: "rec_status", Value: "2", Op: "NotEquals" }],
};

function DeleteCell({ rowdata, onClick }) {
  const patientCount = rowdata?.vwDoctorsTeamInfo?.PatientCount ?? 1;
  const doctorCount = rowdata?.vwDoctorsTeamInfo?.DoctorCount ?? 2;
  if (patientCount !== 0 || doctorCount > 1) return null;
  return (
    <IconButton size="small" color="error" onClick={onClick}>
      <DeleteIcon fontSize="small" />
    </IconButton>
  );
}

export default function DoctorsTeam() {
  const crudRef = useRef(null);

  const handleDelete = useCallback((row) => {
    crudRef.current?.ShowConfirm(
      `"${row.name}" багийг устгах уу?`,
      async () => {
        await DoctorTeamHelper.DeleteDoctorsTeam(row.id_data, (resData) => {
          crudRef.current?.ShowAlert(
            resData?.Message || "Устгалаа",
            resData?.Success ?? false,
          );
          if (resData?.Success) {
            crudRef.current?.BaseListRef?.current?.GetData?.();
          }
        });
      },
    );
  }, []);

  const rowActions = useMemo(
    () => [
      {
        Component: <DeleteCell />,
        onClick: (row) => handleDelete(row),
      },
    ],
    [handleDelete],
  );

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        flex: "1 1 auto",
        minHeight: 0,
        minWidth: 0,
        maxWidth: "100%",
      }}
    >
      <BaseCrudManager
        ref={crudRef}
        ObjectName="DoctorsTeam"
        GridHideCheck={true}
        isDialog={false}
        HideExport={true}
        widthPattern="60c, 60c, 150, 100c, 100c, 150, 150c"
        labelWidth={15}
        Fields={gridFields}
        GridRowActions={rowActions}
        SearchOption={initialSearchOption}
      />
    </div>
  );
}
