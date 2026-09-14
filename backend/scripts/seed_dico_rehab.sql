-- =============================================================================
-- Rehabilitation option lists - mobile tender 2.7 Сэргээн засах, дасгал хөдөлгөөн
--
-- DRAFTED BY ITSYSTEM. NOT APPROVED BY ЗСҮТ.
--
-- add_rehabilitation_tables.sql names these three dico codes in its own header
-- but does not insert them, for the same reason the e-visit script does not
-- insert its status list: an option list is the customer's dictionary.
--
--   rehab_category  how the exercise catalogue is grouped in the app
--   rehab_risk      RehabAssessment.RiskLevel
--   rehab_phase     RehabVitalSign.Phase - before / during / after exercise
--
-- As everywhere else, the VALUES are what code compares and the LABELS are what
-- the customer owns. helper/DicoLabels.js fails soft to an empty map, so every
-- endpoint works identically before this script is run - it simply returns
-- CategoryLabel: null and the client falls back to the code.
--
-- NOTHING HERE SCORES ANYTHING. rehab_risk is three names for a value a
-- clinician types; the risk methodology is a ЗСҮТ deliverable (tracker 38) and
-- add_rehabilitation_tables.sql says so explicitly.
--
-- MnCardio_test only - see the guard note in seed_dico_remotevisit_status.sql.
-- =============================================================================

SET NOCOUNT ON;

DECLARE @db sysname = DB_NAME();
IF @db <> 'MnCardio_test'
BEGIN
    RAISERROR('Refusing to run: unapproved draft wording, MnCardio_test only. Got "%s".', 16, 1, @db);
    SET NOEXEC ON;
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico = 'rehab_category')
    INSERT INTO dbo.DicoType (dico, Name, Description)
    VALUES ('rehab_category', N'Дасгалын ангилал',
            N'Mobile tender 2.7 - exercise catalogue grouping. DRAFT, awaiting ЗСҮТ approval.');

IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico = 'rehab_risk')
    INSERT INTO dbo.DicoType (dico, Name, Description)
    VALUES ('rehab_risk', N'Сэргээн засахын эрсдэлийн түвшин',
            N'Mobile tender 2.7 - RehabAssessment.RiskLevel. DRAFT, awaiting ЗСҮТ approval.');

IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico = 'rehab_phase')
    INSERT INTO dbo.DicoType (dico, Name, Description)
    VALUES ('rehab_phase', N'Хэмжилт хийсэн үе',
            N'Mobile tender 2.7 - RehabVitalSign.Phase. DRAFT, awaiting ЗСҮТ approval.');
GO

-- ---------------------------------------------------------- rehab_category ---
IF NOT EXISTS (SELECT 1 FROM dbo.OptionTypes WHERE dico = 'rehab_category' AND value = 'warmup')
    INSERT INTO dbo.OptionTypes (dico, label, value, pos, translate_flag)
    VALUES ('rehab_category', N'Бэлтгэл дасгал', 'warmup', 1, 0);

IF NOT EXISTS (SELECT 1 FROM dbo.OptionTypes WHERE dico = 'rehab_category' AND value = 'aerobic')
    INSERT INTO dbo.OptionTypes (dico, label, value, pos, translate_flag)
    VALUES ('rehab_category', N'Аэроб дасгал', 'aerobic', 2, 0);

IF NOT EXISTS (SELECT 1 FROM dbo.OptionTypes WHERE dico = 'rehab_category' AND value = 'strength')
    INSERT INTO dbo.OptionTypes (dico, label, value, pos, translate_flag)
    VALUES ('rehab_category', N'Хүч чадлын дасгал', 'strength', 3, 0);

IF NOT EXISTS (SELECT 1 FROM dbo.OptionTypes WHERE dico = 'rehab_category' AND value = 'flexibility')
    INSERT INTO dbo.OptionTypes (dico, label, value, pos, translate_flag)
    VALUES ('rehab_category', N'Уян хатны дасгал', 'flexibility', 4, 0);

IF NOT EXISTS (SELECT 1 FROM dbo.OptionTypes WHERE dico = 'rehab_category' AND value = 'breathing')
    INSERT INTO dbo.OptionTypes (dico, label, value, pos, translate_flag)
    VALUES ('rehab_category', N'Амьсгалын дасгал', 'breathing', 5, 0);

IF NOT EXISTS (SELECT 1 FROM dbo.OptionTypes WHERE dico = 'rehab_category' AND value = 'cooldown')
    INSERT INTO dbo.OptionTypes (dico, label, value, pos, translate_flag)
    VALUES ('rehab_category', N'Тайвшруулах дасгал', 'cooldown', 6, 0);
GO

-- -------------------------------------------------------------- rehab_risk ---
IF NOT EXISTS (SELECT 1 FROM dbo.OptionTypes WHERE dico = 'rehab_risk' AND value = 'low')
    INSERT INTO dbo.OptionTypes (dico, label, value, pos, translate_flag)
    VALUES ('rehab_risk', N'Бага эрсдэл', 'low', 1, 0);

IF NOT EXISTS (SELECT 1 FROM dbo.OptionTypes WHERE dico = 'rehab_risk' AND value = 'moderate')
    INSERT INTO dbo.OptionTypes (dico, label, value, pos, translate_flag)
    VALUES ('rehab_risk', N'Дунд эрсдэл', 'moderate', 2, 0);

IF NOT EXISTS (SELECT 1 FROM dbo.OptionTypes WHERE dico = 'rehab_risk' AND value = 'high')
    INSERT INTO dbo.OptionTypes (dico, label, value, pos, translate_flag)
    VALUES ('rehab_risk', N'Өндөр эрсдэл', 'high', 3, 0);
GO

-- ------------------------------------------------------------- rehab_phase ---
IF NOT EXISTS (SELECT 1 FROM dbo.OptionTypes WHERE dico = 'rehab_phase' AND value = 'before')
    INSERT INTO dbo.OptionTypes (dico, label, value, pos, translate_flag)
    VALUES ('rehab_phase', N'Дасгалын өмнө', 'before', 1, 0);

IF NOT EXISTS (SELECT 1 FROM dbo.OptionTypes WHERE dico = 'rehab_phase' AND value = 'during')
    INSERT INTO dbo.OptionTypes (dico, label, value, pos, translate_flag)
    VALUES ('rehab_phase', N'Дасгалын үед', 'during', 2, 0);

IF NOT EXISTS (SELECT 1 FROM dbo.OptionTypes WHERE dico = 'rehab_phase' AND value = 'after')
    INSERT INTO dbo.OptionTypes (dico, label, value, pos, translate_flag)
    VALUES ('rehab_phase', N'Дасгалын дараа', 'after', 3, 0);
GO

SELECT dico, value, label, pos
  FROM dbo.OptionTypes
 WHERE dico IN ('rehab_category', 'rehab_risk', 'rehab_phase')
 ORDER BY dico, pos;
GO
