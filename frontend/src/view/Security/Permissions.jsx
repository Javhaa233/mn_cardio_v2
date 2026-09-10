import BaseCrudManager from "baseComponents/BaseCrudManager";

export default function Permissions() {
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
        ObjectName="Permissions"
        HideRangeDate={true}
        GridHideCheck={true}
        HideExport={true}
        isDialog={false}
        formSize={{ height: "500px", width: "700px" }}
        layoutPattern="grid"
        widthPattern="40c, 200, 200, 140, 140, 140, 140, 240"
      />
    </div>
  );
}
