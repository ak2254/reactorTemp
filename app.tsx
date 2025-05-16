def update_sharepoint_row(row_id: str, updated_fields: dict):
    ctx = get_sp_context()
    sp_list = ctx.web.lists.get_by_title(SHAREPOINT_LIST_NAME)
    
    try:
        item = sp_list.get_item_by_id(row_id)
        item.set_property_multiple(updated_fields)
        item.update()
        ctx.execute_query()
        print(f"♻️ Updated SharePoint row ID {row_id} with: {updated_fields}")
    except ClientRequestException as ex:
        print(f"❌ Failed to update SharePoint row ID {row_id}: {ex}")
