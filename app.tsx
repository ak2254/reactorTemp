Not Completed Areas = 
CALCULATE(
    DISTINCTCOUNT(AreaTable[Area]),
    EXCEPT(
        VALUES(AreaTable[Area]),
        CALCULATETABLE(
            VALUES(AuditTable[Area]),
            FILTER(
                ALL(AuditTable),
                YEAR(AuditTable[AuditDate]) = YEAR(MAX(AuditTable[AuditDate])) &&
                MONTH(AuditTable[AuditDate]) = MONTH(MAX(AuditTable[AuditDate]))
            )
        )
    )
)

