-- =============================================================================
-- EX-02 Булчингийн хүчний дасгал — 12 movements (MnCardio_test ONLY)
--
-- Source video: video/exercises/EX02-bulchingiin-huchnii-dasgal/source/EX02_filmed-source.mp4
-- Transcription: video/exercises/EX02-bulchingiin-huchnii-dasgal/notes/exercise-text.md
--
-- The rehab doctors decided (2026-09-24) this video is ONE exercise, EX-02, arms and legs.
-- Exercise Description = the video's title cards, VERBATIM.
-- "Дасгалыг эсрэг талдаа давтан хийнэ." is the video's own caption (shown in M02), added to
-- every one-sided movement. Movement names and the other guide lines are OURS, written from the
-- footage — the video numbers the movements but never names them. Reps default to 10 (the cards
-- say 10-20); the doctors set reps and duration in the web system.
--
-- MediaRef / ThumbRef are filled afterwards by:
--   node deploy/scripts/upload_rehab_demo_clips.js --code EX-02 --apply
--
-- Run: node scripts/run_sql.js --db MnCardio_test scripts/seed_rehab_ex02_movements.sql
-- =============================================================================

SET NOCOUNT ON;

DECLARE @db sysname = DB_NAME();
IF @db <> 'MnCardio_test'
BEGIN
    RAISERROR('Refusing to run: demo content, MnCardio_test only. Got "%s".', 16, 1, @db);
    SET NOEXEC ON;
END
GO

DECLARE @E INT = (SELECT Id FROM dbo.RehabExercise WHERE Code = 'EX-02');
DECLARE @SIDE NVARCHAR(60) = N'Дасгалыг эсрэг талдаа давтан хийнэ.';

UPDATE dbo.RehabExercise
   SET Name = N'Булчингийн хүчний дасгал',
       CategoryCode = 'strength',
       Description = N'Хөдөлгөөн засал эмчилгээ
Дараах дасгалуудыг хийхдээ 0,5-1кг хүндрүүлэгч ашиглан хийнэ.
Дасгалыг нэг талдаа 10-20 удаа хийнэ
Хөлийн хүчний дасгал
Дасгалыг 10-20 удаа хийнэ'
 WHERE Id = @E;

DECLARE @M TABLE (OrderNo INT, Name NVARCHAR(200), GuideText NVARCHAR(1000), OneSided BIT);
INSERT INTO @M VALUES
 (1,  N'Мөрөө өргөх', N'Гартаа хүндрүүлэгч барьж, шулуун зогсоно
Хоёр мөрөө чих рүүгээ өргөнө
Удаан буулгана', 0),
 (2,  N'Гараа урагш өргөх', N'Гараа шулуун чигээр нь урагш, мөрний түвшин хүртэл өргөнө
Удаан буулгана', 1),
 (3,  N'Гараа дээш өргөх', N'Гараа шулуун чигээр нь урагшаа, толгой дээгүүр дээш өргөнө
Удаан буулгана', 1),
 (4,  N'Гараа хажуу тийш өргөх', N'Гараа шулуун чигээр нь хажуу тийш, мөрний түвшин хүртэл өргөнө
Удаан буулгана', 1),
 (5,  N'Тохойгоо нугалах', N'Тохойгоо биедээ наалттай байлгана
Тохойгоо нугалж хүндрүүлэгчийг мөр рүүгээ өргөнө
Удаан буулгана', 1),
 (6,  N'Мөрийг гадагш эргүүлэх (хоёр гараар)', N'Тохойгоо 90 градус нугалж, биедээ наалттай байлгана
Хоёр гараа гадагш нээнэ
Буцааж нийлүүлнэ', 0),
 (7,  N'Мөрийг гадагш эргүүлэх (нэг гараар)', N'Тохойгоо 90 градус нугалж, биедээ наалттай байлгана
Гараа гадагш нээнэ
Буцааж оруулна', 1),
 (8,  N'Суугаад өвдгөө тэнийлгэх', N'Сандал дээр нуруугаа тэгшлэн сууна
Өвдгөө тэнийлгэж хөлөө урагш өргөнө
Удаан буулгана', 1),
 (9,  N'Зогсоод өвдгөө өргөх', N'Хананы бариулаас барина
Өвдгөө нугалж урагш дээш өргөнө
Удаан буулгана', 1),
 (10, N'Зогсоод өвдгөө нугалах', N'Хананы бариулаас барина
Өвдгөө нугалж өсгийгөө өгзөг рүүгээ татна
Удаан буулгана', 1),
 (11, N'Хөлөө хажуу тийш өргөх', N'Гараа бэлхүүсээ тавьж, шулуун зогсоно
Хөлөө шулуун чигээр нь хажуу тийш өргөнө
Удаан буулгана', 1),
 (12, N'Суулт хийх', N'Гараа бэлхүүсээ тавьж зогсоно
Гараа урагш сунгаж, өвдгөө нугалан сууна
Буцааж босно', 0);

INSERT INTO dbo.RehabMovement (ExerciseId, OrderNo, Name, GuideText, WorkSec, Reps, PrepSec, IsActive, CreateDate)
SELECT @E, m.OrderNo, m.Name,
       CASE WHEN m.OneSided = 1 THEN m.GuideText + NCHAR(10) + @SIDE ELSE m.GuideText END,
       NULL, 10, 10, 1, GETDATE()
  FROM @M m
 WHERE NOT EXISTS (SELECT 1 FROM dbo.RehabMovement x WHERE x.ExerciseId = @E AND x.OrderNo = m.OrderNo);

SELECT OrderNo, Name, Reps, PrepSec, LEFT(GuideText, 50) AS GuideText
  FROM dbo.RehabMovement WHERE ExerciseId = @E AND IsActive = 1 ORDER BY OrderNo;
GO
