// Custom function to fetch data in batches
ClearCollectBatchedData(varStartIndex)
{
    Collect(
        BigCollection,
        Filter(YourDataSource, RowNumber >= varStartIndex && RowNumber < varStartIndex + 2000)
    );
    If(
        varStartIndex + 2000 < CountRows(YourDataSource),
        ClearCollectBatchedData(varStartIndex + 2000)
    )
}


// Initialize variables
Set(varBatchSize, 2000); // Number of rows in each batch
Set(varStartIndex, 1);   // Start index of the current batch
