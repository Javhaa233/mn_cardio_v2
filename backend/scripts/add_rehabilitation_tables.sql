-- Rehabilitation module (mobile tender §4, patient module 2.7 "Сэргээн засах,
-- дасгал хөдөлгөөн"; tracker rows #50, #51, #52, #56).
--
-- Nothing for this module exists in the database today. These four tables cover
-- the parts that are buildable now; the 39 exercise videos themselves are
-- blocked on tracker #54 (ЗСҮТ supply the rehabilitation doctors) and on a
-- video delivery path, which the current file layer cannot provide.
--
-- Conventions follow the newer table generation (CLAUDE.md §5): PK [Id],
-- PascalCase columns, CreateDate / CreateUserId bookkeeping. Patients are keyed
-- by [PatRegNo] to match CVDMonitoring, PatientBodySize and PatientOwnHistory —
-- the same registration number the ДАН login will assert.
--
-- Safe to re-run.

-- ---------------------------------------------------------------------------
-- RehabExercise — the exercise catalogue (the 39 instruction videos).
-- Content rows are seeded by the customer, not by code.
-- ---------------------------------------------------------------------------
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'RehabExercise'
)
BEGIN
    CREATE TABLE [RehabExercise] (
        [Id]            INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [Code]          NVARCHAR(50)  NULL,   -- stable reference, e.g. 'EX-01'
        [Name]          NVARCHAR(255) NULL,
        [Description]   NVARCHAR(MAX) NULL,
        [CategoryCode]  NVARCHAR(50)  NULL,   -- dico code in OptionTypes
        [DurationSec]   INT           NULL,
        [OrderNo]       INT           NULL,   -- display order within a category
        -- Points at the File table's generated_name once a delivery path exists.
        -- Deliberately not a hard FK: the videos may end up in object storage.
        [MediaRef]      NVARCHAR(255) NULL,
        [IsActive]      BIT NOT NULL CONSTRAINT [DF_RehabExercise_IsActive] DEFAULT (1),
        [CreateDate]    DATETIME NULL,
        [CreateUserId]  INT NULL
    );
END
GO

-- ---------------------------------------------------------------------------
-- RehabAssessment — tracker #50: risk assessment and the "physical capacity
-- under load" (exercise tolerance) assessment.
--
-- The scoring method is NOT decided here. The tender names neither an
-- instrument nor a scale, and the equivalent decision for the ЗСӨ risk score is
-- an explicit ЗСҮТ deliverable (tracker #38). RiskLevel and ToleranceScore are
-- therefore free-form until a methodology is approved.
-- ---------------------------------------------------------------------------
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'RehabAssessment'
)
BEGIN
    CREATE TABLE [RehabAssessment] (
        [Id]              INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [PatRegNo]        NVARCHAR(20) NULL,
        [AssessmentDate]  DATETIME NULL,
        [RiskLevel]       NVARCHAR(50)  NULL,  -- dico code once approved
        [ToleranceScore]  DECIMAL(9,2)  NULL,
        [ToleranceUnit]   NVARCHAR(20)  NULL,  -- e.g. METs, metres, minutes
        [Notes]           NVARCHAR(MAX) NULL,
        [CreateDate]      DATETIME NULL,
        [CreateUserId]    INT NULL
    );

    CREATE INDEX [IX_RehabAssessment_PatRegNo]
        ON [RehabAssessment] ([PatRegNo], [AssessmentDate] DESC);
END
GO

-- ---------------------------------------------------------------------------
-- RehabVitalSign — tracker #51: vital signs recorded around exercise.
-- Acceptance is "Үзүүлэлт бүртгэгдэж график гарна" — a chart — hence the
-- index on (PatRegNo, MeasuredAt).
--
-- Distinct from PatientMonitoring, which is the patient's own daily log (2.2).
-- These are tied to a session and a phase (before / after exertion).
-- ---------------------------------------------------------------------------
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'RehabVitalSign'
)
BEGIN
    CREATE TABLE [RehabVitalSign] (
        [Id]            INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [PatRegNo]      NVARCHAR(20) NULL,
        [ExerciseId]    INT NULL,
        [MeasuredAt]    DATETIME NULL,
        [Phase]         NVARCHAR(20)  NULL,  -- before / after
        [Pulse]         INT NULL,
        [BloodPressure] NVARCHAR(20)  NULL,
        [Spo2]          INT NULL,
        [Borg]          INT NULL,            -- perceived exertion, if adopted
        [Notes]         NVARCHAR(MAX) NULL,
        [CreateDate]    DATETIME NULL,
        [CreateUserId]  INT NULL
    );

    CREATE INDEX [IX_RehabVitalSign_PatRegNo]
        ON [RehabVitalSign] ([PatRegNo], [MeasuredAt] DESC);
END
GO

-- ---------------------------------------------------------------------------
-- RehabProgress — tracker #56: "Дасгал үзэх, гүйцэтгэлээ тэмдэглэх" — the
-- patient watches an exercise and marks their own completion.
-- ---------------------------------------------------------------------------
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'RehabProgress'
)
BEGIN
    CREATE TABLE [RehabProgress] (
        [Id]           INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [PatRegNo]     NVARCHAR(20) NULL,
        [ExerciseId]   INT NULL,
        [CompletedAt]  DATETIME NULL,
        [DurationSec]  INT NULL,
        [Notes]        NVARCHAR(MAX) NULL,
        [CreateDate]   DATETIME NULL,
        [CreateUserId] INT NULL
    );

    CREATE INDEX [IX_RehabProgress_PatRegNo]
        ON [RehabProgress] ([PatRegNo], [CompletedAt] DESC);
END
GO

-- ---------------------------------------------------------------------------
-- Option lists still needed (DB work, per CLAUDE.md §4 — raise with ЗСҮТ):
--
--   dico 'rehab_category'  : exercise categories for RehabExercise.CategoryCode
--   dico 'rehab_risk'      : risk levels for RehabAssessment.RiskLevel
--   dico 'rehab_phase'     : before / after for RehabVitalSign.Phase
--
-- Each needs its OptionTypes rows plus a DicoType row describing it. Until they
-- exist the corresponding controls fall back to free text.
-- ---------------------------------------------------------------------------
