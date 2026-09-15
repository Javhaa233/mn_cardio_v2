# UI consistency — screen checklist

The live checklist for the whole-system restyle that started 2026-09-15. One entry per screen,
listing everything a user can open from it: tabs, popups, confirms, file flows, replies. A screen
is finished only when it **and everything listed under it** meets the definition below.

Paths are relative to `src/`. Line counts are from the 2026-09-15 audit.

## Before-screenshots

`C:\Ajil\mn_cardio_v2\docs\ui-baseline-2026-09-15\index.html` — 78 routes at 1440 / 768 / 390,
captured from local dev against `MnCardio_restored` as a role-1 doctor and a patient account. It sits
outside the repo on purpose: the shots show real patient names and register numbers, so they are
never committed or published. Popups are not in this set; each phase screenshots the popups it
restyles before it changes them.

## Standing decisions

- **Popups keep window behaviour** — drag, minimize, maximize, resize. Only the look changes.
- **Buttons use brand ranks** — one filled `cyanInk` primary per bar (Save / Confirm), outlined
  neutral for everything secondary (Print, Export, Cancel, Refresh, Back), red only for
  destructive. No green Save.
- **Visual only** — no behaviour, field, label or workflow change. The long-form feature contract
  in `CLAUDE.md` §6 (sticky section nav, autosave, completion state, keyboard pass) is not part
  of this program. Functional defects found along the way go to *Findings* at the bottom.
- **Print output does not change.** It must match the approved paper forms.

## Definition of consistent

1. **Header** — `ListPageHeader` (title, count, the one primary action), or the page's own
   upgraded header where one exists (AdviceHome).
2. **Surfaces** — cards and dialogs share one radius, a `hairline` border and a token elevation.
3. **Buttons** — by rank; at most one primary per bar.
4. **Lists** use `BaseGrid`; **tabs** use the restyled `CustomTab` / `BaseTab`.
5. **Popups** use `BaseDialog` or its restyled parts; **confirms and alerts** use `BaseAlert`.
6. **States** — loading, empty and error use the shared components, in Mongolian.
7. **No leftovers** — no purple, no template colours (`#4caf50` green, `#00acc1` teal, `#e91e63`
   rose), no hardcoded font sizes, no bare `h1–h6`.
8. **Widths** — renders correctly at 1440, 768 and 390 px.

Status: `L` legacy · `P` partial (new frame, old insides) · `U` upgraded · `✓` done in this
program, with the phase that finished it.

## Surface radius (decided in Phase 0)

Measured 2026-09-15: every upgraded page-level surface already uses `radius.lg` (14px) —
`ListPageHeader`, `AdviceFeed/FeedCard`, `PostComposer`, `AnalyticsRail`, `Home/Tiles`, the DoctorTeam
panes, `PatientMonitoringDoctor`. `UniCard` (`radius.sm`, 52 importers) is the outlier.

| Surface | Radius |
|---|---|
| A surface sitting on the canvas: card, page header, dialog, a grid that is the page's main box | `radius.lg` |
| A surface nested inside one of those: inner panel, comment bubble, grid inside a card, media | `radius.sm` / `radius.md` |
| A control: input, button, chip | `radius.xs`, chips `radius.pill` |

So Phase 2 moves `UniCard` to `lg`, and Phase 1 gives `BaseDialog` `lg`. The reference screens do not change.

## Phase map

| Phase | Scope | Status |
|---|---|---|
| 0 | Baseline: this file, before-screenshots, surface radius | ✓ reviewed 2026-09-15 |
| 1 | Actions and popups: `CustomButtons/Button`, `BaseDialog`, `BaseDialogActions`, `BaseDetailView`, `BaseAlert`, MUI Dialog theme | ✓ built, awaiting review |
| 2 | States, tabs, containers: `BaseNoData`, `DivLoading`, `BaseLoading`, `LoadError`, `CustomTab`, `BaseTab`, `UniCard`, status chip, purple sweep | — |
| 3 | Form controls, sections, read-only views, lookup tables | — |
| 4 | Files, attachments, replies | — |
| 5 | Shell leftovers and sign-in screens | — |
| 6 | Doctor daily workflow | — |
| 7 | National registry | — |
| 8 | Cardiovascular | — |
| 9 | Settings and administration | — |
| 10 | Patient portal | — |
| 11 | Lock-in and cleanup | — |

## Phase 1 — what changed, and what it leaves for later phases

Done (branch `ui/phase-1-actions-popups`):
- **`components/CustomButtons/Button.jsx`** — the template colours are read as ranks
  (`theme/controlStyles.js` `legacyButtonRank`): `primary`/`success` → filled `cyanInk`,
  `danger`/`rose` → outlined red, everything else → outlined neutral. No uppercase, no coloured
  shadows. `white`/`transparent` keep their chrome meaning; `justIcon` glyphs are centred.
- **`BaseDialogActions`** — one filled button per bar: Save, or Confirm when there is no Save;
  Print outlined on the left; Decline outlined red. MUI's `loading` state replaces the floating
  green/red/blue spinners.
- **`BaseDialog`** — flat white title bar, `h4` title in brand ink (was `#878787`), quiet window
  controls (close turns red on hover), `radius.lg`, `elevation[4]`, brand scrollbar and grip.
  Window behaviour unchanged. Its title bar, grip and paper are exported and now also drawn by
  **`BaseDetailView`** and **`view/Security/UsersDetail`**, which each carried their own copy.
- **`BaseAlert`** — status badge (success / error / question), message in brand ink rather than
  red or green text, rank buttons. New optional `Destructive` flag (and
  `ShowConfirm(Message, Confirm, Hide, { Destructive: true })`) draws Yes in red; no call site
  uses it yet — screen phases add it to delete/remove confirms.
- **Theme** — `palette.primary` is `cyanInk` (was MUI blue `#1976d2`), so focused fields, checked
  controls and contained buttons match. `MuiDialog*` defaults give raw `<Dialog>`s the same paper,
  radius and a navy backdrop. `dialogPaperSx` / `dialogActionSx` moved to `theme/controlStyles`
  and use `radius.lg`, so the account dialogs follow the surface rule too.
- **Native `alert()`** — gone from `BaseCrudHelper` (download errors now use the new
  `ShowAlertDetached`), `VisitForm` and `CVDInspectionAndManagement`.

Left for the screen phases — found while checking Phase 1 in the browser:
- **A screen's main action can now be outlined** when its code passed a template colour like
  `info`: CreatePatients "Шинэ өвчтөн", the locked TenderForm's "Шинэ бүртгэл (өмнөхөөс
  хуулах)". Each screen phase sets the one primary per bar explicitly.
- **TenderForm shows two filled Save buttons** — its own sticky bar and the dialog footer
  (Findings #11).
- Delete/remove confirms should pass `Destructive: true` as each screen is walked.

---

## Shared components (Phases 1–4)

Fixing these lifts most screens at once. A screen phase only handles what is left.

| Component | Reach | What is wrong today | Phase |
|---|---|---|---|
| `components/CustomButtons/Button.jsx` | 85 importers, every dialog footer | template colours, uppercase, coloured shadows | 1 |
| `baseComponents/BaseDialogActions.jsx` | every `BaseDialog` footer | Save/Confirm green, Decline red, Print teal; spinners `#1492ff`, `green`, `#f44336` | 1 |
| `customComponents/BaseDialog.jsx` | 109 files / 159 sites | grey-gradient title bar, `BaseLabel` title `#878787` 16px | 1 |
| `baseComponents/BaseDetailView.jsx` | every Settings detail, child-grid popups | second window implementation; inline mode has no Close/Back | 1 |
| `baseComponents/BaseAlert.jsx` + `newComponents/Notify` | 425 `ShowAlert` + 45 `ShowConfirm` + 50 `setAlert` files | legacy sweet-alert style; red/green titles | 1 |
| Raw MUI `<Dialog>` bypassing the wrappers | 12 files (list below) | each styled on its own | 1 (theme) |
| Native `alert()` | `helper/BaseCrudHelper.jsx:633,668`, `Forms/VisitForm.jsx:75`, `CVDInspectionAndManagement.jsx:257` | browser alert | 1 |
| `customComponents/BaseNoData.jsx` | 80 importers | salmon `#faa698` box, bare `h5` | 2 |
| `DivLoading.jsx`, `BaseLoading.jsx`, `PageLoading.jsx` | 114 + 58 + 1 | grey spinners, `#1a90ff` | 2 |
| `LoadError.jsx`, `PageTabs/TabErrorBoundary.jsx` | 10 + every tab | CT button | 2 |
| `customComponents/CustomTab.jsx` | 39 importers | grey/green palette, 25 hex | 2 |
| `baseComponents/BaseTab.jsx` | PatientCVD | different tab family from `CustomTab` | 2 |
| `customComponents/UniCard.jsx` | 52 importers | `radius.sm`, while header and feed cards use `radius.lg` | 2 |
| Status badges: `NationalRegistry/Components/IsActive.jsx`, `IsActiveStatus`, `DateStatus`, `RiskView` | registry, CVD, user requests | `#2bb559`, `#ff5757`, `#ffcc00` | 2 |
| `DoctorProfile/UserDialogLink.jsx`, `InPatient/FieldActions/UserDialogLink.jsx` | every detail view header | hover purple `#9c27b0` | 2 |
| `customComponents/DateTime.jsx` | every `RangeDate` | underline purple `#9c27b0` | 2 |
| `baseComponents/Controls/BaseGridLookUp.jsx`, `Register/SimpleSelect.jsx` | lookups, register | purple `#9c27b0` | 2 |
| `components/CustomInput/CustomInput.jsx` + `BaseEditControls/fieldRowStyles.js` | base of `BaseTextField`, 977 sites | label `#75736c`, CT input | 3 |
| `BaseRadio`, `BaseCheckBox`, `BaseSelect`/`SimpleSelect`, `BaseDate`, `BaseTextArea`, `BaseAutoComplete`, `BaseInputMask` | ~1,100 sites | CT JSS colours | 3 |
| `Forms/Components/CustomTextField`, `CustomRadio`, `CustomCheckBox`; `Forms/NationalRegistry/CustomTextField`; `CardiovascularDisease/**/CustomTextField` | 288 sites | local copies, `baseControlsStyles` | 3 |
| `customComponents/GroupPanel.jsx` | 411 sites | `#ccc` / `#fafafa` / `#003366` | 3 |
| `BaseViewControls/BaseInfo`, `BaseArrayInfo`, `BaseLabel` | 1,213 + 117 + 56 sites | own type sizes | 3 |
| `baseComponents/BaseGrid/{Header,GridRow,FilterRow,Pagination}.jsx`, `Controls/BaseLookUpGridLoad.jsx` | every lookup popper | older MUI Table skin, `fontSize: 11px !important` | 3 |
| Hand-built MUI `<Table>` | 15 files | no theme override | 3 (theme) |
| `assets/jss/.../custom/customFormStyles` | 20 importers, raw clinical tables | screen colours; **print must not change** | 3 |
| `baseComponents/Controls/BaseFileUpload.jsx` | composer, replies, remote visit, config `File` fields | own preview Dialog, CT button | 4 |
| `BaseViewControls/BaseFilesInfo.jsx`, `Advice/AdviceFileInfo.jsx` | Visit, Echo, Ecg, Tcd2, FollowUp, remote visit | own zoom Dialogs, `#0d6efd`, `fa fa-download` | 4 |
| `Advice/CreateComment.jsx` | every reply box | CT button | 4 |
| `Advice/AdviceDetail.jsx`, `Advice/AdviceTicket.jsx` | MyTicket, AllTickets | CT button, CT Card, inline styles | 4 |
| `PatientPlatform/VisitCommentsForm.jsx`, `VisitCommentsList.jsx`, `OwnVisit/PatientAdvice.jsx` | patient replies | CT button, MUI Table | 4 |
| `PatientMonitoring/MonitorQuestion.jsx` | doctor-side patient question thread | CT button | 4 |

Raw `<Dialog>` files (Phase 1 theme covers them; check each):
`BaseDetailView`, `Controls/BaseFileUpload`, `Advice/AdviceFileInfo`, `BaseViewControls/BaseFilesInfo`,
`Chat/NewChatDialog`, `Chat/VideoRecorder`, `DoctorProfile/DoctorEditDialog`,
`Organization/mergeDialog`, `Profile/ChangePasswordDialog`, `Profile/ContactInfoPrompt`,
`Profile/ProfileEditDialog`, `view/Security/UsersDetail`; in newComponents `PdfViewer`,
`BaseControls/BaseLookupGrid`, `BaseFileUploader/pdfViewer`.

No live Excel import exists (`newComponents/ExcelImport` has no importers). Excel is export only.

---

## Phase 5 — Shell and sign-in

### Admin shell — `layouts/Admin.jsx` · U (leftovers)
- Top bar (rebuilt): patient search (Ctrl+K), notification dropdown, help, language, profile menu, overflow menu.
- **Still legacy:** dropdowns styled by `adminNavbarLinksStyle.js` — `Notification/Notification.jsx`,
  `PageTabs/OpenTabsMenu.jsx`, `ProfileMenu`, `TopBarOverflowMenu`; Sidebar mini-toggle (CT button).
- Popups: `Profile/ChangePasswordDialog` (form), `Profile/ContactInfoPrompt` (form, automatic), `Notify`.
- Page tabs: right-click menu (4 close actions), open-tabs popper, "too many tabs" `setAlert`, `TabErrorBoundary`.
- Chat: Fab + panel (`RoomList`, `Conversation`), `NewChatDialog` (tabs Ганцаарчилсан / Бүлэг),
  `MembersPanel` (remove confirm), `Composer` (file attach ≤10, audio, `VideoRecorder` dialog),
  `MessageAttachments` → `Lightbox`, `ChatToast`. Chat is already upgraded; check only.

### Patient shell — `layouts/Patient.jsx` · L
- `PatientNavbar` 60px (admin bar is 48), `PatientNavbarLinks` popper (Миний бүртгэл, Гарах), CT buttons.
- Same Chat as admin. **Notify is not mounted** — see Findings.

### /auth/login — `view/Auth/LoginPage.jsx` · U
- No popups. Links to forget-password, register. Layout `AuthNavbar.jsx` is L (`#00838f`, CT button).

### /auth/register — `view/Auth/RegisterPage.jsx` · L
- ShowAlert ×3. Selects `Register/SingleSelect`, `Register/SimpleSelect` (purple).
- Legacy: CT Card family, CT button, `#9c27b0` (L314), `#e91e63`.

### /auth/forget-password — `view/Auth/ForgetPassword.jsx` · L
- ShowAlert ×3. Legacy: CT Card, CT button, `CustomInput`, `#9c27b0` (L136–137).

### /auth/ResetPassword — `view/Auth/ResetPassword.jsx` · L
- ShowAlert ×3. Legacy: CT Card, CT button, `CustomInput`, `#e91e63`.

### /patientAuth/login — `view/Patient/Auth/PatientLoginPage.jsx` · L
- ShowAlert ×3. Legacy: CT Card, CT button, `CustomInput`, `#8e24aa`, `#5b4196ff`, `#0b6aa7`,
  `#e53935`, `#607d8b`; layout `layouts/PatientAuth.jsx` uses CT `authStyle.js`.

### /test/FileUpload — `view/FileUpload.jsx` · L
- Dev page: `BaseFileUpload` + Save, ShowAlert ×2. Decide in Phase 5: drop from routes or leave.

---

## Phase 6 — Doctor daily workflow

### /admin/AdviceHome — `view/AdviceHome.jsx` · U
The reference look. Check only.
- Filter chips (Бүгд / Нээлттэй / Хаагдсан / Миний / Миний ноорог) + search.
- `PostComposer`: patient lookup popper, type menu, body, **file upload**, audio; Болих / Ноорогт хадгалах / Нийтлэх.
- `FeedCard` → AdviceComment; **reply** `ReplyThread` (`Comment` + `CreateComment` with upload, audio);
  attachments → `Lightbox`.
- Popups: author → `UserDialogLink` → BaseDialog "Doctor profile" (`UserProfile`, CT button);
  quick action "Шинэ өвчтөн" → `NewPatientDialog` (BaseDialog, `PatientForm`).
- ShowAlert ≈9. Legacy inside: `CreateComment` CT button, `UserDialogLink` purple hover.

### /admin/AdviceComment — `view/AdviceComment.jsx` · U (dialogs L)
- Buttons: Back, "View current full examination" → BaseDialog `DetailViews/FollowUp` (1,135 L,
  `BaseFilesInfo` zoom dialog); "Edit examination" → BaseDialog `Forms/FollowUpForm` (982 L); Close.
- **Replies:** `CommentHeader`, `Comment` (like, rating, `UserDialogLink`, attachments → Lightbox),
  `CreateComment` (upload, audio).
- ShowAlert ≈6.

### /admin/PatientInfo — `view/PatientShow.jsx` (901 L) · P
The largest surface in the product.
- Empty state: "Шинэ өвчтөн бүртгэх" → `NewPatientDialog`; back to AdviceHome.
- Left card `features/patient/components/PatientShow/PatientInfo.jsx`: not-found ShowConfirm →
  BaseDialog "Patient" (`PatientForm`); Edit → BaseDialog "Patient", BaseDialog "Patient anamnesis".
- **22 side tabs (CustomTab).** Each row opens a BaseDialog:
  - History (no-op) · Outpatient Info (`OutPatientInfoReport` + Print) · Visit (`DetailViews/Visit` +
    Print, `BaseFilesInfo`) · CVD Monitoring (`CVDMonitoring`, inner tabs ×3, `CVDAnalyze` purple)
  - Registry tabs — confirmed → detail view + Print; unconfirmed → form + Save + Confirm:
    HF Ambulance, HF Hospitalization, Vascular Disease, Valve, Valve Endo, Pacemaker, ICD,
    Atrial Rhythm, Monitoring Rhythm, Congenital (Neelttei / Sudas / Katetr)
  - Patient Transfer · Laboratory Test (+ Print) · Echo (+ Print, `BaseFilesInfo`) · ECG (`BaseFilesInfo`) ·
    Surgery Report (tabs Page 1–8) · Blood Stroke · Cathlab · Calculator (no-op)
  - Most of these dialogs have **no title**.
- **PatientActions bar** (`customComponents/PatientActions/*`, 27 CT-button files):
  - Visit → `Forms/VisitForm`, Save + Print
  - ЗД хяналтын үзлэг → `HfAmbulanceForm` (tabs), Save + Confirm
  - Diagnosis menu: ECHO (`EchoForm`, segment popover, Save + Print), INR, Laboratory, ECG, Monitoring Rhythm
  - Transfer / Monitoring menu: team submenu (ShowConfirm), take under monitoring (ShowConfirm), Transfer form
  - Surgery menu: Open heart (`SurgeryReportForm`, Page 1–8), Cathlab (`CathlabForm` + Coronary /
    Ventriculography popovers), Surgery plan
  - Бусад: Hospitalize (tooltip), Procedures (Pacemaker 1/2/3 — Save & Print + Print; Ablation),
    Surgery Before Visits (Save + Print → nested BaseDialog report), Calculator menu (MAP, ATRIA,
    CHA2DS2-VASc, Geneva, NIHSS — Geneva and CHA2DS2 use CT Card)
  - National registry menu (nested submenus) → registry forms, Save + Confirm
  - ToCVD → /admin/Cardiovascular
  - Tender form menus ×3 → `TenderForm`, Save + Print → nested BaseDialog `TenderFormPrint`;
    unsaved-close ShowConfirm; inside TenderForm: restore draft, copy previous, complete confirms
- ShowConfirm ≈10, ShowAlert 40+.
- Legacy: CustomTab, CT buttons throughout, both `PatientShow` table trees (`features/patient/...` and
  `customComponents/PatientShow/...`).

### /admin/DoctorTeamCustom — `view/DoctorTeamCustom.jsx` · U
- Left rail: team row, gear (edit mode), New List.
- Patient pane: header Excel + Тохиргоо, RangeDate, **PatientActions bar** (as PatientInfo, minus
  Hospitalize / National registry / ToCVD), register link → PatientInfo.
- Edit pane: CustomTab General (form, Save / Delete) / Sharing (members grid).
- Popups: Notes column → BaseDialog "Notes" (`EditCommentForm`); Notes row action → BaseDialog
  (no title) `DoctorTeamPatientNotes`; Add member → BaseDialog `EditDoctorForm`.
- ShowConfirm ×3, ShowAlert ≈9. Legacy: CustomTab.

### /admin/PatientMonitoringDoctor — `customComponents/PatientMonitoring/PatientMonitoringDoctor.jsx` · U
- `ListPageHeader` + Excel, RangeDate, clear-filter.
- Row popups (BaseDialog, header = patient name + link): Асуулт → `MonitorQuestion` (**reply thread**,
  Send, "Чатаар бичих"); Own monitoring → grid; Remote visit → `RemoteVisitList` (`AdviceFileInfo` zoom);
  Out of monitoring → ShowConfirm.
- ShowAlert ≈8. Legacy: `MonitorQuestion` CT button.

### /admin/InPatient — `view/InPatient.jsx` · P
- CustomTab Waiting / In patient / Archive, with department filter.
- Waiting: Notes → BaseDialog "Edit notes"; doctor link → "Doctor profile"; Hospitalize / Cancel → ShowConfirm.
- In patient: PatientActions bar; `EditOutPatientInfo` → BaseDialog `OutPatientInfoForm` Save + Print
  (form has its own confirm); Leave department → ShowConfirm → BaseDialog `StayLeaveForm`.
- Archive: doctor links ×3; OutPatientInfo → report Print only, or form Save + Print.
- ShowConfirm ≈8, ShowAlert ≈17. Legacy: CustomTab, CT button, `#9c27b0` hover, `#00acc1` icons.

### /admin/CreatePatients — `view/CreatePatientList.jsx` · P
- RangeDate, "Шинэ өвчтөн" → `NewPatientDialog`; row → BaseDialog "Edit patient" (`PatientForm`);
  register link → PatientInfo; doctor link → "Doctor profile". Export hidden on this route.
- ShowAlert ×2. Legacy: CT buttons, `#00b530` spinner.

### /admin/CreateAllVisits, /admin/ExamRegisterAM1B, /admin/CreateAllVisitsAdmin — `view/CreateAllVisits.jsx` (1,022 L) · P
One file, three routes.
- CustomTab ×7, each with RangeDate + **Export**:
  - Visit (+ **АМ-1Б бүртгэл хэвлэх** PDF) → BaseDialog `DetailViews/Visit` (`BaseFilesInfo`)
  - ECHO → BaseDialog 1100px `DetailViews/Echo` (613 L, embeds `EchoExamination` 1,804 L)
  - ECG → 600×300 · INR → 600×300 `BloodStroke`
  - Open heart surgery → `SurgeryReport` (tabs Page 1–8)
  - ТиСДО/Э → `Tcd2` (embeds `Cathlab/Coronary` 2,102 L, Ventriculography LAO/RAO)
  - Monitoring Rhythm → `MonitoringRhythm` (empty stub)
- Dialog sizes differ per tab; English title keys.
- ShowAlert ×4–5. Legacy: CustomTab, 8 CT buttons, `#00b530` ×7.

### /admin/MyTicket — `view/MyTicket.jsx` · P
- BaseCrudManager inline; row → `Advice/AdviceDetail` replaces the grid: Back, FollowUp view dialog,
  FollowUpForm dialog, Open / Close, editable fields, Body + Save, **replies** with `CreateComment`
  (upload, audio).
- Legacy: CT buttons (`AdviceDetail`, `CreateComment`), `grayColor`.

### /admin/UserRequests — `customComponents/UserRequest/UserRequestsList.jsx` · L
- `IsActiveStatus` chips (`#2bb559` / `#ff5757` / `#ffbd17`).
- "Read more" → BaseDialog (no title, 600×410) `UserRequestInfo`, footer Confirm (relabelled Save) + Decline.
- ShowAlert ×3. Legacy: CT Card family, CT button.

### /admin/Profile — `view/Profile.jsx` · P
- CustomTab General / History.
- General: Edit → `ProfileEditDialog` (**photo upload**, discard ShowConfirm); Change password →
  `ChangePasswordDialog`; "Fill in" banner → contact dialog.
- History: "Related information" (`LinkObjectView`, CT button) → BaseDetailView popup.
- ShowConfirm ×1, `setAlert` ×3.

### /admin/PaceMaker — `view/PaceMaker.jsx` · L
- CustomTab: "ЭФШ, аблацийн маягт" → `Report/EPSAblation` (4 sub-tables, Print → jsPDF);
  "About hospitalized" → `Report/OutPatientInfoReport` (DataId 1008 hardcoded).
- Legacy: CustomTab, CT button.

### /admin/AllNotifications — `view/AllNotifications.jsx` · P
- Row → item URL / AdviceComment / chat room. Pagination. Legacy: `#111827`, `#1976d2`, `#f9fafb`.

### /admin/Handbook — `view/Handbook.jsx` · P
- PDF iframe. Frame only.

---

## Phase 7 — National registry

### Template A — the registry list (fix once, walk each)
`BaseList` subclass → UniCard → GridToolbar (Эмч lookup, Personal No, **Хайх**, **Экспорт** → ShowAlert)
→ BaseGrid; row double-click (card tap on phone) → BaseDialog with no title and no footer → detail view.
Every detail view header: date + `UserDialogLink` (purple hover) → "Doctor profile" BaseDialog.

| Route | Table | Detail view | Detail contents | Legacy in detail |
|---|---|---|---|---|
| /HfAmbulance | `HeartFailure/HfAmbulanceTable` | `DetailViews/NationalRegistry/HeartFailure/HfAmbulance` (1,642 L) | CustomTab Үзлэг / Шинжилгээ / Эмчилгээ, 14 sections | CustomTab |
| /HfHospitalization | `HfHospitalizationTable` | `HfHospitalization` (2,019 L) | 25 sections, UniCard inside the dialog | nested card |
| /VascularDisease | `VascularDisease/VascularDiseaseTable` | `VascularDisease` (1,484 L) | CustomTab ×2, 35 sections, 2 images | `#003fd4`, 12px |
| /CongenitalMalformations/{neelttei,sudas,katetr} | `CongenitalMalformationsTable` (+ Төрөл select) | `Neelttei` / `Sudas` (216 L stubs), `Katetr` (536 L) | Katetr: 15 sections, 6 box tables | `#949494`, `#f5f5f5`, `#ccc`, 12px |
| /ValveDiseases, /ValveDiseaseEndo | `ValveDiseasesTable`, `ValveDiseasesEndoTable` (clones) | `ValveDiseases`, `ValveDiseasesEndo` (1,462 L clones) | 21 sections, 1 raw `<table>` | 13 hex, 12px |
| /AtrialRhythm | `Rhythm/AtrialRhythmTable` | `AtrialRhythm` (627 L) | 12 sections | `#f5f5f5` |
| /AtrialRhythmNew | `AtrialRhythmNewTable` | `AtrialRhythmNew` (217 L stub) | empty | — |
| /Icd | `ICDRhythmTable` | `ICDRhythm` (276 L) | 10 empty section headings | — |
| /MonitoringRhythm | `MonitoringRhythmTable` | `MonitoringRhythm` (216 L stub) | empty | — |
| /Pm | `PaceMakerRhythmTable` (variant) | confirmed → `PaceMakerRhythm` (274 L) + Print; unconfirmed → `Forms/.../PaceMakerRhythmForm` (1,371 L) Save + Confirm | form: 10 sections, lookup popper, 6 box tables, ShowAlert ×6 | `customFormStyles` ×14, `#fefefe` |

### /admin/TenderFormAll — `NationalRegistry/Surgery/TenderFormAllTable.jsx` (520 L) · P+
- Toolbar: form-type select (menu), register no, doctor, search in answers, RangeDate, **Excel**, **Текст (.txt)**.
- Grid: status cell, `BaseNoData`, footer total (inline 11.5px).
- Row actions:
  - Засах → BaseDialog `TenderForm` + Save (hidden when confirmed); unsaved-close ShowConfirm
  - Хэвлэх → BaseDialog `Report/TenderFormPrint` (blank-form switch, Хэвлэх iframe print, PDF татах; CT buttons)
  - Баталгаажуулах → ShowConfirm + ShowAlert
  - Устгах → ShowConfirm + ShowAlert
- ShowConfirm ×3, ShowAlert ×5.

### /admin/TenderForm1_1 … 3_1 (11 routes) — `NationalRegistry/Surgery/TenderFormTable.jsx` (420 L) · P+
- Toolbar: search by register no, **Экспорт**. Title and extra columns from `/TenderForm/GetConfig`.
- Same 4 row actions and dialogs as TenderFormAll.

### `Forms/NationalRegistry/Surgery/TenderForm.jsx` (1,770 L) — shared by all 12 routes above and PatientInfo
- Sticky section rail (collapse, search, fill-state dots, open/close all — raw `<button>`/`<input>`);
  one `GroupPanel` per section; raw `<table>` segment grids; `BaseTableGrid` repeating tables.
- Sticky bar: Хадгалах, Дуусгаж хадгалах; when confirmed "Шинэ бүртгэл (өмнөхөөс хуулах)" — CT buttons.
- Confirms: restore draft, copy previous, complete. ShowAlert ×6.
- Legacy: CT buttons, 11 numeric font sizes. **Print preview check required.**

---

## Phase 8 — Cardiovascular

### /admin/Cardiovascular — `view/CardiovascularDisease/CVDPatientInfo.jsx` (832 L) · L
- Left, UniCard "Patient Info":
  - `PatientCheck` (text field + Шалгах CT button, **purple underline**)
  - `Patient/PatientInfo` Edit → BaseDialog `PatientInfoForm`
  - Accordion 2 → `CVDHistoryForm` (`#5ec7ff`)
  - Accordion 3 → `CVDBodySizeForm`
  - Accordion 4 → `CalculateRisk` (Calculate, Print → jsPDF, MUI Table, CT buttons) + status buttons:
    Хяналтанд авах → BaseDialog `CVDTakeControlForm`; Хяналтнаас гаргах → BaseDialog
    `CVDControlAndTransitionForm`; add follow-up exam; Дуусгах
  - Accordion 5 → `CVDInspectionAndManagement` (ICD autocomplete, `JournalICD`, Онош хадгалах, drug table,
    Нэмэх → BaseDialog `AllDataTable`; Хэвлэх → jsPDF; Жор нэмэх → BaseDialog `SuccessPrescription` + Print;
    embedded `CVDManagementForm`)
- Not-found: ShowConfirm → BaseDialog "Иргэн үүсгэх" `CreatePatientForm`.
- Right: **CT Card** + accordion "Анализ" → `CVDAnalyze` (4 charts, **purple `#9C27B0` ×2**);
  `CVDSentPrescriptionTable` → BaseDialog `CVDSentPrescription` (8 hex, MUI Table);
  `CVDMonitoringTable` → BaseDialog `CVDMonitoring`; `CVDInspectionTable` → BaseDialog `CVDInspection`.
- ShowAlert ×11, ShowConfirm ×1, 3 jsPDF print paths.

### /admin/CVDMonitoringList — `CardiovascularDisease/Tables/CVDHistoryTableNew.jsx` · P
- Toolbar: deadline-status and status selects, Personal No (CVD `CustomTextField`), Хайх, Экспорт.
- Columns: `ShowCVDInfo`, `IsActive` (4 hex), `DateStatus` (4 hex).
- Row → BaseDialog `DetailViews/CVDMonitoring` (516 L): risk box (named colours, 2.2rem),
  CustomTab ЗСӨ-ний түүх / Биеийн хэмжээс / Анализ (`CVDAnalyze` purple).

### /admin/inspection — `CardiovascularDisease/Tables/CVDInspectionTableAll.jsx` · P
- Toolbar: Үзлэгийн эмч / Хяналтын эмч lookups (roles 1, 6), Personal No, Хайх, Экспорт.
- Columns: `RiskView` (2 hex), `IsActive`.
- Row → BaseDialog (300px) `DetailViews/CVDInspection`: risk box.

### /admin/CVDMonitoringReportList — `view/CardiovascularDisease/CVDMonitoringReportList.jsx` · P
- Vertical CustomTab ×5: Дэлгэрэнгүй бүртгэл, Үзлэг, Нэгдсэн бүртгэл, Сум, Сарын мэдээ (`Report/CVD*Table`, MUI Table).
- Each: `Report/Components/Filter` (RangeDate, Organization and Create-user lookups, dictionary selects),
  `Pagination`, `Actions` (**Download** Excel, Сэргээх).
- Legacy: CustomTab, 10–11px headers.

### /admin/CVDIndicartors — `view/CardiovascularDisease/CVDIndicartors.jsx` · L
- RangeDate + 15 cards `CustomReport/Report1..15` (one template: **CT Card + CardHeader rose icon** + bar chart, 12px).
- No popups.

### /admin/CVDRegistration — `view/CardiovascularDisease/CVDRegistration.jsx` · P
- UniCard "Харьяалагдах хүн амын тоо" → `CVDHunAmForm` (box table, 6 text fields, Save, ShowAlert ×3, `#f4fbff`, `#e0e0e0`).
- UniCard "ЗСӨ/ЧШ-гийн дараах үндсэн эмийн тоо" → `CVDDrugForm` (9 radios, 2 selects, Save, ShowAlert ×4).

---

## Phase 9 — Settings and administration

Most are `BaseCrudManager` in **inline** mode: a row click or New replaces the grid with an inline
`BaseDetailView`, and `ListView` fields become CustomTab tabs whose child rows open BaseDetailView popups.

| Route | Entry | Opens | Notes |
|---|---|---|---|
| /report | `view/Reports.jsx` | `AllReport/SearchToolbar` (date popovers, doctor lookup popper, location menus), Search | ShowAlert ×2; CT button, `#ff4747` |
| /doctorExamReport | `view/DoctorExamReport.jsx` · U | period select, dates, locations, Хайх, **Excel**, **Текст** | ShowAlert ×3 |
| /doctor | `view/DoctorsProfile.jsx` | New / row → `DoctorEditDialog` (**photo upload**, role menu, org autocomplete, Departments child grid → BaseDetailView popups, discard confirm); Change password → BaseDialog `ChangePassword`; Export | `DoctorCrudActions` CT buttons, purple search underline, `#00b530` |
| /Organization | `view/OrganizationNew.jsx` | toolbar Шинэ / Сэргээх / Засах / Устгах / Нэгтгэх (`newComponents/ToolBar`); form → BaseDialog "Organization" 800×720; Нэгтгэх → `mergeDialog` (MUI Dialog, preview table) | delete `useConfirm`; `setAlert` ×10; different toolbar family |
| /DrgroupDepartments | `view/DrgroupDepartments.jsx` | inline detail, tab "Doctors" → child popups | — |
| /patient | `view/Patient.jsx` | inline detail with "Profile image" **File** field → `BaseFileUpload` | — |
| /Medications | `view/Medications.jsx` | inline detail | — |
| /JournalRef | `view/JournalRef.jsx` | inline detail | — |
| /Roles | `view/Security/Roles.jsx` | inline detail, tab "Permissions" → child popups | — |
| /DoctorsTeam | `view/DoctorsTeam.jsx` | delete icon → ShowConfirm; inline detail, tabs Иргэн / Эмч (remove → ShowConfirm) | ShowConfirm ×3 |
| /Permission | `view/Security/Permissions.jsx` | inline detail | — |
| /DictProvinceCity | `view/DictProvinceCity.jsx` | inline detail, tab DictSoumDistrict → popup, whose DictBagKhoroo tab → **second stacked popup** | — |
| /AllTickets | `view/AllTickets.jsx` | inline `AdviceDetail` (see MyTicket), New | CT buttons |
| /Apps | `view/Security/Apps.jsx` | inline `AppsDetail` with Cancel + Save | the only inline detail with Cancel |
| /Users | `view/Security/Users.jsx` | two managers (Users, PatientUsers); `UsersDetail` is always a floating MUI Dialog | — |
| /optionType | `view/OptionType.jsx` | two managers; DicoType detail tab OptionTypes → child popups | `#ddd` dividers |
| /UserActionHistory | `customComponents/UserActionHistoryAdmin.jsx` · L | CT Card "Logs", RangeDate; "Related information" → BaseDetailView popup | ShowAlert ×2; CT Card, `LinkObjectView` CT button |

---

## Phase 10 — Patient portal (check at 390px first)

### /patient/PatientHome — `view/Patient/PatientHome.jsx` · P+
- Tiles → PatientMonitoringPat, PatientQuestion, PatientAdvice, PatientCVD, PatientProfile. No popups.
- Tiles use the `card` frame, not the brand `panel` frame; `19px` literal.

### /patient/PatientProfile — `view/Patient/PatientProfile.jsx` · P
- Read-only card (`BaseInfo`, 7 hex), `LoadError` retry.

### /patient/PatientMonitoringPat — `view/Patient/PatientMonitoring.jsx` · P
- "Тэмдэглэл бүртгэх" form (`PatientMonitoringForm`, CT button, Save), `PressureChart`,
  history list (RangeDate, pagination). ShowAlert ×2.

### /patient/PatientQuestion — `view/Patient/VisitComments.jsx` · P
- **Reply thread:** `VisitCommentsForm` (text + Илгээх), `VisitCommentsList` (bubbles, "Өмнөх яриануудыг харах";
  6 font sizes). ShowAlert ×1. CT buttons.

### /patient/PatientAdvice — `view/Patient/PatientAdviceList.jsx` · P
- Read-only advice + comments, `LoadError` retry; non-brand `colors.*`, 11.5–13px sizes.

### /patient/PatientCVD — `view/Patient/PatientCVD.jsx` · L
- `BaseTab` ×4: Миний үзлэг (`MonitoringInfo`, 18 hex: `#2bb559`, `#ff5757`, `#FF007F`, `#355E3B`) ·
  Зөвлөгөө (`OwnVisit/PatientAdvice`: Эрсдэлээ тооцоолох, MUI Table, **Print → jsPDF**, CT button) ·
  Биеийн хэмжээс (`PatientBodySizeForm`, Save) · Өвчний түүх (`PatientOwnHistoryForm`, `#5ec7ff`, Save).
- ShowAlert ×6.

### /patient/PatientRemoteVisit — `view/Patient/PatientRemoteVisit.jsx` · P
- `RemoteVisitForm`: text, **`BaseFileUpload`** (preview dialog), Илгээх (CT button).
- `RemoteVisitList`: doctor comment, `AdviceFileInfo` (**zoom dialog**, download). ShowAlert ×1.

### /patient/PatientRehab — `view/Patient/PatientRehab.jsx` · P
- Exercise list, "Гүйцэтгэлээ тэмдэглэх" per row (CT button), assessment card; 4 font sizes.

### NotFound — `view/NotFound.jsx` · P
- CT button, `colors.text.*`.

---

## Findings outside the visual scope — need a decision

Found during the 2026-09-15 audit. This program does not fix them, because it is visual only. Each
needs a yes/no before anyone touches it.

**Actions that do nothing**
1. **Registry detail popups never show Print or Confirm.** Every `DetailViews/NationalRegistry/*`
   defines `Print` / `GetPrintNew` / `Confirm`, but the Template A dialog passes none. Print is
   unreachable from the registry list screens.
2. **/Pm confirmed record** shows a Print button with no handler.
3. **CreateAllVisits Visit and Echo** detail dialogs have no Print wired.
4. **/inspection** doctor filters "Үзлэгийн эмч" and "Хяналтын эмч" are `disabled={true}`, so they
   cannot be used.
5. **TenderFormTable / TenderFormAllTable** pass `SortChange` / `PageChange` to `BaseGrid`, which reads
   `OrderBy` / `ChangePage` / `Option`. Server-side sort and paging look unconnected.
6. **PatientInfo tabs History and Calculator** — row click does nothing (History has no handler,
   Calculator only logs).

**Empty or placeholder screens**
7. **Empty detail views.** `Neelttei`, `Sudas`, `AtrialRhythmNew` and `MonitoringRhythm` render only
   a date and doctor. `ICDRhythm` and `PaceMakerRhythm` are empty section headings. A doctor opening
   those records sees nothing.
8. **/PaceMaker "About hospitalized"** tab hardcodes `DataId 1008`.

**Behaviour mismatches**
9. **Patient layout does not mount `Notify`.** Every `setAlert` in the patient portal — chat
   `NewChatDialog`, `MembersPanel` — is silent.
10. **TenderFormTable** Confirm and Delete have no guard for already-confirmed records (TenderFormAll
    has one). The server refuses via `LoadWritable`, so this is a clearer message rather than data
    safety.
11. **TenderForm** has its own sticky Save bar *and* the BaseDialog footer Save — two Save buttons.
    Phase 1 restyles both; removing one is a behaviour decision.
12. **/Users** opens `UsersDetail` as a floating dialog on top of an inline manager. The inline
    Settings details have no Close / Back, except `/Apps`.
13. **Leftover code:** `PaceMakerRhythmTable` imports a `PMNew` debug stub that renders
    "PMNEW.js----", and `CVDIndicartors` imports Card components it never renders.

**Crash**
14. **/admin/PaceMaker crashes at tablet and phone width.** At 768 and 390 px the tab shows
    "Хуудсыг ачаалахад алдаа гарлаа" (page error `t is not a function`); 1440 renders. Reproduced
    twice in the baseline run.
