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

### 1. SQL scripts — **structural DDL now applied to PRODUCTION (2026-09-14)**

All **13 structural scripts** have been applied to the live database `MnCardioNew` on
`mncardiosrv1`, after a verified `COPY_ONLY` backup (2,480 MB → 391 MB, taken 16:01). Every
object verified present afterwards; row counts unchanged (450,747 visits, 357,576 patients,
3,295 doctors) and the system stayed live throughout.

**Deliberately NOT applied to production, and they should not be:**

| Script | Why not |
|---|---|
| `seed_dico_remotevisit_status.sql` | drafted Mongolian, unapproved |
| `seed_dico_rehab.sql` | drafted Mongolian, unapproved |
| `seed_patient_reminder_dico.sql` | drafted Mongolian, unapproved |
| `seed_dico_consent_purpose.sql` | drafted, and these are **legal categories** |
| `seed_rehab_exercise_catalogue.sql` | 39 **placeholder** rows reading "нэр батлагдаагүй" |
| ~~`backfill_remotevisit_historical_status.sql`~~ | **applied 2026-09-14 with the customer's approval** — see below |

The five seed scripts carry a `MnCardio_test`-only guard and would refuse anyway. Approval of
the wording is what releases them, and approval is then an `UPDATE`, never a redeploy.

> **Resolved.** Production had 2 `RemoteVisit` rows, both from **2024-08-15**, which
> `Status NOT NULL DEFAULT 'requested'` left reading as pending — they would have sat at the
> top of every triage queue indefinitely. With approval, the backfill closed them as
> `cancelled`, **not** `completed`: nobody knows whether those examinations took place, and
> claiming they did would be inventing clinical history. The script reported exactly 2 rows
> before changing anything, and the table now reads 2 cancelled / 0 requested.

> **The production APPLICATION is still on the old code.** Only the schema was changed. Every
> script is additive with defaults, so the running application is unaffected — but none of the
> new endpoints exist on `smr.telemedicine.mn` until that code is deployed, which is a separate
> decision.

#### Original entry, for history — both already run on `MnCardio_test`

Verified by direct query on 2026-09-14 against `MnCardio_test` (server `mncardiosrv1`).
This entry previously said neither had been run anywhere, which was wrong.

- **`backend/scripts/add_rehabilitation_tables.sql`** — the four tables **exist on test**.
  `RehabExercise` holds **0 rows**, so `GET /api/patient/rehab/exercises` returns an empty
  list rather than 500. What is missing is content, not schema: the 39 exercise names,
  categories and durations are a clinical deliverable.
- **`backend/scripts/add_remotevisit_booking_columns.sql`** — `Status`, `RequestedDate`,
  `ScheduledDate` and `DoctorId` **exist on test**. Still true that this is not sufficient
  alone: the model declares only its original four columns and no controller reads the new
  ones, so the code work remains. `MeetingUrl` is a later addition and is **not** present.
- **Production is a separate question.** Neither has been confirmed against production, and
  running DDL there needs the customer's approval.

### 2. Apple Developer and Google Play accounts

Tracker rows 71–73. Both must be registered **to ЗСҮТ as the publishing organisation**, not
to ITsystem, or the app cannot be transferred at handover without an account migration.
Apple Developer enrolment for an organisation requires a D-U-N-S number and takes weeks —
starting this late is the single most common cause of a missed store deadline. Rows 72–73
are scheduled 2026-09-24 onwards; enrolment should start now.

### 3. Push notification credentials

Firebase project (FCM) for Android and an APNs key for iOS, owned by ЗСҮТ. Blocks tracker
row 48 and, indirectly, every reminder feature — without push, a backgrounded app receives
nothing.

**Updated 2026-09-14: this is now a CREDENTIAL REQUEST ONLY.** The implementation is
complete — FCM v1 and APNs, registration on both surfaces, dead-token deactivation — and is
fully testable today on a log driver that records what it would have sent. Supplying the keys
is the entire remaining step; no development waits on it.

### 4. Source of the professional practice licence code

Tender §2 requires a doctor's login to be tied to their licence code, with no code meaning no
login (tracker row 13, acceptance criterion "Зөвшөөрлийн кодгүй эмч нэвтрэхгүй"). Three
things are needed and none exists:

- where the codes come from — a ЭМХТ registry lookup, or a value entered and verified by an
  administrator
- whether an existing doctor without a code loses access on the day this is enforced, and
  what the migration is for them
- confirmation that the code is per-person and stable

**Updated 2026-09-14.** The columns, the gate and the admin endpoints now exist, so this is
purely a policy question. It defaults to `off`, and here is why that matters: the verification
query reports **3,298 active doctors across 660 organizations, every one without a code**.
Enforcing today locks the entire national user base out of a clinical system.

`warn` mode is available and is the recommended next step — it lets everybody in, records who
lacked a code, and answers the second bullet above from real logins rather than a table scan.

### 5a. ICD coding has never been captured — new, and it changes item 5

Measured on `MnCardio_test` 2026-09-14, across **450,604 `Visit` rows**:

| Column | Rows with a value |
|---|---|
| `icd10` | **0** |
| `exam_type_icd` | **0** |
| `cause_icd10` | **0** |
| `procedure_icd9` | **0** |
| `main_diagnosis` (free text) | 18,326 (4%) |

The columns exist and have always existed. **Not one of them has ever been populated.**

So "дагаж мөрдөх ICD" is not a standards-adoption task and cannot be delivered as one: there
is no coded data to expose, map or export. Whatever is agreed under item 5 below has to start
with somebody entering ICD codes at the point of care — a clinical workflow change, training,
and probably a UI change, not an integration.

A read-only FHIR R4 projection now exists (`/api/fhir`, behind `FEATURE_FHIR_EXPORT`, default
off). It returns `Condition` resources carrying `code.text` and **no** `coding`, which is
FHIR's own way of saying "a diagnosis was recorded and it is not coded" — the honest current
state of the data.

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

**Updated 2026-09-14: all of these are now DRAFTED and seeded to `MnCardio_test` only**, each
script carrying a `MnCardio_test`-only guard so unapproved wording cannot reach production.
What is needed is approval of the Mongolian, not the values — and approval is an `UPDATE` to a
label, never a code change or an app release, because every list is served through
`GET /api/patient/options/:dico`.

- `remotevisit_status` — requested / scheduled / completed / cancelled
- `rehab_category`, `rehab_risk`, `rehab_phase`
- `patient_reminder_type`, `patient_reminder_freq`
- `consent_purpose` — **read this one most carefully.** A consent purpose is a legal category,
  not just wording: getting the list wrong means asking people to agree to the wrong things.
  Note there is deliberately no purpose covering treatment itself.

Still genuinely missing: `confidentiality_level`, which cannot be drafted at all until the
access-rights matrix (item 8 above) names the levels.

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
