from prefect import flow, task
from typing import List, Dict
from datetime import datetime
from collections import defaultdict
import calendar


@task
def build_question_summary(data: List[Dict]) -> List[Dict[str, str]]:
    """
    Process raw WO records and return a single-row result:
    [{'Title': ..., 'Question': ..., 'Target': ..., 'Jan 2025': ..., 'Feb 2025': ..., ...}]
    """

    # Setup
    title = "OOT Late Closures"
    question = "Count of OOT work orders closed late"
    target = 8  # example target
    monthly_counts = defaultdict(int)

    for record in data:
        try:
            if record.get("request_type", "").lower() != "oot":
                continue

            finish_date = datetime.strptime(record["finish_date"], "%Y-%m-%d")
            due_date = datetime.strptime(record["due_date"], "%Y-%m-%d")

            if finish_date > due_date:
                month_key = finish_date.strftime("%b %Y")  # Example: "Jan 2025"
                monthly_counts[month_key] += 1

        except Exception as e:
            print(f"Skipping record due to error: {e}")

    # Fill all months Jan–Dec 2025 for display consistency
    full_row = {
        "Title": title,
        "Question": question,
        "Target": str(target)
    }

    for month in range(1, 13):
        month_str = f"{calendar.month_abbr[month]} 2025"  # Jan 2025, Feb 2025, ...
        full_row[month_str] = str(monthly_counts.get(month_str, 0))

    return [full_row]
