-- =============================================================================
-- EX-01 text from the original video "Амьсгалын дасгал" (MnCardio_test ONLY)
--
-- Source: video/exercises/EX01-amisgaliin-dasgal/source/amisgaliin-dasgal_original-full.mp4
-- Transcription and timecodes: video/exercises/EX01-amisgaliin-dasgal/notes/exercise-text.md
--
-- The video's title cards are copied VERBATIM (spelling and punctuation as on
-- screen). They replace text we had written ourselves from the clips. The video
-- does not name the movements, so movement names and M02-M14 GuideText are left
-- as they are. Still needs rehab-doctor sign-off.
--
--   M01      GuideText  <- the two numbered breathing lines
--   M02-M07  Reps 5     <- "Дасгал тус бүр 5удаа хийнэ үү.."
--   M08-M14  WorkSec 20 <- "Цээжний сунгалтын дасгалыг тус бүр 20 секунд барьж хийнэ үү!!!"
--   EX-01    Name, Description <- title card + the three rule cards
--
-- Run: node scripts/run_sql.js --db MnCardio_test scripts/update_rehab_ex01_text_from_original.sql
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

UPDATE dbo.RehabExercise
   SET Name = N'Амьсгалын дасгал',
       Description = N'Хөдөлгөөн засал эмчилгээ
Дараах дасгалыг хийхдээ амьсгалын дасгалыг хамт хийнэ үү!!
Дасгал тус бүр 5удаа хийнэ үү..
...Сунгалтын дасгал...
Цээжний сунгалтын дасгалыг тус бүр 20 секунд барьж хийнэ үү!!!
Та эдгээр дасгалуудыг  өдөрт 3-5 удаа хийх нь илүү үр дүнтэй .'
 WHERE Id = @E;

UPDATE dbo.RehabMovement
   SET GuideText = N'1.Хамраараа гүнзгий амьсгал аван гэдсээ бөмбийлгөнө
2. Хошуугаа цорвойлгож удаанаар үлээж амьсгалаа гарган гэдсээ татна.'
 WHERE ExerciseId = @E AND OrderNo = 1;

UPDATE dbo.RehabMovement
   SET Reps = 5, WorkSec = NULL
 WHERE ExerciseId = @E AND OrderNo BETWEEN 2 AND 7;

UPDATE dbo.RehabMovement
   SET WorkSec = 20, Reps = NULL
 WHERE ExerciseId = @E AND OrderNo BETWEEN 8 AND 14;

SELECT OrderNo, Name, WorkSec, Reps, LEFT(GuideText, 60) AS GuideText
  FROM dbo.RehabMovement WHERE ExerciseId = @E AND IsActive = 1 ORDER BY OrderNo;
GO
