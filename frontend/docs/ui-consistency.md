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
| 1 | Actions and popups: `CustomButtons/Button`, `BaseDialog`, `BaseDialogActions`, `BaseDetailView`, `BaseAlert`, MUI Dialog theme | ✓ reviewed 2026-09-15 |
| 2 | States, tabs, containers: `BaseNoData`, `DivLoading`, `BaseLoading`, `LoadError`, `CustomTab`, `BaseTab`, `UniCard`, status chip, purple sweep | ✓ reviewed 2026-09-15 |
| 3 | Form controls, sections, read-only views, lookup tables | ✓ reviewed 2026-09-15 |
| 4 | Files, attachments, replies | ✓ built (`e4e75f5`, attach redesign `dec5341`) |
| 5 | Shell leftovers and sign-in screens | ✓ built (`70b2a01`) |
| 6 | Doctor daily workflow | ✓ built (`b726fdf`) |
| 7 | National registry | ✓ built (`6b6f00b`) |
| 8 | Cardiovascular | ✓ built (`63767fd`) |
| 9 | Settings and administration | ✓ built (`d637bfa`) |
| 10 | Patient portal | ✓ built (`12aa4a9`) |
| 11 | Lock-in and cleanup (no deletions, by decision) | ✓ built |

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

## Phase 2 — what changed, and what it leaves for later phases

Done (branch `ui/phase-2-states-tabs`):
- **Empty** — `BaseNoData` is an inbox glyph and one muted line on `tintSolid`, like BaseGrid's own
  empty overlay; the salmon strip is gone. `BgColor`/`IconColor` are accepted and ignored; new
  optional `Action` slot.
- **Loading** — one `BrandSpinner` (cyan arc on a hairline track, exported from `DivLoading`) used
  by `DivLoading`, `BaseLoading` and `PageLoading`. The overlay wash is the canvas colour, not grey.
- **Error** — `LoadError` has brand type and outlined Retry; it gained `Title` and `Close`, and
  `PageTabs/TabErrorBoundary` now renders it, so a crashed tab and a failed load look the same.
- **Tabs** — `CustomTab` pills and side rail, and `BaseTab`, use the AdviceHome filter-bar
  language: ink text, `tint` + `cyanInk` selection, cyan accent bar on the rail. No green.
- **Surfaces** — `UniCard` is `radius.lg`.
- **Status** — new `customComponents/StatusChip.jsx` (success / danger / warning / info /
  neutral; dot + dark AA text on a tint). Seven badge components and the TenderFormAll status
  column use it. Text-safe `successInk` / `dangerInk` / `warningInk` added to `colors.status`.
  Category badges (congenital category, adult/child) moved from green/red to the neutral `info`
  tone, since they are not verdicts.
- **Purple** — gone from shared components: focus underlines are `cyan`, hover links `cyanInk`,
  the CVD analysis section header `cyanInk`. Plain `<a>` links (every register-number link in
  every grid) are `cyanInk` through a `html a` rule in `index.jsx` GlobalStyles, which outranks
  the `_misc.scss` purple without editing it.
- **Theme** — `MuiTooltip` (ink), `MuiPopover`/`MuiMenu` (radius md, navy shadow, hairline),
  `MuiDivider`, `MuiSkeleton`.

Left for the screen phases:
- Purple still in the auth screens (`RegisterPage`, `ForgetPassword`, `PatientLoginPage`) — Phase 5.
- Screen-local badges and coloured section labels, e.g. `PatientPlatform/CardioVascular/MonitoringInfo`
  (patient CVD page) — Phase 10; `RiskView` / risk-level colours are a clinical scale and stay.
- Narrow status columns ellipsize the chip text (the full word is in its title) — widths per screen.
- `customComponents/DateTime.jsx:59` already fails `react-hooks/set-state-in-effect` on the
  previous commit; untouched.

## Phase 3 — what changed, and what it leaves for later phases

Done (branch `ui/phase-3-form-controls`):
- **Field tokens** — `BaseEditControls/fieldRowStyles.js` exports `FIELD` (row hairline, `tintSolid`
  label cell, `inkMuted` label, `ink` value, hover/focus borders, radio/checkbox ring) and
  `inputBorderSx`. A caller's `borderColor="#eee"` resolves to the brand hairline.
- **26 control files** swept onto `FIELD`: every `BaseEditControls/*`, `baseComponents/BaseField`,
  `Controls/{BaseFileUpload,BaseGridLookUp,BaseLookUpGridLoad,BaseSelectSingle,BaseSelectSingleLoad}`,
  `CustomInput`, `BaseViewControls/{BaseInfo,BaseArrayInfo,BaseConfigInfo,BaseFilesInfo}`,
  `Forms/Components/{CustomCheckBox,CustomRadio}`, `Forms/NationalRegistry/CustomTextField`,
  `SimpleSelect`. Hover borders are `hairlineStrong`, focus is `cyan`.
- **Read-only rows** (`BaseInfo` family) use the same tinted label cell as edit rows (was a grey
  `#f5f5f5`), and values are 14px ink (were 12px `#000`, smaller than their label).
- **`colors.label.primary`** moved from `#75736c` to the `inkMuted` value, and the three label styles
  in `custom/baseControlsStyles.js` follow — one label grey across the app.
- **`GroupPanel`** — hairline border, white panel, `radius.md`, titles in brand ink (level 3
  `inkMuted`) instead of `#003366` on `#fafafa`. Geometry unchanged.
- **Lookup popups** — `BaseLookUpGridLoad` field text at 14px (was 11px) in ink; `GridRow` zebra and
  selection in brand tints (was grey `#f0f0f0` and mint `#c8fada`); `FilterRow` underline and text.
- **`custom/customFormStyles.js`** — raw clinical tables and old section boxes on brand hairlines
  and tints; the red `#f54242` section title is ink.
- **Theme** — `MuiOutlinedInput` hairline outline, `MuiFormLabel` `inkMuted` (focused `cyanInk`).

Print — checked by path, not assumed:
- Server-rendered PDFs (`BasePrintReport`, 27 callers) and `Report/TenderFormPrint` (server HTML in
  an iframe) cannot see frontend styles.
- The eight `html2canvas` reports (`Report/*`, `CalculateRisk`, `CVDInspectionAndManagement`,
  `PatientSendPage`) import none of the components changed here.
- `CalculateRisk` and `CVDInspectionAndManagement` capture plain MUI tables, so **no global
  `MuiTable*` override was added** — the 15 hand-built MUI tables are restyled per screen instead.

Left for the screen phases:
- Local label greys in `HfStayForm`, `PaceMakerTwoForm`, `PaceMakerThreeForm`, `CVDManagementForm`,
  `JournalICD`, `JournalMajorFindings`, `JournalTreatment`, `Register/*` (Phases 5, 6, 8).
- `TenderForm`'s own section boxes and rail (Phase 7); `colors.text.sectionHeading` and
  `colors.background.infoTint` still have direct users.
- The Quill editor CSS string in `BaseRichText` and file-list borders (Phase 4).

## Phase 4 — what changed, and what it leaves for later phases

Done (branch `ui/phase-4-files-replies`):
- **`Controls/BaseFileUpload`** — outlined attach button in the toolbar rank (was a centred
  `#5ba3ff` button), 88px image tiles with a quiet remove button, documents as chips with
  download and remove (was a link beside a red round button), warning-tint validation box, and a
  preview on a dark plate with Download and Close. Picking, validation, removal and the `Value`
  shape are unchanged. Every composer shares it: AdviceHome post and reply, ticket replies,
  patient remote visit, config `File` fields.
- **`BaseViewControls/BaseFilesInfo`** and **`Advice/AdviceFileInfo`** — render
  `AdviceFeed/PostMedia` (photo grid, lightbox, document chips) instead of two copies of their own
  thumbnails, `#0d6efd` hover bars, FontAwesome icons and zoom dialogs.
  `mediaUtils.forMediaView` marks an image row without `FileSrc` (no bytes on the server) as
  unavailable, so it shows as a "file not found" chip rather than a broken tile.
- **Replies** — `Advice/CreateComment`: Send is filled, brand textarea border.
  `Advice/AdviceDetail` (MyTicket, AllTickets): Back / examination buttons outlined, Open/Close and
  Save filled, brand headings instead of bare `h3`/`h4`. `PatientMonitoring/MonitorQuestion`:
  canvas thread and brand bubbles instead of WhatsApp beige and green.
  `PatientPlatform/VisitCommentsList`: the patient's bubbles were white text on teal (~2.9:1),
  now ink on the brand tint. `VisitCommentsForm` and `RemoteVisitForm` Send are filled.

Checked in the browser: attach an image and a PDF on the ticket reply box, the patient remote
visit (1440 and 390 px) and open the preview; follow-up attachments with missing bytes render as
chips. Nothing was sent — writes were blocked during the checks. Local `C:/MnCardioFiles` holds only
26 files (the Advice subset), so detail-view photos render as "not found" chips locally; the photo
grid itself is the PostMedia already live on AdviceHome.

Attach-before-send redesign (same branch, requested 2026-09-15 — "adding a file to a ticket is ugly"):
- **`BaseFileUpload`** — a dashed drop zone that is a real button: "Файлаа энд чирж оруулах эсвэл
  **сонгох**", with the accepted types and the per-file size limit underneath; drag-and-drop with a
  cyan hover state; the picker's `accept` follows `allowedFileTypes`. Every attached file is the same
  card — thumbnail (photo, opens the preview) or type icon (mic for a voice note), name, type ·
  size (· duration for a recording), download for a file already on the server, remove. Each
  rejected file gets its own short red line ("setup-tool.exe — file type not allowed (.exe)") instead
  of one yellow block repeating the whole extension list.
- **`Advice/CreateComment`** — attachments have their own full-width row under the text box; the
  drop zone is hidden on a closed ticket, where nothing can be sent.
- **`AdviceFeed/PostComposer`** — microphone aligned with the drop zone.
- **`Controls/BaseImageSingle`** (patient and doctor photo fields) — the grey placeholder with a
  hover-only FontAwesome camera strip is now the account dialogs' pattern: preview, "Зураг оруулах" /
  "Зураг солих", "Зураг устгах", "JPG, PNG зураг" hint; a photo can be dropped on the preview.
- Three new locale keys in both catalogs (the drop-zone text).
- Not changed: `Chat/Composer` (already chips, drop and paste), the account dialogs' photo pickers
  (already the target pattern). `components/CustomUpload/*` is dead — Phase 11.
- Checked in the browser: new-ticket composer with an image, a PDF and a rejected `.exe`; patient
  remote visit at 390 px (English UI); new-patient photo before/after; a dispatched drop event adds a
  card and the drag state turns the border cyan. Nothing was sent.

Left for later:
- `Advice/AdviceTicket.jsx` is only imported by the dead `AdviceList` / `AdviceListSoum` — Phase 11.
- `PatientPlatform/OwnVisit/PatientAdvice.jsx` (MUI table + jsPDF print) — Phase 10, print checked there.
- Opening `/admin/AdviceComment` fires a `POST BaseObject/create` on load (seen while writes were
  blocked) — presumably a view record; not a visual matter, noted for Findings review.

## Phase 5 — what changed, and what it leaves for later phases

Done (branch `ui/phase-5-shell-signin`):
- **Sign-in screens share the login page's frame.** New `view/Auth/AuthShell.jsx` renders the
  animated map, brand mark, title and support footer that `LoginPage` already had, styled by the
  same `LoginScene.css` (new rules: `.panel.wide`, two-column `.grid2`, `select`, `.ok` banner,
  `.hint`). `LoginPage` itself is unchanged — it is the reference.
  - `ForgetPassword` — one field, inline error and success banner; same service call.
  - `ResetPassword` — show/hide password, mismatch shown in the panel; the server's answer is still
    a dialog, because success moves on to the login page. Title "Шинэ нууц үг тохируулах".
  - `RegisterPage` — wide panel, two columns on desktop and one on phones; user-name check on blur
    with a checking / taken / free hint under the field; province → soum → bag selects cascade as
    before; contact validation shown inline. Replaces the CT Card, purple selects and pink header.
  - `PatientLoginPage` — mirrors the doctor login (show password, inline errors, the support
    message after three failures). **"Remember me" is gone: its value was never read.**
- **`AuthNavbar`** — the teal CT language button is a Монгол / English segmented switch.
- **Language race fixed.** On a fresh browser the sign-in pages could stay English while the switch
  said Монгол: `AuthNavbar` changes the language while the page's lazy chunk is mounting, and
  react-i18next missed the event. The old pages hid it with a 700ms card fade that re-rendered them.
  `useLanguageCatchUp()` (in `AuthShell.jsx`) re-renders once if the language moved during mount.
- **Top-bar dropdowns** — `adminNavbarLinksStyle.js` `dropdown`, `dropdownItem*`, `userName`,
  `lightBlueHover`, `dropdownItemDanger` on brand tokens (surface, `radius.md`, navy shadow, tint
  hover, danger ink for logout). Reaches the profile menu, overflow menu, notifications and open tabs.
- **Patient top bar** — `PatientNavbar` is now the doctor bar's shell (`TopBarShell`/`TopBarInner`
  exported from `AdminNavbar`), 48px, with `ProfileMenu Variant="patient"` (Миний бүртгэл, Гарах →
  `/patientAuth/login`, no change-password) and the shared icon button for the drawer on phones.
- Locale keys: 6 new in both catalogs, and en "Миний бүртгэл" → "My profile" (it was untranslated,
  so the English patient menu mixed languages).

Checked in the browser (1440 and 390): register with a too-short user name, forgot password in
Mongolian on a fresh browser, reset password from a link, patient login, patient bar and menu,
doctor profile menu. Nothing was submitted — sign-in writes were blocked.

Left for later:
- `components/Navbars/PatientNavbarLinks.jsx` has no importers now — Phase 11 removal list.
- `/patientAuth/login` has no language switch (`layouts/PatientAuth.jsx` never mounts `AuthNavbar`),
  so it follows the browser language — same as before. Adding one is a small behaviour change; not
  done.
- `/test/FileUpload` dev page left untouched (Test layout, not linked from anywhere) — Phase 11 list.
- The notification dropdown was not re-shot; it uses the same restyled `dropdown` class.
- `layouts/PatientAuth.jsx` still imports CT `authStyle.js` for its wrapper — invisible now that the
  page draws the full-screen scene; Phase 11.

## Phase 6 — what changed, and what it leaves for later phases

Walked with before/after shots at 1440 (and 768/390 where the screen is used on the move):
PatientInfo (card, action menu, Visit tab and its dialog, empty state), InPatient ×3 tabs,
CreatePatients, CreateAllVisits (Visit, ECG, a record dialog), MyTicket and a ticket, UserRequests
and its popup, Profile General/History, PaceMaker, AllNotifications, Handbook. Phases 1–4 had
already lifted most of these; this phase fixed what was left.

Done (branch `ui/phase-6-doctor-workflow`):
- **PaceMaker renders again.** It showed "Хуудсыг ачаалахад алдаа гарлаа" at every width (not only
  tablet/phone, as the baseline had it): three `EPSAblationTables/*` class components called
  `t("tableHeader")` on a CSS class name with no `t` in props. The class name is a plain string
  again. Finding 14 is closed by this. The tab's "PDF Download" is translated.
- **PatientInfo** — every side tab's record dialog now carries the tab's name as its title (20
  dialogs across `features/patient/components/PatientShow/**`; most had an empty title bar). The
  patient card's section headings, "Registration number" and the gender in the summary line were
  English in the Mongolian UI; the page tab said "Patient info".
- **CreateAllVisits** (and АМ-1Б / admin variants) — Export was a second filled button beside the
  filter on all 7 tabs; it is outlined, with the АМ-1Б print on the same row (it had dropped to a
  line of its own). Export spinners `#00b530` → `cyanInk`; same spinner on CreatePatients.
- **InPatient** — row icons: hospitalize green → `cyanInk`, cancel red → `status.dangerInk`, the
  `#00acc1` patient/notes/doctor/edit icons → `cyanInk` (Waiting, Admitted, Surgery plans).
- **UserRequests** — the Creative Tim Card whose header floated a cyan pill over the grid is a
  `UniCard` like every other list; the request popup has a title.
- **Profile → History** — "Холбоотой мэдээлэл" was a filled primary button on every row; outlined.
- **AllNotifications** — its own Paper (8px, black shadow, Container gutters, `#111827`, `#1976d2`
  unread bar, names uppercased through a bare `h6`) is now a `UniCard` on brand tokens with the
  shared empty state and spinner. The page subtitle is dropped (no other list page has one).
- **`BaseGrid/Pagination`** (AllNotifications, NotificationList, patient PatientMonitoringList) —
  MUI's English "Rows per page / 1–10 of 438" → "Мөр харуулах / 1-10 -ийн 438", as the grid footer.
- **`customComponents/SimpleSelect`** (24 importers: the RangeDate period select on every list,
  `BaseSelect` in config-driven forms, the AdviceHome composer and analytics rail, registry tables,
  calculators, InPatient department, ticket detail) — the template dropdown (#999 hover fill with
  white text, #555 label, square corners) is on FIELD/brand tokens; a `FullWidth` select beside an
  inline label now fills its row. Height and font size unchanged. Checked on AdviceHome and the
  Visit form. (The "Асуумжийн тойм" title wrapping beside its select predates this — same width on
  the untouched build.)
- **Ticket detail** (`Advice/AdviceDetail`) — status and type selects share a row at half width
  each (they were squeezed into thirds); page title "Advice edit" and status "Closed" translated.
- Locale: 8 keys (4 were identity mappings in the Mongolian catalog).

Checked, nothing to change: AdviceHome, DoctorTeamCustom, PatientMonitoringDoctor (reference
screens), Handbook (PDF viewer), Profile General (already on the account-dialog look).

Left for later:
- `customComponents/PatientShow/**` is a second, unimported copy of the PatientInfo tab tables
  (still CT Card) — the live tree is `features/patient/...`. Phase 11 removal list.
- `InPatient/FieldActions/EditSanal.jsx` fails the react-hooks "reassign after render" lint rule on
  an existing ref callback; not introduced here, not touched.
- The mobile RangeDate stacks both dates and the period select vertically on phones (shared
  component, every list page) — Phase 10, where the phone layout is the priority.
- Visit detail rows still show a few English labels ("Visit note") — they come from the detail
  view's own labels; Phase 7 walks detail views.

## Phase 7 — what changed, and what it leaves for later phases

Walked at 1440 (lists also at 390): all 12 registry lists and a record from each, TenderFormAll,
a TenderForm (3.1 draft), its print preview, TenderForm2_2. Template A (UniCard, GridToolbar,
BaseGrid, BaseDialog) was already lifted by Phases 1–3; the lists needed nothing per screen.

Done (branch `ui/phase-7-national-registry`):
- **Record dialogs are titled** on all 11 registry list pages (13 dialogs incl. the Pacemaker
  form/detail pair) with the list's own title, as PatientInfo's were in Phase 6.
- **Detail views** `Katetr`, `ValveDiseases`, `ValveDiseasesEndo`, `AtrialRhythm`,
  `VascularDisease` — the box tables' template greys (`#949494` rules, `#f5f5f5` header cells,
  `#ccc` / `#fafafa` answer boxes) are brand hairlines on the label tint every other read-only view
  uses. Vascular's saturated-blue bordered list is a tinted panel with ink text.
- **Vascular tables had no borders at all**: six rules read `"1px solid ${colors.border.faint}"` in
  a plain string — the placeholder was never interpolated, so the CSS was invalid and dropped.
- **Outlined field labels** (`theme.js` `MuiInputLabel`) — a resting outlined label sat flush against
  the left border, touching the top, because the theme's root rule replaced MUI's
  `translate(14px, 9px)` with a bare `translateY`. It now has the shrunk label's 12px inset and sits
  on the text line. Measured against the untouched build: dx 0→12, dy 4→7 on TenderFormAll's four
  search fields, the CVD monitoring toolbar and Organization's search box. Shrunk labels unchanged.
- Print is unaffected: registry detail views print through server PDFs (`BasePrintReport`), and
  TenderFormPrint is server HTML; the print preview was checked.

Checked, nothing to change: TenderFormAll/TenderFormTable toolbars and row actions, TenderForm's
section rail and sticky bar (Phase 1 ranks), registry lists on phones (card layout).

Left for later / noted:
- Registry detail dates print raw, e.g. "2026-05-25 00:00:00.000" (Valve, Katetr) — formatting in
  the detail views, not styling; added to Findings (16).
- `HfHospitalization` and `AtrialRhythmNew` have no rows locally, so their record dialogs were not
  opened; they share the table template and dialog code with the ones that were.
- Finding 11 (TenderForm's two Save buttons) is visible again in the 3.1 dialog.
- Katetr's "1. ЕРӨНХИЙ МЭДЭЭЛЭЛ" renders as an empty tinted bar — an empty section, as finding 7.

## Phase 8 — what changed, and what it leaves for later phases

Walked at 1440 (and 390 for lists/indicators): the cardiovascular patient page with a patient and
empty, its accordions, CVDMonitoringList and its record dialog, /inspection and its dialog, the
report list (first and last tab), indicators, registration.

Done (branch `ui/phase-8-cardiovascular`):
- **Indicators** (`CVDIndicartors` + `CustomReport/Report1..15`) — fifteen Creative Tim cards with a
  rose icon header, a bare `h6` that `_misc.scss` uppercased, and justified 12px text (the gaps
  between words) are brand panels with a sentence-case title; the page is a `UniCard` with the range
  inside it instead of a range floating on the canvas.
- **Risk column** (`RiskView`, /inspection and the patient page's examination table) — white text on
  the band colour filled the cell; on the 5–10% yellow that was unreadable. It is the shared
  `StatusChip` pill; the band's exact colour stays in the dot (`colors.risk`, new, holding the
  existing hues) and `StatusChip` gains a `Dot` override for scales with more steps than tones.
- **Patient page** (`CVDPatientInfo`) — the right column's Creative Tim Card (a blank band above
  "Анализ") is a `UniCard`; `BaseAccordion` (only used here) is a brand panel: hairline, radius,
  label-tint summary, `h5` title. "Hospital", "Address", "Family phone number", "Temporary address"
  were English; the "CVD Monitoring" card title was never translated.
- **CVDMonitoringList** — "Хугацаа төлөв" / "Төлөв" toolbar fields widened; "-- Сонгох --" sat under
  the caret (also on the untouched build).
- **CVD select copies** (`Forms/SimpleSelect`, `Tables/Components/SimpleSelect`,
  `Forms/YearSingleSelect`) — the same dropdown as the shared SimpleSelect (no #999 hover fill).
- **Registration** (`CVDDrugForm`) — year and month were md=1 columns; "2026" ran into "Сар:".
- Print: the three jsPDF/html2canvas paths capture their own elements (`#tabler`, a built HTML
  string), not the accordion or card around them — unchanged.
- Locale: 4 keys.

Left for later / noted:
- The record dialogs' big risk box keeps its fills (green … brown). It uses "khaki" for level 2
  where the grid used `#e6de02` — two yellows for one band; Findings (17).
- The report list (`Report/CVD*Table`) is a bordered paper-style report table; left as a report.
- `Tables/Columns/RiskResult.jsx` has no importers — Phase 11 removal list.

## Phase 9 — what changed, and what it leaves for later phases

Walked at 1440 (two lists also at 390): all 17 settings routes, each list and its first record
(inline detail or popup).

Done (branch `ui/phase-9-settings-admin`):
- **Inline detail pages speak Mongolian.** Their titles and child-tab labels are server config
  strings ("Doctors group department edit", "Dico type edit", "DictSoumDistrict", "OptionTypes") and
  had no Mongolian; the Organization form's "Organization type / level", "Hospital branch",
  "Level 1–3" likewise. 39 admin keys added to both catalogs (en gets readable English where the key
  was a code). Clinical field labels on the Patient config were left alone.
- **One filled button per detail toolbar** (`BaseCrudActions`) — inside a detail page the child
  grid's bar carries the record's Save; "Шинэ" was filled beside it. New is outlined there; on
  a plain list it stays the filled action.
- **Doctor list** (`DoctorCrudActions`) — Export was filled beside New; "Change password" was the
  template's rose. Both outlined neutral; spinner and search-field greys on tokens.
- **Apps detail** — its Cancel sat off the left edge of the card: `BaseDialogActions` (a full-width
  dialog footer) was dropped into an inline row. Two rank buttons now.
- **Action history** (`UserActionHistoryAdmin`) — the Creative Tim Card with the floating "Логууд"
  pill is a `UniCard`.
- **/optionType** — the upper detail's option grid had no height (header and footer, no rows) because
  the page stacks two managers; the inline detail keeps 320px for its grid and scrolls
  (`BaseDetailView`). Same on the untouched build.
- **/report** — "All" in the location selects translated; spinner `#ff4747` → `cyanInk`.

Left for later / noted:
- `/Users` still opens `UsersDetail` floating over an empty inline card — finding 12.
- Organization's form (`newComponents/BaseRadioBox`) draws radio labels in a pale grey that reads as
  disabled; the newComponents generation is not yet walked — Phase 11.
- The chat button covers the grid footer's "Хуудас руу очих" box on every list at 1440 — Findings (18).

## Phase 10 — what changed, and what it leaves for later phases

Walked as the patient session at 390 first, then 1440: home, profile, monitoring journal, questions,
advice, the four cardiovascular tabs, remote visit, rehab, not-found.

Done (branch `ui/phase-10-patient-portal`):
- **The portal is Mongolian in every browser** (`src/i18n.js`). Language detection read the browser
  (`navigator`) and `index.html`'s `lang="en"`, so an en-US phone got a half-English portal: every key
  with an English translation ("Hello", "Save", "Date", "My profile") switched, every Mongolian-only
  key did not. The staff side hid it because AuthNavbar forces Mongolian on mount; the patient login
  and portal have no language switch. Detection now reads only a saved choice (localStorage /
  cookie) and otherwise falls back to Mongolian. The staff top-bar language toggle still saves and
  applies as before (the sign-in page still resets it to Mongolian, unchanged).
- **Миний үзлэг** (`PatientPlatform/CardioVascular/MonitoringInfo`) — three floating uppercase pills
  (cyan, hot pink `#FF007F`, forest green) over grey rules are `GroupPanel` sections; the status
  spans (white on `#2bb559` / `#ff5757` / `#ffcc00`) are `StatusChip`s; the risk legend keeps each
  swatch with its band on one line (the labels broke under their swatches on a phone) and uses
  `colors.risk`, the same hues as the doctor-side column; the score box has a hairline, radius and
  ink text on the light bands.
- **Зөвлөгөө** (`OwnVisit/PatientAdvice`) — the risk calculator is a brand panel with a filled
  "Эрсдэлээ тооцоолох" (the tab's one action); the "Advice" heading is no longer a bare `h5` over a
  black rule. Its Print builds the PDF from text with jsPDF, not from the page — unchanged.
- **Миний бүртгэл** (`PatientProfile`) — the avatar placeholder was 75% of its column: a 270px grey
  disc on a phone. A 96px brand placeholder.

Checked, nothing to change: home tiles, monitoring journal form and chart card, question thread,
remote visit (Phase 4 drop zone), rehab, not-found, the patient top bar (Phase 5).

Left for later / noted:
- The "Өвчний түүх" tab spins indefinitely for this patient (also on the untouched build) —
  Findings (19).
- The level-2 risk hue is now `#e6de02` in the portal legend too (was CSS `yellow`) — the scale
  question stays finding 17.

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

## Phase 11 — lock-in

Decision 2026-09-15: **nothing is deleted.** The dead files found in the audit stay; they are listed
as dead in `CLAUDE.md` §6 so nobody edits them expecting an effect.

Done (branch `ui/phase-11-lockin`):
- **Template palette repointed** (`assets/jss/material-dashboard-pro-react.js`): `warningColor`,
  `dangerColor`, `successColor`, `infoColor` and `roseColor` resolve to status and brand tokens,
  index for index (`[0]` is the AA ink and stays a hex, the only index `hexToRgb` reads; `[5]+` are the
  tints). It reaches the Creative Tim Card/Badge/Typography/Snackbar/Pagination/Checkbox JSS still in use.
  None of the html2canvas print reports import any of those components (checked).
- **Zero count:** no live `#9c27b0` / `#e91e63` family literal remains (the last three were the focus
  underline in `baseControlsStyles` and a back button in `VisitDetail`); what is left is comments and
  one unused token. `adminNavbarLinksStyle` is imported only by top-bar parts restyled in Phase 5;
  `sweetAlertStyle` by nothing.
- **Red menu buttons:** "Vascular disease" and the National registry menu in the PatientInfo action
  bar passed `color="rose"`, which the rank map treats as destructive; neutral now.
- **Organization form radios** (`newComponents/BaseControls/BaseRadioBox`) — option labels computed to
  `#aaa` (2.3:1, read as disabled); ink now (measured).
- **Finding 18, chat button** — without moving the shell button: the grid footer keeps an 88px right
  corner from md up, so "Хуудас руу очих" is no longer under it; /Apps' footer likewise.
- `CLAUDE.md` §6 rewritten as the rulebook the program settled.
- After-screenshots of every route at 1440/768/390 against the Phase 0 set:
  `C:\Ajil\mn_cardio_v2\docs\ui-final-2026-09-15\index.html` (local only — real patient data).

Still open (decisions, not built): findings 1–13, 15–17, 19.

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
14. ~~**/admin/PaceMaker crashes at tablet and phone width.**~~ Fixed in Phase 6 — it crashed at
    every width (`t is not a function` in `EPSAblationTables`, a CSS class name wrapped in `t()`).
    The "About hospitalized" tab still hardcodes `DataId 1008` (finding 8).

**Wording**
15. The ticket editor labels the ticket text "Бие" — the catalog's Mongolian for `Body` is the
    anatomical body. The key is shared, so changing it needs a check of every `t("Body")` first.
16. Registry detail views show dates with the SQL time part — "2026-05-25 00:00:00.000" (Valve
    diseases, Katetr). Formatting them is a display change in each detail view.
17. The CVD 10-year risk level 2 (5–10%) is "khaki" in the record dialogs and `#e6de02` in the
    grids. Which yellow the scale uses is a clinical-presentation choice; `colors.risk` holds the
    grid's hues for now.
18. The floating chat button sits over the bottom-right of every list page, covering the grid
    footer's "go to page" input (and on /Apps half of Save). Moving it, or reserving footer space,
    changes the shell for every screen — a call for Phase 11.
    **Phase 11:** grid footers (md+) and the /Apps footer now keep that corner free; the button itself
    did not move. Other bottom-right controls on custom pages may still sit under it.

**Stuck state**
19. **/patient/PatientCVD → "Өвчний түүх"** shows a spinner that never resolves for the test patient
    (at least 6s, same on the untouched build). Not investigated — it is the history form's data
    load, not styling.
