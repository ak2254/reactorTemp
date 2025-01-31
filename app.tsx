import requests
import json
import time

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

# Example dataset (list of dictionaries)
dataset = [
    {'title': 'Test 1', 'wo': '1234', 'asset': 'Item 1'},
    {'title': 'Test 2', 'wo': '5678', 'asset': ''},  # Blank asset
    {'title': 'Test 3', 'wo': '91011'},  # Missing asset
    # Add more items as needed (e.g., 1,000 items)
]

# Column mapping: Map dataset keys to Monday.com column IDs
column_mapping = {
    'title': 'text_column_id',  # Monday.com column ID for 'title'
    'wo': 'numbers_column_id',  # Monday.com column ID for 'wo'
    'asset': 'asset_column_id',  # Monday.com column ID for 'asset'
}

# Rate limit settings
REQUESTS_PER_MINUTE = 200  # Monday.com's default rate limit
DELAY_BETWEEN_REQUESTS = 60 / REQUESTS_PER_MINUTE  # Delay in seconds

def create_item(board_id, item_name, column_values):
    """
    Create a single item on a Monday.com board.

    :param board_id: The ID of the board.
    :param item_name: The name of the new item.
    :param column_values: A dictionary of column IDs and their values.
    :return: The ID of the created item.
    """
    # GraphQL mutation to create a single item
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
    Bulk upload a dataset to a Monday.com board using create_item.

    :param board_id: The ID of the board.
    :param dataset: A list of dictionaries, where each dictionary represents an item.
    :param column_mapping: A dictionary mapping dataset keys to Monday.com column IDs.
    """
    for index, item_data in enumerate(dataset):
        # Prepare column_values dictionary
        column_values = {}
        for key, value in item_data.items():
            if key in column_mapping:
                column_id = column_mapping[key]  # Map dataset key to Monday.com column ID

                # Handle lists and dictionaries in the dataset
                if isinstance(value, list):
                    value = ', '.join(value)  # Convert list to string
                elif isinstance(value, dict):
                    value = json.dumps(value)  # Convert dictionary to JSON string

                column_values[column_id] = value

        # Special handling for 'asset': Set item name and asset column value
        if 'asset' in item_data and item_data['asset']:  # Check if 'asset' exists and is not blank
            item_name = item_data['asset']  # Use 'asset' value as the item name
            column_values[column_mapping['asset']] = item_data['asset']  # Set asset column value
        else:
            item_name = ''  # Leave the item name blank if 'asset' is blank or missing

        # Create the item
        create_item(board_id, item_name, column_values)

        # Add a delay to respect rate limits
        if index < len(dataset) - 1:  # No delay after the last item
            time.sleep(DELAY_BETWEEN_REQUESTS)

# Run the bulk upload
if __name__ == '__main__':
    bulk_upload_dataset(BOARD_ID, dataset, column_mapping)
