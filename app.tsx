import csv
import aiohttp
import asyncio
from typing import Dict, List

# Constants
API_KEY = "your_monday_api_key"
BOARD_ID = "your_board_id"
API_URL = "https://api.monday.com/v2"
BATCH_SIZE = 100  # Monday.com allows a maximum of 100 records per request
CONCURRENT_REQUESTS = 10  # Number of concurrent API requests

# Headers for Monday.com API
headers = {
    "Authorization": API_KEY,
    "Content-Type": "application/json",
}

async def fetch_monday_records(session: aiohttp.ClientSession, cursor: str = None) -> Dict:
    """Fetch records from the Monday.com board in batches of 100."""
    query = """
    query {
        boards(ids: %s) {
            items_page(limit: %s, cursor: "%s") {
                cursor
                items {
                    id
                    column_values {
                        id
                        text
                    }
                }
            }
        }
    }
    """ % (BOARD_ID, BATCH_SIZE, cursor or "")

    async with session.post(API_URL, json={"query": query}, headers=headers) as response:
        data = await response.json()
        items_page = data["data"]["boards"][0]["items_page"]
        items = items_page["items"]
        next_cursor = items_page["cursor"]

        # Convert to a dictionary: {work_order_number: item_data}
        monday_data = {}
        for item in items:
            work_order_number = None
            item_data = {}
            for column in item["column_values"]:
                if column["id"] == "work_order_number":  # Replace with your column ID
                    work_order_number = column["text"]
                item_data[column["id"]] = column["text"]
            if work_order_number:
                monday_data[work_order_number] = {"id": item["id"], "data": item_data}
        return monday_data, next_cursor

async def fetch_all_monday_records(session: aiohttp.ClientSession) -> Dict:
    """Fetch all records from the Monday.com board using pagination."""
    all_records = {}
    cursor = None
    while True:
        records, cursor = await fetch_monday_records(session, cursor)
        all_records.update(records)
        if not cursor:  # No more records to fetch
            break
    return all_records

def read_csv_data(file_path: str) -> Dict:
    """Read CSV data into a dictionary."""
    csv_data = {}
    with open(file_path, mode="r") as file:
        reader = csv.DictReader(file)
        for row in reader:
            work_order_number = row["work_order_number"]  # Replace with your column name
            csv_data[work_order_number] = row
    return csv_data

async def add_records(session: aiohttp.ClientSession, records: List[Dict]):
    """Add new records to the Monday.com board asynchronously in batches of 100."""
    for i in range(0, len(records), BATCH_SIZE):
        batch = records[i:i + BATCH_SIZE]
        tasks = []
        for record in batch:
            query = """
            mutation {
                create_item (board_id: %s, item_name: "%s") {
                    id
                }
            }
            """ % (BOARD_ID, record["work_order_number"])  # Replace with your column name
            tasks.append(session.post(API_URL, json={"query": query}, headers=headers))
        responses = await asyncio.gather(*tasks)
        for response in responses:
            print("Added:", await response.json())

async def update_records(session: aiohttp.ClientSession, records: List[Dict]):
    """Update existing records in the Monday.com board asynchronously in batches of 100."""
    for i in range(0, len(records), BATCH_SIZE):
        batch = records[i:i + BATCH_SIZE]
        tasks = []
        for record in batch:
            item_id = record["id"]
            updates = []
            for column_id, value in record["data"].items():
                updates.append(f'{column_id}: "{value}"')
            query = """
            mutation {
                change_multiple_column_values (item_id: %s, board_id: %s, column_values: "{%s}") {
                    id
                }
            }
            """ % (item_id, BOARD_ID, ", ".join(updates))
            tasks.append(session.post(API_URL, json={"query": query}, headers=headers))
        responses = await asyncio.gather(*tasks)
        for response in responses:
            print("Updated:", await response.json())

async def delete_records(session: aiohttp.ClientSession, record_ids: List[str]):
    """Delete records from the Monday.com board asynchronously in batches of 100."""
    for i in range(0, len(record_ids), BATCH_SIZE):
        batch = record_ids[i:i + BATCH_SIZE]
        tasks = []
        for record_id in batch:
            query = """
            mutation {
                delete_item (item_id: %s) {
                    id
                }
            }
            """ % record_id
            tasks.append(session.post(API_URL, json={"query": query}, headers=headers))
        responses = await asyncio.gather(*tasks)
        for response in responses:
            print("Deleted:", await response.json())

async def update_monday_board(session: aiohttp.ClientSession, monday_data: Dict, csv_data: Dict):
    """Update the Monday.com board based on CSV data asynchronously."""
    # Identify changes
    to_add = []
    to_update = []
    to_delete = []

    # Check for updates and additions
    for work_order, csv_row in csv_data.items():
        if work_order in monday_data:
            monday_row = monday_data[work_order]["data"]
            if monday_row != csv_row:
                to_update.append({"id": monday_data[work_order]["id"], "data": csv_row})
        else:
            to_add.append(csv_row)

    # Check for deletions
    for work_order, monday_row in monday_data.items():
        if work_order not in csv_data:
            to_delete.append(monday_row["id"])

    # Process in batches of 100
    await add_records(session, to_add)
    await update_records(session, to_update)
    await delete_records(session, to_delete)

async def main():
    """Main function to run the script asynchronously."""
    async with aiohttp.ClientSession() as session:
        # Step 1: Fetch all records from Monday.com in batches of 100
        monday_data = await fetch_all_monday_records(session)

        # Step 2: Read CSV data
        csv_data = read_csv_data("data.csv")

        # Step 3: Update Monday.com board
        await update_monday_board(session, monday_data, csv_data)

if __name__ == "__main__":
    asyncio.run(main())
