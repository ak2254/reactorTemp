UPDATE t
SET [abthree] = 'Flagged'
FROM @TimeInAlaramResults t
WHERE (
    SELECT COUNT(*)
    FROM @TimeInAlaramResults c2
    WHERE c2.[tag] = t.[tag]
    AND c2.[AlaramType] = t.[AlaramType]
    AND c2.[AlarmTime] BETWEEN DATEADD(HOUR, -24, t.[AlarmTime]) AND t.[AlarmTime]
    AND c2.[AlarmTime] BETWEEN @StartDate AND @EndDate
    GROUP BY c2.[tag], c2.[AlaramType]
    HAVING COUNT(*) >= 3
) >= 3;



