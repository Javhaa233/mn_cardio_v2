-- Fix HfAmbulance records that have NULL organization_id
-- This script sets the organization_id based on the CreateUserId (doctor who created the record)

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
