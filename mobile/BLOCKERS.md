# Blockers — what only ЗСҮТ or an external party can unblock

Nothing here can be coded around. Each item names the tracker row it stops and whether it
has already been formally raised.

Many of these were sent to ЗСҮТ on **2026-09-09** in
[`../ZSUT-blocker-letter-2026-09-09.md`](../ZSUT-blocker-letter-2026-09-09.md), which
requested a reply **by 2026-09-15**. Those are marked **sent** — do not re-raise them
separately; chase the letter.

---

## Already sent — awaiting reply

| # in letter | Item | Tracker row | Blocks |
|---|---|---|---|
| 5 | ЗСӨ risk assessment methodology and its risk classes | 38, 39 | Module 2.5 cannot compute anything. `/api/patient/risk` returns raw inputs by design until this lands. |
| 6 | ХУР access rights and keys | 17 | Pulling patient registration data from ХУР — tender §1. |
| 7 | ДАН service agreement | 114 | Digital signature, and the planned move of patient login to ДАН (no password). |
| 8 | Confidentiality classification and the access-rights matrix | 21, 22 | Hiding classified data from unauthorised users. Without the matrix there is no specification to implement against. |
| 9 | Assigning rehabilitation physicians for filming | 54 | The 39 exercise videos. Filming has not started. |
| 10 | Where the videos will be hosted | 53, 55, 56 | Three options were put to the customer (internal server, cloud, bundled in-app). Each implies a different client design, so this must be answered before the rehab UI is built, not after. |
| 14 | Test and production server access | — | No mobile environment exists. Blocks phase 8 testing and phase 9 rollout. |
| 15 | What "notify on every record access" actually means | 24 | Three readings were offered (every access / daily digest / non-treating staff only). The volume differs by orders of magnitude. |
| 16 | Chat: synchronous or asynchronous | 47 | Sets the expected reply time shown in the UI and whether presence is needed. |
| 17 | How patients are granted login credentials | — | Today a one-time password is printed on the discharge sheet. Whether that continues determines the app's onboarding screen. |

---

## Not yet raised — new, and specific to the mobile tender

### 1. Execute the two ready SQL scripts

Both are written, reviewed and idempotent. Neither has been run, and the repo owns no
migrations, so this needs whoever holds SQL access.

- **`backend/scripts/add_rehabilitation_tables.sql`** — creates 4 tables. All four Sequelize
  models and all six `/api/patient/rehab/*` endpoints are already written and currently
  return 500 purely because the tables are absent. **This is the highest-value single action
  available:** one script turns module 2.7 on with no further code.
- **`backend/scripts/add_remotevisit_booking_columns.sql`** — adds booking columns. Note this
  one is **not sufficient alone**: the model still declares only its original four columns
  and no controller reads the new ones, so code work follows. It also needs
  `remotevisit_status` option values (below).

### 2. Apple Developer and Google Play accounts

Tracker rows 71–73. Both must be registered **to ЗСҮТ as the publishing organisation**, not
to ITsystem, or the app cannot be transferred at handover without an account migration.
Apple Developer enrolment for an organisation requires a D-U-N-S number and takes weeks —
starting this late is the single most common cause of a missed store deadline. Rows 72–73
are scheduled 2026-09-24 onwards; enrolment should start now.

### 3. Push notification credentials

Firebase project (FCM) for Android and an APNs key for iOS, again owned by ЗСҮТ. Blocks
tracker row 48 and, indirectly, every reminder feature — without push, a backgrounded app
receives nothing. There is no push implementation in the backend at all, so this is both a
credential request and development work.

### 4. Source of the professional practice licence code

Tender §2 requires a doctor's login to be tied to their licence code, with no code meaning no
login (tracker row 13, acceptance criterion "Зөвшөөрлийн кодгүй эмч нэвтрэхгүй"). Three
things are needed and none exists:

- where the codes come from — a ЭМХТ registry lookup, or a value entered and verified by an
  administrator
- whether an existing doctor without a code loses access on the day this is enforced, and
  what the migration is for them
- confirmation that the code is per-person and stable

`DoctorsProfile` has no licence column today, so this also needs DDL.

### 5. Scope decision on the coding standards

ICD, FHIR/HL7, SNOMED CT and LOINC are named in tender §1.4 and again in the phase-3
schedule (tracker rows 19, 20). None appears anywhere in the backend, and adopting FHIR as
an exchange format for a 200-table EMR is a project in its own right, not a phase-3 task
inside a three-month mobile build.

A written decision is needed on what "дагаж мөрдөх" means for this deliverable — most
plausibly ICD coding on diagnoses plus a FHIR-shaped export for specific resources, rather
than re-platforming the data model. Whatever is agreed should be recorded against rows 19
and 20 with an acceptance criterion that can actually be tested.

### 6. Option list values for new mobile features

`dico` seed values, as DB rows in `OptionTypes` plus a `DicoType` row (`CLAUDE.md §4`):

- `remotevisit_status` — requested / scheduled / completed / cancelled, wording to be approved
- rehabilitation exercise categories
- notification types the patient may configure (medication, exercise, follow-up)

### 7. Credential rotation

Not a scope item, but customer-owned and urgent. The backend git history contains live
credentials and three private keys. See [SECURITY-ROTATION.md](SECURITY-ROTATION.md) — the
TLS and ХУР keys can only be reissued by ЗСҮТ and their certificate authorities.

---

## What this means for the schedule

The mobile tender runs to **2026-10-15**. Items 2 and 3 above have external lead times
measured in weeks and are on nobody's critical path today. Item 1 costs one person ten
minutes and unblocks a whole module.

Tracker rows currently `Саатсан` on customer response: 4, 11, 17, 18, 22, 38, 53, 54, 55, 56.
