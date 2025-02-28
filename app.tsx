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
