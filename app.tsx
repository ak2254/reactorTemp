from datetime import datetime, timedelta
from collections import defaultdict
from typing import List, Dict
import calendar

def calculate_metric(question_title: str, data: List[Dict]) -> Dict[str, int]:
    monthly_counts = defaultdict(int)
    current_year = datetime.now().year

    for row in data:
        try:
            match question_title:

                case "Open Over 100 Days":
                    if row.get("status", "").upper() == "OPEN":
                        reported_date_str = row.get("reported_date")
                        if reported_date_str:
                            reported_date = datetime.strptime(reported_date_str, "%Y-%m-%d")
                            due_date = reported_date + timedelta(days=100)

                            if datetime.now() > due_date:
                                month_key = due_date.strftime("%b %Y")
                                monthly_counts[month_key] += 1

                case _:
                    print(f"Unknown question type: {question_title}")

        except Exception as e:
            print(f"Error processing row: {e}")

  result = {
        "Question": question_title,
        **{f"{calendar.month_abbr[m]} 2025": monthly_counts.get(f"{calendar.month_abbr[m]} 2025", 0) for m in range(1, 13)}
    }

    return result, matched_rows
