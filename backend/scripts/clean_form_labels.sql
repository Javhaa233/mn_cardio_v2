-- =============================================================================
-- Strip form-fill artifacts out of the tender form labels.
--
-- The 2.2 labels were lifted from the tender appendix, which is a paper form.
-- Paper artifacts came with them and read badly on screen and as grid column
-- headings:
--
--   "...huvtsen ognoo|_ _/_ _/_ _ _ _| odor sar on"  -> the blanks to write in
--   "[] Troponin I"                                  -> the checkbox glyph, which
--                                                       the control already draws
--   "CHADS2-VASc onoo*"                              -> a footnote marker whose
--                                                       footnote did not come along
--
-- The box glyph is written as NCHAR(9633) so this file stays pure ASCII and
-- survives any shell or editor encoding.
--
-- Deliberately NOT touched:
--   * leading digits - "2 tsagiin daraa..." is "2 hours later", not a numbering
--     prefix, so a blanket strip would corrupt real clinical text;
--   * trailing colons - normal form style, present in 148 labels across every
--     form, and consistent as-is.
--
-- Data only. Re-runnable: every rule is idempotent.
-- =============================================================================

SET NOCOUNT ON;

DECLARE @db sysname = DB_NAME();
IF @db NOT IN ('MnCardio_restored', 'MnCardioNew', 'MnCardio_test')
BEGIN
    RAISERROR('Refusing to run: unexpected database "%s".', 16, 1, @db);
    SET NOEXEC ON;
END
GO

DECLARE @box nchar(1) = NCHAR(9633);   -- the empty-checkbox glyph

-- 1. cut the fill-in blanks: everything from the first pipe onwards
UPDATE dbo.TenderFormField
   SET LabelMn = RTRIM(LEFT(LabelMn, CHARINDEX('|', LabelMn) - 1))
 WHERE CHARINDEX('|', LabelMn) > 1;

-- 2. drop the leading checkbox glyph - the control draws its own
UPDATE dbo.TenderFormField
   SET LabelMn = LTRIM(STUFF(LabelMn, 1, 1, ''))
 WHERE LEFT(LTRIM(LabelMn), 1) = @box;

-- 3. drop the dangling footnote marker
UPDATE dbo.TenderFormField
   SET LabelMn = RTRIM(LEFT(LabelMn, LEN(LabelMn) - 1))
 WHERE RIGHT(RTRIM(LabelMn), 1) = '*'
   AND LEN(RTRIM(LabelMn)) > 1;

-- 4. same treatment for section headings. A heading that *starts* with the box
--    keeps its text; one that carries a trailing option list ("Other: [] No
--    [] Yes...") is cut back to the heading itself.
UPDATE dbo.TenderFormField
   SET SectionLabel = LTRIM(STUFF(SectionLabel, 1, 1, ''))
 WHERE LEFT(LTRIM(SectionLabel), 1) = @box;

UPDATE dbo.TenderFormField
   SET SectionLabel = RTRIM(LEFT(SectionLabel, CHARINDEX(@box, SectionLabel) - 1))
 WHERE CHARINDEX(@box, SectionLabel) > 1;

-- 5. collapse the double spaces the cuts leave behind
UPDATE dbo.TenderFormField SET LabelMn = REPLACE(LabelMn, '  ', ' ') WHERE LabelMn LIKE '%  %';
UPDATE dbo.TenderFormField SET SectionLabel = REPLACE(SectionLabel, '  ', ' ') WHERE SectionLabel LIKE '%  %';

SET NOEXEC OFF;
GO

SELECT 'labels with a pipe'    AS Artifact, COUNT(*) AS Remaining FROM dbo.TenderFormField WHERE LabelMn LIKE '%|%'
UNION ALL SELECT 'labels starting with box', COUNT(*) FROM dbo.TenderFormField WHERE LEFT(LTRIM(LabelMn),1) = NCHAR(9633)
UNION ALL SELECT 'labels ending with star',  COUNT(*) FROM dbo.TenderFormField WHERE RIGHT(RTRIM(LabelMn),1) = '*'
UNION ALL SELECT 'sections with a box',      COUNT(*) FROM dbo.TenderFormField WHERE CHARINDEX(NCHAR(9633), SectionLabel) > 0;
GO

-- =============================================================================
-- The same treatment for the option lists.
--
-- Three option labels carry a leading checkbox glyph. The radio/checkbox
-- control draws its own, so the glyph shows up twice on screen. These dicos
-- are shared with the older screens, which render the same options through the
-- same controls, so removing it is an improvement there too.
--
-- Also drops a footnote asterisk left stranded mid-label ("HAS-BLED * (0-9)"),
-- which reads as a typo in a grid column heading.
-- =============================================================================

DECLARE @box2 nchar(1) = NCHAR(9633);

UPDATE dbo.OptionTypes
   SET label = LTRIM(STUFF(label, 1, 1, ''))
 WHERE LEFT(LTRIM(label), 1) = @box2;

UPDATE dbo.TenderFormField
   SET LabelMn = REPLACE(LabelMn, ' * ', ' ')
 WHERE LabelMn LIKE '% * %';
GO

SELECT 'option labels with a box' AS Artifact, COUNT(*) AS Remaining
  FROM dbo.OptionTypes WHERE CHARINDEX(NCHAR(9633), label) > 0
UNION ALL
SELECT 'field labels with stray star', COUNT(*)
  FROM dbo.TenderFormField WHERE LabelMn LIKE '% * %';
GO
