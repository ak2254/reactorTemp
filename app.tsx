def hash_record(record, all_keys):
    """Generate a hash for a formatted record, ensuring all keys exist."""
    
    # Ensure record has all keys, filling missing ones with None
    normalized_record = {key: record.get(key, None) for key in all_keys}
    
    # Convert to sorted JSON string for consistent hashing
    record_str = json.dumps(normalized_record, sort_keys=True)
    
    return hashlib.sha256(record_str.encode()).hexdigest()

# Extract all unique keys from original_data
all_keys = {key for record in original_data for key in record.keys()}

# Create hashes for Monday formatted data
monday_hashed = {record["Work Order"]: hash_record(record, all_keys) for record in monday_formatted_data}

# Create hashes for original data
original_hashed = {record["Work Order"]: hash_record(record, all_keys) for record in original_data}

# Find records that need to be deleted (exist in Monday but changed)
records_to_delete = [
    monday_item["item_id"] for monday_item in monday_formatted_data
    if monday_item["Work Order"] in original_hashed and 
    monday_hashed[monday_item["Work Order"]] != original_hashed[monday_item["Work Order"]]
]

# Find records that need to be added (new or changed)
records_to_add = [
    record for record in original_data
    if record["Work Order"] not in monday_hashed or 
    hash_record(record, all_keys) != monday_hashed[record["Work Order"]]
]




def hash_record(record, all_keys):
    """Generate a hash for a formatted record, ensuring all keys exist."""
    
    # Ensure record has all keys, filling missing ones with None
    normalized_record = {key: record.get(key, None) for key in all_keys}
    
    # Convert to sorted JSON string for consistent hashing
    record_str = json.dumps(normalized_record, sort_keys=True)
    
    return hashlib.sha256(record_str.encode()).hexdigest()



def hash_record(record):
    """Generate a hash for a record by converting it to a consistent JSON string."""
    # Ensure record is sorted to prevent hash mismatches due to key order
    record_str = json.dumps(record, sort_keys=True)
    
    # Create SHA256 hash
    return hashlib.sha256(record_str.encode()).hexdigest()


def find_records_to_replace(monday_data, original_data):
    """Find items where Work Order exists but has different hash values."""
    
    # Convert original data into a dictionary with hashes
    original_lookup = {
        record["Work Order"]: {"hash": hash_record(record), "record": record}
        for record in original_data
    }

    records_to_delete = []  # Store item_ids to delete
    records_to_add = []  # Store new records to add

    for monday_item in monday_data:
        work_order = monday_item.get("Work Order")
        item_id = monday_item.get("item_id")

        # Check if Work Order exists in original data
        if work_order in original_lookup:
            original_hash = original_lookup[work_order]["hash"]
            monday_hash = hash_record(monday_item)

            # If hashes are different, mark for deletion & re-add
            if original_hash != monday_hash:
                records_to_delete.append(item_id)
                records_to_add.append(original_lookup[work_order]["record"])

    return records_to_delete, records_to_add




def find_work_orders_to_delete(monday_records, existing_data):
    """
    Find 'Work Order' values in Monday.com data that are NOT in the original data.
    Collect their corresponding item IDs for deletion.
    """
    # Convert original data into a set of Work Order values
    original_work_orders = {record.get("Work Order", "").strip() for record in existing_data}

    # Store item IDs of work orders that should be deleted
    work_orders_to_delete = []

    for record in monday_records:
        work_order = record.get("Work Order", "").strip()
        item_id = record.get("item_id")  # Extract the item ID from Monday data

        if work_order and work_order not in original_work_orders and item_id:
            work_orders_to_delete.append(item_id)

    return work_orders_to_delete


# Example Monday data (formatted from API response)
monday_data = [
    {"Work Order": "WO123", "item_id": 111}, 
    {"Work Order": "WO456", "item_id": 222},
    {"Work Order": "WO999", "item_id": 333}  # This work order is NOT in original data
]

# Example original dataset
existing_data = [
    {"Work Order": "WO123", "Column A": "Value A"},
    {"Work Order": "WO456", "Column B": "Value B"},
]

# Find Work Orders to delete
item_ids_to_delete = find_work_orders_to_delete(monday_data, existing_data)

# Output results
print(f"Total records to delete: {len(item_ids_to_delete)}")
print("Item IDs to delete:", item_ids_to_delete)








def find_missing_work_orders(monday_records, existing_data):
    """
    Find 'Work Order' values in existing data that are NOT present in Monday data.
    """
    # Convert Monday records into a set of Work Order values
    monday_work_orders = {record.get("Work Order", "").strip() for record in monday_records}

    # Store missing records
    add_tomonday_data = []

    for record in existing_data:
        work_order = record.get("Work Order", "").strip()
        
        if work_order and work_order not in monday_work_orders:
            add_tomonday_data.append(record)

    return add_tomonday_data




def format_monday_data(monday_records):
    """Convert Monday.com response into a list of dictionaries with column names as keys."""
    formatted_records = []

    for item in monday_records:
        formatted_item = {}

        # Add name field if needed
        if "name" in item:
            formatted_item["Name"] = item["name"]

        # Extract column values
        for col in item.get("column_values", []):
            column_name = col.get("column", {}).get("title", "Unknown Column")
            text_value = col.get("text", "")

            formatted_item[column_name] = text_value  # Store formatted key-value pair

        formatted_records.append(formatted_item)

    return formatted_records





import requests

# Constants
API_KEY = "your_monday_api_key"  # Replace with your actual API key
BOARD_ID = 123456789  # Replace with your board ID
URL = "https://api.monday.com/v2"
HEADERS = {
    "Authorization": API_KEY,
    "Content-Type": "application/json"
}

# GraphQL query templates
QUERY_FIRST_PAGE = """
query ($board_id: ID!, $limit: Int!) {
  boards(ids: [$board_id]) {
    items_page(
      limit: $limit
      query_params: { order_by: [{ column_id: "name", direction: desc }] }
    ) {
      cursor
      items {
        name
        column_values {
          column {
            title
          }
          text
        }
      }
    }
  }
}
"""

QUERY_NEXT_PAGE = """
query ($board_id: ID!, $limit: Int!, $cursor: String!) {
  boards(ids: [$board_id]) {
    items_page(
      limit: $limit
      cursor: $cursor
    ) {
      cursor
      items {
        name
        column_values {
          column {
            title
          }
          text
        }
      }
    }
  }
}
"""

def fetch_all_records(board_id, limit=500):
    """Fetch all records from Monday.com with proper pagination."""
    records = []
    cursor = None
    first_request = True  # Used to differentiate the first request

    while True:
        # Select the appropriate query
        if first_request:
            query = QUERY_FIRST_PAGE
            variables = {"board_id": board_id, "limit": limit}
            first_request = False
        else:
            query = QUERY_NEXT_PAGE
            variables = {"board_id": board_id, "limit": limit, "cursor": cursor}

        try:
            # Make the request
            response = requests.post(URL, json={"query": query, "variables": variables}, headers=HEADERS)
            response.raise_for_status()  # Raise an error for HTTP failures
            
            # Parse JSON response
            data = response.json()

            # Extract board data
            boards = data.get("data", {}).get("boards", [])
            if not boards or boards[0] is None:
                print("No boards found or invalid response structure.")
                break

            items_page = boards[0].get("items_page", {})
            items = items_page.get("items", [])
            cursor = items_page.get("cursor")  # Get next page cursor

            if items is None:
                print("Warning: 'items' is None. Possible API issue.")
                break

            records.extend(items)  # Store retrieved records

            print(f"Fetched {len(records)} records so far...")  # Progress tracking

            if not cursor:  # Stop fetching if there's no more cursor
                break

        except requests.exceptions.RequestException as e:
            print(f"Request failed: {e}")
            break
        except Exception as e:
            print(f"Unexpected error: {e}")
            break

    return records

# Fetch all records
all_records = fetch_all_records(BOARD_ID)

# Print total count
print(f"Total records retrieved: {len(all_records)}")
