UPDATE #TimeInAlaramResults
SET [flagged] = CASE WHEN occurrence_count > 3 OR past_24_hour_occurrence_count > 3 THEN 'flagged' ELSE 'not flagged' END
FROM (
    SELECT
        [Tag],
        [AlaramType],
        COUNT(*) AS occurrence_count,
        (
            SELECT COUNT(*)
            FROM #TimeInAlaramResults c2
            WHERE c2.[Tag] = c.[Tag]
                AND c2.[AlaramType] = c.[AlaramType]
                AND c2.[AlaramTime] BETWEEN DATEADD(HOUR, -24, c.[AlaramTime]) AND c.[AlaramTime]
        ) AS past_24_hour_occurrence_count
    FROM
        #TimeInAlaramResults c
    GROUP BY
        [Tag],
        [AlaramType]
    HAVING
        COUNT(*) > 3
) AS t
