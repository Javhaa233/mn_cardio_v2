/**
 * Patient Portal routes
 */
import { useTranslation } from "react-i18next";
import React from "react";
import HomeIcon from "@mui/icons-material/Home";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import DescriptionIcon from "@mui/icons-material/Description";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import AddAlertIcon from "@mui/icons-material/AddAlert";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import AlarmOutlinedIcon from "@mui/icons-material/AlarmOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import i18n from "i18n";

const PatientHome = React.lazy(() => import("view/Patient/PatientHome.jsx"));
const PatientProfile = React.lazy(
  () => import("view/Patient/PatientProfile.jsx"),
);
const PatientMonitoring = React.lazy(
  () => import("view/Patient/PatientMonitoring.jsx"),
);
const PatientAdviceList = React.lazy(
  () => import("view/Patient/PatientAdviceList.jsx"),
);
const PatientRehab = React.lazy(() => import("view/Patient/PatientRehab.jsx"));
const PatientQuestion = React.lazy(
  () => import("view/Patient/VisitComments.jsx"),
);
const PatientRemoteVisit = React.lazy(
  () => import("view/Patient/PatientRemoteVisit.jsx"),
);
const PatientCVD = React.lazy(() => import("view/Patient/PatientCVD.jsx"));
const PatientDiagnostics = React.lazy(
  () => import("view/Patient/PatientDiagnostics.jsx"),
);
const PatientNotifications = React.lazy(
  () => import("view/Patient/PatientNotifications.jsx"),
);
const PatientReminders = React.lazy(
  () => import("view/Patient/PatientReminders.jsx"),
);
const PatientPrivacy = React.lazy(
  () => import("view/Patient/PatientPrivacy.jsx"),
);

const patientPortalRoutes = [
  {
    path: "/PatientHome",
    name: "Нүүр",
    icon: HomeIcon,
    roles: [4],
    component: PatientHome,
    layout: "/patient",
  },
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
    // Right after the journal: both answer "what is recorded about me".
    path: "/PatientDiagnostics",
    name: "Шинжилгээ",
    roles: [4],
    icon: ScienceOutlinedIcon,
    component: PatientDiagnostics,
    layout: "/patient",
  },
  {
    path: "/PatientAdvice",
    name: "Эмчийн зөвлөгөө",
    icon: RecordVoiceOverIcon,
    roles: [4],
    component: PatientAdviceList,
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
  {
    path: "/PatientRemoteVisit",
    name: "Цахим үзлэг",
    roles: [4],
    icon: ChatBubbleIcon,
    component: PatientRemoteVisit,
    layout: "/patient",
  },
  {
    path: "/PatientNotifications",
    name: "Мэдэгдэл",
    roles: [4],
    icon: NotificationsNoneIcon,
    component: PatientNotifications,
    layout: "/patient",
  },
  {
    path: "/PatientReminders",
    name: "Сануулга",
    roles: [4],
    icon: AlarmOutlinedIcon,
    component: PatientReminders,
    layout: "/patient",
  },
  {
    path: "/PatientRehab",
    name: "Сэргээн засах",
    icon: FitnessCenterIcon,
    roles: [4],
    component: PatientRehab,
    layout: "/patient",
  },
  {
    // Last on purpose: a settings-shaped screen, not a daily one.
    path: "/PatientPrivacy",
    name: "Нууцлал",
    roles: [4],
    icon: ShieldOutlinedIcon,
    component: PatientPrivacy,
    layout: "/patient",
  },
];

export default patientPortalRoutes;
