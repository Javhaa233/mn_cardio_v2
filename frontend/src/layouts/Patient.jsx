import { useTranslation } from "react-i18next";
import React, { useEffect, useState, useRef, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { styled } from "@mui/material/styles";
// core components
import PatientNavbar from "components/Navbars/PatientNavbar.jsx";
import PatientBottomNav, {
  BOTTOM_NAV_INSET,
} from "components/Navbars/PatientBottomNav.jsx";
import Sidebar from "components/Sidebar/Sidebar.jsx";
import BaseLoading from "customComponents/BaseLoading.jsx";
import NotFound from "view/NotFound.jsx";
import ErrorBoundary from "components/ErrorBoundary";
// import FixedPlugin from "components/FixedPlugin/FixedPlugin.jsx";

import routes from "routes/index.js";

import {
  drawerWidth,
  drawerMiniWidth,
  transition,
} from "assets/jss/material-dashboard-pro-react.js";
import { colors } from "@/theme/colors";
import { layout } from "@/theme/tokens";
import { useIsPhone } from "helper/useResponsive";
import { useTheme, ThemeProvider } from "@mui/material/styles";
import patientTheme, { PATIENT_TYPE } from "@/theme/patientTheme";
import Helper from "helper";
import Chat from "customComponents/Chat/Chat.jsx";
import ChatProvider from "customComponents/Chat/ChatProvider.jsx";

const Wrapper = styled("div")({
  position: "relative",
  top: "0",
  // dvh, not vh. On iOS Safari `100vh` is the LARGE viewport - the height the
  // page would have if the URL bar were collapsed - so the last stretch of the
  // page sits under the browser chrome while a position:fixed bottom bar
  // tracks the visual viewport instead. The two then disagree and the bar
  // visibly jumps as the URL bar shows and hides.
  height: "100dvh",
  minHeight: "100dvh",
  display: "flex",
  flexDirection: "row",
  "&:after": { display: "table", clear: "both", content: '" "' },
});

const MainPanel = styled("div", {
  shouldForwardProp: (prop) => prop !== "miniActive",
})(({ theme, miniActive }) => ({
  transitionProperty: "top, bottom, width",
  transitionDuration: ".2s, .2s, .35s",
  transitionTimingFunction: "linear, linear, ease",
  position: "relative",
  flex: "1 1 auto",
  ...transition,
  height: "100%",
  minHeight: 0,
  maxHeight: "100%",
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
  // See the long note in layouts/Admin.jsx - overflow was hidden on BOTH this
  // pane and Content, so anything too wide was clipped and unreachable rather
  // than scrollable.
  overflowX: "auto",
  overflowY: "auto",
  backgroundColor: colors.brand.canvas,
  WebkitOverflowScrolling: "touch",
  display: "flex",
  flexDirection: "column",
  [theme.breakpoints.up("md")]: {
    marginLeft: `${miniActive ? drawerMiniWidth : drawerWidth}px`,
    width: `calc(100% - ${miniActive ? drawerMiniWidth : drawerWidth}px)`,
  },
}));

const Content = styled("div")(({ theme }) => ({
  padding: "20px 10px 10px 10px",
  [theme.breakpoints.down("sm")]: {
    padding: "12px 6px 6px 6px",
    // Room for the fixed bottom bar, which is out of flow and would otherwise
    // cover the last rows of every page.
    paddingBottom: BOTTOM_NAV_INSET,
  },
  boxSizing: "border-box",
  // Was a hardcoded #EEEEEE while Admin used colors.brand.canvas (#eaf2f8), so
  // the patient portal was a different grey from the rest of the app for no
  // stated reason. One canvas, one token.
  backgroundColor: colors.brand.canvas,
  display: "flex",
  flexDirection: "column",
  flex: 1,
  minHeight: 0,
  minWidth: 0,
  overflowX: "visible",
  overflowY: "visible",

  // THE PATIENT TYPE BASELINE. See theme/patientTheme.js for why this is a CSS
  // rule and not a theme setting: this app has no <CssBaseline>, so baseline
  // type comes from `body { font-size: 14px }` in _misc.scss, and
  // `theme.typography` cannot reach a bare <Box>, <div> or <span> - which is
  // what the patient screens are almost entirely built from.
  //
  // An emotion class beats the inherited `body` value easily, and inheritance
  // carries it down the whole patient subtree.
  fontSize: PATIENT_TYPE.body,
  lineHeight: PATIENT_TYPE.lineHeight,

  // `styles/style.scss` sets `table { font-size: 13px }`. That is an element
  // selector, which beats INHERITANCE outright no matter what the ancestor
  // says, so the rule above cannot reach a table on its own. The patient
  // screens that render tables (ЗСӨ above all) need it restated.
  "& table": {
    fontSize: PATIENT_TYPE.table,
  },
}));

export default function Patient(props) {
  const { t } = useTranslation();
  const { ...rest } = props;

  const LogedUser = Helper.AuthHelper.GetLogedUserLocal();
  const IsPatient = !!LogedUser && LogedUser.RoleId + "" === "4";

  // states and functions
  const theme = useTheme();
  const isPhone = useIsPhone();
  const location = useLocation();

  /**
   * The Асуулт screen IS the chat, full width. Floating a chat button over it
   * opens a second, smaller copy of the same conversation on top of the one
   * already on screen - and on a phone the button lands exactly on the send
   * arrow, so the composer could not be submitted by tap at all.
   */
  const ChatIsThePage = location.pathname.startsWith(
    "/patient/PatientQuestion",
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const [miniActive, setMiniActive] = useState(
    window.innerWidth <= layout.sidebarAutoMini ? true : false,
  );
  // const [image, setImage] = useState(null);
  //   const [color, setColor] = useState("blue");
  //   const [bgColor, setBgColor] = useState("black");
  // const [hasImage, setHasImage] = useState(true);
  //   const [fixedClasses, setFixedClasses] = useState("dropdown");
  // const [logo, setLogo] = useState(require("assets/img/logo-white.svg"));
  // ref for main panel div
  // useRef, not createRef: createRef in a function component allocates a fresh
  // ref every render, so the node was never actually retained. Admin.jsx was
  // fixed for this; this shell was left behind.
  const mainPanel = useRef(null);
  // Empty dependency array. Without one this re-registered the resize listener
  // on every single render.
  useEffect(() => {
    window.addEventListener("resize", resizeFunction);

    // Specify how to clean up after this effect:
    return function cleanup() {
      window.removeEventListener("resize", resizeFunction);
    };
  }, []);

  useEffect(() => {
    if (!LogedUser) {
      document.location = "/patientAuth/login";
    } else if (!IsPatient) {
      document.location = "/admin";
    }
  }, [LogedUser, IsPatient]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const getRoutes = (routes) => {
    return (
      Array.isArray(routes) &&
      routes.map((prop, key) => {
        if (prop.collapse) return getRoutes(prop.views);
        if (
          prop.layout === "/patient" &&
          Helper.AuthHelper.CheckRole(prop.roles) === true
        ) {
          const Component = prop.component;
          return <Route path={prop.path} element={<Component />} key={key} />;
        } else {
          return null;
        }
      })
    );
  };
  const sidebarMinimize = () => {
    setMiniActive(!miniActive);
  };
  const resizeFunction = () => {
    // Named token, not a breakpoint - see tokens.js.
    if (window.innerWidth <= layout.sidebarAutoMini) {
      setMiniActive(true);
    } else {
      setMiniActive(false);
    }
    // At `md` the permanent drawer takes over from the temporary one.
    if (window.innerWidth >= theme.breakpoints.values.md) {
      setMobileOpen(false);
    }
  };

  if (!IsPatient) {
    return null;
  }

  return (
    // Patients had no chat at all. Mobile tender §8 owes them "Эмчээс асуух
    // асуулт" - a conversation with their own doctor. The chat components are
    // role-agnostic; what differs is entirely server-side: /Chat/SearchUsers
    // narrows a patient to their care team and strips contact details, and the
    // member-management routes refuse RoleId 4 outright.
    <ChatProvider>
      {/* Around <Wrapper>, deliberately - NOT around <MainPanel>. <Sidebar>
          and <Chat /> are siblings of MainPanel, so scoping the provider any
          tighter would leave the patient's navigation and their conversation
          with the doctor at doctor density. Portals (Dialog, Menu, Popover,
          Tooltip) inherit through React context rather than the DOM, so they
          follow correctly from here. */}
      <ThemeProvider theme={patientTheme}>
        <Wrapper>
          <Sidebar
            LogedUser={Helper.AuthHelper.GetLogedUserLocal()}
            routes={routes}
            layout="/patient"
            handleDrawerToggle={handleDrawerToggle}
            open={mobileOpen}
            color="white"
            bgColor="blue"
            sidebarMinimize={sidebarMinimize}
            miniActive={miniActive}
            {...rest}
          />
          <MainPanel miniActive={miniActive} ref={mainPanel}>
            <PatientNavbar handleDrawerToggle={handleDrawerToggle} {...rest} />
            <Content>
              {/* The patient portal and the sign-in screens had no error
                  boundary at all. A render-time throw anywhere below here
                  unmounted the whole tree and left a blank page with no
                  message. The doctor layout has been protected all along -
                  every page there goes through PageTabs -> TabPanel ->
                  TabErrorBoundary - so this was the citizen-facing half of the
                  app, which is an explicit tender deliverable.
                  components/ErrorBoundary already existed, fully written and
                  in Mongolian; it just had no callers. */}
              <ErrorBoundary>
                <Suspense fallback={<BaseLoading />}>
                  <Routes>
                    {getRoutes(routes)}
                    <Route
                      path="/"
                      element={<Navigate to="/patient/PatientHome" replace />}
                    />
                    <Route
                      path="*"
                      element={<NotFound HomePath="/patient" />}
                    />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </Content>
          </MainPanel>
          {/* Outside MainPanel deliberately. MainPanel is `overflowX: auto`,
              and a position:fixed child spanning the viewport inside a
              scrolling box can force a horizontal scrollbar on that pane.
              Wrapper is a flex row and an out-of-flow child disturbs nothing.

              The chat dock is raised to clear the bar - via a prop, not a role
              check inside Chat, because Chat is shared with the doctor shell
              where there is no bar. */}
          <PatientBottomNav
            onOpenMenu={handleDrawerToggle}
            menuOpen={mobileOpen}
          />
          {ChatIsThePage ? null : (
            <Chat BottomOffset={isPhone ? layout.bottomNavHeight + 14 : 30} />
          )}
        </Wrapper>
      </ThemeProvider>
    </ChatProvider>
  );
}
