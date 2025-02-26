from fastapi import FastAPI, HTTPException
import requests
import pandas as pd
from typing import List, Dict

app = FastAPI()

MONDAY_API_URL = "https://api.monday.com/v2"
MONDAY_API_KEY = "your_monday_api_key"
BOARD_ID = "your_board_id"
HEADERS = {"Authorization": MONDAY_API_KEY, "Content-Type": "application/json"}
BATCH_SIZE = 300  # Batch processing size
FETCH_BATCH = 200  # How many records to fetch at a time


def fetch_monday_data():
    """Fetch all records from the Monday.com board in batches."""
    query = """
    query($board_id: ID!, $limit: Int!, $page: Int!) {
        boards(ids: [$board_id]) {
            items_page(limit: $limit, page: $page) {
                items {
                    id
                    name
                    column_values { id text }
                }
            }
        }
    }
    """
    page = 1
    all_records = []
    while True:
        response = requests.post(MONDAY_API_URL, json={"query": query, "variables": {"board_id": BOARD_ID, "limit": FETCH_BATCH, "page": page}}, headers=HEADERS)
        data = response.json()
        items = data.get("data", {}).get("boards", [])[0].get("items_page", {}).get("items", [])
        if not items:
            break
        all_records.extend(items)
        page += 1
    return all_records


def load_excel_data(file_path: str) -> pd.DataFrame:
    """Load Excel data into a DataFrame."""
    return pd.read_excel(file_path)


def process_data(monday_data: List[Dict], excel_data: pd.DataFrame):
    """Compare Monday.com records with Excel and determine actions."""
    monday_dict = {item['name']: item for item in monday_data}  # Quick lookup by Work Order
    excel_dict = excel_data.set_index('work_order').to_dict(orient='index')

    to_update, to_add, to_delete = [], [], []

    for work_order, data in excel_dict.items():
        if work_order in monday_dict:
            monday_entry = monday_dict[work_order]
            if str(monday_entry['column_values']) != str(data):  # If data has changed
                to_update.append(work_order)
        else:
            to_add.append(work_order)

    for work_order in monday_dict:
        if work_order not in excel_dict:
            to_delete.append(monday_dict[work_order]['id'])

    return to_update, to_add, to_delete


def batch_process(items: List, process_function, batch_size=BATCH_SIZE):
    """Process data in batches."""
    for i in range(0, len(items), batch_size):
        process_function(items[i:i + batch_size])


def delete_monday_records(records: List[str]):
    """Delete records from Monday.com."""
    for record_id in records:
        query = f"""mutation {{ delete_item (item_id: {record_id}) {{ id }} }}"""
        requests.post(MONDAY_API_URL, json={"query": query}, headers=HEADERS)


def add_monday_records(records: List[str]):
    """Add new records to Monday.com."""
    for record in records:
        query = f"""mutation {{ create_item (board_id: {BOARD_ID}, item_name: \"{record}\") {{ id }} }}"""
        requests.post(MONDAY_API_URL, json={"query": query}, headers=HEADERS)


@app.post("/sync")
def sync_monday_board(file_path: str):
    """API to sync Monday.com board with Excel data."""
    monday_data = fetch_monday_data()
    excel_data = load_excel_data(file_path)
    to_update, to_add, to_delete = process_data(monday_data, excel_data)

    batch_process(to_delete, delete_monday_records)
    batch_process(to_add, add_monday_records)

    return {"message": "Sync completed", "updated": len(to_update), "added": len(to_add), "deleted": len(to_delete)}
