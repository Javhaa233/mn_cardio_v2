/*eslint-disable*/
import React, { Component, createRef } from "react";
import { withTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { NavLink, useLocation } from "react-router-dom";

// @mui/material components
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import Icon from "@mui/material/Icon"
import Box from "@mui/material/Box";
import Badge from "@mui/material/Badge";

// material-ui icons
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

// core components
import Button from "components/CustomButtons/Button";
import CustomTooltip from "customComponents/CustomTooltip";

import { sidebarSx } from "assets/jss/material-dashboard-pro-react/components/sidebarStyle.js";
import { drawerMiniWidth, drawerWidth } from "assets/jss/material-dashboard-pro-react.js";
import { layout } from "@/theme/tokens";
import { colors } from "@/theme/colors";
import appTheme from "@/theme.js";
import Helper from "helper";
import { usePendingRequests } from "helper/PendingRequests";

class SidebarWrapper extends Component {
  render() {
    const t = this.props.t;
    const { className, headerLinks, links, style } = this.props;
    return (
      <OverlayScrollbarsComponent
        className={className}
        options={{
          scrollbars: {
            autoHide: "scroll",
            autoHideDelay: 600,
            clickScrolling: true,
            dragScrolling: true
          },
          overflow: {
            x: 'hidden',
            y: 'scroll'
          }
        }}
        style={{ flex: "1 1 auto", minHeight: 0, minWidth: 0, maxWidth: "100%", ...(style || {}) }}
      >
        {headerLinks}
        {links}
      </OverlayScrollbarsComponent>
    );
  }
}

class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openAvatar: false,
      miniActive: true,
      ...this.getCollapseStates(props.routes),
    };
  }

  mainPanel = createRef();

  getCurrentPathname = () => {
    if (this.props.location?.pathname) {
      return this.props.location.pathname;
    }
    try {
      return window.location?.pathname || new URL(window.location.href).pathname;
    } catch (e) {
      return window.location?.pathname || "";
    }
  };

  normalizePath = (p) => {
    if (!p) return "";
    const s = (p + "").split("?")[0].split("#")[0];
    // collapse multiple slashes and remove trailing slash (except root)
    const collapsed = s.replace(/\/+/g, "/");
    const noTrailing = collapsed.length > 1 ? collapsed.replace(/\/$/, "") : collapsed;
    return noTrailing.toLowerCase();
  };

  isPathActive = (targetPath) => {
    const pathname = this.normalizePath(this.getCurrentPathname());
    const target = this.normalizePath(targetPath);
    if (!target) return false;
    if (pathname === target) return true;
    return pathname.startsWith(target + "/");
  };

  getCollapseStates = (routes) => {
    let initialState = {};
    routes.map((prop) => {
      if (prop.collapse) {
        initialState = {
          [prop.state]: this.getCollapseInitialState(prop.views),
          ...this.getCollapseStates(prop.views),
          ...initialState,
        };
      }
      return null;
    });
    return initialState;
  };

  getCollapseInitialState(routes) {
    for (let i = 0; i < routes.length; i++) {
      if (routes[i].collapse && this.getCollapseInitialState(routes[i].views)) {
        return true;
      } else if (this.isPathActive(this.props.layout + routes[i].path)) {
        return true;
      }
    }
    return false;
  }

  activeRoute = (routeName) => {
    return this.isPathActive(this.props.layout + routeName) ? "active" : "";
  };

  blurOnPointerDown = (e) => {
    const el = e?.currentTarget;
    if (el && typeof el.blur === "function") {
      el.blur();
    }
  };

  openCollapse(collapse) {
    var st = {};
    st[collapse] = !this.state[collapse];
    this.setState(st);
  }

  openCollapseAccordion = (collapseKey, routes) => {
    const next = !this.state[collapseKey];
    const st = { [collapseKey]: next };
    if (next) {
      routes.forEach((r) => {
        if (r && r.collapse && r.state && r.state !== collapseKey) {
          st[r.state] = false;
        }
      });
    }
    this.setState(st);
  };

  createLinks = (routes) => {
    const { layout, t } = this.props;
    return routes.map((prop, key) => {
      if (prop.redirect) return null;

      if (
        prop.layout !== layout ||
        Helper.AuthHelper.CheckRole(prop.roles) !== true
      ) {
        return null;
      }

      if (prop.collapse) {
    const { t } = this.props;
        const isMini = this.props.miniActive && this.state.miniActive;
        const isCollapseActive = this.getCollapseInitialState(prop.views);

        const navLinkSx = {
          ...sidebarSx.itemLink,
          ...(isMini ? sidebarSx.itemLinkMini : null),
          ...(isCollapseActive ? sidebarSx.collapseActive : null)
        };

        const itemTextSx = {
          ...sidebarSx.itemText,
          ...(isMini ? sidebarSx.itemTextMini : null)
        };

        const collapseItemTextSx = {
          ...sidebarSx.collapseItemText,
          ...(isMini ? sidebarSx.collapseItemTextMini : null)
        };

        return (
          <ListItem
            key={key}
            sx={prop.icon ? sidebarSx.item : sidebarSx.collapseItem}
          >
            <CustomTooltip
              title={prop.name}
              placement="right"
              Disabled={!this.props.miniActive}
            >
              <div>
                <Box
                  component={NavLink}
                  to={"#"}
                  sx={navLinkSx}
                  onMouseDown={this.blurOnPointerDown}
                  onTouchStart={this.blurOnPointerDown}
                  onClick={(e) => {
                    e.preventDefault();
                    this.openCollapseAccordion(prop.state, routes);
                  }}
                >
                  {prop.icon ? (
                    typeof prop.icon === "string" ? (
                      <Icon sx={sidebarSx.itemIcon}>{prop.icon}</Icon>
                    ) : (
                      React.createElement(prop.icon, {
                        style: sidebarSx.itemIcon
                      })
                    )
                  ) : (
                    <Box component="span" sx={sidebarSx.collapseItemMini}>
                      {prop.mini}
                    </Box>
                  )}
                  <ListItemText
                    primary={t(prop.name + "")}
                    secondary={
                      <Box
                        component="b"
                        sx={{
                          ...sidebarSx.caret,
                          ...(this.state[prop.state] ? sidebarSx.caretActive : null)
                        }}
                      />
                    }
                    disableTypography={true}
                    sx={prop.icon ? itemTextSx : collapseItemTextSx}
                  />
                </Box>
              </div>
            </CustomTooltip>
            <Collapse
              in={
                this.state[prop.state] &&
                !(this.props.miniActive && this.state.miniActive)
              }
              unmountOnExit
            >
              <List sx={{ ...sidebarSx.list, ...sidebarSx.collapseList }}>
                {this.createLinks(prop.views)}
              </List>
            </Collapse>
          </ListItem>
        );
      }

      const isMini = this.props.miniActive && this.state.miniActive;
      const isActive = this.activeRoute(prop.path) !== "";

      const innerNavLinkSx = {
        ...sidebarSx.collapseItemLink,
        ...(isMini ? sidebarSx.itemLinkMini : null),
        ...(isActive ? sidebarSx.white : null)
      };

      const navLinkSx = {
        ...sidebarSx.itemLink,
        ...(isMini ? sidebarSx.itemLinkMini : null),
        ...(isActive ? sidebarSx.white : null)
      };

      const itemTextSx = {
        ...sidebarSx.itemText,
        ...(isMini ? sidebarSx.itemTextMini : null)
      };

      const collapseItemTextSx = {
        ...sidebarSx.collapseItemText,
        ...(isMini ? sidebarSx.collapseItemTextMini : null)
      };

      // Opt-in per route: everything without a `Badge` key is unchanged.
      const BadgeCounts = this.props.badgeCounts || {};
      const BadgeCount = prop.Badge ? BadgeCounts[prop.Badge] || 0 : 0;

      return (
        <ListItem
          key={key}
          sx={prop.icon ? sidebarSx.item : sidebarSx.collapseItem}
        >
          <CustomTooltip
            title={
              BadgeCount ? `${t(prop.name + "")} (${BadgeCount})` : t(prop.name + "")
            }
            placement="right"
            Disabled={!this.props.miniActive}
          >
            <div>
              <Box
                component={NavLink}
                to={prop.layout + prop.path}
                sx={prop.icon ? navLinkSx : innerNavLinkSx}
                onMouseDown={this.blurOnPointerDown}
                onTouchStart={this.blurOnPointerDown}
              >
                {prop.icon ? (
                  /* The badge rides the ICON, not the label: the label is
                     display:none in the mini rail, where the count matters
                     most. Cyan, not red - red is reserved for clinically
                     urgent things (CLAUDE.md §6). */
                  <Badge
                    badgeContent={BadgeCount}
                    max={99}
                    invisible={!BadgeCount}
                    sx={{
                      flex: "0 0 26px",
                      display: "inline-flex",
                      "& .MuiBadge-badge": {
                        backgroundColor: colors.brand.cyanInk,
                        color: "#fff",
                        fontSize: "10px",
                        height: "16px",
                        minWidth: "16px",
                      },
                    }}
                  >
                    {typeof prop.icon === "string" ? (
                      <Icon sx={sidebarSx.itemIcon}>{prop.icon}</Icon>
                    ) : (
                      <Box component={prop.icon} sx={sidebarSx.itemIcon} />
                    )}
                  </Badge>
                ) : (
                  <Box component="span" sx={sidebarSx.collapseItemMini}>
                    {prop.mini}
                  </Box>
                )}
                <ListItemText
                  primary={
                    BadgeCount ? `${t(prop.name + "")} (${BadgeCount})` : t(prop.name + "")
                  }
                  disableTypography={true}
                  sx={prop.icon ? itemTextSx : collapseItemTextSx}
                />
              </Box>
            </div>
          </CustomTooltip>
        </ListItem>
      );
    });
  };

  render() {
    const { routes } = this.props;

    const isMini = this.props.miniActive && this.state.miniActive;

    const links = (
      <List sx={sidebarSx.list}>{this.createLinks(routes)}</List>
    );

    const itemTextSx = {
      ...sidebarSx.itemText,
      ...(isMini ? sidebarSx.itemTextMini : null)
    };

    const itSystemLinks = (
      <List sx={{ ...sidebarSx.list, marginTop: 0 }}>
        <ListItem sx={sidebarSx.item}>
          <CustomTooltip
            title={"IT System LLC"}
            placement="right"
            Disabled={!this.props.miniActive}
          >
            <div>
              <Box
                component="a"
                href="https://www.itsystem.mn"
                target="_blank"
                rel="noreferrer"
                sx={{
                  ...sidebarSx.itemLink,
                  ...(isMini ? sidebarSx.itemLinkMini : null),
                }}
              >
                <Icon sx={sidebarSx.itemIcon}>language</Icon>
                <ListItemText
                  primary={"IT System LLC"}
                  disableTypography={true}
                  sx={itemTextSx}
                />
              </Box>
            </div>
          </CustomTooltip>
        </ListItem>
      </List>
    );

    const logoNormalSx = {
      ...sidebarSx.logoNormal,
      ...(isMini ? sidebarSx.logoNormalSidebarMini : null)
    };

    const brand = (
      <Box sx={sidebarSx.sidebarHeader}>
        {!this.props.miniActive ? (
          <Box sx={sidebarSx.logo}>
            <Box component="a" href="#" sx={logoNormalSx}>
              Mn Cardio
            </Box>
          </Box>
        ) : null}
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <Box sx={sidebarSx.sidebarMinimize}>
            {this.props.miniActive ? (
              <Button
                justIcon
                round
                color="white"
                simple
                onClick={this.props.sidebarMinimize}
              >
                <MenuIcon style={{ width: "22px", height: "22px" }} />
              </Button>
            ) : (
              <Button
                justIcon
                round
                color="white"
                simple
                onClick={this.props.sidebarMinimize}
              >
                <CloseIcon style={{ width: "22px", height: "22px" }} />
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    );

    // TWO paper styles, not one.
    //
    // These used to be a single object shared by the permanent and the
    // temporary Drawer, which is why the temporary one was wrong: it inherited
    // the permanent drawer's fixed 260/80px width and an off-canvas transform
    // meant for a non-MUI slide-out.
    const permanentPaperSx = {
      ...sidebarSx.drawerPaper,
      width: isMini ? drawerMiniWidth : drawerWidth,
      [appTheme.breakpoints.up("md")]: {
        ...(sidebarSx.drawerPaper?.[appTheme.breakpoints.up("md")] || {}),
        width: isMini ? drawerMiniWidth : drawerWidth,
      },
      ...sidebarSx.blueBackground,
    };

    // The temporary drawer is a different object on purpose.
    //
    // - Width comes from a token capped against the viewport
    //   (`min(85vw, 300px)`). A flat 260px leaves a 100px sliver of page on a
    //   360px phone, and the 80px mini width is meaningless here - there is no
    //   "collapsed rail" when the drawer is an overlay.
    // - NO transform. MUI's Slide owns that; setting our own moved the paper
    //   out from under its own animation.
    // - NO left/right. `anchor` decides the edge.
    // - The gradient is painted DIRECTLY on the paper, not through
    //   `sidebarSx.blueBackground`. That object carries only
    //   `&:after { background }`; the `content`, `position: absolute` and
    //   100%x100% sizing that make the pseudo-element exist at all live in
    //   `sidebarSx.drawerPaper`, which this object deliberately does not
    //   spread. Borrowing `blueBackground` on its own therefore produced an
    //   `::after` with no `content`: it never generated, the gradient never
    //   painted, and the drawer slid open as MUI Paper's near-white
    //   `background.paper` (#f8f9fa) carrying white text and white icons. The
    //   menu was fully rendered and completely unreadable - which is why the
    //   burger looked like it did nothing on tablet and phone.
    //   No overlay is needed here: nothing has to sit under it.
    const temporaryPaperSx = {
      border: "none",
      // Same ramp the permanent drawer overlays, read from the same place so
      // the two cannot drift apart.
      backgroundImage: sidebarSx.blueBackground["&:after"].background,
      color: sidebarSx.blueBackground.color,
      boxShadow: sidebarSx.drawerPaper.boxShadow,
      width: layout.drawerMobileWidth,
      maxWidth: "100%",
      height: "100%",
      overflowY: "auto",
    };

    const sidebarWrapperStyle = {
      ...sidebarSx.sidebarWrapper,
      // `100%` of whichever paper is hosting it, rather than a repeat of the
      // permanent drawer's pixel width. The mobile drawer's paper is a
      // viewport-relative `min(85vw, 300px)`, so a hardcoded 260/80 here
      // overflowed or under-filled it depending on the phone.
      width: "100%",
      // Flex owns the height. The base sidebarWrapper style hardcodes
      // `calc(100vh - 75px)`, which guesses the logo's height and ignores the
      // footer entirely; the previous `height: 0px` override cancelled it but
      // left the flex base size resolving off zero. `height: auto` with
      // `flex: 1 1 0` and `minHeight: 0` is the setup that actually makes an
      // over-long menu scroll: the host takes exactly the space between the
      // logo and the footer, and scrolls whatever does not fit.
      height: "auto",
      flex: "1 1 0",
      minHeight: 0,
      minWidth: 0,
      maxWidth: "100%",
      overflowX: "hidden",
      paddingBottom: "0"
    };

    // Which drawer is live is decided by `sx` ON THE DRAWER, not by a wrapper
    // element around it.
    //
    // A wrapping <Box display={{ xs:'block', md:'none' }}> looks like it gates
    // the temporary drawer and gates NOTHING: `variant="temporary"` is a MUI
    // Modal, and a Modal renders through a Portal into document.body, so it is
    // not a child of that Box in the DOM and never inherits its `display`.
    // The only thing keeping two drawers off the screen at once was
    // Admin.jsx's resize handler forcing `open` false at md - a runtime
    // guard standing in for a layout rule, and one that a first paint at md+
    // with a stale open flag would walk straight past.
    //
    // A Drawer's own `sx` lands on its root - the Modal root for the
    // temporary one, which IS the portaled node - so it applies where the
    // element actually is. This is MUI's own responsive-drawer pattern.
    return (
      <div ref={this.mainPanel}>
        <Drawer
          variant="temporary"
          anchor="right"
          open={this.props.open}
          sx={{ display: { xs: "block", md: "none" } }}
          PaperProps={{ sx: temporaryPaperSx }}
          onClose={this.props.handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
            {brand}
            <SidebarWrapper
              className=""
              links={links}
              style={sidebarWrapperStyle}
            />
            <Box sx={{ mt: "auto", flex: "0 0 auto", paddingBottom: "12px", backgroundColor: "transparent", zIndex: 5, position: "relative" }}>
              {itSystemLinks}
            </Box>
          </Box>
        </Drawer>
        <Drawer
          anchor="left"
          variant="permanent"
          open
          sx={{ display: { xs: "none", md: "block" } }}
          PaperProps={{ sx: permanentPaperSx }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
            {brand}
            <SidebarWrapper className="" links={links} style={sidebarWrapperStyle} />
            <Box sx={{ mt: "auto", flex: "0 0 auto", paddingBottom: "12px", backgroundColor: "transparent", zIndex: 5, position: "relative" }}>
              {itSystemLinks}
            </Box>
          </Box>
        </Drawer>
      </div>
    );
  }
}

Sidebar.propTypes = {
  routes: PropTypes.arrayOf(PropTypes.object),
  miniActive: PropTypes.bool,
  open: PropTypes.bool,
  handleDrawerToggle: PropTypes.func,
};

SidebarWrapper.propTypes = {
  className: PropTypes.string,
  headerLinks: PropTypes.object,
  links: PropTypes.object,
  style: PropTypes.object,
  sidebarMinimize: PropTypes.func,
};

/**
 * The hook seam for a class component: counts that a menu item wants to show
 * are read here and handed down as plain props.
 */
const SidebarWithLocation = (props) => {
  const location = useLocation();
  const pendingRequests = usePendingRequests();
  return (
    <Sidebar
      {...props}
      location={location}
      badgeCounts={{ UserRequestsPending: pendingRequests }}
    />
  );
};

export default withTranslation(undefined, { withRef: true })(SidebarWithLocation);
