-- =============================================================================
-- EX-01: neck bend right (M03) + left (M04) are ONE movement (user, 2026-09-24).
-- MnCardio_test ONLY.
--   * OrderNo 3 becomes the merged movement (its clip plays right side, then left side)
--   * OrderNo 4 is switched off (IsActive = 0, OrderNo 99) - kept, not deleted
--   * OrderNo 5..14 move up to 4..13, matching the renamed clip files EX01-M04..M13
-- Name and guide text are ours (the video names no movements); reps come from the video (5).
-- Run: node scripts/run_sql.js --db MnCardio_test scripts/update_rehab_ex01_merge_neck.sql
-- =============================================================================

SET NOCOUNT ON;

DECLARE @db sysname = DB_NAME();
IF @db <> 'MnCardio_test'
BEGIN
    RAISERROR('Refusing to run: MnCardio_test only. Got "%s".', 16, 1, @db);
    SET NOEXEC ON;
END
GO

DECLARE @E INT = (SELECT Id FROM dbo.RehabExercise WHERE Code = 'EX-01');
IF EXISTS (SELECT 1 FROM dbo.RehabMovement WHERE ExerciseId = @E AND IsActive = 1 AND OrderNo = 14)
BEGIN
    UPDATE dbo.RehabMovement
       SET Name = N'Хүзүүг хажуу тийш тонгойлгох',
           GuideText = N'Нэг гараа толгой дээрээ, нөгөө гараа бэлхүүсээ тавина
Толгойгоо мөр рүү зөөлөн тонгойлгоно
Дасгалыг эсрэг талдаа давтан хийнэ.'
     WHERE ExerciseId = @E AND IsActive = 1 AND OrderNo = 3;

    UPDATE dbo.RehabMovement SET IsActive = 0, OrderNo = 99
     WHERE ExerciseId = @E AND IsActive = 1 AND OrderNo = 4;

    UPDATE dbo.RehabMovement SET OrderNo = OrderNo - 1
     WHERE ExerciseId = @E AND IsActive = 1 AND OrderNo BETWEEN 5 AND 14;
END

SELECT Id, OrderNo, Name, Reps, WorkSec, IsActive FROM dbo.RehabMovement WHERE ExerciseId = @E ORDER BY IsActive DESC, OrderNo;
GO
