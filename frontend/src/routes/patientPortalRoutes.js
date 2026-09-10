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
    path: "/PatientRehab",
    name: "Сэргээн засах",
    icon: FitnessCenterIcon,
    roles: [4],
    component: PatientRehab,
    layout: "/patient",
  },
];

export default patientPortalRoutes;
