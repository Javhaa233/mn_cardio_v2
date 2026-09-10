# Credential rotation — what is exposed and how to rotate it

Written 2026-09-10, while preparing the GitHub repository for an external collaborator.

**No credential value appears in this file. Key names only.**

---

## What happened

The backend git repository has live credentials and three private keys committed to its
history, and that history is already pushed to GitLab (`origin/main`).

| Path | Since | Contains |
|---|---|---|
| `.env`, `.env.development`, `.env.production` | `.env` from 2026-04-06 | `SQL_PASSWORD`, `JWT_PASS`, `MAIL_USER_PASS`, `EMD_PASSWORD`, `XYP_PASSWORD`, `XYP_KEY`, `XYP_ACCESS_TOKEN`, `SQL_USER`, `SQL_HOST` — all non-empty |
| `config/SSL/telemedicine_mn.key` | initial commit, 2025-12-04 | TLS private key for `smr.telemedicine.mn` |
| `config/Xyp/shastinhospital1.key` | initial commit, 2025-12-04 | ХУР integration private key |
| `config/Xyp/shastinhospital1.pem` | initial commit, 2025-12-04 | matching certificate |
| `config/Xyp/shastinhospital1.ovpn` | initial commit, 2025-12-04 | ХУР VPN profile |

The backend `.gitignore` covers `node_modules`, `config/Config.env` and `reportPDF` — it has
never covered `.env`, `.env.production`, `config/SSL/*.key` or `config/Xyp/*.key`. That is
why these were committed, and it is fixed in the GitHub export.

**The GitHub repository does not contain any of them.** It was built as a single fresh
commit from a filtered copy, so none of this history exists there. The exposure is the
existing GitLab repository, not the new one.

### Why this matters more than a typical leaked password

`JWT_PASS` is the signing secret for every authentication token in the system
(`helper/Auth.js:26`). Anyone holding it can forge a valid token for **any user of a
national cardiology EMR** — any doctor, any patient, any administrator — without touching
the login endpoint or leaving a failed-login trace. It is the single most serious item on
the list, and it is also the easiest to rotate.

---

## Rotate these yourself

Order matters: do `JWT_PASS` last, because it logs everyone out.

The file that actually loads at runtime is **`config/Config.env`** (`server.js:6`). The root
`.env` files are near-dead — only `config/DbConnection.js` reads them via a bare
`dotenv.config()`. Update `config/Config.env` on the server, and delete the root `.env` files
rather than updating them.

### 1. `MAIL_USER_PASS` — lowest risk, do it first as a rehearsal

If the account is Gmail, revoke the existing app password and issue a new one; otherwise
change it at the mail provider. Update `MAIL_USER_PASS` in `config/Config.env`, restart, and
confirm with `node scripts/send_test_mail.js`. Password reset emails break if this is wrong,
so verify before moving on.

### 2. `SQL_PASSWORD`

Change the password for `SQL_USER` on the MSSQL instance, then update `SQL_PASSWORD` in
`config/Config.env` and restart the backend. Watch `GET /health` and the first request that
touches the database — a wrong value fails at connection time, not at startup, so the server
will appear to start fine and then fail every query.

Note `SQL_PORT` is read by no code at all (`DbConnection.js` passes only `SQL_HOST`), so
there is nothing to change there.

### 3. `EMD_PASSWORD` / `EMD_USERNAME`

ЭМД health insurance integration credentials. Reissued by ЭМД, so this is a request rather
than a self-service change, but it is your relationship rather than ЗСҮТ's — worth starting
now. Update in `config/Config.env`, then exercise `EMDServiceController` once.

### 4. `JWT_PASS` — do this last

Generate a new secret, at least 32 random bytes:

```
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

Put it in `config/Config.env` and restart.

**Every existing token becomes invalid the moment you restart.** Every doctor and patient is
logged out and must sign in again. Schedule it outside clinical hours and tell ЗСҮТ
beforehand — an unannounced mass logout in a hospital reads as an outage.

There is no token blacklist and no refresh mechanism, so there is no gentler path available
today. Rotating the secret *is* the revocation mechanism.

---

## Only ЗСҮТ or a certificate authority can rotate these

Add them to the next ЗСҮТ letter. Both are in [BLOCKERS.md](BLOCKERS.md) item 7.

### 5. `config/SSL/telemedicine_mn.key` — TLS private key for `smr.telemedicine.mn`

The private key of the public HTTPS certificate. Anyone holding it can impersonate the site
or decrypt captured traffic where forward secrecy was not negotiated.

Requires generating a new key and CSR, having the certificate reissued by the CA, installing
it, and **revoking the old certificate** — reissuing without revoking leaves the exposed key
valid until expiry. Whoever administers the domain and the reverse proxy does this.

### 6. `config/Xyp/shastinhospital1.{key,pem,ovpn}` — ХУР integration

The private key, certificate and VPN profile for the state data exchange. Reissued by the ХУР
operator under the service agreement. This is already entangled with letter item 6 (ХУР access
rights and keys, tracker row 17, `Саатсан`) — fold the rotation into that request rather than
opening a second one.

---

## After rotating

1. Confirm the new values are only in `config/Config.env`, which is gitignored, and never in
   a root `.env`.
2. Delete the root `.env`, `.env.development` and `.env.production` from the working tree and
   from git tracking on the GitLab repository. Removing them from `HEAD` does **not** remove
   them from history — the values stay retrievable from any older commit, which is precisely
   why rotation is the fix and deletion is not.
3. Decide what happens to the GitLab repository. The history cannot be made safe by any new
   commit. Either rewrite it with `git-filter-repo`, or make the repository private, restrict
   its membership, and treat the rotated credentials as the actual remedy.
4. Record all of this for the information-security audit the contract mandates
   (`CLAUDE.md §9`). It is exactly the class of finding that audit exists to catch, and having
   found and remediated it beforehand is a better position than having it found for you.

---

## Not affected

- **`ssh.env`** — the project-root file holding live SQL and SSH credentials was never in any
  repository, is not in the GitHub export, and stays where it is. It remains outside every
  `.gitignore`, so it is one careless `git add` away from the same problem. The GitHub export
  ignores it explicitly.
- **`frontend/`** — no secrets tracked, no `.env`, nothing to rotate.
