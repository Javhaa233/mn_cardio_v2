-- =============================================================================
-- READ-ONLY. Which stored risk results were computed under the old age/gender
-- derivation, and how many could move band if they were recalculated.
--
-- WHY THIS EXISTS.
-- The cardiovascular risk inputs were derived on the client in
-- frontend/src/helper/CVDHelper.js (and, until the same change, in a second
-- inline copy in CalculateRisk.jsx). Two defects were corrected on 2026-09-10:
--
--   AGE - the old code computed `currentYear - birthYear`, a calendar-year
--   subtraction that ignores whether the birthday has happened yet. It was ONE
--   YEAR TOO HIGH for every patient whose birthday falls later in the year.
--   RiskScores rows are banded by minAge/maxAge, so a patient sitting on a band
--   boundary was looked up in the wrong row. THIS is the defect that moved
--   scores.
--
--   GENDER - the old code read `substr(7, 8)` of the registration number. That
--   is not the bug it was documented to be: substr's second argument is a
--   length, so on a 10-character РД it runs to the end of the string, and an
--   integer's parity is decided by its last digit - so for well-formed input it
--   returned the SAME answer as reading the gender digit. It only diverged for
--   malformed/short registration numbers, where parseInt gave NaN and the
--   expression fell through to "M". Gender now comes from the stored
--   Patient.p_gender where it exists.
--
-- WHAT THIS SCRIPT DOES NOT DO.
-- It does not recompute anything and it does not write. Recomputing a stored
-- clinical assessment changes the meaning of an existing record, so it is the
-- customer's decision, not ours (CLAUDE.md section 9). This script exists so
-- ЗСҮТ can see the size of the question before deciding.
--
-- HOW TO READ THE RESULT.
-- Query 1 - how many stored results predate the fix at all.
-- Query 2 - of those, how many belong to a patient whose birthday falls later
--           in the year than the record's own creation date. Those are the ones
--           whose age input was one year too high, i.e. the candidates for a
--           changed band. This is an UPPER BOUND: being a year out only changes
--           the answer if it crossed a minAge/maxAge boundary.
-- Query 3 - stored results whose patient has no usable gender on record AND a
--           registration number that would not have parsed, i.e. the rows that
--           silently defaulted to "M".
--
-- Adjust @FixDate if the change is deployed on a different day.
-- =============================================================================

SET NOCOUNT ON;

DECLARE @db sysname = DB_NAME();
IF @db NOT IN ('MnCardio_restored', 'MnCardioNew', 'MnCardio_test')
BEGIN
    RAISERROR('Refusing to run: unexpected database "%s".', 16, 1, @db);
    SET NOEXEC ON;
END
GO

DECLARE @FixDate date = '2026-09-10';

-- --- 1. Stored results computed before the fix -------------------------------
SELECT 'Total CVDRisk rows'                AS Metric, COUNT(*) AS Value FROM dbo.CVDRisk
UNION ALL
SELECT 'Computed before the fix',          COUNT(*) FROM dbo.CVDRisk WHERE CreateDate <  @FixDate
UNION ALL
SELECT 'Computed on or after the fix',     COUNT(*) FROM dbo.CVDRisk WHERE CreateDate >= @FixDate
UNION ALL
SELECT 'Before the fix, with no CreateDate', COUNT(*) FROM dbo.CVDRisk WHERE CreateDate IS NULL;

-- --- 2. Of those, the ones whose age input was a year too high ---------------
-- The old arithmetic over-counted whenever the birthday had not yet occurred in
-- the year the record was created.
SELECT  r.Id,
        r.MonitoringId,
        r.Score,
        r.Risk,
        r.CreateDate,
        p.p_registration,
        p.p_birthday,
        DATEDIFF(YEAR, p.p_birthday, r.CreateDate)                       AS AgeUsedByOldCode,
        CASE WHEN DATEADD(YEAR, DATEDIFF(YEAR, p.p_birthday, r.CreateDate), p.p_birthday)
                  > CAST(r.CreateDate AS date)
             THEN DATEDIFF(YEAR, p.p_birthday, r.CreateDate) - 1
             ELSE DATEDIFF(YEAR, p.p_birthday, r.CreateDate)
        END                                                              AS AgeCorrect
  FROM dbo.CVDRisk        r
  JOIN dbo.CVDMonitoring  m ON m.Id = r.MonitoringId
  JOIN dbo.Patient        p ON p.p_registration = m.PatRegNo
 WHERE r.CreateDate < @FixDate
   AND p.p_birthday IS NOT NULL
   AND DATEADD(YEAR, DATEDIFF(YEAR, p.p_birthday, r.CreateDate), p.p_birthday)
       > CAST(r.CreateDate AS date)
 ORDER BY r.CreateDate DESC;

-- --- 3. Rows that silently defaulted to gender "M" ---------------------------
-- No stored gender, and a registration number whose last character is not a
-- digit - so the old parseInt produced NaN and the expression fell through.
SELECT  r.Id,
        r.MonitoringId,
        r.CreateDate,
        p.p_registration,
        p.p_gender
  FROM dbo.CVDRisk        r
  JOIN dbo.CVDMonitoring  m ON m.Id = r.MonitoringId
  JOIN dbo.Patient        p ON p.p_registration = m.PatRegNo
 WHERE r.CreateDate < @FixDate
   AND (p.p_gender IS NULL OR p.p_gender = '')
   AND (p.p_registration IS NULL
        OR RIGHT(LTRIM(RTRIM(p.p_registration)), 1) NOT LIKE '[0-9]')
 ORDER BY r.CreateDate DESC;
GO

SET NOEXEC OFF;
GO
