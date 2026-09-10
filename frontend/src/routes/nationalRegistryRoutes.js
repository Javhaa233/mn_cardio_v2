/**
 * National Registry routes
 */
import { useTranslation } from "react-i18next";
import React from "react";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import StorageIcon from "@mui/icons-material/Storage";
import AirlineSeatIndividualSuiteIcon from "@mui/icons-material/AirlineSeatIndividualSuite";
import BrokenImageIcon from "@mui/icons-material/BrokenImage";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import LooksIcon from "@mui/icons-material/Looks";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import BloodtypeIcon from "@mui/icons-material/Bloodtype";
import ChildCareIcon from "@mui/icons-material/ChildCare";
import AltRouteIcon from "@mui/icons-material/AltRoute";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import BoltIcon from "@mui/icons-material/Bolt";
import TimelineIcon from "@mui/icons-material/Timeline";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import i18n from "../i18n";

const HfAmbulanceList = React.lazy(
  () => import("view/NationalRegistry/HeartFailure/HfAmbulanceList"),
);
const HfHospitalizationTable = React.lazy(
  () =>
    import("customComponents/NationalRegistry/HeartFailure/HfHospitalizationTable"),
);
const HfHospitalizationList = () =>
  React.createElement(HfHospitalizationTable, {
    CustomRender: true,
    ObjectName: "HfHospitalization",
  });
const VascularDiseaseTable = React.lazy(
  () =>
    import("customComponents/NationalRegistry/VascularDisease/VascularDiseaseTable"),
);
const VascularDiseaseList = () =>
  React.createElement(VascularDiseaseTable, {
    CustomRender: true,
    ObjectName: "VascularDisease",
  });
const CongenitalMalformationsTable = React.lazy(
  () =>
    import("customComponents/NationalRegistry/CongenitalMalformations/CongenitalMalformationsTable"),
);
const ValveDiseasesTable = React.lazy(
  () =>
    import("customComponents/NationalRegistry/ValveDiseases/ValveDiseasesTable"),
);
const ValveDiseasesList = () =>
  React.createElement(ValveDiseasesTable, {
    CustomRender: true,
    ObjectName: "ValveDiseases",
  });
const ValveDiseasesEndoTable = React.lazy(
  () =>
    import("customComponents/NationalRegistry/ValveDiseases/ValveDiseasesEndoTable"),
);
const ValveDiseasesEndoList = () =>
  React.createElement(ValveDiseasesEndoTable, {
    CustomRender: true,
    ObjectName: "ValveDiseasesEndo",
  });
const AtrialRhythmTable = React.lazy(
  () => import("customComponents/NationalRegistry/Rhythm/AtrialRhythmTable"),
);
const AtrialRhythmList = () =>
  React.createElement(AtrialRhythmTable, {
    CustomRender: true,
    ObjectName: "AtrialRhythm",
  });
const AtrialRhythmNewTable = React.lazy(
  () => import("customComponents/NationalRegistry/Rhythm/AtrialRhythmNewTable"),
);
const AtrialRhythmNewList = () =>
  React.createElement(AtrialRhythmNewTable, {
    CustomRender: true,
    ObjectName: "AtrialRhythmNew",
  });
const ICDRhythmTable = React.lazy(
  () => import("customComponents/NationalRegistry/Rhythm/ICDRhythmTable"),
);
const ICDRhythmList = () =>
  React.createElement(ICDRhythmTable, {
    CustomRender: true,
    ObjectName: "ICDRhythm",
  });
const PaceMakerRhythmTable = React.lazy(
  () => import("customComponents/NationalRegistry/Rhythm/PaceMakerRhythmTable"),
);
const PaceMakerRhythmList = () =>
  React.createElement(PaceMakerRhythmTable, {
    CustomRender: true,
    ObjectName: "PaceMakerRhythm",
  });
const MonitoringRhythmTable = React.lazy(
  () =>
    import("customComponents/NationalRegistry/Rhythm/MonitoringRhythmTable"),
);
const MonitoringRhythmList = () =>
  React.createElement(MonitoringRhythmTable, {
    CustomRender: true,
    ObjectName: "MonitoringRhythm",
  });

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

const TenderFormTable = React.lazy(
  () => import("customComponents/NationalRegistry/Surgery/TenderFormTable"),
);
const TenderFormList = (FormCode) => () =>
  React.createElement(TenderFormTable, {
    CustomRender: true,
    FormCode,
    // BaseList reads ObjectName from props; it is the generated per-form view
    ObjectName: "vwForm_" + FormCode.replace(".", "_"),
  });

// Tender item 4.1 — the А/611 АМ-1Б examination register. Same screen as
// /admin/CreateAllVisits, reached from the tender-forms menu so that groups 1
// to 4 are all listed together as tender line 90 requires. A distinct path
// rather than a second entry on /CreateAllVisits, because two route rows with
// the same path make which one renders a matter of ordering.
const CreateAllVisitsView = React.lazy(
  () => import("view/CreateAllVisits.jsx"),
);
const TenderExamRegister = () =>
  React.createElement(CreateAllVisitsView, {
    IsAdmin: false,
    HideExports: false,
  });

// The cross-form register reads TenderFormData itself, not a per-form view.
const TenderFormAllTable = React.lazy(
  () => import("customComponents/NationalRegistry/Surgery/TenderFormAllTable"),
);
const TenderFormAllList = () =>
  React.createElement(TenderFormAllTable, {
    CustomRender: true,
    ObjectName: "TenderFormData",
  });

const nationalRegistryRoutes = [
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
        // Upgrade tender §101/§102/§103: every phase-4 form in one register,
        // with one search across them and .xlsx / .txt export.
        name: "Маягтын нэгдсэн бүртгэл",
        path: "/TenderFormAll",
        icon: ManageSearchIcon,
        component: TenderFormAllList,
        roles: [1, 2, 3],
        layout: "/admin",
      },
      {
        collapse: true,
        name: "Мэс заслын маягтууд",
        icon: ContentPasteIcon,
        layout: "/admin",
        state: "TenderSurgeryFormsCollapse",
        roles: [1, 2, 3],
        views: [
          {
            name: "Мэс заслын өмнөх шалгуур хуудас",
            path: "/TenderForm1_1",
            icon: FactCheckIcon,
            component: TenderFormList("1.1"),
            roles: [1, 2, 3],
            layout: "/admin",
          },
          {
            name: "Мэс заслын аюулгүй байдлын шалгах хуудас",
            path: "/TenderForm1_2",
            icon: HealthAndSafetyIcon,
            component: TenderFormList("1.2"),
            roles: [1, 2, 3],
            layout: "/admin",
          },
          {
            name: "Хэвлийн гол судасны цүлхэн",
            path: "/TenderForm1_3",
            icon: BloodtypeIcon,
            component: TenderFormList("1.3"),
            roles: [1, 2, 3],
            layout: "/admin",
          },
          {
            name: "Зүрхний төрөлхийн гажиг",
            path: "/TenderForm1_5",
            icon: ChildCareIcon,
            component: TenderFormList("1.5"),
            roles: [1, 2, 3],
            layout: "/admin",
          },
          {
            name: "Титэм судасны мэс засал",
            path: "/TenderForm1_6",
            icon: FavoriteBorderIcon,
            component: TenderFormList("1.6"),
            roles: [1, 2, 3],
            layout: "/admin",
          },
          {
            name: "Гол судасны мэс засал",
            path: "/TenderForm1_7",
            icon: AltRouteIcon,
            component: TenderFormList("1.7"),
            roles: [1, 2, 3],
            layout: "/admin",
          },
          {
            name: "Хавхлагын мэс засал",
            path: "/TenderForm1_8",
            icon: FilterAltIcon,
            component: TenderFormList("1.8"),
            roles: [1, 2, 3],
            layout: "/admin",
          },
          {
            name: "Зүрхний нээлттэй бусад мэс засал",
            path: "/TenderForm1_9",
            icon: MedicalServicesIcon,
            component: TenderFormList("1.9"),
            roles: [1, 2, 3],
            layout: "/admin",
          },
        ],
      },
      {
        collapse: true,
        name: "Зүрх судасны хэм судлалын маягтууд",
        icon: GraphicEqIcon,
        layout: "/admin",
        state: "TenderRhythmFormsCollapse",
        roles: [1, 2, 3],
        views: [
          {
            name: "Электрофизиологи / Аблаци",
            path: "/TenderForm2_1",
            icon: BoltIcon,
            component: TenderFormList("2.1"),
            roles: [1, 2, 3],
            layout: "/admin",
          },
          {
            name: "Тосгуурын жигвэгнээ бүртгэл",
            path: "/TenderForm2_2",
            icon: MonitorHeartIcon,
            component: TenderFormList("2.2"),
            roles: [1, 2, 3],
            layout: "/admin",
          },
        ],
      },
      {
        collapse: true,
        name: "Зүрх судасны ангио",
        icon: BloodtypeIcon,
        layout: "/admin",
        state: "TenderAngioFormsCollapse",
        roles: [1, 2, 3],
        views: [
          {
            name: "Титэм судасны оношилгоо эмчилгээ",
            path: "/TenderForm3_1",
            icon: TimelineIcon,
            component: TenderFormList("3.1"),
            roles: [1, 2, 3],
            layout: "/admin",
          },
        ],
      },
      {
        // Tender line 90: groups 1 to 4 must all be reachable from the menu as
        // a list. 4.1 is the А/611 АМ-1Б examination register, and its records
        // live in `Visit`, not in TenderFormData — so this is a link to the
        // existing examination screen rather than another TenderForm entry.
        // For the same reason 4.1 does not appear in the unified register at
        // /admin/TenderFormAll, which reads TenderFormData.
        name: "Эмчийн үзлэгийн бүртгэл (АМ-1Б)",
        path: "/ExamRegisterAM1B",
        icon: FactCheckIcon,
        component: TenderExamRegister,
        roles: [1, 2, 3],
        layout: "/admin",
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
            component: PaceMakerRhythmList,
            roles: [1, 2, 3],
            layout: "/admin",
          },
          {
            path: "/Icd",
            name: "ICD суулгах",
            icon: LooksIcon,
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
];

export default nationalRegistryRoutes;
