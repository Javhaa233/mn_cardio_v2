import { useTranslation } from "react-i18next";
import React, { useEffect, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import BaseLoading from "customComponents/BaseLoading.jsx";
import ErrorBoundary from "components/ErrorBoundary";

// core components

import routes from "routes/index.js";

import authStyles from "assets/jss/material-dashboard-pro-react/layouts/authStyle.js";

export default function PatientAuth() {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = authStyles(theme);
  // Only lock the body where the viewport can actually hold the login card.
  // This had no dependency array and locked unconditionally, so on a short
  // phone the form could not be scrolled to. See layouts/Auth.jsx.
  const isCompact = useMediaQuery(theme.breakpoints.down("md"));
  useEffect(() => {
    if (isCompact) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return function cleanup() {
      document.body.style.overflow = prevOverflow;
    };
  }, [isCompact]);

  const getRoutes = (routes) => {
    return (
      Array.isArray(routes) &&
      routes.map((prop, key) => {
        if (prop.collapse) return getRoutes(prop.views);
        if (prop.layout === "/patientAuth") {
          const Component = prop.component;
          return <Route path={prop.path} element={<Component />} key={key} />;
        } else {
          return null;
        }
      })
    );
  };

  return (
    <Box sx={styles.wrapper}>
      <Box sx={styles.fullPage}>
        {/* No error boundary existed on the sign-in screens: a render throw
            here blanked the login page, which is the worst place in the app to
            lose with no message. See the same note in layouts/Patient.jsx. */}
        <ErrorBoundary showHomeButton={false}>
          <Suspense fallback={<BaseLoading />}>
            <Routes>
              {getRoutes(routes)}
              <Route
                path="/"
                element={<Navigate to="/patientAuth/login" replace />}
              />
              <Route
                path="*"
                element={<Navigate to="/patientAuth/login" replace />}
              />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </Box>
    </Box>
  );
}
