import requests
from concurrent.futures import ThreadPoolExecutor

API_URL = "https://api.monday.com/v2"
HEADERS = {"Authorization": "your_api_token", "Content-Type": "application/json"}

def delete_item(item_id, session):
    query = f'mutation {{ delete_item(item_id: {item_id}) {{ id }} }}'
    response = session.post(API_URL, json={"query": query}, headers=HEADERS)
    return response.json()

def add_item(board_id, item_data, session):
    item_name = item_data.get("asset", "Unnamed Item")  # Use "asset" as the item name
    query = f'mutation {{ create_item(board_id: {board_id}, item_name: "{item_name}") {{ id }} }}'
    response = session.post(API_URL, json={"query": query}, headers=HEADERS)
    return response.json()

# Example dataset for addition
dataset = [
    {"id": 1, "asset": "123", "other_field": "value1"},
    {"id": 2, "asset": "456", "other_field": "value2"},
    {"id": 3, "asset": "789", "other_field": "value3"},
]

# Example board ID for addition
board_id = 123456  # Replace with your board ID

with requests.Session() as session:
    with ThreadPoolExecutor(max_workers=5) as executor:
        # Perform additions
        add_results = list(executor.map(lambda item_data: add_item(board_id, item_data, session), dataset))

print("Addition Results:", add_results)
