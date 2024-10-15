
TotalObservations = 
CALCULATE(
    COUNTROWS('Observation'),
    FILTER(
        'Observation',
        'Observation'[Complete] = TRUE() &&  -- Only count completed observations
        'Observation'[Observer Name] IN VALUES('Personnel'[Full Name]) &&  -- Match Observer Name
        VAR ObserverName = 'Observation'[Observer Name]
        VAR StartDate = CALCULATE(MIN('Personnel'[Start]), 'Personnel'[Full Name] = ObserverName)
        VAR EndDate = CALCULATE(MAX('Personnel'[End]), 'Personnel'[Full Name] = ObserverName)
        RETURN
        'Observation'[Date] >= StartDate &&  -- Filter observations to be after the start date
        ('Observation'[Date] <= EndDate || ISBLANK(EndDate))  -- Filter observations to be before the end date (or include if no end date)
    )
)
