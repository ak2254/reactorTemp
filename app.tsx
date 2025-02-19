import re

data = [{"description": "This is a post campaign 025"},
        {"description": "Regular campaign launch"},
        {"description": "Product 025"},
        {"description": "Some other text"}]

# Function to determine type based on description
def assign_type(description):
    description_lower = description.lower()  # Convert to lowercase for case-insensitive matching
    contains_post_campaign = bool(re.search(r'\bpost\b.*\bcampaign\b', description_lower))
    contains_025 = "025" in description_lower

    if contains_post_campaign:
        return "post campaign"
    elif contains_025:
        return "g-25"
    return "other"

# Updating the list with new 'type' column
for entry in data:
    entry["type"] = assign_type(entry["description"])

# Print updated data
print(data)
