
WITH AlarmCounts AS (
    SELECT
        [Tag],
        [AlaramType],
        MIN([AlaramTime]) AS [FirstAlarmTime],
        COUNT(*) AS [Count]
    FROM YourExistingTable
    WHERE
        [AlarmTime] BETWEEN @startDate AND DATEADD(HOUR, 24, @startDate)
        AND ([SeqNo2] IS NOT NULL OR [Time2] IS NULL) -- Include alarms without a clear time
    GROUP BY
        [Tag],
        [AlaramType]
)
UPDATE YourExistingTable
SET [ab3] = CASE
    WHEN ac.[Count] > 3 THEN 'yes'
    ELSE ''
    END
FROM YourExistingTable AS c
LEFT JOIN AlarmCounts ac
    ON ac.[Tag] = c.[Tag]
    AND ac.[AlaramType] = c.[AlaramType]
    AND ac.[FirstAlarmTime] = c.[AlaramTime]
WHERE
    [AlarmTime] BETWEEN @startDate AND DATEADD(HOUR, 24, @startDate)
    AND (
        [SeqNo2] IS NOT NULL
        OR [Time2] IS NULL
        OR (ac.[Count] > 3)
    )

