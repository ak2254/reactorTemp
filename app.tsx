// Clear the BigCollection if it already exists
ClearCollect(BigCollection, {});

// Create a variable to store the chunk size (e.g., 1000 records per chunk)
Set(chunkSize, 1000);

// Calculate the total number of records in the data source
Set(totalRecords, CountRows(YourDataSource));

// Use ForAll to loop through the data in chunks
ForAll(
    Sequence(0, RoundUp(totalRecords / chunkSize) - 1),
    // Loop body
    Collect(
        BigCollection,
        Filter(
            YourDataSource,
            RowNumber >= 1 + chunkSize * Value &&
            RowNumber <= Min(totalRecords, 1 + chunkSize * (Value + 1))
        )
    )
)
