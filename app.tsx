Not Completed Areas = 
CALCULATE(
    DISTINCTCOUNT(AreaTable[Area]),
    FILTER(
        AreaTable,
        ISBLANK(
            CALCULATE(
                MAX(AuditTable[AuditDate]),
                FILTER(
                    AuditTable,
                    AuditTable[Area] = AreaTable[Area] &&
                    YEAR(AuditTable[AuditDate]) = YEAR(MAX(AuditTable[AuditDate])) &&
                    MONTH(AuditTable[AuditDate]) = MONTH(MAX(AuditTable[AuditDate]))
                )
            )
        )
    )
)
