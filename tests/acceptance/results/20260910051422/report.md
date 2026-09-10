# MnCardio acceptance run — 20260910051422

Target: `https://mncardio.itsystem.mn`  
Started: 2026-09-10T05:14:22.496Z  
Records created by this run are tagged `ZZTEST-20260910051422` and left in place.

## Verdict

| Layer | Result |
|---|---|
| Endpoint sweep | 104 OK · 137 alive · 5 failing · 0 erroring, of 248 called (44 skipped) |
| Write journeys | 40/48 passed |
| Browser | 71/72 passed |

`alive` means the endpoint is mounted and executing but was called with an empty
body and asked for input. `OK` means it did the thing. The legacy layer answers
every failure with HTTP 200 and the same opaque "An error occurred", so verdicts
come from the response body, never the status code.

## Failures

| Journey | Step | Detail |
|---|---|---|
| create-user | User/Save HASHES the password | stored as PLAINTEXT — the password we sent, verbatim |
| password | patient: weak password REFUSED | ACCEPTED "abc" — no complexity rule on the patient path |
| files | another account CANNOT download it | a patient token downloaded a doctor-attached file |
| files | rejected upload does NOT report success | reported "Successfully saved" for a file it discarded |
| generic-crud | destroy on a non-existent row does NOT claim success | reported success for a row that does not exist |
| security | /api/base requires authentication | HTTP 200 without a token |
| security | /api/report requires authentication | HTTP 200 without a token |
| security | /api/Test is not publicly reachable | HTTP 200 without a token |
| browser:patient-search | search box present | no text input on the patient screen |

## Endpoints reporting failure with a realistic request

| Verdict | Endpoint | Detail |
|---|---|---|
| FAIL | `POST /api/Dashboard/GetCreateAllVisits` | An error occurred |
| FAIL | `POST /api/Dashboard/GetCreatePatients` | An error occurred |
| FAIL | `POST /api/DoctorProfile/GetByUserId` | An error occurred |
| FAIL | `POST /api/Report/GetProvinceData` | An error occurred |
| FAIL | `POST /api/RiskScores/CalculateRisk` | An error occurred |

## Not called, and why

| Endpoint | Reason |
|---|---|
| `/api/AtrialRhythm/checkConfirm` | calls ХУР/ЭМХТ; 502s when the upstream is down |
| `/api/AtrialRhythmNew/checkConfirm` | calls ХУР/ЭМХТ; 502s when the upstream is down |
| `/api/base/:target` | path parameter — covered by Layer 2 |
| `/api/base/:target` | path parameter — covered by Layer 2 |
| `/api/base/:target/:id` | path parameter — covered by Layer 2 |
| `/api/base/:target/:id` | path parameter — covered by Layer 2 |
| `/api/base/:target/:id` | path parameter — covered by Layer 2 |
| `/api/base/:target/lookup` | path parameter — covered by Layer 2 |
| `/api/BaseObject/deleteFile` | exercised in Layer 2 against a file we uploaded |
| `/api/BaseObject/destroy` | generic delete — exercised in Layer 2 with a non-matching filter |
| `/api/BaseObject/uploadFile` | multipart — exercised in Layer 2 |
| `/api/Chat/RemoveUserFromChatRoom` | destructive |
| `/api/CVDMonitoring/CheckPatient` | calls ХУР/ЭМХТ; hangs 70s+ when the upstream is down |
| `/api/CVDMonitoring/FindPatientDataForUpdate` | calls ХУР/ЭМХТ; 502s when the upstream is down |
| `/api/doctor/advice/:id` | path parameter — covered by Layer 2 |
| `/api/doctor/monitoring` | POST adds to the monitoring list — Layer 2 |
| `/api/doctor/monitoring` | POST adds to the monitoring list — Layer 2 |
| `/api/doctor/monitoring/:patientId` | path parameter — covered by Layer 2 |
| `/api/doctor/monitoring/:patientId/journal` | path parameter — covered by Layer 2 |
| `/api/doctor/patients/:id` | path parameter — covered by Layer 2 |
| `/api/doctor/visits/:id` | path parameter — covered by Layer 2 |
| `/api/DoctorsTeam/DeleteDoctorsTeam` | destructive |
| `/api/DoctorsTeam/RemoveDoctor` | destructive |
| `/api/DoctorsTeam/RemovePatient` | destructive |
| `/api/EMDService/getTablet` | calls the external ЭМД service |
| `/api/EMDService/getTabletByDiagnosis` | calls the external ЭМД service |
| `/api/Organization/GetOne/:id` | path parameter — covered by Layer 2 |
| `/api/Organization/Merge` | irreversible restructuring of organisation data |
| `/api/OutPatientInfo/UpdateStayDates` | mutates admission dates used by password-expiry logic |
| `/api/PatientUser/ChangePassword` | changes a password — Layer 2 |
| `/api/PatientUser/ForgotPassword` | sends email; no SMTP configured |
| `/api/PatientUser/Save` | creates a patient user — Layer 2 |
| `/api/RiskScores/CreateFromExcel` | bulk import from a spreadsheet on disk |
| `/api/TenderForm/CustomSave` | creates a form instance — Layer 2 |
| `/api/TenderForm/Delete` | exercised in Layer 2 against a record we created |
| `/api/Test/ApiSendMail` | public route that sends real mail to a hardcoded address |
| `/api/Test/uploadFile` | public unauthenticated 1GB upload — probed for existence only, never used |
| `/api/User/ChangePassword` | changes a password — Layer 2 |
| `/api/User/ForgetPassword` | sends email; no SMTP configured on the test host |
| `/api/User/Save` | creates a user — exercised in Layer 2 where the result is inspected |
| `/api/UserRequest/Decline` | destructive |
| `/api/UserRequest/Register` | sends email — exercised in Layer 2 where the failure is expected |
| `/api/Visit/CustomSave` | creates an examination — Layer 2 |
| `/api/XypService/testCall` | live SOAP call to xyp.gov.mn with real credentials |

## Full sweep

| Verdict | Endpoint | Role | ms | Detail |
|---|---|---|---|---|
| OK | `POST /api/Advice/CheckByPatient` | doctor | 59 |  |
| ALIVE | `POST /api/Advice/CreateComment` | doctor | 40 | An error occurred |
| ALIVE | `POST /api/Advice/CustomSave` | doctor | 41 | An error occurred |
| ALIVE | `POST /api/Advice/CustomSaveAndPublish` | doctor | 42 | Information is missing |
| OK | `POST /api/Advice/GetAdviceCommentPoint` | doctor | 67 |  |
| OK | `POST /api/Advice/GetComments` | doctor | 299 |  |
| OK | `POST /api/Advice/GetFeed` | doctor | 682 |  |
| OK | `POST /api/Advice/GetList` | doctor | 330 |  |
| ALIVE | `POST /api/Advice/GetListCity` | doctor | 200 | Information is missing |
| ALIVE | `POST /api/Advice/GetListSoum` | doctor | 29 | Information is missing |
| OK | `POST /api/Advice/GetStats` | doctor | 419 |  |
| ALIVE | `POST /api/Advice/GetTicket` | doctor | 17 | Information is missing |
| ALIVE | `POST /api/Advice/SaveAdviceCommentRate` | doctor | 229 | An error occurred |
| ALIVE | `POST /api/AtrialRhythm/Confirm` | doctor | 27 | Information is missing |
| ALIVE | `POST /api/AtrialRhythm/CustomSave` | doctor | 15 | An error occurred |
| ALIVE | `POST /api/AtrialRhythm/GetLastData` | doctor | 13 | Information is missing |
| OK | `POST /api/AtrialRhythm/GetList` | doctor | 16 |  |
| ALIVE | `POST /api/AtrialRhythm/PrintReport` | doctor | 5 | Information is missing |
| ALIVE | `POST /api/AtrialRhythmNew/Confirm` | doctor | 231 | Information is missing |
| ALIVE | `POST /api/AtrialRhythmNew/CustomSave` | doctor | 16 | An error occurred |
| ALIVE | `POST /api/AtrialRhythmNew/GetLastData` | doctor | 15 | Information is missing |
| OK | `POST /api/AtrialRhythmNew/GetList` | doctor | 13 |  |
| ALIVE | `POST /api/AtrialRhythmNew/PrintReport` | doctor | 3 | Information is missing |
| OK | `POST /api/auth/refresh` | doctor | 683 |  |
| OK | `GET /api/auth/session` | doctor | 15 |  |
| ALIVE | `POST /api/BaseObject` | doctor | 19 | Information is missing |
| ALIVE | `POST /api/BaseObject/create` | doctor | 6 | "undefined" is not valid JSON |
| ALIVE | `POST /api/BaseObject/downloadFile` | doctor | 9 | Information is missing |
| OK | `POST /api/BaseObject/ExportExcel` | doctor | 435 | application/vnd.openxmlformats-officedocument.spreadsheetml.sheet 4578 |
| OK | `POST /api/BaseObject/ExportText` | doctor | 365 | text/plain 74229b |
| OK | `POST /api/BaseObject/getData` | doctor | 71 |  |
| OK | `POST /api/BaseObject/getDetail` | doctor | 399 |  |
| OK | `POST /api/BaseObject/getDetailInfo` | doctor | 382 |  |
| OK | `POST /api/BaseObject/getListInfo` | doctor | 352 |  |
| ALIVE | `POST /api/BaseObject/update` | doctor | 5 | "undefined" is not valid JSON |
| ALIVE | `POST /api/CardiacRhythm/Confirm` | doctor | 3 | Information is missing |
| ALIVE | `POST /api/CardiacRhythm/CustomSave` | doctor | 5 | An error occurred |
| ALIVE | `POST /api/CardiacRhythm/GetLastData` | doctor | 6 | Information is missing |
| OK | `POST /api/CardiacRhythm/GetList` | doctor | 4 |  |
| ALIVE | `POST /api/CardiacRhythm/PrintReport` | doctor | 9 | Information is missing |
| ALIVE | `POST /api/CathLab/CustomSave` | doctor | 5 | An error occurred |
| OK | `POST /api/CathLab/GetLastCathLabId` | doctor | 7 |  |
| ALIVE | `POST /api/Chat/AddChatRoom` | doctor | 8 | Мэдээлэл дутуу байна |
| ALIVE | `POST /api/Chat/AddUserToChatRoom` | doctor | 9 | Мэдээлэл дутуу байна |
| ALIVE | `POST /api/Chat/CheckChatRoom` | doctor | 10 | Мэдээлэл дутуу байна |
| ALIVE | `POST /api/Chat/CommitMessage` | doctor | 12 | Мэдээлэл дутуу байна |
| ALIVE | `POST /api/Chat/CreateGroupRoom` | doctor | 218 | Бүлгийн нэрийг оруулна уу |
| ALIVE | `POST /api/Chat/DownloadAttachment` | doctor | 13 | Мэдээлэл дутуу байна |
| OK | `POST /api/Chat/GetChatRoomList` | doctor | 36 |  |
| ALIVE | `POST /api/Chat/GetChatRoomUsers` | doctor | 9 | Мэдээлэл дутуу байна |
| OK | `POST /api/Chat/GetDirectoryFilters` | doctor | 96 |  |
| ALIVE | `POST /api/Chat/GetMessages` | doctor | 6 | Мэдээлэл дутуу байна |
| OK | `POST /api/Chat/GetUnreadCount` | doctor | 24 |  |
| ALIVE | `POST /api/Chat/MarkRead` | doctor | 6 | Мэдээлэл дутуу байна |
| OK | `POST /api/Chat/SearchUsers` | doctor | 101 |  |
| ALIVE | `POST /api/Chat/SendMessage` | doctor | 6 | Мэдээлэл дутуу байна |
| ALIVE | `POST /api/Chat/StartChat` | doctor | 4 | Мэдээлэл дутуу байна |
| OK | `POST /api/CustomDataApi/GetJournalRefData` | doctor | 211 |  |
| OK | `POST /api/CVDAnalysis/GetAnalyzeData1` | doctor | 72 |  |
| OK | `POST /api/CVDAnalysis/GetAnalyzeData10` | doctor | 40 |  |
| OK | `POST /api/CVDAnalysis/GetAnalyzeData11` | doctor | 240 |  |
| OK | `POST /api/CVDAnalysis/GetAnalyzeData12` | doctor | 352 |  |
| OK | `POST /api/CVDAnalysis/GetAnalyzeData13` | doctor | 353 |  |
| OK | `POST /api/CVDAnalysis/GetAnalyzeData14` | doctor | 624 |  |
| OK | `POST /api/CVDAnalysis/GetAnalyzeData15` | doctor | 31 |  |
| OK | `POST /api/CVDAnalysis/GetAnalyzeData2` | doctor | 24 |  |
| OK | `POST /api/CVDAnalysis/GetAnalyzeData3` | doctor | 291 |  |
| OK | `POST /api/CVDAnalysis/GetAnalyzeData4` | doctor | 305 |  |
| OK | `POST /api/CVDAnalysis/GetAnalyzeData5` | doctor | 439 |  |
| OK | `POST /api/CVDAnalysis/GetAnalyzeData6` | doctor | 247 |  |
| OK | `POST /api/CVDAnalysis/GetAnalyzeData7` | doctor | 19 |  |
| OK | `POST /api/CVDAnalysis/GetAnalyzeData8` | doctor | 542 |  |
| OK | `POST /api/CVDAnalysis/GetAnalyzeData9` | doctor | 26 |  |
| ALIVE | `POST /api/CVDDrug/CreateAndUpdate` | doctor | 12 | An error occurred |
| ALIVE | `POST /api/CVDDrug/GetDrugData` | doctor | 9 | An error occurred |
| ALIVE | `POST /api/CVDHunAm/CreateAndUpdate` | doctor | 7 | An error occurred |
| ALIVE | `POST /api/CVDHunAm/GetData` | doctor | 8 | Байгууллагын мэдээлэл таарахгүй байна |
| ALIVE | `POST /api/CVDMonitoring/CreateControlAndTransition` | doctor | 11 | An error occurred |
| OK | `POST /api/CVDMonitoring/CreateDiagnosis` | doctor | 12 |  |
| ALIVE | `POST /api/CVDMonitoring/CreateHistory` | doctor | 16 | Information is missing |
| ALIVE | `POST /api/CVDMonitoring/CreateManagement` | doctor | 14 | An error occurred |
| ALIVE | `POST /api/CVDMonitoring/CreateMonitoring` | doctor | 12 | Successfully saved |
| ALIVE | `POST /api/CVDMonitoring/CreatePatient` | doctor | 12 | "undefined" is not valid JSON |
| ALIVE | `POST /api/CVDMonitoring/CreateSentPrescription` | doctor | 13 | Information is missing |
| OK | `POST /api/CVDMonitoring/GetAnalyzeData` | doctor | 10 |  |
| OK | `POST /api/CVDMonitoring/GetLastBodySizeData` | doctor | 11 |  |
| OK | `POST /api/CVDMonitoring/GetLastDiagnosisData` | doctor | 11 |  |
| OK | `POST /api/CVDMonitoring/GetLastHistoryData` | doctor | 8 |  |
| ALIVE | `POST /api/CVDMonitoring/GetLastManagementData` | doctor | 10 | Information is missing |
| OK | `POST /api/CVDMonitoring/GetLastRiskData` | doctor | 8 |  |
| OK | `POST /api/CVDMonitoring/GetList` | doctor | 8 |  |
| ALIVE | `POST /api/CVDMonitoring/GetPatientInfo` | doctor | 9 | Information is missing |
| ALIVE | `POST /api/CVDMonitoring/TakeControl` | doctor | 10 | An error occurred |
| ALIVE | `POST /api/CVDMonitoring/UpdatePatient` | doctor | 8 | An error occurred |
| ALIVE | `POST /api/CVDReport/GetInspectionReportData` | doctor | 15 | An error occurred |
| ALIVE | `POST /api/CVDReport/GetReportData` | doctor | 15 | An error occurred |
| ALIVE | `POST /api/CVDReport/GetReportMonthData` | doctor | 16 | An error occurred |
| ALIVE | `POST /api/CVDReport/GetReportSoumData` | doctor | 17 | An error occurred |
| ALIVE | `POST /api/CVDReport/GetReportUnitData` | doctor | 17 | An error occurred |
| ALIVE | `POST /api/CVDReport/InspectionExportExcel` | doctor | 13 | An error occurred |
| ALIVE | `POST /api/CVDReport/MonthNewsExportExcel` | doctor | 48 | An error occurred |
| ALIVE | `POST /api/CVDReport/ReportExportExcel` | doctor | 3 | An error occurred |
| ALIVE | `POST /api/CVDReport/SoumReportExportExcel` | doctor | 3 | An error occurred |
| ALIVE | `POST /api/CVDReport/UnitExportExcel` | doctor | 4 | An error occurred |
| FAIL | `POST /api/Dashboard/GetCreateAllVisits` | doctor | 14 | An error occurred |
| FAIL | `POST /api/Dashboard/GetCreatePatients` | doctor | 15 | An error occurred |
| OK | `GET /api/doctor/advice` | doctor | 34 |  |
| OK | `GET /api/doctor/me` | doctor | 23 |  |
| ALIVE | `GET /api/doctor/patients` | doctor | 13 | SEARCH_TOO_SHORT |
| OK | `GET /api/doctor/reports/summary` | doctor | 489 |  |
| OK | `GET /api/doctor/visits` | doctor | 628 |  |
| ALIVE | `POST /api/DoctorProfile/ChangePassword` | doctor | 8 | Information is missing |
| ALIVE | `POST /api/DoctorProfile/CustomCreate` | doctor | 6 | "undefined" is not valid JSON |
| ALIVE | `POST /api/DoctorProfile/CustomUpdate` | doctor | 8 | "undefined" is not valid JSON |
| FAIL | `POST /api/DoctorProfile/GetByUserId` | doctor | 21 | An error occurred |
| OK | `POST /api/DoctorProfile/GetCustomFormData` | doctor | 19 |  |
| ALIVE | `POST /api/DoctorProfile/GetDoctorsProfileInfo` | doctor | 13 | An error occurred |
| OK | `POST /api/DoctorsTeam/CheckSurgeryBeforeCheck` | doctor | 3 |  |
| ALIVE | `POST /api/DoctorsTeam/CreateDoctorsTeam` | doctor | 5 | An error occurred |
| ALIVE | `POST /api/DoctorsTeam/ExportDoctorsTeamPatient` | doctor | 4 | An error occurred |
| OK | `POST /api/DoctorsTeam/GetCustomFormData` | doctor | 9 |  |
| OK | `POST /api/DoctorsTeam/GetDoctorsTeams` | doctor | 5 |  |
| OK | `POST /api/DoctorsTeam/GetDoctorsTeamsWithoutPatient` | doctor | 4 |  |
| OK | `POST /api/DoctorsTeam/GetList` | doctor | 143 |  |
| ALIVE | `POST /api/DoctorsTeam/SaveDoctor` | doctor | 5 | An error occurred |
| ALIVE | `POST /api/DoctorsTeam/SavePatient` | doctor | 4 | An error occurred |
| ALIVE | `POST /api/Echo/CustomSave` | doctor | 4 | An error occurred |
| ALIVE | `POST /api/Echo/GetLastEchoId` | doctor | 9 | An error occurred |
| ALIVE | `POST /api/Echo/PrintReport` | doctor | 3 | Information is missing |
| ALIVE | `POST /api/FollowUp/CustomSave` | doctor | 5 | An error occurred |
| ALIVE | `POST /api/HfAmbulance/Confirm` | doctor | 3 | Information is missing |
| ALIVE | `POST /api/HfAmbulance/CustomSave` | doctor | 4 | An error occurred |
| ALIVE | `POST /api/HfAmbulance/GetLastData` | doctor | 4 | Information is missing |
| OK | `POST /api/HfAmbulance/GetList` | doctor | 3 |  |
| ALIVE | `POST /api/HfAmbulance/PrintReport` | doctor | 4 | Information is missing |
| ALIVE | `POST /api/HfStay/CustomSave` | doctor | 3 | An error occurred |
| OK | `POST /api/HfStay/GetCustomFormData` | doctor | 138 |  |
| ALIVE | `POST /api/HfStay/PrintReport` | doctor | 3 | Information is missing |
| ALIVE | `POST /api/ICDRhythm/Confirm` | doctor | 3 | Information is missing |
| ALIVE | `POST /api/ICDRhythm/CustomSave` | doctor | 4 | An error occurred |
| ALIVE | `POST /api/ICDRhythm/GetLastData` | doctor | 4 | Information is missing |
| OK | `POST /api/ICDRhythm/GetList` | doctor | 3 |  |
| ALIVE | `POST /api/ICDRhythm/PrintReport` | doctor | 4 | Information is missing |
| ALIVE | `POST /api/LaboratoryTest/PrintReport` | doctor | 3 | Information is missing |
| ALIVE | `POST /api/MonitoringRhythm/Confirm` | doctor | 3 | Information is missing |
| ALIVE | `POST /api/MonitoringRhythm/CustomSave` | doctor | 4 | An error occurred |
| ALIVE | `POST /api/MonitoringRhythm/GetLastData` | doctor | 4 | Information is missing |
| OK | `POST /api/MonitoringRhythm/GetList` | doctor | 4 |  |
| ALIVE | `POST /api/MonitoringRhythm/PrintReport` | doctor | 4 | Information is missing |
| OK | `POST /api/Notification/GetListData` | doctor | 183 |  |
| ALIVE | `POST /api/Organization/CustomSave` | doctor | 6 | An error occurred |
| ALIVE | `POST /api/Organization/MergePreview` | doctor | 5 | Танд байгууллага нэгтгэх эрх байхгүй байна |
| OK | `POST /api/OutPatientInfo/GetLastOutPatientInfoId` | doctor | 3 |  |
| ALIVE | `POST /api/OutPatientInfo/GetPatientPlainPassword` | doctor | 4 |  |
| ALIVE | `POST /api/OutPatientInfo/PrintByStayId` | doctor | 4 | StayId is required |
| ALIVE | `POST /api/OutPatientInfo/PrintReport` | doctor | 4 | Information is missing |
| ALIVE | `POST /api/PacemakerOne/CustomSave` | doctor | 4 | An error occurred |
| ALIVE | `POST /api/PacemakerOne/PrintReport` | doctor | 3 | Information is missing |
| ALIVE | `POST /api/PaceMakerRhythm/Confirm` | doctor | 3 | Information is missing |
| ALIVE | `POST /api/PaceMakerRhythm/CustomSave` | doctor | 3 | An error occurred |
| ALIVE | `POST /api/PaceMakerRhythm/GetLastData` | doctor | 4 | Information is missing |
| OK | `POST /api/PaceMakerRhythm/GetList` | doctor | 3 |  |
| ALIVE | `POST /api/PaceMakerRhythm/PrintReport` | doctor | 3 | Information is missing |
| ALIVE | `POST /api/PacemakerThree/CustomSave` | doctor | 3 | An error occurred |
| ALIVE | `POST /api/PacemakerThree/PrintReport` | doctor | 3 | Information is missing |
| ALIVE | `POST /api/PacemakerTwo/CustomSave` | doctor | 4 | An error occurred |
| ALIVE | `POST /api/PacemakerTwo/PrintReport` | doctor | 3 | Information is missing |
| OK | `GET /api/patient/advice` | patient | 31 |  |
| OK | `POST /api/Patient/CheckPatient` | doctor | 4 |  |
| OK | `GET /api/patient/evisits` | patient | 11 |  |
| ALIVE | `POST /api/patient/evisits` | patient | 3 | COMMENT_REQUIRED |
| OK | `POST /api/Patient/FindPatient` | doctor | 5 |  |
| OK | `GET /api/patient/journal` | patient | 20 |  |
| ALIVE | `POST /api/patient/journal` | patient | 5 | DATE_REQUIRED |
| OK | `GET /api/patient/journal/summary` | patient | 18 |  |
| OK | `GET /api/patient/me` | patient | 21 |  |
| OK | `GET /api/patient/questions` | patient | 68 |  |
| ALIVE | `POST /api/patient/questions` | patient | 6 | COMMENT_REQUIRED |
| OK | `GET /api/patient/rehab/assessment` | patient | 17 |  |
| OK | `GET /api/patient/rehab/exercises` | patient | 11 |  |
| OK | `GET /api/patient/rehab/progress` | patient | 13 |  |
| ALIVE | `POST /api/patient/rehab/progress` | patient | 4 | EXERCISE_REQUIRED |
| OK | `GET /api/patient/rehab/vitals` | patient | 38 |  |
| OK | `POST /api/patient/rehab/vitals` | patient | 38 |  |
| OK | `GET /api/patient/risk` | patient | 25 |  |
| OK | `POST /api/Patient/SearchPatient` | doctor | 5 |  |
| ALIVE | `POST /api/PatientSendPage/CustomSave` | doctor | 5 | An error occurred |
| ALIVE | `POST /api/PatientSendPage/GetCustomFormData` | doctor | 6 | An error occurred |
| ALIVE | `POST /api/PatientTransfer/CustomSave` | doctor | 6 | An error occurred |
| ALIVE | `POST /api/PatientTransfer/GetCustomFormData` | doctor | 4 | An error occurred |
| OK | `POST /api/PatientUser/CheckLogin` | doctor | 4 |  |
| ALIVE | `POST /api/PatientUser/Login` | none | 3 | An error occurred |
| OK | `POST /api/PatientUser/LogOut` | doctor | 5 |  |
| ALIVE | `POST /api/PatientUser/ResetPassword` | doctor | 4 | Information is missing |
| OK | `POST /api/RemoteVisit/GetList` | doctor | 53 |  |
| AUTH | `GET /api/report/getCVDMonitoringSuom` | none | 4 | There is a user who is not logged into the system |
| FAIL | `POST /api/Report/GetProvinceData` | doctor | 4 | An error occurred |
| ALIVE | `POST /api/Report/GetReport` | doctor | 11 | An error occurred |
| FAIL | `POST /api/RiskScores/CalculateRisk` | doctor | 9 | An error occurred |
| ALIVE | `POST /api/Stay/CustomSave` | doctor | 6 | Information is missing |
| OK | `POST /api/Stay/GetDepartments` | doctor | 29 |  |
| ALIVE | `POST /api/Stay/LeavePatient` | doctor | 6 | Information is missing |
| ALIVE | `POST /api/SurgeryPlans/cancel-patient` | doctor | 6 | Information is missing |
| ALIVE | `POST /api/SurgeryPlans/CustomSave` | doctor | 4 | An error occurred |
| OK | `POST /api/SurgeryPlans/get-list` | doctor | 3 |  |
| OK | `POST /api/SurgeryPlans/GetCustomFormData` | doctor | 4 |  |
| ALIVE | `POST /api/SurgeryPlans/PrintReport` | doctor | 4 | Information is missing |
| ALIVE | `POST /api/TenderForm/Confirm` | doctor | 4 | Id is required |
| OK | `POST /api/TenderForm/GetConfig` | doctor | 55 |  |
| OK | `POST /api/TenderForm/GetData` | doctor | 22 |  |
| OK | `POST /api/TenderForm/GetList` | doctor | 12 |  |
| OK | `POST /api/TenderForm/GetPrevious` | doctor | 14 |  |
| OK | `POST /api/TenderForm/PrintHtml` | doctor | 28 |  |
| OK | `POST /api/TenderForm/PrintReport` | doctor | 178 | application/pdf 89728b |
| OK | `POST /api/Test/CheckRegisterRegex` | none | 7 |  |
| OK | `GET /api/Test/print` | none | 1143 |  |
| ALIVE | `GET /api/Test/printNew` | none | 23 | An error occurred |
| ALIVE | `POST /api/Test/RegexTest` | none | 17 | Амжилтгүй |
| OK | `POST /api/User/CheckLogin` | doctor | 5 |  |
| OK | `POST /api/User/getUserData` | doctor | 7 |  |
| ALIVE | `POST /api/User/Login` | none | 6 | Login name or password is incorrect |
| OK | `POST /api/User/LogOut` | doctor | 5 |  |
| ALIVE | `POST /api/User/ResetPassword` | doctor | 4 | Information is missing |
| OK | `POST /api/UserRequest/CheckUserName` | none | 63 |  |
| ALIVE | `POST /api/UserRequest/Confirm` | admin | 29 | An error occurred |
| VALIDATION | `POST /api/UserRequest/GetProvinceData` | none | 225 | Model not found |
| ALIVE | `POST /api/ValveDiseases/Confirm` | doctor | 4 | Information is missing |
| ALIVE | `POST /api/ValveDiseases/CustomSave` | doctor | 5 | An error occurred |
| ALIVE | `POST /api/ValveDiseases/GetLastData` | doctor | 4 | Information is missing |
| OK | `POST /api/ValveDiseases/GetList` | doctor | 3 |  |
| ALIVE | `POST /api/ValveDiseases/PrintReport` | doctor | 5 | Information is missing |
| ALIVE | `POST /api/ValveDiseasesEndo/Confirm` | doctor | 3 | Information is missing |
| ALIVE | `POST /api/ValveDiseasesEndo/CustomSave` | doctor | 5 | An error occurred |
| ALIVE | `POST /api/ValveDiseasesEndo/GetLastData` | doctor | 3 | Information is missing |
| OK | `POST /api/ValveDiseasesEndo/GetList` | doctor | 4 |  |
| ALIVE | `POST /api/ValveDiseasesEndo/PrintReport` | doctor | 4 | Information is missing |
| ALIVE | `POST /api/VascularDisease/Confirm` | doctor | 3 | Information is missing |
| ALIVE | `POST /api/VascularDisease/CustomSave` | doctor | 3 | An error occurred |
| ALIVE | `POST /api/VascularDisease/GetLastData` | doctor | 3 | Information is missing |
| OK | `POST /api/VascularDisease/GetList` | doctor | 4 |  |
| ALIVE | `POST /api/VascularDisease/PrintReport` | doctor | 4 | Information is missing |
| OK | `POST /api/Visit/GetCustomFormData` | doctor | 164 |  |
| OK | `POST /api/Visit/GetLastVisitId` | doctor | 97 |  |
| OK | `POST /api/Visit/GetVisitsByPatient` | doctor | 724 |  |
| OK | `POST /api/Visit/PrintAmbulatori` | doctor | 786 | application/pdf 106364b |
| OK | `POST /api/Visit/PrintAmbulatoriHTML` | doctor | 147 |  |
| ALIVE | `POST /api/Visit/PrintReport` | doctor | 12 | Information is missing |
| OK | `GET /health` | none | 5 |  |
