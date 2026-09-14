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

~~**Still open:** individual revocation.~~ **Closed 2026-09-14.** Tokens now carry a `jti`,
`helper/SessionStore.js` keeps a revocation denylist, and `POST /api/auth/logout`,
`POST /api/auth/logout-all` and `GET /api/auth/sessions` act on it. `LogOut` is no longer a
stub: verified that the *same* token returns 401 after logout instead of continuing to work
for its full ten hours.

The denylist is in memory and refreshed on a timer rather than queried per request — checking
a table on every call would put a read in front of all 47 legacy prefixes to answer "not
revoked" almost every time. The cost is that a revoked token can survive up to
`TOKEN_REVOCATION_REFRESH_SEC` (30s).

> **Rollout order matters.** Tokens issued before this carry no `jti` and live ten hours.
> `TOKEN_REVOCATION_ALLOW_LEGACY` defaults to **true** — rejecting them immediately would sign
> out every active session on deploy, which is the outage the feature exists to prevent.
> Enable, wait 11 hours, then set it false.

The web client needs no change: `AuthHelper` already calls `/User/LogOut` with the bearer
token and already clears localStorage on success.

### 2.3 Patients cannot read notifications at all — **fixed 2026-09-14**

`GET /api/patient/notifications`, an unread count, mark-one-read and mark-all-read all exist,
plus push registration on both surfaces. Two bugs were causing this, and the second is worth
knowing before touching `NotificationHelper`:

- the guard read `Data.ToUserId`, the **staff** recipient, so anything addressed to a patient
  fell through and returned undefined without a log line;
- it wrote through `BaseControllerHelper.BaseCreate`, whose first act is
  `PatientScope.ApplyPatientOwnership`. During a **patient's** session that refused the write
  outright. Adding a `SCOPE_BY_OBJECT` entry does not fix it — that function assigns
  `Data[ToPatientId]` from the session, so a notification a patient's action generates *for a
  doctor* would be re-addressed to the patient. Producers now use
  `Models.Notification.create` directly; the scope entry is **read-side only**.

The recipient column is `ToPatientId` holding `Patient.id_data`, **not** `ToPatientUserId`:
`Users.Id` and `PatientUsers.Id` collide, and the ДАН path produces no `PatientUsers` row at
all, so that column would be permanently null for the login method the tender is moving to.

Measured, not assumed: `Seen` holds `'1'` or NULL, and nothing in this repo writes it — the
nightly `EXEC spUpdateNotification` does. The API exposes it as a boolean.

Producers wired: a doctor answering a question, and an e-visit slot being confirmed. More
events can be added by calling `NotificationHelper.NotifyPatient`.

### 2.4 No media delivery path — **fixed 2026-09-14**

`GET` and `HEAD` on `/api/Media/stream/:generatedName` and
`/api/Media/exercise/:exerciseId`, with real HTTP byte ranges: `200` with
`Accept-Ranges` and **`Content-Disposition: inline`** for the whole file, `206` with
`Content-Range` for a range, `416` for one that cannot be satisfied. Suffix ranges
(`bytes=-500` meaning the *last* 500 bytes) are handled — getting that backwards produces a
video that plays and then corrupts near the end.

Video extensions are allowed **for `RehabExercise` only**, per-object the way `UploadCapFor`
already makes the size cap per-object. `MAX_UPLOAD_CEILING` is deliberately unchanged:
formidable fixes `maxFileSize` before `LinkedObjectInfo` is parsed, so raising it would mean
every upload is read that far before the per-object cap can reject it.

Authorization is not reimplemented — `MayAttachTo` and `MayDownload` moved to
`helper/FileAccessHelper.js` unchanged so this route and `/BaseObject/downloadFile` share one
rule. Two things that were caught while wiring it are worth knowing:

- the catalogue is **shared content with no ownership column**, and `MayDownload`'s patient
  check refuses anything without a `PatientScope` entry — so a named `SHARED_CONTENT`
  exemption was needed or every patient would have been refused the exact file the module
  exists to deliver;
- mounted in the legacy table, an unauthenticated request returned **HTTP 200 with
  `{AuthError:true}` JSON**, which a video player would try to decode as video. It is mounted
  with `VerifyTokenJson` instead and returns a real `401`. No bytes ever leaked.

Still blocked on the customer: the videos themselves. Filming has not started and the hosting
decision is open — but the route branches on the `MediaRef` scheme, so that answer is a
database value rather than a release.

### 2.5 `downloadFile` is authorized — the real gap is `MayAttachTo`'s default

**Corrected 2026-09-14.** This section previously said `/api/BaseObject/downloadFile` had no
ownership check. It does: `downloadFile` (`controllers/system/BaseController.js:738`) resolves
the handle to the stored `File` row and authorizes it through `MayDownload` (`:422-491`),
returning 403 on refusal. The source comment at `:413-421` records the fix and the patient
token that proved the original hole.

What is still open is narrower. `MayAttachTo` (`:355-408`) ends in a bare `return true` for
any `LinkedObjectName` it does not explicitly name. Patients are still covered, because
`MayDownload` adds a `PatientScope` check at `:471-489` — **staff are not**. Closing it means
an explicit per-object allowlist, and the function's own header warns that silently denying an
existing clinical file flow would be worse than the hole it closes. So it is a deliberate,
reviewed narrowing, not a one-line change.

### 2.6 `GetTicket` bypasses `BuildAdviceScope` — **fixed 2026-09-14**

Access was `AppId + id` only, so any authenticated session could read any ticket by guessing
an `id_data`. Both `GetTicket` and `AdviceScopeHelper.MayReadAdviceAttachment` now apply
`BuildAdviceScope`, and they were changed in the same commit because the attachment rule
deliberately mirrors the ticket rule — the source comment on it said so. Tighten one alone and
you either leave the hole open through the file route, or 403 an attachment on a ticket the
same session can open.

One subtlety worth knowing if you touch either: `BuildAdviceScope` denies by returning
`{ id_data: -1 }`. Both call sites merge as `{ id_data: AdviceId, ...Scope }` — scope **last**
— so that sentinel survives. Merged the other way round, the caller's id would overwrite the
deny and return exactly the ticket the scope meant to refuse.

Nothing the feed shows loses access: a ticket visible on the feed is by definition inside the
scope. What stops working is a direct link to a ticket outside the caller's organisation
reach, which is the hole being closed.

### 2.7 Security findings that a public app makes materially worse

Each is recorded in `CLAUDE.md §10` for the mandated audit; listing them here because
shipping a mobile app changes their severity.

- ~~`/api/base/*` and `/api/report/*` mounted **outside** `Auth.verifyToken`~~ — **fixed
  2026-09-14.** Gated in `api/index.js` with `[VerifyTokenJson, DenyPatient]`, on the two
  sub-routers rather than by wrapping the `/api` mount, so the blast radius is exactly those
  two prefixes and unmatched paths still 404 instead of 401.
- ~~`/api/Test/*` is **public**, and `PUT /api/Test/uploadFile` is an unauthenticated 1 GB
  upload~~ — **fixed 2026-09-14.** `uploadFile`, `ApiSendMail`, `print` and `printNew` were
  deleted rather than moved: the upload route was unreachable (its only caller chain calls
  `this.uploadTes` while the method is `uploadTest`) and wrote a file with no `File` row that
  nothing could read back. Two pure string-validation routes remain public.
- ~~dev-mode bypasses~~ — **fixed 2026-09-14.** Both now require `ALLOW_INSECURE_DEV_AUTH=true`
  *in addition to* `NODE_ENV`, and it defaults to false, so a host that merely has `NODE_ENV`
  set wrong is no longer open. The staff-login password check is now the default branch rather
  than the production-only one. The plaintext password logging in `Login()` is gone
  unconditionally.
- **no rate limiting anywhere**, with `express.json({limit:'100mb'})` — body size is now
  measured and logged above `BODY_SIZE_WARN_BYTES` so the real ceiling can be set from data;
  the limit itself is unchanged pending that measurement.
- Socket.IO fan-out is per-process (`ChatSocket.js:29-33`) — silently drops members under PM2
  cluster mode without a Redis adapter

### 2.8 Small but real — **fixed 2026-09-14**

`POST /api/patient/journal` accepts `blood_pressure2` (diastolic). It previously did not,
while reads returned it and the summary chart plotted it, so a patient could not record their
own diastolic pressure at all. Both the model and `PatientMonitoringConfig` already declared
the column; only the create handler's destructure was missing it.

---

## 3. Blocked on DDL

The repo owns no migrations; schema changes are a hand-written script plus a request to
whoever holds SQL access (`CLAUDE.md §2`).

**Corrected 2026-09-14.** This section said both scripts were "written, reviewed, not run".
Verified by direct query against `MnCardio_test` (server `mncardiosrv1`), **both have already
been run there**. The server's own boot log now reports which features are dark — see
`helper/SchemaProbe.js`.

| Script | State on `MnCardio_test` | Note |
|---|---|---|
| `scripts/add_rehabilitation_tables.sql` | **run** — all 4 tables present | `RehabExercise` holds **0 rows**, so the endpoints return an empty list, not 500. Missing is content, not schema: the 39 names, categories and durations are a clinical deliverable. |
| `scripts/add_remotevisit_booking_columns.sql` | **run** — `Status`, `RequestedDate`, `ScheduledDate`, `DoctorId` present | Still not sufficient alone: the model declares only its original 4 columns and no controller reads the new ones. `MeetingUrl` is a later addition and is **not** present. Also wants `remotevisit_status` dico rows, unapproved. |

Production has not been checked and is a separate request needing the customer's approval.

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
confidentiality classification · **ДАН digital signature** ·
**ICD, FHIR/HL7, SNOMED CT, LOINC**, named in tender §1.4 and phase 3 and present nowhere in
the backend.

**Closed since this list was written (2026-09-14):**

- ~~patient-configurable reminders~~ — `/api/patient/reminders`, fired every minute by
  `services/ReminderDispatcher.js`. The server runs **UTC** while Mongolia is UTC+8, so the
  dispatcher converts to Asia/Ulaanbaatar explicitly; reading the host clock would have
  fired every 08:00 medication reminder at 16:00 local. Delivered exactly once per
  occurrence, guaranteed by a unique `(ReminderId, DueAt)` index the dispatcher claims
  before sending.
- ~~push notifications~~ — FCM v1 and APNs, no SDK, and **fully testable with no
  credentials** via the log driver. What is still missing is the Firebase project and the
  Apple key, which are ЗСҮТ's to supply (BLOCKERS items 2 and 3).


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
