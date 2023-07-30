import os
import requests

def download_and_save_csv_file(url, save_path):
    try:
        # Send the GET request to download the CSV file
        with requests.get(url, verify=False, stream=True) as response:
            response.raise_for_status()  # Check if the request was successful

            # Save the downloaded content to a temporary file
            temp_file_path = save_path + ".temp"
            with open(temp_file_path, 'wb') as file:
                for chunk in response.iter_content(chunk_size=8192):
                    file.write(chunk)

            # Move the temporary file to the final destination after successful download
            os.replace(temp_file_path, save_path)

        print(f"File downloaded successfully and saved at {save_path}")
        return True

    except requests.exceptions.HTTPError as http_err:
        print(f"HTTP error occurred: {http_err}")
    except requests.exceptions.RequestException as req_err:
        print(f"Request exception occurred: {req_err}")
    except IOError as io_err:
        print(f"IO error occurred while saving the file: {io_err}")

        # Delete the temporary file if download was unsuccessful or incomplete
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

    return False

# Example usage:
url = "https://example.com/path/to/your/csvfile.csv"
save_path = "local_path/to/save/your/csvfile.csv"

if download_and_save_csv_file(url, save_path):
    # Proceed with using the downloaded file here
    with open(save_path, 'r') as file:
        for line in file:
            # Process each line of the downloaded CSV file
            print(line.strip())  # Example: Print each line without newline character
else:
    # Handle download failure
    pass
