-- Сан: MnCardioNew / MnCardio_test
--
-- vwDoctorsTeamInfo: stop counting deleted team memberships.
--
-- WHY THIS EXISTS INSTEAD OF create_vwDoctorsTeamInfo.sql
-- ------------------------------------------------------------------------
-- Production and this line of work had DIFFERENT definitions of this view.
-- The difference was found on 2026-09-23 by comparing view BODIES rather than
-- names (tests/acceptance/schema_diff.js); a presence check called it green.
--
--   production : LEFT JOIN over grouped derived tables. Counts EVERY
--                LookupDoctorTeam row, including rec_status = 2 (deleted).
--   ours       : two correlated subqueries per team row. Excludes deleted.
--
-- Ours produced the right number the slow way; production's produced the wrong
-- number the fast way. Rather than replace one with the other, this script
-- keeps PRODUCTION's shape and adds the filter it was missing — so the count is
-- corrected without trading away the query plan.
--
-- Verified read-only against MnCardioNew on 2026-09-23: this definition and
-- create_vwDoctorsTeamInfo.sql return identical numbers on all 453 teams
-- (1,022 doctors / 4,353 patients), with zero rows disagreeing.
--
-- WHAT CHANGES FOR THE CUSTOMER — this is a VISIBLE change, not a refactor:
--   * 72 of 453 teams will show a different doctor count.
--   * The site-wide doctor total falls from 1,116 to 1,022 (the 94 memberships
--     carrying rec_status = 2).
--   * Patient counts do not move at all. DoctorsTeamPatient already filtered
--     rec_status, and it holds no NULLs, so the two forms agree exactly.
-- ЗСҮТ must agree to that before this runs on production.
--
-- rec_status is INT on all three tables (checked, not assumed), so the
-- comparison is written against integers. Production's original wrote
-- rec_status != '2', which worked only via an implicit string-to-int cast.
-- ISNULL(...) <> 2 also keeps rows where rec_status IS NULL, which the old
-- `!= '2'` silently dropped — NULL compares as UNKNOWN, not as true.
--
-- ROLLBACK: capture the current definition BEFORE running this --
--   SELECT OBJECT_DEFINITION(OBJECT_ID('dbo.vwDoctorsTeamInfo'));
-- and re-apply it. There is no other way back.

DECLARE @db sysname = DB_NAME();
IF @db NOT IN ('MnCardio_restored', 'MnCardioNew', 'MnCardio_test')
BEGIN
    RAISERROR('Refusing to run: unexpected database "%s".', 16, 1, @db);
    SET NOEXEC ON;
END
GO

CREATE OR ALTER VIEW dbo.vwDoctorsTeamInfo
AS
SELECT
    dt.id_data                      AS DoctorTeamId,
    ISNULL(dc.DoctorCount,  0)      AS DoctorCount,
    ISNULL(pc.PatientCount, 0)      AS PatientCount
FROM dbo.DoctorsTeam AS dt
LEFT OUTER JOIN
(
    SELECT team_id, COUNT(1) AS DoctorCount
    FROM dbo.LookupDoctorTeam
    WHERE team_id IS NOT NULL
      AND ISNULL(rec_status, 0) <> 2      -- <- the missing filter
    GROUP BY team_id
) AS dc ON dc.team_id = dt.id_data
LEFT OUTER JOIN
(
    SELECT team_id, COUNT(1) AS PatientCount
    FROM dbo.DoctorsTeamPatient
    WHERE team_id IS NOT NULL
      AND ISNULL(rec_status, 0) <> 2      -- was rec_status != '2', which dropped NULLs
    GROUP BY team_id
) AS pc ON pc.team_id = dt.id_data;
GO

SET NOEXEC OFF;
GO

-- Verification. Expected on MnCardioNew: Teams 453, Doctors 1022, Patients 4353.
SELECT COUNT(*) AS Teams, SUM(DoctorCount) AS Doctors, SUM(PatientCount) AS Patients
FROM dbo.vwDoctorsTeamInfo;
GO
