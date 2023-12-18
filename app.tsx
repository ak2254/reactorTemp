import pandas as pd
import datetime as dt

# Load Excel file
xls = pd.ExcelFile("pp.xlms")
df = pd.read_excel(xls, "PP")

# Extract relevant columns for Bottle Batch and Bottle Ship
dfbb = df[["Project", "Run ID", "Number of Bottles", "Product No", "Batch#", "Bottle/Bag Date", "Comments"]]
dfsh = df[["Project", "Run ID", "Number of Bottles", "Product No", "Batch#", "BDS/BDI Ship Date", "Comments"]]

# Set default values for new columns
default_values = {
    "PackageType": "Bottle",
    "BottleUnits": 0,
    "Quarantine": "FALSE",
    "NCR": "FALSE",
}

# Update default values for Bottle Batch
dfbb = dfbb.assign(Event="BB", **default_values)
dfbb.rename(columns={"Number of Bottles": "PackageQty", "Bottle/Bag Date": "EventDate"}, inplace=True)

# Update default values for Bottle Ship
dfsh = dfsh.assign(Event="Ship", **default_values)
dfsh.rename(columns={"Number of Bottles": "PackageQty", "BDS/BDI Ship Date": "EventDate"}, inplace=True)

# Process Bottle Batch and Bottle Ship data
for df_temp in [dfbb, dfsh]:
    for index, row in df_temp.iterrows():
        code = str(row["PackageQty"])
        iblank = code.find("Bag")
        comments = str(row["Comments"])

        # Check for Quarantine
        underq = comments.lower().find("under q")
        if underq > -1:
            underq = comments.lower().find("quarantine")
            if underq == -1:
                df_temp.at[index, "Quarantine"] = "True"
        else:
            word_quarantine = comments.lower().find("quarantine")
            if word_quarantine > -1:
                df_temp.at[index, "Quarantine"] = "TRUE"

        # Check for NCR
        ncr_present = comments.find("NCR")
        if ncr_present > -1:
            df_temp.at[index, "NCR"] = "TRUE"

        # Process Bag information
        if iblank > -1:
            df_temp.at[index, "PackageType"] = "Bag"
            df_temp.at[index, "PackageQty"] = int(code[0:iblank - 1])
            df_temp.at[index, "BottleUnits"] = int(code[0:iblank - 1]) * 7
        else:
            df_temp.at[index, "BottleUnits"] = row["PackageQty"]

# Convert date columns to datetime
dfbb["EventDate"] = pd.to_datetime(dfbb["EventDate"])
dfsh["EventDate"] = pd.to_datetime(dfsh["EventDate"]).dt.date

# Filter rows with EventDate greater than today
dfsh = dfsh[dfsh["EventDate"] > dt.date.today()]
dfbb = dfbb[dfbb["EventDate"] > dt.date.today()]

# Drop first row
dfsh.drop(dfsh.index[0], axis=0, inplace=True)
dfbb.drop(dfbb.index[0], axis=0, inplace=True)

# Concatenate DataFrames
dfall = pd.concat([dfbb, dfsh], ignore_index=True)

# Sort by EventDate
dfall.sort_values(by=["EventDate"], inplace=True)

# Calculate cumulative BottleUnits
dfall["CumBottleUnits"] = dfall["BottleUnits"].cumsum()

