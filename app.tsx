import openpyxl
from openpyxl import load_workbook
from openpyxl.utils.dataframe import dataframe_to_rows
from openpyxl.styles import Alignment
import datetime as dt

# Load Excel file
wb = load_workbook("pp.xlms", data_only=True)
sheet = wb["PP"]

# Extract relevant columns for Bottle Batch and Bottle Ship
columns_bb = ["Project", "Run ID", "Number of Bottles", "Product No", "Batch#", "Bottle/Bag Date", "Comments"]
columns_sh = ["Project", "Run ID", "Number of Bottles", "Product No", "Batch#", "BDS/BDI Ship Date", "Comments"]

data_bb = [sheet[column] for column in columns_bb]
data_sh = [sheet[column] for column in columns_sh]

# Set default values for new columns
default_values = {
    "PackageType": "Bottle",
    "BottleUnits": 0,
    "Quarantine": "FALSE",
    "NCR": "FALSE",
}

# Update default values for Bottle Batch
data_bb.append(sheet["Event"])
for key, value in default_values.items():
    sheet[key].append(value)

# Update default values for Bottle Ship
data_sh.append(sheet["Event"])
for key, value in default_values.items():
    sheet[key].append(value)

# Process Bottle Batch and Bottle Ship data
data_frames = [data_bb, data_sh]
for data in data_frames:
    for row in dataframe_to_rows(data, index=False, header=True):
        code = str(row[data.columns.get_loc("PackageQty")])
        iblank = code.find("Bag")
        comments = str(row[data.columns.get_loc("Comments")])

        # Check for Quarantine
        underq = comments.lower().find("under q")
        if underq > -1:
            underq = comments.lower().find("quarantine")
            if underq == -1:
                sheet["Quarantine"].append("True")
        else:
            word_quarantine = comments.lower().find("quarantine")
            if word_quarantine > -1:
                sheet["Quarantine"].append("TRUE")

        # Check for NCR
        ncr_present = comments.find("NCR")
        if ncr_present > -1:
            sheet["NCR"].append("TRUE")

        # Process Bag information
        if iblank > -1:
            sheet["PackageType"].append("Bag")
            sheet["PackageQty"].append(int(code[0:iblank - 1]))
            sheet["BottleUnits"].append(int(code[0:iblank - 1]) * 7)
        else:
            sheet["BottleUnits"].append(row[data.columns.get_loc("PackageQty")])

# Convert date columns to datetime
for cell in sheet["EventDate"]:
    if isinstance(cell.value, dt.datetime):
        cell.value = cell.value.date()

# Filter rows with EventDate greater than today
filtered_rows_sh = [(row[data.columns.get_loc("EventDate")].value, row) for row in data_sh if
                    row[data.columns.get_loc("EventDate")].value > dt.date.today()]
data_sh = [row for _, row in filtered_rows_sh]

filtered_rows_bb = [(row[data.columns.get_loc("EventDate")].value, row) for row in data_bb if
                    row[data.columns.get_loc("EventDate")].value > dt.date.today()]
data_bb = [row for _, row in filtered_rows_bb]

# Drop first row
data_sh = data_sh[1:]
data_bb = data_bb[1:]

# Concatenate DataFrames
data_all = data_bb + data_sh

# Sort by EventDate
data_all.sort(key=lambda x: x[data_all[0].columns.get_loc("EventDate")])

# Calculate cumulative BottleUnits
cumulative = 0
for row in data_all:
    cumulative += row[data_all[0].columns.get_loc("BottleUnits")]
    row[data_all[0].columns.get_loc("CumBottleUnits")] = cumulative

# Save changes
wb.save("pp_modified.xlms")
