async def create_item(session, api_key, board_id, item_name, column_values):
    """
    Create a single item on a monday.com board.
    """
    url = "https://api.monday.com/v2"
    headers = {
        "Authorization": api_key,
        "Content-Type": "application/json"
    }
    
    column_values_json = json.dumps(column_values)
    
    query = """
    mutation {
        create_item (board_id: %s, item_name: "%s", column_values: "%s") {
            id
        }
    }
    """ % (board_id, item_name, column_values_json)
    
    try:
        async with session.post(url, headers=headers, json={'query': query}) as response:
            response.raise_for_status()
            data = await response.json()
            if "errors" in data:
                raise MondayAPIError(f"Failed to create item: {data['errors']}")
    except aiohttp.ClientError as e:
        raise MondayAPIError(f"Request failed: {e}")



@task
def bulk_upload_items(api_key, board_id, dataset):
    """
    Bulk upload items to a monday.com board.
    """
    async def bulk_upload_dataset(api_key, board_id, dataset, max_concurrent_requests=50, requests_per_minute=100):
        successful_creations = []
        semaphore = asyncio.Semaphore(max_concurrent_requests)
        delay_between_requests = 60 / requests_per_minute

        async def create_with_rate_limit(session, item_data):
            async with semaphore:
                try:
                    column_values = {}
                    for key, value in item_data.items():
                        if key in column_mapping:
                            column_id = column_mapping[key]
                            column_values[column_id] = value

                    item_name = item_data.get("Asset", " ")
                    await create_item(session, api_key, board_id, item_name, column_values)
                    successful_creations.append(item_name)
                except MondayAPIError as e:
                    logger = get_run_logger()
                    logger.error(f"Error creating item: {e}")
                finally:
                    await asyncio.sleep(delay_between_requests)

        async with aiohttp.ClientSession() as session:
            tasks = [create_with_rate_limit(session, item_data) for item_data in dataset]
            await asyncio.gather(*tasks)
        
        return successful_creations

    return asyncio.run(bulk_upload_dataset(api_key, board_id, dataset))
