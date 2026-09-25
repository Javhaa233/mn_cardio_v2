/**
 * The production cutover migration manifest.
 *
 * There are no migrations and no seeders in this project — the database owns the
 * schema (CLAUDE.md §2) — so `backend/scripts/*.sql` is a flat, unordered bag of
 * 65 files with three different guard styles and no statement anywhere of which
 * ones production still needs, or in what order. This file is that statement.
 *
 * It is DATA, not a driver. Nothing here executes anything. The operator applies
 * each file by hand with sqlcmd on the production box; see
 * TEST_TO_PROD_RUNBOOK.md Stage 3. That is deliberate: we never write to
 * production, and the person who does is not running this checkout.
 *
 * ── HOW THIS LIST WAS DERIVED ───────────────────────────────────────────────
 * Not from reading the scripts and guessing. On 2026-09-23,
 * `node tests/acceptance/schema_diff.js` compared `MnCardio_test` (which has had
 * every script applied) against `MnCardioNew` (production), read-only, at the
 * level of tables, columns, indexes, CHECK constraints, foreign keys, view
 * BODIES and procedures. The measured gap was:
 *
 *     tables      10 missing        columns  34 missing (+140 on the new tables)
 *     indexes      5 missing        checks    4 missing
 *     foreign keys 2 missing        views    11 missing, 1 DIFFERING
 *     procedures   0 missing        reverse drift: NONE
 *
 * The surprise, and the reason this file is much shorter than expected: **14 of
 * the scripts have already been applied to production by someone else.**
 * `UserSession`, `LoginAttempt`, `PushDevice`, `PatientReminder(Log)`,
 * `PatientConsent`, `ConsentDocument`, `ConfidentialityGrant`,
 * `DocumentSignature`, `RehabExercise`, `RehabAssessment`, `RehabProgress`,
 * `RehabVitalSign` all exist there, as do the licence, confidentiality,
 * organisation-merge, access-audit, notification and remote-visit columns. Do
 * not re-apply them; they are idempotent, but running them is still 14 chances
 * to be pointed at the wrong database for no benefit.
 *
 * "Reverse drift: NONE" is worth stating plainly too. Production runs a
 * different developer's commits (backend 8167947, frontend 77a977a), and the
 * diff found no schema object there that `MnCardio_test` lacks. Whatever that
 * line of work changed, it did not change the schema.
 *
 * ── GUARD CLASSES ───────────────────────────────────────────────────────────
 *   'new-ok'     IF DB_NAME() NOT IN ('MnCardio_restored','MnCardioNew','MnCardio_test')
 *                — runs on production as written.
 *   'test-only'  IF DB_NAME() <> 'MnCardio_test' — REFUSES on production.
 *   'none'       no DB_NAME() check at all — applies wherever it is pointed.
 *
 * Under `sqlcmd` the in-script guard is a real control: one connection, so
 * `SET NOEXEC ON` survives batch boundaries. Under `run_sql.js` it is INERT,
 * because Sequelize pools up to 20 connections and batch 2 can land on one that
 * never saw the SET. That asymmetry is why the runbook applies these with
 * sqlcmd and why `GuardAction` below says to fix the guards rather than bypass
 * them.
 *
 * ── WHY MOST 'test-only' SCRIPTS STAY THAT WAY ──────────────────────────────
 * Thirteen scripts carry the test-only guard. Nine of them are test-only
 * DELIBERATELY, and their headers say so: the content is clinical wording drafted
 * by ITsystem and not approved by ЗСҮТ, or it points at the test host. Widening
 * those guards would push unapproved wording into the national cardiology EMR.
 * They are listed at the bottom under DEFERRED with their blocker, so that the
 * orphan check stays clean and nobody has to wonder why they were skipped.
 * Only four are test-only by authoring accident, and only those get widened.
 */

/**
 * Ordered. Phase boundaries are hard; within a phase, order does not matter
 * unless `Needs` says otherwise.
 */
const ENTRIES = [
  // ── Phase 1 · tender form schema ──────────────────────────────────────────
  {
    File: 'tender_forms_schema.sql',
    Phase: 1,
    Purpose: 'The three tables the whole tender-form engine stands on.',
    Guard: 'new-ok',
    GuardAction: '',
    Bom: false,
    Creates: {
      Tables: ['TenderForm', 'TenderFormField', 'TenderFormData'],
      Indexes: ['IX_TenderFormField_Form', 'IX_TenderFormData_Form', 'IX_TenderFormData_Patient'],
    },
    Needs: [],
    Idempotent: true,
    DestructiveOnRerun: false,
    Rollback: 'DROP TABLE dbo.TenderFormData, dbo.TenderFormField, dbo.TenderForm;',
    Verify:
      "SELECT COUNT(*) AS Have FROM sys.tables WHERE name IN ('TenderForm','TenderFormField','TenderFormData')",
    Expect: 3,
    IfSkipped: 'Every tender-form endpoint and screen 500s. Nothing else is affected.',
  },
  {
    File: 'add_tenderform_allow_duplicate.sql',
    Phase: 1,
    Purpose: 'TenderForm.AllowDuplicate — form 3.1 offers to copy the previous procedure.',
    Guard: 'new-ok',
    GuardAction: '',
    Bom: true,
    Creates: { Columns: ['TenderForm.AllowDuplicate'] },
    Needs: ['tender_forms_schema.sql'],
    Idempotent: true,
    DestructiveOnRerun: false,
    Rollback: 'ALTER TABLE dbo.TenderForm DROP COLUMN AllowDuplicate;',
    Verify:
      "SELECT COUNT(*) AS Have FROM sys.columns WHERE object_id=OBJECT_ID('dbo.TenderForm') AND name='AllowDuplicate'",
    Expect: 1,
    IfSkipped: 'Repeat-procedure prompt on form 3.1 is unavailable.',
  },
  {
    File: 'add_tenderformfield_printlayout.sql',
    Phase: 1,
    Purpose: 'TenderFormField.PrintLayout — controls A4 print grouping.',
    Guard: 'new-ok',
    GuardAction: '',
    Bom: false,
    Creates: { Columns: ['TenderFormField.PrintLayout'] },
    Needs: ['tender_forms_schema.sql'],
    Idempotent: true,
    DestructiveOnRerun: false,
    Rollback: 'ALTER TABLE dbo.TenderFormField DROP COLUMN PrintLayout;',
    Verify:
      "SELECT COUNT(*) AS Have FROM sys.columns WHERE object_id=OBJECT_ID('dbo.TenderFormField') AND name='PrintLayout'",
    Expect: 1,
    IfSkipped: 'Printed forms lose their layout hints — acceptance criterion 5 fails.',
  },
  {
    File: 'add_tenderformfield_tableconfig.sql',
    Phase: 1,
    Purpose:
      "TenderFormField.TableConfig / TableRows — the repeating-grid 'Table' field type on forms 2.1 and 2.2.",
    Guard: 'new-ok',
    GuardAction: '',
    Bom: true,
    Creates: { Columns: ['TenderFormField.TableConfig', 'TenderFormField.TableRows'] },
    Needs: ['tender_forms_schema.sql'],
    Idempotent: true,
    DestructiveOnRerun: false,
    Rollback: 'ALTER TABLE dbo.TenderFormField DROP COLUMN TableConfig, TableRows;',
    Verify:
      "SELECT COUNT(*) AS Have FROM sys.columns WHERE object_id=OBJECT_ID('dbo.TenderFormField') AND name IN ('TableConfig','TableRows')",
    Expect: 2,
    IfSkipped: "Forms 2.1 and 2.2 cannot render their 'Table' fields.",
  },

  // ── Phase 2 · additive DDL on existing tables ─────────────────────────────
  {
    File: 'add_chat_v2_columns.sql',
    Phase: 2,
    Purpose:
      'Chat v2: participant/message user typing, read receipts, mute, room type, attachment counts, ' +
      'plus the CHECK constraints, the two foreign keys and the four indexes that make the chat queries ' +
      'and the attachment lookup seek instead of scan.',
    Guard: 'new-ok',
    GuardAction: '', // guard fixed 2026-09-24 (runbook Stage 2.2)
    Bom: false,
    Creates: {
      Columns: [
        'ChatMessages.UserType',
        'ChatMessages.Status',
        'ChatMessages.AttachmentCount',
        'ChatRoomTooUsers.UserType',
        'ChatRoomTooUsers.LastReadMessageId',
        'ChatRoomTooUsers.LastReadDate',
        'ChatRoomTooUsers.IsMuted',
        'ChatRooms.RoomType',
        'ChatRooms.CreateUserType',
      ],
      Indexes: [
        'IX_ChatMessages_Room_Id',
        'IX_ChatRoomTooUsers_User',
        'UX_ChatRoomTooUsers_Room_User',
        'IX_File_LinkedObject',
      ],
      Checks: [
        'CK_ChatMessages_UserType',
        'CK_ChatMessages_Status',
        'CK_ChatRoomTooUsers_UserType',
        'CK_ChatRooms_RoomType',
      ],
      ForeignKeys: ['FK_ChatMessages_ChatRooms', 'FK_ChatRoomTooUsers_ChatRooms'],
    },
    Needs: [],
    Idempotent: true,
    DestructiveOnRerun: false,
    /*
     * Not purely additive in one respect: it widens ChatMessages.MessageText to
     * NVARCHAR(2000). Widening never truncates, so no message can be lost, but
     * it is the one statement here that rewrites existing rows rather than
     * adding metadata. ChatMessages is small; check its row count first.
     */
    Rollback:
      'The columns drop cleanly once their CHECK constraints and indexes are dropped first. ' +
      'The MessageText widening is NOT reversible without risking truncation — leave it.',
    Verify:
      "SELECT COUNT(*) AS Have FROM sys.columns WHERE object_id=OBJECT_ID('dbo.ChatMessages') " +
      "AND name IN ('UserType','Status','AttachmentCount')",
    Expect: 3,
    IfSkipped:
      'Doctor–patient chat breaks outright: the model declares these columns, so Sequelize puts them ' +
      'in the default SELECT and every chat query fails. This is NOT a dark feature — it is a 500.',
  },
  {
    File: 'add_file_media_columns.sql',
    Phase: 2,
    Purpose: 'File.duration_ms / media_state — voice-note duration labels and transcode state.',
    Guard: 'new-ok',
    GuardAction: '',
    Bom: true,
    Creates: { Columns: ['File.duration_ms', 'File.media_state'] },
    Needs: [],
    Idempotent: true,
    DestructiveOnRerun: false,
    Rollback: 'ALTER TABLE [File] DROP COLUMN duration_ms, media_state;',
    Verify:
      "SELECT COUNT(*) AS Have FROM sys.columns WHERE object_id=OBJECT_ID('dbo.[File]') AND name IN ('duration_ms','media_state')",
    Expect: 2,
    IfSkipped:
      'Degrades, does not break. Audio still uploads and plays; the player shows –:-- until the clip loads. ' +
      'model/File.js deliberately does NOT declare these two columns — helper/MediaMeta.js probes for them ' +
      'in raw SQL — which is exactly what lets the code run on a database without them. Do not "fix" that.',
  },
  {
    File: 'add_visit_am1b_columns.sql',
    Phase: 2,
    Purpose:
      'Visit += exam_type_icd, cause_icd10, procedure_icd9, has_complication, incapacity_days — tender form 4.1 / А/611 АМ-1Б.',
    Guard: 'new-ok',
    GuardAction: '',
    Bom: false,
    Creates: {
      Columns: [
        'Visit.exam_type_icd',
        'Visit.cause_icd10',
        'Visit.procedure_icd9',
        'Visit.has_complication',
        'Visit.incapacity_days',
      ],
    },
    Needs: [],
    Idempotent: true,
    DestructiveOnRerun: false,
    Rollback:
      'ALTER TABLE dbo.Visit DROP COLUMN exam_type_icd, cause_icd10, procedure_icd9, has_complication, incapacity_days;',
    Verify:
      "SELECT COUNT(*) AS Have FROM sys.columns WHERE object_id=OBJECT_ID('dbo.Visit') " +
      "AND name IN ('exam_type_icd','cause_icd10','procedure_icd9','has_complication','incapacity_days')",
    Expect: 5,
    /*
     * Visit is 450,870 rows. All five are nullable with no default, so this is a
     * metadata-only change in SQL Server — it does not rewrite the table and
     * takes a schema-modification lock for well under a second. Still, it is the
     * largest table the cutover touches; do it outside clinic hours.
     */
    IfSkipped:
      'The АМ-1Б register cannot record examination type, cause, procedure or incapacity days.',
  },
  {
    File: 'add_atrialrhythmnew_missing_columns.sql',
    Phase: 2,
    Purpose: 'Six fields form 2.2 asks for that the original AtrialRhythmNew table never had.',
    Guard: 'new-ok',
    GuardAction: '',
    Bom: false,
    Creates: {
      Columns: [
        'AtrialRhythmNew.shinj_daraa_date',
        'AtrialRhythmNew.z_s_umnuh_harvalt_suuliin_tohioldol',
        'AtrialRhythmNew.z_s_3havtast_emgeg_odoo',
        'AtrialRhythmNew.z_s_3havtast_emgeg_regur',
        'AtrialRhythmNew.z_s_turulh_emgeg_yes',
        'AtrialRhythmNew.z_s_turulh_emgeg_yes_other',
      ],
    },
    Needs: [],
    Idempotent: true,
    DestructiveOnRerun: false,
    Rollback:
      'ALTER TABLE dbo.AtrialRhythmNew DROP COLUMN shinj_daraa_date, z_s_umnuh_harvalt_suuliin_tohioldol, ' +
      'z_s_3havtast_emgeg_odoo, z_s_3havtast_emgeg_regur, z_s_turulh_emgeg_yes, z_s_turulh_emgeg_yes_other;',
    Verify:
      "SELECT COUNT(*) AS Have FROM sys.columns WHERE object_id=OBJECT_ID('dbo.AtrialRhythmNew') AND name='shinj_daraa_date'",
    Expect: 1,
    IfSkipped:
      'The atrial-fibrillation registry form saves, but those six answers are silently dropped — ' +
      'Sequelize discards a write to a column the database does not have, with no error.',
  },
  {
    File: 'add_userrequest_approval_columns.sql',
    Phase: 2,
    Purpose:
      'UserRequests += PasswordHash, OrganizationId, DecisionDate, DeclineReason — doctor self sign-up and approval.',
    Guard: 'new-ok',
    GuardAction: '',
    Bom: false,
    Creates: {
      Columns: [
        'UserRequests.PasswordHash',
        'UserRequests.OrganizationId',
        'UserRequests.DecisionDate',
        'UserRequests.DeclineReason',
      ],
    },
    Needs: [],
    Idempotent: true,
    DestructiveOnRerun: false,
    Rollback:
      'ALTER TABLE dbo.UserRequests DROP COLUMN PasswordHash, OrganizationId, DecisionDate, DeclineReason;',
    Verify:
      "SELECT COUNT(*) AS Have FROM sys.columns WHERE object_id=OBJECT_ID('dbo.UserRequests') AND name='PasswordHash'",
    Expect: 1,
    IfSkipped:
      'The doctor sign-up / approval flow cannot store a pending password or record a decision.',
  },
  {
    File: 'add_consent_guardian_columns.sql',
    Phase: 2,
    Purpose:
      'PatientConsent += GrantedBy, GuardianRegNo, GuardianName, GuardianRelation — consent given by a guardian.',
    Guard: 'new-ok',
    GuardAction: '', // guard fixed 2026-09-24 (runbook Stage 2.2)
    Bom: false,
    Creates: {
      Columns: [
        'PatientConsent.GrantedBy',
        'PatientConsent.GuardianRegNo',
        'PatientConsent.GuardianName',
        'PatientConsent.GuardianRelation',
      ],
    },
    Needs: [],
    Idempotent: true,
    DestructiveOnRerun: false,
    Rollback:
      'ALTER TABLE dbo.PatientConsent DROP COLUMN GrantedBy, GuardianRegNo, GuardianName, GuardianRelation;',
    Verify:
      "SELECT COUNT(*) AS Have FROM sys.columns WHERE object_id=OBJECT_ID('dbo.PatientConsent') AND name='GuardianRegNo'",
    Expect: 4,
    IfSkipped:
      'Consent cannot be recorded as given by a guardian. FEATURE_CONSENT is off by default anyway.',
  },

  // ── Phase 3 · new tables with an ordering dependency ──────────────────────
  {
    File: 'add_rehab_program_tables.sql',
    Phase: 3,
    Purpose:
      'The rehabilitation programme structure and the session/vital-sign link (mobile tender §2.7).',
    Guard: 'new-ok',
    GuardAction: '', // guard fixed 2026-09-24 (runbook Stage 2.2)
    Bom: false,
    Creates: {
      Tables: ['RehabProgram', 'RehabProgramBlock', 'RehabMovement', 'RehabPlan', 'RehabSession'],
      Columns: [
        'RehabProgress.SessionId',
        'RehabVitalSign.SessionId',
        'RehabVitalSign.BorgScale',
        'RehabVitalSign.AtSec',
      ],
      Indexes: [
        'UX_RehabProgram_Code',
        'IX_RehabProgramBlock_Program',
        'IX_RehabMovement_Exercise',
        'IX_RehabPlan_PatRegNo',
        'IX_RehabSession_PatRegNo',
        'IX_RehabVitalSign_Session',
      ],
    },
    /*
     * add_rehabilitation_tables.sql is its stated prerequisite, but production
     * ALREADY has RehabExercise / RehabAssessment / RehabProgress /
     * RehabVitalSign — verified by schema_diff on 2026-09-23. Do not re-run it.
     */
    Needs: ['(already satisfied on production: add_rehabilitation_tables.sql)'],
    Idempotent: true,
    DestructiveOnRerun: false,
    Rollback:
      'DROP TABLE dbo.RehabSession, dbo.RehabPlan, dbo.RehabMovement, dbo.RehabProgramBlock, dbo.RehabProgram; ' +
      'ALTER TABLE dbo.RehabVitalSign DROP COLUMN SessionId, BorgScale, AtSec; ' +
      'ALTER TABLE dbo.RehabProgress DROP COLUMN SessionId;',
    Verify:
      'SELECT COUNT(*) AS Have FROM sys.tables WHERE name IN ' +
      "('RehabProgram','RehabProgramBlock','RehabMovement','RehabPlan','RehabSession')",
    Expect: 5,
    IfSkipped:
      'Rehab programme endpoints 500. SchemaProbe lists rehab in its PENDING boot line but NOTHING gates ' +
      'it at request time, so this is an error, not a dark feature.',
  },
  {
    File: 'add_code_mapping.sql',
    Phase: 3,
    Purpose: 'CodeMapping — LOINC / SNOMED / UCUM lookup for the FHIR export.',
    Guard: 'new-ok',
    GuardAction: '', // guard fixed 2026-09-24 (runbook Stage 2.2)
    Bom: false,
    Creates: { Tables: ['CodeMapping'] },
    Needs: [],
    Idempotent: true,
    DestructiveOnRerun: false,
    Rollback: 'DROP TABLE dbo.CodeMapping;',
    Verify: "SELECT COUNT(*) AS Have FROM sys.tables WHERE name='CodeMapping'",
    Expect: 1,
    IfSkipped:
      'FHIR export emits no standard codings. It is off by default, so nothing visible changes.',
  },
  {
    File: 'add_mobile_settings.sql',
    Phase: 3,
    Purpose:
      'MobileSetting — minimum supported build, store URLs, force-update flags for the mobile app.',
    Guard: 'new-ok',
    GuardAction: '', // guard fixed 2026-09-24 (runbook Stage 2.2)
    Bom: false,
    Creates: { Tables: ['MobileSetting'] },
    Needs: [],
    Idempotent: true,
    DestructiveOnRerun: false,
    Rollback: 'DROP TABLE dbo.MobileSetting;',
    Verify: "SELECT COUNT(*) AS Have FROM sys.tables WHERE name='MobileSetting'",
    Expect: 1,
    IfSkipped:
      'The mobile app cannot read its version gate. The app is not published to production, so no impact today.',
  },
  {
    File: 'seed_mobile_permissions.sql',
    Phase: 3,
    Purpose:
      'Nine Permissions rows for the mobile objects, so the existing admin screens can list them.',
    Guard: 'new-ok',
    GuardAction: '', // guard fixed 2026-09-24 (runbook Stage 2.2)
    Bom: false,
    Creates: {},
    Needs: [],
    Idempotent: true,
    DestructiveOnRerun: false,
    Rollback:
      'DELETE FROM [Permissions] WHERE ObjectName IN (...);  -- see the script for the nine names',
    Verify:
      "SELECT COUNT(*) AS Have FROM [Permissions] WHERE ObjectName LIKE 'Rehab%' OR ObjectName LIKE 'Mobile%'",
    Expect: null,
    IfSkipped:
      'The permission admin screen does not list the mobile objects. FEATURE_PERMISSIONS is off, so nothing is enforced either way.',
  },

  // ── Phase 4 · the form dictionary (data only, invisible to schema_diff) ───
  /*
   * Expected row counts are not guesses — they are what MnCardio_test actually
   * holds, read on 2026-09-23. 1,688 dictionary rows across the eleven forms.
   * If a seed lands and the count does not match, stop: either the file changed
   * or a batch failed silently, and `run_sql.js` continues past a failed batch.
   */
  ...[
    ['1_1', 66],
    ['1_2', 75],
    ['1_3', 62],
    ['1_5', 178],
    ['1_6', 196],
    ['1_7', 218],
    ['1_8', 234],
    ['1_9', 219],
    ['2_1', 30],
    ['2_2', 244],
    ['3_1', 166],
  ].map(([code, fields]) => ({
    File: 'seed_form_' + code + '.sql',
    Phase: 4,
    ExpectFields: fields,
    Purpose: 'Field dictionary for tender form ' + code.replace('_', '.') + '.',
    Guard: 'new-ok',
    GuardAction: '',
    // seed_form_1_2.sql is the one without a BOM, and it is 92 lines of Cyrillic.
    Bom: code !== '1_2',
    Creates: {},
    Needs: ['tender_forms_schema.sql'],
    Idempotent: true,
    /*
     * Each script does DELETE FROM TenderFormField WHERE FormCode = @Form and
     * then re-inserts. On a database where somebody has edited the dictionary,
     * that edit is gone and the only recovery is a full restore.
     *
     * On THIS cutover it is harmless: schema_diff confirmed production has zero
     * TenderForm* tables on 2026-09-23, so the DELETE runs against a table
     * created minutes earlier in Phase 1 and matches nothing. Re-check that
     * before a second run, not before the first.
     */
    DestructiveOnRerun: true,
    Rollback:
      'none — restore from the Stage 2 backup. Harmless on a first run against an empty table.',
    Verify:
      "SELECT COUNT(*) AS Fields FROM dbo.TenderFormField WHERE FormCode = '" +
      code.replace('_', '.') +
      "'",
    Expect: fields,
    IfSkipped: 'That form renders with no fields at all.',
  })),
  {
    File: 'seed_optiontypes_2_2.sql',
    Phase: 4,
    Purpose: 'DicoType / OptionTypes rows that form 2.2 resolves its dropdowns against.',
    Guard: 'new-ok',
    GuardAction: '',
    Bom: true,
    Creates: {},
    Needs: ['seed_form_2_2.sql'],
    Idempotent: true,
    DestructiveOnRerun: false,
    Rollback: 'none — additive, guarded by IF NOT EXISTS (91 guards).',
    Verify: "SELECT COUNT(*) AS Codes FROM DicoType WHERE dico LIKE 'f22%'",
    Expect: null,
    IfSkipped: "Form 2.2's option lists come back empty and the controls fall back to free text.",
  },
  {
    File: 'seed_optiontypes_3_1.sql',
    Phase: 4,
    Purpose: 'DicoType / OptionTypes rows for form 3.1.',
    Guard: 'new-ok',
    GuardAction: '',
    Bom: true,
    Creates: {},
    Needs: ['seed_form_3_1.sql'],
    Idempotent: true,
    DestructiveOnRerun: false,
    Rollback: 'none — additive, guarded by IF NOT EXISTS (60 guards).',
    Verify: "SELECT COUNT(*) AS Codes FROM DicoType WHERE dico LIKE 'f31%'",
    Expect: null,
    IfSkipped: "Form 3.1's option lists come back empty.",
  },
  {
    File: 'fix_form_field_types_and_required.sql',
    Phase: 4,
    Purpose:
      "Corrects field types the seed derived wrongly — 2.2's weight and height came out as a yes/no radio, " +
      'BMI/BSA/body weight/admission date came out as Text on some forms and Number/Date on others — and ' +
      'flags the case identifier and principal date per form as required.',
    Guard: 'new-ok',
    GuardAction: '', // guard fixed 2026-09-24 (runbook Stage 2.2)
    Bom: false,
    Creates: {},
    Needs: ['seed_form_2_2.sql', 'seed_form_3_1.sql'],
    Idempotent: true,
    DestructiveOnRerun: false,
    Rollback: 'none — re-running the matching seed_form_*.sql restores the pre-fix state.',
    Verify: 'SELECT COUNT(*) AS RequiredFields FROM dbo.TenderFormField WHERE IsRequired = 1',
    Expect: null,
    IfSkipped:
      'Numeric and date fields render as radio buttons. Validation has almost nothing to enforce.',
  },
  {
    File: 'fix_form_conditional_links_and_sections.sql',
    Phase: 4,
    Purpose:
      'Second correction batch: dates on 2.2/3.1 seeded as radios over {dd, mm}, blood pressure / heart rate / ' +
      'echo measurements seeded as the same radio, medications with no "Тийм" option, parents pointing at the ' +
      "wrong question or code, and 3.1's sections.",
    Guard: 'new-ok',
    GuardAction: '', // guard fixed 2026-09-24 (runbook Stage 2.2)
    Bom: false,
    Creates: {},
    Needs: ['fix_form_field_types_and_required.sql'],
    Idempotent: true,
    DestructiveOnRerun: false,
    Rollback: 'none — re-running the matching seed_form_*.sql restores the pre-fix state.',
    Verify: 'SELECT COUNT(*) AS WithParents FROM dbo.TenderFormField WHERE ParentField IS NOT NULL',
    Expect: null,
    IfSkipped:
      "Conditional reveal is broken: the seed wrote 'y' as the parent value against option lists coded o1/o2, " +
      'so those children can never appear.',
  },
  {
    File: 'clean_form_labels.sql',
    Phase: 4,
    Purpose: 'Tidies label and option text left ragged by the tender extraction.',
    Guard: 'new-ok',
    GuardAction: '',
    Bom: false,
    Creates: {},
    Needs: ['fix_form_conditional_links_and_sections.sql'],
    Idempotent: true,
    DestructiveOnRerun: false,
    Rollback: 'none — cosmetic; re-running the seeds restores the original text.',
    Verify: null,
    IfSkipped: 'Some labels carry stray punctuation or whitespace.',
  },
  {
    File: 'set_form_searchable_fields.sql',
    Phase: 4,
    Purpose: 'Marks which dictionary fields the list view offers as search columns.',
    Guard: 'new-ok',
    GuardAction: '',
    Bom: true,
    Creates: {},
    Needs: ['clean_form_labels.sql'],
    Idempotent: true,
    DestructiveOnRerun: false,
    Rollback: 'UPDATE dbo.TenderFormField SET IsSearchable = 0;',
    Verify: 'SELECT COUNT(*) AS Searchable FROM dbo.TenderFormField WHERE IsSearchable = 1',
    Expect: null,
    IfSkipped: 'The tender-form list views offer no search columns — acceptance criterion 4 fails.',
  },

  // ── Phase 5 · views, AFTER the dictionary is final ────────────────────────
  ...['1_1', '1_2', '1_3', '1_5', '1_6', '1_7', '1_8', '1_9', '2_1', '2_2', '3_1'].map((code) => ({
    File: 'generated/vwForm_' + code + '.sql',
    Phase: 5,
    Purpose:
      'Projects form ' +
      code.replace('_', '.') +
      "'s JSON answers into columns, which is what gives /BaseObject list, search, sort and Excel export for free.",
    Guard: 'none',
    GuardAction:
      'Generated file — leave as is and rely on the sqlcmd -d assertion. Do NOT run ' +
      'scripts/generate_form_views.js against production: it issues CREATE OR ALTER VIEW against whatever ' +
      'config/Config.env happens to reach, with no --db assertion and no DB_NAME() check anywhere.',
    Bom: false,
    Creates: { Views: ['vwForm_' + code] },
    // A view is a pure function of the dictionary. Build it before the dictionary
    // is final and it projects the wrong columns — and it will look fine.
    Needs: ['set_form_searchable_fields.sql'],
    Idempotent: true,
    DestructiveOnRerun: false,
    Rollback: 'DROP VIEW dbo.vwForm_' + code + ';',
    Verify: "SELECT COUNT(*) AS Have FROM sys.views WHERE name='vwForm_" + code + "'",
    Expect: 1,
    IfSkipped:
      'List, search and Excel export for that form 500. SchemaProbe does not cover vwForm_*, so there is ' +
      'no dark-feature fallback.',
  })),

  // ── Phase 6 · needs a human decision before it is applied ─────────────────
  {
    File: 'fix_vwDoctorsTeamInfo_exclude_deleted.sql',
    Phase: 6,
    Purpose:
      'Adds the missing rec_status filter to PRODUCTION’s existing vwDoctorsTeamInfo, so deleted ' +
      'team memberships stop being counted without replacing its grouped-join shape.',
    Guard: 'new-ok',
    GuardAction: '',
    Bom: false,
    Creates: { Views: ['vwDoctorsTeamInfo'] },
    Needs: [],
    Idempotent: true,
    DestructiveOnRerun: false,
    Decision: true,
    /*
     * THE ONLY ENTRY THAT CHANGES WHAT PRODUCTION ALREADY SHOWS.
     *
     * Production had a DIFFERENT definition of this view — caught by the view
     * BODY hash in schema_diff, which a presence check would have called green.
     * Production used LEFT JOIN over grouped derived tables and counted every
     * LookupDoctorTeam row including deleted ones; our create_vwDoctorsTeamInfo.sql
     * excluded deleted rows but did it with two correlated subqueries per team.
     *
     * Decision taken 2026-09-23: apply NEITHER as-is. This script keeps
     * production's faster shape and adds only the missing filter, which was
     * verified read-only to return numbers identical to ours on all 453 teams
     * (1,022 doctors / 4,353 patients, zero rows disagreeing).
     *
     * The count still moves, and that is the part ЗСҮТ must agree to:
     *   72 of 453 teams show a different doctor count;
     *   the site-wide doctor total falls 1,116 -> 1,022;
     *   patient counts do not move at all.
     */
    Rollback:
      "Re-apply production's current definition, captured in Stage 0 by " +
      "SELECT OBJECT_DEFINITION(OBJECT_ID('dbo.vwDoctorsTeamInfo')). Capture it BEFORE you overwrite it.",
    Verify: 'SELECT SUM(DoctorCount) AS Total FROM dbo.vwDoctorsTeamInfo',
    Expect: null,
    IfSkipped:
      'Nothing breaks. Team doctor counts keep including deleted memberships, as they do today.',
  },
  // ── Phase 7 · production data fixes — each needs ЗСҮТ approval ────────────
  // These write to existing clinical/reference data rather than adding schema,
  // so none of them is part of the release. They are listed because the orphan
  // check would otherwise flag them, and because both are real and outstanding.
  {
    File: 'backfill_advice_level.sql',
    Phase: 7,
    Purpose:
      'Fills Advice.level (and the geography columns) from the organization of whoever wrote it. ' +
      'Every visibility rule filters level IN (1,2,3), so rows with NULL are invisible to every ' +
      'non-admin user.',
    Guard: 'new-ok',
    GuardAction: '', // guard fixed 2026-09-24 (runbook Stage 2.2)
    Bom: false,
    Creates: {},
    Needs: [],
    Idempotent: true,
    DestructiveOnRerun: false,
    Decision: true,
    // Measured on MnCardioNew 2026-09-23: 2,216 of 5,501 Advice rows have level NULL (40%).
    Rollback:
      'Capture the affected Id/level pairs into a table BEFORE running, and UPDATE them back. ' +
      'There is no other way back — this overwrites live data.',
    Verify: 'SELECT COUNT(*) AS StillNull FROM Advice WHERE level IS NULL',
    Expect: 0,
    IfSkipped: '40% of the advice archive stays invisible to non-admin users, exactly as today.',
  },
  {
    File: 'fix_hfambulance_organization_id.sql',
    Phase: 7,
    Purpose: "Fills HfAmbulance.organization_id from the creating user's doctor profile.",
    Guard: 'new-ok',
    GuardAction: '', // guard fixed 2026-09-24 (runbook Stage 2.2)
    Bom: false,
    Creates: {},
    Needs: [],
    Idempotent: true,
    DestructiveOnRerun: false,
    Decision: true,
    // Measured on MnCardioNew 2026-09-23: 142 of 434 rows have organization_id NULL.
    Rollback: 'Capture the affected Id/organization_id pairs first, then UPDATE them back.',
    Verify: 'SELECT COUNT(*) AS StillNull FROM HfAmbulance WHERE organization_id IS NULL',
    Expect: 0,
    IfSkipped: '142 ambulance records stay unattributed to an organisation, exactly as today.',
  },
];

/**
 * Scripts that must NOT be applied to production, and why.
 *
 * Nine carry the test-only guard on purpose. Their headers say so in terms, and
 * the guard is the control doing its job. Widening any of them would put
 * unapproved clinical wording into a live national EMR.
 */
const DEFERRED = [
  {
    File: 'seed_dico_rehab.sql',
    BlockedOn: 'ЗСҮТ approval — header: "DRAFTED BY ITSYSTEM. NOT APPROVED BY ЗСҮТ."',
  },
  { File: 'seed_dico_consent_purpose.sql', BlockedOn: 'ЗСҮТ approval — same header.' },
  { File: 'seed_patient_reminder_dico.sql', BlockedOn: 'ЗСҮТ approval — same header.' },
  {
    File: 'seed_dico_remotevisit_status.sql',
    BlockedOn:
      'ЗСҮТ approval — header warns the three-database allowlist would let unapproved wording reach a restored production copy.',
  },
  {
    File: 'seed_consent_document_placeholder.sql',
    BlockedOn:
      'ЗСҮТ approval — header: "a placeholder consent document on a live system is a consent record that proves nothing."',
  },
  {
    File: 'seed_rehab_exercise_catalogue.sql',
    BlockedOn: 'ЗСҮТ approval — 39 placeholder rows, content not real.',
  },
  { File: 'seed_rehab_programs_draft.sql', BlockedOn: 'ЗСҮТ approval — draft programme content.' },
  {
    File: 'seed_rehab_demo_movements_0917.sql',
    BlockedOn: 'Test-environment only — the clips live in the test file store.',
  },
  {
    File: 'set_mobile_apk_download_url.sql',
    BlockedOn:
      'Points at mncardio.itsystem.mn and version 0.1.0. Production needs a different value, and that value does not exist yet.',
  },
];

/**
 * Already applied to production. Verified absent from the schema_diff gap on
 * 2026-09-23. Listed so nobody re-runs them looking for something to do.
 */
const ALREADY_ON_PRODUCTION = [
  'add_rehabilitation_tables.sql',
  'add_consent_tables.sql',
  'add_token_revocation.sql',
  'add_login_attempt_tracking.sql',
  'add_push_device_tokens.sql',
  'add_patient_reminders.sql',
  'add_confidentiality_flag.sql',
  'add_document_signature.sql',
  'add_access_audit.sql',
  'add_doctor_licence_code.sql',
  'add_notification_patient_recipient.sql',
  'add_remotevisit_booking_columns.sql',
  'add_remotevisit_meeting_url.sql',
  'add_organization_merge_columns.sql',
  // Both verified present on MnCardioNew 2026-09-23. Note that spFullBackup EXISTS
  // as a procedure but nothing invokes it: SQL Agent is disabled and there are no
  // crontabs. Audit MNC-BACKUP-007 said it was "deployed nowhere" — it is deployed
  // and unscheduled, which is a different problem with the same symptom.
  'spFullBackup.sql',
  // schema_diff reports 0 procedures differing, so production's spCVDInspectionReport
  // and spCVDMonitoringReport already match the fixed bodies.
  'fix_report_ordering.sql',
];

/**
 * Applicable in principle, but a no-op on THIS cutover — verified against
 * MnCardioNew on 2026-09-23. Listed so the orphan check stays clean and nobody
 * spends time on them.
 */
const NOT_NEEDED = [
  {
    File: 'backfill_remotevisit_historical_status.sql',
    Why: 'RemoteVisit holds 2 rows on production and neither has a blank Status. Nothing to backfill.',
  },
  {
    File: 'backfill_tenderformdata_organization.sql',
    Why:
      'TenderFormData does not exist on production yet and will be created empty in Phase 1, so ' +
      'there are no rows carrying a NULL OrganizationId. The bug it repairs (org lives on ' +
      'DoctorsProfile, not Users) was fixed in code before any production row could be written.',
  },
];

/**
 * Superseded by something else in this manifest. Kept on disk because it is
 * still the right thing to run against a fresh test database, but it must not
 * be applied to production.
 */
const SUPERSEDED = [
  {
    File: 'create_vwDoctorsTeamInfo.sql',
    By: 'fix_vwDoctorsTeamInfo_exclude_deleted.sql',
    Why:
      'Correct result, wrong query shape for production. It replaces grouped joins with two ' +
      'correlated subqueries per team row and discards the definition production already runs.',
  },
];

/** Read-only queries and rollback scripts. Never part of a cutover. */
const NEVER_APPLY = [
  'find_duplicate_user_emails.sql',
  'report_risk_scores_pre_gender_fix.sql',
  'tailan_export_ih_uul.sql',
  'rollback_original_procs.sql',
];

module.exports = {
  ENTRIES,
  DEFERRED,
  ALREADY_ON_PRODUCTION,
  NOT_NEEDED,
  SUPERSEDED,
  NEVER_APPLY,
};
