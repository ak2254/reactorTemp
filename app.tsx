KPI % = 
VAR SelectedQuestion = SELECTEDVALUE(QuestionTable[Question])
RETURN
    SWITCH(
        SelectedQuestion,
        "OOT Requests Created", DIVIDE([OOT Requests], [Target WO], 0),
        "Open OOT WOs > 30 Days", 
            VAR ootCount = [OOT Open > 30 Days]
            VAR target = [Target WO]
            RETURN 1 - DIVIDE(ootCount, target + ootCount)
    )
