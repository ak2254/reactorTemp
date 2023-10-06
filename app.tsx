 WHERE (
    SELECT COUNT(*) 
    FROM @TimeInAlaramResults c2
    WHERE c2.[tag] = t.[tag]
    AND c2.[AlaramType] = t.[AlaramType]
    AND c2.[AlarmTime] BETWEEN DATEADD(HOUR, -24, t.[AlarmTime]) AND t.[AlarmTime]
) >= 3
OR (
    SELECT COUNT(*) 
    FROM @TimeInAlaramResults c2
    WHERE c2.[tag] = t.[tag]
    AND c2.[AlaramType] = t.[AlaramType]
    AND c2.[AlarmTime] <= DATEADD(HOUR, -24, t.[AlarmTime])
    AND c2.[AlarmTime] + INTERVAL 24 HOUR >= t.[AlarmTime]
) >= 3;

