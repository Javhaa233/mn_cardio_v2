# Controller Structure

The Express controllers are now grouped by clinical or operational domain inside `controllers/`. Each folder name mirrors the top-level menu item / medical workflow so related assets live together.

| Folder                      | Focus                                                  | Controllers                                                                                                                                                                                                                        |
| --------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `controllers/system`        | Platform-level schedulers, base CRUD layers, utilities | `AppController`, `BaseController`, `CustomDataApiController`, `MediaController`, `MediaTicketController`, `TestController`                                                                                      |
| `controllers/auth`          | Identity and access flows for staff and patients       | `UserController`, `UserRequestController`, `PatientUserController`                                                                                                                                                                 |
| `controllers/organization`  | Staffing, org structure, dashboards, collaboration     | `AdviceController`, `DashboardController`, `DoctorProfileController`, `DoctorsTeamController`, `OrganizationController`                                                                                                            |
| `controllers/patient-care`  | Core inpatient/outpatient workflows                    | `VisitController`, `StayController`, `FollowUpController`, `OrderHospitalizationController`, `OutPatientInfoController`, `PatientController`, `PatientMonitoringController`, `PatientTransferController`, `PatientSendPageController`, `RehabContentController`, `RemoteVisitController`, `TenderFormController` |
| `controllers/heart-failure` | Heart failure care-path specific logic                 | `HfAmbulanceController`, `HfHospitalizationController`, `HfStayController`                                                                                                                                                         |
| `controllers/cvd`           | Cardiovascular-disease registry + analytics            | `CVDMonitoringController`, `CVDMonitoringPatientController`, `CVDAnalysisController`, `CVDDrugController`, `CVDHunAmController`, `CVDReportController`, `RiskScoresController`                                                     |
| `controllers/devices`       | Device & implant management                            | `PacemakerOneController`, `PacemakerTwoController`, `PacemakerThreeController`, `PaceMakerRhythmController`, `ICDRhythmController`                                                                                                 |
| `controllers/rhythm`        | Rhythm diagnostics independent of device type          | `AtrialRhythmController`, `AtrialRhythmNewController`, `CardiacRhythmController`, `MonitoringRhythmController`                                                                                                                     |
| `controllers/diagnostics`   | Imaging / procedure booking                            | `CathLabController`, `EchoController`, `LaboratoryTestController`, `SurgeryPlansController`                                                                                                                                                                    |
| `controllers/vascular`      | Structural / vascular disease programs                 | `VascularDiseaseController`, `ValveDiseasesController`, `ValveDiseasesEndoController`, `CongenitalMalformationsController`                                                                                                         |
| `controllers/reporting`     | Generalized reporting endpoints                        | `ReportController`                                                                                                                                                                                                                 |
| `controllers/communication` | Real-time collaboration                                | `ChatController`, `NotificationController`                                                                                                                                                                                         |
| `controllers/integrations`  | External agency & government integrations              | `EMDServiceController`, `XypServiceController`                                                                                                                                                                                     |

> **Kept current on 2026-09-16.** This table had drifted: it listed
> `BaseControllerNew`, `BaseCustomController` and `ExportExcelOld`, all three of
> which were unmounted and have since been deleted, and it omitted
> `MediaController`, `MediaTicketController`, `OutPatientInfoController` and
> `LaboratoryTestController`. The two Media ones matter most - they are the
> delivery path for chat voice notes and the rehabilitation videos.
>
> `backend/docs/API-WEB.md` is generated (`node scripts/generate_api_reference.js`)
> and will not drift the same way. This file is hand-maintained, so step 4 below
> is the only thing keeping it honest.

## How to add a new controller

1. Pick the domain folder that matches the menu feature (or add a new folder under `controllers/` if the feature is net-new).
2. Place the controller file inside that folder and update `server.js` so the Express route points to the new path.
3. When moving an existing controller into a deeper folder, update any `require("../...")` paths inside the file to account for the additional directory depth (most need `../../` now).
4. Document the addition (folder purpose + controller) in this file to keep the structure searchable.

## `TenderFormController` — one controller for all of the tender's phase-4 forms

Nothing in it is form-specific. It serves every form registered in `TenderForm`
from the `TenderFormField` dictionary, so adding or changing a field is a database
row rather than a code change. Routes: `GetConfig`, `GetData`, `GetPrevious`,
`GetList`, `CustomSave`, `Confirm`. `GetConfig` returns the same envelope as
`/BaseObject/getData`, which is what lets the generic client-side form render it.

List, search, sort and Excel export do **not** go through this controller: they go
through `/BaseObject` against the generated per-form views (`vwForm_1_1`, …),
rebuilt by `node scripts/generate_form_views.js` after any dictionary change.

## `ChatController` — every chat read and write, with no generic CRUD surface

Chat has **no ModelConfig**. `ChatMessagesConfig`, `ChatRoomsConfig` and
`ChatRoomTooUsersConfig` were deleted and `ChatMessages` was unregistered from
`ModelConfigs/mainConfig.js`, because while it was registered
`POST /api/BaseObject/` with `ObjectName: 'ChatMessages'` read every message in
the database for any authenticated user. Do not re-register them: every chat read
and write must go through `/Chat/*`, behind a membership check.

Two rules govern the controller:

1. **Identity comes from the token.** `helper/ChatIdentity.Me` turns
   `req.LogedUser` into a `{UserType, UserId}` pair. No route accepts a caller
   identifier. `UserType` is `'S'` (staff, `Users.Id`) or `'P'` (patient,
   `Patient.id_data`) — without it, staff #5 and patient #5 are the same row,
   because both tables are IDENTITY columns starting at 1 (`helper/Auth.js:8-10`).
2. **Every room-addressed route calls `AssertMembership` first.** There is no
   admin bypass — `RoleId 1` is not a participant.

| Route | Guard |
|---|---|
| `GetChatRoomList`, `GetUnreadCount` | `ChatIdentity.Me` |
| `GetMessages`, `SendMessage`, `MarkRead`, `GetChatRoomUsers` | `AssertMembership` |
| `CommitMessage`, `DownloadAttachment` | `AssertMembership`, resolved via the message |
| `AddChatRoom` / `StartChat`, `CheckChatRoom` | `Me` + `CanReach` |
| `CreateGroupRoom`, `AddUserToChatRoom`, `RemoveUserFromChatRoom` | membership + creator; refused for `RoleId 4` |
| `SearchUsers` | `Me`; nationwide for staff, `CHAT_PATIENT_DIRECTORY` for patients |

`GetMessages` does **not** take an `ObjectName` and does not call `BaseGetList` —
it builds its own server-authored `where`, so the client cannot influence which
table is read or what the predicate says.

**Real-time is fan-out only.** `POST /Chat/SendMessage` is the authoritative write
path; `WebSockets/ChatSocket.js` never persists anything. It authenticates the
handshake with the same JWT (`helper/SocketAuth.js`) and emits committed rows to
each member's personal room. Both sockets previously trusted a client-emitted
`setUser({UserId})`, which is gone.

**Attachments** reuse the `File` table with `LinkedObjectName = 'ChatMessages'` —
no new table. A message with files is created `Status='P'` and is invisible to
everyone but its author until `CommitMessage` promotes it, so a recipient never
sees an empty bubble before the image. Download goes through
`/Chat/DownloadAttachment`, not `/BaseObject/downloadFile`, which has no ownership
check.

Schema: `scripts/add_chat_v2_columns.sql`.
