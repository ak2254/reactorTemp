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

