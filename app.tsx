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
) >= 3
OR (
    SELECT COUNT(*)
    FROM @TimeInAlaramResults c3
    WHERE c3.[tag] = t.[tag]
    AND c3.[AlaramType] = t.[AlaramType]
    AND c3.[AlarmTime] BETWEEN DATEADD(HOUR, -24, t.[AlarmTime]) AND t.[AlarmTime]
    AND c3.[AlarmTime] BETWEEN @StartDate AND @EndDate
) = 2
This updated code checks if there are at least three alarms (including the current one) within the last 24 hours and flags all of them. It also checks if there are exactly two alarms within the last 24 hours and flags them as well. This way, it ensures that all three alarms are flagged when the criteria are met.





