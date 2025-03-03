import unicodedata
import requests  # Assuming you are using requests for fetching data

import csv
import hashlib

def calculate_checksum(row):
    """
    This function will take a row (a list of column values) and calculate its checksum.
    You can change the hash algorithm if needed (e.g., SHA256, MD5).
    """
    # Join all columns in the row to a single string and encode it as bytes
    row_str = ''.join(str(cell) for cell in row)
    # Calculate checksum (SHA256 in this case)
    checksum = hashlib.sha256(row_str.encode('utf-8')).hexdigest()
    return checksum

def add_checksum_to_csv(input_file, output_file):
    # Open the original CSV file for reading
    with open(input_file, mode='r', newline='', encoding='utf-8') as infile:
        reader = csv.reader(infile)
        
        # Read the header (first row)
        header = next(reader)
        
        # Add a new column for checksum
        header.append('checksum')
        
        # Open the output CSV file for writing
        with open(output_file, mode='w', newline='', encoding='utf-8') as outfile:
            writer = csv.writer(outfile)
            writer.writerow(header)  # Write the updated header
            
            # Process each row in the CSV
            for row in reader:
                checksum = calculate_checksum(row)  # Calculate checksum for the row
                row.append(checksum)  # Add checksum to the row
                writer.writerow(row)  # Write the row with checksum to the output file

# Example usage
input_file = 'input.csv'  # Your input CSV file
output_file = 'output_with_checksum.csv'  # The output CSV with the checksum column
add_checksum_to_csv(input_file, output_file)







# Function to normalize special characters (like dashes or other special symbols)
def normalize_text(text):
    if isinstance(text, str):
        # Normalize characters to a consistent format and ensure UTF-8 encoding
        return unicodedata.normalize("NFKC", text).encode("utf-8").decode("utf-8")
    return text

# Fetching all records from Monday API (example)
def fetch_all_records(api_url, api_key, board_id, limit=500):
    headers = {"Authorization": f"Bearer {api_key}"}
    params = {
        "query": f"""
        query {{
            boards(ids: {board_id}) {{
                items_page(limit: {limit}) {{
                    cursor
                    items {{
                        name
                        column_values {{
                            column {{
                                title
                            }}
                            text
                        }}
                    }}
                }}
            }}
        }}
        """
    }

    response = requests.post(api_url, json=params, headers=headers)
    data = response.json()

    # Let's normalize the text data in column_values of the returned items
    raw_data = []

    # Loop through the items and normalize the relevant fields
    if "data" in data and "boards" in data["data"]:
        for item in data["data"]["boards"][0]["items_page"]["items"]:
            raw_item = item.copy()  # Copy the item to retain the raw data

            # Normalize text fields in column_values (assuming "text" holds data of interest)
            for column_value in raw_item["column_values"]:
                column_value["text"] = normalize_text(column_value["text"])  # Normalize text field

            raw_data.append(raw_item)

    # Return raw data with UTF-8 encoding
    return raw_data

# Example usage
api_url = "https://api.monday.com/v2"
api_key = "your_monday_api_key"
board_id = 123456789

raw_data = fetch_all_records(api_url, api_key, board_id)

# Now raw_data contains the raw response with UTF-8 normalized text fields
