import os
import csv
import json
from datetime import datetime, timedelta
from dateutil import parser

# Sample JSON data (replace with your actual JSON data)
pswdata_json = '''
[
    {"email": "usera@example.com", "comments": "User A comment", "current": "yes", "first": "2023-01-15", "last": "2023-07-01", "datepwchange": "2023-07-01T05:00:00Z"},
    {"email": "userb@example.com", "comments": "User B comment", "current": "yes", "first": "2023-02-20", "last": "2023-07-15", "datepwchange": "2023-07-15T05:00:00Z"}
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

# Convert string dates in pswdatechange to datetime objects for comparison
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
        'email': entry['email'],
        'comments': entry['comments'],
        'current': entry['current'],
        'first': entry['first'],
        'last': entry['last'],
        'datepwchange': entry['datepwchange']
    }
    
    # Parse the 'datepwchange' using dateutil to handle ISO 8601 format
    date_pwchange = parser.parse(entry['datepwchange'])
    
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
    
    # Calculate the risk status and days until next reset
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
        days_until_reset = None
        risk_status = "No Matching Quarter"
    
    # Add the new calculated columns, including days_until_next_reset
    selected_columns.update({
        'assigned_quarter': assigned_quarter,
        'assigned_quarter_end_date': assigned_quarter_end_date.strftime("%Y-%m-%d") if assigned_quarter_end_date else None,
        'next_reset_date': next_reset_date.strftime("%Y-%m-%d") if next_reset_date else None,
        'risk_status': risk_status,
        'days_until_next_reset': days_until_reset
    })
    
    return selected_columns

# Process each entry in pswdata
processed_data = [process_pswdata_entry(entry, pswdatechange) for entry in pswdata]

# File path for the CSV file
csv_file = "password_data.csv"

# Function to read CSV into a dictionary (skipped if the file doesn't exist)
def read_csv_to_dict(csv_file):
    data = {}
    if os.path.exists(csv_file):
        with open(csv_file, mode='r', newline='') as file:
            reader = csv.DictReader(file)
            for row in reader:
                data[row['email']] = row
    return data

# Function to update or add rows in the CSV file
def update_or_create_csv(csv_file, processed_data):
    # Load existing CSV data into a dictionary for fast lookups
    existing_data = read_csv_to_dict(csv_file) if os.path.exists(csv_file) else {}
    
    # List to hold updated or new rows
    updated_rows = []

    # Process each item in the processed data
    for item in processed_data:
        email = item['email']
        
        if email in existing_data:
            # Email exists, update the previous and current status
            existing_data[email]['previous_status'] = existing_data[email]['current_status']
            existing_data[email]['current_status'] = item['risk_status']
            updated_rows.append(existing_data[email])
        else:
            # New entry, add it with previous_status as None
            item['previous_status'] = None
            item['current_status'] = item['risk_status']
            updated_rows.append(item)
    
    # Write all rows back to the CSV file
    with open(csv_file, mode='w', newline='') as file:
        fieldnames = ['email', 'comments', 'current', 'first', 'last', 'datepwchange', 'assigned_quarter', 
                      'assigned_quarter_end_date', 'next_reset_date', 'risk_status', 'days_until_next_reset', 
                      'previous_status', 'current_status']
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(updated_rows)

# Update or create the CSV file
update_or_create_csv(csv_file, processed_data)

print(f"Data written to {csv_file} successfully.")
