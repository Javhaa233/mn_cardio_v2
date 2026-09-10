import React from "react";
// TODO: DevExtreme not installed
// // TODO: DevExtreme not installed
// import Button from "devextreme-react/button";
import ImageItem from "./imageItem";
import PdfViewer from "./pdfViewer";
import useBaseFileUploader from "./useBaseFileUploader";

// DevExtreme stub components (package not installed)
const Button = ({ text, icon, disabled, onClick }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    style={{ padding: "6px 12px", margin: "2px" }}
  >
    {icon && <span className={`dx-icon-${icon}`} />} {text}
  </button>
);

export default ({
  name,
  config,
  store,
  selector,
  changeValue,
  // Filter out non-DOM props that shouldn't be passed down
  valueExpr,
  displayExpr,
  dataSource,
  ...props
}) => {
  const {
    value,
    inputRef,
    pdfFileSrc,
    labelText,
    remove,
    download,
    chooseFile,
  } = useBaseFileUploader({ name, store, selector, changeValue });

  return (
    <div>
      {pdfFileSrc ? <PdfViewer /> : null}
      {!config?.readOnly ? (
        <Button
          type="normal"
          text="Файл нэмэх"
          icon="add"
          disabled={config?.readOnly}
          onClick={() => {
            inputRef.current.click();
          }}
        />
      ) : null}

      <label style={{ color: "red", marginLeft: "4px" }}>{labelText}</label>
      <input
        type="file"
        multiple={config?.multiple || false}
        accept={config?.accept || "*"}
        onChange={chooseFile}
        ref={inputRef}
        style={{ display: "none" }}
      />
      <div style={{ width: "100%", marginTop: "6px", padding: "2px" }}>
        {(Array.isArray(value) ? value : value ? [value] : []).map(
          (file, index) => (
            <ImageItem
              download={download}
              remove={remove}
              key={index}
              data={file}
            />
          ),
        )}
      </div>
    </div>
  );
};
