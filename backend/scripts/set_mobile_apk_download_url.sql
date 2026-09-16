-- Point the mobile app's own update check at the self-hosted APK.
--
--   node scripts/run_sql.js --db MnCardio_test scripts/set_mobile_apk_download_url.sql
--
-- DATA, not DDL. Every row already exists (scripts/add_mobile_settings.sql
-- created them); this only fills in values, so it is safe to re-run.
--
-- WHY. lib/core/update/update_controller.dart calls GET /api/mobile/version on
-- launch and reads `storeUrlAndroid` in preference to `storeUrl`. That value has
-- been NULL since the table was created, because the design assumed Google Play
-- and no Play account exists yet (mobile/BLOCKERS.md §2). Until one does, the
-- download page at https://mncardio.itsystem.mn/apk is where an update actually
-- comes from, so that is what the endpoint should hand back. No client change is
-- needed for this to work.
--
-- latestVersion said '1.0.0' while pubspec.yaml says 0.1.0+1. Nothing enforced
-- the disagreement, but it would have shown a wrong "latest version" to a user
-- comparing it against their installed build.
--
-- minSupportedBuild and forceUpdate are deliberately NOT touched. They are the
-- lockout switch, and nobody should be locked out of a first test build.

DECLARE @db sysname = DB_NAME();
IF @db <> 'MnCardio_test'
BEGIN
    RAISERROR('Refusing to run: expected MnCardio_test, connected to %s', 16, 1, @db);
    SET NOEXEC ON;
END
GO

MERGE [MobileSetting] AS target
USING (VALUES
    ('storeUrlAndroid',
     N'https://mncardio.itsystem.mn/apk',
     N'Андройд аппыг татах хуудас. Google Play бүртгэл нээгдэх хүртэл өөрийн сервер дээрээс тараана.'),
    ('latestVersion',
     N'0.1.0',
     N'Хамгийн сүүлийн хувилбарын дугаар (pubspec.yaml-тай тааруулна).'),
    ('latestBuild',
     N'1',
     N'Хамгийн сүүлийн build дугаар (pubspec.yaml-ын + ээс хойшх хэсэг).'),
    ('releaseNotes',
     N'Туршилтын анхны хувилбар. Өвчтөн болон эмчийн модуль, чат, сэргээн засах дасгал.',
     N'Шинэчлэлтийн тайлбар, аппад харагдана.')
) AS source ([Key], [Value], [Description])
ON target.[Key] = source.[Key]
WHEN MATCHED THEN
    UPDATE SET
        target.[Value] = source.[Value],
        target.[Description] = ISNULL(target.[Description], source.[Description]),
        target.[UpdateDate] = GETDATE()
WHEN NOT MATCHED BY TARGET THEN
    INSERT ([Key], [Value], [Description], [UpdateDate])
    VALUES (source.[Key], source.[Value], source.[Description], GETDATE());
GO

SELECT [Key], [Value]
FROM [MobileSetting]
WHERE [Key] IN ('storeUrlAndroid', 'storeUrlIos', 'latestVersion', 'latestBuild',
                'minSupportedBuild', 'forceUpdate', 'releaseNotes')
ORDER BY [Key];
GO
