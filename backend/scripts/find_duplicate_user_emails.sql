-- Existing duplicate emails are NOT removed by the new validation; the checks
-- only block new duplicates. Run this to find rows that already collide, since
-- Users.updateNew will now reject edits to any of them until they are resolved.

-- Users sharing an email address
SELECT LOWER(LTRIM(RTRIM(Email))) AS Email, COUNT(*) AS Total,
       STRING_AGG(CAST(Id AS VARCHAR(20)) + ':' + UserName, ', ') AS Users
FROM [Users]
WHERE Email IS NOT NULL AND LTRIM(RTRIM(Email)) <> ''
GROUP BY LOWER(LTRIM(RTRIM(Email)))
HAVING COUNT(*) > 1
ORDER BY Total DESC;

-- Pending registration requests whose email already belongs to a user
SELECT r.Id AS RequestId, r.UserName AS RequestUserName, r.Email,
       u.Id AS ExistingUserId, u.UserName AS ExistingUserName
FROM [UserRequests] r
JOIN [Users] u
  ON LOWER(LTRIM(RTRIM(u.Email))) = LOWER(LTRIM(RTRIM(r.Email)))
WHERE r.Email IS NOT NULL AND LTRIM(RTRIM(r.Email)) <> ''
  AND r.IsActive <> '2'          -- ignore declined requests
  AND r.ConfirmUserId IS NULL    -- not yet confirmed
ORDER BY r.Id;

-- Registration requests sharing an email with each other
SELECT LOWER(LTRIM(RTRIM(Email))) AS Email, COUNT(*) AS Total,
       STRING_AGG(CAST(Id AS VARCHAR(20)) + ':' + UserName, ', ') AS Requests
FROM [UserRequests]
WHERE Email IS NOT NULL AND LTRIM(RTRIM(Email)) <> ''
  AND IsActive <> '2'
GROUP BY LOWER(LTRIM(RTRIM(Email)))
HAVING COUNT(*) > 1
ORDER BY Total DESC;
