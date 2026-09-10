# МнКардио backend — mobile API contract

Everything a Flutter client needs to talk to the MnCardio backend. Verified against source
on 2026-09-10; each claim names the file it came from so you can re-check it when the
backend moves.

Base URL in development: `http://<host>:5001` — port is `process.env.PORT || 5001`
(`server.js:382`). Health: `GET /health`.

---

## 1. The two layers — read this first or you will lose a day

The backend has two API layers with **different conventions**, and both are live. Which one
you are in is determined entirely by the URL prefix.

| | `/api/patient/*` | everything else under `/api/*` |
|---|---|---|
| Verbs | real `GET` / `POST` | **`POST` for everything**, including reads |
| Envelope | `{success, message, data, code}` — lowercase | `{Success, Message, Data, Option}` — PascalCase |
| Errors | **real HTTP status codes** — 400 / 403 / 404 / 500 | **HTTP 200, always** |
| Paging | `?limit` & `?offset`, response carries `total` | inside the `Option` object |
| Patient identity | from the token, never from the request | passed in the body |

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

Every legacy call must branch on the `Success` field, not the status code. `/api/patient/*`
is the exception and behaves normally. [FLUTTER.md](FLUTTER.md) has an interceptor that
normalises both into one exception type — write it before you write your second screen.

---

## 2. Auth

JWT bearer, **10-hour expiry**, `Authorization: Bearer <token>` (`helper/Auth.js:29`).

**There is no refresh endpoint.** After 10 hours the token is dead and the user logs in
again. `LogOut` on both controllers is a stub that returns success without invalidating
anything server-side — the token stays valid until it expires. Plan your session handling
around that, and see [READINESS.md](READINESS.md) for the request to add refresh.

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

Both are public routes. The patient reset applies **no password-complexity rule**; the staff
one does.

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
`blood_pressure`, `pulse`, `weight`, `inr`, `comment`. Returns `{id_data}`.

> **Asymmetry to know about:** reads return `blood_pressure2` (diastolic) but **create does
> not accept it** (`controller.js:115-140`). A patient cannot currently record diastolic
> pressure through the API, though the chart plots it. Flagged in READINESS.

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

```
GET  /api/patient/evisits    ?limit &offset
POST /api/patient/evisits    { "Comment": "..." }
```
`data` → array of `Id, Comment, CreateDate`.

> **Two traps.** First, these field names are **PascalCase inside the lowercase envelope**,
> because `RemoteVisit` is a newer-generation table — do not assume the envelope's casing
> reaches the fields. Second, this is a complaint box, not a booking system: there is no
> scheduling, no status, no doctor assignment and no video call anywhere in the backend. The
> tender's full цахим үзлэг flow is unbuilt. See [READINESS.md](READINESS.md).

### 2.7 Сэргээн засах, дасгал хөдөлгөөн

```
GET  /api/patient/rehab/exercises
GET  /api/patient/rehab/progress     ?limit &offset &from &to
POST /api/patient/rehab/progress     { ExerciseId*, DurationSec, Notes }
GET  /api/patient/rehab/vitals       ?from &to
POST /api/patient/rehab/vitals       { ExerciseId, Phase, Pulse, BloodPressure, Spo2, Borg, Notes }
GET  /api/patient/rehab/assessment
```

**All six return 500 today.** The handlers and all four Sequelize models
(`model/Rehabilitation/`) are written, but the tables do not exist —
`scripts/add_rehabilitation_tables.sql` has not been run. This is a single DDL execution
away from working; nothing else is missing. Build against the shapes below and expect them
to light up.

- exercises → `Id, Code, Name, Description, CategoryCode, DurationSec, OrderNo, MediaRef`
- progress → `Id, ExerciseId, CompletedAt, DurationSec, Notes`
- vitals → `{rows[{Id, MeasuredAt, Phase, Pulse, BloodPressure, Spo2, Borg}], labels, series{pulse, spo2}}`
- assessment → latest row or `null`

`MediaRef` is a placeholder for the 39 exercise videos. **There is no video delivery path** —
the file layer serves `POST` + `Content-Disposition: attachment`, which no video player can
stream. That endpoint has to be built.

---

## 4. Chat — the one legacy surface that is genuinely mobile-ready

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

## 5. Advice feed (doctor-facing)

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

## 6. File upload — the multipart contract

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

### Do not call `POST /api/BaseObject/downloadFile`

It has **no ownership check at all** — anyone holding a `generated_name` and `ext` gets the
bytes (`helper/BaseControllerHelper.js:1011-1050`). Chat deliberately does not use it. Use a
purpose-built authorized route, and if the file type you need has none, ask for one.

---

## 7. Endpoints that are inert or unsafe today

Do not spend a sprint discovering these.

| Endpoint / surface | State |
|---|---|
| `/api/patient/rehab/*` (6 routes) | **500** — tables not created; code and models are complete |
| `/api/patient/risk` | returns inputs only, **no score** — methodology unapproved |
| `/api/patient/evisits` | complaint box; no booking, status, doctor or video |
| `/api/Notification/GetListData` | **patients are denied every row** — `Notification` is not in `PatientScope`; no mark-read route exists |
| `/api/RemoteVisit/GetList` | read-only over 4 columns; booking columns unrun **and** unwired |
| `/api/BaseObject/downloadFile` | no ownership check — do not use |
| `/api/Advice/GetTicket` | bypasses `BuildAdviceScope`; a known visibility gap |
| `/api/base/*`, `/api/report/*` | mounted with **no authentication** (`server.js:368`) |
| `/api/Test/*` | **public**, and `PUT /api/Test/uploadFile` is an unauthenticated 1 GB file upload into the patient attachment directory |
| doctor module | **no mobile API exists** — see [READINESS.md](READINESS.md) |

The last four are security findings, already recorded in `CLAUDE.md §10` for the contract's
mandated audit. They are listed here so you do not mistake them for features.
