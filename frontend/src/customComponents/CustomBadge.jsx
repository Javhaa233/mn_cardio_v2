import React from "react";
import Badge from "@mui/material/Badge";

export default function CustomBadge(props) {
  const {
    top = "50%",
    right = "10px",
    color = "#d32f2f",
    textColor = "#FFFFFF",
    Content = 0,
    children,
    ...rest
  } = props;

  return (
    <Badge
      badgeContent={Content}
      overlap="rectangular"
      sx={{
        "& .MuiBadge-badge": {
          transform: "translateY(-50%)",
          fontSize: "11px",
          width: "14px",
          height: "14px",
          minWidth: "14px",
          padding: 0,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          top,
          right,
          backgroundColor: color,
          color: textColor,
        },
      }}
      {...rest}
    >
      {children}
    </Badge>
  );
}
