import openpyxl
from openpyxl import load_workbook
from openpyxl.utils.dataframe import dataframe_to_rows
from openpyxl.styles import Alignment
import datetime as dt

# Load Excel file
wb = load_workbook("pp.xlms")
sheet = wb["PP"]

# Extract relevant columns for Bottle Batch and Bottle Ship
columns_bb = ["Project", "Run ID", "Number of Bottles", "Product No", "Batch#", "Bottle/Bag Date", "Comments"]
columns_sh = ["Project", "Run ID", "Number of Bottles", "Product No", "Batch#", "BDS/BDI Ship Date", "Comments"]

# Set default values for new columns
default_values = {
    "PackageType": "Bottle",
    "BottleUnits": 0,
    "Quarantine": "FALSE",
    "NCR": "FALSE",
}

# Update default values for Bottle Batch
for key, value in default_values.items():
    sheet[key + "2"].value = value

# Update default values for Bottle Ship
for key, value in default_values.items():
    sheet[key + "3"].value = value

# Process Bottle Batch and Bottle Ship data
data_frames = [(columns_bb, "Bottle/Bag Date", 2), (columns_sh, "BDS/BDI Ship Date", 3)]
for columns, date_column, start_row in data_frames:
    for row in dataframe_to_rows(sheet, index=False, header=False, min_col=start_row, max_col=len(columns) + start_row - 1):
        code = str(row[columns.index("Number of Bottles")])
        iblank = code.find("Bag")
        comments = str(row[columns.index("Comments")])

        # Check for Quarantine
        underq = comments.lower().find("under q")
        if underq > -1:
            underq = comments.lower().find("quarantine")
            if underq == -1:
                sheet[columns.index("Quarantine") + start_row][0].value = "True"
        else:
            word_quarantine = comments.lower().find("quarantine")
            if word_quarantine > -1:
                sheet[columns.index("Quarantine") + start_row][0].value = "TRUE"

        # Check for NCR
        ncr_present = comments.find("NCR")
        if ncr_present > -1:
            sheet[columns.index("NCR") + start_row][0].value = "TRUE"

        # Process Bag information
        if iblank > -1:
            sheet[columns.index("PackageType") + start_row][0] = "Bag"
            sheet[columns.index("Number of Bottles") + start_row][0] = int(code[0:iblank - 1])
            sheet[columns.index("BottleUnits") + start_row][0] = int(code[0:iblank - 1]) * 7
        else:
            sheet[columns.index("BottleUnits") + start_row][0] = row[columns.index("Number of Bottles")]

# Convert date columns to datetime
for cell in sheet[date_column]:
    if isinstance(cell.value, dt.datetime):
        cell.value = cell.value.date()

# Filter rows with EventDate greater than today
filtered_rows_sh = [(row[sheet["BDS/BDI Ship Date"].column - 1].value, row) for row in sheet.iter_rows(
    min_row=4, max_row=sheet.max_row, values_only=True) if
                    row[sheet["BDS/BDI Ship Date"].column - 1].value > dt.date.today()]
data_sh = [row for _, row in filtered_rows_sh]

filtered_rows_bb = [(row[sheet["Bottle/Bag Date"].column - 1].value, row) for row in sheet.iter_rows(
    min_row=3, max_row=sheet.max_row, values_only=True) if
                    row[sheet["Bottle/Bag Date"].column - 1].value > dt.date.today()]
data_bb = [row for _, row in filtered_rows_bb]

# Drop first row
data_sh = data_sh[1:]
data_bb = data_bb[1:]

# Concatenate DataFrames
data_all = data_bb + data_sh

# Sort by EventDate
data_all.sort(key=lambda x: x[data_all[0].index("Bottle/Bag Date")])

# Calculate cumulative BottleUnits
cumulative = 0
for row in data_all:
    cumulative += row[data_all[0].index("Number of Bottles")]
    row[data_all[0].index("CumBottleUnits")] = cumulative

# Save changes
wb.save("pp_modified.xlms")
