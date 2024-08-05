HierarchyTable = 
VAR AllUsers = DISTINCT(TrainingData[UserID])
VAR AllManagers = DISTINCT(Managers[ManagerID])
VAR Combined = UNION(
    SELECTCOLUMNS(
        TrainingData,
        "ManagerID", TrainingData[ManagerID],
        "UserID", TrainingData[UserID]
    ),
    SELECTCOLUMNS(
        TrainingData,
        "ManagerID", BLANK(), // Blank if the UserID is not a Manager
        "UserID", TrainingData[ManagerID]
    )
)
VAR RecursiveHierarchy = 
    GENERATE(
        Combined,
        VAR CurrentUser = [UserID]
        VAR ManagerChain = PATH(
            MAXX(
                FILTER(
                    Combined,
                    Combined[UserID] = CurrentUser
                ),
                Combined[ManagerID]
            ),
            CurrentUser
        )
        RETURN
            ADDCOLUMNS(
                FILTER(
                    Combined,
                    PATHCONTAINS(ManagerChain, Combined[UserID])
                ),
                "PathUserID", [UserID],
                "PathManagerID", [ManagerID]
            )
    )
RETURN
    RecursiveHierarchy






VAR CurrentManager = 
            CALCULATE(
                MAX(Combined[ManagerID]),
                FILTER(
                    Combined,
                    Combined[UserID] = CurrentUser
                )
            )
        VAR ManagerChain =
            PATH(
                CurrentManager,
                CurrentUser
            )
        RETURN
            ADDCOLUMNS(
                FILTER(
                    Combined,
                    PATHCONTAINS(ManagerChain, Combined[UserID])
                ),
                "PathUserID", [UserID],
                "PathManagerID", [ManagerID]
            )
    )
RETURN
    DISTINCT(RecursiveHierarchy)
