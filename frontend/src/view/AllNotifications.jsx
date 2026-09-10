import React, { useEffect, useState, useCallback } from "react";
// translation
import { useTranslation } from "react-i18next";
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  Divider,
  Avatar,
  CircularProgress,
  Container,
} from "@mui/material";

// icons
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";

// custom components
import Paginition from "baseComponents/BaseGrid/Pagination";
// helper
import Helper from "helper";

import customHistory from "customHistory";

export default function AllNotifications() {
  const { t } = useTranslation();

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
      NotificationSearchOption.OrderBy = { Field: "Id", Type: "desc" };
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

  return (
    <Container
      maxWidth={false}
      sx={{ p: 0, px: 0, flex: 1, minHeight: 0, display: "flex" }}
    >
      <Paper
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow:
            "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        }}
      >
        <Box
          sx={{
            px: 1.5,
            py: 1.5,
            borderBottom: "1px solid rgba(0,0,0,0.08)",
            bgcolor: "#fff",
          }}
        >
          <Typography
            variant="h5"
            sx={{ fontWeight: 700, color: "#111827", fontSize: "1.1rem" }}
          >
            {t("All Notifications")}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", fontSize: "0.8rem" }}
          >
            {t("Manage and view all your notifications")}
          </Typography>
        </Box>

        <Box
          sx={{
            flex: 1,
            position: "relative",
            bgcolor: "#fff",
            overflowY: "scroll",
            overflowX: "hidden",
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: "#f1f1f1",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#c1c1c1",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              background: "#a1a1a1",
            },
          }}
        >
          {isLoading && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "rgba(255,255,255,0.7)",
                zIndex: 10,
              }}
            >
              <CircularProgress color="primary" />
            </Box>
          )}
          <List sx={{ p: 0 }}>
            {Array.isArray(Data) && Data.length > 0
              ? Data.map((item, index) => (
                  <React.Fragment key={index}>
                    <ListItem
                      alignItems="flex-start"
                      onClick={() => {
                        Helper.NotificationHelper.Seen(item, () => {
                          if (item.Url) {
                            // Relative paths go through the router so the rest
                            // of the session survives; item.Url is
                            // server-supplied, so anything absolute still needs
                            // a real navigation.
                            if (String(item.Url).startsWith("/")) {
                              customHistory.push(item.Url);
                            } else {
                              document.location = item.Url;
                            }
                          } else if (item.LinkObjectName + "" === "Advice") {
                            customHistory.push(
                              "/admin/AdviceComment?AdviceId=" +
                                item.LinkObjectId,
                            );
                          }
                        });
                      }}
                      sx={{
                        px: 1.5,
                        py: 1.5,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        bgcolor: !item.Seen
                          ? "rgba(25, 118, 210, 0.04)"
                          : "transparent",
                        borderLeft: !item.Seen
                          ? "4px solid #1976d2"
                          : "4px solid transparent",
                        "&:hover": {
                          bgcolor: "rgba(0,0,0,0.02)",
                        },
                        gap: 2,
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: !item.Seen ? "primary.main" : "grey.200",
                          color: !item.Seen ? "#fff" : "grey.500",
                          width: 40,
                          height: 40,
                        }}
                      >
                        {item.CreateDoctorsProfile ? (
                          item.CreateDoctorsProfile.FullName.charAt(
                            0,
                          ).toUpperCase()
                        ) : item.CreateUsers ? (
                          item.CreateUsers.FirstName.charAt(0).toUpperCase()
                        ) : (
                          <NotificationsNoneOutlinedIcon />
                        )}
                      </Avatar>

                      <Box sx={{ flex: 1 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 0.5,
                            alignItems: "center",
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 600,
                              color: "#111827",
                              fontSize: "0.9rem",
                            }}
                          >
                            {item.CreateDoctorsProfile
                              ? item.CreateDoctorsProfile.FullName +
                                " " +
                                t("doctor")
                              : item.CreateUsers
                                ? item.CreateUsers.FirstName
                                : t("System")}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                              color: "text.secondary",
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

                        <Typography
                          variant="body2"
                          sx={{
                            color: "text.primary",
                            mb: 0,
                            fontSize: "0.85rem",
                          }}
                        >
                          {t(item.Notes + "")}
                        </Typography>
                      </Box>
                    </ListItem>
                    <Divider component="li" sx={{ my: 0 }} />
                  </React.Fragment>
                ))
              : !isLoading && (
                  <Box
                    sx={{ p: 8, textAlign: "center", color: "text.secondary" }}
                  >
                    <Box
                      sx={{
                        bgcolor: "grey.50",
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mx: "auto",
                        mb: 2,
                      }}
                    >
                      <NotificationsNoneOutlinedIcon
                        sx={{ fontSize: 40, color: "text.disabled" }}
                      />
                    </Box>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {t("No notifications")}
                    </Typography>
                    <Typography variant="body2">
                      {t(
                        "You're all caught up! Check back later for new updates.",
                      )}
                    </Typography>
                  </Box>
                )}
          </List>
        </Box>

        <Box
          sx={{
            p: 0,
            borderTop: "1px solid rgba(0,0,0,0.08)",
            bgcolor: "#f9fafb",
            // Compact footer styles
            "& .MuiTablePagination-spacer": {
              display: "none",
            },
            "& .MuiTablePagination-toolbar": {
              justifyContent: "flex-start",
              paddingLeft: 1,
              minHeight: "40px",
              height: "40px",
              alignItems: "center",
            },
            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
              {
                margin: 0,
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
      </Paper>
    </Container>
  );
}
