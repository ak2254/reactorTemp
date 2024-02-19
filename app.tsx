Concatenate(
                     Left(OriginalName, Find(",", OriginalName) - 1), // Lastname
                     ", ",
                     Mid(OriginalName, Find(",", OriginalName) + 2, Find(" ", OriginalName, Find(",", OriginalName) + 2) - Find(",", OriginalName) - 2) // Firstname
                 )
