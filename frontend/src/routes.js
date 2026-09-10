import React from "react";
import i18n from "./i18n";
//icons
import AppsIcon from "@mui/icons-material/Apps";
import HistoryIcon from "@mui/icons-material/History";
import PersonIcon from "@mui/icons-material/Person";
import HomeIcon from "@mui/icons-material/Home";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import SecurityIcon from "@mui/icons-material/Security";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import SettingsIcon from "@mui/icons-material/Settings";
import DescriptionIcon from "@mui/icons-material/Description";
import PinDropIcon from "@mui/icons-material/PinDrop";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import StorageIcon from "@mui/icons-material/Storage";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import GroupIcon from "@mui/icons-material/Group";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import ReceiptIcon from "@mui/icons-material/Receipt";
import AirlineSeatFlatIcon from "@mui/icons-material/AirlineSeatFlat";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import AssessmentIcon from "@mui/icons-material/Assessment";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import AddAlertIcon from "@mui/icons-material/AddAlert";
import TableChartIcon from "@mui/icons-material/TableChart";
import RestorePageIcon from "@mui/icons-material/RestorePage";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
// import InsertChartIcon from "@mui/icons-material/InsertChart";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
// import SettingsApplicationsIcon from "@mui/icons-material/SettingsApplications";
import ExtensionIcon from "@mui/icons-material/Extension";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import AirlineSeatIndividualSuiteIcon from "@mui/icons-material/AirlineSeatIndividualSuite";
import BrokenImageIcon from "@mui/icons-material/BrokenImage";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import LooksIcon from "@mui/icons-material/Looks";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";

import BallotIcon from "@mui/icons-material/Ballot";
import CardTravelIcon from "@mui/icons-material/CardTravel";
import ChromeReaderModeIcon from "@mui/icons-material/ChromeReaderMode";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import OfflineBoltIcon from "@mui/icons-material/OfflineBolt";
import ViewHeadlineIcon from "@mui/icons-material/ViewHeadline";

//security
import Apps from "view/Security/Apps";
import Users from "view/Security/Users.jsx";
import Roles from "view/Security/Roles";
import Permissions from "view/Security/Permissions";
// test pages
import FileUploadPage from "view/FileUpload.jsx";
// auth pages
import LoginPage from "view/Auth/LoginPage.jsx";
import PatientLoginPage from "view/Patient/Auth/PatientLoginPage.jsx";
import RegisterPage from "view/Auth/RegisterPage.jsx";
import ForgetPassword from "view/Auth/ForgetPassword.jsx";
import ResetPassword from "view/Auth/ResetPassword.jsx";

// admin pages
import Patient from "view/Patient";
import DoctorsProfile from "view/DoctorsProfile.jsx";
import OptionType from "view/OptionType.jsx";
import DictProvinceCity from "view/DictProvinceCity";
import JournalRef from "view/JournalRef";
import DoctorsTeam from "view/DoctorsTeam";
import DoctorTeamCustom from "view/DoctorTeamCustom.jsx";
import AdviceHome from "view/AdviceHome.jsx";
import AdviceComment from "view/AdviceComment.jsx";
import PatientShow from "view/PatientShow.jsx";
import InPatient from "view/InPatient.jsx";
import DrgroupDepartments from "view/DrgroupDepartments";

import MyTicket from "view/MyTicket";
import AllTickets from "view/AllTickets";
import AllNotifications from "view/AllNotifications.jsx";
import PatientMonitoringDoctor from "customComponents/PatientMonitoring/PatientMonitoringDoctor";
const PatientMonitoringDoctorWithHiddenExport = () =>
  React.createElement(PatientMonitoringDoctor, { HideExport: true });
// import Organization from "view/Organization";
import Organization from "view/OrganizationNew.jsx";
import Profile from "view/Profile.jsx";
// import LocalPatientList from "view/LocalPatientList";
import CreatePatientList from "view/CreatePatientList.jsx";
import CreateAllVisits from "view/CreateAllVisits.jsx";
const CreateAllVisitsAdmin = () =>
  React.createElement(CreateAllVisits, { IsAdmin: true, HideExports: true });
import PaceMaker from "view/PaceMaker.jsx";
import UserActionHistoryAdminTable from "customComponents/UserActionHistoryAdmin";
const UserActionHistoryAdmin = () =>
  React.createElement(UserActionHistoryAdminTable, { CustomRender: true });
import Reports from "view/Reports.jsx";

import UserRequestsList from "customComponents/UserRequest/UserRequestsList";
const UserRequests = () =>
  React.createElement(UserRequestsList, {
    CustomRender: true,
    ObjectName: "UserRequests",
  });

// Patient Platform
import PatientProfile from "view/Patient/PatientProfile.jsx";
import PatientMonitoring from "view/Patient/PatientMonitoring.jsx";
import PatientQuestion from "view/Patient/VisitComments.jsx";
import PatientRemoteVisit from "view/Patient/PatientRemoteVisit.jsx";
import PatientCVD from "view/Patient/PatientCVD.jsx";

// CardiovascularDisease
import CVDPatientInfo from "view/CardiovascularDisease/CVDPatientInfo.jsx";
import CVDHistoryTableNew from "customComponents/CardiovascularDisease/Tables/CVDHistoryTableNew";
const CVDMonitoringList = () =>
  React.createElement(CVDHistoryTableNew, { CustomRender: true });
import CVDMonitoringReportList from "view/CardiovascularDisease/CVDMonitoringReportList.jsx";
import CVDIndicartors from "view/CardiovascularDisease/CVDIndicartors.jsx";
import CVDRegistration from "view/CardiovascularDisease/CVDRegistration.jsx";

// National Register
// Heart failure
import HfAmbulanceList from "view/NationalRegistry/HeartFailure/HfAmbulanceList";
import HfHospitalizationTable from "customComponents/NationalRegistry/HeartFailure/HfHospitalizationTable";
const HfHospitalizationList = () =>
  React.createElement(HfHospitalizationTable, {
    CustomRender: true,
    ObjectName: "HfHospitalization",
  });

// VascularDisease
import VascularDiseaseTable from "customComponents/NationalRegistry/VascularDisease/VascularDiseaseTable";
const VascularDiseaseList = () =>
  React.createElement(VascularDiseaseTable, {
    CustomRender: true,
    ObjectName: "VascularDisease",
  });
import CongenitalMalformationsTable from "customComponents/NationalRegistry/CongenitalMalformations/CongenitalMalformationsTable";
const NeeltteiList = () =>
  React.createElement(CongenitalMalformationsTable, {
    ObjectName: "CongenitalMalformations",
    color: "rose",
    Title: "НЭЭЛТТЭЙ МЭС ЗАСАЛ",
    CustomRender: true,
    Category: "neelttei",
  });
const SudasList = () =>
  React.createElement(CongenitalMalformationsTable, {
    ObjectName: "CongenitalMalformations",
    color: "success",
    Title: "СУДСАН ДОТУУРХ МЭС ЗАСАЛ",
    CustomRender: true,
    Category: "sudsan_dotuurh",
  });
const KatetrList = () =>
  React.createElement(CongenitalMalformationsTable, {
    ObjectName: "CongenitalMalformations",
    color: "danger",
    Title: "Катетр ангиографийн оношилгоо",
    CustomRender: true,
    Category: "katetr",
  });

// import IcdList from "view/NationalRegistry/Rhythm/IcdList";
// import PmList from "view/NationalRegistry/Rhythm/PmList";

import ValveDiseasesTable from "customComponents/NationalRegistry/ValveDiseases/ValveDiseasesTable";
const ValveDiseasesList = () =>
  React.createElement(ValveDiseasesTable, {
    CustomRender: true,
    ObjectName: "ValveDiseases",
  });
import ValveDiseasesEndoTable from "customComponents/NationalRegistry/ValveDiseases/ValveDiseasesEndoTable";
const ValveDiseasesEndoList = () =>
  React.createElement(ValveDiseasesEndoTable, {
    CustomRender: true,
    ObjectName: "ValveDiseasesEndo",
  });

// Medications
import Medications from "view/Medications";

// 2024-09-19
import AtrialRhythmTable from "customComponents/NationalRegistry/Rhythm/AtrialRhythmTable";
const AtrialRhythmList = () =>
  React.createElement(AtrialRhythmTable, {
    CustomRender: true,
    ObjectName: "AtrialRhythm",
  });
import ICDRhythmTable from "customComponents/NationalRegistry/Rhythm/ICDRhythmTable";
const ICDRhythmList = () =>
  React.createElement(ICDRhythmTable, {
    CustomRender: true,
    ObjectName: "ICDRhythm",
  });
import PaceMakerRhythmTable from "customComponents/NationalRegistry/Rhythm/PaceMakerRhythmTable";
const PaceMakerRhythmList = () =>
  React.createElement(PaceMakerRhythmTable, {
    CustomRender: true,
    ObjectName: "PaceMakerRhythm",
  });
import MonitoringRhythmTable from "customComponents/NationalRegistry/Rhythm/MonitoringRhythmTable";
const MonitoringRhythmList = () =>
  React.createElement(MonitoringRhythmTable, {
    CustomRender: true,
    ObjectName: "MonitoringRhythm",
  });

// 2024-11-28
//import SurgeryPlans from "view/Surgery/SurgeryPlans";
import CVDInspectionTableAll from "customComponents/CardiovascularDisease/Tables/CVDInspectionTableAll";
const CVDInspectionList = () =>
  React.createElement(CVDInspectionTableAll, {
    CustomRender: true,
    ObjectName: "CVDInspection",
  });

// 2025-02-20
import AtrialRhythmNewTable from "customComponents/NationalRegistry/Rhythm/AtrialRhythmNewTable";
const AtrialRhythmNewList = () =>
  React.createElement(AtrialRhythmNewTable, {
    CustomRender: true,
    ObjectName: "AtrialRhythmNew",
  });

var dashRoutes = [
  // test layout
  {
    path: "/FileUpload",
    redirect: true,
    component: FileUploadPage,
    layout: "/test",
  },
  // auth layout
  {
    path: "/login",
    redirect: true,
    component: LoginPage,
    layout: "/auth",
  },
  {
    path: "/register",
    redirect: true,
    component: RegisterPage,
    layout: "/auth",
  },
  {
    path: "/forget-password",
    redirect: true,
    component: ForgetPassword,
    layout: "/auth",
  },
  {
    path: "/ResetPassword",
    redirect: true,
    component: ResetPassword,
    layout: "/auth",
  },
  // patientAuth layout
  {
    path: "/login",
    redirect: true,
    component: PatientLoginPage,
    layout: "/patientAuth",
  },

  // patient layout
  {
    path: "/PatientProfile",
    name: "Миний бүртгэл",
    roles: [4],
    icon: AccountBoxIcon,
    component: PatientProfile,
    layout: "/patient",
  },
  {
    path: "/PatientMonitoringPat",
    name: "Тэмдэглэл",
    roles: [4],
    icon: DescriptionIcon,
    component: PatientMonitoring,
    layout: "/patient",
  },
  {
    path: "/PatientQuestion",
    name: "Асуулт",
    roles: [4],
    icon: ChatBubbleIcon,
    component: PatientQuestion,
    layout: "/patient",
  },
  {
    path: "/PatientRemoteVisit",
    name: "Цахим үзлэг",
    roles: [4],
    icon: ChatBubbleIcon,
    component: PatientRemoteVisit,
    layout: "/patient",
  },
  {
    path: "/PatientCVD",
    name: "ЗСӨ",
    roles: [4],
    icon: AddAlertIcon,
    component: PatientCVD,
    layout: "/patient",
  },

  // admin layout
  {
    path: "/PaceMaker",
    redirect: true,
    roles: [1, 2, 3],
    component: PaceMaker,
    layout: "/admin",
  },
  {
    path: "/AllNotifications",
    roles: [1, 2, 3],
    redirect: true,
    component: AllNotifications,
    layout: "/admin",
  },
  {
    path: "/AdviceHome",
    name: "Home",
    roles: [1, 2, 3],
    icon: HomeIcon,
    component: AdviceHome,
    layout: "/admin",
  },
  {
    path: "/Profile",
    redirect: true,
    roles: [1, 2, 3, 5],
    component: Profile,
    layout: "/admin",
  },
  {
    path: "/PatientInfo",
    redirect: true,
    roles: [1, 2, 3],
    component: PatientShow,
    layout: "/admin",
  },
  // {
  //   path: "/LocalPatients",
  //   name: "Local patient",
  //   roles: [1, 3],
  //   icon: PersonIcon,
  //   component: LocalPatientList,
  //   layout: "/admin",
  // },

  {
    path: "/DoctorTeamCustom",
    name: "Team monitoring",
    icon: GroupIcon,
    roles: [1, 2],
    component: DoctorTeamCustom,
    layout: "/admin",
  },

  {
    path: "/PatientMonitoringDoctor",
    name: "Personal monitoring",
    roles: [1, 2, 3],
    icon: AssignmentTurnedInIcon,
    component: PatientMonitoringDoctorWithHiddenExport,
    layout: "/admin",
  },
  {
    path: "/InPatient",
    name: "In patient",
    icon: AirlineSeatFlatIcon,
    component: InPatient,
    roles: [1, 2],
    layout: "/admin",
  },
  // {
  //   path: "/surgery-plan",
  //   name: "Surgery plan",
  //   icon: AirlineSeatFlatIcon,
  //   component: SurgeryPlans,
  //   roles: [1, 2],
  //   layout: "/admin",
  // },
  {
    path: "/AdviceComment",
    redirect: true,
    roles: [1, 2, 3],
    component: AdviceComment,
    layout: "/admin",
  },
  {
    collapse: true,
    name: "National registry",
    icon: LibraryBooksIcon,
    state: "NationalRegistryCollapse",
    layout: "/admin",
    roles: [1, 2, 3],
    views: [
      {
        collapse: true,
        name: "Heart failure",
        icon: StorageIcon,
        state: "HeartFailureCollapse",
        layout: "/admin",
        roles: [1, 2, 3],
        views: [
          {
            path: "/HfAmbulance",
            name: "Monitoring",
            icon: MonitorHeartIcon,
            component: HfAmbulanceList,
            roles: [1, 2, 3],
            layout: "/admin",
          },
          {
            path: "/HfHospitalization",
            name: "Hospitalization",
            icon: AirlineSeatIndividualSuiteIcon,
            component: HfHospitalizationList,
            roles: [1, 2, 3],
            layout: "/admin",
          },
        ],
      },
      {
        name: "Vascular disease",
        path: "/VascularDisease",
        icon: BrokenImageIcon,
        component: VascularDiseaseList,
        roles: [1, 2, 3],
        layout: "/admin",
      },
      {
        collapse: true,
        name: "Congenital malformation",
        icon: StorageIcon,
        layout: "/admin",
        roles: [1, 2, 3],
        views: [
          {
            name: "Нээлттэй мэс засал",
            path: "/CongenitalMalformations/neelttei",
            icon: LocalPharmacyIcon,
            component: NeeltteiList,
            roles: [1, 2, 3],
            layout: "/admin",
          },
          {
            name: "Судсан дотуурх мэс засал",
            path: "/CongenitalMalformations/sudas",
            icon: LocalPharmacyIcon,
            component: SudasList,
            roles: [1, 2, 3],
            layout: "/admin",
          },
          {
            name: "Катетр ангиографийн оношилгоо",
            path: "/CongenitalMalformations/katetr",
            icon: LocalPharmacyIcon,
            component: KatetrList,
            roles: [1, 2, 3],
            layout: "/admin",
          },
        ],
      },
      {
        collapse: true,
        name: "Valve disease",
        icon: StorageIcon,
        layout: "/admin",
        state: "ValveDiseasesCollapse",
        roles: [1, 2, 3],
        views: [
          {
            name: "Valve disease",
            path: "/ValveDiseases",
            icon: LocalPharmacyIcon,
            component: ValveDiseasesList,
            roles: [1, 2, 3],
            layout: "/admin",
          },
          {
            name: "Endocarditis",
            path: "/ValveDiseaseEndo",
            icon: LocalPharmacyIcon,
            component: ValveDiseasesEndoList,
            roles: [1, 2, 3],
            layout: "/admin",
          },
        ],
      },
      {
        collapse: true,
        name: "Cardiac rhythm",
        icon: StorageIcon,
        layout: "/admin",
        state: "CardiacRhythmCollapse",
        roles: [1, 2, 3],
        views: [
          {
            name: "Тосгуурын жирвэгнээ",
            path: "/AtrialRhythm",
            icon: LocalPharmacyIcon,
            component: AtrialRhythmList,
            roles: [1, 2, 3],
            layout: "/admin",
          },
          {
            name: "Тосгуурын жирвэгнээ (Шинэ)",
            path: "/AtrialRhythmNew",
            icon: LocalPharmacyIcon,
            component: AtrialRhythmNewList,
            roles: [1, 2, 3],
            layout: "/admin",
          },
          {
            name: "Пэйсмэйкер суулгах",
            path: "/Pm",
            icon: LocalPharmacyIcon,
            // component: PmList,
            component: PaceMakerRhythmList,
            roles: [1, 2, 3],
            layout: "/admin",
          },
          {
            path: "/Icd",
            name: "ICD суулгах",
            icon: LooksIcon,
            // component: IcdList,
            component: ICDRhythmList,
            roles: [1, 2, 3],
            layout: "/admin",
          },
          {
            path: "/MonitoringRhythm",
            name: "Monitoring",
            icon: LooksIcon,
            component: MonitoringRhythmList,
            roles: [1, 2, 3],
            layout: "/admin",
          },
        ],
      },
    ],
  },
  // Customer History
  {
    collapse: true,
    name: "History",
    icon: HistoryIcon,
    state: "HistoryCollapse",
    layout: "/admin",
    roles: [1, 2, 3],
    views: [
      {
        path: "/CreatePatients",
        name: "Created patient",
        roles: [1, 2, 3],
        icon: PersonIcon,
        component: CreatePatientList,
        layout: "/admin",
      },
      {
        path: "/CreateAllVisits",
        name: "My visits",
        roles: [1, 2, 3],
        icon: BorderColorIcon,
        component: CreateAllVisits,
        layout: "/admin",
      },
      {
        path: "/MyTicket",
        name: "My tickets",
        roles: [1, 2, 3],
        icon: ReceiptIcon,
        component: MyTicket,
        layout: "/admin",
      },
    ],
  },
  {
    path: "/UserRequests",
    name: "User requests",
    icon: GroupAddIcon,
    roles: [1],
    component: UserRequests,
    layout: "/admin",
  },

  {
    collapse: true,
    name: "Cardiovascular risk monitoring",
    state: "CardiovascularCollapse",
    icon: AddAlertIcon,
    layout: "/admin",
    roles: [1, 2, 3, 6],
    views: [
      {
        path: "/Cardiovascular",
        name: "ЗСЭ шалгах",
        icon: AssignmentIndIcon,
        component: CVDPatientInfo,
        layout: "/admin",
        roles: [1, 2, 3],
      },
      {
        path: "/CVDMonitoringList",
        name: "Хяналтын жагсаалт",
        icon: RestorePageIcon,
        component: CVDMonitoringList,
        layout: "/admin",
        roles: [1, 2, 3, 6],
      },
      {
        path: "/inspection",
        name: "Үзлэгийн жагсаалт",
        icon: RestorePageIcon,
        component: CVDInspectionList,
        layout: "/admin",
        roles: [1, 2, 3, 6],
      },
      {
        path: "/CVDMonitoringReportList",
        name: "Report",
        icon: TableChartIcon,
        component: CVDMonitoringReportList,
        layout: "/admin",
        roles: [1, 2, 3, 6],
      },
      {
        path: "/CVDIndicartors",
        name: "Үзүүлэлт",
        icon: AssessmentIcon,
        component: CVDIndicartors,
        layout: "/admin",
        roles: [1, 2, 3, 6],
      },
      {
        path: "/CVDRegistration",
        name: "Бусад бүртгэл",
        icon: ExtensionIcon,
        component: CVDRegistration,
        layout: "/admin",
        roles: [1, 2, 3],
      },
    ],
  },

  {
    collapse: true,
    name: "Settings",
    icon: SettingsIcon,
    state: "Settings",
    layout: "/admin",
    roles: [1, 6],
    views: [
      {
        path: "/report",
        name: "Report",
        icon: AssessmentIcon,
        component: Reports,
        roles: [1, 6],
        layout: "/admin",
      },
      {
        collapse: true,
        name: "System registration",
        icon: StorageIcon,
        state: "RootDataCollapse",
        layout: "/admin",
        roles: [1],
        views: [
          {
            path: "/doctor",
            name: "Doctor",
            icon: SupervisorAccountIcon,
            component: DoctorsProfile,
            roles: [1],
            layout: "/admin",
          },
          {
            path: "/Organization",
            name: "Organization",
            icon: AccountBalanceIcon,
            component: Organization,
            roles: [1],
            layout: "/admin",
          },
          {
            path: "/DrgroupDepartments",
            name: "Departments",
            icon: LocationCityIcon,
            roles: [1],
            component: DrgroupDepartments,
            layout: "/admin",
          },
          {
            path: "/DoctorsTeam",
            name: "Team",
            icon: GroupIcon,
            component: DoctorsTeam,
            roles: [1],
            layout: "/admin",
          },
          {
            path: "/DictProvinceCity",
            name: "Location registration",
            icon: PinDropIcon,
            component: DictProvinceCity,
            roles: [1],
            layout: "/admin",
          },
        ],
      },
      {
        collapse: true,
        name: "Basic registration",
        icon: StorageIcon,
        state: "OtherDataCollapse",
        layout: "/admin",
        roles: [1],
        views: [
          {
            path: "/patient",
            name: "All patient",
            icon: PersonIcon,
            component: Patient,
            roles: [1],
            layout: "/admin",
          },
          {
            path: "/CreateAllVisitsAdmin",
            name: "All visits",
            roles: [1],
            icon: BorderColorIcon,
            component: CreateAllVisitsAdmin,
            layout: "/admin",
          },
          {
            path: "/AllTickets",
            name: "All ticket",
            roles: [1],
            icon: ReceiptIcon,
            component: AllTickets,
            layout: "/admin",
          },
        ],
      },
      {
        collapse: true,
        name: "Admin settings",
        icon: SecurityIcon,
        state: "SecurityCollapse",
        layout: "/admin",
        roles: [1],
        views: [
          {
            path: "/Apps",
            name: "Apps",
            icon: AppsIcon,
            component: Apps,
            roles: [1],
            layout: "/admin",
          },
          {
            path: "/Users",
            name: "User",
            icon: VerifiedUserIcon,
            component: Users,
            roles: [1],
            layout: "/admin",
          },
          {
            path: "/Medications",
            name: "Medications",
            icon: CardTravelIcon,
            component: Medications,
            roles: [1],
            layout: "/admin",
          },
          {
            path: "/JournalRef",
            name: "Journal referencial",
            icon: ChromeReaderModeIcon,
            component: JournalRef,
            roles: [1],
            layout: "/admin",
          },
          {
            path: "/optionType",
            name: "Option type",
            icon: BallotIcon,
            component: OptionType,
            roles: [1],
            layout: "/admin",
          },
          {
            path: "/Roles",
            name: "User roles",
            icon: HowToRegIcon,
            component: Roles,
            roles: [1],
            layout: "/admin",
          },
          {
            path: "/Permission",
            name: "Permission",
            icon: OfflineBoltIcon,
            component: Permissions,
            roles: [1],
            layout: "/admin",
          },
          {
            path: "/UserActionHistory",
            name: "Log history",
            icon: ViewHeadlineIcon,
            component: UserActionHistoryAdmin,
            roles: [1],
            layout: "/admin",
          },
        ],
      },
    ],
  },
];

export default dashRoutes;
