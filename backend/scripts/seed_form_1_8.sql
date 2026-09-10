-- =============================================================================
-- Form 1.8  ХАВХЛАГЫН МЭС ЗАСАЛ
-- Source: "MN cardio upgrade.docx", appendix 1.8
-- GENERATED from the document's own table structure by build-form-seeds.js.
--
-- 234 fields in 8 sections. Labels are verbatim from the tender.
-- Field codes and types are derived, NOT approved - clinical sign-off is step 1
-- of the WBS acceptance sequence and is the customer's to give.
-- 51 field(s) have a sample value whose type could not be inferred and were
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

DECLARE @Form varchar(20) = '1.8';
BEGIN TRAN;

IF EXISTS (SELECT 1 FROM dbo.TenderForm WHERE FormCode=@Form)
    UPDATE dbo.TenderForm SET NameMn=N'Хавхлагын мэс заслын маягт', GroupCode='surgery',
        GroupLabelMn=N'Мэс заслын маягтууд', Position=18, IsActive=1, UpdateDate=GETDATE()
     WHERE FormCode=@Form;
ELSE
    INSERT INTO dbo.TenderForm (FormCode,NameMn,GroupCode,GroupLabelMn,Position)
    VALUES (@Form,N'Хавхлагын мэс заслын маягт','surgery',N'Мэс заслын маягтууд',18);

DELETE FROM dbo.TenderFormField WHERE FormCode=@Form;

INSERT INTO dbo.TenderFormField
 (FormCode,FieldCode,LabelMn,FieldType,OptionType,SectionCode,SectionLabel,SectionPos,
  ParentField,ParentValue,IsRequired,IsSearchable,Md,Position)
VALUES
(@Form,'PatientOperationRecord',N'Patient Operation record','Text',NULL,'s1',N'Valve Surgery Datasheet for CVSD',1,NULL,NULL,0,0,12,10),
(@Form,'PatientsHistoryID',N'Patients History ID:','Number',NULL,'s1',N'Valve Surgery Datasheet for CVSD',1,NULL,NULL,0,0,12,20),
(@Form,'SocialSecurityNumber',N'Social security number','Text',NULL,'s1',N'Valve Surgery Datasheet for CVSD',1,NULL,NULL,0,0,12,30),
(@Form,'DoctorInCharge',N'Doctor in charge','Text',NULL,'s1',N'Valve Surgery Datasheet for CVSD',1,NULL,NULL,0,0,12,40),
(@Form,'DateOfAdmission',N'Date of admission','Date',NULL,'s1',N'Valve Surgery Datasheet for CVSD',1,NULL,NULL,0,0,12,50),
(@Form,'DateOfSurgery',N'Date of surgery','Date',NULL,'s1',N'Valve Surgery Datasheet for CVSD',1,NULL,NULL,0,0,12,60),
(@Form,'TypeOfSurgery',N'Type of surgery','Text',NULL,'s1',N'Valve Surgery Datasheet for CVSD',1,NULL,NULL,0,0,12,70),
(@Form,'PatientSurname',N'Patient surname','Text',NULL,'s1',N'Valve Surgery Datasheet for CVSD',1,NULL,NULL,0,0,12,80),
(@Form,'PatientFirstname',N'Patient firstname','Text',NULL,'s1',N'Valve Surgery Datasheet for CVSD',1,NULL,NULL,0,0,12,90),
(@Form,'DateOfBirth',N'Date of birth','Date',NULL,'s1',N'Valve Surgery Datasheet for CVSD',1,NULL,NULL,0,0,12,100),
(@Form,'Sex',N'Sex','Text',NULL,'s1',N'Valve Surgery Datasheet for CVSD',1,NULL,NULL,0,0,12,110),
(@Form,'PreOpNYHA',N'Pre-op NYHA','Text',NULL,'s1',N'Valve Surgery Datasheet for CVSD',1,NULL,NULL,0,0,12,120),
(@Form,'TheNCEPODClassificatonOfIntervention',N'The NCEPOD Classificaton of intervention','Text',NULL,'s1',N'Valve Surgery Datasheet for CVSD',1,NULL,NULL,0,0,12,130),
(@Form,'TypeOfOperaton',N'Type of Operaton','Text',NULL,'s1',N'Valve Surgery Datasheet for CVSD',1,NULL,NULL,0,0,12,140),
(@Form,'PreOpHeartRhythm',N'Pre-op heart rhythm','Text',NULL,'s1',N'Valve Surgery Datasheet for CVSD',1,NULL,NULL,0,0,12,150),
(@Form,'BodyWeightKg',N'Body weight /kg/','Number',NULL,'s2',N'Pre-op risk factors, and Comorbities',2,NULL,NULL,0,0,12,160),
(@Form,'HeightCm',N'Height /cm/','Number',NULL,'s2',N'Pre-op risk factors, and Comorbities',2,NULL,NULL,0,0,12,170),
(@Form,'BMIAutocalculator',N'BMI/Autocalculator/','Number',NULL,'s2',N'Pre-op risk factors, and Comorbities',2,NULL,NULL,0,0,12,180),
(@Form,'BSAAutocalculator',N'BSA/Autocalculator/','Number',NULL,'s2',N'Pre-op risk factors, and Comorbities',2,NULL,NULL,0,0,12,190),
(@Form,'ArterialHypertension',N'Arterial hypertension','RadioBox','yorn','s2',N'Pre-op risk factors, and Comorbities',2,NULL,NULL,0,0,12,200),
(@Form,'Smoking',N'Smoking','RadioBox','yorn','s2',N'Pre-op risk factors, and Comorbities',2,NULL,NULL,0,0,12,210),
(@Form,'AlcoholUsage',N'Alcohol usage','RadioBox','yorn','s2',N'Pre-op risk factors, and Comorbities',2,NULL,NULL,0,0,12,220),
(@Form,'Dyslipidemia',N'Dyslipidemia','RadioBox','yorn','s2',N'Pre-op risk factors, and Comorbities',2,NULL,NULL,0,0,12,230),
(@Form,'PreoperativeCriticalState',N'Preoperative critical state','RadioBox','yorn','s2',N'Pre-op risk factors, and Comorbities',2,NULL,NULL,0,0,12,240),
(@Form,'InfectiousEndocarditis',N'Infectious endocarditis','RadioBox','yorn','s2',N'Pre-op risk factors, and Comorbities',2,NULL,NULL,0,0,12,250),
(@Form,'ChronicKidneyDisease',N'Chronic kidney disease','RadioBox','yorn','s2',N'Pre-op risk factors, and Comorbities',2,NULL,NULL,0,0,12,260),
(@Form,'ChronicLungDisease',N'Chronic lung disease','RadioBox','yorn','s2',N'Pre-op risk factors, and Comorbities',2,NULL,NULL,0,0,12,270),
(@Form,'ChronicLiverDisease',N'Chronic liver disease','RadioBox','yorn','s2',N'Pre-op risk factors, and Comorbities',2,NULL,NULL,0,0,12,280),
(@Form,'CerebrovascularDisease',N'Cerebrovascular disease','RadioBox','yorn','s2',N'Pre-op risk factors, and Comorbities',2,NULL,NULL,0,0,12,290),
(@Form,'PeripheralArteryDisease',N'Peripheral artery disease','RadioBox','yorn','s2',N'Pre-op risk factors, and Comorbities',2,NULL,NULL,0,0,12,300),
(@Form,'DiabetesMellitus',N'Diabetes mellitus','RadioBox','yorn','s2',N'Pre-op risk factors, and Comorbities',2,NULL,NULL,0,0,12,310),
(@Form,'WBCWriteIn150InDecimals',N'WBC/write in 1-50 in decimals/','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,320),
(@Form,'HGBGDl',N'HGB /g/dl/','Number',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,330),
(@Form,'HCT',N'HCT','Number',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,340),
(@Form,'PLTInDecimalsToHundreds',N'PLT/in decimals to hundreds/','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,350),
(@Form,'CreatinineMolL',N'Creatinine /µmol/L/','Number',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,360),
(@Form,'BUNMmolL',N'BUN/mmol/L/','Number',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,370),
(@Form,'KMmolL',N'K+/mmol/L/','Number',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,380),
(@Form,'Glucose',N'Glucose','Number',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,390),
(@Form,'TotalAlbuminGL',N'Total albumin /g/L/','Number',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,400),
(@Form,'ASTUL',N'AST /U/L/','Number',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,410),
(@Form,'ALTUL',N'ALT /U/L/','Number',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,420),
(@Form,'NTProBNPPgMl',N'NTProBNP /pg/ml/','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,430),
(@Form,'PreOpEcho',N'Pre-op Echo','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,440),
(@Form,'DateOfEchoMeasurement',N'Date of echo - Measurement','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,450),
(@Form,'LVEF',N'LVEF','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,460),
(@Form,'LVEDD',N'LVEDD','Number',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,470),
(@Form,'LVESD',N'LVESD','Number',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,480),
(@Form,'AorticRootDiameterMMode',N'Aortic root diameter /M mode/','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,490),
(@Form,'LADMMode',N'LAD (AP) /M mode?/','Number',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,500),
(@Form,'DOfAscAo',N'D of AscAo','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,510),
(@Form,'RightAtrialDimension',N'Right atrial dimension','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,520),
(@Form,'SPAPmmHg',N'sPAPmmHg','Number',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,530),
(@Form,'IVC',N'IVC','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,540),
(@Form,'TAPSE',N'TAPSE','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,550),
(@Form,'Comments',N'Comments','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,560),
(@Form,'ValvularAssessment',N'Valvular assessment','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,570),
(@Form,'AorticValveMeasurements',N'Aortic valve measurements','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,580),
(@Form,'ASDegree',N'AS degree','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,590),
(@Form,'AR',N'AR','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,600),
(@Form,'AVPHT',N'AV PHT','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,610),
(@Form,'AVMeanPG',N'AV meanPG','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,620),
(@Form,'MitralValveMeasurements',N'Mitral valve measurements','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,630),
(@Form,'MS',N'MS','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,640),
(@Form,'MR',N'MR','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,650),
(@Form,'MVA',N'MVA','Number',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,660),
(@Form,'MVPHT',N'MVPHT','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,670),
(@Form,'MVMeanPG',N'MV meanPG','Number',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,680),
(@Form,'TricuspidValveMeasurement',N'Tricuspid valve measurement','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,690),
(@Form,'TS',N'TS','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,700),
(@Form,'TR',N'TR','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,710),
(@Form,'TVMeanPG',N'TV meanPG','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,720),
(@Form,'PHT',N'PHT','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,730),
(@Form,'TRMaxPG',N'TR maxPG','Number',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,740),
(@Form,'PulmonaryValveMeasurements',N'Pulmonary valve measurements','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,750),
(@Form,'PS',N'PS','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,760),
(@Form,'PR',N'PR','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,770),
(@Form,'PVVmax',N'PV Vmax','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,780),
(@Form,'PVMeanPG',N'PV meanPG','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,790),
(@Form,'LVSegmentalContractility',N'LV Segmental contractility','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,800),
(@Form,'Apical',N'Apical','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,810),
(@Form,'ApicalSeptal',N'Apical septal','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,820),
(@Form,'ApicalLateral',N'Apical lateral','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,830),
(@Form,'ApicalAnterior',N'Apical anterior','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,840),
(@Form,'ApicalInferior',N'Apical inferior','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,850),
(@Form,'MidAnterior',N'Mid anterior','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,860),
(@Form,'MidAnterolateral',N'Mid anterolateral','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,870),
(@Form,'MidInferolateral',N'Mid inferolateral','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,880),
(@Form,'MidAnteroseptal',N'Mid anteroseptal','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,890),
(@Form,'BasalAnterior',N'Basal anterior','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,900),
(@Form,'BasalAnterolateral',N'Basal anterolateral','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,910),
(@Form,'BasalInferior',N'Basal inferior','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,920),
(@Form,'BasalInferoseptal',N'Basal inferoseptal','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,930),
(@Form,'BasalInferolateral',N'Basal inferolateral','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,940),
(@Form,'BasalAnteroseptal',N'Basal anteroseptal','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,950),
(@Form,'GlobalHypokinesia',N'Global hypokinesia','RadioBox','yorn','s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,960),
(@Form,'PreOpMedicationAndCardiacDisease',N'Pre-op medication and cardiac disease','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,970),
(@Form,'Diuretics',N'Diuretics','RadioBox','yorn','s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,980),
(@Form,'ACEOrARB',N'ACE or ARB','RadioBox','yorn','s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,990),
(@Form,'BetaBlockers',N'Beta blockers','RadioBox','yorn','s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,1000),
(@Form,'Antiplatelets',N'Antiplatelets','RadioBox','yorn','s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,1010),
(@Form,'IfYes',N'If yes','Text',NULL,'s4',N'Pre-op lab and Echo',4,'Antiplatelets','y',0,0,12,1020),
(@Form,'ADPReceptorInhibitors',N'ADP receptor inhibitors','RadioBox','yorn','s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,1030),
(@Form,'COXInhibitors',N'COX inhibitors','RadioBox','yorn','s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,1040),
(@Form,'DateOfLastConsumption',N'Date of last consumption','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,1050),
(@Form,'DurationOfAntiplateletIntake',N'Duration of antiplatelet intake','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,1060),
(@Form,'Anticoagulants',N'Anticoagulants','RadioBox','yorn','s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,1070),
(@Form,'IfYes2',N'If yes','Text',NULL,'s4',N'Pre-op lab and Echo',4,'Anticoagulants','y',0,0,12,1080),
(@Form,'DateOfLastConsumption2',N'Date of last consumption','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,1090),
(@Form,'DurationOfAnticoagulantIntake',N'Duration of anticoagulant intake','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,1100),
(@Form,'Nitrates',N'Nitrates','RadioBox','yorn','s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,1110),
(@Form,'Inotropes',N'Inotropes','RadioBox','yorn','s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,1120),
(@Form,'LipidLoweringDrugs',N'Lipid lowering drugs','RadioBox','yorn','s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,1130),
(@Form,'AntiglycemicDrugs',N'Antiglycemic drugs','RadioBox','yorn','s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,1140),
(@Form,'RiskOfMortality',N'Risk of Mortality','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,1150),
(@Form,'EuroscoreII',N'Euroscore II','Number',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,1160),
(@Form,'STSScore',N'STS score','Text',NULL,'s4',N'Pre-op lab and Echo',4,NULL,NULL,0,0,12,1170),
(@Form,'DateOfSurgery2',N'Date of surgery','Text',NULL,'s5',N'Operative record',5,NULL,NULL,0,0,12,1180),
(@Form,'Operator',N'Operator','Text',NULL,'s5',N'Operative record',5,NULL,NULL,0,0,12,1190),
(@Form,'FirstAssistant',N'First assistant','Text',NULL,'s5',N'Operative record',5,NULL,NULL,0,0,12,1200),
(@Form,'SecondAssistant',N'Second assistant','Text',NULL,'s5',N'Operative record',5,NULL,NULL,0,0,12,1210),
(@Form,'Perfusionist',N'Perfusionist','Text',NULL,'s5',N'Operative record',5,NULL,NULL,0,0,12,1220),
(@Form,'Anesthesiologist',N'Anesthesiologist','Text',NULL,'s5',N'Operative record',5,NULL,NULL,0,0,12,1230),
(@Form,'AnesthesiologistNurse',N'Anesthesiologist nurse','Text',NULL,'s5',N'Operative record',5,NULL,NULL,0,0,12,1240),
(@Form,'ScrubNurse',N'Scrub nurse','Text',NULL,'s5',N'Operative record',5,NULL,NULL,0,0,12,1250),
(@Form,'PreviousOperation',N'Previous operation','Text',NULL,'s5',N'Operative record',5,NULL,NULL,0,0,12,1260),
(@Form,'DateOfPreviousOperation',N'Date of previous operation','Text',NULL,'s5',N'Operative record',5,NULL,NULL,0,0,12,1270),
(@Form,'OperationName',N'Operation name:','Text',NULL,'s5',N'Operative record',5,NULL,NULL,0,0,12,1280),
(@Form,'AorticValve',N'Aortic valve','Text',NULL,'s5',N'Operative record',5,NULL,NULL,0,0,12,1290),
(@Form,'MitralValve',N'Mitral valve','Text',NULL,'s5',N'Operative record',5,NULL,NULL,0,0,12,1300),
(@Form,'TricuspidValve',N'Tricuspid valve','Text',NULL,'s5',N'Operative record',5,NULL,NULL,0,0,12,1310),
(@Form,'PulmonaryValve',N'Pulmonary valve','Text',NULL,'s5',N'Operative record',5,NULL,NULL,0,0,12,1320),
(@Form,'PreOperativeDiagnosis',N'Pre-operative diagnosis','Text',NULL,'s5',N'Operative record',5,NULL,NULL,0,0,12,1330),
(@Form,'MainDiagnosis1',N'Main diagnosis - #1','Text',NULL,'s5',N'Operative record',5,NULL,NULL,0,0,12,1340),
(@Form,'SubsidiaryDiagnosis2',N'Subsidiary diagnosis #2','Text',NULL,'s5',N'Operative record',5,NULL,NULL,0,0,12,1350),
(@Form,'SubsidiaryDiagnosis3',N'Subsidiary diagnosis #3','Text',NULL,'s5',N'Operative record',5,NULL,NULL,0,0,12,1360),
(@Form,'AdditionalExplanationOfTheProcedure',N'Additional explanation of the procedure','Text',NULL,'s5',N'Operative record',5,NULL,NULL,0,0,12,1370),
(@Form,'SurigcalProcedureRecord',N'Surigcal procedure record','Text',NULL,'s5',N'Operative record',5,NULL,NULL,0,0,12,1380),
(@Form,'IncisionSite',N'Incision site:','Text',NULL,'s5',N'Operative record',5,NULL,NULL,0,0,12,1390),
(@Form,'TotalPerfusionTime',N'Total perfusion time:','Number',NULL,'s5',N'Operative record',5,NULL,NULL,0,0,12,1400),
(@Form,'AorticCrossClampTime',N'Aortic cross clamp time:','Number',NULL,'s5',N'Operative record',5,NULL,NULL,0,0,12,1410),
(@Form,'ArrestTime',N'Arrest time:','Text',NULL,'s5',N'Operative record',5,NULL,NULL,0,0,12,1420),
(@Form,'LowestTemperature',N'Lowest temperature:','Text',NULL,'s5',N'Operative record',5,NULL,NULL,0,0,12,1430),
(@Form,'AorticValve2',N'Aortic valve','Text',NULL,'s5',N'Operative record',5,NULL,NULL,0,0,12,1440),
(@Form,'MitralValve2',N'Mitral valve','Text',NULL,'s5',N'Operative record',5,NULL,NULL,0,0,12,1450),
(@Form,'TricuspidValve2',N'Tricuspid valve','Text',NULL,'s5',N'Operative record',5,NULL,NULL,0,0,12,1460),
(@Form,'PulmonaryValve2',N'Pulmonary valve','Text',NULL,'s5',N'Operative record',5,NULL,NULL,0,0,12,1470),
(@Form,'CombinedProcedure',N'Combined procedure:','RadioBox','yorn','s5',N'Operative record',5,NULL,NULL,0,0,12,1480),
(@Form,'CABG',N'CABG','RadioBox','yorn','s5',N'Operative record',5,NULL,NULL,0,0,12,1490),
(@Form,'GraftReplacementOfAscendingAorta',N'Graft replacement of Ascending aorta','Text',NULL,'s5',N'Operative record',5,NULL,NULL,0,0,12,1500),
(@Form,'ASDPatchClosure',N'ASD patch closure','RadioBox','yorn','s5',N'Operative record',5,NULL,NULL,0,0,12,1510),
(@Form,'VSDPatchClosure',N'VSD patch closure:','RadioBox','yorn','s5',N'Operative record',5,NULL,NULL,0,0,12,1520),
(@Form,'Others',N'Others','Text',NULL,'s5',N'Operative record',5,NULL,NULL,0,0,12,1530),
(@Form,'DrainageTubes',N'Drainage tubes','Text',NULL,'s5',N'Operative record',5,NULL,NULL,0,0,12,1540),
(@Form,'DefibrillationTimes',N'Defibrillation times','Number',NULL,'s5',N'Operative record',5,NULL,NULL,0,0,12,1550),
(@Form,'IsPatientIsOnInotropicSupport',N'Is patient is on inotropic support','Text',NULL,'s5',N'Operative record',5,NULL,NULL,0,0,12,1560),
(@Form,'BloodTransfusionDuringSurgery',N'Blood transfusion during surgery','Text',NULL,'s6',N'Estimated blood loss during surgery (cc):',6,NULL,NULL,0,0,12,1570),
(@Form,'TissuePathology',N'Tissue pathology:','RadioBox','yorn','s6',N'Estimated blood loss during surgery (cc):',6,NULL,NULL,0,0,12,1580),
(@Form,'DateOfRecording',N'Date of recording:','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,1590),
(@Form,'DateOfSurgery3',N'Date of surgery:','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,1600),
(@Form,'DateOfHospitalDischarge',N'Date of hospital discharge:','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,1610),
(@Form,'PostOperativeDay',N'Post operative day:','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,1620),
(@Form,'ICUDay',N'ICU day:','Number',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,1630),
(@Form,'BloodTransfusionAfterSurgeryUntilDischarge',N'Blood transfusion after surgery until discharge:','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,1640),
(@Form,'IfYes3',N'If yes:','Text',NULL,'s8',N'Patient discharge note after surgery:',8,'BloodTransfusionAfterSurgeryUntilDischarge','y',0,0,12,1650),
(@Form,'AmountOfTransfusionPackedRBCInUnits',N'Amount of transfusion/Packed RBC in units/:','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,1660),
(@Form,'PostOperativeDiagnosis',N'Post operative diagnosis:','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,1670),
(@Form,'MainDiagnosis12',N'Main diagnosis - #1','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,1680),
(@Form,'SubsidiaryDiagnosis22',N'Subsidiary diagnosis #2','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,1690),
(@Form,'SubsidiaryDiagnosis32',N'Subsidiary diagnosis #3','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,1700),
(@Form,'Operation',N'Operation:','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,1710),
(@Form,'F1',N'1','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,1720),
(@Form,'F2',N'2','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,1730),
(@Form,'PostOpEcho',N'Post-Op echo:','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,1740),
(@Form,'DateOfEchoMeasurement2',N'Date of echo - Measurement','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,1750),
(@Form,'LVEF2',N'LVEF','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,1760),
(@Form,'LVEDD2',N'LVEDD','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,1770),
(@Form,'LVESD2',N'LVESD','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,1780),
(@Form,'AorticRootDiameterMMode2',N'Aortic root diameter /M mode/','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,1790),
(@Form,'LADMMode2',N'LAD (AP) /M mode?/','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,1800),
(@Form,'RightAtrialDimension2',N'Right atrial dimension','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,1810),
(@Form,'DOfAscAo2',N'D of AscAo','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,1820),
(@Form,'SPAPmmHg2',N'sPAPmmHg','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,1830),
(@Form,'IVC2',N'IVC','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,1840),
(@Form,'TAPSE2',N'TAPSE','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,1850),
(@Form,'Comments2',N'Comments','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,1860),
(@Form,'ValvularAssessment2',N'Valvular assessment','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,1870),
(@Form,'AorticValveMeasurements2',N'Aortic valve measurements','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,1880),
(@Form,'ASDegree2',N'AS degree','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,1890),
(@Form,'AR2',N'AR','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,1900),
(@Form,'AVPHT2',N'AV PHT','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,1910),
(@Form,'AVMeanPG2',N'AV meanPG','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,1920),
(@Form,'AVParavalvularLeak',N'AV Paravalvular leak','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,1930),
(@Form,'MitralValveMeasurements2',N'Mitral valve measurements','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,1940),
(@Form,'MS2',N'MS','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,1950),
(@Form,'MR2',N'MR','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,1960),
(@Form,'MVA2',N'MVA','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,1970),
(@Form,'MVPHT2',N'MVPHT','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,1980),
(@Form,'MVMeanPG2',N'MV meanPG','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,1990),
(@Form,'MVParavalvularLeak',N'MV Paravalvular leak','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,2000),
(@Form,'TricuspidValveMeasurement2',N'Tricuspid valve measurement','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,2010),
(@Form,'TS2',N'TS','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,2020),
(@Form,'TR2',N'TR','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,2030),
(@Form,'TVMeanPG2',N'TV meanPG','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,2040),
(@Form,'PHT2',N'PHT','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,2050),
(@Form,'TRMaxPG2',N'TR maxPG','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,2060),
(@Form,'TVParavalvularLeak',N'TV paravalvular leak','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,2070),
(@Form,'PulmonaryValveMeasurements2',N'Pulmonary valve measurements','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,2080),
(@Form,'PS2',N'PS','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,2090),
(@Form,'PR2',N'PR','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,2100),
(@Form,'PVVmax2',N'PV Vmax','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,2110),
(@Form,'PVMeanPG2',N'PV meanPG','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,2120),
(@Form,'PVParavalvularLeak',N'PV Paravalvular leak','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,2130),
(@Form,'LVSegmentalContractility2',N'LV Segmental contractility','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,2140),
(@Form,'Apical2',N'Apical','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,2150),
(@Form,'ApicalSeptal2',N'Apical septal','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,2160),
(@Form,'ApicalLateral2',N'Apical lateral','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,2170),
(@Form,'ApicalAnterior2',N'Apical anterior','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,2180),
(@Form,'ApicalInferior2',N'Apical inferior','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,2190),
(@Form,'MidAnterior2',N'Mid anterior','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,2200),
(@Form,'MidAnterolateral2',N'Mid anterolateral','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,2210),
(@Form,'MidInferolateral2',N'Mid inferolateral','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,2220),
(@Form,'MidAnteroseptal2',N'Mid anteroseptal','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,2230),
(@Form,'BasalAnterior2',N'Basal anterior','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,2240),
(@Form,'BasalAnterolateral2',N'Basal anterolateral','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,2250),
(@Form,'BasalInferior2',N'Basal inferior','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,2260),
(@Form,'BasalInferoseptal2',N'Basal inferoseptal','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,2270),
(@Form,'BasalInferolateral2',N'Basal inferolateral','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,2280),
(@Form,'BasalAnteroseptal2',N'Basal anteroseptal','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,2290),
(@Form,'PostOpHeartRhythm',N'Post-op heart rhythm:','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,2300),
(@Form,'DischargeStatus',N'Discharge status:','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,2310),
(@Form,'DestinationOnDischarge',N'Destination on discharge:','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,2320),
(@Form,'IfComplicationPresentSpecify',N'If complication present, specify','Text',NULL,'s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,2330),
(@Form,'IsPatientDeceased',N'Is patient deceased:','RadioBox','yorn','s8',N'Patient discharge note after surgery:',8,NULL,NULL,0,0,12,2340);

COMMIT;
GO
SET NOEXEC OFF;
GO
SELECT '1.8' AS FormCode, COUNT(*) AS Fields FROM dbo.TenderFormField WHERE FormCode='1.8';
GO

/* ---- fields needing a type/option-list decision from the clinical team ----
   SocialSecurityNumber                     sample="UU00000000"  Social security number
   DoctorInCharge                           sample="Bat-Undral"  Doctor in charge
   TypeOfSurgery                            sample="Heart Valve Surgery"  Type of surgery
   PatientSurname                           sample="Patient"  Patient surname
   PatientFirstname                         sample="Name"  Patient firstname
   Sex                                      sample="Male"  Sex
   PreOpNYHA                                sample="NYHA 4 stage"  Pre-op NYHA
   TypeOfOperaton                           sample="Primary surgery"  Type of Operaton
   PreOpHeartRhythm                         sample="Atrial fibrillation"  Pre-op heart rhythm
   LVEF                                     sample="50.00%"  LVEF
   ASDegree                                 sample="Normal"  AS degree
   AR                                       sample="Normal"  AR
   MS                                       sample="MS Severe"  MS
   MR                                       sample="MS Mild"  MR
   TS                                       sample="Normal"  TS
   TR                                       sample="TR Severe"  TR
   Apical                                   sample="Normal contractility"  Apical
   ApicalSeptal                             sample="Normal contractility"  Apical septal
   ApicalLateral                            sample="Normal contractility"  Apical lateral
   ApicalAnterior                           sample="Normal contractility"  Apical anterior
   ApicalInferior                           sample="Normal contractility"  Apical inferior
   MidAnterior                              sample="Normal contractility"  Mid anterior
   MidAnterolateral                         sample="Normal contractility"  Mid anterolateral
   MidInferolateral                         sample="Normal contractility"  Mid inferolateral
   MidAnteroseptal                          sample="Normal contractility"  Mid anteroseptal
   BasalAnterior                            sample="Normal contractility"  Basal anterior
   BasalAnterolateral                       sample="Normal contractility"  Basal anterolateral
   BasalInferior                            sample="Normal contractility"  Basal inferior
   BasalInferoseptal                        sample="Normal contractility"  Basal inferoseptal
   BasalInferolateral                       sample="Normal contractility"  Basal inferolateral
   BasalAnteroseptal                        sample="Normal contractility"  Basal anteroseptal
   DateOfLastConsumption2                   sample="2025/12/28"  Date of last consumption
   DateOfSurgery2                           sample="2025/01/07"  Date of surgery
   Operator                                 sample="Bat-Undral"  Operator
   FirstAssistant                           sample="Zorig"  First assistant
   Perfusionist                             sample="Munkhjargal"  Perfusionist
   Anesthesiologist                         sample="Undarmaa.G"  Anesthesiologist
   MitralValve                              sample="Valve replacement"  Mitral valve
   TricuspidValve                           sample="Valve repair"  Tricuspid valve
   MainDiagnosis1                           sample="Rheumatic Severe MS"  Main diagnosis - #1
   SubsidiaryDiagnosis2                     sample="Persistent Atrial fibrillation, Severe Pullmonary arterial hypertension"  Subsidiary diagnosis #2
   IncisionSite                             sample="Median sternotomy"  Incision site:
   AorticValve2                             sample="N/A"  Aortic valve
   MitralValve2                             sample="Replacement"  Mitral valve
   TricuspidValve2                          sample="Repair"  Tricuspid valve
   PulmonaryValve2                          sample="N/A"  Pulmonary valve
   DateOfRecording                          sample="2025/01/09"  Date of recording:
   DateOfSurgery3                           sample="2025/01/07"  Date of surgery:
   MainDiagnosis12                          sample="Rheumatic severe MS"  Main diagnosis - #1
   SubsidiaryDiagnosis22                    sample="Persistent Atrial Fibrillation, Pulmonary arterial hypertension"  Subsidiary diagnosis #2
   Operation                                sample="MVR Biologic valve №21"  Operation:
*/
