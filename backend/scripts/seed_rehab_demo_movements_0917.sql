-- =============================================================================
-- RehabMovement - 14 demo movements cut from video/0917.mp4 (MnCardio_test ONLY)
--
-- The filmed warm-up (86 s, one physiotherapist, seated) has 14 edits; each became
-- its own 9:16 loop EX01-Mnn.mp4 + EX01-Mnn.jpg (720x1280, silent H.264, 100-450 KB).
-- This replaces the six segment-loop drafts that pointed into the uncut file.
--
-- Names and steps DESCRIBE WHAT THE CLIP SHOWS and are not approved clinical
-- wording; times and repetitions are placeholders for the rehab doctors to set.
--
-- MediaRef / ThumbRef stay NULL here. The clips are attached through the normal
-- upload route (File rows + ALLFILE_DIR on the test server) by
-- deploy/scripts/upload_rehab_demo_clips.js, which then fills both columns.
--
-- Run: node scripts/run_sql.js --db MnCardio_test scripts/seed_rehab_demo_movements_0917.sql
-- =============================================================================

SET NOCOUNT ON;

DECLARE @db sysname = DB_NAME();
IF @db <> 'MnCardio_test'
BEGIN
    RAISERROR('Refusing to run: demo content, MnCardio_test only. Got "%s".', 16, 1, @db);
    SET NOEXEC ON;
END
GO

DECLARE @E INT = (SELECT Id FROM dbo.RehabExercise WHERE Code = 'EX-01');

-- Remove the segment-loop drafts (they never had media attached).
DELETE FROM dbo.RehabMovement
 WHERE ExerciseId = @E AND LoopStartMs IS NOT NULL AND MediaRef IS NULL;

IF NOT EXISTS (SELECT 1 FROM dbo.RehabMovement WHERE ExerciseId = @E AND OrderNo = 1)
    INSERT INTO dbo.RehabMovement (ExerciseId, OrderNo, Name, GuideText, WorkSec, Reps, PrepSec, IsActive, CreateDate)
    VALUES (@E, 1, N'Гүнзгий амьсгалах', N'Нуруугаа тэгшлэн сууна
Гараа гэдсэн дээрээ тавина
Хамраараа удаан амьсгал авч, амаараа гаргана', 30, NULL, 10, 1, GETDATE());
IF NOT EXISTS (SELECT 1 FROM dbo.RehabMovement WHERE ExerciseId = @E AND OrderNo = 2)
    INSERT INTO dbo.RehabMovement (ExerciseId, OrderNo, Name, GuideText, WorkSec, Reps, PrepSec, IsActive, CreateDate)
    VALUES (@E, 2, N'Гараа урагш, дээш сунгах', N'Хуруугаа холбож гараа урагш сунгана
Гараа дээш өргөнө
Удаан буулгана', NULL, 8, 10, 1, GETDATE());
IF NOT EXISTS (SELECT 1 FROM dbo.RehabMovement WHERE ExerciseId = @E AND OrderNo = 3)
    INSERT INTO dbo.RehabMovement (ExerciseId, OrderNo, Name, GuideText, WorkSec, Reps, PrepSec, IsActive, CreateDate)
    VALUES (@E, 3, N'Хүзүүг баруун тийш тонгойлгох', N'Баруун гараа толгой дээрээ тавина
Зүүн гараа бэлхүүсээ тавина
Толгойгоо баруун мөр рүү зөөлөн тонгойлгоно', 20, NULL, 10, 1, GETDATE());
IF NOT EXISTS (SELECT 1 FROM dbo.RehabMovement WHERE ExerciseId = @E AND OrderNo = 4)
    INSERT INTO dbo.RehabMovement (ExerciseId, OrderNo, Name, GuideText, WorkSec, Reps, PrepSec, IsActive, CreateDate)
    VALUES (@E, 4, N'Хүзүүг зүүн тийш тонгойлгох', N'Зүүн гараа толгой дээрээ тавина
Баруун гараа бэлхүүсээ тавина
Толгойгоо зүүн мөр рүү зөөлөн тонгойлгоно', 20, NULL, 10, 1, GETDATE());
IF NOT EXISTS (SELECT 1 FROM dbo.RehabMovement WHERE ExerciseId = @E AND OrderNo = 5)
    INSERT INTO dbo.RehabMovement (ExerciseId, OrderNo, Name, GuideText, WorkSec, Reps, PrepSec, IsActive, CreateDate)
    VALUES (@E, 5, N'Их биеийг баруун тийш эргүүлэх', N'Гараа толгойн ард тавина
Их биеэ баруун тийш удаан эргүүлнэ
Төвдөө буцна', NULL, 8, 10, 1, GETDATE());
IF NOT EXISTS (SELECT 1 FROM dbo.RehabMovement WHERE ExerciseId = @E AND OrderNo = 6)
    INSERT INTO dbo.RehabMovement (ExerciseId, OrderNo, Name, GuideText, WorkSec, Reps, PrepSec, IsActive, CreateDate)
    VALUES (@E, 6, N'Их биеийг зүүн тийш эргүүлэх', N'Гараа толгойн ард тавина
Их биеэ зүүн тийш удаан эргүүлнэ
Төвдөө буцна', NULL, 8, 10, 1, GETDATE());
IF NOT EXISTS (SELECT 1 FROM dbo.RehabMovement WHERE ExerciseId = @E AND OrderNo = 7)
    INSERT INTO dbo.RehabMovement (ExerciseId, OrderNo, Name, GuideText, WorkSec, Reps, PrepSec, IsActive, CreateDate)
    VALUES (@E, 7, N'Тохойгоо нугалж гараа өргөх', N'Тохойгоо нугалж гараа мөрний түвшинд өргөнө
Гараа хажуу тийш нээнэ
Удаан буулгана', NULL, 8, 10, 1, GETDATE());
IF NOT EXISTS (SELECT 1 FROM dbo.RehabMovement WHERE ExerciseId = @E AND OrderNo = 8)
    INSERT INTO dbo.RehabMovement (ExerciseId, OrderNo, Name, GuideText, WorkSec, Reps, PrepSec, IsActive, CreateDate)
    VALUES (@E, 8, N'Гараа цээжний өмнө нийлүүлэх', N'Гараа мөрний түвшинд урагш сунгана
Алгаа цээжний өмнө нийлүүлнэ', NULL, 8, 10, 1, GETDATE());
IF NOT EXISTS (SELECT 1 FROM dbo.RehabMovement WHERE ExerciseId = @E AND OrderNo = 9)
    INSERT INTO dbo.RehabMovement (ExerciseId, OrderNo, Name, GuideText, WorkSec, Reps, PrepSec, IsActive, CreateDate)
    VALUES (@E, 9, N'Гараа дээш сунгах', N'Хуруугаа холбож гараа толгой дээгүүр өргөнө
Дээш сунгаж барина', 20, NULL, 10, 1, GETDATE());
IF NOT EXISTS (SELECT 1 FROM dbo.RehabMovement WHERE ExerciseId = @E AND OrderNo = 10)
    INSERT INTO dbo.RehabMovement (ExerciseId, OrderNo, Name, GuideText, WorkSec, Reps, PrepSec, IsActive, CreateDate)
    VALUES (@E, 10, N'Гараа ард сунгах', N'Нуруугаа тэгшлэн сууна
Гараа ард нь холбож мөрөө ар тийш татна', 20, NULL, 10, 1, GETDATE());
IF NOT EXISTS (SELECT 1 FROM dbo.RehabMovement WHERE ExerciseId = @E AND OrderNo = 11)
    INSERT INTO dbo.RehabMovement (ExerciseId, OrderNo, Name, GuideText, WorkSec, Reps, PrepSec, IsActive, CreateDate)
    VALUES (@E, 11, N'Баруун мөрийг сунгах', N'Баруун гараа цээжин дээгүүр зүүн тийш татна
Зүүн гараараа тохойноос зөөлөн дарна', 20, NULL, 10, 1, GETDATE());
IF NOT EXISTS (SELECT 1 FROM dbo.RehabMovement WHERE ExerciseId = @E AND OrderNo = 12)
    INSERT INTO dbo.RehabMovement (ExerciseId, OrderNo, Name, GuideText, WorkSec, Reps, PrepSec, IsActive, CreateDate)
    VALUES (@E, 12, N'Зүүн мөрийг сунгах', N'Зүүн гараа цээжин дээгүүр баруун тийш татна
Баруун гараараа тохойноос зөөлөн дарна', 20, NULL, 10, 1, GETDATE());
IF NOT EXISTS (SELECT 1 FROM dbo.RehabMovement WHERE ExerciseId = @E AND OrderNo = 13)
    INSERT INTO dbo.RehabMovement (ExerciseId, OrderNo, Name, GuideText, WorkSec, Reps, PrepSec, IsActive, CreateDate)
    VALUES (@E, 13, N'Баруун гарын ар талыг сунгах', N'Баруун гараа толгойн ард нугална
Зүүн гараараа тохойноос зөөлөн татна', 20, NULL, 10, 1, GETDATE());
IF NOT EXISTS (SELECT 1 FROM dbo.RehabMovement WHERE ExerciseId = @E AND OrderNo = 14)
    INSERT INTO dbo.RehabMovement (ExerciseId, OrderNo, Name, GuideText, WorkSec, Reps, PrepSec, IsActive, CreateDate)
    VALUES (@E, 14, N'Зүүн гарын ар талыг сунгах', N'Зүүн гараа толгойн ард нугална
Баруун гараараа тохойноос зөөлөн татна', 20, NULL, 10, 1, GETDATE());

-- The warm-up exercise itself gets a working title while the catalogue is draft.
UPDATE dbo.RehabExercise
   SET Name = N'Суугаа байрлалын бие халаалт (жишээ бичлэг, батлагдаагүй)'
 WHERE Id = @E AND Name LIKE N'%батлагдаагүй%';
GO
