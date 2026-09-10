import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  List,
  ListItem,
  ListItemText,
  Paper,
  Divider,
  Box,
  Typography,
} from "@mui/material";

import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";

import Button from "@mui/material/Button";
import BaseLoading from "customComponents/BaseLoading";
import BaseNoData from "customComponents/BaseNoData";
import BaseTextArea from "customComponents/BaseEditControls/BaseTextArea";

// helper
import Helper from "helper";
import { colors } from "@/theme/colors";
import { space, radius } from "@/theme/tokens";
import { gridToolbarButtonSx } from "@/theme/controlStyles";

export default function DoctorTeamPatientNotes(props) {
  const { t } = useTranslation();
  const { PatientId, TeamId } = props;

  const [Notes, setNotes] = useState([]);
  const [NoteText, setNoteText] = useState("");
  const [Loading, setLoading] = useState(false);

  const GetNotes = React.useCallback(async () => {
    if (!TeamId || !PatientId) return;

    setLoading(true);

    try {
      const SearchOption = Helper.BaseCrudHelper.GetSearchOption();
      SearchOption.PageOption.Limit = 1000;
      SearchOption.SearchField = [
        { Field: "TeamId", Value: TeamId, Op: "Equals" },
        { Field: "PatientId", Value: PatientId, Op: "Equals" },
      ];

      await Helper.DoctorTeamHelper.GetPatientNotes(SearchOption, (resData) => {
        setNotes(resData?.Data || []);
      });
    } finally {
      setLoading(false);
    }
  }, [TeamId, PatientId]);

  useEffect(() => {
    let active = true;

    if (active) {
      GetNotes();
    }

    return () => {
      active = false;
    };
  }, [GetNotes]);

  const SaveNote = async () => {
    if (!NoteText?.trim()) return;

    await Helper.DoctorTeamHelper.SavePatientNote(
      { Notes: NoteText, TeamId, PatientId },
      () => {
        setNoteText("");
        GetNotes();
      },
    );
  };

  const RenderNotes = () => {
    return Notes.map((note, index) => (
      <Paper
        key={index}
        variant="outlined"
        sx={{
          mb: 0.75,
          p: 0.75,
          borderRadius: radius.sm,
          backgroundColor: colors.brand.tint,
          borderColor: colors.brand.hairline,
        }}
      >
        <List disablePadding>
          <ListItem
            disableGutters
            sx={{ display: "flex", justifyContent: "space-between" }}
          >
            <Typography fontSize={13} fontWeight={600}>
              {note.DoctorsProfile
                ? `${note.DoctorsProfile.lastname} ${note.DoctorsProfile.firstname}`
                : ""}
            </Typography>

            <Typography fontSize={12} color="text.secondary">
              {Helper.ObjectHelper.getDateYMDHMS({
                DateStr: note.CreateDate,
              })}
            </Typography>
          </ListItem>

          <Divider sx={{ my: 0.5 }} />

          <ListItem disableGutters>
            <ListItemText
              primary={
                <Typography fontSize={14} color={colors.brand.ink}>
                  {note.Notes}
                </Typography>
              }
            />
          </ListItem>
        </List>
      </Paper>
    ));
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: colors.brand.surface,
      }}
    >
      {/* NOTES LIST */}
      <Box sx={{ flex: 1, overflowY: "auto", p: 0 }}>
        <GridContainer>
          <GridItem xs={12}>
            {Loading ? (
              <BaseLoading />
            ) : Notes.length > 0 ? (
              RenderNotes()
            ) : (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: 200,
                }}
              >
                <BaseNoData
                  IconColor={colors.brand.cyanInk}
                  BgColor={colors.brand.cyanInk}
                  Text="Notes have not been registered"
                />
              </Box>
            )}
          </GridItem>
        </GridContainer>
      </Box>

      {/* INPUT AREA */}
      <Box
        sx={{
          borderTop: `1px solid ${colors.brand.hairline}`,
          p: 0,
          backgroundColor: colors.brand.tint,
        }}
      >
        <Typography
          fontWeight={600}
          fontSize={14}
          color={colors.brand.ink}
          p={1.5}
          mb={0}
        >
          {t("Notes")}
        </Typography>

        <BaseTextArea
          Value={NoteText}
          ChangeValue={(name, value) => setNoteText(value)}
          Config={{ Label: "" }}
          WithLabel={false}
          md={12}
        />

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
          <Button
            size="small"
            disableElevation
            onClick={SaveNote}
            sx={{ ...gridToolbarButtonSx.primary, marginRight: space[2] }}
          >
            {t("Add")}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
