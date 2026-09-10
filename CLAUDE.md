# MnCardio v2

Mongolian national cardiology EMR and telemedicine system. In clinical use since 2009, rewritten in
2019, approved by the Ministry of Health IT Council on 2022-04-15. Runs at `smr.telemedicine.mn`, used
by cardiology departments across all levels of the health system.

- **Захиалагч (customer):** Зүрх судасны үндэсний төв — ЗСҮТ (National Cardiovascular Center)
- **Гүйцэтгэгч (vendor):** ITsystem
- **Warranty:** one year free support after handover, 2026-09-15 – 2027-09-14, with monthly reports

Two signed tenders drive the current work:

| Tender | Scope | Window |
|---|---|---|
| `MN cardio upgrade.docx` | 14 cardiac-surgery / arrhythmia / angiography registry forms, better citizen-facing side, integrations | 2026.05.14 – 2026.09.14 |
| `mobile mncardio.docx` | New Android + iOS app: doctor and patient modules, telemedicine, rehabilitation | 2026.07.03 – 2026.10.15 |

Stack is fixed by contract: **React, Node + Express, MSSQL 2017 Express+, Ubuntu 22.04 LTS+**.
Do not propose replacing any of these.

**`МнКардио_тендерийн_ажлын_жагсаалт.xlsx` in this folder is the live task tracker** — 153 web rows
and 82 mobile rows, each with phase, module, owning party, dates, status, % complete and an acceptance
criterion. It is the authoritative scope document. Read it before planning work; update it, don't
duplicate it.

---

## 1. Where the code lives

Two folders, both git repos on GitLab. Nothing else in this directory is code.

| Path | Repo | Branch |
|---|---|---|
| `backend\` | `gitlab.com/Enkhtur/mncardio-backend` | `handover/password-reset` |
| `frontend\` | `gitlab.com/Enkhtur/mncardio-frontend` | `chore/remove-stale-ai-config` |

Root also holds `CLAUDE.md`, the two tender documents, the task-tracker xlsx and `ssh.env`.

Both repos sit on a working branch, not `main`. Neither branch has been pushed. Upstream `main` is
still at `commit at 2026 07 22 04` (2026-07-22); commit messages before these branches carry no
meaning, so `git log` will not tell you why anything changed.

### The previous developer's handover is already merged in

The old developer delivered one batch of work outside git, in a folder called `new update in old`.
It is now committed on `backend` at `handover/password-reset` (commit `c9cc41c`) and that folder has
been deleted — **it was the only handover, and there is no newer source anywhere.** Treat `backend\`
as the single source of truth.

What it contained — self-service password reset, satisfying mobile tender §1.2:

- `model/BaseModel/Users.js` — case-insensitive email duplicate checks on create and update
- `controllers/auth/UserRequestController.js` — `EMAIL_REGEX`, `EmailWhere()`, `FindDuplicateEmail()`
- `helper/MailHelper.js` — `BuildTransport()` reading `MAIL_SMTP_HOST` / `MAIL_SMTP_PORT` /
  `MAIL_SMTP_SECURE` instead of hardcoded Gmail; adds `LastError`
- `controllers/auth/UserController.js`, `reports/translate.js`,
  `scripts/{check_mail_credentials.js,send_test_mail.js,find_duplicate_user_emails.sql}`

`config/Config.env` also came across but is gitignored, so it is on disk only — back it up separately.

There is no `node_modules` anywhere. Nothing is installed yet.

### Credentials

`ssh.env` in this folder holds live server and database credentials: `SQL_HOST`, `SQL_USER`,
`SQL_PASSWORD`, `SSH_HOST`, `SSH_PORT`, `SSH_USER`, `SSH_PASSWORD`. It is how you reach the
Ubuntu/MSSQL server. It sits outside every repo and outside every `.gitignore`.

**Never commit it, never copy it into a repo, never print its values.** Refer to key names only.

---

## 2. Running it

**Backend** (from the backend root):

```
cp config/Config-Template.env config/Config.env   # then fill in real values
npm install                                       # postinstall downloads Chrome for Puppeteer
npm run dev                                       # nodemon; http://localhost:5001
```

- Port is `process.env.PORT || 5001` (`server.js:382`). Health check: `GET /health`.
- **`config/Config.env` is the file that actually loads** (`server.js:6`). The root `.env`,
  `.env.development` and `.env.production` are near-dead — only `config/DbConnection.js` sees them, via
  a bare `dotenv.config()`. Do not add config to the root `.env` files and expect it to work.
- `Config-Template.env` was incomplete; `REPORT_DIR`, `XYP_KEY`, `XYP_TOKEN`, `REGNUM` and `PORT`
  have been added to it. The code also reads `MAIL_SMTP_HOST` / `MAIL_SMTP_PORT` /
  `MAIL_SMTP_SECURE`. Two keys that look required are read by **no code at all** — `SIGNATURE_HOST`
  (digital signature is not implemented) and `SQL_PORT` (`DbConnection.js` passes only `SQL_HOST`).
  The template's `XYP_ACCESS_TOKEN` is likewise dead — the ХУР controller reads `XYP_KEY`/`XYP_TOKEN`.
- The server **exits** if it cannot create `ALLFILE_DIR` or `REPORT_DIR`. Both are picked per platform;
  when `REPORT_DIR` is unset it silently defaults to `C:/MnCardioReports/` on Windows and
  `/home/admin630/Desktop/outReports/` on Linux (`server.js:63-86`).

**Frontend** (from the frontend root):

```
npm install
npm run dev        # http://localhost:3000, proxies ~60 prefixes to 127.0.0.1:5001
npm run build      # production; served by PM2 via ecosystem.config.js
npm run lint:fix   # before committing — see the lint caveat in §10
```

- **There is no `.env` and no environment variable on the frontend.** `src/config/Server.js` hardcodes
  `baseURL = "/api"`. The only ways to point it at a backend are the Vite dev proxy and the production
  reverse proxy. `vite.config.js` declares `envPrefix` but nothing consumes it.
- `dev` and `start` invoke Vite through `node --max-http-header-size=524288` deliberately — large auth
  headers. Do not "simplify" that back to plain `vite`.

**Database.** Microsoft SQL Server, one database, Sequelize 6 + `tedious`. **There are no migrations
and no seeders** — the database owns the schema, and models map onto existing tables and views. Schema
changes are hand-written SQL following `scripts/*.sql` (e.g. `add_organization_merge_columns.sql`).
Any DDL you need is a request to whoever holds SQL access, not something the repo can run.

---

## 3. Architecture

### Backend request path

Two layers coexist. Know which one you are in.

**Legacy layer (primary — this is where clinical features live).** Each file in `controllers/` *is* an
Express Router, mounted in `server.js`:

```
server.js  ->  /api/<Path>  ->  controllers/<domain>/<X>Controller.js
           ->  helper/BaseControllerHelper.js
           ->  helper/ConfigHelper.getModelConfig(ObjectName)  ->  ModelConfigs/<X>Config.js
           ->  config/DB.js Models.<X>  ->  Sequelize  ->  MSSQL
```

Routes are declared in two tables in `server.js`: `routeGroups.public` (6 routes) and
`routeGroups.protected` (47 routes, wrapped in `Auth.verifyToken`). Everything is **POST**.

`controllers/` is grouped into 13 domain folders; `docs/CONTROLLER_STRUCTURE.md` is the index and must
be updated when you add one.

**New layer (`api/`).** `app.use('/api', require('./api'))` mounts a generic REST resource API at
`/api/base/:target` and `/api/report/*`, backed by `api/base/config/*.js` and `services/base/`. It uses
real HTTP verbs, transactions, and a lowercase envelope. It is **not** wrapped in `Auth.verifyToken`,
and only a handful of targets exist. Prefer the legacy layer for new clinical work — that is where all
the domain code and all the patterns are.

### The config-driven form engine — read this before touching any form

This is the most important thing about the codebase, and the easiest thing to get backwards.

**Field metadata is declarative and lives on the server. Layout is hand-written JSX on the client.**

`ModelConfigs/<X>Config.js` is a constructor function declaring `this.Fields` — a nested array of field
descriptors, ~4,600 of them across 166 files. A descriptor looks like:

```js
{
  Name: 'visit_date',            // column, or a dotted association path: 'Patient.p_lastname'
  Label: 'Date of visit',
  Type: 'Date',                  // see the type list below
  Required: true,
  Position: 6,                   // display order
  md: 4,                         // 12-column grid width
  EditField: false,              // false = read-only in the form
  GridField: false,              // false = hidden from the list grid
  OptionType: 'rec_status',      // a `dico` code - options come from the OptionTypes DB table
  Config: { ... },               // lookup config for GridLookUpSingleLoad and friends
}
```

`helper/BaseControllerHelper.GetConfigData(ObjectName)` walks those fields and hydrates `Field.Data`:
for `OptionType` it runs `SELECT label, value FROM OptionTypes WHERE dico=N'<code>'`; for
`SingleSelect` / `MultipleSelect` / `CheckBox` with a `Config.Model` it calls that model's `findAll()`.
`controllers/system/BaseController.js` then serves the result at `POST /api/BaseObject/getData`.

The same generic `BaseController` gives you, for any registered `ObjectName`, with **zero new code**:

```
POST /api/BaseObject/getData      -> form field config (options already hydrated)
POST /api/BaseObject/             -> list (paged, searchable, sortable)
POST /api/BaseObject/getDetail    -> one record
POST /api/BaseObject/create | update | destroy
POST /api/BaseObject/uploadFile | downloadFile | deleteFile
POST /api/BaseObject/ExportExcel  -> Excel export
```

That last one already satisfies the tender's "list in a menu, searchable, exportable" requirement for
every form you declare. It is also most of the WBS line item "динамик маягтын модуль" (dynamic form
module) — that deliverable is largely satisfied by extending this engine, not by building a new one.

On the client, `customComponents/Forms/BaseCustomForm.jsx` fetches that config on mount and exposes
`this.GetConfigField(name)`, which returns the descriptor with the record's current value attached. The
concrete form writes layout by hand in `CustomRender()`:

```jsx
<GroupPanel title={t("2. Оролцогчийн мэдээлэл")} level={2}>
  <BaseRadio     ChangeValue={this.ChangeValue} Config={this.GetConfigField("gender")} />
  <BaseRadio     ChangeValue={this.ChangeValue} Config={this.GetConfigField("is_tsevershilt")} Unknown={true} />
  <BaseCheckBox  ChangeValue={this.ChangeValue} Config={this.GetConfigField("main_shaltgaan")} />
  <BaseTextField ChangeValue={this.ChangeValue} Config={this.GetConfigField("main_shaltgaan_other")} FullWidth={true} />
</GroupPanel>
```

So: **never hardcode a label, an option list, or a control type in JSX.** Change the ModelConfig or the
`OptionTypes` rows and the control follows.

Field `Type` values in use, most common first: `Text`, `RadioBox`, `Number`, `Date`, `CheckBox`, `yorn`,
`SingleSelect`, `GridLookUpSingleLoad`, `TextArea`, `SingleSelectLoad`, `ListView`, `File`,
`SingleImage`, `Password`, `MultipleSelect`, `DateTime`. Many other values (`sexe`, `severity`,
`normality`, `havhlagaMZDaraahGolSudasNarisal`, …) are not really types — they are `dico` codes resolved
against `OptionTypes`.

### Frontend structure

React 18.3 + Vite 7 + SWC, MUI 7 + Emotion, Redux Toolkit, react-router 6. No TypeScript (627 `.jsx`,
186 `.js`; `typescript` is in devDeps but unused). No form library — forms are hand-rolled on
`BaseCustomForm`.

```
src/view/                 page-level screens (61 files)
src/routes/*.js           data-driven route table, filtered per layout by `roles`
src/layouts/              Admin / Auth / Patient / PatientAuth / Test shells
src/customComponents/     the bulk of the app (406 files) - domain forms, tables, detail views
src/baseComponents/       generic CRUD scaffolding (174 importers)
src/newComponents/        newest control library (56 importers)
src/components/           inherited Creative Tim template components
src/helper/               singleton service classes - the real API layer
src/config/Server.js      the one axios instance
src/theme/colors.js, src/theme.js    design tokens
```

Routes live in `src/routes/index.js`, which concatenates `authRoutes`, `patientPortalRoutes`,
`adminRoutes`, `nationalRegistryRoutes`, `cardiovascularRoutes`, `settingsRoutes`. Each entry is
`{ path, name, icon, component, layout, roles: [...], redirect?, collapse?, views? }`, with `component`
a `React.lazy(() => import("view/X.jsx"))`. The layout filters by `layout` **and**
`Helper.AuthHelper.CheckRole(prop.roles)`, so a route the role fails is never registered — the same
table drives the sidebar.

**Registry forms are hand-written and large.** The clinical registry tree is the model to copy:

```
customComponents/Forms/NationalRegistry/<Domain>/<X>Form.jsx     <- the form (700-1,800 lines)
customComponents/NationalRegistry/<Domain>/<X>Table.jsx          <- the list
customComponents/DetailViews/NationalRegistry/<Domain>/<X>.jsx   <- read-only view
view/<X>.jsx  +  a routes/<group>.js entry
```

Canonical example to imitate: `customComponents/Forms/NationalRegistry/Rhythm/AtrialRhythmNewForm.jsx`.

### Auth

JWT bearer, 10-hour expiry, issued by `helper/Auth.js`. `verifyToken` re-hydrates the full user from the
DB onto **`req.LogedUser`** — that spelling is load-bearing and used everywhere.

The frontend stores `MnCardioToken`, `LogedUser` and `IsLogin` in `localStorage`. There is no
`<ProtectedRoute>` component: each layout checks `Helper.AuthHelper.GetLogedUserLocal()` at the top of
render and assigns `document.location` if it fails.

Role IDs — no enum exists anywhere, so this is the only place they are written down:
**1** admin · **2**, **3** doctor tiers · **4** patient · **5** profile-only · **6** settings/admin-config.
RBAC tables exist (`Roles`, `Permissions`, `RoleToPermission`, `UserToRole`) but enforcement in practice
is numeric `RoleId` comparison plus `OrganizationId` scoping.

---

## 4. Recipes

### Two storage patterns — pick the right one

**Existing forms use wide tables**, one column per field (`TurulhiinGajig` 328 columns,
`AtrialRhythmNew` 160). Leave them alone; they work.

**The tender's phase-4 forms use JSON**, in three tables:

| Table | What it holds |
|---|---|
| `TenderForm` | form registry, keyed by tender code (`1.1`, `1.6` …) |
| `TenderFormField` | the field dictionary — labels, types, `dico` option codes, sections, conditional parents |
| `TenderFormData` | one row per form instance; answers as JSON in `Data`, with `CHECK (ISJSON(Data) = 1)` |

Adding or changing a field is a **row in `TenderFormField`** — not a code change and not DDL.
`controllers/patient-care/TenderFormController.js` serves every form; nothing in it is
form-specific. The frontend is a single component,
`customComponents/Forms/NationalRegistry/Surgery/TenderForm.jsx`, chosen by a `FormNo` prop.

After changing the dictionary, regenerate:

```
node scripts/generate_form_views.js          # rebuilds views + models + ModelConfigs
```

That emits one SQL view per form projecting the JSON into columns, so `/BaseObject` gives list,
search, sort and Excel export for free. Measured at 50,002 rows: JSON-field filter 254 ms, two JSON
fields 218 ms, paged list 21 ms — inside the tender's 3-second criterion without computed columns.
It is a scan, so revisit if one form passes a few hundred thousand instances.

**Do not put Cyrillic through Git Bash.** `curl`/`sed`/heredocs in the Bash tool mangle it —
`ОЭ50051707` becomes `??50051707`, and you will chase a phantom bug. Use PowerShell, or Node
reading the value from a file. Seed SQL with Mongolian text needs a UTF-8 **BOM** for `sqlcmd -i`.

**`nodemon` does not watch `model/` or `ModelConfigs/`.** After changing either, `touch server.js`
or the change will not load — this will waste your time otherwise.

Seeded so far — **eleven forms, 1,687 fields**: 1.1 (66), **1.2 (75)**, 1.3 (62), 1.5 (178),
1.6 (196), 1.7 (217), 1.8 (234), 1.9 (219), **2.1 (30)**, **2.2 (244)**, 3.1 (166).
1.2's body was never empty — it is two images in the tender (see §7), transcribed and seeded with
its own `f12_yn` / `f12_yn3` option lists. Labels are verbatim from the tender; field codes and
types are derived and still need clinical sign-off.

Three things follow from "derived", and they are load-bearing:

- **Labels on 1.5–1.9 and 3.1 are the tender's English**, so those forms render in English until
  Mongolian labels are supplied. That is translation work needing clinical terminology, not code.
- **Types were inferred and some are wrong.** `scripts/fix_form_field_types_and_required.sql`
  corrects the ones found so far (2.2's weight and height came out as a yes/no radio; BMI, BSA,
  body weight and admission date came out as `Text` on some forms and `Number`/`Date` on others).
  It is data, not DDL — but it still needs whoever holds SQL access.
- **Only 5 of the 1,687 rows carried `IsRequired`**, so there was almost nothing for validation to
  enforce. The same script flags the case identifier and the principal date per form. Widening that
  is a clinical decision (tracker row 23), not ours.

Forms 2.1 and 2.2 also introduce `FieldType = 'Table'` — a repeating grid whose columns live in
`TenderFormField.TableConfig`, rendered by `BaseTableGrid` and printed as a real table. `Table`
fields are excluded from the generated views, since they are not scalar.

`AllowDuplicate` on the `TenderForm` registry (3.1 only) drives the repeat-procedure prompt.

### Add a clinical form

Backend:

1. `model/<Domain>/<X>.js` — `class X extends Sequelize.Model` plus
   `X.init({...}, { sequelize, tableName, modelName, timestamps: false })`. Add `X.SearchField = [...]`,
   and `X.SetAssocations = (Models) => {...}` / `X.SetFunctions = (Models) => {...}` if needed.
   **No registration required** — `config/DB.js` auto-discovers everything under `model/`.
2. `ModelConfigs/<X>Config.js` — copy `ModelConfigs/VisitConfig.js` for the shape. Set `ObjectName`,
   `Model`, `PK`, `NewObject`, `TitleObject` and `Fields`.
3. Register it: `require` plus `new XConfig()` in the `this.ModelConfigs` array in
   `ModelConfigs/mainConfig.js`.
4. Option lists: insert `OptionTypes` rows under a new `dico` code, plus a `DicoType` row describing it.
   **This is DB work, not code** — it is the usual blocker, so raise it early.
5. Only if you need behaviour beyond generic CRUD: `controllers/<domain>/<X>Controller.js` (an Express
   Router — copy `controllers/communication/ChatController.js` for the shape), then add it to the
   `controllers` map **and** `routeGroups.protected` in `server.js`, and add a row to
   `docs/CONTROLLER_STRUCTURE.md`.

Frontend:

6. `customComponents/Forms/NationalRegistry/<Domain>/<X>Form.jsx` extending `BaseCustomForm`; implement
   `GetData`, `Save`, `Confirm`, `CustomRender`.
7. Table, detail view, a `view/` page, and a `routes/*.js` entry with the right `roles`.
8. Labels via `t("...")`; add keys to **both** `public/locales/en/translation.json` and
   `public/locales/mn/translation.json`.

### Definition of done for a tender form

This is the customer's acceptance sequence, straight from the WBS. A form is not finished until all six
are true:

1. Fields, coding and fill rules **approved by the clinical team** — name, type, option list, required
   flag, for every field.
2. DB tables, indexes and foreign keys created, with test data loaded.
3. Form UI with full CRUD and required-field validation.
4. List view with multi-field search, filtering and `.xlsx` export. **Search must return in under
   3 seconds.**
5. **A4 / PDF print output structurally identical to the approved paper form.**
6. Customer UAT with real data, findings logged and fixed.

Exports must carry source/provenance marking — which organisation and database the data came from, with
a timestamp.

### Form component contract

- `this.ModifyObject` accumulates **only changed fields**. `ChangeValue(Field, Value)` writes to it.
- `Save` POSTs `/<Route>/CustomSave` with `{ PatientRegNo, Id, Data: JSON.stringify(this.ModifyObject) }`.
- `Confirm` POSTs `/<Route>/Confirm` with `{ Id }` to lock the record. 30 forms follow this.
- Derived and dependent values go in `ChangeValueBefore` / `ChangeValueAfter`, or by overriding
  `ChangeValue`. BMI already autocalculates that way in
  `customComponents/CardiovascularDisease/Forms/CVDBodySizeForm.jsx` — follow it for BMI and BSA on the
  surgery forms.
- Sections use `<GroupPanel title={t(...)} level={1|2|3}>`.
- `Unknown={true}` on a radio adds the tri-state "Тодорхойгүй" option.

### Add a report

`reports/<X>.js` generates it; `helper/BrowserPool.js` (Puppeteer) renders HTML to PDF; `helper/excel.js`
plus ExcelJS handle spreadsheets. Report label translation goes through `reports/translate.js`. For a
plain tabular export, use `POST /api/BaseObject/ExportExcel` instead of writing anything.

---

## 5. Conventions

**Naming — transliterated Mongolian.** Clinical columns use ad-hoc Latin transliteration of Mongolian,
not English. Keep doing this; consistency with 200+ existing tables beats tidiness.

`ү→v` · `ц→ts` · `ч→ch` · `ш→sh` · `ж→j` · `х→h` · `ө→u/o`

Real examples: `ZvrhTsahBichleg` (зүрхний цахилгаан бичлэг), `ZvrhEho`, `TseejRentgen`, `hamrah_negj`,
`is_tsevershilt`, `ger_bul`, `main_shaltgaan`, `havhlaga`, `TurulhiinGajig`. A free-text companion to a
"Бусад" option takes the `_other` suffix: `main_shaltgaan_other`.

The English wording in tender appendices 1.5–1.9 and 3.1 belongs in **labels and i18n**, not in column
names.

**Two table generations.** Match the one your new table sits beside:

| | Legacy (161 models) | Newer (36 models) |
|---|---|---|
| PK | `id_data` | `Id` |
| Columns | snake_case | PascalCase |
| Bookkeeping | `id`, `id_group`, `rec_status`, `date_creation`, `date_modif`, `user_mod` | `PatientId`, `CreateDate`, `UpdateDate`, `CreateUserId` |

**Response envelopes — two of them.** Legacy `controllers/**` uses PascalCase
`{ Success, Message, Data, Option }`, sent via `res.send(JSON.stringify(result))`, with
`BaseControllerHelper.GetDefaultErrorResult()` as the failure shape. The newer `api/**` uses lowercase
`{ success, message, data }` via `res.json()`. **Errors are returned with HTTP 200** in both. Match
whichever layer you are editing; do not mix.

**Backend style.** CommonJS only, no ESM. `async/await`. Controllers swallow their own errors:
`try { ... } catch (ex) { console.log(ex); return res.send(error envelope) }` — there is no custom error
class, and the global error handler is effectively unreachable from them. Prettier: 2 spaces, single
quotes, semicolons, `printWidth: 100`, `trailingComma: "es5"`.

**Frontend API calls.** Go through `helper/BaseCrudHelper.jsx`, a singleton that is **callback-style,
not promise-style**: `CallService(Url, ReqData, callback)`, `BaseGetList`, `BaseGetDetail`, `BaseCreate`,
`BaseUpdate`, `ExportExcel`, `BaseUploadFile`, `BasePrintReport`. Search options come from
`GetSearchOption()`. `axios` is imported in exactly one file (`src/config/Server.js`) — keep it that way.

**i18n.** `keySeparator: false`, `nsSeparator: false` — **the source string is the key**, and many keys
are already Mongolian. Catalogs are fetched over HTTP from `public/locales/{en,mn}/translation.json`;
the `en` file is mostly identity mappings. Add every new key to both files. Duplicate keys are a
recurring problem — there is a `scratch/find_dupes.js` for exactly this.

---

## 6. UI / UX rules

Good UI/UX is a delivery requirement, not a nice-to-have. Doctors spend entire shifts in these forms.

### No longer frozen — customer decision, 2026-09-09

The sidebar, topbar and Creative Tim shell **used to be** off-limits. The customer explicitly lifted
that during the AdviceHome rebuild, so the shell is now in scope to restyle. Branding (the MN CARDIO
name and the ЗСҮТ identity) is still not yours to change.

Not yet done: the sidebar and navbar restyle itself. The design tokens it should use already exist
(see below), so that work is now a matter of pointing `sidebarStyle.js` and `adminNavbarLinksStyle.js`
at them.

### The design system — read before writing any UI

**`src/theme.js` now declares a real type scale.** It did not before, which is why ~200 sites hardcode
`14px`, ~100 hardcode `12px`, and weights are spread across 300/400/500/600/700. Use
`<Typography variant="…">`; do not add a new font-size literal.

`display 34/700 · h1 28/700 · h2 22/700 · h3 18/600 · h4 16/600 · h5 15/600 · h6 14/600 ·
subtitle1 15/600 · subtitle2 13/600 · body1 16 · body2 14 · button 14/500 · caption 12.5 · overline 11/700`

`body2` is 14px, which is `CONTROL.fontSize` — one size for a label, an input, a button and secondary
text. Weight 300 is deliberately gone; 400 is the floor.

> `typography.fontSize` is `14`, and that is load-bearing. MUI treats it as a MULTIPLIER
> (`coef = fontSize / 14`). It used to be `16`, silently inflating every built-in variant ~14% —
> `body1` really rendered at 18.29px. Do not "fix" it back to 16.

**`src/theme/tokens.js`** (new) holds `radius`, `space` (4px grid), `elevation` (navy-tinted shadows,
never neutral black), `motion`, `layout`. `theme.spacing` stays 8px and `shape.borderRadius` is
untouched — 627 files depend on both.

**`colors.brand`** in `src/theme/colors.js` is the target palette, taken from the app's own accidental
brand (`LoginScene.css` and the sidebar gradient): `ink #0c2233`, `canvas #eaf2f8`, `cyan #18a8e8`,
`cyanInk #0a6c96`, `urgent #ee147d`.

> **Contrast rule, not negotiable.** `cyan` is ~2.5:1 on white and `cyanDeep` ~3.0:1 — both fail WCAG AA
> for text. Use them for accent bars, borders, icons ≥24px and chart strokes ONLY. Anything that is a
> word uses `cyanInk`. Doctors read these screens for a whole shift.

**The canvas is declared once**, at `layouts/Admin.jsx` `Content`. A page must not set its own page
background; if it does, it is fighting that line.

**Do not edit `_misc.scss` or `styles/style.scss`** to win a style fight. Their selectors are
element-level `(0,0,1)` and any emotion class beats them. The rule is: emit no bare `h1`–`h6` and no
`<table>` in new markup, and they cannot reach you. Editing them silently restyles ~72 routes.
Note `_misc.scss` declares `html * { letter-spacing: normal !important }` — letter-spacing is
unreachable without your own `!important`, so do not design around it.

### Rules for anything newly written

- **One palette.** Use `src/theme/colors.js` and `src/theme.js`. Do not add hardcoded hex values, and do
  not import the old purple Creative Tim palette from `assets/jss/material-dashboard-pro-react.js` into
  new code. Both are live today; that is the debt, not the target.
- **One control generation per screen.** Match the file you are editing. For net-new screens prefer
  `newComponents/BaseControls`. Do not create a fifth component directory.
- **No new styling mechanism.** Four already coexist (inline `style`, `sx`, `styled()`, JSS + SCSS). Do
  not add Tailwind, styled-components or CSS modules.

### Hard contract for the long clinical forms

The tender's forms run to several hundred fields each. Today they render as static, non-collapsible
`GroupPanel` fieldsets with **no autosave** — the biggest usability and data-loss risk in the delivery.
Every new or reworked registry form must have:

- **Sticky section navigation** listing the `GroupPanel` sections, with the current one marked.
- **Per-section completion state** — filled / partial / empty — visible without scrolling.
- **Conditional reveal** via `ChangeValueAfter`: the 92 `If yes, …` sub-fields stay hidden until their
  parent is answered. Required by spec: choosing "Coronary angiography only" must **skip the entire
  Angioplasty section** and jump to the next one.
- **Autocalculated fields read-only and live** — BMI and BSA on the surgery forms, following the existing
  BMI implementation.
- **Draft autosave** of `ModifyObject` to `localStorage`, keyed by form plus patient, restored on reopen,
  with a visible unsaved-changes indicator. Nothing like this exists today; it is new work.
- **Sticky action bar** — Save and Confirm always reachable without scrolling to the bottom.
- **Keyboard-first entry** — sane tab order, arrow-navigable radio groups, a full pass without a mouse.
- **The repeat-procedure prompt** the spec demands: when a patient returns for the same procedure, ask
  whether to duplicate the previous record's data.
- **Mongolian throughout** — labels via `t()`, never hardcoded; error, loading and empty states too.
- **The 19-segment coronary grid as one aligned table**, not 19 stacked rows.
- **Print output must match the approved paper form** — it is an acceptance criterion, not a nicety.

---

## 7. Upgrade tender scope

The xlsx is the tracker. This section is the map from tender item to existing code, so you know what is
extension and what is greenfield.

Line numbers refer to the plain-text extraction of `MN cardio upgrade.docx` (8,636 lines); the appendix
forms are large tables and are easiest to work from as extracted text.

### The 14 forms

| Tender § | Form | Status | Existing code |
|---|---|---|---|
| 1.1 (L114) | Pre-op prep checklist, open heart | **Extend** — ~50 items vs 12 columns today | `SurgeryBeforeVisitsCheck` |
| 1.2 (L190) | Cardiovascular surgery safety checklist | **Seeded** — 75 fields, 13 sections; body was two IMAGES, not text | — |
| 1.3 (L195) | Aortic aneurysm / aorto-iliac pre-op prep | New | — |
| 1.4 | Discharge checklist | **Scoped at contract signing**, dates TBD | — |
| 1.5 (L272) | Congenital heart disease | **Extend** | `CongenitalMalformationsController` |
| 1.6 (L1327) | Coronary artery surgery — largest surgery form | **Extend** | `CathLabController`, `CardiacSurgery` |
| 1.7 (L3383) | Aortic surgery | New | — |
| 1.8 (L4320) | Valve surgery | **Extend** | `ValveDiseasesController` |
| 1.9 (L5273) | Other open-heart surgery | New | — |
| 1.10 | Vascular surgery | **Scoped at contract signing**, dates TBD | `VascularDiseaseController` |
| 2.1 (L6114) | Electrophysiology / ablation protocol | New | `Ablation` model + config exist |
| 2.2 (L6263) | Atrial fibrillation registry — largest form overall, 12+ sections | **Largely done, extend** | `AtrialRhythmNewForm.jsx` |
| 3.1 (L8190) | Coronary diagnosis and treatment | **Extend** | `CathLabController` |
| 4.1 (L8611) | Cardiologist examination register — **form АМ-1Б** | **Extend** | `VisitController`, `reports/Ambulatori.js` |

### Part of the tender is IMAGES, not text — read them before calling a form unspecified

`MN cardio upgrade.docx` embeds three specifications as pictures. Text extraction finds a heading
with nothing under it, which is how 1.2 came to be recorded for months as "empty in the tender". It
was never empty. Extract `word/media/` from the docx (it is a ZIP) and **look at them**:

| File | Paragraph | What it is |
|---|---|---|
| `image1.png`, `image2.png` | 192, 193 | **Form 1.2 in full** — surgical safety checklist, 2 pages, 4 phases (CHECK IN · SIGN IN · TIME OUT · SIGN OUT) split across 13 section codes, **75 fields**. The third answer column is **not** universal: some rows are Тийм/Үгүй only (`f12_yn`), others add Тодорхойгүй (`f12_yn3`) |
| `image5.png` | 8611 | **Form 4.1 in full** — `ЭМЧИЙН ҮЗЛЭГИЙН БҮРТГЭЛ`, form **АМ-1Б**, a 22-column day-book |
| `image4.png` | 8301 | **3.1's coronary segment diagram** — the one the spec "asks for eventually" |

**Form 4.1 IS the A611 requirement.** АМ-1Б is appendix 11 of Minister of Health order А/611
(2019-12-30), which is what the integration line "A611 маягттай уялдах" refers to. Tracker rows
№95–100 (the form) and №126–128 (the ЭМХТ integration) are two halves of one thing.

`reports/Ambulatori.js` is **already** the АМ-1Б register — 580 lines, correct headings and column
numbering. It is dead only because `reportDir` is undeclared in `PrintAmbulatori` /
`PrintAmbulatoriHTML`, and nothing in the frontend calls it.

**`Visit` holds ~450,000 rows across 44 columns.** 4.1 extends that table. Do not re-platform it onto
the `TenderForm` JSON pattern: it would fork the examination record and force a migration the
customer has to approve — the 2.2 / `AtrialRhythmNew` problem at fifty thousand times the scale.

`AtrialRhythmNewForm.jsx` already carries the tender's §2.2 section headings word for word
("Үзлэг № 1 - Эхний үзлэг", "1. Хэвтэн эмчлүүлэх/Зөвлөгөөний мэдээлэл", "2. Оролцогчийн мэдээлэл",
"3. Зүрх судасны өвчлөлийн талаарх мэдээлэл / асуумж"). Check it before assuming anything is missing.

Also in scope: a unified menu listing all forms with unified search and export, and improving the
citizen-facing side so patients can compute their own cardiovascular risk (methodology and risk
classification must be approved by the clinical team first).

### Specified behaviour worth knowing before you design

- **92 conditional sub-fields** phrased `If yes, ...`.
- **19-segment coronary grid** — `LMCA`, `LAD 1-3`, `Dg 1-2`, `LCx 1-3`, `OM 1-2`, `Ramus`, `RCA 1-3`,
  `PDA`, `RVP`, saphenous bridge, mammary bridge — each Normal / `__%` / Acute occlusion / Chronic
  occlusion. The spec asks for a diagram eventually; text coding until then.
- **"Ask whether to DUPLICATE previous data"** on repeat coronary procedures — L8192, flagged `!!!` in
  the source.
- **"Coronary angiography only" skips the Angioplasty section** — L8348.
- **BMI and BSA are marked `/Autocalculator/`** on every surgery form.
- **EQ-5D-5L** quality-of-life instrument at L8147 — a validated, scored questionnaire. Use the standard
  wording; do not paraphrase.

### Integrations

ХУР (state data exchange — `XypServiceController`, `helper/xypSign.js`, certs in `config/Xyp/`) ·
ЭМД health insurance (`EMDServiceController`) · ЭМХТ national health system, aligned to the **A611**
form · e-prescription · ДАН / digital signature · **PACS/DICOM** imaging · **LIS/HL7** laboratory ·
the mobile app API.

Standards: **ICD, FHIR/HL7, SNOMED CT, LOINC** are named in the **mobile** tender (L96, L243), not
in this one. The upgrade tender's only standards reference is `A611` — see §7. Neither FHIR, HL7,
SNOMED nor LOINC appears anywhere in the backend.

### Also owed under the contract

Data migration from the old system, reconciled and signed off by the customer; automated backup;
national time-standard source; user, admin and API documentation; training materials and delivered
training sessions; a signed handover act.

---

## 8. Mobile app (second tender, not started)

No mobile code exists in this folder or in either repo. Android + iOS. It connects to **this** backend,
or takes its own APIs off the same database.

**Doctor module:** Миний үзлэгүүд · Миний хяналт · Миний зөвлөгөө · Миний тайлан, plus read access to
the patient modules (risk, e-visit, rehabilitation).

**Patient module:** Миний бүртгэл · Миний тэмдэглэл (daily health log) · Эмчээс асуух асуулт ·
Эмчийн зөвлөгөө · Эрсдэл үнэлгээ (ЗСӨ) · Цахим үзлэг · Сэргээн засах, дасгал хөдөлгөөн.

**Telemedicine module:** examination notes, tests and diagnostics, file attachment, telemedicine type
selection, advice and comments.

**Rehabilitation module:** risk assessment, exercise-tolerance assessment, vital signs, advice, warnings,
and **39 short exercise instruction videos** to be filmed with the hospital's rehabilitation physicians
and animated. Production cost is inside the contract price.

Fixed constraints from the spec: Mongolian-language UI · per-user permission control · doctor login name
tied to the professional practice licence code (no code, no login) · **fingerprint/biometric login** ·
notification after 3 failed password attempts · self-service password reset · automatic updates ·
patient-configurable notifications (medication, exercise, follow-up appointments) · chat supporting text,
images, audio and documents · patient registration data pulled from ХУР · notification to the patient
when their record is accessed · consent capture for non-treatment use of personal data · digital
signature · confidential-classification data hidden from unauthorised users · web-based admin panel.

---

## 9. Working agreements

- **No test suites, no test frameworks, no verification scripts in day-to-day work.** `vitest` and
  `node --test` are configured and there are zero test files; leave it that way. Report what changed and
  where to look at it. Do not add tooling that slows delivery.
- **But the contract owes test deliverables separately.** Web phase 5 requires unit tests, integration
  tests, load and performance tests, a cyber-security risk assessment, an information-security audit by
  an authorised body, remediation of its findings, UAT and a written test report. These are milestone
  deliverables to the customer, not part of routine feature work — and they are not optional. Track them
  in the xlsx.
- **Extend what exists.** Before writing a component, search `customComponents/`, `baseComponents/` and
  `newComponents/` — the control almost certainly exists, possibly in four versions. Do not start a
  fifth generation.
- **Prefer declaration over code.** If a ModelConfig entry or an `OptionTypes` row will do it, do not
  write a controller.
- **Clinical wording is not yours to improve.** Field labels, drug names, checklist items and scored
  instruments come from the tender verbatim. If something looks wrong, flag it — do not paraphrase it.
- **Ask, don't invent.** These are customer-owned (ЗСҮТ) and block work until supplied:
  - approved paper versions of all 14 forms, with fill rules
  - sign-off on the field dictionary and each form's field list
  - test and production servers, plus access
  - ХУР / ЭМД / ЭМХТ service agreements and credentials
  - `dico` seed values for new option lists, and any DDL that runs against production
  - approval of the cardiovascular risk methodology and its risk classes
  - scope decisions for forms 1.4 and 1.10
- Commit to a branch. The repos have no branch protection and no meaningful history.

---

## 10. Known traps

### Security

Facts and known risks, not a work order. The tender mandates a formal security audit, so these belong on
that list rather than being fixed opportunistically mid-feature.

- `helper/Auth.js` **skips JWT signature verification entirely when `NODE_ENV === 'development'`** — it
  calls `jwt.decode()` instead of `jwt.verify()`.
- The `/api/base/*` and `/api/report/*` mounts from `api/index.js` are registered **outside**
  `Auth.verifyToken`.
- `controllers/auth/UserController.js` **skips password validation entirely when `NODE_ENV !== 'production'`**:
  the dev branch issues a token for whoever you name, no password checked. Log in with the real
  `UserName` (a numeric value is also matched against `Users.Id`). The account must have a matching
  `DoctorsProfile.id` row or login fails with "эмчийн мэдээлэл олдсонгүй" — both existing admins lack
  one. It also logs the submitted password in plaintext to the console.
- Backend `.gitignore` is three lines and does **not** cover `.env`, `.env.production`,
  `config/SSL/*.key` or `config/Xyp/*.key`.
- `ssh.env` in the project root holds live SQL and SSH credentials in plain text (see §1).
- **`controllers/system/TestController.js` is mounted in `routeGroups.public`** — every route
  on it is reachable with no token. `PUT /api/Test/uploadFile` is therefore an
  **unauthenticated file upload**: `formidable` with `maxFileSize` 1 GB and
  `keepExtensions: true`, copied into `process.env.ALLFILE_DIR` — the same directory that
  holds patient file attachments. The destination name is
  `getDateNumbers() + '_320_0'`, a hardcoded id with no extension and no per-user path, so
  uploads also collide with each other. `GET /api/Test/print` and `/ApiSendMail` are
  likewise public (the mail one sends to a hardcoded gmail address). Found 2026-09-10; the
  route group was left as-is because moving it may break callers — decide before handover.
- `index.html` loads five assets from third-party CDNs at runtime — html2canvas, jvectormap CSS,
  FontAwesome, two Google Fonts. Three of them back libraries no React code uses.

### Dead or misleading files — do not edit these expecting an effect

- `src/routes.js` (24 KB) — a full legacy route table that **nothing imports**. The live tables are in
  `src/routes/`.
- The frontend `README.md` is the untouched Creative Tim "Material Dashboard PRO React" template README.
  It documents a different project. Ignore it.
- `documentation/` is the template's component gallery. Dead.
- `backend/temp_DoctorsProfileForm.jsx` — an orphaned, outdated copy of
  `src/customComponents/Forms/DoctorsProfileForm.jsx` sitting in the backend root. Delete it.
- `src/app/`, `src/pages/` and `src/lib/` are effectively empty despite having path aliases.
- The `views/*` alias exists but the directory is `view/` (singular). Only `view/*` resolves.
- `build/` is committed on disk. It is not source.

### Typos baked into the code — match them exactly or nothing resolves

| Wrong-looking | Where | Note |
|---|---|---|
| `SingelSelect` | ModelConfigs | 57 uses alongside 124 correct `SingleSelect` |
| `CradiacSurgeryOperationRecord` | model, config, table name | The DB table really is spelled this way |
| `DetaultFields` | model statics | — |
| `Editfield` | ModelConfigs | 117 uses vs `EditField` |
| `Weigth` | `CVDBodySizeForm.jsx` | — |
| `req.LogedUser` | everywhere | The user object on the request |
| `/admin/CVDIndicartors` | `routes/cardiovascularRoutes.js` | The URL itself is misspelled |

### Data traps in the Advice (тасалбар) tables

Measured against the live `MnCardio_restored` database on 2026-09-09. These are data facts, not code
bugs, and they change what a feature can assume:

- **No ticket has status `'n'` (open).** 5,469 are `'y'` closed, 25 are `'3'` draft, 3 hold junk
  (the literal string `Invalid date`, and one stray datetime). A screen that filters to open-only
  shows nothing. Ask ЗСҮТ whether `'n'` is genuinely unused or whether publishing broke.
- **`Advice.level` is NULL on 2,216 of 5,497 rows (40%).** Every visibility rule filters
  `level IN ('1','2','3')`, so 40% of the archive is invisible to every non-admin. Needs a backfill
  from the author's organization — that writes production data, so it is a customer decision.
- **`Body` is empty on 3,099 of 5,469 tickets (57%).** The clinical content is in the first reply.
  `/Advice/GetFeed` therefore returns `FirstComment` and the feed card falls back to it, labelled.
- `adv_ticket_closed` is `nvarchar(30)` holding a status CODE. The model declared it `DATE`, so
  Sequelize date-parsed `'y'` into the string `"Invalid date"` on every read — fixed 2026-09-09.
  If a status ever reads as `Invalid date` again, that declaration is why.
- All 680 organizations have a clean `level`, so `BuildAdviceScope`'s deny-on-unknown-level costs
  nobody their access.

### Other

- **Undeclared imports.** `moment` (`src/view/VisitDetail.jsx`) and `dayjs`
  (`src/newComponents/BaseControls/BaseDateBox/index.jsx`) are imported but **not in `package.json`**.
  The rest of the app uses `date-fns`. Use `date-fns`.
- **Abandoned migration.** ~15 files are stubs whose bodies are commented out with
  `// TODO: DevExtreme not installed`, e.g. `components/customComponent/defaults/Popup/index.jsx` and
  `customComponents/NationalRegistry/New/Icd/form.jsx`. Leftover DevExtreme CSS is still in
  `src/styles/themes/generated/`. Do not build on these.
- **Lint is not a safety net.** The frontend `eslint.config.js` sets `no-unused-vars: "off"` and
  `react/prop-types: "off"`, and downgrades `no-undef`, `no-dupe-keys` and `no-redeclare` to warnings.
  There is no `.prettierrc` in the frontend, so Prettier defaults apply there while the backend has an
  explicit config. Run `npm run lint:fix` before committing frontend work.
- **175 class components** (`extends Component` / `extends BaseCustomForm`) coexist with hooks-based
  components, including core infrastructure like `components/Sidebar/Sidebar.jsx`. Registry forms are
  class components by design — follow that when extending them.
