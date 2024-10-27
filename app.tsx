Not Completed Areas = 
CALCULATE(
    DISTINCTCOUNT(AreaTable[Area]),
    FILTER(
        AreaTable,
        NOT(
            AreaTable[Area] IN 
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
)

