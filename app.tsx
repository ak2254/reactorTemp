from datetime import datetime
from collections import defaultdict
import csv

# Example personnel dataset
personnel = [
    {"name": "Alice", "role": "Manager", "date_qualified_start": "2022-01-15"},
    {"name": "Bob", "role": "Supervisor", "date_qualified_start": "2023-01-20"},
    {"name": "Charlie", "role": "Manager", "date_qualified_start": "2023-03-01"},
    {"name": "Dana", "role": "Supervisor", "date_qualified_start": "2022-12-01"},
]

# Example list of "Month Year" values
month_year_list = ["Jan 2023", "Feb 2023", "Mar 2023"]

# Helper function to check qualification
def is_qualified(person, year, month):
    qualified_date = datetime.strptime(person["date_qualified_start"], "%Y-%m-%d")
    return qualified_date.year < year or (qualified_date.year == year and qualified_date.month <= month)

# Calculate role-specific percentages
def calculate_role_percentages(personnel, month_year_list):
    result = defaultdict(lambda: {"Total": 0})  # Store percentages for each month-year
    role_totals = defaultdict(int)  # Track total individuals per role
    role_qualified = defaultdict(lambda: defaultdict(int))  # Track qualified individuals per role and month

    # Count totals and qualifications
    for person in personnel:
        role_totals[person["role"]] += 1
        for month_year in month_year_list:
            month, year = month_year.split()
            year = int(year)
            month = datetime.strptime(month, "%b").month  # Convert short month name to number
            if is_qualified(person, year, month):
                role_qualified[month_year][person["role"]] += 1

    # Calculate percentages
    for month_year in month_year_list:
        for role, total_count in role_totals.items():
            qualified_count = role_qualified[month_year][role]
            percentage = (qualified_count / total_count) * 100 if total_count > 0 else 0
            result[month_year][role] = percentage
        # Calculate the overall total percentage for the month
        result[month_year]["Total"] = sum(role_qualified[month_year].values()) / sum(role_totals.values()) * 100

    return result

# Run the function
percentages = calculate_role_percentages(personnel, month_year_list)

# Print the results
for month_year, role_percentages in percentages.items():
    print(f"{month_year}: {role_percentages}")

# Save to CSV
csv_file = "role_qualification_percentages.csv"
with open(csv_file, "w", newline="") as file:
    writer = csv.writer(file)
    writer.writerow(["Month-Year", "Role", "Percentage"])
    for month_year, role_percentages in percentages.items():
        for role, percentage in role_percentages.items():
            writer.writerow([month_year, role, percentage])

print(f"Results saved to {csv_file}")
