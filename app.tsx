import requests

# Replace with your Monday.com API token and board ID
API_TOKEN = 'your_monday_com_api_token'
BOARD_ID = 'your_board_id'  # Ensure this is an integer or a string of numbers

# Monday.com API endpoint
API_URL = 'https://api.monday.com/v2'

# Headers for the API request
headers = {
    'Authorization': API_TOKEN,
    'Content-Type': 'application/json'
}

def get_all_items(board_id):
    """Fetch all items (rows) from the board using your query format."""
    query = f'''
    {{
      boards(ids: {board_id}) {{
        items {{
          id
        }}
      }}
    }}
    '''

    try:
        response = requests.post(API_URL, json={'query': query}, headers=headers)
        response.raise_for_status()  # Raise an exception for HTTP errors
        data = response.json()
        if 'errors' in data:
            print(f"GraphQL Error: {data['errors']}")
            return []
        return data['data']['boards'][0]['items']
    except requests.exceptions.RequestException as e:
        print(f"Failed to fetch items: {e}")
        return []

def delete_item(item_id):
    """Delete an item (row) by its ID."""
    mutation = f'''
    mutation {{
        delete_item (item_id: {item_id}) {{
            id
        }}
    }}
    '''

    try:
        response = requests.post(API_URL, json={'query': mutation}, headers=headers)
        response.raise_for_status()  # Raise an exception for HTTP errors
        print(f"Deleted item {item_id}")
    except requests.exceptions.RequestException as e:
        print(f"Failed to delete item {item_id}: {e}")

def delete_all_items(board_id):
    """Delete all items (rows) from the board."""
    items = get_all_items(board_id)
    if not items:
        print("No items found or failed to fetch items.")
        return

    for item in items:
        delete_item(item['id'])

if __name__ == '__main__':
    delete_all_items(BOARD_ID)
