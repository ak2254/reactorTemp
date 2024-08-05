from prefect import task, Flow
import tempfile
import os
from office365.runtime.auth.authentication_context import AuthenticationContext
from office365.sharepoint.client_context import ClientContext
from office365.sharepoint.files.file import File

@task
def create_temp_file_with_data(data):
    # Create a temporary file
    with tempfile.NamedTemporaryFile(delete=False, mode='w', newline='') as temp_file:
        temp_file_path = temp_file.name
        
        # Write data to the temporary file
        with open(temp_file_path, 'w', newline='') as fh:
            fh.write("manager,user\n")
            for row in data:
                fh.write(",".join(row) + "\n")
    
    return temp_file_path

@task
def upload_to_sharepoint(file_path, site_url, username, password, sharepoint_folder):
    # Authenticate and get the SharePoint client context
    ctx_auth = AuthenticationContext(site_url)
    if not ctx_auth.acquire_token_for_user(username, password):
        raise Exception("Authentication failed")
    ctx = ClientContext(site_url, ctx_auth)
    
    # Upload the file
    with open(file_path, 'rb') as file_content:
        file_name = os.path.basename(file_path)
        target_folder = ctx.web.get_folder_by_server_relative_url(sharepoint_folder)
        
        # Check if file exists and delete it if necessary
        existing_file = target_folder.files.get_by_name(file_name)
        if existing_file:
            existing_file.delete_object()
            ctx.execute_query()
        
        # Upload new file
        target_folder.upload_file(file_name, file_content)
        ctx.execute_query()

    return file_name

@task
def delete_temp_file(file_path):
    if os.path.exists(file_path):
        os.remove(file_path)
    return file_path

# Define the Prefect Flow
with Flow("Upload Temp File to SharePoint") as flow:
    site_url = 'https://yourcompany.sharepoint.com/sites/yoursite'
    username = 'yourusername'
    password = 'yourpassword'
    sharepoint_folder = 'Shared Documents'
    
    # Sample data
    data = [
        ("manager1", "user1"),
        ("manager2", "user2"),
        ("manager3", "user3")
    ]
    
    # Define the flow
    temp_file = create_temp_file_with_data(data)
    uploaded_file_name = upload_to_sharepoint(temp_file, site_url, username, password, sharepoint_folder)
    delete_temp_file(temp_file)

# Run the flow
if __name__ == "__main__":
    flow.run()
