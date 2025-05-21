from typing import List, Dict
from collections import defaultdict
from datetime import datetime
import calendar

def calculate_late_capa_tasks(data: List[Dict], target: int) -> Dict:
    monthly_counts = defaultdict(int)
    used_records = []

    for row in data:
        try:
            if row.get("request_type") != "CAPA Task":
                continue

            due_date = datetime.strptime(row["due_date"], "%Y-%m-%d")
            original_due_date = datetime.strptime(row["original_due_date"], "%Y-%m-%d")
            status = row.get("status")
            is_extended = due_date != original_due_date
            now = datetime.now()

            late = False
            if status == "CLOSED":
                actual_finish = datetime.strptime(row["finish_date"], "%Y-%m-%d")
                late = actual_finish > due_date
            elif status == "OPEN":
                late = now > due_date

            if late:
                month_key = due_date.strftime("%b %Y")
                monthly_counts[month_key] += 1
                row["late_reason"] = "Extended" if is_extended else "Regular"
                used_records.append(row)

        except Exception as e:
            print(f"Error processing row: {e}")

    result = {
        "question": "Late CAPA Tasks (Open or Closed)",
        **{
            f"{calendar.month_abbr[m]} 2025": round((monthly_counts.get(f"{calendar.month_abbr[m]} 2025", 0) / target) * 100, 1)
            for m in range(1, 13)
        },
        "raw_data": used_records
    }

    return result
