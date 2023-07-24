// Clear the BigCollection if it already exists
ClearCollect(BigCollection, {});

// Create a variable to store the chunk size (e.g., 1000 records per chunk)
Set(chunkSize, 1000);

// Calculate the total number of records in the data source
Set(totalRecords, CountRows(YourDataSource));

// Use ForAll to loop through the data in chunks
ForAll(
    Split(YourDataSource, chunkSize), // Split the data source into chunks
    // Loop body
    Collect(
        BigCollection,
        ThisRecord // Add the chunk of data to the BigCollection
    )
)
