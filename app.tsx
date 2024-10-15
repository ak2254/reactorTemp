TotalObservations = 
CALCULATE(
    COUNTROWS('Observation'),
    FILTER(
        'Observation',
        'Observation'[Complete] = TRUE() &&  -- Only count completed observations
        'Observation'[Observer Name] IN VALUES('Personnel'[Full Name]) &&  -- Match Observer Name
        'Observation'[Date] >= MINX(FILTER('Personnel', 'Personnel'[Full Name] = 'Observation'[Observer Name]), 'Personnel'[Start]) &&  -- Use the minimum start date per person
        (
            ISBLANK(MAXX(FILTER('Personnel', 'Personnel'[Full Name] = 'Observation'[Observer Name]), 'Personnel'[End])) || -- Handle cases where End date is blank
            'Observation'[Date] <= MAXX(FILTER('Personnel', 'Personnel'[Full Name] = 'Observation'[Observer Name]), 'Personnel'[End]) -- Use the maximum end date per person
        )
    )
)
