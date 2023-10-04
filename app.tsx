UPDATE @TimeInAlaramResults
SET [flagged] = CASE WHEN occurrence_count > 3 OR past_24_hour_occurrence_count > 3 THEN 'flagged' ELSE 'not flagged' END
FROM (
    SELECT
        tag,
        AlarmType,
        count(*) AS occurrence_count,
        (
            SELECT COUNT(*)
            FROM @TimeInAlaramResults c2
            WHERE c2.[tag] = c.[tag]
                AND c2.[AlarmType] = c.[AlarmType]
                AND c2.[AlarmTime] BETWEEN DATEADD(HOUR, -24, c.[AlarmTime]) AND c.[AlarmTime]
                AND c2.[AlarmTime] <= c.[AlarmTime]
        ) AS past_24_hour_occurrence_count
    FROM
        @TimeInAlaramResults
    GROUP BY
        tag,
        AlarmType
    HAVING
        occurrence_count > 3
) AS t
