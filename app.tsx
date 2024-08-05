DirectReports = 
SELECTCOLUMNS(
    TrainingData,
    "ManagerID", TrainingData[ManagerID],
    "UserID", TrainingData[UserID]
)
HierarchyTable = 
VAR DirectReportsTable = 
    SELECTCOLUMNS(
        TrainingData,
        "ManagerID", TrainingData[ManagerID],
        "UserID", TrainingData[UserID]
    )
VAR RecursiveHierarchy =
    ADDCOLUMNS(
        DirectReportsTable,
        "AllReports", 
        PATH(DirectReportsTable[UserID], DirectReportsTable[ManagerID])
    )
RETURN
    GENERATE(
        RecursiveHierarchy,
        VAR CurrentUser = [UserID]
        VAR PathLength = PATHLENGTH([AllReports])
        RETURN
            ADDCOLUMNS(
                GENERATESERIES(1, PathLength),
                "PathUserID", PATHITEM([AllReports], [Value]),
                "PathManagerID", [ManagerID]
            )
    )
