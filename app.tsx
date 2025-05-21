from datetime import datetime, timedelta
from typing import List, Dict
from collections import defaultdict
import calendar

def calculate_late_oot(data: List[Dict], target: int) -> Dict[str, any]:
    monthly_counts = defaultdict(int)
    included_items = []

    for row in data:
        try:
            if row.get("request_type", "").upper() == "OOT":
                status = row.get("status", "").upper()
                assigned_date = datetime.strptime(row["assigned_date"], "%Y-%m-%d")
                due_date = assigned_date + timedelta(days=7)

                if status == "OPEN":
                    if datetime.now() > due_date:
                        month_key = due_date.strftime("%b %Y")
                        monthly_counts[month_key] += 1
                        included_items.append(row)

                elif status == "CLOSED":
                    finish_date = datetime.strptime(row["finish_date"], "%Y-%m-%d")
                    if finish_date > due_date:
                        month_key = due_date.strftime("%b %Y")
                        monthly_counts[month_key] += 1
                        included_items.append(row)

        except Exception as e:
            print(f"Error processing row: {e}")

    result = {
        "question": "Late OOTs (Open or Closed Late)",
        **{
            f"{calendar.month_abbr[m]} 2025": round((monthly_counts.get(f"{calendar.month_abbr[m]} 2025", 0) / target) * 100, 1)
            if target else 0
            for m in range(1, 13)
        },
        "included": included_items
    }

    return result
