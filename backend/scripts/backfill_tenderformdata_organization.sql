/*
  backfill_tenderformdata_organization.sql

  TenderFormData.OrganizationId was never filled. CustomSave stamped it from
  LogedUser.OrganizationId, but the Users table has no such column - the
  organization lives on the doctor profile (DoctorsProfile.OrganizationId), and
  verifyToken's DB-hydrated user carries it only as LogedUser.Doctor. So every
  record was saved with NULL, and an organization check has nothing to compare.

  CustomSave now falls back to the doctor profile. This fills the rows saved
  before that, from the saving user's own doctor profile. DoctorId holds the
  saving Users.Id, and DoctorsProfile.id is that same Users.Id.

  DATA ONLY, idempotent (only NULL rows are touched). A row whose author has no
  doctor profile stays NULL and remains writable by any doctor, as before.
  ASCII on purpose, so sqlcmd -i needs no BOM.
*/
SET NOCOUNT ON;

UPDATE d
SET d.OrganizationId = p.OrganizationId
FROM dbo.TenderFormData d
JOIN dbo.DoctorsProfile p ON p.id = d.DoctorId
WHERE d.OrganizationId IS NULL
  AND p.OrganizationId IS NOT NULL;

SELECT COUNT(*) AS StillWithoutOrganization
FROM dbo.TenderFormData
WHERE OrganizationId IS NULL AND rec_status <> 2;
