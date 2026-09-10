import { withTranslation } from "react-i18next";
import React, { Component } from "react";
// @mui/material components
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
// custom components
import DoctorTeamListItem from "customComponents/DoctorTeam/DoctorTeamListItem";
import BaseLoading from "customComponents/BaseLoading";
import BaseNoData from "customComponents/BaseNoData";
// helper
import Helper from "helper";
import { colors } from "@/theme/colors";
import { space, radius, elevation } from "@/theme/tokens";
import { gridToolbarButtonSx } from "@/theme/controlStyles";

class DoctorTeamList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      DoctorId: props.DoctorId
        ? props.DoctorId
        : Helper.AuthHelper.GetLogedDoctorLocal()
          ? Helper.AuthHelper.GetLogedDoctorLocal().id_data
          : null,
      DoctorTeams: [],
      ActiveDoctorTeamId: props.TeamId || 0,
      isLoading: false,
    };
  }

  componentDidMount() {
    this.GetData();
  }

  componentDidUpdate(prevProps) {
    if (this.props.TeamId !== prevProps.TeamId) {
      this.setState({ ActiveDoctorTeamId: this.props.TeamId });
      this.EmitSelectedTeam(this.props.TeamId);
    }
  }

  setTeamId = (teamId) => {
    if (teamId !== this.state.ActiveDoctorTeamId) this.GetData();
  };

  /**
   * The right-hand pane needs the team OBJECT, not just its id, so its header
   * can name the team without issuing a second request for something this
   * component already has in state.
   */
  EmitSelectedTeam = (teamId) => {
    const { OnTeamResolved } = this.props;
    if (!OnTeamResolved) return;
    const team = (this.state.DoctorTeams || []).find(
      (s) => s && s.id_data + "" === "" + teamId,
    );
    OnTeamResolved(team || null, team ? this.GroupLabelFor(team) : null);
  };

  // Teams 1-5 are the fixed system lists; anything above that is user-made.
  GroupLabelFor = (team) => {
    const { t } = this.props;
    return team.id_data > 0 && team.id_data <= 5
      ? t("System teams")
      : t("Other teams");
  };

  GetData = async () => {
    this.setState({ isLoading: true });
    const { DoctorId, ActiveDoctorTeamId } = this.state;
    const { AutoLoad } = this.props;
    await Helper.DoctorTeamHelper.GetDoctorsTeams(DoctorId, (resData) => {
      if (resData && resData.Data) {
        this.setState({ DoctorTeams: resData.Data, isLoading: false }, () => {
          if (AutoLoad && !ActiveDoctorTeamId) {
            resData.Data.length > 0 &&
              resData.Data[0] &&
              this.GetSelectTeam(resData.Data[0].id_data);
          } else {
            this.EmitSelectedTeam(ActiveDoctorTeamId);
          }
        });
      } else {
        this.setState({ isLoading: false });
      }
    });
  };

  GetSelectTeam = (TeamId) => {
    const { SelectTeam } = this.props;
    this.setState({ ActiveDoctorTeamId: TeamId }, () =>
      this.EmitSelectedTeam(TeamId),
    );
    SelectTeam && SelectTeam(TeamId);
  };

  GetEditTeam = (TeamId) => {
    const { EditTeam } = this.props;
    this.setState(
      { ActiveDoctorTeamId: null },
      () => TeamId && this.setState({ ActiveDoctorTeamId: TeamId }),
    );
    EditTeam && EditTeam(TeamId);
  };

  render() {
    const { DoctorTeams, ActiveDoctorTeamId, isLoading } = this.state;
    const { HomeList, t } = this.props;

    const handleClick = (Value, Edit) => {
      if (Edit) this.GetEditTeam(Value);
      else this.GetSelectTeam(Value);
    };

    return (
      <Box
        component="nav"
        aria-label={t("Миний багууд")}
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: "1 1 auto",
          minHeight: 0,
          minWidth: 0,
          maxWidth: "100%",
          height: "100%",
          overflow: "hidden",
          backgroundColor: colors.brand.surface,
          border: `1px solid ${colors.brand.hairline}`,
          borderRadius: radius.lg,
          boxShadow: elevation[1],
        }}
      >
        <List
          sx={{
            paddingTop: space[2],
            paddingBottom: space[2],
            paddingLeft: space[2],
            paddingRight: space[2],
            flex: "1 1 auto",
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          {isLoading ? (
            <BaseLoading />
          ) : Array.isArray(DoctorTeams) && DoctorTeams.length > 0 ? (
            <>
              <DoctorTeamListItem
                Header={t("System teams")}
                Data={DoctorTeams.filter(
                  (s) => s.id_data > 0 && s.id_data <= 5,
                )}
                ActiveDoctorTeamId={ActiveDoctorTeamId}
                onClick={handleClick}
              />
              <DoctorTeamListItem
                Header={t("Other teams")}
                Data={DoctorTeams.filter((s) => s.id_data > 5)}
                ActiveDoctorTeamId={ActiveDoctorTeamId}
                onClick={handleClick}
              />
            </>
          ) : (
            <BaseNoData
              BgColor={colors.brand.cyanInk}
              IconColor={colors.brand.cyanInk}
              Text={t("NotRegisteredInTeam")}
            />
          )}
        </List>

        {/* Pinned, not floated 40px below the last team. */}
        {HomeList ? null : (
          <Box
            sx={{
              flex: "0 0 auto",
              padding: space[2],
              borderTop: `1px solid ${colors.brand.hairline}`,
            }}
          >
            <Button
              fullWidth
              size="small"
              disableElevation
              startIcon={<AddIcon />}
              onClick={() => this.GetEditTeam(null)}
              sx={gridToolbarButtonSx.primary}
            >
              {t("New List")}
            </Button>
          </Box>
        )}
      </Box>
    );
  }
}

export default withTranslation(undefined, { withRef: true })(DoctorTeamList);
