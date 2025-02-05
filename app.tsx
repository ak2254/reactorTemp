import requests
import time
from concurrent.futures import ThreadPoolExecutor

API_URL = "https://api.monday.com/v2"
HEADERS = {"Authorization": "your_api_token", "Content-Type": "application/json"}

def delete_item(item_id):
    query = f'mutation {{ delete_item(item_id: {item_id}) {{ id }} }}'
    response = requests.post(API_URL, json={"query": query}, headers=HEADERS)
    return {"item_id": item_id, "status": response.status_code, "response": response.json()}

def process_batch(item_batch, max_workers=5):
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        results = list(executor.map(delete_item, item_batch))
    return results

# Example: 300 item IDs
item_ids = list(range(1001, 1301))  # Mock 300 IDs

batch_size = 50  # Process 50 at a time
delay_between_batches = 10  # 10 seconds delay to spread requests

all_results = []
for i in range(0, len(item_ids), batch_size):
    batch = item_ids[i : i + batch_size]
    print(f"Processing batch {i//batch_size + 1} with {len(batch)} records...")
    
    results = process_batch(batch, max_workers=5)
    all_results.extend(results)

    # Delay between batches
    if i + batch_size < len(item_ids):
        print(f"Waiting {delay_between_batches} seconds before next batch...")
        time.sleep(delay_between_batches)

print("All deletions completed.")
