ClearCollect(CombinedCollection,
    ForAll(DataSet1, // Iterate through the first dataset
        ForAll(Filter(DataSet2, Project = DataSet1.Project && Resource = DataSet1.Resource), // Filter the second dataset based on Project and Resource
            If(taskType = "daily", // Check if the taskType is "daily"
                ForAll(
                    Filter(
                        AddColumns(
                            AddColumns(
                                AddColumns(
                                    Sequence(
                                        DateDiff(DateValue(DataSet1.[Start Date]), DateValue(DataSet1.[End Date]), Days) + 1,
                                        DateValue(DataSet1.[Start Date])
                                    ),
                                    "SAP", SAP,
                                    "Project", Project,
                                    "Sample no", SampleNo
                                ),
                                "Start Date", DateAdd(DateValue(DataSet1.[Start Date]), daystart - 1, Days)
                            ),
                            "Sample date", DateAdd([Start Date], Value(Text(ThisItem.Value, "[$-en-US]")), Days)
                        ),
                        true
                    ),
                    { "Sample date": [Sample date], "SAP": SAP, "Project": Project, "Sample no": SampleNo }
                ),
                { "Sample date": DateAdd(DateValue(DataSet1.[End Date]), -DayStart), "SAP": SAP, "Project": Project, "Sample no": SampleNo } // Create last day samples
            )
        )
    )
)
