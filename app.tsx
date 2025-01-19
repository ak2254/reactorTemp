from datetime import datetime
from collections import defaultdict

# Example personnel dataset
personnel = [
    {"name": "Alice", "role": "Manager", "date_qualified_start": "2022-01-15"},
    {"name": "Bob", "role": "Supervisor", "date_qualified_start": "2023-01-20"},
    {"name": "Charlie", "role": "Manager", "date_qualified_start": "2023-03-01"},
    {"name": "Dana", "role": "Supervisor", "date_qualified_start": "2022-12-01"},
]

# Example list of (Year, Month) tuples
year_month_list = [(2023, 1), (2023, 2), (2023, 3)]  # January, February, March 2023

# Helper function to check qualification
def is_qualified(person, year, month):
    qualified_date = datetime.strptime(person["date_qualified_start"], "%Y-%m-%d")
    return qualified_date.year < year or (qualified_date.year == year and qualified_date.month <= month)

# Calculate role-specific percentages
def calculate_role_percentages(personnel, year_month_list):
    result = []
    role_totals = defaultdict(int)  # Track total individuals per role
    role_qualified = defaultdict(lambda: defaultdict(int))  # Track qualified individuals per role and year-month

    # Count totals and qualifications
    for person in personnel:
        role_totals[person["role"]] += 1
        for year, month in year_month_list:
            if is_qualified(person, year, month):
                role_qualified[(year, month)][person["role"]] += 1

    # Generate result list
    for year, month in year_month_list:
        row = {
            "year": year,
            "month": month,
            "manager": 0,
            "supervisor": 0,
            "total": 0,
        }
        total_people = sum(role_totals.values())
        for role in ["Manager", "Supervisor"]:
            total_count = role_totals.get(role, 0)
            qualified_count = role_qualified[(year, month)].get(role, 0)
            row[role.lower()] = (qualified_count / total_count) * 100 if total_count > 0 else 0
        row["total"] = (
            sum(role_qualified[(year, month)].values()) / total_people * 100 if total_people > 0 else 0
        )
        result.append(row)

    return result

# Run the function
percentages = calculate_role_percentages(personnel, year_month_list)

# Print the results
for row in percentages:
    print(row)
