WRRRP_Count :=
CALCULATE(
    COUNTROWS(YourTable),
    FILTER(
        YourTable,
        YourTable[RequestType] = "wrrrp"
            && (
                ISBLANK(YourTable[AssignedTo])
                || TRIM(YourTable[AssignedTo]) = ""
                || LOWER(YourTable[AssignedTo]) = "anjali"
            )
    )
)
