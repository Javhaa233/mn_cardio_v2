# Deploying the MnCardio test environment

Target: **`mncardio.itsystem.mn`** (`103.87.255.221`) — the shared test environment the web
system and the mobile app both run against, until the delivery is finished. Full plan and rationale:
`~/.claude/plans/create-new-folder-and-toasty-bonbon.md`.

The box **already serves other sites**. Survey before changing anything, back up every config
with `cp -a`, and never `systemctl reload nginx` without `nginx -t` passing first.

## Credentials

`c:\Ajil\mn_cardio_v2\test-environment.env` — `SSH_HOST`, `SSH_PORT`, `SSH_USER`, `SSH_PASSWORD`.
Outside both repos, and excluded from the GitHub export by pattern and by the root allowlist.
`ssh.env` (production) is a different file and a different server; do not confuse them.

## Running remote commands

Windows `ssh.exe` needs a TTY for the password, so it cannot be driven non-interactively.
Use the paramiko helper:

```
uv run --with paramiko python rsh.py "hostname"
uv run --with paramiko python rsh.py --script deploy/scripts/00-survey.sh
uv run --with paramiko python rsh.py --put local.tar.gz /tmp/local.tar.gz
```

Anything with quotes, newlines or a heredoc goes through `--script`. Do not fight the quoting.

## Order

| # | Step | Notes |
|---|---|---|
| 0 | `deploy/scripts/00-survey.sh` | **Read-only.** Decides the SQL Server branch and shows the other tenants. Read the output before continuing. |
| 1 | Back up production | `BACKUP DATABASE MnCardio_restored ... WITH COPY_ONLY` — does not disturb the existing backup chain. |
| 2 | Install SQL Server | Native `apt` on Ubuntu 20.04/22.04; **Docker on 24.04+**, which has no supported native install. Bind to `127.0.0.1`; leave 1433 closed. |
| 3 | Restore | Verify ~200 tables, 39 views, 16 procedures, ~680 `Organization` rows. A restore that "succeeds" with 7 tables is the failure to catch. |
| 4 | Pending DDL | `add_rehabilitation_tables.sql` (turns module 2.7 on), `add_remotevisit_booking_columns.sql`, then `node scripts/generate_form_views.js`. |
| 5 | Node 24 + app | `engines: >=24.0.0`. Install Chrome's shared libraries **before** `npm install` or Puppeteer's postinstall yields a broken headless Chrome and every PDF fails at runtime. |
| 6 | `config/Config.env` **and** `.env` | Both. `config/DbConnection.js` calls a bare `dotenv.config()` and reads `backend/.env`, so standalone scripts see only that file. `chmod 600`. |
| 7 | PM2 | `pm2 start ecosystem.config.js --env production`, then `pm2 save && pm2 startup`. |
| 8 | nginx + certbot | `deploy/nginx/*`. Certbot rewrites the site file to add TLS; DNS already resolves so HTTP-01 validates. |
| 9 | **Attachment bytes** | The restore brings the `File` ROWS, not the files. Copy what you need into `ALLFILE_DIR` — see below. |

## Step 9: the attachments, which the restore does not bring

Restoring the database and stopping there gives you a system where every legacy
attachment renders in the UI and then **404s** on `/BaseObject/downloadFile` — the row
exists, the bytes do not. Nothing warns you: `server.js:52-58` silently creates the empty
directory, and `NODE_ENV=production` swallows the `BaseDownloadFile: Validated path does
not exist` line. This cost a day of chasing a routing fault that was never there.

Production holds **23 GB** in `/home/admin630/upload_files` (2,399 files + 12,380 upload
directories). The test box has 47 GB total, so a full mirror does not fit. Copy by class —
live `File` rows weigh:

| Linked object | Rows | Size |
|---|---|---|
| FollowUp | 7,745 | 12.6 GB |
| ExaminationEcho | 2,592 | 4.5 GB |
| Visit | 1,494 | 1.4 GB |
| AdviceComment (тасалбар) | 640 | 849 MB |
| EcgExamination | 692 | 849 MB |
| DoctorsProfile (avatars) | 156 | 43 MB |

List one class and copy it:

```
node scripts/advice_attachments.js --list names.txt      # from backend/, Advice + AdviceComment
uv run --with paramiko python deploy/scripts/relay_attachments.py --list names.txt --dry-run
uv run --with paramiko python deploy/scripts/relay_attachments.py --list names.txt
```

The relay streams prod -> here -> test over SSH. It is deliberately not an rsync between
the two hosts: that would need sshpass installed or an SSH key planted on production, and
neither is worth leaving behind for a one-off copy. It skips what is already there, so an
interrupted run just resumes, and it refuses to start if the copy would leave the test box
under 5 GB free — that box also serves `wellcom` and `itsystem-api`.

**Done so far:** the 638 Advice/AdviceComment files (847 MB), on 2026-09-10. Everything
else still 404s there by design.

## Things that will bite

- **`NODE_ENV=production` is mandatory.** It is what enables real JWT verification and real
  password checks — `helper/Auth.js:212` and `UserController.js:246` both bypass security
  otherwise. It also binds the app to `127.0.0.1` for nginx, and silences `console.log`
  (`server.js:12-36`), so quiet PM2 logs are expected rather than a fault.
- **`instances: 1`, fork mode.** Socket.IO rooms are per-process; clustering silently drops
  chat messages for members on other workers. `ecosystem.config.js` says so too.
- **Generate a new `JWT_PASS`.** Do not copy production's — it is compromised and pending
  rotation (`mobile/SECURITY-ROTATION.md`).
- **Set `ALLFILE_DIR1` and `REPORT_DIR` explicitly.** The server exits on boot if it cannot
  create them, and `REPORT_DIR` otherwise defaults to `/home/admin630/Desktop/outReports/`.
- **`client_max_body_size 50m`.** Chat attachments are capped at 50 MB; nginx's 1 MB default
  would reject them before the app saw them.
- **`/chatmessage` and `/notification` are not under `/api`.** Miss them in nginx and the SPA
  fallback returns `index.html` for socket handshakes — everything works except realtime.

## Will not work here, by design

ХУР and ЭМД integrations need the VPN profile and client certificate issued to the production
host (`mobile/BLOCKERS.md` item 6). Outbound mail needs `MAIL_*` pointed somewhere real.
