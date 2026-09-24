-- Guardian consent — mobile tender §1.2.
--
-- PatientConsent already records that a patient agreed to a purpose, and
-- /api/patient/consents lets them do it themselves. What has no route at all is
-- the case the tender actually names: a patient who CANNOT give consent, whose
-- guardian gives it on their behalf and whose doctor records it.
--
-- That is not the same row with a different author. A consent given by somebody
-- else is only meaningful if the record says who they were and on what basis
-- they were entitled to give it — otherwise the archive cannot distinguish
-- "the patient agreed" from "a person in the room agreed", which is the one
-- distinction the requirement exists to preserve.
--
-- Four columns, all nullable, because every existing row is a self-consent and
-- must stay valid unchanged:
--
--   GrantedBy        'self' | 'guardian'. NULL on historical rows, which are
--                    self-consents by construction — the guardian route did not
--                    exist when they were written. Read NULL as 'self'.
--   GuardianRegNo    the guardian's national registration number
--   GuardianName     as stated
--   GuardianRelation relationship to the patient (parent, child, spouse, …)
--
-- NO RevokedAt COLUMN, DELIBERATELY. PatientConsent is APPEND-ONLY: withdrawing
-- writes a new row with Granted = 0 and the granting row is never touched
-- (see helper/Consent.js). A RevokedAt column would be a second, contradictory
-- way to express the same fact, and the two would disagree the first time one
-- was written without the other.
--
-- REMEMBER THE MODEL. Sequelize silently drops writes to attributes a model
-- does not declare, so adding a column here is only half the change —
-- model/Consent/PatientConsent.js declares all four.
--
-- Safe to re-run.

DECLARE @db sysname = DB_NAME();
IF @db NOT IN ('MnCardio_restored', 'MnCardioNew', 'MnCardio_test')
BEGIN
    RAISERROR('Refusing to run: unexpected database "%s".', 16, 1, @db);
    SET NOEXEC ON;
END
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'PatientConsent')
BEGIN
    RAISERROR('PatientConsent does not exist - run add_consent_tables.sql first', 16, 1);
    SET NOEXEC ON;
END
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_NAME = 'PatientConsent' AND COLUMN_NAME = 'GrantedBy')
BEGIN
    ALTER TABLE [PatientConsent] ADD [GrantedBy] NVARCHAR(20) NULL;
    PRINT 'PatientConsent.GrantedBy added';
END
ELSE PRINT 'PatientConsent.GrantedBy already exists';
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_NAME = 'PatientConsent' AND COLUMN_NAME = 'GuardianRegNo')
BEGIN
    ALTER TABLE [PatientConsent] ADD [GuardianRegNo] NVARCHAR(20) NULL;
    PRINT 'PatientConsent.GuardianRegNo added';
END
ELSE PRINT 'PatientConsent.GuardianRegNo already exists';
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_NAME = 'PatientConsent' AND COLUMN_NAME = 'GuardianName')
BEGIN
    ALTER TABLE [PatientConsent] ADD [GuardianName] NVARCHAR(255) NULL;
    PRINT 'PatientConsent.GuardianName added';
END
ELSE PRINT 'PatientConsent.GuardianName already exists';
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_NAME = 'PatientConsent' AND COLUMN_NAME = 'GuardianRelation')
BEGIN
    ALTER TABLE [PatientConsent] ADD [GuardianRelation] NVARCHAR(100) NULL;
    PRINT 'PatientConsent.GuardianRelation added';
END
ELSE PRINT 'PatientConsent.GuardianRelation already exists';
GO

SET NOEXEC OFF;
GO

SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
  FROM INFORMATION_SCHEMA.COLUMNS
 WHERE TABLE_NAME = 'PatientConsent'
 ORDER BY ORDINAL_POSITION;
GO
