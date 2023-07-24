// Formula to collect data in batches
Collect(
    BigCollection,
    {
        Batch: Filter(YourDataSource, RowNumber >= 1 + 2000 * CountRows(BigCollection), RowNumber <= 2000 + 2000 * CountRows(BigCollection))
    }
)

// Initialize variables
Set(varBatchSize, 2000); // Number of rows in each batch
Set(varStartIndex, 1);   // Start index of the current batch
