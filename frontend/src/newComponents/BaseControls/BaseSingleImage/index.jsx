import React from "react";
import ImageItem from "./imageItem";
import useBaseSingleImage from "./useBaseSingleImage";

export default ({ name, config, store, selector, changeValue, ...props }) => {
  const { value, inputRef, download, chooseFile, remove } = useBaseSingleImage({
    name,
    store,
    selector,
    changeValue,
    ...props,
  });

  return (
    <div>
      <input
        type="file"
        multiple={false}
        accept={"image/*"}
        onChange={chooseFile}
        ref={inputRef}
        style={{ display: "none" }}
      />
      <div style={{ width: "100%", marginTop: "6px", padding: "2px" }}>
        <ImageItem
          download={download}
          remove={remove}
          data={value}
          chooseFile={() => inputRef.current.click()}
        />
      </div>
    </div>
  );
};
