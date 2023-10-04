WITH AlarmCounts AS (
    SELECT
        [Tag],
        [AlaramType],
        MIN([AlaramTime]) AS [FirstAlarmTime],
        COUNT(*) AS [Count]
    FROM ' + SUBSTRING(@tablePath, 1, (LEN(@tablePath) - CHARINDEX('[', REVERSE(@tablePath)))) + '[_ClearedAlrams] c
    WHERE
        c.[AlarmTime] BETWEEN @startDate AND DATEADD(HOUR, 24, @startDate)
        AND (c.[SeqNo2] IS NOT NULL OR c.[Time2] IS NULL) -- Include alarms without a clear time
    GROUP BY
        [Tag],
        [AlaramType]
)
