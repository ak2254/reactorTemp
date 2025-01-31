from prefect import flow, task

@task
def add_business_unit(work_orders: list[dict], mapping: list[dict]) -> list[dict]:
    """
    Adds a 'business_unit' column to the work order dataset by matching 'location' from the mapping dataset.
    
    Args:
        work_orders (list[dict]): List of work order dictionaries.
        mapping (list[dict]): List of mapping dictionaries with 'location' and 'business_unit'.
    
    Returns:
        list[dict]: Updated work order dataset with the 'business_unit' column.
    """
    # Create a dictionary for quick lookup from mapping (location -> business_unit)
    location_to_bu = {entry["location"]: entry["business_unit"] for entry in mapping}

    # Add business_unit to each work order based on the location
    for wo in work_orders:
        wo["business_unit"] = location_to_bu.get(wo["location"], "Unknown")  # Default to 'Unknown' if no match

    return work_orders

@task
def process_data(data: list[dict]) -> None:
    """Prints the first few records for verification."""
    print(f"Processed {len(data)} work orders.")
    if data:
        print(f"First record: {data[0]}")

@flow
def work_order_processing_flow(work_orders: list[dict], mapping: list[dict]):
    """
    Prefect flow to add business unit information to work orders.
    
    Args:
        work_orders (list[dict]): Work order dataset.
        mapping (list[dict]): Mapping dataset.
    """
    updated_work_orders = add_business_unit(work_orders, mapping)
    process_data(updated_work_orders)

if __name__ == "__main__":
    # Example Work Order Dataset
    work_orders = [
        {"work_order": "WO123", "location": "LocA", "description": "Repair Pump"},
        {"work_order": "WO124", "location": "LocB", "description": "Replace Valve"},
        {"work_order": "WO125", "location": "LocC", "description": "Inspect Motor"}
    ]

    # Example Mapping Dataset
    mapping = [
        {"location": "LocA", "business_unit": "BU1"},
        {"location": "LocB", "business_unit": "BU2"}
        # Note: LocC is missing, so it should default to "Unknown"
    ]

    # Run the flow
    work_order_processing_flow(work_orders, ma
