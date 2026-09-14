# МнКардио backend — mobile API contract

Everything a Flutter client needs to talk to the MnCardio backend. Verified against source
on 2026-09-10; each claim names the file it came from so you can re-check it when the
backend moves.

Live test server: **`https://mncardio.itsystem.mn`** — build against this.

> **New here?** [QUICKSTART.md](QUICKSTART.md) gets you from nothing to real data in about
> ten minutes. [`postman/`](postman/) lets you click through every endpoint on this page, and
> [`client/`](client/) has a runnable smoke test plus the Dart module already written.
> This file is the reference you come back to, not the one you start with.

Base URL in local development: `http://<host>:5001` — port is `process.env.PORT || 5001`
(`server.js:382`). Health: `GET /health`.

---

## 1. The two layers — read this first or you will lose a day

The backend has two API layers with **different conventions**, and both are live. Which one
you are in is determined entirely by the URL prefix.

| | `/api/patient/*`, `/api/doctor/*`, `/api/auth/*` | everything else under `/api/*` |
|---|---|---|
| Verbs | real `GET` / `POST` / `DELETE` | **`POST` for everything**, including reads |
| Envelope | `{success, message, data, code}` — lowercase | `{Success, Message, Data, Option}` — PascalCase |
| Errors | **real HTTP status codes** — 400 / 401 / 403 / 404 / 500 | **HTTP 200, always** |
| Paging | `?limit` & `?offset`, response carries `total` | inside the `Option` object |
| Caller identity | from the token, never from the request | passed in the body |

Source: `api/patient/controller.js:17-31` for the lowercase envelope and its real status
codes; `CLAUDE.md §5` and `helper/BaseControllerHelper.js` for the PascalCase one.

### The single most dangerous thing on this page

**The legacy layer returns HTTP 200 for failures.** A `dio` client that only checks
`statusCode` will treat "your token is invalid", "you have no permission" and "the database
threw" as successes and hand your UI an empty list. Auth failure looks like this — note the
200:

```
HTTP/1.1 200 OK
{"Success":false,"Message":"There is a user who is not logged into the system","AuthError":true}
```

Every legacy call must branch on the `Success` field, not the status code.

**The three mobile surfaces are the exception and behave normally**, auth failures included —
they answer `401 {"success":false,"code":"TOKEN_INVALID",…}`. That is worth stating because it
was not always true: `Auth.verifyToken` emits the legacy 200 envelope, and until 2026-09-10
it ran ahead of `/api/patient/*` and answered for it. Two things now prevent that — a
`verifyTokenJson` wrapper that translates the auth failure, and mount ordering (below).

[FLUTTER.md](FLUTTER.md) has an interceptor that normalises both envelopes into one exception
type — write it before you write your second screen.

> **Why `/api/patient` and `/api/doctor` are mounted before the legacy table.** Express matches
> mount paths **case-insensitively** unless told otherwise, and it is not told otherwise. The
> legacy table registers `/api/Patient`, which therefore also matches `/api/patient/me`. The
> mobile routers are mounted first and apply their auth **per route**, so a path they do not
> serve — `/api/patient/SearchPatient` — matches nothing, runs no middleware, and falls
> through to the legacy controller untouched. Do not "tidy" that ordering.

---

## 2. Auth

JWT bearer, **10-hour expiry**, `Authorization: Bearer <token>` (`helper/Auth.js:29`).

`LogOut` on both login controllers is a stub: it returns success without invalidating
anything server-side, so a token stays valid until it expires. Treat logout as a client-side
act — clear your storage — and do not expect the server to revoke.

### Refreshing — `/api/auth/*`

```
POST /api/auth/refresh      { "refreshToken": "..." }     — or a Bearer access token
GET  /api/auth/session      Bearer <access token>
```

`refresh` returns a new pair:

```json
{ "success": true, "message": "", "data": {
    "token": "…", "refreshToken": "…", "expiresIn": 36000, "LogedUser": { … } } }
```

Refresh tokens live **30 days**. The endpoint accepts **either** a refresh token in the body
**or** a still-valid access token as a Bearer header — the Bearer path exists so a client can
obtain its first refresh token without the login endpoints changing shape. So the flow is:

1. `POST /api/PatientUser/Login` or `/api/User/Login` as today → access token.
2. `POST /api/auth/refresh` with that token as Bearer → store the `refreshToken` securely.
3. From then on, `POST /api/auth/refresh` with `{refreshToken}` before the access token expires.

`GET /api/auth/session` says whether an access token is still good and who it belongs to, so
you can decide on launch whether to refresh without provoking an error from a resource route.

Both re-read the user from the database, so a deactivated account stops refreshing. Failures
are a uniform `401 TOKEN_INVALID` — expired, malformed and forged are not distinguished.

> **No individual revocation.** There is no server-side token store, so a refresh token cannot
> be cancelled on its own; rotating `JWT_PASS` invalidates all of them at once, which is
> already the case for access tokens. Real revocation needs a table and therefore DDL — see
> [READINESS.md](READINESS.md).
>
> An access token cannot be presented as a refresh token or vice versa: refresh tokens carry
> `typ:"refresh"` and no `user` claim, and both are checked.

### Patient login

```
POST /api/PatientUser/Login
{ "UserName": "...", "Password": "..." }
```

```json
{
  "Success": true,
  "Message": "Successfully logged in",
  "Data": {
    "token": "eyJ...",
    "LogedUser": {
      "Id": 123, "UserName": "...", "RoleId": 4,
      "Patient": { "id_data": 456, "p_lastname": "...", "p_firstname": "...", "p_registration": "..." }
    }
  }
}
```

Wrong credentials return **HTTP 200** with `Success:false` and
`Data:{token:null, LogedUser:null}`. Source: `controllers/auth/PatientUserController.js:51-99`.

### Doctor / staff login

```
POST /api/User/Login
{ "UserName": "...", "Password": "..." }
```

Same envelope. Excludes `RoleId 4`, and requires the account to have a linked
`DoctorsProfile` row — without one, login fails with
`Хэрэглэгчид харъяалагдах эмчийн мэдээлэл олдсонгүй` even when the password is right.
Source: `controllers/auth/UserController.js:125-245`.

> **Тендер §2 — мэргэжлийн зөвшөөрлийн код.** The tender requires a doctor's login to be
> tied to their professional practice licence code, with no code meaning no login. **That
> check does not exist**, and `DoctorsProfile` has no licence column. Do not build a UI that
> implies it works. See [READINESS.md](READINESS.md).

### Role IDs

No enum exists anywhere in the codebase, so this is the reference:

`1` admin · `2`, `3` doctor tiers · `4` patient · `5` profile-only · `6` settings/admin-config.

### The two patient-gate errors

`/api/patient/*` sits behind `helper/RequirePatient.js`, which returns real 403s:

| code | HTTP | Means |
|---|---|---|
| `NOT_A_PATIENT` | 403 | token's `RoleId` is not `4` |
| `PATIENT_NOT_RESOLVED` | 403 | patient account with **no linked `Patient` row** |

The second one is a data condition, not a bug in your client — the account exists but
`Patient.user_id` does not point at it, so the server refuses rather than run an unfiltered
query. Surface it as "бүртгэл олдсонгүй, эмнэлэгт хандана уу", not as a login failure.

### Passwords

Self-service reset exists for both audiences and is the flow the tender requires.

- Patient: `POST /api/PatientUser/ForgotPassword {UserName}` → emailed link →
  `POST /api/PatientUser/ResetPassword {UserName, Token, Password}`
- Staff: `POST /api/User/ForgetPassword` (note the spelling) → `POST /api/User/ResetPassword`

Both are public routes.

**Password complexity — read the deployment note.** The rule is at least 8 characters with an
uppercase letter, a lowercase letter, a digit and a special character. It used to be enforced
on the staff routes only, so `"abc"` was an acceptable patient password. `helper/PasswordPolicy.js`
now holds the single definition and both audiences enforce it, in `ResetPassword` and
`ChangePassword` alike.

That fix is in the source you have. **The test server is still running an older build** and
accepts a weak patient password today — verified 2026-09-10. Validate against the rule
client-side regardless of what the server currently lets through, and expect the server to
start rejecting once it is redeployed.

### Security conditions you must not design around

These are real and are on the security-audit list. They are **not** features to rely on:

- `helper/Auth.js:212` — when `NODE_ENV === 'development'` the server calls `jwt.decode()`
  instead of `jwt.verify()`, accepting **any unsigned token**.
- `controllers/auth/UserController.js:246` — when `NODE_ENV !== 'production'` staff login
  **skips password validation entirely** and issues a token for any username given.

Your dev environment will therefore accept nonsense and production will not. Test against a
`NODE_ENV=production` backend before you believe your auth works.

---

## 3. `/api/patient/*` — the patient module

Mounted at `server.js:359-365` behind `Auth.verifyToken` + `requirePatient`. Routes in
`api/patient/index.js`, handlers in `api/patient/controller.js`.

**No endpoint accepts a patient identifier.** It always comes from the token. There is
nowhere to put someone else's id, which is the point of the surface.

Shared conventions: `?limit` (default 20, **max 100**) and `?offset`; list responses add
`{total, limit, offset}` alongside `data`. `?from` / `?to` filter on the resource's own date
column.

### 2.1 Миний бүртгэл

```
GET /api/patient/me
```
`data` → `id_data, p_registration, p_lastname, p_firstname, p_birthday, p_age,
p_telephone, p_telephone2, p_workplace, addr_prov_city, addr_soum_dist, addr_bag_khoroo`

404 `NOT_FOUND` if there is no `Patient` row.

### 2.2 Миний тэмдэглэл — daily log

```
GET  /api/patient/journal          ?limit &offset &from &to
POST /api/patient/journal
GET  /api/patient/journal/summary  ?from &to
```

List `data` → array of `id_data, date, time, blood_pressure, blood_pressure2, pulse,
weight, inr, comment`, newest first.

Create body: `date` **required** (else 400 `DATE_REQUIRED`); optional `time`,
`blood_pressure`, `blood_pressure2`, `pulse`, `weight`, `inr`, `comment`. Returns `{id_data}`.

> **Changed 2026-09-14:** create now accepts `blood_pressure2` (diastolic). Until then reads
> and the summary chart returned it but create silently dropped it, so a patient could not
> record diastolic pressure at all. Send both halves of a blood-pressure reading;
> `blood_pressure` is systolic.

Summary `data` → `{labels: [date...], series: {blood_pressure, blood_pressure2, pulse,
weight}}`, ascending, capped at 365 points. Built server-side so you just plot it.

### 2.3 Эмчээс асуух асуулт

```
GET  /api/patient/questions   ?limit &offset
POST /api/patient/questions   { "comment": "..." }
```
`data` → array of `id_data, comment, is_doctor, date_creation, doctor_name`.
`is_doctor` distinguishes the reply from the question. `comment` required, else 400
`COMMENT_REQUIRED`.

### 2.4 Эмчийн зөвлөгөө

```
GET /api/patient/advice   ?limit &offset
```
`data` → array of `id_data, body, ticket_type, closed, date, comments[{id_data, comment, date}]`.

Read-only by design — advice is doctor-authored. **Two data facts that change your UI:**
`Advice.Body` is empty on 57% of tickets because the clinical content sits in the first
reply, and no notification is delivered when advice arrives (there is no patient recipient
column on `Notification`). Do not build a badge you cannot feed.

### 2.5 Эрсдэл үнэлгээ (ЗСӨ)

```
GET /api/patient/risk
```
`data` → `{bodySize, history}` — the latest `PatientBodySize` and `PatientOwnHistory` rows,
or `null`.

**No score and no risk class is computed.** The methodology and its risk classification must
be approved by ЗСҮТ before anything can score it (tracker row 38, `Саатсан`). This endpoint
returns inputs only. Do not invent a formula — a wrong cardiovascular risk number shown to a
patient is a clinical safety problem, not a rounding error.

### 2.6 Цахим үзлэг

**Rewritten 2026-09-14.** This was a complaint box; it is now the full flow — request,
appointment, examination. Verified end to end against `MnCardio_test`.

```
GET  /api/patient/evisits            ?limit &offset &status &from &to
POST /api/patient/evisits            { "Comment": "..."*, "RequestedDate": "2026-09-20 10:00:00" }
GET  /api/patient/evisits/:id
POST /api/patient/evisits/:id/cancel { "Reason": "..." }
GET  /api/patient/options/:dico
```

Row shape:

```json
{ "Id": 41, "Comment": "Цээж базлах шинжтэй",
  "RequestedDate": "2026-09-20 10:00:00", "ScheduledDate": "2026-09-21 14:30:00",
  "Status": "scheduled", "StatusLabel": "Цаг товлосон",
  "DoctorId": 512, "DoctorName": "Батболд Оюун",
  "MeetingUrl": "https://...", "CreateDate": "...", "UpdateDate": "..." }
```

Statuses are `requested → scheduled → completed`, with `cancelled` reachable from either open
state. `completed` and `cancelled` are **terminal for everyone, including an admin** — a
repeat consultation is a new request. A move that is not legal answers `409
INVALID_TRANSITION`.

> **`MeetingUrl` is only present while `Status` is `scheduled`.** It is null before and after,
> deliberately: a join link is a bearer credential for a clinical conversation, so it is not
> handed out while a request is still pending nor left reachable once the visit is over.

`RequestedDate` is **optional** — sending `{ Comment }` alone still works, which is what the
shipped Dart client does. A date in the past is refused with `400 DATE_IN_PAST`.

A patient may hold **three open requests** at once; a fourth answers `409
TOO_MANY_OPEN_REQUESTS`. Field names stay PascalCase inside the lowercase envelope, because
`RemoteVisit` is a newer-generation table.

**`GET /api/patient/options/:dico`** serves the dropdown lists — allowlisted to
`remotevisit_status`, `rehab_category`, `rehab_risk`, `rehab_phase`; anything else is `404
DICO_NOT_ALLOWED`. Use it rather than hardcoding the Mongolian: **this wording is drafted by
ITsystem and not yet approved by ЗСҮТ**, so it will change, and when it does it changes as a
database row with no app release. An empty array means the dictionary has not been seeded on
that server — show "not configured", not an error.

> **Still missing, and not ours to fix:** the patient is not *notified* when a slot is
> confirmed — there is no push anywhere yet — so poll `GET /evisits`. And `MeetingUrl` carries
> a link to whatever platform ЗСҮТ choose; that choice is still open, so the column is there
> and empty.

### 2.6b What the doctor app gets

```
GET  /api/doctor/evisits              ?scope=mine|unassigned|all &status &from &to
GET  /api/doctor/evisits/:id
POST /api/doctor/evisits/:id/schedule { "ScheduledDate": "..."*, "MeetingUrl": "https://..." }
POST /api/doctor/evisits/:id/complete { "Comment": "..." }
POST /api/doctor/evisits/:id/cancel   { "Reason": "..." }
```

`scope=mine` is the default and needs a resolved doctor profile (`403
DOCTOR_PROFILE_NOT_RESOLVED` otherwise). `scope=unassigned` is **care-team scoped** — you see
only unassigned requests from patients you are on the team for or monitoring; `scope=all` is
admin-only. Ordering is oldest-first, which is triage order.

`MeetingUrl` must be `https://` (`400 INVALID_URL`). The doctor is always assigned from the
token — **there is no way to assign a request to a different doctor through this API**; that
is done from the web. An id you may not act on returns `404`, never `403`, so the endpoint
cannot be used to discover which requests exist.

### 2.7 Сэргээн засах, дасгал хөдөлгөөн

```
GET  /api/patient/rehab/exercises
GET  /api/patient/rehab/progress     ?limit &offset &from &to
POST /api/patient/rehab/progress     { ExerciseId*, DurationSec, Notes }
GET  /api/patient/rehab/vitals       ?from &to
POST /api/patient/rehab/vitals       { ExerciseId, Phase, Pulse, BloodPressure, Spo2, Borg, Notes }
GET  /api/patient/rehab/assessment
```

**All six answer 200 on the test server** — verified 2026-09-10.
`scripts/add_rehabilitation_tables.sql` has been run against `MnCardio_test`, so the four
tables exist and the handlers work. `POST rehab/vitals` returns a real `{Id}`.

**Updated 2026-09-14. The catalogue now has 39 rows** on `MnCardio_test`, and each carries a
`CategoryLabel` and a parsed `media` object:

```json
{ "Id": 1, "Code": "EX-01", "Name": "Дасгал №1 — нэр батлагдаагүй",
  "CategoryCode": "warmup", "CategoryLabel": "Бэлтгэл дасгал",
  "DurationSec": null, "OrderNo": 1,
  "MediaRef": null, "media": { "kind": null, "ref": null, "url": null } }
```

> **Those 39 rows are PLACEHOLDERS and say so on every row.** The real names, categories and
> durations are clinical content ЗСҮТ own, and filming has not started. They exist so you have
> real ids, real ordering, real categories to group by and a real "no video" state to build
> against — not so they can be shown to a patient. ЗСҮТ enter the real ones through the web.

> **Never parse `MediaRef`. Branch on `media.kind`**, and treat `media.url === null` as "no
> video yet" rather than as an error:
>
> | `media.kind` | meaning | what to do |
> |---|---|---|
> | `null` | no video recorded yet | show the exercise without a player |
> | `"file"` | hosted on the MnCardio server | play `media.url` once it is non-null |
> | `"url"` | cloud or CDN | play `media.url` |
> | `"asset"` | bundled in the app | play your local asset named `media.ref` |
>
> Where the 39 videos will live is still an open customer question, and this is what keeps
> that answer from costing an app release: it becomes a database value.

- **Production has not had the script run.** This is an environment difference, so the DDL
  stays on the outstanding list in [READINESS.md](READINESS.md) §3. Do not read "works on
  test" as "shipped".

**New — what the doctor app gets:**

```
GET  /api/doctor/rehab/exercises                   same shape as the patient's
GET  /api/doctor/patients/:id/rehab                { assessment, progress, vitals }
GET  /api/doctor/patients/:id/rehab/assessment     ?limit &offset
POST /api/doctor/patients/:id/rehab/assessment     { AssessmentDate, RiskLevel, ToleranceScore, ToleranceUnit, Notes }
```

That POST closes a real gap: `GET /api/patient/rehab/assessment` could only ever read, and
nothing anywhere could write the row, so the patient's assessment screen was permanently
empty. All four are gated by care-team membership — a doctor who is not on the patient's team
or monitoring them gets `403 NO_PATIENT_ACCESS`. A patient with no register number answers
`409 NO_REGISTRATION`, because `PatRegNo` is the only key these tables have.

**Nothing is scored.** `RiskLevel` is a dictionary value and `ToleranceScore` is stored exactly
as entered — the risk methodology is a ЗСҮТ deliverable (tracker 38).

Note `rehab/exercises` takes no `limit`/`offset`, unlike its siblings.

- exercises → `Id, Code, Name, Description, CategoryCode, DurationSec, OrderNo, MediaRef`
- progress → `Id, ExerciseId, CompletedAt, DurationSec, Notes`
- vitals → `{rows[{Id, MeasuredAt, Phase, Pulse, BloodPressure, Spo2, Borg}], labels, series{pulse, spo2}}`
- assessment → latest row or `null`

`MediaRef` is a placeholder for the 39 exercise videos. **There is no video delivery path** —
the file layer serves `POST` + `Content-Disposition: attachment`, which no video player can
stream. That endpoint has to be built.

---

## 4. `/api/doctor/*` — the doctor module

Added 2026-09-10. Same conventions as `/api/patient/*`: real verbs, real status codes, the
lowercase envelope, `?limit`/`?offset`/`?from`/`?to`, and **no endpoint accepts a doctor, user
or organisation identifier** — all three come from the token via `helper/RequireDoctor.js`.

Covers tender §2 "Эмчийн модуль" and tracker rows 28–32.

### The gate

| code | HTTP | Means |
|---|---|---|
| `NOT_AUTHENTICATED` | 401 | no usable token |
| `NOT_A_DOCTOR` | 403 | `RoleId` is `4` — patients have their own surface |
| `ROLE_NOT_ALLOWED` | 403 | role outside `1, 2, 3, 6` (e.g. `5`, profile-only) |
| `ORGANIZATION_NOT_RESOLVED` | 403 | non-admin with no organisation — refused rather than run an unscoped query |

### `GET /me`

`data` → `{ UserId, DoctorId, RoleId, IsAdmin, FullName, profile, organization }`.

### 28 Миний үзлэгүүд

```
GET /visits       ?scope=mine|organization &from &to &search &limit &offset
GET /visits/:id
```

`scope=mine` (default) is what this user recorded; `scope=organization` is the whole
organisation including child organisations. Admins see everything.

`data` → array of `id_data, visit_date, chief_complaint, main_diagnosis, main_diagnosis_mn,
icd10, exam_type_icd, cause_icd10, procedure_icd9, has_complication, PatientId, PatRegNo,
OrganizationId`, each with a nested `Patient`. `search` matches registration number, last name
or first name.

`/visits/:id` is scoped the same way — an id outside your organisation returns **404, not the
record**. That matters: `Visit` holds ~450,000 rows, and an unscoped detail endpoint would be
an enumeration hole. `/api/Advice/GetTicket` still has exactly that gap — see §8.

### 29 Миний хяналт

```
GET    /monitoring                          ?limit &offset
POST   /monitoring                          { "PatientId": 123 }
DELETE /monitoring/:patientId
GET    /monitoring/:patientId/journal       ?from &to
GET    /monitoring/:patientId/questions     ?limit &offset
POST   /monitoring/:patientId/questions     { "comment": "..." }
```

The list returns `{ id_data, since, patient, latestReading }` per row — the most recent
journal reading is included, so the screen needs no second call per patient.

`journal` returns `{ rows, labels, series{blood_pressure, blood_pressure2, pulse, weight} }`
and refuses a patient you do not monitor with `403 NOT_MONITORED`.

`questions` is the doctor's side of 2.3 (added 2026-09-11). `GET` returns exactly the shape of
the patient's `GET /api/patient/questions` — `{ id_data, comment, is_doctor, date_creation,
doctor_name }`, newest first — so the client reuses one model. `POST` answers as the doctor in
the token (`is_doctor 1`, the same row the web's `MonitorQuestion` writes) and returns
`{ id_data }`; an empty comment is `400 COMMENT_REQUIRED`. Both refuse an unmonitored patient
with `403 NOT_MONITORED`.

> Add and remove take the doctor **from the token**. The legacy equivalents
> (`/api/PatientMonitoring/SavePatient`, `RemovePatient`) read `UserId` and `DoctorId` from the
> request **body**, so they can be pointed at another doctor's list. Use these, not those.
> Both write the same two audit rows the legacy path does.

### 30 Миний зөвлөгөө

```
GET /advice        ?filter=mine|drafts|all &limit &offset
GET /advice/:id
```

The doctor's **own** tickets — `Advice.id` is the author. Each row carries `commentCount`.
`/advice/:id` returns `{ ticket, comments }`, author-scoped.

This is deliberately not the organisation-wide wall; that stays at `/api/Advice/GetFeed` with
its own visibility rules (§6). Reimplementing those here would fork a security boundary across
two files.

### 31 Миний тайлан

```
GET /reports/summary   ?from &to
```

`data` → `{ window, myVisits, organizationVisits, monitoredPatients, adviceAuthored,
topDiagnoses[{diagnosis, total}], source{OrganizationId, generatedAt} }`.

Counts for the phone summary, carrying the provenance marking both tenders require on exports.
The formal reporting deliverable (tracker rows 59–63: approved forms, XLS/TXT export) is
separate work and still uses the existing Excel and PDF paths.

### 32 Read access to the patient side

```
GET /patients        ?search= &limit &offset      — min 3 characters, else 400 SEARCH_TOO_SHORT
GET /patients/:id
```

`/patients/:id` → `{ patient, visits[20], journal{labels, series}, isMonitoredByMe }`.

---

## 5. Chat — the one legacy surface that is genuinely mobile-ready

`POST /api/Chat/*`, PascalCase envelope. Identity comes from the token via
`ChatIdentity.Me()`; no route accepts a caller id. Text, image, **audio** and documents are
all supported, which covers tender §2 in full.

| Route | Body | Notes |
|---|---|---|
| `GetChatRoomList` | – | rooms with `UnreadCount`, `LastMessage`, `Members[]` |
| `GetMessages` | `ChatRoomId, PageSize(≤50), BeforeId` | keyset paging — use `BeforeId`, not page numbers |
| `SendMessage` | `ChatRoomId, MessageText, HasAttachment, ClientMsgId` | text ≤ 2000 chars; `ClientMsgId` echoes back for optimistic UI |
| `CommitMessage` | `MessageId, ClientMsgId` | promotes a pending attachment message |
| `MarkRead` | `ChatRoomId, LastMessageId` | |
| `GetUnreadCount` | – | |
| `AddChatRoom` / `StartChat` | `UserType, UserId` | idempotent 1:1 room |
| `CreateGroupRoom` | `RoomName, Members[]` | doctors only — patients can never be group members |
| `SearchUsers` | `SearchText, PageSize, PageNumber, ...` | patient searches are scoped to their care team |
| `DownloadAttachment` | `FileId` | **membership-checked** — use this, never the generic download |

### Sending an attachment is three calls, in order

```
1. POST /api/Chat/SendMessage   { ChatRoomId, MessageText, HasAttachment: true, ClientMsgId }
      -> creates a message with Status 'P' (pending). NOT yet delivered to anyone.
2. POST /api/BaseObject/uploadFile   (multipart, LinkedObjectName: 'ChatMessages',
                                      LinkedObjectId: <the new MessageId>)
3. POST /api/Chat/CommitMessage { MessageId, ClientMsgId }
      -> promotes it to sent and fans it out over the socket.
```

If step 3 never happens, or zero files landed, the carrier message is deleted rather than
left as an empty bubble. Chat uploads get a **50 MB** cap (10 MB everywhere else).

Allowed extensions, app-wide (`BaseController.js:278-301`):
`jpg jpeg png gif webp bmp heic · pdf doc docx xls xlsx txt csv dcm · mp3 m4a aac ogg wav webm`

Anything else is rejected outright. Note there is **no video extension on that list** — see
READINESS.

### Realtime

Socket.IO, JWT in the handshake (`helper/SocketAuth.js`), two separate mount paths:

| Path | Events |
|---|---|
| `/chatmessage` | server → `newMessage`, `messageRead`; client → `joinRoom`, `leaveRoom`, `typing`, `reauth` |
| `/notification` | server → `newNotification` |

Writes go over HTTP and the socket only fans out, so a dropped socket costs you liveness,
never a message. Reconnect and re-fetch; do not send over the socket.

**A backgrounded phone receives nothing.** There is no FCM/APNs anywhere in the backend, so
the socket is the only delivery channel and the OS will kill it. Until push exists, treat
the socket as a foreground nicety and poll on resume.

---

## 6. Advice feed — the organisation-wide wall

```
POST /api/Advice/GetFeed
{ PageNumber, PageSize(≤50), Filter: "all"|"open"|"closed"|"mine"|"drafts",
  Search, TicketType, ProvCity, SoumDist }
```

Returns tickets with avatars, up to 3 inline base64 thumbnails, comment and view counts, and
two preview replies. `Option` → `{Total, PageNumber, PageSize, HasMore}`.
`POST /api/Advice/GetTicket` is the detail sibling; `GetComments` loads the full thread.

Two data facts worth knowing before you build filters: **no ticket has status `'n'` (open)** —
5,469 are closed and 25 are drafts, so an open-only filter renders an empty screen — and
`Advice.level` is NULL on 40% of rows, which makes those invisible to every non-admin.

---

## 7. File upload — the multipart contract

`POST /api/BaseObject/uploadFile`, `multipart/form-data`, parsed by `formidable`
(`BaseController.js:366-570`). The shape mirrors a browser file input, so it needs
deliberate glue in Dart:

| Part | Type | Content |
|---|---|---|
| `LinkedObjectInfo` | JSON string | `{LinkedObjectId, LinkedObjectName, FieldName, AllowRemoveAll?}` |
| `<Field>Info` | JSON string | one per field — `{id_data}` to **keep** an existing file, omitted for a new one |
| `<Field>` | binary | the file itself, part name matching its `Info` sidecar |

Gates, in order: `MayAttachTo()` authorization → extension allowlist → size cap. Files land
in `ALLFILE_DIR` under a generated name; a `File` row records the original.

> **Omitting a field's `Info` part soft-deletes the file that was there.** That is how the
> web form signals removal. Send the `{id_data}` marker for every file you intend to keep,
> or an edit will quietly delete attachments.

### `POST /api/BaseObject/downloadFile` — authorized, but prefer a purpose-built route

**Corrected 2026-09-14.** Earlier versions of this document said this endpoint had no
ownership check. That is no longer true and has not been true for some time.
`downloadFile` (`controllers/system/BaseController.js:738`) resolves the client's handle to
the stored `File` row and authorizes *that* row through `MayDownload` (`:422-491`), which
refuses soft-deleted rows, routes Advice and AdviceComment through
`AdviceScopeHelper.MayReadAdviceAttachment`, applies `MayAttachTo`, and adds an explicit
`PatientScope` check. A refusal is a real **403**. The client does not get to pick the path.

Still prefer a purpose-built route where one exists — chat uses its own membership-checked
`Chat/DownloadAttachment`, and rehabilitation media uses `/api/Media/*`. Two reasons: they
return a streamable `GET` rather than a `POST` attachment download, and `MayAttachTo` ends in
a permissive default for any object it does not name, so an object with no explicit branch is
authorized only by the generic checks around it.

---

## 8. Endpoints that are inert or unsafe today

Do not spend a sprint discovering these.

| Endpoint / surface | State |
|---|---|
| `/api/patient/rehab/*` (6 routes) | **200 on test** — tables created 2026-09-10. But the exercise catalogue is **empty**, and production has not had the DDL run |
| `/api/patient/risk` | returns inputs only, **no score** — methodology unapproved |
| `/api/patient/evisits` | complaint box; no booking, status, doctor or video |
| `/api/Notification/GetListData` | **patients are denied every row** — `Notification` is not in `PatientScope`; no mark-read route exists. Still open. |
| `/api/RemoteVisit/GetList` | read-only over 4 columns; booking columns unrun **and** unwired |
| `/api/BaseObject/downloadFile` | ~~no ownership check~~ — **corrected**: it authorizes via `MayDownload` and 403s. Residual gap is `MayAttachTo`'s permissive default for unnamed objects. |
| `/api/Advice/GetTicket` | bypasses `BuildAdviceScope`; a known visibility gap |
| `/api/base/*`, `/api/report/*` | mounted with **no authentication** (`server.js:389`) |
| `/api/Test/*` | ~~public 1 GB unauthenticated upload~~ — **fixed 2026-09-14**. `uploadFile`, `ApiSendMail`, `print` and `printNew` were deleted. Two pure string-validation routes remain public. |
| ~~doctor module~~ | **Built 2026-09-10** — `/api/doctor/*`, §4 |

The rows from `GetTicket` to `/api/Test/*` are security findings, already recorded in
`CLAUDE.md §10` for the contract's mandated audit. They are listed here so you do not mistake
them for features.
