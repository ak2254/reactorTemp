import aiohttp
import asyncio
from typing import Dict, List, Optional

# Constants
API_KEY = "your_monday_api_key"
BOARD_ID = "your_board_id"
API_URL = "https://api.monday.com/v2"
BATCH_SIZE = 100  # Monday.com allows a maximum of 100 records per request

# Headers for Monday.com API
headers = {
    "Authorization": API_KEY,
    "Content-Type": "application/json",
}

async def fetch_monday_records(session: aiohttp.ClientSession, cursor: Optional[str] = None) -> Dict:
    """Fetch records from the Monday.com board in batches of 100."""
    query = f"""{{
        boards(ids: {BOARD_ID}) {{
            name
            id
            description
            groups {{
                id
                title
                items_page(limit: {BATCH_SIZE}, cursor: "{cursor or ""}") {{
                    items {{
                        id
                        name
                        column_values {{
                            id
                            text
                            value
                            type
                        }}
                    }}
                    cursor
                }}
            }}
        }}
    }}"""

    async with session.post(API_URL, json={"query": query}, headers=headers) as response:
        data = await response.json()
        if "errors" in data:
            print("API Error:", data["errors"])
            return {}, None

        boards = data.get("data", {}).get("boards", [])
        if not boards:
            print("No boards found.")
            return {}, None

        # Check if the board has groups
        groups = boards[0].get("groups", [])
        if not groups:
            print("No groups found in the board.")
            return {}, None

        # Check if the group has items
        items_page = groups[0].get("items_page", {})
        if not items_page:
            print("No items found in the group.")
            return {}, None

        items = items_page.get("items", [])
        next_cursor = items_page.get("cursor")

        # Convert to a dictionary: {item_id: item_data}
        monday_data = {}
        for item in items:
            item_id = item.get("id")
            if not item_id:
                continue

            item_data = {
                "name": item.get("name", ""),
                "column_values": {
                    col["id"]: {"text": col.get("text", ""), "value": col.get("value", ""), "type": col.get("type", "")}
                    for col in item.get("column_values", [])
                },
            }
            monday_data[item_id] = item_data

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

async def main():
    """Main function to run the script asynchronously."""
    async with aiohttp.ClientSession() as session:
        # Fetch all records from Monday.com in batches of 100
        monday_data = await fetch_all_monday_records(session)
        print("Fetched records:", monday_data)

if __name__ == "__main__":
    asyncio.run(main())
