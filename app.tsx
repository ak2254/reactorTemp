def hash_record(record, common_keys):
    """Generate a hash for a record using only common keys."""
    values = [str(record.get(key, "")) for key in sorted(common_keys)]
    record_string = "|".join(values)
    return hashlib.md5(record_string.encode()).hexdigest()

def find_changes(monday_data_list, original_data_list):
    """Compare records and return item_ids to delete and records to re-add."""
    
    # Convert original data list into a dictionary (key = work order, value = record)
    original_dict = {rec["work Order"]: rec for rec in original_data_list}

    # Lists to store results
    item_ids_to_delete = []
    records_to_add = []

    for monday_record in monday_data_list:
        work_order = monday_record["work Order"]
        
        # If work order is in both Monday and original data
        if work_order in original_dict:
            original_record = original_dict[work_order]

            # Find common keys
            common_keys = set(monday_record.keys()) & set(original_record.keys())

            # Hash and compare
            monday_hash = hash_record(monday_record, common_keys)
            original_hash = hash_record(original_record, common_keys)

            if monday_hash != original_hash:
                # Store item_id for deletion
                item_ids_to_delete.append(monday_record["item_id"])
                
                # Store updated record to re-add
                records_to_add.append(original_record)

    return item_ids_to_delete, records_to_add
