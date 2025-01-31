import json
import requests

# Monday.com API Details
API_KEY = "your_api_key"  # Replace with your actual API key
BOARD_ID = "your_board_id"  # Replace with your board ID
API_URL = "https://api.monday.com/v2"

HEADERS = {
    "Authorization": API_KEY,
    "Content-Type": "application/json"
}

# Data to insert (Modify as needed)
item_data = {
    "asset": "Pump A",  # This is mapped to both 'asset' and 'item'
    "location": "Site 1",
    "wo": "WO-12345",
    "wo description": "Fix leak",
    "owner dpt": "Maintenance",
    "status": "Open",
    "work type": "Repair",
    "work group": "Mechanical",
    "owner": "John Doe",
    "reported by": "Jane Smith",
    "reported date": "2025-01-31"  # Handle {c} separately if needed
}

# Mapping dictionary
column_mapping = {
    "asset": ["asset", "item"],  # Assign 'asset' to both 'asset' and 'item'
    "location": "location",
    "wo": "work_order",
    "wo description": "wo_description",
    "owner dpt": "owner_dpt",
    "status": "status",
    "work type": "work_type",
    "work group": "work_group",
    "owner": "owner",
    "reported by": "reported_by",
    "reported date": "reported_date"
}

# Format column values for Monday.com
formatted_columns = {}

for key, value in item_data.items():
    mapped_columns = column_mapping.get(key, key)
    
    if isinstance(mapped_columns, list):  # If key maps to multiple columns
        for mapped_col in mapped_columns:
            formatted_columns[mapped_col] = value
    else:
        formatted_columns[mapped_columns] = value

formatted_columns["suite"] = ""  # Default blank for 'suite'

# Convert to JSON format required by Monday.com
column_values_json = json.dumps(formatted_columns)

# GraphQL mutation query
mutation = f"""
mutation {{
    create_item (
        board_id: {BOARD_ID},
        item_name: "{formatted_columns['item']}",
        column_values: {column_values_json}
    ) {{
        id
    }}
}}
"""

# Send request
response = requests.post(API_URL, json={"query": mutation}, headers=HEADERS)
data = response.json()

# Output response
print(json.dumps(data, indent=2))










import json
import requests
import time
from itertools import islice

API_KEY = "your_api_key"
BOARD_ID = "your_board_id"
API_URL = "https://api.monday.com/v2"

HEADERS = {
    "Authorization": API_KEY,
    "Content-Type": "application/json"
}

# Dictionary mapping input data to Monday.com column titles
column_mapping = {
    "asset": ["asset", "item"],  # Mapping "asset" to both "asset" and "item"
    "location": "location",
    "wo": "work order",
    "wo description": "WO Description",
    "owner dpt": "owner dpt",
    "status": "status",
    "work type": "work type",
    "work group": "work group",
    "owner": "owner",
    "reported by": "reported by",
    "reported date": "{{c}}reported date"  # Escaping {c} properly
}

# Function to create items in bulk
def create_items_bulk(board_id, items_data):
    items_payload = []
    
    for item in items_data:
        formatted_item = {}

        for key, value in item.items():
            mapped_columns = column_mapping.get(key, key)

            if isinstance(mapped_columns, list):  # If a field is mapped to multiple columns
                for mapped_col in mapped_columns:
                    formatted_item[mapped_col] = value
            else:
                formatted_item[mapped_columns] = value

        formatted_item["suite"] = ""  # Ensure suite is always blank

        # Convert values to JSON-safe format
        column_values_json = json.dumps(formatted_item)

        items_payload.append(f'{{"item_name": "{formatted_item["item"]}", "column_values": {column_values_json}}}')
    
    mutation = f"""
    mutation {{
        create_items(board_id: {board_id}, items: [
            {', '.join(items_payload)}
        ]) {{
            id
        }}
    }}
    """
    
    response = requests.post(API_URL, json={"query": mutation}, headers=HEADERS)
    data = response.json()
    
    if "errors" in data:
        print(f"Error creating items: {data['errors']}")
    else:
        print(f"Created {len(items_data)} items successfully.")

# Function to create new items in batches
def batch_create_items(board_id, items_data, batch_size=10):
    iterator = iter(items_data)
    while batch := list(islice(iterator, batch_size)):
        create_items_bulk(board_id, batch)
        time.sleep(1)  # Prevent hitting rate limits

# Example list of dictionaries
items_list = [
    {
        "asset": "Pump A",
        "location": "Site 1",
        "wo": "WO-12345",
        "wo description": "Fix leak",
        "owner dpt": "Maintenance",
        "status": "Open",
        "work type": "Repair",
        "work group": "Mechanical",
        "owner": "John Doe",
        "reported by": "Jane Smith",
        "{{c}}reported date": "2025-01-31"
    }
]

# Run the batch creation
batch_create_items(BOARD_ID, items_list)
