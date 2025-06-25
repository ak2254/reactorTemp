
from office365.sharepoint.client_context import ClientContext

ctx = ClientContext(site_url).with_credentials(credentials)
list_obj = ctx.web.lists.get_by_title("Your List Name")

# Select specific fields by internal name
items = list_obj.items.select("Id", "Title", "Employee_x0020_Name", "Status").top(100).get().execute_query()

for item in items:
    print(item.properties)
