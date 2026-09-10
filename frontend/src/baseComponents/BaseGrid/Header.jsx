import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { TableSortLabel, TableRow, TableHead, TableCell } from "@mui/material";

var IdKey = 0;
const GetKey = () => {
  IdKey++;
  return IdKey;
};

// Хүснэгтийн толгойн хэсэгт React.memo ашиглах
const Header = React.memo((props) => {
  const { t } = useTranslation();

  const {
    OrderBy,
    HideNumber,
    HideCheck,
    Fields = [],
    order,
    RowActions,
  } = props;

  const [Order, setOrder] = useState([]);
  const [Change, setChange] = useState(false);
  const [OrderField, setOrderField] = useState(null);

  const setOrderBy = (Field) => {
    var Temp = Order;
    var Type = "asc";
    var T = Temp.filter((s) => s.Field === Field);
    if (T.length === 0) {
      Temp.push({ Field: Field, Asc: false });
      Type = "desc";
    } else {
      T[0].Asc = !T[0].Asc;
      Type = T[0].Asc === true ? "asc" : "desc";
    }
    setOrder(Temp);
    setChange(!Change);
    setOrderField(Field);

    OrderBy && OrderBy(Field, Type);
  };

  const GetOrderByField = (Field) => {
    var Temp = Order.filter((s) => s.Field === Field);
    if (Temp.length === 0) {
      return "asc";
    } else {
      if (Temp[0].Asc === true) return "asc";
      else return "desc";
    }
  };

  return (
    <TableHead>
      <TableRow>
        {HideNumber ? null : (
          <TableCell
            key={"Head" + GetKey()}
            align={"left"}
            style={{
              padding: "2px",
              maxWidth: "15px",
              textAlign: "center",
              fontSize: "12px",
              whiteSpace: "nowrap",
            }}
          >
            №
          </TableCell>
        )}

        {HideCheck ? null : (
          <TableCell
            key={"Head" + GetKey()}
            align={"center"}
            style={{ padding: "0 2px", whiteSpace: "nowrap" }}
          >
            {/* Зөвхөн CheckBox-н элементүүдийг оруулах */}
          </TableCell>
        )}

        {Array.isArray(Fields) &&
          Fields.filter((col) => col.GridField !== false).map((headCell) => {
            const cellWidth = headCell.Width
              ? headCell.Width +
                (typeof headCell.Width === "number" ? "px" : "")
              : "150px";

            return (
              <TableCell
                style={{
                  width: cellWidth,
                  minWidth: cellWidth,
                  maxWidth: cellWidth,
                  padding: "2px",
                  fontSize: "12px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                key={"Head" + GetKey()}
                align={headCell.numeric ? "right" : "left"}
                padding={headCell.disablePadding ? "none" : "normal"}
                sortDirection={OrderBy === headCell.Name ? order : false}
              >
                {headCell.Type === "Boolean" || headCell.NoSorting ? (
                  t(headCell.Label + "")
                ) : (
                  <TableSortLabel
                    active={OrderField === headCell.Name}
                    direction={GetOrderByField(headCell.Name)}
                    onClick={() => setOrderBy(headCell.Name)}
                  >
                    {t(headCell.Label + "")}
                    {OrderBy === headCell.Name ? (
                      <span
                        style={{
                          border: 0,
                          clip: "rect(0 0 0 0)",
                          height: 1,
                          margin: -1,
                          overflow: "hidden",
                          padding: 0,
                          position: "absolute",
                          top: 20,
                          width: 1,
                        }}
                      >
                        {order === "desc"
                          ? "sorted descending"
                          : "sorted ascending"}
                      </span>
                    ) : null}
                  </TableSortLabel>
                )}
              </TableCell>
            );
          })}

        {Array.isArray(RowActions) && RowActions.length > 0 ? (
          <TableCell
            key={"Head" + GetKey()}
            align={"left"}
            padding={"normal"}
            style={{
              padding: "2px",
              minWidth: "20px",
              fontSize: "12px",
              whiteSpace: "nowrap",
            }}
          />
        ) : null}
      </TableRow>
    </TableHead>
  );
});

export default Header;
