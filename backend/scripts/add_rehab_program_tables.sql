-- Rehabilitation exercise PLAYER (mobile tender 2.7 / §4 "Дасгал хөдөлгөөн").
--
-- Builds on add_rehabilitation_tables.sql, which must already have run. That
-- script gave a flat catalogue (RehabExercise) plus vitals, progress and
-- assessments. This one adds what a guided, personalised session needs:
--
--   RehabProgram       one per disease group (Зүрхний шигдээс, дутагдал, суулгац,
--                      мэс засал, Тархины харвалт)
--   RehabProgramBlock  the ordered parts of a day: warm-up, walking, strength...
--                      with minutes that step up by programme day
--   RehabMovement      one looping clip inside an exercise - an exercise is a
--                      playlist of movements (0917.mp4 held about eight)
--   RehabPlan          a doctor assigns a programme to a patient
--   RehabSession       one workout the patient actually did or stopped
--
-- Design decisions picked by the user on 2026-09-17 (options page): CR10
-- exertion scale, 9:16 loops, per-movement prep time, symptom checklist on stop.
--
-- The programme CONTENT (durations, day bands, which blocks) is clinical and is
-- NOT seeded here - see seed_rehab_programs_draft.sql, which is test-only.
--
-- Newer table generation (CLAUDE.md §5): PK [Id], PascalCase, CreateDate /
-- CreateUserId. Patients keyed by [PatRegNo], like the other Rehab* tables.
--
-- Safe to re-run. Run with: node scripts/run_sql.js --db <database> <this file>

-- ---------------------------------------------------------------------------
-- RehabProgram
-- ---------------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'RehabProgram')
BEGIN
    CREATE TABLE [RehabProgram] (
        [Id]                  INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [Code]                NVARCHAR(50)  NOT NULL,   -- MI, HF, DEVICE, SURGERY, STROKE
        [Name]                NVARCHAR(255) NULL,
        [Description]         NVARCHAR(MAX) NULL,
        -- The target heart rate formula applies (the xlsx gives it for the four
        -- cardiac groups, not for stroke).
        [HasHrTarget]         BIT NOT NULL CONSTRAINT [DF_RehabProgram_HasHrTarget] DEFAULT (1),
        [DefaultIntensityPct] DECIMAL(5,2) NULL,        -- 30.00 in the xlsx
        -- Shown before a session. {target} is replaced with the patient's number.
        [WarningTemplate]     NVARCHAR(MAX) NULL,
        [OrderNo]             INT NULL,
        [IsActive]            BIT NOT NULL CONSTRAINT [DF_RehabProgram_IsActive] DEFAULT (1),
        [CreateDate]          DATETIME NULL,
        [CreateUserId]        INT NULL
    );

    CREATE UNIQUE INDEX [UX_RehabProgram_Code] ON [RehabProgram] ([Code]);
END
GO

-- ---------------------------------------------------------------------------
-- RehabProgramBlock
--
-- Kind:
--   'video'   plays RehabExercise [ExerciseId], movement by movement
--   'timed'   walking / cycling / stairs - a timer with heart rate check-ins
--   'vitals'  measure BP / pulse / SpO2 / sugar (the stroke programme)
--   'image'   a still guide, e.g. HF "Амьсгал намжаах байрлал"
--
-- DurationSteps is the day-band table as JSON, e.g.
--   [{"fromDay":1,"toDay":7,"min":10},{"fromDay":8,"toDay":14,"min":15},
--    {"fromDay":15,"toDay":21,"min":20},{"fromDay":22,"min":30}]
-- Day bands are 1-7 / 8-14 / 15-21 / 22+ (user decision 2026-09-17; the xlsx
-- wording overlaps on days 7, 14 and 21). A block with neither DurationSteps nor
-- DurationSec lasts as long as its movements do.
-- ---------------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'RehabProgramBlock')
BEGIN
    CREATE TABLE [RehabProgramBlock] (
        [Id]              INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [ProgramId]       INT NOT NULL,
        [OrderNo]         INT NULL,
        [Title]           NVARCHAR(255) NULL,
        [Kind]            NVARCHAR(20)  NOT NULL CONSTRAINT [DF_RehabProgramBlock_Kind] DEFAULT ('video'),
        [ExerciseId]      INT NULL,
        [DurationSec]     INT NULL,
        [DurationSteps]   NVARCHAR(MAX) NULL,
        [ShowFromDay]     INT NULL,             -- stairs: 22
        [CheckInEverySec] INT NULL,             -- 120 for walking / cycling / stairs
        [GuideText]       NVARCHAR(MAX) NULL,
        [ThumbRef]        NVARCHAR(255) NULL,   -- MediaRef scheme; falls back to the first movement's
        [IsActive]        BIT NOT NULL CONSTRAINT [DF_RehabProgramBlock_IsActive] DEFAULT (1),
        [CreateDate]      DATETIME NULL,
        [CreateUserId]    INT NULL,
        CONSTRAINT [FK_RehabProgramBlock_Program] FOREIGN KEY ([ProgramId]) REFERENCES [RehabProgram] ([Id]),
        CONSTRAINT [CK_RehabProgramBlock_Kind] CHECK ([Kind] IN ('video', 'timed', 'vitals', 'image')),
        CONSTRAINT [CK_RehabProgramBlock_Steps] CHECK ([DurationSteps] IS NULL OR ISJSON([DurationSteps]) = 1)
    );

    CREATE INDEX [IX_RehabProgramBlock_Program] ON [RehabProgramBlock] ([ProgramId], [OrderNo]);
END
GO

-- ---------------------------------------------------------------------------
-- RehabMovement - one looping clip.
--
-- Timed (WorkSec) or counted (Reps), set per movement. PrepSec is the
-- "Дараагийн дасгал" preview before it, never below 10 (enforced in the API).
-- LoopStartMs / LoopEndMs let an uncut recording serve as a demo: the player
-- loops that segment of MediaRef instead of the whole file.
-- ---------------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'RehabMovement')
BEGIN
    CREATE TABLE [RehabMovement] (
        [Id]           INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [ExerciseId]   INT NOT NULL,
        [OrderNo]      INT NULL,
        [Name]         NVARCHAR(255) NULL,
        [GuideText]    NVARCHAR(MAX) NULL,   -- one step per line
        [MediaRef]     NVARCHAR(255) NULL,   -- the loop
        [ThumbRef]     NVARCHAR(255) NULL,   -- a still for lists and the home tab
        [WorkSec]      INT NULL,
        [Reps]         INT NULL,
        [PrepSec]      INT NOT NULL CONSTRAINT [DF_RehabMovement_PrepSec] DEFAULT (10),
        [RestSec]      INT NULL,
        [LoopStartMs]  INT NULL,
        [LoopEndMs]    INT NULL,
        [IsActive]     BIT NOT NULL CONSTRAINT [DF_RehabMovement_IsActive] DEFAULT (1),
        [CreateDate]   DATETIME NULL,
        [CreateUserId] INT NULL,
        CONSTRAINT [FK_RehabMovement_Exercise] FOREIGN KEY ([ExerciseId]) REFERENCES [RehabExercise] ([Id])
    );

    CREATE INDEX [IX_RehabMovement_Exercise] ON [RehabMovement] ([ExerciseId], [OrderNo]);
END
GO

-- ---------------------------------------------------------------------------
-- RehabPlan - a doctor assigns a programme. One active plan per patient is
-- enforced in the API (an assignment ends the previous one), not here, so that
-- history survives.
--
-- MaxHrOverride exists because 220 - age overstates maximum heart rate for
-- patients on beta-blockers. When to use it is a clinical question for ЗСҮТ.
-- ---------------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'RehabPlan')
BEGIN
    CREATE TABLE [RehabPlan] (
        [Id]               INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [PatRegNo]         NVARCHAR(20) NOT NULL,
        [ProgramId]        INT NOT NULL,
        [StartDate]        DATE NOT NULL,
        [IntensityPct]     DECIMAL(5,2) NULL,   -- NULL = the programme default
        [MaxHrOverride]    INT NULL,
        [Status]           NVARCHAR(20) NOT NULL CONSTRAINT [DF_RehabPlan_Status] DEFAULT ('active'),
        [Notes]            NVARCHAR(MAX) NULL,
        [EndedAt]          DATETIME NULL,
        [CreateDate]       DATETIME NULL,
        [CreateUserId]     INT NULL,
        CONSTRAINT [FK_RehabPlan_Program] FOREIGN KEY ([ProgramId]) REFERENCES [RehabProgram] ([Id]),
        CONSTRAINT [CK_RehabPlan_Status] CHECK ([Status] IN ('active', 'paused', 'ended'))
    );

    CREATE INDEX [IX_RehabPlan_PatRegNo] ON [RehabPlan] ([PatRegNo], [Status]);
END
GO

-- ---------------------------------------------------------------------------
-- RehabSession - one workout.
--
-- MaxHr / TargetHr are stored as computed at the start, so a later change to
-- the plan never rewrites what the patient was told that day.
-- StopReason is JSON: {"symptoms":["chest_pain","dizzy"],"note":"..."}.
-- ---------------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'RehabSession')
BEGIN
    CREATE TABLE [RehabSession] (
        [Id]               INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [PatRegNo]         NVARCHAR(20) NOT NULL,
        [PlanId]           INT NULL,            -- NULL = a single exercise tried outside a plan
        [DayNo]            INT NULL,
        [StartedAt]        DATETIME NOT NULL,
        [EndedAt]          DATETIME NULL,
        [RestingHr]        INT NULL,
        [MaxHr]            INT NULL,
        [TargetHr]         INT NULL,
        [Status]           NVARCHAR(20) NOT NULL CONSTRAINT [DF_RehabSession_Status] DEFAULT ('started'),
        [StopReason]       NVARCHAR(MAX) NULL,
        [DurationSec]      INT NULL,
        [CompletedBlocks]  INT NULL,
        [SkippedMovements] INT NULL,
        [CreateDate]       DATETIME NULL,
        CONSTRAINT [FK_RehabSession_Plan] FOREIGN KEY ([PlanId]) REFERENCES [RehabPlan] ([Id]),
        CONSTRAINT [CK_RehabSession_Status] CHECK ([Status] IN ('started', 'completed', 'stopped', 'abandoned')),
        CONSTRAINT [CK_RehabSession_StopReason] CHECK ([StopReason] IS NULL OR ISJSON([StopReason]) = 1)
    );

    CREATE INDEX [IX_RehabSession_PatRegNo] ON [RehabSession] ([PatRegNo], [StartedAt] DESC);
END
GO

-- ---------------------------------------------------------------------------
-- Existing tables: tie readings and completions to a session, and record which
-- exertion scale a reading used. Every existing row was entered on the vitals
-- tab's 6-20 slider, so NULL reads as '6-20'; the player writes 'CR10'.
-- ---------------------------------------------------------------------------
IF COL_LENGTH('RehabVitalSign', 'SessionId') IS NULL
    ALTER TABLE [RehabVitalSign] ADD [SessionId] INT NULL;
GO
IF COL_LENGTH('RehabVitalSign', 'BorgScale') IS NULL
    ALTER TABLE [RehabVitalSign] ADD [BorgScale] NVARCHAR(10) NULL;
GO
-- Seconds into the session; also the idempotency key for check-ins the app
-- queued offline and resends when it finishes.
IF COL_LENGTH('RehabVitalSign', 'AtSec') IS NULL
    ALTER TABLE [RehabVitalSign] ADD [AtSec] INT NULL;
GO
IF COL_LENGTH('RehabProgress', 'SessionId') IS NULL
    ALTER TABLE [RehabProgress] ADD [SessionId] INT NULL;
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_RehabVitalSign_Session')
    CREATE INDEX [IX_RehabVitalSign_Session] ON [RehabVitalSign] ([SessionId], [AtSec]);
GO
