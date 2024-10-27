import pytest
from unittest.mock import MagicMock, patch
from io import BytesIO
from prefect.blocks.system import Secret  # Prefect's Secret
from pydantic import AnyHttpUrl
from prefect.flows.powerapps.util.sharepoint import download_sharepoint_0365_file  # Correct import

@patch("prefect.flows.powerapps.util.sharepoint.ClientContext")  # Correct path for ClientContext
def test_download_sharepoint_0365_file(mock_client_context):
    # Setup mock parameters
    mock_site_url = "https://mocksite.sharepoint.com/sites/mocksuite"  # Example URL
    mock_file_path = "/mockfolder/mockfile.txt"
    mock_username = "mockuser"
    mock_password = Secret.load("mockpassword")  # Load the Secret from Prefect
    
    # Setup a BytesIO to act as the file handle
    mock_handle = BytesIO()

    # Mock the client context and download execution
    mock_ctx = MagicMock()
    mock_file = MagicMock()
    
    # Mock the chain of method calls
    mock_client_context.return_value = mock_ctx
    mock_ctx.web.get_file_by_server_relative_url.return_value = mock_file
    mock_file.download.return_value.execute_query.return_value = None

    # Call the function with mocked parameters
    download_sharepoint_0365_file(
        handle=mock_handle,
        site_url=AnyHttpUrl(mock_site_url, scheme="https"),
        file_path=mock_file_path,
        username=mock_username,
        password=mock_password
    )

    # Assertions
    mock_client_context.assert_called_once_with(mock_site_url)  # Ensure ClientContext was called
    mock_ctx.with_user_credentials.assert_called_once_with(mock_username, "mockpassword")  # Ensure credentials were set
    mock_ctx.web.get_file_by_server_relative_url.assert_called_once_with(mock_file_path)  # Ensure file path was used
    mock_file.download.assert_called_once_with(mock_handle)  # Ensure download was called
    mock_handle.seek(0)  # Check that the handle is reset to the start
