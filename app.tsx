# Step 2: Delete all items in batches of 80
        batch_size = 80
        successful_deletions = []
        for i in range(0, len(item_ids), batch_size):
            batch = item_ids[i:i + batch_size]
            try:
                deleted_ids = delete_monday_items(api_key, batch)
                successful_deletions.extend(deleted_ids)
                print(f"Successfully deleted batch: {deleted_ids}")
            except MondayAPIError as e:
                logger = get_run_logger()
                logger.error(f"Error deleting batch: {e}")
