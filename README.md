# MnCardio v2

Mongolian national cardiology EMR and telemedicine system (Зүрх судасны үндэсний төв — ЗСҮТ).
In clinical use since 2009, rewritten in 2019, running at `smr.telemedicine.mn`.

**Private repository.** It contains a live clinical system's source. Do not fork it, publish
it, or paste its contents into third-party services.

---

## Mobile developers — start here

Everything you need is in **[`mobile/`](mobile/)**, in this order:

| Document | What it answers |
|---|---|
| [mobile/README.md](mobile/README.md) | What the app is, ground rules, how to reach the backend |
| [mobile/API.md](mobile/API.md) | The API contract — every endpoint, both response envelopes, auth, uploads, sockets |
| [mobile/READINESS.md](mobile/READINESS.md) | What already works, and what backend work must land first |
| [mobile/BLOCKERS.md](mobile/BLOCKERS.md) | What is waiting on ЗСҮТ or an external account |
| [mobile/FLUTTER.md](mobile/FLUTTER.md) | Packages, layout, token storage, biometrics, upload glue |

The short version: **the patient module is largely served and you can start today; the doctor
module has no mobile API yet.** Read `READINESS.md` before planning a sprint.

The Flutter app itself goes in `mobile/app/`.

---

## Layout

| Path | What it is |
|---|---|
| `backend/` | Node + Express + Sequelize + MSSQL. The API. |
| `frontend/` | React 18 + Vite + MUI. The web client. |
| `mobile/` | Mobile API contract and handover docs. The Flutter app lives here. |
| `CLAUDE.md` | **The engineering guide to this codebase.** Architecture, conventions, recipes, and a long list of traps. Read it before changing anything. |
| `*.docx` | The two signed tenders. |
| `МнКардио_тендерийн_ажлын_жагсаалт.xlsx` | The authoritative task tracker — 153 web rows, 82 mobile rows. |

Stack is fixed by contract: React, Node + Express, MSSQL 2017 Express+, Ubuntu 22.04 LTS+.

---

## Running it

**Backend**
```
cd backend
cp config/Config-Template.env config/Config.env   # then fill in REAL values — the template is placeholders
npm install
npm run dev            # http://localhost:5001 — health check at /health
```

**Frontend**
```
cd frontend
npm install
npm run dev            # http://localhost:3000, proxies to 127.0.0.1:5001
```

`config/Config.env` is the file that actually loads. See `CLAUDE.md §2` for the details and
for why the root `.env` files are not it.

---

## Security notes for anyone joining

- **Never commit a credential.** `.gitignore` is deliberately broad; do not narrow it. There
  is no `.env` in this repository and there should never be one.
- `config/Config-Template.env` here contains **placeholders only**. Fill in your own values in
  `config/Config.env`, which is ignored.
- The predecessor GitLab repository has credentials in its history. Rotation is tracked in
  [mobile/SECURITY-ROTATION.md](mobile/SECURITY-ROTATION.md). Do not copy configuration from it.
- Known security findings in the codebase are listed in `CLAUDE.md §10`. They are on the
  contract's mandated audit list — read them before assuming a behaviour is intentional.

---

## History

This repository starts from a single commit. The predecessor repositories
(`gitlab.com/Enkhtur/mncardio-backend`, `gitlab.com/Enkhtur/mncardio-frontend`) retain the
earlier history; it carries no meaningful commit messages, and it contains credentials, which
is why it was not carried over.
