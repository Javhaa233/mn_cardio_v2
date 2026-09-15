import React, { useEffect, useRef, useState } from "react";
// translation
import { useTranslation } from "react-i18next";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import {
  List,
  ListItem,
  Divider,
  Link,
  ClickAwayListener,
  Popper,
  Paper,
  Grow,
  Box,
  Typography,
  Avatar,
} from "@mui/material";
// @mui/icons-material
import Notifications from "@mui/icons-material/Notifications";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";

// core components
import TopBarIconButton from "components/Navbars/TopBarIconButton";
// helper
import Helper from "helper";
import { NotificationSocket } from "helper/ChatSocketHelper";
import { PlayNotificationSound } from "helper/NotificationSound";
import { useChatContext } from "customComponents/Chat/ChatContext";
import {
  IsChatNotification,
  OpenChatNotification,
} from "customComponents/Notification/chatNotification";
// history
import customHistory from "customHistory";

import { adminNavbarLinksSx } from "assets/jss/material-dashboard-pro-react/components/adminNavbarLinksStyle.js";

export default function Notification() {
  const { t } = useTranslation();
  const chat = useChatContext();

  const [openNotification, setOpenNotification] = useState(null);
  const [Data, setData] = useState([]);

  const LogedUser = Helper.AuthHelper.GetLogedUserLocal();

  var SearchOption = Helper.BaseCrudHelper.GetSearchOption();
  // CreateDate, not Id: a chat row is rewritten in place on every new message
  // (one row per room), so its Id is old but its CreateDate is the latest.
  SearchOption.OrderBy = { Field: "CreateDate", Type: "desc" };
  SearchOption.PageOption = { Page: 0, Limit: 10 };

  const handleClickNotification = (event) => {
    if (openNotification && openNotification.contains(event.target)) {
      setOpenNotification(null);
    } else {
      setOpenNotification(event.currentTarget);
    }
  };

  const handleCloseNotification = () => setOpenNotification(null);

  const GetData = async (after) => {
    if (LogedUser) {
      SearchOption.SearchField = [
        { Field: "ToUserId", Value: LogedUser.Id, Op: "Equals" },
      ];
      await Helper.NotificationHelper.GetListData(SearchOption, (resData) => {
        if (!resData) return;
        const rows = Array.isArray(resData.Data) ? resData.Data : [];
        setData(rows);
        after && after(rows);
      });
    }
  };

  const unreadCount =
    Data && Array.isArray(Data) ? Data.filter((s) => !s.Seen).length : 0;

  const GetDataRef = useRef(GetData);
  GetDataRef.current = GetData;

  useEffect(() => {
    GetData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live: the server emits `newNotification` with the row's Id. Refetch so the
  // badge and list are current, and chime for anything that is not a chat row -
  // ChatProvider already chimed for chat, and only it knows whether the reader
  // is looking at that conversation.
  useEffect(() => {
    if (!LogedUser) return undefined;
    NotificationSocket.Connect();
    const off = NotificationSocket.On("newNotification", (NotificationId) => {
      GetDataRef.current((rows) => {
        const row = rows.find((r) => String(r.Id) === String(NotificationId));
        if (!row || !IsChatNotification(row)) PlayNotificationSound();
      });
    });
    return off;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reading a chat marks its bell row seen on the server; follow that here.
  const unreadChats = chat ? chat.unreadTotal : 0;
  const prevUnreadChats = useRef(unreadChats);
  useEffect(() => {
    if (unreadChats < prevUnreadChats.current) GetDataRef.current();
    prevUnreadChats.current = unreadChats;
  }, [unreadChats]);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
      }}
    >
      <TopBarIconButton
        title={t("Notifications")}
        active={Boolean(openNotification)}
        aria-owns={openNotification ? "notification-menu-list" : null}
        aria-haspopup="menu"
        aria-expanded={Boolean(openNotification)}
        onClick={handleClickNotification}
        badge={{
          content: unreadCount,
          color: "error",
          invisible: !unreadCount,
        }}
      >
        {openNotification ? (
          <Notifications />
        ) : (
          <NotificationsNoneOutlinedIcon />
        )}
      </TopBarIconButton>
      <Popper
        open={Boolean(openNotification)}
        anchorEl={openNotification}
        transition
        placement="bottom-end"
        modifiers={[{ name: "offset", options: { offset: [0, 8] } }]}
        sx={{ zIndex: 1200 }}
      >
        {({ TransitionProps }) => (
          <Grow
            {...TransitionProps}
            id="notification-menu-list"
            style={{ transformOrigin: "0 0 0" }}
          >
            <Paper
              sx={{
                ...adminNavbarLinksSx.dropdown,
                width: "360px",
                maxWidth: "90vw",
                overflow: "hidden",
                borderRadius: "16px",
                boxShadow:
                  "0 4px 20px 0px rgba(0, 0, 0, 0.14), 0 7px 10px -5px rgba(64, 169, 255, 0.4)",
                padding: 0,
              }}
            >
              <ClickAwayListener onClickAway={handleCloseNotification}>
                <Box>
                  <Box
                    sx={{
                      p: 2,
                      borderBottom: "1px solid rgba(0,0,0,0.05)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      bgcolor: "#fff",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 700, fontSize: "16px" }}
                      >
                        {t("Notifications")}
                      </Typography>
                      {unreadCount > 0 && (
                        <Box
                          sx={{
                            bgcolor: "rgba(211, 47, 47, 0.1)",
                            color: "error.main",
                            px: 1,
                            py: 0.5,
                            borderRadius: "12px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            lineHeight: 1,
                          }}
                        >
                          {unreadCount}
                        </Box>
                      )}
                    </Box>

                    <Link
                      component="button"
                      onClick={() => {
                        customHistory.push("/admin/AllNotifications");
                        handleCloseNotification();
                      }}
                      underline="active"
                      sx={{
                        fontWeight: 600,
                        fontSize: "0.875rem",
                        color: "primary.main",
                        textDecoration: "none",
                        "&:hover": {
                          textDecoration: "underline",
                        },
                      }}
                    >
                      {t("All Notifications")}
                    </Link>
                  </Box>

                  <OverlayScrollbarsComponent
                    options={{
                      scrollbars: {
                        autoHide: "scroll",
                        autoHideDelay: 600,
                        clickScrolling: true,
                        dragScrolling: true,
                      },
                      overflow: {
                        x: "hidden",
                        y: "scroll",
                      },
                    }}
                    style={{
                      maxHeight: "400px",
                      backgroundColor: "#fff",
                    }}
                  >
                    <List sx={{ p: 0 }}>
                      {Array.isArray(Data) && Data.length > 0 ? (
                        Data.map((item, index) => (
                          <React.Fragment key={index}>
                            <ListItem
                              alignItems="flex-start"
                              component="div"
                              onClick={() => {
                                if (IsChatNotification(item)) {
                                  OpenChatNotification(chat, item, () =>
                                    GetDataRef.current(),
                                  );
                                  handleCloseNotification();
                                  return;
                                }
                                Helper.NotificationHelper.Seen(item, () => {
                                  // In-app navigation, so the doctor's other
                                  // work is not torn down. item.Url is
                                  // server-supplied: an absolute or off-origin
                                  // value would push a broken in-app route, so
                                  // only relative paths go through the router.
                                  if (String(item.Url).startsWith("/")) {
                                    customHistory.push(item.Url);
                                  } else {
                                    document.location = item.Url;
                                  }
                                  handleCloseNotification();
                                });
                              }}
                              sx={{
                                p: 2,
                                cursor: "pointer",
                                bgcolor: !item.Seen
                                  ? "rgba(25, 118, 210, 0.04)"
                                  : "transparent",
                                transition: "all 0.2s",
                                "&:hover": {
                                  bgcolor: "#e3f2fd",
                                },
                                position: "relative",
                                display: "flex",
                                gap: 1.5,
                              }}
                            >
                              <Avatar
                                sx={{
                                  bgcolor: !item.Seen
                                    ? "primary.main"
                                    : "grey.300",
                                  width: 40,
                                  height: 40,
                                }}
                              >
                                {IsChatNotification(item) ? (
                                  <ChatBubbleOutlineIcon fontSize="small" />
                                ) : item.CreateDoctorsProfile ? (
                                  item.CreateDoctorsProfile.FullName.charAt(
                                    0,
                                  ).toUpperCase()
                                ) : (
                                  <NotificationsNoneOutlinedIcon />
                                )}
                              </Avatar>

                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                {item.CreateDoctorsProfile && (
                                  <Typography
                                    variant="subtitle2"
                                    sx={{
                                      fontWeight: 600,
                                      fontSize: "0.9rem",
                                      lineHeight: 1.2,
                                      mb: 0.5,
                                    }}
                                  >
                                    {item.CreateDoctorsProfile.FullName}{" "}
                                    {t("doctor")}
                                  </Typography>
                                )}
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: "text.secondary",
                                    fontSize: "0.85rem",
                                    lineHeight: 1.4,
                                    mb: 1,
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                  }}
                                >
                                  {t(item.Notes + "")}
                                </Typography>

                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                    color: "text.disabled",
                                  }}
                                >
                                  <AccessTimeIcon sx={{ fontSize: 14 }} />
                                  <Typography
                                    variant="caption"
                                    sx={{ fontSize: "0.75rem" }}
                                  >
                                    {Helper.ObjectHelper.getDateYMDHMS({
                                      DateStr: item.CreateDate,
                                    })}
                                  </Typography>
                                </Box>
                              </Box>

                              {!item.Seen && (
                                <Box
                                  sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: "50%",
                                    bgcolor: "primary.main",
                                    mt: 1,
                                  }}
                                />
                              )}
                            </ListItem>
                            <Divider component="li" sx={{ my: 0 }} />
                          </React.Fragment>
                        ))
                      ) : (
                        <Box
                          sx={{
                            p: 4,
                            textAlign: "center",
                            color: "text.secondary",
                          }}
                        >
                          <NotificationsNoneOutlinedIcon
                            sx={{ fontSize: 40, mb: 1, color: "text.disabled" }}
                          />
                          <Typography variant="body2">
                            {t("No notifications")}
                          </Typography>
                        </Box>
                      )}
                    </List>
                  </OverlayScrollbarsComponent>
                </Box>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </Box>
  );
}
