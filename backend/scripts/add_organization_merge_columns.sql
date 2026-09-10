-- Adds the columns needed to deactivate an organization after it has been
-- merged into another one (POST /Organization/Merge).
--
-- IsActive     : 0 = merged away / hidden from lookups, 1 = normal
-- MergedIntoId : the organization this row's data was moved into
-- MergedDate   : when the merge ran
-- MergedUserId : who ran it

IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'Organization' AND COLUMN_NAME = 'IsActive'
)
BEGIN
    ALTER TABLE [Organization]
        ADD [IsActive] BIT NOT NULL
        CONSTRAINT [DF_Organization_IsActive] DEFAULT (1);
END
GO

IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'Organization' AND COLUMN_NAME = 'MergedIntoId'
)
BEGIN
    ALTER TABLE [Organization] ADD [MergedIntoId] INT NULL;
END
GO

IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'Organization' AND COLUMN_NAME = 'MergedDate'
)
BEGIN
    ALTER TABLE [Organization] ADD [MergedDate] DATETIME NULL;
END
GO

IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'Organization' AND COLUMN_NAME = 'MergedUserId'
)
BEGIN
    ALTER TABLE [Organization] ADD [MergedUserId] INT NULL;
END
GO

-- Existing rows predate the merge feature, so they are all active
UPDATE [Organization] SET [IsActive] = 1 WHERE [IsActive] IS NULL;
GO

-- Verify
SELECT
    COUNT(*)                                   AS TotalOrganizations,
    SUM(CASE WHEN IsActive = 1 THEN 1 ELSE 0 END) AS ActiveOrganizations,
    SUM(CASE WHEN IsActive = 0 THEN 1 ELSE 0 END) AS MergedOrganizations
FROM [Organization];
