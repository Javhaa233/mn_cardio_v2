-- Create or update the vwDoctorsTeamInfo view
-- This view returns one row per DoctorsTeam, including teams with 0 doctors/patients
CREATE OR ALTER VIEW vwDoctorsTeamInfo AS
SELECT
    dt.id_data AS DoctorTeamId,
    (
        SELECT COUNT(*)
        FROM LookupDoctorTeam ldt
        WHERE ldt.team_id = dt.id_data
          AND ISNULL(ldt.rec_status, 0) <> 2
    ) AS DoctorCount,
    (
        SELECT COUNT(*)
        FROM DoctorsTeamPatient dtp
        WHERE dtp.team_id = dt.id_data
          AND ISNULL(dtp.rec_status, 0) <> 2
    ) AS PatientCount
FROM DoctorsTeam dt;
