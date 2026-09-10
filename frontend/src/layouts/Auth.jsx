import { useTranslation } from "react-i18next";
import React, { useEffect, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
// import { makeStyles } from "@mui/styles";
import { styled, useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

// core components
import AuthNavbar from "components/Navbars/AuthNavbar.jsx";
import BaseLoading from "customComponents/BaseLoading.jsx";
// routes
import routes from "routes/index.js";

// styles
import { whiteColor } from "assets/jss/material-dashboard-pro-react.js";

const AuthWrapper = styled("div")({
  height: "auto",
  minHeight: "100vh",
  position: "relative",
  top: "0",
});

const FullPage = styled("div")(({ theme }) => ({
  padding: "0",
  position: "relative",
  minHeight: "100vh",
  display: "flex !important",
  margin: "0",
  border: "0",
  color: whiteColor,
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  // `hidden` only where the viewport is tall enough to hold the login card.
  // On a short phone in landscape - or a portrait phone with the keyboard up -
  // the card is taller than the viewport, and clipping it puts the password
  // field and the submit button permanently out of reach.
  overflow: "hidden",
  [theme.breakpoints.down("md")]: {
    overflow: "auto",
    // Let the page grow past the fold instead of centring inside a box that
    // cannot fit it; `auto` margins keep it centred while it still fits.
    alignItems: "flex-start",
    height: "auto",
  },
}));

export default function Auth() {
  const { t } = useTranslation();
  const theme = useTheme();
  // Only lock the body where there is room. This effect had NO dependency
  // array, so it re-ran on every render, and it locked unconditionally - which
  // is why the login form could not be scrolled to on a short screen.
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

        if (prop.layout === "/auth") {
          const Component = prop.component;
          return <Route path={prop.path} element={<Component />} key={key} />;
        } else {
          return null;
        }
      })
    );
  };

  return (
    <div>
      <AuthNavbar />
      <AuthWrapper>
        <FullPage>
          <Suspense fallback={<BaseLoading />}>
            <Routes>
              {getRoutes(routes)}
              <Route path="/" element={<Navigate to="/auth/login" replace />} />
              <Route path="*" element={<Navigate to="/auth/login" replace />} />
            </Routes>
          </Suspense>
        </FullPage>
      </AuthWrapper>
    </div>
  );
}
