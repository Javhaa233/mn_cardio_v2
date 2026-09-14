# Mobile developer — your gap list, answered

Хоёр дахь хэсэг. Өмнөх баримт [HANDOVER-2026-09-14.md](HANDOVER-2026-09-14.md) хэвээрээ.

> **Чатын дуу/видео мессеж энэ жагсаалтад ороогүй** — тусдаа ажил байсан тул
> тусдаа файлд: [CHAT-MEDIA-2026-09-14.md](CHAT-MEDIA-2026-09-14.md).

This answers the list you sent on 2026-09-14 — section **А, items 1–15**. Section В (ХУР, ДАН,
ЭМХТ, эмийн нэгдсэн сан, Firebase) is untouched: those wait on contracts, and nothing in this
document depends on them.

**Everything below is verified against `MnCardio_test`.** It is NOT on the test server yet —
see the last section.

---

## The short version

| Your item | Status |
|---|---|
| 1 Doctor notification list | ✅ 4 endpoints |
| 2 Push producers | ✅ 7 added — and chat already had push, see below |
| 3 Doctor sees risk / e-visits | ✅ `/patients/:id/risk`, `?patientId=` on evisits |
| 4 Attachments on questions | ✅ multipart both directions, ownership enforced |
| 5 ICD / diagnosis / doctor search | ✅ — **read the data warning** |
| 6 App update + settings | ✅ `/api/mobile/version`, `/config`, `X-App-Build` |
| 7 Rehab assessment history | ✅ `/api/patient/rehab/assessments` |
| 8 Guardian consent | ✅ 2 endpoints |
| 9 Diagnostics | ✅ 4 endpoints, lab / echo / cathlab / ecg |
| 10 Per-user permissions | ✅ exposed on `/me`; enforcement behind a flag |
| 11 Backup | ✅ fixed + `/api/admin/backups` — **and it found a live problem** |
| 12 Time standard | ✅ `/api/time` |
| 13 Export | ✅ journal, visits, summary, visit PDF |
| 14 ЭМД | ✅ 2 endpoints |
| 15 FHIR | ✅ Encounter + Observation |

---

## 1. Doctor notifications

```
GET  /api/doctor/notifications              ?limit &offset &unread=1
GET  /api/doctor/notifications/unread-count
POST /api/doctor/notifications/:id/read
POST /api/doctor/notifications/read-all
```

Identical field shape to the patient's four — `NotesMn` is what you display, `Seen` is a
boolean, `LinkObjectName` + `LinkObjectId` are the deep link. That is enforced by both surfaces
calling one function, so they cannot drift.

Addressed by `ToUserId`, which is what every producer fills, so a doctor sees the same rows the
web bell shows. On the test data a real doctor account had **424** of them.

## 2. Push producers — seven new, and one correction

| Event | Who hears |
|---|---|
| Advice published | the patient it is about |
| Comment on advice | the patient |
| E-visit completed | patient |
| E-visit cancelled by doctor | patient (with the reason) |
| Rehab assessment recorded | patient |
| E-visit requested / withdrawn | the care-team doctors |
| Question asked | the monitoring doctors |

> **Your list says chat push is missing. It is not.** `PushToMembers` has been firing on every
> chat message — text and attachment — since before this round, skipping the sender and anyone
> who muted the room. I did **not** add a `Notification` row per chat message on purpose: chat
> already has its own unread count, and a bell row per message would bury every other
> notification.

**The messages carry no patient name.** A push lands on a lock screen in a corridor; who it is
about is one tap away behind the deep link, where the reader has already authenticated. Branch
on `Action`, fall back to `NotesMn`.

## 3. Doctor: risk and e-visits

```
GET /api/doctor/patients/:id/risk          same { bodySize, history } as /api/patient/risk
GET /api/doctor/evisits?patientId=         one patient's history
```

`?patientId=` **drops the default open-only status filter** — a history that hides completed
visits is not a history. You can now delete the `/api/RemoteVisit/GetList` call and the
client-side filtering in `fetchPatientEvisits`.

Risk reads through one shared function, so when ЗСҮТ approve the ЗСӨ methodology, `score` and
`riskClass` appear on the doctor's view and the patient's at the same time.

## 4. Attachments on questions

```
POST /api/patient/questions                     multipart: comment + files (≤5, ≤20 MB each)
POST /api/doctor/monitoring/:patientId/questions  same
GET  both list endpoints                        every row gains files: [{ id, name, ext, size, url }]
```

- **JSON still works.** `{ comment }` behaves exactly as before — I did not break your current
  call.
- **Either `comment` or `files`** is required, not both. A photo with no words is a real question.
- Over five files: the first five are stored and the rest come back in `rejected`. Nothing is
  ever dropped silently — if a file was refused you are told which and why, in Mongolian.
- `url` is `/api/Media/stream/<name>` — the same header-authenticated, range-capable route the
  exercise videos use. **Don't build that path yourself, use the `url`.**

> **Ownership is now enforced on these files.** Before this, any staff token in the country
> could read a photo a patient attached for their own cardiologist. It is now the patient, a
> doctor treating them, or an admin. Verified: an unrelated doctor gets **404**.

## 5. Search — and a data warning you need before you build the screen

```
GET /api/doctor/icd10?search=          min 2 chars, max 20 → [{ code, name_mn, name_en }]
GET /api/doctor/visits                 ?icd10= ?diagnosis= ?doctor=, and search covers diagnoses
GET /api/doctor/patients               ?icd10= — search becomes optional when it is supplied
```

ICD search matches the code, the English term **and** the Mongolian term. ~130 ms.

> ### ⚠️ `Visit.icd10` IS EMPTY. ALL 450,604 ROWS.
>
> Measured 2026-09-14: `icd10` is NULL on 73,535 rows and an **empty string on every single one
> of the rest**. So are `exam_type_icd`, `cause_icd10` and `procedure_icd9`. Nothing has ever
> written them.
>
> The code is inside **`main_diagnosis`**, as the display label: `*I21.4 Acute subendocardial
> myocardial infarction`.
>
> `?icd10=` handles this for you — it matches the label. But **do not render `icd10` as the
> diagnosis code in your UI**: it will be blank on every record. Use `main_diagnosis` /
> `main_diagnosis_mn`.
>
> `main_diagnosis_mn` is also NULL on 432,364 of 450,604 rows (96%) — only recent examinations
> have it. Fall back to `main_diagnosis`.

Two filter forms: `?icd10=I21` is **exact**; `?icd10=I21%` is the **block** (I21, I21.0, I21.9…).
On test data that is 11 visits versus 624.

## 6. App update and settings

```
GET /api/mobile/version?platform=ios|android&build=   NO AUTH
GET /api/mobile/config                                any logged-in user
```

`version` → `{ latestVersion, latestBuild, minSupportedBuild, forceUpdate, storeUrl, releaseNotes }`.
`forceUpdate` is **the answer, not the setting** — true when *your* build is below the minimum.
Don't compare build numbers yourself.

Unauthenticated on purpose: a build old enough to be blocked may be too old to log in, and an
update prompt behind a login is no use to someone who cannot log in.

**`X-App-Build` on every `/api/patient/*` and `/api/doctor/*` request.** Below
`minSupportedBuild` → **`426 UPDATE_REQUIRED`** with the store links in `data`.

> **A missing header always passes.** Every build in the field sends none, and so does the web
> frontend. Start sending it whenever you like; nothing breaks either way. `minSupportedBuild`
> is seeded to `0`, so today nothing is blocked at all — verified by temporarily raising it.

`/api/mobile/version` is never blocked by the gate, so a blocked app can always ask what to do.

Values are rows in a new `MobileSetting` table, editable by ЗСҮТ from the admin web. **`termsText`
is empty** until their legal department supply it — show "not configured", not an error.

## 7. Rehab assessment history

```
GET /api/patient/rehab/assessments  ?limit &offset &from &to
```

Same shape as the doctor's, `RiskLevelLabel` included. `/rehab/assessment` (singular) still
returns just the latest.

## 8. Guardian consent

```
GET  /api/doctor/patients/:id/consents
POST /api/doctor/patients/:id/consents
     { purposeCode, granted, guardianRegNo*, guardianName*, guardianRelation* }
```

All three guardian fields are **required**: a consent given by somebody else proves nothing
unless the record says who they were. Append-only, like the patient's own.

`GrantedBy` is `'self'` or `'guardian'` — historical rows report `'self'`.

> Four **placeholder** `ConsentDocument` rows are seeded on test so you can build the screen.
> Every one says, in Mongolian, that it is a placeholder and must not be shown to a patient.
> Same deal as the 39 exercises. **Don't ship a screenshot.**

## 9. Diagnostics

```
GET /api/doctor/patients/:id/diagnostics?type=lab|echo|cathlab|ecg&from&to
GET /api/doctor/diagnostics/:type/:id
GET /api/patient/diagnostics                  the patient's own
GET /api/patient/diagnostics/:type/:id
```

Four tables behind one list — `[{ type, id, date, title, summary, organization }]`, newest
first, merged across all of them when `type` is omitted. On test, one patient had 55.

`lab` detail groups results into printed panels with `{ name, label, value, unit, refRange, flag }`.

> **`unit`, `refRange` and `flag` are `null`, deliberately.** `LaboratoryTest` stores every
> result as a bare string with no unit column and no reference column anywhere in the schema.
> A reference range decides whether a doctor acts, so it is not being guessed. They fill in from
> `CodeMapping` once ЗСҮТ's laboratory side verify the mappings. **Render a missing range as
> absent, not as normal.**

The serology panel (`hiv`, `hbs_ag`, `hcv`, `syphilis`) is flagged `confidential: true`. When
the access matrix arrives and enforcement is switched on, an unauthorised reader gets the panel
with `results: []` and `restricted: true` rather than the investigation disappearing — so the app
should render "there is a result here you cannot open". A doctor must never be led to think a
test was not done.

A patient reading someone else's id gets **404**, never 403.

## 10. Permissions

`GET /api/doctor/me` now returns `permissions: [{ object, create, read, update, delete }]` and
`permissionMode`.

> **An empty array means "nothing configured", NOT "nothing permitted".** Render it as
> show-everything. Today every doctor gets `[]` — all 125 existing grants belong to the
> administrator role, and the doctor tiers have none. If you hid menus on empty you would ship
> an app with no menus.

Enforcement is behind `FEATURE_PERMISSIONS` (`off` → `warn` → `enforce`), default `off`. Nothing
changes for you until ЗСҮТ fill in the matrix.

## 11. Backup — and a live problem it found

`GET /api/admin/backups?limit&offset` (roles 1, 6) → rows plus a 30-day `summary`.

> ### ⚠️ The nightly backup has been failing since 2026-09-10.
>
> The last success was **2026-09-09**. Ids 2131–2134 — the nights of the 10th, 11th, 12th and
> 13th — all have `Status = '0'`. Each fails within ~30 ms of 23:00, while a successful run takes
> 16–23 seconds, so `spFullBackup` is erroring immediately — disk or path, most likely.
>
> This is not your problem and not caused by any of this work; it was invisible because the job
> discarded the error and told nobody. It now logs the reason and notifies roles 1 and 6.
> **Flagged for ЗСҮТ / the sysadmin.**

## 12. Time standard

```
GET /api/time    NO AUTH
```

`{ serverTime, serverTimeLocal, epochMs, timezone, utcOffsetMinutes, ntpSynced, ntpSource }`.

`ntpSynced` is **`null`** when chrony is absent or unreadable — that means "cannot tell", not
"not synced". Configuring chrony against the authorised NTP host is a server task waiting on
ЗСҮТ.

**Record timestamps come from the server, never from the phone.** Where a patient legitimately
picks a date (`POST /api/patient/journal`), that is the clinical event date; `CreateDate` is
stamped by the server separately.

## 13. Export and print

```
GET /api/patient/journal/export?from&to&format=xlsx|csv|txt
GET /api/doctor/visits/export?<all the /visits filters>&format=
GET /api/doctor/reports/summary/export?from&to&format=
GET /api/doctor/visits/:id/print                            → PDF
```

These return **files**, not the JSON envelope. `Content-Disposition: attachment`. Plain GET with
your bearer token.

- Every file carries the **source stamp** the tender requires: organisation, database, register,
  period, who produced it, UTC timestamp.
- CSV and TXT are written **with a UTF-8 BOM**, or Excel on a Mongolian Windows renders every
  Cyrillic name as mojibake.
- `/visits/export` over **10,000 rows** → `400 EXPORT_TOO_LARGE`, with the actual count in the
  message. It is refused rather than truncated: a spreadsheet that silently stops looks complete.
  Verified — an unfiltered admin export of 450,604 rows is correctly refused.

## 14. ЭМД

```
GET /api/doctor/emd/drugs?patientId=&icd10=&search=
GET /api/doctor/emd/services?search=
```

> **Note the parameter: `patientId`, not `regNo`.** The legacy `/api/EMDService/*` takes the
> citizen's registration number from the request body, which means any authenticated caller can
> ask the national insurance service about any citizen. These resolve it from the patient id
> after checking your access. Upstream failure is **502**, not 500 — the fault is not ours.

`?icd10=` accepts several comma-separated codes; each row is tagged with the `diagCode` it came
from. If some codes answered and others failed you get `partial: true`.

## 15. FHIR

```
GET /api/fhir/Encounter?patient=          Visit → Encounter
GET /api/fhir/Observation?patient=&code=  PatientMonitoring + LaboratoryTest → Observation
```

Behind `FEATURE_FHIR_EXPORT`. While off, they answer **503 with a FHIR `OperationOutcome`**, not
a 404 — a FHIR client can read that.

> **`Observation` returns `code.text` and NO `coding` today**, and `?code=8480-6` returns zero
> results. That is deliberate, not a bug. 29 LOINC mappings are seeded in a new `CodeMapping`
> table, all marked `Verified = 0`. A wrong LOINC code silently asserts that a number means
> something it does not, to every system downstream, and no receiver can detect it. Codes are
> emitted only after ЗСҮТ's informatics side verify them. `valueQuantity` with a UCUM unit
> already works.

---

## What is NOT on the test server

**None of this is deployed yet.** `https://mncardio.itsystem.mn` is still on the 2026-09-14
build. The test *database* has the new tables (`MobileSetting`, `CodeMapping`, the guardian
columns on `PatientConsent`, the `Permissions` rows) because those were applied to run the
verification — so the schema is ahead of the application there.

Production has none of it, application or schema.

## Still blocked, so don't wait

| Waiting on | Blocks |
|---|---|
| Laboratory sign-off of the 29 LOINC mappings | `unit` / `refRange` on lab results, LOINC codes in FHIR |
| ЗСҮТ legal: terms text, consent document text | real wording — **not** the screens |
| Confidentiality access matrix | enforcing the serology mask — **not** the `confidential` flag |
| RoleToPermission grants for the doctor roles | enforcing permissions — **not** `/me` |
| Authorised NTP host | `ntpSynced` reporting true |
| Why `spFullBackup` fails | the nightly backup |

Every one of them lands as data, not as a client change.

---

Anything here that doesn't match what the server does — tell me and I'll fix whichever of the
two is wrong.
