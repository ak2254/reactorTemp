import openpyxl
from openpyxl import Workbook
from openpyxl.utils.dataframe import dataframe_to_rows
from datetime import datetime

# Specify the path to your Excel file
excel_file_path = "path/to/your/excel/file.xlsx"

# Load the existing Excel file
wb = openpyxl.load_workbook(excel_file_path)

# Select the worksheet you want to work with
ws = wb.active

# Calculate the new values for the row to be inserted
last_row = ws.max_row
new_id = last_row + 1
new_value = 50
new_version = ws.cell(row=last_row, column=3).value + 1
new_timestamp = datetime.now()

# Create a new row
new_row_data = [new_id, new_value, new_version, new_timestamp]
ws.append(new_row_data)

# Save the updated Excel file
wb.save(excel_file_path)
