ForAll(
    Sequence(0, RoundUp(CountRows(YourDataSource) / 2000) - 1),
    // Add the current batch of rows to the BigCollection
    AddColumns(
        BigCollection,
        "Batch",
        Filter(YourDataSource, RowNumber >= 1 + 2000 * Value)
    )
)

// Initialize variables
Set(varBatchSize, 2000); // Number of rows in each batch
Set(varStartIndex, 1);   // Start index of the current batch
