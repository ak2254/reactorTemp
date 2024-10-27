Completed Audits = 
CALCULATE(
    DISTINCTCOUNT(AuditTable[Area]),
    FILTER(
        AuditTable,
        AuditTable[AuditDate] >= DATE(YEAR(SELECTEDVALUE(DateTable[MonthYear])), MONTH(SELECTEDVALUE(DateTable[MonthYear])), 1) &&
        AuditTable[AuditDate] < EDATE(DATE(YEAR(SELECTEDVALUE(DateTable[MonthYear])), MONTH(SELECTEDVALUE(DateTable[MonthYear])), 1), 1)
    )
)
