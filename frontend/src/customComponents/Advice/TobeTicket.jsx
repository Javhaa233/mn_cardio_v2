import { useTranslation } from "react-i18next";
import React from "react";
// @mui/material components
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
} from "@mui/material";
// helper
import Helper from "helper";

export default function TobeTicket(props) {
  const { t } = useTranslation();
  const { Data = null, onClick } = props;

  if (Data) {
    return (
      <div>
        <List sx={{ p: 0 }}>
          <ListItem
            sx={{
              cursor: "pointer",
              p: "4px",
              "&:hover": { backgroundColor: "#f0f0f0" },
            }}
            onClick={() => onClick && onClick()}
          >
            <ListItemText
              style={{ marginRight: "70px", marginTop: 0, marginBottom: 0 }}
            >
              <span style={{ fontSize: "14px", color: null }}>
                {Data.Patient && Data.Patient.p_birthday
                  ? Helper.ObjectHelper.GetAgeDateStr(Data.Patient.p_birthday) +
                    ","
                  : ""}
                {Data.Patient
                  ? Helper.ObjectHelper.getGenderLabel(Data.Patient.p_gender)
                  : null}
                : {Data.Body}
                {/* {Data.vwAdviceInfo ? Data.vwAdviceInfo.Body : ""} */}
              </span>
            </ListItemText>
            <ListItemSecondaryAction style={{ right: "5px" }}>
              <span style={{ color: "#919191", fontSize: "13px" }}>
                {Data.date_creation || null}
              </span>
            </ListItemSecondaryAction>
          </ListItem>
        </List>
        <Divider />
      </div>
    );
  } else {
    return <div></div>;
  }
}
