-- =============================================================================
-- Form 1.9  ЗҮРХНИЙ НЭЭЛТТЭЙ БУСАД МЭС ЗАСАЛ
-- Source: "MN cardio upgrade.docx", appendix 1.9
-- GENERATED from the document's own table structure by build-form-seeds.js.
--
-- 219 fields in 22 sections. Labels are verbatim from the tender.
-- Field codes and types are derived, NOT approved - clinical sign-off is step 1
-- of the WBS acceptance sequence and is the customer's to give.
-- 42 field(s) have a sample value whose type could not be inferred and were
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

DECLARE @Form varchar(20) = '1.9';
BEGIN TRAN;

IF EXISTS (SELECT 1 FROM dbo.TenderForm WHERE FormCode=@Form)
    UPDATE dbo.TenderForm SET NameMn=N'Зүрхний нээлттэй бусад мэс заслын маягт', GroupCode='surgery',
        GroupLabelMn=N'Мэс заслын маягтууд', Position=19, IsActive=1, UpdateDate=GETDATE()
     WHERE FormCode=@Form;
ELSE
    INSERT INTO dbo.TenderForm (FormCode,NameMn,GroupCode,GroupLabelMn,Position)
    VALUES (@Form,N'Зүрхний нээлттэй бусад мэс заслын маягт','surgery',N'Мэс заслын маягтууд',19);

DELETE FROM dbo.TenderFormField WHERE FormCode=@Form;

INSERT INTO dbo.TenderFormField
 (FormCode,FieldCode,LabelMn,FieldType,OptionType,SectionCode,SectionLabel,SectionPos,
  ParentField,ParentValue,IsRequired,IsSearchable,Md,Position)
VALUES
(@Form,'PatientsHistoryID',N'Patients History ID:','Text',NULL,'s1',N'Patient Operation record',1,NULL,NULL,0,0,12,10),
(@Form,'SocialSecurityNumber',N'Social security number','Text',NULL,'s1',N'Patient Operation record',1,NULL,NULL,0,0,12,20),
(@Form,'DoctorInCharge',N'Doctor in charge','Text',NULL,'s1',N'Patient Operation record',1,NULL,NULL,0,0,12,30),
(@Form,'DateOfAdmission',N'Date of admission','Text',NULL,'s1',N'Patient Operation record',1,NULL,NULL,0,0,12,40),
(@Form,'DateOfSurgery',N'Date of surgery','Text',NULL,'s1',N'Patient Operation record',1,NULL,NULL,0,0,12,50),
(@Form,'TypeOfSurgery',N'Type of surgery','Text',NULL,'s1',N'Patient Operation record',1,NULL,NULL,0,0,12,60),
(@Form,'PatientSurname',N'Patient surname','Text',NULL,'s1',N'Patient Operation record',1,NULL,NULL,0,0,12,70),
(@Form,'PatientFirstname',N'Patient firstname','Text',NULL,'s1',N'Patient Operation record',1,NULL,NULL,0,0,12,80),
(@Form,'DateOfBirth',N'Date of birth','Date',NULL,'s1',N'Patient Operation record',1,NULL,NULL,0,0,12,90),
(@Form,'Sex',N'Sex','Text',NULL,'s1',N'Patient Operation record',1,NULL,NULL,0,0,12,100),
(@Form,'PreOpNYHA',N'Pre-op NYHA','Text',NULL,'s1',N'Patient Operation record',1,NULL,NULL,0,0,12,110),
(@Form,'TheNCEPODClassificatonOfIntervention',N'The NCEPOD Classificaton of intervention','Text',NULL,'s1',N'Patient Operation record',1,NULL,NULL,0,0,12,120),
(@Form,'TypeOfOperaton',N'Type of Operaton','Text',NULL,'s1',N'Patient Operation record',1,NULL,NULL,0,0,12,130),
(@Form,'PreOpHeartRhythm',N'Pre-op heart rhythm','Text',NULL,'s1',N'Patient Operation record',1,NULL,NULL,0,0,12,140),
(@Form,'BodyWeightKg',N'Body weight /kg/','Text',NULL,'s2',N'Pre-op risk factors, and Comorbities',2,NULL,NULL,0,0,12,150),
(@Form,'HeightCm',N'Height /cm/','Number',NULL,'s2',N'Pre-op risk factors, and Comorbities',2,NULL,NULL,0,0,12,160),
(@Form,'BMIAutocalculator',N'BMI/Autocalculator/','Text',NULL,'s2',N'Pre-op risk factors, and Comorbities',2,NULL,NULL,0,0,12,170),
(@Form,'BSAAutocalculator',N'BSA/Autocalculator/','Text',NULL,'s2',N'Pre-op risk factors, and Comorbities',2,NULL,NULL,0,0,12,180),
(@Form,'ArterialHypertension',N'Arterial hypertension','Text',NULL,'s2',N'Pre-op risk factors, and Comorbities',2,NULL,NULL,0,0,12,190),
(@Form,'Smoking',N'Smoking','RadioBox','yorn','s2',N'Pre-op risk factors, and Comorbities',2,NULL,NULL,0,0,12,200),
(@Form,'Dyslipidemia',N'Dyslipidemia','RadioBox','yorn','s3',N'Alcohol usage',3,NULL,NULL,0,0,12,210),
(@Form,'PreoperativeCriticalState',N'Preoperative critical state','Text',NULL,'s3',N'Alcohol usage',3,NULL,NULL,0,0,12,220),
(@Form,'WBCWriteIn150InDecimals',N'WBC/write in 1-50 in decimals/','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,230),
(@Form,'HGBGDl',N'HGB /g/dl/','Number',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,240),
(@Form,'HCT',N'HCT','Number',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,250),
(@Form,'PLTInDecimalsToHundreds',N'PLT/in decimals to hundreds/','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,260),
(@Form,'CreatinineMolL',N'Creatinine /µmol/L/','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,270),
(@Form,'BUNMmolL',N'BUN/mmol/L/','Number',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,280),
(@Form,'KMmolL',N'K+/mmol/L/','Number',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,290),
(@Form,'Glucose',N'Glucose','Number',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,300),
(@Form,'TotalAlbuminGL',N'Total albumin /g/L/','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,310),
(@Form,'ASTUL',N'AST /U/L/','Number',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,320),
(@Form,'ALTUL',N'ALT /U/L/','Number',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,330),
(@Form,'NTProBNPPgMl',N'NTProBNP /pg/ml/','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,340),
(@Form,'PreOpEcho',N'Pre-op Echo','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,350),
(@Form,'DateOfEchoMeasurement',N'Date of echo - Measurement','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,360),
(@Form,'LVEF',N'LVEF','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,370),
(@Form,'LVEDD',N'LVEDD','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,380),
(@Form,'LVESD',N'LVESD','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,390),
(@Form,'AorticRootDiameterMMode',N'Aortic root diameter /M mode/','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,400),
(@Form,'LADMMode',N'LAD (AP) /M mode?/','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,410),
(@Form,'RightAtrialDimension',N'Right atrial dimension','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,420),
(@Form,'DOfAscAo',N'D of AscAo','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,430),
(@Form,'SPAPmmHg',N'sPAPmmHg','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,440),
(@Form,'IVC',N'IVC','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,450),
(@Form,'TAPSE',N'TAPSE','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,460),
(@Form,'Comments',N'Comments','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,470),
(@Form,'ValvularAssessment',N'Valvular assessment','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,480),
(@Form,'AorticValveMeasurements',N'Aortic valve measurements','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,490),
(@Form,'ASDegree',N'AS degree','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,500),
(@Form,'AR',N'AR','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,510),
(@Form,'AVPHT',N'AV PHT','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,520),
(@Form,'AVMeanPG',N'AV meanPG','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,530),
(@Form,'MitralValveMeasurements',N'Mitral valve measurements','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,540),
(@Form,'MS',N'MS','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,550),
(@Form,'MR',N'MR','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,560),
(@Form,'MVA',N'MVA','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,570),
(@Form,'MVPHT',N'MVPHT','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,580),
(@Form,'MVMeanPG',N'MV meanPG','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,590),
(@Form,'TricuspidValveMeasurement',N'Tricuspid valve measurement','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,600),
(@Form,'TS',N'TS','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,610),
(@Form,'TR',N'TR','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,620),
(@Form,'TVMeanPG',N'TV meanPG','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,630),
(@Form,'PHT',N'PHT','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,640),
(@Form,'TRMaxPG',N'TR maxPG','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,650),
(@Form,'PulmonaryValveMeasurements',N'Pulmonary valve measurements','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,660),
(@Form,'PS',N'PS','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,670),
(@Form,'PR',N'PR','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,680),
(@Form,'PVVmax',N'PV Vmax','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,690),
(@Form,'PVMeanPG',N'PV meanPG','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,700),
(@Form,'LVSegmentalContractility',N'LV Segmental contractility','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,710),
(@Form,'Apical',N'Apical','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,720),
(@Form,'ApicalSeptal',N'Apical septal','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,730),
(@Form,'ApicalLateral',N'Apical lateral','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,740),
(@Form,'ApicalAnterior',N'Apical anterior','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,750),
(@Form,'ApicalInferior',N'Apical inferior','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,760),
(@Form,'MidAnterior',N'Mid anterior','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,770),
(@Form,'MidAnterolateral',N'Mid anterolateral','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,780),
(@Form,'MidInferolateral',N'Mid inferolateral','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,790),
(@Form,'MidAnteroseptal',N'Mid anteroseptal','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,800),
(@Form,'BasalAnterior',N'Basal anterior','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,810),
(@Form,'BasalAnterolateral',N'Basal anterolateral','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,820),
(@Form,'BasalInferior',N'Basal inferior','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,830),
(@Form,'BasalInferoseptal',N'Basal inferoseptal','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,840),
(@Form,'BasalInferolateral',N'Basal inferolateral','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,850),
(@Form,'BasalAnteroseptal',N'Basal anteroseptal','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,860),
(@Form,'GlobalHypokinesia',N'Global hypokinesia','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,870),
(@Form,'PreOpMedicationAndCardiacDisease',N'Pre-op medication and cardiac disease','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,880),
(@Form,'Diuretics',N'Diuretics','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,890),
(@Form,'ACEOrARB',N'ACE or ARB','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,900),
(@Form,'BetaBlockers',N'Beta blockers','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,910),
(@Form,'Antiplatelets',N'Antiplatelets','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,920),
(@Form,'IfYes',N'If yes','Text',NULL,'s12',N'Pre-op lab and Echo',12,'Antiplatelets','y',0,0,12,930),
(@Form,'ADPReceptorInhibitors',N'ADP receptor inhibitors','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,940),
(@Form,'COXInhibitors',N'COX inhibitors','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,950),
(@Form,'DateOfLastConsumption',N'Date of last consumption','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,960),
(@Form,'DurationOfAntiplateletIntake',N'Duration of antiplatelet intake','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,970),
(@Form,'Anticoagulants',N'Anticoagulants','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,980),
(@Form,'IfYes2',N'If yes','Text',NULL,'s12',N'Pre-op lab and Echo',12,'Anticoagulants','y',0,0,12,990),
(@Form,'DateOfLastConsumption2',N'Date of last consumption','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,1000),
(@Form,'DurationOfAnticoagulantIntake',N'Duration of anticoagulant intake','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,1010),
(@Form,'Nitrates',N'Nitrates','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,1020),
(@Form,'Inotropes',N'Inotropes','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,1030),
(@Form,'LipidLoweringDrugs',N'Lipid lowering drugs','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,1040),
(@Form,'AntiglycemicDrugs',N'Antiglycemic drugs','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,1050),
(@Form,'RiskOfMortality',N'Risk of Mortality','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,1060),
(@Form,'EuroscoreII',N'Euroscore II','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,1070),
(@Form,'STSScore',N'STS score','Text',NULL,'s12',N'Pre-op lab and Echo',12,NULL,NULL,0,0,12,1080),
(@Form,'DateOfSurgery2',N'Date of surgery','Text',NULL,'s13',N'Operative record',13,NULL,NULL,0,0,12,1090),
(@Form,'Operator',N'Operator','Text',NULL,'s13',N'Operative record',13,NULL,NULL,0,0,12,1100),
(@Form,'FirstAssistant',N'First assistant','Text',NULL,'s13',N'Operative record',13,NULL,NULL,0,0,12,1110),
(@Form,'SecondAssistant',N'Second assistant','Text',NULL,'s13',N'Operative record',13,NULL,NULL,0,0,12,1120),
(@Form,'Perfusionist',N'Perfusionist','Text',NULL,'s13',N'Operative record',13,NULL,NULL,0,0,12,1130),
(@Form,'Anesthesiologist',N'Anesthesiologist','Text',NULL,'s13',N'Operative record',13,NULL,NULL,0,0,12,1140),
(@Form,'AnesthesiologistNurse',N'Anesthesiologist nurse','Text',NULL,'s13',N'Operative record',13,NULL,NULL,0,0,12,1150),
(@Form,'ScrubNurse',N'Scrub nurse','Text',NULL,'s13',N'Operative record',13,NULL,NULL,0,0,12,1160),
(@Form,'PreviousOperation',N'Previous operation','Text',NULL,'s13',N'Operative record',13,NULL,NULL,0,0,12,1170),
(@Form,'DateOfPreviousOperation',N'Date of previous operation','Text',NULL,'s13',N'Operative record',13,NULL,NULL,0,0,12,1180),
(@Form,'OperationName',N'Operation name:','Text',NULL,'s13',N'Operative record',13,NULL,NULL,0,0,12,1190),
(@Form,'AorticValve',N'Aortic valve','Text',NULL,'s13',N'Operative record',13,NULL,NULL,0,0,12,1200),
(@Form,'MitralValve',N'Mitral valve','Text',NULL,'s13',N'Operative record',13,NULL,NULL,0,0,12,1210),
(@Form,'TricuspidValve',N'Tricuspid valve','Text',NULL,'s13',N'Operative record',13,NULL,NULL,0,0,12,1220),
(@Form,'PulmonaryValve',N'Pulmonary valve','Text',NULL,'s13',N'Operative record',13,NULL,NULL,0,0,12,1230),
(@Form,'PreOperativeDiagnosis',N'Pre-operative diagnosis','Text',NULL,'s13',N'Operative record',13,NULL,NULL,0,0,12,1240),
(@Form,'MainDiagnosis1',N'Main diagnosis - #1','Text',NULL,'s13',N'Operative record',13,NULL,NULL,0,0,12,1250),
(@Form,'SubsidiaryDiagnosis2',N'Subsidiary diagnosis #2','Text',NULL,'s13',N'Operative record',13,NULL,NULL,0,0,12,1260),
(@Form,'SubsidiaryDiagnosis3',N'Subsidiary diagnosis #3','Text',NULL,'s13',N'Operative record',13,NULL,NULL,0,0,12,1270),
(@Form,'AdditionalExplanationOfTheProcedure',N'Additional explanation of the procedure','Text',NULL,'s13',N'Operative record',13,NULL,NULL,0,0,12,1280),
(@Form,'SurigcalProcedureRecord',N'Surigcal procedure record','Text',NULL,'s13',N'Operative record',13,NULL,NULL,0,0,12,1290),
(@Form,'IncisionSite',N'Incision site:','Text',NULL,'s13',N'Operative record',13,NULL,NULL,0,0,12,1300),
(@Form,'TotalPerfusionTime',N'Total perfusion time:','Text',NULL,'s13',N'Operative record',13,NULL,NULL,0,0,12,1310),
(@Form,'AorticCrossClampTime',N'Aortic cross clamp time:','Text',NULL,'s13',N'Operative record',13,NULL,NULL,0,0,12,1320),
(@Form,'ArrestTime',N'Arrest time:','Text',NULL,'s13',N'Operative record',13,NULL,NULL,0,0,12,1330),
(@Form,'LowestTemperature',N'Lowest temperature:','Text',NULL,'s13',N'Operative record',13,NULL,NULL,0,0,12,1340),
(@Form,'AorticValve2',N'Aortic valve','Text',NULL,'s13',N'Operative record',13,NULL,NULL,0,0,12,1350),
(@Form,'MitralValve2',N'Mitral valve','Text',NULL,'s13',N'Operative record',13,NULL,NULL,0,0,12,1360),
(@Form,'CABG',N'CABG','Text',NULL,'s16',N'Combined procedure:',16,NULL,NULL,0,0,12,1370),
(@Form,'GraftReplacementOfAscendingAorta',N'Graft replacement of Ascending aorta','Text',NULL,'s16',N'Combined procedure:',16,NULL,NULL,0,0,12,1380),
(@Form,'ASDPatchClosure',N'ASD patch closure','Text',NULL,'s16',N'Combined procedure:',16,NULL,NULL,0,0,12,1390),
(@Form,'VSDPatchClosure',N'VSD patch closure:','Text',NULL,'s16',N'Combined procedure:',16,NULL,NULL,0,0,12,1400),
(@Form,'Others',N'Others','Text',NULL,'s16',N'Combined procedure:',16,NULL,NULL,0,0,12,1410),
(@Form,'DrainageTubes',N'Drainage tubes','Text',NULL,'s16',N'Combined procedure:',16,NULL,NULL,0,0,12,1420),
(@Form,'IsPatientIsOnInotropicSupport',N'Is patient is on inotropic support','Text',NULL,'s17',N'Defibrillation times',17,NULL,NULL,0,0,12,1430),
(@Form,'BloodTransfusionDuringSurgery',N'Blood transfusion during surgery','Text',NULL,'s18',N'Estimated blood loss during surgery (cc):',18,NULL,NULL,0,0,12,1440),
(@Form,'DateOfRecording',N'Date of recording:','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,1450),
(@Form,'DateOfSurgery3',N'Date of surgery:','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,1460),
(@Form,'DateOfHospitalDischarge',N'Date of hospital discharge:','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,1470),
(@Form,'PostOperativeDay',N'Post operative day:','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,1480),
(@Form,'ICUDay',N'ICU day:','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,1490),
(@Form,'BloodTransfusionAfterSurgeryUntilDischarge',N'Blood transfusion after surgery until discharge:','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,1500),
(@Form,'IfYes3',N'If yes:','Text',NULL,'s21',N'Patient discharge note after surgery:',21,'BloodTransfusionAfterSurgeryUntilDischarge','y',0,0,12,1510),
(@Form,'AmountOfTransfusionPackedRBCInUnits',N'Amount of transfusion/Packed RBC in units/:','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,1520),
(@Form,'PostOperativeDiagnosis',N'Post operative diagnosis:','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,1530),
(@Form,'MainDiagnosis12',N'Main diagnosis - #1','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,1540),
(@Form,'SubsidiaryDiagnosis22',N'Subsidiary diagnosis #2','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,1550),
(@Form,'SubsidiaryDiagnosis32',N'Subsidiary diagnosis #3','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,1560),
(@Form,'Operation',N'Operation:','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,1570),
(@Form,'F1',N'1','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,1580),
(@Form,'F2',N'2','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,1590),
(@Form,'PostOpEcho',N'Post-Op echo:','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,1600),
(@Form,'DateOfEchoMeasurement2',N'Date of echo - Measurement','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,1610),
(@Form,'LVEF2',N'LVEF','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,1620),
(@Form,'LVEDD2',N'LVEDD','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,1630),
(@Form,'LVESD2',N'LVESD','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,1640),
(@Form,'AorticRootDiameterMMode2',N'Aortic root diameter /M mode/','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,1650),
(@Form,'LADMMode2',N'LAD (AP) /M mode?/','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,1660),
(@Form,'RightAtrialDimension2',N'Right atrial dimension','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,1670),
(@Form,'DOfAscAo2',N'D of AscAo','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,1680),
(@Form,'SPAPmmHg2',N'sPAPmmHg','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,1690),
(@Form,'IVC2',N'IVC','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,1700),
(@Form,'TAPSE2',N'TAPSE','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,1710),
(@Form,'Comments2',N'Comments','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,1720),
(@Form,'ValvularAssessment2',N'Valvular assessment','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,1730),
(@Form,'AorticValveMeasurements2',N'Aortic valve measurements','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,1740),
(@Form,'ASDegree2',N'AS degree','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,1750),
(@Form,'AR2',N'AR','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,1760),
(@Form,'AVPHT2',N'AV PHT','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,1770),
(@Form,'AVMeanPG2',N'AV meanPG','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,1780),
(@Form,'AVParavalvularLeak',N'AV Paravalvular leak','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,1790),
(@Form,'MitralValveMeasurements2',N'Mitral valve measurements','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,1800),
(@Form,'MS2',N'MS','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,1810),
(@Form,'MR2',N'MR','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,1820),
(@Form,'MVA2',N'MVA','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,1830),
(@Form,'MVPHT2',N'MVPHT','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,1840),
(@Form,'MVMeanPG2',N'MV meanPG','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,1850),
(@Form,'MVParavalvularLeak',N'MV Paravalvular leak','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,1860),
(@Form,'TricuspidValveMeasurement2',N'Tricuspid valve measurement','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,1870),
(@Form,'TS2',N'TS','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,1880),
(@Form,'TR2',N'TR','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,1890),
(@Form,'TVMeanPG2',N'TV meanPG','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,1900),
(@Form,'PHT2',N'PHT','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,1910),
(@Form,'TRMaxPG2',N'TR maxPG','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,1920),
(@Form,'TVParavalvularLeak',N'TV paravalvular leak','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,1930),
(@Form,'PulmonaryValveMeasurements2',N'Pulmonary valve measurements','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,1940),
(@Form,'PS2',N'PS','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,1950),
(@Form,'PR2',N'PR','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,1960),
(@Form,'PVVmax2',N'PV Vmax','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,1970),
(@Form,'PVMeanPG2',N'PV meanPG','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,1980),
(@Form,'PVParavalvularLeak',N'PV Paravalvular leak','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,1990),
(@Form,'LVSegmentalContractility2',N'LV Segmental contractility','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,2000),
(@Form,'Apical2',N'Apical','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,2010),
(@Form,'ApicalSeptal2',N'Apical septal','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,2020),
(@Form,'ApicalLateral2',N'Apical lateral','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,2030),
(@Form,'ApicalAnterior2',N'Apical anterior','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,2040),
(@Form,'ApicalInferior2',N'Apical inferior','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,2050),
(@Form,'MidAnterior2',N'Mid anterior','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,2060),
(@Form,'MidAnterolateral2',N'Mid anterolateral','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,2070),
(@Form,'MidInferolateral2',N'Mid inferolateral','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,2080),
(@Form,'MidAnteroseptal2',N'Mid anteroseptal','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,2090),
(@Form,'BasalAnterior2',N'Basal anterior','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,2100),
(@Form,'BasalAnterolateral2',N'Basal anterolateral','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,2110),
(@Form,'BasalInferior2',N'Basal inferior','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,2120),
(@Form,'BasalInferoseptal2',N'Basal inferoseptal','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,2130),
(@Form,'BasalInferolateral2',N'Basal inferolateral','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,2140),
(@Form,'BasalAnteroseptal2',N'Basal anteroseptal','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,2150),
(@Form,'PostOpHeartRhythm',N'Post-op heart rhythm:','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,2160),
(@Form,'DischargeStatus',N'Discharge status:','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,2170),
(@Form,'DestinationOnDischarge',N'Destination on discharge:','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,2180),
(@Form,'IfComplicationPresentSpecify',N'If complication present, specify','Text',NULL,'s21',N'Patient discharge note after surgery:',21,NULL,NULL,0,0,12,2190);

COMMIT;
GO
SET NOEXEC OFF;
GO
SELECT '1.9' AS FormCode, COUNT(*) AS Fields FROM dbo.TenderFormField WHERE FormCode='1.9';
GO

/* ---- fields needing a type/option-list decision from the clinical team ----
   Sex                                      sample="Male"  Sex
   PreOpNYHA                                sample="NYHA 2 stage"  Pre-op NYHA
   LVEF                                     sample="49.00%"  LVEF
   ASDegree                                 sample="Option 1"  AS degree
   AR                                       sample="Option 1"  AR
   MS                                       sample="Option 1"  MS
   MR                                       sample="Option 1"  MR
   TS                                       sample="Option 1"  TS
   TR                                       sample="Option 1"  TR
   PS                                       sample="Option 1"  PS
   PR                                       sample="Option 1"  PR
   Apical                                   sample="Normal contractility"  Apical
   ApicalSeptal                             sample="Normal contractility"  Apical septal
   ApicalLateral                            sample="Normal contractility"  Apical lateral
   ApicalAnterior                           sample="Normal contractility"  Apical anterior
   ApicalInferior                           sample="Normal contractility"  Apical inferior
   MidAnterior                              sample="Normal contractility"  Mid anterior
   BasalAnterior                            sample="Normal contractility"  Basal anterior
   BasalInferior                            sample="Normal contractility"  Basal inferior
   Operator                                 sample="Bat-Undral"  Operator
   FirstAssistant                           sample="Ayurzana"  First assistant
   Perfusionist                             sample="Munkhjargal"  Perfusionist
   ScrubNurse                               sample="Altantsetseg"  Scrub nurse
   IncisionSite                             sample="N/A"  Incision site:
   AorticValve2                             sample="N/A"  Aortic valve
   MitralValve2                             sample="N/A"  Mitral valve
   ASDegree2                                sample="Option 1"  AS degree
   AR2                                      sample="Option 1"  AR
   MS2                                      sample="Option 1"  MS
   MR2                                      sample="Option 1"  MR
   TS2                                      sample="Option 1"  TS
   TR2                                      sample="Option 1"  TR
   PS2                                      sample="Option 1"  PS
   PR2                                      sample="Option 1"  PR
   Apical2                                  sample="Normal contractility"  Apical
   ApicalSeptal2                            sample="Normal contractility"  Apical septal
   ApicalLateral2                           sample="Normal contractility"  Apical lateral
   ApicalAnterior2                          sample="Normal contractility"  Apical anterior
   ApicalInferior2                          sample="Normal contractility"  Apical inferior
   MidAnterior2                             sample="Normal contractility"  Mid anterior
   BasalAnterior2                           sample="Normal contractility"  Basal anterior
   BasalInferior2                           sample="Normal contractility"  Basal inferior
*/
