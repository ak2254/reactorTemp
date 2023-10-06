UPDATE t
SET [abthree] = 'Flagged'
FROM @TimeInAlaramResults t
WHERE (
    SELECT COUNT(*)
    FROM @TimeInAlaramResults c2
    WHERE c2.[tag] = t.[tag]
    AND c2.[AlaramType] = t.[AlaramType]
    AND c2.[AlarmTime] BETWEEN @StartDate AND @EndDate
) > 3
