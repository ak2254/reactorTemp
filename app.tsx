from datetime import datetime
from collections import defaultdict

# Example personnel dataset with some None values for date_qualified_start and end_date
personnel = [
    {"name": "Alice", "role": "Manager", "date_qualified_start": "2022-01-15", "end_date": None},
    {"name": "Bob", "role": "Supervisor", "date_qualified_start": "2023-01-20", "end_date": "2023-03-15"},
    {"name": "Charlie", "role": "Manager", "date_qualified_start": "2023-03-01", "end_date": None},
    {"name": "Dana", "role": "Supervisor", "date_qualified_start": "2022-12-01", "end_date": None},
    {"name": "Eve", "role": "Technician", "date_qualified_start": None, "end_date": None},  # No qualification date
]

# Example list of (Month, Year) tuples
year_month_list = [("Jan", 2023), ("Feb", 2023), ("Mar", 2023)]  # January, February, March 2023

# Helper function to check if a person should be included in totals and qualified counts
def is_included(person, year, month_str):
    # Convert the month string and year to a datetime object
    cutoff_date = datetime.strptime(f"{month_str} {year}", "%b %Y")
    
    # If end_date exists and is in or after the cutoff month, exclude the person
    if person.get("end_date"):
        end_date = datetime.strptime(person["end_date"], "%Y-%m-%d")
        if end_date >= cutoff_date:
            return False
    return True

# Helper function to check qualification
def is_qualified(person, year, month_str):
    # If the date_qualified_start is None or the person is excluded, return False
    if person["date_qualified_start"] is None or not is_included(person, year, month_str):
        return False

    # Convert the month string and year to a datetime object
    qualified_date = datetime.strptime(f"{month_str} {year}", "%b %Y")
    qualified_date_start = datetime.strptime(person["date_qualified_start"], "%Y-%m-%d")
    
    return qualified_date_start <= qualified_date

# Calculate role-specific percentages and counts, excluding based on end_date
def calculate_role_percentages(personnel, year_month_list):
    # Initialize dictionaries to hold the results
    result = []

    # Track total individuals per role
    role_totals = defaultdict(int)
    # Track qualified individuals per role and year-month
    role_qualified = defaultdict(lambda: defaultdict(int))

    # Get unique roles from personnel data dynamically
    unique_roles = set(person["role"] for person in personnel)

    # Count totals and qualifications
    for person in personnel:
        for month_str, year in year_month_list:
            if is_included(person, year, month_str):
                role_totals[person["role"]] += 1
                if is_qualified(person, year, month_str):
                    role_qualified[(year, month_str)][person["role"]] += 1

    # Generate result lists for each month and role
    for month_str, year in year_month_list:
        row = {"Month": f"{month_str} {year}"}

        # Calculate total count and percentage (for all roles combined)
        total_people = sum(role_totals.values())
        total_qualified = sum(role_qualified[(year, month_str)].values())
        row["Total"] = total_people
        row["Total Qual"] = total_qualified
        row["% Total"] = (total_qualified / total_people * 100) if total_people > 0 else 0

        # Loop through each role dynamically
        for role in unique_roles:
            total_count = role_totals.get(role, 0)
            qualified_count = role_qualified[(year, month_str)].get(role, 0)
            
            row[f"Total {role}"] = total_count
            row[f"Total Qual {role}"] = qualified_count
            row[f"% Qual {role}"] = (qualified_count / total_count * 100) if total_count > 0 else 0

        result.append(row)

    return result

# Run the function
role_stats = calculate_role_percentages(personnel, year_month_list)

# Print the results
for row in role_stats:
    print(row)
