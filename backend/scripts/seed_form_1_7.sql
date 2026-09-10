-- =============================================================================
-- Form 1.7  ГОЛ СУДАСНЫ МЭС ЗАСАЛ
-- Source: "MN cardio upgrade.docx", appendix 1.7
-- GENERATED from the document's own table structure by build-form-seeds.js.
--
-- 217 fields in 15 sections. Labels are verbatim from the tender.
-- Field codes and types are derived, NOT approved - clinical sign-off is step 1
-- of the WBS acceptance sequence and is the customer's to give.
-- 83 field(s) have a sample value whose type could not be inferred and were
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

DECLARE @Form varchar(20) = '1.7';
BEGIN TRAN;

IF EXISTS (SELECT 1 FROM dbo.TenderForm WHERE FormCode=@Form)
    UPDATE dbo.TenderForm SET NameMn=N'Гол судасны мэс заслын маягт', GroupCode='surgery',
        GroupLabelMn=N'Мэс заслын маягтууд', Position=17, IsActive=1, UpdateDate=GETDATE()
     WHERE FormCode=@Form;
ELSE
    INSERT INTO dbo.TenderForm (FormCode,NameMn,GroupCode,GroupLabelMn,Position)
    VALUES (@Form,N'Гол судасны мэс заслын маягт','surgery',N'Мэс заслын маягтууд',17);

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
(@Form,'Sex',N'Sex','Text',NULL,'s1',N'Patient Operation record',1,NULL,NULL,0,0,12,100),
(@Form,'PreOpNYHA',N'Pre-op NYHA','Text',NULL,'s1',N'Patient Operation record',1,NULL,NULL,0,0,12,110),
(@Form,'TheNCEPODClassificatonOfIntervention',N'The NCEPOD Classificaton of intervention','Text',NULL,'s1',N'Patient Operation record',1,NULL,NULL,0,0,12,120),
(@Form,'TypeOfOperaton',N'Type of Operaton','Text',NULL,'s1',N'Patient Operation record',1,NULL,NULL,0,0,12,130),
(@Form,'PreOpHeartRhythm',N'Pre-op heart rhythm','Text',NULL,'s1',N'Patient Operation record',1,NULL,NULL,0,0,12,140),
(@Form,'BodyWeightKg',N'Body weight /kg/','Number',NULL,'s2',N'Pre-op risk factors, and Comorbities',2,NULL,NULL,0,0,12,150),
(@Form,'HeightCm',N'Height /cm/','Number',NULL,'s2',N'Pre-op risk factors, and Comorbities',2,NULL,NULL,0,0,12,160),
(@Form,'BMIAutocalculator',N'BMI/Autocalculator/','Number',NULL,'s2',N'Pre-op risk factors, and Comorbities',2,NULL,NULL,0,0,12,170),
(@Form,'BSAAutocalculator',N'BSA/Autocalculator/','Number',NULL,'s2',N'Pre-op risk factors, and Comorbities',2,NULL,NULL,0,0,12,180),
(@Form,'ArterialHypertension',N'Arterial hypertension','RadioBox','yorn','s2',N'Pre-op risk factors, and Comorbities',2,NULL,NULL,0,0,12,190),
(@Form,'Smoking',N'Smoking','RadioBox','yorn','s2',N'Pre-op risk factors, and Comorbities',2,NULL,NULL,0,0,12,200),
(@Form,'Dyslipidemia',N'Dyslipidemia','RadioBox','yorn','s3',N'Alcohol usage',3,NULL,NULL,0,0,12,210),
(@Form,'PreoperativeCriticalState',N'Preoperative critical state','Text',NULL,'s3',N'Alcohol usage',3,NULL,NULL,0,0,12,220),
(@Form,'InfectiousEndocarditis',N'Infectious endocarditis','RadioBox','yorn','s3',N'Alcohol usage',3,NULL,NULL,0,0,12,230),
(@Form,'ChronicKidneyDisease',N'Chronic kidney disease','RadioBox','yorn','s3',N'Alcohol usage',3,NULL,NULL,0,0,12,240),
(@Form,'ChronicLungDisease',N'Chronic lung disease','RadioBox','yorn','s3',N'Alcohol usage',3,NULL,NULL,0,0,12,250),
(@Form,'ChronicLiverDisease',N'Chronic liver disease','RadioBox','yorn','s3',N'Alcohol usage',3,NULL,NULL,0,0,12,260),
(@Form,'DiabetesMellitus',N'Diabetes mellitus','RadioBox','yorn','s5',N'Peripheral artery disease',5,NULL,NULL,0,0,12,270),
(@Form,'WBCWriteIn150InDecimals',N'WBC/write in 1-50 in decimals/','Text',NULL,'s7',N'Pre-op lab and Echo',7,NULL,NULL,0,0,12,280),
(@Form,'HGBGDl',N'HGB /g/dl/','Number',NULL,'s7',N'Pre-op lab and Echo',7,NULL,NULL,0,0,12,290),
(@Form,'HCT',N'HCT','Number',NULL,'s7',N'Pre-op lab and Echo',7,NULL,NULL,0,0,12,300),
(@Form,'PLTInDecimalsToHundreds',N'PLT/in decimals to hundreds/','Text',NULL,'s7',N'Pre-op lab and Echo',7,NULL,NULL,0,0,12,310),
(@Form,'CreatinineMolL',N'Creatinine /µmol/L/','Number',NULL,'s7',N'Pre-op lab and Echo',7,NULL,NULL,0,0,12,320),
(@Form,'BUNMmolL',N'BUN/mmol/L/','Number',NULL,'s7',N'Pre-op lab and Echo',7,NULL,NULL,0,0,12,330),
(@Form,'KMmolL',N'K+/mmol/L/','Number',NULL,'s7',N'Pre-op lab and Echo',7,NULL,NULL,0,0,12,340),
(@Form,'Glucose',N'Glucose','Text',NULL,'s7',N'Pre-op lab and Echo',7,NULL,NULL,0,0,12,350),
(@Form,'TotalAlbuminGL',N'Total albumin /g/L/','Number',NULL,'s7',N'Pre-op lab and Echo',7,NULL,NULL,0,0,12,360),
(@Form,'ASTUL',N'AST /U/L/','Number',NULL,'s7',N'Pre-op lab and Echo',7,NULL,NULL,0,0,12,370),
(@Form,'ALTUL',N'ALT /U/L/','Number',NULL,'s7',N'Pre-op lab and Echo',7,NULL,NULL,0,0,12,380),
(@Form,'NTProBNPPgMl',N'NTProBNP /pg/ml/','Text',NULL,'s7',N'Pre-op lab and Echo',7,NULL,NULL,0,0,12,390),
(@Form,'PreOpEcho',N'Pre-op Echo','Text',NULL,'s7',N'Pre-op lab and Echo',7,NULL,NULL,0,0,12,400),
(@Form,'DateOfEchoMeasurement',N'Date of echo - Measurement','Text',NULL,'s7',N'Pre-op lab and Echo',7,NULL,NULL,0,0,12,410),
(@Form,'LVEF',N'LVEF','Text',NULL,'s7',N'Pre-op lab and Echo',7,NULL,NULL,0,0,12,420),
(@Form,'LVEDD',N'LVEDD','Number',NULL,'s7',N'Pre-op lab and Echo',7,NULL,NULL,0,0,12,430),
(@Form,'LVESD',N'LVESD','Number',NULL,'s7',N'Pre-op lab and Echo',7,NULL,NULL,0,0,12,440),
(@Form,'AorticRootDiameterMMode',N'Aortic root diameter /M mode/','Text',NULL,'s7',N'Pre-op lab and Echo',7,NULL,NULL,0,0,12,450),
(@Form,'LADMMode',N'LAD (AP) /M mode?/','Text',NULL,'s7',N'Pre-op lab and Echo',7,NULL,NULL,0,0,12,460),
(@Form,'DOfAscAo',N'D of AscAo','Number',NULL,'s7',N'Pre-op lab and Echo',7,NULL,NULL,0,0,12,470),
(@Form,'SPAPmmHg',N'sPAPmmHg','Text',NULL,'s7',N'Pre-op lab and Echo',7,NULL,NULL,0,0,12,480),
(@Form,'ValvularAssessment',N'Valvular assessment','Text',NULL,'s7',N'Pre-op lab and Echo',7,NULL,NULL,0,0,12,490),
(@Form,'AorticValveMeasurements',N'Aortic valve measurements','Text',NULL,'s7',N'Pre-op lab and Echo',7,NULL,NULL,0,0,12,500),
(@Form,'ASDegree',N'AS degree','Text',NULL,'s7',N'Pre-op lab and Echo',7,NULL,NULL,0,0,12,510),
(@Form,'AR',N'AR','Text',NULL,'s7',N'Pre-op lab and Echo',7,NULL,NULL,0,0,12,520),
(@Form,'AVPHT',N'AV PHT','Text',NULL,'s7',N'Pre-op lab and Echo',7,NULL,NULL,0,0,12,530),
(@Form,'AVMeanPG',N'AV meanPG','Text',NULL,'s7',N'Pre-op lab and Echo',7,NULL,NULL,0,0,12,540),
(@Form,'MitralValveMeasurements',N'Mitral valve measurements','Text',NULL,'s7',N'Pre-op lab and Echo',7,NULL,NULL,0,0,12,550),
(@Form,'MS',N'MS','Text',NULL,'s7',N'Pre-op lab and Echo',7,NULL,NULL,0,0,12,560),
(@Form,'MR',N'MR','Text',NULL,'s7',N'Pre-op lab and Echo',7,NULL,NULL,0,0,12,570),
(@Form,'MVA',N'MVA','Text',NULL,'s7',N'Pre-op lab and Echo',7,NULL,NULL,0,0,12,580),
(@Form,'MVPHT',N'MVPHT','Text',NULL,'s7',N'Pre-op lab and Echo',7,NULL,NULL,0,0,12,590),
(@Form,'MVMeanPG',N'MV meanPG','Text',NULL,'s7',N'Pre-op lab and Echo',7,NULL,NULL,0,0,12,600),
(@Form,'TricuspidValveMeasurement',N'Tricuspid valve measurement','Text',NULL,'s7',N'Pre-op lab and Echo',7,NULL,NULL,0,0,12,610),
(@Form,'TS',N'TS','Text',NULL,'s7',N'Pre-op lab and Echo',7,NULL,NULL,0,0,12,620),
(@Form,'TR',N'TR','Text',NULL,'s7',N'Pre-op lab and Echo',7,NULL,NULL,0,0,12,630),
(@Form,'TVMeanPG',N'TV meanPG','Text',NULL,'s7',N'Pre-op lab and Echo',7,NULL,NULL,0,0,12,640),
(@Form,'PHT',N'PHT','Text',NULL,'s7',N'Pre-op lab and Echo',7,NULL,NULL,0,0,12,650),
(@Form,'TRMaxPG',N'TR maxPG','Text',NULL,'s7',N'Pre-op lab and Echo',7,NULL,NULL,0,0,12,660),
(@Form,'PulmonaryValveMeasurements',N'Pulmonary valve measurements','Text',NULL,'s7',N'Pre-op lab and Echo',7,NULL,NULL,0,0,12,670),
(@Form,'PS',N'PS','Text',NULL,'s7',N'Pre-op lab and Echo',7,NULL,NULL,0,0,12,680),
(@Form,'PR',N'PR','Text',NULL,'s7',N'Pre-op lab and Echo',7,NULL,NULL,0,0,12,690),
(@Form,'PVVmax',N'PV Vmax','Number',NULL,'s7',N'Pre-op lab and Echo',7,NULL,NULL,0,0,12,700),
(@Form,'PVMeanPG',N'PV meanPG','Text',NULL,'s7',N'Pre-op lab and Echo',7,NULL,NULL,0,0,12,710),
(@Form,'LVSegmentalContractility',N'LV Segmental contractility','Text',NULL,'s7',N'Pre-op lab and Echo',7,NULL,NULL,0,0,12,720),
(@Form,'Apical',N'Apical','Text',NULL,'s7',N'Pre-op lab and Echo',7,NULL,NULL,0,0,12,730),
(@Form,'ApicalSeptal',N'Apical septal','Text',NULL,'s7',N'Pre-op lab and Echo',7,NULL,NULL,0,0,12,740),
(@Form,'ApicalLateral',N'Apical lateral','Text',NULL,'s7',N'Pre-op lab and Echo',7,NULL,NULL,0,0,12,750),
(@Form,'ApicalAnterior',N'Apical anterior','Text',NULL,'s7',N'Pre-op lab and Echo',7,NULL,NULL,0,0,12,760),
(@Form,'ApicalInferior',N'Apical inferior','Text',NULL,'s7',N'Pre-op lab and Echo',7,NULL,NULL,0,0,12,770),
(@Form,'MidAnterior',N'Mid anterior','Text',NULL,'s7',N'Pre-op lab and Echo',7,NULL,NULL,0,0,12,780),
(@Form,'MidAnterolateral',N'Mid anterolateral','Text',NULL,'s7',N'Pre-op lab and Echo',7,NULL,NULL,0,0,12,790),
(@Form,'MidInferolateral',N'Mid inferolateral','Text',NULL,'s7',N'Pre-op lab and Echo',7,NULL,NULL,0,0,12,800),
(@Form,'MidAnteroseptal',N'Mid anteroseptal','Text',NULL,'s7',N'Pre-op lab and Echo',7,NULL,NULL,0,0,12,810),
(@Form,'BasalAnterior',N'Basal anterior','Text',NULL,'s7',N'Pre-op lab and Echo',7,NULL,NULL,0,0,12,820),
(@Form,'BasalAnterolateral',N'Basal anterolateral','Text',NULL,'s7',N'Pre-op lab and Echo',7,NULL,NULL,0,0,12,830),
(@Form,'BasalInferior',N'Basal inferior','Text',NULL,'s7',N'Pre-op lab and Echo',7,NULL,NULL,0,0,12,840),
(@Form,'BasalInferoseptal',N'Basal inferoseptal','Text',NULL,'s7',N'Pre-op lab and Echo',7,NULL,NULL,0,0,12,850),
(@Form,'BasalInferolateral',N'Basal inferolateral','Text',NULL,'s7',N'Pre-op lab and Echo',7,NULL,NULL,0,0,12,860),
(@Form,'BasalAnteroseptal',N'Basal anteroseptal','Text',NULL,'s7',N'Pre-op lab and Echo',7,NULL,NULL,0,0,12,870),
(@Form,'Diuretics',N'Diuretics','RadioBox','yorn','s8',N'Pre-op medication and cardiac disease',8,NULL,NULL,0,0,12,880),
(@Form,'ACEOrARB',N'ACE or ARB','RadioBox','yorn','s8',N'Pre-op medication and cardiac disease',8,NULL,NULL,0,0,12,890),
(@Form,'BetaBlockers',N'Beta blockers','RadioBox','yorn','s8',N'Pre-op medication and cardiac disease',8,NULL,NULL,0,0,12,900),
(@Form,'Antiplatelets',N'Antiplatelets','RadioBox','yorn','s8',N'Pre-op medication and cardiac disease',8,NULL,NULL,0,0,12,910),
(@Form,'IfYes',N'If yes','Text',NULL,'s8',N'Pre-op medication and cardiac disease',8,'Antiplatelets','y',0,0,12,920),
(@Form,'ADPReceptorInhibitors',N'ADP receptor inhibitors','RadioBox','yorn','s8',N'Pre-op medication and cardiac disease',8,NULL,NULL,0,0,12,930),
(@Form,'COXInhibitors',N'COX inhibitors','RadioBox','yorn','s8',N'Pre-op medication and cardiac disease',8,NULL,NULL,0,0,12,940),
(@Form,'DateOfLastConsumption',N'Date of last consumption','Text',NULL,'s8',N'Pre-op medication and cardiac disease',8,NULL,NULL,0,0,12,950),
(@Form,'DurationOfAntiplateletIntake',N'Duration of antiplatelet intake','Text',NULL,'s8',N'Pre-op medication and cardiac disease',8,NULL,NULL,0,0,12,960),
(@Form,'Anticoagulants',N'Anticoagulants','RadioBox','yorn','s8',N'Pre-op medication and cardiac disease',8,NULL,NULL,0,0,12,970),
(@Form,'IfYes2',N'If yes','Text',NULL,'s8',N'Pre-op medication and cardiac disease',8,'Anticoagulants','y',0,0,12,980),
(@Form,'DateOfLastConsumption2',N'Date of last consumption','Text',NULL,'s8',N'Pre-op medication and cardiac disease',8,NULL,NULL,0,0,12,990),
(@Form,'DurationOfAnticoagulantIntake',N'Duration of anticoagulant intake','Text',NULL,'s8',N'Pre-op medication and cardiac disease',8,NULL,NULL,0,0,12,1000),
(@Form,'Nitrates',N'Nitrates','RadioBox','yorn','s8',N'Pre-op medication and cardiac disease',8,NULL,NULL,0,0,12,1010),
(@Form,'Inotropes',N'Inotropes','RadioBox','yorn','s8',N'Pre-op medication and cardiac disease',8,NULL,NULL,0,0,12,1020),
(@Form,'LipidLoweringDrugs',N'Lipid lowering drugs','RadioBox','yorn','s8',N'Pre-op medication and cardiac disease',8,NULL,NULL,0,0,12,1030),
(@Form,'AntiglycemicDrugs',N'Antiglycemic drugs','RadioBox','yorn','s8',N'Pre-op medication and cardiac disease',8,NULL,NULL,0,0,12,1040),
(@Form,'RiskOfMortality',N'Risk of Mortality','Text',NULL,'s8',N'Pre-op medication and cardiac disease',8,NULL,NULL,0,0,12,1050),
(@Form,'EuroscoreII',N'Euroscore II','Text',NULL,'s8',N'Pre-op medication and cardiac disease',8,NULL,NULL,0,0,12,1060),
(@Form,'STSScore',N'STS score','Text',NULL,'s8',N'Pre-op medication and cardiac disease',8,NULL,NULL,0,0,12,1070),
(@Form,'DateOfSurgery2',N'Date of surgery','Text',NULL,'s9',N'Operative record',9,NULL,NULL,0,0,12,1080),
(@Form,'Operator',N'Operator','Text',NULL,'s9',N'Operative record',9,NULL,NULL,0,0,12,1090),
(@Form,'FirstAssistant',N'First assistant','Text',NULL,'s9',N'Operative record',9,NULL,NULL,0,0,12,1100),
(@Form,'SecondAssistant',N'Second assistant','Text',NULL,'s9',N'Operative record',9,NULL,NULL,0,0,12,1110),
(@Form,'Perfusionist',N'Perfusionist','Text',NULL,'s9',N'Operative record',9,NULL,NULL,0,0,12,1120),
(@Form,'Anesthesiologist',N'Anesthesiologist','Text',NULL,'s9',N'Operative record',9,NULL,NULL,0,0,12,1130),
(@Form,'AnesthesiologistNurse',N'Anesthesiologist nurse','Text',NULL,'s9',N'Operative record',9,NULL,NULL,0,0,12,1140),
(@Form,'ScrubNurse',N'Scrub nurse','Text',NULL,'s9',N'Operative record',9,NULL,NULL,0,0,12,1150),
(@Form,'PreviousOperation',N'Previous operation','Text',NULL,'s9',N'Operative record',9,NULL,NULL,0,0,12,1160),
(@Form,'DateOfPreviousOperation',N'Date of previous operation','Text',NULL,'s9',N'Operative record',9,NULL,NULL,0,0,12,1170),
(@Form,'OperationName',N'Operation name:','Text',NULL,'s9',N'Operative record',9,NULL,NULL,0,0,12,1180),
(@Form,'AorticValve',N'Aortic valve','Text',NULL,'s9',N'Operative record',9,NULL,NULL,0,0,12,1190),
(@Form,'MitralValve',N'Mitral valve','Text',NULL,'s9',N'Operative record',9,NULL,NULL,0,0,12,1200),
(@Form,'TricuspidValve',N'Tricuspid valve','Text',NULL,'s9',N'Operative record',9,NULL,NULL,0,0,12,1210),
(@Form,'PulmonaryValve',N'Pulmonary valve','Text',NULL,'s9',N'Operative record',9,NULL,NULL,0,0,12,1220),
(@Form,'PreOperativeDiagnosis',N'Pre-operative diagnosis','Text',NULL,'s9',N'Operative record',9,NULL,NULL,0,0,12,1230),
(@Form,'MainDiagnosis1',N'Main diagnosis - #1','Text',NULL,'s9',N'Operative record',9,NULL,NULL,0,0,12,1240),
(@Form,'SubsidiaryDiagnosis2',N'Subsidiary diagnosis #2','Text',NULL,'s9',N'Operative record',9,NULL,NULL,0,0,12,1250),
(@Form,'SubsidiaryDiagnosis3',N'Subsidiary diagnosis #3','Text',NULL,'s9',N'Operative record',9,NULL,NULL,0,0,12,1260),
(@Form,'AdditionalExplanationOfTheProcedure',N'Additional explanation of the procedure','Text',NULL,'s9',N'Operative record',9,NULL,NULL,0,0,12,1270),
(@Form,'SurigcalProcedureRecord',N'Surigcal procedure record','Text',NULL,'s9',N'Operative record',9,NULL,NULL,0,0,12,1280),
(@Form,'IncisionSite',N'Incision site:','Text',NULL,'s9',N'Operative record',9,NULL,NULL,0,0,12,1290),
(@Form,'TotalPerfusionTime',N'Total perfusion time:','Text',NULL,'s9',N'Operative record',9,NULL,NULL,0,0,12,1300),
(@Form,'AorticCrossClampTime',N'Aortic cross clamp time:','Number',NULL,'s9',N'Operative record',9,NULL,NULL,0,0,12,1310),
(@Form,'ArrestTime',N'Arrest time:','Text',NULL,'s9',N'Operative record',9,NULL,NULL,0,0,12,1320),
(@Form,'LowestTemperature',N'Lowest temperature:','Number',NULL,'s9',N'Operative record',9,NULL,NULL,0,0,12,1330),
(@Form,'AorticValve2',N'Aortic valve','Text',NULL,'s9',N'Operative record',9,NULL,NULL,0,0,12,1340),
(@Form,'MitralValve2',N'Mitral valve','Text',NULL,'s9',N'Operative record',9,NULL,NULL,0,0,12,1350),
(@Form,'TricuspidValve2',N'Tricuspid valve','Text',NULL,'s9',N'Operative record',9,NULL,NULL,0,0,12,1360),
(@Form,'PulmonaryValve2',N'Pulmonary valve','Text',NULL,'s9',N'Operative record',9,NULL,NULL,0,0,12,1370),
(@Form,'CombinedProcedure',N'Combined procedure:','RadioBox','yorn','s9',N'Operative record',9,NULL,NULL,0,0,12,1380),
(@Form,'CABG',N'CABG','RadioBox','yorn','s9',N'Operative record',9,NULL,NULL,0,0,12,1390),
(@Form,'GraftReplacementOfAscendingAorta',N'Graft replacement of Ascending aorta','Text',NULL,'s9',N'Operative record',9,NULL,NULL,0,0,12,1400),
(@Form,'ASDPatchClosure',N'ASD patch closure','RadioBox','yorn','s9',N'Operative record',9,NULL,NULL,0,0,12,1410),
(@Form,'VSDPatchClosure',N'VSD patch closure:','RadioBox','yorn','s9',N'Operative record',9,NULL,NULL,0,0,12,1420),
(@Form,'Others',N'Others','Text',NULL,'s9',N'Operative record',9,NULL,NULL,0,0,12,1430),
(@Form,'DrainageTubes',N'Drainage tubes','Text',NULL,'s9',N'Operative record',9,NULL,NULL,0,0,12,1440),
(@Form,'IsPatientIsOnInotropicSupport',N'Is patient is on inotropic support','Text',NULL,'s10',N'Defibrillation times',10,NULL,NULL,0,0,12,1450),
(@Form,'BloodTransfusionDuringSurgery',N'Blood transfusion during surgery','Text',NULL,'s11',N'Estimated blood loss during surgery (cc):',11,NULL,NULL,0,0,12,1460),
(@Form,'DateOfRecording',N'Date of recording:','Text',NULL,'s14',N'Patient discharge note after surgery:',14,NULL,NULL,0,0,12,1470),
(@Form,'DateOfSurgery3',N'Date of surgery:','Text',NULL,'s14',N'Patient discharge note after surgery:',14,NULL,NULL,0,0,12,1480),
(@Form,'DateOfHospitalDischarge',N'Date of hospital discharge:','Text',NULL,'s14',N'Patient discharge note after surgery:',14,NULL,NULL,0,0,12,1490),
(@Form,'PostOperativeDay',N'Post operative day:','Number',NULL,'s14',N'Patient discharge note after surgery:',14,NULL,NULL,0,0,12,1500),
(@Form,'ICUDay',N'ICU day:','Number',NULL,'s14',N'Patient discharge note after surgery:',14,NULL,NULL,0,0,12,1510),
(@Form,'IfYes3',N'If yes:','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,'ICUDay','y',0,0,12,1520),
(@Form,'AmountOfTransfusionPackedRBCInUnits',N'Amount of transfusion/Packed RBC in units/:','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,1530),
(@Form,'PostOperativeDiagnosis',N'Post operative diagnosis:','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,1540),
(@Form,'MainDiagnosis12',N'Main diagnosis - #1','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,1550),
(@Form,'SubsidiaryDiagnosis22',N'Subsidiary diagnosis #2','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,1560),
(@Form,'SubsidiaryDiagnosis32',N'Subsidiary diagnosis #3','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,1570),
(@Form,'Operation',N'Operation:','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,1580),
(@Form,'F1',N'1','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,1590),
(@Form,'F2',N'2','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,1600),
(@Form,'PostOpEcho',N'Post-Op echo:','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,1610),
(@Form,'DateOfEchoMeasurement2',N'Date of echo - Measurement','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,1620),
(@Form,'LVEF2',N'LVEF','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,1630),
(@Form,'LVEDD2',N'LVEDD','Number',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,1640),
(@Form,'LVESD2',N'LVESD','Number',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,1650),
(@Form,'AorticRootDiameterMMode2',N'Aortic root diameter /M mode/','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,1660),
(@Form,'LADMMode2',N'LAD (AP) /M mode?/','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,1670),
(@Form,'DOfAscAo2',N'D of AscAo','Number',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,1680),
(@Form,'SPAPmmHg2',N'sPAPmmHg','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,1690),
(@Form,'ValvularAssessment2',N'Valvular assessment','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,1700),
(@Form,'AorticValveMeasurements2',N'Aortic valve measurements','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,1710),
(@Form,'ASDegree2',N'AS degree','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,1720),
(@Form,'AR2',N'AR','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,1730),
(@Form,'AVPHT2',N'AV PHT','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,1740),
(@Form,'AVMeanPG2',N'AV meanPG','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,1750),
(@Form,'AVParavalvularLeak',N'AV Paravalvular leak','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,1760),
(@Form,'MitralValveMeasurements2',N'Mitral valve measurements','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,1770),
(@Form,'MS2',N'MS','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,1780),
(@Form,'MR2',N'MR','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,1790),
(@Form,'MVA2',N'MVA','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,1800),
(@Form,'MVPHT2',N'MVPHT','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,1810),
(@Form,'MVMeanPG2',N'MV meanPG','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,1820),
(@Form,'MVParavalvularLeak',N'MV Paravalvular leak','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,1830),
(@Form,'TricuspidValveMeasurement2',N'Tricuspid valve measurement','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,1840),
(@Form,'TS2',N'TS','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,1850),
(@Form,'TR2',N'TR','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,1860),
(@Form,'TVMeanPG2',N'TV meanPG','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,1870),
(@Form,'PHT2',N'PHT','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,1880),
(@Form,'TRMaxPG2',N'TR maxPG','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,1890),
(@Form,'TVParavalvularLeak',N'TV paravalvular leak','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,1900),
(@Form,'PulmonaryValveMeasurements2',N'Pulmonary valve measurements','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,1910),
(@Form,'PS2',N'PS','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,1920),
(@Form,'PR2',N'PR','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,1930),
(@Form,'PVVmax2',N'PV Vmax','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,1940),
(@Form,'PVMeanPG2',N'PV meanPG','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,1950),
(@Form,'PVParavalvularLeak',N'PV Paravalvular leak','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,1960),
(@Form,'LVSegmentalContractility2',N'LV Segmental contractility','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,1970),
(@Form,'Apical2',N'Apical','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,1980),
(@Form,'ApicalSeptal2',N'Apical septal','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,1990),
(@Form,'ApicalLateral2',N'Apical lateral','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,2000),
(@Form,'ApicalAnterior2',N'Apical anterior','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,2010),
(@Form,'ApicalInferior2',N'Apical inferior','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,2020),
(@Form,'MidAnterior2',N'Mid anterior','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,2030),
(@Form,'MidAnterolateral2',N'Mid anterolateral','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,2040),
(@Form,'MidInferolateral2',N'Mid inferolateral','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,2050),
(@Form,'MidAnteroseptal2',N'Mid anteroseptal','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,2060),
(@Form,'BasalAnterior2',N'Basal anterior','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,2070),
(@Form,'BasalAnterolateral2',N'Basal anterolateral','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,2080),
(@Form,'BasalInferior2',N'Basal inferior','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,2090),
(@Form,'BasalInferoseptal2',N'Basal inferoseptal','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,2100),
(@Form,'BasalInferolateral2',N'Basal inferolateral','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,2110),
(@Form,'BasalAnteroseptal2',N'Basal anteroseptal','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,2120),
(@Form,'PostOpHeartRhythm',N'Post-op heart rhythm:','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,2130),
(@Form,'DischargeStatus',N'Discharge status:','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,2140),
(@Form,'DestinationOnDischarge',N'Destination on discharge:','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,2150),
(@Form,'IfComplicationPresentSpecify',N'If complication present, specify','Text',NULL,'s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,2160),
(@Form,'IsPatientDeceased',N'Is patient deceased:','RadioBox','yorn','s15',N'Blood transfusion after surgery until discharge:',15,NULL,NULL,0,0,12,2170);

COMMIT;
GO
SET NOEXEC OFF;
GO
SELECT '1.7' AS FormCode, COUNT(*) AS Fields FROM dbo.TenderFormField WHERE FormCode='1.7';
GO

/* ---- fields needing a type/option-list decision from the clinical team ----
   SocialSecurityNumber                     sample="OO01010101"  Social security number
   DoctorInCharge                           sample="Enkhdorj"  Doctor in charge
   TypeOfSurgery                            sample="Aortic surgery"  Type of surgery
   PatientSurname                           sample="Peter"  Patient surname
   PatientFirstname                         sample="Peter"  Patient firstname
   Sex                                      sample="Male"  Sex
   PreOpNYHA                                sample="NYHA 3 stage"  Pre-op NYHA
   TypeOfOperaton                           sample="Primary surgery"  Type of Operaton
   PreOpHeartRhythm                         sample="Normal sinus rhythm"  Pre-op heart rhythm
   LVEF                                     sample="55.00%"  LVEF
   ASDegree                                 sample="Normal"  AS degree
   AR                                       sample="AR Mild"  AR
   MS                                       sample="Normal"  MS
   MR                                       sample="Normal"  MR
   TS                                       sample="Option 1"  TS
   TR                                       sample="TR Mild"  TR
   PS                                       sample="Option 1"  PS
   PR                                       sample="Normal"  PR
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
   EuroscoreII                              sample="0.67%"  Euroscore II
   DateOfSurgery2                           sample="2025/01/12"  Date of surgery
   Operator                                 sample="Bat-Undral"  Operator
   FirstAssistant                           sample="Zorig"  First assistant
   SecondAssistant                          sample="Enkhdorj"  Second assistant
   Perfusionist                             sample="Tuul"  Perfusionist
   Anesthesiologist                         sample="Demid-Od"  Anesthesiologist
   AnesthesiologistNurse                    sample="Ayushsuren"  Anesthesiologist nurse
   ScrubNurse                               sample="Altantsetseg"  Scrub nurse
   PreviousOperation                        sample="Tsendtsesenjab"  Previous operation
   OperationName                            sample="bentall procedure"  Operation name:
   AorticValve                              sample="Valve replacement"  Aortic valve
   MitralValve                              sample="No intervention"  Mitral valve
   TricuspidValve                           sample="No intervention"  Tricuspid valve
   PulmonaryValve                           sample="No intervention"  Pulmonary valve
   MainDiagnosis1                           sample="i71.5"  Main diagnosis - #1
   SubsidiaryDiagnosis2                     sample="i11.9"  Subsidiary diagnosis #2
   IncisionSite                             sample="Median sternotomy"  Incision site:
   TotalPerfusionTime                       sample="7:49"  Total perfusion time:
   AorticValve2                             sample="Repair"  Aortic valve
   MitralValve2                             sample="N/A"  Mitral valve
   TricuspidValve2                          sample="N/A"  Tricuspid valve
   PulmonaryValve2                          sample="N/A"  Pulmonary valve
   DateOfRecording                          sample="2025/01/11"  Date of recording:
   DateOfSurgery3                           sample="2025/01/12"  Date of surgery:
   LVEF2                                    sample="51.80%"  LVEF
   ASDegree2                                sample="Normal"  AS degree
   AR2                                      sample="AR Moderate"  AR
   MS2                                      sample="Normal"  MS
   MR2                                      sample="Normal"  MR
   TS2                                      sample="Normal"  TS
   TR2                                      sample="Normal"  TR
   PS2                                      sample="Normal"  PS
   PR2                                      sample="Normal"  PR
   Apical2                                  sample="Normal contractility"  Apical
   ApicalSeptal2                            sample="Normal contractility"  Apical septal
   ApicalLateral2                           sample="Normal contractility"  Apical lateral
   ApicalAnterior2                          sample="Normal contractility"  Apical anterior
   ApicalInferior2                          sample="Normal contractility"  Apical inferior
   MidAnterior2                             sample="Normal contractility"  Mid anterior
   MidAnterolateral2                        sample="Normal contractility"  Mid anterolateral
   MidInferolateral2                        sample="Normal contractility"  Mid inferolateral
   MidAnteroseptal2                         sample="Normal contractility"  Mid anteroseptal
   BasalAnterior2                           sample="Normal contractility"  Basal anterior
   BasalAnterolateral2                      sample="Normal contractility"  Basal anterolateral
   BasalInferior2                           sample="Normal contractility"  Basal inferior
   BasalInferoseptal2                       sample="Normal contractility"  Basal inferoseptal
   BasalInferolateral2                      sample="Normal contractility"  Basal inferolateral
   BasalAnteroseptal2                       sample="Normal contractility"  Basal anteroseptal
   PostOpHeartRhythm                        sample="Normal sinus rhythm"  Post-op heart rhythm:
*/
