def delete_item(item_id):
    mutation = f"""
    mutation {{
        delete_item (item_id: {item_id}) {{
            id
        }}
    }}
    """
    requests.post(API_URL, json={"query": mutation}, headers=HEADERS)
