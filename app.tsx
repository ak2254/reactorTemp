TotalObservations = 
CALCULATE(
    COUNTROWS('Observation'),
    'Observation'[Complete] = "Yes",
    'Observation'[Observer Name] = SELECTEDVALUE('Personnel'[Full Name]),
    'Observation'[Date] >= SELECTEDVALUE('Personnel'[Start]),
    'Observation'[Date] <= IF(
         ISBLANK(SELECTEDVALUE('Personnel'[End])), 
         TODAY(), 
         SELECTEDVALUE('Personnel'[End])
    )
)

