import requests
import json
import time
import random

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
    # Add more items as needed (e.g., 1,000 items)
]

# Column mapping: Map dataset keys to Monday.com column IDs
column_mapping = {
    'title': 'text_column_id',  # Replace with your Monday.com column ID
    'wo': 'numbers_column_id',  # Replace with your Monday.com column ID
    'asset': 'status_column_id',  # Replace with your Monday.com column ID
}

# Batch settings
BATCH_SIZE = 100  # Number of items per batch
REQUESTS_PER_MINUTE = 200  # Monday.com's default rate limit
DELAY_BETWEEN_BATCHES = 60 / REQUESTS_PER_MINUTE  # Delay in seconds

def create_items_batch(board_id, items):
    """
    Create multiple items on a Monday.com board in a single batch.

    :param board_id: The ID of the board.
    :param items: A list of dictionaries, where each dictionary represents an item.
    :return: A list of IDs of the created items.
    """
    # Prepare the items for the mutation
    items_input = []
    for item in items:
        column_values = {}
        for key, value in item.items():
            if key in column_mapping:
                column_id = column_mapping[key]
                column_values[column_id] = value

        items_input.append({
            'item_name': item.get('title', 'New Item'),
            'column_values': json.dumps(column_values)
        })

    # GraphQL mutation to create multiple items
    mutation = '''
    mutation {
        create_items (
            board_id: %s,
            items: %s
        ) {
            id
        }
    }
    ''' % (board_id, json.dumps(items_input))

    try:
        response = requests.post(API_URL, json={'query': mutation}, headers=headers)
        response.raise_for_status()  # Raise an exception for HTTP errors
        data = response.json()

        if 'errors' in data:
            print(f"GraphQL Error: {data['errors']}")
            return None

        item_ids = [item['id'] for item in data['data']['create_items']]
        print(f"Batch created successfully! Item IDs: {item_ids}")
        return item_ids

    except requests.exceptions.RequestException as e:
        print(f"Failed to create batch: {e}")
        return None

def bulk_upload_dataset(board_id, dataset, column_mapping, batch_size=BATCH_SIZE):
    """
    Bulk upload a dataset to a Monday.com board in batches.

    :param board_id: The ID of the board.
    :param dataset: A list of dictionaries, where each dictionary represents an item.
    :param column_mapping: A dictionary mapping dataset keys to Monday.com column IDs.
    :param batch_size: Number of items per batch.
    """
    total_items = len(dataset)
    for start in range(0, total_items, batch_size):
        end = start + batch_size
        batch = dataset[start:end]

        print(f"Processing batch {start // batch_size + 1}: Items {start + 1} to {end}")

        # Create the batch
        create_items_batch(board_id, batch)

        # Add a delay to respect rate limits
        if end < total_items:  # No delay after the last batch
            time.sleep(DELAY_BETWEEN_BATCHES)

# Run the bulk upload
if __name__ == '__main__':
    bulk_upload_dataset(BOARD_ID, dataset, column_mapping)
