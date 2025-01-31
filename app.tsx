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

# Dictionary mapping from input to Monday columns
column_mapping = {
    "asset": "item",
    "location": "location",
    "suite": "suite",  # Can be blank
    "wo": "work order",
    "wo description": "WO Description",
    "owner dpt": "owner dpt",
    "status": "status",
    "work type": "work type",
    "work group": "work group",
    "owner": "owner",
    "reported by": "reported by",
    "reported date": "reported date"
}

# Function to create items in bulk
def create_items_bulk(board_id, items_data):
    # Convert input dictionary to match Monday's format
    items_payload = []
    for item in items_data:
        formatted_item = {column_mapping.get(k, k): v for k, v in item.items()}
        items_payload.append(f'{{item_name: "{formatted_item["item"]}", column_values: {formatted_item}}}')
    
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

# Example list of dictionaries (replace with real data)
items_list = [
    {
        "asset": "Pump A",
        "location": "Site 1",
        "suite": "",
        "wo": "WO-12345",
        "wo description": "Fix leak",
        "owner dpt": "Maintenance",
        "status": "Open",
        "work type": "Repair",
        "work group": "Mechanical",
        "owner": "John Doe",
        "reported by": "Jane Smith",
        "reported date": "2025-01-31"
    },
    {
        "asset": "Boiler B",
        "location": "Site 2",
        "suite": "",
        "wo": "WO-67890",
        "wo description": "Inspect pressure",
        "owner dpt": "Operations",
        "status": "In Progress",
        "work type": "Inspection",
        "work group": "Safety",
        "owner": "Alice Johnson",
        "reported by": "Bob Williams",
        "reported date": "2025-01-31"
    }
]

# Run the batch creation
batch_create_items(BOARD_ID, items_list)
