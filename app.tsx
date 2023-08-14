from shareplum import Site, Office365
import pandas as pd

# SharePoint site and list information
sharepoint_url = "https://your-sharepoint-site-url"
username = "your-username"
password = "your-password"
list_name = "Your List Name"

# Connect to SharePoint using Office365 authentication
authcookie = Office365(sharepoint_url, username=username, password=password).GetCookies()
site = Site(sharepoint_url, version=Version.v365, authcookie=authcookie)
