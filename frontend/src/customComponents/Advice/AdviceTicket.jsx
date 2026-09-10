import React from "react";
// translation
import { useTranslation } from "react-i18next";
// @mui/material components
import { styled } from "@mui/material/styles";
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  CardActionArea,
} from "@mui/material";
// @mui/icons-material
import VisibilityIcon from "@mui/icons-material/VisibilityOutlined";
import CommentIcon from "@mui/icons-material/ModeCommentOutlined";
// default components
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
// custom components
import UserDialogLink from "customComponents/DoctorProfile/UserDialogLink";
// helper
import Helper from "helper";

const TicketCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== "selected",
})(({ selected }) => ({
  margin: "0px 0px 10px 0px",
  borderRadius: "12px",
  overflow: "hidden",
  ...(selected
    ? {
        borderColor: "#eb3573",
        position: "relative",
        "&::after, &::before": {
          right: "-30px",
          top: "calc(50% - 20px)",
          border: "solid transparent",
          content: '""',
          height: 0,
          width: 0,
          position: "absolute",
          pointerEvents: "none",
        },
        "&::after": {
          content: '""',
          borderColor: "rgba(136, 183, 213, 0)",
          borderLeftColor: "#eb3573",
          borderWidth: "15px",
          marginLeft: "-15px",
        },
      }
    : {}),
}));

export default function AdviceTicket(props) {
  const { t } = useTranslation();
  const { Data = null, Selected, onClick } = props;

  if (Data) {
    return (
      <TicketCard selected={Selected}>
        <CardBody style={{ padding: "8px" }}>
          <List sx={{ p: 0 }}>
            <ListItem sx={{ p: "4px" }}>
              <ListItemAvatar style={{ minWidth: "42px" }}>
                <Avatar
                  style={{ width: "36px", height: "36px" }}
                  src={
                    Data.DoctorsProfile &&
                    Data.DoctorsProfile.Files &&
                    Data.DoctorsProfile.Files.length > 0
                      ? Data.DoctorsProfile.Files[0].FileSrc
                      : ""
                  }
                />
              </ListItemAvatar>
              <ListItemText
                style={{ color: "#919191", marginTop: 0, marginBottom: 0 }}
              >
                <UserDialogLink UserId={Data.Users ? Data.Users.Id : null}>
                  <span style={{ fontSize: "14px", fontWeight: "400" }}>
                    Dr. {Data.Users.UserName}
                  </span>
                </UserDialogLink>
              </ListItemText>
              <ListItemSecondaryAction style={{ right: "8px" }}>
                <span
                  style={{
                    color: "#919191",
                    fontSize: "13px",
                    fontWeight: "400",
                  }}
                >
                  {Data.date_creation}
                  {/* {Helper.ObjectHelper.getDateToStrFromStr(Data.date_modif)} */}
                </span>
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem sx={{ p: "4px" }}>
              <ListItemText style={{ marginTop: 0, marginBottom: 0 }}>
                <span style={{ fontSize: "14px" }}>
                  {Data.Patient && Data.Patient.p_birthday
                    ? Helper.ObjectHelper.GetAgeDateStr(
                        Data.Patient.p_birthday,
                      ) + ","
                    : ""}
                  {Data.Patient !== null
                    ? Helper.ObjectHelper.getGenderLabel(Data.Patient.p_gender)
                    : null}
                  : {Data.Body}
                  {/* {Data.vwAdviceInfo ? Data.vwAdviceInfo.Body : ""} */}
                </span>
              </ListItemText>
            </ListItem>

            <CardActionArea
              onClick={() => onClick && onClick()}
              style={{
                clear: "both",
                display: "block",
                height: "32px",
                borderRadius: "6px",
              }}
            >
              <ListItem sx={{ p: "4px" }}>
                <ListItemText
                  style={{ color: "#919191", marginTop: 0, marginBottom: 0 }}
                >
                  <span style={{ fontSize: "14px" }}>
                    {Data.DictProvinceCity && Data.DictSoumDistrict
                      ? t(Data.DictProvinceCity.name + "") +
                        "\u00A0\u00A0" +
                        t(Data.DictSoumDistrict.name + "")
                      : ""}
                  </span>
                </ListItemText>
                <ListItemSecondaryAction style={{ right: "8px" }}>
                  <div style={{ display: "flex", color: "#919191" }}>
                    <div style={{ display: "flex", marginRight: "8px" }}>
                      <VisibilityIcon
                        style={{
                          width: "18px",
                          height: "18px",
                          marginRight: "5px",
                        }}
                      />
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: "400",
                          marginTop: 0,
                        }}
                      >
                        {Data.vwAdviceViews ? Data.vwAdviceViews.ViewQty : 0}
                      </span>
                    </div>
                    <div style={{ display: "flex" }}>
                      <CommentIcon
                        style={{
                          width: "18px",
                          height: "18px",
                          marginRight: "5px",
                        }}
                      />
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: "400",
                          marginTop: 0,
                        }}
                      >
                        {Data.vwAdviceInfo ? Data.vwAdviceInfo.CommentQty : "0"}
                      </span>
                    </div>
                  </div>
                </ListItemSecondaryAction>
              </ListItem>
            </CardActionArea>
          </List>
        </CardBody>
      </TicketCard>
    );
  } else {
    return null;
  }
}
