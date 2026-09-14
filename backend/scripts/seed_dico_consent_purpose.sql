-- =============================================================================
-- consent_purpose - what a patient is being asked to consent TO (tracker 23)
--
-- DRAFTED BY ITSYSTEM. NOT APPROVED BY ЗСҮТ. And unlike the other draft
-- dictionaries in this folder, this one is not merely wording: a consent
-- purpose is a LEGAL CATEGORY. Getting the list wrong means asking people to
-- agree to the wrong things, so treat these four as a starting point for the
-- conversation rather than a proposal to rubber-stamp.
--
-- The tender's own phrase is consent for "non-treatment use of personal data",
-- which is a category rather than a list - hence a draft.
--
-- NOTE WHAT IS DELIBERATELY ABSENT: there is no purpose for treatment itself.
-- Care is not consented to through this mechanism, and offering a toggle that
-- looked like it might switch off a patient's own treatment would be worse than
-- offering nothing.
--
-- Each purpose still needs a ConsentDocument row carrying the actual Mongolian
-- legal text before the app can ask anybody - the dico names the purpose, the
-- document is what they read. ЗСҮТ supply that text; it is an INSERT, not a
-- deployment.
--
-- MnCardio_test only.
-- =============================================================================

SET NOCOUNT ON;

DECLARE @db sysname = DB_NAME();
IF @db <> 'MnCardio_test'
BEGIN
    RAISERROR('Refusing to run: unapproved draft wording, MnCardio_test only. Got "%s".', 16, 1, @db);
    SET NOEXEC ON;
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico = 'consent_purpose')
    INSERT INTO dbo.DicoType (dico, Name, Description)
    VALUES ('consent_purpose', N'Зөвшөөрлийн зорилго',
            N'Mobile tender - consent for non-treatment use of personal data. DRAFT, awaiting ЗСҮТ approval.');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.OptionTypes WHERE dico = 'consent_purpose' AND value = 'research')
    INSERT INTO dbo.OptionTypes (dico, label, value, pos, translate_flag)
    VALUES ('consent_purpose', N'Судалгаа шинжилгээний зорилгоор ашиглах', 'research', 1, 0);

IF NOT EXISTS (SELECT 1 FROM dbo.OptionTypes WHERE dico = 'consent_purpose' AND value = 'statistics')
    INSERT INTO dbo.OptionTypes (dico, label, value, pos, translate_flag)
    VALUES ('consent_purpose', N'Нэргүйчилсэн статистикт ашиглах', 'statistics', 2, 0);

IF NOT EXISTS (SELECT 1 FROM dbo.OptionTypes WHERE dico = 'consent_purpose' AND value = 'education')
    INSERT INTO dbo.OptionTypes (dico, label, value, pos, translate_flag)
    VALUES ('consent_purpose', N'Сургалт, эмнэлзүйн тохиолдлын хэлэлцүүлэгт ашиглах', 'education', 3, 0);

IF NOT EXISTS (SELECT 1 FROM dbo.OptionTypes WHERE dico = 'consent_purpose' AND value = 'contact')
    INSERT INTO dbo.OptionTypes (dico, label, value, pos, translate_flag)
    VALUES ('consent_purpose', N'Судалгаанд оролцох урилга хүлээн авах', 'contact', 4, 0);
GO

SELECT dico, value, label, pos FROM dbo.OptionTypes WHERE dico = 'consent_purpose' ORDER BY pos;
GO
