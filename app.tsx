import asyncio
import aiohttp
from prefect import task, flow, get_run_logger

class MondayAPIError(Exception):
    """Custom exception for monday.com API errors."""
    pass

async def delete_items_batch(session, api_key, item_ids, retries=3, backoff_factor=1):
    """
    Delete a batch of items from a monday.com board using batch mutations.

    Parameters:
        session (aiohttp.ClientSession): The aiohttp session for making HTTP requests.
        api_key (str): The API key for authenticating with the monday.com API.
        item_ids (list): A list of item IDs to delete.
        retries (int): Number of retries for failed requests.
        backoff_factor (float): Multiplier for exponential backoff delay.

    Returns:
        list: A list of item IDs that were successfully deleted.
    """
    url = "https://api.monday.com/v2"
    headers = {
        "Authorization": api_key,
        "Content-Type": "application/json"
    }
    
    # Create a batch of delete mutations
    mutations = [
        {
            "query": """
            mutation {
                delete_item (item_id: %s) {
                    id
                }
            }
            """ % item_id
        }
        for item_id in item_ids
    ]
    
    for attempt in range(retries):
        try:
            async with session.post(url, headers=headers, json=mutations) as response:
                response.raise_for_status()
                data = await response.json()
                if isinstance(data, list) and any("errors" in result for result in data):
                    raise MondayAPIError(f"API error: {data}")
                
                # Extract successful deletions
                successful_deletions = []
                for result in data:
                    if "data" in result and result["data"].get("delete_item", {}).get("id"):
                        successful_deletions.append(result["data"]["delete_item"]["id"])
                return successful_deletions
        except (aiohttp.ClientError, MondayAPIError) as e:
            if attempt == retries - 1:  # Last attempt
                raise MondayAPIError(f"Request failed after {retries} retries: {e}")
            await asyncio.sleep(backoff_factor * (2 ** attempt))  # Exponential backoff

async def delete_all_items(api_key, item_ids, batch_size=80, requests_per_minute=100):
    """
    Delete all items from a monday.com board in batches using concurrency, with rate limiting and retries.

    Parameters:
        api_key (str): The API key for authenticating with the monday.com API.
        item_ids (list): A list of item IDs to delete.
        batch_size (int): Number of mutations to include in each batch.
        requests_per_minute (int): Maximum number of requests allowed per minute.

    Returns:
        list: A list of item IDs that were successfully deleted.
    """
    successful_deletions = []
    remaining_items = item_ids.copy()  # Track remaining items to delete
    delay_between_batches = 60 / requests_per_minute  # Delay between batches to respect rate limits
    
    async with aiohttp.ClientSession() as session:
        while remaining_items:
            batch = remaining_items[:batch_size]
            try:
                deleted_ids = await delete_items_batch(session, api_key, batch)
                successful_deletions.extend(deleted_ids)
                print(f"Successfully deleted batch: {deleted_ids}")
                # Remove successfully deleted items from the remaining list
                remaining_items = [item_id for item_id in remaining_items if item_id not in deleted_ids]
            except MondayAPIError as e:
                logger = get_run_logger()
                logger.error(f"Error deleting batch: {e}")
            await asyncio.sleep(delay_between_batches)  # Add delay between batches
    
    return successful_deletions

@task
def delete_monday_items(api_key, item_ids):
    """
    Delete all items from a monday.com board using concurrency, with rate limiting and retries.

    Parameters:
        api_key (str): The API key for authenticating with the monday.com API.
        item_ids (list): A list of item IDs to delete.

    Returns:
        list: A list of item IDs that were successfully deleted.
    """
    return asyncio.run(delete_all_items(api_key, item_ids))

@flow
def monday_flow(api_key, board_id, dataset):
    """
    Prefect flow to fetch all item IDs from a monday.com board, delete them in batches, and add new items.
    """
    try:
        # Step 1: Fetch all item IDs
        item_ids = get_monday_item_ids(api_key, board_id)
        print(f"Fetched {len(item_ids)} item IDs: {item_ids}")

        # Step 2: Delete all items in batches with rate limiting and retries
        deleted_item_ids = delete_monday_items(api_key, item_ids)
        print(f"Successfully deleted {len(deleted_item_ids)} item IDs: {deleted_item_ids}")

        # Step 3: Add new items in bulk
        created_items = bulk_upload_items(api_key, board_id, dataset)
        print(f"Successfully created {len(created_items)} items: {created_items}")
    except MondayAPIError as e:
        logger = get_run_logger()
        logger.error(f"Error in monday_flow: {e}")

# Run the flow
if __name__ == "__main__":
    api_key = "your_monday_api_key_here"
    board_id = "your_board_id_here"
    dataset = [
        {"Asset": "Asset 1", "Status": "Active", "Priority": "High"},
        {"Asset": "Asset 2", "Status": "Inactive", "Priority": "Medium"},
        {"Asset": "Asset 3", "Status": "Active", "Priority": "Low"},
    ]
    monday_flow(api_key, board_id, dataset)
