-- =============================================================================
-- Form 1.6  ТИТЭМ СУДАСНЫ МЭС ЗАСАЛ
-- Source: "MN cardio upgrade.docx", appendix 1.6
-- GENERATED from the document's own table structure by build-form-seeds.js.
--
-- 196 fields in 14 sections. Labels are verbatim from the tender.
-- Field codes and types are derived, NOT approved - clinical sign-off is step 1
-- of the WBS acceptance sequence and is the customer's to give.
-- 38 field(s) have a sample value whose type could not be inferred and were
-- left as Text; they are listed at the end of this file for review.
-- =============================================================================
SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @db sysname = DB_NAME();
IF @db NOT IN ('MnCardio_restored','MnCardioNew')
BEGIN
    RAISERROR('Refusing to run: unexpected database "%s".',16,1,@db);
    SET NOEXEC ON;
END
GO

DECLARE @Form varchar(20) = '1.6';
BEGIN TRAN;

IF EXISTS (SELECT 1 FROM dbo.TenderForm WHERE FormCode=@Form)
    UPDATE dbo.TenderForm SET NameMn=N'Титэм судасны мэс заслын маягт', GroupCode='surgery',
        GroupLabelMn=N'Мэс заслын маягтууд', Position=16, IsActive=1, UpdateDate=GETDATE()
     WHERE FormCode=@Form;
ELSE
    INSERT INTO dbo.TenderForm (FormCode,NameMn,GroupCode,GroupLabelMn,Position)
    VALUES (@Form,N'Титэм судасны мэс заслын маягт','surgery',N'Мэс заслын маягтууд',16);

DELETE FROM dbo.TenderFormField WHERE FormCode=@Form;

INSERT INTO dbo.TenderFormField
 (FormCode,FieldCode,LabelMn,FieldType,OptionType,SectionCode,SectionLabel,SectionPos,
  ParentField,ParentValue,IsRequired,IsSearchable,Md,Position)
VALUES
(@Form,'PatientsHistoryID',N'Patients History ID:','Number',NULL,'s1',N'Patient Operation record',1,NULL,NULL,0,0,12,10),
(@Form,'SocialSecurityNumber',N'Social security number','Text',NULL,'s1',N'Patient Operation record',1,NULL,NULL,0,0,12,20),
(@Form,'DoctorInCharge',N'Doctor in charge','Text',NULL,'s1',N'Patient Operation record',1,NULL,NULL,0,0,12,30),
(@Form,'DateOfAdmission',N'Date of admission','Date',NULL,'s1',N'Patient Operation record',1,NULL,NULL,0,0,12,40),
(@Form,'DateOfSurgery',N'Date of surgery','Text',NULL,'s1',N'Patient Operation record',1,NULL,NULL,0,0,12,50),
(@Form,'TypeOfSurgery',N'Type of surgery','Text',NULL,'s1',N'Patient Operation record',1,NULL,NULL,0,0,12,60),
(@Form,'PatientSurname',N'Patient surname','Text',NULL,'s1',N'Patient Operation record',1,NULL,NULL,0,0,12,70),
(@Form,'PatientFirstname',N'Patient firstname','Text',NULL,'s1',N'Patient Operation record',1,NULL,NULL,0,0,12,80),
(@Form,'DateOfBirth',N'Date of birth','Text',NULL,'s1',N'Patient Operation record',1,NULL,NULL,0,0,12,90),
(@Form,'Sex',N'Sex','Text',NULL,'s1',N'Patient Operation record',1,NULL,NULL,0,0,12,100),
(@Form,'PreOpNYHA',N'Pre-op NYHA','Text',NULL,'s1',N'Patient Operation record',1,NULL,NULL,0,0,12,110),
(@Form,'TheNCEPODClassificatonOfIntervention',N'The NCEPOD Classificaton of intervention','Text',NULL,'s1',N'Patient Operation record',1,NULL,NULL,0,0,12,120),
(@Form,'TypeOfOperaton',N'Type of Operaton','Text',NULL,'s1',N'Patient Operation record',1,NULL,NULL,0,0,12,130),
(@Form,'PreOpHeartRhythm',N'Pre-op heart rhythm','Text',NULL,'s1',N'Patient Operation record',1,NULL,NULL,0,0,12,140),
(@Form,'BodyWeightKg',N'Body weight /kg/','Number',NULL,'s2',N'Pre-op risk factors, and Comorbities',2,NULL,NULL,0,0,12,150),
(@Form,'HeightCm',N'Height /cm/','Number',NULL,'s2',N'Pre-op risk factors, and Comorbities',2,NULL,NULL,0,0,12,160),
(@Form,'BMIAutocalculator',N'BMI/Autocalculator/','Text',NULL,'s2',N'Pre-op risk factors, and Comorbities',2,NULL,NULL,0,0,12,170),
(@Form,'BSAAutocalculator',N'BSA/Autocalculator/','Text',NULL,'s2',N'Pre-op risk factors, and Comorbities',2,NULL,NULL,0,0,12,180),
(@Form,'ArterialHypertension',N'Arterial hypertension','RadioBox','yorn','s2',N'Pre-op risk factors, and Comorbities',2,NULL,NULL,0,0,12,190),
(@Form,'Smoking',N'Smoking','RadioBox','yorn','s2',N'Pre-op risk factors, and Comorbities',2,NULL,NULL,0,0,12,200),
(@Form,'Dyslipidemia',N'Dyslipidemia','RadioBox','yorn','s3',N'Alcohol usage',3,NULL,NULL,0,0,12,210),
(@Form,'PreoperativeCriticalState',N'Preoperative critical state','Text',NULL,'s3',N'Alcohol usage',3,NULL,NULL,0,0,12,220),
(@Form,'AcuteMyocardialInfraction',N'Acute myocardial infraction','RadioBox','yorn','s3',N'Alcohol usage',3,NULL,NULL,0,0,12,230),
(@Form,'ChronicKidneyDisease',N'Chronic kidney disease','RadioBox','yorn','s3',N'Alcohol usage',3,NULL,NULL,0,0,12,240),
(@Form,'ChronicLungDisease',N'Chronic lung disease','RadioBox','yorn','s3',N'Alcohol usage',3,NULL,NULL,0,0,12,250),
(@Form,'ChronicLiverDisease',N'Chronic liver disease','RadioBox','yorn','s3',N'Alcohol usage',3,NULL,NULL,0,0,12,260),
(@Form,'CerebrovascularDisease',N'Cerebrovascular disease','RadioBox','yorn','s3',N'Alcohol usage',3,NULL,NULL,0,0,12,270),
(@Form,'DiabetesMellitus',N'Diabetes mellitus','RadioBox','yorn','s4',N'Peripheral artery disease',4,NULL,NULL,0,0,12,280),
(@Form,'WBCWriteIn150InDecimals',N'WBC/write in 1-50 in decimals/','Text',NULL,'s6',N'Pre-op lab and Echo',6,NULL,NULL,0,0,12,290),
(@Form,'HGBGDl',N'HGB /g/dl/','Number',NULL,'s6',N'Pre-op lab and Echo',6,NULL,NULL,0,0,12,300),
(@Form,'HCT',N'HCT','Number',NULL,'s6',N'Pre-op lab and Echo',6,NULL,NULL,0,0,12,310),
(@Form,'PLTInDecimalsToHundreds',N'PLT/in decimals to hundreds/','Text',NULL,'s6',N'Pre-op lab and Echo',6,NULL,NULL,0,0,12,320),
(@Form,'CreatinineMolL',N'Creatinine /µmol/L/','Number',NULL,'s6',N'Pre-op lab and Echo',6,NULL,NULL,0,0,12,330),
(@Form,'BUNMmolL',N'BUN/mmol/L/','Number',NULL,'s6',N'Pre-op lab and Echo',6,NULL,NULL,0,0,12,340),
(@Form,'KMmolL',N'K+/mmol/L/','Text',NULL,'s6',N'Pre-op lab and Echo',6,NULL,NULL,0,0,12,350),
(@Form,'Glucose',N'Glucose','Text',NULL,'s6',N'Pre-op lab and Echo',6,NULL,NULL,0,0,12,360),
(@Form,'TotalAlbuminGL',N'Total albumin /g/L/','Text',NULL,'s6',N'Pre-op lab and Echo',6,NULL,NULL,0,0,12,370),
(@Form,'ASTUL',N'AST /U/L/','Number',NULL,'s6',N'Pre-op lab and Echo',6,NULL,NULL,0,0,12,380),
(@Form,'ALTUL',N'ALT /U/L/','Number',NULL,'s6',N'Pre-op lab and Echo',6,NULL,NULL,0,0,12,390),
(@Form,'NTProBNPPgMl',N'NTProBNP /pg/ml/','Text',NULL,'s6',N'Pre-op lab and Echo',6,NULL,NULL,0,0,12,400),
(@Form,'PreOpEcho',N'Pre-op Echo','Text',NULL,'s6',N'Pre-op lab and Echo',6,NULL,NULL,0,0,12,410),
(@Form,'DateOfEchoMeasurement',N'Date of echo - Measurement','Text',NULL,'s6',N'Pre-op lab and Echo',6,NULL,NULL,0,0,12,420),
(@Form,'LVEF',N'LVEF','Text',NULL,'s6',N'Pre-op lab and Echo',6,NULL,NULL,0,0,12,430),
(@Form,'LVEDD',N'LVEDD','Number',NULL,'s6',N'Pre-op lab and Echo',6,NULL,NULL,0,0,12,440),
(@Form,'LVESD',N'LVESD','Number',NULL,'s6',N'Pre-op lab and Echo',6,NULL,NULL,0,0,12,450),
(@Form,'AorticRootDiameterMMode',N'Aortic root diameter /M mode/','Text',NULL,'s6',N'Pre-op lab and Echo',6,NULL,NULL,0,0,12,460),
(@Form,'LADMMode',N'LAD (AP) /M mode?/','Number',NULL,'s6',N'Pre-op lab and Echo',6,NULL,NULL,0,0,12,470),
(@Form,'DOfAscAo',N'D of AscAo','Number',NULL,'s6',N'Pre-op lab and Echo',6,NULL,NULL,0,0,12,480),
(@Form,'SPAPmmHg',N'sPAPmmHg','Text',NULL,'s6',N'Pre-op lab and Echo',6,NULL,NULL,0,0,12,490),
(@Form,'ValvularAssessment',N'Valvular assessment','Text',NULL,'s6',N'Pre-op lab and Echo',6,NULL,NULL,0,0,12,500),
(@Form,'AorticValveMeasurements',N'Aortic valve measurements','Text',NULL,'s6',N'Pre-op lab and Echo',6,NULL,NULL,0,0,12,510),
(@Form,'ASDegree',N'AS degree','Text',NULL,'s6',N'Pre-op lab and Echo',6,NULL,NULL,0,0,12,520),
(@Form,'AR',N'AR','Text',NULL,'s6',N'Pre-op lab and Echo',6,NULL,NULL,0,0,12,530),
(@Form,'AVPHT',N'AV PHT','Text',NULL,'s6',N'Pre-op lab and Echo',6,NULL,NULL,0,0,12,540),
(@Form,'AVMeanPG',N'AV meanPG','Text',NULL,'s6',N'Pre-op lab and Echo',6,NULL,NULL,0,0,12,550),
(@Form,'MitralValveMeasurements',N'Mitral valve measurements','Text',NULL,'s6',N'Pre-op lab and Echo',6,NULL,NULL,0,0,12,560),
(@Form,'MS',N'MS','Text',NULL,'s6',N'Pre-op lab and Echo',6,NULL,NULL,0,0,12,570),
(@Form,'MR',N'MR','Text',NULL,'s6',N'Pre-op lab and Echo',6,NULL,NULL,0,0,12,580),
(@Form,'MVA',N'MVA','Text',NULL,'s6',N'Pre-op lab and Echo',6,NULL,NULL,0,0,12,590),
(@Form,'MVPHT',N'MVPHT','Text',NULL,'s6',N'Pre-op lab and Echo',6,NULL,NULL,0,0,12,600),
(@Form,'MVMeanPG',N'MV meanPG','Text',NULL,'s6',N'Pre-op lab and Echo',6,NULL,NULL,0,0,12,610),
(@Form,'TricuspidValveMeasurement',N'Tricuspid valve measurement','Text',NULL,'s6',N'Pre-op lab and Echo',6,NULL,NULL,0,0,12,620),
(@Form,'TS',N'TS','Text',NULL,'s6',N'Pre-op lab and Echo',6,NULL,NULL,0,0,12,630),
(@Form,'TR',N'TR','Text',NULL,'s6',N'Pre-op lab and Echo',6,NULL,NULL,0,0,12,640),
(@Form,'TVMeanPG',N'TV meanPG','Text',NULL,'s6',N'Pre-op lab and Echo',6,NULL,NULL,0,0,12,650),
(@Form,'PHT',N'PHT','Text',NULL,'s6',N'Pre-op lab and Echo',6,NULL,NULL,0,0,12,660),
(@Form,'TRMaxPG',N'TR maxPG','Text',NULL,'s6',N'Pre-op lab and Echo',6,NULL,NULL,0,0,12,670),
(@Form,'PulmonaryValveMeasurements',N'Pulmonary valve measurements','Text',NULL,'s6',N'Pre-op lab and Echo',6,NULL,NULL,0,0,12,680),
(@Form,'PS',N'PS','Text',NULL,'s6',N'Pre-op lab and Echo',6,NULL,NULL,0,0,12,690),
(@Form,'PR',N'PR','Text',NULL,'s6',N'Pre-op lab and Echo',6,NULL,NULL,0,0,12,700),
(@Form,'PVVmax',N'PV Vmax','Text',NULL,'s6',N'Pre-op lab and Echo',6,NULL,NULL,0,0,12,710),
(@Form,'PVMeanPG',N'PV meanPG','Text',NULL,'s6',N'Pre-op lab and Echo',6,NULL,NULL,0,0,12,720),
(@Form,'LVSegmentalContractility',N'LV Segmental contractility','Text',NULL,'s6',N'Pre-op lab and Echo',6,NULL,NULL,0,0,12,730),
(@Form,'Apical',N'Apical','Text',NULL,'s6',N'Pre-op lab and Echo',6,NULL,NULL,0,0,12,740),
(@Form,'ApicalSeptal',N'Apical septal','Text',NULL,'s6',N'Pre-op lab and Echo',6,NULL,NULL,0,0,12,750),
(@Form,'ApicalLateral',N'Apical lateral','Text',NULL,'s6',N'Pre-op lab and Echo',6,NULL,NULL,0,0,12,760),
(@Form,'ApicalAnterior',N'Apical anterior','Text',NULL,'s6',N'Pre-op lab and Echo',6,NULL,NULL,0,0,12,770),
(@Form,'ApicalInferior',N'Apical inferior','Text',NULL,'s6',N'Pre-op lab and Echo',6,NULL,NULL,0,0,12,780),
(@Form,'MidAnterior',N'Mid anterior','Text',NULL,'s6',N'Pre-op lab and Echo',6,NULL,NULL,0,0,12,790),
(@Form,'MidAnterolateral',N'Mid anterolateral','Text',NULL,'s6',N'Pre-op lab and Echo',6,NULL,NULL,0,0,12,800),
(@Form,'MidInferolateral',N'Mid inferolateral','Text',NULL,'s6',N'Pre-op lab and Echo',6,NULL,NULL,0,0,12,810),
(@Form,'MidAnteroseptal',N'Mid anteroseptal','Text',NULL,'s6',N'Pre-op lab and Echo',6,NULL,NULL,0,0,12,820),
(@Form,'BasalAnterior',N'Basal anterior','Text',NULL,'s6',N'Pre-op lab and Echo',6,NULL,NULL,0,0,12,830),
(@Form,'BasalAnterolateral',N'Basal anterolateral','Text',NULL,'s6',N'Pre-op lab and Echo',6,NULL,NULL,0,0,12,840),
(@Form,'BasalInferior',N'Basal inferior','Text',NULL,'s6',N'Pre-op lab and Echo',6,NULL,NULL,0,0,12,850),
(@Form,'BasalInferoseptal',N'Basal inferoseptal','Text',NULL,'s6',N'Pre-op lab and Echo',6,NULL,NULL,0,0,12,860),
(@Form,'BasalInferolateral',N'Basal inferolateral','Text',NULL,'s6',N'Pre-op lab and Echo',6,NULL,NULL,0,0,12,870),
(@Form,'BasalAnteroseptal',N'Basal anteroseptal','Text',NULL,'s6',N'Pre-op lab and Echo',6,NULL,NULL,0,0,12,880),
(@Form,'Diuretics',N'Diuretics','Text',NULL,'s7',N'Pre-op medication and cardiac disease',7,NULL,NULL,0,0,12,890),
(@Form,'ACEOrARB',N'ACE or ARB','RadioBox','yorn','s7',N'Pre-op medication and cardiac disease',7,NULL,NULL,0,0,12,900),
(@Form,'BetaBlockers',N'Beta blockers','Text',NULL,'s7',N'Pre-op medication and cardiac disease',7,NULL,NULL,0,0,12,910),
(@Form,'Antiplatelets',N'Antiplatelets','RadioBox','yorn','s7',N'Pre-op medication and cardiac disease',7,NULL,NULL,0,0,12,920),
(@Form,'IfYes',N'If yes','Text',NULL,'s7',N'Pre-op medication and cardiac disease',7,'Antiplatelets','y',0,0,12,930),
(@Form,'ADPReceptorInhibitors',N'ADP receptor inhibitors','Text',NULL,'s7',N'Pre-op medication and cardiac disease',7,NULL,NULL,0,0,12,940),
(@Form,'COXInhibitors',N'COX inhibitors','RadioBox','yorn','s7',N'Pre-op medication and cardiac disease',7,NULL,NULL,0,0,12,950),
(@Form,'DateOfLastConsumption',N'Date of last consumption','Text',NULL,'s7',N'Pre-op medication and cardiac disease',7,NULL,NULL,0,0,12,960),
(@Form,'DurationOfAntiplateletIntake',N'Duration of antiplatelet intake','Text',NULL,'s7',N'Pre-op medication and cardiac disease',7,NULL,NULL,0,0,12,970),
(@Form,'Anticoagulants',N'Anticoagulants','Text',NULL,'s7',N'Pre-op medication and cardiac disease',7,NULL,NULL,0,0,12,980),
(@Form,'IfYes2',N'If yes','Text',NULL,'s7',N'Pre-op medication and cardiac disease',7,'Anticoagulants','y',0,0,12,990),
(@Form,'DateOfLastConsumption2',N'Date of last consumption','Text',NULL,'s7',N'Pre-op medication and cardiac disease',7,NULL,NULL,0,0,12,1000),
(@Form,'DurationOfAnticoagulantIntake',N'Duration of anticoagulant intake','Text',NULL,'s7',N'Pre-op medication and cardiac disease',7,NULL,NULL,0,0,12,1010),
(@Form,'Nitrates',N'Nitrates','Text',NULL,'s7',N'Pre-op medication and cardiac disease',7,NULL,NULL,0,0,12,1020),
(@Form,'Inotropes',N'Inotropes','Text',NULL,'s7',N'Pre-op medication and cardiac disease',7,NULL,NULL,0,0,12,1030),
(@Form,'LipidLoweringDrugs',N'Lipid lowering drugs','RadioBox','yorn','s7',N'Pre-op medication and cardiac disease',7,NULL,NULL,0,0,12,1040),
(@Form,'AntiglycemicDrugs',N'Antiglycemic drugs','Text',NULL,'s7',N'Pre-op medication and cardiac disease',7,NULL,NULL,0,0,12,1050),
(@Form,'RiskOfMortality',N'Risk of Mortality','Text',NULL,'s7',N'Pre-op medication and cardiac disease',7,NULL,NULL,0,0,12,1060),
(@Form,'EuroscoreII',N'Euroscore II','Number',NULL,'s7',N'Pre-op medication and cardiac disease',7,NULL,NULL,0,0,12,1070),
(@Form,'STSScore',N'STS score','Text',NULL,'s7',N'Pre-op medication and cardiac disease',7,NULL,NULL,0,0,12,1080),
(@Form,'DateOfSurgery2',N'Date of surgery','Text',NULL,'s8',N'Operative record',8,NULL,NULL,0,0,12,1090),
(@Form,'Operator',N'Operator','Text',NULL,'s8',N'Operative record',8,NULL,NULL,0,0,12,1100),
(@Form,'FirstAssistant',N'First assistant','Text',NULL,'s8',N'Operative record',8,NULL,NULL,0,0,12,1110),
(@Form,'SecondAssistant',N'Second assistant','Text',NULL,'s8',N'Operative record',8,NULL,NULL,0,0,12,1120),
(@Form,'Perfusionist',N'Perfusionist','Text',NULL,'s8',N'Operative record',8,NULL,NULL,0,0,12,1130),
(@Form,'Anesthesiologist',N'Anesthesiologist','Text',NULL,'s8',N'Operative record',8,NULL,NULL,0,0,12,1140),
(@Form,'AnesthesiologistNurse',N'Anesthesiologist nurse','Text',NULL,'s8',N'Operative record',8,NULL,NULL,0,0,12,1150),
(@Form,'ScrubNurse',N'Scrub nurse','Text',NULL,'s8',N'Operative record',8,NULL,NULL,0,0,12,1160),
(@Form,'PreviousOperation',N'Previous operation','Text',NULL,'s8',N'Operative record',8,NULL,NULL,0,0,12,1170),
(@Form,'DateOfPreviousOperation',N'Date of previous operation','Text',NULL,'s8',N'Operative record',8,NULL,NULL,0,0,12,1180),
(@Form,'SurgeryType',N'Surgery type:','Text',NULL,'s8',N'Operative record',8,NULL,NULL,0,0,12,1190),
(@Form,'NumberOfDistalAnatomosis',N'Number of distal anatomosis','Text',NULL,'s8',N'Operative record',8,NULL,NULL,0,0,12,1200),
(@Form,'MainDiagnosis1',N'Main diagnosis - #1','Text',NULL,'s9',N'Pre-operative diagnosis',9,NULL,NULL,0,0,12,1210),
(@Form,'SubsidiaryDiagnosis2',N'Subsidiary diagnosis #2','Text',NULL,'s9',N'Pre-operative diagnosis',9,NULL,NULL,0,0,12,1220),
(@Form,'SubsidiaryDiagnosis3',N'Subsidiary diagnosis #3','Text',NULL,'s9',N'Pre-operative diagnosis',9,NULL,NULL,0,0,12,1230),
(@Form,'AdditionalExplanationOfTheProcedure',N'Additional explanation of the procedure','Text',NULL,'s9',N'Pre-operative diagnosis',9,NULL,NULL,0,0,12,1240),
(@Form,'SurigcalProcedureRecord',N'Surigcal procedure record','Text',NULL,'s9',N'Pre-operative diagnosis',9,NULL,NULL,0,0,12,1250),
(@Form,'IncisionSite',N'Incision site:','Text',NULL,'s9',N'Pre-operative diagnosis',9,NULL,NULL,0,0,12,1260),
(@Form,'TotalPerfusionTime',N'Total perfusion time:','Text',NULL,'s9',N'Pre-operative diagnosis',9,NULL,NULL,0,0,12,1270),
(@Form,'AorticCrossClampTime',N'Aortic cross clamp time:','Text',NULL,'s9',N'Pre-operative diagnosis',9,NULL,NULL,0,0,12,1280),
(@Form,'ArrestTime',N'Arrest time:','Text',NULL,'s9',N'Pre-operative diagnosis',9,NULL,NULL,0,0,12,1290),
(@Form,'LowestTemperature',N'Lowest temperature:','Text',NULL,'s9',N'Pre-operative diagnosis',9,NULL,NULL,0,0,12,1300),
(@Form,'GraftChoice',N'Graft choice','Text',NULL,'s9',N'Pre-operative diagnosis',9,NULL,NULL,0,0,12,1310),
(@Form,'GRAFTINGTECHNIQUE',N'GRAFTING TECHNIQUE','Text',NULL,'s9',N'Pre-operative diagnosis',9,NULL,NULL,0,0,12,1320),
(@Form,'CombinedProcedure',N'Combined procedure:','RadioBox','yorn','s9',N'Pre-operative diagnosis',9,NULL,NULL,0,0,12,1330),
(@Form,'GraftReplacementOfAscendingAorta',N'Graft replacement of Ascending aorta','Text',NULL,'s9',N'Pre-operative diagnosis',9,NULL,NULL,0,0,12,1340),
(@Form,'Others',N'Others','Text',NULL,'s9',N'Pre-operative diagnosis',9,NULL,NULL,0,0,12,1350),
(@Form,'ExtubationTime',N'Extubation time','Text',NULL,'s9',N'Pre-operative diagnosis',9,NULL,NULL,0,0,12,1360),
(@Form,'DrainageTubes',N'Drainage tubes','Text',NULL,'s9',N'Pre-operative diagnosis',9,NULL,NULL,0,0,12,1370),
(@Form,'IsPatientIsOnInotropicSupport',N'Is patient is on inotropic support','Text',NULL,'s10',N'Defibrillation times',10,NULL,NULL,0,0,12,1380),
(@Form,'BloodTransfusionDuringSurgery',N'Blood transfusion during surgery','Text',NULL,'s11',N'Estimated blood loss during surgery (cc):',11,NULL,NULL,0,0,12,1390),
(@Form,'DateOfRecording',N'Date of recording:','Text',NULL,'s13',N'Patient discharge note after surgery:',13,NULL,NULL,0,0,12,1400),
(@Form,'DateOfSurgery3',N'Date of surgery:','Text',NULL,'s13',N'Patient discharge note after surgery:',13,NULL,NULL,0,0,12,1410),
(@Form,'DateOfHospitalDischarge',N'Date of hospital discharge:','Text',NULL,'s13',N'Patient discharge note after surgery:',13,NULL,NULL,0,0,12,1420),
(@Form,'PostOperativeDay',N'Post operative day:','Number',NULL,'s13',N'Patient discharge note after surgery:',13,NULL,NULL,0,0,12,1430),
(@Form,'ICUDay',N'ICU day:','Number',NULL,'s13',N'Patient discharge note after surgery:',13,NULL,NULL,0,0,12,1440),
(@Form,'BloodTransfusionAfterSurgeryUntilDischarge',N'Blood transfusion after surgery until discharge:','Text',NULL,'s13',N'Patient discharge note after surgery:',13,NULL,NULL,0,0,12,1450),
(@Form,'IfYes3',N'If yes:','Text',NULL,'s13',N'Patient discharge note after surgery:',13,'BloodTransfusionAfterSurgeryUntilDischarge','y',0,0,12,1460),
(@Form,'AmountOfTransfusionPackedRBCInUnits',N'Amount of transfusion/Packed RBC in units/:','Text',NULL,'s13',N'Patient discharge note after surgery:',13,NULL,NULL,0,0,12,1470),
(@Form,'PostOperativeDiagnosis',N'Post operative diagnosis:','Text',NULL,'s13',N'Patient discharge note after surgery:',13,NULL,NULL,0,0,12,1480),
(@Form,'MainDiagnosis12',N'Main diagnosis - #1','Text',NULL,'s13',N'Patient discharge note after surgery:',13,NULL,NULL,0,0,12,1490),
(@Form,'SubsidiaryDiagnosis22',N'Subsidiary diagnosis #2','Text',NULL,'s13',N'Patient discharge note after surgery:',13,NULL,NULL,0,0,12,1500),
(@Form,'SubsidiaryDiagnosis32',N'Subsidiary diagnosis #3','Text',NULL,'s13',N'Patient discharge note after surgery:',13,NULL,NULL,0,0,12,1510),
(@Form,'Operation',N'Operation:','Text',NULL,'s13',N'Patient discharge note after surgery:',13,NULL,NULL,0,0,12,1520),
(@Form,'F1',N'1','Text',NULL,'s13',N'Patient discharge note after surgery:',13,NULL,NULL,0,0,12,1530),
(@Form,'F2',N'2','Text',NULL,'s13',N'Patient discharge note after surgery:',13,NULL,NULL,0,0,12,1540),
(@Form,'PostOpEcho',N'Post-Op echo:','Text',NULL,'s13',N'Patient discharge note after surgery:',13,NULL,NULL,0,0,12,1550),
(@Form,'DateOfEchoMeasurement2',N'Date of echo - Measurement','Text',NULL,'s13',N'Patient discharge note after surgery:',13,NULL,NULL,0,0,12,1560),
(@Form,'LVEF2',N'LVEF','Text',NULL,'s13',N'Patient discharge note after surgery:',13,NULL,NULL,0,0,12,1570),
(@Form,'LVEDD2',N'LVEDD','Text',NULL,'s13',N'Patient discharge note after surgery:',13,NULL,NULL,0,0,12,1580),
(@Form,'LVESD2',N'LVESD','Text',NULL,'s13',N'Patient discharge note after surgery:',13,NULL,NULL,0,0,12,1590),
(@Form,'AorticRootDiameterMMode2',N'Aortic root diameter /M mode/','Text',NULL,'s13',N'Patient discharge note after surgery:',13,NULL,NULL,0,0,12,1600),
(@Form,'LADMMode2',N'LAD (AP) /M mode?/','Text',NULL,'s13',N'Patient discharge note after surgery:',13,NULL,NULL,0,0,12,1610),
(@Form,'DOfAscAo2',N'D of AscAo','Text',NULL,'s13',N'Patient discharge note after surgery:',13,NULL,NULL,0,0,12,1620),
(@Form,'SPAPmmHg2',N'sPAPmmHg','Text',NULL,'s13',N'Patient discharge note after surgery:',13,NULL,NULL,0,0,12,1630),
(@Form,'ValvularAssessment2',N'Valvular assessment','Text',NULL,'s13',N'Patient discharge note after surgery:',13,NULL,NULL,0,0,12,1640),
(@Form,'AorticValveMeasurements2',N'Aortic valve measurements','Text',NULL,'s13',N'Patient discharge note after surgery:',13,NULL,NULL,0,0,12,1650),
(@Form,'ASDegree2',N'AS degree','Text',NULL,'s13',N'Patient discharge note after surgery:',13,NULL,NULL,0,0,12,1660),
(@Form,'AR2',N'AR','Text',NULL,'s13',N'Patient discharge note after surgery:',13,NULL,NULL,0,0,12,1670),
(@Form,'MitralValveMeasurements2',N'Mitral valve measurements','Text',NULL,'s13',N'Patient discharge note after surgery:',13,NULL,NULL,0,0,12,1680),
(@Form,'MS2',N'MS','Text',NULL,'s13',N'Patient discharge note after surgery:',13,NULL,NULL,0,0,12,1690),
(@Form,'MR2',N'MR','Text',NULL,'s13',N'Patient discharge note after surgery:',13,NULL,NULL,0,0,12,1700),
(@Form,'TricuspidValveMeasurement2',N'Tricuspid valve measurement','Text',NULL,'s13',N'Patient discharge note after surgery:',13,NULL,NULL,0,0,12,1710),
(@Form,'TS2',N'TS','Text',NULL,'s13',N'Patient discharge note after surgery:',13,NULL,NULL,0,0,12,1720),
(@Form,'TR2',N'TR','Text',NULL,'s13',N'Patient discharge note after surgery:',13,NULL,NULL,0,0,12,1730),
(@Form,'PulmonaryValveMeasurements2',N'Pulmonary valve measurements','Text',NULL,'s13',N'Patient discharge note after surgery:',13,NULL,NULL,0,0,12,1740),
(@Form,'PS2',N'PS','Text',NULL,'s13',N'Patient discharge note after surgery:',13,NULL,NULL,0,0,12,1750),
(@Form,'PR2',N'PR','Text',NULL,'s13',N'Patient discharge note after surgery:',13,NULL,NULL,0,0,12,1760),
(@Form,'LVSegmentalContractility2',N'LV Segmental contractility','Text',NULL,'s13',N'Patient discharge note after surgery:',13,NULL,NULL,0,0,12,1770),
(@Form,'Apical2',N'Apical','Text',NULL,'s13',N'Patient discharge note after surgery:',13,NULL,NULL,0,0,12,1780),
(@Form,'ApicalSeptal2',N'Apical septal','Text',NULL,'s13',N'Patient discharge note after surgery:',13,NULL,NULL,0,0,12,1790),
(@Form,'ApicalLateral2',N'Apical lateral','Text',NULL,'s13',N'Patient discharge note after surgery:',13,NULL,NULL,0,0,12,1800),
(@Form,'ApicalAnterior2',N'Apical anterior','Text',NULL,'s13',N'Patient discharge note after surgery:',13,NULL,NULL,0,0,12,1810),
(@Form,'ApicalInferior2',N'Apical inferior','Text',NULL,'s13',N'Patient discharge note after surgery:',13,NULL,NULL,0,0,12,1820),
(@Form,'MidAnterior2',N'Mid anterior','Text',NULL,'s13',N'Patient discharge note after surgery:',13,NULL,NULL,0,0,12,1830),
(@Form,'MidAnterolateral2',N'Mid anterolateral','Text',NULL,'s13',N'Patient discharge note after surgery:',13,NULL,NULL,0,0,12,1840),
(@Form,'MidInferolateral2',N'Mid inferolateral','Text',NULL,'s13',N'Patient discharge note after surgery:',13,NULL,NULL,0,0,12,1850),
(@Form,'MidAnteroseptal2',N'Mid anteroseptal','Text',NULL,'s13',N'Patient discharge note after surgery:',13,NULL,NULL,0,0,12,1860),
(@Form,'BasalAnterior2',N'Basal anterior','Text',NULL,'s13',N'Patient discharge note after surgery:',13,NULL,NULL,0,0,12,1870),
(@Form,'BasalAnterolateral2',N'Basal anterolateral','Text',NULL,'s13',N'Patient discharge note after surgery:',13,NULL,NULL,0,0,12,1880),
(@Form,'BasalInferior2',N'Basal inferior','Text',NULL,'s13',N'Patient discharge note after surgery:',13,NULL,NULL,0,0,12,1890),
(@Form,'BasalInferoseptal2',N'Basal inferoseptal','Text',NULL,'s13',N'Patient discharge note after surgery:',13,NULL,NULL,0,0,12,1900),
(@Form,'BasalInferolateral2',N'Basal inferolateral','Text',NULL,'s13',N'Patient discharge note after surgery:',13,NULL,NULL,0,0,12,1910),
(@Form,'BasalAnteroseptal2',N'Basal anteroseptal','Text',NULL,'s13',N'Patient discharge note after surgery:',13,NULL,NULL,0,0,12,1920),
(@Form,'PostOpHeartRhythm',N'Post-op heart rhythm:','Text',NULL,'s13',N'Patient discharge note after surgery:',13,NULL,NULL,0,0,12,1930),
(@Form,'DischargeStatus',N'Discharge status:','Text',NULL,'s13',N'Patient discharge note after surgery:',13,NULL,NULL,0,0,12,1940),
(@Form,'DestinationOnDischarge',N'Destination on discharge:','Text',NULL,'s13',N'Patient discharge note after surgery:',13,NULL,NULL,0,0,12,1950),
(@Form,'IfComplicationPresentSpecify',N'If complication present, specify','Text',NULL,'s13',N'Patient discharge note after surgery:',13,NULL,NULL,0,0,12,1960);

COMMIT;
GO
SET NOEXEC OFF;
GO
SELECT '1.6' AS FormCode, COUNT(*) AS Fields FROM dbo.TenderFormField WHERE FormCode='1.6';
GO

/* ---- fields needing a type/option-list decision from the clinical team ----
   SocialSecurityNumber                     sample="OO01010101"  Social security number
   DoctorInCharge                           sample="Enkhdorj"  Doctor in charge
   TypeOfSurgery                            sample="Coronary Artery Surgery"  Type of surgery
   PatientSurname                           sample="Patient"  Patient surname
   PatientFirstname                         sample="Name"  Patient firstname
   Sex                                      sample="Male"  Sex
   PreOpNYHA                                sample="NYHA 3 stage"  Pre-op NYHA
   TypeOfOperaton                           sample="Primary surgery"  Type of Operaton
   PreOpHeartRhythm                         sample="Normal sinus rhythm"  Pre-op heart rhythm
   LVEF                                     sample="53.00%"  LVEF
   ASDegree                                 sample="Normal"  AS degree
   MS                                       sample="Normal"  MS
   Apical                                   sample="Normal contractility"  Apical
   ApicalSeptal                             sample="Normal contractility"  Apical septal
   ApicalLateral                            sample="Normal contractility"  Apical lateral
   ApicalAnterior                           sample="Normal contractility"  Apical anterior
   ApicalInferior                           sample="Normal contractility"  Apical inferior
   MidAnterior                              sample="Normal contractility"  Mid anterior
   MidAnterolateral                         sample="Normal contractility"  Mid anterolateral
   MidInferolateral                         sample="Normal contractility"  Mid inferolateral
   MidAnteroseptal                          sample="Hypokinesia"  Mid anteroseptal
   BasalAnterior                            sample="Normal contractility"  Basal anterior
   BasalAnterolateral                       sample="Normal contractility"  Basal anterolateral
   BasalInferior                            sample="Normal contractility"  Basal inferior
   BasalInferoseptal                        sample="Normal contractility"  Basal inferoseptal
   BasalInferolateral                       sample="Normal contractility"  Basal inferolateral
   BasalAnteroseptal                        sample="Normal contractility"  Basal anteroseptal
   DateOfSurgery2                           sample="2025/01/02"  Date of surgery
   Operator                                 sample="Enkhdorj"  Operator
   FirstAssistant                           sample="Zorig"  First assistant
   Anesthesiologist                         sample="Undarmaa.G"  Anesthesiologist
   ScrubNurse                               sample="Janargul"  Scrub nurse
   SurgeryType                              sample="OPCAB"  Surgery type:
   IncisionSite                             sample="Median sternotomy"  Incision site:
   GraftChoice                              sample="Artery+Vein graft"  Graft choice
   DrainageTubes                            sample="Substernal, Pericardial"  Drainage tubes
   DateOfSurgery3                           sample="2025/01/02"  Date of surgery:
   DischargeStatus                          sample="Alive without complication"  Discharge status:
*/
