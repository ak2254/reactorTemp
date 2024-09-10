Assigned Quarter = 
CALCULATE(
    MAX('Quarter Table'[Quarter ID]), 
    FILTER(
        'Quarter Table',
        'Quarter Table'[start_date] <= 'Password Reset Table'[last_pwreset] &&
        'Quarter Table'[end_date] >= 'Password Reset Table'[last_pwreset]
    )
)
