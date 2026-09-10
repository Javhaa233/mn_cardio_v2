-- =============================================================================
-- Form 1.5  ЗҮРХНИЙ ТӨРӨЛХИЙГ ГАЖГИЙН МАЯГТ
-- Source: "MN cardio upgrade.docx", appendix 1.5
-- GENERATED from the document's own table structure by build-form-seeds.js.
--
-- 178 fields in 15 sections. Labels are verbatim from the tender.
-- Field codes and types are derived, NOT approved - clinical sign-off is step 1
-- of the WBS acceptance sequence and is the customer's to give.
-- 35 field(s) have a sample value whose type could not be inferred and were
-- left as Text; they are listed at the end of this file for review.
-- =============================================================================
SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @db sysname = DB_NAME();
IF @db NOT IN ('MnCardio_restored','MnCardioNew','MnCardio_test')
BEGIN
    RAISERROR('Refusing to run: unexpected database "%s".',16,1,@db);
    SET NOEXEC ON;
END
GO

DECLARE @Form varchar(20) = '1.5';
BEGIN TRAN;

IF EXISTS (SELECT 1 FROM dbo.TenderForm WHERE FormCode=@Form)
    UPDATE dbo.TenderForm SET NameMn=N'Зүрхний төрөлхийн гажгийн маягт', GroupCode='surgery',
        GroupLabelMn=N'Мэс заслын маягтууд', Position=15, IsActive=1, UpdateDate=GETDATE()
     WHERE FormCode=@Form;
ELSE
    INSERT INTO dbo.TenderForm (FormCode,NameMn,GroupCode,GroupLabelMn,Position)
    VALUES (@Form,N'Зүрхний төрөлхийн гажгийн маягт','surgery',N'Мэс заслын маягтууд',15);

DELETE FROM dbo.TenderFormField WHERE FormCode=@Form;

INSERT INTO dbo.TenderFormField
 (FormCode,FieldCode,LabelMn,FieldType,OptionType,SectionCode,SectionLabel,SectionPos,
  ParentField,ParentValue,IsRequired,IsSearchable,Md,Position)
VALUES
(@Form,'PatientsHistoryID',N'Patients History ID:','Number',NULL,'s1',N'Patient Operation record',1,NULL,NULL,0,0,12,10),
(@Form,'SocialSecurityNumber',N'Social security number','Text',NULL,'s1',N'Patient Operation record',1,NULL,NULL,0,0,12,20),
(@Form,'DoctorInCharge',N'Doctor in charge','Text',NULL,'s1',N'Patient Operation record',1,NULL,NULL,0,0,12,30),
(@Form,'DateOfAdmission',N'Date of admission','Date',NULL,'s1',N'Patient Operation record',1,NULL,NULL,0,0,12,40),
(@Form,'DateOfSurgery',N'Date of surgery','Date',NULL,'s1',N'Patient Operation record',1,NULL,NULL,0,0,12,50),
(@Form,'TypeOfSurgery',N'Type of surgery','Text',NULL,'s1',N'Patient Operation record',1,NULL,NULL,0,0,12,60),
(@Form,'PatientSurname',N'Patient surname','Text',NULL,'s1',N'Patient Operation record',1,NULL,NULL,0,0,12,70),
(@Form,'PatientFirstname',N'Patient firstname','Text',NULL,'s1',N'Patient Operation record',1,NULL,NULL,0,0,12,80),
(@Form,'DateOfBirth',N'Date of birth','Date',NULL,'s1',N'Patient Operation record',1,NULL,NULL,0,0,12,90),
(@Form,'PatientType',N'Patient type','Text',NULL,'s1',N'Patient Operation record',1,NULL,NULL,0,0,12,100),
(@Form,'Sex',N'Sex','Text',NULL,'s1',N'Patient Operation record',1,NULL,NULL,0,0,12,110),
(@Form,'PreOpNYHA',N'Pre-op NYHA','Text',NULL,'s1',N'Patient Operation record',1,NULL,NULL,0,0,12,120),
(@Form,'TheNCEPODClassificatonOfIntervention',N'The NCEPOD Classificaton of intervention','Text',NULL,'s1',N'Patient Operation record',1,NULL,NULL,0,0,12,130),
(@Form,'TypeOfOperaton',N'Type of Operaton','Text',NULL,'s1',N'Patient Operation record',1,NULL,NULL,0,0,12,140),
(@Form,'PreOpHeartRhythm',N'Pre-op heart rhythm','Text',NULL,'s1',N'Patient Operation record',1,NULL,NULL,0,0,12,150),
(@Form,'BodyWeightKg',N'Body weight /kg/','Number',NULL,'s2',N'Pre-op risk factors, and Comorbities',2,NULL,NULL,0,0,12,160),
(@Form,'HeightCm',N'Height /cm/','Number',NULL,'s2',N'Pre-op risk factors, and Comorbities',2,NULL,NULL,0,0,12,170),
(@Form,'BMIAutocalculator',N'BMI/Autocalculator/','Number',NULL,'s2',N'Pre-op risk factors, and Comorbities',2,NULL,NULL,0,0,12,180),
(@Form,'BSAAutocalculator',N'BSA/Autocalculator/','Number',NULL,'s2',N'Pre-op risk factors, and Comorbities',2,NULL,NULL,0,0,12,190),
(@Form,'ArterialHypertension',N'Arterial hypertension','RadioBox','yorn','s2',N'Pre-op risk factors, and Comorbities',2,NULL,NULL,0,0,12,200),
(@Form,'Smoking',N'Smoking','RadioBox','yorn','s2',N'Pre-op risk factors, and Comorbities',2,NULL,NULL,0,0,12,210),
(@Form,'AlcoholUsage',N'Alcohol usage','RadioBox','yorn','s2',N'Pre-op risk factors, and Comorbities',2,NULL,NULL,0,0,12,220),
(@Form,'Dyslipidemia',N'Dyslipidemia','RadioBox','yorn','s2',N'Pre-op risk factors, and Comorbities',2,NULL,NULL,0,0,12,230),
(@Form,'PreoperativeCriticalState',N'Preoperative critical state','RadioBox','yorn','s2',N'Pre-op risk factors, and Comorbities',2,NULL,NULL,0,0,12,240),
(@Form,'OtherCongenitalComorbidities',N'Other congenital comorbidities?','RadioBox','yorn','s2',N'Pre-op risk factors, and Comorbities',2,NULL,NULL,0,0,12,250),
(@Form,'InfectiousEndocarditis',N'Infectious endocarditis','RadioBox','yorn','s2',N'Pre-op risk factors, and Comorbities',2,NULL,NULL,0,0,12,260),
(@Form,'ChronicKidneyDisease',N'Chronic kidney disease','RadioBox','yorn','s2',N'Pre-op risk factors, and Comorbities',2,NULL,NULL,0,0,12,270),
(@Form,'ChronicLungDisease',N'Chronic lung disease','RadioBox','yorn','s2',N'Pre-op risk factors, and Comorbities',2,NULL,NULL,0,0,12,280),
(@Form,'ChronicLiverDisease',N'Chronic liver disease','RadioBox','yorn','s2',N'Pre-op risk factors, and Comorbities',2,NULL,NULL,0,0,12,290),
(@Form,'CerebrovascularDisease',N'Cerebrovascular disease','RadioBox','yorn','s2',N'Pre-op risk factors, and Comorbities',2,NULL,NULL,0,0,12,300),
(@Form,'PeripheralArteryDisease',N'Peripheral artery disease','RadioBox','yorn','s2',N'Pre-op risk factors, and Comorbities',2,NULL,NULL,0,0,12,310),
(@Form,'DiabetesMellitus',N'Diabetes mellitus','RadioBox','yorn','s2',N'Pre-op risk factors, and Comorbities',2,NULL,NULL,0,0,12,320),
(@Form,'WBCWriteIn150InDecimals',N'WBC/write in 1-50 in decimals/','Number',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,330),
(@Form,'HGBGDl',N'HGB /g/dl/','Number',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,340),
(@Form,'HCT',N'HCT','Number',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,350),
(@Form,'PLTInDecimalsToHundreds',N'PLT/in decimals to hundreds/','Number',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,360),
(@Form,'CreatinineMolL',N'Creatinine /µmol/L/','Number',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,370),
(@Form,'BUNMmolL',N'BUN/mmol/L/','Number',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,380),
(@Form,'KMmolL',N'K+/mmol/L/','Number',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,390),
(@Form,'Glucose',N'Glucose','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,400),
(@Form,'TotalAlbuminGL',N'Total albumin /g/L/','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,410),
(@Form,'ASTUL',N'AST /U/L/','Number',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,420),
(@Form,'ALTUL',N'ALT /U/L/','Number',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,430),
(@Form,'NTProBNPPgMl',N'NTProBNP /pg/ml/','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,440),
(@Form,'PreOpEcho',N'Pre-op Echo','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,450),
(@Form,'DateOfEchoMeasurement',N'Date of echo - Measurement','Date',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,460),
(@Form,'LVEF',N'LVEF','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,470),
(@Form,'LVEDD',N'LVEDD','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,480),
(@Form,'LVESD',N'LVESD','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,490),
(@Form,'AorticRootDiameterMMode',N'Aortic root diameter /M mode/','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,500),
(@Form,'LADMMode',N'LAD (AP) /M mode?/','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,510),
(@Form,'DOfAscAo',N'D of AscAo','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,520),
(@Form,'IVCDiametryCm',N'IVC diametry/cm/','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,530),
(@Form,'CollapsibiltyOfIVC',N'Collapsibilty of IVC','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,540),
(@Form,'TRMaxPG',N'TR maxPG','Number',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,550),
(@Form,'SPAPmmHg',N'sPAPmmHg','Number',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,560),
(@Form,'TAPSE',N'TAPSE','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,570),
(@Form,'PersistentLeftSVC',N'Persistent left SVC','RadioBox','yorn','s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,580),
(@Form,'ValvularAssessment',N'Valvular assessment','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,590),
(@Form,'AorticValveMeasurements',N'Aortic valve measurements','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,600),
(@Form,'ASDegree',N'AS degree','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,610),
(@Form,'AR',N'AR','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,620),
(@Form,'AVPHT',N'AV PHT','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,630),
(@Form,'AVMeanPG',N'AV meanPG','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,640),
(@Form,'MitralValveMeasurements',N'Mitral valve measurements','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,650),
(@Form,'MS',N'MS','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,660),
(@Form,'MR',N'MR','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,670),
(@Form,'MVA',N'MVA','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,680),
(@Form,'MVPHT',N'MVPHT','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,690),
(@Form,'MVMeanPG',N'MV meanPG','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,700),
(@Form,'TricuspidValveMeasurement',N'Tricuspid valve measurement','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,710),
(@Form,'TS',N'TS','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,720),
(@Form,'TR',N'TR','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,730),
(@Form,'TVMeanPG',N'TV meanPG','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,740),
(@Form,'PHT',N'PHT','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,750),
(@Form,'TRMaxPG2',N'TR maxPG','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,760),
(@Form,'TVAneurysmPresentOrNot',N'TV aneurysm present or not','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,770),
(@Form,'PulmonaryValveMeasurements',N'Pulmonary valve measurements','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,780),
(@Form,'PS',N'PS','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,790),
(@Form,'PR',N'PR','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,800),
(@Form,'PVVmax',N'PV Vmax','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,810),
(@Form,'PVMeanPG',N'PV meanPG','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,820),
(@Form,'CongentalDefectMeasurements',N'Congental defect measurements','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,830),
(@Form,'PatentForamenOvale',N'Patent foramen ovale','RadioBox','yorn','s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,840),
(@Form,'AtrialSeptalDefect',N'Atrial septal defect','RadioBox','yorn','s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,850),
(@Form,'VSD',N'VSD','RadioBox','yorn','s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,860),
(@Form,'AVCanal',N'AV Canal','RadioBox','yorn','s8',N'Pulmonary stenosis',8,NULL,NULL,0,0,12,870),
(@Form,'TOF',N'TOF','RadioBox','yorn','s8',N'Pulmonary stenosis',8,NULL,NULL,0,0,12,880),
(@Form,'CatheterAngiography',N'Catheter Angiography','RadioBox','yorn','s9',N'Other Complex Congenital Defects',9,NULL,NULL,0,0,12,890),
(@Form,'ComputedTomography',N'Computed Tomography','RadioBox','yorn','s9',N'Other Complex Congenital Defects',9,NULL,NULL,0,0,12,900),
(@Form,'Diuretics',N'Diuretics','RadioBox','yorn','s10',N'Pre-op medication and cardiac disease',10,NULL,NULL,0,0,12,910),
(@Form,'ACEOrARB',N'ACE or ARB','RadioBox','yorn','s10',N'Pre-op medication and cardiac disease',10,NULL,NULL,0,0,12,920),
(@Form,'BetaBlockers',N'Beta blockers','Text',NULL,'s10',N'Pre-op medication and cardiac disease',10,NULL,NULL,0,0,12,930),
(@Form,'Antiplatelets',N'Antiplatelets','RadioBox','yorn','s10',N'Pre-op medication and cardiac disease',10,NULL,NULL,0,0,12,940),
(@Form,'IfYes',N'If yes','Text',NULL,'s10',N'Pre-op medication and cardiac disease',10,'Antiplatelets','y',0,0,12,950),
(@Form,'ADPReceptorInhibitors',N'ADP receptor inhibitors','Text',NULL,'s10',N'Pre-op medication and cardiac disease',10,NULL,NULL,0,0,12,960),
(@Form,'COXInhibitors',N'COX inhibitors','Text',NULL,'s10',N'Pre-op medication and cardiac disease',10,NULL,NULL,0,0,12,970),
(@Form,'DateOfLastConsumption',N'Date of last consumption','Text',NULL,'s10',N'Pre-op medication and cardiac disease',10,NULL,NULL,0,0,12,980),
(@Form,'DurationOfAntiplateletIntake',N'Duration of antiplatelet intake','Text',NULL,'s10',N'Pre-op medication and cardiac disease',10,NULL,NULL,0,0,12,990),
(@Form,'Anticoagulants',N'Anticoagulants','RadioBox','yorn','s10',N'Pre-op medication and cardiac disease',10,NULL,NULL,0,0,12,1000),
(@Form,'IfYes2',N'If yes','Text',NULL,'s10',N'Pre-op medication and cardiac disease',10,'Anticoagulants','y',0,0,12,1010),
(@Form,'DateOfLastConsumption2',N'Date of last consumption','Text',NULL,'s10',N'Pre-op medication and cardiac disease',10,NULL,NULL,0,0,12,1020),
(@Form,'DurationOfAnticoagulantIntake',N'Duration of anticoagulant intake','Text',NULL,'s10',N'Pre-op medication and cardiac disease',10,NULL,NULL,0,0,12,1030),
(@Form,'Nitrates',N'Nitrates','Text',NULL,'s10',N'Pre-op medication and cardiac disease',10,NULL,NULL,0,0,12,1040),
(@Form,'Inotropes',N'Inotropes','Text',NULL,'s10',N'Pre-op medication and cardiac disease',10,NULL,NULL,0,0,12,1050),
(@Form,'PHTMedication',N'PHT medication','Text',NULL,'s10',N'Pre-op medication and cardiac disease',10,NULL,NULL,0,0,12,1060),
(@Form,'LipidLoweringDrugs',N'Lipid lowering drugs','Text',NULL,'s10',N'Pre-op medication and cardiac disease',10,NULL,NULL,0,0,12,1070),
(@Form,'AntiglycemicDrugs',N'Antiglycemic drugs','RadioBox','yorn','s10',N'Pre-op medication and cardiac disease',10,NULL,NULL,0,0,12,1080),
(@Form,'RiskOfMortality',N'Risk of Mortality','Text',NULL,'s10',N'Pre-op medication and cardiac disease',10,NULL,NULL,0,0,12,1090),
(@Form,'EuroscoreII',N'Euroscore II','Text',NULL,'s10',N'Pre-op medication and cardiac disease',10,NULL,NULL,0,0,12,1100),
(@Form,'STSScore',N'STS score','Text',NULL,'s10',N'Pre-op medication and cardiac disease',10,NULL,NULL,0,0,12,1110),
(@Form,'ZScore',N'Z score','Text',NULL,'s10',N'Pre-op medication and cardiac disease',10,NULL,NULL,0,0,12,1120),
(@Form,'OperativeRecord',N'Operative record','Text',NULL,'s10',N'Pre-op medication and cardiac disease',10,NULL,NULL,0,0,12,1130),
(@Form,'DateOfSurgery2',N'Date of surgery','Date',NULL,'s10',N'Pre-op medication and cardiac disease',10,NULL,NULL,0,0,12,1140),
(@Form,'Operator',N'Operator','Text',NULL,'s10',N'Pre-op medication and cardiac disease',10,NULL,NULL,0,0,12,1150),
(@Form,'FirstAssistant',N'First assistant','Text',NULL,'s10',N'Pre-op medication and cardiac disease',10,NULL,NULL,0,0,12,1160),
(@Form,'SecondAssistant',N'Second assistant','Text',NULL,'s10',N'Pre-op medication and cardiac disease',10,NULL,NULL,0,0,12,1170),
(@Form,'Perfusionist',N'Perfusionist','Text',NULL,'s10',N'Pre-op medication and cardiac disease',10,NULL,NULL,0,0,12,1180),
(@Form,'Anesthesiologist',N'Anesthesiologist','Text',NULL,'s10',N'Pre-op medication and cardiac disease',10,NULL,NULL,0,0,12,1190),
(@Form,'AnesthesiologistNurse',N'Anesthesiologist nurse','Text',NULL,'s10',N'Pre-op medication and cardiac disease',10,NULL,NULL,0,0,12,1200),
(@Form,'ScrubNurse',N'Scrub nurse','Text',NULL,'s10',N'Pre-op medication and cardiac disease',10,NULL,NULL,0,0,12,1210),
(@Form,'PreviousOperation',N'Previous operation','Text',NULL,'s10',N'Pre-op medication and cardiac disease',10,NULL,NULL,0,0,12,1220),
(@Form,'DateOfPreviousOperation',N'Date of previous operation','Date',NULL,'s10',N'Pre-op medication and cardiac disease',10,NULL,NULL,0,0,12,1230),
(@Form,'OperationName',N'Operation name:','Text',NULL,'s10',N'Pre-op medication and cardiac disease',10,NULL,NULL,0,0,12,1240),
(@Form,'PreOperativeDiagnosis',N'Pre-operative diagnosis','Text',NULL,'s10',N'Pre-op medication and cardiac disease',10,NULL,NULL,0,0,12,1250),
(@Form,'MainDiagnosis1',N'Main diagnosis - #1','Text',NULL,'s10',N'Pre-op medication and cardiac disease',10,NULL,NULL,0,0,12,1260),
(@Form,'SubsidiaryDiagnosis2',N'Subsidiary diagnosis #2','Text',NULL,'s10',N'Pre-op medication and cardiac disease',10,NULL,NULL,0,0,12,1270),
(@Form,'SubsidiaryDiagnosis3',N'Subsidiary diagnosis #3','Text',NULL,'s10',N'Pre-op medication and cardiac disease',10,NULL,NULL,0,0,12,1280),
(@Form,'AdditionalExplanationOfTheProcedure',N'Additional explanation of the procedure','Text',NULL,'s10',N'Pre-op medication and cardiac disease',10,NULL,NULL,0,0,12,1290),
(@Form,'SurigcalProcedureRecord',N'Surigcal procedure record','Text',NULL,'s10',N'Pre-op medication and cardiac disease',10,NULL,NULL,0,0,12,1300),
(@Form,'IncisionSite',N'Incision site:','Text',NULL,'s10',N'Pre-op medication and cardiac disease',10,NULL,NULL,0,0,12,1310),
(@Form,'TotalPerfusionTimeMinutes',N'Total perfusion time/minutes/:','Text',NULL,'s10',N'Pre-op medication and cardiac disease',10,NULL,NULL,0,0,12,1320),
(@Form,'AorticCrossClampTimeMinutes',N'Aortic cross clamp time/minutes/:','Text',NULL,'s10',N'Pre-op medication and cardiac disease',10,NULL,NULL,0,0,12,1330),
(@Form,'ArrestTime',N'Arrest time:','Text',NULL,'s10',N'Pre-op medication and cardiac disease',10,NULL,NULL,0,0,12,1340),
(@Form,'LowestTemperature',N'Lowest temperature:','Text',NULL,'s10',N'Pre-op medication and cardiac disease',10,NULL,NULL,0,0,12,1350),
(@Form,'MainProcedure',N'Main procedure:','Text',NULL,'s10',N'Pre-op medication and cardiac disease',10,NULL,NULL,0,0,12,1360),
(@Form,'ASDClosure',N'ASD closure','RadioBox','yorn','s10',N'Pre-op medication and cardiac disease',10,NULL,NULL,0,0,12,1370),
(@Form,'VSDClosure',N'VSD closure:','RadioBox','yorn','s11',N'TV repair',11,NULL,NULL,0,0,12,1380),
(@Form,'OpenPDAClosure',N'Open PDA closure','RadioBox','yorn','s11',N'TV repair',11,NULL,NULL,0,0,12,1390),
(@Form,'Others',N'Others','Text',NULL,'s12',N'Whether surgically created ASD for PHT',12,NULL,NULL,0,0,12,1400),
(@Form,'DrainageTubes',N'Drainage tubes','Text',NULL,'s12',N'Whether surgically created ASD for PHT',12,NULL,NULL,0,0,12,1410),
(@Form,'DefibrillationTimes',N'Defibrillation times','RadioBox','yorn','s12',N'Whether surgically created ASD for PHT',12,NULL,NULL,0,0,12,1420),
(@Form,'WerePatientIsOnInotropicSupport',N'Were patient is on inotropic support','RadioBox','yorn','s12',N'Whether surgically created ASD for PHT',12,NULL,NULL,0,0,12,1430),
(@Form,'BloodTransfusionDuringSurgery',N'Blood transfusion during surgery','RadioBox','yorn','s13',N'Estimated blood loss during surgery (cc):',13,NULL,NULL,0,0,12,1440),
(@Form,'TissuePathology',N'Tissue pathology:','RadioBox','yorn','s13',N'Estimated blood loss during surgery (cc):',13,NULL,NULL,0,0,12,1450),
(@Form,'DateOfRecording',N'Date of recording:','Date',NULL,'s15',N'Patient discharge note after surgery:',15,NULL,NULL,0,0,12,1460),
(@Form,'DateOfSurgery3',N'Date of surgery:','Date',NULL,'s15',N'Patient discharge note after surgery:',15,NULL,NULL,0,0,12,1470),
(@Form,'DateOfHospitalDischarge',N'Date of hospital discharge:','Date',NULL,'s15',N'Patient discharge note after surgery:',15,NULL,NULL,0,0,12,1480),
(@Form,'PostOperativeDay',N'Post operative day:','Number',NULL,'s15',N'Patient discharge note after surgery:',15,NULL,NULL,0,0,12,1490),
(@Form,'ICUDay',N'ICU day:','Text',NULL,'s15',N'Patient discharge note after surgery:',15,NULL,NULL,0,0,12,1500),
(@Form,'BloodTransfusionAfterSurgeryUntilDischarge',N'Blood transfusion after surgery until discharge:','Text',NULL,'s15',N'Patient discharge note after surgery:',15,NULL,NULL,0,0,12,1510),
(@Form,'IfYes3',N'If yes:','Text',NULL,'s15',N'Patient discharge note after surgery:',15,'BloodTransfusionAfterSurgeryUntilDischarge','y',0,0,12,1520),
(@Form,'AmountOfTransfusionPackedRBCInMl',N'Amount of transfusion/Packed RBC in ml/:','Text',NULL,'s15',N'Patient discharge note after surgery:',15,NULL,NULL,0,0,12,1530),
(@Form,'PostOperativeDiagnosis',N'Post operative diagnosis:','Text',NULL,'s15',N'Patient discharge note after surgery:',15,NULL,NULL,0,0,12,1540),
(@Form,'MainDiagnosis12',N'Main diagnosis - #1','Text',NULL,'s15',N'Patient discharge note after surgery:',15,NULL,NULL,0,0,12,1550),
(@Form,'SubsidiaryDiagnosis22',N'Subsidiary diagnosis #2','Text',NULL,'s15',N'Patient discharge note after surgery:',15,NULL,NULL,0,0,12,1560),
(@Form,'SubsidiaryDiagnosis32',N'Subsidiary diagnosis #3','Text',NULL,'s15',N'Patient discharge note after surgery:',15,NULL,NULL,0,0,12,1570),
(@Form,'Operation',N'Operation:','Text',NULL,'s15',N'Patient discharge note after surgery:',15,NULL,NULL,0,0,12,1580),
(@Form,'F1',N'1','Text',NULL,'s15',N'Patient discharge note after surgery:',15,NULL,NULL,0,0,12,1590),
(@Form,'F2',N'2','Text',NULL,'s15',N'Patient discharge note after surgery:',15,NULL,NULL,0,0,12,1600),
(@Form,'PostOpEcho',N'Post-Op echo:','Text',NULL,'s15',N'Patient discharge note after surgery:',15,NULL,NULL,0,0,12,1610),
(@Form,'DateOfEchoMeasurement2',N'Date of echo - Measurement','Text',NULL,'s15',N'Patient discharge note after surgery:',15,NULL,NULL,0,0,12,1620),
(@Form,'LVEF2',N'LVEF','Text',NULL,'s15',N'Patient discharge note after surgery:',15,NULL,NULL,0,0,12,1630),
(@Form,'LVEDD2',N'LVEDD','Text',NULL,'s15',N'Patient discharge note after surgery:',15,NULL,NULL,0,0,12,1640),
(@Form,'LVESD2',N'LVESD','Text',NULL,'s15',N'Patient discharge note after surgery:',15,NULL,NULL,0,0,12,1650),
(@Form,'LVFunction',N'LV function','Text',NULL,'s15',N'Patient discharge note after surgery:',15,NULL,NULL,0,0,12,1660),
(@Form,'RVFunction',N'RV function','Text',NULL,'s15',N'Patient discharge note after surgery:',15,NULL,NULL,0,0,12,1670),
(@Form,'RAVolume',N'RA volume','Text',NULL,'s15',N'Patient discharge note after surgery:',15,NULL,NULL,0,0,12,1680),
(@Form,'LAVolume',N'LA volume','Text',NULL,'s15',N'Patient discharge note after surgery:',15,NULL,NULL,0,0,12,1690),
(@Form,'ResidualShunt',N'Residual shunt','Text',NULL,'s15',N'Patient discharge note after surgery:',15,NULL,NULL,0,0,12,1700),
(@Form,'TRMaxPG3',N'TR maxPG','Text',NULL,'s15',N'Patient discharge note after surgery:',15,NULL,NULL,0,0,12,1710),
(@Form,'SPAPmmHg2',N'sPAPmmHg','Number',NULL,'s15',N'Patient discharge note after surgery:',15,NULL,NULL,0,0,12,1720),
(@Form,'CreatedASDSurgicalShuntDirection',N'Created ASD surgical shunt direction','Text',NULL,'s15',N'Patient discharge note after surgery:',15,NULL,NULL,0,0,12,1730),
(@Form,'PostOpHeartRhythm',N'Post-op heart rhythm:','Text',NULL,'s15',N'Patient discharge note after surgery:',15,NULL,NULL,0,0,12,1740),
(@Form,'DischargeStatus',N'Discharge status:','Text',NULL,'s15',N'Patient discharge note after surgery:',15,NULL,NULL,0,0,12,1750),
(@Form,'DestinationOnDischarge',N'Destination on discharge:','Text',NULL,'s15',N'Patient discharge note after surgery:',15,NULL,NULL,0,0,12,1760),
(@Form,'IfComplicationPresentSpecify',N'If complication present, specify','Text',NULL,'s15',N'Patient discharge note after surgery:',15,NULL,NULL,0,0,12,1770),
(@Form,'IsPatientDeceased',N'Is patient deceased:','RadioBox','yorn','s15',N'Patient discharge note after surgery:',15,NULL,NULL,0,0,12,1780);

COMMIT;
GO
SET NOEXEC OFF;
GO
SELECT '1.5' AS FormCode, COUNT(*) AS Fields FROM dbo.TenderFormField WHERE FormCode='1.5';
GO

/* ---- fields needing a type/option-list decision from the clinical team ----
   SocialSecurityNumber                     sample="OM01010101"  Social security number
   DoctorInCharge                           sample="Batbaatar"  Doctor in charge
   TypeOfSurgery                            sample="Congenital Heart Disease Surgery"  Type of surgery
   PatientSurname                           sample="Patient"  Patient surname
   PatientFirstname                         sample="Name"  Patient firstname
   PatientType                              sample="Pediatric"  Patient type
   Sex                                      sample="Male"  Sex
   TheNCEPODClassificatonOfIntervention     sample="Elective"  The NCEPOD Classificaton of intervention
   TypeOfOperaton                           sample="Primary surgery"  Type of Operaton
   PreOpHeartRhythm                         sample="Normal sinus rhythm"  Pre-op heart rhythm
   TS                                       sample="TS Moderate"  TS
   Operator                                 sample="Batbaatar"  Operator
   FirstAssistant                           sample="Ayurzana"  First assistant
   Perfusionist                             sample="Munkhjargal"  Perfusionist
   Anesthesiologist                         sample="Demid-Od"  Anesthesiologist
   AnesthesiologistNurse                    sample="Sarantuya"  Anesthesiologist nurse
   ScrubNurse                               sample="Nandintsetseg"  Scrub nurse
   PreviousOperation                        sample="Anorectal malformation repair"  Previous operation
   OperationName                            sample="temporary colostomy"  Operation name:
   MainDiagnosis1                           sample="CHD- Large perimembranous VSD"  Main diagnosis - #1
   SubsidiaryDiagnosis2                     sample="Congenital anorectal malformation"  Subsidiary diagnosis #2
   SubsidiaryDiagnosis3                     sample="opening anal opening, repositioning rectum post surgery state"  Subsidiary diagnosis #3
   IncisionSite                             sample="Median sternotomy"  Incision site:
   DrainageTubes                            sample="Substernal, Pericardial"  Drainage tubes
   MainDiagnosis12                          sample="VSD patch closure post operative state"  Main diagnosis - #1
   LVEF2                                    sample="normal range"  LVEF
   LVFunction                               sample="Increased compared to Pre-Op"  LV function
   RVFunction                               sample="Decreased compared to Pre-Op"  RV function
   RAVolume                                 sample="Increased compared to Pre-Op"  RA volume
   LAVolume                                 sample="Increased compared to Pre-Op"  LA volume
   ResidualShunt                            sample="Not present"  Residual shunt
   CreatedASDSurgicalShuntDirection         sample="Left to RIght"  Created ASD surgical shunt direction
   PostOpHeartRhythm                        sample="Normal sinus rhythm"  Post-op heart rhythm:
   DischargeStatus                          sample="Alive without complication"  Discharge status:
   DestinationOnDischarge                   sample="Home/Outpatients clinic"  Destination on discharge:
*/
