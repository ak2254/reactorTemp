"""
Prefect Pipeline for Change Plan Data Processing
Handles: Change Plan Data, Change Actions, Change Questions
All with same columns: name, short_description, due_date, owner_name, owner_email, created_date, status, closed_date
"""

from prefect import flow, task
from datetime import datetime
from typing import List, Dict
import csv
from collections import defaultdict


def parse_date(date_str: str) -> datetime:
    """Parse date string"""
    if not date_str or date_str == "None":
        return None
    return datetime.strptime(date_str, "%Y-%m-%d")


@task
def process_data(raw_data: List[List], headers: List[str]) -> List[Dict]:
    """Convert list of lists to dicts and add calculated fields"""
    
    records = []
    for row in raw_data:
        if len(row) != len(headers):
            continue
            
        record = dict(zip(headers, row))
        
        # Parse dates
        created_date = parse_date(record["created_date"])
        due_date = parse_date(record["due_date"])
        closed_date = parse_date(record.get("closed_date"))
        
        # Calculate fields
        year = created_date.year
        month = created_date.month
        quarter = (month - 1) // 3 + 1
        
        is_completed = record["status"] == "Completed"
        days_open = (closed_date - created_date).days if closed_date else (datetime.now() - created_date).days
        is_late = not is_completed and (datetime.now() > due_date if due_date else False)
        is_late_completed = is_completed and (closed_date > due_date if due_date and closed_date else False)
        
        # Add to record
        record.update({
            "Year": year,
            "Month": month,
            "Quarter": quarter,
            "Year_Quarter": f"{year}-Q{quarter}",
            "Year_Month": f"{year}-{month:02d}",
            "Days_Open": days_open,
            "Is_Completed": is_completed,
            "Is_Late": is_late,
            "Is_Late_Completed": is_late_completed,
            "Is_Currently_Open": not is_completed
        })
        
        records.append(record)
    
    print(f"Processed {len(records)} records")
    return records


@task
def calculate_metrics(data: List[Dict]) -> tuple:
    """Calculate quarterly, monthly, and owner metrics"""
    
    # Quarterly metrics
    qtr_groups = defaultdict(list)
    for record in data:
        qtr_groups[record["Year_Quarter"]].append(record)
    
    quarterly = []
    for year_quarter, records in sorted(qtr_groups.items()):
        quarterly.append({
            "Year_Quarter": year_quarter,
            "Total": len(records),
            "Completed": sum(1 for r in records if r["Is_Completed"]),
            "Due_This_Quarter": sum(1 for r in records if parse_date(r["due_date"]) and parse_date(r["due_date"]).year == int(year_quarter[:4]) and (parse_date(r["due_date"]).month - 1) // 3 + 1 == int(year_quarter[-1])),
            "Late_Due": sum(1 for r in records if r["Is_Late"]),
            "Late_Completed": sum(1 for r in records if r["Is_Late_Completed"]),
            "Currently_Open": sum(1 for r in records if r["Is_Currently_Open"])
        })
    
    # Monthly metrics
    mth_groups = defaultdict(list)
    for record in data:
        mth_groups[record["Year_Month"]].append(record)
    
    monthly = []
    for year_month, records in sorted(mth_groups.items()):
        monthly.append({
            "Year_Month": year_month,
            "Total": len(records),
            "Completed": sum(1 for r in records if r["Is_Completed"]),
            "Due_This_Month": sum(1 for r in records if parse_date(r["due_date"]) and parse_date(r["due_date"]).strftime("%Y-%m") == year_month),
            "Late_Due": sum(1 for r in records if r["Is_Late"]),
            "Late_Completed": sum(1 for r in records if r["Is_Late_Completed"]),
            "Currently_Open": sum(1 for r in records if r["Is_Currently_Open"])
        })
    
    # Owner metrics
    owner_groups = defaultdict(list)
    for record in data:
        owner_groups[(record["Year_Quarter"], record["owner_name"])].append(record)
    
    owner = []
    for (year_quarter, owner_name), records in sorted(owner_groups.items()):
        owner.append({
            "Year_Quarter": year_quarter,
            "Owner": owner_name,
            "Total": len(records),
            "Completed": sum(1 for r in records if r["Is_Completed"]),
            "Late_Due": sum(1 for r in records if r["Is_Late"]),
            "Late_Completed": sum(1 for r in records if r["Is_Late_Completed"]),
            "Currently_Open": sum(1 for r in records if r["Is_Currently_Open"])
        })
    
    print(f"Calculated {len(quarterly)} quarters, {len(monthly)} months, {len(owner)} owner records")
    return quarterly, monthly, owner


@task
def export_csv(data: List[Dict], filename: str) -> str:
    """Export to CSV"""
    if not data:
        return filename
    
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=data[0].keys())
        writer.writeheader()
        writer.writerows(data)
    
    print(f"Exported {filename}")
    return filename


@flow
def process_change_data(raw_data: List[List], data_type: str):
    """
    Main pipeline for Change Plan, Change Actions, or Change Questions
    
    Args:
        raw_data: List of lists with columns [name, short_description, due_date, owner_name, owner_email, created_date, status, closed_date]
        data_type: "change_plan", "change_action", or "change_question"
    """
    
    headers = ["name", "short_description", "due_date", "owner_name", "owner_email", "created_date", "status", "closed_date"]
    
    # Process data
    processed = process_data(raw_data, headers)
    
    # Calculate metrics
    quarterly, monthly, owner = calculate_metrics(processed)
    
    # Export files
    export_csv(processed, f"{data_type}_detail.csv")
    export_csv(quarterly, f"{data_type}_quarterly.csv")
    export_csv(monthly, f"{data_type}_monthly.csv")
    export_csv(owner, f"{data_type}_by_owner.csv")
    
    # Print summary
    print(f"\n{'='*80}")
    print(f"{data_type.upper()} - QUARTERLY SUMMARY")
    print(f"{'='*80}")
    print(f"{'Quarter':<12} {'Total':<8} {'Completed':<12} {'Due':<8} {'Late Due':<10} {'Late Completed':<15} {'Open':<8}")
    print(f"{'-'*80}")
    for q in quarterly:
        print(f"{q['Year_Quarter']:<12} {q['Total']:<8} {q['Completed']:<12} {q['Due_This_Quarter']:<8} {q['Late_Due']:<10} {q['Late_Completed']:<15} {q['Currently_Open']:<8}")
    print(f"{'='*80}\n")
    
    return {"detail": processed, "quarterly": quarterly, "monthly": monthly, "owner": owner}


# EXAMPLE USAGE
if __name__ == "__main__":
    
    # Change Plan Data
    change_plan_data = [
        ["CP-2024-001", "System upgrade Q1", "2024-03-31", "John Doe", "john@email.com", "2024-01-15", "Completed", "2024-03-28"],
        ["CP-2024-002", "Database migration", "2024-06-30", "Jane Smith", "jane@email.com", "2024-04-10", "Open", None],
        ["CP-2024-003", "Security patch", "2024-02-15", "Mike Johnson", "mike@email.com", "2024-01-01", "Open", None],
    ]
    
    # Change Actions Data
    change_actions_data = [
        ["CA-2024-001", "Install patches", "2024-03-15", "Tom Wilson", "tom@email.com", "2024-03-01", "Completed", "2024-03-14"],
        ["CA-2024-002", "Run tests", "2024-04-30", "Sarah Davis", "sarah@email.com", "2024-04-15", "Open", None],
    ]
    
    # Change Questions Data
    change_questions_data = [
        ["CQ-2024-001", "Approval for change", "2024-03-20", "Alex Brown", "alex@email.com", "2024-03-10", "Completed", "2024-03-19"],
        ["CQ-2024-002", "Risk assessment", "2024-05-15", "Lisa White", "lisa@email.com", "2024-05-01", "Open", None],
    ]
    
    # Process all three
    print("\n*** PROCESSING CHANGE PLAN DATA ***")
    cp_result = process_change_data(change_plan_data, "change_plan")
    
    print("\n*** PROCESSING CHANGE ACTIONS DATA ***")
    ca_result = process_change_data(change_actions_data, "change_action")
    
    print("\n*** PROCESSING CHANGE QUESTIONS DATA ***")
    cq_result = process_change_data(change_questions_data, "change_question")
