import React, { useState, cloneElement } from "react";
// @mui/material components
import { TableRow, TableCell, Checkbox } from "@mui/material";
// translation
import { useTranslation } from "react-i18next";
// @mui/icons-material
import Check from "@mui/icons-material/Check";
// helper
import Helper from "helper";

import {
  primaryColor,
  blackColor,
  hexToRgb,
} from "assets/jss/material-dashboard-pro-react.js";

var IdKey = 0;
const GetKey = () => {
  IdKey++;
  return IdKey;
};

export default function GridRow(props) {
  const { t } = useTranslation();
  const {
    TextLength = 10,
    ColumnActions = [],
    Data = null,
    cursor = "default",
    SelectRow,
    ShowData,
    PK,
    RowNumber,
    RowClickSelect,
    HideNumber,
    HideCheck,
    Fields,
    RowActions,
  } = props;

  const [Selected, setSelected] = useState(false);

  const checkboxSx = {
    padding: "8px",
    margin: "-8px 4px",
    "&:hover": { backgroundColor: "unset" },
    "&:.Mui-checked": { color: primaryColor[0] + "!important" },
  };

  const checkedIconSx = {
    width: "20px",
    height: "20px",
    border: "1px solid rgba(" + hexToRgb(blackColor) + ", .54)",
    borderRadius: "3px",
  };

  const uncheckedIconSx = {
    width: "0px",
    height: "0px",
    padding: "9px",
    border: "1px solid rgba(" + hexToRgb(blackColor) + ", .54)",
    borderRadius: "3px",
  };

  const GetFieldAction = (FieldName) => {
    if (ColumnActions) {
      const ss = ColumnActions.filter((s) => s.Field === FieldName);
      if (ss.length === 1) return ss[0];
      else return null;
    }
    return null;
  };

  const GetFieldValue = (Field) => {
    var data = Helper.ObjectHelper.getValue(Data, Field.Name);
    if (data === undefined || data === null) {
      return "No Data Available";
    }
    var FieldAction = null;
    var strData = "";
    if (ColumnActions && ColumnActions.length > 0) {
      FieldAction = GetFieldAction(Field.Name);
    }
    if (FieldAction === null) {
      var temp = [];
      if (Field.Type === "Date") {
        if (data && data.indexOf("Z") !== -1)
          data = Helper.ObjectHelper.getDateYMDHMS({ DateStr: data });
      }
      if (Field.OptionType && Field.Data) {
        temp = Field.Data.filter((s) => s.Value + "" === data + "");
        if (temp.length > 0) {
          data = temp[0].Label;
        }
      } else if (
        Field.Config &&
        Field.Type === "SingleSelect" &&
        Field.Data &&
        Field.Data.length > 0
      ) {
        temp = Field.Data.filter(
          (s) => s[Field.Config.IdField] + "" === data + "",
        );
        if (temp.length > 0) data = temp[0][Field.Config.TextField];
      }
      if (data === null) {
        data = "";
      } else {
        data = data + "";
      }

      strData = data.substring(0, TextLength);
      strData += data.length > TextLength ? "..." : "";
    }

    return { strData, FieldAction };
  };

  return (
    <TableRow
      hover
      style={{
        cursor,
        backgroundColor:
          Selected === true ? "#c8fada" : RowNumber % 2 === 1 ? "#f0f0f0" : "",
      }}
      tabIndex={-1}
      onClick={() => {
        if (RowClickSelect === true) {
          SelectRow && SelectRow(Data[PK], !Selected, Data);
          setSelected(!Selected);
        }
      }}
      onDoubleClick={() => ShowData && ShowData(Data)}
    >
      {HideNumber ? null : (
        <TableCell
          key={"Col" + GetKey()}
          style={{ padding: "2px", textAlign: "center", whiteSpace: "nowrap" }}
        >
          {RowNumber}
        </TableCell>
      )}
      {HideCheck ? null : (
        <TableCell
          key={"Col" + GetKey()}
          align={"center"}
          style={{ padding: "0px", whiteSpace: "nowrap" }}
        >
          <Checkbox
            checked={Selected}
            onClick={() => {
              setSelected(!Selected);
              SelectRow && SelectRow(Data[PK], !Selected, Data);
            }}
            key={"Check" + GetKey()}
            checkedIcon={<Check sx={checkedIconSx} />}
            icon={<Check sx={uncheckedIconSx} />}
            sx={checkboxSx}
          />
        </TableCell>
      )}

      {Array.isArray(Fields) &&
        Fields.filter((col) => col.GridField !== false).map((Field) => {
          const { FieldAction, strData } = GetFieldValue(Field);
          // 1. Define the width. If Field.Width is missing, default to "150px"
          const cellWidth = Field.Width
            ? Field.Width + (typeof Field.Width === "number" ? "px" : "")
            : "150px";

          return (
            <TableCell
              key={"Col" + GetKey()}
              style={{
                width: cellWidth,
                minWidth: cellWidth,
                maxWidth: cellWidth,
                padding: "2px",
                fontSize: "12px",
                cursor: "pointer",
                verticalAlign: "middle", // Aligns content vertically
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              title={strData} // Shows full text on hover
            >
              {FieldAction
                ? cloneElement(FieldAction.Component, {
                    rowdata: Data,
                    fieldName: Field.Name,
                    ...FieldAction.props,
                    onClick: (Type) => FieldAction.onClick(Data, Type),
                  })
                : t(strData)}
            </TableCell>
          );
        })}

      {Array.isArray(RowActions) &&
        RowActions.map((Action) => (
          <TableCell
            key={"Col" + GetKey()}
            align={"center"}
            style={{ padding: "0px", whiteSpace: "nowrap" }}
          >
            {cloneElement(Action.Component, {
              rowdata: Data,
              onClick: (Type) => Action.onClick(Data, Type),
            })}
          </TableCell>
        ))}
    </TableRow>
  );
}
