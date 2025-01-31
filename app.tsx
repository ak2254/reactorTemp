import requests

# Replace with your Monday.com API token and board ID
API_TOKEN = 'your_monday_com_api_token'
BOARD_ID = 'your_board_id'

# Monday.com API endpoint
API_URL = 'https://api.monday.com/v2'

# Headers for the API request
headers = {
    'Authorization': API_TOKEN,
    'Content-Type': 'application/json'
}

def get_all_items(board_id):
    """Fetch all items (rows) from the board."""
    query = '''
    query {
        boards(ids: %s) {
            items {
                id
            }
        }
    }
    ''' % board_id

    response = requests.post(API_URL, json={'query': query}, headers=headers)
    if response.status_code == 200:
        return response.json()['data']['boards'][0]['items']
    else:
        print(f"Failed to fetch items: {response.status_code}")
        return []

def delete_item(item_id):
    """Delete an item (row) by its ID."""
    mutation = '''
    mutation {
        delete_item (item_id: %s) {
            id
        }
    }
    ''' % item_id

    response = requests.post(API_URL, json={'query': mutation}, headers=headers)
    if response.status_code == 200:
        print(f"Deleted item {item_id}")
    else:
        print(f"Failed to delete item {item_id}: {response.status_code}")

def delete_all_items(board_id):
    """Delete all items (rows) from the board."""
    items = get_all_items(board_id)
    for item in items:
        delete_item(item['id'])

if __name__ == '__main__':
    delete_all_items(BOARD_ID)
