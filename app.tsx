Quarters Since Last Reset = 
    DATEDIFF([Last Reset Date], TODAY(), QUARTER)

Next Valid Reset Date = 
    SWITCH(
        TRUE(),
        [Quarters Since Last Reset] = 0, 
            SWITCH(
                TRUE(),
                MONTH([Last Reset Date]) IN {1, 2, 3}, DATE(YEAR([Last Reset Date]), 3, 31),
                MONTH([Last Reset Date]) IN {4, 5, 6}, DATE(YEAR([Last Reset Date]), 6, 30),
                MONTH([Last Reset Date]) IN {7, 8, 9}, DATE(YEAR([Last Reset Date]), 9, 30),
                MONTH([Last Reset Date]) IN {10, 11, 12}, DATE(YEAR([Last Reset Date]), 12, 31)
            ),
        [Quarters Since Last Reset] = 1,
            SWITCH(
                TRUE(),
                MONTH([Last Reset Date]) IN {1, 2, 3}, DATE(YEAR(TODAY()), 3, 31),
                MONTH([Last Reset Date]) IN {4, 5, 6}, DATE(YEAR(TODAY()), 6, 30),
                MONTH([Last Reset Date]) IN {7, 8, 9}, DATE(YEAR(TODAY()), 9, 30),
                MONTH([Last Reset Date]) IN {10, 11, 12}, DATE(YEAR(TODAY()), 12, 31)
            ),
        [Quarters Since Last Reset] >= 2,
            SWITCH(
                TRUE(),
                MONTH([Last Reset Date]) IN {1, 2, 3}, DATE(YEAR(TODAY()) + 1, 3, 31),
                MONTH([Last Reset Date]) IN {4, 5, 6}, DATE(YEAR(TODAY()) + 1, 6, 30),
                MONTH([Last Reset Date]) IN {7, 8, 9}, DATE(YEAR(TODAY()) + 1, 9, 30),
                MONTH([Last Reset Date]) IN {10, 11, 12}, DATE(YEAR(TODAY()) + 1, 12, 31)
            )
    )
Days Until Next Reset = DATEDIFF(TODAY(), [Next Quarterly Reset Date], DAY)
Risk Status = 
    SWITCH(
        TRUE(),
        [Days Until Next Reset] <= 7, "At Risk This Week",
        [Days Until Next Reset] <= 21 && [Days Until Next Reset] > 7, "At Risk in 3 Weeks",
        "On Track"
    )
