import React, { useEffect, useState } from "react";
import { getFileSrc } from "utils/helper";
import { IconButton, Tooltip } from "@mui/material";
import { Download, Delete } from "@mui/icons-material";
import i18n from "i18n";

export default ({ index, data, download, remove, ...props }) => {
  const [fileSrc, setFileSrc] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  const showImage = async () => {
    if (!data) {
      setFileSrc(null);
      return;
    }

    if (data.file) {
      try {
        const src = await getFileSrc(data.file);
        setFileSrc(src);
      } catch (err) {
        console.error("Error loading file preview:", err);
        setFileSrc(null);
      }
    } else if (data.uri) {
      setFileSrc(data.uri);
    } else {
      setFileSrc(null);
    }
  };

  useEffect(() => {
    showImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, data?.file, data?.uri]);

  return (
    <div
      style={{
        float: "left",
        margin: "4px 0px 10px 10px",
        width: "120px",
      }}
    >
      <div
        style={{
          width: "120px",
          position: "relative",
          cursor: "pointer",
        }}
        onMouseOver={() => setShowMenu(true)}
        onMouseOut={() => setShowMenu(false)}
      >
        <div
          style={{
            position: "absolute",
            cursor: "pointer",
            top: 1,
            left: 1,
            background: "rgba(0,0,0,0.2)",
            width: "120px",
            height: "120px",
            display: "flex",

            justifyContent: "center",
            alignItems: "center",
          }}
          hidden={!showMenu}
        >
          {data && Number.isInteger(data.id) && (
            <Tooltip title="Татах">
              <IconButton
                onClick={() => {
                  data && data.id && download && download(data);
                }}
                size="small"
                style={{ color: "white" }}
              >
                <Download />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Устгах">
            <IconButton
              style={{
                marginLeft: "2px",
                color: "white",
              }}
              onClick={() => {
                data && data.id && remove && remove(data);
              }}
              size="small"
            >
              <Delete />
            </IconButton>
          </Tooltip>
        </div>
        <div
          style={{
            overflow: "hidden",
            border: "1px solid #ADADAD",
          }}
        >
          {data &&
          ((data.ext && data.ext.startsWith("image/")) ||
            (data.ext &&
              ["gif", "jpg", "jpeg", "png", "webp", "bmp", "svg"].includes(
                data.ext.toLowerCase(),
              )) ||
            (data.file &&
              data.file.type &&
              data.file.type.startsWith("image/"))) ? (
            <img
              src={fileSrc || ""}
              style={{
                width: "120px",
                height: "120px",
                objectFit: "contain",
              }}
              onClick={() => {
                // intentionally empty
              }}
            />
          ) : (
            <img
              src={"/file.png"}
              style={{
                width: "120px",
                height: "120px",
                objectFit: "contain",
              }}
              onClick={() => {
                // intentionally empty
              }}
            />
          )}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
        }}
      >
        <span
          onClick={() => {
            // intentionally empty
          }}
          style={{
            cursor: "pointer",
            color: "#80abd1",
            fontSize: "14px",
            wordBreak: "break-all",
          }}
        >
          {data && data.orginalName}
        </span>
      </div>
    </div>
  );
};
