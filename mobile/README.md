# МнКардио — Мобайл апп / Mobile app

**Work from this folder.** It is the contract between the MnCardio backend and the
Android + iOS app described in the mobile tender (`mobile mncardio.docx`,
2026.07.03 – 2026.10.15).

Start here, in this order:

| File | What it answers |
|---|---|
| [QUICKSTART.md](QUICKSTART.md) | **Start here.** Credentials, first login, first real data — about ten minutes. |
| [API.md](API.md) | How do I call the backend? Every endpoint, both envelopes, auth, uploads, sockets. |
| [READINESS.md](READINESS.md) | What already works, and what backend work must land before I can build my screen? |
| [BLOCKERS.md](BLOCKERS.md) | What is waiting on ЗСҮТ or an external account, and therefore cannot be coded around. |
| [FLUTTER.md](FLUTTER.md) | Packages, project layout, token storage, biometrics, and the upload glue. |

And two folders you can run rather than read:

| Folder | What it gives you |
|---|---|
| [`postman/`](postman/) | 55 requests covering the whole mobile surface. Import, fill in credentials, press Send. Both logins store their token automatically. |
| [`client/`](client/) | `smoke.js` — ten calls that prove your setup, with no dependencies. `dart/` — the `dio` client, token storage and typed wrappers, ready to lift into `app/lib/core/`. |

---

## What the app is

Three user-facing modules, from tender §2–§4.

**Эмчийн модуль (doctor)** — Миний үзлэгүүд · Миний хяналт · Миний зөвлөгөө · Миний тайлан,
plus read access to the patient modules.

**Үйлчлүүлэгчийн модуль (patient)** — 2.1 Миний бүртгэл · 2.2 Миний тэмдэглэл ·
2.3 Эмчээс асуух асуулт · 2.4 Эмчийн зөвлөгөө · 2.5 Эрсдэл үнэлгээ (ЗСӨ) ·
2.6 Цахим үзлэг · 2.7 Сэргээн засах, дасгал хөдөлгөөн.

**Телемедицин ба сэргээн засах** — examination notes, tests, file attachment, advice
and comments; rehabilitation assessment, vital signs, and 39 exercise videos.

The authoritative scope document is `МнКардио_тендерийн_ажлын_жагсаалт.xlsx` in the project
root, sheet **Мобайл апп** — 82 rows with phase, owner, dates, status and an acceptance
criterion each. Read it before planning work. Do not duplicate it; update it.

---

## Ground rules

**Mongolian is the product language.** Every label, button, error, empty state and loading
message is Mongolian. Nothing user-visible ships as an English string. This is tender §1,
not a preference.

**Never put a credential in this folder or in the app repo.** No connection strings, no
`ssh.env`, no `.env` copied from the backend, no API keys committed. The backend already
has a credential-in-git problem being cleaned up — do not start a second one. If you need a
value, ask for it and keep it in your local untracked config.

**Clinical wording is not yours to improve.** Field labels, drug names and scored
instruments come from the tender verbatim. If something reads wrong, flag it — do not
paraphrase.

**Extend, don't fork.** The backend is a live national EMR in clinical use since 2009. If
an endpoint is missing, ask for it to be added to `api/patient/*` or a new `api/doctor/*` —
do not query the database directly, and do not build a parallel API. The tender permits a
separate API off the same database; that permission is a trap and we are not using it.

---

## The test server — build against this

**`https://mncardio.itsystem.mn`** is live. It is the shared test environment for the rest
of the delivery: real schema, real data, TLS, and the same code you see in this repo.

```
GET  https://mncardio.itsystem.mn/health                 -> {"status":"ok", ...}
POST https://mncardio.itsystem.mn/api/User/Login         -> doctor / staff token
POST https://mncardio.itsystem.mn/api/PatientUser/Login  -> patient token
```

Test credentials for both a doctor and a patient account exist. Ask for them — they are
kept in `test-environment.env` outside this repository and are deliberately not written
down here. **Those passwords were set in the test database only**; the same accounts on
production are untouched.

What is real on it:

| | |
|---|---|
| Database | restored from production — 226 tables, 680 organisations, 450,601 visits, 357,156 patients |
| Tender forms | all 11 seeded, 1,687 fields |
| Module 2.7 rehabilitation | **tables created — `/api/patient/rehab/*` returns 200, not 500.** The exercise catalogue is still empty, pending the customer decisions in [BLOCKERS.md](BLOCKERS.md) §1 |
| Doctor + patient + auth APIs | verified end to end over HTTPS with real logins |
| Chat + notification sockets | WebSocket upgrade confirmed (101) on both paths |

It is a **test** environment. Data can be reset, and it carries real patient records, so
treat it with the same care as production.

---

## Running the backend locally

```
cd backend
cp config/Config-Template.env config/Config.env   # then fill in real values
npm install                                       # postinstall downloads Chrome for Puppeteer
npm run dev                                       # nodemon, http://localhost:5001
```

Health check: `GET http://localhost:5001/health` → `{"status":"ok","timestamp":"..."}`.

Two things that will cost you an afternoon if you miss them:

- **`config/Config.env` is the file that actually loads** (`server.js:6`). The root `.env`,
  `.env.development` and `.env.production` are near-dead — only `config/DbConnection.js`
  reads them. Putting config in the root `.env` files does nothing.
- The server **exits on startup** if it cannot create `ALLFILE_DIR` or `REPORT_DIR`.

The Vite dev proxy is a frontend-only mechanism and does not apply to you. A phone or
emulator talks to the backend host directly, so `localhost` will not resolve from a device —
use the machine's LAN IP, and note the Android emulator reaches the host as `10.0.2.2`.

### CORS is not your problem, and that is worth knowing

`config/CorsOrigin.js` always allows requests with no `Origin` header, which is every native
HTTP client. You will not hit CORS from Flutter. You *will* hit it from Flutter **web**, which
is not a tender target — do not add a web target to work around a problem you do not have.

---

## First task, before writing any UI

Prove the contract end to end:

1. `POST /api/PatientUser/Login` with a real patient account → take `Data.token`.
2. `GET /api/patient/me` with `Authorization: Bearer <token>` → your own record.

If step 2 returns `403 PATIENT_NOT_RESOLVED`, the account has no linked `Patient` row — that
is a data problem, not a code problem. See [API.md](API.md) § Auth.

---

## How this folder relates to the app repo

This folder is the **contract and the handover notes**. The Flutter app itself lives here too,
under a subdirectory you create (`mobile/app/`), so that the API docs and the client that
consumes them stay in one place and cannot drift apart without showing up in the same commit.

`backend/` and `frontend/` in this repository are **reference copies**. Read them freely.
Backend changes are made by ITsystem against the GitLab repositories — if you need an
endpoint, raise it rather than editing `backend/` here and expecting it to deploy.
