import requests

API_KEY = "your_api_key"
BOARD_ID = 123456789
URL = "https://api.monday.com/v2"

HEADERS = {
    "Authorization": API_KEY,
    "Content-Type": "application/json"
}

# GraphQL query to get all item IDs
GET_ITEMS_QUERY = """
query ($board_id: [Int!]) {
  boards (ids: $board_id) {
    items {
      id
    }
  }
}
"""

# GraphQL mutation to archive an item
ARCHIVE_ITEM_QUERY = """
mutation ($item_id: Int!) {
  archive_item (item_id: $item_id) {
    id
  }
}
"""

def get_all_item_ids():
    """Fetch all item IDs from the board."""
    payload = {
        "query": GET_ITEMS_QUERY,
        "variables": {"board_id": BOARD_ID}
    }
    response = requests.post(URL, headers=HEADERS, json=payload)
    data = response.json()
    return [item["id"] for item in data["data"]["boards"][0]["items"]]

def archive_all_items():
    """Archive all items from the board."""
    item_ids = get_all_item_ids()
    for item_id in item_ids:
        payload = {
            "query": ARCHIVE_ITEM_QUERY,
            "variables": {"item_id": item_id}
        }
        response = requests.post(URL, headers=HEADERS, json=payload)
        if response.status_code == 200:
            print(f"Archived item ID {item_id}")
        else:
            print(f"Error archiving item {item_id}: {response.text}")

# Run the script
archive_all_items()
