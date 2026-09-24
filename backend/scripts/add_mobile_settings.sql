-- MobileSetting — configuration the mobile apps read at launch.
--
-- Mobile tender §2.1 "Автоматаар шинэчлэгдэх" and §1.3 (terms of service,
-- support contact). Two things depend on this table:
--
--   GET /api/mobile/version  — the forced-update gate. The stores update an app
--                              on their own schedule, but when an API changes
--                              there has to be a way to stop an old build
--                              talking to the server. minSupportedBuild is that
--                              switch, and it must be changeable without a
--                              deploy — which is why it is a row, not a
--                              constant.
--   GET /api/mobile/config   — terms text, its version, support phone.
--
-- A KEY-VALUE TABLE ON PURPOSE. The alternative is a column per setting and a
-- DDL request to ЗСҮТ every time the app needs one more. The repo owns no
-- migrations (CLAUDE.md §2), so each such request is a hand-written script and
-- a wait; a row is neither. The values here are operational settings, not
-- clinical data, so the usual argument for a typed schema does not apply.
--
-- Registered in ModelConfigs/MobileSettingConfig.js, which gives the admin web
-- list / create / update / Excel export through /api/BaseObject with no
-- controller at all.
--
-- Newer table generation (CLAUDE.md §5): [Id] PK, PascalCase columns.
-- [Key] is a reserved word in T-SQL and is bracketed everywhere.
--
-- Safe to re-run.

DECLARE @db sysname = DB_NAME();
IF @db NOT IN ('MnCardio_restored', 'MnCardioNew', 'MnCardio_test')
BEGIN
    RAISERROR('Refusing to run: unexpected database "%s".', 16, 1, @db);
    SET NOEXEC ON;
END
GO

IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'MobileSetting'
)
BEGIN
    CREATE TABLE [MobileSetting] (
        [Id]           INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [Key]          NVARCHAR(60)  NOT NULL,
        [Value]        NVARCHAR(MAX) NULL,
        -- What this setting is for, shown in the admin grid so a settings
        -- screen does not become a list of names nobody dares change.
        [Description]  NVARCHAR(500) NULL,
        [UpdateDate]   DATETIME NULL,
        [UpdateUserId] INT NULL,
        CONSTRAINT [UQ_MobileSetting_Key] UNIQUE ([Key])
    );
    PRINT 'MobileSetting created';
END
ELSE
    PRINT 'MobileSetting already exists';
GO

-- ---------------------------------------------------------------------------
-- Seed. Inserted only when absent, so re-running never overwrites a value the
-- customer has since changed.
--
-- THE UPDATE GATE IS SEEDED OFF. minSupportedBuild is 0, which passes every
-- build in the field. Seeding it to a real number here would lock out every
-- installed copy of the app the moment this script ran, before anyone had
-- published a newer one. Raising it is a deliberate act, taken when a breaking
-- API change actually ships.
-- ---------------------------------------------------------------------------
;WITH Seed([Key], [Value], [Description]) AS (
    SELECT * FROM (VALUES
        ('latestVersion',     '1.0.0', N'Дэлгүүрт байгаа хамгийн сүүлийн хувилбар'),
        ('latestBuild',       '1',     N'Хамгийн сүүлийн build дугаар'),
        ('minSupportedBuild', '0',     N'Үүнээс доош build-тэй апп холбогдохгүй. 0 = хязгаарлахгүй'),
        ('storeUrlAndroid',   '',      N'Google Play холбоос'),
        ('storeUrlIos',       '',      N'App Store холбоос'),
        ('releaseNotes',      '',      N'Шинэчлэлтийн тайлбар'),
        ('forceUpdate',       '0',     N'1 бол хувилбар хуучирсан үед заавал шинэчлүүлнэ'),
        ('termsText',         '',      N'Үйлчилгээний нөхцөлийн текст — ЗСҮТ-ийн хуулийн хэлтэс батална'),
        ('termsVersion',      '0',     N'Нөхцөлийн хувилбар. Өөрчлөгдвөл дахин зөвшөөрөл авна'),
        ('supportPhone',      '',      N'Дэмжлэгийн утасны дугаар')
    ) v([Key], [Value], [Description])
)
INSERT INTO [MobileSetting] ([Key], [Value], [Description], [UpdateDate])
SELECT s.[Key], s.[Value], s.[Description], GETDATE()
  FROM Seed s
 WHERE NOT EXISTS (SELECT 1 FROM [MobileSetting] m WHERE m.[Key] = s.[Key]);

PRINT 'MobileSetting seed: ' + CAST(@@ROWCOUNT AS VARCHAR(10)) + ' row(s) added';
GO

SET NOEXEC OFF;
GO

SELECT [Id], [Key], [Value], [Description] FROM [MobileSetting] ORDER BY [Id];
GO
