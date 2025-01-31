import json

def write_json_to_file(data, filename):
    """Writes JSON data to a file."""
    with open(filename, 'w', encoding='utf-8') as file:
        json.dump(data, file, indent=4)

# Example usage
data = {
    "name": "Alice",
    "age": 30,
    "city": "New York"
}

write_json_to_file(data, "output.json")
print("JSON data written to output.json")
