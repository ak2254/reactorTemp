 SELECT
    tag,
    alarm_type,
    count(*) AS occurrence_count,
    CASE WHEN occurrence_count > 3 OR past_24_hour_occurrence_count > 3 THEN 'Flagged' ELSE 'Not Flagged' END AS [abthree]
FROM
    @TimeInAlaramResults
GROUP BY
    tag,
    alarm_type
HAVING
    occurrence_count > 3
    AND alarm_time <= end_of_day
ORDER BY
    tag,
    alarm_type,
    alarm_time ASC;
