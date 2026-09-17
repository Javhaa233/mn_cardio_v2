-- =============================================================================
-- RehabProgram / RehabProgramBlock / RehabMovement - DRAFT content, MnCardio_test ONLY
--
-- DRAFTED BY ITSYSTEM FROM "SergeenZasah app.xlsx" (rehab team, 2026-09-17).
-- NOT APPROVED. Block titles, minutes and warnings are copied from the xlsx; the
-- structure (which blocks are daily, which exercise video each block plays) is
-- our reading of it and needs the rehab doctors' sign-off. Open questions:
-- beta-blocker max HR, intensity progression, stop thresholds, body weight,
-- HF without walking, stroke's target HR, which rows are the 39 videos.
--
-- Day bands 1-7 / 8-14 / 15-21 / 22+ (user decision; the xlsx overlaps on 7/14/21).
-- Exercise links point at placeholder rows EX-01..EX-29.
--
-- Idempotent: a programme is inserted once by Code; its blocks only when it has
-- none; demo movements only when EX-01 has none. Real content is then edited
-- through the web admin, never by re-running this.
--
-- Run: node scripts/run_sql.js --db MnCardio_test scripts/seed_rehab_programs_draft.sql
-- =============================================================================

SET NOCOUNT ON;

DECLARE @db sysname = DB_NAME();
IF @db <> 'MnCardio_test'
BEGIN
    RAISERROR('Refusing to run: draft clinical content, MnCardio_test only. Got "%s".', 16, 1, @db);
    SET NOEXEC ON;
END
GO

-- ---- MI: Зүрхний шигдээсний дасгал
IF NOT EXISTS (SELECT 1 FROM dbo.RehabProgram WHERE Code = N'MI')
    INSERT INTO dbo.RehabProgram (Code, Name, Description, HasHrTarget, DefaultIntensityPct, WarningTemplate, OrderNo, IsActive, CreateDate)
    VALUES (N'MI', N'Зүрхний шигдээсний дасгал', N'Төсөл - эмнэлзүйн багаар батлагдаагүй', 1, 30, N'Та өнөөдөр дасгалын туршид ЗЦТ-оо {target}-аас дээш гаргахгүй дасгалаа хийнэ үү. Хэрэв ЗЦТ {target}-аас дээш гарвал түр амрах буюу дасгалыг удаашруулж ЗЦТ-оо {target}-аас буулгана уу.', 1, 1, GETDATE());
GO

DECLARE @P INT = (SELECT Id FROM dbo.RehabProgram WHERE Code = N'MI');
IF NOT EXISTS (SELECT 1 FROM dbo.RehabProgramBlock WHERE ProgramId = @P)
BEGIN
    INSERT INTO dbo.RehabProgramBlock (ProgramId, OrderNo, Title, Kind, ExerciseId, DurationSec, DurationSteps, ShowFromDay, CheckInEverySec, GuideText, IsActive, CreateDate)
    VALUES (@P, 1, N'Бие халаалтын дасгал', N'video', (SELECT Id FROM dbo.RehabExercise WHERE Code = N'EX-01'), 600, NULL, NULL, NULL, N'5-10 минут үргэлжилнэ.
Энгийн дасгалуудаас бүрдэнэ.
Бие халаалтаар зүрх судасны үйл ажиллагаа бие махбодыг дасгалын дараагийн үе шатанд бэлтгэх зорилготой.', 1, GETDATE());
    INSERT INTO dbo.RehabProgramBlock (ProgramId, OrderNo, Title, Kind, ExerciseId, DurationSec, DurationSteps, ShowFromDay, CheckInEverySec, GuideText, IsActive, CreateDate)
    VALUES (@P, 2, N'Алхах', N'timed', NULL, NULL, N'[{"fromDay":1,"toDay":7,"min":10},{"fromDay":8,"toDay":14,"min":15},{"fromDay":15,"toDay":21,"min":20},{"fromDay":22,"min":30}]', NULL, 120, N'2 минут тутамд зүрхний цохилтын тоо, ачааллын үнэлгээ оруулна.
Байт тооноос дээш гарвал хурдаа сааруулна.
Байт тооноос бага байвал хурдаа нэмнэ.', 1, GETDATE());
    INSERT INTO dbo.RehabProgramBlock (ProgramId, OrderNo, Title, Kind, ExerciseId, DurationSec, DurationSteps, ShowFromDay, CheckInEverySec, GuideText, IsActive, CreateDate)
    VALUES (@P, 3, N'Дугуй жийх', N'timed', NULL, NULL, N'[{"fromDay":1,"toDay":7,"min":10},{"fromDay":8,"toDay":14,"min":15},{"fromDay":15,"toDay":21,"min":20},{"fromDay":22,"min":30}]', NULL, 120, N'2 минут тутамд зүрхний цохилтын тоо, ачааллын үнэлгээ оруулна.
Байт тооноос дээш гарвал хурдаа сааруулна.
Байт тооноос бага байвал хурдаа нэмнэ.', 1, GETDATE());
    INSERT INTO dbo.RehabProgramBlock (ProgramId, OrderNo, Title, Kind, ExerciseId, DurationSec, DurationSteps, ShowFromDay, CheckInEverySec, GuideText, IsActive, CreateDate)
    VALUES (@P, 4, N'Гарын хүчний дасгал', N'video', (SELECT Id FROM dbo.RehabExercise WHERE Code = N'EX-02'), 600, NULL, NULL, NULL, NULL, 1, GETDATE());
    INSERT INTO dbo.RehabProgramBlock (ProgramId, OrderNo, Title, Kind, ExerciseId, DurationSec, DurationSteps, ShowFromDay, CheckInEverySec, GuideText, IsActive, CreateDate)
    VALUES (@P, 5, N'Хөлийн хүчний дасгал', N'video', (SELECT Id FROM dbo.RehabExercise WHERE Code = N'EX-03'), 600, NULL, NULL, NULL, NULL, 1, GETDATE());
    INSERT INTO dbo.RehabProgramBlock (ProgramId, OrderNo, Title, Kind, ExerciseId, DurationSec, DurationSteps, ShowFromDay, CheckInEverySec, GuideText, IsActive, CreateDate)
    VALUES (@P, 6, N'Шатаар алхах', N'timed', NULL, NULL, N'[{"fromDay":22,"toDay":28,"min":5},{"fromDay":29,"toDay":35,"min":10},{"fromDay":36,"toDay":42,"min":15},{"fromDay":43,"min":20}]', 22, 120, N'2 минут тутамд зүрхний цохилтын тоо, ачааллын үнэлгээ оруулна.
Байт тооноос дээш гарвал хурдаа сааруулна.
Байт тооноос бага байвал хурдаа нэмнэ.', 1, GETDATE());
    INSERT INTO dbo.RehabProgramBlock (ProgramId, OrderNo, Title, Kind, ExerciseId, DurationSec, DurationSteps, ShowFromDay, CheckInEverySec, GuideText, IsActive, CreateDate)
    VALUES (@P, 7, N'Бие хөргөлтийн дасгал', N'video', (SELECT Id FROM dbo.RehabExercise WHERE Code = N'EX-06'), 600, NULL, NULL, NULL, N'5-10 минут үргэлжилнэ.
Энгийн дасгалууд ба сунгалтын дасгалууд хийгдэнэ.
Төгсгөлийн үеийн зорилго нь: алхах үед олж авсан зүрх судас болон бие махбодын сэргэлтийг хадгалах, эргэн сэргээх зорилготой.', 1, GETDATE());
END
GO

-- ---- HF: Зүрхний дутагдал
IF NOT EXISTS (SELECT 1 FROM dbo.RehabProgram WHERE Code = N'HF')
    INSERT INTO dbo.RehabProgram (Code, Name, Description, HasHrTarget, DefaultIntensityPct, WarningTemplate, OrderNo, IsActive, CreateDate)
    VALUES (N'HF', N'Зүрхний дутагдал', N'Төсөл - эмнэлзүйн багаар батлагдаагүй', 1, 30, N'Та өнөөдөр дасгалын туршид ЗЦТ-оо {target}-аас дээш гаргахгүй дасгалаа хийнэ үү. Хэрэв ЗЦТ {target}-аас дээш гарвал түр амрах буюу дасгалыг удаашруулж ЗЦТ-оо {target}-аас буулгана уу.', 2, 1, GETDATE());
GO

DECLARE @P INT = (SELECT Id FROM dbo.RehabProgram WHERE Code = N'HF');
IF NOT EXISTS (SELECT 1 FROM dbo.RehabProgramBlock WHERE ProgramId = @P)
BEGIN
    INSERT INTO dbo.RehabProgramBlock (ProgramId, OrderNo, Title, Kind, ExerciseId, DurationSec, DurationSteps, ShowFromDay, CheckInEverySec, GuideText, IsActive, CreateDate)
    VALUES (@P, 1, N'Бие халаалтын дасгал', N'video', (SELECT Id FROM dbo.RehabExercise WHERE Code = N'EX-01'), 600, NULL, NULL, NULL, N'5-10 минут үргэлжилнэ.
Энгийн дасгалуудаас бүрдэнэ.
Бие халаалтаар зүрх судасны үйл ажиллагаа бие махбодыг дасгалын дараагийн үе шатанд бэлтгэх зорилготой.', 1, GETDATE());
    INSERT INTO dbo.RehabProgramBlock (ProgramId, OrderNo, Title, Kind, ExerciseId, DurationSec, DurationSteps, ShowFromDay, CheckInEverySec, GuideText, IsActive, CreateDate)
    VALUES (@P, 2, N'Амьсгал намжаах байрлал', N'image', NULL, NULL, NULL, NULL, NULL, NULL, 1, GETDATE());
    INSERT INTO dbo.RehabProgramBlock (ProgramId, OrderNo, Title, Kind, ExerciseId, DurationSec, DurationSteps, ShowFromDay, CheckInEverySec, GuideText, IsActive, CreateDate)
    VALUES (@P, 3, N'Дугуй жийх', N'timed', NULL, NULL, N'[{"fromDay":1,"toDay":7,"min":10},{"fromDay":8,"toDay":14,"min":15},{"fromDay":15,"toDay":21,"min":20},{"fromDay":22,"min":30}]', NULL, 120, N'2 минут тутамд зүрхний цохилтын тоо, ачааллын үнэлгээ оруулна.
Байт тооноос дээш гарвал хурдаа сааруулна.
Байт тооноос бага байвал хурдаа нэмнэ.', 1, GETDATE());
    INSERT INTO dbo.RehabProgramBlock (ProgramId, OrderNo, Title, Kind, ExerciseId, DurationSec, DurationSteps, ShowFromDay, CheckInEverySec, GuideText, IsActive, CreateDate)
    VALUES (@P, 4, N'Гарын хүчний дасгал', N'video', (SELECT Id FROM dbo.RehabExercise WHERE Code = N'EX-02'), 600, NULL, NULL, NULL, NULL, 1, GETDATE());
    INSERT INTO dbo.RehabProgramBlock (ProgramId, OrderNo, Title, Kind, ExerciseId, DurationSec, DurationSteps, ShowFromDay, CheckInEverySec, GuideText, IsActive, CreateDate)
    VALUES (@P, 5, N'Хөлийн хүчний дасгал', N'video', (SELECT Id FROM dbo.RehabExercise WHERE Code = N'EX-03'), 600, NULL, NULL, NULL, NULL, 1, GETDATE());
    INSERT INTO dbo.RehabProgramBlock (ProgramId, OrderNo, Title, Kind, ExerciseId, DurationSec, DurationSteps, ShowFromDay, CheckInEverySec, GuideText, IsActive, CreateDate)
    VALUES (@P, 6, N'Шатаар алхах', N'timed', NULL, NULL, N'[{"fromDay":22,"toDay":28,"min":5},{"fromDay":29,"toDay":35,"min":10},{"fromDay":36,"toDay":42,"min":15},{"fromDay":43,"min":20}]', 22, 120, N'2 минут тутамд зүрхний цохилтын тоо, ачааллын үнэлгээ оруулна.
Байт тооноос дээш гарвал хурдаа сааруулна.
Байт тооноос бага байвал хурдаа нэмнэ.', 1, GETDATE());
    INSERT INTO dbo.RehabProgramBlock (ProgramId, OrderNo, Title, Kind, ExerciseId, DurationSec, DurationSteps, ShowFromDay, CheckInEverySec, GuideText, IsActive, CreateDate)
    VALUES (@P, 7, N'Бие хөргөлтийн дасгал', N'video', (SELECT Id FROM dbo.RehabExercise WHERE Code = N'EX-06'), 600, NULL, NULL, NULL, N'5-10 минут үргэлжилнэ.
Энгийн дасгалууд ба сунгалтын дасгалууд хийгдэнэ.
Төгсгөлийн үеийн зорилго нь: алхах үед олж авсан зүрх судас болон бие махбодын сэргэлтийг хадгалах, эргэн сэргээх зорилготой.', 1, GETDATE());
END
GO

-- ---- DEVICE: Зүрхний суулгац
IF NOT EXISTS (SELECT 1 FROM dbo.RehabProgram WHERE Code = N'DEVICE')
    INSERT INTO dbo.RehabProgram (Code, Name, Description, HasHrTarget, DefaultIntensityPct, WarningTemplate, OrderNo, IsActive, CreateDate)
    VALUES (N'DEVICE', N'Зүрхний суулгац', N'Төсөл - эмнэлзүйн багаар батлагдаагүй', 1, 30, N'Та өнөөдөр дасгалын туршид ЗЦТ-оо {target}-аас дээш гаргахгүй дасгалаа хийнэ үү. Хэрэв ЗЦТ {target}-аас дээш гарвал түр амрах буюу дасгалыг удаашруулж ЗЦТ-оо {target}-аас буулгана уу.', 3, 1, GETDATE());
GO

DECLARE @P INT = (SELECT Id FROM dbo.RehabProgram WHERE Code = N'DEVICE');
IF NOT EXISTS (SELECT 1 FROM dbo.RehabProgramBlock WHERE ProgramId = @P)
BEGIN
    INSERT INTO dbo.RehabProgramBlock (ProgramId, OrderNo, Title, Kind, ExerciseId, DurationSec, DurationSteps, ShowFromDay, CheckInEverySec, GuideText, IsActive, CreateDate)
    VALUES (@P, 1, N'Бие халаалтын дасгал', N'video', (SELECT Id FROM dbo.RehabExercise WHERE Code = N'EX-01'), 600, NULL, NULL, NULL, N'5-10 минут үргэлжилнэ.
Энгийн дасгалуудаас бүрдэнэ.
Бие халаалтаар зүрх судасны үйл ажиллагаа бие махбодыг дасгалын дараагийн үе шатанд бэлтгэх зорилготой.', 1, GETDATE());
    INSERT INTO dbo.RehabProgramBlock (ProgramId, OrderNo, Title, Kind, ExerciseId, DurationSec, DurationSteps, ShowFromDay, CheckInEverySec, GuideText, IsActive, CreateDate)
    VALUES (@P, 2, N'Алхах', N'timed', NULL, NULL, N'[{"fromDay":1,"toDay":7,"min":10},{"fromDay":8,"toDay":14,"min":15},{"fromDay":15,"toDay":21,"min":20},{"fromDay":22,"min":30}]', NULL, 120, N'2 минут тутамд зүрхний цохилтын тоо, ачааллын үнэлгээ оруулна.
Байт тооноос дээш гарвал хурдаа сааруулна.
Байт тооноос бага байвал хурдаа нэмнэ.', 1, GETDATE());
    INSERT INTO dbo.RehabProgramBlock (ProgramId, OrderNo, Title, Kind, ExerciseId, DurationSec, DurationSteps, ShowFromDay, CheckInEverySec, GuideText, IsActive, CreateDate)
    VALUES (@P, 3, N'Дугуй жийх', N'timed', NULL, NULL, N'[{"fromDay":1,"toDay":7,"min":10},{"fromDay":8,"toDay":14,"min":15},{"fromDay":15,"toDay":21,"min":20},{"fromDay":22,"min":30}]', NULL, 120, N'2 минут тутамд зүрхний цохилтын тоо, ачааллын үнэлгээ оруулна.
Байт тооноос дээш гарвал хурдаа сааруулна.
Байт тооноос бага байвал хурдаа нэмнэ.', 1, GETDATE());
    INSERT INTO dbo.RehabProgramBlock (ProgramId, OrderNo, Title, Kind, ExerciseId, DurationSec, DurationSteps, ShowFromDay, CheckInEverySec, GuideText, IsActive, CreateDate)
    VALUES (@P, 4, N'Гарын хүчний дасгал', N'video', (SELECT Id FROM dbo.RehabExercise WHERE Code = N'EX-02'), 600, NULL, NULL, NULL, NULL, 1, GETDATE());
    INSERT INTO dbo.RehabProgramBlock (ProgramId, OrderNo, Title, Kind, ExerciseId, DurationSec, DurationSteps, ShowFromDay, CheckInEverySec, GuideText, IsActive, CreateDate)
    VALUES (@P, 5, N'Хөлийн хүчний дасгал', N'video', (SELECT Id FROM dbo.RehabExercise WHERE Code = N'EX-03'), 600, NULL, NULL, NULL, NULL, 1, GETDATE());
    INSERT INTO dbo.RehabProgramBlock (ProgramId, OrderNo, Title, Kind, ExerciseId, DurationSec, DurationSteps, ShowFromDay, CheckInEverySec, GuideText, IsActive, CreateDate)
    VALUES (@P, 6, N'Шатаар алхах', N'timed', NULL, NULL, N'[{"fromDay":22,"toDay":28,"min":5},{"fromDay":29,"toDay":35,"min":10},{"fromDay":36,"toDay":42,"min":15},{"fromDay":43,"min":20}]', 22, 120, N'2 минут тутамд зүрхний цохилтын тоо, ачааллын үнэлгээ оруулна.
Байт тооноос дээш гарвал хурдаа сааруулна.
Байт тооноос бага байвал хурдаа нэмнэ.', 1, GETDATE());
    INSERT INTO dbo.RehabProgramBlock (ProgramId, OrderNo, Title, Kind, ExerciseId, DurationSec, DurationSteps, ShowFromDay, CheckInEverySec, GuideText, IsActive, CreateDate)
    VALUES (@P, 7, N'Бие хөргөлтийн дасгал', N'video', (SELECT Id FROM dbo.RehabExercise WHERE Code = N'EX-06'), 600, NULL, NULL, NULL, N'5-10 минут үргэлжилнэ.
Энгийн дасгалууд ба сунгалтын дасгалууд хийгдэнэ.
Төгсгөлийн үеийн зорилго нь: алхах үед олж авсан зүрх судас болон бие махбодын сэргэлтийг хадгалах, эргэн сэргээх зорилготой.', 1, GETDATE());
END
GO

-- ---- SURGERY: Зүрхний мэс засал
IF NOT EXISTS (SELECT 1 FROM dbo.RehabProgram WHERE Code = N'SURGERY')
    INSERT INTO dbo.RehabProgram (Code, Name, Description, HasHrTarget, DefaultIntensityPct, WarningTemplate, OrderNo, IsActive, CreateDate)
    VALUES (N'SURGERY', N'Зүрхний мэс засал', N'Төсөл - эмнэлзүйн багаар батлагдаагүй', 1, 30, N'Та өнөөдөр дасгалын туршид ЗЦТ-оо {target}-аас дээш гаргахгүй дасгалаа хийнэ үү. Хэрэв ЗЦТ {target}-аас дээш гарвал түр амрах буюу дасгалыг удаашруулж ЗЦТ-оо {target}-аас буулгана уу.', 4, 1, GETDATE());
GO

DECLARE @P INT = (SELECT Id FROM dbo.RehabProgram WHERE Code = N'SURGERY');
IF NOT EXISTS (SELECT 1 FROM dbo.RehabProgramBlock WHERE ProgramId = @P)
BEGIN
    INSERT INTO dbo.RehabProgramBlock (ProgramId, OrderNo, Title, Kind, ExerciseId, DurationSec, DurationSteps, ShowFromDay, CheckInEverySec, GuideText, IsActive, CreateDate)
    VALUES (@P, 1, N'Бие халаалтын дасгал', N'video', (SELECT Id FROM dbo.RehabExercise WHERE Code = N'EX-01'), 600, NULL, NULL, NULL, N'5-10 минут үргэлжилнэ.
Энгийн дасгалуудаас бүрдэнэ.
Бие халаалтаар зүрх судасны үйл ажиллагаа бие махбодыг дасгалын дараагийн үе шатанд бэлтгэх зорилготой.', 1, GETDATE());
    INSERT INTO dbo.RehabProgramBlock (ProgramId, OrderNo, Title, Kind, ExerciseId, DurationSec, DurationSteps, ShowFromDay, CheckInEverySec, GuideText, IsActive, CreateDate)
    VALUES (@P, 2, N'Алхах', N'timed', NULL, NULL, N'[{"fromDay":1,"toDay":7,"min":10},{"fromDay":8,"toDay":14,"min":15},{"fromDay":15,"toDay":21,"min":20},{"fromDay":22,"min":30}]', NULL, 120, N'2 минут тутамд зүрхний цохилтын тоо, ачааллын үнэлгээ оруулна.
Байт тооноос дээш гарвал хурдаа сааруулна.
Байт тооноос бага байвал хурдаа нэмнэ.', 1, GETDATE());
    INSERT INTO dbo.RehabProgramBlock (ProgramId, OrderNo, Title, Kind, ExerciseId, DurationSec, DurationSteps, ShowFromDay, CheckInEverySec, GuideText, IsActive, CreateDate)
    VALUES (@P, 3, N'Дугуй жийх', N'timed', NULL, NULL, N'[{"fromDay":1,"toDay":7,"min":10},{"fromDay":8,"toDay":14,"min":15},{"fromDay":15,"toDay":21,"min":20},{"fromDay":22,"min":30}]', NULL, 120, N'2 минут тутамд зүрхний цохилтын тоо, ачааллын үнэлгээ оруулна.
Байт тооноос дээш гарвал хурдаа сааруулна.
Байт тооноос бага байвал хурдаа нэмнэ.', 1, GETDATE());
    INSERT INTO dbo.RehabProgramBlock (ProgramId, OrderNo, Title, Kind, ExerciseId, DurationSec, DurationSteps, ShowFromDay, CheckInEverySec, GuideText, IsActive, CreateDate)
    VALUES (@P, 4, N'Гарын хүчний дасгал', N'video', (SELECT Id FROM dbo.RehabExercise WHERE Code = N'EX-02'), 600, NULL, NULL, NULL, NULL, 1, GETDATE());
    INSERT INTO dbo.RehabProgramBlock (ProgramId, OrderNo, Title, Kind, ExerciseId, DurationSec, DurationSteps, ShowFromDay, CheckInEverySec, GuideText, IsActive, CreateDate)
    VALUES (@P, 5, N'Хөлийн хүчний дасгал', N'video', (SELECT Id FROM dbo.RehabExercise WHERE Code = N'EX-03'), 600, NULL, NULL, NULL, NULL, 1, GETDATE());
    INSERT INTO dbo.RehabProgramBlock (ProgramId, OrderNo, Title, Kind, ExerciseId, DurationSec, DurationSteps, ShowFromDay, CheckInEverySec, GuideText, IsActive, CreateDate)
    VALUES (@P, 6, N'Амьсгалын дасгал', N'video', (SELECT Id FROM dbo.RehabExercise WHERE Code = N'EX-04'), 600, NULL, NULL, NULL, NULL, 1, GETDATE());
    INSERT INTO dbo.RehabProgramBlock (ProgramId, OrderNo, Title, Kind, ExerciseId, DurationSec, DurationSteps, ShowFromDay, CheckInEverySec, GuideText, IsActive, CreateDate)
    VALUES (@P, 7, N'Ханиалгах дасгал', N'video', (SELECT Id FROM dbo.RehabExercise WHERE Code = N'EX-05'), 300, NULL, NULL, NULL, NULL, 1, GETDATE());
    INSERT INTO dbo.RehabProgramBlock (ProgramId, OrderNo, Title, Kind, ExerciseId, DurationSec, DurationSteps, ShowFromDay, CheckInEverySec, GuideText, IsActive, CreateDate)
    VALUES (@P, 8, N'Шатаар алхах', N'timed', NULL, NULL, N'[{"fromDay":22,"toDay":28,"min":5},{"fromDay":29,"toDay":35,"min":10},{"fromDay":36,"toDay":42,"min":15},{"fromDay":43,"min":20}]', 22, 120, N'2 минут тутамд зүрхний цохилтын тоо, ачааллын үнэлгээ оруулна.
Байт тооноос дээш гарвал хурдаа сааруулна.
Байт тооноос бага байвал хурдаа нэмнэ.', 1, GETDATE());
    INSERT INTO dbo.RehabProgramBlock (ProgramId, OrderNo, Title, Kind, ExerciseId, DurationSec, DurationSteps, ShowFromDay, CheckInEverySec, GuideText, IsActive, CreateDate)
    VALUES (@P, 9, N'Бие хөргөлтийн дасгал', N'video', (SELECT Id FROM dbo.RehabExercise WHERE Code = N'EX-06'), 600, NULL, NULL, NULL, N'5-10 минут үргэлжилнэ.
Энгийн дасгалууд ба сунгалтын дасгалууд хийгдэнэ.
Төгсгөлийн үеийн зорилго нь: алхах үед олж авсан зүрх судас болон бие махбодын сэргэлтийг хадгалах, эргэн сэргээх зорилготой.', 1, GETDATE());
END
GO

-- ---- STROKE: Тархины харвалт
IF NOT EXISTS (SELECT 1 FROM dbo.RehabProgram WHERE Code = N'STROKE')
    INSERT INTO dbo.RehabProgram (Code, Name, Description, HasHrTarget, DefaultIntensityPct, WarningTemplate, OrderNo, IsActive, CreateDate)
    VALUES (N'STROKE', N'Тархины харвалт', N'Төсөл - эмнэлзүйн багаар батлагдаагүй', 0, NULL, NULL, 5, 1, GETDATE());
GO

DECLARE @P INT = (SELECT Id FROM dbo.RehabProgram WHERE Code = N'STROKE');
IF NOT EXISTS (SELECT 1 FROM dbo.RehabProgramBlock WHERE ProgramId = @P)
BEGIN
    INSERT INTO dbo.RehabProgramBlock (ProgramId, OrderNo, Title, Kind, ExerciseId, DurationSec, DurationSteps, ShowFromDay, CheckInEverySec, GuideText, IsActive, CreateDate)
    VALUES (@P, 1, N'Амин үзүүлэлт хянах (эмчилгээний өмнө)', N'vitals', NULL, NULL, NULL, NULL, NULL, N'Даралт / Пульс / Сатураци / Сахар', 1, GETDATE());
    INSERT INTO dbo.RehabProgramBlock (ProgramId, OrderNo, Title, Kind, ExerciseId, DurationSec, DurationSteps, ShowFromDay, CheckInEverySec, GuideText, IsActive, CreateDate)
    VALUES (@P, 2, N'Зөв байрлал', N'video', (SELECT Id FROM dbo.RehabExercise WHERE Code = N'EX-07'), 300, NULL, NULL, NULL, NULL, 1, GETDATE());
    INSERT INTO dbo.RehabProgramBlock (ProgramId, OrderNo, Title, Kind, ExerciseId, DurationSec, DurationSteps, ShowFromDay, CheckInEverySec, GuideText, IsActive, CreateDate)
    VALUES (@P, 3, N'Шилжих хөдөлгөөн', N'video', (SELECT Id FROM dbo.RehabExercise WHERE Code = N'EX-08'), 300, NULL, NULL, NULL, NULL, 1, GETDATE());
    INSERT INTO dbo.RehabProgramBlock (ProgramId, OrderNo, Title, Kind, ExerciseId, DurationSec, DurationSteps, ShowFromDay, CheckInEverySec, GuideText, IsActive, CreateDate)
    VALUES (@P, 4, N'Хэвтээ үеийн гарын идэвхгүй дасгал', N'video', (SELECT Id FROM dbo.RehabExercise WHERE Code = N'EX-09'), 600, NULL, NULL, NULL, NULL, 1, GETDATE());
    INSERT INTO dbo.RehabProgramBlock (ProgramId, OrderNo, Title, Kind, ExerciseId, DurationSec, DurationSteps, ShowFromDay, CheckInEverySec, GuideText, IsActive, CreateDate)
    VALUES (@P, 5, N'Хэвтээ үеийн хөлийн идэвхгүй дасгал', N'video', (SELECT Id FROM dbo.RehabExercise WHERE Code = N'EX-10'), 600, NULL, NULL, NULL, NULL, 1, GETDATE());
    INSERT INTO dbo.RehabProgramBlock (ProgramId, OrderNo, Title, Kind, ExerciseId, DurationSec, DurationSteps, ShowFromDay, CheckInEverySec, GuideText, IsActive, CreateDate)
    VALUES (@P, 6, N'Хэвтээ үеийн гарын идэвхтэй дасгал', N'video', (SELECT Id FROM dbo.RehabExercise WHERE Code = N'EX-11'), 600, NULL, NULL, NULL, NULL, 1, GETDATE());
    INSERT INTO dbo.RehabProgramBlock (ProgramId, OrderNo, Title, Kind, ExerciseId, DurationSec, DurationSteps, ShowFromDay, CheckInEverySec, GuideText, IsActive, CreateDate)
    VALUES (@P, 7, N'Хэвтээ үеийн хөлийн идэвхтэй дасгал', N'video', (SELECT Id FROM dbo.RehabExercise WHERE Code = N'EX-12'), 600, NULL, NULL, NULL, NULL, 1, GETDATE());
    INSERT INTO dbo.RehabProgramBlock (ProgramId, OrderNo, Title, Kind, ExerciseId, DurationSec, DurationSteps, ShowFromDay, CheckInEverySec, GuideText, IsActive, CreateDate)
    VALUES (@P, 8, N'Суугаа үеийн гарын идэвхтэй дасгал', N'video', (SELECT Id FROM dbo.RehabExercise WHERE Code = N'EX-13'), 600, NULL, NULL, NULL, NULL, 1, GETDATE());
    INSERT INTO dbo.RehabProgramBlock (ProgramId, OrderNo, Title, Kind, ExerciseId, DurationSec, DurationSteps, ShowFromDay, CheckInEverySec, GuideText, IsActive, CreateDate)
    VALUES (@P, 9, N'Суугаа үеийн хөлийн идэвхтэй дасгал', N'video', (SELECT Id FROM dbo.RehabExercise WHERE Code = N'EX-14'), 600, NULL, NULL, NULL, NULL, 1, GETDATE());
    INSERT INTO dbo.RehabProgramBlock (ProgramId, OrderNo, Title, Kind, ExerciseId, DurationSec, DurationSteps, ShowFromDay, CheckInEverySec, GuideText, IsActive, CreateDate)
    VALUES (@P, 10, N'Зогсоод хийх хөлийн идэвхтэй дасгал', N'video', (SELECT Id FROM dbo.RehabExercise WHERE Code = N'EX-15'), 600, NULL, NULL, NULL, NULL, 1, GETDATE());
    INSERT INTO dbo.RehabProgramBlock (ProgramId, OrderNo, Title, Kind, ExerciseId, DurationSec, DurationSteps, ShowFromDay, CheckInEverySec, GuideText, IsActive, CreateDate)
    VALUES (@P, 11, N'Зөв босож суух дасгал', N'video', (SELECT Id FROM dbo.RehabExercise WHERE Code = N'EX-16'), 300, NULL, NULL, NULL, NULL, 1, GETDATE());
    INSERT INTO dbo.RehabProgramBlock (ProgramId, OrderNo, Title, Kind, ExerciseId, DurationSec, DurationSteps, ShowFromDay, CheckInEverySec, GuideText, IsActive, CreateDate)
    VALUES (@P, 12, N'Хэвтээ үеийн гарын дасгал', N'video', (SELECT Id FROM dbo.RehabExercise WHERE Code = N'EX-17'), 600, NULL, NULL, NULL, NULL, 1, GETDATE());
    INSERT INTO dbo.RehabProgramBlock (ProgramId, OrderNo, Title, Kind, ExerciseId, DurationSec, DurationSteps, ShowFromDay, CheckInEverySec, GuideText, IsActive, CreateDate)
    VALUES (@P, 13, N'Суугаа үеийн гарын дасгал', N'video', (SELECT Id FROM dbo.RehabExercise WHERE Code = N'EX-18'), 600, NULL, NULL, NULL, NULL, 1, GETDATE());
    INSERT INTO dbo.RehabProgramBlock (ProgramId, OrderNo, Title, Kind, ExerciseId, DurationSec, DurationSteps, ShowFromDay, CheckInEverySec, GuideText, IsActive, CreateDate)
    VALUES (@P, 14, N'Хэвтээ үеийн хөлийн дасгал', N'video', (SELECT Id FROM dbo.RehabExercise WHERE Code = N'EX-19'), 600, NULL, NULL, NULL, NULL, 1, GETDATE());
    INSERT INTO dbo.RehabProgramBlock (ProgramId, OrderNo, Title, Kind, ExerciseId, DurationSec, DurationSteps, ShowFromDay, CheckInEverySec, GuideText, IsActive, CreateDate)
    VALUES (@P, 15, N'Суугаа үеийн хөлийн дасгал', N'video', (SELECT Id FROM dbo.RehabExercise WHERE Code = N'EX-20'), 600, NULL, NULL, NULL, NULL, 1, GETDATE());
    INSERT INTO dbo.RehabProgramBlock (ProgramId, OrderNo, Title, Kind, ExerciseId, DurationSec, DurationSteps, ShowFromDay, CheckInEverySec, GuideText, IsActive, CreateDate)
    VALUES (@P, 16, N'Зогсоо үеийн хөлийн дасгал', N'video', (SELECT Id FROM dbo.RehabExercise WHERE Code = N'EX-21'), 600, NULL, NULL, NULL, NULL, 1, GETDATE());
    INSERT INTO dbo.RehabProgramBlock (ProgramId, OrderNo, Title, Kind, ExerciseId, DurationSec, DurationSteps, ShowFromDay, CheckInEverySec, GuideText, IsActive, CreateDate)
    VALUES (@P, 17, N'Шагайн үений сунгалын дасгал', N'video', (SELECT Id FROM dbo.RehabExercise WHERE Code = N'EX-22'), 300, NULL, NULL, NULL, NULL, 1, GETDATE());
    INSERT INTO dbo.RehabProgramBlock (ProgramId, OrderNo, Title, Kind, ExerciseId, DurationSec, DurationSteps, ShowFromDay, CheckInEverySec, GuideText, IsActive, CreateDate)
    VALUES (@P, 18, N'Тэнцвэрийн дасгал', N'video', (SELECT Id FROM dbo.RehabExercise WHERE Code = N'EX-23'), 600, NULL, NULL, NULL, NULL, 1, GETDATE());
    INSERT INTO dbo.RehabProgramBlock (ProgramId, OrderNo, Title, Kind, ExerciseId, DurationSec, DurationSteps, ShowFromDay, CheckInEverySec, GuideText, IsActive, CreateDate)
    VALUES (@P, 19, N'Алхах дасгал', N'video', (SELECT Id FROM dbo.RehabExercise WHERE Code = N'EX-24'), 300, NULL, NULL, NULL, NULL, 1, GETDATE());
    INSERT INTO dbo.RehabProgramBlock (ProgramId, OrderNo, Title, Kind, ExerciseId, DurationSec, DurationSteps, ShowFromDay, CheckInEverySec, GuideText, IsActive, CreateDate)
    VALUES (@P, 20, N'Амьсгалын дасгал', N'video', (SELECT Id FROM dbo.RehabExercise WHERE Code = N'EX-25'), 600, NULL, NULL, NULL, NULL, 1, GETDATE());
    INSERT INTO dbo.RehabProgramBlock (ProgramId, OrderNo, Title, Kind, ExerciseId, DurationSec, DurationSteps, ShowFromDay, CheckInEverySec, GuideText, IsActive, CreateDate)
    VALUES (@P, 21, N'Хүзүүний дасгал', N'video', (SELECT Id FROM dbo.RehabExercise WHERE Code = N'EX-26'), 600, NULL, NULL, NULL, NULL, 1, GETDATE());
    INSERT INTO dbo.RehabProgramBlock (ProgramId, OrderNo, Title, Kind, ExerciseId, DurationSec, DurationSteps, ShowFromDay, CheckInEverySec, GuideText, IsActive, CreateDate)
    VALUES (@P, 22, N'Мөрний үений дасгал', N'video', (SELECT Id FROM dbo.RehabExercise WHERE Code = N'EX-27'), 600, NULL, NULL, NULL, NULL, 1, GETDATE());
    INSERT INTO dbo.RehabProgramBlock (ProgramId, OrderNo, Title, Kind, ExerciseId, DurationSec, DurationSteps, ShowFromDay, CheckInEverySec, GuideText, IsActive, CreateDate)
    VALUES (@P, 23, N'Нурууны дасгал', N'video', (SELECT Id FROM dbo.RehabExercise WHERE Code = N'EX-28'), 600, NULL, NULL, NULL, NULL, 1, GETDATE());
    INSERT INTO dbo.RehabProgramBlock (ProgramId, OrderNo, Title, Kind, ExerciseId, DurationSec, DurationSteps, ShowFromDay, CheckInEverySec, GuideText, IsActive, CreateDate)
    VALUES (@P, 24, N'Өвдөгний дасгал', N'video', (SELECT Id FROM dbo.RehabExercise WHERE Code = N'EX-29'), 600, NULL, NULL, NULL, NULL, 1, GETDATE());
    INSERT INTO dbo.RehabProgramBlock (ProgramId, OrderNo, Title, Kind, ExerciseId, DurationSec, DurationSteps, ShowFromDay, CheckInEverySec, GuideText, IsActive, CreateDate)
    VALUES (@P, 25, N'Амин үзүүлэлт хянах (эмчилгээний дараа)', N'vitals', NULL, NULL, NULL, NULL, NULL, N'Даралт / Пульс / Сатураци / Сахар', 1, GETDATE());
END
GO

-- ---- Demo movements for EX-01, segment loops over 0917.mp4 (MediaRef set later)
DECLARE @E INT = (SELECT Id FROM dbo.RehabExercise WHERE Code = 'EX-01');
IF @E IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.RehabMovement WHERE ExerciseId = @E)
BEGIN
    INSERT INTO dbo.RehabMovement (ExerciseId, OrderNo, Name, GuideText, MediaRef, ThumbRef, WorkSec, Reps, PrepSec, LoopStartMs, LoopEndMs, IsActive, CreateDate)
    VALUES (@E, 1, N'Гүнзгий амьсгалах (батлагдаагүй)', N'Нуруугаа тэгшлэн сууна
Хамраараа удаан амьсгал авна
Амаараа удаан гаргана', NULL, NULL, 30, NULL, 10, 0, 5500, 1, GETDATE());
    INSERT INTO dbo.RehabMovement (ExerciseId, OrderNo, Name, GuideText, MediaRef, ThumbRef, WorkSec, Reps, PrepSec, LoopStartMs, LoopEndMs, IsActive, CreateDate)
    VALUES (@E, 2, N'Гараа дээш өргөх (батлагдаагүй)', N'Хоёр гараа дээш өргөнө
Удаан буулгана', NULL, NULL, NULL, 8, 10, 5500, 12500, 1, GETDATE());
    INSERT INTO dbo.RehabMovement (ExerciseId, OrderNo, Name, GuideText, MediaRef, ThumbRef, WorkSec, Reps, PrepSec, LoopStartMs, LoopEndMs, IsActive, CreateDate)
    VALUES (@E, 3, N'Хүзүүг хажуу тийш тонгойлгох (батлагдаагүй)', N'Нэг гараа толгой дээрээ тавина
Толгойгоо мөр рүү удаан тонгойлгоно
Нөгөө талд давтана', NULL, NULL, 30, NULL, 10, 12500, 34000, 1, GETDATE());
    INSERT INTO dbo.RehabMovement (ExerciseId, OrderNo, Name, GuideText, MediaRef, ThumbRef, WorkSec, Reps, PrepSec, LoopStartMs, LoopEndMs, IsActive, CreateDate)
    VALUES (@E, 4, N'Их биеийг эргүүлэх (батлагдаагүй)', N'Гараа толгойн ард тавина
Их биеэ хажуу тийш эргүүлнэ', NULL, NULL, NULL, 8, 10, 34000, 43000, 1, GETDATE());
    INSERT INTO dbo.RehabMovement (ExerciseId, OrderNo, Name, GuideText, MediaRef, ThumbRef, WorkSec, Reps, PrepSec, LoopStartMs, LoopEndMs, IsActive, CreateDate)
    VALUES (@E, 5, N'Мөрийг сунгах (батлагдаагүй)', N'Нэг гараа цээжин дээгүүр татна
Нөгөө гараараа зөөлөн дарна
Гараа солино', NULL, NULL, 30, NULL, 10, 57500, 72000, 1, GETDATE());
    INSERT INTO dbo.RehabMovement (ExerciseId, OrderNo, Name, GuideText, MediaRef, ThumbRef, WorkSec, Reps, PrepSec, LoopStartMs, LoopEndMs, IsActive, CreateDate)
    VALUES (@E, 6, N'Гарын ар талыг сунгах (батлагдаагүй)', N'Гараа толгойн ард нугална
Тохойноос зөөлөн татна
Гараа солино', NULL, NULL, 30, NULL, 10, 72000, 86000, 1, GETDATE());
END
GO
