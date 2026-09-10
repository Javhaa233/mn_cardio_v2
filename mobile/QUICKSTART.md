# Quickstart — your first data from the test server

Zero to real patient data in about ten minutes. Read this before [API.md](API.md), which is
the full reference and assumes you already have a token in your hand.

Everything below was run against the live test server on **2026-09-10**. Response shapes are
verbatim; identifying values are replaced with placeholders (see [Redaction](#a-note-on-the-data-you-will-see)).

| | |
|---|---|
| Base URL | `https://mncardio.itsystem.mn` |
| Auth | `Authorization: Bearer <token>` — JWT, 10-hour expiry |
| Explore it | [`postman/`](postman/) — import the collection, press Send |
| Prove it | `node client/smoke.js` — seven calls, no dependencies |

---

## 0. Get credentials

Three test accounts exist — a doctor, a patient and an admin. They live in
`test-environment.env`, which sits outside every git repository and **is not in this folder**.

Ask ITsystem for them. They arrive out of band — not in a commit, not in a chat message that
lands in a repository, not pasted into an issue.

Put them in your shell for the session:

```powershell
$env:MNCARDIO_PATIENT_USER     = '...'
$env:MNCARDIO_PATIENT_PASSWORD = '...'
$env:MNCARDIO_DOCTOR_USER      = '...'
$env:MNCARDIO_DOCTOR_PASSWORD  = '...'
```

```bash
export MNCARDIO_PATIENT_USER='...'      MNCARDIO_PATIENT_PASSWORD='...'
export MNCARDIO_DOCTOR_USER='...'       MNCARDIO_DOCTOR_PASSWORD='...'
```

> **Do not write them to a file inside this folder.** The GitHub export publishes `mobile/`,
> and `verify-no-secrets.js` reads the real values and searches every exported file for them —
> a password pasted into a note here fails the export. It has already caught that mistake once.
> Note also that any file named `*.env` under `mobile/` is silently dropped by the exporter,
> so a local `.env` here is invisible to the tooling that would otherwise protect you.

### The patient username is Cyrillic — this will bite you

A patient logs in with their **registration number**, which begins with two Cyrillic letters:
`ПП83011709`. Not Latin `PP`. The two look identical in most fonts and are different bytes.

Consequences, all of which cost real time:

- **PowerShell 5.1 corrupts it silently.** `Get-Content` defaults to the system ANSI codepage,
  so reading a UTF-8 file of credentials decodes `П` (`D0 9F`) as two Windows-1252 characters.
  The username silently becomes 12 characters instead of 10 and login fails with
  `Нэвтрэх нэр эсвэл нууц үг буруу байна` — which reads as a wrong password. Always
  `Get-Content -Encoding UTF8`. This exact mistake was made while writing this guide.
- **Send the body as UTF-8 and size it in bytes.** `Content-Length` must be
  `Buffer.byteLength(json)`, not `json.length`. Dart's `dio` handles this; hand-rolled clients
  often do not.
- **Do not type it by hand.** Copy and paste it, or you will type Latin `PP` and chase a
  phantom credential problem.
- Git Bash mangles Cyrillic on this project generally — use PowerShell or Node for anything
  involving these values.

---

## 1. Is the server up

```powershell
Invoke-RestMethod https://mncardio.itsystem.mn/health
```

```bash
curl -s https://mncardio.itsystem.mn/health
```

```json
{ "status": "ok", "timestamp": "2026-09-10T05:43:58.897Z" }
```

No token needed. If this fails, nothing below will work — stop and report it.

---

## 2. Log in

Two separate login endpoints. A patient token and a doctor token are **not
interchangeable**; each surface rejects the other by design.

### Patient

```powershell
$body = @{ UserName = $env:MNCARDIO_PATIENT_USER; Password = $env:MNCARDIO_PATIENT_PASSWORD } | ConvertTo-Json
$r = Invoke-RestMethod -Method Post -Uri https://mncardio.itsystem.mn/api/PatientUser/Login `
                       -ContentType 'application/json; charset=utf-8' -Body $body
$patientToken = $r.Data.token
```

```bash
curl -s -X POST https://mncardio.itsystem.mn/api/PatientUser/Login \
  -H 'Content-Type: application/json' \
  -d "{\"UserName\":\"$MNCARDIO_PATIENT_USER\",\"Password\":\"$MNCARDIO_PATIENT_PASSWORD\"}"
```

### Doctor

Identical, at `POST /api/User/Login`.

### What comes back

```json
{
  "Success": true,
  "Message": "Successfully logged in",
  "Data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "LogedUser": { "Id": 0, "UserName": "...", "RoleId": 4, "Patient": { "...": "..." } }
  }
}
```

**The token is at `Data.token` — capital `D`.** The two login endpoints are part of the
legacy layer, so they use the PascalCase envelope even though everything you will call next
uses the lowercase one. This is the single most common first-hour mistake.

A wrong password also returns **HTTP 200**:

```json
{ "Success": false, "Message": "Login name or password is incorrect",
  "Data": { "token": null, "LogedUser": null } }
```

---

## 3. Your first authenticated call

```powershell
$h = @{ Authorization = "Bearer $patientToken"; app = '1' }
Invoke-RestMethod -Uri https://mncardio.itsystem.mn/api/patient/me -Headers $h
```

```bash
curl -s https://mncardio.itsystem.mn/api/patient/me \
  -H "Authorization: Bearer $TOKEN" -H 'app: 1'
```

```json
{
  "success": true,
  "message": "",
  "data": {
    "id_data": 0,
    "p_registration": "ПП00000000",
    "p_lastname": "Овог",
    "p_firstname": "Нэр",
    "p_birthday": "1983-07-01",
    "p_age": 43,
    "p_telephone": null,
    "addr_prov_city": "...",
    "addr_soum_dist": "..."
  }
}
```

Lowercase `success` / `data` here — you are now on the mobile surface. The doctor equivalent
is `GET /api/doctor/me`.

**Note the `app: 1` header.** The web frontend sends it on every request and some handlers
read it. It costs nothing and avoids a class of confusing empty results.

---

## 4. Pull a real list

```bash
curl -s "https://mncardio.itsystem.mn/api/patient/journal?limit=5" \
  -H "Authorization: Bearer $TOKEN" -H 'app: 1'
```

```json
{
  "success": true, "message": "",
  "data": [
    { "id_data": 0, "date": "2024-08-15", "time": null,
      "blood_pressure": "118", "blood_pressure2": "90",
      "pulse": null, "weight": "75", "inr": null, "comment": null }
  ],
  "total": 6, "limit": 5, "offset": 0
}
```

Every list on `/api/patient/*` and `/api/doctor/*` works this way: `?limit` (default 20,
**hard maximum 100**), `?offset`, and `?from` / `?to` on the resource's own date column.
`total`, `limit` and `offset` come back alongside `data`.

The doctor equivalent, against ~450,000 visit rows:

```bash
curl -s "https://mncardio.itsystem.mn/api/doctor/visits?limit=5&scope=mine" \
  -H "Authorization: Bearer $DOCTOR_TOKEN" -H 'app: 1'
```

---

## 5. Stay logged in

The access token lasts 10 hours. Neither login endpoint returns a refresh token — you trade
your access token for one, once:

```bash
curl -s -X POST https://mncardio.itsystem.mn/api/auth/refresh \
  -H "Authorization: Bearer $TOKEN"
```

```json
{ "success": true, "message": "",
  "data": { "token": "...", "refreshToken": "...", "expiresIn": 36000, "LogedUser": {} } }
```

Store `refreshToken` securely — it lasts **30 days**. From then on send
`{"refreshToken":"..."}` in the body before the access token expires.

`GET /api/auth/session` tells you whether a token is still good without provoking an error
from a data endpoint — use it on app launch:

```json
{ "success": true, "message": "",
  "data": { "Id": 10, "UserName": "...", "RoleId": 3, "OrganizationId": 115, "IsPatient": false } }
```

`LogOut` invalidates nothing server-side. Logging out is deleting your stored tokens.

---

## 6. Now go read the reference

[API.md](API.md) documents every endpoint, the chat three-call attachment sequence, the
multipart upload contract and the Socket.IO paths. [FLUTTER.md](FLUTTER.md) covers packages,
secure storage and biometrics. [`client/`](client/) has the interceptor and typed wrappers
already written.

---

## Why did I get nothing back

These are call-contract facts, not bugs. Each has cost someone an afternoon.

| Symptom | Cause | Fix |
|---|---|---|
| HTTP 200, empty list, no error | The legacy layer (`/api/Chat`, `/api/Advice`, `/api/User`, …) returns **200 for every failure** | Branch on the `Success` field, never on the status code |
| `{"Success":false,"AuthError":true}` at HTTP 200 | Expired or missing token on a legacy route | Refresh and replay. On `/api/patient`, `/api/doctor`, `/api/auth` the same failure is a proper `401 TOKEN_INVALID` |
| `403 NOT_A_PATIENT` | You used a doctor token on `/api/patient/*` | The two surfaces are separate. Keep two tokens |
| `403 PATIENT_NOT_RESOLVED` | The account has no linked `Patient` row | A data condition, not your bug. Surface it as "бүртгэл олдсонгүй" |
| `403 ORGANIZATION_NOT_RESOLVED` | Non-admin doctor with no organisation | Same — refuse rather than run an unscoped query |
| `400 SEARCH_TOO_SHORT` | `GET /api/doctor/patients?search=` under 3 characters | Minimum 3. Do not fire on every keystroke |
| `400 DATE_REQUIRED` / `COMMENT_REQUIRED` / `EXERCISE_REQUIRED` | Missing required field on a POST | Branch on `code`, never on `message` — messages are display strings and will be reworded |
| `?limit=500` returns 100 rows | Server-side cap | Page with `offset` |
| Cyrillic prints as `?????` | Your terminal, not the API | PowerShell: `[Console]::OutputEncoding = [Text.Encoding]::UTF8`. Avoid Git Bash for these calls entirely |

### Two type traps in the responses

- **`RoleId` is sometimes a number and sometimes a string.** `GET /api/auth/session` gives
  `"RoleId": 3`; `GET /api/doctor/me` gives `"RoleId": "3"`. Compare as a string on both,
  or normalise once at the client boundary — [`client/dart/api_client.dart`](client/dart/)
  does the latter.
- **Field casing does not follow the envelope.** `/api/patient/evisits` sits in the lowercase
  envelope but its fields are `Id`, `Comment`, `CreateDate` — because `RemoteVisit` is a
  newer-generation table. The envelope tells you nothing about the field names inside it.

Role IDs, for reference — no enum exists in the codebase:
**1** admin · **2**, **3** doctor tiers · **4** patient · **5** profile-only · **6** settings.

---

## Things that answer, but not with what you expect

Worth knowing before you build a screen against them.

- **`GET /api/patient/rehab/exercises` returns `{"data":[],"total":0}`.** The rehabilitation
  tables exist on the test server and all six endpoints answer 200 — but no exercises have
  been seeded yet, because the exercise list, categories and the 39 videos are still customer
  decisions ([BLOCKERS.md](BLOCKERS.md) §1). Your list screen will be empty and that is
  correct. Build it; it will fill.
- **`GET /api/patient/risk` returns inputs, not a score.** No risk number and no risk class
  is computed anywhere — the methodology is unapproved. Do not invent a formula: a wrong
  cardiovascular risk shown to a patient is a clinical safety problem.
  Note two spellings in its payload: body weight is `bodySize.Weigth` (a typo baked into the
  database) and BMI comes back as `BJI`.
- **`POST /api/RiskScores/CalculateRisk` expects lowercase field names** — `gender`, `age`,
  `pressure`, `cholestrol` (sic), `isCholestrol`, `isDiabetes`, `isSmoker`, `BMI`. It is in
  the Postman collection but marked unverified: it returned an error on the last full run and
  no known-good request body exists for it yet.
- **`GET /api/patient/evisits`** is a comment box — no scheduling, no status, no doctor
  assignment, no video.
- **Patients receive no notifications.** There is no push anywhere in the backend, and the
  notification endpoint denies patients every row.

[READINESS.md](READINESS.md) is the full picture of what is and is not buildable today.

---

## A note on the data you will see

The test database is a **restore of production**. The patients are real people, the visits
are real visits. Treat it exactly as you would production: do not copy records out, do not
paste them into issues or screenshots, and do not commit them.

That is why every example above uses placeholder names and registration numbers while
keeping the real response shape. `client/smoke.js` prints live values to your own terminal
and deliberately writes nothing to disk.
