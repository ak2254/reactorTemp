TotalTargetObservations = 
VAR MinObservationDate = MIN('Observation'[Date])  -- Get the minimum date from the filtered observation data
VAR MaxObservationDate = MAX('Observation'[Date])  -- Get the maximum date from the filtered observation data

RETURN
SUMX(
    'Personnel',
    VAR StartDate = 'Personnel'[Start]  -- Start date for the person
    VAR EndDate = IF(ISBLANK('Personnel'[End]), MaxObservationDate, 'Personnel'[End])  -- If End date is blank, assume they are still active
    VAR ActiveMonths = 
        DATEDIFF( 
            MAX(StartDate, MinObservationDate),  -- Later of start date or filtered min observation date
            MIN(EndDate, MaxObservationDate),    -- Earlier of end date or filtered max observation date
            MONTH
        )
    RETURN
    IF(ActiveMonths > 0, 'Personnel'[Target #] * ActiveMonths, 0)  -- Multiply target per month by the number of active months, or return 0 if no active months
)
