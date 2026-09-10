import React from "react";
import HfAmbulanceTable from "customComponents/NationalRegistry/HeartFailure/HfAmbulanceTable";

export default function HfAmbulanceList() {
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
      <HfAmbulanceTable ObjectName={"HfAmbulance"} CustomRender={true} />
    </div>
  );
}
