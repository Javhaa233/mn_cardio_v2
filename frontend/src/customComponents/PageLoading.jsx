import React from "react";

import { BrandSpinner } from "customComponents/DivLoading";

/** The route-level Suspense fallback (index.jsx): one spinner in the middle of the screen. */
export default function PageLoading() {
  return (
    <div
      style={{
        position: "fixed",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      }}
    >
      <BrandSpinner Size={56} Thickness={3.2} />
    </div>
  );
}
