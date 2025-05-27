 for row in data:
        try:
            approval_date = datetime.strptime(row["approval_date"], "%Y-%m-%d")
            approval_due_date = datetime.strptime(row["approval_due_date"], "%Y-%m-%d")

            submission_date_str = row.get("submission_date")
            if submission_date_str:
                submission_date = datetime.strptime(submission_date_str, "%Y-%m-%d")
                if approval_date > submission_date:
                    month_key = approval_due_date.strftime("%b %Y")
                    monthly_counts[month_key] += 1
                    used_records.append(row)
            else:
                if approval_date > datetime.today():
                    month_key = approval_due_date.strftime("%b %Y")
                    monthly_counts[month_key] += 1
                    used_records.append(row)
