import requests

# Constants
API_KEY = "your_monday_api_key"  # Replace with your Monday.com API key
BOARD_ID = 123456789  # Replace with your board ID
URL = "https://api.monday.com/v2"
HEADERS = {
    "Authorization": API_KEY,
    "Content-Type": "application/json"
}

# GraphQL query template
QUERY_TEMPLATE = """
query ($board_id: ID!, $limit: Int!, $cursor: String) {
  boards(ids: [$board_id]) {
    items_page(
      limit: $limit
      cursor: $cursor
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

def fetch_records(board_id, limit=500):
    """Fetch all records with pagination."""
    records = []
    cursor = None  # Start without a cursor
    
    while True:
        # Prepare GraphQL query variables
        variables = {
            "board_id": board_id,
            "limit": limit,
            "cursor": cursor
        }
        
        response = requests.post(URL, json={"query": QUERY_TEMPLATE, "variables": variables}, headers=HEADERS)
        data = response.json()
        
        # Extract items and cursor
        items = data.get("data", {}).get("boards", [{}])[0].get("items_page", {}).get("items", [])
        cursor = data.get("data", {}).get("boards", [{}])[0].get("items_page", {}).get("cursor")
        
        if not items:
            break  # Stop if no more items
        
        records.extend(items)  # Append records
        
        print(f"Fetched {len(records)} records...")  # Track progress
        
        if not cursor:
            break  # Stop when cursor is None
    
    return records

# Fetch all records
all_records = fetch_records(BOARD_ID)

# Print total records fetched
print(f"Total records retrieved: {len(all_records)}")






import requests

# Constants
API_KEY = "your_monday_api_key"  # Replace with your Monday.com API key
BOARD_ID = 123456789  # Replace with your board ID
URL = "https://api.monday.com/v2"
HEADERS = {
    "Authorization": API_KEY,
    "Content-Type": "application/json"
}

# GraphQL query template
QUERY_TEMPLATE = """
query ($board_id: ID!, $limit: Int!, $cursor: String) {
  boards(ids: [$board_id]) {
    items_page(
      limit: $limit
      cursor: $cursor
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

def fetch_records(board_id, limit=500):
    """Fetch all records with pagination."""
    records = []
    cursor = None  # Start without a cursor
    
    while True:
        # Prepare GraphQL query variables
        variables = {
            "board_id": board_id,
            "limit": limit,
            "cursor": cursor
        }
        
        response = requests.post(URL, json={"query": QUERY_TEMPLATE, "variables": variables}, headers=HEADERS)
        data = response.json()
        
        # Extract items and cursor
        items = data.get("data", {}).get("boards", [{}])[0].get("items_page", {}).get("items", [])
        cursor = data.get("data", {}).get("boards", [{}])[0].get("items_page", {}).get("cursor")
        
        if not items:
            break  # Stop if no more items
        
        records.extend(items)  # Append records
        
        print(f"Fetched {len(records)} records...")  # Track progress
        
        if not cursor:
            break  # Stop when cursor is None
    
    return records

# Fetch all records
all_records = fetch_records(BOARD_ID)

# Print total records fetched
print(f"Total records retrieved: {len(all_records)}")





import requests

API_KEY = "your_api_key"
URL = "https://api.monday.com/v2"

headers = {
    "Authorization": API_KEY,
    "Content-Type": "application/json"
}

query = """
query ($cursor: String) {
    boards (limit: 5, cursor: $cursor) {
        pageInfo {
            nextCursor
        }
        items {
            id
            name
        }
    }
}
"""

cursor = None  # Start with no cursor

while True:
    variables = {"cursor": cursor}
    response = requests.post(URL, json={"query": query, "variables": variables}, headers=headers)
    data = response.json()

    if "data" in data and "boards" in data["data"]:
        boards = data["data"]["boards"]
        
        for board in boards:
            print(f"Board ID: {board['id']}, Name: {board['name']}")

        # Get next cursor for pagination
        page_info = boards.get("pageInfo", {})
        cursor = page_info.get("nextCursor")

        # Break if no more data
        if not cursor:
            break
    else:
        print("Error or no more data:", data)
        break




import aiohttp
import asyncio
from typing import Dict, List, Optional

# Constants
API_KEY = "your_monday_api_key"
BOARD_ID = "your_board_id"
API_URL = "https://api.monday.com/v2"
BATCH_SIZE = 100  # Monday.com allows a maximum of 100 records per request

# Headers for Monday.com API
headers = {
    "Authorization": API_KEY,
    "Content-Type": "application/json",
}

async def fetch_monday_records(session: aiohttp.ClientSession, cursor: Optional[str] = None) -> Dict:
    """Fetch records from the Monday.com board in batches of 100."""
    query = f"""{{
        boards(ids: {BOARD_ID}) {{
            name
            id
            description
            groups {{
                id
                title
                items_page(limit: {BATCH_SIZE}, cursor: "{cursor or ""}") {{
                    items {{
                        id
                        name
                        column_values {{
                            id
                            text
                            value
                            type
                        }}
                    }}
                    cursor
                }}
            }}
        }}
    }}"""

    async with session.post(API_URL, json={"query": query}, headers=headers) as response:
        data = await response.json()
        if "errors" in data:
            print("API Error:", data["errors"])
            return {}, None

        boards = data.get("data", {}).get("boards", [])
        if not boards:
            print("No boards found.")
            return {}, None

        # Check if the board has groups
        groups = boards[0].get("groups", [])
        if not groups:
            print("No groups found in the board.")
            return {}, None

        # Check if the group has items
        items_page = groups[0].get("items_page", {})
        if not items_page:
            print("No items found in the group.")
            return {}, None

        items = items_page.get("items", [])
        next_cursor = items_page.get("cursor")

        # Convert to a dictionary: {item_id: item_data}
        monday_data = {}
        for item in items:
            item_id = item.get("id")
            if not item_id:
                continue

            item_data = {
                "name": item.get("name", ""),
                "column_values": {
                    col["id"]: {"text": col.get("text", ""), "value": col.get("value", ""), "type": col.get("type", "")}
                    for col in item.get("column_values", [])
                },
            }
            monday_data[item_id] = item_data

        return monday_data, next_cursor

async def fetch_all_monday_records(session: aiohttp.ClientSession) -> Dict:
    """Fetch all records from the Monday.com board using pagination."""
    all_records = {}
    cursor = None
    while True:
        records, cursor = await fetch_monday_records(session, cursor)
        all_records.update(records)
        if not cursor:  # No more records to fetch
            break
    return all_records

async def main():
    """Main function to run the script asynchronously."""
    async with aiohttp.ClientSession() as session:
        # Fetch all records from Monday.com in batches of 100
        monday_data = await fetch_all_monday_records(session)
        print("Fetched records:", monday_data)

if __name__ == "__main__":
    asyncio.run(main())
