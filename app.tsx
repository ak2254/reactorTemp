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
    
    # Define the first and last day of the current month
    first_day = datetime(current_year, current_month, 1)
    last_day = (first_day + timedelta(days=32)).replace(day=1) - timedelta(days=1)  # Last day of the month

    # Count total leave days in this month
    leave_days = 0
    
    for leave in leave_data:
        if leave['Person'] != person_name:
            continue  # Skip if name doesn't match

        leave_start = datetime.strptime(leave['Start Date'], "%Y-%m-%d")
        leave_end = datetime.strptime(leave['End Date'], "%Y-%m-%d")

        # Ensure leave overlaps with this month
        if leave_end < first_day or leave_start > las
