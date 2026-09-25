-- Fix HfAmbulance records that have NULL organization_id
-- This script sets the organization_id based on the CreateUserId (doctor who created the record)

-- Refuse any database other than the three this project uses (runbook Stage 2.2).
DECLARE @db sysname = DB_NAME();
IF @db NOT IN ('MnCardio_restored', 'MnCardioNew', 'MnCardio_test')
BEGIN
    RAISERROR('Refusing to run: unexpected database "%s".', 16, 1, @db);
    SET NOEXEC ON;
END
GO

UPDATE HfAmbulance
SET organization_id = dp.OrganizationId
FROM HfAmbulance ha
INNER JOIN DoctorsProfile dp ON ha.CreateUserId = dp.id
WHERE ha.organization_id IS NULL;

-- Verify the update
SELECT
    COUNT(*) as TotalRecords,
    COUNT(organization_id) as RecordsWithOrgId,
    COUNT(*) - COUNT(organization_id) as RecordsWithoutOrgId
FROM HfAmbulance;
