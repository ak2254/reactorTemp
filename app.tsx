from datetime import datetime

from datetime import datetime

def reformat_dates_original_data(original_data):
    """
    Converts all date values in the original dataset to 'MM/DD/YYYY' format.
    """
    formatted_data = []
    
    for record in original_data:
        new_record = {}
        for key, value in record.items():
            if isinstance(value, str):  # Ensure it's a string before attempting date conversion
                try:
                    # Try to parse the date with multiple formats (common formats from original data)
                    date_obj = datetime.strptime(value, "%Y-%m-%d")  # Example: 2024-03-02
                    new_record[key] = date_obj.strftime("%m/%d/%Y")  # Convert to MM/DD/YYYY
                except ValueError:
                    try:
                        date_obj = datetime.strptime(value, "%d-%m-%Y")  # Example: 02-03-2024
                        new_record[key] = date_obj.strftime("%m/%d/%Y")
                    except ValueError:
                        # If not a date, keep original value
                        new_record[key] = value
            else:
                new_record[key] = value

        formatted_data.append(new_record)

    return formatted_data











def find_records_to_replace(monday_formatted_data, original_data):
    """
    Identify records that need to be deleted from Monday.com and new records that need to be added.
    
    - If a record exists in both but has changed, delete & re-add.
    - If a record exists in original_data but not in Monday, add it.
    - If a record exists in Monday but not in original_data, delete it.
    """
    
    # Create a lookup dictionary for original records by "Work Order"
    original_lookup = {record["Work Order"]: record for record in original_data}

    # Create a lookup dictionary for Monday records by "Work Order"
    monday_lookup = {record["Work Order"]: record for record in monday_formatted_data}

    # Records to delete
    records_to_delete = []

    # Records to add
    records_to_add = []

    # Compare records
    for work_order, monday_record in monday_lookup.items():
        if work_order not in original_lookup:
            # Work Order is in Monday but not in original data → Delete
            records_to_delete.append(monday_record["item_id"])
        else:
            # Compare field-by-field to detect changes
            original_record = original_lookup[work_order]
            differing_columns = []
            
            # Compare columns and track which ones have differences
            for key in original_record.keys():
                if monday_record.get(key, "") != original_record.get(key, ""):
                    differing_columns.append(key)

            if differing_columns:
                # If there are differences, print out the differing columns
                print(f"Work Order: {work_order} has differences in columns: {', '.join(differing_columns)}")
                # If any field differs, delete & re-add
                records_to_delete.append(monday_record["item_id"])
                records_to_add.append(original_record)

    # Find new records to add (exist in original but not in Monday)
    for work_order, original_record in original_lookup.items():
        if work_order not in monday_lookup:
            records_to_add.append(original_record)

    return records_to_delete, records_to_add
