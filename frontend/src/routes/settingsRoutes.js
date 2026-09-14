/**
 * Settings and Admin configuration routes
 */
import { useTranslation } from "react-i18next";
import React from "react";
import SettingsIcon from "@mui/icons-material/Settings";
import AssessmentIcon from "@mui/icons-material/Assessment";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import GroupsIcon from "@mui/icons-material/Groups";
import StorageIcon from "@mui/icons-material/Storage";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import GroupIcon from "@mui/icons-material/Group";
import PinDropIcon from "@mui/icons-material/PinDrop";
import PersonIcon from "@mui/icons-material/Person";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import ReceiptIcon from "@mui/icons-material/Receipt";
import SecurityIcon from "@mui/icons-material/Security";
import AppsIcon from "@mui/icons-material/Apps";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import CardTravelIcon from "@mui/icons-material/CardTravel";
import ChromeReaderModeIcon from "@mui/icons-material/ChromeReaderMode";
import BallotIcon from "@mui/icons-material/Ballot";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import OfflineBoltIcon from "@mui/icons-material/OfflineBolt";
import ViewHeadlineIcon from "@mui/icons-material/ViewHeadline";
import i18n from "../i18n";

const Reports = React.lazy(() => import("view/Reports.jsx"));
const DoctorExamReport = React.lazy(() => import("view/DoctorExamReport.jsx"));
const DoctorsProfile = React.lazy(() => import("view/DoctorsProfile.jsx"));
const Organization = React.lazy(() => import("view/OrganizationNew.jsx"));
const DrgroupDepartments = React.lazy(() => import("view/DrgroupDepartments"));
const DoctorsTeam = React.lazy(() => import("view/DoctorsTeam"));
const DictProvinceCity = React.lazy(() => import("view/DictProvinceCity"));
const Patient = React.lazy(() => import("view/Patient"));
const CreateAllVisits = React.lazy(() => import("view/CreateAllVisits.jsx"));
// Export switched on for tender row №98 — see the note in adminRoutes.js.
const CreateAllVisitsAdmin = () =>
  React.createElement(CreateAllVisits, { IsAdmin: true, HideExports: false });
const AllTickets = React.lazy(() => import("view/AllTickets"));
const Apps = React.lazy(() => import("view/Security/Apps"));
const Users = React.lazy(() => import("view/Security/Users.jsx"));
const Medications = React.lazy(() => import("view/Medications"));
const JournalRef = React.lazy(() => import("view/JournalRef"));
const OptionType = React.lazy(() => import("view/OptionType.jsx"));
const Roles = React.lazy(() => import("view/Security/Roles"));
const Permissions = React.lazy(() => import("view/Security/Permissions"));
const UserActionHistoryAdminTable = React.lazy(
  () => import("customComponents/UserActionHistoryAdmin"),
);
const UserActionHistoryAdmin = () =>
  React.createElement(UserActionHistoryAdminTable, { CustomRender: true });

const settingsRoutes = [
  {
    collapse: true,
    name: "Settings",
    icon: SettingsIcon,
    state: "Settings",
    layout: "/admin",
    roles: [1, 6],
    views: [
      {
        // Тайлан нэгээс олон болсон тул задардаг бүлэг болов. Шинэ тайлан нэмэхэд
        // энд нэг мөр нэмэхэд хангалттай. `state` нь бүх route файлд давхцахгүй
        // байх ёстой — Sidebar бүх флагийг нэг объект дээр хавтгайруулдаг.
        collapse: true,
        name: "Report",
        icon: AssessmentIcon,
        state: "ReportCollapse",
        layout: "/admin",
        // Хүүхдүүдийнхээ эрхийн нэгдэл — эс тэгвээс хоосон нээгддэг цэс үүснэ.
        roles: [1, 6],
        views: [
          {
            // URL хэвээр: хадгалсан холбоос, PageTabs-ийн түлхүүр эвдрэхгүй.
            path: "/report",
            name: "Сар бүрийн нэгтгэл тайлан",
            icon: CalendarMonthIcon,
            component: Reports,
            roles: [1, 6],
            layout: "/admin",
          },
          {
            path: "/doctorExamReport",
            name: "Эмчийн нэгдсэн үзлэгийн тайлан",
            icon: GroupsIcon,
            component: DoctorExamReport,
            roles: [1, 6],
            layout: "/admin",
          },
        ],
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

export default settingsRoutes;
