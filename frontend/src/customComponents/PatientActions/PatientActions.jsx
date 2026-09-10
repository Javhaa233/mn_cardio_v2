import React, { Component } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import Typography from "@mui/material/Typography";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

// import AddToList from "customComponents/PatientActions/AddToList";
import BtnNewVisit from "customComponents/PatientActions/BtnNewVisit";
// import BtnNewEcho from "customComponents/PatientActions/BtnNewEcho";
// import BtnNewEcg from "customComponents/PatientActions/BtnNewEcg";
// import BtnNewTicket from "customComponents/PatientActions/BtnNewTicket";
// import BtnNewBloodStroke from "customComponents/PatientActions/BtnNewBloodStroke";
// import BtnPatientMonitoring from "customComponents/PatientActions/BtnPatientMonitoring";
import BtnHospitalize from "customComponents/PatientActions/BtnHospitalize";
import BtnProcedure from "customComponents/PatientActions/BtnProcedure";
import BtnSurgeryBeforeVisitsCheck from "customComponents/PatientActions/BtnSurgeryBeforeVisitsCheck";
// import MoveToList from "customComponents/PatientActions/MoveToList";
// import BtnNewSurgeryReport from "customComponents/PatientActions/BtnNewSurgeryReport";
// import BtnCathlab from "customComponents/PatientActions/BtnCathlab";
import BtnNewCalculator from "customComponents/PatientActions/BtnNewCalculator";
// import BtnHfStay from "customComponents/PatientActions/BtnHfStay";
import BtnHfAmbulance from "customComponents/PatientActions/BtnHfAmbulance";
import NationalRegistry from "customComponents/PatientActions/NationalRegistry";
// import BtnPatientTransfer from "customComponents/PatientActions/BtnPatientTransfer";
// import BtnLaboratoryTest from "customComponents/PatientActions/BtnLaboratoryTest";
import ToCVD from "customComponents/PatientActions/ToCVD";

// 2023-11-14
// import BtnVascularDisease from "customComponents/PatientActions/BtnVascularDisease";

// 2023-11-28
import DiagnosisAndExamination from "./DiagnosisAndExamination";
import TransferAndMonitoring from "./TransferAndMonitoring";
import Surgery from "./Surgery";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import BloodtypeIcon from "@mui/icons-material/Bloodtype";

import CardiacSurgeryForms from "./CardiacSurgeryForms";
import { TENDER_FORM_GROUPS } from "customComponents/Forms/NationalRegistry/Surgery/tenderForms";

import Helper from "helper";
// Not `withTranslation`: the parent grabs this component by ref and calls
// SetValues on it, and the HOC would put itself in front of the instance.
import i18n from "i18n";
import { colors } from "@/theme/colors";
import { space, radius, motion } from "@/theme/tokens";
import { gridToolbarButtonSx } from "@/theme/controlStyles";

const buttonClassName = "patient-actions-button";
const primaryClassName = "patient-actions-button--primary";

/**
 * Every child button here is `disabled` until a patient is chosen, and that
 * used to render as near-black text and near-black icons ON TOP of a
 * full-saturation red / orange / green fill.
 *
 * The cause is a specificity collision, not a colour choice. The shared
 * Creative Tim button sets `color: whiteColor` on its `styled()` root at
 * (0,1,0); MUI's own `.MuiButton-root.Mui-disabled` sits at (0,2,0) and wins,
 * forcing `rgba(0,0,0,0.26)`. The `backgroundColor` from `btnColors[color]` is
 * NOT part of that rule, so the fill survives and the text turns black on it.
 *
 * Fixing it from here rather than in `components/CustomButtons/Button.jsx`
 * is deliberate: this file already tags every child with `buttonClassName`, so
 * `& .patient-actions-button` is a descendant selector at (0,2,0) - enough to
 * beat the styled root, and `&.Mui-disabled` on top of it reaches (0,3,0),
 * enough to beat MUI. No `!important` anywhere, and the ~200 other call sites
 * of that button are untouched.
 *
 * The second thing this fixes is rank. Eleven-plus equally loud saturated
 * buttons mean nothing on the bar reads as the thing to press, so they are all
 * `neutral` now except Үзлэг, which is the one action this bar exists for.
 */
const actionBarSx = {
  [`& .${buttonClassName}`]: {
    ...gridToolbarButtonSx.neutral,
    height: "auto",
    margin: `0 ${space[1]} ${space[1]} 0`,
    padding: "6px 10px",
    position: "relative",
    "& svg": { width: "16px", height: "16px", marginRight: space[1] },
    "&:hover": {
      ...gridToolbarButtonSx.neutral["&:hover"],
      zIndex: 2,
    },
    "&:focus-visible": {
      outline: `2px solid ${colors.brand.focus}`,
      outlineOffset: "1px",
    },
  },

  // The one action the bar exists for.
  [`& .${primaryClassName}`]: {
    ...gridToolbarButtonSx.primary,
    height: "auto",
    margin: `0 ${space[1]} ${space[1]} 0`,
    padding: "6px 10px",
    "& svg": { width: "16px", height: "16px", marginRight: space[1] },
  },

  // A disabled control must not look like a live one. Drop the fill entirely
  // rather than leave a saturated background with unreadable text on it.
  [`& .${buttonClassName}.Mui-disabled, & .${primaryClassName}.Mui-disabled`]: {
    backgroundColor: "transparent",
    color: colors.brand.inkDim,
    border: `1px solid ${colors.brand.hairline}`,
    boxShadow: "none",
    opacity: 0.55,
    filter: "none",
    "& svg": { color: colors.brand.inkDim },
  },
};

class PatientActions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      PatientId: props.PatientId || null,
      PatientRegNo: props.PatientRegNo || null,
      PatientName: props.PatientName || null,
      SelectedCount: props.PatientId ? 1 : 0,
      StayId: props.StayId || null,
      TeamId: props.TeamId || null,
      DoctorsTeamPatientId: props.DoctorsTeamPatientId || null,
      MoreOpen: false,
    };
  }

  componentDidUpdate(prevProps) {
    const { PatientId, PatientRegNo, StayId, TeamId, DoctorsTeamPatientId } =
      this.props;
    if (
      prevProps.PatientId !== PatientId ||
      prevProps.PatientRegNo !== PatientRegNo ||
      prevProps.StayId !== StayId ||
      prevProps.TeamId !== TeamId ||
      prevProps.DoctorsTeamPatientId !== DoctorsTeamPatientId
    ) {
      this.setState({
        PatientId: PatientId || null,
        PatientRegNo: PatientRegNo || null,
        StayId: StayId || null,
        TeamId: TeamId || null,
        DoctorsTeamPatientId: DoctorsTeamPatientId || null,
      });
    }
  }

  SetValues = ({
    PatientId,
    PatientRegNo,
    PatientName,
    SelectedCount,
    TeamId,
    DoctorsTeamPatientId,
    StayId,
  }) => {
    this.setState({
      PatientId,
      PatientRegNo,
      // Callers that predate the selection hint pass neither of these; fall
      // back to what can be inferred so their bar behaves exactly as before.
      PatientName: PatientName || null,
      SelectedCount:
        SelectedCount === undefined ? (PatientId ? 1 : 0) : SelectedCount,
      TeamId,
      DoctorsTeamPatientId,
      StayId,
    });
  };

  /**
   * Why the buttons are inactive, said out loud.
   *
   * Before this, selecting a second patient silently disabled all fourteen
   * buttons with nothing on screen to explain it - the bar just went dead.
   */
  RenderSelectionHint = () => {
    const { PatientId, PatientName, PatientRegNo, SelectedCount } = this.state;

    const many = SelectedCount > 1;
    const label = many
      ? i18n.t(
          "{{count}} өвчтөн сонгогдсон. Үйлдэл хийхэд нэг өвчтөн сонгоно уу.",
          { count: SelectedCount },
        )
      : PatientId
        ? [PatientName, PatientRegNo].filter(Boolean).join(" · ") ||
          i18n.t("Өвчтөн сонгогдсон")
        : i18n.t("Үйлдэл хийхийн тулд өвчтөн сонгоно уу");

    return (
      <Box
        role="status"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: space[2],
          width: "100%",
          minWidth: 0,
          marginBottom: space[2],
          padding: `${space[1]} ${space[3]}`,
          borderRadius: radius.xs,
          backgroundColor: colors.brand.tint,
          border: `1px solid ${colors.brand.hairline}`,
        }}
      >
        <Box
          component={PatientId && !many ? PersonOutlineIcon : InfoOutlinedIcon}
          sx={{
            fontSize: "16px",
            flex: "0 0 auto",
            color:
              PatientId && !many ? colors.brand.cyanInk : colors.brand.inkDim,
          }}
        />
        <Typography
          variant="caption"
          noWrap
          sx={{
            minWidth: 0,
            color: PatientId && !many ? colors.brand.ink : colors.brand.inkDim,
            fontWeight: PatientId && !many ? 600 : 400,
          }}
        >
          {label}
        </Typography>
      </Box>
    );
  };

  render() {
    const {
      PatientId,
      PatientRegNo,
      StayId,
      // TeamId,
      DoctorsTeamPatientId,
      MoreOpen,
    } = this.state;
    const {
      ShowSelectionHint = false,
      PatientInfo,
      SaveVisit,
      SaveEcho,
      SaveEcg,
      SaveCathlab,
      SaveBloodStroke,
      SaveCalculator,
      SavePatientTransfer,
      // SaveSendPage,
      SaveHfAmbulance,
      SaveHfHospitalization,
      SaveSurgeryReport,
      SaveValveDiseases,
      SaveValveDiseasesEndo,
      SaveCongenitalMalformations,
      SaveAtrialRhythm,
      SavePaceMakerRhythm,
      SaveMonitoringRhythm,
      SaveICDRhythm,
      SaveSurgeryPlans,
    } = this.props;

    // The five actions a doctor reaches for constantly stay on the first row;
    // the long tail folds away so the bar stops eating three rows of vertical
    // space on a laptop. Order and labels are unchanged either way.
    const PrimaryActions = [
      Helper.AuthHelper.CheckRole([1, 2, 3]) === true ? (
        <BtnNewVisit
          key="visit"
          PatientId={PatientId}
          PatRegNo={PatientRegNo}
          Save={SaveVisit}
          className={buttonClassName + " " + primaryClassName}
        />
      ) : null,

      Helper.AuthHelper.CheckRole([1, 2, 3]) ? (
        <BtnHfAmbulance
          key="ambulance"
          PatientId={PatientId}
          PatientRegNo={PatientRegNo}
          className={buttonClassName}
          Save={SaveHfAmbulance}
        />
      ) : null,

      Helper.AuthHelper.CheckRole([1, 2, 3]) === true ? (
        <DiagnosisAndExamination
          key="diagnosis"
          PatientId={PatientId}
          PatRegNo={PatientRegNo}
          SaveEcho={SaveEcho}
          SaveEcg={SaveEcg}
          SaveCathlab={SaveCathlab}
          SaveBloodStroke={SaveBloodStroke}
          SaveCalculator={SaveCalculator}
          SaveMonitoringRhythm={SaveMonitoringRhythm}
          className={buttonClassName}
        />
      ) : null,

      Helper.AuthHelper.CheckRole([1, 2, 3]) === true ? (
        <TransferAndMonitoring
          key="transfer"
          PatientId={PatientId}
          PatRegNo={PatientRegNo}
          className={buttonClassName}
          SaveTransfer={SavePatientTransfer}
          // SaveSendPage={SaveSendPage}
        />
      ) : null,

      Helper.AuthHelper.CheckRole([1, 2, 3]) === true ? (
        <Surgery
          key="surgery"
          PatientId={PatientId}
          PatRegNo={PatientRegNo}
          className={buttonClassName}
          SaveSurgeryReport={SaveSurgeryReport}
          SaveCathlab={SaveCathlab}
          SaveSurgeryPlans={SaveSurgeryPlans}
        />
      ) : null,
    ].filter(Boolean);

    // Newest last. The three tender-form groups used to sit at the HEAD of this
    // list, so adding them pushed every button a doctor already knew the
    // position of down a row. Anything added from here on goes on the end, and
    // the existing buttons keep the place muscle memory expects.
    const MoreActions = [
      Helper.AuthHelper.CheckRole([1, 2]) === true && PatientInfo ? (
        <BtnHospitalize
          key="hospitalize"
          PatientId={PatientId}
          className={buttonClassName}
        />
      ) : null,

      Helper.AuthHelper.CheckRole([1, 2]) === true ? (
        <BtnProcedure
          key="procedure"
          PatientId={PatientId}
          StayId={StayId}
          className={buttonClassName}
        />
      ) : null,

      Helper.AuthHelper.CheckRole([1, 2]) === true ? (
        <BtnSurgeryBeforeVisitsCheck
          key="before-check"
          PatientId={PatientId}
          DoctorsTeamPatientId={DoctorsTeamPatientId}
          className={buttonClassName}
        />
      ) : null,

      Helper.AuthHelper.CheckRole([1, 2, 3]) === true ? (
        <BtnNewCalculator
          key="calculator"
          PatientId={PatientId}
          className={buttonClassName}
          Save={SaveCalculator}
        />
      ) : null,

      Helper.AuthHelper.CheckRole([1, 2, 3]) === true && PatientInfo ? (
        <NationalRegistry
          key="registry"
          PatientId={PatientId}
          PatientRegNo={PatientRegNo}
          className={buttonClassName}
          SaveHfHospitalization={SaveHfHospitalization}
          SaveValveDiseases={SaveValveDiseases}
          SaveValveDiseasesEndo={SaveValveDiseasesEndo}
          SaveCongenitalMalformations={SaveCongenitalMalformations}
          SaveAtrialRhythm={SaveAtrialRhythm}
          SavePaceMakerRhythm={SavePaceMakerRhythm}
          SaveICDRhythm={SaveICDRhythm}
          SaveMonitoringRhythm={SaveMonitoringRhythm}
        />
      ) : null,

      Helper.AuthHelper.CheckRole([1, 2, 3]) === true && PatientInfo ? (
        <ToCVD
          key="tocvd"
          PatientId={PatientId}
          PatRegNo={PatientRegNo}
          className={buttonClassName}
        />
      ) : null,

      // --- most recently added, and therefore last ------------------------
      // tender group 1: cardiac surgery.
      Helper.AuthHelper.CheckRole([1, 2, 3]) === true ? (
        <CardiacSurgeryForms
          key="tender-surgery"
          PatientId={PatientId}
          PatientRegNo={PatientRegNo}
          className={buttonClassName}
        />
      ) : null,

      // tender group 2: rhythm. Same menu component, different list.
      Helper.AuthHelper.CheckRole([1, 2, 3]) === true ? (
        <CardiacSurgeryForms
          key="tender-rhythm"
          PatientId={PatientId}
          PatientRegNo={PatientRegNo}
          className={buttonClassName}
          Color="info"
          Icon={GraphicEqIcon}
          Label={TENDER_FORM_GROUPS[1].label}
          Forms={TENDER_FORM_GROUPS[1].forms}
        />
      ) : null,

      // tender group 3: angiography. Same menu component, different list.
      Helper.AuthHelper.CheckRole([1, 2, 3]) === true ? (
        <CardiacSurgeryForms
          key="tender-angio"
          PatientId={PatientId}
          PatientRegNo={PatientRegNo}
          className={buttonClassName}
          Color="danger"
          Icon={BloodtypeIcon}
          Label={TENDER_FORM_GROUPS[2].label}
          Forms={TENDER_FORM_GROUPS[2].forms}
        />
      ) : null,
    ].filter(Boolean);

    const rowSx = {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      width: "100%",
      minWidth: 0,
    };

    return (
      <Box
        role="toolbar"
        aria-label={i18n.t("Өвчтөнд хийх үйлдэл")}
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          width: "100%",
          maxWidth: this.props.maxWidth || "100%",
          marginBottom: space[2],
          ...actionBarSx,
        }}
      >
        {ShowSelectionHint ? this.RenderSelectionHint() : null}

        <Box sx={rowSx}>
          {PrimaryActions}

          {MoreActions.length > 0 ? (
            <>
              {/*
               * The toggle is not a fourteenth action, so it does not sit in
               * the run of them. It is pushed to the far edge and fenced off
               * with a hairline, which also fixes the thing that read worst:
               * as a plain last child it moved every time the row rewrapped.
               */}
              <Box sx={{ flex: "1 1 auto", minWidth: space[3] }} />
              <Box
                aria-hidden="true"
                sx={{
                  width: "1px",
                  height: "22px",
                  backgroundColor: colors.brand.hairline,
                  margin: `0 ${space[2]} ${space[1]} ${space[1]}`,
                }}
              />
              <Button
                size="small"
                disableElevation
                onClick={() => this.setState({ MoreOpen: !MoreOpen })}
                aria-expanded={MoreOpen}
                endIcon={
                  <ExpandMoreIcon
                    sx={{
                      transform: MoreOpen ? "rotate(180deg)" : "none",
                      transition: `transform ${motion.fast}`,
                    }}
                  />
                }
                sx={{
                  ...gridToolbarButtonSx.neutral,
                  height: "auto",
                  padding: "6px 10px",
                  margin: `0 ${space[1]} ${space[1]} 0`,
                }}
              >
                {MoreOpen ? i18n.t("Хураах") : i18n.t("Бусад")}
              </Button>
            </>
          ) : null}
        </Box>

        {/*
         * A shelf, not a second toolbar. The tint and the accent rail say the
         * buttons inside belong to the toggle above them; without it the
         * expanded run just looked like the first row had spilled.
         */}
        <Collapse in={MoreOpen} unmountOnExit={false}>
          <Box
            sx={{
              ...rowSx,
              // There is no global `* { box-sizing: border-box }` in this app,
              // so a padded `width: 100%` box would overrun its parent.
              boxSizing: "border-box",
              marginTop: space[2],
              padding: `${space[3]} ${space[3]} ${space[2]} ${space[3]}`,
              backgroundColor: colors.brand.tint,
              borderRadius: radius.xs,
              borderLeft: `3px solid ${colors.brand.cyan}`,
            }}
          >
            {MoreActions}
          </Box>
        </Collapse>
      </Box>
    );
  }
}

export default PatientActions;
