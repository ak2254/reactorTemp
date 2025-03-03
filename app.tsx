from datetime import datetime

from datetime import datetime
from datetime import datetime
from datetime import datetime

def reformat_specified_dates(original_data, date_columns):
    """
    Converts specified date columns to 'MM/DD/YYYY' format, removes time information.
    Only applies to columns that are in the date_columns list.
    """
    formatted_data = []
    
    for record in original_data:
        new_record = {}
        for key, value in record.items():
            # Check if the column is in the specified date columns list
            if key in date_columns:
                if isinstance(value, str):  # If it's a string
                    value = value.strip().strip("'").strip('"')  # Remove single/double quotes and extra spaces
                    print(f"Checking date string for key {key}: {value}")  # Debug print
                    try:
                        # Try to parse the date in 'YYYY-MM-DD' format
                        date_obj = datetime.strptime(value, "%Y-%m-%d")
                        print(f"Parsed date (YYYY-MM-DD): {date_obj}")  # Debug print
                        new_record[key] = date_obj.strftime("%m/%d/%Y")  # Convert to MM/DD/YYYY
                    except ValueError:
                        try:
                            # Handle 'DD-MM-YYYY' format
                            date_obj = datetime.strptime(value, "%d-%m-%Y")
                            print(f"Parsed date (DD-MM-YYYY): {date_obj}")  # Debug print
                            new_record[key] = date_obj.strftime("%m/%d/%Y")
                        except ValueError:
                            try:
                                # Handle 'YY-MM-DD' format (for cases like '20-1-03')
                                date_obj = datetime.strptime(value, "%y-%m-%d")
                                print(f"Parsed date (YY-MM-DD): {date_obj}")  # Debug print
                                new_record[key] = date_obj.strftime("%m/%d/%Y")
                            except ValueError:
                                try:
                                    # Handle 'DD-MM-YY' format (for cases like '3-1-20')
                                    date_obj = datetime.strptime(value, "%d-%m-%y")
                                    print(f"Parsed date (DD-MM-YY): {date_obj}")  # Debug print
                                    new_record[key] = date_obj.strftime("%m/%d/%Y")
                                except ValueError:
                                    try:
                                        # Handle 'YYYY-MM-DD HH:MM:SS' format with time
                                        date_obj = datetime.strptime(value, "%Y-%m-%d %H:%M:%S")
                                        print(f"Parsed date (YYYY-MM-DD HH:MM:SS): {date_obj}")  # Debug print
                                        new_record[key] = date_obj.strftime("%m/%d/%Y")  # Only keep the date (removes time)
                                    except ValueError:
                                        # If it's not a date, leave the original value
                                        print(f"Value is not a valid date: {value}")  # Debug print
                                        new_record[key] = value
                elif isinstance(value, (datetime, datetime.date)):  # If it's already a date or datetime
                    new_record[key] = value.strftime("%m/%d/%Y")  # Directly format it
                else:
                    # If it's not a date, leave the original value
                    new_record[key] = value
            else:
                # If the column is not in the list of date_columns, keep the original value
                new_record[key] = value

        formatted_data.append(new_record)

    return formatted_data






def reformat_specified_dates(original_data, date_columns):
    """
    Converts specified date columns to 'MM/DD/YYYY' format, removes time information.
    Only applies to columns that are in the date_columns list.
    """
    formatted_data = []
    
    for record in original_data:
        new_record = {}
        for key, value in record.items():
            # Check if the column is in the specified date columns list
            if key in date_columns:
                if isinstance(value, str):  # If it's a string
                    try:
                        # Try to parse the date in 'YYYY-MM-DD' format
                        date_obj = datetime.strptime(value, "%Y-%m-%d")
                        new_record[key] = date_obj.strftime("%m/%d/%Y")  # Convert to MM/DD/YYYY
                    except ValueError:
                        try:
                            # Handle 'DD-MM-YYYY' format
                            date_obj = datetime.strptime(value, "%d-%m-%Y")
                            new_record[key] = date_obj.strftime("%m/%d/%Y")
                        except ValueError:
                            try:
                                # Handle 'YYYY-MM-DD HH:MM:SS' format with time
                                date_obj = datetime.strptime(value, "%Y-%m-%d %H:%M:%S")
                                new_record[key] = date_obj.strftime("%m/%d/%Y")  # Only keep the date (removes time)
                            except ValueError:
                                # If it's not a date, leave the original value
                                new_record[key] = value
                elif isinstance(value, (datetime, datetime.date)):  # If it's already a date or datetime
                    new_record[key] = value.strftime("%m/%d/%Y")  # Directly format it
                else:
                    # If it's not a date, leave the original value
                    new_record[key] = value
            else:
                # If the column is not in the list of date_columns, keep the original value
                new_record[key] = value

        formatted_data.append(new_record)

    return formatted_data


# Example usage:
original_data = [
    {"Work Order": "WO123", "Date": "2024-03-02", "Amount": 1000, "Status": "Open"},
    {"Work Order": "WO124", "Date": "2024-03-03", "Amount": 1200, "Status": "Closed"}
]

# Specify the columns you want to format as dates
date_columns = ["Date"]

formatted_data = reformat_specified_dates(original_data, date_columns)
print(formatted_data)


    
    
    
    
    
    
    
    
    def print_key_types(original_data):
    # Get the first record in the original data
    if original_data:
        first_record = original_data[0]
        
        # Print the type of each key's value in the first record
        key_types = [(key, type(value)) for key, value in first_record.items()]
        
        # Print the list of types
        print(key_types)
    else:
        print("The data is empty.")

    
    
    def reformat_dates_original_data(original_data):
    """
    Converts all date values in the original dataset to 'MM/DD/YYYY' format.
    Removes any time information (e.g., 00:00).
    """
    formatted_data = []
    
    for record in original_data:
        new_record = {}
        for key, value in record.items():
            if isinstance(value, str):  # Ensure it's a string before attempting date conversion
                try:
                    # Try to parse the date with multiple formats (common formats from original data)
                    date_obj = datetime.strptime(value, "%Y-%m-%d")  # Example: 2024-03-02
                    new_record[key] = date_obj.strftime("%m/%d/%Y")  # **Convert to MM/DD/YYYY** (This removes any time)
                except ValueError:
                    try:
                        date_obj = datetime.strptime(value, "%d-%m-%Y")  # Example: 02-03-2024
                        new_record[key] = date_obj.strftime("%m/%d/%Y")  # **Convert to MM/DD/YYYY** (This removes any time)
                    except ValueError:
                        try:
                            # **Handle case where there might be a time part like "2024-03-02 15:30:00"**
                            date_obj = datetime.strptime(value, "%Y-%m-%d %H:%M:%S")  # Example: 2024-03-02 15:30:00
                            new_record[key] = date_obj.strftime("%m/%d/%Y")  # **Only keep the date part** (This removes the time)
                        except ValueError:
                            # If not a date, keep original value
                            new_record[key] = value
            else:
                new_record[key] = value

        formatted_data.append(new_record)

    return formatted_data
    
    
    
    
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
