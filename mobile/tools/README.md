# Export tooling

Keeps the GitHub repository (`github.com/Javhaa233/mn_cardio_v2`, private) in step with the
working tree, without ever publishing a credential.

The working tree at `c:\Ajil\mn_cardio_v2` stays the source of truth. `backend/` and
`frontend/` remain the GitLab repositories they always were — nothing here changes them.

## Updating GitHub

```bash
# once
git clone https://github.com/Javhaa233/mn_cardio_v2.git C:/Ajil/mncardio-github

# each time
cd C:/Ajil/mn_cardio_v2
node mobile/tools/export-to-github.js "C:/Ajil/mncardio-github"
node mobile/tools/verify-no-secrets.js "C:/Ajil/mncardio-github"   # must print PASS
cd C:/Ajil/mncardio-github
git status && git add -A && git commit && git push
```

**`verify-no-secrets.js` must print PASS before you commit.** It exits non-zero otherwise, so
it can go in a pre-commit hook. Do not push past a failure — read what it found.

## What the export removes

Structural, by filename and path, so a new secret in a known location is caught without
anyone remembering to update a list:

- every `.env` / `.env.*`, `config/Config.env*`, `ssh.env`
- `config/SSL/` and `config/Xyp/` entirely
- any `*.key`, `*.pem`, `*.pfx`, `*.p12`, `*.ovpn`, `*.jks`, `id_rsa*`
- `node_modules/`, `build/`, `dist/`, and the backend's runtime output directories
- scratch files (`tmp_*.js`, `image*.png`, `*_backup_*.xlsx`, Office lock files)

Loose files at the repository root are **allowlisted**, not denylisted — a new file at the
root is excluded until someone adds it deliberately. That is the check that keeps `ssh.env`
out even if every other rule is edited away.

It also rewrites `backend/config/Config-Template.env` so every value is a placeholder,
**including commented-out lines** — a live `XYP_ACCESS_TOKEN` was found in one.

## What `verify-no-secrets.js` checks

Three independent checks, because filename rules alone are not enough:

1. **Structural** — no credential-bearing file exists in the output.
2. **Content** — it reads the real values from the local untracked config files and searches
   every exported file for each one. This is what catches a secret pasted into source, a
   comment, or a document.
3. **Key material** — any `BEGIN … PRIVATE KEY` block, whatever the file is called.

It prints key names and paths only, never a value.

`SQL_DB`, `CLIENT_APP_URL`, `SSH_USER`, `PORT`, `NODE_ENV`, `SSL` and `REGNUM` are treated as
non-secret: they are a database name, a public URL, a username in documented default paths,
and configuration constants. They appear legitimately in SQL scripts and source. Everything
else from those files is treated as a credential.

## Known true positive, do not "fix" by weakening the check

The ЭМД and ХУР passwords are substrings of the ХУР certificate's filename. Writing that
filename into any document re-publishes the passwords, so it is not written anywhere in
`mobile/` and the verifier fails if it reappears. Refer to `config/Xyp/*` instead. See
[../SECURITY-ROTATION.md](../SECURITY-ROTATION.md).
