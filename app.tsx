# SQL Concepts: Explanations and Examples

## 1. SQL Fundamentals

### Basic SQL Syntax and Structure

**Explanation:** SQL follows a specific order of clauses. The basic structure is SELECT-FROM-WHERE-GROUP BY-HAVING-ORDER BY.

**Example:**
```sql
SELECT employee_name, salary
FROM employees
WHERE department = 'Sales'
ORDER BY salary DESC;
```

### Data Types

**Explanation:** Different data types store different kinds of information and have specific storage requirements and behaviors.

**Examples:**
```sql
CREATE TABLE employees (
    id INT,                    -- Whole numbers
    name VARCHAR(50),          -- Variable-length text up to 50 chars
    salary DECIMAL(10,2),      -- Numbers with 2 decimal places
    hire_date DATE,            -- Date only (YYYY-MM-DD)
    last_login DATETIME        -- Date and time
);
```

### NULL Handling

**Explanation:** NULL represents missing or unknown data. It's not zero or empty string - it requires special handling.

**Examples:**
```sql
-- Wrong way - this won't find NULLs
SELECT * FROM employees WHERE salary = NULL;

-- Correct way
SELECT * FROM employees WHERE salary IS NULL;
SELECT * FROM employees WHERE salary IS NOT NULL;

-- NULL in calculations
SELECT name, salary, salary * 1.1 AS new_salary FROM employees;
-- If salary is NULL, new_salary will also be NULL
```

### DISTINCT Keyword

**Explanation:** DISTINCT removes duplicate rows from the result set.

**Examples:**
```sql
-- Get unique departments
SELECT DISTINCT department FROM employees;

-- Multiple columns - finds unique combinations
SELECT DISTINCT department, job_title FROM employees;

-- Count unique values
SELECT COUNT(DISTINCT department) AS dept_count FROM employees;
```

### Basic Operators

**Explanation:** Operators allow you to filter and compare data in various ways.

**Examples:**
```sql
-- Equality and inequality
SELECT * FROM employees WHERE salary = 50000;
SELECT * FROM employees WHERE salary <> 50000;  -- Not equal
SELECT * FROM employees WHERE salary != 50000;  -- Also not equal

-- Pattern matching with LIKE
SELECT * FROM employees WHERE name LIKE 'John%';    -- Starts with John
SELECT * FROM employees WHERE name LIKE '%son';    -- Ends with son
SELECT * FROM employees WHERE name LIKE '%th%';    -- Contains th

-- IN operator for multiple values
SELECT * FROM employees WHERE department IN ('Sales', 'Marketing', 'IT');

-- BETWEEN for ranges
SELECT * FROM employees WHERE salary BETWEEN 40000 AND 80000;
SELECT * FROM employees WHERE hire_date BETWEEN '2020-01-01' AND '2023-12-31';
```

## 2. Joins

### Sample Tables for Join Examples:
```sql
-- Employees table
CREATE TABLE employees (id, name, department_id, salary);
INSERT INTO employees VALUES 
(1, 'Alice', 1, 70000),
(2, 'Bob', 2, 65000),
(3, 'Charlie', 1, 75000),
(4, 'Diana', NULL, 60000);

-- Departments table
CREATE TABLE departments (id, name);
INSERT INTO departments VALUES 
(1, 'Engineering'),
(2, 'Sales'),
(3, 'Marketing');
```

### INNER JOIN

**Explanation:** Returns only rows that have matching values in both tables.

**Example:**
```sql
SELECT e.name, d.name AS department
FROM employees e
INNER JOIN departments d ON e.department_id = d.id;

-- Result:
-- Alice    | Engineering
-- Bob      | Sales  
-- Charlie  | Engineering
-- (Diana is excluded because her department_id is NULL)
```

### LEFT JOIN (LEFT OUTER JOIN)

**Explanation:** Returns all rows from the left table, and matching rows from the right table. NULL values for non-matching right table columns.

**Example:**
```sql
SELECT e.name, d.name AS department
FROM employees e
LEFT JOIN departments d ON e.department_id = d.id;

-- Result:
-- Alice    | Engineering
-- Bob      | Sales
-- Charlie  | Engineering  
-- Diana    | NULL
-- (All employees included, even Diana with no department)
```

### RIGHT JOIN (RIGHT OUTER JOIN)

**Explanation:** Returns all rows from the right table, and matching rows from the left table.

**Example:**
```sql
SELECT e.name, d.name AS department
FROM employees e
RIGHT JOIN departments d ON e.department_id = d.id;

-- Result:
-- Alice    | Engineering
-- Bob      | Sales
-- Charlie  | Engineering
-- NULL     | Marketing
-- (All departments included, Marketing has no employees)
```

### FULL OUTER JOIN

**Explanation:** Returns all rows when there's a match in either table.

**Example:**
```sql
SELECT e.name, d.name AS department
FROM employees e
FULL OUTER JOIN departments d ON e.department_id = d.id;

-- Result includes everyone and everything:
-- Alice    | Engineering
-- Bob      | Sales  
-- Charlie  | Engineering
-- Diana    | NULL
-- NULL     | Marketing
```

### CROSS JOIN

**Explanation:** Returns the Cartesian product - every row from first table combined with every row from second table.

**Example:**
```sql
SELECT e.name, d.name
FROM employees e
CROSS JOIN departments d;

-- Result: 4 employees × 3 departments = 12 rows
-- Alice paired with each department, Bob paired with each department, etc.
```

### SELF JOIN

**Explanation:** Join a table with itself, typically used for hierarchical data.

**Example:**
```sql
-- Employees with managers
CREATE TABLE employees (id, name, manager_id);

SELECT e.name AS employee, m.name AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;
```

## 3. Aggregate Functions & GROUP BY

### COUNT, SUM, AVG, MIN, MAX

**Explanation:** Aggregate functions perform calculations on groups of rows.

**Examples:**
```sql
-- Basic aggregates
SELECT COUNT(*) AS total_employees FROM employees;
SELECT COUNT(department_id) AS employees_with_dept FROM employees; -- Excludes NULLs
SELECT SUM(salary) AS total_payroll FROM employees;
SELECT AVG(salary) AS average_salary FROM employees;
SELECT MIN(salary) AS lowest_salary FROM employees;
SELECT MAX(salary) AS highest_salary FROM employees;
```

### GROUP BY Clause

**Explanation:** Groups rows with the same values in specified columns, allowing aggregates per group.

**Example:**
```sql
SELECT department_id, COUNT(*) AS emp_count, AVG(salary) AS avg_salary
FROM employees
GROUP BY department_id;

-- Result:
-- 1    | 2 | 72500  (Engineering: Alice & Charlie)
-- 2    | 1 | 65000  (Sales: Bob)
-- NULL | 1 | 60000  (Diana)
```

### HAVING vs WHERE

**Explanation:** WHERE filters individual rows before grouping; HAVING filters groups after aggregation.

**Example:**
```sql
-- WHERE - filters before grouping
SELECT department_id, COUNT(*) 
FROM employees 
WHERE salary > 60000  -- Filter individuals first
GROUP BY department_id;

-- HAVING - filters after grouping
SELECT department_id, COUNT(*) AS emp_count
FROM employees
GROUP BY department_id
HAVING COUNT(*) > 1;  -- Only departments with more than 1 employee
```

### GROUP BY with Multiple Columns

**Example:**
```sql
SELECT department_id, YEAR(hire_date) AS hire_year, COUNT(*)
FROM employees
GROUP BY department_id, YEAR(hire_date);
```

## 4. Subqueries & CTEs

### Non-Correlated Subquery

**Explanation:** Inner query runs once and returns a value that the outer query uses.

**Example:**
```sql
-- Find employees earning more than average
SELECT name, salary
FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees);

-- Subquery in FROM clause
SELECT dept_avg.department_id, dept_avg.avg_salary
FROM (
    SELECT department_id, AVG(salary) as avg_salary
    FROM employees
    GROUP BY department_id
) dept_avg;
```

### Correlated Subquery

**Explanation:** Inner query references columns from outer query and runs once for each outer row.

**Example:**
```sql
-- Find employees earning more than their department average
SELECT name, salary, department_id
FROM employees e1
WHERE salary > (
    SELECT AVG(salary)
    FROM employees e2
    WHERE e2.department_id = e1.department_id  -- Correlated reference
);
```

### EXISTS vs IN

**Explanation:** EXISTS is often faster for large datasets; IN is simpler for small lists.

**Examples:**
```sql
-- EXISTS - checks if any rows match condition
SELECT name FROM employees e
WHERE EXISTS (
    SELECT 1 FROM departments d 
    WHERE d.id = e.department_id AND d.name = 'Engineering'
);

-- IN - checks if value is in a list
SELECT name FROM employees
WHERE department_id IN (
    SELECT id FROM departments WHERE name IN ('Engineering', 'Sales')
);
```

### Basic WITH Clause (CTE)

**Explanation:** Creates a temporary named result set that exists only for the duration of the query.

**Example:**
```sql
WITH dept_stats AS (
    SELECT department_id, 
           COUNT(*) as emp_count,
           AVG(salary) as avg_salary
    FROM employees
    GROUP BY department_id
)
SELECT d.name, ds.emp_count, ds.avg_salary
FROM dept_stats ds
JOIN departments d ON ds.department_id = d.id;
```

### Recursive CTEs

**Explanation:** CTE that references itself, used for hierarchical or tree-like data.

**Example:**
```sql
-- Find all employees in hierarchy under a manager
WITH RECURSIVE employee_hierarchy AS (
    -- Base case: start with CEO (manager_id IS NULL)
    SELECT id, name, manager_id, 1 as level
    FROM employees 
    WHERE manager_id IS NULL
    
    UNION ALL
    
    -- Recursive case: find direct reports
    SELECT e.id, e.name, e.manager_id, eh.level + 1
    FROM employees e
    JOIN employee_hierarchy eh ON e.manager_id = eh.id
)
SELECT * FROM employee_hierarchy ORDER BY level, name;
```

## 5. Window Functions

### ROW_NUMBER()

**Explanation:** Assigns unique sequential numbers to rows within each partition.

**Example:**
```sql
SELECT name, salary, department_id,
       ROW_NUMBER() OVER (PARTITION BY department_id ORDER BY salary DESC) as row_num
FROM employees;

-- Result shows ranking within each department:
-- Charlie  | 75000 | 1 | 1  (highest in Engineering)
-- Alice    | 70000 | 1 | 2  (second in Engineering)
-- Bob      | 65000 | 2 | 1  (highest in Sales)
```

### RANK() vs DENSE_RANK()

**Explanation:** RANK() leaves gaps after ties; DENSE_RANK() doesn't.

**Example:**
```sql
-- Sample data with ties
SELECT name, salary,
       RANK() OVER (ORDER BY salary DESC) as rank_with_gaps,
       DENSE_RANK() OVER (ORDER BY salary DESC) as dense_rank
FROM employees;

-- If two people have salary 70000:
-- Alice    | 70000 | 1 | 1
-- Bob      | 70000 | 1 | 1  
-- Charlie  | 65000 | 3 | 2  (RANK skips 2, DENSE_RANK doesn't)
```

### LAG/LEAD

**Explanation:** Access values from previous (LAG) or next (LEAD) rows.

**Example:**
```sql
SELECT name, salary,
       LAG(salary) OVER (ORDER BY salary) as previous_salary,
       LEAD(salary) OVER (ORDER BY salary) as next_salary,
       salary - LAG(salary) OVER (ORDER BY salary) as salary_diff
FROM employees
ORDER BY salary;
```

### Running Totals and Moving Averages

**Example:**
```sql
SELECT name, salary,
       SUM(salary) OVER (ORDER BY name ROWS UNBOUNDED PRECEDING) as running_total,
       AVG(salary) OVER (ORDER BY name ROWS 2 PRECEDING) as moving_avg_3
FROM employees;
```

## 6. Advanced String Functions

### String Manipulation

**Examples:**
```sql
SELECT 
    CONCAT(first_name, ' ', last_name) as full_name,
    SUBSTRING(email, 1, POSITION('@' IN email) - 1) as username,
    LENGTH(name) as name_length,
    TRIM('  ' FROM '  John  ') as trimmed,  -- Result: 'John'
    UPPER(name) as uppercase,
    LOWER(name) as lowercase
FROM employees;
```

### Pattern Matching with REGEXP

**Example:**
```sql
-- Find employees with phone numbers in format (xxx) xxx-xxxx
SELECT * FROM employees 
WHERE phone REGEXP '^\([0-9]{3}\) [0-9]{3}-[0-9]{4}$';

-- Find emails ending with company domains
SELECT * FROM employees
WHERE email REGEXP '\.(com|org|edu)$';
```

## 7. Date Functions

**Examples:**
```sql
SELECT 
    hire_date,
    DATE_ADD(hire_date, INTERVAL 90 DAY) as probation_end,
    DATEDIFF(CURRENT_DATE, hire_date) as days_employed,
    DATE_FORMAT(hire_date, '%Y-%m') as hire_month,
    EXTRACT(YEAR FROM hire_date) as hire_year,
    YEAR(hire_date) as hire_year_alt
FROM employees;
```

## 8. CASE Statements

### Simple CASE

**Example:**
```sql
SELECT name, department_id,
    CASE department_id
        WHEN 1 THEN 'Engineering'
        WHEN 2 THEN 'Sales'
        WHEN 3 THEN 'Marketing'
        ELSE 'Unknown'
    END as department_name
FROM employees;
```

### Searched CASE

**Example:**
```sql
SELECT name, salary,
    CASE 
        WHEN salary >= 80000 THEN 'High'
        WHEN salary >= 60000 THEN 'Medium'
        ELSE 'Low'
    END as salary_grade
FROM employees;
```

### Conditional Aggregation

**Example:**
```sql
SELECT department_id,
    COUNT(*) as total_employees,
    SUM(CASE WHEN salary > 70000 THEN 1 ELSE 0 END) as high_earners,
    SUM(CASE WHEN salary > 70000 THEN salary ELSE 0 END) as high_earner_payroll
FROM employees
GROUP BY department_id;
```

## 9. Classic Interview Problems

### Second Highest Salary

**Problem:** Find the second highest salary.

**Solutions:**
```sql
-- Method 1: Using LIMIT with subquery
SELECT MAX(salary) as second_highest
FROM employees
WHERE salary < (SELECT MAX(salary) FROM employees);

-- Method 2: Using window functions
SELECT DISTINCT salary
FROM (
    SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) as rank
    FROM employees
) ranked
WHERE rank = 2;

-- Method 3: Using LIMIT with OFFSET
SELECT DISTINCT salary
FROM employees
ORDER BY salary DESC
LIMIT 1 OFFSET 1;
```

### Employees Earning More Than Their Managers

**Problem:** Find employees who earn more than their managers.

**Solution:**
```sql
SELECT e.name as employee, e.salary as emp_salary,
       m.name as manager, m.salary as mgr_salary
FROM employees e
JOIN employees m ON e.manager_id = m.id
WHERE e.salary > m.salary;
```

### Duplicate Records

**Problem:** Find and remove duplicate records.

**Solutions:**
```sql
-- Find duplicates
SELECT email, COUNT(*)
FROM employees
GROUP BY email
HAVING COUNT(*) > 1;

-- Remove duplicates (keep lowest ID)
DELETE e1 FROM employees e1
JOIN employees e2 
WHERE e1.email = e2.email AND e1.id > e2.id;

-- Or using window functions
WITH duplicates AS (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY email ORDER BY id) as row_num
    FROM employees
)
DELETE FROM employees
WHERE id IN (SELECT id FROM duplicates WHERE row_num > 1);
```

### Consecutive Days Analysis

**Problem:** Find users who logged in for 3 consecutive days.

**Solution:**
```sql
WITH login_with_groups AS (
    SELECT user_id, login_date,
           ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY login_date) as rn,
           DATE_SUB(login_date, INTERVAL ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY login_date) DAY) as group_date
    FROM user_logins
),
consecutive_groups AS (
    SELECT user_id, group_date, COUNT(*) as consecutive_days
    FROM login_with_groups
    GROUP BY user_id, group_date
    HAVING COUNT(*) >= 3
)
SELECT DISTINCT user_id
FROM consecutive_groups;
```

This comprehensive guide covers all the essential SQL concepts with practical examples you'll encounter in interviews!






import bonsai
import bonsai.errors
import csv

AD_SERVER = "ldap://your.domain.controller"  # e.g. ldap://dc1.corp.local
AD_USER = "your-username@domain.com"         # use UPN format
AD_PASSWORD = "your-password"
BASE_DN = "DC=domain,DC=com"                 # adjust for your AD

SEARCH_FILTER = "(&(objectClass=user)(company=aakb))"

def get_users():
    client = bonsai.LDAPClient(AD_SERVER)
    client.set_credentials("SIMPLE", user=AD_USER, password=AD_PASSWORD)

    with client.connect() as conn:
        users = []

        res = conn.paged_search(
            BASE_DN,
            bonsai.LDAPSearchScope.SUBTREE,
            SEARCH_FILTER,
            attrlist=["displayName", "mail", "sAMAccountName"],
            page_size=1000
        )

        for entry in res:
            users.append(entry)
        return users

def split_display_name(display_name):
    """Split displayName into FirstName and LastName (basic approach)."""
    if not display_name:
        return "", ""
    parts = display_name.split()
    if len(parts) == 1:
        return parts[0], ""       # only one name available
    return parts[0], " ".join(parts[1:])  # first word = first name, rest = last name

def write_to_csv(users, filename="aakb_users.csv"):
    with open(filename, mode="w", newline="", encoding="utf-8") as csvfile:
        fieldnames = ["FirstName", "LastName", "sAMAccountName", "mail", "DisplayName"]
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()

        for user in users:
            display_name = user.get("displayName", [""])[0] if "displayName" in user else ""
            first, last = split_display_name(display_name)

            writer.writerow({
                "FirstName": first,
                "LastName": last,
                "sAMAccountName": user.get("sAMAccountName", [""])[0] if "sAMAccountName" in user else "",
                "mail": user.get("mail", [""])[0] if "mail" in user else "",
                "DisplayName": display_name
            })

if __name__ == "__main__":
    all_users = get_users()
    print(f"Retrieved {len(all_users)} users.")
    write_to_csv(all_users, "aakb_users.csv")
    print("Users exported to aakb_users.csv")
