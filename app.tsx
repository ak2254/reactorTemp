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
