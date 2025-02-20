import re

data = [{"description": "This is a post campaign 025"},
        {"description": "Regular campaign launch"},
        {"description": "Product 025"},
        {"description": "Some other text"},
        {"description": "It's post campaign inspection"},
        {"description": "Campaign post inspection"},
        {"description": "Inspection of post campaign"},
        {"description": "Post and campaign only"},  # Should not match (missing "inspection")
        {"description": "Inspection post"},  # Should not match (missing "campaign")
        {"description": "Post campaign inspection 025"},  # Should match
        {"description": "Post-campaign inspection"},  # Should match
        {"description": "Post-campaign and inspection"},  # Should match
        {"description": "Campaign post-inspection"},  # Should match
        {"description": "Post-inspection without campaign"}]  # Should not match

# Function to determine type based on description
def assign_type(description):
    # Normalize: Replace hyphens with spaces and convert to lowercase
    description_normalized = re.sub(r'[-]', ' ', description.lower())

    # Ensure all three words exist in the modified text
    contains_all_three = all(word in description_normalized for word in ["post", "campaign", "inspection"])
    contains_g034 = bool(re.search(r'\bg 034\b', description_normalized))

    if contains_all_three:
        return "post campaign"
    elif contains_025:
        return "g-25"
    return "other"

# Updating the list with new 'type' column
for entry in data:
    entry["type"] = assign_type(entry["description"])

# Print updated data
print(data)
