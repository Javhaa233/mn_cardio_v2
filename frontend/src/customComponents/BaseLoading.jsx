import React from "react";

import { BrandSpinner } from "customComponents/DivLoading";

/**
 * An inline loading row: the brand spinner, centred, with room above and
 * below. It used to sit inside a Creative Tim GridContainer, whose negative
 * gutters pushed it off-centre inside narrow cards.
 */
export default function BaseLoading() {
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        padding: "16px 0",
      }}
    >
      <BrandSpinner Size={36} />
    </div>
  );
}
