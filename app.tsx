mutations = "\n".join(
    [f'delete_item_{i}: delete_item (item_id: {item_id}) {{ id }}' for i, item_id in enumerate(item_ids)]
)
