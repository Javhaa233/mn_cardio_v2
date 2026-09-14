-- =============================================================================
-- DocumentSignature - the storage half of ДАН digital signature (tracker 114)
--
-- The ДАН service agreement, a sandbox endpoint and a test certificate are all
-- outstanding (BLOCKERS item 7), and the wire format belongs to ДАН rather than
-- to us. So this stores signatures; it does not obtain them, and
-- helper/DocumentCanonical.js produces the bytes that would be signed.
--
-- WHY BUILD THE STORAGE AND THE CANONICALISER FIRST. Canonicalisation is the
-- part that is ruinous to change later: alter how a document canonicalises
-- after signatures exist and EVERY EXISTING SIGNATURE STOPS VERIFYING, with no
-- migration possible because the original bytes cannot be reconstructed. It is
-- also the part that is independent of whose signing service is used, and it
-- has an acceptance criterion testable today - same record, same hash, across
-- processes and restarts.
--
-- PayloadHash is indexed rather than unique: the same record legitimately gets
-- signed more than once - a correction, a second signatory, a re-sign after the
-- canonicalisation version changes.
--
-- CanonVersion is stored with every row so that if the rules ever must change,
-- old signatures can still be verified against the rules that produced them
-- instead of being silently invalidated.
-- =============================================================================

SET NOCOUNT ON;

DECLARE @db sysname = DB_NAME();
IF @db NOT IN ('MnCardio_restored', 'MnCardioNew', 'MnCardio_test')
BEGIN
    RAISERROR('Refusing to run: unexpected database "%s".', 16, 1, @db);
    SET NOEXEC ON;
END
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'DocumentSignature')
BEGIN
    CREATE TABLE [DocumentSignature] (
        [Id]                INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [ObjectName]        NVARCHAR(100) NULL,
        [ObjectId]          INT NULL,
        [SignerUserId]      INT NULL,
        [SignerRegNo]       NVARCHAR(20) NULL,
        -- The exact canonical bytes that were signed, kept verbatim. Without
        -- them a signature can never be re-verified independently.
        [Payload]           NVARCHAR(MAX) NULL,
        [PayloadHash]       NVARCHAR(128) NULL,
        [CanonVersion]      INT NULL,
        [SignatureValue]    NVARCHAR(MAX) NULL,
        [CertificateSerial] NVARCHAR(128) NULL,
        [SignedDate]        DATETIME NULL,
        [VerifiedDate]      DATETIME NULL,
        -- prepared | signed | verified | failed
        [Status]            NVARCHAR(20) NULL
    );
    PRINT 'created DocumentSignature';
END
ELSE PRINT 'DocumentSignature already exists';
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_DocumentSignature_Object')
BEGIN
    CREATE INDEX IX_DocumentSignature_Object
        ON [DocumentSignature] ([ObjectName], [ObjectId], [SignedDate] DESC);
    PRINT 'added IX_DocumentSignature_Object';
END
ELSE PRINT 'IX_DocumentSignature_Object already exists';
GO

SELECT COUNT(*) AS DocumentSignatureColumns
  FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='DocumentSignature';
GO
