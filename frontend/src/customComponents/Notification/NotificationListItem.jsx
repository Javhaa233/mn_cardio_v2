import React from "react";
import { useTranslation } from "react-i18next";
// @mui/material components
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";

import AccessTimeIcon from "@mui/icons-material/AccessTime";

import UserDialogLink from "customComponents/DoctorProfile/UserDialogLink";
import CustomBadge from "customComponents/CustomBadge";
// helper
import Helper from "helper";

export default function NotificationListItem(props) {
  const { t } = useTranslation();
  const { Data = null, onClick } = props;

  if (Data) {
    return (
      <div>
        <CustomBadge
          Content={Data.Seen === null ? "New" : ""}
          color="#068f23"
          textColor="#FFF"
          top="5px"
          right="30px"
          invisible={Data.Seen !== null}
          style={{ width: "100%" }}
        >
          <List
            onClick={() => onClick && onClick()}
            sx={{
              cursor: "pointer",
              padding: "5px 10px",
              "&:hover": { backgroundColor: "#f0f0f0" },
            }}
            style={{
              width: "100%",
              backgroundColor: !Data.Seen ? "#c9ddff" : "",
            }}
          >
            <ListItem sx={{ padding: "0" }}>
              <ListItemText style={{ color: "#adadad" }} sx={{ margin: "0" }}>
                <span style={{ fontWeight: "400", color: "#6e6e6e" }}>
                  <UserDialogLink
                    UserId={Data.CreateUsers ? Data.CreateUsers.Id : null}
                  >
                    {Data.CreateUsers ? Data.CreateUsers.FirstName : ""}
                  </UserDialogLink>
                </span>
                {" - "}
                {t(Data.Notes + "")}
              </ListItemText>
            </ListItem>
            <ListItem sx={{ padding: "0" }}>
              <ListItemText sx={{ margin: "0" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginTop: "10px",
                  }}
                >
                  <AccessTimeIcon
                    style={{ width: "18px", height: "18px", color: "#919191" }}
                  />
                  <span
                    style={{
                      fontWeight: "400",
                      color: "#919191",
                      fontSize: "14px",
                      marginTop: "3px",
                    }}
                  >
                    &nbsp;
                    {Data.CreateDate
                      ? Helper.ObjectHelper.getDateYMDHMS({
                          DateStr: Data.CreateDate,
                        })
                      : ""}
                  </span>
                </div>
              </ListItemText>
            </ListItem>
          </List>
        </CustomBadge>

        <Divider />
      </div>
    );
  } else {
    return null;
  }
}
