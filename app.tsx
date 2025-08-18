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
