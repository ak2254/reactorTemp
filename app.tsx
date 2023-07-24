ClearCollect(BigCollection, {}); // Create an empty collection to store the grouped data

ForAll(GroupedEmployees,
    Collect(BigCollection, {
        Department: Result.Department,
        Employees: Result
    })
);
