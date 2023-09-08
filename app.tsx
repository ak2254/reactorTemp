
import pandas as pd

# Assuming you have DataFrames df1 and df2
# Rename the "timestamp" column in df1 to "timestamp_sheet1"
df1 = df1.rename(columns={"timestamp": "timestamp_sheet1"})

# Rename the "timestamp" column in df2 to "timestamp_sheet2"
df2 = df2.rename(columns={"timestamp": "timestamp_sheet2"})

# Merge df1 and df2 on the "timestamp_sheet1" and "timestamp_sheet2" columns with a left join
merged_df = pd.merge(df1, df2, left_on="timestamp_sheet1", right_on="timestamp_sheet2", how="left")

# Find rows in df1 that are not in df2
rows_not_in_df2 = merged_df[merged_df["timestamp_sheet2"].isna()]

# Now, rows_not_in_df2 contains the rows from df1 that are not in df2 based on the "timestamp" column
print(rows_not_in_df2)
filtered_df = merged_df[merged_df["alarm type"] != "return"]
