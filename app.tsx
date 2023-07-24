// Step 2: Create the new collection to hold combined records
ClearCollect(CombinedCollection, {});

// Step 3: Loop through the rows of the initial collection
ForAll(InitialCollection,
    // Step 4: Extract and combine records from the table column
    Collect(CombinedCollection,
        AddColumns(Data, 'RecordID', ID, 'RecordName', Name)
    )
);
