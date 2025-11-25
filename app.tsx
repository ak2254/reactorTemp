from prefect import flow, task
from datetime import datetime
from typing import List, Dict
import csv
from collections import defaultdict
from calendar import monthrange


def parse_date(date_str: str) -> datetime:
    """Parse YYYY-MM-DD or return None"""
    if not date_str or date_str == "None":
        return None
    return datetime.strptime(date_str, "%Y-%m-%d")


# Current year context
CURRENT_YEAR = datetime.now().year
TODAY = datetime.now()


# ==========================
# Date window helpers
# ==========================

def quarter_start_end(year: int, q: int):
    """Return start/end datetime of a quarter"""
    start_month = 3 * (q - 1) + 1
    start = datetime(year, start_month, 1)
    end_month = start_month + 2
    last_day = monthrange(year, end_month)[1]
    end = datetime(year, end_month, last_day, 23, 59, 59)
    return start, end


def month_start_end(year: int, month: int):
    """Return start/end datetime of a month"""
    start = datetime(year, month, 1)
    last_day = monthrange(year, month)[1]
    end = datetime(year, month, last_day, 23, 59, 59)
    return start, end


# ==========================
# DATA PROCESSING
# ==========================

@task
def process_data(raw_data: List[List], headers: List[str]) -> List[Dict]:
    """Convert input rows to structured dicts and compute fields."""
    records = []

    for row in raw_data:
        if len(row) != len(headers):
            continue

        record = dict(zip(headers, row))

        # Parse dates
        created = parse_date(record["created_date"])
        due = parse_date(record["due_date"])
        closed = parse_date(record.get("closed_date"))

        is_completed = record["status"] == "Completed"

        days_open = (closed - created).days if closed else (TODAY - created).days

        is_late = False
        if due and not is_completed:
            is_late = TODAY > due

        is_late_completed = False
        if due and closed:
            is_late_completed = closed > due

        # Add fields
        record.update({
            "created_date": created,
            "due_date": due,
            "closed_date": closed,
            "Is_Completed": is_completed,
            "Is_Late": is_late,
            "Is_Late_Completed": is_late_completed,
            "Days_Open": days_open,
            "Is_Currently_Open": not is_completed
        })

        records.append(record)

    print(f"Processed {len(records)} records")
    return records


# ==========================
# METRIC CALCULATIONS
# ==========================

@task
def calculate_metrics(data: List[Dict]) -> tuple:
    """Calculate quarterly, monthly, and owner metrics using lifecycle logic."""

    # ---------------------------------------------------------------
    # QUARTERLY
    # ---------------------------------------------------------------
    quarterly = []

    for q in range(1, 5):

        start, end = quarter_start_end(CURRENT_YEAR, q)

        # Items open in this quarter
        open_items = [
            r for r in data
            if r["created_date"] <= end and
               (r["closed_date"] is None or r["closed_date"] >= start)
        ]

        created_this_q = [
            r for r in data
            if start <= r["created_date"] <= end
        ]

        closed_this_q = [
            r for r in data
            if r["closed_date"] and start <= r["closed_date"] <= end
        ]

        due_this_q = [
            r for r in data
            if r["due_date"] and start <= r["due_date"] <= end
        ]

        quarterly.append({
            "Year_Quarter": f"{CURRENT_YEAR}-Q{q}",
            "Open_Items": len(open_items),
            "Created_This_Quarter": len(created_this_q),
            "Closed_This_Quarter": len(closed_this_q),
            "Due_This_Quarter": len(due_this_q),
        })

    # ---------------------------------------------------------------
    # MONTHLY
    # ---------------------------------------------------------------
    monthly = []

    for m in range(1, 13):

        start, end = month_start_end(CURRENT_YEAR, m)

        open_items = [
            r for r in data
            if r["created_date"] <= end and
               (r["closed_date"] is None or r["closed_date"] >= start)
        ]

        created_this_m = [
            r for r in data
            if start <= r["created_date"] <= end
        ]

        closed_this_m = [
            r for r in data
            if r["closed_date"] and start <= r["closed_date"] <= end
        ]

        due_this_m = [
            r for r in data
            if r["due_date"] and start <= r["due_date"] <= end
        ]

        monthly.append({
            "Year_Month": f"{CURRENT_YEAR}-{m:02d}",
            "Open_Items": len(open_items),
            "Created_This_Month": len(created_this_m),
            "Closed_This_Month": len(closed_this_m),
            "Due_This_Month": len(due_this_m),
        })

    # ---------------------------------------------------------------
    # OWNER METRICS (group by owner, but still using lifecycle)
    # ---------------------------------------------------------------
    owner = defaultdict(lambda: {
        "Total": 0,
        "Open": 0,
        "Completed": 0,
        "Late_Due": 0,
        "Late_Completed": 0
    })

    for r in data:
        o = owner[r["owner_name"]]
        o["Total"] += 1
        if r["Is_Currently_Open"]:
            o["Open"] += 1
        if r["Is_Completed"]:
            o["Completed"] += 1
        if r["Is_Late"]:
            o["Late_Due"] += 1
        if r["Is_Late_Completed"]:
            o["Late_Completed"] += 1

    owner_list = [
        {"Owner": owner_name, **metrics}
        for owner_name, metrics in owner.items()
    ]

    print(f"Calculated {len(quarterly)} quarter records, {len(monthly)} month records, {len(owner_list)} owner records")
    return quarterly, monthly, owner_list


# ==========================
# CSV EXPORT
# ==========================

@task
def export_csv(data: List[Dict], filename: str) -> str:
    if not data:
        return filename

    with open(filename, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=data[0].keys())
        writer.writeheader()
        writer.writerows(data)

    print(f"Exported {filename}")
    return filename


# ==========================
# MAIN FLOW
# ==========================

@flow
def process_change_data(raw_data: List[List], data_type: str):

    headers = ["name", "short_description", "due_date", "owner_name",
               "owner_email", "created_date", "status", "closed_date"]

    processed = process_data(raw_data, headers)
    quarterly, monthly, owner = calculate_metrics(processed)

    export_csv(processed, f"{data_type}_detail.csv")
    export_csv(quarterly, f"{data_type}_quarterly.csv")
    export_csv(monthly, f"{data_type}_monthly.csv")
    export_csv(owner, f"{data_type}_by_owner.csv")

    return {
        "detail": processed,
        "quarterly": quarterly,
        "monthly": monthly,
        "owner": owner
    }
