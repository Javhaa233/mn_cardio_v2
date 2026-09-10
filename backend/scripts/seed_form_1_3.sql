-- =============================================================================
-- Form 1.3  ХЭВЛИЙН ГОЛ СУДАСНЫ ЦҮЛХЭН БОЛОН ГОЛ СУДАС-ТАШААНЫ АРТЕРИЙН
--           ТӨЛӨВЛӨГӨӨТ МЭС ЗАСЛЫН ӨМНӨХ ӨВЧТНИЙГ БЭЛДЭХ ШАЛГАХ ХУУДАС
-- Source: "MN cardio upgrade.docx", appendix 1.3
--
-- Also registers form 1.2, whose body is EMPTY in the tender document - the
-- approved paper form has to come from the hospital before it can be seeded.
--
-- Field codes reuse form 1.1's wherever the item is the same, so the two forms
-- report consistently. Wording is verbatim from the tender; codes and types
-- still need clinical sign-off.
--
-- Idempotent.
-- =============================================================================

SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @db sysname = DB_NAME();
IF @db NOT IN ('MnCardio_restored', 'MnCardioNew', 'MnCardio_test')
BEGIN
    RAISERROR('Refusing to run: unexpected database "%s".', 16, 1, @db);
    SET NOEXEC ON;
END
GO

BEGIN TRAN;

-- 1.2 : registered but has no fields yet -------------------------------------
IF NOT EXISTS (SELECT 1 FROM dbo.TenderForm WHERE FormCode = '1.2')
    INSERT INTO dbo.TenderForm (FormCode, NameMn, GroupCode, GroupLabelMn, Position, IsActive)
    VALUES ('1.2', N'Зүрх судасны мэс заслын аюулгүй байдлын хяналтын шалгах хуудас',
            'surgery', N'Мэс заслын маягтууд', 12, 1);

-- 1.3 -------------------------------------------------------------------------
DECLARE @Form varchar(20) = '1.3';

IF EXISTS (SELECT 1 FROM dbo.TenderForm WHERE FormCode = @Form)
    UPDATE dbo.TenderForm
       SET NameMn = N'Хэвлийн гол судасны цүлхэн болон гол судас-ташааны артерийн төлөвлөгөөт мэс заслын өмнөх өвчтнийг бэлдэх шалгах хуудас',
           GroupCode = 'surgery', GroupLabelMn = N'Мэс заслын маягтууд',
           Position = 13, IsActive = 1, UpdateDate = GETDATE()
     WHERE FormCode = @Form;
ELSE
    INSERT INTO dbo.TenderForm (FormCode, NameMn, GroupCode, GroupLabelMn, Position)
    VALUES (@Form,
            N'Хэвлийн гол судасны цүлхэн болон гол судас-ташааны артерийн төлөвлөгөөт мэс заслын өмнөх өвчтнийг бэлдэх шалгах хуудас',
            'surgery', N'Мэс заслын маягтууд', 13);

DELETE FROM dbo.TenderFormField WHERE FormCode = @Form;

INSERT INTO dbo.TenderFormField
    (FormCode, FieldCode, LabelMn, FieldType, OptionType,
     SectionCode, SectionLabel, SectionPos, ParentField, ParentValue,
     IsRequired, IsSearchable, Md, Position)
VALUES
-- header ---------------------------------------------------------------------
(@Form,'UvchTuuhDugaar',   N'Өвчний түүхийн дугаар','Text',NULL,'header',N'Ерөнхий мэдээлэл',0,NULL,NULL,1,1,4,10),
(@Form,'MesZaslynOgnoo',   N'Мэс заслын огноо','Date',NULL,'header',N'Ерөнхий мэдээлэл',0,NULL,NULL,1,1,4,20),
(@Form,'TuluvlugdsunMesZasal',N'Төлөвлөгдсөн мэс засал','Text',NULL,'header',N'Ерөнхий мэдээлэл',0,NULL,NULL,0,1,12,30),

-- 1. Лабораторийн шинжилгээ ---------------------------------------------------
(@Form,'Tsus',             N'Цусны дэлгэрэнгүй шинжилгээ хийгдсэн эсэх','RadioBox','yorn','lab',N'Лабораторийн шинжилгээ',1,NULL,NULL,0,1,12,110),
(@Form,'Koagulogramm',     N'Коагулограммын шинжилгээ хийгдсэн эсэх','RadioBox','yorn','lab',N'Лабораторийн шинжилгээ',1,NULL,NULL,0,0,12,120),
(@Form,'HbA1c',            N'ЧШӨ оношлогдсон тохиолдолд HbA1c тодорхойлсон эсэх','RadioBox','yorn','lab',N'Лабораторийн шинжилгээ',1,NULL,NULL,0,0,12,130),
(@Form,'BioHimi',          N'Цусан дахь кали, кальци, төмөр, натрийн хэмжээ тодорхойлсон эсэх','RadioBox','yorn','lab',N'Лабораторийн шинжилгээ',1,NULL,NULL,0,0,12,140),
(@Form,'ElegniiUilAjillagaa',N'Элэгний үйл ажиллагааны шинжилгээ хийгдсэн эсэх','RadioBox','yorn','lab',N'Лабораторийн шинжилгээ',1,NULL,NULL,0,0,12,150),
(@Form,'BuurniiUilAjillagaa',N'Бөөрний үйл ажиллагааны шинжилгээ хийгдсэн эсэх','RadioBox','yorn','lab',N'Лабораторийн шинжилгээ',1,NULL,NULL,0,0,12,160),
(@Form,'DohVirusTembuu',   N'ДОХ, В,С вирус болон тэмбүүгийн халдварын шинжилгээ хийгдсэн эсэх','RadioBox','yorn','lab',N'Лабораторийн шинжилгээ',1,NULL,NULL,0,1,12,170),
(@Form,'VirusIdevhijil',   N'Элэгний В,С вирусын халдвартай бол вирусын идэвхижил тодорхойлох шинжилгээ хийгдсэн эсэх','RadioBox','yorn','lab',N'Лабораторийн шинжилгээ',1,'DohVirusTembuu','y',0,0,12,180),
(@Form,'SheesDelgerengui', N'Шээсний дэлгэрэнгүй шинжилгээ хийгдсэн эсэх','RadioBox','yorn','lab',N'Лабораторийн шинжилгээ',1,NULL,NULL,0,0,12,190),
(@Form,'SheesBakteriologi',N'Бактерури илэрсэн бол шээсний бактериологийн шинжилгээ хийгдсэн эсэх','RadioBox','yorn','lab',N'Лабораторийн шинжилгээ',1,'SheesDelgerengui','y',0,0,12,200),
(@Form,'UuhTosOlonSudas',  N'Олон судасны эмгэгтэй эмчлүүлэгчид цусан дахь өөх тосны үзүүлэлтийг тодорхойлуулсан эсэх','RadioBox','yorn','lab',N'Лабораторийн шинжилгээ',1,NULL,NULL,0,0,12,210),
(@Form,'MRSAArchdas',      N'MRSA илрүүлэх хамрын арчдасын шинжилгээ хийгдсэн эсэх','RadioBox','yorn','lab',N'Лабораторийн шинжилгээ',1,NULL,NULL,0,0,12,220),

-- 2. Багажийн шинжилгээ -------------------------------------------------------
(@Form,'TseejRentgen',     N'Цээжний рентген шинжилгээ хийгдсэн эсэх','RadioBox','yorn','device',N'Багажийн шинжилгээ',2,NULL,NULL,0,1,12,310),
(@Form,'HevlinEho',        N'Хэвлийн хэт авиан шинжилгээ хийгдсэн эсэх','RadioBox','yorn','device',N'Багажийн шинжилгээ',2,NULL,NULL,0,0,12,320),
(@Form,'ZvrhTsahBichleg',  N'Зүрхний цахилгаан бичлэгийн шинжилгээ хийгдсэн эсэх','RadioBox','yorn','device',N'Багажийн шинжилгээ',2,NULL,NULL,0,1,12,330),
(@Form,'ZvrhEho',          N'Зүрхний хэт авиан шинжилгээ (TTE) хийгдсэн эсэх','RadioBox','yorn','device',N'Багажийн шинжилгээ',2,NULL,NULL,0,1,12,340),
(@Form,'TitemSudasDoturh', N'Зүрхний хэт авиан шинжилгээнд ханын агшилтын алдагдал илэрсэн бол Титэм судсан дотуурх оношилгоо хийгдсэн эсэх','RadioBox','yorn','device',N'Багажийн шинжилгээ',2,'ZvrhEho','y',0,0,12,350),
(@Form,'ZahiinSudasDopler',N'Захын судасны доплер шинжилгээ хийгдсэн эсэх','RadioBox','yorn','device',N'Багажийн шинжилгээ',2,NULL,NULL,0,0,12,360),
(@Form,'ButenBiyTodosgogchKTG',N'Бүтэн биеийн тодосгогчтой КТГ-ийн шинжилгээ хийгдсэн эсэх','RadioBox','yorn','device',N'Багажийн шинжилгээ',2,NULL,NULL,0,0,12,370),
(@Form,'OlonSudasEmgeg',   N'Олон судасны эмгэгтэй эсэх','RadioBox','yorn','device',N'Багажийн шинжилгээ',2,NULL,NULL,0,1,12,380),
(@Form,'GvreeniiDupleks',  N'Гүрээний артерийн дуплекс шинжилгээ хийгдсэн эсэх','RadioBox','yorn','device',N'Багажийн шинжилгээ',2,'OlonSudasEmgeg','y',0,0,12,390),
(@Form,'TarhiSudasDopler', N'Тархины судасны доплер шинжилгээ хийгдсэн эсэх','RadioBox','yorn','device',N'Багажийн шинжилгээ',2,'OlonSudasEmgeg','y',0,0,12,400),

-- 3. Мэс заслын өмнөх үнэлгээ / бэлтгэл ---------------------------------------
(@Form,'AminUzuulelt',     N'Амин үзүүлэлтийг үнэлсэн эсэх','RadioBox','yorn','prep',N'Мэс заслын өмнөх үнэлгээ / бэлтгэл',3,NULL,NULL,0,0,12,510),
(@Form,'UndurJin',         N'Өндөр жинг хэмжиж өвчний түүхийн нүүрэнд тэмдэглэсэн эсэх','RadioBox','yorn','prep',N'Мэс заслын өмнөх үнэлгээ / бэлтгэл',3,NULL,NULL,0,0,12,520),
(@Form,'MesZaslynZuvshuurul',N'Мэс заслын зөвшөөрөл авсан эсэх','RadioBox','yorn','prep',N'Мэс заслын өмнөх үнэлгээ / бэлтгэл',3,NULL,NULL,0,1,12,530),
(@Form,'TsusHuviinTohiroo',N'Цусны хувийн тохироо үзэж цус цусан бүтээгдэхүүний захиалга хийсэн эсэх','RadioBox','yorn','prep',N'Мэс заслын өмнөх үнэлгээ / бэлтгэл',3,NULL,NULL,0,0,12,540),
(@Form,'DarshilsanUlaanEs',N'Даршилсан улаан эс захиалсан эсэх','RadioBox','yorn','prep',N'Мэс заслын өмнөх үнэлгээ / бэлтгэл',3,NULL,NULL,0,0,12,550),
(@Form,'ShineHuldusunSiiven',N'Шинэ хөлдөөсөн сийвэн захиалсан эсэх','RadioBox','yorn','prep',N'Мэс заслын өмнөх үнэлгээ / бэлтгэл',3,NULL,NULL,0,0,12,560),
(@Form,'YaltasEsOtguruuleg',N'Гол судас солих мэс засалд ялтас эсийн өтгөрүүлэг захиалсан эсэх','RadioBox','yorn','prep',N'Мэс заслын өмнөх үнэлгээ / бэлтгэл',3,NULL,NULL,0,0,12,570),
(@Form,'HevtriinHatuuDeglem',N'Хэвтрийн хатуу дэглэм сахиж буй эсэх','RadioBox','yorn','prep',N'Мэс заслын өмнөх үнэлгээ / бэлтгэл',3,NULL,NULL,0,0,12,580),
(@Form,'Sahiurtai',        N'Сахиуртай эсэх','RadioBox','yorn','prep',N'Мэс заслын өмнөх үнэлгээ / бэлтгэл',3,NULL,NULL,0,0,12,590),
(@Form,'SahiurTergentser', N'Шаардлагатай тохиолдолд сахиурын хамт тэргэнцэр хэрэглэж буй эсэх','RadioBox','yorn','prep',N'Мэс заслын өмнөх үнэлгээ / бэлтгэл',3,'Sahiurtai','y',0,0,12,600),
(@Form,'SharhniiHaldvar',  N'Мэс заслын шархны халдвараас сэргийлсэн эсэх','RadioBox','yorn','prep',N'Мэс заслын өмнөх үнэлгээ / бэлтгэл',3,NULL,NULL,0,0,12,610),
(@Form,'UsandOrsonEseh',   N'Мэс заслын өмнөх орой усанд орсон эсэх','RadioBox','yorn','prep',N'Мэс заслын өмнөх үнэлгээ / бэлтгэл',3,NULL,NULL,0,0,12,620),
(@Form,'TamedinArchsan',   N'Цээж, хэвлий, цавьны хэсгүүдийг 7,5%-ийн тамедины уусмалаар арчсан эсэх','RadioBox','yorn','prep',N'Мэс заслын өмнөх үнэлгээ / бэлтгэл',3,NULL,NULL,0,0,12,630),
(@Form,'HlorgeksidinArchsan',N'2 цагийн дараа арчсан хэсгүүдийг хлоргексидины уусмалаар нэмж арчсан эсэх','RadioBox','yorn','prep',N'Мэс заслын өмнөх үнэлгээ / бэлтгэл',3,NULL,NULL,0,0,12,640),
(@Form,'AriutgasanHalad',  N'Усанд орсны дараа цэвэр задгай даавуун өмд цамц өмсөх эсвэл ариутгасан өвчтний халад өмсүүлсэн эсэх','RadioBox','yorn','prep',N'Мэс заслын өмнөх үнэлгээ / бэлтгэл',3,NULL,NULL,0,0,12,650),
(@Form,'MedeeguijuulegUzleg',N'Мэдээгүйжүүлгийн эмчийн үзлэг хийгдсэн эсэх','RadioBox','yorn','prep',N'Мэс заслын өмнөх үнэлгээ / бэлтгэл',3,NULL,NULL,0,1,12,660),

-- 4. Хооллолт ------------------------------------------------------------------
(@Form,'BuhelHoolZogsooson',N'Төлөвлөгөөт мэс заслаас 5 хоногийн өмнө бүхэл хоол зогсоосон эсэх','RadioBox','yorn','food',N'Хооллолт',4,NULL,NULL,0,0,12,710),
(@Form,'TseverlehBurgui3Honog',N'Цэвэрлэх бургуйг мэс заслаас 3 хоногийн өмнөөс 12 цагаар тавьсан эсэх','RadioBox','yorn','food',N'Хооллолт',4,NULL,NULL,0,0,12,720),
(@Form,'HoolSoison',       N'Мэс заслын үед хоол сойсон эсэх','RadioBox','yorn','food',N'Хооллолт',4,NULL,NULL,0,0,12,730),
(@Form,'TseverlehBurgui',  N'Мэс заслын өмнө цэвэрлэх бургуй тавьсан эсэх','RadioBox','yorn','food',N'Хооллолт',4,NULL,NULL,0,0,12,740),
(@Form,'HungunHoolShingen',N'Орой 20 цаг хүртэл хөнгөн хоол (бүхэл бус) идэж, 22 цагаас хойш шингэн хорьсон эсэх','RadioBox','yorn','food',N'Хооллолт',4,NULL,NULL,0,0,12,750),

-- 5. Мэс заслын өмнөх эмчилгээ -------------------------------------------------
(@Form,'AntiagregantZogsooson',N'Антиагрегант болон антикоагулянт эмчилгээг зогсоосон эсэх','RadioBox','yorn','treat',N'Мэс заслын өмнөх эмчилгээ',5,NULL,NULL,0,1,12,810),
(@Form,'Klopidogrel',      N'Клопидогрел ууж байсан бол 7 хоногийн өмнөөс зогсоосон эсэх','RadioBox','yorn','treat',N'Мэс заслын өмнөх эмчилгээ',5,NULL,NULL,0,0,12,820),
(@Form,'Aspirin',          N'Аспирин ууж байсан бол 3 хоногийн өмнөөс зогсоосон эсэх','RadioBox','yorn','treat',N'Мэс заслын өмнөх эмчилгээ',5,NULL,NULL,0,0,12,830),
(@Form,'Rivaroksaban',     N'Ривароксабан эмийг ууж байсан бол 3-4 хоногийн өмнө зогсоосон эсэх','RadioBox','yorn','treat',N'Мэс заслын өмнөх эмчилгээ',5,NULL,NULL,0,0,12,840),
(@Form,'AceArb',           N'ACE/ARB ууж байсан бол үргэлжлүүлэн уух','RadioBox','yorn','treat',N'Мэс заслын өмнөх эмчилгээ',5,NULL,NULL,0,0,12,850),
(@Form,'BettaBlokator',    N'Беттаблокатор ууж байсан бол үргэлжлүүлэн уух','RadioBox','yorn','treat',N'Мэс заслын өмнөх эмчилгээ',5,NULL,NULL,0,0,12,860),
(@Form,'Nitrat',           N'Нитратын бүлгийн эм ууж байсан бол үргэлжлүүлэн уух','RadioBox','yorn','treat',N'Мэс заслын өмнөх эмчилгээ',5,NULL,NULL,0,0,12,870),
(@Form,'SheesHuuh',        N'Шээс хөөх эм хэрэглэж байсан бол үргэлжлүүлэн хэрэглэх','RadioBox','yorn','treat',N'Мэс заслын өмнөх эмчилгээ',5,NULL,NULL,0,0,12,880),
(@Form,'UridchilanAntibiotik',N'Урьдчилан сэргийлэх антибиотик эмчилгээ хийгдсэн эсэх','RadioBox','yorn','treat',N'Мэс заслын өмнөх эмчилгээ',5,NULL,NULL,0,1,12,890),
(@Form,'AntibiotikSoril',  N'Мэс заслын өмнөх өдөр антибиотикийн сорил тавьсан эсэх','RadioBox','yorn','treat',N'Мэс заслын өмнөх эмчилгээ',5,NULL,NULL,0,0,12,900),
(@Form,'SorilTalbaiTemdeg',N'Сорил тавьсан талбайг тэмдэглэсэн эсэх','RadioBox','yorn','treat',N'Мэс заслын өмнөх эмчилгээ',5,'AntibiotikSoril','y',0,0,12,910),
(@Form,'SorilAntibiotik2g',N'Сорил тавьсан антибиотик 2.0 г бэлтгэх','RadioBox','yorn','treat',N'Мэс заслын өмнөх эмчилгээ',5,'AntibiotikSoril','y',0,0,12,920),
(@Form,'TariaBituumjlekhTsag',N'Задалсан тариаг битүүмжлэх сар өдөр, цаг, минут тавьсан эсэх','RadioBox','yorn','treat',N'Мэс заслын өмнөх эмчилгээ',5,NULL,NULL,0,0,12,930),
(@Form,'TsulhenAdBuulgah', N'Гол судасны цүлхэний хэмжээ том, задрал болон хуулралын шинжтэй, өвдөлт ихтэй бол АД буулгах, зүрхний цохилтыг буулгах эмчилгээг хийж буй эсэх','RadioBox','yorn','treat',N'Мэс заслын өмнөх эмчилгээ',5,NULL,NULL,0,0,12,940),
(@Form,'Sistol140Zts80',   N'Систолийн даралтыг 140 мм.муб-с доош, ЗЦТ-г 80-аас доош барьж буй эсэх','RadioBox','yorn','treat',N'Мэс заслын өмнөх эмчилгээ',5,NULL,NULL,0,0,12,950),

-- signature --------------------------------------------------------------------
(@Form,'TasgiinErhlegch',  N'Тасгийн эрхлэгч','Text',NULL,'sign',N'Баталгаажуулалт',6,NULL,NULL,0,0,6,990);

COMMIT;
GO

SET NOEXEC OFF;
GO

SELECT f.FormCode, COUNT(ff.Id) AS FieldCount, f.NameMn
FROM dbo.TenderForm f LEFT JOIN dbo.TenderFormField ff ON ff.FormCode = f.FormCode
GROUP BY f.FormCode, f.NameMn ORDER BY f.FormCode;
GO
