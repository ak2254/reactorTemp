HierarchyTable = 
VAR AllUsers = DISTINCT(TrainingData[UserID])
VAR AllManagers = DISTINCT(TrainingData[ManagerID])
VAR Combined =
    UNION(
        SELECTCOLUMNS(
            TrainingData,
            "ManagerID", TrainingData[ManagerID],
            "UserID", TrainingData[UserID]
        ),
        SELECTCOLUMNS(
            TrainingData,
            "ManagerID", BLANK(),
            "UserID", TrainingData[ManagerID]
        )
    )
VAR RecursiveHierarchy =
    ADDCOLUMNS(
        CROSSJOIN(AllUsers, AllManagers),
        "ManagerChain",
        VAR CurrentUser = [UserID]
        VAR CurrentManager = 
            CALCULATE(
                MAXX(
                    FILTER(
                        Combined,
                        Combined[UserID] = CurrentUser
                    ),
                    Combined[ManagerID]
                )
            )
        VAR Chain =
            IF(
                NOT(ISBLANK(CurrentManager)),
                PATH(CurrentManager, CurrentUser)
            )
        RETURN
            Chain
    )
RETURN
    ADDCOLUMNS(
        FILTER(
            RecursiveHierarchy,
            NOT(ISBLANK([ManagerChain]))
        ),
        "PathUserID", [UserID],
        "PathManagerID", PATHITEM([ManagerChain], 1, INTEGER)
    )
Define Relationships

Set up the relationships in your Power BI model:

HierarchyTable[PathUserID] should be related to TrainingData[UserID]
HierarchyTable[PathManagerID] should be related to TrainingData[ManagerID]
Create Measures and Visualizations

Measure for Total Reports:

DAX
Copy code
TotalReports = 
CALCULATE(
    COUNTROWS(TrainingData),
    TREATAS(
        VALUES(HierarchyTable[PathUserID]),
        TrainingData[UserID]
    )
)
