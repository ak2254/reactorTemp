 for row in data:
        try:
            if row.get("request_type") != "NPI" or row.get("status") != "CLOSED":
                continue

            finish_date = datetime.strptime(row["finish_date"], "%Y-%m-%d")
            due_date = datetime.strptime(row["due_date"], "%Y-%m-%d")

            if finish_date > due_date:
                month_key = due_date.strftime("%b %Y")
                monthly_counts[month_key] += 1
                row["days_late"] = (finish_date - due_date).days
                used_records.append(row)
