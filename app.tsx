WRRRP_Count :=
from prefect import flow, task
import pandas as pd
import sqlalchemy

# 1. Convert list of tuples into list of dicts
data_dicts = [dict(zip(header, row)) for row in sql_data]

# 2. Define the checksum function
def generate_row_checksum(row: dict, columns: tuple, hash_algo="sha256") -> str:
    row_str = '|'.join(str(row[col]) for col in columns)
    h = hashlib.new(hash_algo)
    h.update(row_str.encode('utf-8'))
    return h.hexdigest()

# 3. Choose columns to include in checksum
checksum_columns = ("title", "etch")

# 4. Add the checksum to each row
for row in data_dicts:
    row["checksum"] = generate_row_checksum(row, checksum_columns)
