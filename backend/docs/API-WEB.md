# МнКардио — вэб системийн API лавлах

> Тендерийн ажлын жагсаалтын №142 «Сервисийн баримт бичиг (API doc)». Энэ файлыг
> `scripts/generate_api_reference.js` эх кодоос автоматаар үүсгэдэг. Гараар бүү засаарай —
> код өөрчлөгдвөл backend хавтсанд `node scripts/generate_api_reference.js`-г дахин ажиллуулна.

## 1. Ерөнхий мэдээлэл

Энэхүү баримт бичиг нь МнКардио вэб системийн сервер талын (Node.js + Express) бүх HTTP
endpoint-ийг жагсаана: зам, HTTP арга, хандах эрх, хариуцах controller файл. Жагсаалтыг
`server.js` дахь маршрутын хүснэгт болон controller файлуудаас шууд уншиж гаргадаг тул кодтой
зөрөхгүй.

- **Үндсэн зам (base URL):** `/api`. Локал орчинд `http://localhost:5001/api` (порт нь `PORT`
  орчны хувьсагч, анхдагч 5001); ажлын орчинд frontend-ийн домэйн дээрх reverse proxy-оор
  дамжина. Серверийн ажиллагааг `GET /health`-ээр шалгана.
- **Нэвтрэлт:** JWT bearer токен, `Authorization: Bearer <token>` толгойгоор. Токеныг
  `POST /api/User/Login` (эмч, ажилтан; биед `UserName`, `Password`) олгож, хариуны
  `Data.token`-д буцаана; иргэн `POST /api/PatientUser/Login`-ээр нэвтэрнэ. Токен **10 цаг**
  (36 000 секунд) хүчинтэй.
- **Legacy хариуны бүтэц:** `{ Success, Message, Data }`, жагсаалтад нэмэлт `Option`
  (хуудаслалт). **Алдааг HTTP 200 статустайгаар** `Success: false` гэж буцаана. Токен байхгүй
  эсвэл хүчингүй бол `{ Success: false, Message, AuthError: true }` мөн HTTP 200. Клиент статус
  кодыг биш, `Success` талбарыг шалгах ёстой. Цөөн файл татах endpoint (жишээ нь
  `/api/BaseObject/downloadFile`) жинхэнэ 4xx/5xx статус буцаадаг.
- **Шинэ давхарга `/api/base`, `/api/report`:** жижиг үсгийн `{ success, message, data }`
  бүтэц, бодит HTTP арга (GET / POST / PUT / DELETE).
- **HTTP арга:** legacy давхаргын бараг бүх маршрут **`POST`** — унших үйлдэл ч гэсэн;
  параметрийг JSON биед (body) дамжуулна. POST биш legacy маршрут ердөө 1: `GET /api/Organization/GetOne/:id`.
- **Иргэний токен (`RoleId 4`):** хамгаалагдсан угтваруудаас зөвхөн `/api/BaseObject`, `/api/PatientMonitoring`, `/api/RemoteVisit`, `/api/CVDMonitoringPatient`, `/api/Notification`, `/api/RiskScores`, `/api/Chat`-аар нэвтэрнэ. Бусад дээр `{ Success: false, Message: 'Хандах эрхгүй байна' }` буцна.

## 2. Тоон үзүүлэлт

| Бүлэг | Тайлбар | Угтвар | Endpoint |
|---|---|---|---|
| public | Legacy нийтийн угтвар (`routeGroups.public`) — mount түвшинд токенгүй | 5 | 25 |
| — үүнээс маршрут түвшинд токентой | `Auth.verifyToken`-г маршрут дээрээ шаарддаг |  | 13 |
| protected | Legacy хамгаалагдсан угтвар (`routeGroups.protected`) — `Auth.verifyToken` | 49 | 258 |
| — үүнээс patient-allowed | Иргэний токенд мөн нээлттэй (`PATIENT_ALLOWED_PREFIXES`) | 7 | 42 |
| api-layer | `/api/patient`, `/api/doctor`, `/api/auth`, `/api/base`, `/api/report` | 5 | 102 |
| system | `GET /`, `GET /health` |  | 2 |
| **Нийт** |  |  | **387** |

api-layer задаргаа: `/api/patient` 39 · `/api/doctor` 42 · `/api/auth` 5 · `/api/base` 6 · `/api/report` 1.

## 3. Хандах эрхийн тэмдэглэгээ

| Тэмдэглэгээ | Утга |
|---|---|
| `public` | Токен шаардахгүй. |
| `token (route-level)` | Нийтийн угтвар доторх маршрут боловч маршрут дээрээ `verifyToken` шаарддаг. Иргэний угтварын хязгаарлалт үйлчлэхгүй. |
| `token` | Хүчинтэй токен шаардана; иргэний (`RoleId 4`) токеныг угтвар түвшинд татгалзана. |
| `token + patient allowed` | Хүчинтэй токен шаардана; иргэний токенд мөн нээлттэй — мөр бүрийн хамрах хүрээг controller дотор шалгана. |
| `+ <middleware>` | Маршрут дээрх нэмэлт middleware (жишээ нь `RequireAdmin` — зөвхөн админ). |
| `token (RoleId 4 only)` / `token (staff only)` | Гар утасны гадаргуу: токеныг маршрут бүр дээр шалгаж, 401/403 бодит статус буцаана. |
| `self-authenticating` | `/api/auth/*` — refresh эсвэл access токеноо өөрөө шалгана. |
| `public (no token)` | Токен шалгалтгүйгээр холбогдсон (§9-ийг үз). |

## 4. Legacy controller-ууд — домэйн тус бүрээр

Controller файл бүр нь Express Router бөгөөд `server.js`-д `/api/<Угтвар>` дээр холбогдоно.
«Зорилго» баганыг кодын тайлбараас (маршрутын мөрийн дээрх эсвэл handler функцийн дээрх
comment-ын эхний өгүүлбэр) авсан; тайлбаргүй маршрутад хоосон үлдээсэн.

### 4.1. Систем ба ерөнхий CRUD — `controllers/system/`

Угтвар: `/api/Test`, `/api/BaseObject`, `/api/CustomDataApi` · 16 endpoint.

| Method | Path | Access | Controller файл | Зорилго (кодын тайлбараас) |
|---|---|---|---|---|
| `POST` | `/api/Test/CheckRegisterRegex` | public | `TestController.js:46` |  |
| `POST` | `/api/Test/RegexTest` | public | `TestController.js:47` |  |
| `POST` | `/api/BaseObject/getData` | token + patient allowed | `BaseController.js:38` |  |
| `POST` | `/api/BaseObject/` | token + patient allowed | `BaseController.js:39` |  |
| `POST` | `/api/BaseObject/getListInfo` | token + patient allowed | `BaseController.js:40` |  |
| `POST` | `/api/BaseObject/getDetail` | token + patient allowed | `BaseController.js:41` |  |
| `POST` | `/api/BaseObject/getDetailInfo` | token + patient allowed | `BaseController.js:42` |  |
| `POST` | `/api/BaseObject/create` | token + patient allowed | `BaseController.js:43` |  |
| `POST` | `/api/BaseObject/update` | token + patient allowed | `BaseController.js:44` |  |
| `POST` | `/api/BaseObject/destroy` | token + patient allowed | `BaseController.js:45` |  |
| `POST` | `/api/BaseObject/uploadFile` | token + patient allowed | `BaseController.js:46` |  |
| `POST` | `/api/BaseObject/downloadFile` | token + patient allowed | `BaseController.js:47` |  |
| `POST` | `/api/BaseObject/deleteFile` | token + patient allowed | `BaseController.js:48` |  |
| `POST` | `/api/BaseObject/ExportExcel` | token + patient allowed | `BaseController.js:49` |  |
| `POST` | `/api/BaseObject/ExportText` | token + patient allowed | `BaseController.js:50` | The same export as tab-separated text. |
| `POST` | `/api/CustomDataApi/GetJournalRefData` | token | `CustomDataApiController.js:9` |  |

### 4.2. Нэвтрэлт, хэрэглэгчийн бүртгэл — `controllers/auth/`

Угтвар: `/api/User`, `/api/UserRequest`, `/api/PatientUser` · 22 endpoint.

| Method | Path | Access | Controller файл | Зорилго (кодын тайлбараас) |
|---|---|---|---|---|
| `POST` | `/api/User/Login` | public | `UserController.js:20` |  |
| `POST` | `/api/User/LogOut` | token (route-level) | `UserController.js:21` | Logout that actually logs out. |
| `POST` | `/api/User/CheckLogin` | token (route-level) | `UserController.js:22` |  |
| `POST` | `/api/User/Save` | token (route-level) | `UserController.js:23` |  |
| `POST` | `/api/User/ForgetPassword` | public | `UserController.js:24` |  |
| `POST` | `/api/User/ResetPassword` | public | `UserController.js:25` | Martsan password sergeeh |
| `POST` | `/api/User/ChangePassword` | token (route-level) | `UserController.js:26` | Password shinechleh |
| `POST` | `/api/User/getUserData` | token (route-level) | `UserController.js:27` |  |
| `POST` | `/api/User/GetMyContact` | token (route-level) | `UserController.js:28` |  |
| `POST` | `/api/User/UpdateMyContact` | token (route-level) | `UserController.js:29` | Writes ONLY the caller's own account - the target is req.LogedUser, never the body. |
| `POST` | `/api/UserRequest/CheckUserName` | public | `UserRequestController.js:45` |  |
| `POST` | `/api/UserRequest/GetProvinceData` | public | `UserRequestController.js:46` |  |
| `POST` | `/api/UserRequest/Register` | public | `UserRequestController.js:47` |  |
| `POST` | `/api/UserRequest/Confirm` | token (route-level) | `UserRequestController.js:48` |  |
| `POST` | `/api/UserRequest/Decline` | token (route-level) | `UserRequestController.js:49` |  |
| `POST` | `/api/PatientUser/Login` | public | `PatientUserController.js:17` |  |
| `POST` | `/api/PatientUser/LogOut` | token (route-level) | `PatientUserController.js:18` |  |
| `POST` | `/api/PatientUser/CheckLogin` | token (route-level) | `PatientUserController.js:19` |  |
| `POST` | `/api/PatientUser/Save` | token (route-level) | `PatientUserController.js:20` |  |
| `POST` | `/api/PatientUser/ForgotPassword` | public | `PatientUserController.js:21` | TRANSITIONAL - patients will move to DAN (national digital identity) with no password at all; see… |
| `POST` | `/api/PatientUser/ResetPassword` | public | `PatientUserController.js:22` |  |
| `POST` | `/api/PatientUser/ChangePassword` | token (route-level) | `PatientUserController.js:23` |  |

### 4.3. Байгууллага, эмч, баг, зөвлөгөө (асуумж), хяналтын самбар — `controllers/organization/`

Угтвар: `/api/DoctorsTeam`, `/api/Advice`, `/api/DoctorProfile`, `/api/Organization`, `/api/Dashboard` · 41 endpoint.

| Method | Path | Access | Controller файл | Зорилго (кодын тайлбараас) |
|---|---|---|---|---|
| `POST` | `/api/DoctorsTeam/GetCustomFormData` | token | `DoctorsTeamController.js:13` |  |
| `POST` | `/api/DoctorsTeam/GetDoctorsTeams` | token | `DoctorsTeamController.js:14` |  |
| `POST` | `/api/DoctorsTeam/CreateDoctorsTeam` | token | `DoctorsTeamController.js:15` |  |
| `POST` | `/api/DoctorsTeam/RemoveDoctor` | token | `DoctorsTeamController.js:16` |  |
| `POST` | `/api/DoctorsTeam/SavePatient` | token | `DoctorsTeamController.js:17` |  |
| `POST` | `/api/DoctorsTeam/RemovePatient` | token | `DoctorsTeamController.js:18` |  |
| `POST` | `/api/DoctorsTeam/SaveDoctor` | token | `DoctorsTeamController.js:19` |  |
| `POST` | `/api/DoctorsTeam/GetDoctorsTeamsWithoutPatient` | token | `DoctorsTeamController.js:20` |  |
| `POST` | `/api/DoctorsTeam/CheckSurgeryBeforeCheck` | token | `DoctorsTeamController.js:21` |  |
| `POST` | `/api/DoctorsTeam/GetList` | token | `DoctorsTeamController.js:22` |  |
| `POST` | `/api/DoctorsTeam/ExportDoctorsTeamPatient` | token | `DoctorsTeamController.js:23` |  |
| `POST` | `/api/DoctorsTeam/DeleteDoctorsTeam` | token | `DoctorsTeamController.js:24` |  |
| `POST` | `/api/Advice/GetList` | token | `AdviceController.js:18` |  |
| `POST` | `/api/Advice/GetListCity` | token | `AdviceController.js:19` |  |
| `POST` | `/api/Advice/GetListSoum` | token | `AdviceController.js:20` |  |
| `POST` | `/api/Advice/GetComments` | token | `AdviceController.js:21` |  |
| `POST` | `/api/Advice/CustomSave` | token | `AdviceController.js:22` |  |
| `POST` | `/api/Advice/CheckByPatient` | token | `AdviceController.js:23` |  |
| `POST` | `/api/Advice/SaveAdviceCommentRate` | token | `AdviceController.js:24` |  |
| `POST` | `/api/Advice/GetAdviceCommentPoint` | token | `AdviceController.js:25` |  |
| `POST` | `/api/Advice/CreateComment` | token | `AdviceController.js:26` |  |
| `POST` | `/api/Advice/GetFeed` | token | `AdviceController.js:27` |  |
| `POST` | `/api/Advice/GetTicket` | token | `AdviceController.js:28` | One ticket, enriched exactly the way a feed card is. |
| `POST` | `/api/Advice/GetStats` | token | `AdviceController.js:29` |  |
| `POST` | `/api/Advice/CustomSaveAndPublish` | token | `AdviceController.js:30` | Create a ticket and publish it in one action. |
| `POST` | `/api/Advice/GetAttachmentLink` | token | `AdviceController.js:31` | A short-lived URL a browser <audio> can actually fetch. |
| `POST` | `/api/DoctorProfile/GetByUserId` | token | `DoctorProfileController.js:14` |  |
| `POST` | `/api/DoctorProfile/GetCustomFormData` | token | `DoctorProfileController.js:15` |  |
| `POST` | `/api/DoctorProfile/GetDoctorsProfileInfo` | token | `DoctorProfileController.js:16` |  |
| `POST` | `/api/DoctorProfile/CustomCreate` | token | `DoctorProfileController.js:17` |  |
| `POST` | `/api/DoctorProfile/CustomUpdate` | token | `DoctorProfileController.js:18` |  |
| `POST` | `/api/DoctorProfile/ChangePassword` | token | `DoctorProfileController.js:19` | Password shinechleh |
| `POST` | `/api/DoctorProfile/SetLicense` | token | `DoctorProfileController.js:23` | Practice licence codes (tracker 13). |
| `POST` | `/api/DoctorProfile/GetLicenseStatus` | token | `DoctorProfileController.js:24` | Who has a code and who does not. |
| `POST` | `/api/DoctorProfile/ClearLicense` | token | `DoctorProfileController.js:25` | Remove a code - a licence withdrawn or entered in error. |
| `POST` | `/api/Organization/CustomSave` | token | `OrganizationController.js:10` |  |
| `GET` | `/api/Organization/GetOne/:id` | token | `OrganizationController.js:11` |  |
| `POST` | `/api/Organization/MergePreview` | token | `OrganizationController.js:12` |  |
| `POST` | `/api/Organization/Merge` | token | `OrganizationController.js:13` |  |
| `POST` | `/api/Dashboard/GetCreateAllVisits` | token | `DashboardController.js:9` |  |
| `POST` | `/api/Dashboard/GetCreatePatients` | token | `DashboardController.js:10` |  |

### 4.4. Өвчтөний тусламж үйлчилгээ — `controllers/patient-care/`

Угтвар: `/api/Visit`, `/api/Stay`, `/api/FollowUp`, `/api/PatientMonitoring`, `/api/OrderHospitalization`, `/api/Patient`, `/api/RemoteVisit`, `/api/TenderForm`, `/api/PatientTransfer`, `/api/PatientSendPage`, `/api/OutPatientInfo` · 42 endpoint.

| Method | Path | Access | Controller файл | Зорилго (кодын тайлбараас) |
|---|---|---|---|---|
| `POST` | `/api/Visit/GetCustomFormData` | token | `VisitController.js:20` |  |
| `POST` | `/api/Visit/CustomSave` | token | `VisitController.js:21` |  |
| `POST` | `/api/Visit/GetVisitsByPatient` | token | `VisitController.js:22` |  |
| `POST` | `/api/Visit/GetLastVisitId` | token | `VisitController.js:23` | The patient's most recent visit id. |
| `POST` | `/api/Visit/PrintReport` | token | `VisitController.js:24` |  |
| `POST` | `/api/Visit/PrintAmbulatori` | token | `VisitController.js:25` |  |
| `POST` | `/api/Visit/PrintAmbulatoriHTML` | token | `VisitController.js:26` |  |
| `POST` | `/api/Stay/GetDepartments` | token | `StayController.js:10` |  |
| `POST` | `/api/Stay/CustomSave` | token | `StayController.js:11` |  |
| `POST` | `/api/Stay/LeavePatient` | token | `StayController.js:12` |  |
| `POST` | `/api/FollowUp/CustomSave` | token | `FollowUpController.js:7` |  |
| `POST` | `/api/PatientMonitoring/SavePatient` | token + patient allowed | `PatientMonitoringController.js:11` |  |
| `POST` | `/api/PatientMonitoring/RemovePatient` | token + patient allowed | `PatientMonitoringController.js:12` |  |
| `POST` | `/api/PatientMonitoring/CheckPatientMonitoring` | token + patient allowed | `PatientMonitoringController.js:13` | Is this patient NOT yet on the caller's list? |
| `POST` | `/api/PatientMonitoring/GetList` | token + patient allowed | `PatientMonitoringController.js:14` |  |
| `POST` | `/api/PatientMonitoring/getPressureChartData` | token + patient allowed | `PatientMonitoringController.js:15` |  |
| `POST` | `/api/OrderHospitalization/GetCustomFormData` | token | `OrderHospitalizationController.js:10` |  |
| `POST` | `/api/OrderHospitalization/CustomSave` | token | `OrderHospitalizationController.js:11` |  |
| `POST` | `/api/OrderHospitalization/CheckPatient` | token | `OrderHospitalizationController.js:12` |  |
| `POST` | `/api/OrderHospitalization/CancelPatient` | token | `OrderHospitalizationController.js:13` |  |
| `POST` | `/api/Patient/SearchPatient` | token | `PatientController.js:9` |  |
| `POST` | `/api/Patient/CheckPatient` | token | `PatientController.js:10` |  |
| `POST` | `/api/Patient/FindPatient` | token | `PatientController.js:11` |  |
| `POST` | `/api/RemoteVisit/GetList` | token + patient allowed | `RemoteVisitController.js:10` |  |
| `POST` | `/api/TenderForm/GetConfig` | token | `TenderFormController.js:22` |  |
| `POST` | `/api/TenderForm/GetData` | token | `TenderFormController.js:23` | Latest instance for a patient, or a specific one by Id. |
| `POST` | `/api/TenderForm/GetList` | token | `TenderFormController.js:24` | All instances of a form for one patient, newest first. |
| `POST` | `/api/TenderForm/GetPrevious` | token | `TenderFormController.js:25` | The patient's previous instance of this form, returned as answers ONLY - no Id, no dates, no… |
| `POST` | `/api/TenderForm/CustomSave` | token | `TenderFormController.js:26` | Create or update one instance. |
| `POST` | `/api/TenderForm/Confirm` | token | `TenderFormController.js:27` | Complete and lock - tender appendix 3.1, "COMPLETE AND SAVE?" (L8599-8605). |
| `POST` | `/api/TenderForm/Delete` | token | `TenderFormController.js:28` | Soft delete: rec_status = 2, the house convention. |
| `POST` | `/api/TenderForm/PrintHtml` | token | `TenderFormController.js:29` | The sheet as HTML, for the on-screen preview. |
| `POST` | `/api/TenderForm/PrintReport` | token | `TenderFormController.js:30` | The same sheet as an A4 PDF. |
| `POST` | `/api/PatientTransfer/GetCustomFormData` | token | `PatientTransferController.js:10` |  |
| `POST` | `/api/PatientTransfer/CustomSave` | token | `PatientTransferController.js:11` |  |
| `POST` | `/api/PatientSendPage/GetCustomFormData` | token | `PatientSendPageController.js:10` |  |
| `POST` | `/api/PatientSendPage/CustomSave` | token | `PatientSendPageController.js:11` |  |
| `POST` | `/api/OutPatientInfo/PrintReport` | token | `OutPatientInfoController.js:18` |  |
| `POST` | `/api/OutPatientInfo/PrintByStayId` | token | `OutPatientInfoController.js:19` |  |
| `POST` | `/api/OutPatientInfo/GetLastOutPatientInfoId` | token | `OutPatientInfoController.js:20` |  |
| `POST` | `/api/OutPatientInfo/GetPatientPlainPassword` | token | `OutPatientInfoController.js:21` | Issues a fresh login credential for a patient so the discharge report can hand it to them on paper. |
| `POST` | `/api/OutPatientInfo/UpdateStayDates` | token | `OutPatientInfoController.js:22` | Persists the doctor's edited admission/discharge dates from the printable report back onto the… |

### 4.5. Чат ба мэдэгдэл — `controllers/communication/`

Угтвар: `/api/Chat`, `/api/Notification` · 18 endpoint.

| Method | Path | Access | Controller файл | Зорилго (кодын тайлбараас) |
|---|---|---|---|---|
| `POST` | `/api/Chat/GetChatRoomList` | token + patient allowed | `ChatController.js:58` |  |
| `POST` | `/api/Chat/GetMessages` | token + patient allowed | `ChatController.js:59` | Room-scoped, membership-checked, and the predicate is written here rather than taken from the… |
| `POST` | `/api/Chat/SendMessage` | token + patient allowed | `ChatController.js:60` | The authoritative write path. |
| `POST` | `/api/Chat/CommitMessage` | token + patient allowed | `ChatController.js:61` | Promote a pending attachment message to sent, and only then fan it out. |
| `POST` | `/api/Chat/MarkRead` | token + patient allowed | `ChatController.js:62` |  |
| `POST` | `/api/Chat/GetUnreadCount` | token + patient allowed | `ChatController.js:63` |  |
| `POST` | `/api/Chat/AddChatRoom` | token + patient allowed | `ChatController.js:64` | Idempotent. |
| `POST` | `/api/Chat/StartChat` | token + patient allowed | `ChatController.js:65` | Idempotent. |
| `POST` | `/api/Chat/CheckChatRoom` | token + patient allowed | `ChatController.js:66` |  |
| `POST` | `/api/Chat/CreateGroupRoom` | token + patient allowed | `ChatController.js:67` | Groups are doctors-only, and must be created as groups. |
| `POST` | `/api/Chat/GetChatRoomUsers` | token + patient allowed | `ChatController.js:68` |  |
| `POST` | `/api/Chat/AddUserToChatRoom` | token + patient allowed | `ChatController.js:69` |  |
| `POST` | `/api/Chat/RemoveUserFromChatRoom` | token + patient allowed | `ChatController.js:70` |  |
| `POST` | `/api/Chat/SearchUsers` | token + patient allowed | `ChatController.js:71` | The people you can start a chat with. |
| `POST` | `/api/Chat/GetDirectoryFilters` | token + patient allowed | `ChatController.js:72` | The organisation (and legacy aimag / soum) lists for the directory's filters. |
| `POST` | `/api/Chat/DownloadAttachment` | token + patient allowed | `ChatController.js:73` |  |
| `POST` | `/api/Chat/GetAttachmentLink` | token + patient allowed | `ChatController.js:74` | A URL a player can actually open. |
| `POST` | `/api/Notification/GetListData` | token + patient allowed | `NotificationController.js:7` |  |

### 4.6. Гадаад интеграц (ХУР, ЭМД) — `controllers/integrations/`

Угтвар: `/api/XypService`, `/api/EMDService` · 3 endpoint.

| Method | Path | Access | Controller файл | Зорилго (кодын тайлбараас) |
|---|---|---|---|---|
| `POST` | `/api/XypService/testCall` | public | `XypServiceController.js:8` |  |
| `POST` | `/api/EMDService/getTablet` | token | `EMDServiceController.js:8` | Buh emiin jagsaalt |
| `POST` | `/api/EMDService/getTabletByDiagnosis` | token | `EMDServiceController.js:9` | Onoshd hamaarah emiin jagsaalt |

### 4.7. Тайлан — `controllers/reporting/`

Угтвар: `/api/Report` · 5 endpoint.

| Method | Path | Access | Controller файл | Зорилго (кодын тайлбараас) |
|---|---|---|---|---|
| `POST` | `/api/Report/GetReport` | token | `ReportController.js:12` |  |
| `POST` | `/api/Report/GetProvinceData` | token | `ReportController.js:13` |  |
| `POST` | `/api/Report/GetDoctorExamReport` | token | `ReportController.js:14` |  |
| `POST` | `/api/Report/DoctorExamReportExcel` | token | `ReportController.js:15` |  |
| `POST` | `/api/Report/DoctorExamReportText` | token | `ReportController.js:16` |  |

### 4.8. Зүрхний дутагдал — `controllers/heart-failure/`

Угтвар: `/api/HfStay`, `/api/HfAmbulance`, `/api/HfHospitalization` · 14 endpoint.

| Method | Path | Access | Controller файл | Зорилго (кодын тайлбараас) |
|---|---|---|---|---|
| `POST` | `/api/HfStay/GetCustomFormData` | token | `HfStayController.js:10` |  |
| `POST` | `/api/HfStay/CustomSave` | token | `HfStayController.js:11` |  |
| `POST` | `/api/HfStay/PrintReport` | token | `HfStayController.js:12` |  |
| `POST` | `/api/HfAmbulance/GetLastData` | token | `HfAmbulanceController.js:12` |  |
| `POST` | `/api/HfAmbulance/CustomSave` | token | `HfAmbulanceController.js:13` |  |
| `POST` | `/api/HfAmbulance/PrintReport` | token | `HfAmbulanceController.js:14` |  |
| `POST` | `/api/HfAmbulance/GetList` | token | `HfAmbulanceController.js:15` |  |
| `POST` | `/api/HfAmbulance/Confirm` | token | `HfAmbulanceController.js:16` |  |
| `POST` | `/api/HfHospitalization/GetCustomFormData` | token | `HfHospitalizationController.js:12` |  |
| `POST` | `/api/HfHospitalization/GetLastData` | token | `HfHospitalizationController.js:13` |  |
| `POST` | `/api/HfHospitalization/CustomSave` | token | `HfHospitalizationController.js:14` |  |
| `POST` | `/api/HfHospitalization/PrintReport` | token | `HfHospitalizationController.js:15` |  |
| `POST` | `/api/HfHospitalization/GetList` | token | `HfHospitalizationController.js:16` |  |
| `POST` | `/api/HfHospitalization/Confirm` | token | `HfHospitalizationController.js:17` |  |

### 4.9. Зүрх судасны өвчний (ЗСӨ) хяналт, шинжилгээ, тайлан — `controllers/cvd/`

Угтвар: `/api/RiskScores`, `/api/CVDMonitoring`, `/api/CVDAnalysis`, `/api/CVDDrug`, `/api/CVDHunAm`, `/api/CVDReport`, `/api/CVDMonitoringPatient` · 53 endpoint.

| Method | Path | Access | Controller файл | Зорилго (кодын тайлбараас) |
|---|---|---|---|---|
| `POST` | `/api/RiskScores/CalculateRisk` | token + patient allowed | `RiskScoresController.js:30` |  |
| `POST` | `/api/RiskScores/CreateFromExcel` | token + patient allowed + `RequireAdmin` | `RiskScoresController.js:31` | RiskScores insert into from Excel |
| `POST` | `/api/CVDMonitoring/CheckPatient` | token | `CVDMonitoringController.js:118` |  |
| `POST` | `/api/CVDMonitoring/CreateMonitoring` | token | `CVDMonitoringController.js:119` |  |
| `POST` | `/api/CVDMonitoring/GetLastHistoryData` | token | `CVDMonitoringController.js:120` | Get CVDHistory Last data |
| `POST` | `/api/CVDMonitoring/GetLastBodySizeData` | token | `CVDMonitoringController.js:121` | Get CVDBodySize Last data |
| `POST` | `/api/CVDMonitoring/GetLastManagementData` | token | `CVDMonitoringController.js:122` | Get Management Data |
| `POST` | `/api/CVDMonitoring/GetLastDiagnosisData` | token | `CVDMonitoringController.js:123` |  |
| `POST` | `/api/CVDMonitoring/GetLastRiskData` | token | `CVDMonitoringController.js:125` | Get CVDBodySize Last data |
| `POST` | `/api/CVDMonitoring/CreateHistory` | token | `CVDMonitoringController.js:126` |  |
| `POST` | `/api/CVDMonitoring/CreateControlAndTransition` | token | `CVDMonitoringController.js:127` | Leave Control |
| `POST` | `/api/CVDMonitoring/GetAnalyzeData` | token | `CVDMonitoringController.js:128` |  |
| `POST` | `/api/CVDMonitoring/CreateSentPrescription` | token | `CVDMonitoringController.js:129` |  |
| `POST` | `/api/CVDMonitoring/CreateManagement` | token | `CVDMonitoringController.js:130` |  |
| `POST` | `/api/CVDMonitoring/CreateDiagnosis` | token | `CVDMonitoringController.js:131` |  |
| `POST` | `/api/CVDMonitoring/CreatePatient` | token | `CVDMonitoringController.js:133` |  |
| `POST` | `/api/CVDMonitoring/UpdatePatient` | token | `CVDMonitoringController.js:134` | Update Patient Info |
| `POST` | `/api/CVDMonitoring/GetPatientInfo` | token | `CVDMonitoringController.js:135` |  |
| `POST` | `/api/CVDMonitoring/GetList` | token | `CVDMonitoringController.js:136` |  |
| `POST` | `/api/CVDMonitoring/FindPatientDataForUpdate` | token | `CVDMonitoringController.js:137` |  |
| `POST` | `/api/CVDMonitoring/TakeControl` | token | `CVDMonitoringController.js:140` |  |
| `POST` | `/api/CVDAnalysis/GetAnalyzeData1` | token | `CVDAnalysisController.js:10` |  |
| `POST` | `/api/CVDAnalysis/GetAnalyzeData2` | token | `CVDAnalysisController.js:11` |  |
| `POST` | `/api/CVDAnalysis/GetAnalyzeData3` | token | `CVDAnalysisController.js:12` |  |
| `POST` | `/api/CVDAnalysis/GetAnalyzeData4` | token | `CVDAnalysisController.js:13` |  |
| `POST` | `/api/CVDAnalysis/GetAnalyzeData5` | token | `CVDAnalysisController.js:14` |  |
| `POST` | `/api/CVDAnalysis/GetAnalyzeData6` | token | `CVDAnalysisController.js:15` |  |
| `POST` | `/api/CVDAnalysis/GetAnalyzeData7` | token | `CVDAnalysisController.js:16` |  |
| `POST` | `/api/CVDAnalysis/GetAnalyzeData8` | token | `CVDAnalysisController.js:17` |  |
| `POST` | `/api/CVDAnalysis/GetAnalyzeData9` | token | `CVDAnalysisController.js:18` |  |
| `POST` | `/api/CVDAnalysis/GetAnalyzeData10` | token | `CVDAnalysisController.js:19` |  |
| `POST` | `/api/CVDAnalysis/GetAnalyzeData11` | token | `CVDAnalysisController.js:20` |  |
| `POST` | `/api/CVDAnalysis/GetAnalyzeData12` | token | `CVDAnalysisController.js:21` |  |
| `POST` | `/api/CVDAnalysis/GetAnalyzeData13` | token | `CVDAnalysisController.js:22` |  |
| `POST` | `/api/CVDAnalysis/GetAnalyzeData14` | token | `CVDAnalysisController.js:23` |  |
| `POST` | `/api/CVDAnalysis/GetAnalyzeData15` | token | `CVDAnalysisController.js:24` |  |
| `POST` | `/api/CVDDrug/GetDrugData` | token | `CVDDrugController.js:9` |  |
| `POST` | `/api/CVDDrug/CreateAndUpdate` | token | `CVDDrugController.js:10` |  |
| `POST` | `/api/CVDHunAm/GetData` | token | `CVDHunAmController.js:9` |  |
| `POST` | `/api/CVDHunAm/CreateAndUpdate` | token | `CVDHunAmController.js:10` |  |
| `POST` | `/api/CVDReport/GetReportData` | token | `CVDReportController.js:13` |  |
| `POST` | `/api/CVDReport/GetInspectionReportData` | token | `CVDReportController.js:14` | Inspection data |
| `POST` | `/api/CVDReport/GetReportUnitData` | token | `CVDReportController.js:16` | Unit Data |
| `POST` | `/api/CVDReport/GetReportSoumData` | token | `CVDReportController.js:17` | Soum Data |
| `POST` | `/api/CVDReport/GetReportMonthData` | token | `CVDReportController.js:18` | Month Data |
| `POST` | `/api/CVDReport/ReportExportExcel` | token | `CVDReportController.js:19` | download excel |
| `POST` | `/api/CVDReport/InspectionExportExcel` | token | `CVDReportController.js:20` | Inspection |
| `POST` | `/api/CVDReport/SoumReportExportExcel` | token | `CVDReportController.js:21` | Soum Data |
| `POST` | `/api/CVDReport/MonthNewsExportExcel` | token | `CVDReportController.js:22` | Month news |
| `POST` | `/api/CVDReport/UnitExportExcel` | token | `CVDReportController.js:23` | Unit data |
| `POST` | `/api/CVDMonitoringPatient/CheckPatient` | token + patient allowed | `CVDMonitoringPatientController.js:13` |  |
| `POST` | `/api/CVDMonitoringPatient/GetLastData` | token + patient allowed | `CVDMonitoringPatientController.js:14` |  |
| `POST` | `/api/CVDMonitoringPatient/CreateAndUpdateMonitoring` | token + patient allowed | `CVDMonitoringPatientController.js:15` |  |

### 4.10. Зүрхний төхөөрөмж (пейсмейкер, ICD) — `controllers/devices/`

Угтвар: `/api/PacemakerOne`, `/api/PacemakerTwo`, `/api/PacemakerThree`, `/api/PaceMakerRhythm`, `/api/ICDRhythm` · 16 endpoint.

| Method | Path | Access | Controller файл | Зорилго (кодын тайлбараас) |
|---|---|---|---|---|
| `POST` | `/api/PacemakerOne/CustomSave` | token | `PacemakerOneController.js:9` |  |
| `POST` | `/api/PacemakerOne/PrintReport` | token | `PacemakerOneController.js:10` |  |
| `POST` | `/api/PacemakerTwo/CustomSave` | token | `PacemakerTwoController.js:10` |  |
| `POST` | `/api/PacemakerTwo/PrintReport` | token | `PacemakerTwoController.js:11` |  |
| `POST` | `/api/PacemakerThree/CustomSave` | token | `PacemakerThreeController.js:10` |  |
| `POST` | `/api/PacemakerThree/PrintReport` | token | `PacemakerThreeController.js:11` |  |
| `POST` | `/api/PaceMakerRhythm/GetLastData` | token | `PaceMakerRhythmController.js:10` |  |
| `POST` | `/api/PaceMakerRhythm/CustomSave` | token | `PaceMakerRhythmController.js:11` |  |
| `POST` | `/api/PaceMakerRhythm/PrintReport` | token | `PaceMakerRhythmController.js:12` |  |
| `POST` | `/api/PaceMakerRhythm/GetList` | token | `PaceMakerRhythmController.js:13` |  |
| `POST` | `/api/PaceMakerRhythm/Confirm` | token | `PaceMakerRhythmController.js:14` |  |
| `POST` | `/api/ICDRhythm/GetLastData` | token | `ICDRhythmController.js:10` |  |
| `POST` | `/api/ICDRhythm/CustomSave` | token | `ICDRhythmController.js:11` |  |
| `POST` | `/api/ICDRhythm/PrintReport` | token | `ICDRhythmController.js:12` |  |
| `POST` | `/api/ICDRhythm/GetList` | token | `ICDRhythmController.js:13` |  |
| `POST` | `/api/ICDRhythm/Confirm` | token | `ICDRhythmController.js:14` |  |

### 4.11. Зүрхний хэм алдагдал — `controllers/rhythm/`

Угтвар: `/api/CardiacRhythm`, `/api/AtrialRhythm`, `/api/MonitoringRhythm`, `/api/AtrialRhythmNew` · 22 endpoint.

| Method | Path | Access | Controller файл | Зорилго (кодын тайлбараас) |
|---|---|---|---|---|
| `POST` | `/api/CardiacRhythm/GetLastData` | token | `CardiacRhythmController.js:15` |  |
| `POST` | `/api/CardiacRhythm/CustomSave` | token | `CardiacRhythmController.js:16` |  |
| `POST` | `/api/CardiacRhythm/Confirm` | token | `CardiacRhythmController.js:17` |  |
| `POST` | `/api/CardiacRhythm/PrintReport` | token | `CardiacRhythmController.js:18` |  |
| `POST` | `/api/CardiacRhythm/GetList` | token | `CardiacRhythmController.js:19` |  |
| `POST` | `/api/AtrialRhythm/GetLastData` | token | `AtrialRhythmController.js:10` |  |
| `POST` | `/api/AtrialRhythm/CustomSave` | token | `AtrialRhythmController.js:11` |  |
| `POST` | `/api/AtrialRhythm/PrintReport` | token | `AtrialRhythmController.js:12` |  |
| `POST` | `/api/AtrialRhythm/GetList` | token | `AtrialRhythmController.js:13` |  |
| `POST` | `/api/AtrialRhythm/Confirm` | token | `AtrialRhythmController.js:14` |  |
| `POST` | `/api/AtrialRhythm/checkConfirm` | token | `AtrialRhythmController.js:15` |  |
| `POST` | `/api/MonitoringRhythm/GetLastData` | token | `MonitoringRhythmController.js:10` |  |
| `POST` | `/api/MonitoringRhythm/CustomSave` | token | `MonitoringRhythmController.js:11` |  |
| `POST` | `/api/MonitoringRhythm/PrintReport` | token | `MonitoringRhythmController.js:12` |  |
| `POST` | `/api/MonitoringRhythm/GetList` | token | `MonitoringRhythmController.js:13` |  |
| `POST` | `/api/MonitoringRhythm/Confirm` | token | `MonitoringRhythmController.js:14` |  |
| `POST` | `/api/AtrialRhythmNew/GetLastData` | token | `AtrialRhythmNewController.js:10` |  |
| `POST` | `/api/AtrialRhythmNew/CustomSave` | token | `AtrialRhythmNewController.js:11` |  |
| `POST` | `/api/AtrialRhythmNew/PrintReport` | token | `AtrialRhythmNewController.js:12` |  |
| `POST` | `/api/AtrialRhythmNew/GetList` | token | `AtrialRhythmNewController.js:13` |  |
| `POST` | `/api/AtrialRhythmNew/Confirm` | token | `AtrialRhythmNewController.js:14` |  |
| `POST` | `/api/AtrialRhythmNew/checkConfirm` | token | `AtrialRhythmNewController.js:15` |  |

### 4.12. Оношилгоо (катетержуулалт, ЭХО, лаборатори, мэс заслын төлөвлөгөө) — `controllers/diagnostics/`

Угтвар: `/api/CathLab`, `/api/Echo`, `/api/LaboratoryTest`, `/api/SurgeryPlans` · 11 endpoint.

| Method | Path | Access | Controller файл | Зорилго (кодын тайлбараас) |
|---|---|---|---|---|
| `POST` | `/api/CathLab/CustomSave` | token | `CathLabController.js:9` |  |
| `POST` | `/api/CathLab/GetLastCathLabId` | token | `CathLabController.js:10` |  |
| `POST` | `/api/Echo/CustomSave` | token | `EchoController.js:12` |  |
| `POST` | `/api/Echo/GetLastEchoId` | token | `EchoController.js:13` |  |
| `POST` | `/api/Echo/PrintReport` | token | `EchoController.js:14` |  |
| `POST` | `/api/LaboratoryTest/PrintReport` | token | `LaboratoryTestController.js:12` |  |
| `POST` | `/api/SurgeryPlans/get-list` | token | `SurgeryPlansController.js:11` |  |
| `POST` | `/api/SurgeryPlans/GetCustomFormData` | token | `SurgeryPlansController.js:12` |  |
| `POST` | `/api/SurgeryPlans/CustomSave` | token | `SurgeryPlansController.js:13` |  |
| `POST` | `/api/SurgeryPlans/cancel-patient` | token | `SurgeryPlansController.js:14` |  |
| `POST` | `/api/SurgeryPlans/PrintReport` | token | `SurgeryPlansController.js:15` |  |

### 4.13. Судас, хавхлага, төрөлхийн гажиг — `controllers/vascular/`

Угтвар: `/api/VascularDisease`, `/api/ValveDiseases`, `/api/ValveDiseasesEndo`, `/api/CongenitalMalformations` · 20 endpoint.

| Method | Path | Access | Controller файл | Зорилго (кодын тайлбараас) |
|---|---|---|---|---|
| `POST` | `/api/VascularDisease/GetLastData` | token | `VascularDiseaseController.js:12` |  |
| `POST` | `/api/VascularDisease/CustomSave` | token | `VascularDiseaseController.js:13` |  |
| `POST` | `/api/VascularDisease/Confirm` | token | `VascularDiseaseController.js:14` |  |
| `POST` | `/api/VascularDisease/PrintReport` | token | `VascularDiseaseController.js:15` |  |
| `POST` | `/api/VascularDisease/GetList` | token | `VascularDiseaseController.js:16` |  |
| `POST` | `/api/ValveDiseases/GetLastData` | token | `ValveDiseasesController.js:12` |  |
| `POST` | `/api/ValveDiseases/CustomSave` | token | `ValveDiseasesController.js:13` |  |
| `POST` | `/api/ValveDiseases/Confirm` | token | `ValveDiseasesController.js:14` |  |
| `POST` | `/api/ValveDiseases/PrintReport` | token | `ValveDiseasesController.js:15` |  |
| `POST` | `/api/ValveDiseases/GetList` | token | `ValveDiseasesController.js:16` |  |
| `POST` | `/api/ValveDiseasesEndo/GetLastData` | token | `ValveDiseasesEndoController.js:12` |  |
| `POST` | `/api/ValveDiseasesEndo/CustomSave` | token | `ValveDiseasesEndoController.js:13` |  |
| `POST` | `/api/ValveDiseasesEndo/Confirm` | token | `ValveDiseasesEndoController.js:14` |  |
| `POST` | `/api/ValveDiseasesEndo/PrintReport` | token | `ValveDiseasesEndoController.js:15` |  |
| `POST` | `/api/ValveDiseasesEndo/GetList` | token | `ValveDiseasesEndoController.js:16` |  |
| `POST` | `/api/CongenitalMalformations/GetLastData` | token | `CongenitalMalformationsController.js:10` |  |
| `POST` | `/api/CongenitalMalformations/CustomSave` | token | `CongenitalMalformationsController.js:11` |  |
| `POST` | `/api/CongenitalMalformations/Confirm` | token | `CongenitalMalformationsController.js:12` |  |
| `POST` | `/api/CongenitalMalformations/PrintReport` | token | `CongenitalMalformationsController.js:13` |  |
| `POST` | `/api/CongenitalMalformations/GetList` | token | `CongenitalMalformationsController.js:14` |  |

## 5. Ерөнхий CRUD хөдөлгүүр — `/api/BaseObject`

`ModelConfigs/mainConfig.js`-д бүртгэгдсэн `ObjectName` бүр (ModelConfig + Sequelize model)
доорх endpoint-уудыг **шинэ код бичихгүйгээр** авна: маягтын тохиргоо, жагсаалт (хуудаслалт,
хайлт, эрэмбэ), нэг бичлэг, үүсгэх / засах / устгах, файл хавсаргах, Excel ба текст экспорт.
Хүсэлт бүрт `ObjectName` заавал байна. Controller: `controllers/system/BaseController.js`.

- Иргэний токенд мөр бүрийн хамрах хүрээг `helper/PatientScope.js` хязгаарлана.
- Чатын хүснэгтүүд энд бүртгэгдээгүй — чатад зөвхөн `/api/Chat/*`-аар хандана.
- Жагсаалтын `.xlsx` экспорт нь тендерийн «цэсэнд жагсаах, хайх, экспортлох» шаардлагыг
  бүртгэлтэй маягт бүрт хангана.

| Method | Path | Access | Тайлбар |
|---|---|---|---|
| `POST` | `/api/BaseObject/getData` | token + patient allowed | Маягтын талбарын тохиргоо (`Fields`, `NewObject`, `TitleObject`, `PK`, `AttachFiles`); `OptionType` сонголтууд аль хэдийн дүүргэгдсэн байна. |
| `POST` | `/api/BaseObject/` | token + patient allowed | Жагсаалт: хуудаслалт (`PageSize`, `PageNumber`), хайлт (`SearchText`, `SearchField`), эрэмбэ (`OrderByField`, `OrderByType`). Хуудаслалтын мэдээлэл `Option`-д ирнэ. |
| `POST` | `/api/BaseObject/getListInfo` | token + patient allowed | `/`-тэй ижил параметртэй жагсаалт (`BaseGetListInfo`). |
| `POST` | `/api/BaseObject/getDetail` | token + patient allowed | Нэг бичлэг; `SearchField`-ээр шүүнэ. |
| `POST` | `/api/BaseObject/getDetailInfo` | token + patient allowed | Нэг бичлэг (`BaseDetailInfo`). |
| `POST` | `/api/BaseObject/create` | token + patient allowed | Шинэ бичлэг. `Data` нь JSON мөр (string); амжилттай бол `Data.DataId` буцна. |
| `POST` | `/api/BaseObject/update` | token + patient allowed | Бичлэг засах. `Data` нь PK талбартай JSON мөр. |
| `POST` | `/api/BaseObject/destroy` | token + patient allowed | Устгах. `DeleteOption` шүүлтүүр; эрхгүй эсвэл тохирох мөр олдоогүй бол `Success: false`. |
| `POST` | `/api/BaseObject/uploadFile` | token + patient allowed | `multipart/form-data`, `LinkedObjectInfo` (`LinkedObjectName`, `LinkedObjectId`, `FieldName`). Дээд хэмжээ 10 МБ (чатад 50 МБ), зөвшөөрөгдсөн өргөтгөлийн жагсаалттай. |
| `POST` | `/api/BaseObject/downloadFile` | token + patient allowed | `FileInfo.generated_name`-ээр файл татна; эрхийг хадгалагдсан `File` мөрөөр шалгана. Жинхэнэ 400 / 403 / 404 / 500 статус буцаадаг. |
| `POST` | `/api/BaseObject/deleteFile` | token + patient allowed | `FileId`-аар файлыг зөөлөн устгана (`rec_status = 2`). |
| `POST` | `/api/BaseObject/ExportExcel` | token + patient allowed | Жагсаалтын шүүлтүүрээр `.xlsx` файл үүсгэж татуулна. |
| `POST` | `/api/BaseObject/ExportText` | token + patient allowed | Ижил экспорт, таб-аар тусгаарласан `.txt` файлаар. |

## 6. Гар утасны API — `/api/patient`, `/api/doctor`, `/api/auth`

Эдгээрийн дэлгэрэнгүй гэрээ (хүсэлт, хариу, алдааны код) [mobile/API.md](../../mobile/API.md)-д
байгаа тул энд давтахгүй. Эдгээр нь legacy хүснэгтээс **өмнө** холбогдсон, токеныг маршрут
бүр дээр шалгадаг, жижиг үсгийн `{ success, message, data, code }` бүтэцтэй, бодит HTTP статус
(400 / 401 / 403 / 404 / 500) буцаадаг.

| Method | Path | Access | Эх файл | Зорилго (кодын тайлбараас) |
|---|---|---|---|---|
| `GET` | `/api/patient/me` | token (RoleId 4 only) | `api/patient/index.js:49` | 2.1 Миний бүртгэл |
| `GET` | `/api/patient/journal` | token (RoleId 4 only) | `api/patient/index.js:52` | 2.2 Миний тэмдэглэл — the daily log, plus the series behind its chart |
| `POST` | `/api/patient/journal` | token (RoleId 4 only) | `api/patient/index.js:53` |  |
| `GET` | `/api/patient/journal/summary` | token (RoleId 4 only) | `api/patient/index.js:54` | The tracker's acceptance for Миний тэмдэглэл is explicit that entries must render as a chart, so… |
| `GET` | `/api/patient/journal/export` | token (RoleId 4 only) | `api/patient/index.js:57` | §1.8 - the journal as a file, for showing a doctor at an appointment. |
| `GET` | `/api/patient/questions` | token (RoleId 4 only) | `api/patient/index.js:60` | 2.3 Эмчээс асуух асуулт |
| `POST` | `/api/patient/questions` | token (RoleId 4 only) | `api/patient/index.js:61` | Ask a question, with or without attachments (tender §2.3: "зураг, дуу, баримт хавсаргах"). |
| `GET` | `/api/patient/advice` | token (RoleId 4 only) | `api/patient/index.js:64` | 2.4 Эмчийн зөвлөгөө |
| `GET` | `/api/patient/risk` | token (RoleId 4 only) | `api/patient/index.js:67` | 2.5 Эрсдэл үнэлгээ (ЗСӨ) — inputs only until ЗСҮТ approve the methodology |
| `GET` | `/api/patient/diagnostics` | token (RoleId 4 only) | `api/patient/index.js:71` | §3.1 Шинжилгээ, оношлогоо — the patient's own results, same shape the doctor app gets. |
| `GET` | `/api/patient/diagnostics/:type/:id` | token (RoleId 4 only) | `api/patient/index.js:72` | One of the patient's own investigations. |
| `GET` | `/api/patient/evisits` | token (RoleId 4 only) | `api/patient/index.js:75` | 2.6 Цахим үзлэг - request, appointment and the state of both |
| `POST` | `/api/patient/evisits` | token (RoleId 4 only) | `api/patient/index.js:76` |  |
| `GET` | `/api/patient/evisits/:id` | token (RoleId 4 only) | `api/patient/index.js:78` | One request, with its assigned doctor and - only once scheduled - its join link |
| `POST` | `/api/patient/evisits/:id/cancel` | token (RoleId 4 only) | `api/patient/index.js:80` | Withdraw a request. |
| `GET` | `/api/patient/options/:dico` | token (RoleId 4 only) | `api/patient/index.js:84` | Option lists for the dropdowns above, served from the OptionTypes dictionary so unapproved wording… |
| `GET` | `/api/patient/notifications` | token (RoleId 4 only) | `api/patient/index.js:87` | Мэдэгдэл (tracker 48). |
| `GET` | `/api/patient/notifications/unread-count` | token (RoleId 4 only) | `api/patient/index.js:89` | The badge count on its own, so the app is not paging a list to count |
| `POST` | `/api/patient/notifications/:id/read` | token (RoleId 4 only) | `api/patient/index.js:90` | Ownership lives in the WHERE clause, never in a check beforehand. |
| `POST` | `/api/patient/notifications/read-all` | token (RoleId 4 only) | `api/patient/index.js:91` |  |
| `POST` | `/api/patient/devices` | token (RoleId 4 only) | `api/patient/index.js:94` | Push registration. |
| `POST` | `/api/patient/devices/unregister` | token (RoleId 4 only) | `api/patient/index.js:96` | POST, not DELETE /:token - an FCM token is ~163 chars and contains ':' |
| `GET` | `/api/patient/devices` | token (RoleId 4 only) | `api/patient/index.js:97` | The caller's own devices. |
| `GET` | `/api/patient/reminders` | token (RoleId 4 only) | `api/patient/index.js:102` | Сануулга - medication, exercise and follow-up reminders the patient sets themselves. |
| `POST` | `/api/patient/reminders` | token (RoleId 4 only) | `api/patient/index.js:103` |  |
| `PATCH` | `/api/patient/reminders/:id` | token (RoleId 4 only) | `api/patient/index.js:104` |  |
| `DELETE` | `/api/patient/reminders/:id` | token (RoleId 4 only) | `api/patient/index.js:106` | Soft delete: stops firing, keeps the history answerable |
| `GET` | `/api/patient/access-log` | token (RoleId 4 only) | `api/patient/index.js:111` | Хандалтын түүх (tracker 24) - who looked at my record. |
| `GET` | `/api/patient/consents` | token (RoleId 4 only) | `api/patient/index.js:116` | Зөвшөөрөл (tracker 23) - consent for non-treatment use of personal data. |
| `GET` | `/api/patient/consents/:purposeCode/document` | token (RoleId 4 only) | `api/patient/index.js:117` | The full text to display before asking. |
| `POST` | `/api/patient/consents` | token (RoleId 4 only) | `api/patient/index.js:118` |  |
| `DELETE` | `/api/patient/consents/:purposeCode` | token (RoleId 4 only) | `api/patient/index.js:119` |  |
| `GET` | `/api/patient/rehab/exercises` | token (RoleId 4 only) | `api/patient/index.js:126` | 2.7 Сэргээн засах, дасгал хөдөлгөөн |
| `GET` | `/api/patient/rehab/progress` | token (RoleId 4 only) | `api/patient/index.js:127` | What this patient has completed, so the catalogue can show progress. |
| `POST` | `/api/patient/rehab/progress` | token (RoleId 4 only) | `api/patient/index.js:128` | Tracker #56: "Дасгал үзэх, гүйцэтгэлээ тэмдэглэх" - the patient marks their own completion. |
| `GET` | `/api/patient/rehab/vitals` | token (RoleId 4 only) | `api/patient/index.js:129` | Tracker #51: vital signs around a session. |
| `POST` | `/api/patient/rehab/vitals` | token (RoleId 4 only) | `api/patient/index.js:130` |  |
| `GET` | `/api/patient/rehab/assessment` | token (RoleId 4 only) | `api/patient/index.js:131` | Tracker #50: the latest risk / exercise-tolerance assessment. |
| `GET` | `/api/patient/rehab/assessments` | token (RoleId 4 only) | `api/patient/index.js:134` | The history behind that single row - risk level and exercise tolerance over a whole programme… |
| `GET` | `/api/doctor/me` | token (staff only) | `api/doctor/index.js:74` |  |
| `GET` | `/api/doctor/options/:dico` | token (staff only) | `api/doctor/index.js:79` | Dropdown wording (rehab risk, phase, category, e-visit status). |
| `GET` | `/api/doctor/visits` | token (staff only) | `api/doctor/index.js:82` | 28 Миний үзлэгүүд |
| `GET` | `/api/doctor/visits/export` | token (staff only) | `api/doctor/index.js:85` | §1.8 - the same filters as the list, as a file. |
| `GET` | `/api/doctor/visits/:id` | token (staff only) | `api/doctor/index.js:86` | One examination in full. |
| `GET` | `/api/doctor/visits/:id/print` | token (staff only) | `api/doctor/index.js:88` | §1.8 - the examination note as A4 PDF. |
| `GET` | `/api/doctor/monitoring` | token (staff only) | `api/doctor/index.js:91` | 29 Миний хяналт |
| `POST` | `/api/doctor/monitoring` | token (staff only) | `api/doctor/index.js:92` | Take a patient into personal monitoring. |
| `DELETE` | `/api/doctor/monitoring/:patientId` | token (staff only) | `api/doctor/index.js:93` |  |
| `GET` | `/api/doctor/monitoring/:patientId/journal` | token (staff only) | `api/doctor/index.js:94` | A monitored patient's journal, as rows plus the chart series. |
| `GET` | `/api/doctor/monitoring/:patientId/questions` | token (staff only) | `api/doctor/index.js:95` | The question thread of a patient this doctor monitors. |
| `POST` | `/api/doctor/monitoring/:patientId/questions` | token (staff only) | `api/doctor/index.js:96` | A doctor's answer. |
| `GET` | `/api/doctor/advice` | token (staff only) | `api/doctor/index.js:99` | 30 Миний зөвлөгөө |
| `GET` | `/api/doctor/advice/:id` | token (staff only) | `api/doctor/index.js:100` | One of the doctor's own tickets, with its replies. |
| `GET` | `/api/doctor/reports/summary` | token (staff only) | `api/doctor/index.js:103` | 31 Миний тайлан |
| `GET` | `/api/doctor/reports/summary/export` | token (staff only) | `api/doctor/index.js:107` | The same report as xlsx / csv / txt, with the source stamp the tender requires. |
| `GET` | `/api/doctor/icd10` | token (staff only) | `api/doctor/index.js:111` | Онош, ICD-ээр хайх (§1.3) - autocomplete for the diagnosis box. |
| `GET` | `/api/doctor/patients` | token (staff only) | `api/doctor/index.js:115` | 32 Read access to the patient side. |
| `GET` | `/api/doctor/patients/:id` | token (staff only) | `api/doctor/index.js:116` | A patient card: profile, recent examinations, journal series, monitoring state. |
| `GET` | `/api/doctor/patients/:id/risk` | token (staff only) | `api/doctor/index.js:118` | §2.1 - the doctor's view of the patient's own risk screen, same rows |
| `GET` | `/api/doctor/patients/:id/consents` | token (staff only) | `api/doctor/index.js:122` | §1.2 Асран хамгаалагчийн зөвшөөрөл - the patient records their own at /api/patient/consents; a… |
| `POST` | `/api/doctor/patients/:id/consents` | token (staff only) | `api/doctor/index.js:123` | Record a consent given by the patient's guardian. |
| `GET` | `/api/doctor/patients/:id/diagnostics` | token (staff only) | `api/doctor/index.js:128` | §3.1 Шинжилгээ, оношлогоо - lab, echo, cathlab and ECG as one list. |
| `GET` | `/api/doctor/diagnostics/:type/:id` | token (staff only) | `api/doctor/index.js:129` | One investigation in full. |
| `GET` | `/api/doctor/evisits` | token (staff only) | `api/doctor/index.js:133` | 2.6 Цахим үзлэг - the triage side of the patient's remote-examination request Queue of requests… |
| `GET` | `/api/doctor/evisits/:id` | token (staff only) | `api/doctor/index.js:135` | One request with the patient's card and their latest reading |
| `POST` | `/api/doctor/evisits/:id/schedule` | token (staff only) | `api/doctor/index.js:137` | Confirm or move a slot, and assign it to the calling doctor |
| `POST` | `/api/doctor/evisits/:id/complete` | token (staff only) | `api/doctor/index.js:139` | Mark the examination done. |
| `POST` | `/api/doctor/evisits/:id/cancel` | token (staff only) | `api/doctor/index.js:141` | Refuse or withdraw a request |
| `GET` | `/api/doctor/rehab/exercises` | token (staff only) | `api/doctor/index.js:144` | 2.7 Сэргээн засах - the exercise catalogue, same shape the patient app gets |
| `GET` | `/api/doctor/patients/:id/rehab` | token (staff only) | `api/doctor/index.js:146` | Everything rehabilitation knows about one patient: assessment, progress, vitals |
| `GET` | `/api/doctor/patients/:id/rehab/assessment` | token (staff only) | `api/doctor/index.js:148` | The assessment history, newest first |
| `POST` | `/api/doctor/patients/:id/rehab/assessment` | token (staff only) | `api/doctor/index.js:150` | Record an assessment. |
| `GET` | `/api/doctor/emd/drugs` | token (staff only) | `api/doctor/index.js:155` | §1.6 ЭМД кодчилол - the legacy /api/EMDService/* takes PatRegNo from the request BODY; these… |
| `GET` | `/api/doctor/emd/services` | token (staff only) | `api/doctor/index.js:156` | The insurance service catalogue. |
| `GET` | `/api/doctor/notifications` | token (staff only) | `api/doctor/index.js:161` | Мэдэгдэл - the same four the patient app has, addressed by ToUserId. |
| `GET` | `/api/doctor/notifications/unread-count` | token (staff only) | `api/doctor/index.js:163` | The badge count on its own, so the app is not paging a list to count |
| `POST` | `/api/doctor/notifications/:id/read` | token (staff only) | `api/doctor/index.js:164` | Ownership lives in the WHERE clause, never in a check beforehand. |
| `POST` | `/api/doctor/notifications/read-all` | token (staff only) | `api/doctor/index.js:165` |  |
| `POST` | `/api/doctor/devices` | token (staff only) | `api/doctor/index.js:169` | Push registration, identical in shape to the patient app's. |
| `POST` | `/api/doctor/devices/unregister` | token (staff only) | `api/doctor/index.js:170` | POST, not DELETE /:token - see the patient equivalent for why. |
| `GET` | `/api/doctor/devices` | token (staff only) | `api/doctor/index.js:171` |  |
| `POST` | `/api/auth/refresh` | self-authenticating | `api/auth/index.js:16` |  |
| `GET` | `/api/auth/session` | self-authenticating | `api/auth/index.js:17` |  |
| `POST` | `/api/auth/logout` | self-authenticating | `api/auth/index.js:21` | End this session. |
| `GET` | `/api/auth/sessions` | self-authenticating | `api/auth/index.js:23` | Where am I signed in? |
| `POST` | `/api/auth/logout-all` | self-authenticating | `api/auth/index.js:25` | The "I lost my phone" button - ends every session for this identity |

## 7. Шинэ давхарга — `/api/base`, `/api/report`

`app.use('/api', require('./api'))`-ээр холбогдсон ерөнхий REST нөөц. Бодит HTTP арга, жижиг
үсгийн `{ success, message, data }` бүтэц. `:target` нь `api/base/config/` дахь тохиргооны нэг:
`DictBagKhoroo`, `DictProvinceCity`, `DictSoumDistrict`, `DoctorsProfile`, `HavhlagaEmgeg`, `Icd`, `OptionTypes`, `Organization`, `Pm`, `TurulhiinGajig`, `vwOptionValues`, `vwOrganizationLevel`, `vwOrganizationType`.
Тохиргоонд тухайн үйлдэл тодорхойлогдоогүй бол `{ success: false, message: 'Идвэхигүй үйлдэл' }`
буцна.

| Method | Path | Access | Эх файл | Зорилго (кодын тайлбараас) |
|---|---|---|---|---|
| `GET` | `/api/report/getCVDMonitoringSuom` | token — `/api/Report` угтвар барьдаг (§9) | `api/report/index.js:6` |  |
| `GET` | `/api/base/:target/lookup` | public (no token) | `api/base/index.js:21` |  |
| `GET` | `/api/base/:target/:id` | public (no token) | `api/base/index.js:23` |  |
| `PUT` | `/api/base/:target/:id` | public (no token) | `api/base/index.js:23` |  |
| `DELETE` | `/api/base/:target/:id` | public (no token) | `api/base/index.js:23` |  |
| `GET` | `/api/base/:target` | public (no token) | `api/base/index.js:34` |  |
| `POST` | `/api/base/:target` | public (no token) | `api/base/index.js:34` |  |

## 8. Системийн endpoint

| Method | Path | Access | Эх файл |
|---|---|---|---|
| `GET` | `/` | public | `server.js:505` |
| `GET` | `/health` | public | `server.js:509` |

## 9. Аюулгүй байдлын тэмдэглэл

> **2026-09-14-нд зассан.** Энэ хэсэг өмнө нь `/api/base/*`, `/api/report/*` хоёрыг
> токенгүй хүсэлтэд хариулдаг гэж бичдэг байсан. Одоо тийм биш:
>
> - `/api/base/*` — 6 endpoint. `api/index.js` дотор
>   `[VerifyTokenJson, DenyPatient]`-ээр хамгаалагдсан. Токенгүй бол 401,
>   үйлчлүүлэгч (RoleId 4) бол 403. Хамгаалалтыг `app.use('/api', ...)` дээр биш,
>   дэд router дээр тавьсан нь санаатай: mount түвшинд тавьбал энэ давхаргын үйлчилдэггүй
>   бүх зам 404-ийн оронд 401 болж, хүсэлт бүр дээр хэрэглэгч уншина.
> - `/api/report/*` — 1 endpoint, мөн адил хамгаалагдсан.
> - `/api/Test/*` — 2 endpoint үлдсэн, `routeGroups.public`-д
>   (`controllers/system/TestController.js`): `POST /api/Test/CheckRegisterRegex`, `POST /api/Test/RegexTest`.
>   Токенгүй 1 ГБ файл байршуулдаг байсан `PUT /api/Test/uploadFile`, хатуу бичсэн хаяг руу
>   мэйл илгээдэг `ApiSendMail`, хариу буцаадаггүй `printNew`, нэвтрэлтгүй Puppeteer
>   зураглал хийдэг `print` дөрвийг устгасан. Үлдсэн хоёр нь зөвхөн тэмдэгт мөр шалгадаг
>   бөгөөд бүртгэлийн дэлгэц нэвтрэхээс өмнө дуудаж болзошгүй тул нийтийн хэвээр.
>
> Түүнчлэн Express холбох замыг том жижиг үсэг ялгахгүйгээр тааруулдаг тул `/api/Report`
> угтвар түрүүлж барьдаг. Энэ нь санаатай хамгаалалт биш — бүртгэлийн дарааллын дагавар
> бөгөөд тэр угтварыг өөрчилбөл алга болно. Одоо давхар хамгаалалттай учраас эрсдэл биш,
> гэхдээ мэдэж байх нь зүйтэй.
>
> Үлдсэн аюулгүй байдлын олдворууд (`helper/Auth.js`-ийн dev горим, хурдны хязгаарлалт,
> Socket.IO-ийн процесс доторх тархалт) тендерт заасан мэдээллийн аюулгүй байдлын аудитад
> хамаарна (ажлын жагсаалтын №136, №138).
>
> Нийтийн бүлгийн бусад угтвар — `/api/User`, `/api/UserRequest`, `/api/PatientUser`, `/api/XypService` — нэвтрэх, бүртгүүлэх, нууц үг сэргээх, ХУР-ын сервер хоорондын дуудлага зэрэг токен
> авахаас өмнөх урсгалд зориулагдсан;
> тэдгээрийн зарим маршрут маршрут түвшинд токен шаарддаг (§4-ийн `token (route-level)`).

## 10. Холбогдоогүй controller файлууд

`controllers/` доторх боловч `routeGroups`-д холбогдоогүй тул HTTP-ээр хандах боломжгүй
файлууд. Дээрх тоонд ороогүй.

| Файл | Маршрутын зарлалт | Тайлбар |
|---|---|---|
| `controllers/system/AppController.js` | 0 | `server.js`-д require хийсэн, router биш (жишээ нь хуваарьт ажил). |
| `controllers/system/BaseControllerNew.js` | 10 | Router зарласан боловч хаана ч холбогдоогүй — хүрэх боломжгүй. |
| `controllers/system/BaseCustomController.js` | 0 | Маршрутгүй туслах файл. |
| `controllers/system/ExportExcelOld.js` | 0 | Маршрутгүй туслах файл. |
| `controllers/system/MediaController.js` | 2 | Router зарласан боловч хаана ч холбогдоогүй — хүрэх боломжгүй. |
| `controllers/system/MediaTicketController.js` | 1 | Router зарласан боловч хаана ч холбогдоогүй — хүрэх боломжгүй. |

---

_Энэ файлыг `scripts/generate_api_reference.js` автоматаар үүсгэв. Үүсгэсэн огноо: 2026-09-15. Нийт endpoint: 387._
