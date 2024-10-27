Not Completed Audits = 
COUNTROWS(AreaTable) - 
CALCULATE(
    COUNT(AuditTable[AuditID]), 
    FILTER(
        AuditTable, 
        YEAR(AuditTable[AuditDate]) = YEAR(SELECTEDVALUE(DateTable[Date])) && 
        MONTH(AuditTable[AuditDate]) = MONTH(SELECTEDVALUE(DateTable[Date]))
    )
)
