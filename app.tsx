from datetime import datetime
import calendar

def get_last_day(year, month):
    """Returns the last day of a given month."""
    return calendar.monthrange(year, month)[1]

def calculate_leave_days(leave_start, leave_end, year, month):
    """Calculates the number of leave days in a given month."""
    # Convert leave_start and leave_end to datetime objects if they are not already
    leave_start = datetime.strptime(leave_start, "%Y-%m-%d") if isinstance(leave_start, str) else leave_start
    leave_end = datetime.strptime(leave_end, "%Y-%m-%d") if isinstance(leave_end, str) else leave_end

    # If leave_end is None, set it to the last day of the month
    if leave_end is None:
        last_day = datetime(year, month, get_last_day(year, month))
    else:
        last_day = leave_end

    # Ensure leave_start is in the given month
    first_day = datetime(year, month, 1)
    
    if leave_start > last_day or last_day < first_day:
        return 0  # No leave days in the given month

    # Calculate actual leave days within the month
    leave_days = (min(last_day, datetime(year, month, get_last_day(year, month))) - max(leave_start, first_day)).days + 1

    return leave_days

# Example usage
leave_start = "2024-02-20"
leave_end = None  # Person is still on leave
year, month = 2024, 2

print(calculate_leave_days(leave_start, leave_end, year, month))  # Output: 9 (Feb 20-29)



# Get the first day of the next month
if month == 12:
    next_month = datetime(year + 1, 1, 1)  # Handle December
else:
    next_month = datetime(year, month + 1, 1)

# Subtract one day to get the last day of the current month
last_date = (next_month - timedelta(days=1)).strftime("%Y-%m-%d")



from datetime import datetime, timedelta

def is_audit_required(person_name, current_year, current_month, leave_data):
    """
    Checks if a person is required to perform audits in the given month and year.

    - If the person was on leave for more than 15 days in that month, audits are not required.
    - Otherwise, audits are required.

    Parameters:
        person_name (str): The full name of the person (e.g., "John Doe").
        current_year (int): The year to check.
        current_month (int): The month to check.
        leave_data (list): List of leave records [{'Person': 'John Doe', 'Start Date': 'YYYY-MM-DD', 'End Date': 'YYYY-MM-DD'}].

    Returns:
        bool: True if audits are required, False otherwise.
    """
    
    # First day of the current month
    first_day = datetime(current_year, current_month, 1)
    
    # Last day of the current month
    last_day = (first_day + timedelta(days=32)).replace(day=1) - timedelta(days=1)  

    # Track leave days in this month
    leave_days = 0
    
    for leave in leave_data:
        if leave['Person'] != person_name:
            continue  # Skip if name doesn't match

        leave_start = datetime.strptime(leave['Start Date'], "%Y-%m-%d")
        leave_end = datetime.strptime(leave['End Date'], "%Y-%m-%d")

        # If leave starts before this month and ends after this month, take full month
        if leave_start < first_day and leave_end > last_day:
            leave_days += (last_day - first_day).days + 1  # Whole month
        
        # If leave starts in the middle of the month
        elif leave_start >= first_day and leave_start <= last_day:
            leave_days += (min(leave_end, last_day) - leave_start).days + 1  # Count from start to either end or last day
        
        # If leave started before and extends into this month
        elif leave_start < first_day and leave_end >= first_day:
            leave_days += (leave_end - first_day).days + 1  # Count from first day to leave end

    # If leave exceeds 15 days, audits are NOT required
    return leave_days <= 15

# Example Leave Data
leave_records = [
    {"Person": "John Doe", "Start Date": "2024-04-25", "End Date": "2024-05-20"},  # Spans Apr-May
    {
