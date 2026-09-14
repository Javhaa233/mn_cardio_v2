# Backend хөгжүүлэгчид — мобайл тендерийн дутуу шаардлагуудын endpoint-ууд

Мобайл тендерийн шаардлагыг кодтой тулгасан шалгалтаар 🟡 хэсэгчлэн (16) ба ❌ хийгдээгүй (21)
гарсан зүйлсийг ✅ болгоход backend талд хийх ажил. Огноо: 2026-09-14. Одоогийн API-ийн тайлбар:
[API.md](API.md).

- **А хэсэг (1–9)** — 🟡 хэсэгчлэн хийгдсэн
- **Б хэсэг (10–27)** — ❌ огт хийгдээгүй

## Нийт дүн

| | А (шар) | Б (улаан) | Нийт |
|---|---|---|---|
| Шинэ endpoint | 17 | 46 | **63** |
| Өөрчлөх endpoint | 9 | 8 | **17** |
| Шинэ middleware / helper / job | 1 | 7 | **8** |
| DDL (өгөгдлийн сангийн өөрчлөлт, хэсгээр) | 4 | 11 | **15** |
| ЗСҮТ эсвэл гадны байгууллагын шийдвэр, гэрээ хүлээж буй | 4 | 10 | **14** |

## Бүх endpoint-д мөрдөх дүрэм

`/api/patient/*`, `/api/doctor/*`-ийн одоогийн дүрмийг яг хэвээр мөрдөнө (`api/doctor/index.js`
толгойн тайлбар):

- жинхэнэ HTTP verb ба статус код; `{ success, message, data }` жижиг үсэгтэй envelope, алдаа дээр `code`
- жагсаалт `?limit` (default 20, max 100) `&offset` → `{ total, limit, offset }`
- огнооны шүүлтүүр `?from &to`
- **эмч, хэрэглэгч, байгууллага, үйлчлүүлэгчийн өөрийн id-г request-ээс хэзээ ч авахгүй** — зөвхөн токеноос
  (`req.Doctor`, `req.Patient`)
- гарц бүр `gate` (VerifyTokenJson + RequireDoctor/RequirePatient)-тай, route тус бүр дээр
- файл татах бүх зам эзэмшил шалгана. `POST /api/BaseObject/downloadFile`-г **ашиглахгүй**
  (эзэмшил шалгадаггүй, API.md §7)

---

# А. 🟡 Хэсэгчлэн хийгдсэн

## 1. Хэрэглэгч тус бүрээр эрх тохируулах — §1.2

Одоо зөвхөн `RoleId`-ийн тоогоор ялгадаг. `Roles`, `Permissions`, `RoleToPermission`,
`UserToRole` хүснэгтүүд байгаа ч ашиглагддаггүй. Вебэд `view/Security/Permissions.jsx`,
`RoleToPermission.jsx` удирдах дэлгэц аль хэдийн бий.

| | Endpoint | Ажил |
|---|---|---|
| Өөрчлөх | `GET /api/doctor/me` | `data.permissions: [{ object, create, read, update, delete }]` нэмнэ — UserToRole → RoleToPermission → Permissions-оос нэгтгэсэн |
| Шинэ middleware | `helper/RequirePermission.js` | `requirePermission('Visit', 'read')` хэлбэртэй. `/api/doctor/*` route бүрд тавина. Эрхгүй бол `403 PERMISSION_DENIED` |

- Мобайлын объектуудад `Permissions` мөр нэмнэ (`Visit`, `PatientMonitoring`, `Advice`, `Report`,
  `PatientCard`, `RemoteVisit`, `Rehab`) — өгөгдөл, DDL биш.
- ⚠️ `model/BaseModel/Permissions.js`-д `UpdateUrl` нь `Sequelize.DATE` гэж зарлагдсан — бусад нь
  STRING. `adv_ticket_closed`-тэй ижил алдаа байж магадгүй, шалгана уу.
- Хэрэглэгчид role оноох (`UserToRole`) дэлгэц вебэд байгаа эсэхийг шалгах. Байхгүй бол нэмнэ.

## 2. Бүх талбараар хайх (үйлчлүүлэгч, өвчин, онош, эмч) — §1.3, §1.4

| | Endpoint | Ажил |
|---|---|---|
| Өөрчлөх | `GET /api/doctor/visits` | `?icd10=` (яг код эсвэл угтвар, `I21%`), `?diagnosis=` (`main_diagnosis_mn` LIKE), `?doctor=` (DoctorsProfile овог/нэр) нэмнэ. `search` нь `icd10`, `main_diagnosis_mn`-ийг ч хамарна |
| Өөрчлөх | `GET /api/doctor/patients` | `?icd10=` — тухайн оноштой үзлэгтэй үйлчлүүлэгчид. `search` 3 тэмдэгтийн доод хязгаар хэвээр, гэхдээ `icd10` байвал `search` заавал биш |
| Шинэ | `GET /api/doctor/icd10?search=` | Автомат гүйцээлт. `vwICD10`-оос, min 2 тэмдэгт, max 20 мөр → `[{ code, name_mn, name_en }]` |

## 3. Админ бүтцийн тохиргоо, мобайлын админ веб — §1.3, §2.1

Контентыг хөгжүүлэгчгүйгээр шинэчлэх боломж. Ерөнхий `BaseObject` engine-ийг ашиглана — шинэ
controller бичихгүй (CLAUDE.md §4).

| | Юу | Ажил |
|---|---|---|
| ModelConfig | `ModelConfigs/RehabExerciseConfig.js` | `mainConfig.js`-д бүртгэнэ → `/api/BaseObject/` list, create, update, destroy, uploadFile, ExportExcel автоматаар |
| DDL + ModelConfig | `MobileSetting` (Id, Key, Value NVARCHAR(MAX), UpdateDate, UpdateUserId) | Үйлчилгээний нөхцөлийн текст, дэмжлэгийн утас зэрэг |
| Шинэ | `GET /api/mobile/config` | Нэвтэрсэн хэн ч. → `{ termsText, termsVersion, supportPhone, reminderTypes[{value,label}], exerciseCategories[{value,label}] }`. Сонголтууд `OptionTypes`-оос (`mobile_reminder_type`, `rehab_exercise_category`) |

Frontend: `routes/settingsRoutes.js`-д "Мобайл апп" цэс — дасгалын каталог, тохиргоо (role 1, 6).

## 4. Эмчийн тайлан — экспорттой болгох — §2.1 Миний тайлан

> **Шинэчлэл 2026-09-14 — заавал биш болсон.** Апп Excel/CSV/TXT файлыг утсан дээр өөрөө үүсгэдэг
> болсон (`mobile/app/lib/features/doctor/report_export.dart`): одоогийн `/reports/summary` ба
> `/visits`-ээс авч, эх сурвалжийн тэмдэглэгээтэй. Утсан дээр 5,000 үзлэгийн хязгаартай. Доорх
> endpoint-ууд зөвхөн түүнээс том тайлан, эсвэл байгууллагын түвшний экспорт хэрэгтэй болбол.

| | Endpoint | Ажил |
|---|---|---|
| Шинэ | `GET /api/doctor/reports/summary/export?from&to&format=xlsx\|csv\|txt` | Файл stream, `Content-Disposition: attachment`. ExcelJS (`helper/excel.js`) |
| Шинэ | `GET /api/doctor/visits/export?` + `/visits`-ийн бүх шүүлтүүр `&format=` | Дээд тал 10 000 мөр, түүнээс их бол `400 EXPORT_TOO_LARGE` |

Файл бүрийн толгойд **эх сурвалжийн тэмдэглэгээ** (тендерт заавал): байгууллагын нэр, мэдээллийн
сан (`MnCardio`), гаргасан хэрэглэгч, огноо цаг, шүүлтүүр. Мобайл Bearer токентой GET-ээр татна.

## 5. Эмч үйлчлүүлэгчийн эрсдэл, цахим үзлэг, сэргээн засахыг харах — §2.1

Одоо апп цахим үзлэгийг хуучин `/api/RemoteVisit/GetList`-ээр шүүж, өөр хүний мөр орж ирсэн эсэхийг
клиент дээр шалгаж байна (`doctor_repository.dart` `fetchPatientEvisits`). Эрсдэл, сэргээн засахад
зам огт байхгүй.

| | Endpoint | Хариу |
|---|---|---|
| Шинэ | `GET /api/doctor/patients/:id/risk` | `GET /api/patient/risk`-тэй ижил `{ bodySize, history }` |
| Шинэ | `GET /api/doctor/patients/:id/evisits?limit&offset` | `RemoteVisit` мөрүүд (6-р хэсгийн баганатай) |
| Шинэ | `GET /api/doctor/patients/:id/rehab` | `{ assessment, assessments[10], progress[30], vitals{ rows, labels, series{pulse, spo2} } }` |

- Хамрах хүрээ `getPatient`-тэй ижил байна. ⚠️ `getPatient` одоо **байгууллагаар шүүдэггүй** —
  аль ч эмч аль ч үйлчлүүлэгчийг id-гаар нээнэ. Үндэсний систем тул санаатай эсэхийг шийдэх
  шаардлагатай. "Мэдээлэлд хандсан үед мэдэгдэл" (улаан) шаардлагын лог яг энэ 4 endpoint дээр
  бичигдэнэ.

## 6. Асуултад зураг, дуу, баримт хавсаргах — §2.3

Upload allowlist-д `mp3, m4a, aac, ogg, wav, webm`, зураг, pdf, doc аль хэдийн бий
(`BaseController.js` `ALLOWED_UPLOAD_EXT`).

| | Endpoint | Ажил |
|---|---|---|
| Өөрчлөх | `POST /api/patient/questions` | `multipart/form-data`: `comment` + `files` (≤5 ширхэг, allowlist, тус бүр ≤20 MB). `comment` эсвэл `files`-ийн аль нэг заавал. `File` мөрөнд `LinkedObjectName='VisitComments'`, `LinkedObjectId=id_data` |
| Өөрчлөх | `GET /api/patient/questions` | мөр бүрт `files: [{ id, name, ext, size }]` (эмчийн хариуны файл ч мөн) |
| Шинэ | `GET /api/patient/files/:id` | Файлын stream. `File` → `VisitComments.patient_id === req.Patient.PatientId` биш бол 404 |

Эмчийн хариу вебийн хуучин урсгалаар бичигддэг — тэнд хавсаргасан файл `VisitComments`-д мөн
холбогдсон байх ёстой.

## 7. Цахим үзлэг — захиалга, төлөв, видео — §2.6

Одоо зөвхөн "гомдлын хайрцаг" (Comment, CreateDate). **DDL:** `scripts/add_remotevisit_booking_columns.sql`
бичигдсэн, ажиллаагүй. Ажиллуулсны дараа `model/PatientMonitoring/RemoteVisit.js`-д `RequestedDate,
ScheduledDate, Status, DoctorId, UpdateDate` нэмнэ. `remotevisit_status` dico утгуудыг ЗСҮТ батална.

**Үйлчлүүлэгч**

| | Endpoint | Ажил |
|---|---|---|
| Өөрчлөх | `POST /api/patient/evisits` | `{ Comment*, RequestedDate }` → `Status='requested'` |
| Өөрчлөх | `GET /api/patient/evisits` | `Status, StatusLabel, RequestedDate, ScheduledDate, Doctor{ name }` нэмнэ |
| Шинэ | `POST /api/patient/evisits/:id/cancel` | Зөвхөн `requested`, `scheduled` төлөвтэйг. Өөрийнх биш бол 404 |
| Шинэ | `GET /api/patient/evisits/:id/call` | `{ joinUrl, expiresAt }` — зөвхөн `scheduled` ба цаг нь ±15 мин дотор |

**Эмч**

| | Endpoint | Ажил |
|---|---|---|
| Шинэ | `GET /api/doctor/evisits?status&from&to&limit&offset` | Байгууллагын хүрээнд (`OrganizationIds`) |
| Шинэ | `GET /api/doctor/evisits/:id` | Үйлчлүүлэгчийн товч мэдээлэлтэй |
| Шинэ | `PATCH /api/doctor/evisits/:id` | `{ Status, ScheduledDate }`. `DoctorId` токеноос. Төлөв солигдоход `Notification` мөр |
| Шинэ | `POST /api/doctor/evisits/:id/call` | `{ joinUrl, expiresAt }` |

⚠️ **Шийдвэр хэрэгтэй:** видео дуудлагын дэд бүтэц (жишээ нь өөрийн сервер дээрх Jitsi + JWT).
Шийдэгдтэл `call` хоёр endpoint-ийг хойшлуулж, захиалгын урсгалыг эхэлж хийж болно.

## 8. Сэргээн засах — §2.7, §4.1 (эрсдэл/ачаалал, амин үзүүлэлт, зөвлөгөө)

Туршилтын сервер дээр 4 хүснэгт үүссэн, 6 endpoint 200 буцаадаг (API.md §3, 2026-09-10).
Дутуу нь:

| | Endpoint / ажил | Тайлбар |
|---|---|---|
| DDL | `add_rehabilitation_tables.sql`-г **production** дээр ажиллуулах | Туршилтын сервер дээр л ажилласан |
| Өгөгдөл | Дасгалын каталог (`RehabExercise`) бөглөх | 3-р хэсгийн админ дэлгэцээр. Одоо 0 мөр |
| Шинэ | `POST /api/doctor/patients/:id/rehab/assessment` | `{ AssessmentDate, RiskLevel, ToleranceScore, ToleranceUnit, Notes }`. `Notes` = эмчийн зөвлөгөө. `CreateUserId` токеноос. Одоо үнэлгээ бичих зам огт байхгүй |
| Шинэ | `GET /api/patient/rehab/assessments?limit&offset` | Үнэлгээний түүх (одоо зөвхөн сүүлийнх) |
| Шинэ | `GET /api/media/exercises/:id` | Видео stream, **HTTP Range (206)** дэмжинэ — видео тоглуулагч үүнгүй ажиллахгүй. Нэвтэрсэн хэрэглэгч. `MediaRef`-ээс файл |

`RiskLevel` утгууд (`rehab_risk_level` dico) ЗСҮТ-ийн сэргээн засах эмч нар батална.

## 9. 3 удаа буруу нууц үг → мэдэгдэл — §2.1

Одоо зөвхөн утсан дээр тоолж анхааруулна. Сервер тоолдоггүй.

**DDL (шинээр бичих):** `Users` ба `PatientUsers`-д
`FailedLoginCount INT NOT NULL DEFAULT 0`, `LastFailedLoginAt DATETIME NULL`, `LockedUntil DATETIME NULL`.

| | Endpoint | Ажил |
|---|---|---|
| Өөрчлөх | `POST /api/User/Login` (`controllers/auth/UserController.js`) | Буруу бол +1, зөв бол 0. 3 дахь буруу дээр: имэйл (`MailHelper`) + `Notification` мөр. `LockedUntil` идэвхтэй бол нууц үг шалгалгүй `Locked: true` |
| Өөрчлөх | `POST /api/PatientUser/Login` (`PatientUserController.js`) | Мөн адил |

- Хариуд `Locked`, `LockedUntil` нэмнэ. **Нэвтрэх нэр байгаа эсэхийг илчлэхгүй** — байхгүй нэр
  дээр ч мессеж ижил.
- Имэйлд: огноо цаг, IP, төхөөрөмж, "Нууц үг сэргээх" холбоос.
- Түгжих хугацаа (жишээ нь 15 мин) — ЗСҮТ-ээр батлуулна.
- ⚠️ `UserController.js` нь `NODE_ENV !== 'production'` үед нууц үг огт шалгадаггүй (CLAUDE.md §10) —
  туршилтын орчинд энэ онцлог шалгагдахгүй.

---

# Б. ❌ Огт хийгдээгүй

## 10. Нэвтрэх нэр мэргэжлийн зөвшөөрлийн кодтой уялдах — §1.2

Трекерийн 13-р мөр "Дууссан" гэж бичигдсэн ч `DoctorsProfile`-д кодын багана ч, login дээр
шалгалт ч байхгүй. Хүлээн авах шалгуур: **"Зөвшөөрлийн кодгүй эмч нэвтрэхгүй"**.

**DDL:** `DoctorsProfile`-д `license_no NVARCHAR(30)`, `license_expire_date DATE`,
`license_verified_at DATETIME`, `license_verified_by INT` (хуучин үеийн хүснэгт — snake_case).

| | Endpoint | Ажил |
|---|---|---|
| Өөрчлөх | `POST /api/User/Login` | RoleId 2, 3 бол `license_no` хоосон, хугацаа дууссан эсвэл баталгаажаагүй үед токен олгохгүй → `Success:false, Code:'LICENSE_REQUIRED'` |
| Өөрчлөх | `GET /api/doctor/me` | `license{ no, expireDate, verified }` нэмнэ |
| Өөрчлөх | `RequireDoctor` middleware | Токен хүчинтэй байх хугацаанд лиценз цуцлагдвал `403 LICENSE_INVALID` |
| Шинэ | `POST /api/admin/doctors/:id/license` | Админ (role 1, 6): `{ licenseNo, expireDate }` бүртгэж баталгаажуулна. Аудит мөр бичнэ |

⚠️ **Шийдвэр:** кодын эх сурвалж (ЭМХТ-ийн бүртгэлээс татах уу, админ гараар оруулах уу), одоо
кодгүй эмч нарт шилжилтийн хугацаа (BLOCKERS.md §4).

## 11. Нууцын ангиллын мэдээллийг нуух — §1.2

Жишээ: ДОХ-ын шинжилгээний хариу. Эрүүл мэндийн салбарын албаны нууцын жагсаалтын дагуу.

**DDL:** `DataClassification (Id, ObjectName, FieldName NULL, Level, Description)` — аль хүснэгт,
аль талбар нууц болохыг тодорхойлно. Мөр түвшинд: шаардлагатай хүснэгтүүдэд `ConfidentialLevel INT NULL`.

| | Endpoint / ажил | Ажил |
|---|---|---|
| Шинэ helper | `helper/Confidential.js` | `Mask(ObjectName, rows, LogedUser)` — эрхгүй хэрэглэгчид нууц талбарыг `null`, мөрийг `{ confidential: true }` болгоно |
| Шинэ permission | `ViewConfidential` (1-р хэсгийн `Permissions`-д) | Хэн харахыг хэрэглэгч тус бүрээр |
| Өөрчлөх | `/api/doctor/visits/:id`, `/patients/:id`, 5 ба 27-р хэсгийн бүх унших endpoint | Хариу буцаахаас өмнө `Mask()` |

⚠️ **Хүлээгдэж буй:** нууцын ангилал ба эрхийн матриц — ЗСҮТ (албан бичгийн №8). Матриц ирэхээс
өмнө `helper` ба DDL-ийг бэлдэж болно, хоосон ангилалтай бол юу ч нуухгүй.

## 12. ХУР — бүртгэлийн мэдээлэл татах, солилцох — §1.2, §1.3

`controllers/integrations/XypServiceController.js`-д зөвхөн `testCall` (`WS100125_checkCitizenRegnum`,
`WS100008_registerOTPRequest`) бий. `helper/xypSign.js`, `config/Xyp/` сертификат бэлэн.

| | Endpoint | Ажил |
|---|---|---|
| Шинэ | `POST /api/xyp/otp` | `{ regnum }` → иргэний утсанд ХУР-ын OTP илгээнэ (иргэний зөвшөөрлийн урсгал) |
| Шинэ | `POST /api/xyp/citizen` | `{ regnum, otp }` → `{ lastname, firstname, birthday, gender, address{ aimag, sum, bag, detail }, photo? }`. Хадгалахгүй, зөвхөн буцаана |
| Шинэ | `POST /api/patient/me/xyp-sync` | Үйлчлүүлэгч: `{ otp }` → өөрийн `Patient` мөрийг ХУР-ын мэдээллээр шинэчилнэ. `regnum` токеноос |
| Шинэ | `POST /api/doctor/patients/xyp-lookup` | Эмч: шинэ үйлчлүүлэгч бүртгэхэд `{ regnum, otp }` |
| Шинэ | `POST /api/doctor/patients` | ХУР-аас татсан мэдээллээр `Patient` үүсгэх. Давхардал бол `409 PATIENT_EXISTS` |

- ХУР-ын дуудлага бүрийг лог хүснэгтэд бичнэ (ХУР-ын гэрээнд шаардагддаг): `XypCallLog (Id, Service, Regnum, UserId, CalledAt, ResultCode)` — **DDL**.
- "Мэдээлэл нийлүүлэх" тал (ХУР руу өгөх) — ямар мэдээлэл нийлүүлэхийг ХУР-тай гэрээнд тодорхойлно.

⚠️ **Хүлээгдэж буй:** ХУР-ын эрх, түлхүүр, үйлчилгээний жагсаалт — ЗСҮТ (албан бичгийн №6).
`XYP_KEY`, `XYP_TOKEN` `Config.env`-д.

## 13. Хувийн мэдээлэл ашиглах "Зөвшөөрөл" — §1.2

Эмчилгээнээс бусад зорилгоор (судалгаа, статистик, сургалт) ашиглахад мэдээллийн эзэн эсвэл
асран хамгаалагчийн зөвшөөрөл.

**DDL:** `PatientConsent (Id, PatientId, Purpose, ConsentTextVersion, Granted BIT, GrantedBy
('self'|'guardian'), GuardianRegNo, GuardianName, GuardianRelation, SignedAt, RevokedAt,
CreateUserId, Channel ('mobile'|'web'|'paper'))`. Зөвшөөрлийн текстүүд — `MobileSetting`-д хувилбартай.

| | Endpoint | Ажил |
|---|---|---|
| Шинэ | `GET /api/patient/consents` | Зорилго бүрээр одоогийн төлөв + текст |
| Шинэ | `POST /api/patient/consents` | `{ purpose, granted, consentTextVersion }` |
| Шинэ | `POST /api/patient/consents/:id/revoke` | Цуцлах |
| Шинэ | `GET /api/doctor/patients/:id/consents` | Эмч харах |
| Шинэ | `POST /api/doctor/patients/:id/consents` | Асран хамгаалагчийн зөвшөөрлийг эмч бүртгэх (`GrantedBy='guardian'` + асран хамгаалагчийн мэдээлэл заавал) |
| Шинэ helper | `helper/Consent.js` `HasConsent(PatientId, Purpose)` | Экспорт, судалгааны тайлан зэрэг эмчилгээний бус замууд дуудна |

⚠️ **Хүлээгдэж буй:** зорилгуудын жагсаалт ба зөвшөөрлийн текст — ЗСҮТ-ийн хуулийн хэлтэс.

## 14. Үйлчлүүлэгчийн мэдээлэлд хандсан үед "Мэдэгдэл" — §1.2

**DDL:** `PatientAccessLog (Id, PatientId, UserId, DoctorId, OrganizationId, Action, ObjectName,
ObjectId, AccessedAt, Ip, Channel)`, `(PatientId, AccessedAt)` индекстэй.

| | Endpoint / ажил | Ажил |
|---|---|---|
| Шинэ middleware | `helper/LogPatientAccess.js` | 5, 27-р хэсэг, `/doctor/patients/:id`, `/doctor/visits/:id`, мөн вебийн `PatientController` дэлгэрэнгүй дээр |
| Шинэ | `GET /api/patient/access-log?from&to&limit&offset` | Үйлчлүүлэгч хэн, хэзээ, аль байгууллагаас хандсаныг харна |
| Producer | Мэдэгдэл үүсгэх | 26-р хэсгийн push-ээр |

⚠️ **Шийдвэр:** "хандах бүрт" гэдгийн утга — хандалт бүр / өдрийн нэгтгэл / зөвхөн эмчлэгч бус
ажилтан (албан бичгийн №15). Тоо хэмжээ нь олон зэрэглэлээр ялгаатай. Лог бичих хэсэг шийдвэрээс
хамаарахгүй тул эхэлж хийж болно.

## 15. Улсын цагийн эталон — §1.3

| | Ажил |
|---|---|
| Сервер | Ubuntu `chrony`-г эрх бүхий байгууллагын NTP сервертэй тохируулах. MSSQL сервер мөн адил. Хост нэрийг ЗСҮТ/эрх бүхий байгууллагаас баталгаажуулна |
| Шинэ | `GET /api/time` — `{ serverTime, timezone: 'Asia/Ulaanbaatar', ntpSource, ntpSynced }`. Нэвтрэлтгүй |
| Дүрэм | Бүртгэлийн огноо цагийг (`date_creation`, `CreateDate`) **серверийн цагаар** бичнэ — утасны цагийг хүлээн авахгүй. Одоогийн `POST /api/patient/journal`-ийн `date`-ийг хэрэглэгч сонгодог тул тусад нь `CreateDate` сервер бичнэ |

## 16. Цахим гарын үсэг (ДАН) — §1.3

**DDL:** `DigitalSignature (Id, ObjectName, ObjectId, SignerUserId, SignerRegNo, Provider, DocumentHash,
Signature NVARCHAR(MAX), Certificate NVARCHAR(MAX), SignedAt, Status)`.

| | Endpoint | Ажил |
|---|---|---|
| Шинэ | `POST /api/sign/requests` | `{ objectName, objectId }` → баримтын hash тооцож `{ requestId, redirectUrl }` (ДАН) |
| Шинэ | `GET /api/sign/callback` | ДАН-аас буцах; гарын үсгийг баталгаажуулж хадгална |
| Шинэ | `GET /api/sign/requests/:id` | `{ status, signedAt, signer }` — апп полл хийнэ |
| Шинэ | `GET /api/sign/verify?objectName&objectId` | Гарын үсэг хүчинтэй, баримт өөрчлөгдөөгүй эсэх |

Эхний хэрэглээ: эмчийн үзлэгийн тэмдэглэл, зөвлөгөө, 13-р хэсгийн зөвшөөрөл.
⚠️ **Хүлээгдэж буй:** ДАН-ы үйлчилгээний гэрээ (албан бичгийн №7). `SIGNATURE_HOST` тохиргоо одоо ямар ч кодод уншигддаггүй.

## 17. Нөөцлөлт (Backup) — §1.3

**Хэсэгчлэн байгаа:** `controllers/system/AppController.js` өдөр бүр 23:00-д `EXEC spFullBackup`
ажиллуулж `Backup` хүснэгтэд мөр бичдэг. Гэхдээ амжилттай болсон үед `Status` бичдэггүй (зөвхөн алдаа
дээр `0`), процедур өгөгдлийн санд байгаа эсэх, хуулбар өөр газар хадгалагддаг эсэх тодорхойгүй.

| | Endpoint / ажил | Ажил |
|---|---|---|
| Засах | `ScheduleBackUp` | Амжилттай үед `Status=1, CreatedDate, FileName` бичих; алдааг логлох; ажил бүтэлгүйтвэл админд мэдэгдэл |
| Шинэ | `GET /api/admin/backups?limit&offset` | Сүүлийн нөөцлөлтүүд ба төлөв (role 1, 6) |
| Сервер | Хуулбарыг өөр сервер/хадгалалт руу; хадгалах хугацааг хууль журмын дагуу; жилд ядаж нэг сэргээлтийн туршилт баримтжуулах |
| Шалгах | `spFullBackup` production ба туршилтын өгөгдлийн санд байгаа эсэх |

## 18. Эрүүл мэндийн салбарын мэдээлэл солилцоо ба стандарт (ЭМХТ, FHIR/HL7) — §1.3, §1.4

| | Endpoint | Ажил |
|---|---|---|
| Шинэ | `GET /fhir/Patient/:id` | FHIR R4 `Patient` — `Patient` хүснэгтээс |
| Шинэ | `GET /fhir/Encounter?patient=` | `Visit` → `Encounter` |
| Шинэ | `GET /fhir/Condition?patient=` | `Visit.icd10` → `Condition` (ICD-10 code system) |
| Шинэ | `GET /fhir/Observation?patient=&code=` | Даралт, судас, жин (`PatientMonitoring`) ба лаборатори (`LaboratoryTest`) → `Observation` (LOINC код) |
| Шинэ | `POST /api/integrations/emht/visits/:id` | Үзлэгийг ЭМХТ руу А611 (АМ-1Б)-ийн бүтцээр илгээх |

- Read-only фасад, үндсэн өгөгдлийн загварыг өөрчлөхгүй. Тусдаа системийн токен (client credentials) — `/api/base/*` шиг нэвтрэлтгүй бүү нээ.
- LOINC/SNOMED CT: `CodeMapping (Id, LocalObject, LocalCode, System, Code, Display)` **DDL** — дотоод талбар → стандарт код.

⚠️ **Шийдвэр:** "дагаж мөрдөх"-ийн хэмжээ, ЭМХТ-ийн интерфейсийн тодорхойлолт (BLOCKERS.md §5).

## 19. Эм, эмнэлгийн хэрэгслийн нэгдсэн сан — §1.5

| | Endpoint | Ажил |
|---|---|---|
| Шинэ | `GET /api/drugs?search=&limit` | Бүртгэлтэй эмийн жагсаалт (нэр, олон улсын нэр, тун, хэлбэр, бүртгэлийн дугаар) |
| Шинэ | `GET /api/medical-devices?search=&limit` | Эмнэлгийн хэрэгсэл |
| Шинэ job | Шөнө бүр нэгдсэн сангаас синк хийх | Кэш хүснэгт — **DDL** `DrugRegistryCache`, `DeviceRegistryCache` |

Мобайл хэрэглээ: эм уух сануулга үүсгэхэд эмээ жагсаалтаас сонгох.
⚠️ **Хүлээгдэж буй:** нэгдсэн сангийн API хандалт ба гэрээ.

## 20. Эрүүл мэндийн даатгалын кодчилол (ЭМД) — §1.6

`controllers/integrations/EMDServiceController.js`-д `POST /getTablet`, `POST /getTabletByDiagnosis`
(хуучин давхарга) бий — вебэд ашиглагддаг.

| | Endpoint | Ажил |
|---|---|---|
| Шинэ | `GET /api/doctor/emd/drugs?icd10=&search=` | Даатгалаар хөнгөлөгдөх эм — одоогийн `getTabletByDiagnosis`-ийг `/api/doctor/*` дүрмээр ороох |
| Шинэ | `GET /api/doctor/emd/services?search=` | ЭМД-ын тусламж үйлчилгээний код |

## 21. Кибер аюулгүй байдлын үнэлгээ, аудит — §1.7

Endpoint биш, гэхдээ аудитаас өмнө **заавал** засах мэдэгдэж буй цоорхойнууд (CLAUDE.md §10, API.md §8):

| Цоорхой | Засвар |
|---|---|
| `/api/Test/*` нэвтрэлтгүй; `PUT /api/Test/uploadFile` — 1 GB файл өвчтөний файлын хавтас руу | `routeGroups.public`-оос хасах эсвэл production дээр mount хийхгүй |
| `/api/base/*`, `/api/report/*` нэвтрэлтгүй | `Auth.verifyToken`-ы ард оруулах |
| `POST /api/BaseObject/downloadFile` эзэмшил шалгадаггүй | `MayAttachTo`-тай ижил шалгалт нэмэх |
| `/api/Advice/GetTicket` `BuildAdviceScope`-г алгасдаг | Хамрах хүрээ нэмэх |
| `helper/Auth.js` development үед JWT гарын үсэг шалгадаггүй; `UserController` production бус үед нууц үг шалгадаггүй | Туршилтын сервер `NODE_ENV=production`-оор ажиллах эсэхийг шалгах; кодыг `ALLOW_INSECURE_DEV_LOGIN` гэх тодорхой тохиргоонд шилжүүлэх |
| Нууц үг console-д бичигддэг | Лог устгах |
| Нууц өгөгдөл git түүхэнд | SECURITY-ROTATION.md |
| Токен цуцлах боломжгүй (`LogOut` stub) | **DDL** `RefreshToken (Id, UserType, UserId, TokenHash, DeviceId, ExpiresAt, RevokedAt)` + `POST /api/auth/logout`, `POST /api/auth/logout-all` |

Rate limit: `/Login`, `/ForgotPassword`, `/api/xyp/otp` — IP ба нэвтрэх нэрээр (9-р хэсэгтэй хамт).

## 22. Тайлан XLS, TXT-ээр татах, хэвлэх — §1.8

| | Endpoint | Ажил |
|---|---|---|
| Өөрчлөх | `POST /api/BaseObject/ExportExcel` | `Format: 'xlsx'\|'csv'\|'txt'` параметр нэмэх (default xlsx) — бүх бүртгэлд нэг дор |
| Шинэ | `GET /api/patient/journal/export?from&to&format=` | Үйлчлүүлэгч өөрийн тэмдэглэлийг эмчдээ үзүүлэхээр |
| Шинэ | `GET /api/doctor/visits/:id/print` | Үзлэгийн тэмдэглэлийн PDF (`BrowserPool`) — **JSON биш, файл** |

## 23. Мэдээллийн эх сурвалжийн тэмдэглэгээ — §1.8

| | Ажил |
|---|---|
| Шинэ helper | `helper/Provenance.js` `Stamp(req)` → `{ organization, database, generatedBy, generatedAt, filters }` |
| Өөрчлөх | `BaseObject/ExportExcel`, 4 ба 22-р хэсгийн бүх экспорт, `reports/*` PDF — толгой эсвэл хөл хэсэгт `Stamp` |
| Өөрчлөх | JSON тайлангууд — `source` талбар (`reportSummary`-д аль хэдийн бий, бусдад нэмэх) |

## 24. Тусламж үйлчилгээний өртөг, зардал тооцоолох — §1.8

**DDL:** `ServiceTariff (Id, Code, Name, ServiceType, Unit, Price, EffectiveFrom, EffectiveTo)`.

| | Endpoint | Ажил |
|---|---|---|
| Шинэ | `GET /api/doctor/patients/:id/cost?from&to` | Үзлэг, хэвтэн эмчлүүлэлт (`Stay`), мэс ажилбар (ICD-9), шинжилгээ × тариф → `{ items[{ date, service, qty, unitPrice, total }], total, insuranceCovered?, patientPays? }` |
| Шинэ | `GET /api/doctor/reports/cost?from&to&serviceType` | Байгууллагаар нэгтгэсэн |
| ModelConfig | `ServiceTariffConfig` | Админ тарифаа вебээс оруулах |

⚠️ **Хүлээгдэж буй:** тарифын жагсаалт ба тооцооны аргачлал — ЗСҮТ санхүү.

## 25. Автоматаар шинэчлэгдэх — §2.1

Дэлгүүрүүд аппыг өөрсдөө шинэчилдэг ч, хуучин хувилбарыг API өөрчлөгдсөн үед хүчээр шинэчлүүлэх
механизм хэрэгтэй.

| | Endpoint | Ажил |
|---|---|---|
| Шинэ | `GET /api/mobile/version?platform=ios\|android&build=` | Нэвтрэлтгүй. → `{ latestVersion, latestBuild, minSupportedBuild, forceUpdate, storeUrl, releaseNotes }`. Утгууд `MobileSetting`-д |
| Өөрчлөх | Бүх `/api/patient/*`, `/api/doctor/*` | `X-App-Build` header < `minSupportedBuild` бол `426 UPDATE_REQUIRED` |

## 26. Push мэдэгдэл ба мэдэгдлийн төв — §2.1

Одоо FCM/APNs огт байхгүй. Үйлчлүүлэгч `Notification`-ийг уншиж чадахгүй (`PatientScope`-д байхгүй),
`Notification`-д үйлчлүүлэгч хүлээн авагчийн багана байхгүй, уншсан гэж тэмдэглэх зам байхгүй.

**DDL:**
- `DeviceToken (Id, UserType ('U'|'P'), UserId, Platform, Token, AppVersion, LastSeenAt, IsActive)`
- `Notification`-д `ToPatientUserId INT NULL`, `Type NVARCHAR(40)`, `PushedAt DATETIME NULL`
- `NotificationPreference (Id, UserType, UserId, Type, Enabled)`
- ⚠️ `Notification.Notes`, `LinkObjectName` нь `INTEGER` гэж зарлагдсан — нэрээр нь бол текст. Шалгах.

| | Endpoint | Ажил |
|---|---|---|
| Шинэ | `POST /api/devices` | `{ platform, token, appVersion }` — хэрэглэгч токеноос. Нэвтрэх бүрт |
| Шинэ | `DELETE /api/devices/:token` | Гарахад |
| Шинэ | `GET /api/patient/notifications?unread&limit&offset` | |
| Шинэ | `POST /api/patient/notifications/:id/read` | `Seen='1', SeenDate` |
| Шинэ | `POST /api/patient/notifications/read-all` | |
| Шинэ | `GET /api/doctor/notifications?unread&limit&offset` | |
| Шинэ | `POST /api/doctor/notifications/:id/read` | |
| Шинэ | `GET /api/patient/notification-preferences` | Төрөл бүрээр асаах/унтраах |
| Шинэ | `PUT /api/patient/notification-preferences` | `[{ type, enabled }]` |
| Шинэ helper | `helper/Push.js` | `Notify({ toUser|toPatientUser, type, title, body, link })` → `Notification` мөр + FCM HTTP v1 (iOS-д FCM-ээр APNs). Хүчингүй токеныг `IsActive=0` |

**Producer-ууд** (мэдэгдэл үүсгэх газрууд):

| Үйл явдал | Хүлээн авагч | Хаана |
|---|---|---|
| Асуултад эмч хариулсан | үйлчлүүлэгч | `VisitComments`-д `is_doctor='1'` бичдэг вебийн зам |
| Зөвлөгөө нийтлэгдсэн / сэтгэгдэл | үйлчлүүлэгч, оролцогч эмч | `AdviceController` `CustomSaveAndPublish`, `CreateComment` |
| Чатын мессеж (хүлээн авагч socket-д холбогдоогүй үед) | гишүүд | `ChatController` `CommitMessage` |
| Цахим үзлэгийн төлөв | үйлчлүүлэгч | 7-р хэсэг `PATCH` |
| 3 удаа буруу нууц үг | хэрэглэгч | 9-р хэсэг |
| Мэдээлэлд хандсан | үйлчлүүлэгч | 14-р хэсэг |
| Сэргээн засах үнэлгээ бичигдсэн | үйлчлүүлэгч | 8-р хэсэг |
| Нөөцлөлт бүтэлгүйтсэн | админ | 17-р хэсэг |

⚠️ **Хүлээгдэж буй:** ЗСҮТ-ийн нэр дээрх Firebase төсөл ба APNs түлхүүр (BLOCKERS.md §3).
Эм, дасгал, үзлэгийн цагийн сануулга утсан дээр локал ажиллаж байгаа тул push-оос хамаарахгүй.

## 27. Шинжилгээ, оношлогоо (телемедицин) — §3.1

`LaboratoryTest` (`PatientId`-тай), `EchoExamination`, `CathLab`, зүрхний цахилгаан бичлэг хүснэгтүүд
бий. Апп-д нэг ч зам байхгүй.

| | Endpoint | Ажил |
|---|---|---|
| Шинэ | `GET /api/doctor/patients/:id/diagnostics?type=lab\|echo\|cathlab\|ecg&from&to` | Нэгдсэн жагсаалт `[{ type, id, date, title, summary, organization }]` |
| Шинэ | `GET /api/doctor/diagnostics/:type/:id` | Дэлгэрэнгүй. `lab` → талбар бүр `{ name, value, unit, refRange, flag }` |
| Шинэ | `GET /api/patient/diagnostics?type&from&to` | Үйлчлүүлэгч өөрийн хариу |
| Шинэ | `GET /api/patient/diagnostics/:type/:id` | |
| Шинэ | `GET /api/doctor/patients/:id/diagnostics/:type/:id/files` | Зураг, PDF — эзэмшил шалгасан татах замаар |

- 11-р хэсгийн `Mask()` **заавал** — ДОХ зэрэг шинжилгээ яг энд.
- 14-р хэсгийн хандалтын лог **заавал**.
- `LaboratoryTest`-ийн талбаруудын нэгж, лавлах хэмжээ кодод байхгүй — `CodeMapping` (18-р хэсэг)-д LOINC-той хамт.

## Дасгалын 39 видео — §4.2

Backend ажил нь 8-р хэсгийн `GET /api/media/exercises/:id` (Range stream) ба 3-р хэсгийн админ
upload. ⚠️ **Хүлээгдэж буй:** зураг авалт (албан бичгийн №9), видео хадгалах газар (№10). Гадны
CDN сонговол stream endpoint хэрэггүй, `MediaRef` дээр URL хадгална.

---

## Endpoint шаардахгүй зүйлс — мобайл, баримт, серверийн ажил

| Шаардлага | Хэн | Ажил |
|---|---|---|
| 1.1 Зохиогчийн эрх | Мобайл | ✅ 2026-09-14 — Тохиргоо → Нээлттэй эхийн лиценз, [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md) |
| Хэрэглэгчийн гарын авлага | Баримт | ✅ 2026-09-14 — [USER-GUIDE.md](USER-GUIDE.md) |
| Android | Мобайл | ✅ 2026-09-14 — release APK бүтсэн, Android 15 эмулятор дээр нээгдсэн. Play Store-д гаргахад release keystore хэрэгтэй (одоо debug түлхүүрээр гарын үсэг зурсан) |
| Чатын дуу бичлэг | Мобайл | ✅ 2026-09-14 — хавсралтын цэсэнд "Дуу бичлэг" |
| Эмчийн тайлан экспорт | Мобайл | ✅ 2026-09-14 — утсан дээр Excel/CSV/TXT |
| Цагийн эталон (15) | Сервер | `chrony` тохиргоо |
| Кибер аудит (21) | Эрх бүхий байгууллага | Засваруудын дараа гадны аудит |
| Үйлчилгээний нөхцөл, зөвшөөрлийн текст | ЗСҮТ | Хуулийн хэлтэс батлах |

## ЗСҮТ-ийн шийдвэр хүлээж буй — кодоор дангаараа ногоон болохгүй

| Шаардлага | Юу хэрэгтэй |
|---|---|
| 2.5 Эрсдэлийн оноо | ЗСӨ аргачлал, эрсдэлийн ангилал батлах. Батлагдвал `GET /api/patient/risk`-д `score, riskClass` нэмнэ |
| 1.8 Батлагдсан маягтаар тайлан | Маягтын загвар |
| 1.4 FHIR/HL7, SNOMED CT, LOINC | Ямар хэмжээнд хэрэгжүүлэхийг бичгээр тохирох (BLOCKERS.md §5) |
| Видео дуудлага, түгжих хугацаа, dico утгууд | 7, 9-р хэсэгт заасан |
| Лицензийн кодын эх сурвалж | 10 |
| Нууцын ангилал, эрхийн матриц | 11 |
| ХУР эрх, түлхүүр | 12 |
| Зөвшөөрлийн зорилго, текст | 13 |
| "Хандах бүрт мэдэгдэл"-ийн утга | 14 |
| ДАН гэрээ | 16 |
| ЭМХТ интерфейс, стандартын хэмжээ | 18 |
| Эм, хэрэгслийн нэгдсэн сангийн хандалт | 19 |
| Тариф, өртгийн аргачлал | 24 |
| Firebase / APNs түлхүүр | 26 |

## Санал болгох дараалал

Гадны шийдвэрээс хамаарахгүй, эхэлж болох ажил эхэнд:

1. **21** аюулгүй байдлын цоорхой — store-д гарахаас өмнө заавал, аудитын өмнөх нөхцөл
2. **5** эмчийн харах 3 endpoint, **2** ICD хайлт — жижиг, DDL-гүй
3. **10** лицензийн код — трекерт "Дууссан" гэж буруу бичигдсэн, UAT-д шууд унана
4. **9** буруу оролдлого, **15** серверийн цаг, **17** backup засвар, **25** хувилбар шалгах
5. **26** push ба мэдэгдлийн төв — Firebase түлхүүрийг **одоо** хүсэх, олон хэсэг үүнээс хамаарна
6. **14** хандалтын лог — мэдэгдлийн шийдвэрээс үл хамааран лог бичиж эхлэх
7. **4, 22, 23** экспорт ба эх сурвалжийн тэмдэглэгээ — нэг helper-ээр хамт
8. **6** асуултын хавсралт, **27** шинжилгээ оношлогоо (**11** `Mask()`-тай хамт)
9. **3, 8** админ ба сэргээн засах
10. **1** эрх — бүх route-д хүрнэ
11. **7, 13, 24** — DDL + ЗСҮТ-ийн текст, тариф, dico
12. **12, 16, 18, 19, 20** — гадны гэрээ (ХУР, ДАН, ЭМХТ, нэгдсэн сан, ЭМД) ирэх үед
