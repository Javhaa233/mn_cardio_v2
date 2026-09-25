-- Permissions rows for the objects the mobile app touches — mobile tender §1.2.
--
-- DATA, NOT DDL. The four RBAC tables have been in the schema for years and the
-- web already has management screens for two of them
-- (view/Security/Permissions.jsx, RoleToPermission.jsx). Measured on
-- MnCardio_test 2026-09-14, Permissions held 122 rows — but none of them named
-- the objects the mobile surface actually serves, so there was nothing for
-- helper/RequirePermission.js to check against. These nine close that gap.
--
-- IT GRANTS NOTHING. RoleToPermission is left untouched, so no user's access
-- changes by running this. What it does is make the admin screens usable: ЗСҮТ
-- can now tick create/read/update/delete per role against a real list.
--
-- WHY THAT ORDER, AND WHAT STILL HAS TO HAPPEN. All 125 existing grants belong
-- to RoleId 1 (Admin); roles 2 and 3 — the doctor tiers — have none.
-- helper/Permissions.js therefore treats every doctor as "unconfigured,
-- therefore permitted", which is what keeps FEATURE_PERMISSIONS safe to switch
-- on. Seeding grants HERE would replace that with whatever we guessed a doctor
-- should be able to do. The grants are ЗСҮТ's decision, entered through the
-- screens above.
--
-- The Url columns stay NULL. They are a legacy of a menu-driven design that
-- nothing reads; the gate keys on ObjectName alone.
--
-- Safe to re-run.

DECLARE @db sysname = DB_NAME();
IF @db NOT IN ('MnCardio_restored', 'MnCardioNew', 'MnCardio_test')
BEGIN
    RAISERROR('Refusing to run: unexpected database "%s".', 16, 1, @db);
    SET NOEXEC ON;
END
GO

;WITH Seed([Name], [ObjectName], [Description]) AS (
    SELECT * FROM (VALUES
        (N'Үзлэг',                   'Visit',             N'Үзлэгийн бүртгэл унших, хэвлэх, экспортлох'),
        (N'Хяналт',                  'PatientMonitoring', N'Хяналтын жагсаалт, өдрийн тэмдэглэл, асуулт хариулт'),
        (N'Зөвлөгөө',                'Advice',            N'Зөвлөгөөний самбар'),
        (N'Тайлан',                  'Report',            N'Эмчийн нэгдсэн тайлан ба экспорт'),
        (N'Үйлчлүүлэгчийн карт',     'PatientCard',       N'Үйлчлүүлэгчийн мэдээлэл, эрсдэл, зөвшөөрөл'),
        (N'Цахим үзлэг',             'RemoteVisit',       N'Цахим үзлэгийн хүсэлт, товлолт'),
        (N'Сэргээн засах',           'Rehab',             N'Сэргээн засахын үнэлгээ, дасгалын каталог'),
        (N'Шинжилгээ, оношлогоо',    'Diagnostics',       N'Лаборатори, эхо, ангиографи, ЗЦБ'),
        -- Not a route gate: helper/Confidentiality.js checks this one, so a
        -- user may be permitted to read a patient card and still not be
        -- permitted to see a classified result on it.
        (N'Нууцын ангилалтай мэдээлэл', 'ViewConfidential', N'Нууцын ангилалтай шинжилгээ, тэмдэглэл харах')
    ) v([Name], [ObjectName], [Description])
)
INSERT INTO [Permissions] ([Name], [ObjectName], [Description])
SELECT s.[Name], s.[ObjectName], s.[Description]
  FROM Seed s
 WHERE NOT EXISTS (SELECT 1 FROM [Permissions] p WHERE p.[ObjectName] = s.[ObjectName]);

PRINT 'Permissions seed: ' + CAST(@@ROWCOUNT AS VARCHAR(10)) + ' row(s) added';
GO

SET NOEXEC OFF;
GO

SELECT p.[Id], p.[ObjectName], p.[Name],
       (SELECT COUNT(*) FROM [RoleToPermission] rp WHERE rp.PermissionId = p.[Id]) AS GrantsConfigured
  FROM [Permissions] p
 ORDER BY p.[Id];
GO
