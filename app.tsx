cat > deployments/prod/deployment-configs.yaml << 'EOF'
deployments:
  - name: hello-world-prod
    entrypoint: flows/examples/hello_world.py:hello_world_flow
    parameters:
      name: "Production"
      environment: prod
    work_pool:
      name: "AGK"
    schedule:
      cron: "0 9 * * *"
    tags:
      - prod
      - example
EOF
cat > deployments/dev/deployment-configs.yaml << 'EOF'
deployments:
  - name: hello-world-dev
    entrypoint: flows/examples/hello_world.py:hello_world_flow
    parameters:
      name: "Dev Environment"
      environment: dev
    work_pool:
      name: "AGK"
    schedule:
      cron: "*/30 * * * *"
    tags:
      - dev
      - example
EOF
cat > .gitignore << 'EOF'
__pycache__/
*.py[cod]
*$py.class
.env
.venv/
.pytest_cache/
.coverage
*.log
.DS_Store
EOF
import openpyxl
import csv
from difflib import get_close_matches, SequenceMatcher
import re

def clean_name(name):
    """Clean and normalize names for better matching"""
    if not name or name == '':
        return ''
    
    # Convert to lowercase and remove extra spaces
    name = str(name).lower().strip()
    
    # Remove common prefixes/suffixes and special characters
    name = re.sub(r'[^\w\s]', '', name)  # Remove special characters
    name = re.sub(r'\s+', ' ', name)     # Replace multiple spaces with single space
    
    return name

def similarity_ratio(name1, name2):
    """Calculate similarity ratio between two names"""
    return SequenceMatcher(None, clean_name(name1), clean_name(name2)).ratio()

def find_best_match(target_name, user_names, threshold=0.6):
    """
    Find the best matching name from user_names for target_name
    Returns tuple: (best_match_name, similarity_score)
    """
    if not target_name or target_name == '':
        return None, 0
    
    cleaned_target = clean_name(target_name)
    if not cleaned_target:
        return None, 0
    
    best_match = None
    best_score = 0
    
    for user_name in user_names:
        if not user_name or user_name == '':
            continue
            
        score = similarity_ratio(cleaned_target, user_name)
        
        if score > best_score and score >= threshold:
            best_match = user_name
            best_score = score
    
    return best_match, best_score

def load_users_data(workbook_path, sheet_name='Sheet1'):
    """Load users data from Excel file"""
    wb = openpyxl.load_workbook(workbook_path)
    ws = wb[sheet_name]
    
    # Get headers from first row
    headers = []
    for cell in ws[1]:
        headers.append(cell.value)
    
    # Find column indices
    user_name_col = None
    email_col = None
    
    for i, header in enumerate(headers):
        if header and 'name' in str(header).lower():
            user_name_col = i
        elif header and 'email' in str(header).lower():
            email_col = i
    
    if user_name_col is None:
        raise ValueError("Could not find User_Name column in users data")
    if email_col is None:
        raise ValueError("Could not find Email column in users data")
    
    # Load user data
    users = {}
    user_names = []
    
    for row in ws.iter_rows(min_row=2, values_only=True):
        if row[user_name_col]:  # Skip empty names
            name = str(row[user_name_col]).strip()
            email = str(row[email_col]).strip() if row[email_col] else ''
            users[name] = {
                'name': name,
                'email': email,
                'full_row': row
            }
            user_names.append(name)
    
    wb.close()
    return users, user_names

def load_resolution_data(csv_path):
    """Load resolution data from CSV file"""
    resolution_data = []
    headers = []
    assigned_to_col = None
    
    with open(csv_path, 'r', encoding='utf-8', newline='') as file:
        # Try to detect delimiter
        sample = file.read(1024)
        file.seek(0)
        
        # Common delimiters to try
        delimiters = [',', ';', '\t', '|']
        delimiter = ','
        
        for delim in delimiters:
            if sample.count(delim) > 0:
                delimiter = delim
                break
        
        reader = csv.reader(file, delimiter=delimiter)
        
        # Read headers
        headers = next(reader)
        headers = [str(h).strip() if h else '' for h in headers]
        
        # Find assigned_to column
        for i, header in enumerate(headers):
            if header and 'assigned' in header.lower():
                assigned_to_col = i
                break
        
        if assigned_to_col is None:
            raise ValueError("Could not find 'assigned to' column in resolution data")
        
        # Read data rows
        for row_num, row in enumerate(reader, start=2):
            # Ensure row has enough columns
            while len(row) < len(headers):
                row.append('')
            
            resolution_data.append({
                'row_num': row_num,
                'assigned_to': str(row[assigned_to_col]).strip() if len(row) > assigned_to_col and row[assigned_to_col] else '',
                'original_row': row
            })
    
    return resolution_data, headers, assigned_to_col

def process_fuzzy_matching(users_file, resolution_file, output_file, 
                          users_sheet='Sheet1', 
                          similarity_threshold=0.6, output_format='csv'):
    """
    Main function to process fuzzy matching between users and resolution data
    output_format: 'csv' or 'excel'
    """
    print("Loading users data...")
    users, user_names = load_users_data(users_file, users_sheet)
    print(f"Loaded {len(users)} users")
    
    print("Loading resolution data...")
    resolution_data, headers, assigned_to_col = load_resolution_data(resolution_file)
    print(f"Loaded {len(resolution_data)} resolution records")
    
    print("Performing fuzzy matching...")
    matches_found = 0
    
    # Process each resolution record
    for record in resolution_data:
        assigned_name = record['assigned_to']
        
        if assigned_name:
            best_match, score = find_best_match(assigned_name, user_names, similarity_threshold)
            
            if best_match:
                user_info = users[best_match]
                record['matched_user_name'] = user_info['name']
                record['matched_user_email'] = user_info['email']
                record['match_score'] = round(score, 3)
                matches_found += 1
            else:
                record['matched_user_name'] = ''
                record['matched_user_email'] = ''
                record['match_score'] = 0
        else:
            record['matched_user_name'] = ''
            record['matched_user_email'] = ''
            record['match_score'] = 0
    
    print(f"Found matches for {matches_found} out of {len(resolution_data)} records")
    
    # Create output file
    print(f"Creating output file: {output_file}")
    
    # Add new headers
    new_headers = headers + ['Matched_User_Name', 'Matched_User_Email', 'Match_Score']
    
    if output_format.lower() == 'csv':
        # Save as CSV
        with open(output_file, 'w', newline='', encoding='utf-8') as file:
            writer = csv.writer(file)
            
            # Write headers
            writer.writerow(new_headers)
            
            # Write data
            for record in resolution_data:
                row_data = record['original_row'] + [
                    record['matched_user_name'],
                    record['matched_user_email'],
                    record['match_score']
                ]
                writer.writerow(row_data)
    else:
        # Save as Excel
        wb_out = openpyxl.Workbook()
        ws_out = wb_out.active
        
        # Write headers
        for col, header in enumerate(new_headers, 1):
            ws_out.cell(row=1, column=col, value=header)
        
        # Write data
        for record in resolution_data:
            row_data = record['original_row'] + [
                record['matched_user_name'],
                record['matched_user_email'],
                record['match_score']
            ]
            ws_out.append(row_data)
        
        wb_out.save(output_file)
        wb_out.close()
    
    print(f"Output saved to: {output_file}")
    return matches_found, len(resolution_data)

def print_matching_summary(users_file, resolution_file, users_sheet='Sheet1', 
                          similarity_threshold=0.6):
    """
    Print a summary of potential matches without creating output file
    """
    users, user_names = load_users_data(users_file, users_sheet)
    resolution_data, _, _ = load_resolution_data(resolution_file)
    
    print(f"\n=== FUZZY MATCHING SUMMARY ===")
    print(f"Similarity threshold: {similarity_threshold}")
    print(f"Total users: {len(users)}")
    print(f"Total resolution records: {len(resolution_data)}")
    print("\nMatching results:")
    print("-" * 80)
    
    for i, record in enumerate(resolution_data[:10]):  # Show first 10 for demo
        assigned_name = record['assigned_to']
        if assigned_name:
            best_match, score = find_best_match(assigned_name, user_names, similarity_threshold)
            status = "✓ MATCH" if best_match else "✗ NO MATCH"
            
            print(f"{i+1:2d}. {assigned_name:<25} -> {best_match or 'None':<25} "
                  f"(Score: {score:.3f}) {status}")
        else:
            print(f"{i+1:2d}. {'<EMPTY>':<25} -> {'None':<25} (Score: 0.000) ✗ NO MATCH")
    
    if len(resolution_data) > 10:
        print(f"... and {len(resolution_data) - 10} more records")

# Example usage
if __name__ == "__main__":
    # File paths (update these with your actual file paths)
    users_excel = "users.xlsx"          # Your users Excel file
    resolution_csv = "resolution.csv"   # Your resolution CSV file
    output_file = "matched_results.csv" # Output file (can be .csv or .xlsx)
    
    try:
        # Option 1: Just preview the matching results
        print("=== PREVIEW MODE ===")
        print_matching_summary(
            users_file=users_excel,
            resolution_file=resolution_csv,
            users_sheet='Sheet1',           # Update sheet name if different
            similarity_threshold=0.6        # Adjust threshold as needed (0.0 to 1.0)
        )
        
        print("\n" + "="*50)
        
        # Option 2: Process and create output file
        print("=== PROCESSING MODE ===")
        
        # Determine output format based on file extension
        output_format = 'excel' if output_file.endswith('.xlsx') else 'csv'
        
        matches, total = process_fuzzy_matching(
            users_file=users_excel,
            resolution_file=resolution_csv,
            output_file=output_file,
            users_sheet='Sheet1',           # Update sheet name if different
            similarity_threshold=0.6,       # Adjust threshold as needed
            output_format=output_format
        )
        
        print(f"\nSUCCESS! Matched {matches}/{total} records")
        print(f"Results saved to: {output_file}")
        
    except FileNotFoundError as e:
        print(f"Error: Could not find file - {e}")
        print("Please update the file paths in the script")
    except Exception as e:
        print(f"Error: {e}")





import openpyxl
from difflib import get_close_matches, SequenceMatcher
import re

def clean_name(name):
    """Clean and normalize names for better matching"""
    if not name or name == '':
        return ''
    
    # Convert to lowercase and remove extra spaces
    name = str(name).lower().strip()
    
    # Remove common prefixes/suffixes and special characters
    name = re.sub(r'[^\w\s]', '', name)  # Remove special characters
    name = re.sub(r'\s+', ' ', name)     # Replace multiple spaces with single space
    
    return name

def similarity_ratio(name1, name2):
    """Calculate similarity ratio between two names"""
    return SequenceMatcher(None, clean_name(name1), clean_name(name2)).ratio()

def find_best_match(target_name, user_names, threshold=0.6):
    """
    Find the best matching name from user_names for target_name
    Returns tuple: (best_match_name, similarity_score)
    """
    if not target_name or target_name == '':
        return None, 0
    
    cleaned_target = clean_name(target_name)
    if not cleaned_target:
        return None, 0
    
    best_match = None
    best_score = 0
    
    for user_name in user_names:
        if not user_name or user_name == '':
            continue
            
        score = similarity_ratio(cleaned_target, user_name)
        
        if score > best_score and score >= threshold:
            best_match = user_name
            best_score = score
    
    return best_match, best_score

def load_users_data(workbook_path, sheet_name='Sheet1'):
    """Load users data from Excel file"""
    wb = openpyxl.load_workbook(workbook_path)
    ws = wb[sheet_name]
    
    # Get headers from first row
    headers = []
    for cell in ws[1]:
        headers.append(cell.value)
    
    # Find column indices
    user_name_col = None
    email_col = None
    
    for i, header in enumerate(headers):
        if header and 'name' in str(header).lower():
            user_name_col = i
        elif header and 'email' in str(header).lower():
            email_col = i
    
    if user_name_col is None:
        raise ValueError("Could not find User_Name column in users data")
    if email_col is None:
        raise ValueError("Could not find Email column in users data")
    
    # Load user data
    users = {}
    user_names = []
    
    for row in ws.iter_rows(min_row=2, values_only=True):
        if row[user_name_col]:  # Skip empty names
            name = str(row[user_name_col]).strip()
            email = str(row[email_col]).strip() if row[email_col] else ''
            users[name] = {
                'name': name,
                'email': email,
                'full_row': row
            }
            user_names.append(name)
    
    wb.close()
    return users, user_names

def load_resolution_data(workbook_path, sheet_name='Sheet1'):
    """Load resolution data from Excel file"""
    wb = openpyxl.load_workbook(workbook_path)
    ws = wb[sheet_name]
    
    # Get headers from first row
    headers = []
    for cell in ws[1]:
        headers.append(cell.value)
    
    # Find assigned_to column
    assigned_to_col = None
    for i, header in enumerate(headers):
        if header and 'assigned' in str(header).lower():
            assigned_to_col = i
            break
    
    if assigned_to_col is None:
        raise ValueError("Could not find 'assigned to' column in resolution data")
    
    # Load resolution data
    resolution_data = []
    for row_num, row in enumerate(ws.iter_rows(min_row=2, values_only=True), start=2):
        resolution_data.append({
            'row_num': row_num,
            'assigned_to': str(row[assigned_to_col]).strip() if row[assigned_to_col] else '',
            'original_row': list(row)
        })
    
    wb.close()
    return resolution_data, headers, assigned_to_col

def process_fuzzy_matching(users_file, resolution_file, output_file, 
                          users_sheet='Sheet1', resolution_sheet='Sheet1', 
                          similarity_threshold=0.6):
    """
    Main function to process fuzzy matching between users and resolution data
    """
    print("Loading users data...")
    users, user_names = load_users_data(users_file, users_sheet)
    print(f"Loaded {len(users)} users")
    
    print("Loading resolution data...")
    resolution_data, headers, assigned_to_col = load_resolution_data(resolution_file, resolution_sheet)
    print(f"Loaded {len(resolution_data)} resolution records")
    
    print("Performing fuzzy matching...")
    matches_found = 0
    
    # Process each resolution record
    for record in resolution_data:
        assigned_name = record['assigned_to']
        
        if assigned_name:
            best_match, score = find_best_match(assigned_name, user_names, similarity_threshold)
            
            if best_match:
                user_info = users[best_match]
                record['matched_user_name'] = user_info['name']
                record['matched_user_email'] = user_info['email']
                record['match_score'] = round(score, 3)
                matches_found += 1
            else:
                record['matched_user_name'] = ''
                record['matched_user_email'] = ''
                record['match_score'] = 0
        else:
            record['matched_user_name'] = ''
            record['matched_user_email'] = ''
            record['match_score'] = 0
    
    print(f"Found matches for {matches_found} out of {len(resolution_data)} records")
    
    # Create output file
    print(f"Creating output file: {output_file}")
    wb_out = openpyxl.Workbook()
    ws_out = wb_out.active
    
    # Write headers (original + new columns)
    new_headers = headers + ['Matched_User_Name', 'Matched_User_Email', 'Match_Score']
    for col, header in enumerate(new_headers, 1):
        ws_out.cell(row=1, column=col, value=header)
    
    # Write data
    for record in resolution_data:
        row_data = record['original_row'] + [
            record['matched_user_name'],
            record['matched_user_email'],
            record['match_score']
        ]
        
        ws_out.append(row_data)
    
    wb_out.save(output_file)
    wb_out.close()
    
    print(f"Output saved to: {output_file}")
    return matches_found, len(resolution_data)

def print_matching_summary(users_file, resolution_file, users_sheet='Sheet1', 
                          resolution_sheet='Sheet1', similarity_threshold=0.6):
    """
    Print a summary of potential matches without creating output file
    """
    users, user_names = load_users_data(users_file, users_sheet)
    resolution_data, _, _ = load_resolution_data(resolution_file, resolution_sheet)
    
    print(f"\n=== FUZZY MATCHING SUMMARY ===")
    print(f"Similarity threshold: {similarity_threshold}")
    print(f"Total users: {len(users)}")
    print(f"Total resolution records: {len(resolution_data)}")
    print("\nMatching results:")
    print("-" * 80)
    
    for i, record in enumerate(resolution_data[:10]):  # Show first 10 for demo
        assigned_name = record['assigned_to']
        if assigned_name:
            best_match, score = find_best_match(assigned_name, user_names, similarity_threshold)
            status = "✓ MATCH" if best_match else "✗ NO MATCH"
            
            print(f"{i+1:2d}. {assigned_name:<25} -> {best_match or 'None':<25} "
                  f"(Score: {score:.3f}) {status}")
        else:
            print(f"{i+1:2d}. {'<EMPTY>':<25} -> {'None':<25} (Score: 0.000) ✗ NO MATCH")
    
    if len(resolution_data) > 10:
        print(f"... and {len(resolution_data) - 10} more records")

# Example usage
if __name__ == "__main__":
    # File paths (update these with your actual file paths)
    users_excel = "users.xlsx"          # Your users Excel file
    resolution_excel = "resolution.xlsx" # Your resolution Excel file
    output_excel = "matched_results.xlsx" # Output file
    
    try:
        # Option 1: Just preview the matching results
        print("=== PREVIEW MODE ===")
        print_matching_summary(
            users_file=users_excel,
            resolution_file=resolution_excel,
            users_sheet='Sheet1',           # Update sheet name if different
            resolution_sheet='Sheet1',      # Update sheet name if different
            similarity_threshold=0.6        # Adjust threshold as needed (0.0 to 1.0)
        )
        
        print("\n" + "="*50)
        
        # Option 2: Process and create output file
        print("=== PROCESSING MODE ===")
        matches, total = process_fuzzy_matching(
            users_file=users_excel,
            resolution_file=resolution_excel,
            output_file=output_excel,
            users_sheet='Sheet1',           # Update sheet name if different
            resolution_sheet='Sheet1',      # Update sheet name if different
            similarity_threshold=0.6        # Adjust threshold as needed
        )
        
        print(f"\nSUCCESS! Matched {matches}/{total} records")
        print(f"Results saved to: {output_excel}")
        
    except FileNotFoundError as e:
        print(f"Error: Could not find file - {e}")
        print("Please update the file paths in the script")
    except Exception as e:
        print(f"Error: {e}")





import sqlite3
import csv
from datetime import datetime
import os
from collections import defaultdict


def ensure_output_dir(output_dir: str):
    """Create output directory if it doesn't exist"""
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)


def get_alarm_data(db_path: str, start_date=None, end_date=None):
    """
    Extract alarm data from SQLite database into a list of dicts
    """
    try:
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        query = """
        SELECT 
            letterbug,
            compound_name,
            point_name,
            block_name,
            alarm_type,
            timestamp,
            severity,
            description,
            status
        FROM alarms
        WHERE 1=1
        """
        params = []
        if start_date:
            query += " AND DATE(timestamp) >= ?"
            params.append(start_date)
        if end_date:
            query += " AND DATE(timestamp) <= ?"
            params.append(end_date)

        query += " ORDER BY timestamp"

        cursor.execute(query, params)
        rows = [dict(row) for row in cursor.fetchall()]
        conn.close()

        return rows

    except Exception as e:
        print(f"Error extracting data: {e}")
        return []


def process_alarm_analytics(rows):
    """
    Process raw alarm data with datetime parsing and IDs
    """
    processed = []
    for r in rows:
        try:
            ts = datetime.fromisoformat(r["timestamp"])
        except:
            ts = datetime.strptime(r["timestamp"], "%Y-%m-%d %H:%M:%S")

        r["timestamp"] = ts
        r["alarm_id"] = f"{r['letterbug']}_{r['compound_name']}_{r['point_name']}_{r['block_name']}_{r['alarm_type']}"
        r["date"] = ts.date()
        r["year"] = ts.year
        r["month"] = ts.month
        r["week"] = ts.isocalendar()[1]
        r["day_of_week"] = ts.weekday()
        r["hour"] = ts.hour
        r["year_month"] = f"{ts.year}-{ts.month:02d}"
        r["year_week"] = f"{ts.year}-W{ts.isocalendar()[1]}"
        processed.append(r)
    return processed


def group_and_summarize(rows, group_keys, extra_keys=None):
    """
    Generic summarizer for monthly/weekly/yearly/daily
    """
    grouped = defaultdict(list)
    for r in rows:
        key = tuple(r[k] for k in group_keys)
        grouped[key].append(r)

    summary = []
    for key, items in grouped.items():
        timestamps = [r["timestamp"] for r in items]
        dates = {r["date"] for r in items}
        record = dict(zip(group_keys, key))
        record.update({
            "total_occurrences": len(items),
            "first_occurrence": min(timestamps),
            "last_occurrence": max(timestamps),
            "unique_daily_occurrences": len(dates),
        })
        if extra_keys and "unique_months" in extra_keys:
            record["unique_monthly_occurrences"] = len({r["year_month"] for r in items})
        summary.append(record)
    return summary


def write_csv(filename, data, fieldnames):
    with open(filename, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(data)


def export_all_analytics(db_path, output_dir="./exports", start_date=None, end_date=None):
    """
    Orchestrates the full export pipeline
    """
    ensure_output_dir(output_dir)

    print("Extracting alarm data from database...")
    rows = get_alarm_data(db_path, start_date, end_date)

    if not rows:
        print("No data found or error occurred")
        return []

    print(f"Processing {len(rows)} alarm records...")
    processed = process_alarm_analytics(rows)

    # Summaries
    print("Creating monthly summary...")
    monthly_summary = group_and_summarize(processed,
        ["letterbug","compound_name","point_name","block_name","alarm_type","alarm_id","year","month","year_month"]
    )
    
    print("Creating weekly summary...")
    weekly_summary = group_and_summarize(processed,
        ["letterbug","compound_name","point_name","block_name","alarm_type","alarm_id","year","week","year_week"]
    )

    print("Creating yearly summary...")
    yearly_summary = group_and_summarize(processed,
        ["letterbug","compound_name","point_name","block_name","alarm_type","alarm_id","year"],
        extra_keys=["unique_months"]
    )

    print("Creating daily summary...")
    daily_summary = group_and_summarize(processed,
        ["letterbug","compound_name","point_name","block_name","alarm_type","alarm_id","date","year","month"]
    )

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    files_exported = []

    # Raw processed export
    raw_file = f"{output_dir}/alarm_data_raw_{timestamp}.csv"
    write_csv(raw_file, processed, processed[0].keys())
    files_exported.append(raw_file)

    # Summaries
    if monthly_summary:
        monthly_file = f"{output_dir}/alarm_monthly_summary_{timestamp}.csv"
        write_csv(monthly_file, monthly_summary, monthly_summary[0].keys())
        files_exported.append(monthly_file)
    
    if weekly_summary:
        weekly_file = f"{output_dir}/alarm_weekly_summary_{timestamp}.csv"
        write_csv(weekly_file, weekly_summary, weekly_summary[0].keys())
        files_exported.append(weekly_file)
    
    if yearly_summary:
        yearly_file = f"{output_dir}/alarm_yearly_summary_{timestamp}.csv"
        write_csv(yearly_file, yearly_summary, yearly_summary[0].keys())
        files_exported.append(yearly_file)
    
    if daily_summary:
        daily_file = f"{output_dir}/alarm_daily_summary_{timestamp}.csv"
        write_csv(daily_file, daily_summary, daily_summary[0].keys())
        files_exported.append(daily_file)

    print("\nExport completed! Files created:")
    for f in files_exported:
        print(f"  - {f}")
    return files_exported


# Example usage
if __name__ == "__main__":
    DB_PATH = "path/to/your/alarms.db"
    OUTPUT_DIR = "./exports_no_class"
    start_date = "2025-06-01"
    end_date = "2025-06-30"

    export_all_analytics(DB_PATH, OUTPUT_DIR, start_date, end_date)

import csv

# Set your input and output filenames
input_file = "alarms.msgs"   # <- Your .msgs file
output_file = "structured_alarms.csv"

structured_data = []

# Read each line from the .msgs file
with open(input_file, 'r') as file:
    for line in file:
        line = line.strip()
        
        # Only process lines with "ALARM"
        if "ALARM" in line.upper():
            parts = line.split()
            
            # Ensure we have enough parts to extract fields
            if len(parts) >= 8:
                letterpage = parts[0]
                type_field = parts[1] + " " + parts[2]
                timestamp = parts[3] + " " + parts[4]
                unit = parts[5]
                asset = parts[6]
                tag = parts[7]
                
                structured_data.append({
                    "Letterpage": letterpage,
                    "Type": type_field,
                    "Timestamp": timestamp,
                    "Unit": unit,
                    "Asset": asset,
                    "Tag": tag
                })

# Write the structured data to a CSV file
if structured_data:
    with open(output_file, mode='w', newline='') as csvfile:
        fieldnames = ["Letterpage", "Type", "Timestamp", "Unit", "Asset", "Tag"]
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

        writer.writeheader()
        writer.writerows(structured_data)

    print(f"✅ Extracted {len(structured_data)} alarm entries to: {output_file}")
else:
    print("⚠️ No ALARM lines found in the file.")
