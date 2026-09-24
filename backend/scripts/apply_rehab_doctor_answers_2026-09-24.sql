-- =============================================================================
-- Rehab doctors' answers of 2026-09-24 (MnCardio_test ONLY)
-- Source: video/exercises/QUESTIONS-for-rehab-doctors.md
--
--   #8  «Гарын хүчний» (EX-02) and «Хөлийн хүчний» (EX-03) become ONE «Биеийн хүчний дасгал»:
--       EX-02 renamed; its programme blocks retitled; the EX-03 blocks and the empty EX-03
--       placeholder exercise deactivated (IsActive = 0, not deleted - reversible).
--   #9  «Бие хөргөлтийн дасгал» ("тийн" is correct) for EX-06.
--   #1  EX-01 stays «Амьсгалын дасгал» - no change here.
--
-- Run: node scripts/run_sql.js --db MnCardio_test scripts/apply_rehab_doctor_answers_2026-09-24.sql
-- =============================================================================

SET NOCOUNT ON;

DECLARE @db sysname = DB_NAME();
IF @db <> 'MnCardio_test'
BEGIN
    RAISERROR('Refusing to run: MnCardio_test only. Got "%s".', 16, 1, @db);
    SET NOEXEC ON;
END
GO

DECLARE @E2 INT = (SELECT Id FROM dbo.RehabExercise WHERE Code = 'EX-02');
DECLARE @E3 INT = (SELECT Id FROM dbo.RehabExercise WHERE Code = 'EX-03');
DECLARE @E6 INT = (SELECT Id FROM dbo.RehabExercise WHERE Code = 'EX-06');

UPDATE dbo.RehabExercise SET Name = N'Биеийн хүчний дасгал' WHERE Id = @E2;
UPDATE dbo.RehabProgramBlock SET Title = N'Биеийн хүчний дасгал' WHERE ExerciseId = @E2;
UPDATE dbo.RehabProgramBlock SET IsActive = 0 WHERE ExerciseId = @E3;
UPDATE dbo.RehabExercise SET IsActive = 0 WHERE Id = @E3;
UPDATE dbo.RehabExercise SET Name = N'Бие хөргөлтийн дасгал' WHERE Id = @E6;

SELECT p.Code AS Prog, b.OrderNo, b.Title, e.Code, b.IsActive
  FROM dbo.RehabProgramBlock b
  JOIN dbo.RehabProgram p ON p.Id = b.ProgramId
  LEFT JOIN dbo.RehabExercise e ON e.Id = b.ExerciseId
 WHERE b.ExerciseId IN (@E2, @E3, @E6)
 ORDER BY p.Code, b.OrderNo;

SELECT Code, Name, IsActive FROM dbo.RehabExercise WHERE Id IN (@E2, @E3, @E6) ORDER BY Code;
GO
