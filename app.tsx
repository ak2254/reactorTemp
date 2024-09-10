Risk Status = 
    SWITCH(
        TRUE(),
        [Next Reset Date] <= TODAY(), "Overdue",  // Overdue if the reset date has passed
        DATEDIFF(TODAY(), [Next Reset Date], DAY) = 0, "At Risk Today",  // Exactly today
        DATEDIFF(TODAY(), [Next Reset Date], DAY) <= 7, "In Danger",  // Within 7 days, but not today
        DATEDIFF(TODAY(), [Next Reset Date], DAY) > 7 && DATEDIFF(TODAY(), [Next Reset Date], DAY) <= 14, "At Risk in 2 Weeks",  // Between 7 and 14 days
        DATEDIFF(TODAY(), [Next Reset Date], DAY) > 14 && DATEDIFF(TODAY(), [Next Reset Date], DAY) <= 21, "At Risk",  // Between 14 and 21 days
        "On Track"  // More than 21 days left
    )
