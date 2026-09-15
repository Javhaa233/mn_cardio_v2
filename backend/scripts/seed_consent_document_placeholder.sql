-- ConsentDocument — PLACEHOLDER text, one row per consent purpose.
--
-- READ THIS BEFORE RUNNING IT ANYWHERE.
--
-- The real wording is a ЗСҮТ legal deliverable. It is not drafted, and drafting
-- it here would be worse than leaving it empty: a consent document is the thing
-- a patient actually agrees to, and inventing its text means capturing
-- agreements to wording nobody approved.
--
-- So every row below says, in Mongolian, that it is a placeholder and must not
-- be shown to a patient. That is the same approach the 39 rehabilitation
-- exercises took (seed_rehab_exercise_catalogue.sql) and for the same reason:
-- without a row, /api/patient/consents and
-- POST /api/doctor/patients/:id/consents both refuse with
-- CONSENT_DOC_NOT_FOUND, so the mobile developer cannot build or test the
-- screen at all. With a row clearly marked as a placeholder, they can build the
-- whole flow now, and replacing the text later is an INSERT of a new version —
-- never an edit, because ConsentDocument versions are what a captured consent
-- points back at.
--
-- Version is '0-draft' so that nothing can mistake it for approved text, and so
-- the first real version sorts after it.
--
-- MnCardio_test ONLY. Do not run this on production: a placeholder consent
-- document on a live system is a consent record that proves nothing.
--
-- Safe to re-run.

SET NOCOUNT ON;

DECLARE @db sysname = DB_NAME();
IF @db <> 'MnCardio_test'
BEGIN
    RAISERROR('Refusing to run: placeholder consent text, MnCardio_test only. Got "%s".', 16, 1, @db);
    SET NOEXEC ON;
END
GO

DECLARE @Warn NVARCHAR(MAX) = N'[ЗАГВАР ТЕКСТ — ЗСҮТ-ийн хуулийн хэлтэс батлаагүй. ' +
    N'Үйлчлүүлэгчид харуулахгүй. Энэ мөр нь мобайл аппын урсгалыг турших зориулалттай.]';

;WITH Seed([PurposeCode], [TitleMn]) AS (
    SELECT * FROM (VALUES
        ('research',   N'Судалгаа шинжилгээний зорилгоор ашиглах'),
        ('statistics', N'Нэргүйчилсэн статистикт ашиглах'),
        ('education',  N'Сургалт, эмнэлзүйн тохиолдлын хэлэлцүүлэгт ашиглах'),
        ('contact',    N'Судалгаанд оролцох урилга хүлээн авах')
    ) v([PurposeCode], [TitleMn])
)
INSERT INTO [ConsentDocument] ([PurposeCode], [Version], [TitleMn], [BodyMn], [IsActive], [EffectiveFrom], [CreateDate])
SELECT s.[PurposeCode], '0-draft', s.[TitleMn],
       @Warn + CHAR(13) + CHAR(10) + CHAR(13) + CHAR(10) + s.[TitleMn],
       1, GETDATE(), GETDATE()
  FROM Seed s
 WHERE NOT EXISTS (SELECT 1 FROM [ConsentDocument] d WHERE d.[PurposeCode] = s.[PurposeCode]);

PRINT 'ConsentDocument placeholders: ' + CAST(@@ROWCOUNT AS VARCHAR(10)) + ' row(s) added';
GO

SET NOEXEC OFF;
GO

SELECT [Id], [PurposeCode], [Version], [IsActive], [TitleMn] FROM [ConsentDocument] ORDER BY [Id];
GO
