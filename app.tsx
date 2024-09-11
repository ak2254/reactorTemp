import json
from datetime import datetime, timedelta

# Sample JSON data
pswdata_json = '''
[
    {"comments": "User A comment", "current": "yes", "first": "2023-01-15", "last": "2023-07-01", "datepwchange": "2023-07-01", "extra_column1": "extra1"},
    {"comments": "User B comment", "current": "yes", "first": "2023-02-20", "last": "2023-07-15", "datepwchange": "2023-07-15", "extra_column2": "extra2"}
]
'''

pswdatechange_json = '''
[
    {"quarter": "Q1 2023", "start_date": "2023-01-01", "end_date": "2023-03-31"},
    {"quarter": "Q2 2023", "start_date": "2023-04-01", "end_date": "2023-06-30"},
    {"quarter": "Q3 2023", "start_date": "2023-07-01", "end_date": "2023-09-30"}
]
'''

# Load JSON data into Python objects (lists of dictionaries)
pswdata = json.loads(pswdata_json)
pswdatechange = json.loads(pswdatechange_json)

# Convert string dates to datetime objects for comparison
def convert_dates(data):
    for entry in data:
        entry['start_date'] = datetime.strptime(entry['start_date'], "%Y-%m-%d")
        entry['end_date'] = datetime.strptime(entry['end_date'], "%Y-%m-%d")
    return data

pswdatechange = convert_dates(pswdatechange)

# Function to process password data entries
def process_pswdata_entry(entry, pswdatechange):
    # Keep only selected columns from the original JSON
    selected_columns = {
        'comments': entry['comments'],
        'current': entry['current'],
        'first': entry['first'],
        'last': entry['last'],
        'datepwchange': entry['datepwchange']
    }
    
    # Convert the 'datepwchange' to a datetime object
    date_pwchange = datetime.strptime(entry['datepwchange'], "%Y-%m-%d")
    
    # Find the matching quarter based on 'datepwchange'
    assigned_quarter = None
    assigned_quarter_end_date = None
    for quarter in pswdatechange:
        if quarter['start_date'] <= date_pwchange <= quarter['end_date']:
            assigned_quarter = quarter['quarter']
            assigned_quarter_end_date = quarter['end_date']
            break
    
    # Calculate the next reset date (90 days after the quarter end date)
    if assigned_quarter_end_date:
        next_reset_date = assigned_quarter_end_date + timedelta(days=90)
    else:
        next_reset_date = None
    
    # Calculate the risk status based on the next reset date
    if next_reset_date:
        days_until_reset = (next_reset_date - datetime.today()).days
        
        if days_until_reset < 0:
            risk_status = "Overdue"
        elif days_until_reset <= 7:
            risk_status = "In Danger"
        elif days_until_reset <= 21:
            risk_status = "At Risk"
        else:
            risk_status = "On Track"
    else:
        risk_status = "No Matching Quarter"
    
    # Add the new calculated columns
    selected_columns.update({
        'assigned_quarter': assigned_quarter,
        'assigned_quarter_end_date': assigned_quarter_end_date.strftime("%Y-%m-%d") if assigned_quarter_end_date else None,
        'next_reset_date': next_reset_date.strftime("%Y-%m-%d") if next_reset_date else None,
        'risk_status': risk_status
    })
    
    return selected_columns

# Process each entry in pswdata
processed_data = [process_pswdata_entry(entry, pswdatechange) for entry in pswdata]

# Print the processed data
for item in processed_data:
    print(item)
