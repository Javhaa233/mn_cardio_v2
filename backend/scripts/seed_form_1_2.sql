-- =============================================================================
-- Form 1.2 — Зүрх судасны мэс заслын аюулгүй байдлын хяналтын шалгах хуудас
-- (cardiovascular surgical safety checklist)
--
-- SOURCE. The tender's appendix for 1.2 is NOT text — it is two images,
-- `word/media/image1.png` and `image2.png` inside `MN cardio upgrade.docx`
-- (paragraphs 192 and 193). Every earlier reading went through the text layer,
-- found a heading with nothing under it, and recorded the form as "empty in the
-- tender". It was never empty. Labels below are transcribed from those images.
--
-- The form has four phases, matching the WHO surgical safety checklist:
--   CHECK IN  — Мэс заслын урьтал бүртгэл (эмчлүүлэгч хүлээн авах хэсэгт)
--   SIGN IN   — Урьтал мэдээгүйжүүлгийн өмнө (мэс заслын өрөөнд)
--   TIME OUT  — Зүслэг эхлэхийн өмнө (мэс заслын өрөөнд)
--   SIGN OUT  — Мэс заслын өрөөнөөс гарахын өмнө (мэс заслын өрөөнд)
--
-- TRANSCRIPTION NOTES — read before changing anything:
--   * Labels are VERBATIM, including the paper form's own spelling. Two
--     examples that look like mistakes and are deliberately preserved:
--     "бктериологийн" (SIGN OUT) and "Тодосгогч бодим". CLAUDE.md §9: clinical
--     wording is not ours to improve. Flag, do not paraphrase.
--   * The third answer column is NOT universal. Some rows on the paper form
--     offer Тийм/Үгүй only, others add Тодорхойгүй. That distinction is
--     reproduced field by field via `f12_yn` vs `f12_yn3`; it is not an
--     oversight.
--   * The existing `yorn` dico is labelled "Yes"/"No" in English, so it is not
--     usable on a Mongolian paper-form facsimile. Hence `f12_yn`.
--
-- STILL NEEDS CLINICAL SIGN-OFF (tracker row 23, and item 3 of the ЗСҮТ
-- letter): the field CODES and TYPES are ours; the LABELS are the customer's.
--
-- Idempotent. Safe to re-run — it deletes 1.2's field rows and re-inserts them.
--
-- Written UTF-8 without BOM. Run it through scripts that read it as UTF-8; if
-- you use `sqlcmd -i`, add a BOM first or the Cyrillic will be mangled
-- (CLAUDE.md §4).
--
-- AFTER RUNNING:
--   node scripts/generate_form_views.js 1.2
--   touch server.js        -- nodemon watches neither model/ nor ModelConfigs/
-- =============================================================================

SET NOCOUNT ON;

DECLARE @db sysname = DB_NAME();
IF @db NOT IN ('MnCardio_restored', 'MnCardioNew', 'MnCardio_test')
BEGIN
    RAISERROR('Refusing to run: unexpected database "%s".', 16, 1, @db);
    SET NOEXEC ON;
END
GO

-- -----------------------------------------------------------------------------
-- Option lists
-- -----------------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico = 'f12_yn')
    INSERT INTO dbo.DicoType (dico, Name, Description)
    VALUES ('f12_yn', N'Тийм / Үгүй', N'Form 1.2 — two-state answer, from the approved paper form');

IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico = 'f12_yn3')
    INSERT INTO dbo.DicoType (dico, Name, Description)
    VALUES ('f12_yn3', N'Тийм / Үгүй / Тодорхойгүй', N'Form 1.2 — three-state answer, from the approved paper form');

IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico = 'f12_harshil')
    INSERT INTO dbo.DicoType (dico, Name, Description)
    VALUES ('f12_harshil', N'Харшлын төрөл', N'Form 1.2 — allergy type');

IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico = 'f12_haldvar')
    INSERT INTO dbo.DicoType (dico, Name, Description)
    VALUES ('f12_haldvar', N'Халдварын төрөл', N'Form 1.2 — infection type');

DELETE FROM dbo.OptionTypes WHERE dico IN ('f12_yn', 'f12_yn3', 'f12_harshil', 'f12_haldvar');

INSERT INTO dbo.OptionTypes (dico, label, value, pos, translate_flag) VALUES
    ('f12_yn',  N'Тийм', N'y', 1, 0),
    ('f12_yn',  N'Үгүй', N'n', 2, 0),

    ('f12_yn3', N'Тийм',         N'y', 1, 0),
    ('f12_yn3', N'Үгүй',         N'n', 2, 0),
    ('f12_yn3', N'Тодорхойгүй',  N'u', 3, 0),

    ('f12_harshil', N'Эм тариа', N'o1', 1, 0),
    ('f12_harshil', N'Латекс',   N'o2', 2, 0),
    ('f12_harshil', N'Бусад',    N'o3', 3, 0),

    ('f12_haldvar', N'ХДХВ',  N'o1', 1, 0),
    ('f12_haldvar', N'Геп В', N'o2', 2, 0),
    ('f12_haldvar', N'Геп С', N'o3', 3, 0),
    ('f12_haldvar', N'TPHA',  N'o4', 4, 0),
    ('f12_haldvar', N'MRSA',  N'o5', 5, 0);
GO

-- -----------------------------------------------------------------------------
-- The form itself
-- -----------------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM dbo.TenderForm WHERE FormCode = '1.2')
    INSERT INTO dbo.TenderForm (FormCode, NameMn, GroupCode, GroupLabelMn, Position)
    VALUES ('1.2', N'Зүрх судасны мэс заслын аюулгүй байдлын хяналтын шалгах хуудас',
            'surgery', N'Зүрх судасны мэс заслын маягтууд', 20);

DECLARE @Form varchar(20) = '1.2';

DELETE FROM dbo.TenderFormField WHERE FormCode = @Form;

INSERT INTO dbo.TenderFormField
    (FormCode, FieldCode, LabelMn, FieldType, OptionType,
     SectionCode, SectionLabel, SectionPos, ParentField, ParentValue,
     IsRequired, IsSearchable, Md, Position)
VALUES
-- === Ерөнхий мэдээлэл ========================================================
(@Form,'MesZaslynOgnoo',            N'Мэс заслын огноо',                         'Date',NULL,'s0',N'Ерөнхий мэдээлэл',0,NULL,NULL,1,1,4,10),
(@Form,'MesZaslynUruuStorNo',       N'Мэс заслын өрөө/ сторын №',                'Text',NULL,'s0',N'Ерөнхий мэдээлэл',0,NULL,NULL,0,1,4,20),
(@Form,'HiigdsenMesZasal',          N'Хийгдсэн мэс засал',                       'Text',NULL,'s0',N'Ерөнхий мэдээлэл',0,NULL,NULL,0,1,4,30),
(@Form,'MesZaslynEmch',             N'Мэс заслын эмч (оператор, ассистент)',     'Text',NULL,'s0',N'Ерөнхий мэдээлэл',0,NULL,NULL,0,1,6,40),
(@Form,'MedeeguijuulgiinEmch',      N'Мэдээгүйжүүлгийн эмч',                     'Text',NULL,'s0',N'Ерөнхий мэдээлэл',0,NULL,NULL,0,0,6,50),
(@Form,'PerfuziologichEmch',        N'Перфузиологич эмч',                        'Text',NULL,'s0',N'Ерөнхий мэдээлэл',0,NULL,NULL,0,0,6,60),
(@Form,'MedeeguijuulgiinSuvilagch', N'Мэдээгүйжүүлгийн сувилагч',                'Text',NULL,'s0',N'Ерөнхий мэдээлэл',0,NULL,NULL,0,0,6,70),
(@Form,'MesZaslynSuvilagch',        N'Мэс заслын сувилагч',                      'Text',NULL,'s0',N'Ерөнхий мэдээлэл',0,NULL,NULL,0,0,6,80),

-- === CHECK IN · Ээлжийн сувилагч болон филтер сувилагч бөглөнө ===============
(@Form,'EmchluulegchiinOvogNer',    N'Эмчлүүлэгчийн овог нэр /танин тодруулах бугуйвч/','RadioBox','f12_yn','s1',N'CHECK IN · Ээлжийн сувилагч болон филтер сувилагч бөглөнө',1,NULL,NULL,0,0,12,100),
(@Form,'AjilbarMesZasalHiilgeh',    N'Ажилбар, мэс засал хийлгэх',               'RadioBox','f12_yn','s1',N'CHECK IN · Ээлжийн сувилагч болон филтер сувилагч бөглөнө',1,NULL,NULL,0,0,12,110),
(@Form,'YamarNegHarshiltaiEseh',    N'Ямар нэг харшилтай эсэх',                  'RadioBox','f12_yn','s1',N'CHECK IN · Ээлжийн сувилагч болон филтер сувилагч бөглөнө',1,NULL,NULL,0,0,12,120),
(@Form,'HarshiltaiBolAlNiBoloh',    N'Хэрэв харшилтай бол аль нь болох?',        'RadioBox','f12_harshil','s1',N'CHECK IN · Ээлжийн сувилагч болон филтер сувилагч бөглөнө',1,'YamarNegHarshiltaiEseh',N'y',0,0,12,130),
(@Form,'JiremsniiTestSurugEseh',    N'Эмчлүүлэгч эмэгтэй бол жирэмсний тест сөрөг эсэх','RadioBox','f12_yn3','s1',N'CHECK IN · Ээлжийн сувилагч болон филтер сувилагч бөглөнө',1,NULL,NULL,0,0,12,140),

-- === CHECK IN · Мэс заслын өмнөх бэлтгэл =====================================
(@Form,'UlunHoolSoisonEseh',        N'Эмчлүүлэгчийн өлөн, хоол сойсон эсэх',     'RadioBox','f12_yn3','s2',N'CHECK IN · Мэс заслын өмнөх бэлтгэл',2,NULL,NULL,0,0,12,200),
(@Form,'MesZaslynZuvshuurulAvsan',  N'Эмчлүүлэгчээс мэс заслын зөвшөөрөл авсан эсэх','RadioBox','f12_yn','s2',N'CHECK IN · Мэс заслын өмнөх бэлтгэл',2,NULL,NULL,0,0,12,210),
(@Form,'MedeeguijZuvshuurulAvsan',  N'Эмчлүүлэгчээс мэдээгүйжүүлгийн зөвшөөрөл авсан эсэх','RadioBox','f12_yn3','s2',N'CHECK IN · Мэс заслын өмнөх бэлтгэл',2,NULL,NULL,0,0,12,220),
(@Form,'UsandOrsonEseh',            N'Мэс заслын өмнө усанд орсон эсэх',         'RadioBox','f12_yn3','s2',N'CHECK IN · Мэс заслын өмнөх бэлтгэл',2,NULL,NULL,0,0,12,230),
(@Form,'UsiigHussanEseh',           N'Мэс засал хийх хэсгийн үсийг хуссан эсэх', 'RadioBox','f12_yn3','s2',N'CHECK IN · Мэс заслын өмнөх бэлтгэл',2,NULL,NULL,0,0,12,240),
(@Form,'AntibiotikSorilTavigdsan',  N'Антибиотикийн сорил тавигдсан эсэх',       'RadioBox','f12_yn','s2',N'CHECK IN · Мэс заслын өмнөх бэлтгэл',2,NULL,NULL,0,0,12,250),
(@Form,'TsusBelenEseh',             N'Цусны хувийн тохирооны цус, цусан бүтээгдэхүүн бэлэн эсэх','RadioBox','f12_yn','s2',N'CHECK IN · Мэс заслын өмнөх бэлтгэл',2,NULL,NULL,0,0,12,260),
(@Form,'HaldvartaiEseh',            N'Эмчлүүлэгч халдвартай эсэх',               'RadioBox','f12_yn','s2',N'CHECK IN · Мэс заслын өмнөх бэлтгэл',2,NULL,NULL,0,0,12,270),
(@Form,'HaldvartaiBolAlNiBoloh',    N'Хэрэв халдвартай бол аль нь болох?',       'RadioBox','f12_haldvar','s2',N'CHECK IN · Мэс заслын өмнөх бэлтгэл',2,'HaldvartaiEseh',N'y',0,0,12,280),
(@Form,'ZuslegHesgiigTemdeglesen',  N'Зүслэг хийх хэсгийг тэмдэглэсэн эсэх',     'RadioBox','f12_yn3','s2',N'CHECK IN · Мэс заслын өмнөх бэлтгэл',2,NULL,NULL,0,0,12,290),
(@Form,'CheckInTemdeglel',          N'Тэмдэглэл (Шалгах хуудас биелэгдээгүй тохиолдолд, гаргасан шийдвэрийг тодорхой тэмдэглэнэ үү)','TextArea',NULL,'s2',N'CHECK IN · Мэс заслын өмнөх бэлтгэл',2,NULL,NULL,0,0,12,300),
(@Form,'CheckInGariinUseg',         N'Ээлжийн сувилагч болон Филтер сувилагчийн гарын үсэг','Text',NULL,'s2',N'CHECK IN · Мэс заслын өмнөх бэлтгэл',2,NULL,NULL,0,0,12,310),

-- === SIGN IN =================================================================
(@Form,'AyulguiBaidalShalgasan',    N'Эмчлүүлэгчийн аюулгүй байдлыг шалгасан, асуудал үгүй','RadioBox','f12_yn','s3',N'SIGN IN · Мэдээгүйжүүлгийн эмч болон мэдээгүйжүүлгийн сувилагч бөглөнө',3,NULL,NULL,0,0,12,400),
(@Form,'MedeeguijHeregselBelen',    N'Мэдээгүйжүүлгийн аппарат, эм тариа болон эмнэлгийн хэрэгслүүд бэлэн','RadioBox','f12_yn','s3',N'SIGN IN · Мэдээгүйжүүлгийн эмч болон мэдээгүйжүүлгийн сувилагч бөглөнө',3,NULL,NULL,0,0,12,410),
(@Form,'TuvugteiIntubatsEseh',      N'Төвөгтэй интубацийн тохиолдол эсэх',       'RadioBox','f12_yn','s3',N'SIGN IN · Мэдээгүйжүүлгийн эмч болон мэдээгүйжүүлгийн сувилагч бөглөнө',3,NULL,NULL,0,0,12,420),
(@Form,'TuvugteiIntubatsBagts',     N'Хэрэв тийм бол төвөгтэй интубацын багц бэлэн эсэх','RadioBox','f12_yn','s3',N'SIGN IN · Мэдээгүйжүүлгийн эмч болон мэдээгүйжүүлгийн сувилагч бөглөнө',3,'TuvugteiIntubatsEseh',N'y',0,0,12,430),
(@Form,'TsusAldahErsdel500',        N'500мл -с дээш цус алдах эрсдэл байгаа эсэх','RadioBox','f12_yn','s3',N'SIGN IN · Мэдээгүйжүүлгийн эмч болон мэдээгүйжүүлгийн сувилагч бөглөнө',3,NULL,NULL,0,0,12,440),
(@Form,'VeniinKatetrTavisan',       N'Хэрэв тийм бол захад хоёр венийн судасны хурц авах/ төвийн венийн катетерь тавьсан байх','RadioBox','f12_yn','s3',N'SIGN IN · Мэдээгүйжүүлгийн эмч болон мэдээгүйжүүлгийн сувилагч бөглөнө',3,'TsusAldahErsdel500',N'y',0,0,12,450),
(@Form,'SignInTemdeglel',           N'Тэмдэглэл (Шалгах хуудас биелэгдээгүй тохиолдолд, гаргасан шийдвэрийг тодорхой тэмдэглэнэ үү)','TextArea',NULL,'s3',N'SIGN IN · Мэдээгүйжүүлгийн эмч болон мэдээгүйжүүлгийн сувилагч бөглөнө',3,NULL,NULL,0,0,12,460),
(@Form,'SignInEmchGariinUseg',      N'Мэдээгүйжүүлгийн эмчийн гарын үсэг',       'Text',NULL,'s3',N'SIGN IN · Мэдээгүйжүүлгийн эмч болон мэдээгүйжүүлгийн сувилагч бөглөнө',3,NULL,NULL,0,0,6,470),
(@Form,'SignInSuvilagchGariinUseg', N'Мэдээгүйжүүлгийн сувилагчийн гарын үсэг',  'Text',NULL,'s3',N'SIGN IN · Мэдээгүйжүүлгийн эмч болон мэдээгүйжүүлгийн сувилагч бөглөнө',3,NULL,NULL,0,0,6,480),

-- === TIME OUT · танин тодруулалт =============================================
(@Form,'TaninTodruulalgaHiigdsen',  N'Эмчлүүлэгчийн танин тодруулалгыг МЭС ЗАСЛЫН УРЬТАЛ БҮРТГЭЛИЙН шатанд хийгдсэн эсэх','RadioBox','f12_yn','s4',N'TIME OUT · Эмчлүүлэгчийн танин тодруулалт',4,NULL,NULL,0,0,12,500),
(@Form,'TaninTodruulalgaHenHiisen', N'Хийгдсэн бол хэн хийсэн бэ?',              'Text',NULL,'s4',N'TIME OUT · Эмчлүүлэгчийн танин тодруулалт',4,'TaninTodruulalgaHiigdsen',N'y',0,0,12,510),

-- === TIME OUT · Мэс заслын багийн ахлагчаас ==================================
(@Form,'TaninTodruulagaHelekh',     N'Эмчлүүлэгчийн танин тодруулага: Овог нэр, нас, хүйс, төрсөн он сар өдөр','RadioBox','f12_yn','s5',N'TIME OUT · Мэс заслын багийн ахлагч чангаар хэлэх',5,NULL,NULL,0,0,12,520),
(@Form,'OnoshMesZaslynNerHelekh',   N'Мэс заслын онош, хийгдэх гэж буй мэс заслын нэрийг хэлэх','RadioBox','f12_yn','s5',N'TIME OUT · Мэс заслын багийн ахлагч чангаар хэлэх',5,NULL,NULL,0,0,12,530),
(@Form,'BarimtBichigTonogBelen',    N'Шаардлагатай баримт бичиг, дүрс оношилгооны зураг, протез болон мэс засалд шаардлагатай тоног төхөөрөмж бэлэн эсэх','RadioBox','f12_yn','s5',N'TIME OUT · Мэс заслын багийн ахлагч чангаар хэлэх',5,NULL,NULL,0,0,12,540),

-- === TIME OUT · Мэдээгүйжүүлгийн багаас тодруулах ============================
(@Form,'AntibiotikTungHiisenEseh',  N'Эмчлүүлэгчид антибиотикийн урьдчилан сэргийлэх тунг хийсэн эсэх','RadioBox','f12_yn','s6',N'TIME OUT · Мэдээгүйжүүлгийн багийн гишүүдэд тодруулах',6,NULL,NULL,0,0,12,560),
(@Form,'MedeeguijHundrelEseh',      N'Мэдээгүйжүүлгийн талбар эмчлүүлэгчид гарсан хүндрэлтэй асуудал байгаа эсэх','RadioBox','f12_yn','s6',N'TIME OUT · Мэдээгүйжүүлгийн багийн гишүүдэд тодруулах',6,NULL,NULL,0,0,12,570),
(@Form,'MedeeguijHundrelTailbar',   N'Хэрэв тийм бол ямар асуудал гарсан бэ?',   'Text',NULL,'s6',N'TIME OUT · Мэдээгүйжүүлгийн багийн гишүүдэд тодруулах',6,'MedeeguijHundrelEseh',N'y',0,0,12,580),

-- === TIME OUT · Мэс заслын сувилахуйн багаас тодруулах =======================
(@Form,'AntiseptikAseptikBarimtal', N'Антисептик, асептикийн дүрмийг баримталсан, зөрчөгдөөгүй эсэх','RadioBox','f12_yn','s7',N'TIME OUT · Мэс заслын сувилахуйн багаас тодруулах',7,NULL,NULL,0,0,12,600),
(@Form,'BagajTonogAsuudalEseh',     N'Мэс заслын үед хэрэглэгдэх багаж, тоног төхөөрөмжид ямар нэг асуудал байгаа эсэх','RadioBox','f12_yn3','s7',N'TIME OUT · Мэс заслын сувилахуйн багаас тодруулах',7,NULL,NULL,0,0,12,610),
(@Form,'BagajTonogAsuudalTailbar',  N'Хэрэв тийм бол ямар асуудал гарсан бэ?',   'Text',NULL,'s7',N'TIME OUT · Мэс заслын сувилахуйн багаас тодруулах',7,'BagajTonogAsuudalEseh',N'y',0,0,12,620),
(@Form,'BagajSharikToolson',        N'Мэс заслын багаж болон шарик салфетик тоолж шалгасан эсэх','RadioBox','f12_yn','s7',N'TIME OUT · Мэс заслын сувилахуйн багаас тодруулах',7,NULL,NULL,0,0,12,630),
(@Form,'MonitorKoagulyatsHolboson', N'Мэс заслын монитор, каогуляцийн аппаратуудыг холбосон, хэвийн ажиллагаатай эсэх','RadioBox','f12_yn','s7',N'TIME OUT · Мэс заслын сувилахуйн багаас тодруулах',7,NULL,NULL,0,0,12,640),
(@Form,'PeismekerBelenEseh',        N'Пейсмэкерийн утас болон аппарат бэлэн эсэх','RadioBox','f12_yn','s7',N'TIME OUT · Мэс заслын сувилахуйн багаас тодруулах',7,NULL,NULL,0,0,12,650),
(@Form,'PeismekerAsuudalTailbar',   N'Хэрэв үгүй бол ямар асуудал гарсан бэ?',   'Text',NULL,'s7',N'TIME OUT · Мэс заслын сувилахуйн багаас тодруулах',7,'PeismekerBelenEseh',N'n',0,0,12,660),
(@Form,'DefibrilyatorHolboson',     N'Биеийн гаднах дефибриляторын холболтуудыг холбосон, ажиллагаатай байгаа эсэх','RadioBox','f12_yn3','s7',N'TIME OUT · Мэс заслын сувилахуйн багаас тодруулах',7,NULL,NULL,0,0,12,670),
(@Form,'RxSistemdHolboson',         N'Эмчлүүлэгчийг Rx системд холбосон эсэх (Гибрид өрөөнд)','RadioBox','f12_yn3','s7',N'TIME OUT · Мэс заслын сувилахуйн багаас тодруулах',7,NULL,NULL,0,0,12,680),

-- === TIME OUT · Перфузиологич эмчээс тодруулах ===============================
(@Form,'TsusErgeltShalguurShalgasan',N'Цусны зохиомол эргэлтийн шалгуур хуудсыг шалгасан эсэх','RadioBox','f12_yn3','s8',N'TIME OUT · Перфузиологич эмчээс тодруулах',8,NULL,NULL,0,0,12,700),
(@Form,'TsusErgeltApparatAjillagaa',N'Цусны зохиомол эргэлтийн аппарат хэвийн ажиллагаатай эсэх','RadioBox','f12_yn3','s8',N'TIME OUT · Перфузиологич эмчээс тодруулах',8,NULL,NULL,0,0,12,710),

-- === TIME OUT · Мэс заслын эмчээс тодруулах ==================================
(@Form,'ZuslegEhlehZuvshuurul',     N'Мэс заслын багийн гишүүдийн зүгээс мэс заслын бэлтгэл хангагдсан, зүслэг эхлэхийг зөвшөөрч байна уу?','RadioBox','f12_yn','s9',N'TIME OUT · Мэс заслын эмч мэс заслын багаас тодруулах',9,NULL,NULL,0,0,12,730),
(@Form,'TimeOutTemdeglel',          N'Тэмдэглэл (Шалгах хуудас биелэгдээгүй тохиолдолд, гаргасан шийдвэрийг тодорхой тэмдэглэнэ үү)','TextArea',NULL,'s9',N'TIME OUT · Мэс заслын эмч мэс заслын багаас тодруулах',9,NULL,NULL,0,0,12,740),
(@Form,'TimeOutGariinUseg',         N'Мэс заслын багийн гарын үсэг /Он сар өдөр/','Text',NULL,'s9',N'TIME OUT · Мэс заслын эмч мэс заслын багаас тодруулах',9,NULL,NULL,0,0,12,750),

-- === SIGN OUT · Эмчлэгч эмч / Оператор эмч ===================================
(@Form,'MesZaslynNerTemdeglesen',   N'Мэс заслын нэр, ажилбарын нэршилийг өвчний түүхийн нүүрэнд тодорхой тэмдэглэсэн эсэх','RadioBox','f12_yn','s10',N'SIGN OUT · Эмчлэгч эмч / Оператор эмч бөглөнө',10,NULL,NULL,0,0,12,800),
(@Form,'UvchuuHaahOmneSharikToolson',N'Өвчүү хаахын өмнө мэс заслын шарик, салфетик тоолж шалгасан','RadioBox','f12_yn3','s10',N'SIGN OUT · Эмчлэгч эмч / Оператор эмч бөглөнө',10,NULL,NULL,0,0,12,810),
(@Form,'BagajTooljShalgasan',       N'Мэс заслын багаж тоолж шалгасан',          'RadioBox','f12_yn3','s10',N'SIGN OUT · Эмчлэгч эмч / Оператор эмч бөглөнө',10,NULL,NULL,0,0,12,820),
(@Form,'ZuugTooljShalgasan',        N'Мэс заслын үед хэрэглэсэн зүүг тоолж шалгасан','RadioBox','f12_yn3','s10',N'SIGN OUT · Эмчлэгч эмч / Оператор эмч бөглөнө',10,NULL,NULL,0,0,12,830),

-- === SIGN OUT · Шинжилгээний дээжүүд =========================================
(@Form,'ShinjilgeeHuruuShilniiToo', N'Шинжилгээний хуруу шилний тоо',            'Number',NULL,'s11',N'SIGN OUT · Мэс заслын үед цуглуулсан эдийн болон бусад шинжилгээний дээжүүд',11,NULL,NULL,0,0,4,850),
(@Form,'HuruuShilHayagjilt',        N'Шинжилгээний хуруу шил бүрт хаягжилт хийсэн байх','RadioBox','f12_yn3','s11',N'SIGN OUT · Мэс заслын үед цуглуулсан эдийн болон бусад шинжилгээний дээжүүд',11,NULL,NULL,0,0,12,860),
(@Form,'ShinjilgeeBichigZuvBuglusen',N'Шинжилгээнд явуулсан бичгийг зөв бөглөсөн байх.','RadioBox','f12_yn3','s11',N'SIGN OUT · Мэс заслын үед цуглуулсан эдийн болон бусад шинжилгээний дээжүүд',11,NULL,NULL,0,0,12,870),
(@Form,'EdiinShinjilgeeniiToo',     N'Эдийн шинжилгээний тоо',                   'Number',NULL,'s11',N'SIGN OUT · Мэс заслын үед цуглуулсан эдийн болон бусад шинжилгээний дээжүүд',11,NULL,NULL,0,0,4,880),
(@Form,'BakteriologiShinjilgeeToo', N'Бактериологийн шинжилгээний тоо',          'Number',NULL,'s11',N'SIGN OUT · Мэс заслын үед цуглуулсан эдийн болон бусад шинжилгээний дээжүүд',11,NULL,NULL,0,0,4,890),
(@Form,'ShinjilgeeSavHayagjilt',    N'Шинжилгээний сав бүрт хаягжилт хийсэн байх','RadioBox','f12_yn3','s11',N'SIGN OUT · Мэс заслын үед цуглуулсан эдийн болон бусад шинжилгээний дээжүүд',11,NULL,NULL,0,0,12,900),
(@Form,'EdBakteriologiBichigZuv',   N'Эдийн болон бктериологийн шинжилгээнд явуулсан бичгийг зөв бөглөсөн байх.','RadioBox','f12_yn3','s11',N'SIGN OUT · Мэс заслын үед цуглуулсан эдийн болон бусад шинжилгээний дээжүүд',11,NULL,NULL,0,0,12,910),

-- === SIGN OUT · Гибрид мэс засал =============================================
(@Form,'TodosgogchBodisTemdeglesen',N'Тодосгогч бодим (бодисын нэр, эзэлхүүн) тэмдэглэсэн эсэх','RadioBox','f12_yn3','s12',N'SIGN OUT · Гибрид мэс засал хийгдсэн үед техникч бөглөнө',12,NULL,NULL,0,0,12,930),
(@Form,'RentgenTuyandUrtsunEseh',   N'Рентген туяанд хэт өртсөн эсэх',           'RadioBox','f12_yn3','s12',N'SIGN OUT · Гибрид мэс засал хийгдсэн үед техникч бөглөнө',12,NULL,NULL,0,0,12,940),

-- === SIGN OUT · Эмч нар бөглөнө ==============================================
(@Form,'MedeeguijHuudasHutulsun',   N'Мэдээгүйжүүлгийн хуудсыг бүрэн хөтөлсөн',  'RadioBox','f12_yn3','s13',N'SIGN OUT · Эмчлэгч эмч, мэс заслын эмч болон мэдээгүйжүүлгийн эмч нар бөглөнө',13,NULL,NULL,0,0,12,960),
(@Form,'ErchimtEmchilgeeShiljuuleg',N'Мэс заслаас эрчимт эмчилгээний хэсэг рүү шилжүүлэг хийсэн','RadioBox','f12_yn3','s13',N'SIGN OUT · Эмчлэгч эмч, мэс заслын эмч болон мэдээгүйжүүлгийн эмч нар бөглөнө',13,NULL,NULL,0,0,12,970),
(@Form,'UndurUrtugteiBituumj',      N'Өндөр өртөгтэй мэс засалд эрчимт эмчилгээний битүүмж үүсгэх','RadioBox','f12_yn3','s13',N'SIGN OUT · Эмчлэгч эмч, мэс заслын эмч болон мэдээгүйжүүлгийн эмч нар бөглөнө',13,NULL,NULL,0,0,12,980),
(@Form,'SignOutTemdeglel',          N'Тэмдэглэл (Шалгах хуудас биелэгдээгүй тохиолдолд, гаргасан шийдвэрийг тодорхой тэмдэглэнэ үү)','TextArea',NULL,'s13',N'SIGN OUT · Эмчлэгч эмч, мэс заслын эмч болон мэдээгүйжүүлгийн эмч нар бөглөнө',13,NULL,NULL,0,0,12,990),
(@Form,'SignOutMesZaslynEmchUseg',  N'Мэс заслын эмчийн гарын үсэг /Он сар өдөр/','Text',NULL,'s13',N'SIGN OUT · Эмчлэгч эмч, мэс заслын эмч болон мэдээгүйжүүлгийн эмч нар бөглөнө',13,NULL,NULL,0,0,6,1000),
(@Form,'SignOutMedeeguijEmchUseg',  N'Мэдээгүйжүүлгийн эмчийн гарын үсэг /Он сар өдөр/','Text',NULL,'s13',N'SIGN OUT · Эмчлэгч эмч, мэс заслын эмч болон мэдээгүйжүүлгийн эмч нар бөглөнө',13,NULL,NULL,0,0,6,1010);
GO

SET NOEXEC OFF;
GO

SELECT FormCode,
       COUNT(*)                                                 AS Fields,
       COUNT(DISTINCT SectionCode)                              AS Sections,
       SUM(CASE WHEN ParentField IS NOT NULL THEN 1 ELSE 0 END) AS Conditional,
       SUM(CASE WHEN IsRequired  = 1 THEN 1 ELSE 0 END)         AS Required,
       SUM(CASE WHEN IsSearchable = 1 THEN 1 ELSE 0 END)        AS Searchable
  FROM dbo.TenderFormField
 WHERE FormCode = '1.2'
 GROUP BY FormCode;
GO
