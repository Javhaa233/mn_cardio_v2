import React, { Component, createRef } from "react";
import { withTranslation } from "react-i18next";

import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import ForumIcon from "@mui/icons-material/Forum";
import DescriptionIcon from "@mui/icons-material/Description";
import VideoCameraFrontIcon from "@mui/icons-material/VideoCameraFront";

import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import CustomTab from "customComponents/CustomTab";

import MonitorQuestion from "customComponents/PatientMonitoring/MonitorQuestion";
import PatientMonitoring from "customComponents/PatientMonitoring/PatientMonitoring";
import PatientAdvicePanel from "customComponents/AdviceFeed/PatientAdvicePanel";
import PressureChart from "customComponents/PatientPlatform/PressureChart";
import RemoteVisitList from "customComponents/PatientPlatform/RemoteVisitList";
import EvisitPanel from "customComponents/PatientPlatform/EvisitPanel";

import {
  PatientInfo,
  VisitTable,
  EchoTable,
  EcgTable,
  BloodStrokeTable,
  CalculatorTable,
  PatientHistoryTable,
  OutPatientInfoTable,
  PCathlabTable,
  SurgeryReportTable,
  PatientTransferTable,
  LaboratoryTestTable,
  SurgeryPlansTable,
} from "@features/patient/components/PatientShow";
import { PatientActions } from "@features/patient";
import CVDMonitoringTable from "customComponents/CardiovascularDisease/Tables/CVDMonitoringTable";

// 2023-11-29
import {
  HfAmbulanceTable,
  HfHospitalizationTable,
} from "@features/patient/components/PatientShow/NationalRegistry/HeartFailure";

// 2023-12-22
import { VascularDiseaseTable } from "@features/patient/components/PatientShow/NationalRegistry";

// 2024-01-31
import {
  ValveDiseasesTable,
  ValveDiseasesEndoTable,
} from "@features/patient/components/PatientShow/NationalRegistry/ValveDiseases";

import { CongenitalMalformationsTable } from "@features/patient/components/PatientShow/NationalRegistry/CongenitalMalformations";

// Hem aldagdal
// 2024-09-19
import {
  AtrialRhythmTable,
  MonitoringRhythmTable,
  PaceMakerRhythmTable,
  ICDRhythmTable,
} from "@features/patient/components/PatientShow/NationalRegistry/Rhythm";

// 2024-11-28
import {
  IcdTable,
  PmTable,
} from "@features/patient/components/PatientShow/NationalRegistry";
// import TurulhiinGajigTable from "customComponents/PatientShow/NationalRegistry/TurulhiinGajigTable";

// @mui/icons-material (tab rail icons)
import HistoryIcon from "@mui/icons-material/History";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import AssignmentIcon from "@mui/icons-material/Assignment";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import AirlineSeatFlatIcon from "@mui/icons-material/AirlineSeatFlat";
import PolylineIcon from "@mui/icons-material/Polyline";
import TuneIcon from "@mui/icons-material/Tune";
import CoronavirusIcon from "@mui/icons-material/Coronavirus";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import ScienceIcon from "@mui/icons-material/Science";
import WavesIcon from "@mui/icons-material/Waves";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import PsychologyIcon from "@mui/icons-material/Psychology";
import CableIcon from "@mui/icons-material/Cable";
import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import OfflineBoltIcon from "@mui/icons-material/OfflineBolt";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import TimelineIcon from "@mui/icons-material/Timeline";
import ChildCareIcon from "@mui/icons-material/ChildCare";
import CalculateIcon from "@mui/icons-material/Calculate";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";

// @mui/material components
import Box from "@mui/material/Box";
// default components
import Button from "components/CustomButtons/Button";
// theme
import { colors } from "@/theme/colors";
// history
import customHistory from "customHistory";
import NewPatientDialog from "customComponents/Patient/NewPatientDialog";

import Helper from "helper";

// Upper bound for a tab grid; in Clean mode the grid shrinks to its rows.
const TAB_GRID_MAX_HEIGHT = "560px";

class PatientShow extends Component {
  constructor(props) {
    super(props);
    // `ParamsRead` separates "the URL has not been read yet" (first paint)
    // from "the URL carries no RegisterNo", so the empty state never flashes
    // on the happy path.
    this.state = {
      PatientId: 0,
      RegisterNo: null,
      ParamsRead: false,
      NewPatientOpen: false,
      // Which band of tabs is showing. 'records' is every tab this page has
      // ever had, unchanged and default, so nobody's existing workflow moves.
      TabGroup: "records",
      /*
       * The resolved patient id, for the new bands only.
       *
       * `PatientId` above is NEVER SET: SetPatientId pushes the id into ~25
       * table refs and does not call setState, so state.PatientId is 0 for the
       * life of the page. The existing tabs work because each table receives
       * the id through its ref, not through the prop GetTabs passes it - which
       * is always 0.
       *
       * A separate key rather than fixing that in place: setting PatientId
       * would re-render all 22 existing tabs with a prop that has been 0 since
       * they were written, and several of them fetch on a PatientId prop
       * change as well as on the ref call. That is a change to every tab on
       * this page to serve two new ones, and not one to make blind.
       */
      ContactPatientId: 0,
    };

    // refs
    this.PatientActionsRef = createRef();
    this.VisitTableRef = createRef();
    this.EchoTableRef = createRef();
    this.EcgTableRef = createRef();
    this.BloodStrokeTableRef = createRef();
    this.CalculatorTableRef = createRef();
    this.PCathlabTableRef = createRef();
    this.PatientHistoryTableRef = createRef();
    this.OutPatientInfoTableRef = createRef();
    this.SurgeryReportTableRef = createRef();
    this.HfStayTableRef = createRef();
    this.PatientTransferTableRef = createRef();
    // this.PatientSendPageTableRef = createRef();
    this.LaboratoryTestTableRef = createRef();
    this.CVDMonitoringTableRef = createRef();

    // National registry
    this.HfAmbulanceTableRef = createRef();
    this.HfHospitalizationTableRef = createRef();

    this.VascularDiseaseTableRef = createRef();
    this.ValveDiseasesTableRef = createRef();
    this.ValveDiseasesEndoTableRef = createRef();

    this.CongenitalMalformationsTableRef = createRef();

    // hem aldagdal
    this.AtrialRhythmTableRef = createRef();
    this.MonitoringRhythmTableRef = createRef();
    this.PaceMakerRhythmTableRef = createRef();
    this.ICDRhythmTableRef = createRef();

    // surgery plan
    this.SurgeryPlansTableRef = createRef();
  }

  componentDidMount() {
    // this.props.TabHref, not document.location: with pages kept mounted and
    // chunks loaded lazily, componentDidMount can fire AFTER the doctor has
    // switched tabs, at which point document.location belongs to a different
    // patient. The tab passes its own url in.
    const RegisterNo = Helper.BaseHelper.getUrlParam(
      decodeURI(this.props.TabHref || document.location.href),
      "RegisterNo",
    );
    this.setState({
      RegisterNo: RegisterNo
        ? RegisterNo.replace(/\s/g, "").toUpperCase()
        : null,
      ParamsRead: true,
    });
  }

  SetPatientId = (PatientId) => {
    const { RegisterNo } = this.state;
    if (PatientId) {
      // See the ContactPatientId note in the constructor.
      if (this.state.ContactPatientId !== PatientId) {
        this.setState({ ContactPatientId: PatientId });
      }
      this.PatientActionsRef.SetValues &&
        this.PatientActionsRef.SetValues({
          PatientId,
          PatientRegNo: RegisterNo,
        });
      // All tables ref
      this.VisitTableRef.SetPatientId &&
        this.VisitTableRef.SetPatientId(PatientId);
      this.EchoTableRef.SetPatientId &&
        this.EchoTableRef.SetPatientId(PatientId);
      this.EcgTableRef.SetPatientId && this.EcgTableRef.SetPatientId(PatientId);
      this.BloodStrokeTableRef.SetPatientId &&
        this.BloodStrokeTableRef.SetPatientId(PatientId);
      this.CalculatorTableRef.SetPatientId &&
        this.CalculatorTableRef.SetPatientId(PatientId);
      this.PCathlabTableRef.SetPatientId &&
        this.PCathlabTableRef.SetPatientId(PatientId);
      this.PatientHistoryTableRef.SetPatientId &&
        this.PatientHistoryTableRef.SetPatientId(PatientId);
      this.OutPatientInfoTableRef.SetPatientId &&
        this.OutPatientInfoTableRef.SetPatientId(PatientId);

      this.SurgeryReportTableRef.SetPatientId &&
        this.SurgeryReportTableRef.SetPatientId(PatientId);

      this.HfStayTableRef.SetPatientId &&
        this.HfStayTableRef.SetPatientId(PatientId);

      this.PatientTransferTableRef.SetPatientId &&
        this.PatientTransferTableRef.SetPatientId(PatientId);

      // Send page to hospital (13a-b)
      // this.PatientSendPageTableRef.SetPatientId &&
      //   this.PatientSendPageTableRef.SetPatientId(PatientId);
      // this.PatientSendPageTableRef.SetPatRegNo &&
      //   this.PatientSendPageTableRef.SetPatRegNo(RegisterNo);

      this.LaboratoryTestTableRef.SetPatientId &&
        this.LaboratoryTestTableRef.SetPatientId(PatientId);

      this.CVDMonitoringTableRef.SetPatRegNo &&
        this.CVDMonitoringTableRef.SetPatRegNo(RegisterNo);

      this.HfAmbulanceTableRef.SetPatRegNo &&
        this.HfAmbulanceTableRef.SetPatRegNo(RegisterNo);
      this.HfHospitalizationTableRef.SetPatRegNo &&
        this.HfHospitalizationTableRef.SetPatRegNo(RegisterNo);

      this.VascularDiseaseTableRef.SetPatRegNo &&
        this.VascularDiseaseTableRef.SetPatRegNo(RegisterNo);

      // Хавхлагын эмгэг
      this.ValveDiseasesTableRef.SetPatRegNo &&
        this.ValveDiseasesTableRef.SetPatRegNo(RegisterNo);
      this.ValveDiseasesEndoTableRef.SetPatRegNo &&
        this.ValveDiseasesEndoTableRef.SetPatRegNo(RegisterNo);

      // Төрөлхийн гажиг
      this.CongenitalMalformationsTableRef.SetPatRegNo &&
        this.CongenitalMalformationsTableRef.SetPatRegNo(RegisterNo);

      // Hem aldagdal
      this.AtrialRhythmTableRef.SetPatRegNo &&
        this.AtrialRhythmTableRef.SetPatRegNo(RegisterNo);
      this.MonitoringRhythmTableRef.SetPatRegNo &&
        this.MonitoringRhythmTableRef.SetPatRegNo(RegisterNo);

      this.PaceMakerRhythmTableRef.SetPatRegNo &&
        this.PaceMakerRhythmTableRef.SetPatRegNo(RegisterNo);
      this.ICDRhythmTableRef.SetPatRegNo &&
        this.ICDRhythmTableRef.SetPatRegNo(RegisterNo);

      // Surgery plan 2024-11-28
      this.SurgeryPlansTableRef.SetPatRegNo &&
        this.SurgeryPlansTableRef.SetPatRegNo(RegisterNo);
    }
    this.setState({ PatientId });
  };

  GetTabs = () => {
    const { RegisterNo, PatientId } = this.state;
    const tabs = [];

    tabs.push({
      tabButton: "History",
      tabIcon: <HistoryIcon />,
      tabContent: (
        <PatientHistoryTable
          ref={(ref) => (this.PatientHistoryTableRef = ref)}
          ObjectName="PatientHistory"
          CustomRender={true}
          Title="History"
          Color="info"
          WithoutCard={true}
          Clean={true}
          Height={TAB_GRID_MAX_HEIGHT}
          PatientId={PatientId}
        />
      ),
    });

    tabs.push({
      tabButton: "Outpatient Info",
      tabIcon: <AssignmentIndIcon />,
      tabContent: (
        <OutPatientInfoTable
          ref={(ref) => (this.OutPatientInfoTableRef = ref)}
          ObjectName="OutPatientInfo"
          CustomRender={true}
          Title="Outpatient Info"
          Color="info"
          WithoutCard={true}
          Clean={true}
          Height={TAB_GRID_MAX_HEIGHT}
          PatientId={PatientId}
        />
      ),
    });

    tabs.push({
      tabButton: "Visit",
      tabIcon: <AssignmentIcon />,
      tabContent: (
        <VisitTable
          ref={(ref) => (this.VisitTableRef = ref)}
          CustomRender={true}
          ObjectName="Visit"
          Title="Visit"
          Color="info"
          WithoutCard={true}
          Clean={true}
          Height={TAB_GRID_MAX_HEIGHT}
          PatientId={PatientId}
        />
      ),
    });

    tabs.push({
      tabButton: "CVD Monitoring",
      tabIcon: <FavoriteIcon />,
      tabContent: (
        <CVDMonitoringTable
          ref={(ref) => (this.CVDMonitoringTableRef = ref)}
          CustomRender={true}
          ObjectName="CVDMonitoring"
          WithoutCard={true}
          Clean={true}
          Height={TAB_GRID_MAX_HEIGHT}
          PatRegNo={RegisterNo}
        />
      ),
    });

    tabs.push({
      tabButton: "Heart Failure - Ambulance",
      tabIcon: <LocalHospitalIcon />,
      tabContent: (
        <HfAmbulanceTable
          ref={(ref) => (this.HfAmbulanceTableRef = ref)}
          CustomRender={true}
          ObjectName="HfAmbulance"
          Title="Heart Failure - Ambulance"
          Color="info"
          WithoutCard={true}
          Clean={true}
          Height={TAB_GRID_MAX_HEIGHT}
          PatRegNo={RegisterNo}
        />
      ),
    });

    tabs.push({
      tabButton: "Heart Failure - Hospitalization",
      tabIcon: <AirlineSeatFlatIcon />,
      tabContent: (
        <HfHospitalizationTable
          ref={(ref) => (this.HfHospitalizationTableRef = ref)}
          CustomRender={true}
          ObjectName="HfHospitalization"
          Title="Heart Failure - Hospitalization"
          Color="info"
          WithoutCard={true}
          Clean={true}
          Height={TAB_GRID_MAX_HEIGHT}
          PatRegNo={RegisterNo}
        />
      ),
    });

    tabs.push({
      tabButton: "Vascular Disease",
      tabIcon: <PolylineIcon />,
      tabContent: (
        <VascularDiseaseTable
          ref={(ref) => (this.VascularDiseaseTableRef = ref)}
          CustomRender={true}
          ObjectName="VascularDisease"
          Title="Vascular Disease"
          Color="info"
          WithoutCard={true}
          Clean={true}
          Height={TAB_GRID_MAX_HEIGHT}
          PatRegNo={RegisterNo}
        />
      ),
    });

    tabs.push({
      tabButton: "Valve Diseases",
      tabIcon: <TuneIcon />,
      tabContent: (
        <ValveDiseasesTable
          ref={(ref) => (this.ValveDiseasesTableRef = ref)}
          CustomRender={true}
          ObjectName="ValveDiseases"
          Title="Valve Diseases"
          Color="info"
          WithoutCard={true}
          Clean={true}
          Height={TAB_GRID_MAX_HEIGHT}
          PatRegNo={RegisterNo}
        />
      ),
    });

    tabs.push({
      tabButton: "Valve Diseases - Endocarditis",
      tabIcon: <CoronavirusIcon />,
      tabContent: (
        <ValveDiseasesEndoTable
          ref={(ref) => (this.ValveDiseasesEndoTableRef = ref)}
          CustomRender={true}
          ObjectName="ValveDiseasesEndo"
          Title="Valve Diseases - Endocarditis"
          Color="info"
          WithoutCard={true}
          Clean={true}
          Height={TAB_GRID_MAX_HEIGHT}
          PatRegNo={RegisterNo}
        />
      ),
    });

    tabs.push({
      tabButton: "Patient Transfer",
      tabIcon: <SwapHorizIcon />,
      tabContent: (
        <PatientTransferTable
          ref={(ref) => (this.PatientTransferTableRef = ref)}
          CustomRender={true}
          ObjectName="PatientTransfer"
          Title="Patient Transfer"
          Color="info"
          WithoutCard={true}
          Clean={true}
          Height={TAB_GRID_MAX_HEIGHT}
          PatientId={PatientId}
        />
      ),
    });

    tabs.push({
      tabButton: "Laboratory Test",
      tabIcon: <ScienceIcon />,
      tabContent: (
        <LaboratoryTestTable
          ref={(ref) => (this.LaboratoryTestTableRef = ref)}
          CustomRender={true}
          ObjectName="LaboratoryTest"
          Title="Laboratory Test"
          Color="info"
          WithoutCard={true}
          Clean={true}
          Height={TAB_GRID_MAX_HEIGHT}
          PatientId={PatientId}
        />
      ),
    });

    tabs.push({
      tabButton: "Echocardiography",
      tabIcon: <WavesIcon />,
      tabContent: (
        <EchoTable
          ref={(ref) => (this.EchoTableRef = ref)}
          ObjectName="ExaminationEcho"
          CustomRender={true}
          Title="Echocardiography"
          Color="info"
          WithoutCard={true}
          Clean={true}
          Height={TAB_GRID_MAX_HEIGHT}
          PatientId={PatientId}
        />
      ),
    });

    tabs.push({
      tabButton: "ECG",
      tabIcon: <MonitorHeartIcon />,
      tabContent: (
        <EcgTable
          ref={(ref) => (this.EcgTableRef = ref)}
          ObjectName="EcgExamination"
          CustomRender={true}
          Title="ECG"
          Color="info"
          WithoutCard={true}
          Clean={true}
          Height={TAB_GRID_MAX_HEIGHT}
          PatientId={PatientId}
        />
      ),
    });

    tabs.push({
      tabButton: "Surgery Report",
      tabIcon: <MedicalServicesIcon />,
      tabContent: (
        <SurgeryReportTable
          ref={(ref) => (this.SurgeryReportTableRef = ref)}
          ObjectName="CardiacSurgeryReport"
          CustomRender={true}
          Title="Surgery Report"
          Color="info"
          WithoutCard={true}
          Clean={true}
          Height={TAB_GRID_MAX_HEIGHT}
          PatientId={PatientId}
        />
      ),
    });

    tabs.push({
      tabButton: "Blood Stroke",
      tabIcon: <PsychologyIcon />,
      tabContent: (
        <BloodStrokeTable
          ref={(ref) => (this.BloodStrokeTableRef = ref)}
          ObjectName="BloodStroke"
          CustomRender={true}
          Title="Blood Stroke"
          Color="info"
          WithoutCard={true}
          Clean={true}
          Height={TAB_GRID_MAX_HEIGHT}
          PatientId={PatientId}
        />
      ),
    });

    tabs.push({
      tabButton: "Cathlab",
      tabIcon: <CableIcon />,
      tabContent: (
        <PCathlabTable
          ref={(ref) => (this.PCathlabTableRef = ref)}
          ObjectName="PCathlab"
          CustomRender={true}
          Title="Cathlab"
          Color="info"
          WithoutCard={true}
          Clean={true}
          Height={TAB_GRID_MAX_HEIGHT}
          PatientId={PatientId}
        />
      ),
    });

    tabs.push({
      tabButton: "Pacemaker",
      tabIcon: <ElectricBoltIcon />,
      tabContent: (
        <PaceMakerRhythmTable
          ref={(ref) => (this.PaceMakerRhythmTableRef = ref)}
          ObjectName="PaceMakerRhythm"
          CustomRender={true}
          Title="Pacemaker"
          Color="info"
          WithoutCard={true}
          Clean={true}
          Height={TAB_GRID_MAX_HEIGHT}
          PatRegNo={RegisterNo}
        />
      ),
    });

    tabs.push({
      tabButton: "ICD",
      tabIcon: <OfflineBoltIcon />,
      tabContent: (
        <ICDRhythmTable
          ref={(ref) => (this.ICDRhythmTableRef = ref)}
          ObjectName="ICDRhythm"
          CustomRender={true}
          Title="ICD"
          Color="info"
          WithoutCard={true}
          Clean={true}
          Height={TAB_GRID_MAX_HEIGHT}
          PatRegNo={RegisterNo}
        />
      ),
    });

    tabs.push({
      tabButton: "Atrial Rhythm",
      tabIcon: <GraphicEqIcon />,
      tabContent: (
        <AtrialRhythmTable
          ref={(ref) => (this.AtrialRhythmTableRef = ref)}
          ObjectName="AtrialRhythm"
          CustomRender={true}
          Title="Atrial Rhythm"
          Color="info"
          WithoutCard={true}
          Clean={true}
          Height={TAB_GRID_MAX_HEIGHT}
          PatRegNo={RegisterNo}
        />
      ),
    });

    tabs.push({
      tabButton: "Monitoring Rhythm",
      tabIcon: <TimelineIcon />,
      tabContent: (
        <MonitoringRhythmTable
          ref={(ref) => (this.MonitoringRhythmTableRef = ref)}
          ObjectName="MonitoringRhythm"
          CustomRender={true}
          Title="Monitoring Rhythm"
          Color="info"
          WithoutCard={true}
          Clean={true}
          Height={TAB_GRID_MAX_HEIGHT}
          PatRegNo={RegisterNo}
        />
      ),
    });

    tabs.push({
      tabButton: "Congenital Malformations",
      tabIcon: <ChildCareIcon />,
      tabContent: (
        <CongenitalMalformationsTable
          ref={(ref) => (this.CongenitalMalformationsTableRef = ref)}
          ObjectName="CongenitalMalformations"
          CustomRender={true}
          Title="Congenital Malformations"
          Color="info"
          WithoutCard={true}
          Clean={true}
          Height={TAB_GRID_MAX_HEIGHT}
          PatRegNo={RegisterNo}
        />
      ),
    });

    tabs.push({
      tabButton: "Calculator",
      tabIcon: <CalculateIcon />,
      tabContent: (
        <CalculatorTable
          ref={(ref) => (this.CalculatorTableRef = ref)}
          ObjectName="Calculator"
          CustomRender={true}
          Title="Calculator"
          Color="info"
          WithoutCard={true}
          Clean={true}
          Height={TAB_GRID_MAX_HEIGHT}
          PatientId={PatientId}
        />
      ),
    });

    return tabs;
  };

  /**
   * The Харилцаа band: everything a doctor does WITH this patient rather than
   * TO their record.
   *
   * These lived as dialogs hanging off a row of the Хувийн хяналт grid, which
   * is why a doctor could not see a question and the patient's last blood
   * pressure at the same time. They are panels here instead.
   *
   * Every one of them is gated on the monitoring list server-side, so a patient
   * the doctor does not monitor gets a stated reason rather than an empty box -
   * see DoctorApiHelper's header on the NOT_MONITORED contract.
   */
  GetContactTabs = () => {
    const { ContactPatientId: PatientId, RegisterNo } = this.state;
    if (!PatientId) return [];

    return [
      {
        tabButton: "Асуулт",
        tabIcon: <QuestionAnswerIcon />,
        tabContent: (
          <div style={{ height: TAB_GRID_MAX_HEIGHT }}>
            <MonitorQuestion
              PatientId={PatientId}
              Patient={{ p_registration: RegisterNo }}
            />
          </div>
        ),
      },
      {
        tabButton: "Зөвлөгөө",
        tabIcon: <ForumIcon />,
        tabContent: (
          <PatientAdvicePanel
            PatientId={PatientId}
            RegisterNo={RegisterNo}
            Height={TAB_GRID_MAX_HEIGHT}
          />
        ),
      },
    ];
  };

  /**
   * The Хяналт band: what the patient records about themselves between visits.
   *
   * PatientMonitoring is the vitals grid the doctor already had in a dialog.
   * PressureChart was written for the patient portal and pointed at a
   * token-scoped endpoint; it is reused here against the doctor route, which is
   * access-audited and row-capped.
   */
  GetMonitoringTabs = () => {
    const { ContactPatientId: PatientId, RegisterNo } = this.state;
    if (!PatientId) return [];

    return [
      {
        tabButton: "Даралт, судас",
        tabIcon: <MonitorHeartIcon />,
        tabContent: (
          <PressureChart PatientId={PatientId} Height={TAB_GRID_MAX_HEIGHT} />
        ),
      },
      {
        tabButton: "Тэмдэглэл",
        tabIcon: <DescriptionIcon />,
        tabContent: (
          <PatientMonitoring
            ObjectName="PatientMonitoring"
            CustomRender={true}
            PatientId={PatientId}
            Patient={{ p_registration: RegisterNo }}
          />
        ),
      },
      {
        // The queue and the three triage actions.
        tabButton: "Цахим үзлэг",
        tabIcon: <VideoCameraFrontIcon />,
        tabContent: (
          <EvisitPanel PatientId={PatientId} Height={TAB_GRID_MAX_HEIGHT} />
        ),
      },
      {
        // The record. Kept alongside because the legacy route it reads is
        // still the only one that returns the attachments on a visit.
        tabButton: "Үзлэгийн түүх",
        tabIcon: <HistoryIcon />,
        tabContent: (
          <RemoteVisitList
            PatientId={PatientId}
            Patient={{ p_registration: RegisterNo }}
          />
        ),
      },
    ];
  };

  TabsForGroup = () => {
    const { TabGroup } = this.state;
    if (TabGroup === "contact") return this.GetContactTabs();
    if (TabGroup === "monitoring") return this.GetMonitoringTabs();
    return this.GetTabs();
  };

  render() {
    const { t } = this.props;
    const { PatientId, RegisterNo, ParamsRead, TabGroup, ContactPatientId } =
      this.state;

    const containerStyle = {
      width: "100%",
      maxWidth: "2400px",
      margin: "0 auto",
      padding: "0px 10px 20px 10px",
      boxSizing: "border-box",
    };

    if (!RegisterNo) {
      // First paint, before componentDidMount has read the query string.
      if (!ParamsRead) return null;
      // A stale bookmark or a copy-pasted URL that lost its `RegisterNo` used
      // to render nothing at all. Say so, and offer a way onward - patient
      // search lives in the top bar, so the action button goes home.
      return (
        <div style={{ width: "100%" }}>
          <div style={containerStyle}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                minHeight: "320px",
                padding: "40px 20px",
                textAlign: "center",
                backgroundColor: colors.background.primary,
                borderRadius: "3px",
              }}
            >
              <PersonSearchIcon
                sx={{ fontSize: "44px", color: colors.text.disabled }}
              />
              <Box
                sx={{
                  fontSize: "18px",
                  fontWeight: 500,
                  color: colors.text.primary,
                }}
              >
                {t("Үйлчлүүлэгч сонгогдоогүй байна")}
              </Box>
              <Box
                sx={{
                  fontSize: "13px",
                  color: colors.text.secondary,
                  maxWidth: "420px",
                }}
              >
                {t(
                  "Дээд талын хайлтын мөрөнд регистрийн дугаараар хайж үйлчлүүлэгчээ сонгоно уу",
                )}
              </Box>
              {/* Two ways out, not one. Landing here means a lookup found
                  nobody, which is exactly the moment a doctor with a walk-in
                  needs to register them - previously the only route was to go
                  back and search again for a number that does not exist. */}
              <Box
                sx={{
                  display: "flex",
                  gap: "8px",
                  marginTop: "6px",
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                {Helper.AuthHelper.CheckRole([1, 2, 3]) === true && (
                  <Button
                    color="info"
                    size="sm"
                    style={{ textTransform: "none", borderRadius: "3px" }}
                    onClick={() => this.setState({ NewPatientOpen: true })}
                  >
                    {t("Шинэ өвчтөн бүртгэх")}
                  </Button>
                )}
                <Button
                  color="white"
                  size="sm"
                  style={{ textTransform: "none", borderRadius: "3px" }}
                  onClick={() => customHistory.push("/admin/AdviceHome")}
                >
                  {t("Нүүр хуудас руу буцах")}
                </Button>
              </Box>
              <NewPatientDialog
                open={this.state.NewPatientOpen}
                onClose={() => this.setState({ NewPatientOpen: false })}
                onCreated={({ RegisterNo }) => {
                  if (RegisterNo) {
                    customHistory.push(
                      "/admin/PatientInfo?RegisterNo=" + RegisterNo,
                    );
                  }
                }}
              />
            </Box>
          </div>
        </div>
      );
    } else {
      return (
        <div style={{ width: "100%" }}>
          <div style={containerStyle}>
            <GridContainer style={{ marginBottom: "10px" }}>
              <GridItem xs={12} sm={12} md={12}>
                <PatientActions
                  ref={(ref) => (this.PatientActionsRef = ref)}
                  PatientId={PatientId}
                  PatientRegNo={RegisterNo}
                  PatientInfo={true}
                  SaveVisit={(Success) => {
                    Success &&
                      this.VisitTableRef.GetData &&
                      this.VisitTableRef.GetData(false);
                  }}
                  SaveEcho={(Success) => {
                    Success &&
                      this.EchoTableRef.GetData &&
                      this.EchoTableRef.GetData(false);
                  }}
                  SaveEcg={(Success) => {
                    Success &&
                      this.EcgTableRef.GetData &&
                      this.EcgTableRef.GetData(false);
                  }}
                  SaveBloodStroke={(Success) => {
                    Success &&
                      this.BloodStrokeTableRef.GetData &&
                      this.BloodStrokeTableRef.GetData(false);
                  }}
                  SaveSurgeryReport={(Success) => {
                    Success &&
                      this.SurgeryReportTableRef.GetData &&
                      this.SurgeryReportTableRef.GetData(false);
                  }}
                  SaveCalculator={(Success) => {
                    Success &&
                      this.CalculatorTableRef.GetData &&
                      this.CalculatorTableRef.GetData(false);
                  }}
                  SaveCathlab={(Success) => {
                    Success &&
                      this.PCathlabTableRef.GetData &&
                      this.PCathlabTableRef.GetData(false);
                  }}
                  SaveVascularDisease={(Success) => {
                    Success &&
                      this.VascularDiseaseTableRef.GetData &&
                      this.VascularDiseaseTableRef.GetData(false);
                  }}
                  SaveHfStay={(Success) => {
                    Success &&
                      this.HfStayTableRef.GetData &&
                      this.HfStayTableRef.GetData(false);
                  }}
                  SaveHfAmbulance={(Success) => {
                    Success &&
                      this.HfAmbulanceTableRef.GetData &&
                      this.HfAmbulanceTableRef.GetData(false);
                  }}
                  SaveHfHospitalization={(Success) => {
                    Success &&
                      this.HfHospitalizationTableRef.GetData &&
                      this.HfHospitalizationTableRef.GetData(false);
                  }}
                  SaveValveDiseases={(Success) => {
                    Success &&
                      this.ValveDiseasesTableRef.GetData &&
                      this.ValveDiseasesTableRef.GetData(false);
                  }}
                  SaveValveDiseasesEndo={(Success) => {
                    Success &&
                      this.ValveDiseasesEndoTableRef.GetData &&
                      this.ValveDiseasesEndoTableRef.GetData(false);
                  }}
                  SavePatientTransfer={(Success) => {
                    Success &&
                      this.PatientTransferTableRef.GetData &&
                      this.PatientTransferTableRef.GetData(false);
                  }}
                  // SaveSendPage={(Success) => {
                  //   Success &&
                  //     this.PatientSendPageTableRef.GetData &&
                  //     this.PatientSendPageTableRef.GetData(false);
                  // }}
                  SaveLaboratoryTest={(Success) => {
                    Success &&
                      this.LaboratoryTestTableRef.GetData &&
                      this.LaboratoryTestTableRef.GetData(false);
                  }}
                  SaveCongenitalMalformations={(Success) => {
                    Success &&
                      this.CongenitalMalformationsTableRef.GetData &&
                      this.CongenitalMalformationsTableRef.GetData(false);
                  }}
                  SaveAtrialRhythm={(Success) => {
                    Success &&
                      this.AtrialRhythmTableRef.GetData &&
                      this.AtrialRhythmTableRef.GetData(false);
                  }}
                  SavePaceMakerRhythm={(Success) => {
                    Success &&
                      this.PaceMakerRhythmTableRef.GetData &&
                      this.PaceMakerRhythmTableRef.GetData(false);
                  }}
                  SaveICDRhythm={(Success) => {
                    Success &&
                      this.ICDRhythmTableRef.GetData &&
                      this.ICDRhythmTableRef.GetData(false);
                  }}
                  SaveMonitoringRhythm={(Success) => {
                    Success &&
                      this.MonitoringRhythmTableRef.GetData &&
                      this.MonitoringRhythmTableRef.GetData(false);
                  }}
                  SaveSurgeryPlans={(success) => {
                    success &&
                      this.SurgeryPlansTableRef.GetData &&
                      this.SurgeryPlansTableRef.GetData(false);
                  }}
                />
              </GridItem>
            </GridContainer>
            <GridContainer spacing={2}>
              <GridItem xs={12} sm={12} md={4}>
                <PatientInfo
                  RegisterNo={RegisterNo}
                  GetData={this.SetPatientId}
                />
              </GridItem>
              <GridItem xs={12} sm={12} md={8}>
                {/* A band selector ABOVE the tab strip rather than 27 pills in
                    one scrolling row. CustomTab is untouched - it still just
                    receives an array - so this cannot affect any other screen
                    that uses it. 'records' is the existing 22 tabs, unchanged
                    and default. */}
                <ToggleButtonGroup
                  exclusive
                  size="small"
                  value={TabGroup}
                  onChange={(e, v) => v && this.setState({ TabGroup: v })}
                  sx={{ mb: 1 }}
                >
                  <ToggleButton value="records">
                    {t("Эмнэлгийн бүртгэл")}
                  </ToggleButton>
                  <ToggleButton value="contact" disabled={!ContactPatientId}>
                    {t("Харилцаа")}
                  </ToggleButton>
                  <ToggleButton value="monitoring" disabled={!ContactPatientId}>
                    {t("Хяналт")}
                  </ToggleButton>
                </ToggleButtonGroup>

                <CustomTab
                  // Remount on band change: CustomTab keeps its own selected
                  // index, and carrying index 7 from a 22-tab band into a
                  // 2-tab one renders nothing at all.
                  key={TabGroup}
                  tabs={this.TabsForGroup()}
                  sideBar={true}
                  wrapped={true}
                  fillHeight={false}
                />
              </GridItem>
            </GridContainer>
          </div>
        </div>
      );
    }
  }
}

export default withTranslation()(PatientShow);
