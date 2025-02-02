import asyncio
import aiohttp
from prefect import task, flow, get_run_logger

class MondayAPIError(Exception):
    """Custom exception for monday.com API errors."""
    pass

async def delete_item(session, api_key, item_id):
    """
    Delete a single item from monday.com using its ID.

    Parameters:
        session (aiohttp.ClientSession): The aiohttp session for making HTTP requests.
        api_key (str): The API key for authenticating with the monday.com API.
        item_id (int): The ID of the item to delete.

    Raises:
        MondayAPIError: If the delete request fails.
    """
    url = "https://api.monday.com/v2"
    headers = {
        "Authorization": api_key,
        "Content-Type": "application/json"
    }
    
    query = """
    mutation {
        delete_item (item_id: %s) {
            id
        }
    }
    """ % item_id
    
    try:
        async with session.post(url, headers=headers, json={'query': query}) as response:
            response.raise_for_status()  # Raises an HTTPError for bad responses (4xx, 5xx)
            data = await response.json()
            if "errors" in data:
                raise MondayAPIError(f"Failed to delete item {item_id}: {data['errors']}")
    except aiohttp.ClientError as e:
        raise MondayAPIError(f"Request failed for item {item_id}: {e}")

async def delete_items_concurrently(api_key, item_ids, max_concurrent_requests=50, requests_per_minute=100):
    """
    Delete multiple items from monday.com concurrently using asyncio, while respecting rate limits.

    Parameters:
        api_key (str): The API key for authenticating with the monday.com API.
        item_ids (list): A list of item IDs to delete.
        max_concurrent_requests (int): Maximum number of concurrent requests to send at once.
        requests_per_minute (int): Maximum number of requests allowed per minute (monday.com's rate limit).

    Returns:
        list: A list of item IDs that were successfully deleted.
    """
    successful_deletions = []
    semaphore = asyncio.Semaphore(max_concurrent_requests)  # Limit concurrent requests
    delay_between_requests = 60 / requests_per_minute  # Delay between requests to respect rate limits

    async def delete_with_rate_limit(session, item_id):
        async with semaphore:
            try:
                await delete_item(session, api_key, item_id)
                successful_deletions.append(item_id)
            except MondayAPIError as e:
                logger = get_run_logger()
                logger.error(f"Error deleting item {item_id}: {e}")
            finally:
                await asyncio.sleep(delay_between_requests)  # Add delay between requests

    async with aiohttp.ClientSession() as session:
        tasks = [delete_with_rate_limit(session, item_id) for item_id in item_ids]
        await asyncio.gather(*tasks)
    
    return successful_deletions

@task
def delete_monday_items(api_key, item_ids):
    """
    Delete all items from monday.com using their IDs.

    This task uses asyncio to delete items concurrently, making the process faster while respecting rate limits.

    Parameters:
        api_key (str): The API key for authenticating with the monday.com API.
        item_ids (list): A list of item IDs to delete.

    Returns:
        list: A list of item IDs that were successfully deleted.
    """
    return asyncio.run(delete_items_concurrently(api_key, item_ids))

@flow
def monday_flow(api_key, board_id):
    """
    Prefect flow to fetch item IDs from monday.com and delete them.

    Parameters:
        api_key (str): The API key for authenticating with the monday.com API.
        board_id (str): The ID of the board from which to fetch and delete items.
    """
    try:
        item_ids = get_monday_item_ids(api_key, board_id)
        print(f"Fetched item IDs: {item_ids}")
        
        deleted_item_ids = delete_monday_items(api_key, item_ids)
        print(f"Successfully deleted item IDs: {deleted_item_ids}")
    except MondayAPIError as e:
        logger = get_run_logger()
        logger.error(f"Error in monday_flow: {e}")

# Run the flow
if __name__ == "__main__":
    api_key = "your_monday_api_key_here"
    board_id = "your_board_id_here"
    monday_flow(api_key, board_id)
