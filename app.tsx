// Collect data in batches of 2000 rows each
ForAll(
    Split(YourDataSource, 2000), // Split the data source into batches of 2000 rows
    Patch(
        BigCollection,
        Defaults(BigCollection),
        ThisRecord
    )
)
// Initialize variables
Set(varBatchSize, 2000); // Number of rows in each batch
Set(varStartIndex, 1);   // Start index of the current batch
