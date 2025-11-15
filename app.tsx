import pandas as pd
from datetime import datetime

# Configuration
INPUT_FILE = 'input.xlsx'
SHEET_NAME = 'Sheet1'
WORK_ORDER_COL = 'Work Order'  # Adjust column name as needed
STATUS_COL = 'Status'  # Adjust column name as needed
DATE_COL = 'Reported Date'  # Adjust column name as needed

# Output files
OUTPUT_DEDUPED = f'deduped_{datetime.now().strftime("%Y%m%d_%H%M%S")}.xlsx'
OUTPUT_DELETED = f'deleted_rows_{datetime.now().strftime("%Y%m%d_%H%M%S")}.xlsx'

def process_excel():
    # Step 1: Read data from Excel
    print("Reading Excel file...")
    df = pd.read_excel(INPUT_FILE, sheet_name=SHEET_NAME)
    print(f"Total rows read: {len(df)}")
    
    # Separate empty work order rows
    empty_wo_mask = df[WORK_ORDER_COL].isna() | (df[WORK_ORDER_COL] == '')
    empty_wo_rows = df[empty_wo_mask].copy()
    df_filtered = df[~empty_wo_mask].copy()
    
    print(f"Rows with empty work orders: {len(empty_wo_rows)}")
    print(f"Rows with work orders: {len(df_filtered)}")
    
    # Step 2: Add helper column for "not closed" status
    df_filtered['is_not_closed'] = df_filtered[STATUS_COL].str.lower() != 'closed'
    
    # Step 3: Sort - not closed first, then by date (latest first)
    # Convert date column to datetime if not already
    df_filtered[DATE_COL] = pd.to_datetime(df_filtered[DATE_COL], errors='coerce')
    
    df_filtered = df_filtered.sort_values(
        by=['is_not_closed', DATE_COL],
        ascending=[False, False]  # Not closed first (True before False), latest date first
    )
    
    # Step 4: Drop duplicates, keep first occurrence
    initial_count = len(df_filtered)
    df_deduped = df_filtered.drop_duplicates(subset=[WORK_ORDER_COL], keep='first')
    deleted_rows = df_filtered[~df_filtered.index.isin(df_deduped.index)]
    
    print(f"Rows after deduplication: {len(df_deduped)}")
    print(f"Duplicate rows removed: {len(deleted_rows)}")
    
    # Step 5: Add back empty work order rows at the end
    df_final = pd.concat([df_deduped, empty_wo_rows], ignore_index=True)
    
    # Remove helper column from final output
    df_final = df_final.drop(columns=['is_not_closed'])
    deleted_rows = deleted_rows.drop(columns=['is_not_closed'])
    
    # Step 6: Save to separate files
    print(f"\nSaving deduplicated data to: {OUTPUT_DEDUPED}")
    df_final.to_excel(OUTPUT_DEDUPED, index=False)
    
    if len(deleted_rows) > 0:
        print(f"Saving deleted rows to: {OUTPUT_DELETED}")
        deleted_rows.to_excel(OUTPUT_DELETED, index=False)
    else:
        print("No duplicate rows to save.")
    
    print("\n=== Summary ===")
    print(f"Original rows: {len(df)}")
    print(f"Empty work orders (retained): {len(empty_wo_rows)}")
    print(f"Rows processed: {initial_count}")
    print(f"Final deduplicated rows: {len(df_final)}")
    print(f"Duplicates removed: {len(deleted_rows)}")

if __name__ == "__main__":
    try:
        process_excel()
    except FileNotFoundError:
        print(f"Error: Could not find file '{INPUT_FILE}'")
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        import traceback
        traceback.print_exc()





=LET(txt,A2,
digits, TEXTJOIN("",,IF(ISNUMBER(--MID(txt,SEQUENCE(LEN(txt)),1)),MID(txt,SEQUENCE(LEN(txt)),1),"")),
digits)


=LEFT(A2, MIN(FIND({0,1,2,3,4,5,6,7,8,9}&" ",A2&" "))-1)
=LEFT(A2, MATCH(FALSE, ISNUMBER(--MID(A2, ROW($1:$50), 1)), 0)-1)


