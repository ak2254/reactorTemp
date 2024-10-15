TotalTargetObservations = 
VAR MinObservationDate = CALCULATE(MIN('Observation'[Date]), ALL('Personnel'))
VAR MaxObservationDate = CALCULATE(MAX('Observation'[Date]), ALL('Personnel'))
RETURN
SUMX(
    'Personnel',
    VAR StartDate = 'Personnel'[Start]
    VAR EndDate = IF(ISBLANK('Personnel'[End]), MaxObservationDate, 'Personnel'[End])
    VAR ActiveMonths = DATEDIFF(MAX(StartDate, MinObservationDate), MIN(EndDate, MaxObservationDate), MONTH)
    RETURN IF(ActiveMonths > 0, 'Personnel'[Target #] * ActiveMonths, 0)
)
