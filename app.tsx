import unicodedata
import requests  # Assuming you are using requests for fetching data

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
