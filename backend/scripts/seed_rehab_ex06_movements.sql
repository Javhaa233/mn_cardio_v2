-- =============================================================================
-- EX-06 Бие хөргөлтийн дасгал — 17 movements (MnCardio_test ONLY)
--
-- Source video: video/exercises/EX06-biye-hurgultiin-dasgal/source/EX06_filmed-source.mp4
-- Transcription: video/exercises/EX06-biye-hurgultiin-dasgal/notes/exercise-text.md
--
-- The video's only text is its title card «Бие хөргөлтын дасгал / Хөдөлгөөн засал эмчилгээ»;
-- the doctors confirmed the spelling «хөргөлтийн» (answer #9). Description = the card's subtitle
-- verbatim. Movement names and guide lines are OURS, written from the footage (answer #7: keep).
-- Reps / duration are editable defaults - the doctors set them in the web system (answer #3):
-- rep-type movements Reps 10, held stretches WorkSec 20, breathing WorkSec 30.
-- M17 reuses EX01's animated breathing clip (answer #10).
--
-- MediaRef / ThumbRef are filled afterwards by:
--   node deploy/scripts/upload_rehab_demo_clips.js --code EX-06 --apply
--
-- Run: node scripts/run_sql.js --db MnCardio_test scripts/seed_rehab_ex06_movements.sql
-- =============================================================================

SET NOCOUNT ON;

DECLARE @db sysname = DB_NAME();
IF @db <> 'MnCardio_test'
BEGIN
    RAISERROR('Refusing to run: demo content, MnCardio_test only. Got "%s".', 16, 1, @db);
    SET NOEXEC ON;
END
GO

DECLARE @E INT = (SELECT Id FROM dbo.RehabExercise WHERE Code = 'EX-06');

UPDATE dbo.RehabExercise
   SET Name = N'Бие хөргөлтийн дасгал',
       Description = N'Хөдөлгөөн засал эмчилгээ'
 WHERE Id = @E;

DECLARE @M TABLE (OrderNo INT, Name NVARCHAR(200), GuideText NVARCHAR(1000), WorkSec INT, Reps INT);
INSERT INTO @M VALUES
 (1,  N'Хагас суулт хийж гараа савлах', N'Өвдгөө бага зэрэг нугалж сууна
Хоёр гараа урагш дээш савлана
Буцааж босно', NULL, 10),
 (2,  N'Байран дээрээ алхах', N'Байран дээрээ өвдгөө ээлжлэн өргөж алхана
Гараа хөлийн хөдөлгөөнтэй хамт савлана', NULL, 10),
 (3,  N'Өсгийгөө ээлжлэн урагш тавих', N'Гараа бэлхүүсээ тавина
Өсгийгөө ээлжлэн урагш тавьж буцаана', NULL, 10),
 (4,  N'Хөлийн хуруун дээрээ өндийх', N'Хананы бариулаас барина
Хөлийн хуруун дээрээ өндийнө
Удаан буулгана', NULL, 10),
 (5,  N'Гуяны урд талыг сунгах', N'Хананы бариулаас барина
Нөгөө гараараа хөлийнхөө шагайнаас барьж өсгийгөө өгзөг рүүгээ татна
Барьж байгаад удаан буулгана
Дасгалыг эсрэг талдаа давтан хийнэ.', 20, NULL),
 (6,  N'Урагш бөхийж сунгах', N'Хөлөө мөрний өргөнтэй зогсоно
Урагш бөхийж гараа хөл рүүгээ сунгана
Барьж байгаад удаан босно', 20, NULL),
 (7,  N'Хажуу тийш суух', N'Хөлөө өргөн тавьж, гараа бэлхүүсээ тавина
Нэг өвдгөө нугалж жингээ тийш нь шилжүүлнэ
Барьж байгаад төвдөө буцна
Дасгалыг эсрэг талдаа давтан хийнэ.', 20, NULL),
 (8,  N'Урагш алхам хийж суух', N'Гараа бэлхүүсээ тавина
Нэг хөлөөрөө урагш алхам хийж өвдгөө нугална
Барьж байгаад буцааж зогсоно
Дасгалыг эсрэг талдаа давтан хийнэ.', 20, NULL),
 (9,  N'Гараа ээлжлэн дээш сунгах', N'Нэг гараа толгой дээгүүр дээш сунгана
Барьж байгаад буулгана
Дасгалыг эсрэг талдаа давтан хийнэ.', NULL, 10),
 (10, N'Гараа ээлжлэн урагш түлхэх', N'Гараа цээжний өмнө атгана
Гараа ээлжлэн урагш түлхэнэ', NULL, 10),
 (11, N'Гараа хажуу тийш нээх', N'Гараа мөрний түвшинд хажуу тийш сунгана
Тохойгоо нугалж, буцааж тэнийлгэнэ', NULL, 10),
 (12, N'Хоёр гараа дээш өргөх', N'Хоёр гараа толгой дээгүүр дээш өргөнө
Барьж байгаад удаан буулгана', NULL, 10),
 (13, N'Гараа ташуу дээш сунгах', N'Нэг гараа ташуу дээш сунгана
Удаан буулгана
Дасгалыг эсрэг талдаа давтан хийнэ.', NULL, 10),
 (14, N'Их биеийг хажуу тийш тонгойлгох', N'Нэг гараа бэлхүүсээ тавина
Нөгөө гараа толгой дээгүүр гаргаж хажуу тийш тонгойно
Удаан буцна
Дасгалыг эсрэг талдаа давтан хийнэ.', NULL, 10),
 (15, N'Их биеийг эргүүлэх', N'Хөлөө мөрний өргөнтэй зогсоно
Их биеэ баруун, зүүн тийш удаан эргүүлж гараа савлана', NULL, 10),
 (16, N'Хүзүүний дасгал', N'Гараа бэлхүүсээ тавина
Толгойгоо удаан доош бөхийлгөж, дараа нь дээш өндийлгөнө', NULL, 10),
 (17, N'Гүнзгий амьсгалах', N'1.Хамраараа гүнзгий амьсгал аван гэдсээ бөмбийлгөнө
2. Хошуугаа цорвойлгож удаанаар үлээж амьсгалаа гарган гэдсээ татна.', 30, NULL);

INSERT INTO dbo.RehabMovement (ExerciseId, OrderNo, Name, GuideText, WorkSec, Reps, PrepSec, IsActive, CreateDate)
SELECT @E, m.OrderNo, m.Name, m.GuideText, m.WorkSec, m.Reps, 10, 1, GETDATE()
  FROM @M m
 WHERE NOT EXISTS (SELECT 1 FROM dbo.RehabMovement x WHERE x.ExerciseId = @E AND x.OrderNo = m.OrderNo AND x.IsActive = 1);

SELECT OrderNo, Name, WorkSec, Reps, LEFT(GuideText, 45) AS GuideText
  FROM dbo.RehabMovement WHERE ExerciseId = @E AND IsActive = 1 ORDER BY OrderNo;
GO
