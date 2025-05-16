# SharePoint auth setup (change to env vars in production)
SHAREPOINT_SITE_URL = "https://yourtenant.sharepoint.com/sites/yoursite"
SHAREPOINT_USERNAME = "your.name@yourtenant.com"
SHAREPOINT_PASSWORD = "your_password"
SHAREPOINT_LIST_NAME = "Your List Name"

# Create a connection to the SharePoint site
def get_sp_context():
    ctx = ClientContext(SHAREPOINT_SITE_URL).with_credentials(
        UserCredential(SHAREPOINT_USERNAME, SHAREPOINT_PASSWORD)
    )
    return ctx



def add_sharepoint_row(new_row: dict):
    ctx = get_sp_context()
    sp_list = ctx.web.lists.get_by_title(SHAREPOINT_LIST_NAME)

    # Adjust keys to match actual SharePoint column internal names
    sp_item = sp_list.add_item(new_row)
    ctx.execute_query()
    print(f"✅ Added new SharePoint row: {new_row['task_id']}")



def update_sharepoint_row(row_id: str, updated_fields: dict):
    ctx = get_sp_context()
    sp_list = ctx.web.lists.get_by_title(SHAREPOINT_LIST_NAME)

    item = sp_list.get_item_by_id(row_id)
    item.set_property_multiple(updated_fields)
    item.update()
    ctx.execute_query()
    print(f"♻️ Updated SharePoint row ID {row_id} with: {updated_fields}")

