// Step 1: Create a new collection to store the distinct values and their IDs
ClearCollect(DistinctTable, {})

// Step 2: Iterate through the "srecords" table to find distinct values and assign IDs
ForAll(srecords,
    {
        // Extract the value from the "k" column (you can modify this part based on the data type of "k" column)
        "Value": ThisItem.k,
        // Add an integer ID starting from 1 for each distinct value
        "ID": If(
                 IsBlank(LookUp(DistinctTable, Value = ThisItem.k, ID)),
                 CountRows(DistinctTable) + 1,
                 LookUp(DistinctTable, Value = ThisItem.k, ID)
             )
    }
)

