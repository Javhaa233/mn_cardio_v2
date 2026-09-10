# Backend readiness for the mobile app

What exists, what has to be built, and what cannot be built by us. Audited against the
backend source on **2026-09-10**. Tracker rows refer to sheet **Мобайл апп** of
`МнКардио_тендерийн_ажлын_жагсаалт.xlsx`.

**Short answer:** the patient module and — since 2026-09-10 — the doctor module are both
served, and both can be started today. Nine further items the tender requires still do not
exist in any form.

> **Changed 2026-09-10.** The two largest gaps in this document were closed: the doctor
> module now has `/api/doctor/*` (12 endpoints, [API.md](API.md) §4), and token refresh now
> exists at `/api/auth/*`. Both are marked **DONE** below rather than deleted, so the history
> of what was missing stays legible.

---

## 1. Ready to build against today

| Surface | Covers | Where |
|---|---|---|
| Patient login + self-service password reset | tender §1.2, §2 | `controllers/auth/PatientUserController.js` |
| Staff login | §2 | `controllers/auth/UserController.js` |
| Patient module 2.1–2.6 | tracker 34–37, 39–40 | `api/patient/*` — 12 live endpoints |
| **Doctor module** — үзлэг, хяналт, зөвлөгөө, тайлан | tracker 28–32 | `api/doctor/*` — 12 endpoints, new 2026-09-10 |
| **Session refresh** | — | `api/auth/*` — new 2026-09-10 |
| Chat: text, image, audio, documents | tracker 47 | `ChatController.js` + `/chatmessage` socket |
| Advice feed with paging and scope | tracker 30 | `AdviceController.GetFeed` |
| File upload with authorization and extension allowlist | tracker 44 | `BaseController.js:366-570` |
| ХУР integration (web-side plumbing) | tracker 17 | `XypServiceController`, `helper/xypSign.js` |

That is enough to build patient modules 2.1–2.4 and 2.6, the entire doctor module, chat and
the full session lifecycle without waiting for anybody.

---

## 2. Must be built by ITsystem — code only, no DDL, nothing blocking

Ordered by what blocks the most mobile work.

### 2.1 The doctor module — **DONE 2026-09-10**

Tracker rows 28–32 (Миний үзлэгүүд · Миний хяналт · Миний зөвлөгөө · Миний тайлан). The
underlying controllers existed but were unusable from a phone: everything `POST` including
reads, PascalCase envelope, HTTP 200 on error, generic `BaseGetList` paging, and the two print
routes returning a PDF stream with no JSON alternative.

Built as `/api/doctor/*` — 12 endpoints mirroring `api/patient/*`, with a `requireDoctor` gate
deriving user, doctor and organisation from the token. Documented in [API.md](API.md) §4.

New files: `helper/RequireDoctor.js`, `api/doctor/{index,controller}.js`.

Two things fixed along the way, both worth knowing:

- **`/api/Patient` was shadowing `/api/patient/*`.** Express matches mount paths
  case-insensitively and the legacy table was registered first, so its `Auth.verifyToken`
  answered unauthenticated patient-API requests with the legacy HTTP-200 `AuthError` envelope
  instead of a 401. The mobile mounts now come first and gate **per route**, so paths they do
  not serve still fall through to the legacy controller.
- **`helper/VerifyTokenJson.js`** wraps `Auth.verifyToken` so an auth failure on the mobile
  surfaces is a real 401 in the lowercase envelope. `Auth.verifyToken` itself is untouched —
  it is on all 47 legacy routes and the web client depends on its shape.

The clinical write paths were deliberately **not** moved: saving an examination and publishing
advice stay in the legacy controllers. This surface reads, plus the monitoring list add/remove,
which is a doctor's own working set rather than clinical data.

### 2.2 Token refresh — **DONE 2026-09-10**

`POST /api/auth/refresh` and `GET /api/auth/session` (`api/auth/*`, plus `issueRefreshToken` /
`verifyRefreshToken` / `reissue` on `helper/Auth.js`). Refresh tokens last 30 days; the
endpoint also accepts a still-valid access token as Bearer, so the login controllers did not
have to change shape. Both paths re-read the user, so a deactivated account stops refreshing.

**Still open:** individual revocation. There is no token store, so cancelling one session means
rotating `JWT_PASS` and logging everyone out. A real implementation needs a table, and
therefore DDL — see §3. `LogOut` remains a stub until then.

### 2.3 Patients cannot read notifications at all

Tracker row 48. `Notification` is absent from `PatientScope.SCOPE_BY_OBJECT`, so every
patient request is denied `ObjectNotAllowedForPatient` — even though `/Notification` **is** in
`PATIENT_ALLOWED_PREFIXES`, so the prefix is open and every row is refused. There is also no
mark-read route despite `Seen` / `SeenDate` columns existing, and the only producer of
notifications in the entire backend is the Advice flow.

Needs: a scope entry, a `GetMyNotifications` + `MarkRead` pair, and producers for the events
patients actually care about.

### 2.4 No media delivery path — blocks the 39 videos

The file layer serves `POST` + `Content-Disposition: attachment`. No player can stream that,
and **no video extension is on the upload allowlist** (`BaseController.js:278-301`). Needs an
authenticated `GET` with byte-range support before `RehabExercise.MediaRef` means anything.

### 2.5 `/api/BaseObject/downloadFile` has no ownership check

Any caller holding `generated_name` + `ext` gets the bytes. Chat already routes around it
with its own membership-checked `DownloadAttachment`; every new mobile file consumer needs
the same treatment.

### 2.6 `GetTicket` bypasses `BuildAdviceScope`

`AdviceController.js:1176-1178`, flagged in the source itself. Access is `AppId + id` only,
so any authenticated user can read any ticket by guessing an id. Must close before an app
reaches a public store.

### 2.7 Security findings that a public app makes materially worse

Each is recorded in `CLAUDE.md §10` for the mandated audit; listing them here because
shipping a mobile app changes their severity.

- `/api/base/*` and `/api/report/*` mounted **outside** `Auth.verifyToken` (`server.js:389`)
- `/api/Test/*` is **public**, and `PUT /api/Test/uploadFile` is an unauthenticated 1 GB
  upload into the same directory as patient attachments
- dev-mode bypasses: `jwt.decode()` instead of `jwt.verify()` (`Auth.js:212`), and staff
  login skipping password validation (`UserController.js:246`)
- **no rate limiting anywhere**, with `express.json({limit:'100mb'})`
- Socket.IO fan-out is per-process (`ChatSocket.js:29-33`) — silently drops members under PM2
  cluster mode without a Redis adapter

### 2.8 Small but real

`POST /api/patient/journal` does not accept `blood_pressure2`, though reads return it and the
summary chart plots it — a patient cannot record diastolic pressure. One line in
`controller.js:115-140`.

---

## 3. Blocked on DDL — written, reviewed, not run

The repo owns no migrations; schema changes are a request to whoever holds SQL access
(`CLAUDE.md §2`). These two scripts already exist and need executing, nothing more.

| Script | Effect | Note |
|---|---|---|
| `scripts/add_rehabilitation_tables.sql` | 4 tables | **Highest value single action in this document.** All four models (`model/Rehabilitation/`) and all six endpoints are already written. Running this turns module 2.7 on with zero further code. |
| `scripts/add_remotevisit_booking_columns.sql` | `RequestedDate, ScheduledDate, Status, DoctorId, UpdateDate` | **Not sufficient on its own** — the model still declares only its original 4 columns and no controller reads the new ones. DDL plus code. Also depends on `remotevisit_status` dico rows, unapproved. |

Still needing new scripts written, each carrying a tender requirement:

| Needed | For | Tracker |
|---|---|---|
| Licence code column on `DoctorsProfile` | doctor login tied to practice licence | 13 |
| Failed-attempt counter / lockout | notify after 3 wrong passwords | 20 |
| Consent capture tables | consent for non-treatment use of personal data | 23 |
| Access-audit log | notify the patient when their record is read | 24 |
| Confidentiality classification flag | hide classified data from unauthorised users | 21 |
| Patient recipient column on `Notification` | advice arriving as a notification | 48 |
| Push device-token table | FCM/APNs registration | 48 |

---

## 4. Absent entirely — each one is a stated tender requirement

Verified by repo-wide search. None of these has any implementation:

biometric login (client-side, but nothing server-side supports the flow) · doctor licence-code
login · 3-failed-attempt notification · access notification · consent capture ·
confidentiality classification · **ДАН digital signature** · patient-configurable reminders
(medication / exercise / follow-up) · **push notifications — no FCM, APNs or web-push anywhere** ·
**ICD, FHIR/HL7, SNOMED CT, LOINC**, named in tender §1.4 and phase 3 and present nowhere in
the backend.

Push deserves emphasis: without it, a backgrounded app receives nothing, which silently
guts reminders, chat alerts and advice notifications — four tracker rows that will otherwise
be marked done and fail UAT.

---

## 5. Recommended order

**Now, unblocked** — patient modules 2.1–2.4 and 2.6, **the whole doctor module**, chat, login,
password reset and session refresh. This is a substantial amount of real Flutter work that
needs nothing from anyone.

**Run one SQL script** — `add_rehabilitation_tables.sql`. Module 2.7 comes alive; still the
best effort-to-value ratio available anywhere in this document.

**Then, in this order:**
1. ~~`/api/doctor/*`~~ — **done 2026-09-10**
2. ~~token refresh~~ — **done 2026-09-10**
3. patient notifications + push — four rows depend on it, and push has an external lead time
4. media delivery — required before any of the 39 videos can ship
5. the §2.7 security items — before, not after, a public store listing

**Customer-blocked throughout** — see [BLOCKERS.md](BLOCKERS.md).

---

## 6. Two tracker rows are marked done but have no implementation

Raised for correction rather than edited, because changing a status the customer can see is
not ours to do quietly. Both predate this audit.

| Row | Task | Recorded | Found |
|---|---|---|---|
| 12 | Нэвтрэлт, эрхийн удирдлага | `Дууссан` 100% | Per-user permission control is numeric `RoleId` comparison. The RBAC tables (`Roles`, `Permissions`, `RoleToPermission`, `UserToRole`) exist but are **not enforced**. |
| 13 | Мэргэжлийн зөвшөөрлийн код | `Дууссан` 100%, criterion "Зөвшөөрлийн кодгүй эмч нэвтрэхгүй" | **`DoctorsProfile` has no licence field**, and the login path has no such check. The only `License` in the codebase is free text on `UserRequests` (`model/BaseModel/UserRequests.js:19`), never consulted at login. |

Row 13 in particular is a hard tender requirement with an explicit acceptance criterion. It
will fail UAT as recorded.
