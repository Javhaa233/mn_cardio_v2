# Backend — мобайл тендерийн ДУТУУ endpoint-ууд

Зөвхөн **хийгдээгүй** зүйлс. Хийгдсэн endpoint-уудын гэрээ: [API.md](API.md),
[HANDOVER-2026-09-14.md](HANDOVER-2026-09-14.md).

Шалгасан: 2026-09-14, `origin/main` `d295b51`-ийг merge хийсний дараа — код болон туршилтын сервер
`https://mncardio.itsystem.mn` (нэвтрэлтгүй хүсэлт: байршсан мобайл route `401`, байхгүй `404`).

- **А. Backend хийх ажил** — гадны шийдвэр хүлээхгүй, одоо хийж болно (1–15)
- **Б. Туршилтын сервер дээр асаах flag** — код бэлэн, анхдагчаар унтраалттай
- **В. ЗСҮТ / гадны байгууллагын шийдвэр хүлээж буй**

## Дүрэм

`/api/patient/*`, `/api/doctor/*`-ийн одоогийн дүрмээр: жинхэнэ HTTP verb ба статус код,
`{ success, message, data, code }`, жагсаалт `?limit &offset` → `{ total, limit, offset }`, огноо
`?from &to`, **хэрэглэгч/эмч/үйлчлүүлэгчийн өөрийн id-г зөвхөн токеноос**, route бүр `gate`-тай.

---

# А. Backend хийх ажил

Мобайл аппад нөлөөлөх дарааллаар.

## 1. Эмчийн мэдэгдлийн жагсаалт

Сервер `404`. Эмч `/api/doctor/devices` бүртгэж чадах ч мэдэгдлээ апп дотор харах зам байхгүй.
Үйлчлүүлэгчийн 4 endpoint-той ижил хэлбэрээр:

```
GET  /api/doctor/notifications              ?limit &offset &unread=1
GET  /api/doctor/notifications/unread-count
POST /api/doctor/notifications/:id/read
POST /api/doctor/notifications/read-all
```

`ToUserId = req.Doctor.UserId`. Талбарууд үйлчлүүлэгчийнхтэй ижил (`NotesMn`, `Seen` boolean,
`Action`, `LinkObjectName`, `LinkObjectId`).

## 2. Push мэдэгдэл үүсгэх газрууд

Одоо `NotificationHelper.NotifyPatient` зөвхөн 2 газар дуудагддаг: `ReplyQuestion`, `EvisitScheduled`.

| Үйл явдал | Хүлээн авагч | Хаана нэмэх |
|---|---|---|
| Зөвлөгөө нийтлэгдсэн | тухайн үйлчлүүлэгч | `AdviceController` `CustomSaveAndPublish` |
| Зөвлөгөөнд сэтгэгдэл | үйлчлүүлэгч, тасалбарын эмч | `AdviceController` `CreateComment` |
| Чатын мессеж (хүлээн авагч socket-д холбогдоогүй) | өрөөний гишүүд | `ChatController` `CommitMessage` |
| Цахим үзлэг дууссан / цуцлагдсан | үйлчлүүлэгч | `api/doctor` `complete`, `cancel` |
| Үйлчлүүлэгч цахим үзлэг хүсэлт илгээсэн / цуцалсан | эмч (care team) | `api/patient` `createEvisit`, `cancel` |
| Үйлчлүүлэгч асуулт илгээсэн | хяналтын эмч | `api/patient` `createQuestion` |
| Сэргээн засах үнэлгээ бичигдсэн | үйлчлүүлэгч | `api/doctor` `POST /patients/:id/rehab/assessment` |

## 3. Эмч үйлчлүүлэгчийн эрсдэл, цахим үзлэгийг харах — §2.1

| | Endpoint | Ажил |
|---|---|---|
| Шинэ | `GET /api/doctor/patients/:id/risk` | `GET /api/patient/risk`-тэй ижил `{ bodySize, history }`. `AccessAudit.RecordAccess` (`ViewRisk`) |
| Өөрчлөх | `GET /api/doctor/evisits` | `?patientId=` шүүлтүүр. Апп одоо хуучин `/api/RemoteVisit/GetList`-ийг дуудаж, өөр хүний мөр орж ирсэн эсэхийг клиент дээр шалгаж байна |

## 4. Асуултад зураг, дуу, баримт хавсаргах — §2.3

| | Endpoint | Ажил |
|---|---|---|
| Өөрчлөх | `POST /api/patient/questions` | `multipart/form-data`: `comment` + `files` (≤5, allowlist, тус бүр ≤20 MB). `comment` эсвэл `files`-ийн аль нэг заавал. `File.LinkedObjectName='VisitComments'` |
| Өөрчлөх | `POST /api/doctor/monitoring/:patientId/questions` | Мөн адил multipart |
| Өөрчлөх | `GET /api/patient/questions`, `GET /api/doctor/monitoring/:patientId/questions` | Мөр бүрт `files: [{ id, name, ext, size, url }]` |
| Өөрчлөх | `MayAttachTo` / татах зам | `VisitComments`-ийн файлыг зөвхөн тухайн үйлчлүүлэгч ба хяналтын эмч татах |

## 5. Онош, ICD, эмчээр хайх — §1.3, §1.4

Сервер `GET /api/doctor/icd10` → `404`.

| | Endpoint | Ажил |
|---|---|---|
| Шинэ | `GET /api/doctor/icd10?search=` | `vwICD10`-оос, min 2 тэмдэгт, max 20 → `[{ code, name_mn, name_en }]` |
| Өөрчлөх | `GET /api/doctor/visits` | `?icd10=` (код эсвэл угтвар), `?diagnosis=`, `?doctor=` |
| Өөрчлөх | `GET /api/doctor/patients` | `?icd10=` — тухайн оноштой үзлэгтэй үйлчлүүлэгчид; `icd10` байвал `search` заавал биш |

## 6. Апп шинэчлэлт ба тохиргоо — §2.1, §1.3

| | Endpoint | Ажил |
|---|---|---|
| DDL | `MobileSetting (Id, [Key], Value NVARCHAR(MAX), UpdateDate, UpdateUserId)` + ModelConfig | Админ вебээс засна |
| Шинэ | `GET /api/mobile/version?platform=ios\|android&build=` | Нэвтрэлтгүй. `{ latestVersion, latestBuild, minSupportedBuild, forceUpdate, storeUrl, releaseNotes }` |
| Өөрчлөх | `/api/patient/*`, `/api/doctor/*` | `X-App-Build` < `minSupportedBuild` бол `426 UPDATE_REQUIRED` |
| Шинэ | `GET /api/mobile/config` | `{ termsText, termsVersion, supportPhone }` |

## 7. Сэргээн засах үнэлгээний түүх — §4.1

```
GET /api/patient/rehab/assessments   ?limit &offset
```
Одоо `GET /rehab/assessment` зөвхөн сүүлийн нэгийг буцаадаг.

## 8. Эмч асран хамгаалагчийн зөвшөөрөл бүртгэх — §1.2

Үйлчлүүлэгч өөрөө `/api/patient/consents` ашиглана. Зөвшөөрөл өгөх чадамжгүй үйлчлүүлэгчийн
асран хамгаалагчийнхыг эмч бүртгэх зам байхгүй.

```
GET  /api/doctor/patients/:id/consents
POST /api/doctor/patients/:id/consents   { purposeCode, granted, guardianRegNo*, guardianName*, guardianRelation* }
```

## 9. Шинжилгээ, оношлогоо — §3.1

`LaboratoryTest`, `EchoExamination`, `CathLab`, ЗЦБ хүснэгтүүд бий, мобайл зам байхгүй.

| | Endpoint | Ажил |
|---|---|---|
| Шинэ | `GET /api/doctor/patients/:id/diagnostics?type=lab\|echo\|cathlab\|ecg&from&to` | `[{ type, id, date, title, summary, organization }]` |
| Шинэ | `GET /api/doctor/diagnostics/:type/:id` | `lab` → `{ name, value, unit, refRange, flag }[]` |
| Шинэ | `GET /api/patient/diagnostics`, `GET /api/patient/diagnostics/:type/:id` | Өөрийн хариу |

`Confidentiality` ба `AccessAudit.RecordAccess` заавал (ДОХ зэрэг шинжилгээ яг энд).

## 10. Хэрэглэгч тус бүрээр эрх — §1.2

`Roles`, `Permissions`, `RoleToPermission`, `UserToRole` ашиглагддаггүй.

| | Endpoint | Ажил |
|---|---|---|
| Өөрчлөх | `GET /api/doctor/me` | `permissions: [{ object, create, read, update, delete }]` |
| Шинэ middleware | `helper/RequirePermission.js` | `/api/doctor/*` route бүрд, эрхгүй бол `403 PERMISSION_DENIED` |

⚠️ `model/BaseModel/Permissions.js`-д `UpdateUrl` нь `Sequelize.DATE` — бусад нь STRING.

## 11. Backup — §1.3

`controllers/system/AppController.js` `ScheduleBackUp` өөрчлөгдөөгүй: амжилттай үед `Status` бичдэггүй
(зөвхөн алдаа дээр `0`), бүтэлгүйтвэл хэнд ч мэдэгдэхгүй.

| | Ажил |
|---|---|
| Засах | Амжилттай үед `Status=1, CreatedDate, FileName`; алдаа гарвал админд мэдэгдэл |
| Шинэ | `GET /api/admin/backups?limit&offset` (role 1, 6) |
| Сервер | `spFullBackup` production дээр байгаа эсэх, өөр газар хуулбар, хадгалах хугацаа, сэргээлтийн туршилт |

## 12. Цагийн эталон — §1.3

| | Ажил |
|---|---|
| Шинэ | `GET /api/time` → `{ serverTime, timezone, ntpSynced }`, нэвтрэлтгүй |
| Сервер | `chrony`-г эрх бүхий байгууллагын NTP-тэй тохируулах (app + MSSQL сервер) |

## 13. Экспорт — §1.8

| | Endpoint | Ажил |
|---|---|---|
| Шинэ | `GET /api/patient/journal/export?from&to&format=xlsx\|txt` | Эх сурвалжийн тэмдэглэгээтэй |
| Шинэ | `GET /api/doctor/visits/:id/print` | Үзлэгийн тэмдэглэлийн PDF |

## 14. ЭМД кодчилол (мобайл) — §1.6

Хуучин `POST /api/EMDService/getTablet*` л байна.

```
GET /api/doctor/emd/drugs?icd10=&search=
GET /api/doctor/emd/services?search=
```

## 15. FHIR / ЭМХТ — §1.3, §1.4

Байгаа: `/api/fhir/metadata`, `Patient/:id`, `Condition`.

| | Endpoint | Ажил |
|---|---|---|
| Шинэ | `GET /api/fhir/Encounter?patient=` | `Visit` → `Encounter` |
| Шинэ | `GET /api/fhir/Observation?patient=&code=` | `PatientMonitoring`, `LaboratoryTest` → LOINC кодтой |
| DDL | `CodeMapping (Id, LocalObject, LocalCode, System, Code, Display)` | Дотоод талбар → LOINC / SNOMED CT |
| Шинэ | `POST /api/integrations/emht/visits/:id` | А611 (АМ-1Б) бүтцээр ЭМХТ руу — интерфейсийн тодорхойлолт ⛔ |

---

# Б. Туршилтын сервер дээр асаах flag

Код бэлэн боловч `helper/FeatureFlags.js`-д **анхдагчаар унтраалттай**. Сервер асахдаа PM2 логт
`[FeatureFlags] {...}` мөр бичдэг — туршилтын сервер дээр шалгаж, UAT-аас өмнө асаах.

| Flag | Анхдагч | Юу асна | Асаахгүй бол |
|---|---|---|---|
| `FEATURE_LOGIN_LOCKOUT` | `false` | 3 буруу нууц үг → 15 мин түгжээ + имэйл | §2.1 шаардлага UAT-д унана |
| `FEATURE_ACCESS_LOG_API` | `false` | `GET /api/patient/access-log` | "Хэн миний мэдээллийг харсан" дэлгэц ажиллахгүй. Асаахаас өмнө `IX_UserActionHistory_PatientId` индекс хэрэгтэй |
| `ACCESS_NOTIFY_POLICY` | `none` | Мэдээлэлд хандахад үйлчлүүлэгчид мэдэгдэл (`every` / `digest` / `nontreating`) | Лог бичигдэнэ (`FEATURE_ACCESS_AUDIT=true`), мэдэгдэл очихгүй. Утгыг ЗСҮТ сонгоно ⛔ |
| `FEATURE_CONSENT` | `false` | Зөвшөөрөл | `/api/patient/consents` ажиллахгүй |
| `TOKEN_REVOCATION_ENABLED` | `false` | Гарахад токен үнэхээр хүчингүй болох | `/auth/logout` токеныг 10 цаг хүчинтэй үлдээнэ |
| `RATE_LIMIT_ENABLED` | `false` | Login, нууц үг сэргээх хязгаар | Нууц үг таах халдлагад нээлттэй |
| `FEATURE_FHIR_EXPORT` | `false` | `/api/fhir/*` | |
| `PUSH_DRIVER` | `auto` | Байгаа түлхүүрээс драйвер сонгоно | Түлхүүргүй бол зөвхөн логлоно — Firebase/APNs түлхүүр ⛔ |
| `FEATURE_DOCTOR_LICENCE` | `off` | Лицензгүй эмч нэвтрэхгүй | ⚠️ 660 байгууллагад код байхгүй — `enforce` хийвэл бүгд түгжигдэнэ. Эхлээд `warn` |
| `FEATURE_CONFIDENTIALITY` | `off` | Нууцын ангилал | Одоогоор `warn` хүртэл л (матриц ⛔) |

---

# В. ЗСҮТ / гадны шийдвэр хүлээж буй

Эдгээр нь кодоор дангаараа дуусахгүй. Шийдвэр ирмэгц backend ажил эхэлнэ.

| Шаардлага | Хүлээгдэж буй | Дараа нь backend хийх |
|---|---|---|
| ХУР — бүртгэлийн мэдээлэл татах (§1.2) | ХУР-ын эрх, түлхүүр, үйлчилгээний жагсаалт | `POST /api/xyp/otp`, `/api/xyp/citizen`, `/api/patient/me/xyp-sync`, `POST /api/doctor/patients`. Одоо зөвхөн `testCall` |
| Цахим гарын үсэг — ДАН (§1.3) | ДАН-ы гэрээ | `/api/sign/requests`, `callback`, `verify` + `DigitalSignature` DDL |
| Эм, эмнэлгийн хэрэгслийн сан (§1.5) | Нэгдсэн сангийн API хандалт | `GET /api/drugs`, `/api/medical-devices` + синк job |
| Өртөг, зардал (§1.8) | Тарифын жагсаалт, аргачлал | `ServiceTariff` DDL, `GET /api/doctor/patients/:id/cost` |
| Эрсдэлийн оноо — ЗСӨ (§2.5) | Аргачлал, эрсдэлийн ангилал | `GET /api/patient/risk`-д `score, riskClass` |
| Нууцын ангилал enforce (§1.2) | Эрхийн матриц | `FEATURE_CONFIDENTIALITY=enforce` + дүрэм |
| Лицензийн код enforce (§1.2) | Кодын эх сурвалж, шилжилтийн хугацаа | `FEATURE_DOCTOR_LICENCE=enforce` |
| Хандах бүрт мэдэгдэл (§1.2) | "Хандах бүрт"-ийн утга | `AccessNotify` бодлого сонгох |
| Батлагдсан маягтаар тайлан (§1.8) | Маягтын загвар | Тайлангийн endpoint |
| Push бодит хүргэлт (§2.1) | Firebase төсөл, APNs түлхүүр (ЗСҮТ-ийн нэр дээр) | Түлхүүр тохируулах (`PUSH_DRIVER=auto`) |
| 39 дасгалын видео (§4.2) | Нэр, зураг авалт, хадгалах газар | `RehabExercise.MediaRef` бөглөх |
| Видео дуудлага (§2.6) | Дэд бүтэц | `MeetingUrl` үүсгэгч |
| ЭМХТ интерфейс, FHIR хэмжээ (§1.4) | Бичгээр тохиролцох | 15-р хэсгийн ЭМХТ илгээх |
