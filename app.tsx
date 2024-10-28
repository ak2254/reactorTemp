i
TotalObservations = 
CALCULATE(
    COUNTROWS('audits'), 
    FILTER(
        'audits',
        'audits'[Completed] = "Yes" &&
        'audits'[Full Name] IN VALUES('personnel'[Full Name]) &&
        'audits'[Observation Date] >= 
            CALCULATE(MIN('personnel'[Start Date]), 
                      'personnel'[Full Name] = 'audits'[Full Name], 
                      'audits'[Observation Date] >= 'personnel'[Start Date],
                      'audits'[Observation Date] <= COALESCE('personnel'[End Date], TODAY())
            ) &&
        'audits'[Observation Date] <= 
            CALCULATE(MAX(COALESCE('personnel'[End Date], TODAY())), 
                      'personnel'[Full Name] = 'audits'[Full Name], 
                      'audits'[Observation Date] >= 'personnel'[Start Date],
                      'audits'[Observation Date] <= COALESCE('personnel'[End Date], TODAY())
            )
    )
)
