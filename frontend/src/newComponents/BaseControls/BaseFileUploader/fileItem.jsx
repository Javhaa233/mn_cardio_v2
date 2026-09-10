import React, { useState } from "react";
import { Tooltip } from "@mui/material";
import i18n from "i18n";

export default ({
  show,
  download,
  readOnly,
  id,
  remove,
  index,
  data,
  ...props
}) => {
  const [textColor, setTextColor] = useState("");

  return (
    <div
      style={{
        width: "100%",
      }}
    >
      <i
        className="dx-icon-file"
        style={{ fontSize: "18px", marginRight: "4px" }}
      ></i>
      <span
        title={data.id && data.id && "Татах"}
        onClick={() => {
          show && show(data);
          data && data.id && download && download(data);
        }}
        onMouseOver={() => {
          setTextColor("#80abd1");
        }}
        onMouseLeave={() => {
          setTextColor("");
        }}
        style={{
          cursor: "pointer",
          color: textColor,
          fontSize: "16px",
          textDecoration: "underline",
        }}
      >
        {data && data.orginalName}
      </span>

      {!readOnly && (
        <Tooltip title="Устгах">
          <i
            id={"Remove" + id}
            className="dx-icon-trash"
            style={{
              fontSize: "18px",
              marginLeft: "10px",
              color: "#d9534f",
              cursor: "pointer",
            }}
            onClick={(e) => {
              e.preventDefaul();
              remove && remove(index);
            }}
          ></i>
        </Tooltip>
      )}
    </div>
  );
};
