import { useTranslation } from "react-i18next";
import React, { useEffect, useState, useRef } from "react";
// import cx from "classnames"; // No longer needed for class composition if we use styled props

// custom components
import Chat from "customComponents/Chat/Chat.jsx";
import ChatProvider from "customComponents/Chat/ChatProvider.jsx";
import PageTabs from "customComponents/PageTabs";

// core components
import AdminNavbar from "components/Navbars/AdminNavbar.jsx";
import Sidebar from "components/Sidebar/Sidebar.jsx";
// routes
import routes from "routes/index.js";

// styles
import { styled } from "@mui/material/styles";
import {
  drawerWidth,
  drawerMiniWidth,
  transition,
} from "assets/jss/material-dashboard-pro-react.js";
import { colors } from "@/theme/colors";
import { layout } from "@/theme/tokens";
import { useTheme } from "@mui/material/styles";

// helper
import Helper from "helper";
import Notify from "newComponents/Notify";

// redux
import { setAlert } from "store/reducers/system";
import { useDispatch } from "react-redux";

const Wrapper = styled("div")({
  position: "relative",
  top: "0",
  height: "100vh",
  minHeight: "100vh",
  display: "flex",
  flexDirection: "row",
  "&:after": { display: "table", clear: "both", content: '" "' },
});

const MainPanel = styled("div", {
  shouldForwardProp: (prop) => prop !== "miniActive" && prop !== "hideSidebar",
})(({ theme, miniActive, hideSidebar }) => ({
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
  // `auto`, not `hidden`. This pane and Content BOTH used to be overflowX
  // hidden, which meant anything too wide for the viewport was clipped and
  // silently unreachable rather than scrollable - the app looked intact on a
  // tablet while hiding content. MainPanel is already the vertical scroll
  // container (PageTabs restores per-tab scroll against it), so making it the
  // horizontal one too keeps a single scroller instead of nesting a second.
  //
  // This is a SAFETY NET, not the design. Wide things - clinical tables, the
  // coronary segment grid - should scroll inside their own container so the
  // page itself does not move sideways. Where you see the whole page scrolling
  // horizontally, that is a wide element still missing its own wrapper.
  overflowX: "auto",
  overflowY: "auto",
  // Content paints the canvas, but only across its own box. Once the pane
  // scrolls sideways past that box the same colour has to be underneath, or a
  // strip of raw body grey appears.
  backgroundColor: colors.brand.canvas,
  WebkitOverflowScrolling: "touch",
  display: "flex",
  flexDirection: "column",
  [theme.breakpoints.up("md")]: {
    marginLeft: hideSidebar
      ? "0px"
      : `${miniActive ? drawerMiniWidth : drawerWidth}px`,
    width: hideSidebar
      ? "100%"
      : `calc(100% - ${miniActive ? drawerMiniWidth : drawerWidth}px)`,
  },
}));

const Content = styled("div")(({ theme }) => ({
  padding: "6px 10px 10px 10px",
  [theme.breakpoints.down("sm")]: {
    padding: "6px 6px 6px 6px",
  },
  boxSizing: "border-box",
  // The canvas behind every admin route, declared once. Four different greys
  // used to stack here - body #eeeeee, this #E0E0E0, AdviceHome's own #f0f0f0
  // and GroupPanel's #fafafa - none of them from a token. Pages should not set
  // their own page background; if one does, it is fighting this line.
  backgroundColor: colors.brand.canvas,
  display: "flex",
  flexDirection: "column",
  flex: 1,
  minHeight: 0,
  minWidth: 0,
  // `visible`, not `hidden`: let overflow escape to MainPanel, which can
  // actually scroll it. Note these two must stay in step - CSS forces the
  // other axis to `auto` as soon as one axis is not `visible`, so setting
  // overflowX here to `auto` would quietly turn Content into a second vertical
  // scroller and break PageTabs' scroll restoration.
  overflowX: "visible",
  overflowY: "visible",
}));

export default function Admin(props) {
  const { t } = useTranslation();
  const { ...rest } = props;
  const dispatch = useDispatch();

  const LogedUser = Helper.AuthHelper.GetLogedUserLocal();

  if (!LogedUser) {
    document.location = "/auth/login";
  } else if (LogedUser && LogedUser.RoleId + "" === "4") {
    document.location = "/patient";
  }

  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const hideSidebar = false;
  const [miniActive, setMiniActive] = useState(
    window.innerWidth <= layout.sidebarAutoMini ? true : false,
  );

  // useRef, not createRef: createRef in a function component allocates a fresh
  // ref on every render, so the node was never actually retained.
  const mainPanel = useRef(null);

  // Empty dependency array: this used to re-register the listener on every
  // render, which matters much more now that tab state makes Admin re-render
  // far more often than it used to.
  useEffect(() => {
    window.addEventListener("resize", resizeFunction);
    return function cleanup() {
      window.removeEventListener("resize", resizeFunction);
    };
  }, []);

  // functions for changeing the states from components
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
    setMiniActive(false);
  };

  const sidebarMinimize = () => {
    setMiniActive(!miniActive);
  };

  const resizeFunction = () => {
    // `sidebarAutoMini` is a named token, not a breakpoint - it matches no
    // entry in theme.breakpoints on purpose (see tokens.js).
    if (window.innerWidth <= layout.sidebarAutoMini) setMiniActive(true);
    else setMiniActive(false);

    // At `md` the permanent drawer takes over, so a temporary drawer left open
    // from a narrower width would sit on top of it.
    if (window.innerWidth >= theme.breakpoints.values.md) setMobileOpen(false);
  };

  return (
    // Wraps the whole layout so anything in the page tree can start a
    // conversation - UserProfile's "Чат бичих" needs to open the dock on a
    // specific room. This costs nothing: `children` keeps its identity across
    // the provider's own re-renders, so React skips the page subtree and only
    // actual useChatContext consumers re-render when a message arrives.
    <ChatProvider>
      <Wrapper>
        {!hideSidebar && (
          <Sidebar
            LogedUser={Helper.AuthHelper.GetLogedUserLocal()}
            routes={routes}
            layout="/admin"
            handleDrawerToggle={handleDrawerToggle}
            open={mobileOpen}
            color="white"
            sidebarMinimize={sidebarMinimize}
            miniActive={miniActive}
            {...rest}
          />
        )}
        <MainPanel
          ref={mainPanel}
          miniActive={miniActive}
          hideSidebar={hideSidebar}
        >
          <Notify
            onDismiss={() => dispatch(setAlert(null))}
            selector={"system.alert"}
          />
          <AdminNavbar handleDrawerToggle={handleDrawerToggle} {...rest} />
          <Content>
            <div
              style={{
                minHeight: 0,
                display: "flex",
                flexDirection: "column",
                flex: 1,
              }}
            >
              {/* Replaces <Routes>. Every open page stays mounted and only the
                active one is shown, so a half-filled form survives a trip to
                another patient. See customComponents/PageTabs/index.jsx. */}
              <PageTabs
                routes={routes}
                layoutPath="/admin"
                homePath="/admin/AdviceHome"
                // MainPanel is the scrolling ancestor, so per-tab scroll position
                // is saved and restored against it.
                scrollRef={mainPanel}
              />
            </div>
          </Content>
        </MainPanel>
        <Chat />
      </Wrapper>
    </ChatProvider>
  );
}
