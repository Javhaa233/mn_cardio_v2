-- =============================================================================
-- Form 1.1  ЗҮРХНИЙ НЭЭЛТТЭЙ МЭС ЗАСЛЫН ӨМНӨХ ӨВЧТНИЙГ БЭЛДЭХ ШАЛГАХ ХУУДАС
-- Source: "MN cardio upgrade.docx", appendix 1.1
--
-- Seeds the form registry and its field dictionary. Field codes follow the
-- transliterated-Mongolian convention already used by SurgeryBeforeVisitsCheck
-- (Tsus, BioHimi, ZvrhTsahBichleg, TseejRentgen ...) and the 11 codes that table
-- already defines are reused verbatim so the two implementations agree.
--
-- Wording is taken from the tender verbatim. Field codes and types still need
-- clinical sign-off - that is step 1 of the WBS acceptance sequence and is the
-- customer's to give.
--
-- Idempotent: re-running refreshes the dictionary for form 1.1 only.
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

DECLARE @Form varchar(20) = '1.1';

BEGIN TRAN;

-- registry -------------------------------------------------------------------
IF EXISTS (SELECT 1 FROM dbo.TenderForm WHERE FormCode = @Form)
    UPDATE dbo.TenderForm
       SET NameMn = N'Зүрхний нээлттэй мэс заслын өмнөх өвчтнийг бэлдэх шалгах хуудас',
           GroupCode = 'surgery',
           GroupLabelMn = N'Мэс заслын маягтууд',
           Position = 11, IsActive = 1, UpdateDate = GETDATE()
     WHERE FormCode = @Form;
ELSE
    INSERT INTO dbo.TenderForm (FormCode, NameMn, GroupCode, GroupLabelMn, Position)
    VALUES (@Form,
            N'Зүрхний нээлттэй мэс заслын өмнөх өвчтнийг бэлдэх шалгах хуудас',
            'surgery', N'Мэс заслын маягтууд', 11);

-- dictionary -----------------------------------------------------------------
DELETE FROM dbo.TenderFormField WHERE FormCode = @Form;

INSERT INTO dbo.TenderFormField
    (FormCode, FieldCode, LabelMn, FieldType, OptionType,
     SectionCode, SectionLabel, SectionPos, ParentField, ParentValue,
     IsRequired, IsSearchable, Md, Position)
VALUES
-- ---- header ----------------------------------------------------------------
(@Form,'UvchTuuhDugaar',   N'Өвчний түүхийн дугаар',        'Text',   NULL,'header',N'Ерөнхий мэдээлэл',0,NULL,NULL,1,1,4,10),
(@Form,'MesZaslynOgnoo',   N'Мэс заслын огноо',             'Date',   NULL,'header',N'Ерөнхий мэдээлэл',0,NULL,NULL,1,1,4,20),
(@Form,'TuluvlugdsunMesZasal',N'Төлөвлөгдсөн мэс засал',    'Text',   NULL,'header',N'Ерөнхий мэдээлэл',0,NULL,NULL,0,1,12,30),

-- ---- 1. Лабораторийн шинжилгээ ---------------------------------------------
(@Form,'Tsus',             N'Цусны дэлгэрэнгүй шинжилгээ хийгдсэн эсэх','RadioBox','yorn','lab',N'Лабораторийн шинжилгээ',1,NULL,NULL,0,1,12,110),
(@Form,'Koagulogramm',     N'Коагулограммын шинжилгээ хийгдсэн эсэх','RadioBox','yorn','lab',N'Лабораторийн шинжилгээ',1,NULL,NULL,0,0,12,120),
(@Form,'HbA1c',            N'ЧШӨ оношлогдсон тохиолдолд HbA1c тодорхойлсон эсэх','RadioBox','yorn','lab',N'Лабораторийн шинжилгээ',1,NULL,NULL,0,0,12,130),
(@Form,'BioHimi',          N'Цусан дахь кали, кальци, төмөр, натрийн хэмжээ тодорхойлсон эсэх','RadioBox','yorn','lab',N'Лабораторийн шинжилгээ',1,NULL,NULL,0,0,12,140),
(@Form,'ElegniiUilAjillagaa',N'Элэгний үйл ажиллагааны шинжилгээ хийгдсэн эсэх','RadioBox','yorn','lab',N'Лабораторийн шинжилгээ',1,NULL,NULL,0,0,12,150),
(@Form,'BuurniiUilAjillagaa',N'Бөөрний үйл ажиллагааны шинжилгээ хийгдсэн эсэх','RadioBox','yorn','lab',N'Лабораторийн шинжилгээ',1,NULL,NULL,0,0,12,160),
(@Form,'DohTembuu',        N'ДОХ, болон тэмбүүгийн халдварын шинжилгээ хийгдсэн эсэх','RadioBox','yorn','lab',N'Лабораторийн шинжилгээ',1,NULL,NULL,0,0,12,170),
(@Form,'VirusMarker',      N'В,С вирус шинжилгээ хийгдсэн эсэх','RadioBox','yorn','lab',N'Лабораторийн шинжилгээ',1,NULL,NULL,0,1,12,180),
(@Form,'VirusIdevhijil',   N'Элэгний В,С вирусын халдвартай бол вирусын идэвхижил тодорхойлох шинжилгээ хийгдсэн эсэх','RadioBox','yorn','lab',N'Лабораторийн шинжилгээ',1,'VirusMarker','y',0,0,12,190),
(@Form,'SheesDelgerengui', N'Шээсний дэлгэрэнгүй шинжилгээ хийгдсэн эсэх','RadioBox','yorn','lab',N'Лабораторийн шинжилгээ',1,NULL,NULL,0,0,12,200),
(@Form,'SheesBakteriologi',N'Бактерури илэрсэн бол шээсний бактериологийн шинжилгээ хийгдсэн эсэх','RadioBox','yorn','lab',N'Лабораторийн шинжилгээ',1,'SheesDelgerengui','y',0,0,12,210),
(@Form,'UuhTosUzuulelt',   N'Зүрхний титэм судас нөхөн сэргээх мэс засалд орох эмчлүүлэгчид цусан дахь өөх тосны үзүүлэлтийг тодорхойлуулсан эсэх','RadioBox','yorn','lab',N'Лабораторийн шинжилгээ',1,NULL,NULL,0,0,12,220),
(@Form,'AmnyHundiiErvvlAhui',N'Мэс засалд орохын өмнө амны хөндийн эрүүл ахуйг бүрэн хангасан эсэх','RadioBox','yorn','lab',N'Лабораторийн шинжилгээ',1,NULL,NULL,0,0,12,230),
(@Form,'MRSAArchdas',      N'MRSA илрүүлэх хамрын арчдасын шинжилгээ хийгдсэн эсэх','RadioBox','yorn','lab',N'Лабораторийн шинжилгээ',1,NULL,NULL,0,0,12,240),

-- ---- 2. Багажийн шинжилгээ -------------------------------------------------
(@Form,'TseejRentgen',     N'Цээжний рентген шинжилгээ хийгдсэн эсэх','RadioBox','yorn','device',N'Багажийн шинжилгээ',2,NULL,NULL,0,1,12,310),
(@Form,'CovidTseejKTG',    N'COVID-19 халдварын дараах уушгины хүндрэлтэй бол цээжний КТГ хийлгэх','RadioBox','yorn','device',N'Багажийн шинжилгээ',2,NULL,NULL,0,0,12,320),
(@Form,'HevlinEho',        N'Хэвлийн хэт авиан шинжилгээ хийгдсэн эсэх','RadioBox','yorn','device',N'Багажийн шинжилгээ',2,NULL,NULL,0,0,12,330),
(@Form,'ZvrhTsahBichleg',  N'Зүрхний цахилгаан бичлэгийн шинжилгээ хийгдсэн эсэх','RadioBox','yorn','device',N'Багажийн шинжилгээ',2,NULL,NULL,0,1,12,340),
(@Form,'ZvrhEho',          N'Зүрхний хэт авиан шинжилгээ (TTE) хийгдсэн эсэх','RadioBox','yorn','device',N'Багажийн шинжилгээ',2,NULL,NULL,0,1,12,350),
(@Form,'UlaanHooloiTEE',   N'Тусгай заалтаар улаан хоолойн хэт авиан (TEE) шинжилгээ хийгдсэн эсэх','RadioBox','yorn','device',N'Багажийн шинжилгээ',2,NULL,NULL,0,0,12,360),
(@Form,'TitemSudasDoturh', N'45-с дээш насны эрэгтэй, эсвэл цэвэршсэн эмэгтэй хүн зүрхний нээлттэй мэс засалд ороход титэм судсан дотуурх оношилгоо хийгдсэн эсэх','RadioBox','yorn','device',N'Багажийн шинжилгээ',2,NULL,NULL,0,0,12,370),
(@Form,'Spirometr',        N'Тусгай заалтаар спирометр – уушгины багтаамжийн шинжилгээ хийгдсэн эсэх','RadioBox','yorn','device',N'Багажийн шинжилгээ',2,NULL,NULL,0,0,12,380),
(@Form,'GolSudasTomo',     N'Гол судасны мэс засал болон зүрхний нээлттэй давтан мэс засал хийгдэх бол цээжний тодосгогчтой КТГ-ийн шинжилгээ хийгдсэн эсэх','RadioBox','yorn','device',N'Багажийн шинжилгээ',2,NULL,NULL,0,0,12,390),
(@Form,'TitemSergeenZasah',N'Титэм судас сэргээн засах мэс засалд ороход','RadioBox','yorn','device',N'Багажийн шинжилгээ',2,NULL,NULL,0,0,12,400),
(@Form,'GvreeniiDupleks',  N'Гүрээний артерийн дуплекс шинжилгээ хийгдсэн эсэх','RadioBox','yorn','device',N'Багажийн шинжилгээ',2,'TitemSergeenZasah','y',0,0,12,410),
(@Form,'TarhiSudasDopler', N'Тархины судасны доплер шинжилгээ хийгдсэн эсэх','RadioBox','yorn','device',N'Багажийн шинжилгээ',2,'TitemSergeenZasah','y',0,0,12,420),
(@Form,'ZahiinArteriDopler',N'Захын артерийн доплер шинжилгээ хийгдсэн эсэх','RadioBox','yorn','device',N'Багажийн шинжилгээ',2,'TitemSergeenZasah','y',0,0,12,430),

-- ---- 3. Мэс заслын өмнөх үнэлгээ / бэлтгэл ---------------------------------
(@Form,'AminUzuulelt',     N'Амин үзүүлэлтийг үнэлсэн эсэх','RadioBox','yorn','prep',N'Мэс заслын өмнөх үнэлгээ / бэлтгэл',3,NULL,NULL,0,0,12,510),
(@Form,'UndurJin',         N'Өндөр жинг хэмжиж өвчний түүхийн нүүрэнд тэмдэглэсэн эсэх','RadioBox','yorn','prep',N'Мэс заслын өмнөх үнэлгээ / бэлтгэл',3,NULL,NULL,0,0,12,520),
(@Form,'MesZaslynZuvshuurul',N'Мэс заслын зөвшөөрөл авсан эсэх','RadioBox','yorn','prep',N'Мэс заслын өмнөх үнэлгээ / бэлтгэл',3,NULL,NULL,0,1,12,530),
(@Form,'Albumin',          N'Альбумин 20%-100 мл уусмал захиалсан эсэх','RadioBox','yorn','prep',N'Мэс заслын өмнөх үнэлгээ / бэлтгэл',3,NULL,NULL,0,0,12,540),
(@Form,'TsusHuviinTohiroo',N'Цусны хувийн тохироо үзэж цус цусан бүтээгдэхүүний захиалга хийсэн эсэх','RadioBox','yorn','prep',N'Мэс заслын өмнөх үнэлгээ / бэлтгэл',3,NULL,NULL,0,0,12,550),
(@Form,'DarshilsanUlaanEs',N'Даршилсан улаан эс захиалсан эсэх','RadioBox','yorn','prep',N'Мэс заслын өмнөх үнэлгээ / бэлтгэл',3,NULL,NULL,0,0,12,560),
(@Form,'ShineHuldusunSiiven',N'Шинэ хөлдөөсөн сийвэн захиалсан эсэх','RadioBox','yorn','prep',N'Мэс заслын өмнөх үнэлгээ / бэлтгэл',3,NULL,NULL,0,0,12,570),
(@Form,'AmisgalynDasgal',  N'Амьсгалын дасгал (УАБӨ-тэй хүнд цаг бүр хийх) заасан эсэх','RadioBox','yorn','prep',N'Мэс заслын өмнөх үнэлгээ / бэлтгэл',3,NULL,NULL,0,0,12,580),
(@Form,'TseverlehBurgui',  N'Мэс заслын өмнөх орой цэвэрлэх бургуй тавьсан эсэх','RadioBox','yorn','prep',N'Мэс заслын өмнөх үнэлгээ / бэлтгэл',3,NULL,NULL,0,0,12,590),
(@Form,'SharhniiHaldvar',  N'Мэс заслын шархны халдвараас сэргийлсэн эсэх','RadioBox','yorn','prep',N'Мэс заслын өмнөх үнэлгээ / бэлтгэл',3,NULL,NULL,0,0,12,600),
(@Form,'UsandOrsonEseh',   N'Мэс заслын өмнөх орой усанд орсон эсэх','RadioBox','yorn','prep',N'Мэс заслын өмнөх үнэлгээ / бэлтгэл',3,NULL,NULL,0,0,12,610),
(@Form,'TamedinArchsan',   N'Цээж, хэвлий, цавьны хэсгүүдийг 7,5%-ийн тамедины уусмалаар арчсан эсэх','RadioBox','yorn','prep',N'Мэс заслын өмнөх үнэлгээ / бэлтгэл',3,NULL,NULL,0,0,12,620),
(@Form,'HlorgeksidinArchsan',N'2 цагийн дараа арчсан хэсгүүдийг хлоргексидины уусмалаар нэмж арчсан эсэх','RadioBox','yorn','prep',N'Мэс заслын өмнөх үнэлгээ / бэлтгэл',3,NULL,NULL,0,0,12,630),
(@Form,'AriutgasanHalad',  N'Усанд орсны дараа цэвэр задгай даавуун өмд цамц өмсөх эсвэл ариутгасан өвчтний халад өмсүүлсэн эсэх','RadioBox','yorn','prep',N'Мэс заслын өмнөх үнэлгээ / бэлтгэл',3,NULL,NULL,0,0,12,640),
(@Form,'MedeeguijuulegUzleg',N'Мэдээгүйжүүлгийн эмчийн үзлэг хийгдсэн эсэх','RadioBox','yorn','prep',N'Мэс заслын өмнөх үнэлгээ / бэлтгэл',3,NULL,NULL,0,1,12,650),
(@Form,'HoolSoison',       N'22 цагаас хойш хоол сойсон эсэх','RadioBox','yorn','prep',N'Мэс заслын өмнөх үнэлгээ / бэлтгэл',3,NULL,NULL,0,0,12,660),
(@Form,'ZuseltTemdeglegee',N'Мэс заслын өмнө зүсэлт хийх хэсгүүдэд тэмдэглэгээ хийгдсэн эсэх','RadioBox','yorn','prep',N'Мэс заслын өмнөх үнэлгээ / бэлтгэл',3,NULL,NULL,0,0,12,670),

-- ---- 4. Мэс заслын өмнөх эмчилгээ ------------------------------------------
(@Form,'AntiagregantZogsooson',N'Антиагрегант болон антикоагулянт эмчилгээг зогсоосон эсэх','RadioBox','yorn','treat',N'Мэс заслын өмнөх эмчилгээ',4,NULL,NULL,0,1,12,710),
(@Form,'Varfarin',         N'Варфарин ууж байсан бол 7 хоногийн өмнөөс зогсоосон эсэх','RadioBox','yorn','treat',N'Мэс заслын өмнөх эмчилгээ',4,NULL,NULL,0,0,12,720),
(@Form,'VarfarinINR',      N'Варфарины эмчилгээ зогссоны дараа INR <1.5-с доош байгаа эсэх','RadioBox','yorn','treat',N'Мэс заслын өмнөх эмчилгээ',4,'Varfarin','y',0,0,12,730),
(@Form,'Klopidogrel',      N'Клопидогрел ууж байсан бол 7 хоногийн өмнөөс зогсоосон эсэх','RadioBox','yorn','treat',N'Мэс заслын өмнөх эмчилгээ',4,NULL,NULL,0,0,12,740),
(@Form,'Aspirin',          N'Аспирин ууж байсан бол 3 хоногийн өмнөөс зогсоосон эсэх','RadioBox','yorn','treat',N'Мэс заслын өмнөх эмчилгээ',4,NULL,NULL,0,0,12,750),
(@Form,'Kserelto',         N'Ксарелто эмийг ууж байсан бол 3-4 хоногийн өмнө зогсоосон эсэх','RadioBox','yorn','treat',N'Мэс заслын өмнөх эмчилгээ',4,NULL,NULL,0,0,12,760),
(@Form,'AceArb',           N'ACE/ARB ууж байсан бол үргэлжлүүлэн уух','RadioBox','yorn','treat',N'Мэс заслын өмнөх эмчилгээ',4,NULL,NULL,0,0,12,770),
(@Form,'BettaBlokator',    N'Бетта блокатор ууж байсан бол үргэлжлүүлэн уух','RadioBox','yorn','treat',N'Мэс заслын өмнөх эмчилгээ',4,NULL,NULL,0,0,12,780),
(@Form,'Nitrat',           N'Нитратын бүлгийн эм ууж байсан бол үргэлжлүүлэн уух','RadioBox','yorn','treat',N'Мэс заслын өмнөх эмчилгээ',4,NULL,NULL,0,0,12,790),
(@Form,'SheesHuuh',        N'Шээс хөөх эм хэрэглэж байсан бол үргэлжлүүлэн хэрэглэх','RadioBox','yorn','treat',N'Мэс заслын өмнөх эмчилгээ',4,NULL,NULL,0,0,12,800),
(@Form,'Sedatsi',          N'Мэс заслын өмнө тайвшруулах зорилгоор седаци эмчилгээ хийгдсэн эсэх','RadioBox','yorn','treat',N'Мэс заслын өмнөх эмчилгээ',4,NULL,NULL,0,0,12,810),
(@Form,'UridchilanAntibiotik',N'Урьдчилан сэргийлэх антибиотик эмчилгээ хийгдсэн эсэх','RadioBox','yorn','treat',N'Мэс заслын өмнөх эмчилгээ',4,NULL,NULL,0,1,12,820),
(@Form,'AntibiotikSoril',  N'Мэс заслын өмнөх өдөр антибиотикийн сорил тавьсан эсэх','RadioBox','yorn','treat',N'Мэс заслын өмнөх эмчилгээ',4,NULL,NULL,0,0,12,830),
(@Form,'SorilTalbaiTemdeg',N'Сорил тавьсан талбайг тэмдэглэсэн эсэх','RadioBox','yorn','treat',N'Мэс заслын өмнөх эмчилгээ',4,'AntibiotikSoril','y',0,0,12,840),
(@Form,'SorilAntibiotik4g',N'Сорил тавьсан антибиотик 4.0 г бэлтгэх','RadioBox','yorn','treat',N'Мэс заслын өмнөх эмчилгээ',4,'AntibiotikSoril','y',0,0,12,850),
(@Form,'TariaBituumjlekhTsag',N'Задалсан тариаг битүүмжлэх сар өдөр, цаг, минут тавьсан эсэх','RadioBox','yorn','treat',N'Мэс заслын өмнөх эмчилгээ',4,NULL,NULL,0,0,12,860),
(@Form,'BulentHundrelErsdel',N'Бүлэнт хүндрэлийн эрсдэлтэй эсэх','RadioBox','yorn','treat',N'Мэс заслын өмнөх эмчилгээ',4,NULL,NULL,0,1,12,870),
(@Form,'GeparinEmchilgee', N'Хэрэв тийм бол гепарин эмчилгээг мэс заслын өмнөх 24-72 цагт хийсэн эсэх','RadioBox','yorn','treat',N'Мэс заслын өмнөх эмчилгээ',4,'BulentHundrelErsdel','y',0,0,12,880),

-- ---- signature -------------------------------------------------------------
(@Form,'TasgiinErhlegch',  N'Тасгийн эрхлэгч','Text',NULL,'sign',N'Баталгаажуулалт',5,NULL,NULL,0,0,6,910);

COMMIT;
GO

SET NOEXEC OFF;
GO

SELECT f.FormCode, f.NameMn, COUNT(ff.Id) AS FieldCount
FROM dbo.TenderForm f LEFT JOIN dbo.TenderFormField ff ON ff.FormCode = f.FormCode
WHERE f.FormCode = '1.1'
GROUP BY f.FormCode, f.NameMn;

SELECT SectionPos, SectionLabel, COUNT(*) AS Fields
FROM dbo.TenderFormField WHERE FormCode = '1.1'
GROUP BY SectionPos, SectionLabel ORDER BY SectionPos;
GO
