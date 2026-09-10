# Acceptance test harness

The contract's UAT / integration deliverable (web phase 5, mobile phase 8), kept re-runnable
so it doubles as a smoke test after every deploy.

This is **not** a unit-test suite and does not conflict with `CLAUDE.md §9` — no test framework
is introduced into feature work. It is one command that exercises the deployed system.

```bash
node tests/acceptance/run.js                                  # against the test server
ACCEPTANCE_BASE=http://localhost:5001 node tests/acceptance/run.js
```

Credentials come from `test-environment.env` in the project root (`TEST_DOCTOR_*`,
`TEST_PATIENT_*`, `TEST_ADMIN_*`). **Never hardcode a password in these files** — they are
committed, and `mobile/tools/verify-no-secrets.js` will refuse to publish an export containing
one. It has already caught that mistake once.

Output goes to `results/<runid>/`: `report.md`, `raw.json`, and `screens/*.png`.

## The three layers

| File | What it does |
|---|---|
| `catalogue.js` | Discovers every endpoint by parsing the backend source, then annotates role, body and safety by hand |
| `sweep.js` | Layer 1 — calls every catalogued endpoint once and classifies the response |
| `journeys.js` | Layer 2 — the write paths: create user, change password, new examination, tender form, file upload/download, generic CRUD, and the auth boundaries |
| `browser.js` | Layer 3 — drives the real UI in headless Chrome and asserts no JS errors, no failing XHR, and that Mongolian renders |
| `run.js` | Runs all three and writes the report |

Paths are **discovered, not typed**, so the catalogue cannot drift from the routing table. Note
the parser has to handle three declaration styles — `router.post('/x')`, the same with double
quotes, and the chained `router.route('/x').get(...)`. Missing the third would silently skip
the password-reset routes.

## Two things that make a naive harness lie

**HTTP 200 is not success.** The legacy layer answers every failure with status 200 and a
`{Success:false}` body, and sends it as `Content-Type: text/html`. A harness that keys on the
status code, or only parses bodies labelled JSON, reports a broken system as green. `classify()`
in `lib.js` reads the body regardless of content type.

**"An error occurred" is not a defect on its own.** Most endpoints are called with an empty
body because no realistic payload is annotated for them, and the legacy layer returns that same
opaque message for a missing field and for a database outage alike. Those are reported as
`ALIVE` — mounted, routed and executing. Only endpoints given a realistic body (`probed: true`
in the catalogue) can count as `FAIL`. Without that split, 82 "failures" buried the five that
mattered.

## Safety

`catalogue.js` carries a `SKIP` map, each entry with its reason. It excludes anything that
sends mail, calls an external service, or destroys data. Two rules learned the hard way:

- **Print and export endpoints run one at a time.** Each spawns headless Chrome, and the test
  host has ~5.7 GB free while serving six live customer sites.
- **Several innocuous-looking endpoints call Mongolian government services.**
  `CVDMonitoring/CheckPatient`, `FindPatientDataForUpdate` and `AtrialRhythm/checkConfirm` reach
  `st.auth.itc.gov.mn` and `st.health.gov.mn` with no timeout. When those are down the request
  hangs for 70s+ or 502s, and each failure dumps a whole Axios error object into the log — which
  is how `api-error.log` reached 1.5 GB. They are skipped, and their behaviour recorded instead.

Records created are tagged `ZZTEST-<runid>` and left in place as evidence. To remove them:

```sql
DELETE FROM Visit           WHERE Notes LIKE 'ZZTEST-%';
DELETE FROM TenderFormData  WHERE PatRegNo LIKE 'ZZ%';
DELETE FROM DoctorsProfile  WHERE lastname LIKE 'ZZTEST-%';
DELETE FROM Users           WHERE UserName LIKE 'zztest_%';
```

## Verifying the harness itself

A green run means nothing if the harness cannot fail. Confirm periodically:

```bash
ACCEPTANCE_BASE=https://example.invalid node tests/acceptance/run.js   # must fail loudly
```

and that calling a legacy endpoint with no token is classified `AUTH`, not `OK`.
