WITH RankedAlarms AS (
    SELECT
        t.*,
        ROW_NUMBER() OVER (PARTITION BY t.[tag], t.[AlaramType] ORDER BY t.[AlarmTime]) AS RowNum
    FROM @TimeInAlaramResults t
)
UPDATE RankedAlarms
SET [abthree] = 'Flagged'
WHERE (
    SELECT COUNT(*) 
    FROM RankedAlarms c2
    WHERE c2.[tag] = RankedAlarms.[tag]
    AND c2.[AlaramType] = RankedAlarms.[AlaramType]
    AND c2.RowNum <= RankedAlarms.RowNum
) >= 3;
