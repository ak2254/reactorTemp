Qualified Leaders % = 
VAR TotalPeople = 
    DISTINCTCOUNT(Audits[Name])
VAR QualifiedPeople = 
    CALCULATE(
        DISTINCTCOUNT(Personnel[Name]),
        FILTER(
            Personnel,
            Personnel[Date Qualified Start] <= MAX(DateTable[Date])
        )
    )
RETURN
DIVIDE(QualifiedPeople, TotalPeople, 0)


Qualified Leaders % by Role = 
VAR TotalPeople = 
    DISTINCTCOUNT(Audits[Name])

VAR QualifiedPeopleByRole = 
    CALCULATE(
        DISTINCTCOUNT(Personnel[Name]),
        FILTER(
            Personnel,
            Personnel[Date Qualified Start] <= MAX(DateTable[Date])
        )
    )

RETURN
DIVIDE(QualifiedPeopleByRole, TotalPeople, 0)


