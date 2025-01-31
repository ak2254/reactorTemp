import requests
import json

# Replace with your Monday.com API token and board ID
API_TOKEN = 'your_monday_com_api_token'
BOARD_ID = '12345678'  # Replace with your board ID (must be an integer or string of numbers)

# Monday.com API endpoint
API_URL = 'https://api.monday.com/v2'

# Headers for the API request
headers = {
    'Authorization': API_TOKEN,
    'Content-Type': 'application/json'
}

# Example dataset
dataset = [
    {'title': 'Test 1', 'wo': '1234', 'asset': 'Item 1'},
    {'title': 'Test 2', 'wo': '5678', 'asset': 'Item 2'},
]

# Column mapping: Map dataset keys to Monday.com column IDs
column_mapping = {
    'title': 'text_column_id',  # Replace with your Monday.com column ID
    'wo': 'numbers_column_id',  # Replace with your Monday.com column ID
    'asset': 'status_column_id',  # Replace with your Monday.com column ID
}

def create_item_with_columns(board_id, item_name, column_values):
    """
    Create an item on a Monday.com board with multiple column values.

    :param board_id: The ID of the board (must be an integer or string of numbers).
    :param item_name: The name of the new item.
    :param column_values: A dictionary of column IDs and their values.
    :return: The ID of the created item.
    """
    # GraphQL mutation to create an item with column values
    mutation = '''
    mutation {
        create_item (
            board_id: %s,
            item_name: "%s",
            column_values: %s
        ) {
            id
        }
    }
    ''' % (board_id, item_name, json.dumps(json.dumps(column_values)))

    try:
        response = requests.post(API_URL, json={'query': mutation}, headers=headers)
        response.raise_for_status()  # Raise an exception for HTTP errors
        data = response.json()

        if 'errors' in data:
            print(f"GraphQL Error: {data['errors']}")
            return None

        item_id = data['data']['create_item']['id']
        print(f"Item created successfully! Item ID: {item_id}")
        return item_id

    except requests.exceptions.RequestException as e:
        print(f"Failed to create item: {e}")
        return None

def bulk_upload_dataset(board_id, dataset, column_mapping):
    """
    Bulk upload a dataset to a Monday.com board.

    :param board_id: The ID of the board.
    :param dataset: A list of dictionaries, where each dictionary represents an item.
    :param column_mapping: A dictionary mapping dataset keys to Monday.com column IDs.
    """
    for item_data in dataset:
        # Prepare column_values dictionary
        column_values = {}
        for key, value in item_data.items():
            if key in column_mapping:
                column_id = column_mapping[key]
                column_values[column_id] = value

        # Create the item
        item_name = item_data.get('title', 'New Item')  # Use 'title' as the item name
        create_item_with_columns(board_id, item_name, column_values)

# Run the bulk upload
if __name__ == '__main__':
    bulk_upload_dataset(BOARD_ID, dataset, column_mapping)
