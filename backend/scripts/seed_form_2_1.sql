-- =============================================================================
-- Form 2.1  ЭЛЕКТРОФИЗИОЛОГИЙН ШИНЖИЛГЭЭ / АБЛАЦИ ЭМЧИЛГЭЭНИЙ ПРОТОКОЛ
-- Source: "MN cardio upgrade.docx", appendix 2.1
--
-- Hand-authored, not generated: 2.1 is a free-form protocol sheet (5 small
-- tables plus 18 loose paragraphs), so a generator would have invented
-- structure rather than read it.
--
-- Three fields are FieldType 'Table' - repeating grids whose value is a JSON
-- array of rows inside TenderFormData.Data:
--   ActLog      the ACT time/value log
--   PvIsolation the 4-vein x 5-attempt pulmonary vein isolation grid
--   DoseList    the 8-dose list
--
-- Wording is verbatim from the tender. Field codes and types are derived and
-- NOT approved - clinical sign-off is the customer's step.
--
-- Idempotent. Run add_tenderformfield_tableconfig.sql first.
-- =============================================================================

SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @db sysname = DB_NAME();
IF @db NOT IN ('MnCardio_restored', 'MnCardioNew')
BEGIN
    RAISERROR('Refusing to run: unexpected database "%s".', 16, 1, @db);
    SET NOEXEC ON;
END
GO

-- ---- option sets -------------------------------------------------------------
DELETE FROM dbo.OptionTypes WHERE dico LIKE 'f21[_]%';

IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f21_ajilbar')
    INSERT INTO dbo.DicoType (dico, Name, Description)
    VALUES ('f21_ajilbar', N'2.1 Ажилбарын төрөл', N'GENERATED from tender appendix 2.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f21_onosh')
    INSERT INTO dbo.DicoType (dico, Name, Description)
    VALUES ('f21_onosh', N'2.1 ЭФШ онош', N'GENERATED from tender appendix 2.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f21_arga')
    INSERT INTO dbo.DicoType (dico, Name, Description)
    VALUES ('f21_arga', N'2.1 Аблацийн арга', N'GENERATED from tender appendix 2.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f21_pvi')
    INSERT INTO dbo.DicoType (dico, Name, Description)
    VALUES ('f21_pvi', N'2.1 Уушгины венийн тусгаарлалтын арга', N'GENERATED from tender appendix 2.1');

INSERT INTO dbo.OptionTypes (dico, label, value, pos, translate_flag) VALUES
('f21_ajilbar', N'Төлөвлөгөөт', 'o1', 1, 0),
('f21_ajilbar', N'Яаралтай',    'o2', 2, 0),

('f21_onosh', N'ТЖ',     'o1', 1, 0),
('f21_onosh', N'ТЧ',     'o2', 2, 0),
('f21_onosh', N'AVNRT',  'o3', 3, 0),
('f21_onosh', N'AVRT',   'o4', 4, 0),
('f21_onosh', N'ATachy', 'o5', 5, 0),
('f21_onosh', N'ХТ',     'o6', 6, 0),
('f21_onosh', N'КНА',    'o7', 7, 0),
('f21_onosh', N'PVC',    'o8', 8, 0),

('f21_arga', N'КА',             'o1', 1, 0),
('f21_arga', N'Крио',           'o2', 2, 0),
('f21_arga', N'ХДА /PFA/',      'o3', 3, 0),
('f21_arga', N'Таславч хатгах', 'o4', 4, 0),

('f21_pvi', N'RFCA', 'o1', 1, 0),
('f21_pvi', N'Cryo', 'o2', 2, 0),
('f21_pvi', N'PFA',  'o3', 3, 0);
GO

-- ---- the form ----------------------------------------------------------------
DECLARE @Form varchar(20) = '2.1';
BEGIN TRAN;

IF EXISTS (SELECT 1 FROM dbo.TenderForm WHERE FormCode = @Form)
    UPDATE dbo.TenderForm
       SET NameMn = N'Электрофизиологийн шинжилгээ / Аблаци эмчилгээний протокол',
           GroupCode = 'rhythm', GroupLabelMn = N'Зүрх судасны хэм судлалын маягтууд',
           Position = 21, IsActive = 1, UpdateDate = GETDATE()
     WHERE FormCode = @Form;
ELSE
    INSERT INTO dbo.TenderForm (FormCode, NameMn, GroupCode, GroupLabelMn, Position)
    VALUES (@Form, N'Электрофизиологийн шинжилгээ / Аблаци эмчилгээний протокол',
            'rhythm', N'Зүрх судасны хэм судлалын маягтууд', 21);

DELETE FROM dbo.TenderFormField WHERE FormCode = @Form;

INSERT INTO dbo.TenderFormField
    (FormCode, FieldCode, LabelMn, FieldType, OptionType, SectionCode, SectionLabel,
     SectionPos, ParentField, ParentValue, IsRequired, IsSearchable, Md, Position,
     Unit, HelpTextMn, TableConfig, TableRows)
VALUES
-- 1. header ---------------------------------------------------------------------
(@Form,'Ognoo',        N'Огноо','Date',NULL,'header',N'Ерөнхий мэдээлэл',0,NULL,NULL,1,1,4,10,NULL,NULL,NULL,NULL),
(@Form,'Tsag',         N'Цаг','Text',NULL,'header',N'Ерөнхий мэдээлэл',0,NULL,NULL,0,0,4,20,NULL,NULL,NULL,NULL),
(@Form,'UvchniiOnosh', N'Өвчний онош','Text',NULL,'header',N'Ерөнхий мэдээлэл',0,NULL,NULL,0,1,12,30,NULL,NULL,NULL,NULL),
(@Form,'AjilbarTurul', N'Ажилбар','RadioBox','f21_ajilbar','header',N'Ерөнхий мэдээлэл',0,NULL,NULL,0,1,6,40,NULL,NULL,NULL,NULL),
(@Form,'EfshOnosh',    N'ЭФШ онош','RadioBox','f21_onosh','header',N'Ерөнхий мэдээлэл',0,NULL,NULL,0,1,12,50,NULL,NULL,NULL,NULL),
(@Form,'AblatsiArga',  N'Ажилбарын арга','RadioBox','f21_arga','header',N'Ерөнхий мэдээлэл',0,NULL,NULL,0,1,12,60,NULL,NULL,NULL,NULL),

-- 2. catheters -------------------------------------------------------------------
(@Form,'ChiglvvlegchArteri', N'Баруун/зүүн цавины артерийн чиглүүлэгч (№/Хэмжээ)','Text',NULL,'catheter',N'Чиглүүлэгч',1,NULL,NULL,0,0,12,110,NULL,NULL,NULL,NULL),
(@Form,'ChiglvvlegchVen1',   N'Баруун/зүүн цавины венийн чиглүүлэгч 1 (№/Хэмжээ)','Text',NULL,'catheter',N'Чиглүүлэгч',1,NULL,NULL,0,0,12,120,NULL,NULL,NULL,NULL),
(@Form,'ChiglvvlegchVen2',   N'Баруун/зүүн цавины венийн чиглүүлэгч 2 (№/Хэмжээ)','Text',NULL,'catheter',N'Чиглүүлэгч',1,NULL,NULL,0,0,12,130,NULL,NULL,NULL,NULL),

-- 3. EP measurements --------------------------------------------------------------
(@Form,'cSNRT',  N'cSNRT','Number',NULL,'efsh',N'ЭФШ-д илэрсэн өөрчлөлт',2,NULL,NULL,0,0,3,210,N'ms',NULL,NULL,NULL),
(@Form,'CL',     N'CL','Number',NULL,'efsh',N'ЭФШ-д илэрсэн өөрчлөлт',2,NULL,NULL,0,0,3,220,N'ms',NULL,NULL,NULL),
(@Form,'AH',     N'AH','Number',NULL,'efsh',N'ЭФШ-д илэрсэн өөрчлөлт',2,NULL,NULL,0,0,3,230,N'msec',NULL,NULL,NULL),
(@Form,'HV',     N'HV','Number',NULL,'efsh',N'ЭФШ-д илэрсэн өөрчлөлт',2,NULL,NULL,0,0,3,240,N'msec',NULL,NULL,NULL),
(@Form,'His',    N'His','Number',NULL,'efsh',N'ЭФШ-д илэрсэн өөрчлөлт',2,NULL,NULL,0,0,3,250,N'msec',NULL,NULL,NULL),
(@Form,'QRS',    N'QRS','Number',NULL,'efsh',N'ЭФШ-д илэрсэн өөрчлөлт',2,NULL,NULL,0,0,3,260,N'msec',NULL,NULL,NULL),
(@Form,'AVNERP', N'AVNERP','Number',NULL,'efsh',N'ЭФШ-д илэрсэн өөрчлөлт',2,NULL,NULL,0,0,3,270,NULL,NULL,NULL,NULL),
(@Form,'EfshTemdeglel', N'Тэмдэглэл','TextArea',NULL,'efsh',N'ЭФШ-д илэрсэн өөрчлөлт',2,NULL,NULL,0,0,12,280,NULL,NULL,NULL,NULL),

-- 4. ACT log (repeating) -----------------------------------------------------------
(@Form,'ActLog', N'ACT хяналт','Table',NULL,'act',N'ACT',3,NULL,NULL,0,0,12,310,NULL,
 N'Ажилбарын явцад хэмжсэн ACT утгууд',
 N'[{"code":"tsag","label":"Цаг","type":"Text"},{"code":"act","label":"ACT","type":"Number"}]', NULL),

-- 5. pulmonary vein isolation (repeating grid) --------------------------------------
(@Form,'PviArga', N'Уушгины венийн тусгаарласан аблаци','RadioBox','f21_pvi','pvi',N'Уушгины венийн тусгаарлалт',4,NULL,NULL,0,1,12,410,NULL,NULL,NULL,NULL),
(@Form,'PvIsolation', N'Уушгины венийн тусгаарлалтын мэдээлэл','Table',NULL,'pvi',N'Уушгины венийн тусгаарлалт',4,NULL,NULL,0,0,12,420,NULL,
 N'Вен тус бүрээр t0, үргэлжилсэн хугацаа, тусгаарлалт амжилттай эсэх',
 N'[{"code":"ven","label":"Уушгины вен","type":"Text"},{"code":"t0","label":"t0","type":"Text"},{"code":"hugatsaa","label":"Үргэлжилсэн хугацаа","type":"Text"},{"code":"amjilttai","label":"Тусгаарлалт амжилттай эсэх","type":"Text"}]', 5),

-- 6. doses (repeating) --------------------------------------------------------------
(@Form,'DoseList', N'Тунгийн жагсаалт','Table',NULL,'dose',N'Тун',5,NULL,NULL,0,0,12,510,NULL,NULL,
 N'[{"code":"dugaar","label":"Тун №","type":"Text"},{"code":"utga","label":"Утга","type":"Text"}]', 8),

-- 7. procedure summary ----------------------------------------------------------------
(@Form,'TuyaaniiTun',      N'Туяаны тун','Text',NULL,'result',N'Ажилбарын дүн',6,NULL,NULL,0,0,6,610,NULL,NULL,NULL,NULL),
(@Form,'AjilbarHugatsaa',  N'Ажилбар үргэлжилсэн хугацаа','Text',NULL,'result',N'Ажилбарын дүн',6,NULL,NULL,0,0,6,620,NULL,NULL,NULL,NULL),
(@Form,'GeparinHiisen',    N'Гепарин эмчилгээ хийсэн эсэх','RadioBox','yorn','result',N'Ажилбарын дүн',6,NULL,NULL,0,1,6,630,NULL,NULL,NULL,NULL),
(@Form,'GeparinTun',       N'Тийм бол эмчилгээний тун (нэгжээр)','Number','','result',N'Ажилбарын дүн',6,'GeparinHiisen','y',0,0,6,640,N'нэгж',NULL,NULL,NULL),
(@Form,'DaraaZhash',       N'Мэс заслын дараа ЗХАШ хийх','RadioBox','yorn','result',N'Ажилбарын дүн',6,NULL,NULL,0,1,6,650,NULL,NULL,NULL,NULL),
(@Form,'Temdeglel',        N'Тэмдэглэл','TextArea',NULL,'result',N'Ажилбарын дүн',6,NULL,NULL,0,0,12,660,NULL,NULL,NULL,NULL),

-- 8. signatures --------------------------------------------------------------------
(@Form,'MesZaslynEmch', N'Мэс заслын эмч','Text',NULL,'sign',N'Баталгаажуулалт',7,NULL,NULL,0,0,4,710,NULL,NULL,NULL,NULL),
(@Form,'Inzhener',      N'Инженер','Text',NULL,'sign',N'Баталгаажуулалт',7,NULL,NULL,0,0,4,720,NULL,NULL,NULL,NULL),
(@Form,'Suvilagch',     N'Сувилагч','Text',NULL,'sign',N'Баталгаажуулалт',7,NULL,NULL,0,0,4,730,NULL,NULL,NULL,NULL);

-- GeparinTun was inserted with an empty OptionType; normalise it to NULL
UPDATE dbo.TenderFormField SET OptionType = NULL
 WHERE FormCode = @Form AND OptionType = '';

COMMIT;
GO

SET NOEXEC OFF;
GO

SELECT '2.1' AS FormCode, COUNT(*) AS Fields,
       SUM(CASE WHEN FieldType = 'Table' THEN 1 ELSE 0 END) AS TableFields
FROM dbo.TenderFormField WHERE FormCode = '2.1';
GO
