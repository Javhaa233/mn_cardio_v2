-- =============================================================================
-- patient_reminder_type / patient_reminder_freq
--
-- DRAFTED BY ITSYSTEM. NOT APPROVED BY ЗСҮТ.
--
-- The tender names three reminder kinds - medication, exercise, follow-up
-- appointments - so those three are not invented. `measurement` is, and is the
-- one entry here most likely to be struck out: it covers "take your blood
-- pressure", which the daily journal already asks for. Flag it when the list
-- goes for approval rather than letting it quietly become a feature.
--
-- As everywhere else, code compares the VALUE and the customer owns the LABEL,
-- served through GET /api/patient/options/:dico. Approval is an UPDATE, not a
-- release.
--
-- MnCardio_test only - see seed_dico_remotevisit_status.sql for why the guard
-- here is narrower than the other scripts in this folder.
-- =============================================================================

SET NOCOUNT ON;

DECLARE @db sysname = DB_NAME();
IF @db <> 'MnCardio_test'
BEGIN
    RAISERROR('Refusing to run: unapproved draft wording, MnCardio_test only. Got "%s".', 16, 1, @db);
    SET NOEXEC ON;
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico = 'patient_reminder_type')
    INSERT INTO dbo.DicoType (dico, Name, Description)
    VALUES ('patient_reminder_type', N'Сануулгын төрөл',
            N'Mobile tender - patient-configurable reminders. DRAFT, awaiting ЗСҮТ approval.');

IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico = 'patient_reminder_freq')
    INSERT INTO dbo.DicoType (dico, Name, Description)
    VALUES ('patient_reminder_freq', N'Сануулгын давтамж',
            N'Mobile tender - reminder frequency. DRAFT, awaiting ЗСҮТ approval.');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.OptionTypes WHERE dico = 'patient_reminder_type' AND value = 'medication')
    INSERT INTO dbo.OptionTypes (dico, label, value, pos, translate_flag)
    VALUES ('patient_reminder_type', N'Эм уух сануулга', 'medication', 1, 0);

IF NOT EXISTS (SELECT 1 FROM dbo.OptionTypes WHERE dico = 'patient_reminder_type' AND value = 'exercise')
    INSERT INTO dbo.OptionTypes (dico, label, value, pos, translate_flag)
    VALUES ('patient_reminder_type', N'Дасгал хөдөлгөөний сануулга', 'exercise', 2, 0);

IF NOT EXISTS (SELECT 1 FROM dbo.OptionTypes WHERE dico = 'patient_reminder_type' AND value = 'followup')
    INSERT INTO dbo.OptionTypes (dico, label, value, pos, translate_flag)
    VALUES ('patient_reminder_type', N'Дахин үзлэгийн сануулга', 'followup', 3, 0);

IF NOT EXISTS (SELECT 1 FROM dbo.OptionTypes WHERE dico = 'patient_reminder_type' AND value = 'measurement')
    INSERT INTO dbo.OptionTypes (dico, label, value, pos, translate_flag)
    VALUES ('patient_reminder_type', N'Хэмжилт хийх сануулга', 'measurement', 4, 0);
GO

IF NOT EXISTS (SELECT 1 FROM dbo.OptionTypes WHERE dico = 'patient_reminder_freq' AND value = 'daily')
    INSERT INTO dbo.OptionTypes (dico, label, value, pos, translate_flag)
    VALUES ('patient_reminder_freq', N'Өдөр бүр', 'daily', 1, 0);

IF NOT EXISTS (SELECT 1 FROM dbo.OptionTypes WHERE dico = 'patient_reminder_freq' AND value = 'weekly')
    INSERT INTO dbo.OptionTypes (dico, label, value, pos, translate_flag)
    VALUES ('patient_reminder_freq', N'7 хоног бүр', 'weekly', 2, 0);

IF NOT EXISTS (SELECT 1 FROM dbo.OptionTypes WHERE dico = 'patient_reminder_freq' AND value = 'once')
    INSERT INTO dbo.OptionTypes (dico, label, value, pos, translate_flag)
    VALUES ('patient_reminder_freq', N'Нэг удаа', 'once', 3, 0);
GO

SELECT dico, value, label, pos
  FROM dbo.OptionTypes
 WHERE dico IN ('patient_reminder_type', 'patient_reminder_freq')
 ORDER BY dico, pos;
GO
