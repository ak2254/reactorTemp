import hashlib
import json

def hash_record(record, all_keys):
    """Generate a hash for a record ensuring all keys exist and are formatted consistently."""
    
    # Ensure all keys exist in the record and convert values to strings
    normalized_record = {key: str(record.get(key, "")) for key in all_keys}
    
    # Convert to sorted JSON string for consistent hashing
    record_str = json.dumps(normalized_record, sort_keys=True, separators=(',', ':'))
    
    return hashlib.sha256(record_str.encode()).hexdigest()

def find_records_to_replace(monday_formatted_data, original_data):
    """
    Identify records that need to be deleted from Monday.com and new records that need to be added.
    
    - If a record exists in both but has changed (e.g., "prc" -> "prcs"), delete & re-add.
    - If a record exists in original_data but not in Monday, add it.
    - If a record exists in Monday but not in original_data, delete it.
    """
    
    # Get all unique keys from both datasets for normalization
    all_keys = {key for record in original_data for key in record.keys()}

    # Hash Monday formatted records (storing item_id for deletions)
    monday_hashed = {
        record["Work Order"]: (hash_record(record, all_keys), record["item_id"])
        for record in monday_formatted_data
    }

    # Hash original records
    original_hashed = {
        record["Work Order"]: hash_record(record, all_keys)
        for record in original_data
    }

    # Identify records to delete (if changed or missing in original_data)
    records_to_delete = [
        monday_hashed[wo][1]  # Get item_id from Monday data
        for wo in monday_hashed
        if wo not in original_hashed or original_hashed[wo] != monday_hashed[wo][0]
    ]

    # Identify records to add (new or changed)
    records_to_add = [
        record for record in original_data
        if record["Work Order"] not in monday_hashed or 
           original_hashed[record["Work Order"]] != monday_hashed[record["Work Order"]][0]
    ]

    return records_to_delete, records_to_add
