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



TotalObservationsWithRole = 
CALCULATE(
    COUNTROWS('audits'),
    FILTER(
        'audits',
        'audits'[Completed] = "Yes" &&
        'audits'[Full Name] IN VALUES('personnel'[Full Name])
    ),
    FILTER(
        'personnel',
        'personnel'[Full Name] = 'audits'[Full Name] &&
        'audits'[Observation Date] >= 'personnel'[Start Date] &&
        'audits'[Observation Date] <= COALESCE('personnel'[End Date], TODAY()) &&
        'personnel'[Role] = 'personnel'[Role]    -- Ensure the role matches
    )
)
TotalObservationsWithRole = 
CALCULATE(
    COUNTROWS('audits'),
    FILTER(
        'audits',
        'audits'[Completed] = "Yes" &&
        'audits'[Full Name] IN VALUES('personnel'[Full Name]) &&
        'audits'[Observation Date] >= LOOKUPVALUE('personnel'[Start Date], 'personnel'[Full Name], 'audits'[Full Name], 'personnel'[Start Date], 'audits'[Observation Date]) &&
        'audits'[Observation Date] <= COALESCE(
            LOOKUPVALUE('personnel'[End Date], 'personnel'[Full Name], 'audits'[Full Name], 'personnel'[Start Date], 'audits'[Observation Date]), 
            TODAY()
        )
    )
)
TotalObservationsWithRole = 
CALCULATE(
    COUNTROWS('audits'),
    FILTER(
        'audits',
        'audits'[Completed] = "Yes" &&
        'audits'[Full Name] IN VALUES('personnel'[Full Name]) &&
        'audits'[Observation Date] >= LOOKUPVALUE('personnel'[Start Date], 'personnel'[Full Name], 'audits'[Full Name], 'personnel'[Start Date], 'audits'[Observation Date]) &&
        'audits'[Observation Date] <= COALESCE(
            LOOKUPVALUE('personnel'[End Date], 'personnel'[Full Name], 'audits'[Full Name], 'personnel'[Start Date], 'audits'[Observation Date]), 
            TODAY()
        ) &&
        LOOKUPVALUE('personnel'[Role], 'personnel'[Full Name], 'audits'[Full Name], 'personnel'[Start Date], 'audits'[Observation Date]) = 'personnel'[Role]
    )
)
TotalObservationsWithRole = 
CALCULATE(
    COUNTROWS('audits'),
    FILTER(
        'audits',
        'audits'[Completed] = "Yes" &&
        'audits'[Full Name] IN VALUES('personnel'[Full Name]) &&
        'audits'[Observation Date] >= LOOKUPVALUE('personnel'[Start Date], 'personnel'[Full Name], 'audits'[Full Name], 'personnel'[Start Date], 'audits'[Observation Date]) &&
        'audits'[Observation Date] <= COALESCE(
            LOOKUPVALUE('personnel'[End Date], 'personnel'[Full Name], 'audits'[Full Name], 'personnel'[Start Date], 'audits'[Observation Date]), 
            TODAY()
        ) &&
        MAXX(
            FILTER(
                'personnel',
                'personnel'[Full Name] = 'audits'[Full Name] &&
                'audits'[Observation Date] >= 'personnel'[Start Date] &&
                'audits'[Observation Date] <= COALESCE('personnel'[End Date], TODAY())
            ),
            'personnel'[Role]
        ) = 'personnel'[Role]
    )
)
TotalObservationsWithRole = 
CALCULATE(
    COUNTROWS('audits'),
    FILTER(
        'audits',
        'audits'[Completed] = "Yes" &&
        'audits'[Full Name] IN VALUES('personnel'[Full Name]) &&
        'audits'[Observation Date] >= LOOKUPVALUE('personnel'[Start Date], 'personnel'[Full Name], 'audits'[Full Name], 'personnel'[Start Date], 'audits'[Observation Date]) &&
        'audits'[Observation Date] <= COALESCE(
            LOOKUPVALUE('personnel'[End Date], 'personnel'[Full Name], 'audits'[Full Name], 'personnel'[Start Date], 'audits'[Observation Date]), 
            TODAY()
        ) &&
        MAXX(
            FILTER(
                'personnel',
                'personnel'[Full Name] = 'audits'[Full Name] &&
                'audits'[Observation Date] >= 'personnel'[Start Date] &&
                'audits'[Observation Date] <= COALESCE('personnel'[End Date], TODAY())
            ),
            'personnel'[Role]
        ) = MAXX(
            FILTER(
                'personnel',
                'personnel'[Full Name] = 'audits'[Full Name] &&
                'audits'[Observation Date] >= 'personnel'[Start Date] &&
                'audits'[Observation Date] <= COALESCE('personnel'[End Date], TODAY())
            ),
            'personnel'[Role]
        )
    )
)
TotalObservationsByDate = 
CALCULATE(
    COUNTROWS('audits'),
    FILTER(
        'audits',
        'audits'[Completed] = "Yes" &&
        'audits'[Full Name] IN VALUES('personnel'[Full Name])
    ),
    FILTER(
        'personnel',
        'personnel'[Full Name] = 'audits'[Full Name] &&
        'audits'[Observation Date] >= 'personnel'[Start Date] &&
        ('audits'[Observation Date] <= 'personnel'[End Date] || ISBLANK('personnel'[End Date]))
    )
)

TotalObservationsByDate = 
CALCULATE(
    COUNTROWS('audits'),
    'audits'[Completed] = "Yes",
    TREATAS(
        VALUES('audits'[Full Name]),
        'personnel'[Full Name]
    ),
    FILTER(
        'personnel',
        'audits'[Observation Date] >= 'personnel'[Start Date] &&
        ('audits'[Observation Date] <= 'personnel'[End Date] || ISBLANK('personnel'[End Date]))
    )
)
TotalObservationsByDate = 
VAR ObservationDate = MAX('audits'[Observation Date])
RETURN
CALCULATE(
    COUNTROWS('audits'),
    'audits'[Completed] = "Yes",
    FILTER(
        'personnel',
        'personnel'[Full Name] = MAX('audits'[Full Name]) &&
        ObservationDate >= 'personnel'[Start Date] &&
        (ISBLANK('personnel'[End Date]) || ObservationDate <= 'personnel'[End Date])
    )
)

AssignedRole = 
VAR Person = 'audits'[Full Name]
VAR AuditDate = 'audits'[Observation Date]

RETURN 
    CALCULATE(
        MAX('personnel'[Role]),
        FILTER(
            'personnel',
            'personnel'[Full Name] = Person &&
            AuditDate >= 'personnel'[Start Date] &&
            (ISBLANK('personnel'[End Date]) || AuditDate <= 'personnel'[End Date])
        )
    )

TotalObservationsByRole = 
CALCULATE(
    COUNTROWS('audits'),
    'audits'[Completed] = "Yes"
)

PersonnelAuditMatching = 
FILTER(
    CROSSJOIN(personnel, audits),
    personnel[Full Name] = audits[Full Name] &&
    audits[Observation Date] >= personnel[Start Date] &&
    (ISBLANK(personnel[End Date]) || audits[Observation Date] <= personnel[End Date])
)

TotalObservationsByRoleAndIndividual = 
CALCULATE(
    COUNTROWS(PersonnelAuditMatching),
    PersonnelAuditMatching[Completed] = "Yes"
)

