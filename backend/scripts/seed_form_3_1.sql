-- =============================================================================
-- Form 3.1  ТИТЭМ СУДАСНЫ ОНОШИЛГОО ЭМЧИЛГЭЭНИЙ МАЯГТ
-- Source: "MN cardio upgrade.docx", appendix 3.1
-- GENERATED from the document's table structure.
--
-- 166 fields in 13 sections, using 61 option sets.
-- The 19-segment coronary grid is expanded to one status field plus one
-- stenosis-percent field per segment, as the tender specifies.
--
-- Labels and option text are verbatim from the tender. Field codes, types and
-- option coding are derived and NOT approved - clinical sign-off is the
-- customer's step.
--
-- Run seed_optiontypes_3_1.sql FIRST.
-- =============================================================================
SET NOCOUNT ON;
SET XACT_ABORT ON;
DECLARE @db sysname = DB_NAME();
IF @db NOT IN ('MnCardio_restored','MnCardioNew','MnCardio_test')
BEGIN RAISERROR('Refusing to run: unexpected database "%s".',16,1,@db); SET NOEXEC ON; END
GO

DECLARE @Form varchar(20) = '3.1';
BEGIN TRAN;

IF EXISTS (SELECT 1 FROM dbo.TenderForm WHERE FormCode=@Form)
    UPDATE dbo.TenderForm SET NameMn=N'Титэм судасны оношилгоо эмчилгээний маягт',
        GroupCode='angio', GroupLabelMn=N'Зүрх судасны ангио', Position=31, IsActive=1,
        UpdateDate=GETDATE() WHERE FormCode=@Form;
ELSE
    INSERT INTO dbo.TenderForm (FormCode,NameMn,GroupCode,GroupLabelMn,Position)
    VALUES (@Form,N'Титэм судасны оношилгоо эмчилгээний маягт','angio',N'Зүрх судасны ангио',31);

DELETE FROM dbo.TenderFormField WHERE FormCode=@Form;

INSERT INTO dbo.TenderFormField
 (FormCode,FieldCode,LabelMn,FieldType,OptionType,SectionCode,SectionLabel,SectionPos,
  ParentField,ParentValue,IsRequired,IsSearchable,Md,Position,HelpTextMn)
VALUES
(@Form,'CoronaryAngioplastyHistory',N'Coronary angioplasty history','RadioBox','f31_01','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,10,NULL),
(@Form,'CoronaryArteryBypassGraft',N'Coronary artery bypass graft','RadioBox','f31_01','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,20,NULL),
(@Form,'MI',N'MI (myocardial infarction)','RadioBox','f31_01','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,30,NULL),
(@Form,'STROKE',N'STROKE','RadioBox','f31_02','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,40,NULL),
(@Form,'RenalInsufficiency',N'Renal insufficiency','RadioBox','f31_03','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,50,NULL),
(@Form,'ArterialVascularPathology',N'Arterial Vascular pathology (Peripheral vascular disease)','RadioBox','f31_01','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,60,NULL),
(@Form,'CardiacInsufficiency',N'Cardiac insufficiency','RadioBox','f31_01','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,70,NULL),
(@Form,'BleedingHistory',N'Bleeding history','RadioBox','yorn','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,80,NULL),
(@Form,'LVEF',N'LVEF (LV ejection fraction)','RadioBox','f31_04','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,90,NULL),
(@Form,'Diabetes',N'Diabetes','RadioBox','f31_05','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,100,N'RISK FACTORS'),
(@Form,'Hypercholesterolemia',N'Hypercholesterolemia','RadioBox','f31_01','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,110,NULL),
(@Form,'Smoking',N'Smoking','RadioBox','f31_06','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,120,NULL),
(@Form,'Hypertension',N'Hypertension','RadioBox','f31_01','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,130,NULL),
(@Form,'CoronaryHeredity',N'Coronary heredity','RadioBox','f31_01','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,140,NULL),
(@Form,'Toxics',N'Toxics','RadioBox','f31_07','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,150,NULL),
(@Form,'AnginaStatus',N'Angina status','RadioBox','f31_08','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,160,N'CLINICAL STATUS'),
(@Form,'ACSDelay',N'ACS delay','RadioBox','f31_09','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,170,NULL),
(@Form,'IschemiaDocumentedIfStable',N'Ischemia documented if stable (excluding ACS)','RadioBox','f31_10','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,180,NULL),
(@Form,'DiagnosisECGRhythm',N'Diagnosis ECG, rhythm','RadioBox','f31_11','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,190,N'MAKE IT AS SIMPLE AS POSSIBLE, LIKE ST+/-'),
(@Form,'IfAbnormal',N'If Abnormal :','RadioBox','f31_12','s1',N'PAST MEDICAL HISTORY',1,'DiagnosisECGRhythm','y',0,0,12,200,NULL),
(@Form,'HeartRate',N'Heart rate','Number',NULL,'s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,210,NULL),
(@Form,'Killip',N'Killip','RadioBox','f31_13','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,220,NULL),
(@Form,'AmbulatoryExamination',N'Ambulatory examination','RadioBox','yorn','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,230,N'CORONARY ANGIOGRAPHY'),
(@Form,'CharacterOfExamination',N'Character of examination','RadioBox','f31_14','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,240,NULL),
(@Form,'MainArterialAccess',N'Main arterial access','RadioBox','f31_15','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,250,NULL),
(@Form,'IntroducerSize',N'Introducer size','RadioBox','f31_16','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,260,NULL),
(@Form,'AnatomyAnomalyDominancyAsuuBatzaya',N'Anatomy/ Anomaly Dominancy asuu Batzaya','RadioBox','yorn','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,270,NULL),
(@Form,'ArterialClosure',N'Arterial closure','RadioBox','f31_17','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,280,NULL),
(@Form,'Ventriculography',N'Ventriculography','RadioBox','f31_01','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,290,NULL),
(@Form,'IfVentriculographyLVEF',N'if ventriculography LVEF ?','Number',NULL,'s1',N'PAST MEDICAL HISTORY',1,'Ventriculography','y',0,0,12,300,NULL),
(@Form,'LM50YN',N'LM (left main) > 50% Y / N','RadioBox','yorn','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,310,NULL),
(@Form,'Bypass50YN',N'Bypass > 50% Y / N','RadioBox','yorn','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,320,NULL),
(@Form,'Bifurcation',N'Bifurcation','RadioBox','yorn','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,330,NULL),
(@Form,'ResultConclusion',N'result conclusion','RadioBox','f31_18','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,340,NULL),
(@Form,'SegLMCA',N'LMCA - байдал','RadioBox','f31_19','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,350,NULL),
(@Form,'SegLMCAPercent',N'LMCA - нарийсал (%)','Number',NULL,'s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,360,NULL),
(@Form,'SegLAD1',N'LAD 1 - байдал','RadioBox','f31_19','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,370,NULL),
(@Form,'SegLAD1Percent',N'LAD 1 - нарийсал (%)','Number',NULL,'s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,380,NULL),
(@Form,'SegLAD2',N'LAD 2 - байдал','RadioBox','f31_19','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,390,NULL),
(@Form,'SegLAD2Percent',N'LAD 2 - нарийсал (%)','Number',NULL,'s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,400,NULL),
(@Form,'SegLAD3',N'LAD 3 - байдал','RadioBox','f31_19','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,410,NULL),
(@Form,'SegLAD3Percent',N'LAD 3 - нарийсал (%)','Number',NULL,'s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,420,NULL),
(@Form,'SegDg1',N'Dg 1 - байдал','RadioBox','f31_19','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,430,NULL),
(@Form,'SegDg1Percent',N'Dg 1 - нарийсал (%)','Number',NULL,'s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,440,NULL),
(@Form,'SegDg2',N'Dg 2 - байдал','RadioBox','f31_19','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,450,NULL),
(@Form,'SegDg2Percent',N'Dg 2 - нарийсал (%)','Number',NULL,'s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,460,NULL),
(@Form,'SegLCx1',N'LCx 1 - байдал','RadioBox','f31_19','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,470,NULL),
(@Form,'SegLCx1Percent',N'LCx 1 - нарийсал (%)','Number',NULL,'s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,480,NULL),
(@Form,'SegLCx2',N'LCx 2 - байдал','RadioBox','f31_19','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,490,NULL),
(@Form,'SegLCx2Percent',N'LCx 2 - нарийсал (%)','Number',NULL,'s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,500,NULL),
(@Form,'SegLCx3',N'LCx 3 - байдал','RadioBox','f31_19','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,510,NULL),
(@Form,'SegLCx3Percent',N'LCx 3 - нарийсал (%)','Number',NULL,'s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,520,NULL),
(@Form,'SegOM1',N'OM 1 - байдал','RadioBox','f31_19','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,530,NULL),
(@Form,'SegOM1Percent',N'OM 1 - нарийсал (%)','Number',NULL,'s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,540,NULL),
(@Form,'SegOM2',N'OM 2 - байдал','RadioBox','f31_19','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,550,NULL),
(@Form,'SegOM2Percent',N'OM 2 - нарийсал (%)','Number',NULL,'s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,560,NULL),
(@Form,'SegRamus',N'Ramus - байдал','RadioBox','f31_19','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,570,NULL),
(@Form,'SegRamusPercent',N'Ramus - нарийсал (%)','Number',NULL,'s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,580,NULL),
(@Form,'SegRCA1',N'RCA 1 - байдал','RadioBox','f31_19','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,590,NULL),
(@Form,'SegRCA1Percent',N'RCA 1 - нарийсал (%)','Number',NULL,'s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,600,NULL),
(@Form,'SegRCA2',N'RCA 2 - байдал','RadioBox','f31_19','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,610,NULL),
(@Form,'SegRCA2Percent',N'RCA 2 - нарийсал (%)','Number',NULL,'s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,620,NULL),
(@Form,'SegRCA3',N'RCA 3 - байдал','RadioBox','f31_19','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,630,NULL),
(@Form,'SegRCA3Percent',N'RCA 3 - нарийсал (%)','Number',NULL,'s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,640,NULL),
(@Form,'SegPDA',N'PDA - байдал','RadioBox','f31_19','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,650,NULL),
(@Form,'SegPDAPercent',N'PDA - нарийсал (%)','Number',NULL,'s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,660,NULL),
(@Form,'SegRVP',N'RVP - байдал','RadioBox','f31_19','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,670,NULL),
(@Form,'SegRVPPercent',N'RVP - нарийсал (%)','Number',NULL,'s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,680,NULL),
(@Form,'SegSaphenousBridge',N'Saphenous bridge - байдал','RadioBox','f31_19','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,690,NULL),
(@Form,'SegSaphenousBridgePercent',N'Saphenous bridge - нарийсал (%)','Number',NULL,'s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,700,NULL),
(@Form,'SegMammaryBridge',N'Mammary bridge - байдал','RadioBox','f31_19','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,710,NULL),
(@Form,'SegMammaryBridgePercent',N'Mammary bridge - нарийсал (%)','Number',NULL,'s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,720,NULL),
(@Form,'CoronaryAngiogramPicture',N'Coronary angiogram picture','RadioBox','f31_20','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,730,N'ASK IT POSSIBILITY OF DEVELOPMENT PICTURE AND TEXT CODING FOR STENOSIS SEVERITY ЗУРАГ ХЭЛБЭРЭЭР ОРДОГ БОЛТОЛ ТЕКСТЭЭР КОДЛОХ:'),
(@Form,'PerProcedureComplicationsYesNoIfYesWhichComplication',N'Per procedure complications : yes/no : if Yes, which complication ?','RadioBox','f31_21','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,740,NULL),
(@Form,'ProposedTreatment',N'Proposed treatment(s)','RadioBox','f31_22','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,750,NULL),
(@Form,'DecisionForCAG',N'Decision for CAG:','RadioBox','f31_23','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,760,NULL),
(@Form,'LesionTreatmentLocation',N'Lesion treatment location','RadioBox','f31_24','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,770,N'PTCA (CORONARY ANGIOPLASTY SESSION)'),
(@Form,'TypeOfLesion',N'Type of lesion','RadioBox','f31_25','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,780,NULL),
(@Form,'ComplexLesion',N'Complex lesion','RadioBox','yorn','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,790,NULL),
(@Form,'IfYESComplexLesion',N'If YES : Complex lesion','RadioBox','f31_26','s1',N'PAST MEDICAL HISTORY',1,'ComplexLesion','y',0,0,12,800,NULL),
(@Form,'Stenosis',N'% stenosis','RadioBox','f31_27','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,810,NULL),
(@Form,'IfOccludedAgeOfOcclusion',N'If occluded: Age of occlusion','RadioBox','f31_28','s1',N'PAST MEDICAL HISTORY',1,'Stenosis','y',0,0,12,820,NULL),
(@Form,'IntracoronaryImagingPerformed',N'Intracoronary imaging performed','RadioBox','yorn','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,830,N'LESION BUR DEER STENTIIN TUHAI ASUULT GARCH IREED? STENT BUR DEER STENTIIN DELGERENGUI GARCH IRDEG BAIH ESTOI'),
(@Form,'IfYES',N'If YES','RadioBox','f31_29','s1',N'PAST MEDICAL HISTORY',1,'IntracoronaryImagingPerformed','y',0,0,12,840,NULL),
(@Form,'FFR',N'FFR (fractional flow reserve)','RadioBox','yorn','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,850,NULL),
(@Form,'IFRPerformed',N'iFR performed :','RadioBox','yorn','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,860,NULL),
(@Form,'InitialTIMI',N'Initial TIMI, (if occlusion)','RadioBox','f31_30','s1',N'PAST MEDICAL HISTORY',1,NULL,NULL,0,0,12,870,NULL),
(@Form,'TypeOf',N'Type of','RadioBox','f31_31','s2',N'Specific to each dilated lesion (if angioplasty)',2,NULL,NULL,0,0,12,880,NULL),
(@Form,'Thromboaspiration',N'Thromboaspiration','RadioBox','f31_32','s2',N'Specific to each dilated lesion (if angioplasty)',2,NULL,NULL,0,0,12,890,NULL),
(@Form,'BalloonAlone',N'Balloon alone','RadioBox','f31_32','s2',N'Specific to each dilated lesion (if angioplasty)',2,NULL,NULL,0,0,12,900,NULL),
(@Form,'DrugElutingStent',N'Drug eluting stent','RadioBox','f31_32','s2',N'Specific to each dilated lesion (if angioplasty)',2,NULL,NULL,0,0,12,910,NULL),
(@Form,'DrugCoatedBalloonOnly',N'Drug coated balloon only','RadioBox','f31_32','s2',N'Specific to each dilated lesion (if angioplasty)',2,NULL,NULL,0,0,12,920,NULL),
(@Form,'Rotablator',N'Rotablator','RadioBox','f31_32','s2',N'Specific to each dilated lesion (if angioplasty)',2,NULL,NULL,0,0,12,930,NULL),
(@Form,'TIMIFinal',N'TIMI final','RadioBox','f31_33','s2',N'Specific to each dilated lesion (if angioplasty)',2,NULL,NULL,0,0,12,940,NULL),
(@Form,'AngioplastyResult',N'Angioplasty result','RadioBox','f31_34','s2',N'Specific to each dilated lesion (if angioplasty)',2,NULL,NULL,0,0,12,950,NULL),
(@Form,'StentManufacturerAndName',N'Stent manufacturer and name','RadioBox','f31_35','s3',N'for each stent',3,NULL,NULL,0,0,12,960,NULL),
(@Form,'ReferenceNumber',N'Reference number','Text',NULL,'s3',N'for each stent',3,NULL,NULL,0,0,12,970,NULL),
(@Form,'LesionTreatmentLocation2',N'Lesion treatment location','RadioBox','f31_24','s3',N'for each stent',3,NULL,NULL,0,0,12,980,NULL),
(@Form,'StentDiameterPerLesion',N'Stent diameter per lesion','Number',NULL,'s3',N'for each stent',3,NULL,NULL,0,0,12,990,NULL),
(@Form,'StentLengthPerLesion',N'Stent length per lesion','Number',NULL,'s3',N'for each stent',3,NULL,NULL,0,0,12,1000,NULL),
(@Form,'StentNumber',N'stent number','Number',NULL,'s3',N'for each stent',3,NULL,NULL,0,0,12,1010,NULL),
(@Form,'ContrastType',N'Contrast type','RadioBox','f31_36','s5',N'contrast / dosimetry',5,NULL,NULL,0,0,12,1020,NULL),
(@Form,'ContrastQuantity',N'Contrast Quantity','Number',NULL,'s5',N'contrast / dosimetry',5,NULL,NULL,0,0,12,1030,NULL),
(@Form,'ScopyTime',N'Scopy time','Number',NULL,'s5',N'contrast / dosimetry',5,NULL,NULL,0,0,12,1040,NULL),
(@Form,'PDS',N'PDS','Text',NULL,'s5',N'contrast / dosimetry',5,NULL,NULL,0,0,12,1050,NULL),
(@Form,'CumulativeKermaAir',N'Cumulative Kerma air','Text',NULL,'s5',N'contrast / dosimetry',5,NULL,NULL,0,0,12,1060,NULL),
(@Form,'AspirinDuringProcedurePreProcedural',N'Aspirin during procedure/pre-procedural (peri-procedural)','RadioBox','f31_01','s6',N'Treatments (if ATL or ST+)',6,NULL,NULL,0,0,12,1070,NULL),
(@Form,'AAPOtherThanAspirinDuringProcedure',N'AAP (antiplatelet agent) other than aspirin during procedure (peri-procedural)','RadioBox','f31_37','s6',N'Treatments (if ATL or ST+)',6,NULL,NULL,0,0,12,1080,NULL),
(@Form,'IVAnticoagulantDuringProcedure',N'IV anticoagulant during procedure','RadioBox','f31_38','s6',N'Treatments (if ATL or ST+)',6,NULL,NULL,0,0,12,1090,NULL),
(@Form,'DateOfDischargeFromHospital',N'Date of discharge from hospital','Number',NULL,'s6',N'Treatments (if ATL or ST+)',6,NULL,NULL,0,0,12,1100,N'In hospital follow-up : has to be performed by a research clinical assistant at the hospitalization discharge'),
(@Form,'DischargeMode',N'Discharge mode','RadioBox','f31_39','s6',N'Treatments (if ATL or ST+)',6,NULL,NULL,0,0,12,1110,NULL),
(@Form,'DeathHospital',N'Death Hospital','RadioBox','yorn','s6',N'Treatments (if ATL or ST+)',6,NULL,NULL,0,0,12,1120,NULL),
(@Form,'CompleteRevascularizationAtHospitalDischarge',N'Complete revascularization at hospital discharge ?','RadioBox','f31_01','s6',N'Treatments (if ATL or ST+)',6,NULL,NULL,0,0,12,1130,NULL),
(@Form,'Aspirin',N'Aspirin','RadioBox','f31_40','s7',N'Treatment at discharge',7,NULL,NULL,0,0,12,1140,N'In-hospital complications : Y/ N : if yes which complication ?'),
(@Form,'AntiplateletOtherThanAspirin',N'Antiplatelet other than aspirin','RadioBox','f31_41','s7',N'Treatment at discharge',7,NULL,NULL,0,0,12,1150,NULL),
(@Form,'OralAnticoagulant',N'Oral anticoagulant','RadioBox','f31_42','s7',N'Treatment at discharge',7,NULL,NULL,0,0,12,1160,NULL),
(@Form,'ACEIOrARB',N'ACEI or ARB','RadioBox','f31_40','s7',N'Treatment at discharge',7,NULL,NULL,0,0,12,1170,NULL),
(@Form,'BB',N'BB','RadioBox','f31_40','s7',N'Treatment at discharge',7,NULL,NULL,0,0,12,1180,NULL),
(@Form,'Statins',N'Statins','RadioBox','f31_40','s7',N'Treatment at discharge',7,NULL,NULL,0,0,12,1190,NULL),
(@Form,'IfYesEzetimibe',N'If yes, Ezetimibe :','RadioBox','f31_40','s7',N'Treatment at discharge',7,'Statins','y',0,0,12,1200,NULL),
(@Form,'Death1Year',N'Death 1 year','RadioBox','yorn','s8',N'Complications 1 year',8,NULL,NULL,0,0,12,1210,N'FOLLOW-UP 1 YEAR'),
(@Form,'AMIRecurrent',N'AMI recurrent','RadioBox','f31_43','s8',N'Complications 1 year',8,NULL,NULL,0,0,12,1220,NULL),
(@Form,'IfYesDate',N'If yes date :','Number',NULL,'s8',N'Complications 1 year',8,'AMIRecurrent','y',0,0,12,1230,NULL),
(@Form,'AnyBleeding',N'Any bleeding :','RadioBox','f31_44','s8',N'Complications 1 year',8,NULL,NULL,0,0,12,1240,NULL),
(@Form,'SevereHemorrhage',N'Severe hemorrhage (BARC > or = 3)','RadioBox','f31_45','s8',N'Complications 1 year',8,NULL,NULL,0,0,12,1250,NULL),
(@Form,'IfYesDate2',N'If yes date :','Number',NULL,'s8',N'Complications 1 year',8,'SevereHemorrhage','y',0,0,12,1260,NULL),
(@Form,'Aspirin2',N'Aspirin','RadioBox','f31_46','s9',N'Anticoagulant treatments 1 year',9,NULL,NULL,0,0,12,1270,NULL),
(@Form,'AntiplateletOtherThanAspirin2',N'Antiplatelet other than aspirin','RadioBox','f31_47','s9',N'Anticoagulant treatments 1 year',9,NULL,NULL,0,0,12,1280,NULL),
(@Form,'DurationOfDualTherapy',N'Duration of dual therapy','RadioBox','f31_48','s9',N'Anticoagulant treatments 1 year',9,NULL,NULL,0,0,12,1290,NULL),
(@Form,'OralAnticoagulant2',N'Oral Anticoagulant','RadioBox','f31_49','s9',N'Anticoagulant treatments 1 year',9,NULL,NULL,0,0,12,1300,NULL),
(@Form,'LipidLoweringTreatment',N'Lipid-lowering treatment','RadioBox','f31_40','s10',N'Lipid-lowering treatments 1 year',10,NULL,NULL,0,0,12,1310,NULL),
(@Form,'IfYesStatins',N'If yes, Statins :','RadioBox','f31_40','s10',N'Lipid-lowering treatments 1 year',10,'LipidLoweringTreatment','y',0,0,12,1320,NULL),
(@Form,'IfYesMolecule',N'If yes, molecule :','RadioBox','f31_50','s10',N'Lipid-lowering treatments 1 year',10,'IfYesStatins','y',0,0,12,1330,NULL),
(@Form,'IfYesDosage',N'If yes, dosage (in mg) :','Text',NULL,'s10',N'Lipid-lowering treatments 1 year',10,'IfYesMolecule','y',0,0,12,1340,N'10 / 20 / 40 / 80'),
(@Form,'IfYesEzetimibe2',N'If yes, Ezetimibe :','RadioBox','f31_40','s10',N'Lipid-lowering treatments 1 year',10,'IfYesDosage','y',0,0,12,1350,NULL),
(@Form,'DatePainBegining',N'Date Pain begining','RadioBox','f31_51','s10',N'Lipid-lowering treatments 1 year',10,NULL,NULL,0,0,12,1360,N'Additional data for register ST + Хэрэв INDICATION Хэсэгт (1) ACS: Persistent ST+, <24h; (2) ACS: Late-onset ST+, >24h нар хариултууд сонгогдсон бол автоматаар, нэмэлтээр гарч ирэх!!! PRESUMED ONSET OF PAIN'),
(@Form,'PainBeginingTime',N'Pain begining time','Text',NULL,'s10',N'Lipid-lowering treatments 1 year',10,NULL,NULL,0,0,12,1370,NULL),
(@Form,'AdmissionType',N'Admission type:','RadioBox','f31_52','s10',N'Lipid-lowering treatments 1 year',10,NULL,NULL,0,0,12,1380,N'PATIENT CALL'),
(@Form,'Call103',N'call 103 (by patient or relative)','RadioBox','f31_53','s10',N'Lipid-lowering treatments 1 year',10,NULL,NULL,0,0,12,1390,NULL),
(@Form,'IfYesCallDate',N'if yes Call date','RadioBox','f31_51','s10',N'Lipid-lowering treatments 1 year',10,'Call103','y',0,0,12,1400,NULL),
(@Form,'IfYesCallTime',N'if yes Call time','Text',NULL,'s10',N'Lipid-lowering treatments 1 year',10,'IfYesCallDate','y',0,0,12,1410,NULL),
(@Form,'DateOfFMCFirstMedicalContact',N'Date of FMC first medical contact','RadioBox','f31_51','s10',N'Lipid-lowering treatments 1 year',10,NULL,NULL,0,0,12,1420,NULL),
(@Form,'TimeOfFMC',N'Time of FMC','Text',NULL,'s10',N'Lipid-lowering treatments 1 year',10,NULL,NULL,0,0,12,1430,NULL),
(@Form,'Date1stQualifyingECG',N'Date 1st qualifying ECG','RadioBox','f31_51','s10',N'Lipid-lowering treatments 1 year',10,NULL,NULL,0,0,12,1440,NULL),
(@Form,'Time1stQualifyingECG',N'Time 1st qualifying ECG','Text',NULL,'s10',N'Lipid-lowering treatments 1 year',10,NULL,NULL,0,0,12,1450,NULL),
(@Form,'F1stMedicalPractitioner',N'1st medical practitioner','RadioBox','f31_54','s10',N'Lipid-lowering treatments 1 year',10,NULL,NULL,0,0,12,1460,NULL),
(@Form,'F1stHospital',N'1st Hospital','RadioBox','f31_55','s10',N'Lipid-lowering treatments 1 year',10,NULL,NULL,0,0,12,1470,NULL),
(@Form,'F2ndMedicalPractitioner',N'2nd medical practitioner','RadioBox','f31_54','s10',N'Lipid-lowering treatments 1 year',10,NULL,NULL,0,0,12,1480,NULL),
(@Form,'F3rdMedicalPractitioner',N'3rd medical practitioner','RadioBox','f31_54','s10',N'Lipid-lowering treatments 1 year',10,NULL,NULL,0,0,12,1490,NULL),
(@Form,'F4thMedicalPractitioner',N'4th medical practitioner','RadioBox','f31_54','s10',N'Lipid-lowering treatments 1 year',10,NULL,NULL,0,0,12,1500,NULL),
(@Form,'F5thMedicalPractitioner',N'5th medical practitioner','RadioBox','f31_54','s10',N'Lipid-lowering treatments 1 year',10,NULL,NULL,0,0,12,1510,NULL),
(@Form,'INFARCTSITE',N'INFARCT SITE','RadioBox','f31_56','s11',N'Clinic ST +',11,NULL,NULL,0,0,12,1520,NULL),
(@Form,'Fibrinolysis',N'Fibrinolysis','RadioBox','yorn','s12',N'Revascularization',12,NULL,NULL,0,0,12,1530,NULL),
(@Form,'IfYesDateFibrinolysis',N'if yes Date Fibrinolysis','RadioBox','f31_51','s12',N'Revascularization',12,'Fibrinolysis','y',0,0,12,1540,NULL),
(@Form,'IfYesTimeOfFibrinolysis',N'if yes Time of Fibrinolysis (door to needle time)','Text',NULL,'s12',N'Revascularization',12,'IfYesDateFibrinolysis','y',0,0,12,1550,NULL),
(@Form,'IfNoReasons',N'if no, reasons','RadioBox','f31_57','s12',N'Revascularization',12,'IfYesTimeOfFibrinolysis','y',0,0,12,1560,NULL),
(@Form,'DateOfAdmissionTo',N'Date of admission to','RadioBox','f31_51','s12',N'Revascularization',12,NULL,NULL,0,0,12,1570,NULL),
(@Form,'TimeOfAdmissionTo',N'Time of admission to','Text',NULL,'s12',N'Revascularization',12,NULL,NULL,0,0,12,1580,NULL),
(@Form,'IfNoPCICauses',N'if no PCI, causes','RadioBox','f31_58','s12',N'Revascularization',12,'TimeOfAdmissionTo','y',0,0,12,1590,NULL),
(@Form,'DateOfPrimaryPCI',N'Date of Primary PCI','RadioBox','f31_51','s12',N'Revascularization',12,NULL,NULL,0,0,12,1600,NULL),
(@Form,'TimeOfPrimaryPCIStart',N'Time of Primary PCI start:','Text',NULL,'s12',N'Revascularization',12,NULL,NULL,0,0,12,1610,NULL),
(@Form,'PainECG',N'Pain- ECG','Text',NULL,'s13',N'Deadlines',13,NULL,NULL,0,0,12,1620,NULL),
(@Form,'ECGWireTime',N'ECG- wire time','Text',NULL,'s13',N'Deadlines',13,NULL,NULL,0,0,12,1630,NULL),
(@Form,'ECGTIV',N'ECG- TIV','Text',NULL,'s13',N'Deadlines',13,NULL,NULL,0,0,12,1640,NULL),
(@Form,'SAVE',N'SAVE','RadioBox','f31_59','s13',N'Deadlines',13,NULL,NULL,0,0,12,1650,NULL),
(@Form,'COMPLETEANDSAVE',N'COMPLETE AND SAVE ? (PCI хийсэн эмч шалгаад төгсгөх)','RadioBox','f31_60','s13',N'Deadlines',13,NULL,NULL,0,0,12,1660,NULL);

COMMIT;
GO
SET NOEXEC OFF;
GO
SELECT '3.1' AS FormCode, COUNT(*) AS Fields FROM dbo.TenderFormField WHERE FormCode='3.1';
GO
