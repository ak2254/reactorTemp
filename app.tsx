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
    """Fetch all records with pagination and error handling."""
    records = []
    cursor = None  # Start without a cursor

    while True:
        # Prepare GraphQL query variables
        variables = {
            "board_id": board_id,
            "limit": limit,
            "cursor": cursor
        }

        try:
            response = requests.post(URL, json={"query": QUERY_TEMPLATE, "variables": variables}, headers=HEADERS)
            response.raise_for_status()  # Raise an error for non-200 responses
            
            data = response.json()
            
            # Debugging: Print API response if needed
            # print(data)  
            
            boards = data.get("data", {}).get("boards", [])
            if not boards or boards[0] is None:
                print("No boards found or invalid response structure.")
                break

            items_page = boards[0].get("items_page", {})
            items = items_page.get("items", [])
            cursor = items_page.get("cursor")

            if items is None:
                print("Warning: 'items' is None. Possible API issue.")
                break

            records.extend(items)  # Append records

            print(f"Fetched {len(records)} records...")  # Track progress

            if not cursor:
                break  # Stop when cursor is None

        except requests.exceptions.RequestException as e:
            print(f"Request failed: {e}")
            break
        except Exception as e:
            print(f"Unexpected error: {e}")
            break

    return records

# Fetch all records
all_records = fetch_records(BOARD_ID)

# Print total records fetched
print(f"Total records retrieved: {len(all_records)}")
