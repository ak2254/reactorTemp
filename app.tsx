import requests

# Sample JSON data with multiple groups
json_data = {
    "data": {
        "boards": [
            {
                "groups": [
                    {
                        "items_page": {
                            "items": [
                                {"id": "123"},
                                {"id": "456"}
                            ]
                        }
                    },
                    {
                        "items_page": {
                            "items": [
                                {"id": "789"},
                                {"id": "101"},
                                {"id": "102"}
                            ]
                        }
                    }
                ]
            },
            {
                "groups": [
                    {
                        "items_page": {
                            "items": [
                                {"id": "200"},
                                {"id": "201"}
                            ]
                        }
                    }
                ]
            }
        ]
    }
}

# Extract all item IDs from multiple groups
def collect_item_ids(data):
    item_ids = []

    # Loop through all boards
    for board in data.get("data", {}).get("boards", []):
        # Loop through all groups within a board
        for group in board.get("groups", []):
            # Extract items from each group
            for item in group.get("items_page", {}).get("items", []):
                item_ids.append(item["id"])

    return item_ids

# Get all IDs
all_ids = collect_item_ids(json_data)
print(all_ids)  # Output: ['123', '456', '789', '101', '102', '200', '201']

