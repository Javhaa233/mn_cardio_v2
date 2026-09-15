// TODO: DevExtreme not installed - commenting out theme files
// import "styles/themes/generated/theme.base.css";
// import "styles/themes/generated/theme.additional.css";

import "overlayscrollbars/styles/overlayscrollbars.css";
import "./assets/scss/material-dashboard-pro-react.scss?v=1.8.0";

import "./styles/style.scss";

import React, { Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles";
import GlobalStyles from "@mui/material/GlobalStyles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Only the auth layout is eager - it renders the login page, which is the
// first thing every visitor sees. The other four layouts are behind a login
// and must NOT be on the login critical path: importing Admin.jsx statically
// pulled in the admin navbar, which reaches SurgeryBeforeVisitsCheckReport,
// which statically imports jspdf + html2canvas. That put the 1.5 MB
// vendor-documents chunk into the entry bundle, so every visitor downloaded a
// PDF toolkit before the password field could paint. See CLAUDE.md section 10.
import AuthLayout from "layouts/Auth.jsx";

const PatientAuthLayout = lazy(() => import("layouts/PatientAuth.jsx"));
const AdminLayout = lazy(() => import("layouts/Admin.jsx"));
const PatientLayout = lazy(() => import("layouts/Patient.jsx"));
const TestLayout = lazy(() => import("layouts/Test.jsx"));

import PageLoading from "customComponents/PageLoading.jsx";
import NavigationSetter from "./NavigationSetter.jsx";

import { Provider } from "react-redux";
import store from "store";
import theme from "./theme";
import { colors } from "./theme/colors";
import "./i18n";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <Suspense fallback={<PageLoading />}>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            {/* The iOS zoom backstop, for controls the theme cannot reach.
                `theme.js` raises every MUI input to 16px on a coarse pointer,
                but several controls in this app are RAW <input> elements that
                never go through MuiInputBase - the top-bar patient search and
                the grid filter row among them - so no component override can
                reach them. A browser probe measured those still at 11px, which
                makes iOS Safari zoom the entire page on focus and forces the
                doctor to pinch back out after every search.

                Scoped to `pointer: coarse`, so it cannot affect desktop, and
                to form controls only. This is MUI's own GlobalStyles rather
                than an edit to style.scss, whose element-level selectors lose
                to emotion anyway (see CLAUDE.md section 6). */}
            <GlobalStyles
              styles={{
                "@media (pointer: coarse)": {
                  "input, select, textarea": { fontSize: "16px !important" },
                },
              }}
            />
            {/* Plain links in brand ink. _misc.scss sets every <a> to the
                template purple (#9c27b0) - the register-number links in every
                grid, "Doctor profile" links, ticket links - and that file is
                off-limits (CLAUDE.md section 6). `html a` is (0,0,2), so it
                beats the (0,0,1) template rule whatever the injection order,
                while any link styled by a class (MUI Link, the sidebar, the top
                bar) still keeps its own colour. */}
            <GlobalStyles
              styles={{
                "html a": { color: colors.brand.cyanInk },
                "html a:hover, html a:focus": {
                  color: colors.brand.cyanInkHover,
                },
              }}
            />
            <BrowserRouter>
              <NavigationSetter />
              <Routes>
                <Route path="/auth/*" element={<AuthLayout />} />
                <Route path="/patientAuth/*" element={<PatientAuthLayout />} />
                <Route path="/test/*" element={<TestLayout />} />
                <Route path="/admin/*" element={<AdminLayout />} />
                <Route path="/patient/*" element={<PatientLayout />} />
                <Route
                  path="/"
                  element={<Navigate to="/auth/login" replace />}
                />
                <Route
                  path="*"
                  element={<Navigate to="/auth/login" replace />}
                />
              </Routes>
            </BrowserRouter>
          </ThemeProvider>
        </StyledEngineProvider>
      </QueryClientProvider>
    </Provider>
  </Suspense>,
);
