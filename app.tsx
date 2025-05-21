from datetime import datetime, timedelta
from typing import List, Dict, Tuple
from collections import defaultdict
import calendar

def calculate_metric_with_target(
    question_title: str,
    data: List[Dict],
    target: int
) -> Tuple[Dict[str, float], List[Dict]]:
    
    monthly_counts = defaultdict(int)
    matched_rows = []

    for row in data:
        try:
            match question_title:
                case "Late Closures":
                    if row.get("status") == "CLOSED":
                        finish_date = datetime.strptime(row["finish_date"], "%Y-%m-%d")
                        due_date = datetime.strptime(row["due_date"], "%Y-%m-%d")
                        if finish_date > due_date:
                            month_key = finish_date.strftime("%b %Y")
                            monthly_counts[month_key] += 1
                            matched_rows.append(row)

                case "Open Over 30 Days":
                    if row.get("status") == "OPEN":
                        due_date = datetime.strptime(row["due_date"], "%Y-%m-%d")
                        days_open = (datetime.now() - due_date).days
                        if days_open > 30:
                            month_key = datetime.now().strftime("%b %Y")
                            monthly_counts[month_key] += 1
                            matched_rows.append(row)

                case "Open Over 100 Days":
                    if row.get("status") == "OPEN":
                        reported_date = datetime.strptime(row["reported_date"], "%Y-%m-%d")
                        days_open = (datetime.now() - reported_date).days
                        if days_open > 100:
                            target_due_date = reported_date + timedelta(days=100)
                            month_key = target_due_date.strftime("%b %Y")
                            monthly_counts[month_key] += 1
                            matched_rows.append(row)

                case _:
                    print(f"Unknown question type: {question_title}")

        except Exception as e:
            print(f"Error processing row: {e}")

    # Calculate percent per month
    result = {
        "Question": question_title,
        **{
            f"{calendar.month_abbr[m]} 2025": round((monthly_counts.get(f"{calendar.month_abbr[m]} 2025", 0) / target) * 100, 1)
            for m in range(1, 13)
        }
    }

    return result, matched_rows
