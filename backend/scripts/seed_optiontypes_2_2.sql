-- GENERATED. Option lists for form 2.2, from the tender's own checkbox cells.
SET NOCOUNT ON;
DECLARE @db sysname = DB_NAME();
IF @db NOT IN ('MnCardio_restored','MnCardioNew')
BEGIN RAISERROR('Refusing to run: unexpected database "%s".',16,1,@db); SET NOEXEC ON; END
GO
DELETE FROM dbo.OptionTypes WHERE dico LIKE 'f22[_]%';
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_01')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_01', N'Form 2.2 option set f22_01', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_02')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_02', N'Form 2.2 option set f22_02', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_03')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_03', N'Form 2.2 option set f22_03', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_04')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_04', N'Form 2.2 option set f22_04', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_05')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_05', N'Form 2.2 option set f22_05', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_06')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_06', N'Form 2.2 option set f22_06', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_07')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_07', N'Form 2.2 option set f22_07', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_08')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_08', N'Form 2.2 option set f22_08', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_09')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_09', N'Form 2.2 option set f22_09', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_10')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_10', N'Form 2.2 option set f22_10', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_11')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_11', N'Form 2.2 option set f22_11', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_12')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_12', N'Form 2.2 option set f22_12', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_13')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_13', N'Form 2.2 option set f22_13', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_14')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_14', N'Form 2.2 option set f22_14', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_15')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_15', N'Form 2.2 option set f22_15', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_16')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_16', N'Form 2.2 option set f22_16', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_17')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_17', N'Form 2.2 option set f22_17', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_18')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_18', N'Form 2.2 option set f22_18', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_19')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_19', N'Form 2.2 option set f22_19', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_20')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_20', N'Form 2.2 option set f22_20', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_21')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_21', N'Form 2.2 option set f22_21', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_22')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_22', N'Form 2.2 option set f22_22', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_23')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_23', N'Form 2.2 option set f22_23', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_24')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_24', N'Form 2.2 option set f22_24', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_25')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_25', N'Form 2.2 option set f22_25', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_26')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_26', N'Form 2.2 option set f22_26', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_27')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_27', N'Form 2.2 option set f22_27', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_28')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_28', N'Form 2.2 option set f22_28', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_29')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_29', N'Form 2.2 option set f22_29', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_30')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_30', N'Form 2.2 option set f22_30', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_31')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_31', N'Form 2.2 option set f22_31', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_32')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_32', N'Form 2.2 option set f22_32', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_33')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_33', N'Form 2.2 option set f22_33', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_34')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_34', N'Form 2.2 option set f22_34', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_35')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_35', N'Form 2.2 option set f22_35', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_36')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_36', N'Form 2.2 option set f22_36', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_37')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_37', N'Form 2.2 option set f22_37', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_38')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_38', N'Form 2.2 option set f22_38', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_39')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_39', N'Form 2.2 option set f22_39', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_40')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_40', N'Form 2.2 option set f22_40', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_41')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_41', N'Form 2.2 option set f22_41', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_42')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_42', N'Form 2.2 option set f22_42', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_43')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_43', N'Form 2.2 option set f22_43', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_44')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_44', N'Form 2.2 option set f22_44', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_45')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_45', N'Form 2.2 option set f22_45', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_46')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_46', N'Form 2.2 option set f22_46', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_47')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_47', N'Form 2.2 option set f22_47', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_48')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_48', N'Form 2.2 option set f22_48', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_49')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_49', N'Form 2.2 option set f22_49', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_50')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_50', N'Form 2.2 option set f22_50', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_51')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_51', N'Form 2.2 option set f22_51', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_52')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_52', N'Form 2.2 option set f22_52', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_53')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_53', N'Form 2.2 option set f22_53', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_54')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_54', N'Form 2.2 option set f22_54', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_55')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_55', N'Form 2.2 option set f22_55', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_56')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_56', N'Form 2.2 option set f22_56', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_57')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_57', N'Form 2.2 option set f22_57', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_58')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_58', N'Form 2.2 option set f22_58', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_59')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_59', N'Form 2.2 option set f22_59', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_60')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_60', N'Form 2.2 option set f22_60', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_61')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_61', N'Form 2.2 option set f22_61', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_62')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_62', N'Form 2.2 option set f22_62', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_63')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_63', N'Form 2.2 option set f22_63', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_64')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_64', N'Form 2.2 option set f22_64', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_65')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_65', N'Form 2.2 option set f22_65', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_66')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_66', N'Form 2.2 option set f22_66', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_67')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_67', N'Form 2.2 option set f22_67', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_68')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_68', N'Form 2.2 option set f22_68', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_69')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_69', N'Form 2.2 option set f22_69', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_70')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_70', N'Form 2.2 option set f22_70', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_71')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_71', N'Form 2.2 option set f22_71', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_72')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_72', N'Form 2.2 option set f22_72', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_73')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_73', N'Form 2.2 option set f22_73', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_74')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_74', N'Form 2.2 option set f22_74', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_75')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_75', N'Form 2.2 option set f22_75', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_76')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_76', N'Form 2.2 option set f22_76', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_77')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_77', N'Form 2.2 option set f22_77', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_78')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_78', N'Form 2.2 option set f22_78', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_79')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_79', N'Form 2.2 option set f22_79', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_80')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_80', N'Form 2.2 option set f22_80', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_81')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_81', N'Form 2.2 option set f22_81', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_82')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_82', N'Form 2.2 option set f22_82', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_83')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_83', N'Form 2.2 option set f22_83', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_84')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_84', N'Form 2.2 option set f22_84', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_85')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_85', N'Form 2.2 option set f22_85', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_86')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_86', N'Form 2.2 option set f22_86', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_87')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_87', N'Form 2.2 option set f22_87', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_88')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_88', N'Form 2.2 option set f22_88', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_89')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_89', N'Form 2.2 option set f22_89', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_90')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_90', N'Form 2.2 option set f22_90', N'GENERATED from tender appendix 2.2');
IF NOT EXISTS (SELECT 1 FROM dbo.DicoType WHERE dico='f22_91')
    INSERT INTO dbo.DicoType (dico, Name, Description) VALUES ('f22_91', N'Form 2.2 option set f22_91', N'GENERATED from tender appendix 2.2');

INSERT INTO dbo.OptionTypes (dico, label, value, pos, translate_flag)
VALUES
('f22_01', N'Хэвтэн эмчлүүлэх', N'o1', 1, 0),
('f22_01', N'Амбулатори', N'o2', 2, 0),
('f22_02', N'Төлөвлөгөөт', N'o1', 1, 0),
('f22_02', N'Яаралтай', N'o2', 2, 0),
('f22_03', N'Төлөвлөгөөт', N'o1', 1, 0),
('f22_03', N'Яаралтай', N'o2', 2, 0),
('f22_03', N'Тодорхойгүй', N'o3', 3, 0),
('f22_04', N'Өрхийн эмч', N'o1', 1, 0),
('f22_04', N'Зүрхний эмч', N'o2', 2, 0),
('f22_05', N'Өрхийн эмч', N'o1', 1, 0),
('f22_05', N'Зүрхний эмч', N'o2', 2, 0),
('f22_05', N'Бусад зүрхний тасаг', N'o3', 3, 0),
('f22_05', N'Өөрөө', N'o4', 4, 0),
('f22_06', N'Өрхийн эмч', N'o1', 1, 0),
('f22_06', N'Зүрхний эмч', N'o2', 2, 0),
('f22_06', N'Бусад зүрхний тасаг', N'o3', 3, 0),
('f22_06', N'Өөрөө', N'o4', 4, 0),
('f22_06', N'Яаралтай тусламж', N'o5', 5, 0),
('f22_06', N'Бусад', N'o6', 6, 0),
('f22_06', N'Тодорхойгүй', N'o7', 7, 0),
('f22_07', N'Зүрх судлалын тасаг', N'o1', 1, 0),
('f22_07', N'Зүрхний мэс заслын тасаг', N'o2', 2, 0),
('f22_08', N'Зүрх судлалын тасаг', N'o1', 1, 0),
('f22_08', N'Зүрхний мэс заслын тасаг', N'o2', 2, 0),
('f22_08', N'Дотрын тасаг', N'o3', 3, 0),
('f22_08', N'Аймгийн нэгдсэн эмнэлэг', N'o4', 4, 0),
('f22_09', N'Зүрх судлалын тасаг', N'o1', 1, 0),
('f22_09', N'Зүрхний мэс заслын тасаг', N'o2', 2, 0),
('f22_09', N'Дотрын тасаг', N'o3', 3, 0),
('f22_09', N'Аймгийн нэгдсэн эмнэлэг', N'o4', 4, 0),
('f22_09', N'Зүрхний хэм судлалын төв', N'o5', 5, 0),
('f22_10', N'Зүрх судлалын тасаг', N'o1', 1, 0),
('f22_10', N'Зүрхний мэс заслын тасаг', N'o2', 2, 0),
('f22_10', N'Дотрын тасаг', N'o3', 3, 0),
('f22_10', N'Аймгийн нэгдсэн эмнэлэг', N'o4', 4, 0),
('f22_10', N'Зүрхний хэм судлалын төв', N'o5', 5, 0),
('f22_10', N'Титэм судасны эмчилгээний тасаг (CCU)', N'o6', 6, 0),
('f22_10', N'Амбулатори', N'o7', 7, 0),
('f22_11', N'Зүрх судлалын тасаг', N'o1', 1, 0),
('f22_11', N'Зүрхний мэс заслын тасаг', N'o2', 2, 0),
('f22_11', N'Дотрын тасаг', N'o3', 3, 0),
('f22_11', N'Аймгийн нэгдсэн эмнэлэг', N'o4', 4, 0),
('f22_11', N'Зүрхний хэм судлалын төв', N'o5', 5, 0),
('f22_11', N'Титэм судасны эмчилгээний тасаг (CCU)', N'o6', 6, 0),
('f22_11', N'Амбулатори', N'o7', 7, 0),
('f22_11', N'Нэгдсэн цогц тусламж үйлчилгээ (ICC)', N'o8', 8, 0),
('f22_11', N'Эмнэлгийн амбулатори', N'o9', 9, 0),
('f22_12', N'Зүрх судлалын тасаг', N'o1', 1, 0),
('f22_12', N'Зүрхний мэс заслын тасаг', N'o2', 2, 0),
('f22_12', N'Дотрын тасаг', N'o3', 3, 0),
('f22_12', N'Аймгийн нэгдсэн эмнэлэг', N'o4', 4, 0),
('f22_12', N'Зүрхний хэм судлалын төв', N'o5', 5, 0),
('f22_12', N'Титэм судасны эмчилгээний тасаг (CCU)', N'o6', 6, 0),
('f22_12', N'Амбулатори', N'o7', 7, 0),
('f22_12', N'Нэгдсэн цогц тусламж үйлчилгээ (ICC)', N'o8', 8, 0),
('f22_12', N'Эмнэлгийн амбулатори', N'o9', 9, 0),
('f22_12', N'Бусад тасаг, тодруулна уу:', N'o10', 10, 0),
('f22_13', N'Эрэгтэй', N'o1', 1, 0),
('f22_13', N'Эмэгтэй', N'o2', 2, 0),
('f22_13', N'Бусад', N'o3', 3, 0),
('f22_14', N'Үгүй', N'o1', 1, 0),
('f22_14', N'Тийм', N'o2', 2, 0),
('f22_14', N'Тодорхойгүй', N'o3', 3, 0),
('f22_15', N'Ганцаараа амьдардаг', N'o1', 1, 0),
('f22_15', N'Гэр бүлтэйгээ амьдардаг', N'o2', 2, 0),
('f22_15', N'Асрамжийн газар', N'o3', 3, 0),
('f22_15', N'Бусад', N'o4', 4, 0),
('f22_15', N'Тодорхойгүй', N'o5', 5, 0),
('f22_16', N'Гэрлээгүй', N'o1', 1, 0),
('f22_16', N'Гэрлэсэн', N'o2', 2, 0),
('f22_16', N'Гэрлэлт цуцалсан', N'o3', 3, 0),
('f22_16', N'Бэлэвсэн', N'o4', 4, 0),
('f22_16', N'Бусад', N'o5', 5, 0),
('f22_16', N'Тодорхойгүй', N'o6', 6, 0),
('f22_17', N'Тодорхойгүй', N'o1', 1, 0),
('f22_17', N'Үгүй', N'o2', 2, 0),
('f22_18', N'Түргэн тусламжийн дуудлага', N'o1', 1, 0),
('f22_18', N'Үгүй', N'o2', 2, 0),
('f22_19', N'Түргэн тусламжийн дуудлага', N'o1', 1, 0),
('f22_19', N'Үгүй', N'o2', 2, 0),
('f22_19', N'Эмнэлгийн яаралтай тусламж', N'o3', 3, 0),
('f22_20', N'Түргэн тусламжийн дуудлага', N'o1', 1, 0),
('f22_20', N'Үгүй', N'o2', 2, 0),
('f22_20', N'Эмнэлгийн яаралтай тусламж', N'o3', 3, 0),
('f22_20', N'Амбулаторийн хэсэг', N'o4', 4, 0),
('f22_20', N'Бусад', N'o5', 5, 0),
('f22_21', N'Түргэн тусламжийн дуудлага', N'o1', 1, 0),
('f22_21', N'Үгүй', N'o2', 2, 0),
('f22_21', N'Эмнэлгийн яаралтай тусламж', N'o3', 3, 0),
('f22_21', N'Амбулаторийн хэсэг', N'o4', 4, 0),
('f22_21', N'Бусад', N'o5', 5, 0),
('f22_21', N'Тодорхойгүй', N'o6', 6, 0),
('f22_22', N'< 65 (0)', N'o1', 1, 0),
('f22_22', N'65-74 (+1)', N'o2', 2, 0),
('f22_22', N'≥ 75 (+2)', N'o3', 3, 0),
('f22_23', N'Эмэгтэй (+1)', N'o1', 1, 0),
('f22_23', N'Эрэгтэй (0)', N'o2', 2, 0),
('f22_24', N'Тийм +1', N'o1', 1, 0),
('f22_24', N'Үгүй 0', N'o2', 2, 0),
('f22_25', N'Тийм +2', N'o1', 1, 0),
('f22_25', N'Үгүй 0', N'o2', 2, 0),
('f22_26', N'I', N'o1', 1, 0),
('f22_26', N'II', N'o2', 2, 0),
('f22_26', N'III', N'o3', 3, 0),
('f22_26', N'IV', N'o4', 4, 0),
('f22_26', N'Тодорхойгүй I зэрэг', N'o5', 5, 0),
('f22_27', N'Үгүй', N'o1', 1, 0),
('f22_27', N'ТиймХэрэв тийм бол тодруулах:', N'o2', 2, 0),
('f22_27', N'Хянагдсан*', N'o3', 3, 0),
('f22_27', N'Хянагдаагүй (*)<сонголтоор> Эмийн эмчилгээний талаар "Эмийн хэрэглээ" хэсэгт тэмдэглэнэ үү Хугацаа:', N'o4', 4, 0),
('f22_27', N'≤1 жил', N'o5', 5, 0),
('f22_27', N'>1 -5 жил', N'o6', 6, 0),
('f22_27', N'> 5 -10 жил', N'o7', 7, 0),
('f22_27', N'> 10 жил', N'o8', 8, 0),
('f22_27', N'Тодорхойгүй', N'o9', 9, 0),
('f22_27', N'Тодорхойгүй', N'o10', 10, 0),
('f22_28', N'Огт татаагүй', N'o1', 1, 0),
('f22_28', N'Одоо татаж байгааХэрэв тамхи татаж байгаа бол: жилд хайрцаг*', N'o2', 2, 0),
('f22_28', N'Өмнө нь татаж байсан', N'o3', 3, 0),
('f22_28', N'Тодорхойгүй', N'o4', 4, 0),
('f22_29', N'Үгүй', N'o1', 1, 0),
('f22_29', N'ТиймТийм бол тодруулна уу:', N'o2', 2, 0),
('f22_29', N'<1 нэгж/хоног', N'o3', 3, 0),
('f22_29', N'1 нэгж/хоног', N'o4', 4, 0),
('f22_29', N'2-3 нэгж/хоног', N'o5', 5, 0),
('f22_29', N'≥ 4 нэгж/хоног', N'o6', 6, 0),
('f22_29', N'Тодорхойгүй', N'o7', 7, 0),
('f22_29', N'Тодорхойгүй', N'o8', 8, 0),
('f22_30', N'Үгүй', N'o1', 1, 0),
('f22_30', N'Тийм Тийм бол тодруулна уу:', N'o2', 2, 0),
('f22_30', N'Каннабис', N'o3', 3, 0),
('f22_30', N'Бензодиапезин', N'o4', 4, 0),
('f22_30', N'Психостимулант', N'o5', 5, 0),
('f22_30', N'MDMA (жнь амфетамин)', N'o6', 6, 0),
('f22_30', N'Кокайн', N'o7', 7, 0),
('f22_30', N'Героин (опойд)', N'o8', 8, 0),
('f22_30', N'Бусад', N'o9', 9, 0),
('f22_30', N'Тодорхойгүй', N'o10', 10, 0),
('f22_31', N'Байхгүй', N'o1', 1, 0),
('f22_31', N'Хааяа', N'o2', 2, 0),
('f22_31', N'Тогтмол', N'o3', 3, 0),
('f22_31', N'Эрчимтэй', N'o4', 4, 0),
('f22_31', N'Тодорхойгүй', N'o5', 5, 0),
('f22_32', N'Үгүй', N'o1', 1, 0),
('f22_32', N'ТиймТийм бол хэв шинжийг тодруулна уу:', N'o2', 2, 0),
('f22_32', N'I хэв шинж', N'o3', 3, 0),
('f22_32', N'II хэв шинж Үргэлжилсэн хугацаа:', N'o4', 4, 0),
('f22_32', N'Анх оношлогдсон', N'o5', 5, 0),
('f22_32', N'Судалгааны өмнө оношлогдсон байсан', N'o6', 6, 0),
('f22_32', N'≤1 жил', N'o7', 7, 0),
('f22_32', N'>1 -5 жил', N'o8', 8, 0),
('f22_32', N'> 5 -10 жил', N'o9', 9, 0),
('f22_32', N'> 10 жил', N'o10', 10, 0),
('f22_32', N'Тодорхойгүй Одоогийн эмчилгээ (тохирох бүх хэсгийг сонгоно уу):', N'o11', 11, 0),
('f22_32', N'Байхгүй', N'o12', 12, 0),
('f22_32', N'Хоолны дэглэм', N'o13', 13, 0),
('f22_32', N'Эмчилгээ*', N'o14', 14, 0),
('f22_32', N'Тодорхойгүй (*) Эмчилгээг эмийн хэрэглээ (жишээ нь 10-р хэсэг) хэсэгт тэмдэглэнэ үү.', N'o15', 15, 0),
('f22_32', N'Тодорхойгүй', N'o16', 16, 0),
('f22_33', N'Үгүй', N'o1', 1, 0),
('f22_33', N'Тийм', N'o2', 2, 0),
('f22_33', N'Тодорхойгүй Тийм бол төрлийг тодруулна уу:', N'o3', 3, 0),
('f22_33', N'Холестерол (LDL)', N'o4', 4, 0),
('f22_33', N'Триглицерид', N'o5', 5, 0),
('f22_33', N'Липопротейн (a)', N'o6', 6, 0),
('f22_33', N'Бусад, бичих Тийм бол удамшлын эсэхийг тодруулна уу:', N'o7', 7, 0),
('f22_33', N'Үгүй', N'o8', 8, 0),
('f22_33', N'Тийм', N'o9', 9, 0),
('f22_33', N'Тодорхойгүй Тийм бол үргэлжлэх хугацааг тодруулна уу:', N'o10', 10, 0),
('f22_33', N'Анх оношлогдсон', N'o11', 11, 0),
('f22_33', N'Судалгааны өмнө оношлогдсон байсан', N'o12', 12, 0),
('f22_33', N'≤1 жил', N'o13', 13, 0),
('f22_33', N'>1 -5 жил', N'o14', 14, 0),
('f22_33', N'> 5 -10 жил', N'o15', 15, 0),
('f22_33', N'> 10 жил', N'o16', 16, 0),
('f22_33', N'Тодорхойгүй Одоогийн эмчилгээ (тохирох бүх хэсгийг сонгоно уу):', N'o17', 17, 0),
('f22_33', N'Байхгүй', N'o18', 18, 0),
('f22_33', N'Хоолны дэглэм', N'o19', 19, 0),
('f22_33', N'Эмчилгээ*', N'o20', 20, 0),
('f22_33', N'Тодорхойгүй (*) Эмчилгээг эмийн хэрэглээ (10-р хэсэг) хэсэгт тэмдэглэнэ үү.', N'o21', 21, 0),
('f22_34', N'Үгүй', N'o1', 1, 0),
('f22_34', N'Тийм', N'o2', 2, 0),
('f22_34', N'Тодорхойгүй', N'o3', 3, 0),
('f22_34', N'Үгүй', N'o4', 4, 0),
('f22_34', N'Тийм', N'o5', 5, 0),
('f22_34', N'Тодорхойгүй', N'o6', 6, 0),
('f22_34', N'Үгүй', N'o7', 7, 0),
('f22_34', N'Тийм', N'o8', 8, 0),
('f22_34', N'Тодорхойгүй', N'o9', 9, 0),
('f22_35', N'Үгүй', N'o1', 1, 0),
('f22_35', N'Тийм Тийм бол,', N'o2', 2, 0),
('f22_35', N'Пароксизмт', N'o3', 3, 0),
('f22_35', N'Тогтмол', N'o4', 4, 0),
('f22_35', N'Удаан үргэлжилсэн тогтмол', N'o5', 5, 0),
('f22_35', N'Байнгын', N'o6', 6, 0),
('f22_35', N'Тодорхойгүй', N'o7', 7, 0),
('f22_36', N'Үгүй', N'o1', 1, 0),
('f22_36', N'Тийм Хэрэв тийм бол дараах мэдээллийг бөглөнө үү Цацалтын фракц %', N'o2', 2, 0),
('f22_36', N'Тодорхойгүй Хугацаа:', N'o3', 3, 0),
('f22_36', N'≤1 жил', N'o4', 4, 0),
('f22_36', N'>1 -5 жил', N'o5', 5, 0),
('f22_36', N'> 5 -10 жил', N'o6', 6, 0),
('f22_36', N'> 10 жил', N'o7', 7, 0),
('f22_36', N'Тодорхойгүй', N'o8', 8, 0),
('f22_36', N'Тодорхойгүй', N'o9', 9, 0),
('f22_37', N'Үгүй', N'o1', 1, 0),
('f22_37', N'Тархинд цус харвах эмгэг Сүүлийн тохиолдол:', N'o2', 2, 0),
('f22_37', N'<1 сар', N'o3', 3, 0),
('f22_37', N'1-6 сар', N'o4', 4, 0),
('f22_37', N'> 6 сар', N'o5', 5, 0),
('f22_37', N'Тодорхойгүй', N'o6', 6, 0),
('f22_37', N'Түр зуур цус хомсрох дайрлага (TIA) Сүүлийн тохиолдол:', N'o7', 7, 0),
('f22_37', N'<1 сар', N'o8', 8, 0),
('f22_37', N'1-6 сар', N'o9', 9, 0),
('f22_37', N'> 6 сар', N'o10', 10, 0),
('f22_37', N'Тодорхойгүй', N'o11', 11, 0),
('f22_37', N'Венийн тромбоэмболи (VTE) Сүүлийн тохиолдол:', N'o12', 12, 0),
('f22_37', N'<1 сар', N'o13', 13, 0),
('f22_37', N'1-6 сар', N'o14', 14, 0),
('f22_37', N'> 6 сар', N'o15', 15, 0),
('f22_37', N'Тодорхойгүй', N'o16', 16, 0),
('f22_37', N'Цусны эргэлтийн эмболи Сүүлийн тохиолдол:', N'o17', 17, 0),
('f22_37', N'<1 сар', N'o18', 18, 0),
('f22_37', N'1-6 сар', N'o19', 19, 0),
('f22_37', N'> 6 сар', N'o20', 20, 0),
('f22_37', N'Тодорхойгүй', N'o21', 21, 0),
('f22_37', N'Уушигны эмболи Сүүлийн тохиолдол:', N'o22', 22, 0),
('f22_37', N'<1 сар', N'o23', 23, 0),
('f22_37', N'1-6 сар', N'o24', 24, 0),
('f22_37', N'> 6 сар', N'o25', 25, 0),
('f22_37', N'Тодорхойгүй', N'o26', 26, 0),
('f22_37', N'Захын артерийн эмболи Сүүлийн тохиолдол:', N'o27', 27, 0),
('f22_37', N'<1 сар', N'o28', 28, 0),
('f22_37', N'1-6 сар', N'o29', 29, 0),
('f22_37', N'> 6 сар', N'o30', 30, 0),
('f22_37', N'Тодорхойгүй', N'o31', 31, 0),
('f22_37', N'Тодорхойгүй', N'o32', 32, 0),
('f22_38', N'Үгүй', N'o1', 1, 0),
('f22_38', N'Тархин дотор цус алдах Сүүлийн тохиолдол:', N'o2', 2, 0),
('f22_38', N'<1 сар', N'o3', 3, 0),
('f22_38', N'1-6 сар', N'o4', 4, 0),
('f22_38', N'> 6 сар', N'o5', 5, 0),
('f22_38', N'Тодорхойгүй', N'o6', 6, 0),
('f22_38', N'Бусад гавлын дотоод цус алдалтСүүлийн тохиолдол:', N'o7', 7, 0),
('f22_38', N'<1 сар', N'o8', 8, 0),
('f22_38', N'1-6 сар', N'o9', 9, 0),
('f22_38', N'> 6 сар', N'o10', 10, 0),
('f22_38', N'Тодорхойгүй', N'o11', 11, 0),
('f22_38', N'Хоол боловсруулах замын цус алдалтСүүлийн тохиолдол:', N'o12', 12, 0),
('f22_38', N'<1 сар', N'o13', 13, 0),
('f22_38', N'1-6 сар', N'o14', 14, 0),
('f22_38', N'> 6 сар', N'o15', 15, 0),
('f22_38', N'Тодорхойгүй', N'o16', 16, 0),
('f22_38', N'Ерөнхий цус эргэлтийн цус алдалтСүүлийн тохиолдол:', N'o17', 17, 0),
('f22_38', N'<1 сар', N'o18', 18, 0),
('f22_38', N'1-6 сар', N'o19', 19, 0),
('f22_38', N'> 6 сар', N'o20', 20, 0),
('f22_38', N'Тодорхойгүй', N'o21', 21, 0),
('f22_38', N'Бусад цус алдалтСүүлийн тохиолдол:', N'o22', 22, 0),
('f22_38', N'<1 сар', N'o23', 23, 0),
('f22_38', N'1-6 сар', N'o24', 24, 0),
('f22_38', N'> 6 сар', N'o25', 25, 0),
('f22_38', N'Тодорхойгүй', N'o26', 26, 0),
('f22_38', N'Тодорхойгүй', N'o27', 27, 0),
('f22_39', N'Үгүй', N'o1', 1, 0),
('f22_39', N'Тийм', N'o2', 2, 0),
('f22_39', N'Тодорхойгүй Тийм бол дахин судасжуулалт хийсэн үү?', N'o3', 3, 0),
('f22_39', N'Үгүй', N'o4', 4, 0),
('f22_39', N'Тийм', N'o5', 5, 0),
('f22_39', N'Тодорхойгүй', N'o6', 6, 0),
('f22_40', N'Үгүй', N'o1', 1, 0),
('f22_40', N'ТиймТийм бол тодруулах:', N'o2', 2, 0),
('f22_40', N'Гипертрофийн', N'o3', 3, 0),
('f22_40', N'Тэлэгдлийн (шалтгаан тодорхой)', N'o4', 4, 0),
('f22_40', N'Тэлэгдлийн (шалтгаан тодорхойгүй)', N'o5', 5, 0),
('f22_40', N'Рестриктив', N'o6', 6, 0),
('f22_40', N'Хэм алдагдлын шалтгаант (баруун ховдлын)', N'o7', 7, 0),
('f22_40', N'Такоцубо', N'o8', 8, 0),
('f22_40', N'Удамшлын/генетик', N'o9', 9, 0),
('f22_40', N'Архины хамааралтай байж болзошгүй', N'o10', 10, 0),
('f22_40', N'Халдварын шалтгаант', N'o11', 11, 0),
('f22_40', N'Тахикарди өдөөгдсөн', N'o12', 12, 0),
('f22_40', N'Тодорхойгүй', N'o13', 13, 0),
('f22_40', N'Тодорхойгүй', N'o14', 14, 0),
('f22_41', N'Үгүй', N'o1', 1, 0),
('f22_41', N'Тийм Тийм бол тодруулах:', N'o2', 2, 0),
('f22_41', N'Антибрадикарди', N'o3', 3, 0),
('f22_41', N'Хар тугалгагүй', N'o4', 4, 0),
('f22_41', N'Зүрхний ресинхронизаци эмчилгээний пэйсмэйкер (CRT-P)', N'o5', 5, 0),
('f22_41', N'Зүрхний ресинхронизаци эмчилгээний дефибриллятор (CRT-D)', N'o6', 6, 0),
('f22_41', N'ЗДС', N'o7', 7, 0),
('f22_41', N'Арьсан доорх ЗДС', N'o8', 8, 0),
('f22_41', N'Тодорхойгүй', N'o9', 9, 0),
('f22_42', N'Үгүй', N'o1', 1, 0),
('f22_42', N'Тийм Тийм бол доорх мэдээллийг бөглөнө үү: Интервеншин:', N'o2', 2, 0),
('f22_42', N'Гол судасны хавхлага солих мэс засал', N'o3', 3, 0),
('f22_42', N'Транскатетр аортын хавхлага дээр хиймэл хавхлага суулгах эмчилгээ (TAVI)', N'o4', 4, 0),
('f22_42', N'Бусад', N'o5', 5, 0),
('f22_42', N'Тодорхойгүй', N'o6', 6, 0),
('f22_43', N'Үгүй', N'o1', 1, 0),
('f22_43', N'Тийм Тийм бол доорх мэдээллийг бөглөнө үү: Интервеншин:', N'o2', 2, 0),
('f22_43', N'Хавхлагыг ирмэг-ирмэгээр нийлүүлэх судсанд дотуур мэс засал', N'o3', 3, 0),
('f22_43', N'Судсанд дотуур аргаар хавхлага солих мэс засал', N'o4', 4, 0),
('f22_43', N'Хавхлага засах нээлттэй мэс засал', N'o5', 5, 0),
('f22_43', N'Хавхлага солих нээлттэй мэс засал', N'o6', 6, 0),
('f22_43', N'Бусад', N'o7', 7, 0),
('f22_43', N'Тодорхойгүй', N'o8', 8, 0),
('f22_44', N'Үгүй', N'o1', 1, 0),
('f22_44', N'Тийм Тийм бол доорх мэдээллийг бөглөнө үү: Интервеншин:', N'o2', 2, 0),
('f22_44', N'Хавхлагыг ирмэг-ирмэгээр нийлүүлэх судсанд дотуур мэс засал', N'o3', 3, 0),
('f22_44', N'Судсанд дотуур аргаар хавхлага солих мэс засал', N'o4', 4, 0),
('f22_44', N'Транскатетер анулопласти', N'o5', 5, 0),
('f22_44', N'Хавхалга засах нээлттэй мэс засал', N'o6', 6, 0),
('f22_44', N'Хавхлага солих нээлттэй мэс засал', N'o7', 7, 0),
('f22_44', N'Бусад', N'o8', 8, 0),
('f22_44', N'Тодорхойгүй', N'o9', 9, 0),
('f22_45', N'Үгүй', N'o1', 1, 0),
('f22_45', N'Тийм Тийм бол тодруулах: - Одоогийн хавхлага нь :', N'o2', 2, 0),
('f22_45', N'Хиймэл хавхлага', N'o3', 3, 0),
('f22_45', N'Засагдсан хавхлага', N'o4', 4, 0),
('f22_45', N'Өөрийн хавхлага - Төрөл (хамаарах хэсгийг бүгдийг сонгоно уу): Нарийсал:', N'o5', 5, 0),
('f22_45', N'Байхгүй', N'o6', 6, 0),
('f22_45', N'Хөнгөн', N'o7', 7, 0),
('f22_45', N'Дунд', N'o8', 8, 0),
('f22_45', N'Хүнд', N'o9', 9, 0),
('f22_45', N'Тодорхойгүй Регургитаци:', N'o10', 10, 0),
('f22_45', N'Үгүй', N'o11', 11, 0),
('f22_45', N'Хөнгөн', N'o12', 12, 0),
('f22_45', N'Дунд', N'o13', 13, 0),
('f22_45', N'Хүнд', N'o14', 14, 0),
('f22_45', N'Тодорхойгүй - Морфологи:', N'o15', 15, 0),
('f22_45', N'Хоёр хавтаст', N'o16', 16, 0),
('f22_45', N'Гурван хавтаст', N'o17', 17, 0),
('f22_45', N'Тодорхойгүй - Хавхлагын талбай: см²', N'o18', 18, 0),
('f22_45', N'Тодорхойгүй - Дундаж зөрүү: ммМУБ', N'o19', 19, 0),
('f22_45', N'Тодорхойгүй', N'o20', 20, 0),
('f22_45', N'Тодорхойгүй', N'o21', 21, 0),
('f22_46', N'Үгүй', N'o1', 1, 0),
('f22_46', N'Тийм Тийм бол тодруулах: - Одоогийн хавхлага нь :', N'o2', 2, 0),
('f22_46', N'Хиймэл хавхлага', N'o3', 3, 0),
('f22_46', N'Засагдсан хавхлага', N'o4', 4, 0),
('f22_46', N'Өөрийн хавхлага - Төрөл (хамаарах хэсгийг бүгдийг сонгоно уу): Нарийсал:', N'o5', 5, 0),
('f22_46', N'Байхгүй', N'o6', 6, 0),
('f22_46', N'Хөнгөн', N'o7', 7, 0),
('f22_46', N'Дунд', N'o8', 8, 0),
('f22_46', N'Хүнд', N'o9', 9, 0),
('f22_46', N'Тодорхойгүй Регургитаци:', N'o10', 10, 0),
('f22_46', N'Үгүй', N'o11', 11, 0),
('f22_46', N'Хөнгөн', N'o12', 12, 0),
('f22_46', N'Дунд', N'o13', 13, 0),
('f22_46', N'Хүнд', N'o14', 14, 0),
('f22_46', N'Тодорхойгүй - Хавхлагын талбай: см²', N'o15', 15, 0),
('f22_46', N'Тодорхойгүй - Дундаж зөрүү: ммМУБ', N'o16', 16, 0),
('f22_46', N'Тодорхойгүй', N'o17', 17, 0),
('f22_46', N'Тодорхойгүй', N'o18', 18, 0),
('f22_47', N'Үгүй', N'o1', 1, 0),
('f22_47', N'Тийм Тийм бол тодруулах:- - Одоогийн хавхлага нь', N'o2', 2, 0),
('f22_47', N'Хиймэл хавхлага', N'o3', 3, 0),
('f22_47', N'Засагдсан хавхлага', N'o4', 4, 0),
('f22_47', N'Өөрийн хавхлага - Регургитаци:', N'o5', 5, 0),
('f22_47', N'Байхгүй', N'o6', 6, 0),
('f22_47', N'Хөнгөн', N'o7', 7, 0),
('f22_47', N'Дунд', N'o8', 8, 0),
('f22_47', N'Хүнд', N'o9', 9, 0),
('f22_47', N'Тодорхойгүй', N'o10', 10, 0),
('f22_47', N'Тодорхойгүй', N'o11', 11, 0),
('f22_48', N'Үгүй', N'o1', 1, 0),
('f22_48', N'Тийм Тийм бол тодруулах:', N'o2', 2, 0),
('f22_48', N'Хоёр хавтаст аортын хавхлага', N'o3', 3, 0),
('f22_48', N'Тосгуурын таславчийн цоорхой (ТТЦ)', N'o4', 4, 0),
('f22_48', N'Ховдлын таславчийн цоорхой (ХТЦ)', N'o5', 5, 0),
('f22_48', N'Фаллотын дөрвөл гажиг', N'o6', 6, 0),
('f22_48', N'Бусад, тодруулна уу:', N'o7', 7, 0),
('f22_48', N'Тодорхойгүй', N'o8', 8, 0),
('f22_49', N'Үгүй', N'o1', 1, 0),
('f22_49', N'Тийм', N'o2', 2, 0),
('f22_49', N'Тодорхойгүй Тийм бол тодруулах:', N'o3', 3, 0),
('f22_50', N'Үгүй', N'o1', 1, 0),
('f22_50', N'ТиймТийм бол тодруулна уу:', N'o2', 2, 0),
('f22_50', N'Гипертиреодизм', N'o3', 3, 0),
('f22_50', N'Гипотиреодизм', N'o4', 4, 0),
('f22_50', N'Одоогийн эмгэг', N'o5', 5, 0),
('f22_50', N'Өмнөх эмгэг', N'o6', 6, 0),
('f22_50', N'Тодорхойгүй', N'o7', 7, 0),
('f22_51', N'Үгүй', N'o1', 1, 0),
('f22_51', N'ТиймТийм бол тодруулах:', N'o2', 2, 0),
('f22_51', N'Диализ тогтмол хийдэггүй', N'o3', 3, 0),
('f22_51', N'Диализ тогтмол хийдэг', N'o4', 4, 0),
('f22_51', N'Бөөр шилжүүлэн суулгасан', N'o5', 5, 0),
('f22_51', N'Тодорхойгүй', N'o6', 6, 0),
('f22_52', N'Үгүй', N'o1', 1, 0),
('f22_52', N'ТиймТийм бол тодруулах:', N'o2', 2, 0),
('f22_52', N'Үргэлжилсэн эерэг даралтат эмчилгээ (CPAP) хийлгэдэг', N'o3', 3, 0),
('f22_52', N'CPAP хийгдээгүй', N'o4', 4, 0),
('f22_52', N'Тодорхойгүй', N'o5', 5, 0),
('f22_53', N'Үгүй', N'o1', 1, 0),
('f22_53', N'ТиймТийм бол тодруулах:', N'o2', 2, 0),
('f22_53', N'Одоогийн', N'o3', 3, 0),
('f22_53', N'Өмнө нь (намжлын байдалд шилжсэн/ эдгэрсэн)', N'o4', 4, 0),
('f22_53', N'Тодорхойгүй', N'o5', 5, 0),
('f22_54', N'Үгүй', N'o1', 1, 0),
('f22_54', N'Тийм', N'o2', 2, 0),
('f22_54', N'Хамааралгүй (эрэгтэй эсвэл хүүхэд тээх насны эмэгтэй биш)', N'o3', 3, 0),
('f22_54', N'Тодорхойгүй', N'o4', 4, 0),
('f22_55', N'Үгүй', N'o1', 1, 0),
('f22_55', N'Тийм', N'o2', 2, 0),
('f22_55', N'Тодорхойгүй Тийм бол тодруулах:', N'o3', 3, 0),
('f22_55', N'Тосгуурын жирвэгнээ', N'o4', 4, 0),
('f22_55', N'Механик хавхлага', N'o5', 5, 0),
('f22_55', N'Уушигны эмболи', N'o6', 6, 0),
('f22_55', N'Бусад', N'o7', 7, 0),
('f22_56', N'Синус', N'o1', 1, 0),
('f22_56', N'Тосгуурын жирвэгнээ', N'o2', 2, 0),
('f22_56', N'Тосгуурын мерцани', N'o3', 3, 0),
('f22_56', N'Пэйсинг', N'o4', 4, 0),
('f22_56', N'Ховдлын тахикарди', N'o5', 5, 0),
('f22_56', N'Брадиаритми', N'o6', 6, 0),
('f22_56', N'Бусад', N'o7', 7, 0),
('f22_56', N'Тодорхойгүй', N'o8', 8, 0),
('f22_57', N'Үгүй', N'o1', 1, 0),
('f22_57', N'Тийм Тийм бол тодруулна уу:', N'o2', 2, 0),
('f22_57', N'1-р зэрэг', N'o3', 3, 0),
('f22_57', N'2-р зэрэг', N'o4', 4, 0),
('f22_57', N'3-р зэрэг', N'o5', 5, 0),
('f22_57', N'Тодорхойгүй', N'o6', 6, 0),
('f22_58', N'Үгүй', N'o1', 1, 0),
('f22_58', N'Тийм Тийм бол тодруулна уу:', N'o2', 2, 0),
('f22_58', N'Зүүн хөлийн бүрэн бус хориг (LBBB)', N'o3', 3, 0),
('f22_58', N'Зүүн хөлийн бүрэн хориг (LBBB)', N'o4', 4, 0),
('f22_58', N'Баруун хөлийн бүрэн бус хориг (RBBB)', N'o5', 5, 0),
('f22_58', N'Баруун хөлийн бүрэн хориг (RBBB)', N'o6', 6, 0),
('f22_58', N'Бусад ховдол доторх дамжуулалтын алдагдал', N'o7', 7, 0),
('f22_58', N'Тодорхойгүй', N'o8', 8, 0),
('f22_59', N'Үгүй', N'o1', 1, 0),
('f22_59', N'Тийм Тийм бол тодруулна уу:', N'o2', 2, 0),
('f22_59', N'ST түр зуур өргөгдсөн', N'o3', 3, 0),
('f22_59', N'ST байнга өргөгдсөн', N'o4', 4, 0),
('f22_59', N'ST буурсан Аль холболт дээр?:', N'o5', 5, 0),
('f22_59', N'Доод', N'o6', 6, 0),
('f22_59', N'Өмнөд', N'o7', 7, 0),
('f22_59', N'Хажуугийн', N'o8', 8, 0),
('f22_59', N'Арын', N'o9', 9, 0),
('f22_59', N'Бусад:', N'o10', 10, 0),
('f22_59', N'Тодорхойгүй', N'o11', 11, 0),
('f22_60', N'Үгүй', N'o1', 1, 0),
('f22_60', N'Тийм Тийм бол тодруулна уу:', N'o2', 2, 0),
('f22_60', N'Тэгш хэмтэй', N'o3', 3, 0),
('f22_60', N'Тэгш бус хэмтэй', N'o4', 4, 0),
('f22_60', N'Тодорхойгүй', N'o5', 5, 0),
('f22_61', N'Байхгүй', N'o1', 1, 0),
('f22_61', N'Бага', N'o2', 2, 0),
('f22_61', N'Дунд', N'o3', 3, 0),
('f22_61', N'Их', N'o4', 4, 0),
('f22_61', N'Тодорхойгүй', N'o5', 5, 0),
('f22_62', N'Үгүй', N'o1', 1, 0),
('f22_62', N'ТиймТийм бол тодруулах:', N'o2', 2, 0),
('f22_62', N'Зүрхний томрол', N'o3', 3, 0),
('f22_62', N'Уушигны зогсонгошил буюу хаван', N'o4', 4, 0),
('f22_62', N'Уушгины гялтанд шингэн хурах', N'o5', 5, 0),
('f22_62', N'Уушгины хатгаа', N'o6', 6, 0),
('f22_62', N'Бусад, тодруулна уу:', N'o7', 7, 0),
('f22_62', N'Тодорхойгүй', N'o8', 8, 0),
('f22_63', N'пг/мл', N'o1', 1, 0),
('f22_63', N'pmol/L', N'o2', 2, 0),
('f22_63', N'Тодорхойгүй', N'o3', 3, 0),
('f22_64', N'mmol/mol', N'o1', 1, 0),
('f22_64', N'%', N'o2', 2, 0),
('f22_64', N'Тодорхойгүй', N'o3', 3, 0),
('f22_65', N'мг/дл', N'o1', 1, 0),
('f22_65', N'Тодорхойгүй', N'o2', 2, 0),
('f22_66', N'г/дл', N'o1', 1, 0),
('f22_66', N'г/л', N'o2', 2, 0),
('f22_66', N'ммоль/л', N'o3', 3, 0),
('f22_66', N'Тодорхойгүй', N'o4', 4, 0),
('f22_67', N'%', N'o1', 1, 0),
('f22_67', N'Тодорхойгүй', N'o2', 2, 0),
('f22_68', N'Эс/мкл', N'o1', 1, 0),
('f22_68', N'эсүүд /мм3 103/мм3', N'o2', 2, 0),
('f22_68', N'109/л', N'o3', 3, 0),
('f22_68', N'Тодорхойгүй', N'o4', 4, 0),
('f22_69', N'Эс/мкл', N'o1', 1, 0),
('f22_69', N'эс /мм3', N'o2', 2, 0),
('f22_69', N'103/мм3', N'o3', 3, 0),
('f22_69', N'109/л', N'o4', 4, 0),
('f22_69', N'Тодорхойгүй', N'o5', 5, 0),
('f22_70', N'нг/мл', N'o1', 1, 0),
('f22_70', N'мкг/л', N'o2', 2, 0),
('f22_70', N'Тодорхойгүй', N'o3', 3, 0),
('f22_71', N'нмоль/л', N'o1', 1, 0),
('f22_71', N'мг/л', N'o2', 2, 0),
('f22_71', N'Тодорхойгүй', N'o3', 3, 0),
('f22_72', N'мг/л', N'o1', 1, 0),
('f22_72', N'Тодорхойгүй', N'o2', 2, 0),
('f22_73', N'ммоль/л', N'o1', 1, 0),
('f22_73', N'мг/дл', N'o2', 2, 0),
('f22_73', N'Тодорхойгүй', N'o3', 3, 0),
('f22_74', N'мкмоль/л', N'o1', 1, 0),
('f22_74', N'мг/дл', N'o2', 2, 0),
('f22_74', N'Тодорхойгүй', N'o3', 3, 0),
('f22_75', N'U/L', N'o1', 1, 0),
('f22_75', N'Тодорхойгүй', N'o2', 2, 0),
('f22_76', N'мг/дл', N'o1', 1, 0),
('f22_76', N'ммоль/л', N'o2', 2, 0),
('f22_76', N'Тодорхойгүй', N'o3', 3, 0),
('f22_77', N'Үгүй', N'o1', 1, 0),
('f22_77', N'Тийм', N'o2', 2, 0),
('f22_77', N'Тодорхойгүй Тийм бол доорх хүснэгтийг бөглөнө үү:', N'o3', 3, 0),
('f22_78', N'Фенпрокумон', N'o1', 1, 0),
('f22_78', N'Варфарин', N'o2', 2, 0),
('f22_78', N'Аценокумарол', N'o3', 3, 0),
('f22_78', N'Флуиндион', N'o4', 4, 0),
('f22_78', N'Фенидион', N'o5', 5, 0),
('f22_78', N'Бусад:', N'o6', 6, 0),
('f22_79', N'Дабигатран', N'o1', 1, 0),
('f22_79', N'Үгүй', N'o2', 2, 0),
('f22_80', N'Үгүй', N'o1', 1, 0),
('f22_80', N'Тийм', N'o2', 2, 0),
('f22_80', N'Тодорхойгүй Тийм бол доорх хүснэгтийг бөглөнө үү', N'o3', 3, 0),
('f22_81', N'Үгүй', N'o1', 1, 0),
('f22_81', N'Тийм', N'o2', 2, 0),
('f22_81', N'Тодорхойгүй Хоногийн нийт тун [ _ _ _ _] мг', N'o3', 3, 0),
('f22_81', N'Тодорхойгүй', N'o4', 4, 0),
('f22_82', N'Лираглютид', N'o1', 1, 0),
('f22_82', N'Семаглютид', N'o2', 2, 0),
('f22_82', N'Бусад, тодруулна уу', N'o3', 3, 0),
('f22_83', N'Үгүй', N'o1', 1, 0),
('f22_83', N'Тийм бол тодруулна уу:', N'o2', 2, 0),
('f22_83', N'Криоаблаци', N'o3', 3, 0),
('f22_83', N'Радио долгионт аблаци', N'o4', 4, 0),
('f22_83', N'Pulsed field', N'o5', 5, 0),
('f22_83', N'Тодорхойгүй', N'o6', 6, 0),
('f22_84', N'Үгүй', N'o1', 1, 0),
('f22_84', N'Тийм бол тодруулна уу: Пейсмейкерийн төрөл:', N'o2', 2, 0),
('f22_84', N'Антибрадикарди', N'o3', 3, 0),
('f22_84', N'Хар тугалгагүй', N'o4', 4, 0),
('f22_84', N'CRT-P', N'o5', 5, 0),
('f22_84', N'CRT-D', N'o6', 6, 0),
('f22_84', N'Бусад:', N'o7', 7, 0),
('f22_84', N'Тодорхойгүй', N'o8', 8, 0),
('f22_84', N'Тодорхойгүй', N'o9', 9, 0),
('f22_85', N'Үгүй', N'o1', 1, 0),
('f22_85', N'Тийм бол тодруулна уу: Заалт:', N'o2', 2, 0),
('f22_85', N'Анхдагч урьдчилан сэргийлэлт', N'o3', 3, 0),
('f22_85', N'Хоёрдогч урьдчилан сэргийлэлт', N'o4', 4, 0),
('f22_85', N'Тодорхойгүй', N'o5', 5, 0),
('f22_86', N'Үгүй', N'o1', 1, 0),
('f22_86', N'Тийм бол тодруулна уу:', N'o2', 2, 0),
('f22_86', N'Тодорхойгүй', N'o3', 3, 0),
('f22_87', N'Үгүй', N'o1', 1, 0),
('f22_87', N'Тийм бол тодруулна уу: Ажилбарын төрөл:', N'o2', 2, 0),
('f22_87', N'Эм ялгаруулагч стент (DES) Тийм бол хамаарах хэсгийг бүгдийг сонгоно уу.', N'o3', 3, 0),
('f22_87', N'Xience ба iterations', N'o4', 4, 0),
('f22_87', N'Synergy ба iterations', N'o5', 5, 0),
('f22_87', N'Onyx ба iterations', N'o6', 6, 0),
('f22_87', N'Ultimaster ба iterations', N'o7', 7, 0),
('f22_87', N'Biofreedom ба iterations', N'o8', 8, 0),
('f22_87', N'Orsiro ба iterations', N'o9', 9, 0),
('f22_87', N'Supraflex ба iterations', N'o10', 10, 0),
('f22_87', N'Бусад', N'o11', 11, 0),
('f22_87', N'Дан металл стент (BMS)', N'o12', 12, 0),
('f22_87', N'Био шимэгддэг стент', N'o13', 13, 0),
('f22_87', N'Эмээр бүрсэн баллон (DCB)', N'o14', 14, 0),
('f22_87', N'Стентгүй дан баллон тэлэлт (POBA)', N'o15', 15, 0),
('f22_87', N'Бусад:', N'o16', 16, 0),
('f22_87', N'Тодорхойгүй Удирдамжийн дагуу зөвлөмжийн түвшин:', N'o17', 17, 0),
('f22_87', N'I', N'o18', 18, 0),
('f22_87', N'IIa', N'o19', 19, 0),
('f22_87', N'IIb', N'o20', 20, 0),
('f22_87', N'Тодорхойгүй', N'o21', 21, 0),
('f22_87', N'Тодорхойгүй', N'o22', 22, 0),
('f22_88', N'Үгүй', N'o1', 1, 0),
('f22_88', N'Тийм, интервеншин хийх шаардлагатай', N'o2', 2, 0),
('f22_88', N'Тийм, интервеншин хийх шаардлагагүй', N'o3', 3, 0),
('f22_88', N'Тодорхойгүй', N'o4', 4, 0),
('f22_89', N'Үгүй', N'o1', 1, 0),
('f22_89', N'Тийм, интервеншин хийх шаардлагатай', N'o2', 2, 0),
('f22_89', N'Тийм, интервеншин хийх шаардлагагүй', N'o3', 3, 0),
('f22_89', N'Тодорхойгүй Тийм бол хоол боловсруулах замын цус алдалт', N'o4', 4, 0),
('f22_89', N'Үгүй', N'o5', 5, 0),
('f22_89', N'Тийм', N'o6', 6, 0),
('f22_89', N'Тодорхойгүй', N'o7', 7, 0),
('f22_90', N'Үгүй', N'o1', 1, 0),
('f22_90', N'Тийм бол дэлгэрүүлнэ үү:', N'o2', 2, 0),
('f22_90', N'Интервеншин хийх шаардлагатай', N'o3', 3, 0),
('f22_90', N'Интервеншин хийх шаардлагагүй', N'o4', 4, 0),
('f22_90', N'Тодорхойгүй', N'o5', 5, 0),
('f22_91', N'Үгүй', N'o1', 1, 0),
('f22_91', N'Тийм', N'o2', 2, 0),
('f22_91', N'Тодорхойгүй Тийм бол тохирох зүйлсийг бүгдийг сонгоно уу.  Спондилит  Септик шок гломерулонефрит  Микотик аневризм: Байршил:  Бөөрний цочмог дутагдал  Байнгын халууралт (>7 хоног)', N'o3', 3, 0),
('f22_91', N'Бусад:', N'o4', 4, 0);
GO
SET NOEXEC OFF;
GO
SELECT COUNT(DISTINCT dico) AS OptionSets, COUNT(*) AS Options FROM dbo.OptionTypes WHERE dico LIKE 'f22[_]%';
GO
