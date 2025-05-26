from typing import List, Dict
from collections import defaultdict
from datetime import datetime
import calendar

def calculate_oot_closed_within_3_days(data: List[Dict], target: int) -> Dict:
    monthly_counts = defaultdict(int)
    used_records = []

    for row in data:
        try:
            if row.get("request_type") != "OOT" or row.get("status") != "CLOSED":
                continue

            reported_date = datetime.strptime(row["reported_date"], "%Y-%m-%d")
            finish_date = datetime.strptime(row["finish_date"], "%Y-%m-%d")
            due_date = datetime.strptime(row["due_date"], "%Y-%m-%d")

            days_to_close = (finish_date - reported_date).days
            if days_to_close <= 3:
                month_key = due_date.strftime("%b %Y")
                monthly_counts[month_key] += 1
                row["days_to_close"] = days_to_close
                used_records.append(row)

        except Exception as e:
            print(f"Error processing row: {e}")

    result = {
        "question": "OOT Closed Within 3 Days",
        **{
            f"{calendar.month_abbr[m]} 2025": round((monthly_counts.get(f"{calendar.month_abbr[m]} 2025", 0) / target) * 100, 1)
            for m in range(1, 13)
        },
        "raw_data": used_records
    }

    return result
