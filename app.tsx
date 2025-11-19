"""
Prefect Pipeline for Work Order Data Processing
Prepares data for Power BI Dashboard with quarterly metrics
No pandas/dataframes - using pure Python data structures
"""

from prefect import flow, task
from datetime import datetime, timedelta
from typing import List, Dict, Any
import json
import csv
from collections import defaultdict

# Sample work order data structure
SAMPLE_DATA = [
    {
        "Status": "Completed",
        "Work order number": "WO-2024-001",
        "WO description": "Repair HVAC system",
        "reported by": "John Doe",
        "reported date": "2024-01-15",
        "asset": "HVAC-001",
        "asset description": "Main Building HVAC",
        "work group": "Maintenance",
        "owner": "Jane Smith",
        "worktype": "Corrective",
        "site": "Building A",
        "Actual finished date": "2024-01-20"
    },
    {
        "Status": "Open",
        "Work order number": "WO-2024-002",
        "WO description": "Electrical inspection",
        "reported by": "Mike Johnson",
        "reported date": "2024-07-10",
        "asset": "ELEC-002",
        "asset description": "Electrical Panel 2",
        "work group": "Electrical",
        "owner": "Bob Wilson",
        "worktype": "Preventive",
        "site": "Building B",
        "Actual finished date": None
    },
    {
        "Status": "Open",
        "Work order number": "WO-2023-050",
        "WO description": "Replace lighting fixtures",
        "reported by": "Sarah Lee",
        "reported date": "2023-05-01",
        "asset": "LIGHT-005",
        "asset description": "Warehouse Lighting",
        "work group": "Electrical",
        "owner": "Tom Wilson",
        "worktype": "Corrective",
        "site": "Building C",
        "Actual finished date": None
    }
]


def parse_date(date_str: str) -> datetime:
    """Parse date string to datetime object"""
    if not date_str or date_str == "None":
        return None
    return datetime.strptime(date_str, "%Y-%m-%d")


def get_quarter(date: datetime) -> int:
    """Get quarter from datetime"""
    return (date.month - 1) // 3 + 1


def calculate_days_open(reported_date: datetime, finished_date: datetime = None) -> int:
    """Calculate days between reported and finished (or today)"""
    end_date = finished_date if finished_date else datetime.now()
    return (end_date - reported_date).days


@task(name="Load Work Order Data")
def load_work_orders(data: List[Dict]) -> List[Dict]:
    """Load work order data from list of dicts"""
    print(f"Loaded {len(data)} work orders")
    return data


@task(name="Transform Work Orders")
def transform_work_orders(work_orders: List[Dict]) -> List[Dict]:
    """Transform work orders with calculated fields"""
    transformed_orders = []
    
    for wo in work_orders:
        # Parse dates
        reported_date = parse_date(wo["reported date"])
        finished_date = parse_date(wo.get("Actual finished date"))
        
        # Calculate derived fields
        year = reported_date.year
        quarter = get_quarter(reported_date)
        # 🆕 NEW: Extract month for monthly metrics
        month = reported_date.month
        year_quarter = f"{year}-Q{quarter}"
        # 🆕 NEW: Format year-month (e.g., 2024-01, 2024-02)
        year_month = f"{year}-{month:02d}"
        days_open = calculate_days_open(reported_date, finished_date)
        is_late = wo["Status"] == "Open" and days_open > 100
        is_completed = wo["Status"] == "Completed"
        
        # Create transformed record
        transformed_wo = {
            **wo,  # Include all original fields
            "Year": year,
            "Quarter": quarter,
            "Month": month,  # 🆕 NEW: Month number (1-12)
            "Year_Quarter": year_quarter,
            "Year_Month": year_month,  # 🆕 NEW: Year-Month string for grouping
            "Days_Open": days_open,
            "Is_Late": is_late,
            "Is_Completed": is_completed
        }
        
        transformed_orders.append(transformed_wo)
    
    print(f"Transformed {len(transformed_orders)} work orders")
    return transformed_orders


@task(name="Calculate Quarterly Metrics")
def calculate_quarterly_metrics(work_orders: List[Dict]) -> List[Dict]:
    """Aggregate work orders by year-quarter"""
    
    # Group by year-quarter
    quarterly_groups = defaultdict(list)
    for wo in work_orders:
        key = wo["Year_Quarter"]
        quarterly_groups[key].append(wo)
    
    # Calculate metrics for each quarter
    quarterly_metrics = []
    for year_quarter, orders in quarterly_groups.items():
        # Split year and quarter
        year, quarter = year_quarter.split("-Q")
        
        # Calculate aggregations
        total_wos = len(orders)
        late_wos = sum(1 for wo in orders if wo["Is_Late"])
        completed_wos = sum(1 for wo in orders if wo["Is_Completed"])
        open_wos = sum(1 for wo in orders if wo["Status"] == "Open")
        avg_days_open = sum(wo["Days_Open"] for wo in orders) / total_wos if total_wos > 0 else 0
        
        # Calculate percentages
        completion_rate = (completed_wos / total_wos * 100) if total_wos > 0 else 0
        late_wo_percentage = (late_wos / total_wos * 100) if total_wos > 0 else 0
        
        quarterly_metrics.append({
            "Year": int(year),
            "Quarter": int(quarter),
            "Year_Quarter": year_quarter,
            "Total_WOs": total_wos,
            "Total_Reported_WOs": total_wos,
            "Late_WOs": late_wos,
            "Completed_WOs": completed_wos,
            "Open_WOs": open_wos,
            "Avg_Days_Open": round(avg_days_open, 2),
            "Completion_Rate": round(completion_rate, 2),
            "Late_WO_Percentage": round(late_wo_percentage, 2)
        })
    
    # Sort by year and quarter
    quarterly_metrics.sort(key=lambda x: (x["Year"], x["Quarter"]))
    
    print(f"Calculated metrics for {len(quarterly_metrics)} quarters")
    return quarterly_metrics


@task(name="Calculate Monthly Metrics")
def calculate_monthly_metrics(work_orders: List[Dict]) -> List[Dict]:
    """Aggregate work orders by year-month"""
    
    # Group by year-month
    monthly_groups = defaultdict(list)
    for wo in work_orders:
        key = wo["Year_Month"]
        monthly_groups[key].append(wo)
    
    # Calculate metrics for each month
    monthly_metrics = []
    for year_month, orders in monthly_groups.items():
        # Split year and month
        year, month = year_month.split("-")
        
        # Calculate aggregations
        total_wos = len(orders)
        late_wos = sum(1 for wo in orders if wo["Is_Late"])
        completed_wos = sum(1 for wo in orders if wo["Is_Completed"])
        open_wos = sum(1 for wo in orders if wo["Status"] == "Open")
        avg_days_open = sum(wo["Days_Open"] for wo in orders) / total_wos if total_wos > 0 else 0
        
        # Calculate percentages
        completion_rate = (completed_wos / total_wos * 100) if total_wos > 0 else 0
        late_wo_percentage = (late_wos / total_wos * 100) if total_wos > 0 else 0
        
        monthly_metrics.append({
            "Year": int(year),
            "Month": int(month),
            "Year_Month": year_month,
            "Total_WOs": total_wos,
            "Total_Reported_WOs": total_wos,
            "Late_WOs": late_wos,
            "Completed_WOs": completed_wos,
            "Open_WOs": open_wos,
            "Avg_Days_Open": round(avg_days_open, 2),
            "Completion_Rate": round(completion_rate, 2),
            "Late_WO_Percentage": round(late_wo_percentage, 2)
        })
    
    # Sort by year and month
    monthly_metrics.sort(key=lambda x: (x["Year"], x["Month"]))
    
    print(f"Calculated metrics for {len(monthly_metrics)} months")
    return monthly_metrics




# 🆕 NEW FUNCTION: Calculate Monthly Metrics
@task(name="Calculate Monthly Metrics")
def calculate_monthly_metrics(work_orders: List[Dict]) -> List[Dict]:
    """Aggregate work orders by year-month"""
    
    # Group by year-month
    monthly_groups = defaultdict(list)
    for wo in work_orders:
        key = wo["Year_Month"]
        monthly_groups[key].append(wo)
    
    # Calculate metrics for each month
    monthly_metrics = []
    for year_month, orders in monthly_groups.items():
        # Split year and month
        year, month = year_month.split("-")
        
        # Calculate aggregations
        total_wos = len(orders)
        late_wos = sum(1 for wo in orders if wo["Is_Late"])
        completed_wos = sum(1 for wo in orders if wo["Is_Completed"])
        open_wos = sum(1 for wo in orders if wo["Status"] == "Open")
        avg_days_open = sum(wo["Days_Open"] for wo in orders) / total_wos if total_wos > 0 else 0
        
        # Calculate percentages
        completion_rate = (completed_wos / total_wos * 100) if total_wos > 0 else 0
        late_wo_percentage = (late_wos / total_wos * 100) if total_wos > 0 else 0
        
        monthly_metrics.append({
            "Year": int(year),
            "Month": int(month),
            "Year_Month": year_month,
            "Total_WOs": total_wos,
            "Total_Reported_WOs": total_wos,
            "Late_WOs": late_wos,
            "Completed_WOs": completed_wos,
            "Open_WOs": open_wos,
            "Avg_Days_Open": round(avg_days_open, 2),
            "Completion_Rate": round(completion_rate, 2),
            "Late_WO_Percentage": round(late_wo_percentage, 2)
        })
    
    # Sort by year and month
    monthly_metrics.sort(key=lambda x: (x["Year"], x["Month"]))
    
    print(f"Calculated metrics for {len(monthly_metrics)} months")
    return monthly_metrics


def calculate_worktype_metrics(work_orders: List[Dict]) -> List[Dict]:
    """Aggregate work orders by work type and quarter"""
    
    # Group by year-quarter and worktype
    worktype_groups = defaultdict(list)
    for wo in work_orders:
        key = (wo["Year_Quarter"], wo["worktype"])
        worktype_groups[key].append(wo)
    
    # Calculate metrics for each group
    worktype_metrics = []
    for (year_quarter, worktype), orders in worktype_groups.items():
        total_wos = len(orders)
        completed_wos = sum(1 for wo in orders if wo["Is_Completed"])
        late_wos = sum(1 for wo in orders if wo["Is_Late"])
        open_wos = sum(1 for wo in orders if wo["Status"] == "Open")
        avg_days_open = sum(wo["Days_Open"] for wo in orders) / total_wos if total_wos > 0 else 0
        
        worktype_metrics.append({
            "Year_Quarter": year_quarter,
            "worktype": worktype,
            "Total_WOs": total_wos,
            "Completed_WOs": completed_wos,
            "Open_WOs": open_wos,
            "Late_WOs": late_wos,
            "Avg_Days_Open": round(avg_days_open, 2)
        })
    
    # Sort by year_quarter, then worktype
    worktype_metrics.sort(key=lambda x: (x["Year_Quarter"], x["worktype"]))
    
    print(f"Calculated work type metrics: {len(worktype_metrics)} records")
    return worktype_metrics


@task(name="Calculate Work Group Metrics")
def calculate_workgroup_metrics(work_orders: List[Dict]) -> List[Dict]:
    """Aggregate work orders by work group"""
    
    # Group by year-quarter and work group
    workgroup_groups = defaultdict(list)
    for wo in work_orders:
        key = (wo["Year_Quarter"], wo["work group"])
        workgroup_groups[key].append(wo)
    
    # Calculate metrics for each group
    workgroup_metrics = []
    for (year_quarter, work_group), orders in workgroup_groups.items():
        total_wos = len(orders)
        completed_wos = sum(1 for wo in orders if wo["Is_Completed"])
        open_wos = sum(1 for wo in orders if wo["Status"] == "Open")
        late_wos = sum(1 for wo in orders if wo["Is_Late"])
        
        workgroup_metrics.append({
            "Year_Quarter": year_quarter,
            "work_group": work_group,
            "Total_WOs": total_wos,
            "Completed_WOs": completed_wos,
            "Open_WOs": open_wos,
            "Late_WOs": late_wos
        })
    
    # Sort by year_quarter, then work_group
    workgroup_metrics.sort(key=lambda x: (x["Year_Quarter"], x["work_group"]))
    
    print(f"Calculated work group metrics: {len(workgroup_metrics)} records")
    return workgroup_metrics


@task(name="Export to CSV")
def export_to_csv(data: List[Dict], filename: str) -> str:
    """Export list of dicts to CSV for Power BI import"""
    if not data:
        print(f"No data to export for {filename}")
        return filename
    
    # Get all unique keys from all dictionaries
    fieldnames = list(data[0].keys())
    
    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(data)
    
    print(f"Exported {filename} with {len(data)} records")
    return filename


@task(name="Print Summary")
def print_summary(quarterly_metrics: List[Dict]):
    """Print a summary of quarterly metrics"""
    print("\n" + "=" * 80)
    print("QUARTERLY METRICS SUMMARY")
    print("=" * 80)
    print(f"{'Quarter':<12} {'Total':<8} {'Completed':<12} {'Late':<8} {'Comp %':<10}")
    print("-" * 80)
    
    for metric in quarterly_metrics:
        print(f"{metric['Year_Quarter']:<12} "
              f"{metric['Total_WOs']:<8} "
              f"{metric['Completed_WOs']:<12} "
              f"{metric['Late_WOs']:<8} "
              f"{metric['Completion_Rate']:<10.1f}%")
    
    print("=" * 80)


@flow(name="Work Order ETL Pipeline")
def work_order_etl_pipeline(work_orders: List[Dict]):
    """
    Main ETL pipeline for work order data
    Processes raw work order data and generates multiple datasets for Power BI
    """
    
    # Load data
    raw_data = load_work_orders(work_orders)
    
    # Transform work orders
    transformed_data = transform_work_orders(raw_data)
    
    # Calculate various metrics
    quarterly_metrics = calculate_quarterly_metrics(transformed_data)
    monthly_metrics = calculate_monthly_metrics(transformed_data)
    worktype_metrics = calculate_worktype_metrics(transformed_data)
    workgroup_metrics = calculate_workgroup_metrics(transformed_data)
    
    # Export all datasets
    detail_file = export_to_csv(transformed_data, "work_orders_detail.csv")
    quarterly_file = export_to_csv(quarterly_metrics, "work_orders_quarterly.csv")
    monthly_file = export_to_csv(monthly_metrics, "work_orders_monthly.csv")
    worktype_file = export_to_csv(worktype_metrics, "work_orders_by_worktype.csv")
    workgroup_file = export_to_csv(workgroup_metrics, "work_orders_by_workgroup.csv")
    
    # Print summary
    print_summary(quarterly_metrics)
    
    print("\n=== Pipeline Completed Successfully ===")
    print(f"Generated files:")
    print(f"  - {detail_file}")
    print(f"  - {quarterly_file}")
    print(f"  - {monthly_file}")
    print(f"  - {worktype_file}")
    print(f"  - {workgroup_file}")
    
    return {
        "detail": transformed_data,
        "quarterly": quarterly_metrics,
        "monthly": monthly_metrics,
        "worktype": worktype_metrics,
        "workgroup": workgroup_metrics
    }


# Example usage
if __name__ == "__main__":
    # Run the pipeline with sample data
    result = work_order_etl_pipeline(SAMPLE_DATA)
    
    # Optionally save results to JSON for inspection
    with open("pipeline_results.json", "w") as f:
        # Convert boolean values to strings for JSON compatibility
        json_result = {
            key: [{k: str(v) if isinstance(v, bool) else v for k, v in item.items()} 
                  for item in value]
            for key, value in result.items()
        }
        json.dump(json_result, f, indent=2, default=str)
    print("\nResults also saved to pipeline_results.json")
