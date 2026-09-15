-- =============================================================================
-- File.duration_ms / File.media_state - playable chat media, tracker row 47
--
-- WHY A DURATION COLUMN. A voice note has to show its length BEFORE it is
-- played, and ideally before a byte of it is fetched. The only other way to
-- know is to download the file and decode it, which defeats the point of
-- showing the length - the reader is deciding whether the download is worth it.
-- Every chat client that carries voice messages does this, and every one of
-- them stores the duration next to the file.
--
-- WHY A STATE COLUMN. Uploaded media is normalised after the fact
-- (helper/MediaTranscode.js): a voice note recorded in Chrome arrives as
-- WebM/Opus, which iPhones cannot play, and is rewritten to M4A/AAC. That work
-- happens AFTER the message is already delivered, on purpose - a message must
-- never fail to send because a transcode failed. So a row needs somewhere to
-- say which side of that it is on:
--
--   NULL      not media, or uploaded before this existed. Serve as-is.
--   'pending' queued or in progress. The ORIGINAL bytes are live and playable.
--   'done'    normalised. Plays on every client.
--   'failed'  transcode did not work, or ffmpeg is not installed. Original
--             bytes are still served - this is a degraded state, not an error
--             state, and must not hide the attachment.
--
-- BOTH ARE NULLABLE, and that is what makes this script safe to run against a
-- table holding ~14,800 live rows: every existing File keeps working untouched,
-- and model/File.js treats NULL as "no information" rather than as a value.
--
-- REMEMBER TO DECLARE THEM IN model/File.js. Sequelize silently drops writes to
-- attributes it does not know about, so adding the column here and nowhere else
-- produces a duration that is always null with no error anywhere.
-- =============================================================================

SET NOCOUNT ON;

DECLARE @db sysname = DB_NAME();
IF @db NOT IN ('MnCardio_restored', 'MnCardioNew', 'MnCardio_test')
BEGIN
    RAISERROR('Refusing to run: unexpected database "%s".', 16, 1, @db);
    SET NOEXEC ON;
END
GO

IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'File' AND COLUMN_NAME = 'duration_ms'
)
BEGIN
    ALTER TABLE [File] ADD [duration_ms] INT NULL;
    PRINT 'Added File.duration_ms';
END
ELSE
    PRINT 'File.duration_ms already present - skipped';
GO

IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'File' AND COLUMN_NAME = 'media_state'
)
BEGIN
    ALTER TABLE [File] ADD [media_state] NVARCHAR(20) NULL;
    PRINT 'Added File.media_state';
END
ELSE
    PRINT 'File.media_state already present - skipped';
GO

-- Find work the transcoder still owes, and anything that failed. Not an index:
-- the set is tiny and short-lived, and File is a large table where an index
-- that exists for a background sweep is not worth its write cost.
--
--   SELECT id_data, ext, media_state, date_creation
--   FROM [File]
--   WHERE media_state IN ('pending', 'failed')
--   ORDER BY date_creation DESC;

SET NOEXEC OFF;
GO
