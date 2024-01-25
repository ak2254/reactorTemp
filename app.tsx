
import pandas as pd

# Load the first CSV file with SAP
csv_file_sap = 'path/to/your/first_file.csv'  # Replace with the actual path
df_sap = pd.read_csv(csv_file_sap)

# Load the second CSV file with SAP and project
csv_file_project = 'path/to/your/second_file.csv'  # Replace with the actual path
df_project = pd.read_csv(csv_file_project)

# Merge the two DataFrames based on the 'SAP' column
merged_df = pd.merge(df_sap, df_project, on='SAP', how='left')

# Save the result to a new CSV file
output_csv_file = 'path/to/your/output_file.csv'  # Replace with the desired output path
merged_df.to_csv(output_csv_file, index=False)

print(f"Results saved to {output_csv_file}")
