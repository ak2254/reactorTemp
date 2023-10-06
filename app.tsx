UPDATE timeInAlaramResults
SET [flagged] = (
    CASE WHEN (
        SELECT COUNT(*)
        FROM ' + SUBSTRING(@tablePath, 1, (LEN(@tablePath) - CHARINDEX('[', REVERSE(@tablePath)))) + '[_ClearedAlarms] c2
        WHERE c2.[tag] = c.[tag]
            AND c2.[AlaramType] = c.[AlaramType]
            AND c2.[AlarmTime] <= c.[AlarmTime]
    ) >= 3 THEN ''Flagged'' ELSE ''Not Flagged'' END
)
