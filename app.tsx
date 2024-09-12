from office365.sharepoint.client_context import ClientContext
from office365.runtime.auth.client_credential import ClientCredential
import io
import csv
from datetime import datetime, timedelta
from dateutil import parser

# SharePoint authentication details
sharepoint_site_url = "https://your-sharepoint-site-url"
client_id = "your-client-id"
client_secret = "your-client-secret"
csv_file_url = "/sites/your-site/Shared Documents/password_data.csv"  # Path to the CSV file on SharePoint

# Authenticate to SharePoint
credentials = ClientCredential(client_id, client_secret)
ctx = ClientContext(sharepoint_site_url).with_credentials(credentials)

# Function to download CSV file from SharePoint and write to binaryIO handle
def download_csv_from_sharepoint(ctx, csv_file_url, handle):
    response = ctx.web.get_file_by_server_relative_url(csv_file_url).download().execute_query()
    handle.write(response.content)  # Write binary content to the binaryIO handle
    handle.seek(0)  # Move the cursor back to the beginning of the file

# Function to upload CSV file to SharePoint
def upload_csv_to_sharepoint(ctx, csv_file_url, csv_content):
    file_content = csv_content.encode('utf-8')  # Encode back to bytes
    target_file = ctx.web.get_file_by_server_relative_url(csv_file_url)
    target_file.upload(file_content).execute_query()

# Simulate the binaryIO handle using io.BytesIO
binary_io_handle = io.BytesIO()

# Download the CSV file from SharePoint into the binaryIO object
download_csv_from_sharepoint(ctx, csv_file_url, binary_io_handle)

# Decode the binaryIO content to string and process it
csv_string = binary_io_handle.getvalue().decode('utf-8')

# Read the CSV content using csv.DictReader
csv_file = io.StringIO(csv_string)
reader = csv.DictReader(csv_file)

# Load existing data from CSV into a dictionary
existing_data = {}
for row in reader:
    existing_data[row['email']] = row

# Sample data for processing (simulated JSON input)
pswdata_json = '''
[
    {"email": "usera@example.com", "comments": "User A updated comment", "current": "yes", "first": "2023-01-15", "last": "2023-07-01", "datepwchange": "2023-07-01T05:00:00Z"},
    {"email": "userb@example.com", "comments": "User B updated comment", "current": "yes", "first": "2023-02-20", "last": "2023-07-15", "datepwchange": "2023-07-15T05:00:00Z"}
]
'''

pswdatechange_json = '''
[
    {"quarter": "Q1 2023", "start_date": "2023-01-01", "end_date": "2023-03-31"},
    {"quarter": "Q2 2023", "start_date": "2023-04-01", "end_date": "2023-06-30"},
    {"quarter": "Q3 2023", "start_date": "2023-07-01", "end_date": "2023-09-30"}
]
'''

# Convert string dates in pswdatechange to datetime objects for comparison
def convert_dates(data):
    for entry in data:
        entry['start_date'] = datetime.strptime(entry['start_date'], "%Y-%m-%d")
        entry['end_date'] = datetime.strptime(entry['end_date'], "%Y-%m-%d")
    return data

pswdatechange = convert_dates(json.loads(pswdatechange_json))

# Function to process password data entries
def process_pswdata_entry(entry, pswdatechange):
    selected_columns = {
        'email': entry['email'],
        'comments': entry['comments'],
        'current': entry['current'],
        'first': entry['first'],
        'last': entry['last'],
        'datepwchange': entry['datepwchange']
    }
    date_pwchange = parser.parse(entry['datepwchange'])
    assigned_quarter = None
    assigned_quarter_end_date = None
    for quarter in pswdatechange:
        if quarter['start_date'] <= date_pwchange <= quarter['end_date']:
            assigned_quarter = quarter['quarter']
            assigned_quarter_end_date = quarter['end_date']
            break
    next_reset_date = assigned_quarter_end_date + timedelta(days=90) if assigned_quarter_end_date else None
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
    selected_columns.update({
        'assigned_quarter': assigned_quarter,
        'assigned_quarter_end_date': assigned_quarter_end_date.strftime("%Y-%m-%d") if assigned_quarter_end_date else None,
        'next_reset_date': next_reset_date.strftime("%Y-%m-%d") if next_reset_date else None,
        'risk_status': risk_status,
        'days_until_next_reset': days_until_reset
    })
    return selected_columns

# Process new data (this is simulated data from a JSON input)
processed_data = [process_pswdata_entry(entry, pswdatechange) for entry in json.loads(pswdata_json)]

# Update the existing data with new information
for item in processed_data:
    email = item['email']
    if email in existing_data:
        existing_data[email]['previous_status'] = existing_data[email]['current_status']
        existing_data[email]['current_status'] = item['risk_status']
    else:
        item['previous_status'] = None
        item['current_status'] = item['risk_status']
        existing_data[email] = item

# Write updated data back to CSV format
output = io.StringIO()
fieldnames = existing_data[next(iter(existing_data))].keys()
writer = csv.DictWriter(output, fieldnames=fieldnames)
writer.writeheader()
writer.writerows(existing_data.values())
csv_updated_content = output.getvalue()

# Upload the updated CSV file back to SharePoint
upload_csv_to_sharepoint(ctx, csv_file_url, csv_updated_content)

print("CSV file updated on SharePoint successfully.")
