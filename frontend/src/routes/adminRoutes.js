/**
 * Admin layout routes - core admin pages
 */
import { useTranslation } from "react-i18next";
import React from "react";
import HomeIcon from "@mui/icons-material/Home";
import GroupIcon from "@mui/icons-material/Group";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import AirlineSeatFlatIcon from "@mui/icons-material/AirlineSeatFlat";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import HistoryIcon from "@mui/icons-material/History";
import PersonIcon from "@mui/icons-material/Person";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import ReceiptIcon from "@mui/icons-material/Receipt";
import i18n from "../i18n";

const AdviceHome = React.lazy(() => import("view/AdviceHome.jsx"));
const AdviceComment = React.lazy(() => import("view/AdviceComment.jsx"));
const PatientShow = React.lazy(() => import("view/PatientShow.jsx"));
const Profile = React.lazy(() => import("view/Profile.jsx"));
const PaceMaker = React.lazy(() => import("view/PaceMaker.jsx"));
const AllNotifications = React.lazy(() => import("view/AllNotifications.jsx"));
const DoctorTeamCustom = React.lazy(() => import("view/DoctorTeamCustom.jsx"));
const PatientMonitoringDoctor = React.lazy(
  () => import("customComponents/PatientMonitoring/PatientMonitoringDoctor"),
);
const InPatient = React.lazy(() => import("view/InPatient.jsx"));
const UserRequestsList = React.lazy(
  () => import("customComponents/UserRequest/UserRequestsList"),
);
const UserRequests = () =>
  React.createElement(UserRequestsList, {
    CustomRender: true,
    ObjectName: "UserRequests",
  });
const CreatePatientList = React.lazy(
  () => import("view/CreatePatientList.jsx"),
);
const CreatePatientListWithHiddenExport = () =>
  React.createElement(CreatePatientList, { HideExport: true });
const CreateAllVisits = React.lazy(() => import("view/CreateAllVisits.jsx"));
// Upgrade tender row №98: the examination list must be exportable to .xlsx.
// The export was fully implemented in CreateAllVisits.jsx and then hidden on
// every route that rendered it, so no user has ever seen the button. The name
// is kept because other code refers to it.
const CreateAllVisitsWithHiddenExport = () =>
  React.createElement(CreateAllVisits, { IsAdmin: false, HideExports: false });
const MyTicket = React.lazy(() => import("view/MyTicket.jsx"));
const Handbook = React.lazy(() => import("view/Handbook.jsx"));

// NOTE: every `component` below must be a STABLE module-level reference - either
// React.lazy(...) or a named function declared once, as above. Writing
// `component={() => <X/>}` inline creates a new component identity on every
// render, which makes the page remount and lose unsaved form input.
const adminRoutes = [
  {
    path: "/PaceMaker",
    name: "Pacemaker",
    redirect: true,
    roles: [1, 2, 3],
    component: PaceMaker,
    layout: "/admin",
  },
  {
    path: "/AllNotifications",
    name: "Notifications",
    roles: [1, 2, 3],
    redirect: true,
    component: AllNotifications,
    layout: "/admin",
  },
  {
    path: "/Handbook",
    name: "User handbook",
    roles: [1, 2, 3, 5],
    redirect: true,
    component: Handbook,
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
    name: "Profile",
    redirect: true,
    roles: [1, 2, 3],
    component: Profile,
    layout: "/admin",
  },
  {
    path: "/Profile",
    name: "Profile",
    icon: PersonIcon,
    roles: [5],
    component: Profile,
    layout: "/admin",
  },
  {
    path: "/PatientInfo",
    name: "Patient info",
    redirect: true,
    roles: [1, 2, 3],
    component: PatientShow,
    layout: "/admin",
  },
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
    component: PatientMonitoringDoctor,
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
  {
    path: "/AdviceComment",
    name: "Advice comment",
    redirect: true,
    roles: [1, 2, 3],
    component: AdviceComment,
    layout: "/admin",
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
        component: CreatePatientListWithHiddenExport,
        layout: "/admin",
      },
      {
        path: "/CreateAllVisits",
        name: "My visits",
        roles: [1, 2, 3],
        icon: BorderColorIcon,
        component: CreateAllVisitsWithHiddenExport,
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
    // Draws the waiting-request count on the sidebar icon. The only route with
    // one today; the sidebar treats it generically (helper/PendingRequests).
    Badge: "UserRequestsPending",
  },
];

export default adminRoutes;
