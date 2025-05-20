KPI % = 
VAR selectedQuestion = SELECTEDVALUE(QuestionTable[Question])
VAR target = 
    SWITCH(
        selectedQuestion,
        "OOT Requests Created", 8,
        "Open OOT WOs > 30 Days", 0
    )
VAR result = 
    SWITCH(
        selectedQuestion,
        "OOT Requests Created",
            CALCULATE(
                DIVIDE(COUNTROWS(WorkOrders), target, 0),
                TREATAS(VALUES(DateTable[Date]), WorkOrders[CreateDate]),
                WorkOrders[WorkOrderType] = "OOT"
            ),
        "Open OOT WOs > 30 Days",
            VAR openCount = CALCULATE(
                COUNTROWS(WorkOrders),
                TREATAS(VALUES(DateTable[Date]), WorkOrders[CreateDate]),
                WorkOrders[WorkOrderType] = "OOT",
                WorkOrders[Status] = "Open",
                DATEDIFF(WorkOrders[CreateDate], TODAY(), DAY) > 30
            )
            RETURN
                1 - DIVIDE(openCount, target + openCount)
    )
RETURN
    result

