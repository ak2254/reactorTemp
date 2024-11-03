from datetime import datetime, timedelta

# Personnel and leave data
personnel_data = [
    {
        'Last Name': 'Kaur', 
        'First Name': 'Anj', 
        'Role': 'Supervisor', 
        'Area': 'Area 1', 
        'Date Qualified': '2024-07-15', 
        'Target per Month': 5, 
        'Start Date': '2024-07-01', 
        'End Date': '2024-12-31', 
        'Date Left': None
    },
    {
        'Last Name': 'Doe', 
        'First Name': 'John', 
        'Role': 'Technician', 
        'Area': 'Area 2', 
        'Date Qualified': '2024-01-01', 
        'Target per Month': 3, 
        'Start Date': '2024-01-01', 
        'End Date': '2024-06-30', 
        'Date Left': None
    }
]

leave_data = [
    {
        'Last Name': 'Kaur', 
        'First Name': 'Anj', 
        'Start Leave': '2024-07-01', 
        'End Leave': '2024-07-15'
    },
    {
        'Last Name': 'Doe', 
        'First Name': 'John', 
        'Start Leave': '2024-02-01', 
        'End Leave': '2024-02-15'
    }
]

# Helper functions
def parse_date(date_str):
    return datetime.strptime(date_str, '%Y-%m-%d')

def get_month_range(start_date, end_date):
    """Generates a list of (year, month as string) tuples from start_date to end_date."""
    date = start_date.replace(day=1)
    end_date = end_date.replace(day=1)
    months = []
    while date <= end_date:
        months.append((date.year, date.strftime('%b')))  # Format month as "Jan", "Feb", etc.
        if date.month == 12:
            date = date.replace(year=date.year + 1, month=1)
        else:
            date = date.replace(month=date.month + 1)
    return months

def is_on_leave(person, year, month, leave_data):
    """Checks if the person is on leave for the given month and year."""
    for leave in leave_data:
        if leave['First Name'] == person['First Name'] and leave['Last Name'] == person['Last Name']:
            leave_start = parse_date(leave['Start Leave'])
            leave_end = parse_date(leave['End Leave'])
            if leave_start.year == year and leave_start.strftime('%b') == month and leave_start <= leave_end:
                return True
    return False

# Main logic to calculate monthly audit targets
targeted_audits = []

for person in personnel_data:
    start_date = parse_date(person['Start Date'])
    end_date = parse_date(person['End Date']) if person['End Date'] else datetime.now()
    date_qualified = parse_date(person['Date Qualified'])
    target_per_month = person['Target per Month']
    
    # Skip if Date Qualified is beyond the role's End Date
    if date_qualified > end_date:
        continue
    
    # Start auditing from the month after Date Qualified
    audit_start_date = date_qualified + timedelta(days=32)  # Skip to the next month
    audit_start_date = audit_start_date.replace(day=1)
    
    # Generate months for the audit period, considering start, end, and left dates
    months_in_role = get_month_range(max(start_date, audit_start_date), end_date)
    
    for year, month in months_in_role:
        if not is_on_leave(person, year, month, leave_data):
            targeted_audits.append({
                'First Name': person['First Name'],
                'Last Name': person['Last Name'],
                'Role': person['Role'],
                'Year': year,
                'Month': month,
                'Target Audits': target_per_month
            })

# Display the result
for audit in targeted_audits:
    print(audit)
