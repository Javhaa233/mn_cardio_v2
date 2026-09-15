import React, { useEffect, useState, useCallback } from "react";
// translation
import { useTranslation } from "react-i18next";
import { Box, Typography, List, ListItem, Avatar } from "@mui/material";

// icons
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

// custom components
import Paginition from "baseComponents/BaseGrid/Pagination";
import UniCard from "customComponents/UniCard";
import BaseNoData from "customComponents/BaseNoData";
import { BrandSpinner } from "customComponents/DivLoading";
import { colors } from "@/theme/colors";
import { motion } from "@/theme/tokens";
// helper
import Helper from "helper";

import customHistory from "customHistory";
import { useChatContext } from "customComponents/Chat/ChatContext";
import {
  IsChatNotification,
  OpenChatNotification,
} from "customComponents/Notification/chatNotification";

export default function AllNotifications() {
  const { t } = useTranslation();
  const chat = useChatContext();

  const LogedUser = Helper.AuthHelper.GetLogedUserLocal();

  const [Data, setData] = useState([]);
  const [Option, setOption] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Maintain state for pagination to trigger updates
  const [pageOption, setPageOption] = useState({
    Page: 0,
    Limit: 10,
  });

  const GetData = useCallback(
    async (currentPageOption) => {
      setIsLoading(true);

      var NotificationSearchOption = Helper.BaseCrudHelper.GetSearchOption();
      NotificationSearchOption.PageOption = currentPageOption || pageOption;
      // CreateDate: chat rows are rewritten in place, so Id order goes stale.
      NotificationSearchOption.OrderBy = { Field: "CreateDate", Type: "desc" };
      NotificationSearchOption.SearchField = [
        { Field: "ToUserId", Value: LogedUser.Id, Op: "Equals" },
      ];

      await Helper.NotificationHelper.GetListData(
        NotificationSearchOption,
        (resData) => {
          if (resData) {
            setData(Array.isArray(resData.Data) ? resData.Data : []);
            setOption(resData.Option);
            setIsLoading(false);
          } else {
            setIsLoading(false);
          }
        },
      );
    },
    [LogedUser.Id, pageOption],
  );

  useEffect(() => {
    GetData(pageOption);
  }, [GetData, pageOption]);

  const PageLimitChange = (Page, Limit) => {
    const newPageOption = { Page, Limit };
    setPageOption(newPageOption);
  };

  const OpenItem = (item) => {
    if (IsChatNotification(item)) {
      OpenChatNotification(chat, item, () => GetData(pageOption));
      return;
    }
    Helper.NotificationHelper.Seen(item, () => {
      if (item.Url) {
        // Relative paths go through the router so the rest of the session
        // survives; item.Url is server-supplied, so anything absolute still
        // needs a real navigation.
        if (String(item.Url).startsWith("/")) {
          customHistory.push(item.Url);
        } else {
          document.location = item.Url;
        }
      } else if (item.LinkObjectName + "" === "Advice") {
        customHistory.push(
          "/admin/AdviceComment?AdviceId=" + item.LinkObjectId,
        );
      }
    });
  };

  // The page was its own Paper (8px radius, neutral-black shadow, inset by a
  // Container's gutters), with #111827 text and a #1976d2 unread bar. It is the
  // same UniCard every list page uses now, on brand tokens. Names were set as
  // subtitle2, which renders a bare h6 that _misc.scss uppercases.
  return (
    <UniCard title={t("All Notifications")} padding={0}>
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          position: "relative",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {isLoading && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(255,255,255,0.7)",
              zIndex: 10,
            }}
          >
            <BrandSpinner />
          </Box>
        )}
        {Array.isArray(Data) && Data.length > 0 ? (
          <List sx={{ p: 0 }}>
            {Data.map((item, index) => {
              const Unread = !item.Seen;
              const Name = item.CreateDoctorsProfile
                ? item.CreateDoctorsProfile.FullName + " " + t("doctor")
                : item.CreateUsers
                  ? item.CreateUsers.FirstName
                  : t("System");
              const Initial = item.CreateDoctorsProfile
                ? item.CreateDoctorsProfile.FullName.charAt(0).toUpperCase()
                : item.CreateUsers
                  ? item.CreateUsers.FirstName.charAt(0).toUpperCase()
                  : null;
              return (
                <ListItem
                  key={index}
                  alignItems="flex-start"
                  onClick={() => OpenItem(item)}
                  sx={{
                    px: 1.5,
                    py: 1.25,
                    gap: 1.5,
                    cursor: "pointer",
                    borderBottom: `1px solid ${colors.brand.hairline}`,
                    borderLeft: `3px solid ${Unread ? colors.brand.cyan : "transparent"}`,
                    bgcolor: Unread ? colors.brand.tintSolid : "transparent",
                    transition: `background-color ${motion.fast}`,
                    "&:hover": {
                      bgcolor: Unread
                        ? colors.brand.tintSolidHover
                        : colors.brand.tint,
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      fontSize: 15,
                      fontWeight: 600,
                      bgcolor: Unread
                        ? colors.brand.cyanInk
                        : colors.brand.tintSolid,
                      color: Unread ? "#fff" : colors.brand.inkMuted,
                    }}
                  >
                    {Initial || (
                      <NotificationsNoneOutlinedIcon fontSize="small" />
                    )}
                  </Avatar>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "baseline",
                        justifyContent: "space-between",
                        columnGap: 1,
                      }}
                    >
                      <Typography
                        variant="body2"
                        component="div"
                        sx={{
                          color: colors.brand.ink,
                          fontWeight: Unread ? 700 : 600,
                          minWidth: 0,
                        }}
                      >
                        {Name}
                      </Typography>
                      <Typography
                        variant="caption"
                        component="div"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          color: colors.brand.inkMuted,
                          whiteSpace: "nowrap",
                        }}
                      >
                        <AccessTimeIcon sx={{ fontSize: 14 }} />
                        {Helper.ObjectHelper.getDateYMDHMS({
                          DateStr: item.CreateDate,
                        })}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      component="div"
                      sx={{ color: colors.brand.inkMuted, mt: 0.25 }}
                    >
                      {t(item.Notes + "")}
                    </Typography>
                  </Box>
                </ListItem>
              );
            })}
          </List>
        ) : (
          !isLoading && <BaseNoData Text="No notifications" />
        )}
      </Box>

      <Box
        sx={{
          borderTop: `1px solid ${colors.brand.hairline}`,
          "& .MuiTablePagination-spacer": { display: "none" },
          "& .MuiTablePagination-toolbar": {
            justifyContent: "flex-start",
            flexWrap: "wrap",
            minHeight: "44px",
          },
        }}
      >
        <Paginition
          Option={Option}
          ChangePage={PageLimitChange}
          PageSize={pageOption.Limit}
          RowsPerPageOptions={[5, 10, 20, 50]}
        />
      </Box>
    </UniCard>
  );
}
