/**
 * Cardiovascular Disease routes
 */
import { useTranslation } from "react-i18next";
import React from "react";
import AddAlertIcon from "@mui/icons-material/AddAlert";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import RestorePageIcon from "@mui/icons-material/RestorePage";
import TableChartIcon from "@mui/icons-material/TableChart";
import AssessmentIcon from "@mui/icons-material/Assessment";
import ExtensionIcon from "@mui/icons-material/Extension";
import i18n from "../i18n";

const CVDPatientInfo = React.lazy(
  () => import("view/CardiovascularDisease/CVDPatientInfo.jsx"),
);
const CVDHistoryTableNew = React.lazy(
  () =>
    import("customComponents/CardiovascularDisease/Tables/CVDHistoryTableNew"),
);
const CVDMonitoringList = () =>
  React.createElement(CVDHistoryTableNew, { CustomRender: true });
const CVDMonitoringReportList = React.lazy(
  () => import("view/CardiovascularDisease/CVDMonitoringReportList.jsx"),
);
const CVDIndicartors = React.lazy(
  () => import("view/CardiovascularDisease/CVDIndicartors.jsx"),
);
const CVDRegistration = React.lazy(
  () => import("view/CardiovascularDisease/CVDRegistration.jsx"),
);
const CVDInspectionTableAll = React.lazy(
  () =>
    import("customComponents/CardiovascularDisease/Tables/CVDInspectionTableAll"),
);
const CVDInspectionList = () =>
  React.createElement(CVDInspectionTableAll, {
    CustomRender: true,
    ObjectName: "CVDInspection",
  });

const cardiovascularRoutes = [
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
];

export default cardiovascularRoutes;
