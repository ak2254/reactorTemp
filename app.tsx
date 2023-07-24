// Clear the BigCollection if it already exists
ClearCollect(BigCollection, {});

// Create a variable to store the chunk size (e.g., 1000 records per chunk)
Set(chunkSize, 1000);

// Calculate the total number of records in the data source
Set(totalRecords, CountRows(YourDataSource));

// Loop to collect data in chunks
For(
    Set(startIndex, 1), // Start index for the loop (e.g., 1)
    startIndex <= totalRecords, // Loop condition
    Set(startIndex, startIndex + chunkSize), // Increment the start index for each iteration
    // Loop body
    Collect(
        BigCollection,
        Filter(
            YourDataSource,
            RowNumber >= startIndex && RowNumber < Min(startIndex + chunkSize, totalRecords + 1)
        )
    )
)
