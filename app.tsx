# Update the Excel file on OneDrive
conn_str = (
    r'DRIVER={Microsoft Excel Driver (*.xls, *.xlsx, *.xlsm, *.xlsb)};'
    r'DBQ=' + excel_file_path
)

cnxn = pyodbc.connect(conn_str)
cursor = cnxn.cursor()

for _, row in df.iterrows():
    cursor.execute(
        "INSERT INTO [Sheet1$] (ID, Value, Version, Timestamp) VALUES (?, ?, ?, ?)",
        row["ID"], row["Value"], row["Version"], row["Timestamp"]
    )
cnxn.commit()
cursor.close()
cnxn.close()
Replace "path/to/your/excel/file.xlsx" with the actual path to your OneDrive Excel file.

Keep in mind that accessing Excel files in OneDrive using ODBC might have limitations, and it's important to ensure that the file is not locked or being accessed by other users while your script updates it.






