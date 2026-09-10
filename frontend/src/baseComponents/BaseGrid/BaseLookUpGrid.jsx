import React from "react";
import { TableContainer, TableBody, Table } from "@mui/material";

import Header from "baseComponents/BaseGrid/Header";
import GridRow from "baseComponents/BaseGrid/GridRow";

export default function BaseLookUpGrid(props) {
  const {
    OrderBy,
    Data = [],
    Fields = [],
    SelectRow,
    PK = "Id",
    ShowData,
    HideNumber,
    HideCheck,
  } = props;

  return (
    <div style={{ minWidth: "200px" }}>
      <TableContainer style={{ overflow: "inherit" }}>
        <Table size="small" style={{ tableLayout: "fixed" }}>
          <Header
            OrderBy={(Field, Type) => OrderBy && OrderBy(Field, Type)}
            {...props}
            Fields={Fields}
          />
          <TableBody>
            {Array.isArray(Data) &&
              Data.map((row, index) => (
                <GridRow
                  cursor="pointer"
                  RowClickSelect={true}
                  SelectRow={SelectRow}
                  Data={row ? row : {}} //Row Data
                  TextLength={200} //GridMaxTextLength
                  RowNumber={index + 1} //RowNumber
                  PK={PK} //Row PrimaryKey
                  key={"Row" + index}
                  ShowData={ShowData} //Row DBlClick Action
                  Fields={Fields} //Row Fields
                  HideNumber={HideNumber}
                  HideCheck={HideCheck}
                  RowActions={[]}
                />
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
