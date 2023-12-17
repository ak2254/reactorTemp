import pyxl
import datetime as dt

# Open the Excel file
xls = pyxl.load_workbook("pp.xlms")
sheet = xls["PP"]

# Fetch the headers
headers = [cell.value for cell in sheet[1]]

# Find the index of each column
columns = {
    "Project": headers.index("Project"),
    "Run ID": headers.index("Run ID"),
    "Number of Bottles": headers.index("Number of Bottles"),
    "Product No": headers.index("Product No"),
    "Batch#": headers.index("Batch#"),
    "Bottle/Bag Date": headers.index("Bottle/Bag Date"),
    "BDS/BDI Ship Date": headers.index("BDS/BDI Ship Date"),
    "Comments": headers.index("Comments"),
}

# Extracting data from the Excel sheet
data = sheet.iter_rows(min_row=2, values_only=True)

# Initialize empty lists to store modified data
dfbb_data = []
dfsh_data = []

# Iterate through rows and make modifications
for row in data:
    project, run_id, num_bottles, product_no, batch, date_bb, date_sh, comments = row

    # Apply modifications for dfbb
    if "Bag" in str(num_bottles):
        iblank = str(num_bottles).find("Bag")
        if iblank > -1:
            # Modify PackageType for Bag in dfbb
            row = list(row) + ["Bag", -int(str(num_bottles)[0:iblank - 1]), -int(str(num_bottles)[0:iblank - 1]) * 7, "FALSE", "FALSE", "BB"]

    # Apply modifications for dfsh
    if "under q" in str(comments).lower():
        underq = str(comments).lower().find("under q")
        if underq == -1:
            # Modify Quarantine for under q in dfsh
            row = list(row) + ["Bottle", 0, 0, "TRUE", "FALSE", "Ship"]

    # Add the modified row to the respective list
    if "Bottle" in str(row[columns["PackageType"]]):
        dfbb_data.append(row)
    else:
        dfsh_data.append(row)

# Create new sheets for modified data
dfbb_sheet = xls.create_sheet("dfbb_modified")
dfsh_sheet = xls.create_sheet("dfsh_modified")

# Write headers to the new sheets
dfbb_sheet.append(headers + ["PackageType", "PackageQty", "BottleUnits", "Quarnatine", "NCR", "Event"])
dfsh_sheet.append(headers + ["PackageType", "PackageQty", "BottleUnits", "Quarnatine", "NCR", "Event"])

# Write modified data to the new sheets
for row in dfbb_data:
    dfbb_sheet.append(row)

for row in dfsh_data:
    dfsh_sheet.append(row)

# Save the modified Excel file
xls.save("modified_pp.xlms")
