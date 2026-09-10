-- GENERATED. Option lists for form 3.1, derived from the tender's own option
-- cells. Values are the option text itself so nothing is invented; the clinical
-- team may want shorter codes, which is a dictionary edit, not a code change.
SET NOCOUNT ON;
DECLARE @db sysname = DB_NAME();
IF @db NOT IN ('MnCardio_restored','MnCardioNew','MnCardio_test')
BEGIN RAISERROR('Refusing to run: unexpected database "%s".',16,1,@db); SET NOEXEC ON; END
GO

DELETE FROM dbo.OptionTypes WHERE dico LIKE 'f31[_]%';
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f31_01')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f31_01', N'Form 3.1 option set f31_01', N'GENERATED from tender appendix 3.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f31_02')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f31_02', N'Form 3.1 option set f31_02', N'GENERATED from tender appendix 3.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f31_03')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f31_03', N'Form 3.1 option set f31_03', N'GENERATED from tender appendix 3.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f31_04')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f31_04', N'Form 3.1 option set f31_04', N'GENERATED from tender appendix 3.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f31_05')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f31_05', N'Form 3.1 option set f31_05', N'GENERATED from tender appendix 3.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f31_06')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f31_06', N'Form 3.1 option set f31_06', N'GENERATED from tender appendix 3.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f31_07')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f31_07', N'Form 3.1 option set f31_07', N'GENERATED from tender appendix 3.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f31_08')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f31_08', N'Form 3.1 option set f31_08', N'GENERATED from tender appendix 3.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f31_09')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f31_09', N'Form 3.1 option set f31_09', N'GENERATED from tender appendix 3.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f31_10')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f31_10', N'Form 3.1 option set f31_10', N'GENERATED from tender appendix 3.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f31_11')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f31_11', N'Form 3.1 option set f31_11', N'GENERATED from tender appendix 3.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f31_12')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f31_12', N'Form 3.1 option set f31_12', N'GENERATED from tender appendix 3.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f31_13')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f31_13', N'Form 3.1 option set f31_13', N'GENERATED from tender appendix 3.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f31_14')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f31_14', N'Form 3.1 option set f31_14', N'GENERATED from tender appendix 3.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f31_15')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f31_15', N'Form 3.1 option set f31_15', N'GENERATED from tender appendix 3.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f31_16')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f31_16', N'Form 3.1 option set f31_16', N'GENERATED from tender appendix 3.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f31_17')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f31_17', N'Form 3.1 option set f31_17', N'GENERATED from tender appendix 3.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f31_18')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f31_18', N'Form 3.1 option set f31_18', N'GENERATED from tender appendix 3.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f31_19')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f31_19', N'Form 3.1 option set f31_19', N'GENERATED from tender appendix 3.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f31_20')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f31_20', N'Form 3.1 option set f31_20', N'GENERATED from tender appendix 3.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f31_21')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f31_21', N'Form 3.1 option set f31_21', N'GENERATED from tender appendix 3.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f31_22')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f31_22', N'Form 3.1 option set f31_22', N'GENERATED from tender appendix 3.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f31_23')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f31_23', N'Form 3.1 option set f31_23', N'GENERATED from tender appendix 3.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f31_24')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f31_24', N'Form 3.1 option set f31_24', N'GENERATED from tender appendix 3.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f31_25')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f31_25', N'Form 3.1 option set f31_25', N'GENERATED from tender appendix 3.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f31_26')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f31_26', N'Form 3.1 option set f31_26', N'GENERATED from tender appendix 3.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f31_27')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f31_27', N'Form 3.1 option set f31_27', N'GENERATED from tender appendix 3.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f31_28')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f31_28', N'Form 3.1 option set f31_28', N'GENERATED from tender appendix 3.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f31_29')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f31_29', N'Form 3.1 option set f31_29', N'GENERATED from tender appendix 3.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f31_30')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f31_30', N'Form 3.1 option set f31_30', N'GENERATED from tender appendix 3.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f31_31')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f31_31', N'Form 3.1 option set f31_31', N'GENERATED from tender appendix 3.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f31_32')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f31_32', N'Form 3.1 option set f31_32', N'GENERATED from tender appendix 3.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f31_33')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f31_33', N'Form 3.1 option set f31_33', N'GENERATED from tender appendix 3.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f31_34')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f31_34', N'Form 3.1 option set f31_34', N'GENERATED from tender appendix 3.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f31_35')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f31_35', N'Form 3.1 option set f31_35', N'GENERATED from tender appendix 3.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f31_36')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f31_36', N'Form 3.1 option set f31_36', N'GENERATED from tender appendix 3.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f31_37')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f31_37', N'Form 3.1 option set f31_37', N'GENERATED from tender appendix 3.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f31_38')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f31_38', N'Form 3.1 option set f31_38', N'GENERATED from tender appendix 3.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f31_39')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f31_39', N'Form 3.1 option set f31_39', N'GENERATED from tender appendix 3.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f31_40')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f31_40', N'Form 3.1 option set f31_40', N'GENERATED from tender appendix 3.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f31_41')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f31_41', N'Form 3.1 option set f31_41', N'GENERATED from tender appendix 3.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f31_42')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f31_42', N'Form 3.1 option set f31_42', N'GENERATED from tender appendix 3.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f31_43')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f31_43', N'Form 3.1 option set f31_43', N'GENERATED from tender appendix 3.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f31_44')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f31_44', N'Form 3.1 option set f31_44', N'GENERATED from tender appendix 3.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f31_45')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f31_45', N'Form 3.1 option set f31_45', N'GENERATED from tender appendix 3.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f31_46')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f31_46', N'Form 3.1 option set f31_46', N'GENERATED from tender appendix 3.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f31_47')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f31_47', N'Form 3.1 option set f31_47', N'GENERATED from tender appendix 3.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f31_48')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f31_48', N'Form 3.1 option set f31_48', N'GENERATED from tender appendix 3.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f31_49')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f31_49', N'Form 3.1 option set f31_49', N'GENERATED from tender appendix 3.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f31_50')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f31_50', N'Form 3.1 option set f31_50', N'GENERATED from tender appendix 3.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f31_51')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f31_51', N'Form 3.1 option set f31_51', N'GENERATED from tender appendix 3.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f31_52')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f31_52', N'Form 3.1 option set f31_52', N'GENERATED from tender appendix 3.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f31_53')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f31_53', N'Form 3.1 option set f31_53', N'GENERATED from tender appendix 3.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f31_54')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f31_54', N'Form 3.1 option set f31_54', N'GENERATED from tender appendix 3.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f31_55')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f31_55', N'Form 3.1 option set f31_55', N'GENERATED from tender appendix 3.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f31_56')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f31_56', N'Form 3.1 option set f31_56', N'GENERATED from tender appendix 3.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f31_57')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f31_57', N'Form 3.1 option set f31_57', N'GENERATED from tender appendix 3.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f31_58')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f31_58', N'Form 3.1 option set f31_58', N'GENERATED from tender appendix 3.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f31_59')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f31_59', N'Form 3.1 option set f31_59', N'GENERATED from tender appendix 3.1');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f31_60')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f31_60', N'Form 3.1 option set f31_60', N'GENERATED from tender appendix 3.1');

INSERT INTO dbo.OptionTypes (dico, label, value, pos, translate_flag)
VALUES
('f31_01', N'Y', N'o1', 1, 0),
('f31_01', N'N', N'o2', 2, 0),
('f31_01', N'?', N'o3', 3, 0),
('f31_02', N'?', N'o1', 1, 0),
('f31_02', N'No stroke', N'o2', 2, 0),
('f31_02', N'Unspecified stroke', N'o3', 3, 0),
('f31_02', N'Hemorrhagic stroke', N'o4', 4, 0),
('f31_02', N'Ischemic stroke', N'o5', 5, 0),
('f31_02', N'TIA', N'o6', 6, 0),
('f31_03', N'None or mild', N'o1', 1, 0),
('f31_03', N'Moderate renal insufficiency GFR <60', N'o2', 2, 0),
('f31_03', N'Severe renal insufficiency GFR <30', N'o3', 3, 0),
('f31_03', N'Dialysis', N'o4', 4, 0),
('f31_03', N'?', N'o5', 5, 0),
('f31_04', N'50%', N'o1', 1, 0),
('f31_04', N'41-50%', N'o2', 2, 0),
('f31_04', N'30-40%', N'o3', 3, 0),
('f31_04', N'< 30%', N'o4', 4, 0),
('f31_04', N'Unknown', N'o5', 5, 0),
('f31_05', N'Non-diabetic', N'o1', 1, 0),
('f31_05', N'insulin-dependent diabetes', N'o2', 2, 0),
('f31_05', N'non insulin-dependent diabetes', N'o3', 3, 0),
('f31_05', N'Prediabetes', N'o4', 4, 0),
('f31_05', N'?', N'o5', 5, 0),
('f31_06', N'Non-smoker', N'o1', 1, 0),
('f31_06', N'current smoker', N'o2', 2, 0),
('f31_06', N'former smoker', N'o3', 3, 0),
('f31_06', N'Smoking ?', N'o4', 4, 0),
('f31_07', N'No', N'o1', 1, 0),
('f31_07', N'Cannabis (THC)', N'o2', 2, 0),
('f31_07', N'Cocaine', N'o3', 3, 0),
('f31_07', N'other', N'o4', 4, 0),
('f31_07', N'?', N'o5', 5, 0),
('f31_08', N'asymptomatic', N'o1', 1, 0),
('f31_08', N'stable angina', N'o2', 2, 0),
('f31_08', N'ACS ST-', N'o3', 3, 0),
('f31_08', N'ACS ST +', N'o4', 4, 0),
('f31_08', N'?', N'o5', 5, 0),
('f31_09', N'No ACS', N'o1', 1, 0),
('f31_09', N'ACS < 24h (emergency)', N'o2', 2, 0),
('f31_09', N'ACS > 24h', N'o3', 3, 0),
('f31_09', N'ACS unknown?', N'o4', 4, 0),
('f31_10', N'Abnormal resting ECG represents ischemia', N'o1', 1, 0),
('f31_10', N'Scinti +', N'o2', 2, 0),
('f31_10', N'stress test +', N'o3', 3, 0),
('f31_10', N'stress echo +', N'o4', 4, 0),
('f31_10', N'enzyme elevation', N'o5', 5, 0),
('f31_10', N'CT +, If YES: CALCIUM SCORE ___', N'o6', 6, 0),
('f31_10', N'MRI +', N'o7', 7, 0),
('f31_10', N'Echo (HYPOKINESIA/AKINESIA) +', N'o8', 8, 0),
('f31_10', N'Holter +', N'o9', 9, 0),
('f31_11', N'Normal', N'o1', 1, 0),
('f31_11', N'Abnormal', N'o2', 2, 0),
('f31_12', N'sinus rhythm', N'o1', 1, 0),
('f31_12', N'atrial fibrillation or atrial flutter', N'o2', 2, 0),
('f31_12', N'ventricular tachycardia', N'o3', 3, 0),
('f31_12', N'other', N'o4', 4, 0),
('f31_12', N'unknown', N'o5', 5, 0),
('f31_13', N'I (normal HD)', N'o1', 1, 0),
('f31_13', N'II (sub acute pulmonary edema)', N'o2', 2, 0),
('f31_13', N'III (acute pulmonary edema)', N'o3', 3, 0),
('f31_13', N'IV (Shock)', N'o4', 4, 0),
('f31_14', N'scheduled', N'o1', 1, 0),
('f31_14', N'urgent', N'o2', 2, 0),
('f31_15', N'Radial L', N'o1', 1, 0),
('f31_15', N'Radial R', N'o2', 2, 0),
('f31_15', N'Distal radial R', N'o3', 3, 0),
('f31_15', N'Distal radial L', N'o4', 4, 0),
('f31_15', N'Femoral L', N'o5', 5, 0),
('f31_15', N'Femoral R', N'o6', 6, 0),
('f31_15', N'Humeral L', N'o7', 7, 0),
('f31_15', N'Humeral R', N'o8', 8, 0),
('f31_15', N'Ulnar L or', N'o9', 9, 0),
('f31_15', N'Ulnar R', N'o10', 10, 0),
('f31_15', N'Other', N'o11', 11, 0),
('f31_15', N'?', N'o12', 12, 0),
('f31_16', N'4', N'o1', 1, 0),
('f31_16', N'5', N'o2', 2, 0),
('f31_16', N'6', N'o3', 3, 0),
('f31_16', N'7', N'o4', 4, 0),
('f31_16', N'8 French', N'o5', 5, 0),
('f31_16', N'Other', N'o6', 6, 0),
('f31_17', N'Manual compression and band', N'o1', 1, 0),
('f31_17', N'Angioseal', N'o2', 2, 0),
('f31_17', N'Vasoseal', N'o3', 3, 0),
('f31_17', N'Exoseal', N'o4', 4, 0),
('f31_17', N'Perclose', N'o5', 5, 0),
('f31_17', N'Starclose', N'o6', 6, 0),
('f31_17', N'Prostar', N'o7', 7, 0),
('f31_17', N'Femoseal', N'o8', 8, 0),
('f31_17', N'Duett', N'o9', 9, 0),
('f31_17', N'Proglide', N'o10', 10, 0),
('f31_17', N'other', N'o11', 11, 0),
('f31_18', N'Coro normal', N'o1', 1, 0),
('f31_18', N'lesion <50%', N'o2', 2, 0),
('f31_18', N'1 vessel', N'o3', 3, 0),
('f31_18', N'2 vessel', N'o4', 4, 0),
('f31_18', N'3 vessel', N'o5', 5, 0),
('f31_18', N'isolated LMCA', N'o6', 6, 0),
('f31_19', N'Normal', N'o1', 1, 0),
('f31_19', N'Acute occlusion', N'o2', 2, 0),
('f31_19', N'Chronic occlusion', N'o3', 3, 0),
('f31_20', N'LMCA O Normal / __% / O Acute occlusion / O Chronic occlusion', N'o1', 1, 0),
('f31_20', N'LAD 1 Normal / __% / Acute occlusion / Chronic occlusion', N'o2', 2, 0),
('f31_20', N'LAD 2 Normal / __% / Acute occlusion / Chronic occlusion', N'o3', 3, 0),
('f31_20', N'LAD 3 Normal / __% / Acute occlusion / Chronic occlusion', N'o4', 4, 0),
('f31_20', N'Dg 1 Normal / __% / Acute occlusion / Chronic occlusion', N'o5', 5, 0),
('f31_20', N'Dg 2 Normal / __% / Acute occlusion / Chronic occlusion', N'o6', 6, 0),
('f31_20', N'LCx 1 Normal / __% / Acute occlusion / Chronic occlusion', N'o7', 7, 0),
('f31_20', N'LCx 2 Normal / __% / Acute occlusion / Chronic occlusion', N'o8', 8, 0),
('f31_20', N'LCx 3 Normal / __% / Acute occlusion / Chronic occlusion', N'o9', 9, 0),
('f31_20', N'OM 1 Normal / __% / Acute occlusion / Chronic occlusion', N'o10', 10, 0),
('f31_20', N'OM 2 Normal / __% / Acute occlusion / Chronic occlusion', N'o11', 11, 0),
('f31_20', N'Ramus Normal / __% / Acute occlusion / Chronic occlusion', N'o12', 12, 0),
('f31_20', N'RCA 1 Normal / __% / Acute occlusion / Chronic occlusion', N'o13', 13, 0),
('f31_20', N'RCA 2 Normal / __% / Acute occlusion / Chronic occlusion', N'o14', 14, 0),
('f31_20', N'RCA 3 Normal / __% / Acute occlusion / Chronic occlusion', N'o15', 15, 0),
('f31_20', N'PDA Normal / __% / Acute occlusion / Chronic occlusion', N'o16', 16, 0),
('f31_20', N'RVP Normal / __% / Acute occlusion / Chronic occlusion', N'o17', 17, 0),
('f31_20', N'Saphenous bridge Normal / __% / Acute occlusion / Chronic occlusion', N'o18', 18, 0),
('f31_20', N'Mammary bridge Normal / __% / Acute occlusion / Chronic occlusion', N'o19', 19, 0),
('f31_20', N'Other __write____', N'o20', 20, 0),
('f31_21', N'no complications', N'o1', 1, 0),
('f31_21', N'Supra ventricular arrhythmia', N'o2', 2, 0),
('f31_21', N'Ventricular arrhythmia requiring cardioversion', N'o3', 3, 0),
('f31_21', N'Bradycardia requiring pacing', N'o4', 4, 0),
('f31_21', N'Distal coronary perforation', N'o5', 5, 0),
('f31_21', N'Proximal coronary perforation', N'o6', 6, 0),
('f31_21', N'Tamponade', N'o7', 7, 0),
('f31_21', N'Symptomatic and side branch occlusion', N'o8', 8, 0),
('f31_21', N'Occlusive dissection', N'o9', 9, 0),
('f31_21', N'Vascular complications (excluding coronary)', N'o10', 10, 0),
('f31_21', N'Lost stent', N'o11', 11, 0),
('f31_21', N'Neurological complication or stroke', N'o12', 12, 0),
('f31_21', N'Anaphylactic shock (excluding simple allergic reaction)', N'o13', 13, 0),
('f31_21', N'Cardiogenic shock', N'o14', 14, 0),
('f31_21', N'cardiopulmonary arrest per procedure', N'o15', 15, 0),
('f31_21', N'Procedure-related death', N'o16', 16, 0),
('f31_21', N'Other', N'o17', 17, 0),
('f31_22', N'No treatment / Medical treatment / Coronary angioplasty / Valvuloplasty or TAVI / surgical bypass / Valvular surgery / Surgical treatment / Valvular surgery + bypass / Hybrid revascularization / Bypass', N'o1', 1, 0),
('f31_22', N'Medical-surgical staff (NO DECISION/HEART TEAM CONSULTATION)', N'o2', 2, 0),
('f31_22', N'/ Ischemic test / Other', N'o3', 3, 0),
('f31_23', N'Coronary angiography only (Энэ сонголтыг сонговол асуумж Ангиопласти хэсгийг алгасаад шууд дараагийн хэсэг рүү шилждэг байх)', N'o1', 1, 0),
('f31_23', N'Ad hoc PCI', N'o2', 2, 0),
('f31_23', N'Staged PCI', N'o3', 3, 0),
('f31_24', N'LMCA', N'o1', 1, 0),
('f31_24', N'LAD 1', N'o2', 2, 0),
('f31_24', N'LAD 2', N'o3', 3, 0),
('f31_24', N'LAD 3', N'o4', 4, 0),
('f31_24', N'Dg 1', N'o5', 5, 0),
('f31_24', N'Dg 2', N'o6', 6, 0),
('f31_24', N'LCx 1', N'o7', 7, 0),
('f31_24', N'LCx 2', N'o8', 8, 0),
('f31_24', N'LCx 3', N'o9', 9, 0),
('f31_24', N'OM 1', N'o10', 10, 0),
('f31_24', N'OM 2', N'o11', 11, 0),
('f31_24', N'Ramus', N'o12', 12, 0),
('f31_24', N'RCA 1', N'o13', 13, 0),
('f31_24', N'RCA 2', N'o14', 14, 0),
('f31_24', N'RCA 3', N'o15', 15, 0),
('f31_24', N'PDA', N'o16', 16, 0),
('f31_24', N'RVP', N'o17', 17, 0),
('f31_24', N'Saphenous bridge', N'o18', 18, 0),
('f31_24', N'Mammary bridge', N'o19', 19, 0),
('f31_24', N'Other', N'o20', 20, 0),
('f31_25', N'De novo', N'o1', 1, 0),
('f31_25', N'ISR', N'o2', 2, 0),
('f31_25', N'Other cause: _________write______', N'o3', 3, 0),
('f31_26', N'CTO', N'o1', 1, 0),
('f31_26', N'LMCA high risk', N'o2', 2, 0),
('f31_26', N'Calcified (moderate or severe calcification) Энд Линк холбож өгөөд, дарахаар moderate calcification зэргийн тодорхойлолт харагддаг байна.', N'o3', 3, 0),
('f31_26', N'Bifurcation requires 2 stent technique', N'o4', 4, 0),
('f31_26', N'Very long lesion', N'o5', 5, 0),
('f31_26', N'Multivessel (SYNTAX ≥33, multiple complex segments, especially diabetic with diffuse disease)', N'o6', 6, 0),
('f31_26', N'Other [Severe tortuosity (>90° bends), Saphenous vein graft (SVG) lesions, complex ISR (in-stent restenosis) especially diffuse or CTO-type, Hemodynamic instability or LV dysfunction at baseline, Need for mechanical circulatory support (Impella, ECMO, IABP)]', N'o7', 7, 0),
('f31_27', N'<50%', N'o1', 1, 0),
('f31_27', N'50-70%', N'o2', 2, 0),
('f31_27', N'70-90', N'o3', 3, 0),
('f31_27', N'90-99% (sub-occlusion)', N'o4', 4, 0),
('f31_27', N'Occlusion', N'o5', 5, 0),
('f31_28', N'Acute <24h', N'o1', 1, 0),
('f31_28', N'recent <1 month', N'o2', 2, 0),
('f31_28', N'< 3 months', N'o3', 3, 0),
('f31_28', N'> 3 months (CTO)', N'o4', 4, 0),
('f31_28', N'?', N'o5', 5, 0),
('f31_29', N'IVUS', N'o1', 1, 0),
('f31_29', N'Other', N'o2', 2, 0),
('f31_30', N'0', N'o1', 1, 0),
('f31_30', N'1', N'o2', 2, 0),
('f31_30', N'2', N'o3', 3, 0),
('f31_30', N'3', N'o4', 4, 0),
('f31_30', N'?', N'o5', 5, 0),
('f31_31', N'Direct stenting', N'o1', 1, 0),
('f31_31', N'stenting', N'o2', 2, 0),
('f31_31', N'T stenting', N'o3', 3, 0),
('f31_31', N'TAP stenting', N'o4', 4, 0),
('f31_31', N'culotte', N'o5', 5, 0),
('f31_31', N'DK crush', N'o6', 6, 0),
('f31_31', N'kissing stenting (v stenting)', N'o7', 7, 0),
('f31_31', N'other', N'o8', 8, 0),
('f31_31', N'?', N'o9', 9, 0),
('f31_32', N'Y', N'o1', 1, 0),
('f31_32', N'N', N'o2', 2, 0),
('f31_32', N'NP', N'o3', 3, 0),
('f31_33', N'0', N'o1', 1, 0),
('f31_33', N'1', N'o2', 2, 0),
('f31_33', N'2', N'o3', 3, 0),
('f31_33', N'3', N'o4', 4, 0),
('f31_33', N'No', N'o5', 5, 0),
('f31_34', N'Successful', N'o1', 1, 0),
('f31_34', N'unsuccessful', N'o2', 2, 0),
('f31_35', N'Xience pro A (Abbott)', N'o1', 1, 0),
('f31_35', N'Ultimaster Tansei (Terumo)', N'o2', 2, 0),
('f31_35', N'Synsiro/Orsiro (Biotronik)', N'o3', 3, 0),
('f31_35', N'Revolute intergrity (Medtronik)', N'o4', 4, 0),
('f31_35', N'Other __write___', N'o5', 5, 0),
('f31_36', N'Iopromid (Ultravist)', N'o1', 1, 0),
('f31_36', N'iodixanol (Visipaque)', N'o2', 2, 0),
('f31_36', N'iohexol (Omnipaque)', N'o3', 3, 0),
('f31_36', N'Iobitridol (Xenetix)', N'o4', 4, 0),
('f31_36', N'Iopamidol (Pamiray)', N'o5', 5, 0),
('f31_37', N'N', N'o1', 1, 0),
('f31_37', N'Clopidogrel', N'o2', 2, 0),
('f31_37', N'Prasugrel', N'o3', 3, 0),
('f31_37', N'Ticagrelor', N'o4', 4, 0),
('f31_37', N'Ticlopidine', N'o5', 5, 0),
('f31_37', N'Cangrelor', N'o6', 6, 0),
('f31_37', N'other', N'o7', 7, 0),
('f31_37', N'?', N'o8', 8, 0),
('f31_38', N'No', N'o1', 1, 0),
('f31_38', N'UFH', N'o2', 2, 0),
('f31_38', N'LMWH', N'o3', 3, 0),
('f31_39', N'home', N'o1', 1, 0),
('f31_39', N'transfer to another hospital (non-rehabilitation ward)', N'o2', 2, 0),
('f31_39', N'transfer to rehabilitation facility', N'o3', 3, 0),
('f31_39', N'death', N'o4', 4, 0),
('f31_40', N'Y', N'o1', 1, 0),
('f31_40', N'N', N'o2', 2, 0),
('f31_40', N'Not applicable', N'o3', 3, 0),
('f31_40', N'?', N'o4', 4, 0),
('f31_41', N'No', N'o1', 1, 0),
('f31_41', N'Ticlopidine', N'o2', 2, 0),
('f31_41', N'Clopidogrel', N'o3', 3, 0),
('f31_41', N'Prasugrel', N'o4', 4, 0),
('f31_41', N'Ticagrelor', N'o5', 5, 0),
('f31_41', N'Not applicable', N'o6', 6, 0),
('f31_41', N'?', N'o7', 7, 0),
('f31_42', N'No', N'o1', 1, 0),
('f31_42', N'VKA', N'o2', 2, 0),
('f31_42', N'Pradaxa', N'o3', 3, 0),
('f31_42', N'Xarelto', N'o4', 4, 0),
('f31_42', N'Eliquis', N'o5', 5, 0),
('f31_42', N'Other', N'o6', 6, 0),
('f31_42', N'Not applicable', N'o7', 7, 0),
('f31_42', N'?', N'o8', 8, 0),
('f31_43', N'Y', N'o1', 1, 0),
('f31_43', N'N', N'o2', 2, 0),
('f31_43', N'If YES: Type1', N'o3', 3, 0),
('f31_43', N'Type 4a', N'o4', 4, 0),
('f31_43', N'Type 4b', N'o5', 5, 0),
('f31_43', N'NA', N'o6', 6, 0),
('f31_43', N'?', N'o7', 7, 0),
('f31_44', N'Y', N'o1', 1, 0),
('f31_44', N'N', N'o2', 2, 0),
('f31_44', N'If YES : Please specify : ____________ must be written', N'o3', 3, 0),
('f31_45', N'Yes', N'o1', 1, 0),
('f31_45', N'No', N'o2', 2, 0),
('f31_45', N'If YES, Please specify : or <3', N'o3', 3, 0),
('f31_45', N'BARC 3a', N'o4', 4, 0),
('f31_45', N'BARC 3b', N'o5', 5, 0),
('f31_45', N'BARC 3c', N'o6', 6, 0),
('f31_45', N'BARC 4', N'o7', 7, 0),
('f31_45', N'BARC 5a', N'o8', 8, 0),
('f31_45', N'BARC 5b', N'o9', 9, 0),
('f31_45', N'NA', N'o10', 10, 0),
('f31_45', N'?', N'o11', 11, 0),
('f31_46', N'Y', N'o1', 1, 0),
('f31_46', N'N', N'o2', 2, 0),
('f31_46', N'not applicable', N'o3', 3, 0),
('f31_46', N'?', N'o4', 4, 0),
('f31_47', N'Clopidogrel', N'o1', 1, 0),
('f31_47', N'Prasugrel', N'o2', 2, 0),
('f31_47', N'Ticagrelor', N'o3', 3, 0),
('f31_47', N'N', N'o4', 4, 0),
('f31_47', N'Ticlopidine', N'o5', 5, 0),
('f31_47', N'NA', N'o6', 6, 0),
('f31_48', N'Never', N'o1', 1, 0),
('f31_48', N'< 1 month', N'o2', 2, 0),
('f31_48', N'1 to 3 months', N'o3', 3, 0),
('f31_48', N'3 4 to 6 months', N'o4', 4, 0),
('f31_48', N'6 7 months-12 months', N'o5', 5, 0),
('f31_48', N'> 12 months', N'o6', 6, 0),
('f31_48', N'not applicable', N'o7', 7, 0),
('f31_48', N'?', N'o8', 8, 0),
('f31_49', N'No', N'o1', 1, 0),
('f31_49', N'VKA', N'o2', 2, 0),
('f31_49', N'Pradaxa', N'o3', 3, 0),
('f31_49', N'Xarelto', N'o4', 4, 0),
('f31_49', N'Eliquis', N'o5', 5, 0),
('f31_49', N'Not applicable', N'o6', 6, 0),
('f31_49', N'Other', N'o7', 7, 0),
('f31_50', N'Atorvastatin', N'o1', 1, 0),
('f31_50', N'Rosuvastatin', N'o2', 2, 0),
('f31_50', N'Fluvastatin', N'o3', 3, 0),
('f31_50', N'Pravastatin', N'o4', 4, 0),
('f31_50', N'Simvastatin', N'o5', 5, 0),
('f31_51', N'dd', N'o1', 1, 0),
('f31_51', N'mm', N'o2', 2, 0),
('f31_52', N'103 (Emergency)', N'o1', 1, 0),
('f31_52', N'From another hospital', N'o2', 2, 0),
('f31_52', N'Patient by themselves', N'o3', 3, 0),
('f31_52', N'Outpatient clinic', N'o4', 4, 0),
('f31_53', N'Call 103 (emergency transportation unit)', N'o1', 1, 0),
('f31_53', N'No call', N'o2', 2, 0),
('f31_54', N'Өрхийн эмч', N'o1', 1, 0),
('f31_54', N'103-ийн эмч', N'o2', 2, 0),
('f31_54', N'Сумын эмч', N'o3', 3, 0),
('f31_54', N'Нэгдсэн эмнэлгийн эмч', N'o4', 4, 0),
('f31_54', N'Яаралтай тусламжийн тасгийн эмч', N'o5', 5, 0),
('f31_54', N'Зүрх судасны эмч', N'o6', 6, 0),
('f31_54', N'Эмнэлэг доторх хэвтэн эмчлүүлэх тасагт', N'o7', 7, 0),
('f31_54', N'Эрчимт эмчилгээний тасаг', N'o8', 8, 0),
('f31_55', N'(List of hospitals specific to the region)', N'o1', 1, 0),
('f31_55', N'Эмнэлгүүдийн жагсаалт оруулна', N'o2', 2, 0),
('f31_55', N'СХД-НЭ, СХД-ЭМТ, БГД-ЭМТ, ХУД-ЭМТ, ХУД-НЭ, БЗД-ЭМТ, БЗД-НЭ, Багануур НЭ, Багахангай НЭ, Налайх НЭ, СБД-ЭМТ, СБД НЭ, ЧД-ЭМТ, Дархан АНЭ, Сэлэнгэ АНЭ, Хөвсгөл АНЭ, Орхон БОЭТ, Булган АНЭ, ӨВөрхангай БОЭТ, Төв АНЭ, Сумын эмнэлэг, Ховд БОЭТ, Баян-Өлгий АНЭ, Увс- АНЭ, Завхан-АНЭ, Говь-Алтай АНЭ, Баянхонгор АНЭ, Архангай АНЭ, Өмнөговь БОЭТ, Дундговь АНЭ, Дорноговь АНЭ, Хэнтий АНЭ, Сүхбаатар АНЭ, Дорнод БОЭТ, УНТЭ, УХТЭ, Хувийн хэвшлийн эмнэлэг, Өрхийн ЭМТ, бусад (_бичих__)', N'o3', 3, 0),
('f31_56', N'Anterior', N'o1', 1, 0),
('f31_56', N'Lateral', N'o2', 2, 0),
('f31_56', N'Inferior', N'o3', 3, 0),
('f31_56', N'other', N'o4', 4, 0),
('f31_56', N'NP', N'o5', 5, 0),
('f31_57', N'Primary PCI', N'o1', 1, 0),
('f31_57', N'no ECG criteria', N'o2', 2, 0),
('f31_57', N'too long delay', N'o3', 3, 0),
('f31_57', N'contraindication', N'o4', 4, 0),
('f31_57', N'unspecified', N'o5', 5, 0),
('f31_58', N'spontaneous reperfusion', N'o1', 1, 0),
('f31_58', N'no PCI capable', N'o2', 2, 0),
('f31_58', N'out of time', N'o3', 3, 0),
('f31_58', N'other', N'o4', 4, 0),
('f31_59', N'YES', N'o1', 1, 0),
('f31_59', N'NO', N'o2', 2, 0),
('f31_60', N'YES Registry is completed, saved and cannot be edited.', N'o1', 1, 0),
('f31_60', N'NO Saved and remains to further edit.', N'o2', 2, 0);
GO
SET NOEXEC OFF;
GO
SELECT dico, COUNT(*) AS Options FROM dbo.OptionTypes WHERE dico LIKE 'f31[_]%' GROUP BY dico ORDER BY dico;
GO
