import { useTranslation } from "react-i18next";
import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import BaseLoading from "customComponents/BaseLoading.jsx";
// routes
import routes from "routes/index.js";

export default function Test() {
  const { t } = useTranslation();
  const getRoutes = (routes) => {
    return (
      Array.isArray(routes) &&
      routes.map((prop, key) => {
        if (prop.layout === "/test") {
          const Component = prop.component;
          return <Route path={prop.path} element={<Component />} key={key} />;
        } else {
          return null;
        }
      })
    );
  };

  return (
    <Suspense fallback={<BaseLoading />}>
      <Routes>
        {getRoutes(routes)}
        <Route path="*" element={<Navigate to="/auth/login" replace />} />
      </Routes>
    </Suspense>
  );
}
