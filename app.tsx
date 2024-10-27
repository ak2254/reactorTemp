Completed Audits = 
CALCULATE(
    COUNT(AuditTable[AuditID]), 
    FILTER(
        AuditTable,
        AuditTable[Area] = SELECTEDVALUE(AreaTable[Area])  // Ensure this filters by the specific area
    ),
    FILTER(
        DateTable, 
        YEAR(DateTable[Date]) = YEAR(SELECTEDVALUE(DateTable[Date])) &&
        MONTH(DateTable[Date]) = MONTH(SELECTEDVALUE(DateTable[Date]))
    )
)
