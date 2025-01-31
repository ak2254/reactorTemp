from prefect import flow, task
import os
import csv
import openpyxl
import xlrd

@task
def fetch_data_from_file(file_path: str) -> list[dict]:
    """
    Task to fetch data from a CSV or Excel file on a network path.
    
    Args:
        file_path (str): Path to the file (CSV or Excel).
    
    Returns:
        list[dict]: List of dictionaries representing rows in the file.
    """
    try:
        # Normalize path to handle spaces and special characters
        normalized_path = os.path.normpath(file_path)

        # Check file extension
        if normalized_path.lower().endswith('.csv'):
            with open(normalized_path, mode='r', newline='', encoding='utf-8') as file:
                reader = csv.DictReader(file)
                data = [row for row in reader]  # Convert CSV rows to list of dicts

        elif normalized_path.lower().endswith('.xlsx'):
            wb = openpyxl.load_workbook(normalized_path, data_only=True)
            sheet = wb.active  # Get the first sheet

            # Extract header row
            headers = [cell.value for cell in sheet[1]]
            data = []
            
            # Extract remaining rows
            for row in sheet.iter_rows(min_row=2, values_only=True):
                data.append(dict(zip(headers, row)))

        elif normalized_path.lower().endswith('.xls'):
            wb = xlrd.open_workbook(normalized_path)
            sheet = wb.sheet_by_index(0)  # Get the first sheet
            
            # Extract header row
            headers = [sheet.cell_value(0, col) for col in range(sheet.ncols)]
            data = []

            # Extract remaining rows
            for row_idx in range(1, sheet.nrows):
                row_values = [sheet.cell_value(row_idx, col) for col in range(sheet.ncols)]
                data.append(dict(zip(headers, row_values)))

        else:
            raise ValueError("Unsupported file format. Only CSV and Excel files are supported.")
        
        return data

    except FileNotFoundError:
        raise ValueError(f"File not found at {file_path}")
    except Exception as e:
        raise RuntimeError(f"Error reading file: {e}")

@task
def process_data(data: list[dict]) -> None:
    """
    Task to process the data.
    
    Args:
        data (list[dict]): List of dictionaries representing rows in the file.
    """
    print(f"Number of rows: {len(data)}")
    if data:
        print(f"First row: {data[0]}")  # Print the first row for preview

@flow
def file_processing_flow(file_path: str):
    """
    Prefect flow to fetch and process data from a CSV or Excel file on a network path.
    
    Args:
        file_path (str): Path to the file.
    """
    data = fetch_data_from_file(file_path)
    process_data(data)

if __name__ == "__main__":
    # Example: File paths for CSV and Excel
    file_path = r"\\network_drive\shared folder\example file.xlsx"  # Change to .csv or .xls if needed
    file_processing_flow(file_path)
